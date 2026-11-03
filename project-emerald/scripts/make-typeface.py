#!/usr/bin/env python3
"""Generates public/fonts/lora-medium.typeface.json (three.js typeface format) from Lora (SIL OFL).
Only needed if you want to regenerate the 3D text font. Requires: pip install fonttools
Usage: python3 scripts/make-typeface.py /path/to/Lora-Variable.ttf
"""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.basePen import BasePen

src = sys.argv[1] if len(sys.argv) > 1 else "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf"
font = TTFont(src)
if "fvar" in font:
    font = instancer.instantiateVariableFont(font, {"wght": 500})
gs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font["head"].unitsPerEm
hmtx = font["hmtx"]

class Pen(BasePen):
    def __init__(self, gs):
        super().__init__(gs); self.cmds = []
    def _moveTo(self, p): self.cmds.append(f"m {round(p[0])} {round(p[1])}")
    def _lineTo(self, p): self.cmds.append(f"l {round(p[0])} {round(p[1])}")
    # three.js typeface: q <endX> <endY> <ctrlX> <ctrlY>
    def _qCurveToOne(self, c, p): self.cmds.append(f"q {round(p[0])} {round(p[1])} {round(c[0])} {round(c[1])}")
    # b <endX> <endY> <c1X> <c1Y> <c2X> <c2Y>
    def _curveToOne(self, c1, c2, p): self.cmds.append(f"b {round(p[0])} {round(p[1])} {round(c1[0])} {round(c1[1])} {round(c2[0])} {round(c2[1])}")
    def _closePath(self): pass

chars = [chr(c) for c in range(32, 127)]
glyphs = {}
for ch in chars:
    name = cmap.get(ord(ch))
    if not name: continue
    pen = Pen(gs); gs[name].draw(pen)
    adv = hmtx[name][0]
    glyphs[ch] = {"ha": adv, "x_min": 0, "x_max": adv, "o": " ".join(pen.cmds)}

os2 = font["OS/2"]
out = {
    "glyphs": glyphs, "familyName": "Lora", "ascender": os2.sTypoAscender, "descender": os2.sTypoDescender,
    "underlinePosition": font["post"].underlinePosition, "underlineThickness": font["post"].underlineThickness,
    "boundingBox": {"yMin": font["head"].yMin, "xMin": font["head"].xMin, "yMax": font["head"].yMax, "xMax": font["head"].xMax},
    "resolution": upm, "original_font_information": {"copyright": "Lora, SIL Open Font License 1.1"},
}
dst = "public/fonts/lora-medium.typeface.json"
json.dump(out, open(dst, "w"), separators=(",", ":"))
print("glyphs:", len(glyphs), "upm:", upm, "bytes:", len(json.dumps(out)))
