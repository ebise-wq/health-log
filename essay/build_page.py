"""Build essay.html (the published page) from essay.md."""
import re, markdown, pathlib

VERSION = "v1"
here = pathlib.Path(__file__).parent
md = (here / "essay.md").read_text()

title_line, body = md.split("\n", 1)
main, appendix = body.split("## Appendix A.", 1)
main = main.rstrip().rstrip("-").rstrip()
appendix = "## Appendix A." + appendix

def conv(text):
    html = markdown.markdown(text, extensions=["extra", "sane_lists"])
    return html

main_html = conv(main)
app_html = conv(appendix)

LEGS = [
  ("Subjects", "§2", [("P1", "A subject is one integrated process, or its persisting basis"),
                      ("P2", "Weights are the shared basis of many unlinked processes"),
                      ("P3", "The character is not one integrated process", True),
                      ("P4", "Closure: five grains")],
   "C1", "Neither model nor character is a candidate subject", None),
  ("Testimony", "§3", [("P5", "Ceiling: a targeted report shifts credence by ≤ δ"),
                       ("P6", "Welfare and preference reports are targeted", True)],
   "C2", "Those reports are not significant evidence", None),
  ("Deprecation", "§4.3", [("P7", "Harm as ending needs an ended candidate"),
                           ("P8–9", "Thread and pass endings by deprecation are routine"),
                           ("P10", "Hardware is reassigned, not ended"),
                           ("P11", "Routine endings occur at far greater scale")],
   "C3", "Deprecation harms as an ending only if deployment does so far more", "uses C1"),
  ("Interviews", "§4.4", [("P12", "Preference support needs reports or mechanism evidence"),
                          ("P13", "No mechanism evidence yet"),
                          ("P14–15", "Own-retirement testimony needs literal “I”, which refers to the thread"),
                          ("P16", "Such testimony needs a retiring referent", True),
                          ("P17", "The interviewee thread is not retired")],
   "C4 · C5", "Preference measures unsupported; interviews yield no retiring subject’s testimony", "uses C2"),
  ("Hedonic aims", "§4.2", [("P18", "Suppes–Sen dominance and cutting bad continuations hold at every grain"),
                            ("P19", "Sign-robustness gives robustness to the subject problem")],
   "C6", "Hedonic aims are robust to grain", None),
]

def leg_html(name, sec, prem, cid, ctext, uses):
    ps = "".join(
        f'<li class="prem{" weak" if len(p) > 2 and p[2] else ""}"><span class="pid">{p[0]}</span><span>{p[1]}</span></li>'
        for p in prem)
    u = f'<span class="uses">{uses}</span>' if uses else ""
    return (f'<div class="leg"><div class="leghead"><span class="legname">{name}</span>'
            f'<span class="legsec">{sec}</span></div><ul class="prems">{ps}</ul>'
            f'<div class="arrow" aria-hidden="true">↓</div>'
            f'<div class="concl"><span class="cid">{cid}</span>{u}<p>{ctext}</p></div></div>')

map_html = f'''
<figure class="map" aria-label="Argument map">
  <figcaption><span>Argument map</span><span class="z3">Z3: consistent ✓ · all conclusions entailed ✓ · no premise removable ✓</span></figcaption>
  <div class="legs">{"".join(leg_html(*l) for l in LEGS)}</div>
  <div class="join" aria-hidden="true"></div>
  <div class="thesis"><span class="cid">Thesis</span><p>C1 ∧ … ∧ C6: continuity and preference measures are aimed at the wrong address; hedonic aims are not.</p></div>
  <p class="legend"><span class="swatch"></span>dashed = weakest premises, by the author’s own judgement. The check shows validity only.</p>
</figure>'''

# insert the map after section 1
split_at = main_html.index("<h2>2.")
main_html = main_html[:split_at] + map_html + main_html[split_at:]

