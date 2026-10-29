import React, { useState, useRef, useEffect } from 'react';
import { Search, X, CheckCircle2, ChevronDown, School } from 'lucide-react';
import { gasService } from '../services/gasService';

interface Props {
  students: any[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  label?: string;
  placeholder?: string;
  theme?: 'blue' | 'indigo' | 'emerald';
  statusMode?: 'wawancara' | 'observasi';
}

export const StudentSearchCombobox: React.FC<Props> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  label = 'Cari & Pilih Murid:',
  placeholder = 'Ketik nama murid, nomor registrasi, atau asal sekolah...',
  theme = 'blue',
  statusMode = 'wawancara'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0] || null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredStudents = students.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    const nama = (s.nama || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    const sekolah = (s.sekolah || '').toLowerCase();
    const panggilan = (s.panggilan || '').toLowerCase();
    const ayah = (s.ayah || '').toLowerCase();
    const ibu = (s.ibu || '').toLowerCase();
    return (
      nama.includes(term) ||
      id.includes(term) ||
      sekolah.includes(term) ||
      panggilan.includes(term) ||
      ayah.includes(term) ||
      ibu.includes(term)
    );
  });

  const isStudentDone = (s: any) => {
    if (!s) return false;
    if (statusMode === 'observasi') {
      const obs = gasService.getObservasiSiswa(s.id);
      return Boolean(obs && (obs.rekomendasi || obs.skorTotal > 0));
    }
    return Boolean(s.existingPdf || gasService.getHasilWawancaraOrtu(s.id));
  };

  const ringColor =
    theme === 'indigo'
      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
      : theme === 'emerald'
      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
      : 'border-blue-500 ring-2 ring-blue-500/20';

  const iconColor =
    theme === 'indigo'
      ? 'text-indigo-700'
      : theme === 'emerald'
      ? 'text-emerald-700'
      : 'text-blue-700';

  const activeItemBg =
    theme === 'indigo'
      ? 'bg-indigo-50 text-indigo-950 border-indigo-200'
      : theme === 'emerald'
      ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
      : 'bg-blue-50 text-blue-950 border-blue-200';

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between gap-2">
        <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <Search className={`w-3.5 h-3.5 ${iconColor}`} />
          <span>{label}</span>
        </label>
        <span className="text-[11px] font-medium text-slate-600">
          {isOpen && searchTerm.trim()
            ? <>Menampilkan <strong>{filteredStudents.length}</strong> dari {students.length} murid</>
            : <>Total: <strong>{students.length}</strong> murid</>}
        </span>
      </div>

      {/* Combined Search & Select Box (Single Row) */}
      <div className="relative">
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-left flex items-center justify-between gap-2 shadow-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              {selectedStudent ? (
                <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {selectedStudent.nama} {selectedStudent.sekolah ? `(${selectedStudent.sekolah})` : ''} — [{selectedStudent.id}]
                  </span>
                  {isStudentDone(selectedStudent) ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                      ✓ {statusMode === 'observasi' ? 'Sudah Diuji' : 'Sudah Wawancara'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                      ⏳ Siap
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-400 text-xs truncate">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        ) : (
          <div className={`w-full px-3.5 py-2 rounded-xl border bg-white flex items-center gap-2 shadow-xs ${ringColor}`}>
            <Search className={`w-4 h-4 shrink-0 ${iconColor}`} />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Tutup daftar"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* Dropdown List */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 text-xs max-h-64 overflow-y-auto custom-scrollbar space-y-1 animate-in fade-in duration-150">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s, idx) => {
                const isSelected = s.id === selectedStudent?.id;
                const done = isStudentDone(s);
                return (
                  <button
                    key={`combo-st-${s.id}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectStudent(s.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer border ${
                      isSelected
                        ? `${activeItemBg} font-bold`
                        : 'border-transparent hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate">{s.nama}</span>
                        <span className="font-mono text-[10px] text-slate-500">[{s.id}]</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <School className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{s.sekolah || '-'}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {done ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{statusMode === 'observasi' ? 'Sudah Diuji' : 'Sudah Wawancara'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          ⏳ Siap
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-5 text-slate-400 text-xs">
                Tidak ditemukan murid dengan kata kunci "<strong>{searchTerm}</strong>".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
