"use client";

import { clsx } from "clsx";
import {
  NAIL_COLORS,
  NAIL_SHAPES,
  NAIL_STYLES,
  NAIL_TEXTURES,
  NailOptions,
} from "@/lib/types";

interface Props {
  options: NailOptions;
  onChange: (opts: NailOptions) => void;
  showQuality?: boolean;
  showOutputCount?: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

function ChipGroup<T extends string>({
  items,
  value,
  onSelect,
}: {
  items: { value: T; label: string }[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onSelect(item.value)}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs font-medium transition-all",
            value === item.value
              ? "border-rose-500 bg-rose-500/20 text-rose-300 shadow shadow-rose-500/20"
              : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function NailCustomizer({ options, onChange, showQuality = true, showOutputCount = true }: Props) {
  const set = <K extends keyof NailOptions>(key: K, val: NailOptions[K]) =>
    onChange({ ...options, [key]: val });

  return (
    <div className="space-y-5">
      {/* Shape */}
      <div>
        <SectionLabel>Nail Shape</SectionLabel>
        <ChipGroup
          items={NAIL_SHAPES}
          value={options.shape}
          onSelect={(v) => set("shape", v)}
        />
      </div>

      {/* Style */}
      <div>
        <SectionLabel>Style</SectionLabel>
        <ChipGroup
          items={NAIL_STYLES}
          value={options.style}
          onSelect={(v) => set("style", v)}
        />
      </div>

      {/* Texture */}
      <div>
        <SectionLabel>Texture / Finish</SectionLabel>
        <ChipGroup
          items={NAIL_TEXTURES}
          value={options.texture}
          onSelect={(v) => set("texture", v)}
        />
      </div>

      {/* Color */}
      <div>
        <SectionLabel>Color</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {NAIL_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => set("color", c.value)}
              className={clsx(
                "group relative h-8 w-8 rounded-full border-2 transition-all",
                options.color === c.value
                  ? "border-white scale-110 shadow-lg"
                  : "border-transparent hover:scale-105"
              )}
              style={{ background: c.hex }}
            >
              <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom prompt */}
      <div>
        <SectionLabel>Custom Prompt (optional)</SectionLabel>
        <textarea
          value={options.customPrompt}
          onChange={(e) => set("customPrompt", e.target.value)}
          placeholder="e.g. Valentine's Day theme, cherry blossom, stars..."
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-rose-500/60 focus:outline-none focus:ring-1 focus:ring-rose-500/30 resize-none"
        />
      </div>

      {/* Output count */}
      {showOutputCount && (
        <div>
          <SectionLabel>Number of Images</SectionLabel>
          <div className="flex gap-2">
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set("numOutputs", n)}
                className={clsx(
                  "rounded-lg border px-4 py-1.5 text-sm font-medium transition-all",
                  options.numOutputs === n
                    ? "border-rose-500 bg-rose-500/20 text-rose-300"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quality */}
      {showQuality && (
        <div>
          <SectionLabel>Quality</SectionLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => set("quality", "schnell")}
              className={clsx(
                "rounded-lg border px-4 py-1.5 text-sm font-medium transition-all",
                options.quality === "schnell"
                  ? "border-rose-500 bg-rose-500/20 text-rose-300"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
              )}
            >
              Fast
            </button>
            <button
              type="button"
              onClick={() => set("quality", "dev")}
              className={clsx(
                "rounded-lg border px-4 py-1.5 text-sm font-medium transition-all",
                options.quality === "dev"
                  ? "border-rose-500 bg-rose-500/20 text-rose-300"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
              )}
            >
              High Quality
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
