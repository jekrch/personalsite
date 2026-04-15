import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface WaterFlushProps {
  delayMs?: number;
  particleCount?: number;
  color?: string;
}

/**
 * A "mode" describes how the particles enter the scene:
 *   - throw-*: launched horizontally from off-screen (like a wave thrown in)
 *   - fall-*:  dropped in from above a side of the container
 *   - shoot-*: launched upward from the floor on a side of the container
 */
type Mode =
  | 'throw-left'
  | 'throw-right'
  | 'fall-left'
  | 'fall-right'
  | 'shoot-left'
  | 'shoot-right';

// --- tuning constants 

// Throw mode looks bad on ultrawide screens (particles travel too far),
// so we only allow it below this width.
const THROW_MAX_WIDTH = 1600;

// How long after start the particles fade to their resting opacity.
const FADE_DELAY_MS = 3000;

// Average per-particle velocity below which we consider the scene "settled".
const SETTLE_VELOCITY = 0.15;

// How many consecutive settled frames before we stop the physics runner
// (scrolling can wake it back up — see the scroll handler).
const SETTLE_FRAMES = 60;

const SVG_NS = 'http://www.w3.org/2000/svg';

const WALL_OPTS = { isStatic: true, restitution: 0.6, friction: 0.02 };
const PARTICLE_OPTS = {
  restitution: 0.65,
  friction: 0.01,
  frictionAir: 0.008,
  density: 0.0015,
};

// --- small utilities -

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const randomPick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const radiansToDegrees = (rad: number) => (rad * 180) / Math.PI;

// --- scene setup helpers 

const pickMode = (width: number): Mode => {
  const fallAndShoot: Mode[] = [
    'fall-left',
    'fall-right',
    'shoot-left',
    'shoot-right',
  ];
  const throws: Mode[] = ['throw-left', 'throw-right'];
  const available =
    width <= THROW_MAX_WIDTH ? [...throws, ...fallAndShoot] : fallAndShoot;
  return randomPick(available);
};

/**
 * Build the four static walls around the visible area. They're oversized and
 * nudged off-screen so particles can never clip through the corners.
 */
const buildWalls = (w: number, h: number) => ({
  top: Matter.Bodies.rectangle(w / 2, -20, w + 400, 40, WALL_OPTS),
  bottom: Matter.Bodies.rectangle(w / 2, h + 20, w + 400, 40, WALL_OPTS),
  left: Matter.Bodies.rectangle(-40, h / 2, 80, h + 200, WALL_OPTS),
  right: Matter.Bodies.rectangle(w + 40, h / 2, 80, h + 200, WALL_OPTS),
});

/**
 * Attach walls in an order that lets particles enter the scene before being
 * trapped. The deferred walls are the side (or top) that particles cross
 * through on their way in.
 */
const addWallsForMode = (
  world: Matter.World,
  walls: ReturnType<typeof buildWalls>,
  mode: Mode,
) => {
  const isFall = mode.startsWith('fall');
  const isShoot = mode.startsWith('shoot');

  if (isFall) {
    // Drop-in from above: add the ceiling only after particles are inside.
    Matter.World.add(world, [walls.bottom, walls.left, walls.right]);
    setTimeout(() => Matter.World.add(world, [walls.top]), 600);
  } else if (isShoot) {
    // Shoot-up from the floor: everything is sealed from the start.
    Matter.World.add(world, [walls.top, walls.bottom, walls.left, walls.right]);
  } else {
    // Throw-in from a side: add side walls only after particles fly in.
    Matter.World.add(world, [walls.top, walls.bottom]);
    setTimeout(() => Matter.World.add(world, [walls.left, walls.right]), 250);
  }
};

