"""Release preflight checks that do not require third-party Python packages."""
from __future__ import annotations
import json
import pathlib
import py_compile
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
errors = []

required = [
    "package.json", "package-lock.json", "README.md", "DEPLOYMENT.md",
    "MIGRATIONS.md", "Dockerfile.backend", "docker-compose.yml",
    "backend/app.py", "backend/requirements.txt", ".env.example",
]
for rel in required:
    if not (ROOT / rel).exists():
        errors.append(f"Missing required file: {rel}")

try:
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    for key in ("dev", "build"):
        if key not in package.get("scripts", {}):
            errors.append(f"Missing npm script: {key}")
except Exception as exc:
    errors.append(f"Invalid package.json: {exc}")

try:
    py_compile.compile(str(ROOT / "backend/app.py"), doraise=True)
except Exception as exc:
    errors.append(f"Backend syntax error: {exc}")

for rel in ("backend/mockBooks.json", "backend/mockUsers.json", "backend/mockLoans.json"):
    try:
        json.loads((ROOT / rel).read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"Invalid JSON in {rel}: {exc}")

if errors:
    print("PREFLIGHT FAILED")
    print("\n".join(f"- {e}" for e in errors))
    sys.exit(1)

print("PREFLIGHT PASSED")
print("- Required release files present")
print("- package.json valid")
print("- backend/app.py syntax valid")
print("- bundled mock JSON valid")
