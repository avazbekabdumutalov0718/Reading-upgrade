"""Bundle public Site assets into the static Worker."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "dist"
FILES = [
    "index.html", "auth.html", "manifest.webmanifest", "service-worker.js", "pwa.js", "styles.css", "grammar.css", "tenses.css", "tenses.js", "mock.css", "daily.css", "mock-analysis.css", "max-speaking.css", "reading-booster.css", "listening-boost.css", "listening-engine.js", "listening-data.json", "writing-boost.css", "writing-engine.js", "writing-data.json", "app.js", "mock-local.mjs", "cloud.js", "cloud.css", "preparation.js", "preparation.css", "supabase-config.js", "tashkent-clock.js", "tashkent-clock.css", "autumn-theme.css", "autumn-theme.js", "imported-library.css", "imported-library.js",
    "data.json", "reading-lexicon.json", "reading-translations.json", "reading-wordnet-license.txt", "mock-analysis-health-sleep.json", "speaking-chunks.json", "speaking-questions.json", "topic-lab.json",
    "grammar-content.json", "v15-upgrade.css",
    "100day/index.html", "100day/app.js", "100day/style.css",
]
FILES.extend(path.name for path in sorted(PUBLIC.glob("speaking-part*.json")))
# Keep the merged Reading/Listening library usable in the bundled server build too.
for path in sorted((PUBLIC / "academy").rglob("*")):
    if path.is_file() and path.suffix.lower() in {".html", ".css", ".js", ".json", ".md", ".txt", ".ts"}:
        FILES.append(path.relative_to(PUBLIC).as_posix())
assets = {"/" + filename: (PUBLIC / filename).read_text() for filename in FILES}
assets["/"] = assets["/index.html"]
assets["/100day/"] = assets["/100day/index.html"]
binary_assets = {
    "/intro-ielts-max-v1.mp4": base64.b64encode((PUBLIC / "intro-ielts-max-v1.mp4").read_bytes()).decode("ascii"),
    "/intro-ielts-max-poster.jpg": base64.b64encode((PUBLIC / "intro-ielts-max-poster.jpg").read_bytes()).decode("ascii"),
    "/vivid-ielts-promo-v11.mp4": base64.b64encode((PUBLIC / "vivid-ielts-promo-v11.mp4").read_bytes()).decode("ascii"),
    "/vivid-ielts-promo-v11-poster.jpg": base64.b64encode((PUBLIC / "vivid-ielts-promo-v11-poster.jpg").read_bytes()).decode("ascii"),
    "/app-icon-192.png": base64.b64encode((PUBLIC / "app-icon-192.png").read_bytes()).decode("ascii"),
    "/app-icon-512.png": base64.b64encode((PUBLIC / "app-icon-512.png").read_bytes()).decode("ascii"),
}
for path in sorted((PUBLIC / "academy").rglob("*")):
    if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".mp4"}:
        rel = "/" + path.relative_to(PUBLIC).as_posix()
        # The auth video is used by the unified login; other visuals are small enough to preserve.
        if path.suffix.lower() != ".mp4" or path.name == "auth-bg.mp4":
            binary_assets[rel] = base64.b64encode(path.read_bytes()).decode("ascii")
source = (ROOT / "worker/mock-worker.js").read_text()
assert source.count("__PUBLIC_ASSETS__") == 1
assert source.count("__BINARY_ASSETS__") == 1
output = source.replace("__PUBLIC_ASSETS__", json.dumps(assets, ensure_ascii=False))
output = output.replace("__BINARY_ASSETS__", json.dumps(binary_assets))
target = PUBLIC / "server/index.js"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(output)
print("Worker built with", len(FILES), "public assets")
