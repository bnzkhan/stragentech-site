# Build Spec — Agentic Operational Intelligence Orbit Graphic

## Objective
Replace the current static "Agentic Operational Intelligence" card in the hero section of `index.html` with an animated circular orbit graphic. A teal pulse continuously revolves around a ring, lighting up three agent nodes as it passes each one: **agent.detect** (top), **agent.investigate** (lower-right), **agent.act** (lower-left). The center hub reads "Agentic Operational Intelligence" with an "autonomous" status line and a slow-blinking orange light.

The graphic **must follow the site's existing light/dark theme automatically** — it is a single theme-aware component, not two hardcoded variants.

---

## STEP 1 — Detect the site's theme mechanism (do this first)

Before implementing, determine how this site toggles light/dark mode. Check `index.html` and any CSS/JS for one of these patterns:

- A class on `<html>` or `<body>` — e.g. `class="dark"` or `class="dark-mode"`
- A `data-theme="dark"` attribute
- Reliance on the `prefers-color-scheme` media query only

Then wire the component's theme variables (STEP 2) to that **same** mechanism. The code below assumes a `.dark` class on a parent element **and** includes a `prefers-color-scheme` fallback. **Adapt the selectors** in the `:root` / `.dark` block to match whatever this site actually uses. If the site uses `data-theme="dark"`, change `.dark` to `[data-theme="dark"]`. If the hero lives inside a component with its own theme class, scope accordingly.

---

## STEP 2 — Theme-aware CSS variables

Add these variables. **Map them to the site's existing theme tokens if equivalents already exist** (e.g. if the site already defines `--surface`, `--border`, `--text`, reuse those instead of duplicating). Only the orbit-specific accent values (teal, orange) need to be new.

```css
/* Orbit graphic — theme-aware tokens.
   Adapt the light/dark selectors to match the site's theme mechanism. */
:root {
  --orbit-track:      #e8eaee;              /* ring + spokes */
  --orbit-hub-bg:     #ffffff;              /* center circle fill */
  --orbit-hub-border: #e8eaee;
  --orbit-node-bg:    #ffffff;              /* node circle fill */
  --orbit-node-border:#e8eaee;
  --orbit-title:      #0d1117;              /* center title text */
  --orbit-name:       #0d1117;              /* node name text */
  --orbit-desc:       #8b92a0;              /* node description text */
  --orbit-sub:        #8b92a0;              /* status line text */
  --orbit-teal:       #00b87a;
  --orbit-teal-dark:  #008f5e;
  --orbit-teal-pale:  #e8faf3;
  --orbit-orange:     #ff9500;              /* autonomous blink light */
}

/* DARK MODE — change ".dark" to match the site's actual toggle
   (e.g. [data-theme="dark"], .dark-mode, html.dark, etc.) */
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
}

/* Fallback: if the site relies ONLY on OS preference (no manual toggle),
   uncomment this block and delete the .dark block above.
@media (prefers-color-scheme: dark) {
  :root { --orbit-track: rgba(255,255,255,0.08); ...etc... }
}
*/
```

---

## STEP 3 — Component CSS

