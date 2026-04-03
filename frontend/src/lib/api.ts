import axios from "axios";
import { GenerateResponse, NailOptions, TryOnResponse } from "./types";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 120_000, // AI generation can be slow
});

export async function generateNailArt(opts: NailOptions): Promise<GenerateResponse> {
  const { data } = await API.post<GenerateResponse>("/api/generate", {
    style: opts.style,
    shape: opts.shape,
    texture: opts.texture,
    color: opts.color,
    custom_prompt: opts.customPrompt,
    num_outputs: opts.numOutputs,
    quality: opts.quality,
  });
  return data;
}

export async function virtualTryOn(
  file: File,
  opts: Pick<NailOptions, "style" | "shape" | "texture" | "color" | "customPrompt">
): Promise<TryOnResponse> {
  const form = new FormData();
  form.append("image", file);
  form.append("style", opts.style);
  form.append("shape", opts.shape);
  form.append("texture", opts.texture);
  form.append("color", opts.color);
  form.append("custom_prompt", opts.customPrompt);

  const { data } = await API.post<TryOnResponse>("/api/tryon", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
