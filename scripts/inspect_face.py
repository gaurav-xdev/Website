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

acc0 = data["accessors"][0]
acc1 = data["accessors"][1]
bv0 = data["bufferViews"][acc0["bufferView"]]
bv1 = data["bufferViews"][acc1["bufferView"]]

offset0 = bv0.get("byteOffset", 0) + acc0.get("byteOffset", 0)
dtype0 = np.uint16 if acc0["componentType"] == 5123 else np.uint32
indices = np.frombuffer(bin_data, dtype=dtype0, count=acc0["count"], offset=offset0)

offset1 = bv1.get("byteOffset", 0) + acc1.get("byteOffset", 0)
positions = np.frombuffer(bin_data, dtype=np.float32, count=acc1["count"]*3, offset=offset1).reshape(-1, 3)

triangles = indices.reshape(-1, 3)

# Let's inspect the eye area in 2D (X vs Y):
# Left eye center: around x = -0.11, y = 0.54
# Right eye center: around x = +0.11, y = 0.54
# Tilted ovals
w, h = 500, 500
img = np.zeros((h, w, 3), dtype=np.uint8)

# Zoom in on the face: x in [-0.25, 0.25], y in [0.35, 0.75]
head_mask = (positions[:, 1] > 0.35) & (positions[:, 1] < 0.75) & (positions[:, 2] > 0.28) & (np.abs(positions[:, 0]) < 0.25)
head_indices = np.where(head_mask)[0]

xs = ((positions[head_indices, 0] + 0.25) / 0.50 * (w - 1)).astype(int)
ys = ((1.0 - (positions[head_indices, 1] - 0.35) / 0.40) * (h - 1)).astype(int)

# Check distance from sphere center (0, 0.54, 0)
dists = np.linalg.norm(positions[head_indices] - np.array([0.0, 0.54, 0.0]), axis=1)
# Normalize curvature
c_min, c_max = dists.min(), dists.max()

for i, idx in enumerate(head_indices):
    x, y = xs[i], ys[i]
    if 0 <= x < w and 0 <= y < h:
        val = int((dists[i] - c_min) / (c_max - c_min) * 255)
        img[max(0, y-1):min(h, y+2), max(0, x-1):min(w, x+2)] = [val, val, 255]

Image.fromarray(img).save(r"c:\Users\gaurav\Downloads\OSMOO\public\eyes_curvature.png")
print("Saved eyes_curvature.png")
