"""Split the speaking bank into small independently fetched Site assets."""
import json
from pathlib import Path

dist = Path(__file__).resolve().parents[1] / "dist"
bank = json.loads((dist / "speaking-content.json").read_text(encoding="utf-8"))
manifest = {}
for part in ("part1", "part2", "part3"):
    chunks, current = [], []
    for group in bank[part]:
        candidate = current + [group]
        if current and len(json.dumps(candidate, ensure_ascii=False, separators=(",", ":")).encode()) > 360_000:
            chunks.append(current)
            current = [group]
        else:
            current = candidate
    if current:
        chunks.append(current)
    manifest[part] = []
    for index, chunk in enumerate(chunks, 1):
        filename = f"speaking-{part}-{index}.json"
        (dist / filename).write_text(json.dumps(chunk, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        manifest[part].append(filename)
(dist / "speaking-chunks.json").write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
print("Speaking bank split:", {key: len(value) for key, value in manifest.items()})
