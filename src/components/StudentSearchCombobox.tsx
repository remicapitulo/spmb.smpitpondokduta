import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, CheckCircle2, ChevronDown, School, FileCheck } from 'lucide-react';

interface Props {
  students: any[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  label?: string;
  placeholder?: string;
}

export const StudentSearchCombobox: React.FC<Props> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  label = 'Pilih Siswa (Bisa Cari Berdasarkan Kata Kunci):',
  placeholder = 'Ketik Nama Siswa, No. Pendaftaran, atau Asal SD (misal: "Fatih", "001", "Pondok Duta")...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nama = (s.nama || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    const sekolah = (s.sekolah || '').toLowerCase();
    const ayah = (s.ayah || '').toLowerCase();
    const ibu = (s.ibu || '').toLowerCase();
    return nama.includes(term) || id.includes(term) || sekolah.includes(term) || ayah.includes(term) || ibu.includes(term);
  });

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-emerald-700" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-slate-400">
          Total: {students.length} Pendaftar
        </span>
      </div>

      {/* Selected Student Banner & Search Input */}
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full min-h-[48px] p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            isOpen 
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-white' 
              : 'border-slate-300 bg-white hover:border-slate-400 shadow-xs'
          }`}
        >
          {selectedStudent ? (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                {selectedStudent.nama?.substring(0, 2).toUpperCase() || 'PD'}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {selectedStudent.nama}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold shrink-0">
                    {selectedStudent.id}
                  </span>
                  {selectedStudent.existingPdf ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0 border border-amber-200">
                      Belum
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                  <span>Asal: <strong>{selectedStudent.sekolah}</strong></span>
                  <span>•</span>
                  <span>Ortu: {selectedStudent.ayah} / {selectedStudent.ibu}</span>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-xs">Pilih salah satu siswa...</span>
          )}

          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-700' : ''}`} />
        </div>

        {/* Dropdown Menu with Live Search Filter */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 text-xs space-y-2 animate-in fade-in slide-in-from-top-1">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => (
                  <button
                    key={`search-student-${s.id}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectStudent(s.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer ${
                      s.id === selectedStudentId
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 font-semibold'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate">{s.nama}</span>
                        <span className="font-mono text-[10px] text-slate-500">[{s.id}]</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <School className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{s.sekolah}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {s.existingPdf ? (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Ada PDF</span>
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Siap
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Tidak ditemukan murid dengan kata kunci "<strong>{searchTerm}</strong>".
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
