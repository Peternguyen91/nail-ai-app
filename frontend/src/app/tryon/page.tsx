"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Hand } from "lucide-react";
import Image from "next/image";
import NailCustomizer from "@/components/NailCustomizer";
import ImageResult from "@/components/ImageResult";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProviderBadge from "@/components/ProviderBadge";
import { virtualTryOn } from "@/lib/api";
import { NailOptions } from "@/lib/types";

const DEFAULT_OPTIONS: NailOptions = {
  style: "French",
  shape: "oval",
  texture: "glossy",
  color: "dusty rose pink",
  customPrompt: "",
  numOutputs: 1,
  quality: "schnell",
};

export default function TryOnPage() {
  const [options, setOptions] = useState<NailOptions>(DEFAULT_OPTIONS);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [resultUrl, setResultUrl] = useState("");
  const [maskPreview, setMaskPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMask, setShowMask] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl("");
    setMaskPreview("");
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  function removeFile() {
    setFile(null);
    setPreview("");
    setResultUrl("");
    setMaskPreview("");
    setError("");
  }

  async function handleTryOn() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResultUrl("");
    try {
      const res = await virtualTryOn(file, {
        style: options.style,
        shape: options.shape,
        texture: options.texture,
        color: options.color,
        customPrompt: options.customPrompt,
      });
      setResultUrl(res.result_url);
      setMaskPreview(res.mask_preview);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Try-on failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-white/10 bg-black/30 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-white">Virtual Nail Try-On</h1>
          <p className="mt-1 text-sm text-white/50">
            Upload a photo of your hand — AI will apply your chosen nail design to it
          </p>
          <ProviderBadge />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* ─── Left: options + upload ─── */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4">
            {/* Upload area */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                Your Hand Photo
              </p>

              {!preview ? (
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${
                    isDragActive
                      ? "border-rose-500 bg-rose-500/10"
                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
                    <Upload className="h-5 w-5 text-rose-400" />
                  </div>
                  <p className="text-sm text-white/60 text-center">
                    {isDragActive ? "Drop your photo here" : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-white/30">JPG, PNG, WebP · max 10 MB</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10">
                    <Image src={preview} alt="Hand photo" fill className="object-cover" />
                  </div>
                  <button
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="mt-2 text-xs text-white/40 truncate">{file?.name}</p>
                </div>
              )}
            </div>

            {/* Nail customizer */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <NailCustomizer
                options={options}
                onChange={setOptions}
                showQuality={false}
                showOutputCount={false}
              />

              <button
                onClick={handleTryOn}
                disabled={!file || loading}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Hand className="h-4 w-4" />
                {loading ? "Applying design..." : "Apply Nail Design"}
              </button>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/40 space-y-1">
              <p className="font-semibold text-white/60 mb-2">Tips for best results:</p>
              <p>• Use a clear, well-lit photo of your hand</p>
              <p>• Ensure all 5 nails are visible</p>
              <p>• Avoid extreme angles or curled fingers</p>
              <p>• Plain background works best</p>
            </div>
          </aside>

          {/* ─── Right: results ─── */}
          <section className="flex-1 space-y-6">
            {loading && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <LoadingSpinner text="AI is applying your nail design..." />
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            {resultUrl && !loading && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-white">Result</h2>
                <ImageResult src={resultUrl} label="Try-On Result" />

                {/* Before / after comparison */}
                {preview && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-2 text-xs text-white/40 uppercase tracking-widest">Before</p>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10">
                        <Image src={preview} alt="Before" fill className="object-cover" />
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs text-white/40 uppercase tracking-widest">After</p>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10">
                        <Image src={resultUrl} alt="After" fill className="object-cover" unoptimized />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mask debug toggle */}
                {maskPreview && (
                  <div>
                    <button
                      onClick={() => setShowMask(!showMask)}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showMask ? "Hide" : "Show"} nail detection mask
                    </button>
                    {showMask && (
                      <div className="mt-2 relative aspect-[4/3] max-w-xs overflow-hidden rounded-xl border border-white/10">
                        <Image src={maskPreview} alt="Nail mask" fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!resultUrl && !loading && !error && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
                  <Hand className="h-8 w-8 text-rose-400" />
                </div>
                <p className="text-white/60 font-medium">
                  {file ? "Ready — click Apply Nail Design" : "Upload your hand photo to begin"}
                </p>
                <p className="text-sm text-white/30 mt-1">
                  AI will detect your nails and apply the chosen design
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
