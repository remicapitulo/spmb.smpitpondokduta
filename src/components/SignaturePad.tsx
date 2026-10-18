import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

interface Props {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (base64: string) => void;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<Props> = ({
  label,
  sublabel = 'Bubuhkan tanda tangan di dalam kotak menggunakan jari atau mouse',
  value,
  onChange,
  width = 500,
  height = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle initial value if present
    if (value && !hasDrawn) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = value;
    } else if (!value && !hasDrawn) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else if ('clientX' in e) {
      return {
        x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
        y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Slate-900 dark ink
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export to base64 DataURL
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange('');
  };

  return (
    <div className="flex flex-col space-y-2 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
      {label ? (
        <div className="pb-0.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{label}</span>
          </span>
          {sublabel && <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{sublabel}</p>}
        </div>
      ) : null}

      {/* Signature Canvas Box */}
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden hover:border-emerald-500 transition-colors">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full touch-none cursor-crosshair bg-white"
          style={{ height: `${height}px` }}
        />

        {/* Subtle baseline indicator */}
        <div className="pointer-events-none absolute bottom-4 left-6 right-6 border-b border-slate-200 flex justify-between text-[9px] text-slate-400 select-none pb-0.5">
          <span>Tanda Tangan di Sini</span>
          <span>(x)</span>
        </div>
      </div>

      {/* Actions di Bawah */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={handleClear}
          className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
        >
          <Eraser className="w-3 h-3" />
          <span>Hapus / Bersihkan</span>
        </button>
      </div>
    </div>
  );
};
