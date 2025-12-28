import React, { useEffect, useRef, useState } from 'react';

const GeometricBackground: React.FC = () => {
  const [positions, setPositions] = useState({
    layer1: { x: 0, y: 0, rotate: 0 },
    layer2: { x: 0, y: 0, rotate: 0 },
    layer3: { x: 0, y: 0, rotate: 0 },
  });

  const scrollY = useRef(0);
  const startTime = useRef(Date.now());
  const currentPositions = useRef({
    layer1: { x: 0, y: 0, rotate: 0 },
    layer2: { x: 0, y: 0, rotate: 0 },
    layer3: { x: 0, y: 0, rotate: 0 },
  });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    const lerp = (current: number, target: number, ease: number) => {
      return current + (target - current) * ease;
    };

    const animate = () => {
      const scroll = scrollY.current;
      const elapsed = (Date.now() - startTime.current) / 1000;

      // Ambient floating motion using sine waves at different frequencies
      const ambient = {
        layer1: {
          x: Math.sin(elapsed * 0.3) * 8 + Math.cos(elapsed * 0.17) * 4,
          y: Math.cos(elapsed * 0.23) * 6 + Math.sin(elapsed * 0.11) * 3,
          rotate: Math.sin(elapsed * 0.09) * 0.3,
        },
        layer2: {
          x: Math.cos(elapsed * 0.27) * 10 + Math.sin(elapsed * 0.13) * 5,
          y: Math.sin(elapsed * 0.19) * 8 + Math.cos(elapsed * 0.31) * 4,
          rotate: Math.cos(elapsed * 0.07) * 0.4,
        },
        layer3: {
          x: Math.sin(elapsed * 0.21) * 6 + Math.cos(elapsed * 0.29) * 3,
          y: Math.cos(elapsed * 0.17) * 5 + Math.sin(elapsed * 0.23) * 4,
          rotate: Math.sin(elapsed * 0.11) * 0.25,
        },
      };

      // Combine scroll parallax with ambient motion
      const targets = {
        layer1: {
          x: scroll * 0.015 + ambient.layer1.x,
          y: scroll * 0.04 + ambient.layer1.y,
          rotate: ambient.layer1.rotate,
        },
        layer2: {
          x: scroll * -0.02 + ambient.layer2.x,
          y: scroll * 0.065 + ambient.layer2.y,
          rotate: ambient.layer2.rotate,
        },
        layer3: {
          x: scroll * 0.01 + ambient.layer3.x,
          y: scroll * 0.025 + ambient.layer3.y,
          rotate: ambient.layer3.rotate,
        },
      };

      const ease1 = 0.03;
      const ease2 = 0.02;
      const ease3 = 0.04;

      const current = currentPositions.current;

      current.layer1.x = lerp(current.layer1.x, targets.layer1.x, ease1);
      current.layer1.y = lerp(current.layer1.y, targets.layer1.y, ease1);
      current.layer1.rotate = lerp(current.layer1.rotate, targets.layer1.rotate, ease1);
      current.layer2.x = lerp(current.layer2.x, targets.layer2.x, ease2);
      current.layer2.y = lerp(current.layer2.y, targets.layer2.y, ease2);
      current.layer2.rotate = lerp(current.layer2.rotate, targets.layer2.rotate, ease2);
      current.layer3.x = lerp(current.layer3.x, targets.layer3.x, ease3);
      current.layer3.y = lerp(current.layer3.y, targets.layer3.y, ease3);
      current.layer3.rotate = lerp(current.layer3.rotate, targets.layer3.rotate, ease3);

      setPositions({
        layer1: { ...current.layer1 },
        layer2: { ...current.layer2 },
        layer3: { ...current.layer3 },
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Large diagonal parallelogram */}
        <g
          style={{
            transform: `translate(${positions.layer1.x}px, ${positions.layer1.y}px) rotate(${positions.layer1.rotate}deg)`,
            transformOrigin: '750px 450px',
            willChange: 'transform',
          }}
        >
          <polygon
            points="200,-50 1500,400 300,950 0,500"
            fill="#5b8592"
            fillOpacity="0.05"
          />
          <line x1="180" y1="-50" x2="-20" y2="520" stroke="#5b8592" strokeWidth="2" strokeOpacity="0.12" />
          <line x1="220" y1="-50" x2="20" y2="520" stroke="#5b8592" strokeWidth="1.5" strokeOpacity="0.08" />
          <line x1="1320" y1="920" x2="1520" y2="380" stroke="#5b8592" strokeWidth="2" strokeOpacity="0.12" />
          <line x1="1280" y1="950" x2="1480" y2="410" stroke="#5b8592" strokeWidth="1.5" strokeOpacity="0.08" />
        </g>

        {/* Secondary smaller parallelogram - floatiest */}
        <g
          style={{
            transform: `translate(${positions.layer2.x}px, ${positions.layer2.y}px) rotate(${positions.layer2.rotate}deg)`,
            transformOrigin: '950px 110px',
            willChange: 'transform',
          }}
        >
          <polygon
            points="800,-80 1200,100 1100,300 700,120"
            fill="#5b8592"
            fillOpacity="0.025"
          />
          <line x1="790" y1="-80" x2="690" y2="120" stroke="#5b8592" strokeWidth="1.5" strokeOpacity="0.10" />
          <line x1="810" y1="-80" x2="710" y2="120" stroke="#5b8592" strokeWidth="1" strokeOpacity="0.06" />
        </g>

        {/* Third element - lower left */}
        <g
          style={{
            transform: `translate(${positions.layer3.x}px, ${positions.layer3.y}px) rotate(${positions.layer3.rotate}deg)`,
            transformOrigin: '100px 775px',
            willChange: 'transform',
          }}
        >
          <polygon
            points="-100,600 400,750 300,950 -200,800"
            fill="#5b8592"
            fillOpacity="0.025"
          />
          <line x1="410" y1="750" x2="310" y2="950" stroke="#5b8592" strokeWidth="1.5" strokeOpacity="0.10" />
          <line x1="390" y1="750" x2="290" y2="950" stroke="#5b8592" strokeWidth="1" strokeOpacity="0.06" />
        </g>
      </svg>
    </div>
  );
};

export default GeometricBackground;