```css
.orbit{position:relative;width:460px;height:460px;--orbit-dur:14s;max-width:100%;aspect-ratio:1/1;}
.orbit .ring-svg{position:absolute;inset:0;width:100%;height:100%;}
.orbit .rotor{transform-origin:230px 230px;animation:orbit-spin var(--orbit-dur) linear infinite;}
@keyframes orbit-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.orbit .track-ring{fill:none;stroke:var(--orbit-track);stroke-width:1.5;}
.orbit .progress-arc{fill:none;stroke:var(--orbit-teal);stroke-width:2.5;stroke-linecap:round;}
.orbit .hub-bg{fill:var(--orbit-hub-bg);stroke:var(--orbit-hub-border);stroke-width:1;}
.orbit .spoke{stroke:var(--orbit-track);stroke-width:1;}

.orbit .center-label{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:186px;}
.orbit .center-title{font-family:var(--font-serif,'Instrument Serif',serif);font-size:27px;line-height:1.06;color:var(--orbit-title);letter-spacing:-0.2px;}
.orbit .center-sub{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:10px;color:var(--orbit-sub);letter-spacing:1.5px;margin-top:14px;}
.orbit .status-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--orbit-orange);margin-right:6px;vertical-align:middle;animation:orbit-blink 2.6s ease-in-out infinite;}
@keyframes orbit-blink{0%,100%{opacity:1}50%{opacity:0.18}}

.orbit .node{position:absolute;width:132px;transform:translate(-50%,-50%);text-align:center;}
.orbit .node-dot{width:60px;height:60px;border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:var(--orbit-node-bg);border:1.5px solid var(--orbit-node-border);transition:all .4s;}
.orbit .node.active .node-dot{border-color:var(--orbit-teal);background:var(--orbit-teal-pale);box-shadow:0 0 0 6px rgba(0,184,122,0.10),0 8px 28px rgba(0,184,122,0.18);transform:scale(1.08);}
.orbit .node-name{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:12px;font-weight:500;color:var(--orbit-name);letter-spacing:0.5px;transition:color .4s;}
.orbit .node.active .node-name{color:var(--orbit-teal-dark);}
.orbit .node-desc{font-family:var(--font-body,'DM Sans',sans-serif);font-size:10px;color:var(--orbit-desc);line-height:1.4;font-weight:300;margin-top:3px;}

/* inline SVG icons inside node dots */
.orbit .icon{width:44px;height:44px;display:block;}
.orbit .icon .stroke-teal{stroke:var(--orbit-teal);fill:none;}
.orbit .icon .fill-teal{fill:var(--orbit-teal);}

@media(max-width:520px){
  .orbit{width:340px;height:340px;}
  .orbit .node{width:104px;}
  .orbit .node-dot{width:50px;height:50px;}
  .orbit .icon{width:34px;height:34px;}
  .orbit .center-title{font-size:21px;}
  .orbit .center-label{width:150px;}
}

/* respect reduced-motion preference */
@media (prefers-reduced-motion: reduce){
  .orbit .rotor{animation:none;}
  .orbit .status-dot{animation:none;}
  .orbit .icon .radar-sweep{display:none;}
}
```

---

## STEP 4 — Component HTML

Place this where the current AOI card sits in the hero (right column). Replace the existing `.hero-card` (or equivalent) block entirely.

```html
<div class="orbit" aria-label="Agentic Operational Intelligence loop: detect, investigate, act">
  <svg class="ring-svg" viewBox="0 0 460 460" aria-hidden="true">
    <g class="spokes"></g>
    <circle class="track-ring" cx="230" cy="230" r="150"/>
    <g class="rotor">
      <circle class="progress-arc" cx="230" cy="230" r="150" stroke-dasharray="90 852"/>
      <circle cx="230" cy="80" r="6" fill="#00b87a"/>
    </g>
    <circle class="hub-bg" cx="230" cy="230" r="92"/>
  </svg>

  <div class="center-label">
    <div class="center-title">Agentic<br>Operational<br>Intelligence</div>
    <div class="center-sub"><span class="status-dot"></span>autonomous</div>
  </div>

  <!-- agent.detect (top, 12 o'clock) — animated radar -->
  <div class="node detect-node" data-i="0" style="left:50%;top:17.4%;">
    <div class="node-dot">
      <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="orbitSweep" x1="24" y1="24" x2="24" y2="3" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#00b87a" stop-opacity="0.35"/>
            <stop offset="1" stop-color="#00b87a" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="21" class="stroke-teal" stroke-opacity="0.55" stroke-width="1.2" fill="rgba(0,184,122,0.05)"/>
        <circle cx="24" cy="24" r="14" class="stroke-teal" stroke-opacity="0.30" stroke-width="1"/>
        <circle cx="24" cy="24" r="7"  class="stroke-teal" stroke-opacity="0.30" stroke-width="1"/>
        <line x1="24" y1="3" x2="24" y2="45" class="stroke-teal" stroke-opacity="0.22" stroke-width="0.8"/>
        <line x1="3" y1="24" x2="45" y2="24" class="stroke-teal" stroke-opacity="0.22" stroke-width="0.8"/>
        <g class="radar-sweep">
          <path d="M24 24 L24 3 A21 21 0 0 1 37.5 7.9 Z" fill="url(#orbitSweep)"/>
          <line x1="24" y1="24" x2="24" y2="3" class="stroke-teal" stroke-width="1.5" stroke-opacity="0.9"/>
          <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="3s" repeatCount="indefinite"/>
        </g>
        <circle cx="33" cy="15" r="1.6" class="fill-teal"/>
        <circle cx="24" cy="24" r="2.4" class="fill-teal"/>
      </svg>
    </div>
    <div class="node-name">agent.detect</div>
    <div class="node-desc">Signal ingestion &amp; anomaly detection</div>
  </div>

  <!-- agent.investigate (lower-right, 4 o'clock) — magnifying glass over nodes -->
  <div class="node" data-i="1" style="left:82.6%;top:67.4%;">
    <div class="node-dot">
      <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
        <g class="stroke-teal" stroke-width="1.4" stroke-opacity="0.75">
          <line x1="21" y1="21" x2="13" y2="13"/>
          <line x1="21" y1="21" x2="30" y2="14"/>
          <line x1="21" y1="21" x2="15" y2="30"/>
          <line x1="21" y1="21" x2="29" y2="29"/>
        </g>
        <g class="fill-teal">
          <circle cx="21" cy="21" r="2.4"/>
          <circle cx="13" cy="13" r="1.8"/>
          <circle cx="30" cy="14" r="1.8"/>
          <circle cx="15" cy="30" r="1.8"/>
          <circle cx="29" cy="29" r="1.8"/>
        </g>
        <circle cx="21" cy="21" r="15" class="stroke-teal" stroke-width="2.2" fill="none"/>
        <line x1="32" y1="32" x2="42" y2="42" class="stroke-teal" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="node-name">agent.investigate</div>
    <div class="node-desc">Cross-references context &amp; history</div>
  </div>

  <!-- agent.act (lower-left, 8 o'clock) — lightning bolt -->
  <div class="node" data-i="2" style="left:17.4%;top:67.4%;">
    <div class="node-dot">
      <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M27 5 L13 27 L22 27 L19 43 L35 20 L26 20 L30 5 Z"
              class="fill-teal" stroke="none"/>
      </svg>
    </div>
    <div class="node-name">agent.act</div>
    <div class="node-desc">Corrective action, no review queue</div>
  </div>
</div>
```

