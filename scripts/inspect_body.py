import struct
import numpy as np

glb_path = r"c:\Users\gaurav\Downloads\white_mesh.glb"
import json
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

# Let's inspect the Y distribution of vertices in component 1 (x between -0.5 and 0.5):
triangles = indices.reshape(-1, 3)
import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components
adj = sp.dok_matrix((len(positions), len(positions)), dtype=bool)
for tri in triangles:
    adj[tri[0], tri[1]] = True
    adj[tri[1], tri[2]] = True
    adj[tri[2], tri[0]] = True

_, labels = connected_components(adj.tocsr(), directed=False)

body_pts = positions[labels == 1]
# Let's check cross-sectional radius of body_pts along Y:
y_slices = np.linspace(-1.0, 0.95, 20)
print("Body radius along Y:")
for y_val in y_slices:
    nearby = body_pts[np.abs(body_pts[:, 1] - y_val) < 0.05]
    if len(nearby) > 0:
        r = np.sqrt(nearby[:, 0]**2 + nearby[:, 2]**2)
        print(f"  y={y_val:+.2f}: count={len(nearby):4d}, r_mean={r.mean():.3f}, r_max={r.max():.3f}, z_mean={nearby[:, 2].mean():+.3f}")

# Let's check if there are eye features on the head (y > 0.3):
head_pts = body_pts[body_pts[:, 1] > 0.2]
print(f"Head vertices: {len(head_pts)}")
print(f"Head front vertices (z > 0.25): {len(head_pts[head_pts[:, 2] > 0.25])}")
