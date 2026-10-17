import React, { useState, useEffect } from 'react';
import { gasService } from '../../services/gasService';
import { HasilObservasiOrtuData, WawancaraOrtuAnswerItem } from '../../types';
import { QUESTIONS_CONFIG, DAFTAR_PEWAWANCARA_LIST } from '../../services/questionsConfig';
import { StudentSearchCombobox } from '../../components/StudentSearchCombobox';
import { HasilWawancaraOrtuPrintView } from './HasilWawancaraOrtuPrintView';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  Database,
  PenTool,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface Props {
  onOpenGasConfig: () => void;
  onOpenPanduan?: () => void;
}

export const WawancaraOrtuPage: React.FC<Props> = ({ onOpenGasConfig, onOpenPanduan }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('PD-2026-001');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pewawancara selection from list
  const [namaPewawancaraOrtu, setNamaPewawancaraOrtu] = useState<string>(DAFTAR_PEWAWANCARA_LIST[0]);
  const [customPewawancara, setCustomPewawancara] = useState<string>('');
  const [isCustomPewawancara, setIsCustomPewawancara] = useState<boolean>(false);

  // Answers & Result
  const [ortuAnswers, setOrtuAnswers] = useState<{ [qIndex: number]: string }>({});
  const [savedOrtuResult, setSavedOrtuResult] = useState<HasilObservasiOrtuData | null>(null);
  const [reviewModalData, setReviewModalData] = useState<HasilObservasiOrtuData | null>(null);
  const [isPreSaveReview, setIsPreSaveReview] = useState<boolean>(false);

  useEffect(() => {
    loadStudentList();
  }, []);

  const loadStudentList = async (targetId?: string) => {
    setLoading(true);
    const list = await gasService.getStudentList();
    setStudents(list);

    const activeId = targetId || selectedStudentId || (list[0] ? list[0].id : 'PD-2026-001');
    setSelectedStudentId(activeId);

    // Check if student already has saved interview
    const existing = gasService.getHasilWawancaraOrtu(activeId);
    if (existing) {
      setSavedOrtuResult(existing);
      if (existing.namaPewawancara) {
        if (DAFTAR_PEWAWANCARA_LIST.includes(existing.namaPewawancara)) {
          setNamaPewawancaraOrtu(existing.namaPewawancara);
          setIsCustomPewawancara(false);
        } else {
          setIsCustomPewawancara(true);
          setCustomPewawancara(existing.namaPewawancara);
        }
      }
    } else {
      setSavedOrtuResult(null);
    }

    setLoading(false);
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setOrtuAnswers({});
    const existing = gasService.getHasilWawancaraOrtu(id);
    setSavedOrtuResult(existing || null);
  };

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0] || null;
  const isGasLive = gasService.isLiveGasConfigured();

  // Helper untuk mendapatkan nilai referensi dari rawData OTM
  const getRefValue = (refId: number | null): string => {
    if (!refId || !currentStudent) return '-';
    const raw = currentStudent.rawData;
    if (!raw) return '-';
    if (typeof raw === 'object' && raw[refId]) {
      return String(raw[refId]);
    }
    const idx = refId - 1;
    if (Array.isArray(raw) && raw[idx]) {
      return String(raw[idx]);
    }
    return '-';
  };

  const effectivePewawancaraName = isCustomPewawancara ? customPewawancara.trim() : namaPewawancaraOrtu;

  // Siapkan Data untuk Review & Tanda Tangan sebelum Simpan
  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) { alert("Pilih siswa terlebih dahulu!"); return; }
    if (!effectivePewawancaraName) { alert("Pilih atau isi nama pewawancara terlebih dahulu!"); return; }

    const collectedAnswers: WawancaraOrtuAnswerItem[] = [];

    QUESTIONS_CONFIG.forEach((q, index) => {
      if (q.type === 'header') {
        collectedAnswers.push({ isHeader: true, question: q.text, newAnswer: '' });
      } else {
        const refVal = getRefValue(q.refId);
        const ansVal = ortuAnswers[index] || '';
        collectedAnswers.push({
          isHeader: false,
          question: q.text,
          refAnswer: refVal,
          newAnswer: ansVal
        });
      }
    });

    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const catatanItem = collectedAnswers.find(item => item.question && item.question.includes("CATATAN KHUSUS"));
    const catatanKhususText = catatanItem ? (catatanItem.newAnswer || "-") : "-";

    const draftData: HasilObservasiOrtuData = {
      id: 'HO-' + Date.now(),
      idSiswa: currentStudent.id,
      noPendaftaran: currentStudent.id,
      namaSiswa: currentStudent.nama,
      namaPanggilan: currentStudent.panggilan || currentStudent.nama.split(' ')[0],
      sekolahAsal: currentStudent.sekolah,
      namaAyah: currentStudent.ayah,
      namaIbu: currentStudent.ibu,
      namaPewawancara: effectivePewawancaraName,
      tanggalWawancara: dateStr,
      jsonAnswers: collectedAnswers,
      catatanKhusus: catatanKhususText,
      ttdOrtuBase64: savedOrtuResult?.ttdOrtuBase64 || '',
      ttdPewawancaraBase64: savedOrtuResult?.ttdPewawancaraBase64 || '',
      createdAt: new Date().toISOString()
    };

    setReviewModalData(draftData);
    setIsPreSaveReview(true);
  };

  // Simpan final hasil wawancara beserta tanda tangan elektronik
  const handleConfirmSave = async (ttdOrtu: string, ttdPewawancara: string) => {
    if (!reviewModalData) return;
    setSaving(true);

    const payload = {
      idSiswa: reviewModalData.idSiswa,
      namaSiswa: reviewModalData.namaSiswa,
      sekolahAsal: reviewModalData.sekolahAsal,
      namaPanggilan: reviewModalData.namaPanggilan,
      namaAyah: reviewModalData.namaAyah,
      namaIbu: reviewModalData.namaIbu,
      namaPewawancara: reviewModalData.namaPewawancara,
      jsonAnswers: reviewModalData.jsonAnswers,
      ttdOrtuBase64: ttdOrtu,
      ttdPewawancaraBase64: ttdPewawancara
    };

    const res = await gasService.processWawancaraOrtu(payload);
    setSaving(false);
    setSavedOrtuResult(res.data);
    setIsPreSaveReview(false);
    setReviewModalData(res.data); // Tetap buka pratinjau hasil final
    await loadStudentList(reviewModalData.idSiswa);
    alert('✓ ' + res.message);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner: Tim Wawancara Ortu (OTM) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Khusus Tim Pewawancara Orang Tua (OTM)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Wawancara Orang Tua Murid (OTM)
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Evaluasi komitmen pembiayaan, profil keluarga, dan penandatanganan dokumen elektronik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGasConfig}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-amber-300" />
            <span>Status GAS: {isGasLive ? 'Tersambung Live' : 'Simulasi Offline'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
        
        {/* Step 1 & 2: Identitas Pewawancara & Pencarian Siswa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          
          {/* Pewawancara Dropdown List */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nama Pewawancara (Pilih Dari Daftar Guru/Penguji):</span>
            </label>
            <div className="space-y-2">
              <select
                value={isCustomPewawancara ? '__custom__' : namaPewawancaraOrtu}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomPewawancara(true);
                  } else {
                    setIsCustomPewawancara(false);
                    setNamaPewawancaraOrtu(e.target.value);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {DAFTAR_PEWAWANCARA_LIST.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="__custom__">+ Tulis Nama Penguji Lainnya...</option>
              </select>

              {isCustomPewawancara && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik nama lengkap pewawancara..."
                  value={customPewawancara}
                  onChange={(e) => setCustomPewawancara(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Nama ini akan tertera resmi pada tanda tangan dokumen hasil wawancara.
            </p>
          </div>

          {/* Student Search Combobox */}
          <div>
            <StudentSearchCombobox
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={handleSelectStudent}
            />
          </div>

        </div>

        {/* Existing PDF Alert Banner */}
        {savedOrtuResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                  Calon Siswa Ini Sudah Pernah Diwawancarai
                </h4>
                <p className="text-xs text-amber-800">
                  Tanggal: {savedOrtuResult.tanggalWawancara} | Pewawancara: {savedOrtuResult.namaPewawancara}
                  {savedOrtuResult.ttdOrtuBase64 ? ' (Sudah Ber-TTD Digital)' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setReviewModalData(savedOrtuResult);
                  setIsPreSaveReview(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat Dokumen PDF Resmi</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Wawancara OTM: Pertanyaan, Jawaban Ref, dan Catatan Pewawancara */}
        {currentStudent ? (
          <form onSubmit={handleOpenReview} className="space-y-6">
            
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Lembar Evaluasi & Konfirmasi Jawaban Wawancara
                </h3>
                <p className="text-xs text-slate-500">
                  Bandingkan jawaban referensi yang diisi orang tua (Ref) dengan hasil wawancara langsung.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                {currentStudent.id}
              </span>
            </div>

            {/* Questions Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-200">
                      <th className="p-3 font-bold w-[35%]">Pertanyaan / Topik Wawancara</th>
                      <th className="p-3 font-bold w-[30%] bg-emerald-50/50 text-emerald-950">
                        Data Awal / Jawaban Ortu (Ref)
                      </th>
                      <th className="p-3 font-bold w-[35%]">Hasil Wawancara / Catatan Penguji</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {QUESTIONS_CONFIG.map((q, index) => {
                      if (q.type === 'header') {
                        return (
                          <tr key={q.id} className="bg-slate-800 text-white font-bold">
                            <td colSpan={3} className="py-2.5 px-4 text-xs tracking-wider uppercase">
                              {q.text}
                            </td>
                          </tr>
                        );
                      }

                      const refVal = getRefValue(q.refId);
                      const isCatatanKhusus = q.text.includes('CATATAN KHUSUS');

                      return (
                        <tr 
                          key={q.id} 
                          className={`hover:bg-slate-50/80 transition ${
                            isCatatanKhusus ? 'bg-amber-50/40 border-t-2 border-amber-300' : ''
                          }`}
                        >
                          <td className="p-3 align-top font-medium text-slate-900">
                            <div className="space-y-1">
                              <span>{q.text}</span>
                            </div>
                          </td>

                          <td className="p-3 align-top bg-emerald-50/30 text-slate-700 font-mono text-[11px]">
                            {refVal}
                          </td>

                          <td className="p-2.5 align-top">
                            {isCatatanKhusus ? (
                              <textarea
                                rows={2}
                                value={ortuAnswers[index] || ''}
                                onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                                placeholder="Tuliskan catatan khusus internal pewawancara..."
                                className="w-full p-2 rounded-xl border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={ortuAnswers[index] || ''}
                                onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                                placeholder={`Konfirmasi / catatan topik... (Ref: ${refVal !== '-' ? refVal.substring(0, 15) : '-'})`}
                                className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <PenTool className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Selesai wawancara, klik tombol di kanan untuk <strong>Review & Tanda Tangan Digital</strong> sebelum disimpan.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Review Hasil & Tanda Tangan Digital</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada calon siswa yang dipilih. Silakan cari nama siswa pada kolom pencarian di atas.
          </div>
        )}

      </div>

      {/* MODAL PRATINJAU PDF DENGAN TANDA TANGAN ELEKTRONIK & CATATAN KHUSUS DISEMBUNYIKAN */}
      {reviewModalData && (
        <HasilWawancaraOrtuPrintView
          data={reviewModalData}
          isPreSaveReview={isPreSaveReview}
          onConfirmSave={handleConfirmSave}
          onClose={() => {
            setReviewModalData(null);
            setIsPreSaveReview(false);
          }}
        />
      )}

    </div>
  );
};
