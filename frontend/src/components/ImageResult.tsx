"use client";

import { Download, ExternalLink } from "lucide-react";
import Image from "next/image";

interface Props {
  src: string;
  index?: number;
  label?: string;
}

const isDataUri = (s: string) => s.startsWith("data:");

export default function ImageResult({ src, index, label }: Props) {
  const handleDownload = async () => {
    const a = document.createElement("a");
    const ext = src.includes("webp") ? "webp" : "png";
    const filename = `nail-art-${(index ?? 0) + 1}.${ext}`;

    if (isDataUri(src)) {
      // data URI — download directly
      a.href = src;
      a.download = filename;
      a.click();
    } else {
      // remote URL — fetch then download
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        window.open(src, "_blank");
      }
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl transition-transform hover:scale-[1.02]">
      <div className="relative aspect-square w-full">
        <Image
          src={src}
          alt={label ?? `Nail art ${index}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Overlay actions */}
      <div className="absolute inset-0 flex items-end justify-end gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 via-transparent to-transparent">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow hover:bg-white transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Save
        </button>
        {!isDataUri(src) && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        )}
      </div>

      {label && (
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-xs text-white/80">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
