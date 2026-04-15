import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface WaterFlushProps {
  delayMs?: number;
  particleCount?: number;
  color?: string;
}

const WaterFlush = ({
  delayMs = 1000,
  particleCount = 90,
  color = '#5b8592',
}: WaterFlushProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [started, setStarted] = useState(false);
  const [faded, setFaded] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const rect = hostRef.current.getBoundingClientRect();
    setSize({ w: Math.ceil(rect.width), h: Math.ceil(rect.height) });
    const t = setTimeout(() => setStarted(true), delayMs);
    const f = setTimeout(() => setFaded(true), delayMs + 3000);
    return () => {
      clearTimeout(t);
      clearTimeout(f);
    };
  }, [delayMs]);

  useEffect(() => {
    if (!started || !size || !svgRef.current) return;

    const { w, h } = size;
    const { Engine, World, Bodies, Body, Runner } = Matter;

    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 1.0;

    const modes = ['throw-left', 'throw-right', 'fall-left', 'fall-right'] as const;
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const isFall = mode === 'fall-left' || mode === 'fall-right';

    const wallOpts = { isStatic: true, restitution: 0.6, friction: 0.02 };
    const topWall = Bodies.rectangle(w / 2, -20, w + 400, 40, wallOpts);
    const botWall = Bodies.rectangle(w / 2, h + 20, w + 400, 40, wallOpts);
    const rightWall = Bodies.rectangle(w + 40, h / 2, 80, h + 200, wallOpts);
    const leftWall = Bodies.rectangle(-40, h / 2, 80, h + 200, wallOpts);
    if (isFall) {
      World.add(engine.world, [botWall, leftWall, rightWall]);
      setTimeout(() => World.add(engine.world, [topWall]), 600);
    } else {
      World.add(engine.world, [topWall, botWall]);
      setTimeout(() => World.add(engine.world, [leftWall, rightWall]), 250);
    }

    const dir = mode === 'throw-right' ? -1 : 1;
    const baseSize = Math.max(3, Math.round(h * 0.14));
    const sizes: number[] = [];
    const particles: Matter.Body[] = [];
    for (let i = 0; i < particleCount; i++) {
      const s = baseSize * (0.75 + Math.random() * 0.6);
      sizes.push(s);
      let px: number;
      let py: number;
      let vx: number;
      let vy: number;
      if (isFall) {
        const sideX = mode === 'fall-left'
          ? Math.random() * w * 0.35
          : w * 0.65 + Math.random() * w * 0.35;
        px = sideX;
        py = -30 - Math.random() * 200;
        vx = (Math.random() - 0.5) * 2;
        vy = 6 + Math.random() * 4;
      } else {
        px = mode === 'throw-right'
          ? w + 30 + Math.random() * 120
          : -30 - Math.random() * 120;
        py = h * 0.15 + Math.random() * h * 0.7;
        vx = dir * (14 + Math.random() * 8);
        vy = (Math.random() - 0.5) * 6;
      }
      const body = Bodies.rectangle(px, py, s, s, {
        restitution: 0.65,
        friction: 0.01,
        frictionAir: 0.008,
        density: 0.0015,
      });
      Body.setVelocity(body, { x: vx, y: vy });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);
      particles.push(body);
    }
    World.add(engine.world, particles);

    const svgNS = 'http://www.w3.org/2000/svg';
    const group = svgRef.current.querySelector('g.water-bodies') as SVGGElement;
    while (group.firstChild) group.removeChild(group.firstChild);
    const rects: SVGRectElement[] = particles.map((_, i) => {
      const s = sizes[i];
      const el = document.createElementNS(svgNS, 'rect');
      el.setAttribute('width', String(s));
      el.setAttribute('height', String(s));
      el.setAttribute('x', String(-s / 2));
      el.setAttribute('y', String(-s / 2));
      el.setAttribute('fill', color);
      group.appendChild(el);
      return el;
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    let raf = 0;
    let settledFrames = 0;
    let stopped = false;
    const tick = () => {
      let totalV = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        rects[i].setAttribute(
          'transform',
          `translate(${p.position.x} ${p.position.y}) rotate(${(p.angle * 180) / Math.PI})`
        );
        totalV += Math.abs(p.velocity.x) + Math.abs(p.velocity.y);
      }
      if (!stopped) {
        if (totalV / particles.length < 0.15) {
          settledFrames++;
          if (settledFrames > 60) {
            Runner.stop(runner);
            stopped = true;
          }
        } else {
          settledFrames = 0;
        }
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const kick = Math.max(-1.2, Math.min(1.2, dy * 0.05));
      for (const p of particles) {
        Body.setVelocity(p, {
          x: p.velocity.x + (Math.random() - 0.5) * 0.2,
          y: p.velocity.y - kick,
        });
      }
      if (stopped) {
        Runner.run(runner, engine);
        stopped = false;
        settledFrames = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      while (group.firstChild) group.removeChild(group.firstChild);
    };
  }, [started, size, particleCount, color]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      {started && size && (
        <svg
          ref={svgRef}
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ position: 'absolute', inset: 0 }}
        >
          <g
            className="water-bodies"
            style={{
              opacity: faded ? 0.25 : 0.7,
              transition: 'opacity 1.2s ease-out',
            }}
          />
        </svg>
      )}
    </div>
  );
};

export default WaterFlush;
