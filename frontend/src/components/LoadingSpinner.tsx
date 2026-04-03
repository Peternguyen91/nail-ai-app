"use client";

export default function LoadingSpinner({ text = "Generating..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      {/* Animated ring */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-rose-500" />
        <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-purple-400 [animation-direction:reverse] [animation-duration:0.8s]" />
      </div>
      <p className="text-sm text-white/60 animate-pulse">{text}</p>
    </div>
  );
}
