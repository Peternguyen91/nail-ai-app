"""
Image generation service — supports multiple providers:
  1. Pollinations.ai   (FREE, no key needed)        → text-to-image
  2. HuggingFace       (FREE token at hf.co)        → text-to-image + inpainting
  3. PIL Lite          (no key at all)               → try-on fallback (color simulation)
"""

import os
import io
import base64
import asyncio
import urllib.parse
import numpy as np
from PIL import Image

import httpx

from .nail_mask import create_nail_mask, image_to_base64

# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────

HF_TOKEN = os.getenv("HF_TOKEN", "")

HF_FLUX_URL    = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
HF_INPAINT_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-inpainting"

POLLINATIONS_URL = "https://image.pollinations.ai/prompt/{prompt}"

NEGATIVE_PROMPT = (
    "ugly, deformed, distorted, blurry, low quality, cartoon, "
    "extra fingers, missing fingers, watermark, text, logo"
)

# ─────────────────────────────────────────────────────────────
# Color name → hex mapping
# ─────────────────────────────────────────────────────────────

COLOR_HEX_MAP: dict[str, str] = {
    "dusty rose pink":      "#F4A7B9",
    "deep red":             "#C0392B",
    "nude beige":           "#E8C5A0",
    "coral orange":         "#FF6B6B",
    "lavender purple":      "#C8A2C8",
    "midnight blue":        "#2C3E7A",
    "emerald green":        "#2ECC71",
    "black":                "#1C1C1C",
    "white":                "#F8F8FF",
    "gold":                 "#FFD700",
    "silver chrome":        "#C0C0C0",
    "holographic rainbow":  "#C8A2C8",  # fallback for holo
}


def color_to_hex(color_name: str) -> str:
    for key, val in COLOR_HEX_MAP.items():
        if key.lower() in color_name.lower() or color_name.lower() in key.lower():
            return val
    return "#F4A7B9"  # default rose pink


# ─────────────────────────────────────────────────────────────
# Prompt builders
# ─────────────────────────────────────────────────────────────

def build_generation_prompt(style: str, shape: str, texture: str, color: str, custom: str = "") -> str:
    base = (
        f"Close-up professional studio photograph of a hand with {shape} shaped nails, "
        f"{style} nail art design, {color} color palette, {texture} finish. "
        "Perfect nail photography, macro lens, soft diffused lighting, ultra-detailed, "
        "high resolution, 8k, fashion beauty editorial."
    )
    return f"{custom}. {base}" if custom else base


def build_inpaint_prompt(style: str, shape: str, texture: str, color: str, custom: str = "") -> str:
    base = (
        f"Beautiful {style} nail art on {shape} shaped nails, {color} nail polish, "
        f"{texture} finish. Photorealistic, high quality nail photography, detailed, clean edges."
    )
    return f"{custom}. {base}" if custom else base


# ─────────────────────────────────────────────────────────────
# Provider 1: Pollinations.ai — text → image URL (no key)
# ─────────────────────────────────────────────────────────────

def _pollinations_url(prompt: str, seed: int = 42) -> str:
    encoded = urllib.parse.quote(prompt)
    return (
        f"{POLLINATIONS_URL.format(prompt=encoded)}"
        f"?width=1024&height=1024&model=flux&seed={seed}&nologo=true&enhance=false"
    )


async def generate_via_pollinations(
    style: str, shape: str, texture: str, color: str,
    custom_prompt: str = "", num_outputs: int = 4,
) -> list[str]:
    prompt = build_generation_prompt(style, shape, texture, color, custom_prompt)
    # Pollinations returns images via URL — just build N URLs with different seeds
    urls = [_pollinations_url(prompt, seed=i * 37 + 1) for i in range(num_outputs)]
    return urls


# ─────────────────────────────────────────────────────────────
# Provider 2: HuggingFace Inference API — text → image
# ─────────────────────────────────────────────────────────────

async def generate_via_huggingface(
    style: str, shape: str, texture: str, color: str,
    custom_prompt: str = "", num_outputs: int = 4,
) -> list[str]:
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN not set. Use Pollinations (no key) or add your HuggingFace token.")

    prompt = build_generation_prompt(style, shape, texture, color, custom_prompt)
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    async def _one(seed: int) -> str:
        async with httpx.AsyncClient(timeout=90) as client:
            r = await client.post(
                HF_FLUX_URL,
                headers=headers,
                json={"inputs": prompt, "parameters": {"seed": seed}},
            )
            if r.status_code == 503:
                # Model is loading — wait and retry once
                await asyncio.sleep(20)
                r = await client.post(
                    HF_FLUX_URL, headers=headers,
                    json={"inputs": prompt, "parameters": {"seed": seed}},
                )
            r.raise_for_status()
            img_b64 = base64.b64encode(r.content).decode()
            return f"data:image/jpeg;base64,{img_b64}"

    results = await asyncio.gather(*[_one(i * 37 + 1) for i in range(num_outputs)])
    return list(results)


