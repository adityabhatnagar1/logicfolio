// Mount the original Lighthouse scene with responsive, pixel-exact rendering.
// The original 540x960 artwork and fragment shader effects remain unchanged.
import Lighthouse from "./shader/lighthouse.js";

interface LighthouseInstance {
  S: Record<string, unknown>;
  playing: boolean;
  dirty: boolean;
  minDt: number;
  draw(): void;
  start(): void;
  stop(): void;
  setView(w: number, h: number, ox: number, oy: number): void;
}

interface LighthouseApi {
  mount(
    canvas: HTMLCanvasElement,
    options?: {
      fit?: false;
      settings?: Record<string, unknown>;
      onError?: (error: Error) => void;
    },
  ): LighthouseInstance;
}

const api = Lighthouse as unknown as LighthouseApi;

const MAP_W = 540;
const MAP_H = 960;

// Artwork-space anchor, not a screen-resolution assumption.
const FOCUS = { x: 238, y: 520 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Your exact requested shader settings.
const SHADER_SETTINGS: Record<string, unknown> = {
  speed: 2,
  angle: 301.47,
  width: 0.95,
  intensity: 0.42,
  pattern: "noise",
  beamOn: true,
  wavesOn: true,
  ripples: true,
  birds: true,
  waveSpeed: 1.8,
  waveScale: 1,
  waveDots: 0.55,
  dark: "#000000",
  light: "#ffffff",
  beamTint: true,
  beamColor: "#ffd9a0",
};

export function mountLighthouseHero(
  canvas: HTMLCanvasElement,
  plate: HTMLElement,
  figure: HTMLElement,
): void {
  const fallback = () => {
    canvas.hidden = true;
    figure.dataset.state = "static";
  };

  let lh: LighthouseInstance;

  try {
    lh = api.mount(canvas, {
      fit: false,
      settings: SHADER_SETTINGS,
      onError: fallback,
    });
  } catch {
    fallback();
    return;
  }

  // This controller owns the animation loop.
  lh.stop();
  lh.minDt = 0;

  let lastKey = "";
  let queued = 0;

  const layout = () => {
    const cssW = plate.clientWidth;
    const cssH = plate.clientHeight;

    if (!cssW || !cssH) return;

    // Measure the actual displayed element and physical pixel density.
    const dpr = window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;

    const devW = Math.max(1, Math.ceil(cssW * dpr));
    const devH = Math.max(1, Math.ceil(cssH * dpr));

    // Choose a whole-number physical pixel scale.
    // This adapts to the actual viewport instead of a hardcoded
    // phone/desktop size or a fixed 1080p/4K resolution.
    const scale = Math.max(1, Math.ceil(Math.max(devW / MAP_W, devH / MAP_H)));

    const vw = clamp(Math.ceil(devW / scale), 1, MAP_W);

    const vh = clamp(Math.ceil(devH / scale), 1, MAP_H);

    // Crop around the lighthouse and shoreline.
    const ox = clamp(Math.round(FOCUS.x - vw / 2), 0, MAP_W - vw);

    const oy = clamp(Math.round(FOCUS.y - vh / 2), 0, MAP_H - vh);

    const key = `${devW}x${devH}:${vw}x${vh}` + `@${ox},${oy}/${scale}/${dpr}`;

    if (key === lastKey) return;
    lastKey = key;

    // Align each rendered art pixel to a whole number of physical pixels.
    canvas.style.width = `${(vw * scale) / dpr}px`;
    canvas.style.height = `${(vh * scale) / dpr}px`;
    canvas.style.imageRendering = "pixelated";

    // Resize the WebGL backing store and update the visible source region.
    lh.setView(vw, vh, ox, oy);
  };

  const queueLayout = () => {
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(layout);
  };

  // Respond to container changes, not just window resize events.
  const resizeObserver = new ResizeObserver(queueLayout);
  resizeObserver.observe(plate);

  window.addEventListener("resize", queueLayout, {
    passive: true,
  });

  // Detect device-pixel-ratio changes when moving between displays.
  let dprQuery: MediaQueryList | null = null;

  const watchDpr = () => {
    dprQuery?.removeEventListener("change", onDprChange);

    dprQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );

    dprQuery.addEventListener("change", onDprChange, { once: true });
  };

  const onDprChange = () => {
    watchDpr();
    queueLayout();
  };

  watchDpr();

  layout();
  figure.dataset.state = "live";

  // Pause when offscreen, in a hidden tab, or when reduced motion is requested.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let visible = true;
  let running = false;

  const sync = () => {
    const shouldRun = visible && !document.hidden && !reduced.matches;

    lh.playing = shouldRun;

    if (shouldRun && !running) {
      lh.start();
      running = true;
    } else if (!shouldRun && running) {
      lh.stop();
      running = false;
    }
  };

  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1]?.isIntersecting ?? true;

    sync();
  });

  visibilityObserver.observe(plate);

  const onReducedMotionChange = () => {
    sync();
    lh.draw();
  };

  // The theme must not overwrite your explicit black-and-white palette.
  const onThemeChange = () => {
    lh.dirty = true;
    lh.draw();
  };

  document.addEventListener("visibilitychange", sync);

  reduced.addEventListener("change", onReducedMotionChange);

  document.addEventListener("themechange", onThemeChange);

  // Clean up if the document is permanently unloaded.
  const cleanup = () => {
    cancelAnimationFrame(queued);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();

    window.removeEventListener("resize", queueLayout);

    dprQuery?.removeEventListener("change", onDprChange);

    document.removeEventListener("visibilitychange", sync);

    document.removeEventListener("themechange", onThemeChange);

    reduced.removeEventListener("change", onReducedMotionChange);

    lh.stop();
  };

  window.addEventListener("pagehide", (event: PageTransitionEvent) => {
    if (!event.persisted) cleanup();
  });

  sync();
}
