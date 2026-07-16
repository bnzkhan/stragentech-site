// logo-marks.jsx — Stragentech hex-triad logo system
// Three POINTY-TOP hexagons packed tight in an apex-up pyramid (cellular /
// honeycomb, matching the original). Same size + border; each holds a distinct
// glyph (Strategy / Agentic / Technology) in one shared node-line style.
// Exports to window: StragentechLogo (+ icon set, Triad, Wordmark).

const SQ = 0.8660254; // sin(60) = cos(30)
const R = 130;        // hex circumradius

// pointy-top hexagon polygon points (centered at 0,0): vertex up/down,
// flat vertical edges left/right so neighbours nest cleanly.
function hexPoints(r) {
  const pts = [
    [0, -r], [r * SQ, -r / 2], [r * SQ, r / 2],
    [0, r], [-r * SQ, r / 2], [-r * SQ, -r / 2],
  ];
  return pts.map((p) => p.map((n) => +n.toFixed(2)).join(",")).join(" ");
}
const HEX = hexPoints(R);

// triad centers — tight honeycomb. The three centers form an equilateral
// triangle (perfect honeycomb when touching). To get a PRECISE, identical
// gap on all three shared edges we scale that triangle about its centroid by
// f = 1 + GAP/(2·apothem) — every pair then sits the same distance apart.
const AP = R * SQ;          // apothem (center → flat edge)
const GAP = 6;              // uniform edge gap in px
const F = 1 + GAP / (2 * AP);
const CY = 32.5;            // centroid y (vertical framing)
const POS = {
  top: [0, +(CY - 130 * F).toFixed(2)],
  bl: [-(AP * F).toFixed(2), +(CY + 65 * F).toFixed(2)],
  br: [+(AP * F).toFixed(2), +(CY + 65 * F).toFixed(2)],
};

/* ----------------------------------------------------------------- *
 * ICONS — each drawn centered at (0,0), fits roughly within ±66
 * props: c = line/stroke color, n = node color, sw = stroke width,
 *        nr = node radius
 * ----------------------------------------------------------------- */

function Node({ x, y, r, fill }) {
  return <circle cx={x} cy={y} r={r} fill={fill} />;
}

// STRATEGY — target / precision
function TargetIcon({ c, n, sw = 6.5, nr = 7 }) {
  return (
    <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <circle cx="0" cy="0" r="58" />
      <circle cx="0" cy="0" r="36" />
      {/* crosshair ticks */}
      <line x1="0" y1="-72" x2="0" y2="-50" />
      <line x1="0" y1="72" x2="0" y2="50" />
      <line x1="-72" y1="0" x2="-50" y2="0" />
      <line x1="72" y1="0" x2="50" y2="0" />
      {/* aim arrow into bullseye */}
      <line x1="44" y1="-44" x2="10" y2="-10" />
      <Node x={0} y={0} r={nr + 1} fill={n} />
      <g stroke="none" fill={n}>
        <path d="M50 -50 l-3 16 l16 -3 z" />
      </g>
    </g>
  );
}

// STRATEGY (alt) — compass / direction
function CompassIcon({ c, n, sw = 6.5, nr = 7 }) {
  return (
    <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="0" r="60" />
      {/* cardinal ticks */}
      <line x1="0" y1="-60" x2="0" y2="-46" />
      <line x1="0" y1="60" x2="0" y2="46" />
      <line x1="-60" y1="0" x2="-46" y2="0" />
      <line x1="60" y1="0" x2="46" y2="0" />
      {/* needle (NE) */}
      <g stroke="none">
        <path d="M0 0 L40 -40 L14 -8 Z" fill={n} />
        <path d="M0 0 L-40 40 L-14 8 Z" fill={c} opacity="0.55" />
      </g>
      <Node x={0} y={0} r={nr} fill={n} />
    </g>
  );
}

// AGENTIC — neural hub (autonomous agent: center + linked satellites)
function NeuralHubIcon({ c, n, sw = 5.5, nr = 7 }) {
  const sat = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    sat.push([Math.cos(a) * 56, Math.sin(a) * 56]);
  }
  return (
    <g>
      <g stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none">
        {/* spokes */}
        {sat.map((s, i) => <line key={"s" + i} x1="0" y1="0" x2={s[0].toFixed(1)} y2={s[1].toFixed(1)} />)}
        {/* outer ring links */}
        {sat.map((s, i) => {
          const nx = sat[(i + 1) % 6];
          return <line key={"r" + i} x1={s[0].toFixed(1)} y1={s[1].toFixed(1)} x2={nx[0].toFixed(1)} y2={nx[1].toFixed(1)} opacity="0.8" />;
        })}
      </g>
      <g fill={n}>
        {sat.map((s, i) => <Node key={"n" + i} x={s[0]} y={s[1]} r={nr} />)}
        <Node x={0} y={0} r={nr + 3} fill={n} />
      </g>
    </g>
  );
}

