// Logo Concept 4: HYBRID - Clean Hexagonal Cell Structure
// Combines Logo 1's hexagons with Logo 3's minimal aesthetic
const Logo4 = ({ width = 180, variant = 'full' }) => {
  const colors = {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    primaryDark: '#1565c0',
    white: '#ffffff'
  };

  if (variant === 'icon') {
    return (
      <svg width={width} height={width} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main hexagon outline - clean & minimal */}
        <path
          d="M50 10 L82 30 L82 70 L50 90 L18 70 L18 30 Z"
          stroke={colors.primary}
          strokeWidth="2.5"
          fill="none"
        />

        {/* Inner hexagon with gradient fill - represents dermis */}
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
            <stop offset="100%" stopColor={colors.primaryLight} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M50 25 L72 38.75 L72 61.25 L50 75 L28 61.25 L28 38.75 Z"
          fill="url(#hexGradient)"
        />

        {/* Center cellular structure - minimal dots */}
        <circle cx="50" cy="50" r="10" fill={colors.primary} opacity="0.8" />
        <circle cx="50" cy="50" r="5" fill={colors.white} />

        {/* Corner accent dots - representing cells */}
        <circle cx="50" cy="30" r="2.5" fill={colors.primaryLight} />
        <circle cx="50" cy="70" r="2.5" fill={colors.primaryLight} />
        <circle cx="35" cy="50" r="2.5" fill={colors.primaryLight} />
        <circle cx="65" cy="50" r="2.5" fill={colors.primaryLight} />
      </svg>
    );
  }

  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 280 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hexGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.primaryLight} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Icon part */}
      <g transform="translate(15, 6) scale(0.9)">
        <path
          d="M50 10 L82 30 L82 70 L50 90 L18 70 L18 30 Z"
          stroke={colors.primary}
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M50 25 L72 38.75 L72 61.25 L50 75 L28 61.25 L28 38.75 Z"
          fill="url(#hexGradient2)"
        />
        <circle cx="50" cy="50" r="10" fill={colors.primary} opacity="0.8" />
        <circle cx="50" cy="50" r="5" fill={colors.white} />
        <circle cx="50" cy="30" r="2.5" fill={colors.primaryLight} />
        <circle cx="50" cy="70" r="2.5" fill={colors.primaryLight} />
        <circle cx="35" cy="50" r="2.5" fill={colors.primaryLight} />
        <circle cx="65" cy="50" r="2.5" fill={colors.primaryLight} />
      </g>

      {/* Text part - cleaner typography */}
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

export default Logo4;
