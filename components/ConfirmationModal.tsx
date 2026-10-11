"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="finance-card w-full max-w-md p-6 space-y-4 shadow-xl">
        <div className="flex items-start gap-3">
          {isDestructive ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertTriangle size={20} />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <AlertTriangle size={20} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary !py-2 text-xs"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500"
                : "bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
