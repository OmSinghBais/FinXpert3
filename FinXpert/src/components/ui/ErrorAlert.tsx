"use client";

import { X } from "lucide-react";

export function ErrorAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-200">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-rose-100">Error</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-lg p-1 transition hover:bg-rose-500/20"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function SuccessAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-emerald-200">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-emerald-100">Success</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-lg p-1 transition hover:bg-emerald-500/20"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

