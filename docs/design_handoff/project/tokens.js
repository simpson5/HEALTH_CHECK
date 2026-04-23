// Simpson Health — design tokens
// Aesthetic: sophisticated dark, warm amber accent, Geist/Pretendard type
window.SH = {
  // Surfaces (warm-cool dark — oklch based)
  bg:        '#0E0F12',        // app background
  bgElev:    '#151619',        // elevated surface
  bgElev2:   '#1C1D21',        // cards
  bgElev3:   '#24262B',        // nested
  line:      'rgba(255,255,255,0.07)',
  lineStrong:'rgba(255,255,255,0.14)',

  // Text
  text:      '#EDEDEE',
  textMid:   'rgba(237,237,238,0.68)',
  textDim:   'rgba(237,237,238,0.42)',
  textFaint: 'rgba(237,237,238,0.22)',

  // Single warm amber accent (oklch ~0.78 0.14 65)
  accent:    '#F5A524',
  accentSoft:'rgba(245,165,36,0.14)',
  accentLine:'rgba(245,165,36,0.35)',

  // Semantics (muted)
  up:        '#6FCF8E',   // muted green
  down:      '#E87C5C',   // muted coral
  info:      '#7EA8FF',   // muted blue
  warn:      '#F5A524',

  // Macros — muted, distinct
  protein:   '#C9A96E',   // champagne
  carb:      '#8FB8E0',   // dusty blue
  fat:       '#D68FA5',   // dusty rose

  // Type
  fontSans:  '"Geist", "Pretendard", -apple-system, "SF Pro Text", system-ui, sans-serif',
  fontMono:  '"Geist Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
  fontSerif: '"Instrument Serif", "Noto Serif KR", Georgia, serif',

  radius: { sm: 10, md: 14, lg: 20, xl: 28 },
};