---

## STEP 5 — Component JavaScript

Add once, near the end of `index.html` before `</body>` (or in the site's main JS file). It draws the spokes and drives the node highlight in sync with the revolving pulse.

```javascript
(function(){
  const DUR = 14000; // MUST equal --orbit-dur (14s). If you change speed, change both.
  const orbit = document.querySelector('.orbit');
  if(!orbit) return;

  // draw hub-to-node spokes
  const spokes = orbit.querySelector('.spokes');
  [-90, 30, 150].forEach(a => {
    const rad = a*Math.PI/180, hubR = 92, nodeR = 150;
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1', 230+hubR*Math.cos(rad));
    l.setAttribute('y1', 230+hubR*Math.sin(rad));
    l.setAttribute('x2', 230+nodeR*Math.cos(rad));
    l.setAttribute('y2', 230+nodeR*Math.sin(rad));
    l.setAttribute('class','spoke');
    spokes.appendChild(l);
  });

  // highlight the node the pulse is currently passing (top -> 4 o'clock -> 8 o'clock)
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

- **Speed:** the ring revolution is set by `--orbit-dur` (14s = calm, 7s = active). If you change it, also change the `DUR` constant in the JS so the highlights stay in sync.
- **Fonts:** the CSS references `--font-serif`, `--font-mono`, `--font-body` with fallbacks to Instrument Serif / JetBrains Mono / DM Sans. If the site defines these tokens differently, the fallbacks still work.
- **Sizing:** the orbit is 460×460 with `max-width:100%` and `aspect-ratio:1/1`, so it scales down responsively. If the hero's right column is narrower than 460px, it will shrink to fit.
- **Accessibility:** an `aria-label` describes the loop; icons are `aria-hidden`. A `prefers-reduced-motion` rule stops all motion for users who request it — keep it.
- **Verify theme switching:** after implementing, toggle the site between light and dark and confirm the ring, hub, node circles, text, and radar all recolor correctly. If any element stays the wrong color, it's using a hardcoded value instead of an `--orbit-*` variable — fix that element to use the variable.

---

## Acceptance criteria
1. The teal pulse revolves continuously around the ring.
2. Each node (detect → investigate → act) lights up as the pulse passes it, in order.
3. The radar sweep inside agent.detect rotates continuously.
4. The orange "autonomous" light blinks slowly.
5. The whole graphic switches colors correctly when the site's light/dark mode is toggled — no hardcoded light-only or dark-only colors remain.
6. On mobile widths the graphic scales down and stays legible.
7. `prefers-reduced-motion` disables the animations.
