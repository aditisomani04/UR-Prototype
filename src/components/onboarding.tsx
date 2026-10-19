import { useState } from "react";
import { CalendarDays, MapPin, Warehouse, LifeBuoy, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language";

/** Placeholder IT support contact for the prototype — replace with the real details. */
export const IT_SUPPORT = { phone: "+1 (800) 555-0126", email: "support@urdriver.example" };

/*
 * First-time driver walkthrough: 3 screens (Trips → Stops → Return to branch).
 * Shown once per driver after their first sign-in; stored per driver id in
 * localStorage ("driver-onboarded-<id>"). Fully skippable. Decorative motion
 * sits under prefers-reduced-motion (see styles.css onboarding keyframes).
 */
export function hasSeenOnboarding(driverId: string): boolean {
  try { return localStorage.getItem(`driver-onboarded-${driverId}`) === "1"; } catch { return true; }
}

export function Onboarding({ driverName, onDone }: { driverName: string; onDone: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const screens = [
    {
      icon: CalendarDays,
      title: t("Your trips"),
      body: t("Pick a day to see its trips. Start with the one marked Next up."),
    },
    {
      icon: MapPin,
      title: t("Work the stops"),
      body: t("Open each stop to see the address, equipment, and site notes. Mark it complete or report an issue."),
    },
    {
      icon: Warehouse,
      title: t("Back to branch"),
      body: t("When every stop is handled, confirm your return to the branch to finish the trip."),
    },
    {
      icon: LifeBuoy,
      title: t("Need help? Contact IT"),
      body: t("Facing an issue with the app? Raise a ticket with the IT support team."),
    },
  ];
  const screen = screens[step] ?? screens[0]!;
  const last = step === screens.length - 1;
  const finish = () => {
    onDone();
  };
  const Icon = screen.icon;
  return (
    <div role="dialog" aria-modal="true" aria-label={t("Welcome tour")} className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 pt-5">
        <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{t("{step} of {total}", { step: step + 1, total: screens.length })}</p>
        <button onClick={finish} className="min-h-11 px-3 text-sm font-semibold text-muted-foreground">{t("Skip")}</button>
      </div>
      <div key={step} className="onboarding-screen flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="onboarding-icon h-24 w-24 rounded-3xl bg-primary text-primary-foreground grid place-items-center">
          <Icon className="size-12" aria-hidden="true" />
        </div>
        <div>
          {step === 0 && <p className="text-sm font-semibold text-muted-foreground mb-1">{t("Welcome, {name}!", { name: driverName })}</p>}
          <h2 className="text-2xl font-extrabold tracking-tight">{screen.title}</h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">{screen.body}</p>
          {step === screens.length - 1 && (
            <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
              <a href={`tel:${IT_SUPPORT.phone.replace(/[^+\d]/g, "")}`} className="min-h-12 rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold">📞 {IT_SUPPORT.phone}</a>
              <a href={`mailto:${IT_SUPPORT.email}?subject=${encodeURIComponent("Driver app issue — ticket request")}`} className="min-h-12 rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold">🎫 {t("Raise a ticket")}</a>
              <p className="text-xs text-muted-foreground">{IT_SUPPORT.email}</p>
            </div>
          )}
        </div>
      </div>
      <div className="px-6 pb-8 flex flex-col gap-4">
        <div className="flex justify-center gap-2" aria-hidden="true">
          {screens.map((_, i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-border"}`} />
          ))}
        </div>
        <button
          onClick={() => (last ? finish() : setStep((s) => s + 1))}
          className="min-h-14 rounded-lg bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2"
        >
          {last ? t("Get started") : t("Next")}
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
