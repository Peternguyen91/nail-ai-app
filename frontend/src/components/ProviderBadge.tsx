"use client";

import { useEffect, useState } from "react";
import { Zap, Cpu } from "lucide-react";

interface Status {
  generation_provider: string;
  tryon_provider: string;
  hf_token_set: boolean;
}

export default function ProviderBadge() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/status`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => null);
  }, []);

  if (!status) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
        <Zap className="h-3 w-3" />
        Generate: {status.hf_token_set ? "HuggingFace FLUX" : "Pollinations.ai (free)"}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
        <Cpu className="h-3 w-3" />
        Try-On: {status.hf_token_set ? "HuggingFace Inpainting" : "PIL Lite (instant)"}
      </span>
    </div>
  );
}
