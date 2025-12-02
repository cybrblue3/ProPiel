// ProPiel Logo Component
const Logo = ({ width = 180, variant = 'full', theme = 'default' }) => {
  const colors = theme === 'light' ? {
    primary: '#ffffff',
    primaryLight: '#e3f2fd',
    primaryDark: '#f5f5f5',
    white: '#ffffff'
  } : {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    primaryDark: '#1565c0',
    white: '#ffffff'
  };

  if (variant === 'icon') {
    return (
      <svg width={width} height={width} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer hexagon */}
        <path
          d="M50 10 L82 30 L82 70 L50 90 L18 70 L18 30 Z"
          stroke={colors.primary}
          strokeWidth="3"
          fill="none"
        />

        {/* Inner geometric pattern */}
        <path
          d="M50 30 L62 37.5 L62 47.5 L50 55 L38 47.5 L38 37.5 Z"
          fill={colors.primary}
          opacity="0.3"
        />

        <path
          d="M50 45 L60 51.25 L60 58.75 L50 65 L40 58.75 L40 51.25 Z"
          fill={colors.primaryLight}
          opacity="0.5"
        />

        <path
          d="M50 58 L58 62.5 L58 67.5 L50 72 L42 67.5 L42 62.5 Z"
          fill={colors.primary}
          opacity="0.7"
        />

        <line x1="50" y1="20" x2="50" y2="30" stroke={colors.primaryLight} strokeWidth="2" />
        <line x1="50" y1="72" x2="50" y2="80" stroke={colors.primaryLight} strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 280 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon part */}
      <g transform="translate(15, 6) scale(0.9)">
        <path
          d="M50 10 L82 30 L82 70 L50 90 L18 70 L18 30 Z"
          stroke={colors.primary}
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M50 30 L62 37.5 L62 47.5 L50 55 L38 47.5 L38 37.5 Z"
          fill={colors.primary}
          opacity="0.3"
        />

        <path
          d="M50 45 L60 51.25 L60 58.75 L50 65 L40 58.75 L40 51.25 Z"
          fill={colors.primaryLight}
          opacity="0.5"
        />

        <path
          d="M50 58 L58 62.5 L58 67.5 L50 72 L42 67.5 L42 62.5 Z"
          fill={colors.primary}
          opacity="0.7"
        />

        <line x1="50" y1="20" x2="50" y2="30" stroke={colors.primaryLight} strokeWidth="2" />
        <line x1="50" y1="72" x2="50" y2="80" stroke={colors.primaryLight} strokeWidth="2" />
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

export default Logo;
