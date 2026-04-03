import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.replicate_service import generate_nail_art, build_generation_prompt

router = APIRouter()


class GenerateRequest(BaseModel):
    style: str   = Field(default="French")
    shape: str   = Field(default="oval")
    texture: str = Field(default="glossy")
    color: str   = Field(default="dusty rose pink")
    custom_prompt: str = Field(default="")
    num_outputs: int   = Field(default=4, ge=1, le=4)
    quality: str       = Field(default="schnell")


class GenerateResponse(BaseModel):
    images: list[str]
    prompt_used: str
    provider: str


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    try:
        images = await generate_nail_art(
            style=req.style, shape=req.shape, texture=req.texture,
            color=req.color, custom_prompt=req.custom_prompt,
            num_outputs=req.num_outputs, quality=req.quality,
        )
        provider = "huggingface" if os.getenv("HF_TOKEN") else "pollinations"
        return GenerateResponse(
            images=images,
            prompt_used=build_generation_prompt(req.style, req.shape, req.texture, req.color, req.custom_prompt),
            provider=provider,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def status():
    hf = bool(os.getenv("HF_TOKEN"))
    return {
        "generation_provider": "huggingface" if hf else "pollinations (free, no key)",
        "tryon_provider": "huggingface-inpainting" if hf else "pil-lite (instant color simulation)",
        "hf_token_set": hf,
    }
