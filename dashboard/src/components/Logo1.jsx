// Logo Concept 1: Geometric Skin Layers
// Modern, layered hexagons representing skin layers
const Logo1 = ({ width = 180, variant = 'full' }) => {
  const colors = {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    primaryDark: '#1565c0',
    white: '#ffffff'
  };

  if (variant === 'icon') {
    return (
      <svg width={width} height={width} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer hexagon - representing outer skin layer */}
        <path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          fill={colors.primary}
          opacity="0.15"
        />
        {/* Middle hexagon */}
        <path
          d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z"
          fill={colors.primary}
          opacity="0.4"
        />
        {/* Inner hexagon - dermis layer */}
        <path
          d="M50 35 L65 43.75 L65 56.25 L50 65 L35 56.25 L35 43.75 Z"
          fill={colors.primary}
        />
        {/* Center dot - representing skin cell */}
        <circle cx="50" cy="50" r="6" fill={colors.white} />
      </svg>
    );
  }

  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 280 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon part */}
      <g transform="translate(10, 6)">
        <path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          fill={colors.primary}
          opacity="0.15"
        />
        <path
          d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z"
          fill={colors.primary}
          opacity="0.4"
        />
        <path
          d="M50 35 L65 43.75 L65 56.25 L50 65 L35 56.25 L35 43.75 Z"
          fill={colors.primary}
        />
        <circle cx="50" cy="50" r="6" fill={colors.white} />
      </g>

      {/* Text part */}
      <text x="120" y="50" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="700" fill={colors.primary}>
        Pro
      </text>
      <text x="178" y="50" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="300" fill={colors.primaryLight}>
        Piel
      </text>
      <text x="120" y="75" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="400" fill={colors.primary} opacity="0.7" letterSpacing="2">
        DERMATOLOGÍA
      </text>
    </svg>
  );
};

export default Logo1;