// AGENTIC (alt) — icosahedron mesh (echoes original apex)
function MeshIcon({ c, n, sw = 4.5, nr = 5.5 }) {
  // outer hex ring (6) + inner triangle (3) + center
  const out = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    out.push([Math.cos(a) * 62, Math.sin(a) * 62]);
  }
  const inn = [];
  for (let i = 0; i < 3; i++) {
    const a = (Math.PI * 2 / 3) * i - Math.PI / 2;
    inn.push([Math.cos(a) * 30, Math.sin(a) * 30]);
  }
  const lines = [];
  for (let i = 0; i < 6; i++) lines.push([out[i], out[(i + 1) % 6]]); // ring
  for (let i = 0; i < 3; i++) lines.push([inn[i], inn[(i + 1) % 3]]); // inner tri
  // connect inner to two nearest outer
  inn.forEach((p, i) => {
    lines.push([p, out[(i * 2) % 6]]);
    lines.push([p, out[(i * 2 + 1) % 6]]);
    lines.push([p, [0, 0]]);
  });
  out.forEach((p) => lines.push([p, [0, 0]]));
  const all = [...out, ...inn, [0, 0]];
  return (
    <g>
      <g stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" opacity="0.9">
        {lines.map((l, i) => (
          <line key={i} x1={l[0][0].toFixed(1)} y1={l[0][1].toFixed(1)} x2={l[1][0].toFixed(1)} y2={l[1][1].toFixed(1)} opacity={i >= 6 ? 0.5 : 0.85} />
        ))}
      </g>
      <g fill={n}>
        {all.map((p, i) => <Node key={i} x={p[0]} y={p[1]} r={i === all.length - 1 ? nr + 1.5 : nr} />)}
      </g>
    </g>
  );
}

// TECHNOLOGY — microchip / processor
function ChipIcon({ c, n, sw = 6, nr = 5 }) {
  const pins = [];
  [-26, 0, 26].forEach((o) => {
    pins.push(["v", o, -46, o, -64]); // top
    pins.push(["v", o, 46, o, 64]);   // bottom
    pins.push(["h", -46, o, -64, o]); // left
    pins.push(["h", 46, o, 64, o]);   // right
  });
  return (
    <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="-46" y="-46" width="92" height="92" rx="12" />
      <rect x="-20" y="-20" width="40" height="40" rx="6" />
      {pins.map((p, i) => <line key={i} x1={p[1]} y1={p[2]} x2={p[3]} y2={p[4]} />)}
      <g stroke="none" fill={n}>
        {pins.map((p, i) => <Node key={i} x={p[3]} y={p[4]} r={nr} />)}
        <Node x={0} y={0} r={nr + 1} fill={n} />
      </g>
    </g>
  );
}

// TECHNOLOGY (alt) — gear
function GearIcon({ c, n, sw = 6, nr = 6 }) {
  const teeth = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    const x1 = Math.cos(a) * 46, y1 = Math.sin(a) * 46;
    const x2 = Math.cos(a) * 62, y2 = Math.sin(a) * 62;
    teeth.push([x1, y1, x2, y2]);
  }
  return (
    <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <circle cx="0" cy="0" r="46" />
      <circle cx="0" cy="0" r="18" />
      {teeth.map((t, i) => <line key={i} x1={t[0].toFixed(1)} y1={t[1].toFixed(1)} x2={t[2].toFixed(1)} y2={t[3].toFixed(1)} strokeWidth={sw + 3} />)}
      <Node x={0} y={0} r={nr} fill={n} />
    </g>
  );
}

// TECHNOLOGY (alt) — code brackets </>
function BracketsIcon({ c, n, sw = 8, nr = 6 }) {
  return (
    <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="-30,-42 -64,0 -30,42" />
      <polyline points="30,-42 64,0 30,42" />
      <line x1="14" y1="-50" x2="-14" y2="50" />
      <g stroke="none" fill={n}>
        <Node x={-64} y={0} r={nr} />
        <Node x={64} y={0} r={nr} />
      </g>
    </g>
  );
}

