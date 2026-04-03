import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import io
import base64

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False


# Pairs of (DIP, TIP) landmark indices for each finger
FINGER_PAIRS = [
    (3, 4),   # Thumb
    (7, 8),   # Index
    (11, 12), # Middle
    (15, 16), # Ring
    (19, 20), # Pinky
]


def create_nail_mask(image: Image.Image) -> Image.Image:
    """
    Detect fingernail regions using MediaPipe hand landmarks and return a white mask.
    White = nail area to be inpainted, Black = keep original.
    """
    if not MEDIAPIPE_AVAILABLE:
        raise RuntimeError("MediaPipe is not installed. Run: pip install mediapipe")

    mp_hands = mp.solutions.hands
    img_rgb = np.array(image.convert("RGB"))
    h, w = img_rgb.shape[:2]

    mask = Image.new("RGB", (w, h), "black")
    draw = ImageDraw.Draw(mask)

    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as hands:
        results = hands.process(img_rgb)

        if not results.multi_hand_landmarks:
            return mask  # no hands detected, return empty mask

        for hand_landmarks in results.multi_hand_landmarks:
            lm = hand_landmarks.landmark
            for dip_idx, tip_idx in FINGER_PAIRS:
                dip = lm[dip_idx]
                tip = lm[tip_idx]

                dip_x, dip_y = int(dip.x * w), int(dip.y * h)
                tip_x, tip_y = int(tip.x * w), int(tip.y * h)

                # Vector from DIP to TIP
                dx = tip_x - dip_x
                dy = tip_y - dip_y
                finger_len = max(np.hypot(dx, dy), 1)

                # Nail width proportional to finger length
                nail_half_w = max(int(finger_len * 0.42), 8)

                # Perpendicular unit vector for width
                perp_x = -dy / finger_len
                perp_y = dx / finger_len

                # Extend slightly beyond tip for nail tip
                tip_ext_x = tip_x + int(dx / finger_len * finger_len * 0.25)
                tip_ext_y = tip_y + int(dy / finger_len * finger_len * 0.25)

                # Build convex polygon for nail region
                polygon = [
                    (dip_x + int(perp_x * nail_half_w), dip_y + int(perp_y * nail_half_w)),
                    (dip_x - int(perp_x * nail_half_w), dip_y - int(perp_y * nail_half_w)),
                    (tip_x - int(perp_x * nail_half_w * 0.85), tip_y - int(perp_y * nail_half_w * 0.85)),
                    (tip_ext_x - int(perp_x * nail_half_w * 0.5), tip_ext_y - int(perp_y * nail_half_w * 0.5)),
                    (tip_ext_x + int(perp_x * nail_half_w * 0.5), tip_ext_y + int(perp_y * nail_half_w * 0.5)),
                    (tip_x + int(perp_x * nail_half_w * 0.85), tip_y + int(perp_y * nail_half_w * 0.85)),
                ]
                draw.polygon(polygon, fill="white")

    # Slight blur for softer mask edges
    mask = mask.filter(ImageFilter.GaussianBlur(radius=2))

    return mask


def image_to_base64(image: Image.Image, fmt: str = "PNG") -> str:
    buffer = io.BytesIO()
    image.save(buffer, format=fmt)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime = "image/png" if fmt == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{encoded}"


def base64_to_image(data_uri: str) -> Image.Image:
    if "," in data_uri:
        data_uri = data_uri.split(",", 1)[1]
    img_bytes = base64.b64decode(data_uri)
    return Image.open(io.BytesIO(img_bytes))
