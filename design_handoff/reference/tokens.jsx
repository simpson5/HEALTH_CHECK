// Design tokens for Simpson Health redesign
// Warm-leaning dark surface, amber as accent (not everywhere), sage & slate
// secondaries for progress/secondary data viz.

const T = {
  // Surfaces — warm-leaning, never pure black
  bg:         '#0E0B07',
  surface:    '#16120D',
  surface2:   '#1F1A14',
  surface3:   '#2A241C',
  border:     'rgba(255, 240, 220, 0.07)',
  borderHi:   'rgba(255, 240, 220, 0.14)',

  // Text — warm off-white
  text:       '#F5EAD8',
  textMid:    'rgba(245, 234, 216, 0.62)',
  textDim:    'rgba(245, 234, 216, 0.40)',
  textFaint:  'rgba(245, 234, 216, 0.22)',

  // Brand
  amber:      '#F2A93C',
  amberHi:    '#FFC267',
  amberDim:   '#A36C1E',
  amberSoft:  'rgba(242, 169, 60, 0.14)',

  // Secondary signals
  sage:       '#8FB46B',   // progress / positive
  sageSoft:   'rgba(143, 180, 107, 0.16)',
  slate:      '#7C9FC4',   // secondary data viz
  slateSoft:  'rgba(124, 159, 196, 0.16)',
  coral:      '#D87A60',   // warning / attention (used SPARINGLY)
  coralSoft:  'rgba(216, 122, 96, 0.16)',

  // Radii
  r3: 8, r4: 12, r5: 16, r6: 20, r7: 24,
};

const Tfont = {
  family: '"Pretendard Variable", Pretendard, -apple-system, "Helvetica Neue", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

Object.assign(window, { T, Tfont });
