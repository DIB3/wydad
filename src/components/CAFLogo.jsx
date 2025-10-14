export function CAFLogo({ className = "w-48 h-48" }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cercle extérieur vert */}
      <circle cx="100" cy="100" r="95" fill="#006633" />
      
      {/* Cercle jaune/or */}
      <circle cx="100" cy="100" r="85" fill="#FFD700" />
      
      {/* Motif de triangles autour */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x = 100 + 75 * Math.cos(angle)
        const y = 100 + 75 * Math.sin(angle)
        return (
          <polygon
            key={i}
            points={`${x},${y} ${x - 8},${y + 6} ${x + 8},${y + 6}`}
            fill="#FFD700"
            transform={`rotate(${i * 30}, ${x}, ${y})`}
          />
        )
      })}
      
      {/* Continent africain stylisé */}
      <g transform="translate(100, 80) scale(0.35)">
        <path
          d="M 0,-60 C -15,-55 -25,-45 -30,-30 C -35,-15 -35,0 -30,15 C -25,30 -20,40 -15,50 C -10,60 0,65 10,65 C 20,65 30,60 35,50 C 40,40 45,30 45,15 C 45,0 40,-15 35,-30 C 30,-45 20,-55 5,-60 C -5,-62 -5,-62 0,-60 Z"
          fill="#006633"
          stroke="#FFD700"
          strokeWidth="2"
        />
      </g>
      
      {/* Cercle intérieur vert */}
      <circle cx="100" cy="100" r="65" fill="#006633" />
      
      {/* Texte CAF */}
      <text
        x="100"
        y="115"
        fontFamily="Arial, sans-serif"
        fontSize="36"
        fontWeight="bold"
        fill="#FFD700"
        textAnchor="middle"
      >
        CAF
      </text>
      
      {/* Sous-titre */}
      <text
        x="100"
        y="140"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fill="#FFD700"
        textAnchor="middle"
      >
        CONFEDERATION AFRICAINE DE FOOTBALL
      </text>
    </svg>
  )
}

