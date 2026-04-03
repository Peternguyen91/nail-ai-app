import Link from "next/link";
import { Sparkles, Wand2, Hand } from "lucide-react";

const GALLERY = [
  { label: "French Ombre", color: "#fda4af", desc: "Coffin · Glossy" },
  { label: "Chrome Cat Eye", color: "#a78bfa", desc: "Almond · Chrome" },
  { label: "Black Marble", color: "#374151", desc: "Square · Matte" },
  { label: "Gold Glitter", color: "#fbbf24", desc: "Stiletto · Glitter" },
  { label: "Coral Floral", color: "#fb7185", desc: "Oval · Glossy" },
  { label: "Emerald Velvet", color: "#059669", desc: "Ballerina · Velvet" },
];

const FEATURES = [
  {
    icon: Wand2,
    title: "AI Image Generation",
    desc: "Describe your dream nails and FLUX AI creates stunning, photo-realistic designs in seconds.",
  },
  {
    icon: Hand,
    title: "Virtual Try-On",
    desc: "Upload a photo of your hand and see exactly how any nail design looks on your actual fingers.",
  },
  {
    icon: Sparkles,
    title: "Full Customization",
    desc: "Choose from 8 nail shapes, 12+ styles, 7 textures, and a full color palette.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/20 blur-[120px]" />
          <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-700/15 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-sm font-medium text-rose-300">
            <Sparkles className="h-3.5 w-3.5" /> Powered by FLUX AI
          </span>

          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Design Your
            <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Perfect Nails
            </span>
            <br />
            with AI
          </h1>

          <p className="mb-10 text-lg text-white/60 md:text-xl">
            Generate stunning nail art from a text description or try designs on your
            own hands — powered by state-of-the-art AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/generate"
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all"
            >
              Generate Nail Art
            </Link>
            <Link
              href="/tryon"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur"
            >
              Virtual Try-On
            </Link>
          </div>
        </div>

        {/* Floating color chips */}
        <div className="pointer-events-none absolute left-8 top-1/3 hidden space-y-3 xl:block">
          {["#fda4af", "#a78bfa", "#fbbf24"].map((c) => (
            <div key={c} className="h-8 w-8 rounded-full border-2 border-white/20 shadow-lg animate-bounce" style={{ background: c, animationDelay: `${Math.random() * 0.5}s` }} />
          ))}
        </div>
        <div className="pointer-events-none absolute right-8 top-1/3 hidden space-y-3 xl:block">
          {["#059669", "#374151", "#fb7185"].map((c) => (
            <div key={c} className="h-8 w-8 rounded-full border-2 border-white/20 shadow-lg animate-bounce" style={{ background: c, animationDelay: `${Math.random() * 0.5}s` }} />
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="mb-3 text-center text-3xl font-bold text-white">Everything you need</h2>
        <p className="mb-12 text-center text-white/50">Professional nail design tools powered by AI</p>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:border-rose-500/30 hover:bg-white/8"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/20">
                <Icon className="h-6 w-6 text-rose-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Gallery Preview ─── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-3 text-center text-3xl font-bold text-white">Style Inspiration</h2>
        <p className="mb-12 text-center text-white/50">Explore what you can create</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {GALLERY.map(({ label, color, desc }) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 aspect-square flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div
                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
              />
              <div className="relative z-10 text-center">
                <div className="h-16 w-16 rounded-full border-4 border-white/20 shadow-2xl mx-auto mb-3" style={{ background: color }} />
                <p className="font-semibold text-white">{label}</p>
                <p className="text-xs text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/generate"
            className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:scale-105 hover:shadow-rose-500/50 transition-all"
          >
            Start Generating →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/30">
        NailAI — Powered by FLUX & Stable Diffusion via Replicate
      </footer>
    </div>
  );
}
