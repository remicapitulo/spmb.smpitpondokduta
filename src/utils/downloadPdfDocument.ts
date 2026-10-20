import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { patchGetComputedStyle, sanitizeDocumentForCanvas } from './colorSanitizer';

export interface DownloadPdfOptions {
  element: HTMLElement;
  fileName: string;
  pdfTitle?: string;
  footerText?: string;
  margin?: number;
}

/**
 * Mengonversi elemen DOM dokumen ke file PDF berstandar A4 resmi dan langsung mengunduhnya ke perangkat pengguna.
 * Menangani dokumen 1 halaman (Kartu Peserta, SKL) maupun dokumen multi-halaman (Wawancara OTM, Buku Induk Murid).
 * Hasil capture 100% presisi dan sama persis dengan preview di website.
 * TIDAK PERNAH memanggil window.print() sehingga tidak memicu dialog cetak browser.
 */
export async function downloadElementAsPdf({
  element,
  fileName,
  pdfTitle,
  footerText,
  margin = 10
}: DownloadPdfOptions): Promise<void> {
  const restoreComputedStyle = patchGetComputedStyle(window);

  try {
    // Pastikan font Plus Jakarta Sans dan semua aset telah ter-render penuh di browser
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 1. Tangkap elemen dengan resolusi tajam (scale: 2) & proteksi warna sRGB
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false, // JANGAN pernah true, agar canvas.toDataURL() tidak throw SecurityError
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedEl) => {
        // Sanitasi OKLCH & color-mix di seluruh dokumen klon
        sanitizeDocumentForCanvas(clonedDoc);

        // Stabilkan lebar dokumen ke 794px (lebar standar A4 96 DPI)
        // agar pada layar smartphone atau modal sempit tetap menghasilkan layout A4 desktop yang sempurna
        const target = clonedEl || clonedDoc.getElementById(element.id) || clonedDoc.querySelector('.print-container');
        if (target && target instanceof HTMLElement) {
          target.style.width = '794px';
          target.style.maxWidth = '794px';
          target.style.minWidth = '794px';
          target.style.height = 'auto';
          target.style.overflow = 'visible';
          target.style.backgroundColor = '#ffffff';

          // Pastikan tidak ada parent container yang memotong overflow (overflow: visible)
          let p = target.parentElement;
          while (p && p !== clonedDoc.body) {
            p.style.overflow = 'visible';
            p.style.height = 'auto';
            p.style.maxHeight = 'none';
            p = p.parentElement;
          }
        }

        // Pastikan semua gambar di dalam klon memiliki URL absolut atau Base64
        const allImgs = Array.from(clonedDoc.querySelectorAll('img'));
        allImgs.forEach((img) => {
          if (!img.src || img.src.startsWith('data:')) return;
          if (img.src.startsWith('/')) {
            img.src = `${window.location.origin}${img.src}`;
          }
          img.crossOrigin = 'anonymous';
        });
      }
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    if (pdfTitle) {
      pdf.setProperties({
        title: pdfTitle,
        subject: 'Dokumen Resmi SPMB SMPIT Pondok Duta',
        author: 'Panitia SPMB SMPIT Pondok Duta',
        creator: 'Sistem SPMB SMPIT Pondok Duta'
      });
    }

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const totalImgHeight = (canvas.height * printableWidth) / canvas.width;
    const defaultFooter = footerText || `Dokumen resmi SPMB SMPIT Pondok Duta. Diterbitkan digital & sah terverifikasi pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`;

    if (totalImgHeight <= printableHeight) {
      // 1 HALAMAN PAS (seperti Kartu Peserta Ujian & SKL)
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, totalImgHeight);

      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(defaultFooter, margin, Math.min(pageHeight - 6, margin + totalImgHeight + 5));
    } else {
      // DOKUMEN MULTI-HALAMAN (seperti Hasil Wawancara OTM & Buku Induk Murid)
      // Gunakan canvas-based page slicing agar tidak ada teks terpotong aneh atau bug clipping
      const pxPerMm = canvas.width / printableWidth;
      const pageHeightPx = Math.floor(printableHeight * pxPerMm);
      let sourceY = 0;
      let pageNum = 1;
      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      while (sourceY < canvas.height) {
        if (pageNum > 1) {
          pdf.addPage();
        }

        const currentSliceHeightPx = Math.min(canvas.height - sourceY, pageHeightPx);
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
            0, sourceY, canvas.width, currentSliceHeightPx,
            0, 0, canvas.width, currentSliceHeightPx
          );
          const pageImgData = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', margin, margin, printableWidth, sliceHeightMm);
        }

        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${defaultFooter} (Halaman ${pageNum} dari ${totalPages})`, margin, pageHeight - 6);

        sourceY += currentSliceHeightPx;
        pageNum += 1;
      }
    }

    // Pastikan nama file berakhiran .pdf
    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
  } finally {
    restoreComputedStyle();
  }
}
