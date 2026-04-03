"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { clsx } from "clsx";

const links = [
  { href: "/",        label: "Home" },
  { href: "/generate",label: "Generate" },
  { href: "/tryon",   label: "Try-On" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-purple-600 shadow-lg shadow-rose-500/30 group-hover:shadow-rose-500/50 transition-shadow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Nail<span className="text-rose-400">AI</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                pathname === href
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
