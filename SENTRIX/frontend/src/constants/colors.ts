export const colors = {
  // Primary
  primary: '#03224d',
  primaryDark: '#001a41',
  primaryLight: '#1f3864',
  primaryContainer: '#1f3864',
  onPrimaryContainer: '#8ba2d5',
  primaryFixed: '#d8e2ff',
  primaryFixedDim: '#afc6fb',

  // Secondary
  secondary: '#3b5ca3',
  secondaryContainer: '#92b2ff',

  // Surfaces
  background: '#f7f9fc',
  surface: '#ffffff',
  surfaceDim: '#d8dadd',
  surfaceBright: '#f7f9fc',
  surfaceContainer: '#eceef1',
  surfaceContainerLow: '#f2f4f7',
  surfaceContainerHigh: '#e6e8eb',
  surfaceContainerHighest: '#e0e3e6',
  surfaceContainerLowest: '#ffffff',
  surfaceBlue: '#D9E2F3',

  // Text
  text: '#191c1e',
  textSecondary: '#44474f',
  textMuted: '#747780',
  textPrimary: '#1A1A1A',

  // Borders & Outline
  border: '#c4c6d0',
  outline: '#747780',
  outlineVariant: '#c4c6d0',

  // Semantic
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  warning: '#f97316',
  warningSubtle: '#FCE4D6',
  success: '#375623',
  successSubtle: '#E2EFDA',

  // Alert colors (tertiary / panic)
  alert: '#c55a11',
  alertLight: '#f98139',
  alertContainer: '#622700',

  // Risk levels (keep same scheme but adjusted)
  risk: {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  },
};

export const riskColors = [colors.risk.low, colors.risk.medium, colors.risk.high, colors.risk.critical];
