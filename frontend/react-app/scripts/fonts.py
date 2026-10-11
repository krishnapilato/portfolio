"""
Dev-time font preparation (not part of `npm run build`).

Cuts Newsreader down to what the page uses, so the reading serif keeps its
optical sizes at a fraction of the download:
  - roman: weight 300..400, optical size 16..72 (variable)
  - italic: one static instance, weight 300 at optical size 60 (chapter heads)

Usage: python3 scripts/fonts.py <path to @fontsource-variable/newsreader/files>
Writes public/fonts/Newsreader-roman.woff2 and Newsreader-italic-300.woff2.

Fallback metrics used in index.html (from @capsizecss/metrics):
  Newsreader  upm 2000, ascent 1470, descent -530, xWidthAvg 857
  Georgia     upm 2048,                          xWidthAvg 913
  size-adjust = (857/2000) / (913/2048) = 96.12%
  ascent-override = 73.5% / 0.9612 = 76.47%; descent-override = 26.5% / 0.9612 = 27.57%
  IBM Plex Mono (600/1000) vs Courier New (1229/2048): size-adjust 100%,
  ascent-override 102.5%, descent-override 27.5%.
"""
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

src = sys.argv[1] if len(sys.argv) > 1 else "node_modules/@fontsource-variable/newsreader/files"
out = os.path.join(os.path.dirname(__file__), "..", "public", "fonts")


def cut(name, limits, target):
    font = TTFont(os.path.join(src, name))
    instantiateVariableFont(font, limits, inplace=True, updateFontNames=False)
    font.flavor = "woff2"
    path = os.path.join(out, target)
    font.save(path)
    print(f"{target}: {os.path.getsize(path) / 1024:.1f} KB")


cut("newsreader-latin-opsz-normal.woff2", {"wght": (300, 400), "opsz": (16, 72)}, "Newsreader-roman.woff2")
cut("newsreader-latin-opsz-italic.woff2", {"wght": 300, "opsz": 60}, "Newsreader-italic-300.woff2")
