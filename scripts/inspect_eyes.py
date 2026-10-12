import numpy as np
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

# Eye region on head:
# y in [0.4, 0.75], z > 0.3, x in [-0.3, 0.3]
head_front = np.where((positions[:, 1] > 0.35) & (positions[:, 1] < 0.75) & (positions[:, 2] > 0.30) & (np.abs(positions[:, 0]) < 0.25))[0]
print(f"Candidate eye region vertices: {len(head_front)}")

# Let's check curvature or surface depression in this region
# Distance from approximate head sphere center:
# Head center is around (0, 0.55, 0)
head_center = np.array([0.0, 0.54, 0.0])
dists = np.linalg.norm(positions[head_front] - head_center, axis=1)
print(f"Distances from head center: min={dists.min():.4f}, mean={dists.mean():.4f}, max={dists.max():.4f}")

# Look at points where distance dips or rises relative to sphere
sphere_r = dists.mean()
dev = dists - sphere_r
print(f"Deviation from mean sphere: min={dev.min():.4f}, max={dev.max():.4f}")

# Also let's check left eye vs right eye:
left_eye = head_front[(positions[head_front, 0] < -0.04) & (np.abs(positions[head_front, 1] - 0.54) < 0.12)]
right_eye = head_front[(positions[head_front, 0] > 0.04) & (np.abs(positions[head_front, 1] - 0.54) < 0.12)]
print(f"Left eye region pts: {len(left_eye)}, Right eye region pts: {len(right_eye)}")
