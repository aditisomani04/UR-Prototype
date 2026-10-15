import { useEffect, useMemo, useRef } from "react";
import { useLanguage } from "@/lib/language";

// Decorative-only celebration shown when a driver confirms arrival at the branch.
// Colours come from the semantic design tokens so it stays correct in dark mode.
const palette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-delivery)",
  "var(--color-pickup)",
] as const;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)] as T;

export function Celebration({ onDismiss }: { onDismiss: () => void }) {
  const { t: tr } = useLanguage();

  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        left: rand(0, 100),
        delay: rand(0, 1.6),
        duration: rand(2.2, 4.4),
        drift: rand(-90, 90),
        spin: rand(360, 900),
        width: rand(6, 12),
        height: rand(8, 16),
        round: Math.random() < 0.3,
        color: pick(palette),
      })),
    [],
  );

  const balloons = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        left: 4 + i * 11 + rand(-3, 3),
        delay: rand(0, 1.8),
        duration: rand(4.2, 7.5),
        sway: rand(1.6, 3.2),
        scale: rand(0.75, 1.25),
        color: pick(palette),
      })),
    [],
  );

  // Auto-dismiss keeps the screen free for the next action; the handler is kept in a
  // ref so a new inline callback from the parent never restarts the timer.
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss.current(), 5200);
    try {
      navigator.vibrate?.([30, 50, 30]);
    } catch {
      /* Haptics are unsupported on some devices. */
    }
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="status" aria-live="polite" onClick={onDismiss}>
      <div className="absolute inset-0 bg-background/70" />

      <div className="absolute inset-0" aria-hidden="true">
        {balloons.map((b, i) => (
          <span
            key={`balloon-${i}`}
            className="celebrate-balloon"
            style={
              {
                left: `${b.left}%`,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.duration}s`,
                "--celebrate-scale": b.scale,
              } as React.CSSProperties
            }
          >
            <span className="celebrate-balloon-sway" style={{ animationDuration: `${b.sway}s` }}>
              <span className="celebrate-balloon-body" style={{ color: b.color }}>
                <span className="celebrate-balloon-string" />
              </span>
            </span>
          </span>
        ))}

        {pieces.map((p, i) => (
          <span
            key={`piece-${i}`}
            className="celebrate-piece"
            style={
              {
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                "--celebrate-drift": `${p.drift}px`,
                "--celebrate-spin": `${p.spin}deg`,
              } as React.CSSProperties
            }
          >
            <span
              className="celebrate-piece-body"
              style={{
                color: p.color,
                background: p.color,
                width: `${p.width}px`,
                height: `${p.height}px`,
                borderRadius: p.round ? "9999px" : "2px",
              }}
            />
          </span>
        ))}
      </div>

      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="celebrate-card w-full max-w-xs rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
          <span className="text-5xl" aria-hidden="true">
            🎉
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-card-foreground">{tr("Trip complete!")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tr("Nice work — every stop is handled.")}</p>
          <button onClick={onDismiss} className="mt-5 h-12 w-full rounded-lg bg-primary text-primary-foreground font-bold">
            {tr("Done")}
          </button>
        </div>
      </div>
    </div>
  );
}
