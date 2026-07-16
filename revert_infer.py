"""
revert_infer.py — undo the inferred-subject behaviour
=====================================================
Removes the "open on the subject you study most" fallback from HubPage.
`settings.defaultSubject` still works exactly as it did before; the tabs go
back to their original default for everyone else.

Leaves the rest of warm_hub/calm_hub (copy, spacing, SEO footer) alone.

    python revert_infer.py
"""
import os, re, shutil

HUB = "./src/pages/HubPage.jsx"

if not os.path.isfile(HUB):
    print("Run this from C:\\paper-explorer"); raise SystemExit(1)

src = open(HUB, encoding="utf-8").read()
if "mostStudiedSubject" not in src:
    print("Already reverted — nothing to do."); raise SystemExit(0)

if not os.path.isfile(HUB + ".bak4"):
    shutil.copyfile(HUB, HUB + ".bak4")

# the three lines calm_hub added
src = src.replace(
    "\n    // Nobody opens Settings. Infer it from what they actually answer.\n"
    "    const studied = mostStudiedSubject();\n"
    "    if (studied) return studied;", "")

# tidy the import back up
src = src.replace("import { hasStudyHistory, mostStudiedSubject } from '../utils/performance';",
                  "import { hasStudyHistory } from '../utils/performance';")
src = src.replace("import { mostStudiedSubject, hasStudyHistory } from '../utils/performance';",
                  "import { hasStudyHistory } from '../utils/performance';")
src = re.sub(r"\nimport \{ mostStudiedSubject \} from '\.\./utils/performance';", "", src)
src = src.replace(", mostStudiedSubject }", " }").replace("{ mostStudiedSubject, ", "{ ")

open(HUB, "w", encoding="utf-8").write(src)
print("Reverted: the tabs no longer infer your subject.")
print("settings.defaultSubject still works as before.")
print("(mostStudiedSubject() stays in performance.js, unused and harmless.)")
