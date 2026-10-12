import json
import struct

glb_path = r"c:\Users\gaurav\Downloads\white_mesh.glb"
with open(glb_path, "rb") as f:
    magic, version, length = struct.unpack("<4sII", f.read(12))
    chunk_len, chunk_type = struct.unpack("<I4s", f.read(8))
    data = json.loads(f.read(chunk_len).decode("utf-8"))

print("JSON Keys:", list(data.keys()))
print("Nodes:", data.get("nodes"))
for i, acc in enumerate(data.get("accessors", [])):
    print(f"Accessor {i}: {acc.get('type')} count={acc.get('count')} min={acc.get('min')} max={acc.get('max')}")

for m in data.get("meshes", []):
    print("Mesh:", m.get("name"))
    for p in m.get("primitives", []):
        print("  Attributes:", p.get("attributes"))
        print("  Indices accessor:", p.get("indices"))
        print("  Material:", p.get("material"))
