import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";

/** On-screen customer signature. Saves a small PNG data URL plus the signer's name. */
export function SignaturePad({ signature, signerName, onChange }: {
  signature?: string | undefined;
  signerName?: string | undefined;
  onChange: (patch: { signature?: string | undefined; signerName?: string | undefined }) => void;
}) {
  const { t: tr } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || signature) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(c).color;
  }, [signature]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
    dirty.current = true;
    setHasInk(true);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const up = () => { drawing.current = false; };

  const clear = () => {
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
    setHasInk(false);
  };
  const save = () => {
    const c = canvasRef.current;
    if (!c || !dirty.current) return;
    // Downscale to keep saved progress small.
    const out = document.createElement("canvas");
    out.width = 480;
    out.height = Math.round((480 * c.height) / c.width);
    out.getContext("2d")?.drawImage(c, 0, 0, out.width, out.height);
    onChange({ signature: out.toDataURL("image/png") });
  };

  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
      <p className="text-xs uppercase font-bold tracking-wide">{tr("✍ Customer signature")}</p>
      <input
        value={signerName ?? ""}
        onChange={(e) => onChange({ signerName: e.target.value || undefined })}
        placeholder={tr("Customer name (printed)")}
        aria-label={tr("Customer name (printed)")}
        className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
      />
      {signature ? (
        <>
          <img src={signature} alt={tr("Customer signature")} className="w-full h-36 object-contain rounded-lg border border-border bg-card" />
          <p className="text-sm font-bold text-success">{tr("✓ Signed")}</p>
          <button type="button" onClick={() => onChange({ signature: undefined })} className="h-11 rounded-lg border border-border bg-card font-bold text-sm">{tr("Clear & sign again")}</button>
        </>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label={tr("Sign here")}
            className="w-full h-36 rounded-lg border-2 border-dashed border-input bg-card text-foreground touch-none"
          />
          <p className="text-xs text-muted-foreground">{tr("Hand the phone to the customer to sign with a finger.")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={clear} disabled={!hasInk} className="h-11 rounded-lg border border-border bg-card font-bold text-sm disabled:opacity-40">{tr("Clear")}</button>
            <button type="button" onClick={save} disabled={!hasInk} className="h-11 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm disabled:opacity-40">{tr("Save signature")}</button>
          </div>
        </>
      )}
    </div>
  );
}
