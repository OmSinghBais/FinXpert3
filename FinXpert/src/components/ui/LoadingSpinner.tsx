export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500`}
      />
    </div>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl bg-slate-900 p-8 shadow-2xl">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="mt-4 text-center text-sm text-slate-300">{message}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-2xl bg-slate-800/70 p-6 animate-pulse">
      <div className="h-4 w-32 bg-slate-700 rounded mb-4" />
      <div className="h-8 w-full bg-slate-700 rounded mb-2" />
      <div className="h-8 w-3/4 bg-slate-700 rounded" />
    </div>
  );
}

