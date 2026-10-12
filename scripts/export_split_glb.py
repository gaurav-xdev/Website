import numpy as np
import json, struct
import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components
from collections import defaultdict

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

# Connected components
adj = sp.dok_matrix((len(positions), len(positions)), dtype=bool)
for tri in triangles:
    adj[tri[0], tri[1]] = True
    adj[tri[1], tri[2]] = True
    adj[tri[2], tri[0]] = True

_, labels = connected_components(adj.tocsr(), directed=False)

# Cut at Y = 0.12 for neck separation
y_cut = 0.12
bh_tris = triangles[labels[triangles[:, 0]] == 1]

head_tri_mask = positions[bh_tris, 1].min(axis=1) >= y_cut
head_tris_orig = bh_tris[head_tri_mask]

body_tri_mask = positions[bh_tris, 1].max(axis=1) <= y_cut
body_tris_orig = bh_tris[body_tri_mask]

lh_tris_orig = triangles[labels[triangles[:, 0]] == 0]
rh_tris_orig = triangles[labels[triangles[:, 0]] == 2]

def orient_boundary_loop(tri_list):
    directed_edges = defaultdict(int)
    for t in tri_list:
        directed_edges[(t[0], t[1])] += 1
        directed_edges[(t[1], t[2])] += 1
        directed_edges[(t[2], t[0])] += 1
    
    b_edges = []
    edges_set = set(directed_edges.keys())
    for (u, v) in edges_set:
        if (v, u) not in edges_set:
            b_edges.append((u, v))
    
    next_map = {u: v for u, v in b_edges}
    cycle = []
    if b_edges:
        start = b_edges[0][0]
        curr = start
        while True:
            cycle.append(curr)
            curr = next_map[curr]
            if curr == start:
                break
    return cycle

