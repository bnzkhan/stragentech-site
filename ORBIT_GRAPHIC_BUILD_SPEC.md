# Build Spec — Agentic Operational Intelligence Orbit Graphic (with Human-in-the-Loop)

## Objective
Replace the current static "Agentic Operational Intelligence" card in the hero section of `index.html` with an animated circular orbit graphic. A teal pulse continuously revolves (14s per revolution) around a ring, lighting up three agent nodes as it passes each: **agent.detect** (top), **agent.investigate** (lower-right), **agent.act** (lower-left). The center hub reads "Agentic Operational Intelligence" with an "autonomous" status line and a slow-blinking orange light. A small **human-in-the-loop (HITL)** marker revolves on a dotted ring centered on the **agent.act** node, depicting human oversight of the corrective-action stage.

The graphic **must follow the site's existing light/dark theme automatically** — it is a single theme-aware component, not two hardcoded copies.

---

## STEP 1 — Detect the site's theme mechanism (do this first)

Before implementing, determine how the site toggles light/dark. Check `index.html` and CSS/JS for one of:
- A class on `<html>` or `<body>` — e.g. `class="dark"` / `class="dark-mode"`
- A `data-theme="dark"` attribute
- Reliance on the `prefers-color-scheme` media query only

Wire the component's theme variables (STEP 2) to that **same** mechanism. The CSS below assumes a `.dark` class on a parent element. **Adapt the dark-mode selector** to match reality: if the site uses `data-theme="dark"`, replace `.dark` with `[data-theme="dark"]`; if it uses `.dark-mode`, use that; if it's OS-only, use the `prefers-color-scheme` fallback block noted in STEP 2.

---

## STEP 2 — Theme-aware CSS variables

Add these tokens. **Reuse the site's existing theme tokens where equivalents already exist** (surface, border, text colors). Only the accent values (teal, orange, hitl) need to be new.

```css
:root {
  --orbit-track:      #e8eaee;
  --orbit-hub-bg:     #ffffff;
  --orbit-hub-border: #e8eaee;
  --orbit-node-bg:    #ffffff;
  --orbit-node-border:#e8eaee;
  --orbit-title:      #0d1117;
  --orbit-name:       #0d1117;
  --orbit-desc:       #8b92a0;
  --orbit-sub:        #8b92a0;
  --orbit-teal:       #00b87a;
  --orbit-teal-dark:  #008f5e;
  --orbit-teal-pale:  #e8faf3;
  --orbit-orange:     #ff9500;
  --orbit-hitl:       #5b6b82;
  --orbit-hitl-dots:  rgba(139,146,160,0.38);  /* dotted ring */
  --orbit-hitl-bg:    rgba(255,255,255,0.55);   /* semi-opaque badge */
  --orbit-hitl-border:rgba(91,107,130,0.40);
}

/* DARK MODE — change ".dark" to match the site's actual toggle */
.dark {
  --orbit-track:      rgba(255,255,255,0.08);
  --orbit-hub-bg:     rgba(255,255,255,0.03);
  --orbit-hub-border: rgba(255,255,255,0.08);
  --orbit-node-bg:    rgba(255,255,255,0.04);
  --orbit-node-border:rgba(255,255,255,0.10);
  --orbit-title:      #ffffff;
  --orbit-name:       rgba(255,255,255,0.85);
  --orbit-desc:       rgba(255,255,255,0.40);
  --orbit-sub:        rgba(255,255,255,0.45);
  --orbit-teal:       #00b87a;
  --orbit-teal-dark:  #00b87a;
  --orbit-teal-pale:  rgba(0,184,122,0.12);
  --orbit-orange:     #ff9500;
  --orbit-hitl:       #aab4c6;
  --orbit-hitl-dots:  rgba(255,255,255,0.22);
  --orbit-hitl-bg:    rgba(255,255,255,0.10);
  --orbit-hitl-border:rgba(255,255,255,0.22);
}

/* Fallback ONLY if the site relies purely on OS preference (no manual toggle):
   delete the .dark block above and use this instead.
@media (prefers-color-scheme: dark) {
  :root { --orbit-track: rgba(255,255,255,0.08); ... etc, same values as .dark ... }
}
*/
```

---

## STEP 3 — Component CSS