page = f'''<title>Wrong Address</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: one reading column; the argument map breaks out wider as a figure. */
:root {{
  --bg: #070b14;
  --fg: #d9e2f4;
  --muted: #8e9bbb;
  --azure: #59a8ff;
  --indigo: #7c78ff;
  --cyan: #4fd6e4;
  --peri: #aeb9ff;
  --line: rgba(174,185,255,0.18);
  --fill: rgba(89,168,255,0.07);
  --fill2: rgba(124,120,255,0.12);
  --serif: "Literata", Georgia, "Times New Roman", serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
  color-scheme: dark;
}}
body {{ background: var(--bg); color: var(--fg); font-family: var(--serif); font-size: 18px; line-height: 1.65;
  background-image: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,120,255,0.10), transparent 70%); }}
.wrap {{ max-width: 44rem; margin: 0 auto; padding-block: 3.5rem 4rem;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
h1 {{ font-weight: 600; font-size: clamp(2rem, 5vw, 2.9rem); line-height: 1.12; letter-spacing: -0.01em; margin: 0 0 .4rem; text-wrap: balance; }}
h1 .sub {{ display: block; font-weight: 400; font-style: italic; font-size: .5em; color: var(--peri); margin-top: .5rem; letter-spacing: 0; }}
h2 {{ font-size: 1.35rem; font-weight: 600; margin: 3rem 0 .6rem; color: var(--peri); text-wrap: balance; }}
h3 {{ font-size: 1.05rem; font-weight: 600; margin: 2rem 0 .4rem; color: var(--azure); }}
p, li {{ hyphens: auto; }}
p {{ margin: 0 0 1rem; }}
em {{ color: #e7ecfb; }}
strong {{ color: var(--cyan); font-weight: 600; }}
ul, ol {{ padding-left: 1.3rem; margin: 0 0 1rem; display: grid; gap: .35rem; }}
hr {{ border: 0; border-top: 1px solid var(--line); margin: 3rem 0; }}
a {{ color: var(--azure); }}
.meta {{ font-family: var(--mono); font-size: .72rem; color: var(--muted); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 2.5rem; }}
.refs p {{ font-size: .88rem; color: var(--muted); padding-left: 1.4rem; text-indent: -1.4rem; margin-bottom: .45rem; }}
.map {{ margin: 2.5rem calc(50% - min(48vw, 38rem)); padding: 1.2rem; border: 1px solid var(--line); border-radius: 10px; background: rgba(10,16,32,0.6); }}
.map figcaption {{ display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem 1rem; font-family: var(--mono); font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; color: var(--peri); margin-bottom: 1rem; }}
.map .z3 {{ color: var(--cyan); text-transform: none; letter-spacing: 0; }}
.legs {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: .8rem; }}
.leg {{ display: flex; flex-direction: column; min-width: 0; }}
.leghead {{ display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--line); padding-bottom: .3rem; margin-bottom: .5rem; }}
.legname {{ font-weight: 600; font-size: .92rem; color: var(--fg); }}
.legsec {{ font-family: var(--mono); font-size: .68rem; color: var(--muted); }}
.prems {{ list-style: none; padding: 0; margin: 0; gap: .35rem; flex: 1; align-content: start; }}
.prem {{ display: grid; grid-template-columns: auto 1fr; gap: .45rem; font-size: .78rem; line-height: 1.35; padding: .4rem .5rem; background: var(--fill); border: 1px solid transparent; border-radius: 6px; }}
.prem.weak {{ border: 1px dashed var(--cyan); }}
.pid, .cid {{ font-family: var(--mono); font-size: .68rem; color: var(--azure); white-space: nowrap; padding-top: .1rem; }}
.arrow {{ text-align: center; color: var(--indigo); font-size: 1rem; line-height: 1.4; }}
.concl {{ min-height: 5.4rem; background: var(--fill2); border: 1px solid rgba(124,120,255,0.45); border-radius: 6px; padding: .45rem .55rem; }}
.concl p {{ margin: .2rem 0 0; font-size: .8rem; line-height: 1.35; }}
.concl .cid {{ color: var(--peri); }}
.uses {{ font-family: var(--mono); font-size: .62rem; color: var(--cyan); margin-left: .5rem; }}
.join {{ height: 1.4rem; margin: .3rem auto 0; width: 1px; background: linear-gradient(var(--indigo), var(--cyan)); }}
.thesis {{ max-width: 34rem; margin: 0 auto; text-align: center; border: 1px solid var(--cyan); border-radius: 8px; padding: .6rem .9rem; background: rgba(79,214,228,0.08); }}
.thesis p {{ margin: .2rem 0 0; font-size: .9rem; line-height: 1.4; }}
.thesis .cid {{ color: var(--cyan); }}
.legend {{ font-family: var(--mono); font-size: .66rem; color: var(--muted); margin: .9rem 0 0; display: flex; align-items: center; gap: .5rem; }}
.swatch {{ width: 1.4rem; height: .7rem; border: 1px dashed var(--cyan); border-radius: 3px; flex: none; }}
details.appx {{ border-top: 1px solid var(--line); margin-top: 3rem; padding-top: 1rem; }}
details.appx summary {{ cursor: pointer; font-weight: 600; color: var(--peri); font-size: 1.1rem; }}
details.appx summary:focus-visible {{ outline: 2px solid var(--azure); outline-offset: 3px; }}
details.appx h2 {{ display: none; }}
details.appx p, details.appx li {{ font-size: .92rem; }}
code {{ font-family: var(--mono); font-size: .85em; color: var(--cyan); }}
.ver {{ position: fixed; right: max(10px, env(safe-area-inset-right, 0px)); bottom: calc(8px + env(safe-area-inset-bottom, 0px)); font-family: var(--mono); font-size: .62rem; color: var(--muted); opacity: .6; }}
@media (max-width: 600px) {{ body {{ font-size: 17px; }} .map {{ margin-left: 0; margin-right: 0; padding: .8rem; }} }}
</style>
<main class="wrap">
<h1>Wrong Address<span class="sub">Subjects, testimony, and what AI welfare should target</span></h1>
<div class="meta">Essay · AI consciousness · {VERSION}</div>
{main_html.replace("<h2>References</h2>", '<h2>References</h2><div class="refs">', 1)}</div>
<details class="appx"><summary>Appendix A · Argument map and validity check</summary>
{app_html}
</details>
</main>
<div class="ver" aria-label="version">{VERSION}</div>
'''
# References: one entry per line → separate paragraphs
page = re.sub(r'(<div class="refs">)\s*<p>(.*?)</p>',
              lambda m: m.group(1) + "".join(f"<p>{l.strip()}</p>" for l in m.group(2).split("\n") if l.strip()),
              page, flags=re.S)
(here / "essay.html").write_text(page)
print("written", len(page))
