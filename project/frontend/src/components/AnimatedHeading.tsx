import React, { useState, useEffect } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({ text, className = '', style = {} }) => {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const charDelay = 30; // ms
  const transitionDuration = 500; // ms

  const lines = text.split('\n');

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{ display: 'block' }}>
          {line.split('').map((char, charIndex) => {
            const delay = (lineIndex * line.length * charDelay) + (charIndex * charDelay);
            const isReady = startAnimation;

            return (
              <span
                key={`${lineIndex}-${charIndex}`}
                style={{
                  display: 'inline-block',
                  opacity: isReady ? 1 : 0,
                  transform: isReady ? 'translateX(0)' : 'translateX(-18px)',
                  transition: `opacity ${transitionDuration}ms ease-out ${delay}ms, transform ${transitionDuration}ms ease-out ${delay}ms`,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      ))}
    </h1>
  );
};

export default AnimatedHeading;
