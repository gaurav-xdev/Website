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

triangles = indices.reshape(-1, 3)

# Triangle centers
tri_centers = positions[triangles].mean(axis=1)

# Check eye area:
# Left eye: center (-0.11, 0.545, 0.35), tilted
# Rotate coordinates by -8 deg:
theta = np.radians(7)
cos_t, sin_t = np.cos(theta), np.sin(theta)

# Left eye relative coords:
lx = tri_centers[:, 0] - (-0.108)
ly = tri_centers[:, 1] - 0.542
# rotated by +7 deg
lx_rot = lx * cos_t + ly * sin_t
ly_rot = -lx * sin_t + ly * cos_t

# Right eye relative coords:
rx = tri_centers[:, 0] - (0.108)
ry = tri_centers[:, 1] - 0.542
# rotated by -7 deg
rx_rot = rx * cos_t - ry * sin_t
ry_rot = rx * sin_t + ry * cos_t

# Eye ellipse: half-width ~ 0.045, half-height ~ 0.095
left_eye_tris = (lx_rot**2 / 0.048**2 + ly_rot**2 / 0.102**2 < 1.0) & (tri_centers[:, 2] > 0.30)
right_eye_tris = (rx_rot**2 / 0.048**2 + ry_rot**2 / 0.102**2 < 1.0) & (tri_centers[:, 2] > 0.30)

print(f"Left eye triangles: {np.sum(left_eye_tris)}")
print(f"Right eye triangles: {np.sum(right_eye_tris)}")
