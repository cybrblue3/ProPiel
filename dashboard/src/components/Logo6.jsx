// Logo Concept 6: Simplified Geometric Lines
// Ultra-minimal, just hexagon with corner accents
const Logo6 = ({ width = 180, variant = 'full' }) => {
  const colors = {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    primaryDark: '#1565c0'
  };

  if (variant === 'icon') {
    return (
      <svg width={width} height={width} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main hexagon with gradient stroke */}
        <defs>
          <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.primaryLight} />
          </linearGradient>
        </defs>

        {/* Outer hexagon */}
        <path
          d="M50 12 L80 32 L80 68 L50 88 L20 68 L20 32 Z"
          stroke="url(#strokeGradient)"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Inner hexagon - smaller */}
        <path
          d="M50 28 L68 40 L68 60 L50 72 L32 60 L32 40 Z"
          stroke={colors.primary}
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />

        {/* Center geometric accent - just lines, no circles! */}
        <line x1="40" y1="50" x2="60" y2="50" stroke={colors.primary} strokeWidth="2.5" />
        <line x1="50" y1="40" x2="50" y2="60" stroke={colors.primary} strokeWidth="2.5" />
      </svg>
    );
  }

  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 280 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="strokeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.primaryLight} />
        </linearGradient>
      </defs>

      {/* Icon part */}
      <g transform="translate(15, 6) scale(0.9)">
        <path
          d="M50 12 L80 32 L80 68 L50 88 L20 68 L20 32 Z"
          stroke="url(#strokeGradient2)"
          strokeWidth="3.5"
          fill="none"
        />
        <path
          d="M50 28 L68 40 L68 60 L50 72 L32 60 L32 40 Z"
          stroke={colors.primary}
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
        <line x1="40" y1="50" x2="60" y2="50" stroke={colors.primary} strokeWidth="2.5" />
        <line x1="50" y1="40" x2="50" y2="60" stroke={colors.primary} strokeWidth="2.5" />
      </g>

      {/* Text part */}
      <text x="115" y="50" fontFamily="'Inter', 'Segoe UI', Arial, sans-serif" fontSize="36" fontWeight="600" fill={colors.primary}>
        Pro
      </text>
      <text x="173" y="50" fontFamily="'Inter', 'Segoe UI', Arial, sans-serif" fontSize="36" fontWeight="300" fill={colors.primaryLight}>
        Piel
      </text>
      <text x="115" y="75" fontFamily="'Inter', 'Segoe UI', Arial, sans-serif" fontSize="11" fontWeight="500" fill={colors.primary} opacity="0.7" letterSpacing="3">
        DERMATOLOGÍA
      </text>
    </svg>
  );
};

export default Logo6;
