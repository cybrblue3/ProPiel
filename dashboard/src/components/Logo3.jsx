// Logo Concept 3: Minimal DNA/Skin Cell Helix
// Ultra-modern, geometric, scientific
const Logo3 = ({ width = 180, variant = 'full' }) => {
  const colors = {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    primaryDark: '#1565c0'
  };

  if (variant === 'icon') {
    return (
      <svg width={width} height={width} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle - skin protection */}
        <circle cx="50" cy="50" r="40" stroke={colors.primary} strokeWidth="2" fill="none" opacity="0.3" />

        {/* DNA/Cell structure - geometric */}
        <circle cx="50" cy="30" r="8" fill={colors.primary} />
        <circle cx="50" cy="50" r="8" fill={colors.primaryLight} />
        <circle cx="50" cy="70" r="8" fill={colors.primary} />

        {/* Connecting lines - representing cell connection */}
        <line x1="50" y1="38" x2="50" y2="42" stroke={colors.primary} strokeWidth="2" />
        <line x1="50" y1="58" x2="50" y2="62" stroke={colors.primary} strokeWidth="2" />

        {/* Side elements - representing skin layers */}
        <circle cx="30" cy="40" r="4" fill={colors.primaryLight} opacity="0.6" />
        <circle cx="70" cy="40" r="4" fill={colors.primaryLight} opacity="0.6" />
        <circle cx="30" cy="60" r="4" fill={colors.primaryLight} opacity="0.6" />
        <circle cx="70" cy="60" r="4" fill={colors.primaryLight} opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 280 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon part */}
      <g transform="translate(15, 6) scale(0.9)">
        <circle cx="50" cy="50" r="40" stroke={colors.primary} strokeWidth="2" fill="none" opacity="0.3" />
        <circle cx="50" cy="30" r="8" fill={colors.primary} />
        <circle cx="50" cy="50" r="8" fill={colors.primaryLight} />
        <circle cx="50" cy="70" r="8" fill={colors.primary} />
        <line x1="50" y1="38" x2="50" y2="42" stroke={colors.primary} strokeWidth="2" />
        <line x1="50" y1="58" x2="50" y2="62" stroke={colors.primary} strokeWidth="2" />
        <circle cx="30" cy="40" r="4" fill={colors.primaryLight} opacity="0.6" />
        <circle cx="70" cy="40" r="4" fill={colors.primaryLight} opacity="0.6" />
        <circle cx="30" cy="60" r="4" fill={colors.primaryLight} opacity="0.6" />
        <circle cx="70" cy="60" r="4" fill={colors.primaryLight} opacity="0.6" />
      </g>

      {/* Text part */}
      <text x="115" y="50" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="700" fill={colors.primary}>
        Pro
      </text>
      <text x="173" y="50" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="300" fill={colors.primaryLight}>
        Piel
      </text>
      <text x="115" y="75" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="400" fill={colors.primary} opacity="0.7" letterSpacing="2">
        DERMATOLOGÍA
      </text>
    </svg>
  );
};

export default Logo3;