def build_submesh(tri_list, cap=False, cap_upward=False):
    unique_v = np.unique(tri_list)
    v_map = {old: new for new, old in enumerate(unique_v)}
    sub_pos = positions[unique_v].copy()
    sub_tris = np.vectorize(v_map.get)(tri_list)
    
    if cap:
        cycle = orient_boundary_loop(tri_list)
        if len(cycle) > 2:
            c_pos = positions[cycle].mean(axis=0)
            center_idx = len(sub_pos)
            sub_pos = np.vstack([sub_pos, c_pos])
            
            mapped_cycle = [v_map[v] for v in cycle]
            cap_tris = []
            for i in range(len(mapped_cycle)):
                u = mapped_cycle[i]
                v = mapped_cycle[(i + 1) % len(mapped_cycle)]
                if cap_upward:
                    cap_tris.append([u, v, center_idx])
                else:
                    cap_tris.append([v, u, center_idx])
            sub_tris = np.vstack([sub_tris, cap_tris])
    
    sub_normals = np.zeros_like(sub_pos)
    for tri in sub_tris:
        p0, p1, p2 = sub_pos[tri[0]], sub_pos[tri[1]], sub_pos[tri[2]]
        fn = np.cross(p1 - p0, p2 - p0)
        sub_normals[tri[0]] += fn
        sub_normals[tri[1]] += fn
        sub_normals[tri[2]] += fn
    
    norms = np.linalg.norm(sub_normals, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    sub_normals = sub_normals / norms
    
    return sub_pos, sub_normals, sub_tris.astype(np.uint32)

body_pos, body_norm, body_tris = build_submesh(body_tris_orig, cap=True, cap_upward=True)
head_pos, head_norm, head_tris = build_submesh(head_tris_orig, cap=True, cap_upward=False)
lh_pos, lh_norm, lh_tris = build_submesh(lh_tris_orig, cap=False)
rh_pos, rh_norm, rh_tris = build_submesh(rh_tris_orig, cap=False)

# Natural pivots:
# Head center is at Y = 0.537
head_pivot = np.array([0.0, 0.537, 0.0], dtype=np.float32)
# Center the head mesh vertices around its pivot so head can rotate/tilt cleanly around (0,0,0)
head_pos_centered = head_pos - head_pivot

# Body pivot is at Y = -0.44
body_pivot = np.array([0.0, -0.44, 0.0], dtype=np.float32)
body_pos_centered = body_pos - body_pivot

# Left hand pivot
lh_pivot = np.array([-0.572, -0.462, 0.069], dtype=np.float32)
lh_pos_centered = lh_pos - lh_pivot

# Right hand pivot
rh_pivot = np.array([0.532, -0.464, 0.069], dtype=np.float32)
rh_pos_centered = rh_pos - rh_pivot

print(f"Body: {len(body_pos_centered)} vertices")
print(f"Head: {len(head_pos_centered)} vertices")
print(f"LH: {len(lh_pos_centered)} vertices")
print(f"RH: {len(rh_pos_centered)} vertices")

def pad_bin(b):
    rem = len(b) % 4
    return b + (b'\x00' * (4 - rem)) if rem != 0 else b

def pad_json(b):
    rem = len(b) % 4
    return b + (b' ' * (4 - rem)) if rem != 0 else b

# We export 4 parts with their respective node translations:
# Notice head translation includes +0.07 space above neck for the reference gap!
# Head was at 0.537, with gap it sits at 0.537 + 0.08 = 0.617!
parts = [
    ("Body", body_pos_centered, body_norm, body_tris, 0, body_pivot.tolist()),
    ("Head", head_pos_centered, head_norm, head_tris, 0, [0.0, 0.617, 0.0]), # physical neck space!
    ("LeftHand", lh_pos_centered, lh_norm, lh_tris, 1, lh_pivot.tolist()),
    ("RightHand", rh_pos_centered, rh_norm, rh_tris, 1, rh_pivot.tolist()),
]

buffer_bytes = bytearray()
buffer_views = []
accessors = []
meshes = []
nodes = [{"name": "OsmooRoot", "children": [1, 2, 3, 4]}]

for i, (name, pos, norm, tris, mat_idx, translation) in enumerate(parts):
    # POSITION
    p_bytes = pos.astype(np.float32).tobytes()
    p_offset = len(buffer_bytes)
    buffer_bytes.extend(pad_bin(p_bytes))
    bv_pos = len(buffer_views)
    buffer_views.append({
        "buffer": 0,
        "byteOffset": p_offset,
        "byteLength": len(p_bytes),
        "target": 34962
    })
    acc_pos = len(accessors)
    accessors.append({
        "bufferView": bv_pos,
        "componentType": 5126,
        "count": len(pos),
        "type": "VEC3",
        "min": pos.min(axis=0).tolist(),
        "max": pos.max(axis=0).tolist()
    })
    
    # NORMAL
    n_bytes = norm.astype(np.float32).tobytes()
    n_offset = len(buffer_bytes)
    buffer_bytes.extend(pad_bin(n_bytes))
    bv_norm = len(buffer_views)
    buffer_views.append({
        "buffer": 0,
        "byteOffset": n_offset,
        "byteLength": len(n_bytes),
        "target": 34962
    })
    acc_norm = len(accessors)
    accessors.append({
        "bufferView": bv_norm,
        "componentType": 5126,
        "count": len(norm),
        "type": "VEC3",
        "min": norm.min(axis=0).tolist(),
        "max": norm.max(axis=0).tolist()
    })
    
    # INDICES
    idx_bytes = tris.flatten().astype(np.uint32).tobytes()
    idx_offset = len(buffer_bytes)
    buffer_bytes.extend(pad_bin(idx_bytes))
    bv_idx = len(buffer_views)
    buffer_views.append({
        "buffer": 0,
        "byteOffset": idx_offset,
        "byteLength": len(idx_bytes),
        "target": 34963
    })
    acc_idx = len(accessors)
    accessors.append({
        "bufferView": bv_idx,
        "componentType": 5125,
        "count": len(tris) * 3,
        "type": "SCALAR",
        "min": [0],
        "max": [len(pos) - 1]
    })
    
    # MESH
    mesh_idx = len(meshes)
    meshes.append({
        "name": f"Mesh_{name}",
        "primitives": [{
            "attributes": {"POSITION": acc_pos, "NORMAL": acc_norm},
            "indices": acc_idx,
            "material": mat_idx
        }]
    })
    
    # NODE with natural translation
    nodes.append({
        "name": name,
        "mesh": mesh_idx,
        "translation": translation
    })

gltf_dict = {
    "asset": {"version": "2.0", "generator": "OSMOO Centered Split Exporter"},
    "scenes": [{"nodes": [0]}],
    "scene": 0,
    "nodes": nodes,
    "materials": [
        {
            "name": "ObsidianBody",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.015, 0.014, 0.020, 1.0],
                "metallicFactor": 0.08,
                "roughnessFactor": 0.02
            }
        },
        {
            "name": "PearlHands",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.95, 0.96, 0.98, 1.0],
                "metallicFactor": 0.02,
                "roughnessFactor": 0.12
            }
        }
    ],
    "meshes": meshes,
    "accessors": accessors,
    "bufferViews": buffer_views,
    "buffers": [{"byteLength": len(buffer_bytes)}]
}

json_str = json.dumps(gltf_dict).encode("utf-8")
json_pad = pad_json(json_str)

header = struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(json_pad) + 8 + len(buffer_bytes))
json_chunk = struct.pack("<I4s", len(json_pad), b"JSON") + json_pad
bin_chunk = struct.pack("<I4s", len(buffer_bytes), b"BIN\x00") + bytes(buffer_bytes)

with open(dest_model, "wb") as f:
    f.write(header + json_chunk + bin_chunk)

print(f"Successfully exported centered split GLB to: {dest_model}")
