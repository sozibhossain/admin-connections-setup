"use client";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy,
  tone = "danger",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  tone?: "danger" | "default";
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-md rounded-[28px] border border-[#e5d5b3] bg-white p-6 shadow-[0_28px_70px_rgba(0,0,0,0.18)]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a07a2d]">
          Confirmation
        </div>
        <h3 className="mt-2 text-2xl font-semibold text-[#2f2a21]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#7b6a48]">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full border border-[#dfc58d] bg-[#fff8e7] px-5 py-2.5 text-sm font-semibold text-[#6d5526] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
              tone === "danger"
                ? "bg-[#9f2b2b] hover:bg-[#842222]"
                : "bg-[#2f2a21] hover:bg-[#443827]"
            }`}
          >
            {busy ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
