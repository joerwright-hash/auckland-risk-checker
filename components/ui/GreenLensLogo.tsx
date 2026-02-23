import React from "react";

interface GreenLensLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const GreenLensLogo: React.FC<GreenLensLogoProps> = ({ className = "h-8", iconOnly = false }) => {
  return (
    <svg
      viewBox={iconOnly ? "0 0 40 40" : "0 0 200 48"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Green Lens"
    >
      {/* Magnifying glass */}
      <circle cx="20" cy="20" r="12" stroke="#16a34a" strokeWidth="3" fill="none" />
      <line x1="28.5" y1="28.5" x2="36" y2="36" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      {/* Leaf inside glass */}
      <path d="M16 24c0-6 4-10 8-10-1 3-2 6-4 8-1 1-2.5 1.5-4 2z" fill="#16a34a" opacity="0.7" />
      {!iconOnly && (
        <text
          x="46"
          y="30"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="700"
        >
          <tspan fill="#16a34a">Green</tspan>
          <tspan fill="currentColor"> Lens</tspan>
        </text>
      )}
    </svg>
  );
};
