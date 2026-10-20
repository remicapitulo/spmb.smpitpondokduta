/**
 * Utility untuk sanitasi dan konversi warna modern CSS Color Module 4 (seperti OKLCH, OKLAB, color-mix di Tailwind CSS v4)
 * ke format standar sRGB (rgb / rgba / hex).
 * 
 * Mencegah error html2canvas:
 * 1. "TypeError: Illegal invocation" (karena Proxy wrapper pada CSSStyleDeclaration V8 Blink engine)
 * 2. "Error: Attempting to parse an unsupported color function 'oklch'"
 * 3. "Error: Attempting to parse an unsupported color function 'oklab'"
 * 4. "Error: Attempting to parse an unsupported color function 'color-mix'"
 */

// Cache hasil konversi warna untuk performa instan (< 0.05ms per lookup)
const resolvedColorCache = new Map<string, string>();

let _hiddenProbeEl: HTMLDivElement | null = null;
let _nativeGetComputedStyle: typeof window.getComputedStyle | null = null;

function getProbeElement(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;
  if (!_hiddenProbeEl) {
    try {
      _hiddenProbeEl = document.createElement('div');
      _hiddenProbeEl.style.display = 'none';
      _hiddenProbeEl.style.position = 'fixed';
      _hiddenProbeEl.style.pointerEvents = 'none';
      _hiddenProbeEl.setAttribute('aria-hidden', 'true');
      (document.body || document.documentElement).appendChild(_hiddenProbeEl);
    } catch {
      _hiddenProbeEl = null;
    }
  }
  return _hiddenProbeEl;
}

/**
 * Konversi nilai warna OKLAB (L, a, b, alpha) ke sRGB standar (0-255).
 * Berdasarkan spesifikasi W3C CSS Color Module Level 4 oleh Björn Ottosson.
 */
