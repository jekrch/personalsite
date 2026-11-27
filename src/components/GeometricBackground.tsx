import React, { useEffect, useRef } from 'react';

interface Pose {
  x: number;
  y: number;
  rotate: number;
}

// Ambient floating motion for each layer: sine waves at different
// frequencies, in px and degrees, over `t` seconds.
const ambient = (t: number): Pose[] => [
  {
    x: Math.sin(t * 0.3) * 8 + Math.cos(t * 0.17) * 4,
    y: Math.cos(t * 0.23) * 6 + Math.sin(t * 0.11) * 3,
    rotate: Math.sin(t * 0.09) * 0.3,
  },
  {
    x: Math.cos(t * 0.27) * 10 + Math.sin(t * 0.13) * 5,
    y: Math.sin(t * 0.19) * 8 + Math.cos(t * 0.31) * 4,
    rotate: Math.cos(t * 0.07) * 0.4,
  },
  {
    x: Math.sin(t * 0.21) * 6 + Math.cos(t * 0.29) * 3,
    y: Math.cos(t * 0.17) * 5 + Math.sin(t * 0.23) * 4,
    rotate: Math.sin(t * 0.11) * 0.25,
  },
];

// How far each layer moves per px of page scroll
const PARALLAX = [
  { x: 0.06, y: 0.04 },
  { x: -0.02, y: 0.065 },
  { x: 0.01, y: 0.025 },
];

// Share of the remaining distance to the target each layer covers per
// frame, as tuned at 60fps. Scaled by frame time below, so the layers glide
// at the same speed on 120Hz screens and through dropped frames.
const EASE = [0.03, 0.02, 0.04];

// Longest frame the easing will account for. A longer gap (a stalled main
// thread, or a tab coming back into view) eases on from where it stopped
// instead of jumping.
const MAX_FRAME_S = 0.1;

const GeometricBackground: React.FC = () => {
  const layers = useRef<(SVGGElement | null)[]>([]);

  // Transforms are written straight to the three layers each frame. This used
  // to go through React state, which re-rendered the component 60 times a
  // second for as long as the page was open.
  useEffect(() => {
    const isLocked = () => 'scrollLocked' in document.documentElement.dataset;
    let scrollY = isLocked() ? 0 : window.scrollY;
    const current: Pose[] = PARALLAX.map(() => ({ x: 0, y: 0, rotate: 0 }));
    // Seconds of ambient motion. Only advances while frames are drawn, so
    // the drift picks up where it left off when the tab is shown again.
    let clock = 0;
    let last: number | null = null;
    let frame = 0;

    const handleScroll = () => {
      // A modal pinning the page drops window.scrollY to 0 without the page
      // actually moving; ignore that so the shapes don't drift.
      if (isLocked()) return;
      scrollY = window.scrollY;
    };

    const tick = (now: number) => {
      const dt = last === null ? 1 / 60 : Math.min((now - last) / 1000, MAX_FRAME_S);
      last = now;
      clock += dt;
      const drift = ambient(clock);

      current.forEach((pose, i) => {
        const k = 1 - Math.pow(1 - EASE[i], dt * 60);
        pose.x += (scrollY * PARALLAX[i].x + drift[i].x - pose.x) * k;
        pose.y += (scrollY * PARALLAX[i].y + drift[i].y - pose.y) * k;
        pose.rotate += (drift[i].rotate - pose.rotate) * k;
        const g = layers.current[i];
        if (g) g.style.transform = `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg)`;
      });

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      last = null;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // Browsers mostly stop rAF in hidden tabs already; this makes it certain.
    const handleVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    if (!document.hidden) start();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, []);

  // iOS Safari 26 tints its status bar and toolbar from the fixed element at
  // each screen edge, and this layer covers both. With no background-color to
  // read, Safari snapshots whatever is painted there when it becomes the edge
  // element again (e.g. an overlay's dark canvas or pinned body as it closes)
  // and keeps that opaque band until reload. Safari skips a hidden fixed
  // container, so the wrapper is hidden and only the drawing is visible.
  return (
    <div className="fixed inset-0 -z-0 overflow-hidden pointer-events-none invisible">
      <svg
        className="absolute w-full h-full visible"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Large diagonal parallelogram */}
        <g
          ref={(el) => { layers.current[0] = el; }}
          style={{ transformOrigin: '750px 450px', willChange: 'transform' }}
        >
          <polygon
            points="200,-50 1500,400 300,950 0,500"
            fill="#5b8592"
            fillOpacity="0.08"
          />
          <line x1="180" y1="-50" x2="-20" y2="520" stroke="#5b8592" strokeWidth="2" strokeOpacity="0.12" />
          <line x1="220" y1="-50" x2="20" y2="520" stroke="#5b8592" strokeWidth="1.5" strokeOpacity="0.08" />
          <line x1="1320" y1="920" x2="1520" y2="380" stroke="#5b8592" strokeWidth="2" strokeOpacity="0.18" />
          <line x1="1280" y1="950" x2="1480" y2="410" stroke="#5b8592" strokeWidth="1.5" strokeOpacity="0.08" />
        </g>

        {/* Secondary smaller parallelogram - floatiest */}
        <g
          ref={(el) => { layers.current[1] = el; }}
          style={{ transformOrigin: '950px 110px', willChange: 'transform' }}
        >
          <polygon
            points="800,-80 1200,100 1100,300 700,120"
            fill="#5b8592"
            fillOpacity="0.1"
          />
          <line x1="790" y1="-80" x2="690" y2="120" stroke="#5b8592" strokeWidth="1.5" strokeOpacity="0.10" />
          <line x1="810" y1="-80" x2="710" y2="120" stroke="#5b8592" strokeWidth="1" strokeOpacity="0.06" />
        </g>

        {/* Third element - lower left */}
        <g
          ref={(el) => { layers.current[2] = el; }}
          style={{ transformOrigin: '100px 775px', willChange: 'transform' }}
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
