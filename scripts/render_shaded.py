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

import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components
adj = sp.dok_matrix((len(positions), len(positions)), dtype=bool)
for tri in triangles:
    adj[tri[0], tri[1]] = True
    adj[tri[1], tri[2]] = True
    adj[tri[2], tri[0]] = True

_, labels = connected_components(adj.tocsr(), directed=False)
v_comp = labels

tri_centers = positions[triangles].mean(axis=1)
theta = np.radians(8)
cos_t, sin_t = np.cos(theta), np.sin(theta)

# Left eye: center (-0.112, 0.540)
lx = tri_centers[:, 0] - (-0.112)
ly = tri_centers[:, 1] - 0.540
lx_rot = lx * cos_t + ly * sin_t
ly_rot = -lx * sin_t + ly * cos_t

# Right eye: center (+0.112, 0.540)
rx = tri_centers[:, 0] - (0.112)
ry = tri_centers[:, 1] - 0.540
rx_rot = rx * cos_t - ry * sin_t
ry_rot = rx * sin_t + ry * cos_t

# Tuned ellipse to fill the eye socket cleanly
left_eye_tris = (lx_rot**2 / 0.055**2 + ly_rot**2 / 0.115**2 < 1.0) & (tri_centers[:, 2] > 0.28)
right_eye_tris = (rx_rot**2 / 0.055**2 + ry_rot**2 / 0.115**2 < 1.0) & (tri_centers[:, 2] > 0.28)
eye_tris = left_eye_tris | right_eye_tris

hand_tris = (v_comp[triangles[:, 0]] == 0) | (v_comp[triangles[:, 0]] == 2)
body_tris = (~hand_tris) & (~eye_tris)

print(f"Eye tris: {np.sum(eye_tris)}")

# Render front preview
w, h = 600, 600
img = np.zeros((h, w, 3), dtype=np.uint8)

order = np.argsort(tri_centers[:, 2])

for t_idx in order:
    pts = positions[triangles[t_idx]]
    pxs = ((pts[:, 0] + 0.9) / 1.8 * (w - 1)).astype(int)
    pys = ((1.0 - (pts[:, 1] + 1.1) / 2.2) * (h - 1)).astype(int)
    
    if eye_tris[t_idx]:
        col = [255, 255, 255]
    elif hand_tris[t_idx]:
        col = [238, 240, 246]
    else:
        e1 = pts[1] - pts[0]
        e2 = pts[2] - pts[0]
        n = np.cross(e1, e2)
        norm = np.linalg.norm(n)
        if norm > 1e-6:
            n = n / norm
        else:
            n = np.array([0, 0, 1])
        l = np.array([-0.4, 0.7, 0.6])
        l = l / np.linalg.norm(l)
        diff = max(0.0, np.dot(n, l))
        val = int(22 + 55 * diff)
        col = [val, val, int(val * 1.15)]
        
    min_x, max_x = max(0, pxs.min()), min(w-1, pxs.max())
    min_y, max_y = max(0, pys.min()), min(h-1, pys.max())
    img[min_y:max_y+1, min_x:max_x+1] = col

Image.fromarray(img).save(r"c:\Users\gaurav\Downloads\OSMOO\public\model_shaded_preview_v2.png")
print("Saved model_shaded_preview_v2.png")
