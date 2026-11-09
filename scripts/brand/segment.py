"""Split the Ngina logo raster into per-part bitmap masks for tracing.

Run via `pnpm brand` (segment -> trace -> icons). Never redraw the mark:
every vector we ship is traced from these masks, which come straight from
public/brand/ngina-logo.jpg.

Output: scripts/brand/.masks/*.png (black = shape) and parts.json (bboxes).
Requires: Pillow, numpy, scipy.
"""
import json
import os

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

SRC = "public/brand/ngina-logo.jpg"
OUT = "scripts/brand/.masks"
os.makedirs(OUT, exist_ok=True)

# Palette sampled by scripts/brand/sample-colours.py (exact pixel modes).
PALETTE = {
    "cream": "#EFECE5",
    "deep": "#0E2B27",
    "teal": "#0B99AF",
    "green": "#0F673F",
    "green-light": "#06764E",
    "green-dark": "#075C35",
    "ochre": "#D1974E",
}


def rgb(h):
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], dtype=float)


# A median filter removes JPEG block noise so traced edges come out smooth.
img = np.asarray(Image.open(SRC).convert("RGB").filter(ImageFilter.MedianFilter(7))).astype(float)
H, W, _ = img.shape
names = list(PALETTE)
dist = np.stack([np.abs(img - rgb(PALETTE[n])).sum(-1) for n in names])
cls = np.argmin(dist, axis=0)
masks = {n: cls == i for i, n in enumerate(names)}
deep = masks["deep"]

# --- Horizon swoosh: for each column take the contiguous deep run that ends
# at the swoosh's bottom edge; where feet stand on it, interpolate the top.
band = slice(980, 1100)
top = np.full(W, -1)
for x in range(W):
    col = deep[band, x]
    ys = np.nonzero(col)[0]
    if len(ys) == 0:
        continue
    y = ys.max()
    while y >= 0 and col[y]:
        y -= 1
    top[x] = y + 1 + band.start
valid = (top > 0) & (top > 1018)  # columns without feet/legs
xs = np.nonzero(top > 0)[0]
coef = np.polyfit(np.nonzero(valid)[0], top[valid], 4)
fitted = np.polyval(coef, np.arange(W))
cut = np.where(valid, top, np.round(fitted)).astype(int)
yy = np.arange(H)[:, None]
horizon = deep & (yy >= cut[None, :]) & (yy < 1100)
horizon[:, : xs.min()] = False
mark_zone = yy < cut[None, :]

figure_deep = deep & mark_zone
nonc = ~masks["cream"]
figure = nonc & mark_zone

# --- Components inside the deep figure layer
lab, n = nd.label(figure_deep)
def comp_at(y0, y1, x0, x1):
    region = lab[y0:y1, x0:x1]
    vals, counts = np.unique(region[region > 0], return_counts=True)
    return lab == vals[np.argmax(counts)]

lion = nd.binary_fill_holes(comp_at(700, 900, 600, 1000))
acacia = comp_at(450, 520, 650, 1070)

# --- Elephant silhouette (the whole animal group, cream gaps closed)
yy2, xx2 = np.mgrid[-14:15, -14:15]
disk = (xx2**2 + yy2**2) <= 14**2
silhouette = nd.binary_closing(figure, structure=disk, iterations=1)
silhouette = nd.binary_fill_holes(silhouette)
# keep every substantial body (trunk curl is its own piece), drop specks
sl, sn = nd.label(silhouette)
sizes = nd.sum(silhouette, sl, range(1, sn + 1))
silhouette = np.isin(sl, np.nonzero(sizes > 2000)[0] + 1)
silhouette &= mark_zone

# --- Wordmark lines (deep pixels below the horizon)
text = deep & (yy >= 1100)
rows = text.sum(1)
lines, inrun, start = [], False, 0
for y in range(1100, H):
    if rows[y] > 0 and not inrun:
        inrun, start = True, y
    elif rows[y] == 0 and inrun:
        inrun = False
        if y - start > 30:
            lines.append((start, y))
assert len(lines) == 3, lines
text_lines = []
for (a, b) in lines:
    m = np.zeros_like(text)
    m[a - 2 : b + 2] = text[a - 2 : b + 2]
    text_lines.append(m)


def bbox(m):
    ys, xs = np.nonzero(m)
    return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]


def save(name, m, grow=0):
    if grow:
        m = nd.binary_dilation(m, iterations=grow)
    Image.fromarray(np.where(m, 0, 255).astype(np.uint8)).save(f"{OUT}/{name}.png")


# colour layers; lower layers grow by 1px so stacking leaves no hairlines,
# the cream separators are wide enough to survive this.
def clean(m):
    """Drop anti-aliasing slivers (thin edge pixels misclassified)."""
    m = nd.binary_opening(m, iterations=2)
    lab_, n_ = nd.label(m)
    if n_ == 0:
        return m
    sz = nd.sum(m, lab_, range(1, n_ + 1))
    return np.isin(lab_, np.nonzero(sz > 150)[0] + 1)


for layer in ["teal", "green", "green-light", "green-dark", "ochre"]:
    save(f"layer-{layer}", clean(masks[layer] & mark_zone), grow=1)
save("layer-deep", clean(figure_deep))
save("horizon", horizon)
save("silhouette", silhouette)
save("lion", lion)
save("acacia", acacia)
save("mono-mark", figure | horizon)
for i, m in enumerate(text_lines):
    save(f"text-{i + 1}", m)

parts = {
    "size": [W, H],
    "palette": PALETTE,
    "mark": bbox(figure | horizon),
    "silhouette": bbox(silhouette),
    "horizon": bbox(horizon),
    "lion": bbox(lion),
    "acacia": bbox(acacia),
    "text": [bbox(m) for m in text_lines],
}
json.dump(parts, open(f"{OUT}/parts.json", "w"), indent=2)
print(json.dumps(parts, indent=2))