interface Spawn {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Compute the initial position and velocity for a single particle given the
 * current mode and container size. `s` is the particle's side length, used
 * only by `shoot-*` to place the particle just above the floor.
 */
const spawnParticle = (mode: Mode, w: number, h: number, s: number): Spawn => {
  // For "fall" and "shoot" we pin particles to the left or right third of the
  // scene so they come in as a cohesive splash rather than a uniform sheet.
  const leftSideX = () => randomBetween(0, w * 0.35);
  const rightSideX = () => randomBetween(w * 0.65, w);

  switch (mode) {
    case 'fall-left':
    case 'fall-right':
      return {
        x: mode === 'fall-left' ? leftSideX() : rightSideX(),
        y: -30 - Math.random() * 200, // start above the container
        vx: randomBetween(-1, 1),
        vy: randomBetween(6, 10), // downward
      };

    case 'shoot-left':
    case 'shoot-right': {
      const horizontalDir = mode === 'shoot-left' ? 1 : -1;
      return {
        x: mode === 'shoot-left' ? leftSideX() : rightSideX(),
        y: h - s / 2 - 2, // sitting on the floor
        vx: horizontalDir * randomBetween(3, 7),
        // Just enough upward velocity to reach the top of the container.
        vy: -(Math.sqrt(2 * h) + randomBetween(0, 4)),
      };
    }

    case 'throw-left':
    case 'throw-right': {
      const horizontalDir = mode === 'throw-right' ? -1 : 1;
      const offscreenX =
        mode === 'throw-right'
          ? w + 30 + randomBetween(0, 120)
          : -30 - randomBetween(0, 120);
      return {
        x: offscreenX,
        y: randomBetween(h * 0.15, h * 0.85),
        vx: horizontalDir * randomBetween(14, 22),
        vy: randomBetween(-3, 3),
      };
    }
  }
};

/**
 * Create `count` physics bodies plus a matching SVG rect for each. Returns
 * parallel arrays kept in index lock-step so the render loop can iterate
 * without allocating.
 */
const createParticles = (
  mode: Mode,
  w: number,
  h: number,
  count: number,
  color: string,
  group: SVGGElement,
) => {
  const baseSize = Math.max(3, Math.round(h * 0.14));
  const bodies: Matter.Body[] = new Array(count);
  const rects: SVGRectElement[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const size = baseSize * randomBetween(0.75, 1.35);
    const { x, y, vx, vy } = spawnParticle(mode, w, h, size);

    const body = Matter.Bodies.rectangle(x, y, size, size, PARTICLE_OPTS);
    Matter.Body.setVelocity(body, { x: vx, y: vy });
    Matter.Body.setAngularVelocity(body, randomBetween(-0.2, 0.2));
    bodies[i] = body;

    // The rect is centered on its own origin so we can animate it with a
    // single `transform="translate(x y) rotate(deg)"` each frame.
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', String(size));
    rect.setAttribute('height', String(size));
    rect.setAttribute('x', String(-size / 2));
    rect.setAttribute('y', String(-size / 2));
    rect.setAttribute('fill', color);
    group.appendChild(rect);
    rects[i] = rect;
  }

  return { bodies, rects };
};

// --- component -------

const WaterFlush = ({
  delayMs = 1000,
  particleCount = 90,
  color = '#5b8592',
}: WaterFlushProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // `started` gates the heavy physics effect so we can delay the splash until
  // after the host has mounted (and the parent has had its own entrance).
  const [started, setStarted] = useState(false);
  const [faded, setFaded] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // Measure the host and schedule the start / fade timers.
  useEffect(() => {
    if (!hostRef.current) return;
    const rect = hostRef.current.getBoundingClientRect();
    setSize({ w: Math.ceil(rect.width), h: Math.ceil(rect.height) });

    const startTimer = setTimeout(() => setStarted(true), delayMs);
    const fadeTimer = setTimeout(() => setFaded(true), delayMs + FADE_DELAY_MS);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(fadeTimer);
    };
  }, [delayMs]);

  // Run the physics simulation once we have a size and we've been started.
  useEffect(() => {
    if (!started || !size || !svgRef.current) return;

    const { w, h } = size;
    const { Engine, World, Body, Runner } = Matter;

    // 1. Engine + walls
    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 1.0;

    const mode = pickMode(w);
    const walls = buildWalls(w, h);
    addWallsForMode(engine.world, walls, mode);

    // 2. Particles (bodies + matching SVG rects)
    const group = svgRef.current.querySelector('g.water-bodies') as SVGGElement;
    while (group.firstChild) group.removeChild(group.firstChild);

    const { bodies, rects } = createParticles(
      mode,
      w,
      h,
      particleCount,
      color,
      group,
    );
    World.add(engine.world, bodies);

    // 3. Runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 4. Render loop
    //
    // Matter advances the simulation on its own runner; this rAF loop only
    // mirrors body state into SVG attributes. We also track the average
    // velocity so we can stop the runner once things visibly come to rest.
    let raf = 0;
    let settledFrames = 0;
    let stopped = false;

    const tick = () => {
      let totalVelocity = 0;

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const { x, y } = body.position;
        rects[i].setAttribute(
          'transform',
          `translate(${x} ${y}) rotate(${radiansToDegrees(body.angle)})`,
        );
        totalVelocity += Math.abs(body.velocity.x) + Math.abs(body.velocity.y);
      }

      if (stopped) return;

      const averageVelocity = totalVelocity / bodies.length;
      if (averageVelocity < SETTLE_VELOCITY) {
        settledFrames++;
        if (settledFrames > SETTLE_FRAMES) {
          Runner.stop(runner);
          stopped = true;
          return;
        }
      } else {
        settledFrames = 0;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // 5. Scroll interaction
    //
    // Scrolling "jostles" the particles by nudging their velocity opposite to
    // the scroll direction. If the scene had already settled, wake it back up.
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;

      // Clamp so a huge scroll delta can't launch particles off-screen.
      const kick = Math.max(-1.2, Math.min(1.2, dy * 0.05));

      for (const body of bodies) {
        Body.setVelocity(body, {
          x: body.velocity.x + randomBetween(-0.1, 0.1),
          y: body.velocity.y - kick,
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

    // 6. Teardown
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
