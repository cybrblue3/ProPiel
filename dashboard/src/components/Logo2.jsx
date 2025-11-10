// Logo Concept 2: Circular Skin Protection Shield
// Clean, medical, protective design
const Logo2 = ({ width = 180, variant = 'full' }) => {
  const colors = {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    gradient1: '#1976d2',
    gradient2: '#42a5f5'
  };

  if (variant === 'icon') {
    return (
      <svg width={width} height={width} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.gradient1} />
            <stop offset="100%" stopColor={colors.gradient2} />
          </linearGradient>
        </defs>

        {/* Shield/Protection shape */}
        <path
          d="M50 10 C30 10, 15 20, 15 35 C15 60, 50 90, 50 90 C50 90, 85 60, 85 35 C85 20, 70 10, 50 10 Z"
          fill="url(#shieldGradient)"
        />

        {/* Inner medical cross/skin cell pattern */}
        <circle cx="50" cy="45" r="20" fill="white" opacity="0.3" />
        <circle cx="50" cy="45" r="12" fill="white" opacity="0.5" />
        <circle cx="50" cy="45" r="5" fill="white" />
      </svg>
    );
  }

  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 280 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.gradient1} />
          <stop offset="100%" stopColor={colors.gradient2} />
        </linearGradient>
      </defs>

      {/* Icon part */}
      <g transform="translate(15, 6) scale(0.9)">
        <path
          d="M50 10 C30 10, 15 20, 15 35 C15 60, 50 90, 50 90 C50 90, 85 60, 85 35 C85 20, 70 10, 50 10 Z"
          fill="url(#shieldGradient2)"
        />
        <circle cx="50" cy="45" r="20" fill="white" opacity="0.3" />
        <circle cx="50" cy="45" r="12" fill="white" opacity="0.5" />
        <circle cx="50" cy="45" r="5" fill="white" />
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

export default Logo2;
