import struct
import numpy as np

glb_path = r"c:\Users\gaurav\Downloads\white_mesh.glb"

with open(glb_path, "rb") as f:
    f.read(12) # header
    chunk_len, _ = struct.unpack("<I4s", f.read(8))
    f.seek(12 + 8 + chunk_len) # skip JSON
    
    bin_len, bin_type = struct.unpack("<I4s", f.read(8))
    bin_data = f.read(bin_len)

# Accessor 0: Indices (120000 unsigned short/int)
# In inspect_glb, componentType: let's check
import json
with open(glb_path, "rb") as f:
    f.seek(12)
    chunk_len, _ = struct.unpack("<I4s", f.read(8))
    data = json.loads(f.read(chunk_len).decode("utf-8"))

acc0 = data["accessors"][0] # indices
acc1 = data["accessors"][1] # positions

bv0 = data["bufferViews"][acc0["bufferView"]]
bv1 = data["bufferViews"][acc1["bufferView"]]

# parse indices
offset0 = bv0.get("byteOffset", 0) + acc0.get("byteOffset", 0)
# componentType: 5123 is UNSIGNED_SHORT (2 bytes), 5125 is UNSIGNED_INT (4 bytes)
ctype0 = acc0["componentType"]
dtype0 = np.uint16 if ctype0 == 5123 else np.uint32
indices = np.frombuffer(bin_data, dtype=dtype0, count=acc0["count"], offset=offset0)

# parse positions
offset1 = bv1.get("byteOffset", 0) + acc1.get("byteOffset", 0)
positions = np.frombuffer(bin_data, dtype=np.float32, count=acc1["count"]*3, offset=offset1).reshape(-1, 3)

print("Indices shape:", indices.shape, "min:", indices.min(), "max:", indices.max())
print("Positions shape:", positions.shape)
print("Position bounds:")
print("  X:", positions[:, 0].min(), "to", positions[:, 0].max())
print("  Y:", positions[:, 1].min(), "to", positions[:, 1].max())
print("  Z:", positions[:, 2].min(), "to", positions[:, 2].max())

# Let's find connected components in the mesh triangles:
triangles = indices.reshape(-1, 3)
import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components

adj = sp.dok_matrix((len(positions), len(positions)), dtype=bool)
for tri in triangles:
    adj[tri[0], tri[1]] = True
    adj[tri[1], tri[2]] = True
    adj[tri[2], tri[0]] = True

n_comp, labels = connected_components(adj.tocsr(), directed=False)
print("Number of connected components:", n_comp)

for c in range(n_comp):
    c_pts = positions[labels == c]
    print(f"Component {c}: {len(c_pts)} vertices")
    print(f"  Center: {c_pts.mean(axis=0)}")
    print(f"  X bounds: [{c_pts[:, 0].min():.3f}, {c_pts[:, 0].max():.3f}]")
    print(f"  Y bounds: [{c_pts[:, 1].min():.3f}, {c_pts[:, 1].max():.3f}]")
    print(f"  Z bounds: [{c_pts[:, 2].min():.3f}, {c_pts[:, 2].max():.3f}]")