```css
.orbit{position:relative;width:500px;height:500px;--orbit-dur:14s;max-width:100%;aspect-ratio:1/1;}
.orbit .rsvg{position:absolute;inset:0;width:100%;height:100%;}
.orbit .rotor{transform-origin:250px 250px;animation:orbit-spin var(--orbit-dur) linear infinite;}
@keyframes orbit-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.orbit .track-ring{fill:none;stroke:var(--orbit-track);stroke-width:1.5;}
.orbit .progress-arc{fill:none;stroke:var(--orbit-teal);stroke-width:2.5;stroke-linecap:round;}
.orbit .hub-bg{fill:var(--orbit-hub-bg);stroke:var(--orbit-hub-border);stroke-width:1;}
.orbit .spoke{stroke:var(--orbit-track);stroke-width:1;}

.orbit .center-label{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:190px;}
.orbit .center-title{font-family:var(--font-serif,'Instrument Serif',serif);font-size:26px;line-height:1.06;color:var(--orbit-title);letter-spacing:-0.2px;}
.orbit .center-sub{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:10px;color:var(--orbit-sub);letter-spacing:1.5px;margin-top:13px;}
.orbit .status-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--orbit-orange);margin-right:6px;vertical-align:middle;animation:orbit-blink 2.6s ease-in-out infinite;}
@keyframes orbit-blink{0%,100%{opacity:1}50%{opacity:0.18}}

.orbit .node{position:absolute;width:130px;transform:translate(-50%,-50%);text-align:center;}
.orbit .node-dot{width:58px;height:58px;border-radius:50%;margin:0 auto 9px;display:flex;align-items:center;justify-content:center;background:var(--orbit-node-bg);border:1.5px solid var(--orbit-node-border);transition:all .4s;overflow:hidden;position:relative;z-index:2;}
.orbit .node.active .node-dot{border-color:var(--orbit-teal);background:var(--orbit-teal-pale);box-shadow:0 0 0 6px rgba(0,184,122,0.10),0 8px 24px rgba(0,184,122,0.18);transform:scale(1.08);}
.orbit .node-name{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:11.5px;font-weight:500;color:var(--orbit-name);letter-spacing:0.5px;transition:color .4s;}
.orbit .node.active .node-name{color:var(--orbit-teal-dark);}
.orbit .node-desc{font-family:var(--font-body,'DM Sans',sans-serif);font-size:9.5px;color:var(--orbit-desc);line-height:1.4;font-weight:300;margin-top:3px;}
.orbit .icon{width:42px;height:42px;}
.orbit .icon .st{stroke:var(--orbit-teal);fill:none;}
.orbit .icon .fl{fill:var(--orbit-teal);}

/* ── HITL local orbit, centered on the agent.act node-dot ── */
.orbit .act-hitl{position:absolute;width:104px;height:104px;transform:translate(-50%,-50%);pointer-events:none;z-index:1;}
.orbit .hitl-dotted{position:absolute;inset:0;border-radius:50%;border:1.5px dotted var(--orbit-hitl-dots);}
.orbit .hitl-rotor{position:absolute;inset:0;transform-origin:center;animation:orbit-spin 11s linear infinite;}
.orbit .hitl-mini{
  position:absolute;top:0;left:50%;width:34px;height:34px;border-radius:50%;
  background:var(--orbit-hitl-bg);border:1px solid var(--orbit-hitl-border);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(13,17,23,0.06);
  backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px);
  animation:orbit-spinrev 11s linear infinite;transform-origin:center;
}
@keyframes orbit-spinrev{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(-360deg)}}
.orbit .hitl-mini svg{width:16px;height:16px;margin-top:1px;}
.orbit .hitl-mini svg path,.orbit .hitl-mini svg circle{fill:var(--orbit-hitl);}
.orbit .hitl-mini .lbl{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:5px;font-weight:600;color:var(--orbit-hitl);letter-spacing:0.5px;line-height:1;}

@media(max-width:520px){
  .orbit{width:340px;height:340px;}
  .orbit .node{width:104px;}
  .orbit .node-dot{width:50px;height:50px;}
  .orbit .icon{width:34px;height:34px;}
  .orbit .center-title{font-size:21px;}
  .orbit .center-label{width:150px;}
  .orbit .act-hitl{width:88px;height:88px;}
  .orbit .hitl-mini{width:30px;height:30px;}
  .orbit .hitl-mini svg{width:14px;height:14px;}
}

/* respect reduced-motion */
@media (prefers-reduced-motion: reduce){
  .orbit .rotor,.orbit .status-dot,.orbit .hitl-rotor,.orbit .hitl-mini{animation:none;}
  .orbit .icon .radar-sweep{display:none;}
}
```

