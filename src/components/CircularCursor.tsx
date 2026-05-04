import React, { useState, useEffect } from 'react';

interface CircularCursorProps {
  visible: boolean;
  text: string;
  textColorClass?: string;
  ringColor?: string;
  initialPos?: { x: number; y: number } | null;
}

const CircularCursor: React.FC<CircularCursorProps> = ({
  visible,
  text,
  textColorClass = "fill-wareongo-blue",
  ringColor = "rgba(255, 255, 255, 0.95)",
  initialPos = null
}) => {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    if (!visible) return;
    if (initialPos) setCursorPos(initialPos);

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [visible, initialPos]);

  if (!visible) return null;

  return (
    <div 
      className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
      style={{ left: cursorPos.x, top: cursorPos.y }}
    >
      <svg 
        className="w-[104px] h-[104px]" 
        viewBox="0 0 100 100"
        style={{ animation: 'spin 8s linear infinite' }}
      >
        {/* White Ring Background */}
        <circle 
          cx="50" 
          cy="50" 
          r="34" 
          fill="none" 
          stroke={ringColor} 
          strokeWidth="22" 
        />
        {/* Text Path */}
        <path 
          id="circlePath" 
          d="M 50, 50 m -31, 0 a 31,31 0 1,1 62,0 a 31,31 0 1,1 -62,0" 
          fill="transparent" 
        />
        <text className={`text-[10px] font-bold uppercase ${textColorClass}`}>
          <textPath 
            href="#circlePath" 
            startOffset="50%" 
            textAnchor="middle" 
            textLength="180" 
            lengthAdjust="spacing"
          >
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default CircularCursor;
