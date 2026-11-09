"""Sample the exact brand colours from the logo raster.

Usage: python3 scripts/brand/sample-colours.py public/brand/ngina-logo.jpg
Counts quantised pixel colours, merges near-duplicates and prints the
dominant flat colours (the logo is flat-colour artwork, so the most
frequent clusters ARE the palette). Anti-aliased edge pixels are ignored
because they are rare.
"""
import sys
from collections import Counter
from PIL import Image

path = sys.argv[1] if len(sys.argv) > 1 else "public/brand/ngina-logo.jpg"
img = Image.open(path).convert("RGB")
px = list(img.get_flattened_data()) if hasattr(img, "get_flattened_data") else list(img.getdata())
q = Counter(((r >> 2) << 2, (g >> 2) << 2, (b >> 2) << 2) for r, g, b in px)

clusters = []  # [sum_r, sum_g, sum_b, count]
for (r, g, b), n in q.most_common(4000):
    for c in clusters:
        cr, cg, cb = c[0] / c[3], c[1] / c[3], c[2] / c[3]
        if abs(cr - r) + abs(cg - g) + abs(cb - b) < 30:
            c[0] += r * n; c[1] += g * n; c[2] += b * n; c[3] += n
            break
    else:
        clusters.append([r * n, g * n, b * n, n])

total = len(px)
exact = Counter(px)
for c in sorted(clusters, key=lambda c: -c[3])[:12]:
    cr, cg, cb = (c[i] / c[3] for i in range(3))
    share = c[3] / total
    if share < 0.001:
        continue
    # refine: the most common exact pixel value inside the cluster
    best = max(
        (k for k in exact if abs(k[0] - cr) + abs(k[1] - cg) + abs(k[2] - cb) < 20),
        key=lambda k: exact[k],
    )
    print("#%02X%02X%02X  %5.2f%%" % (*best, share * 100))