---

## STEP 4 — Component HTML

Place where the current AOI card sits in the hero (right column). Replace the existing `.hero-card` block entirely.

```html
<div class="orbit" aria-label="Agentic Operational Intelligence loop: detect, investigate, act, with human oversight on the act stage">
  <svg class="rsvg" viewBox="0 0 500 500" aria-hidden="true">
    <g class="spokes"></g>
    <circle class="track-ring" cx="250" cy="250" r="150"/>
    <g class="rotor">
      <circle class="progress-arc" cx="250" cy="250" r="150" stroke-dasharray="90 852"/>
      <circle cx="250" cy="100" r="6" fill="#00b87a"/>
    </g>
    <circle class="hub-bg" cx="250" cy="250" r="92"/>
  </svg>

  <div class="center-label">
    <div class="center-title">Agentic<br>Operational<br>Intelligence</div>
    <div class="center-sub"><span class="status-dot"></span>autonomous</div>
  </div>

  <!-- agent.detect (top, 12 o'clock) — animated radar -->
  <div class="node detect-node" data-i="0" style="left:50%;top:20%;">
    <div class="node-dot">
      <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="orbitSweep" x1="24" y1="24" x2="24" y2="3" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#00b87a" stop-opacity="0.35"/>
            <stop offset="1" stop-color="#00b87a" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="21" class="st" stroke-opacity="0.55" stroke-width="1.2" fill="rgba(0,184,122,0.05)"/>
        <circle cx="24" cy="24" r="14" class="st" stroke-opacity="0.30" stroke-width="1"/>
        <circle cx="24" cy="24" r="7"  class="st" stroke-opacity="0.30" stroke-width="1"/>
        <line x1="24" y1="3" x2="24" y2="45" class="st" stroke-opacity="0.22" stroke-width="0.8"/>
        <line x1="3" y1="24" x2="45" y2="24" class="st" stroke-opacity="0.22" stroke-width="0.8"/>
        <g class="radar-sweep">
          <path d="M24 24 L24 3 A21 21 0 0 1 37.5 7.9 Z" fill="url(#orbitSweep)"/>
          <line x1="24" y1="24" x2="24" y2="3" class="st" stroke-width="1.5" stroke-opacity="0.9"/>
          <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="3s" repeatCount="indefinite"/>
        </g>
        <circle cx="33" cy="15" r="1.6" class="fl"/>
        <circle cx="24" cy="24" r="2.4" class="fl"/>
      </svg>
    </div>
    <div class="node-name">agent.detect</div>
    <div class="node-desc">Signal ingestion &amp; anomaly detection</div>
  </div>

  <!-- agent.investigate (lower-right, 4 o'clock) — magnifying glass over nodes -->
  <div class="node" data-i="1" style="left:80%;top:65%;">
    <div class="node-dot">
      <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
        <g class="st" stroke-width="1.4" stroke-opacity="0.75">
          <line x1="21" y1="21" x2="13" y2="13"/>
          <line x1="21" y1="21" x2="30" y2="14"/>
          <line x1="21" y1="21" x2="15" y2="30"/>
          <line x1="21" y1="21" x2="29" y2="29"/>
        </g>
        <g class="fl">
          <circle cx="21" cy="21" r="2.4"/>
          <circle cx="13" cy="13" r="1.8"/>
          <circle cx="30" cy="14" r="1.8"/>
          <circle cx="15" cy="30" r="1.8"/>
          <circle cx="29" cy="29" r="1.8"/>
        </g>
        <circle cx="21" cy="21" r="15" class="st" stroke-width="2.2" fill="none"/>
        <line x1="32" y1="32" x2="42" y2="42" class="st" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="node-name">agent.investigate</div>
    <div class="node-desc">Cross-references context &amp; history</div>
  </div>

  <!-- agent.act (lower-left, 8 o'clock) — lightning bolt -->
  <div class="node" data-i="2" style="left:20%;top:65%;">
    <div class="node-dot">
      <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M27 5 L13 27 L22 27 L19 43 L35 20 L26 20 L30 5 Z" class="fl"/>
      </svg>
    </div>
    <div class="node-name">agent.act</div>
    <div class="node-desc">Corrective Action</div>
  </div>

  <!-- Human-in-the-loop marker, centered on the agent.act node-dot.
       NOTE: top is 60.2% (not 65%) so the dotted ring centers on the ACT
       ICON, not the act text block. If you reposition the act node, keep
       act-hitl's left equal to the act node's left, and set its top so the
       dotted ring is concentric with the act node-dot. -->
  <div class="act-hitl" style="left:20%;top:60.2%;" aria-hidden="true">
    <div class="hitl-dotted"></div>
    <div class="hitl-rotor">
      <div class="hitl-mini">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5 C4.5 15 8 13.6 12 13.6 C16 13.6 19.5 15 19.5 20.5 Z"/></svg>
        <span class="lbl">HITL</span>
      </div>
    </div>
  </div>
</div>
```

