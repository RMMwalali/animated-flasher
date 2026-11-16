"""Transparent web versions of the owner's logo (public/brand/ngina-logo.jpg).

  logo-full.png / .webp        full colour, for light backgrounds
  logo-full-light.png / .webp  same logo with the dark green-black parts in cream, for dark backgrounds

The cream background is keyed out and edge pixels are un-mixed from it so
there is no light halo. Usage: python3 scripts/brand/logo-assets.py
"""
from PIL import Image
import numpy as np

SRC = "public/brand/ngina-logo.jpg"
im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
bg = np.median(np.concatenate([a[:40, :40].reshape(-1, 3), a[-40:, -40:].reshape(-1, 3)]), axis=0)
dist = np.linalg.norm(a - bg, axis=2)
alpha = np.clip((dist - 6) / 55, 0, 1)
safe = np.maximum(alpha, 1e-3)[..., None]
fg = np.clip((a - (1 - alpha[..., None]) * bg) / safe, 0, 255)

def save(rgb, name):
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    img = img.crop(img.getbbox())
    img.thumbnail((1200, 1200), Image.LANCZOS)
    img.save(f"public/brand/{name}.png", optimize=True)
    img.save(f"public/brand/{name}.webp", quality=92, method=6)
    print(name, img.size)

save(fg, "logo-full")
# dark parts (lion, lettering, horizon) -> cream; teal/green/ochre keep their colours
dark = fg.max(axis=2) < 70
light = fg.copy()
light[dark] = bg
save(light, "logo-full-light")
cream = [int(x) for x in bg]
print("background", cream)
