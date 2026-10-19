import { useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/language";
import { Balloon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CelebrationSummary } from "@/lib/celebration-summary";

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

export function Celebration({ summary, onDismiss }: { summary: CelebrationSummary; onDismiss: () => void }) {
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

  // Keep the summary visible until dismissed so drivers have time to read totals.
  useEffect(() => {
    try {
      navigator.vibrate?.([30, 50, 30]);
    } catch {
      /* Haptics are unsupported on some devices. */
    }
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
        <div className="celebrate-card w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-lg border border-border bg-card p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="relative mx-auto w-fit text-primary" aria-hidden="true">
            <Balloon className="size-16" strokeWidth={1.5} />
            <Check className="absolute right-0 top-0 size-6 rounded-full bg-success p-1 text-success-foreground" />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-card-foreground">{tr(summary.dayComplete ? "Day complete!" : "Trip complete!")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tr(summary.dayComplete ? "All trips handled — back at branch." : "Nice work — every stop is handled.")}</p>
          <dl className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border py-4">
            {[
              { label: "Delivered", count: summary.delivered, color: "text-primary" },
              { label: "Picked up", count: summary.pickedUp, color: "text-success" },
              { label: "Reported", count: summary.reported, color: "text-accent-foreground" },
            ].map((item) => <div key={item.label} className="min-w-0 px-1"><dd className={`text-3xl font-extrabold ${item.color}`}>{item.count}</dd><dt className="mt-1 text-xs font-semibold text-card-foreground break-words">{tr(item.label)}</dt></div>)}
          </dl>
          {summary.dayComplete && <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-primary"><Balloon className="size-5 shrink-0" aria-hidden="true" />{tr("Day accomplished")}</p>}
          <Button autoFocus onClick={onDismiss} className="mt-5 h-12 w-full rounded-lg font-bold">
            {tr("Done")}
          </Button>
        </div>
      </div>
    </div>
  );
}
