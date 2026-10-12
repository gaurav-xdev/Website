# Let's fix export_glb.py padding:
import numpy as np
import json, struct

src_glb = r"c:\Users\gaurav\Downloads\white_mesh.glb"
dest_model = r"c:\Users\gaurav\Downloads\OSMOO\public\osmoo_character.glb"

with open(src_glb, "rb") as f:
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

# Compute smooth vertex normals
normals = np.zeros_like(positions)
for tri in triangles:
    p0, p1, p2 = positions[tri[0]], positions[tri[1]], positions[tri[2]]
    fn = np.cross(p1 - p0, p2 - p0)
    normals[tri[0]] += fn
    normals[tri[1]] += fn
    normals[tri[2]] += fn

norms = np.linalg.norm(normals, axis=1, keepdims=True)
norms[norms == 0] = 1.0
normals = normals / norms

# Connected components
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

lx = tri_centers[:, 0] - (-0.112)
ly = tri_centers[:, 1] - 0.540
lx_rot = lx * cos_t + ly * sin_t
ly_rot = -lx * sin_t + ly * cos_t

rx = tri_centers[:, 0] - (0.112)
ry = tri_centers[:, 1] - 0.540
rx_rot = rx * cos_t - ry * sin_t
ry_rot = rx * sin_t + ry * cos_t

left_eye_tris = (lx_rot**2 / 0.055**2 + ly_rot**2 / 0.115**2 < 1.0) & (tri_centers[:, 2] > 0.28)
right_eye_tris = (rx_rot**2 / 0.055**2 + ry_rot**2 / 0.115**2 < 1.0) & (tri_centers[:, 2] > 0.28)
eye_tri_mask = left_eye_tris | right_eye_tris
hand_tri_mask = (v_comp[triangles[:, 0]] == 0) | (v_comp[triangles[:, 0]] == 2)
body_tri_mask = (~hand_tri_mask) & (~eye_tri_mask)

body_indices = triangles[body_tri_mask].flatten().astype(np.uint32)
hand_indices = triangles[hand_tri_mask].flatten().astype(np.uint32)
eye_indices = triangles[eye_tri_mask].flatten().astype(np.uint32)

pos_bytes = positions.astype(np.float32).tobytes()
norm_bytes = normals.astype(np.float32).tobytes()
body_idx_bytes = body_indices.tobytes()
hand_idx_bytes = hand_indices.tobytes()
eye_idx_bytes = eye_indices.tobytes()

def pad_bin(b):
    rem = len(b) % 4
    return b + (b'\x00' * (4 - rem)) if rem != 0 else b

def pad_json(b):
    rem = len(b) % 4
    return b + (b' ' * (4 - rem)) if rem != 0 else b

total_bin = (
    pos_bytes +
    norm_bytes +
    pad_bin(body_idx_bytes) +
    pad_bin(hand_idx_bytes) +
    pad_bin(eye_idx_bytes)
)

pos_offset = 0
pos_len = len(pos_bytes)
norm_offset = pos_offset + pos_len
norm_len = len(norm_bytes)

body_idx_offset = norm_offset + norm_len
body_idx_len = len(body_idx_bytes)
padded_body_len = len(pad_bin(body_idx_bytes))

hand_idx_offset = body_idx_offset + padded_body_len
hand_idx_len = len(hand_idx_bytes)
padded_hand_len = len(pad_bin(hand_idx_bytes))

eye_idx_offset = hand_idx_offset + padded_hand_len
eye_idx_len = len(eye_idx_bytes)

new_gltf = {
    "asset": {"version": "2.0", "generator": "OSMOO Model Exporter"},
    "scenes": [{"nodes": [0]}],
    "scene": 0,
    "nodes": [{"name": "OsmooCompanion", "mesh": 0}],
    "materials": [
        {
            "name": "ObsidianBody",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.035, 0.032, 0.048, 1.0],
                "metallicFactor": 0.12,
                "roughnessFactor": 0.06
            }
        },
        {
            "name": "PearlHands",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.94, 0.95, 0.98, 1.0],
                "metallicFactor": 0.04,
                "roughnessFactor": 0.20
            }
        },
        {
            "name": "EmissiveEyes",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.0
            },
            "emissiveFactor": [1.0, 1.0, 1.0]
        }
    ],
    "meshes": [
        {
            "name": "OsmooCharacterMesh",
            "primitives": [
                {
                    "attributes": {"POSITION": 0, "NORMAL": 1},
                    "indices": 2,
                    "material": 0
                },
                {
                    "attributes": {"POSITION": 0, "NORMAL": 1},
                    "indices": 3,
                    "material": 1
                },
                {
                    "attributes": {"POSITION": 0, "NORMAL": 1},
                    "indices": 4,
                    "material": 2
                }
            ]
        }
    ],
    "accessors": [
        {
            "bufferView": 0,
            "componentType": 5126,
            "count": len(positions),
            "type": "VEC3",
            "min": positions.min(axis=0).tolist(),
            "max": positions.max(axis=0).tolist()
        },
        {
            "bufferView": 1,
            "componentType": 5126,
            "count": len(normals),
            "type": "VEC3",
            "min": normals.min(axis=0).tolist(),
            "max": normals.max(axis=0).tolist()
        },
        {
            "bufferView": 2,
            "componentType": 5125,
            "count": len(body_indices),
            "type": "SCALAR",
            "min": [int(body_indices.min())],
            "max": [int(body_indices.max())]
        },
        {
            "bufferView": 3,
            "componentType": 5125,
            "count": len(hand_indices),
            "type": "SCALAR",
            "min": [int(hand_indices.min())],
            "max": [int(hand_indices.max())]
        },
        {
            "bufferView": 4,
            "componentType": 5125,
            "count": len(eye_indices),
            "type": "SCALAR",
            "min": [int(eye_indices.min())],
            "max": [int(eye_indices.max())]
        }
    ],
    "bufferViews": [
        {"buffer": 0, "byteOffset": pos_offset, "byteLength": pos_len, "target": 34962},
        {"buffer": 0, "byteOffset": norm_offset, "byteLength": norm_len, "target": 34962},
        {"buffer": 0, "byteOffset": body_idx_offset, "byteLength": body_idx_len, "target": 34963},
        {"buffer": 0, "byteOffset": hand_idx_offset, "byteLength": hand_idx_len, "target": 34963},
        {"buffer": 0, "byteOffset": eye_idx_offset, "byteLength": eye_idx_len, "target": 34963}
    ],
    "buffers": [{"byteLength": len(total_bin)}]
}

json_str = json.dumps(new_gltf).encode("utf-8")
json_pad = pad_json(json_str)

header = struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(json_pad) + 8 + len(total_bin))
json_chunk = struct.pack("<I4s", len(json_pad), b"JSON") + json_pad
bin_chunk = struct.pack("<I4s", len(total_bin), b"BIN\x00") + total_bin

with open(dest_model, "wb") as f:
    f.write(header + json_chunk + bin_chunk)

print(f"Fixed GLB successfully written: {dest_model}")