---

## STEP 5 — Component JavaScript

Add once before `</body>` (or in the site's main JS). Draws the spokes and syncs node highlights to the revolving pulse.

```javascript
(function(){
  const DUR = 14000; // MUST equal --orbit-dur (14s). Change both together if you alter speed.
  const orbit = document.querySelector('.orbit');
  if(!orbit) return;

  // hub-to-node spokes (500-unit coordinate space, center 250, hub r=92, node r=150)
  const spokes = orbit.querySelector('.spokes');
  [-90, 30, 150].forEach(a => {
    const rad = a*Math.PI/180, hubR = 92, nodeR = 150;
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1', 250+hubR*Math.cos(rad));
    l.setAttribute('y1', 250+hubR*Math.sin(rad));
    l.setAttribute('x2', 250+nodeR*Math.cos(rad));
    l.setAttribute('y2', 250+nodeR*Math.sin(rad));
    l.setAttribute('class','spoke');
    spokes.appendChild(l);
  });

  // highlight the node the pulse is passing: top -> 4 o'clock -> 8 o'clock
  const nodes = orbit.querySelectorAll('.node');
  function tick(){
    const t = (performance.now() % DUR) / DUR;
    let active = 0;
    if(t >= 0.16 && t < 0.5) active = 1;
    else if(t >= 0.5 && t < 0.83) active = 2;
    nodes.forEach(n => n.classList.toggle('active', parseInt(n.dataset.i) === active));
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
```

---

## STEP 6 — Notes & options

- **Speed:** revolution is 14s (`--orbit-dur`) — a calm, premium pace. The HITL marker orbits its own ring at 11s. If you change `--orbit-dur`, also change the `DUR` constant in the JS so highlights stay in sync.
- **HITL centering:** the `.act-hitl` element's `top` is `60.2%` while the act node's `top` is `65%`. This 4.8% offset lifts the dotted ring so it is concentric with the act **icon circle**, not the act text block. If you move the act node, recompute this offset. The dotted ring and the human badge should visually center on the lightning-bolt circle.
- **Fonts:** CSS references `--font-serif`, `--font-mono`, `--font-body` with fallbacks to Instrument Serif / JetBrains Mono / DM Sans. Reuse the site's font tokens if named differently; fallbacks keep it working regardless.
- **Sizing:** orbit is 500×500 with `max-width:100%` and `aspect-ratio:1/1`, scaling down responsively. A mobile breakpoint at 520px shrinks it.
- **Accessibility:** `aria-label` describes the loop; decorative SVG/HITL are `aria-hidden`. `prefers-reduced-motion` stops all motion — keep it.

---

## Acceptance criteria
1. Teal pulse revolves continuously around the ring at 14s per revolution.
2. Each node (detect -> investigate -> act) lights up in order as the pulse passes.
3. The radar sweep inside agent.detect rotates continuously.
4. The orange "autonomous" light blinks slowly.
5. A dotted ring is centered on the agent.act icon circle, with a semi-opaque human/HITL badge revolving around it, staying upright, "HITL" legible beneath the person.
6. agent.act node reads "Corrective Action".
7. The whole graphic — including the HITL dotted ring, badge, and person — switches colors correctly when the site toggles light/dark. No hardcoded light-only or dark-only colors remain (verify by toggling).
8. On mobile widths the graphic scales down and stays legible.
9. `prefers-reduced-motion` disables all animation.