// STRATEGY (alt) — bullseye with an arrow striking dead-center
function BullseyeIcon({ c, n, sw = 6, nr = 7 }) {
  return (
    <g>
      <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
        <circle cx="0" cy="0" r="58" />
        <circle cx="0" cy="0" r="38" />
        <circle cx="0" cy="0" r="18" />
      </g>
      {/* arrow flying in from lower-right into the centre */}
      <g fill="none" stroke={c} strokeWidth={sw + 1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="70" y1="70" x2="6" y2="6" />
        {/* arrowhead pointing to centre */}
        <polyline points="26,10 6,6 10,26" />
        {/* fletching at the tail */}
        <line x1="70" y1="70" x2="52" y2="66" />
        <line x1="70" y1="70" x2="66" y2="52" />
      </g>
      <Node x={0} y={0} r={nr} fill={n} />
    </g>
  );
}

// AGENTIC — robot face (geometric outline; reads in line or knockout)
function RobotIcon({ c, n, sw = 6, nr = 6 }) {
  return (
    <g>
      <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {/* antenna */}
        <line x1="0" y1="-46" x2="0" y2="-62" />
        {/* head */}
        <rect x="-52" y="-46" width="104" height="94" rx="20" />
        {/* side nubs / ears */}
        <line x1="-52" y1="-6" x2="-62" y2="-6" />
        <line x1="52" y1="-6" x2="62" y2="-6" />
        {/* mouth grille */}
        <rect x="-28" y="20" width="56" height="18" rx="9" />
        <line x1="-10" y1="20" x2="-10" y2="38" />
        <line x1="10" y1="20" x2="10" y2="38" />
      </g>
      {/* antenna bulb + eyes (filled) */}
      <g fill={n}>
        <Node x={0} y={-66} r={nr} />
        <Node x={-22} y={-8} r={10} />
        <Node x={22} y={-8} r={10} />
      </g>
      {/* eye highlights punched back to head colour when knockout looks flat */}
    </g>
  );
}

// AGENTIC (alt) — circuit brain (organic folds on the left, circuit nodes
// on the right; signals an AI / agentic "mind"). Same node-line family.
function BrainIcon({ c, n, sw = 5.5, nr = 5.5 }) {
  return (
    <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {/* brain outline */}
      <path d="M0,-48
        C 24,-60 54,-46 51,-20
        C 66,-13 66,12 49,17
        C 55,36 30,50 12,41
        C 6,51 -6,51 -12,41
        C -30,50 -55,36 -49,17
        C -66,12 -66,-13 -51,-20
        C -54,-46 -24,-60 0,-48 Z" />
      {/* central sulcus */}
      <path d="M0,-48 C 8,-26 -8,-8 2,10 C 8,24 2,36 0,46" />
      {/* left folds (organic) */}
      <path d="M-22,-30 C -34,-22 -34,-8 -22,-4" />
      <path d="M-18,12 C -30,16 -32,28 -20,32" />
      {/* right circuit traces */}
      <line x1="20" y1="-26" x2="40" y2="-26" />
      <line x1="40" y1="-26" x2="40" y2="-10" />
      <line x1="22" y1="6" x2="36" y2="6" />
      <line x1="36" y1="6" x2="36" y2="22" />
      {/* circuit nodes */}
      <g stroke="none" fill={n}>
        <circle cx="40" cy="-26" r={nr} />
        <circle cx="40" cy="-10" r={nr} />
        <circle cx="36" cy="22" r={nr} />
        <circle cx="-22" cy="-4" r={nr - 1} />
      </g>
    </g>
  );
}

const ICONS = { TargetIcon, BullseyeIcon, CompassIcon, NeuralHubIcon, MeshIcon, RobotIcon, BrainIcon, ChipIcon, GearIcon, BracketsIcon };

/* ----------------------------------------------------------------- *
 * TRIAD — three hexes + icons, in one SVG with shared gradient defs
 * mode: 'wire' | 'solid' | 'tint'
 * icons: { top, bl, br } component refs
 * ----------------------------------------------------------------- */
function Triad({ mode = "wire", icons, uid = "g", size = 360 }) {
  // gradient palette per position (brand: teal-green / cyan / navy)
  const grads = {
    top: ["#41C79A", "#2E9BC4"],   // strategy — teal→blue
    bl: ["#39B6E0", "#2168A8"],    // agentic — cyan→blue
    br: ["#2C84BE", "#15375B"],    // technology — blue→navy
  };
  const solidByKey = { top: "#2E9BC4", bl: "#2474B2", br: "#1C4E7C" };

  const renderHex = (key, IconComp) => {
    const [cx, cy] = POS[key];
    const gid = `${uid}-${key}`;
    let hexFill, hexStroke, strokeW, iconColor, nodeColor;
    if (mode === "solid") {
      hexFill = `url(#${gid})`;
      hexStroke = "none";
      strokeW = 0;
      iconColor = "#FFFFFF";
      nodeColor = "#FFFFFF";
    } else if (mode === "tint") {
      hexFill = `url(#${gid}-soft)`;
      hexStroke = `url(#${gid})`;
      strokeW = 8;
      iconColor = `url(#${gid})`;
      nodeColor = solidByKey[key];
    } else {
      hexFill = "#FFFFFF";
      hexStroke = `url(#${gid})`;
      strokeW = 8;
      iconColor = `url(#${gid})`;
      nodeColor = solidByKey[key];
    }
    return (
      <g key={key} transform={`translate(${cx},${cy})`}>
        <polygon
          points={HEX}
          fill={hexFill}
          stroke={hexStroke}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />
        <g>{IconComp ? <IconComp c={iconColor} n={nodeColor} /> : null}</g>
      </g>
    );
  };

  return (
    <svg viewBox="-234 -235 468 470" width={size} height={size} style={{ display: "block" }}>
      <defs>
        {Object.keys(grads).map((key) => {
          const [a, b] = grads[key];
          const gid = `${uid}-${key}`;
          return (
            <React.Fragment key={key}>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={a} />
                <stop offset="1" stopColor={b} />
              </linearGradient>
              <linearGradient id={`${gid}-soft`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={a} stopOpacity="0.16" />
                <stop offset="1" stopColor={b} stopOpacity="0.16" />
              </linearGradient>
            </React.Fragment>
          );
        })}
      </defs>
      {renderHex("top", icons.top)}
      {renderHex("bl", icons.bl)}
      {renderHex("br", icons.br)}
    </svg>
  );
}

/* ----------------------------------------------------------------- *
 * WORDMARK
 * ----------------------------------------------------------------- */
function Wordmark({ scale = 1, tagline = true, align = "center", wordSize = 64, tagSize = 17.5, tagSpace = "0.34em", tagGap = 14 }) {
  return (
    <div style={{ textAlign: align, lineHeight: 1 }}>
      <div
        style={{
          fontFamily: "'Exo 2', sans-serif",
          fontWeight: 800,
          fontSize: `${wordSize * scale}px`,
          letterSpacing: "0.005em",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: "#163C5E" }}>STRAGEN</span>
        <span style={{ color: "#2E8FC4", fontWeight: 600 }}>TECH</span>
      </div>
      {tagline && (
        <div
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 500,
            fontSize: `${tagSize * scale}px`,
            letterSpacing: tagSpace,
            color: "#6B7A86",
            marginTop: `${tagGap * scale}px`,
            marginLeft: align === "center" ? tagSpace : 0,
            whiteSpace: "nowrap",
          }}
        >
          AGENTIC TECHNOLOGY PARTNERS
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- *
 * FULL LOGO
 * ----------------------------------------------------------------- */
function StragentechLogo({ mode = "wire", icons, uid, markSize = 340, wordScale = 1, tagline = true, labels = false, layout = "stack" }) {
  if (layout === "horizontal") {
    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: `${markSize * 0.07}px` }}>
        <Triad mode={mode} icons={icons} uid={uid} size={markSize} />
        <Wordmark
          scale={wordScale} tagline={tagline} align="left"
          wordSize={78} tagSize={23} tagSpace="0.232em" tagGap={12}
        />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{ position: "relative" }}>
        <Triad mode={mode} icons={icons} uid={uid} size={markSize} />
        {labels && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            fontFamily: "'Exo 2', sans-serif", fontWeight: 600,
            fontSize: "12px", letterSpacing: "0.18em", color: "#8392A0",
          }}>
            <span style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)" }}>STRATEGY</span>
            <span style={{ position: "absolute", bottom: "15%", left: "11%" }}>AGENTIC</span>
            <span style={{ position: "absolute", bottom: "15%", right: "7%" }}>TECHNOLOGY</span>
          </div>
        )}
      </div>
      <Wordmark scale={wordScale} tagline={tagline} />
    </div>
  );
}

Object.assign(window, { StragentechLogo, Triad, Wordmark, ICONS, ...ICONS });
