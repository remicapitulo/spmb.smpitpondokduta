import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { patchGetComputedStyle, sanitizeDocumentForCanvas } from './colorSanitizer';
import { LOGO_PONDOK_DUTA_BASE64 } from '../assets/logoBase64';

export interface DownloadPdfOptions {
  element: HTMLElement;
  fileName: string;
  pdfTitle?: string;
  footerText?: string;
  margin?: number;
  format?: 'a4' | 'f4' | [number, number];
}

/**
 * Mengonversi elemen DOM dokumen ke file PDF resmi berstandar F4 (Folio 215 x 330 mm) / A4 dan langsung mengunduhnya.
 * Standar F4 memberikan keleluasaan vertikal (tinggi 330mm vs 297mm A4) sehingga tata letak tidak terkompresi.
 */
async function buildPdfAndCanvasFromElement({
  element,
  fileName,
  pdfTitle,
  footerText,
  margin = 10,
  format = 'f4',
  scale = 3,
  jpegQuality = 0.96
}: DownloadPdfOptions & { scale?: number; jpegQuality?: number }): Promise<{ pdf: jsPDF; primaryCanvas: HTMLCanvasElement; cleanFileName: string }> {
  // 1. Pastikan aturan CSS perbaikan FontMetrics html2canvas terpasang di window.document utama
  // karena html2canvas membuat instance `new FontMetrics(document)` di document utama (bukan clonedDoc)
  let mainDocFontFixStyle: HTMLStyleElement | null = null;
  if (typeof document !== 'undefined' && document.head) {
    mainDocFontFixStyle = document.createElement('style');
    mainDocFontFixStyle.setAttribute('data-h2c-fontmetrics-fix', 'true');
    mainDocFontFixStyle.textContent = `
      body > div[style*="visibility: hidden"] > img,
      img[width="1"][height="1"] {
        display: inline !important;
        vertical-align: baseline !important;
        max-width: none !important;
        width: 1px !important;
        height: 1px !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(mainDocFontFixStyle);
  }

  // 2. Tunggu font Plus Jakarta Sans selesai di-load
  if (document.fonts) {
    try {
      await Promise.allSettled([
        document.fonts.load('12px "Plus Jakarta Sans"'),
        document.fonts.load('bold 14px "Plus Jakarta Sans"'),
        document.fonts.ready
      ]);
    } catch {
      // Lanjut tanpa jeda
    }
  }

  // Default kertas F4 (Folio) 215mm x 330mm sesuai standar persuratan & administrasi sekolah
  const pageFormat = format === 'a4' ? 'a4' : (Array.isArray(format) ? format : [215, 330]);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageFormat
  });

  if (pdfTitle) {
    pdf.setProperties({
      title: pdfTitle,
      subject: 'Dokumen Resmi SPMB SMPIT Pondok Duta',
      author: 'Panitia SPMB SMPIT Pondok Duta',
      creator: 'Sistem SPMB SMPIT Pondok Duta'
    });
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;
  // Sisihkan ruang 8mm di bagian bawah halaman agar isi dokumen tidak menabrak footnote
  const printableHeight = pageHeight - margin * 2 - 8;
  const defaultFooter = footerText || `Dokumen resmi SPMB SMPIT Pondok Duta. Diterbitkan digital & sah terverifikasi pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`;

  // Cek apakah elemen memiliki halaman terstruktur eksplisit (.a4-page-slice)
  const structuredPages = Array.from(element.querySelectorAll<HTMLElement>('.a4-page-slice'));
  let primaryCanvas: HTMLCanvasElement | null = null;

  if (structuredPages.length > 0) {
    // DOKUMEN TERSTRUKTUR MULTI-HALAMAN (SKL Halaman 1 & Halaman 2, Buku Induk, dll.)
    for (let pIdx = 0; pIdx < structuredPages.length; pIdx++) {
      const pageEl = structuredPages[pIdx];
      if (pIdx > 0) {
        pdf.addPage();
      }

      const pageCanvas = await html2canvas(pageEl, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 6000,
        windowWidth: 1024,
        scrollX: 0,
        scrollY: 0,
        onclone: async (clonedDoc, clonedTarget) => {
          await prepareClonedDocument(clonedDoc, clonedTarget);
        }
      });

      if (!primaryCanvas) {
        primaryCanvas = pageCanvas;
      }

      const imgData = pageCanvas.toDataURL('image/jpeg', jpegQuality);
      const naturalImgH = (pageCanvas.height * printableWidth) / pageCanvas.width;

      // Jaga rasio aspek proporsional (preserve aspect ratio) agar teks dan tabel TIDAK TERGEPENGKAN
      let renderW = printableWidth;
      let renderH = naturalImgH;
      let offsetX = margin;
      const offsetY = margin;

      if (renderH > printableHeight) {
        const ratio = printableHeight / renderH;
        renderH = printableHeight;
        renderW = printableWidth * ratio;
        offsetX = margin + (printableWidth - renderW) / 2;
      }

      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH);

      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${defaultFooter} (Halaman ${pIdx + 1} dari ${structuredPages.length})`, margin, pageHeight - 5.5);
    }
  } else {
    // DOKUMEN STANDARD / FLOW (Kartu Peserta atau Dokumen Wawancara / Observasi)
    // Catat posisi rasio vertikal setiap baris tabel (tr) dan blok tanda tangan (.pdf-signature-block / [data-pdf-keep-together="true"])
    // agar pemotongan halaman tidak pernah membelah tanda tangan atau baris tabel di tengah-tengah!
    const keepTogetherRatios: Array<{ topRatio: number; bottomRatio: number; isSignature: boolean }> = [];

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 6000,
      windowWidth: 1024,
      scrollX: 0,
      scrollY: 0,
      onclone: async (clonedDoc, clonedEl) => {
        await prepareClonedDocument(clonedDoc, clonedEl, element.id);
        const target = (clonedEl || (element.id ? clonedDoc.getElementById(element.id) : null) || clonedDoc.querySelector('.print-container')) as HTMLElement | null;
        if (target) {
          const rootRect = target.getBoundingClientRect();
          if (rootRect.height > 0) {
            const blocks = Array.from(
              target.querySelectorAll<HTMLElement>('tr, [data-pdf-keep-together="true"], .pdf-signature-block')
            );
            for (const blk of blocks) {
              const r = blk.getBoundingClientRect();
              if (r.height > 4 && r.bottom > rootRect.top && r.top < rootRect.bottom) {
                keepTogetherRatios.push({
                  topRatio: Math.max(0, (r.top - rootRect.top) / rootRect.height),
                  bottomRatio: Math.min(1, (r.bottom - rootRect.top) / rootRect.height),
                  isSignature: blk.classList.contains('pdf-signature-block') || blk.getAttribute('data-pdf-keep-together') === 'true'
                });
              }
            }
          }
        }
      }
    });

    primaryCanvas = canvas;
    const totalImgHeight = (canvas.height * printableWidth) / canvas.width;

    if (totalImgHeight <= printableHeight) {
      // 1 HALAMAN PAS
      const imgData = canvas.toDataURL('image/jpeg', jpegQuality);
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, totalImgHeight);

      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(defaultFooter, margin, Math.min(pageHeight - 5.5, margin + totalImgHeight + 5));
    } else {
      // DOKUMEN MULTI-HALAMAN CERDAS (ANTI-POTONG TANDA TANGAN & BARIS TABEL)
      const pxPerMm = canvas.width / printableWidth;
      const pageHeightPx = Math.floor(printableHeight * pxPerMm);
      const keepBoxes = keepTogetherRatios.map(item => ({
        topPx: Math.floor(item.topRatio * canvas.height),
        bottomPx: Math.ceil(item.bottomRatio * canvas.height),
        isSignature: item.isSignature
      }));

      const slices: Array<{ startY: number; endY: number }> = [];
      let sourceY = 0;
      const padPx = Math.round(4 * scale);

      while (sourceY < canvas.height - 4) {
        let targetEndY = sourceY + pageHeightPx;
        if (targetEndY >= canvas.height) {
          slices.push({ startY: sourceY, endY: canvas.height });
          break;
        }

        // Periksa apakah garis potong targetEndY membelah blok tanda tangan atau baris tabel
        const straddling = keepBoxes.filter(
          box =>
            box.topPx < targetEndY &&
            box.bottomPx > targetEndY &&
            box.topPx > sourceY + Math.floor(pageHeightPx * 0.15) &&
            (box.bottomPx - box.topPx) <= Math.floor(pageHeightPx * 0.85)
        );

        if (straddling.length > 0) {
          // Pindahkan titik potong ke tepat di atas blok (sehingga seluruh tanda tangan / baris tabel masuk utuh ke halaman berikutnya)
          const highestTopPx = Math.min(...straddling.map(b => b.topPx));
          targetEndY = Math.max(sourceY + Math.floor(pageHeightPx * 0.15), highestTopPx - padPx);
        }

        slices.push({ startY: sourceY, endY: targetEndY });
        sourceY = targetEndY;
      }

      const totalPages = slices.length || 1;
      for (let i = 0; i < slices.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const { startY, endY } = slices[i];
        const currentSliceHeightPx = endY - startY;
        if (currentSliceHeightPx <= 0) continue;
        const sliceHeightMm = currentSliceHeightPx / pxPerMm;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeightPx;
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0, startY, canvas.width, currentSliceHeightPx,
            0, 0, canvas.width, currentSliceHeightPx
          );
          const pageImgData = pageCanvas.toDataURL('image/jpeg', jpegQuality);
          pdf.addImage(pageImgData, 'JPEG', margin, margin, printableWidth, sliceHeightMm);
        }

        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${defaultFooter} (Halaman ${i + 1} dari ${totalPages})`, margin, pageHeight - 5.5);
      }
    }
  }

  if (mainDocFontFixStyle && mainDocFontFixStyle.parentNode) {
    mainDocFontFixStyle.parentNode.removeChild(mainDocFontFixStyle);
  }

  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  return {
    pdf,
    primaryCanvas: primaryCanvas || document.createElement('canvas'),
    cleanFileName
  };
}

/**
 * Menghasilkan representasi Base64 PDF dan gambar dokumen dari elemen DOM
 * agar file yang disimpan ke Google Drive 100% identik dengan file PDF hasil unduhan.
 */
export async function generateElementPdfBase64(
  options: DownloadPdfOptions
): Promise<{ pdfBase64: string; imgBase64: string; fileName: string }> {
  const restoreComputedStyle = patchGetComputedStyle(window);

  const parentScrolls: { el: HTMLElement; top: number; left: number }[] = [];
  let pScroll: HTMLElement | null = options.element.parentElement;
  while (pScroll) {
    if (pScroll.scrollTop > 0 || pScroll.scrollLeft > 0) {
      parentScrolls.push({ el: pScroll, top: pScroll.scrollTop, left: pScroll.scrollLeft });
      pScroll.scrollTop = 0;
      pScroll.scrollLeft = 0;
    }
    pScroll = pScroll.parentElement;
  }

  try {
    const { pdf, primaryCanvas, cleanFileName } = await buildPdfAndCanvasFromElement({
      ...options,
      scale: 2,
      jpegQuality: 0.85
    });
    const pdfDataUri = pdf.output('datauristring');
    const imgBase64 = primaryCanvas.width > 0 ? primaryCanvas.toDataURL('image/jpeg', 0.85) : '';
    return {
      pdfBase64: pdfDataUri,
      imgBase64,
      fileName: cleanFileName
    };
  } finally {
    for (const item of parentScrolls) {
      item.el.scrollTop = item.top;
      item.el.scrollLeft = item.left;
    }
    restoreComputedStyle();
  }
}

export async function downloadElementAsPdf(options: DownloadPdfOptions): Promise<void> {
  const restoreComputedStyle = patchGetComputedStyle(window);

  // Simpan posisi scroll parent agar dokumen tidak terpotong saat user membuka pratinjau dalam keadaan scroll
  const parentScrolls: { el: HTMLElement; top: number; left: number }[] = [];
  let pScroll: HTMLElement | null = options.element.parentElement;
  while (pScroll) {
    if (pScroll.scrollTop > 0 || pScroll.scrollLeft > 0) {
      parentScrolls.push({ el: pScroll, top: pScroll.scrollTop, left: pScroll.scrollLeft });
      pScroll.scrollTop = 0;
      pScroll.scrollLeft = 0;
    }
    pScroll = pScroll.parentElement;
  }

  try {
    const { pdf, cleanFileName } = await buildPdfAndCanvasFromElement({
      ...options,
      scale: 3
    });

    // Unduh langsung (dukung pemanggilan langsung jsPDF save dan Blob fallback tanpa target _blank)
    let downloaded = false;
    try {
      pdf.save(cleanFileName);
      downloaded = true;
    } catch (saveErr) {
      console.warn('pdf.save fallback to blob anchor:', saveErr);
    }

    if (!downloaded) {
      try {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (link.parentNode) link.parentNode.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      } catch (blobErr) {
        console.error('Download anchor failed:', blobErr);
        throw blobErr;
      }
    }
  } finally {
    // Kembalikan posisi scroll yang sempat di-reset
    for (const item of parentScrolls) {
      item.el.scrollTop = item.top;
      item.el.scrollLeft = item.left;
    }
    restoreComputedStyle();
  }
}

/**
 * Mempersiapkan dokumen klon html2canvas:
 * 1. Berbagi font yang sudah dimuat ke dokumen klon dan memastikan fonts.ready.
 * 2. Memperbaiki kalkulasi baseline font html2canvas (mengatasi bug Tailwind Preflight img { display: block }).
 * 3. Memaksa tabel desktop & elemen cetak tampil utuh (hidden sm:block -> block).
 * 4. Memaksa font seragam Plus Jakarta Sans pada SEMUA elemen (tanpa serif/Times New Roman).
 * 5. Mengganti semua gambar logo dengan Data URI Base64 (0% CORS taint / error).
 * 6. Membuka semua overflow modal dan menstabilkan lebar dokumen ke 794px F4/A4 standard.
 */
async function prepareClonedDocument(clonedDoc: Document, clonedEl?: HTMLElement | null, fallbackId?: string): Promise<void> {
  // 1. Berbagi FontFace yang sudah aktif di parent window ke dalam iframe klon
  if (typeof document !== 'undefined' && document.fonts && (clonedDoc as any).fonts) {
    try {
      document.fonts.forEach((font) => {
        (clonedDoc as any).fonts.add(font);
      });
    } catch {
      // fallback
    }
  }

  // Tunggu kesiapan font di clonedDoc jika didukung
  if ((clonedDoc as any).fonts?.ready) {
    try {
      await (clonedDoc as any).fonts.ready;
    } catch {
      // lanjut tanpa jeda
    }
  }

  const uniformStyle = clonedDoc.createElement('style');
  uniformStyle.textContent = `
    *, *::before, *::after, html, body, div, table, thead, tbody, tfoot, tr, td, th, h1, h2, h3, h4, h5, h6, p, span, strong, b, em, label, input, textarea {
      font-family: 'Plus Jakarta Sans', Arial, Helvetica, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    /* KRITIS: html2canvas menghitung baseline huruf menggunakan <span> + <img width="1" height="1">.
       Tailwind Preflight menyetel img { display: block } sehingga <img> turun ke baris baru dan
       membuat seluruh teks bergeser turun 5-7px keluar dari kotak/tabel! */
    img {
      display: inline-block !important;
    }
    body > div[style*="visibility: hidden"] > img,
    img[width="1"][height="1"] {
      display: inline !important;
      vertical-align: baseline !important;
      max-width: none !important;
      width: 1px !important;
      height: 1px !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    table, tr, td, th {
      font-family: 'Plus Jakarta Sans', Arial, Helvetica, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      vertical-align: middle;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    }
    .no-print {
      display: none !important;
    }
    .a4-page-slice, .a4-page-slice.hidden {
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      width: 794px !important;
      max-width: 794px !important;
      min-width: 794px !important;
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      box-sizing: border-box !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
      margin: 0 auto !important;
    }
    /* Sembunyikan ringkasan card mobile pada capture cetak resmi */
    .block.sm\\:hidden, div.block.sm\\:hidden {
      display: none !important;
    }
    /* Tampilkan tabel resmi desktop pada capture cetak */
    .hidden.sm\\:block, div.hidden.sm\\:block, .hidden.print\\:block {
      display: block !important;
    }
    table.hidden.sm\\:block {
      display: table !important;
    }
  `;
  (clonedDoc.head || clonedDoc.documentElement).appendChild(uniformStyle);

  // 2. Sanitasi warna CSS modern (OKLCH, OKLAB, color-mix)
  sanitizeDocumentForCanvas(clonedDoc);

  // 3. Stabilkan target dan parent-parentnya
  const target = (clonedEl || (fallbackId ? clonedDoc.getElementById(fallbackId) : null) || clonedDoc.querySelector('.print-container')) as HTMLElement;
  if (target) {
    let p: HTMLElement | null = target.parentElement;
    while (p && p !== clonedDoc.body) {
      p.style.overflow = 'visible';
      p.style.height = 'auto';
      p.style.maxHeight = 'none';
      p.style.position = 'static';
      p.style.transform = 'none';
      p.style.inset = 'auto';
      p.style.display = 'block';
      p = p.parentElement;
    }

    if (clonedDoc.body) {
      clonedDoc.body.style.overflow = 'visible';
      clonedDoc.body.style.height = 'auto';
      clonedDoc.body.style.backgroundColor = '#ffffff';
    }

    target.style.position = 'static';
    target.style.transform = 'none';
    target.style.width = '794px';
    target.style.maxWidth = '794px';
    target.style.minWidth = '794px';
    target.style.height = 'auto';
    target.style.maxHeight = 'none';
    target.style.overflow = 'visible';
    target.style.margin = '0 auto';
    target.style.backgroundColor = '#ffffff';
    target.style.boxShadow = 'none';
  }

  // 4. Pastikan semua gambar logo aman dan menggunakan Base64 resmi (0% CORS taint)
  const allImgs = Array.from(clonedDoc.querySelectorAll('img'));
  allImgs.forEach((img) => {
    if (!img.src) return;
    // Ganti logo lokal atau logo sekolah dengan Base64 resmi
    if (
      img.src.includes('logo-smpit-pondok-duta') ||
      img.alt?.toLowerCase().includes('logo') ||
      img.src.endsWith('.png') && img.src.includes('logo')
    ) {
      img.src = LOGO_PONDOK_DUTA_BASE64;
      return;
    }

    if (img.src.startsWith('data:')) return; // Data URI sudah 100% aman

    if (img.src.startsWith('/') || img.src.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
      return;
    }

    img.crossOrigin = 'anonymous';
  });
}
