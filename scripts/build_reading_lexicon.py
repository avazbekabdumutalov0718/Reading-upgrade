"""Build a compact English–Uzbek lookup from the openly licensed WordNets.

Sources (download separately before rebuilding):
  https://github.com/LDKR-Group/UzWordnet/blob/master/files/uzwordnet.json
  https://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.bz2

UzWordnet's synset IDs use Princeton WordNet 3.0 offsets. Keep the resulting
credit in the product UI. This script does not copy either full source file.
"""
import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--uzwordnet", required=True, type=Path)
parser.add_argument("--princeton-dict", required=True, type=Path)
args = parser.parse_args()

uz_root = json.loads(args.uzwordnet.read_text(encoding="utf-8"))["@graph"][0]
lemmas = {entry["@id"]: html.unescape(entry["lemma"]["writtenForm"]).strip() for entry in uz_root["entry"]}
synsets = {}
for synset in uz_root["synset"]:
    candidates = [lemmas[id] for id in synset.get("members", []) if id in lemmas]
    candidates = [candidate for candidate in candidates if candidate and len(candidate) <= 90]
    if candidates:
        synsets[synset["@id"].removeprefix("uzwordnet-")] = candidates[0]

entries = {}
for part in ("noun", "verb", "adj", "adv"):
    pos = "a" if part == "adj" else part[0]
    for line in (args.princeton_dict / f"index.{part}").read_text(encoding="utf-8").splitlines():
        fields = line.split()
        if len(fields) < 8 or not fields[3].isdigit():
            continue
        key = re.sub(r"[^a-z0-9]+", " ", fields[0].replace("_", " ").lower()).strip()
        if key in entries or not re.fullmatch(r"[a-z][a-z' -]{0,100}", key):
            continue
        for offset in fields[6 + int(fields[3]):]:
            translation = synsets.get(f"{int(offset)}-{pos}")
            if translation and translation.casefold() != key:
                entries[key] = translation
                break

overrides = json.loads((ROOT / "scripts/reading-lexicon-overrides.json").read_text(encoding="utf-8"))
entries.update(overrides)
target = ROOT / "dist/reading-lexicon.json"
target.write_text(json.dumps({"verified": overrides, "words": dict(sorted(entries.items()))}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {len(entries)} bilingual entries to {target} ({target.stat().st_size:,} bytes)")