# ─────────────────────────────────────────────────────────────
# Unified generate_nail_art
# ─────────────────────────────────────────────────────────────

async def generate_nail_art(
    style: str, shape: str, texture: str, color: str,
    custom_prompt: str = "", num_outputs: int = 4, quality: str = "schnell",
) -> list[str]:
    """
    Generate nail art images.
    Uses Pollinations (free, no key) by default.
    If HF_TOKEN is set, uses HuggingFace for potentially higher quality.
    """
    # Prefer Pollinations — no key needed, fast, reliable
    return await generate_via_pollinations(
        style, shape, texture, color, custom_prompt, num_outputs
    )


# ─────────────────────────────────────────────────────────────
# Virtual try-on — HuggingFace inpainting
# ─────────────────────────────────────────────────────────────

async def _tryon_huggingface(
    hand_image: Image.Image,
    mask: Image.Image,
    prompt: str,
) -> str:
    """Use HuggingFace SD inpainting model."""
    # Convert to PNG bytes
    def _to_bytes(img: Image.Image) -> bytes:
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="PNG")
        return buf.getvalue()

    img_b64  = base64.b64encode(_to_bytes(hand_image)).decode()
    mask_b64 = base64.b64encode(_to_bytes(mask)).decode()

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "image":           img_b64,
            "mask_image":      mask_b64,
            "negative_prompt": NEGATIVE_PROMPT,
            "num_inference_steps": 25,
            "guidance_scale":  7.5,
        },
    }

    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(HF_INPAINT_URL, headers=headers, json=payload)
        if r.status_code == 503:
            await asyncio.sleep(25)
            r = await client.post(HF_INPAINT_URL, headers=headers, json=payload)
        r.raise_for_status()
        result_b64 = base64.b64encode(r.content).decode()
        return f"data:image/png;base64,{result_b64}"


# ─────────────────────────────────────────────────────────────
# Virtual try-on — PIL lite mode (no API key needed)
# ─────────────────────────────────────────────────────────────

def _tryon_pil(
    hand_image: Image.Image,
    mask: Image.Image,
    color: str,
    texture: str,
) -> str:
    """
    Simulate nail color using PIL — no AI API required.
    Applies a colored, semi-transparent overlay on detected nail regions.
    """
    hex_color = color_to_hex(color)
    hex_color = hex_color.lstrip("#")
    r, g, b = [int(hex_color[i:i+2], 16) for i in (0, 2, 4)]

    img_rgba = hand_image.convert("RGBA")
    img_arr  = np.array(img_rgba, dtype=np.float32)

    mask_arr = np.array(mask.convert("L"), dtype=np.float32) / 255.0  # 0..1

    # Base nail color
    nail_r, nail_g, nail_b = float(r), float(g), float(b)

    # Glossy: blend target color strongly
    # Matte: slightly desaturate and lower brightness
    if texture == "matte":
        factor = 0.7
    elif texture in ("chrome", "glitter"):
        factor = 0.9
    else:
        factor = 0.82  # glossy default

    alpha = mask_arr * factor  # per-pixel blend factor

    img_arr[..., 0] = img_arr[..., 0] * (1 - alpha) + nail_r * alpha
    img_arr[..., 1] = img_arr[..., 1] * (1 - alpha) + nail_g * alpha
    img_arr[..., 2] = img_arr[..., 2] * (1 - alpha) + nail_b * alpha

    # Glossy highlight: add a white sheen to top ~30% of mask
    if texture not in ("matte", "velvet"):
        shifted_mask = np.roll(mask_arr, shift=-int(hand_image.height * 0.04), axis=0)
        highlight_alpha = np.clip(shifted_mask * 0.4, 0, 1)
        img_arr[..., 0] = np.clip(img_arr[..., 0] + 255 * highlight_alpha, 0, 255)
        img_arr[..., 1] = np.clip(img_arr[..., 1] + 255 * highlight_alpha, 0, 255)
        img_arr[..., 2] = np.clip(img_arr[..., 2] + 255 * highlight_alpha, 0, 255)

    result = Image.fromarray(img_arr.astype(np.uint8), "RGBA").convert("RGB")
    return image_to_base64(result, fmt="PNG")


# ─────────────────────────────────────────────────────────────
# Unified virtual_tryon
# ─────────────────────────────────────────────────────────────

async def virtual_tryon(
    hand_image: Image.Image,
    style: str, shape: str, texture: str, color: str,
    custom_prompt: str = "",
) -> str:
    """
    Apply nail design to a hand photo.
    - If HF_TOKEN is set → use HuggingFace SD inpainting (best quality)
    - Otherwise          → PIL color simulation (no API needed, instant)
    """
    mask = create_nail_mask(hand_image)

    if HF_TOKEN:
        prompt = build_inpaint_prompt(style, shape, texture, color, custom_prompt)
        return await _tryon_huggingface(hand_image, mask, prompt)
    else:
        # PIL lite mode — works with zero API setup
        return _tryon_pil(hand_image, mask, color, texture)
