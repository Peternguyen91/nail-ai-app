"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import NailCustomizer from "@/components/NailCustomizer";
import ImageResult from "@/components/ImageResult";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProviderBadge from "@/components/ProviderBadge";
import { generateNailArt } from "@/lib/api";
import { NailOptions } from "@/lib/types";

const DEFAULT_OPTIONS: NailOptions = {
  style: "French",
  shape: "oval",
  texture: "glossy",
  color: "dusty rose pink",
  customPrompt: "",
  numOutputs: 4,
  quality: "schnell",
};

export default function GeneratePage() {
  const [options, setOptions] = useState<NailOptions>(DEFAULT_OPTIONS);
  const [images, setImages]   = useState<string[]>([]);
  const [promptUsed, setPromptUsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setImages([]);
    try {
      const res = await generateNailArt(options);
      setImages(res.images);
      setPromptUsed(res.prompt_used);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Nail Generator</h1>
            <p className="mt-1 text-sm text-white/50">
              Customize options and let AI create your perfect nail art
            </p>
          </div>
          <ProviderBadge />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* ─── Left: customizer panel ─── */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sticky top-24">
              <NailCustomizer options={options} onChange={setOptions} />

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "Generating..." : "Generate Nail Art"}
              </button>
            </div>
          </aside>

          {/* ─── Right: results ─── */}
          <section className="flex-1">
            {loading && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <LoadingSpinner text="AI is creating your nail art..." />
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            {images.length > 0 && !loading && (
              <div className="space-y-4 animate-fade-in">
                {/* Prompt used */}
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Prompt used</p>
                  <p className="text-sm text-white/70 leading-relaxed">{promptUsed}</p>
                </div>

                {/* Grid */}
                <div className={`grid gap-4 ${images.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-2"}`}>
                  {images.map((src, i) => (
                    <ImageResult key={i} src={src} index={i + 1} label={`#${i + 1}`} />
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all"
                >
                  Generate again
                </button>
              </div>
            )}

            {images.length === 0 && !loading && !error && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
                  <Sparkles className="h-8 w-8 text-rose-400" />
                </div>
                <p className="text-white/60 font-medium">Your nail art will appear here</p>
                <p className="text-sm text-white/30 mt-1">Choose your options and click Generate</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
