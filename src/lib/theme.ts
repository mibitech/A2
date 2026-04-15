/**
 * Gerenciamento de tema (cor brand) via CSS Custom Properties.
 * Centralizado aqui para que qualquer parte do app possa aplicar/ler o tema.
 */

export const DEFAULT_BRAND_COLOR = '#6B3FA0'
export const THEME_STORAGE_KEY = 'a2tech-brand-color'

// ── Utilitários de cor ──────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!r) return [0, 0, 0]
  const rv = parseInt(r[1] ?? '0', 16) / 255
  const gv = parseInt(r[2] ?? '0', 16) / 255
  const bv = parseInt(r[3] ?? '0', 16) / 255
  const max = Math.max(rv, gv, bv), min = Math.min(rv, gv, bv)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rv: h = ((gv - bv) / d + (gv < bv ? 6 : 0)) / 6; break
      case gv: h = ((bv - rv) / d + 2) / 6; break
      case bv: h = ((rv - gv) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function generatePalette(hex: string): Record<string, string> {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return {}
  const [h, s, l] = hexToHsl(hex)
  return {
    '50':  hslToHex(h, Math.max(s * 0.2, 5), 97),
    '100': hslToHex(h, Math.max(s * 0.3, 8), 94),
    '200': hslToHex(h, Math.max(s * 0.45, 15), 87),
    '300': hslToHex(h, Math.min(s * 0.65, 90), 77),
    '400': hslToHex(h, Math.min(s * 0.85, 95), 64),
    '500': hex,
    '600': hslToHex(h, s, Math.max(l - 10, 5)),
    '700': hslToHex(h, s, Math.max(l - 18, 4)),
    '800': hslToHex(h, s, Math.max(l - 27, 3)),
    '900': hslToHex(h, s, Math.max(l - 35, 2)),
    '950': hslToHex(h, s, Math.max(l - 42, 1)),
  }
}

export function hexToRgbVars(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

/**
 * Lê a cor salva no localStorage e aplica ao site.
 * Deve ser chamado antes do React renderizar (em main.tsx).
 */
export function initTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved && /^#[0-9A-Fa-f]{6}$/.test(saved)) {
    applyThemeToSite(saved)
  }
}

/** Aplica a paleta completa como CSS variables no :root → atualiza o site inteiro */
export function applyThemeToSite(hex: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return
  const palette = generatePalette(hex)
  const root = document.documentElement
  root.style.setProperty('--color-brand-50',  hexToRgbVars(palette['50']  ?? ''))
  root.style.setProperty('--color-brand-100', hexToRgbVars(palette['100'] ?? ''))
  root.style.setProperty('--color-brand-200', hexToRgbVars(palette['200'] ?? ''))
  root.style.setProperty('--color-brand-300', hexToRgbVars(palette['300'] ?? ''))
  root.style.setProperty('--color-brand-400', hexToRgbVars(palette['400'] ?? ''))
  root.style.setProperty('--color-brand',     hexToRgbVars(palette['500'] ?? ''))
  root.style.setProperty('--color-brand-600', hexToRgbVars(palette['600'] ?? ''))
  root.style.setProperty('--color-brand-700', hexToRgbVars(palette['700'] ?? ''))
  root.style.setProperty('--color-brand-800', hexToRgbVars(palette['800'] ?? ''))
  root.style.setProperty('--color-brand-900', hexToRgbVars(palette['900'] ?? ''))
  root.style.setProperty('--color-brand-950', hexToRgbVars(palette['950'] ?? ''))
}

