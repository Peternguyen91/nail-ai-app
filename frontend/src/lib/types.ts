export interface NailOptions {
  style: string;
  shape: string;
  texture: string;
  color: string;
  customPrompt: string;
  numOutputs: number;
  quality: "schnell" | "dev";
}

export interface GenerateResponse {
  images: string[];
  prompt_used: string;
  provider: string;
}

export interface TryOnResponse {
  result_url: string;
  mask_preview: string;
}

export const NAIL_SHAPES = [
  { value: "oval",      label: "Oval" },
  { value: "almond",   label: "Almond" },
  { value: "coffin",   label: "Coffin" },
  { value: "square",   label: "Square" },
  { value: "squoval",  label: "Squoval" },
  { value: "round",    label: "Round" },
  { value: "ballerina",label: "Ballerina" },
  { value: "stiletto", label: "Stiletto" },
];

export const NAIL_STYLES = [
  { value: "French",        label: "French" },
  { value: "ombre",         label: "Ombre" },
  { value: "glitter",       label: "Glitter" },
  { value: "minimalist",    label: "Minimalist" },
  { value: "floral",        label: "Floral" },
  { value: "marble",        label: "Marble" },
  { value: "geometric",     label: "Geometric" },
  { value: "abstract art",  label: "Abstract Art" },
  { value: "cat eye",       label: "Cat Eye" },
  { value: "chrome",        label: "Chrome" },
  { value: "velvet",        label: "Velvet" },
  { value: "3D nail art",   label: "3D Nail Art" },
];

export const NAIL_TEXTURES = [
  { value: "glossy",  label: "Glossy" },
  { value: "matte",   label: "Matte" },
  { value: "chrome",  label: "Chrome" },
  { value: "glitter", label: "Glitter" },
  { value: "jelly",   label: "Jelly" },
  { value: "velvet",  label: "Velvet" },
  { value: "3D",      label: "3D Effect" },
];

export const NAIL_COLORS = [
  { value: "dusty rose pink",    label: "Rose Pink",   hex: "#F4A7B9" },
  { value: "deep red",           label: "Deep Red",    hex: "#C0392B" },
  { value: "nude beige",         label: "Nude Beige",  hex: "#E8C5A0" },
  { value: "coral orange",       label: "Coral",       hex: "#FF6B6B" },
  { value: "lavender purple",    label: "Lavender",    hex: "#C8A2C8" },
  { value: "midnight blue",      label: "Midnight",    hex: "#2C3E7A" },
  { value: "emerald green",      label: "Emerald",     hex: "#2ECC71" },
  { value: "black",              label: "Black",       hex: "#1C1C1C" },
  { value: "white",              label: "White",       hex: "#F8F8FF" },
  { value: "gold",               label: "Gold",        hex: "#FFD700" },
  { value: "silver chrome",      label: "Silver",      hex: "#C0C0C0" },
  { value: "holographic rainbow",label: "Holo",        hex: "linear-gradient(135deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff)" },
];