export function oklabToRgb(L: number, aLab: number, bLab: number, alpha = 1): string {
  const l_ = L + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m_ = L - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s_ = L - 0.0894841775 * aLab - 1.2914855480 * bLab;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r_lin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const toGamma = (val: number) =>
    val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(Math.max(0, val), 1 / 2.4) - 0.055;

  const r = Math.round(Math.min(255, Math.max(0, toGamma(r_lin) * 255)));
  const g = Math.round(Math.min(255, Math.max(0, toGamma(g_lin) * 255)));
  const b = Math.round(Math.min(255, Math.max(0, toGamma(b_lin) * 255)));
  const aClamped = Math.max(0, Math.min(1, alpha));

  if (aClamped < 1) {
    return `rgba(${r}, ${g}, ${b}, ${Number(aClamped.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Konversi nilai warna OKLCH (L, C, H, A) ke sRGB standar (0-255).
 */
export function oklchToRgb(l: number, c: number, h: number, a = 1): string {
  const lClamped = Math.max(0, Math.min(1, l));
  const cClamped = Math.max(0, c);
  const hDeg = isNaN(h) ? 0 : h;

  const rad = (hDeg * Math.PI) / 180;
  const a_ = cClamped * Math.cos(rad);
  const b_ = cClamped * Math.sin(rad);

  return oklabToRgb(lClamped, a_, b_, a);
}

/**
 * Mengganti semua kemunculan oklab(...) di dalam string CSS
 */
export function replaceOklabInString(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklab')) {
    return str;
  }

  const oklabRegex = /oklab\(\s*([+-]?[0-9.]+%?)\s+([+-]?[0-9.]+%?)\s+([+-]?[0-9.]+%?)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi;

  return str.replace(oklabRegex, (_match, lStr, aStr, bStr, alphaStr) => {
    try {
      const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      const a = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      const b = bStr.endsWith('%') ? parseFloat(bStr) / 100 : parseFloat(bStr);
      let alpha = 1;
      if (alphaStr) {
        alpha = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
      }
      return oklabToRgb(L, a, b, alpha);
    } catch {
      return '#047857';
    }
  });
}

/**
 * Mengganti semua kemunculan oklch(...) di dalam string CSS
 */
export function replaceOklchInString(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) {
    return str;
  }

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
 * Mengonversi fungsi CSS bersarang dengan kurung berimbang (seperti color-mix(in oklab, ...))
 */
function replaceBalancedFunction(str: string, fnName: string, replacer: (fullFn: string) => string): string {
  let output = '';
  let i = 0;
  const needle = fnName + '(';

  while (i < str.length) {
    const idx = str.indexOf(needle, i);
    if (idx === -1) {
      output += str.substring(i);
      break;
    }

    output += str.substring(i, idx);
    let depth = 0;
    let endIdx = -1;

    for (let j = idx + fnName.length; j < str.length; j++) {
      if (str[j] === '(') depth++;
      else if (str[j] === ')') {
        depth--;
        if (depth === 0) {
          endIdx = j;
          break;
        }
      }
    }

    if (endIdx !== -1) {
      const fullFn = str.substring(idx, endIdx + 1);
      output += replacer(fullFn);
      i = endIdx + 1;
    } else {
      output += str.substring(idx);
      break;
    }
  }

  return output;
}

/**
 * Mengonversi ekspresi warna CSS (termasuk color-mix, oklch, oklab) ke nilai sRGB rgb(...) / rgba(...).
 * Dijamin 100% TIDAK PERNAH mengembalikan string yang mengandung "oklab" atau "oklch".
 */
export function resolveToSrgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  const trimmed = colorStr.trim();

  if (resolvedColorCache.has(trimmed)) {
    return resolvedColorCache.get(trimmed)!;
  }

  // Jika sudah berupa hex murni atau rgb/rgba standar
  if (/^#(?:[0-9a-f]{3,8})$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+\s*)?\)$/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed === 'transparent') {
    return 'rgba(0, 0, 0, 0)';
  }

  // 1. Manfaatkan mesin parsing browser pada elemen DOM tersembunyi
  const probe = getProbeElement();
  if (probe) {
    try {
      probe.style.color = '';
      probe.style.color = trimmed;
      if (probe.style.color) {
        const getStyle = _nativeGetComputedStyle || window.getComputedStyle;
        const comp = getStyle(probe).color;
        if (
          comp &&
          !comp.includes('oklch') &&
          !comp.includes('oklab') &&
          !comp.includes('color-mix')
        ) {
          resolvedColorCache.set(trimmed, comp);
          return comp;
        }
      }
    } catch {
      // lanjut ke fallback berikutnya
    }
  }

  // 2. Evaluasi color-mix(in oklab, <color> <pct>, transparent)
  const transparentMixMatch = trimmed.match(
    /color-mix\(\s*in\s+(?:oklab|srgb)\s*,\s*(.*?)\s+(\d+(?:\.\d+)?%?)\s*,\s*transparent\s*\)/i
  );
  if (transparentMixMatch) {
    const baseColorStr = resolveToSrgb(transparentMixMatch[1]);
    const pctStr = transparentMixMatch[2];
    const alpha = pctStr.endsWith('%') ? parseFloat(pctStr) / 100 : parseFloat(pctStr);
    const rgbMatch = baseColorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const res = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
      resolvedColorCache.set(trimmed, res);
      return res;
    }
  }

  // 3. Evaluasi oklch
  if (trimmed.includes('oklch')) {
    const res = replaceOklchInString(trimmed);
    if (!res.includes('oklch') && !res.includes('oklab')) {
      resolvedColorCache.set(trimmed, res);
      return res;
    }
  }

  // 4. Evaluasi oklab
  if (trimmed.includes('oklab')) {
    const res = replaceOklabInString(trimmed);
    if (!res.includes('oklch') && !res.includes('oklab')) {
      resolvedColorCache.set(trimmed, res);
      return res;
    }
  }

  // 5. Ultimate Fallback: jangan pernah biarkan string "oklab" lolos ke html2canvas
  if (trimmed.includes('oklab') || trimmed.includes('color-mix') || trimmed.includes('oklch')) {
    return 'rgba(4, 120, 87, 0.9)'; // Warna emerald SPMB yang aman
  }

  return trimmed;
}

/**
 * Sanitasi string CSS apa pun (box-shadow, border, background-color, color)
 * agar bersih dari fungsi oklch, oklab, dan color-mix sebelum dibaca html2canvas.
 */
export function sanitizeColorString(val: string): string {
  if (!val || typeof val !== 'string') return val;
  if (
    !val.includes('oklch') &&
    !val.includes('color-mix') &&
    !val.includes('oklab') &&
    !val.includes('lab(') &&
    !val.includes('lch(')
  ) {
    return val;
  }

  let result = val;

  // 1. Bersihkan color-mix(...)
  if (result.includes('color-mix')) {
    result = replaceBalancedFunction(result, 'color-mix', (fnStr) => resolveToSrgb(fnStr));
  }

  // 2. Bersihkan oklch(...)
  if (result.includes('oklch')) {
    result = replaceBalancedFunction(result, 'oklch', (fnStr) => resolveToSrgb(fnStr));
    result = replaceOklchInString(result);
  }

  // 3. Bersihkan oklab(...)
  if (result.includes('oklab')) {
    result = replaceBalancedFunction(result, 'oklab', (fnStr) => resolveToSrgb(fnStr));
    result = replaceOklabInString(result);
  }

  // 4. Pengaman darurat: Jika masih ada token oklab/oklch yang tersisa, ganti dengan sRGB emerald
  if (result.includes('oklab') || result.includes('oklch') || result.includes('color-mix')) {
    result = result
      .replace(/color-mix\([^)]+\)/gi, 'rgba(4, 120, 87, 0.9)')
      .replace(/oklab\([^)]+\)/gi, 'rgb(4, 120, 87)')
      .replace(/oklch\([^)]+\)/gi, 'rgb(4, 120, 87)');
  }

  return result;
}

/**
 * Proxy pembungkus CSSStyleDeclaration agar getPropertyValue dan properti direct access
 * otomatis mengonversi nilai warna oklch / oklab / color-mix ke sRGB standar.
 * 
 * Menggunakan target asli sebagai receiver ke-3 pada Reflect.get()
 * untuk mencegah error "TypeError: Illegal invocation" di Chrome / Edge.
 */
export function wrapComputedStyle(styles: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(styles, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          const val = target.getPropertyValue(propertyName);
          return typeof val === 'string' ? sanitizeColorString(val) : val;
        };
      }

      // Selalu gunakan target asli sebagai receiver
      const val = Reflect.get(target, prop, target);

      if (typeof val === 'function') {
        return val.bind(target);
      }
      if (typeof val === 'string') {
        return sanitizeColorString(val);
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
  if (!targetWin || !targetWin.getComputedStyle) return () => {};
  const orig = targetWin.getComputedStyle;
  if (!_nativeGetComputedStyle) {
    _nativeGetComputedStyle = orig;
  }

  targetWin.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    const rawStyles = orig.call(targetWin, elt, pseudoElt);
    if (!rawStyles) return rawStyles;
    return wrapComputedStyle(rawStyles);
  } as typeof window.getComputedStyle;

  return () => {
    targetWin.getComputedStyle = orig;
  };
}

/**
 * Sanitasi dokumen klon yang dibuat html2canvas sebelum di-render ke canvas.
 * Membekukan semua nilai warna elemen menjadi inline styles sRGB eksplisit.
 */
export function sanitizeDocumentForCanvas(clonedDoc: Document): void {
  try {
    if (clonedDoc.defaultView) {
      patchGetComputedStyle(clonedDoc.defaultView);
    }

    // Suntikkan stylesheet penimpa dasar ke <head> dokumen klon
    const styleEl = clonedDoc.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = `
      :root, html, body {
        background-color: #ffffff !important;
        color: #0f172a !important;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        --tw-shadow-color: rgba(0, 0, 0, 0.08) !important;
      }
    `;
    (clonedDoc.head || clonedDoc.documentElement).appendChild(styleEl);

    // Iterasi semua elemen di dokumen klon dan bersihkan warna inline & CSS text
    const allNodes = clonedDoc.querySelectorAll('*');
    allNodes.forEach((node) => {
      const el = node as HTMLElement;
      if (!el || !el.style) return;

      if (el.style.cssText) {
        if (
          el.style.cssText.includes('oklch') ||
          el.style.cssText.includes('color-mix') ||
          el.style.cssText.includes('oklab')
        ) {
          el.style.cssText = sanitizeColorString(el.style.cssText);
        }
      }

      // Pastikan background dan color aman jika mengandung modern color
      ['color', 'backgroundColor', 'borderColor'].forEach((prop) => {
        const current = (el.style as any)[prop];
        if (
          typeof current === 'string' &&
          (current.includes('oklch') || current.includes('color-mix') || current.includes('oklab'))
        ) {
          (el.style as any)[prop] = sanitizeColorString(current);
        }
      });
    });
  } catch (err) {
    console.warn('sanitizeDocumentForCanvas warning:', err);
  }
}
