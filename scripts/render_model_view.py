import numpy as np
from PIL import Image
import json, struct

glb_path = r"c:\Users\gaurav\Downloads\white_mesh.glb"
with open(glb_path, "rb") as f:
    f.seek(12)
    chunk_len, _ = struct.unpack("<I4s", f.read(8))
    data = json.loads(f.read(chunk_len).decode("utf-8"))
    bin_len, _ = struct.unpack("<I4s", f.read(8))
    bin_data = f.read(bin_len)

acc1 = data["accessors"][1]
bv1 = data["bufferViews"][acc1["bufferView"]]
offset1 = bv1.get("byteOffset", 0) + acc1.get("byteOffset", 0)
positions = np.frombuffer(bin_data, dtype=np.float32, count=acc1["count"]*3, offset=offset1).reshape(-1, 3)

# Render front view (X vs Y, shaded by Z)
w, h = 600, 600
img = np.zeros((h, w, 3), dtype=np.uint8)

# Center and scale
# X: [-0.7, 0.7], Y: [-1.0, 1.0], Z: [-0.45, 0.45]
xs = ((positions[:, 0] + 0.9) / 1.8 * (w - 1)).astype(int)
ys = ((1.0 - (positions[:, 1] + 1.1) / 2.2) * (h - 1)).astype(int)
zs = positions[:, 2]

# Sort by Z so front points render on top
order = np.argsort(zs)
for i in order:
    x, y, z = xs[i], ys[i], zs[i]
    if 0 <= x < w and 0 <= y < h:
        val = int(np.clip((z + 0.45) / 0.9 * 255, 30, 255))
        # Draw small 3x3 point
        img[max(0, y-1):min(h, y+2), max(0, x-1):min(w, x+2)] = [val, val, val]

Image.fromarray(img).save(r"c:\Users\gaurav\Downloads\OSMOO\public\model_front_view.png")
print("Saved model_front_view.png")
