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
 * Menangani dokumen 1 halaman maupun dokumen multi-halaman (multi-page A4) secara otomatis dan rapi.
 * TIDAK PERNAH memanggil window.print() sehingga tidak memicu dialog print sistem browser HP/desktop.
 */
export async function downloadElementAsPdf({
  element,
  fileName,
  pdfTitle,
  footerText,
  margin = 12
}: DownloadPdfOptions): Promise<void> {
  const restoreComputedStyle = patchGetComputedStyle(window);

  try {
    // 1. Tangkap elemen dengan resolusi tajam (scale: 2) & proteksi warna sRGB
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        sanitizeDocumentForCanvas(clonedDoc);
        // Pastikan cloned element memiliki background putih bersih dan lebar yang stabil
        const clonedTarget = clonedDoc.getElementById(element.id) || clonedDoc.querySelector(`[data-pdf-target="${element.getAttribute('data-pdf-target')}"]`);
        if (clonedTarget && clonedTarget instanceof HTMLElement) {
          clonedTarget.style.backgroundColor = '#ffffff';
          clonedTarget.style.maxWidth = '100%';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
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

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    // Hitung tinggi gambar proporsional di dalam area cetak PDF
    const totalImgHeight = (canvas.height * printableWidth) / canvas.width;

    const defaultFooter = footerText || `Dokumen resmi SPMB SMPIT Pondok Duta. Diterbitkan digital & sah terverifikasi pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`;

    if (totalImgHeight <= printableHeight) {
      // 1 HALAMAN PAS (seperti Kartu Peserta & SKL)
      pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, totalImgHeight);

      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(defaultFooter, margin, Math.min(pageHeight - 6, margin + totalImgHeight + 5));
    } else {
      // DOKUMEN MULTI-HALAMAN (seperti Hasil Wawancara OTM & Buku Induk Murid)
      let heightLeft = totalImgHeight;
      let position = margin;
      let pageNum = 1;

      // Halaman Pertama
      pdf.addImage(imgData, 'PNG', margin, position, printableWidth, totalImgHeight);
      
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${defaultFooter} (Halaman ${pageNum})`, margin, pageHeight - 6);

      heightLeft -= printableHeight;

      // Halaman Berikutnya
      while (heightLeft > 0) {
        position = position - printableHeight;
        pdf.addPage();
        pageNum += 1;

        pdf.addImage(imgData, 'PNG', margin, position, printableWidth, totalImgHeight);
        
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${defaultFooter} (Halaman ${pageNum})`, margin, pageHeight - 6);

        heightLeft -= printableHeight;
      }
    }

    // Pastikan nama file berakhiran .pdf
    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
  } finally {
    restoreComputedStyle();
  }
}
