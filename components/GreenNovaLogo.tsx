import React from 'react';

export const GreenNovaLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="emblemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0A192F" />
        <stop offset="100%" stopColor="#020C1B" />
      </linearGradient>
      <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>

    {/* Outer Double Ring */}
    <circle cx="256" cy="256" r="240" stroke="#10b981" strokeWidth="12" />
    <circle cx="256" cy="256" r="225" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.2" />
    
    {/* Main Emblem Background */}
    <circle cx="256" cy="256" r="234" fill="url(#emblemGradient)" />

    {/* SBL Tower Base Structure */}
    <path 
      d="M170 450 C200 420 220 380 230 330 L282 330 C292 380 312 420 342 450" 
      stroke="white" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    <path 
      d="M230 330 L256 280 L282 330" 
      stroke="white" 
      strokeWidth="6" 
      fill="none" 
    />
    <path 
      d="M210 380 L302 380" 
      stroke="white" 
      strokeWidth="4" 
      strokeOpacity="0.5" 
    />
    
    {/* Large SBL Typography integrated at base */}
    <g transform="translate(256, 410)">
      <text 
        x="0" 
        y="0" 
        fill="white" 
        fontSize="120" 
        fontWeight="900" 
        textAnchor="middle" 
        fontFamily="Inter, sans-serif"
        letterSpacing="-5"
      >
        SBL
      </text>
    </g>

    {/* Neural Brain / AI Core */}
    <g transform="translate(256, 190)">
      {/* Brain Graphic */}
      <path 
        d="M-40 -40 C-60 -40 -75 -25 -75 -5 C-75 15 -60 30 -40 30 C-20 30 -5 15 -5 -5 C-5 -25 -20 -40 -40 -40 Z" 
        stroke="#10b981" 
        strokeWidth="6" 
        fill="none" 
      />
      <path 
        d="M40 -40 C60 -40 75 -25 75 -5 C75 15 60 30 40 30 C20 30 5 15 5 -5 C5 -25 20 -40 40 -40 Z" 
        stroke="#10b981" 
        strokeWidth="6" 
        fill="none" 
      />
      {/* AI Text Center */}
      <text 
        x="0" 
        y="10" 
        fill="white" 
        fontSize="48" 
        fontWeight="900" 
        textAnchor="middle" 
        fontFamily="Inter, sans-serif"
      >
        AI
      </text>
    </g>

    {/* Orbits, Gears and Leaves */}
    <ellipse 
      cx="256" 
      cy="190" 
      rx="110" 
      ry="45" 
      stroke="white" 
      strokeWidth="3" 
      strokeOpacity="0.4" 
      transform="rotate(-15, 256, 190)" 
    />
    
    {/* Gear Left */}
    <circle cx="160" cy="180" r="15" stroke="white" strokeWidth="4" />
    <path d="M160 160 V165 M160 195 V200 M140 180 H145 M175 180 H180" stroke="white" strokeWidth="4" />
    
    {/* Gear Right */}
    <circle cx="352" cy="230" r="12" stroke="white" strokeWidth="3" />
    
    {/* Leaves */}
    <path d="M160 130 C160 130 140 140 145 160 C145 160 170 160 170 140 Z" fill="#10b981" />
    <path d="M370 170 C370 170 390 180 385 200 C385 200 360 200 360 180 Z" fill="#10b981" />

    {/* Launch Rocket at Top */}
    <g transform="translate(256, 75)">
      <path 
        d="M0 -60 C0 -60 -25 -20 -25 20 C-25 35 -15 45 0 45 C15 45 25 35 25 20 C25 -20 0 -60 0 -60 Z" 
        fill="url(#rocketGrad)" 
      />
      <circle cx="0" cy="-10" r="8" fill="white" opacity="0.3" />
      {/* Engine Fins */}
      <path d="M-15 45 L-25 60 H25 L15 45" fill="#3b82f6" />
      {/* Thrust */}
      <path d="M0 45 V70" stroke="white" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 5" />
    </g>
  </svg>
);

export default GreenNovaLogo;