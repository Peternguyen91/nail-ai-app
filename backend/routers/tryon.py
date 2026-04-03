import io
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from services.replicate_service import virtual_tryon
from services.nail_mask import create_nail_mask, image_to_base64

router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/tryon")
async def tryon(
    image: UploadFile = File(..., description="Hand photo"),
    style: str   = Form(default="French"),
    shape: str   = Form(default="oval"),
    texture: str = Form(default="glossy"),
    color: str   = Form(default="pink"),
    custom_prompt: str = Form(default=""),
):
    """
    Apply AI nail art to an uploaded hand photo using inpainting.
    Returns the result image URL and a preview of the nail mask.
    """
    # --- Validate upload ---
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG or WebP images are accepted.")

    raw = await image.read()
    if len(raw) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Max size is 10 MB.")

    try:
        pil_image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image file.")

    # Resize if very large (keeps processing fast)
    max_dim = 1024
    w, h = pil_image.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        pil_image = pil_image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    try:
        # Generate mask preview so frontend can show it
        mask = create_nail_mask(pil_image)
        mask_data_uri = image_to_base64(mask, fmt="PNG")

        # Run virtual try-on
        result_url = await virtual_tryon(
            hand_image=pil_image,
            style=style,
            shape=shape,
            texture=texture,
            color=color,
            custom_prompt=custom_prompt,
        )

        return JSONResponse({
            "result_url": result_url,
            "mask_preview": mask_data_uri,
        })

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preview-mask")
async def preview_mask(image: UploadFile = File(...)):
    """
    Return only the nail mask for a given hand photo (useful for debugging / previewing).
    """
    raw = await image.read()
    try:
        pil_image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image.")

    mask = create_nail_mask(pil_image)
    mask_uri = image_to_base64(mask, fmt="PNG")
    return {"mask": mask_uri}
