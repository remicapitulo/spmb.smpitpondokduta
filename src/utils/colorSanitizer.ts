/**
 * Utility untuk sanitasi dan konversi warna modern CSS Color Module 4 (seperti OKLCH di Tailwind CSS v4)
 * ke format standar sRGB (rgb / rgba / hex).
 * 
 * Mencegah error html2canvas: "Error: Attempting to parse an unsupported color function 'oklch'"
 */

/**
 * Konversi nilai warna OKLCH (L, C, H, A) ke sRGB standar (0-255).
 * Berdasarkan spesifikasi W3C CSS Color Module Level 4.
 */
export function oklchToRgb(l: number, c: number, h: number, a = 1): string {
  // Batasi input ke rentang aman
  const lClamped = Math.max(0, Math.min(1, l));
  const cClamped = Math.max(0, c);
  const hDeg = isNaN(h) ? 0 : h;

  const rad = (hDeg * Math.PI) / 180;
  const a_ = cClamped * Math.cos(rad);
  const b_ = cClamped * Math.sin(rad);

  const l_ = lClamped + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = lClamped - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = lClamped - 0.0894841775 * a_ - 1.2914855480 * b_;

  const l_lin = l_ * l_ * l_;
  const m_lin = m_ * m_ * m_;
  const s_lin = s_ * s_ * s_;

  const r_lin = +4.0767416621 * l_lin - 3.3077115913 * m_lin + 0.2309699292 * s_lin;
  const g_lin = -1.2684380046 * l_lin + 2.6097574011 * m_lin - 0.3413193965 * s_lin;
  const b_lin = -0.0041960863 * l_lin - 0.7034186147 * m_lin + 1.7076147010 * s_lin;

  const toGamma = (val: number) =>
    val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(Math.max(0, val), 1 / 2.4) - 0.055;

  const r = Math.round(Math.min(255, Math.max(0, toGamma(r_lin) * 255)));
  const g = Math.round(Math.min(255, Math.max(0, toGamma(g_lin) * 255)));
  const b = Math.round(Math.min(255, Math.max(0, toGamma(b_lin) * 255)));
  const alphaClamped = Math.max(0, Math.min(1, a));

  if (alphaClamped < 1) {
    return `rgba(${r}, ${g}, ${b}, ${Number(alphaClamped.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Ganti semua kemunculan oklch(...) di dalam string CSS apa pun (termasuk box-shadow, linear-gradient, dsb)
 */
export function replaceOklchInString(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) {
    return str;
  }

  // Regex fleksibel mencakup:
  // oklch(0.696 0.17 162.48)
  // oklch(69.6% 0.17 162.48deg / 0.5)
  // oklch(0.5 0.1 none / 50%)
  const oklchRegex = /oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg)?|none)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi;

  return str.replace(oklchRegex, (_match, lStr, cStr, hStr, aStr) => {
    try {
      const l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      const c = cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
      const h = hStr === 'none' ? 0 : parseFloat(hStr);
      let a = 1;
      if (aStr) {
        a = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      }
      return oklchToRgb(l, c, h, a);
    } catch {
      return '#047857';
    }
  });
}

/**
 * Proxy pembungkus CSSStyleDeclaration agar getPropertyValue dan properti direct access
 * otomatis mengonversi nilai warna oklch ke sRGB standar.
 */
export function wrapComputedStyle(styles: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(styles, {
    get(target, prop, receiver) {
      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          const val = target.getPropertyValue(propertyName);
          return typeof val === 'string' && val.includes('oklch') ? replaceOklchInString(val) : val;
        };
      }
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === 'string' && val.includes('oklch')) {
        return replaceOklchInString(val);
      }
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
  });
}

/**
 * Monkey-patch getComputedStyle pada window target selama eksekusi html2canvas.
 * Mengembalikan fungsi restore untuk mengembalikan window ke semula.
 */
export function patchGetComputedStyle(targetWin: Window = window): () => void {
  const orig = targetWin.getComputedStyle;
  if (!orig) return () => {};

  targetWin.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    const rawStyles = orig.call(targetWin, elt, pseudoElt);
    return wrapComputedStyle(rawStyles);
  } as typeof window.getComputedStyle;

  return () => {
    targetWin.getComputedStyle = orig;
  };
}

/**
 * Sanitasi dokumen klon yang dibuat html2canvas sebelum di-render ke canvas.
 */
export function sanitizeDocumentForCanvas(clonedDoc: Document): void {
  try {
    // 1. Patch defaultView di dalam iframe dokumen klon
    if (clonedDoc.defaultView) {
      patchGetComputedStyle(clonedDoc.defaultView);
    }

    // 2. Suntikkan stylesheet penimpa sRGB murni ke <head> dokumen klon
    const styleEl = clonedDoc.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = `
      :root, html, body {
        background-color: #ffffff !important;
        color: #0f172a !important;
      }
      *, *::before, *::after {
        --color-emerald-50: #ecfdf5 !important;
        --color-emerald-100: #d1fae5 !important;
        --color-emerald-200: #a7f3d0 !important;
        --color-emerald-300: #6ee7b7 !important;
        --color-emerald-400: #34d399 !important;
        --color-emerald-500: #10b981 !important;
        --color-emerald-600: #059669 !important;
        --color-emerald-700: #047857 !important;
        --color-emerald-800: #065f46 !important;
        --color-emerald-900: #064e3b !important;
        --color-emerald-950: #022c22 !important;

        --color-slate-50: #f8fafc !important;
        --color-slate-100: #f1f5f9 !important;
        --color-slate-200: #e2e8f0 !important;
        --color-slate-300: #cbd5e1 !important;
        --color-slate-400: #94a3b8 !important;
        --color-slate-500: #64748b !important;
        --color-slate-600: #475569 !important;
        --color-slate-700: #334155 !important;
        --color-slate-800: #1e293b !important;
        --color-slate-900: #0f172a !important;
        --color-slate-950: #020617 !important;

        --tw-shadow-color: rgba(0, 0, 0, 0.08) !important;
      }
    `;
    (clonedDoc.head || clonedDoc.documentElement).appendChild(styleEl);

    // 3. Pastikan html dan body memiliki background sRGB eksplisit
    if (clonedDoc.documentElement) {
      clonedDoc.documentElement.style.backgroundColor = '#ffffff';
      clonedDoc.documentElement.style.color = '#0f172a';
    }
    if (clonedDoc.body) {
      clonedDoc.body.style.backgroundColor = '#ffffff';
      clonedDoc.body.style.color = '#0f172a';
    }

    // 4. Periksa dan ubah inline style pada seluruh elemen jika ada nilai oklch
    const allNodes = clonedDoc.querySelectorAll('*');
    allNodes.forEach((node) => {
      const el = node as HTMLElement;
      if (el.style) {
        if (el.style.cssText && el.style.cssText.includes('oklch')) {
          el.style.cssText = replaceOklchInString(el.style.cssText);
        }
      }
    });
  } catch (err) {
    console.warn('sanitizeDocumentForCanvas warning:', err);
  }
}
