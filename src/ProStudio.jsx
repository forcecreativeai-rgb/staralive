import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PRESET LIBRARY — 13 presets across 3 tiers
// EQ gains mapped to our 5 bands: 80Hz | 250Hz | 1kHz | 4kHz | 12kHz
// ─────────────────────────────────────────────────────────────────────────────
const PRESET_TIERS = [
  {
    tier: "Quick Picks",
    description: "Tap and go — no audio knowledge needed",
    presets: [
      {
        id: "raw",
        name: "Raw",
        emoji: "🎙️",
        tagline: "Unprocessed",
        description: "Your voice exactly as recorded. Use this as your reference point before applying any processing.",
        color: "#64748b",
        settings: {
          amplify: 0,
          eqGains: { "80Hz": 0, "250Hz": 0, "1kHz": 0, "4kHz": 0, "12kHz": 0 },
          eqEnabled: false,
          compEnabled: false, threshold: -18, ratio: 2, attack: 10, release: 80, makeupGain: 0,
          limiterEnabled: false, limiterCeiling: -1.5,
          reverbEnabled: false, reverbSize: 0.2, reverbDecay: 1.0, reverbSend: 0,
          gateEnabled: false, gateThresh: -50,
          deEsserEnabled: false, pitchEnabled: false, pitchStrength: 0, pitchKey: "C",
        }
      },
      {
        id: "kickass",
        name: "Kick Ass",
        emoji: "🤘",
        tagline: "Stadium energy",
        description: "Maximum presence, pumping compression, huge reverb. You sound like a headliner. No subtlety — full send.",
        color: "#f87171",
        settings: {
          amplify: 8,
          eqGains: { "80Hz": -3, "250Hz": -4, "1kHz": 4, "4kHz": 5, "12kHz": 3 },
          eqEnabled: true,
          compEnabled: true, threshold: -22, ratio: 8, attack: 5, release: 60, makeupGain: 8,
          limiterEnabled: true, limiterCeiling: -0.5,
          reverbEnabled: true, reverbSize: 0.78, reverbDecay: 3.5, reverbSend: 0.45,
          gateEnabled: false, gateThresh: -50,
          deEsserEnabled: true, pitchEnabled: true, pitchStrength: 40, pitchKey: "C",
        }
      },
      {
        id: "karaoke_king",
        name: "Karaoke King",
        emoji: "👑",
        tagline: "Dive bar hero",
        description: "Classic karaoke bar sound — the right amount of echo, punchy compression, subtle tuning. You own the room.",
        color: "#34d399",
        settings: {
          amplify: 4,
          eqGains: { "80Hz": -2, "250Hz": -1, "1kHz": 3, "4kHz": 3, "12kHz": 2 },
          eqEnabled: true,
          compEnabled: true, threshold: -20, ratio: 4, attack: 12, release: 90, makeupGain: 5,
          limiterEnabled: true, limiterCeiling: -1.0,
          reverbEnabled: true, reverbSize: 0.45, reverbDecay: 2.0, reverbSend: 0.35,
          gateEnabled: true, gateThresh: -50,
          deEsserEnabled: true, pitchEnabled: true, pitchStrength: 35, pitchKey: "C",
        }
      },
      {
        id: "dreamy",
        name: "Dreamy",
        emoji: "🌙",
        tagline: "Lush & ethereal",
        description: "Silky smooth with deep cathedral reverb. Perfect for ballads, slow songs, and romantic moments.",
        color: "#a78bfa",
        settings: {
          amplify: 3,
          eqGains: { "80Hz": -5, "250Hz": -2, "1kHz": 1, "4kHz": 2, "12kHz": 5 },
          eqEnabled: true,
          compEnabled: true, threshold: -16, ratio: 3, attack: 20, release: 200, makeupGain: 4,
          limiterEnabled: true, limiterCeiling: -1.5,
          reverbEnabled: true, reverbSize: 0.88, reverbDecay: 5.5, reverbSend: 0.55,
          gateEnabled: false, gateThresh: -50,
          deEsserEnabled: true, pitchEnabled: true, pitchStrength: 25, pitchKey: "C",
        }
      },
    ]
  },
  {
    tier: "Genre Presets",
    description: "Professionally engineered chains matched to your vocal style",
    presets: [
      {
        id: "pop_lead",
        name: "Pop Lead",
        emoji: "⭐",
        tagline: "Modern & polished",
        description: "Clean, radio-ready pop vocal. High-pass clears mud, presence boost adds shine, 1176-style compression keeps it punchy. Short plate reverb with slap delay.",
        color: "#f472b6",
        settings: {
          amplify: 5,
          eqGains: { "80Hz": -6, "250Hz": -3, "1kHz": 1, "4kHz": 4, "12kHz": 3 },
          eqEnabled: true,
          compEnabled: true, threshold: -18, ratio: 4, attack: 8, release: 50, makeupGain: 5,
          limiterEnabled: true, limiterCeiling: -1.0,
          reverbEnabled: true, reverbSize: 0.28, reverbDecay: 1.5, reverbSend: 0.2,
          gateEnabled: true, gateThresh: -55,
          deEsserEnabled: true, pitchEnabled: true, pitchStrength: 30, pitchKey: "C",
        }
      },
      {
        id: "singer_songwriter",
        name: "Singer-Writer",
        emoji: "🎸",
        tagline: "Warm & intimate",
        description: "Stripped back and honest. LA-2A optical compression, subtle tape warmth, air boost at 12kHz. Short room reverb keeps you close. Like a late-night living room session.",
        color: "#fb923c",
        settings: {
          amplify: 3,
          eqGains: { "80Hz": -4, "250Hz": 0, "1kHz": 0, "4kHz": 1, "12kHz": 4 },
          eqEnabled: true,
          compEnabled: true, threshold: -14, ratio: 2.5, attack: 20, release: 150, makeupGain: 3,
          limiterEnabled: true, limiterCeiling: -2.0,
          reverbEnabled: true, reverbSize: 0.2, reverbDecay: 1.1, reverbSend: 0.13,
          gateEnabled: false, gateThresh: -55,
          deEsserEnabled: false, pitchEnabled: false, pitchStrength: 15, pitchKey: "C",
        }
      },
      {
        id: "rock",
        name: "Rock",
        emoji: "🎸",
        tagline: "Powerful & gritty",
        description: "Cuts boxy low-mids, boosts bite and aggression at 4kHz. Aggressive 1176 compression at 8:1 with parallel blend for slam. Bright plate reverb.",
        color: "#ef4444",
        settings: {
          amplify: 7,
          eqGains: { "80Hz": -6, "250Hz": -5, "1kHz": 2, "4kHz": 6, "12kHz": 2 },
          eqEnabled: true,
          compEnabled: true, threshold: -22, ratio: 8, attack: 4, release: 40, makeupGain: 8,
          limiterEnabled: true, limiterCeiling: -0.5,
          reverbEnabled: true, reverbSize: 0.3, reverbDecay: 1.4, reverbSend: 0.22,
          gateEnabled: true, gateThresh: -50,
          deEsserEnabled: true, pitchEnabled: false, pitchStrength: 0, pitchKey: "C",
        }
      },
      {
        id: "worship",
        name: "Worship",
        emoji: "🙏",
        tagline: "Ambient & reverent",
        description: "Open, spacious and uplifting. Gentle optical compression, long hall reverb (3s decay), dotted delay for ethereal width. Made for large rooms and big feelings.",
        color: "#e0c3fc",
        settings: {
          amplify: 4,
          eqGains: { "80Hz": -5, "250Hz": -1, "1kHz": 1, "4kHz": 3, "12kHz": 3 },
          eqEnabled: true,
          compEnabled: true, threshold: -15, ratio: 3, attack: 25, release: 180, makeupGain: 4,
          limiterEnabled: true, limiterCeiling: -1.5,
          reverbEnabled: true, reverbSize: 0.82, reverbDecay: 3.2, reverbSend: 0.42,
          gateEnabled: false, gateThresh: -55,
          deEsserEnabled: false, pitchEnabled: true, pitchStrength: 20, pitchKey: "C",
        }
      },
      {
        id: "rnb",
        name: "R&B / Soul",
        emoji: "🎷",
        tagline: "Smooth & silky",
        description: "Body warmth from a low boost, LA-2A optical compression for that relaxed feel. Tube saturation adds richness. Medium plate reverb. Smooth all the way down.",
        color: "#c084fc",
        settings: {
          amplify: 4,
          eqGains: { "80Hz": -3, "250Hz": 2, "1kHz": 0, "4kHz": -2, "12kHz": 2 },
          eqEnabled: true,
          compEnabled: true, threshold: -14, ratio: 3, attack: 18, release: 120, makeupGain: 4,
          limiterEnabled: true, limiterCeiling: -1.5,
          reverbEnabled: true, reverbSize: 0.38, reverbDecay: 1.8, reverbSend: 0.28,
          gateEnabled: false, gateThresh: -55,
          deEsserEnabled: true, pitchEnabled: true, pitchStrength: 25, pitchKey: "C",
        }
      },
      {
        id: "indie_lofi",
        name: "Indie / Lo-Fi",
        emoji: "📼",
        tagline: "Raw & textured",
        description: "Midrange character boost, light 3:1 compression, spring reverb, and tape saturation that adds cassette warmth and slight grit. Imperfect on purpose.",
        color: "#fbbf24",
        settings: {
          amplify: 3,
          eqGains: { "80Hz": -6, "250Hz": -1, "1kHz": 3, "4kHz": -1, "12kHz": -2 },
          eqEnabled: true,
          compEnabled: true, threshold: -16, ratio: 3, attack: 20, release: 160, makeupGain: 4,
          limiterEnabled: true, limiterCeiling: -2.0,
          reverbEnabled: true, reverbSize: 0.35, reverbDecay: 1.6, reverbSend: 0.3,
          gateEnabled: false, gateThresh: -55,
          deEsserEnabled: false, pitchEnabled: false, pitchStrength: 0, pitchKey: "C",
        }
      },
      {
        id: "rap",
        name: "Rap / Spoken",
        emoji: "🎤",
        tagline: "Clear & cutting",
        description: "Hard high-pass, cut mud at 250Hz, forward 4–6kHz presence boost. Fast compression at 4–8:1 for punchiness. De-essed. Minimal reverb — every word sits in your face.",
        color: "#38bdf8",
        settings: {
          amplify: 6,
          eqGains: { "80Hz": -8, "250Hz": -4, "1kHz": 1, "4kHz": 5, "12kHz": 2 },
          eqEnabled: true,
          compEnabled: true, threshold: -20, ratio: 6, attack: 4, release: 45, makeupGain: 7,
          limiterEnabled: true, limiterCeiling: -0.8,
          reverbEnabled: true, reverbSize: 0.1, reverbDecay: 0.5, reverbSend: 0.08,
          gateEnabled: true, gateThresh: -45,
          deEsserEnabled: true, pitchEnabled: false, pitchStrength: 0, pitchKey: "C",
        }
      },
      {
        id: "cinematic",
        name: "Cinematic",
        emoji: "🎬",
        tagline: "Epic & wide",
        description: "Trailer-grade. Controlled low-mids, heavy parallel compression for power, long hall reverb (4s) with stereo delay for massive width. Built for the big screen.",
        color: "#818cf8",
        settings: {
          amplify: 6,
          eqGains: { "80Hz": -4, "250Hz": -3, "1kHz": 2, "4kHz": 3, "12kHz": 4 },
          eqEnabled: true,
          compEnabled: true, threshold: -20, ratio: 10, attack: 6, release: 80, makeupGain: 9,
          limiterEnabled: true, limiterCeiling: -1.0,
          reverbEnabled: true, reverbSize: 0.92, reverbDecay: 4.2, reverbSend: 0.5,
          gateEnabled: false, gateThresh: -55,
          deEsserEnabled: false, pitchEnabled: false, pitchStrength: 0, pitchKey: "C",
        }
      },
    ]
  },
  {
    tier: "Pro Tools",
    description: "Specialized chains for mixing and production use",
    presets: [
      {
        id: "harmony",
        name: "Harmony BG",
        emoji: "🎶",
        tagline: "Background vocal",
        description: "High-pass at 150Hz so it never muddies the lead. Cuts the 2–4kHz presence zone so it sits behind. Wide stereo spread and more reverb than the lead vocal.",
        color: "#6ee7b7",
        settings: {
          amplify: 2,
          eqGains: { "80Hz": -12, "250Hz": -1, "1kHz": 0, "4kHz": -4, "12kHz": 3 },
          eqEnabled: true,
          compEnabled: true, threshold: -18, ratio: 4, attack: 15, release: 100, makeupGain: 3,
          limiterEnabled: true, limiterCeiling: -3.0,
          reverbEnabled: true, reverbSize: 0.6, reverbDecay: 2.5, reverbSend: 0.5,
          gateEnabled: true, gateThresh: -50,
          deEsserEnabled: false, pitchEnabled: true, pitchStrength: 50, pitchKey: "C",
        }
      },
      {
        id: "vintage",
        name: "Vintage Tape",
        emoji: "📻",
        tagline: "70s warmth",
        description: "Low-end warmth, boosted body at 250Hz, soft high-frequency rolloff. Tape saturation coloring. Sounds like your favorite classic rock record.",
        color: "#fde68a",
        settings: {
          amplify: 5,
          eqGains: { "80Hz": 3, "250Hz": 3, "1kHz": 1, "4kHz": -2, "12kHz": -4 },
          eqEnabled: true,
          compEnabled: true, threshold: -15, ratio: 5, attack: 8, release: 120, makeupGain: 5,
          limiterEnabled: true, limiterCeiling: -2.0,
          reverbEnabled: true, reverbSize: 0.35, reverbDecay: 1.5, reverbSend: 0.22,
          gateEnabled: false, gateThresh: -55,
          deEsserEnabled: false, pitchEnabled: false, pitchStrength: 0, pitchKey: "C",
        }
      },
      {
        id: "vocal_bus",
        name: "Final Polish",
        emoji: "💎",
        tagline: "Vocal bus master",
        description: "The last thing in the chain. Gentle 1–2dB bus compression, air boost at 12kHz, subtle console saturation, final de-esser pass. Apply this after your other processing.",
        color: "#f0abfc",
        settings: {
          amplify: 2,
          eqGains: { "80Hz": -2, "250Hz": 0, "1kHz": 0, "4kHz": 0, "12kHz": 5 },
          eqEnabled: true,
          compEnabled: true, threshold: -10, ratio: 1.5, attack: 30, release: 200, makeupGain: 1.5,
          limiterEnabled: true, limiterCeiling: -0.3,
          reverbEnabled: false, reverbSize: 0.1, reverbDecay: 0.5, reverbSend: 0.05,
          gateEnabled: false, gateThresh: -55,
          deEsserEnabled: true, pitchEnabled: false, pitchStrength: 0, pitchKey: "C",
        }
      },
    ]
  }
];

const ALL_PRESETS = PRESET_TIERS.flatMap(t => t.presets);

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ─────────────────────────────────────────────────────────────────────────────
function getDefaultState() {
  return {
    amplify: 0,
    eqGains: { "80Hz": 0, "250Hz": 0, "1kHz": 0, "4kHz": 0, "12kHz": 0 },
    eqEnabled: true,
    compEnabled: false, threshold: -18, ratio: 4, attack: 10, release: 80, makeupGain: 3,
    limiterEnabled: false, limiterCeiling: -1.5,
    reverbEnabled: false, reverbSize: 0.35, reverbDecay: 1.8, reverbSend: 0.3,
    gateEnabled: false, gateThresh: -50,
    deEsserEnabled: false,
    pitchEnabled: false, pitchStrength: 50, pitchKey: "C",
    vocalFader: 0.85, karaokeLevel: 0.75,
  };
}

const EQ_BANDS = ["80Hz", "250Hz", "1kHz", "4kHz", "12kHz"];

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Knob({ value, min, max, label, unit = "", color = "#e879f9", size = 50, onChange }) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(0);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -145 + pct * 290;

  useEffect(() => {
    const onMove = e => {
      if (!isDragging.current) return;
      const dy = startY.current - e.clientY;
      onChange(Math.round(Math.min(max, Math.max(min, startVal.current + dy * ((max - min) / 180))) * 10) / 10);
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [min, max, onChange]);

  const dv = Math.abs(value) < 10 ? value.toFixed(1) : Math.round(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, userSelect: "none" }}>
      <div
        onMouseDown={e => { isDragging.current = true; startY.current = e.clientY; startVal.current = value; e.preventDefault(); }}
        style={{ width: size, height: size, borderRadius: "50%", cursor: "ns-resize", position: "relative",
          background: "radial-gradient(circle at 35% 35%, #1e1e32, #090912)",
          boxShadow: `0 0 0 1.5px rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.8)` }}
      >
        <svg style={{ position: "absolute", inset: 0 }} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={size/2-4} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5"
            strokeDasharray={`${(290/360)*Math.PI*(size-8)} ${Math.PI*(size-8)}`}
            strokeDashoffset={`${-(55/360)*Math.PI*(size-8)}`}
            strokeLinecap="round" transform={`rotate(145 ${size/2} ${size/2})`} />
          {pct > 0 && <circle cx={size/2} cy={size/2} r={size/2-4} fill="none" stroke={color} strokeWidth="2.5"
            strokeDasharray={`${(pct*290/360)*Math.PI*(size-8)} ${Math.PI*(size-8)}`}
            strokeDashoffset={`${-(55/360)*Math.PI*(size-8)}`}
            strokeLinecap="round" transform={`rotate(145 ${size/2} ${size/2})`}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }} />}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${angle}deg)` }}>
          <div style={{ width: 2.5, height: size/2-7, background: color, borderRadius: 2, marginBottom: "auto", transformOrigin: "bottom center", boxShadow: `0 0 4px ${color}` }} />
        </div>
      </div>
      <div style={{ fontSize: 10, color, fontFamily: "monospace", fontWeight: 700 }}>{dv}{unit}</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

function VUMeter({ level = 0, color = "#e879f9", height = 90 }) {
  const segs = 16;
  const active = Math.round(level * segs);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, height }}>
      {Array.from({ length: segs }).map((_, i) => {
        const idx = segs - 1 - i;
        const on = idx < active;
        const c = idx >= segs-2 ? "#ef4444" : idx >= segs-4 ? "#f59e0b" : color;
        return <div key={i} style={{ flex: 1, borderRadius: 1, background: on ? c : "rgba(255,255,255,0.04)", boxShadow: on ? `0 0 3px ${c}` : "none", transition: "background 0.07s" }} />;
      })}
    </div>
  );
}

function Fader({ value, onChange, color = "#e879f9", label }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const dbVal = value === 0 ? "-∞" : ((value - 1) * 60).toFixed(1);
  useEffect(() => {
    const onMove = e => {
      if (!dragging.current || !trackRef.current) return;
      const r = trackRef.current.getBoundingClientRect();
      onChange(Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height)));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [onChange]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ fontSize: 9, color, fontFamily: "monospace", fontWeight: 700 }}>{dbVal}{value > 0 ? "dB" : ""}</div>
      <div ref={trackRef} style={{ width: 8, height: 100, background: "rgba(255,255,255,0.05)", borderRadius: 4, position: "relative", cursor: "ns-resize" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${value*100}%`, background: `linear-gradient(to top, ${color}, ${color}80)`, borderRadius: 4, boxShadow: `0 0 6px ${color}` }} />
        <div onMouseDown={e => { dragging.current = true; e.preventDefault(); }}
          style={{ position: "absolute", left: -6, top: `${(1-value)*100}%`, width: 20, height: 7, background: "#ddd", borderRadius: 2, transform: "translateY(-50%)", cursor: "ns-resize", boxShadow: `0 0 8px ${color}` }} />
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

function Waveform({ data, color, height = 48, glow = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    if (!data?.length) {
      ctx.strokeStyle = `${color}30`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
      return;
    }
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, color); g.addColorStop(0.5, `${color}cc`); g.addColorStop(1, color);
    ctx.fillStyle = g;
    if (glow) { ctx.shadowBlur = 10; ctx.shadowColor = color; }
    const step = w / data.length;
    data.forEach((v, i) => {
      const amp = v * (h/2) * 0.9;
      ctx.fillRect(i * step, h/2 - amp, Math.max(1, step - 0.5), amp * 2);
    });
  }, [data, color, glow]);
  return <canvas ref={ref} width={400} height={height} style={{ width: "100%", height, borderRadius: 4 }} />;
}

function Toggle({ active, onClick, color, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 12px", borderRadius: 4, cursor: "pointer",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
      background: active ? `${color}18` : "transparent",
      color: active ? color : "rgba(255,255,255,0.3)",
      fontFamily: "monospace", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.14s",
      boxShadow: active ? `0 0 8px ${color}40` : "none"
    }}>{children}</button>
  );
}

function Panel({ title, color = "#e879f9", children, compact }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: compact ? "7px 14px" : "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: `linear-gradient(90deg, ${color}0d, transparent)`,
        display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}` }} />
        <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color, letterSpacing: "0.18em", textTransform: "uppercase" }}>{title}</span>
      </div>
      <div style={{ padding: compact ? 10 : 14 }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function ProStudio() {
  const [state, setState] = useState(getDefaultState());
  const [history, setHistory] = useState([{ state: getDefaultState(), label: "Start" }]);
  const [histIdx, setHistIdx] = useState(0);
  const [activePreset, setActivePreset] = useState(null);
  const [hoveredPreset, setHoveredPreset] = useState(null);
  const [activeTab, setActiveTab] = useState("presets");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [vocalMeter, setVocalMeter] = useState(0);
  const [masterMeter, setMasterMeter] = useState(0);
  const [grMeter, setGrMeter] = useState(0);
  const [processedWave, setProcessedWave] = useState(null);

  const rawWave = useRef(
    Array.from({ length: 120 }, () => Math.abs(Math.sin(Math.random() * 9)) * (0.2 + Math.random() * 0.7))
  ).current;

  // ── History helpers
  const pushHistory = useCallback((newState, label) => {
    const newHist = history.slice(0, histIdx + 1).concat({ state: newState, label });
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setState(newState);
    setProcessed(false);
  }, [history, histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    const i = histIdx - 1;
    setHistIdx(i); setState(history[i].state); setProcessed(false);
    const match = ALL_PRESETS.find(p => Object.keys(p.settings).every(k => JSON.stringify(history[i].state[k]) === JSON.stringify(p.settings[k])));
    setActivePreset(match?.id || null);
  }, [history, histIdx]);

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    const i = histIdx + 1;
    setHistIdx(i); setState(history[i].state); setProcessed(false);
  }, [history, histIdx]);

  const applyPreset = preset => {
    pushHistory({ ...state, ...preset.settings }, `${preset.name}`);
    setActivePreset(preset.id);
  };

  const update = (key, val, label) => {
    pushHistory({ ...state, [key]: val }, label || key);
    setActivePreset(null);
  };

  const updateEq = (band, val) => {
    pushHistory({ ...state, eqGains: { ...state.eqGains, [band]: val } }, `EQ ${band}`);
    setActivePreset(null);
  };

  // ── Meters animation
  useEffect(() => {
    if (!isPlaying) { setVocalMeter(0); setMasterMeter(0); setGrMeter(0); return; }
    const iv = setInterval(() => {
      const v = state.vocalFader * (0.42 + Math.random() * 0.48);
      setVocalMeter(v);
      setMasterMeter(Math.min(0.94, v * (state.compEnabled ? 0.86 : 1)));
      setGrMeter(state.compEnabled ? Math.random() * 0.45 : 0);
    }, 80);
    return () => clearInterval(iv);
  }, [isPlaying, state.vocalFader, state.compEnabled]);

  // ── Process chain
  const runProcess = () => {
    setIsProcessing(true); setProcessed(false);
    setTimeout(() => {
      const gain = Math.pow(10, state.amplify / 20);
      const ceil = Math.pow(10, state.limiterCeiling / 20);
      const eqBoost = state.eqEnabled ? 1 + (state.eqGains["1kHz"] + state.eqGains["4kHz"]) / 40 : 1;
      const pw = rawWave.map(v => {
        let s = v * gain * eqBoost;
        if (state.compEnabled && s > Math.abs(state.threshold / 60)) {
          const over = s - Math.abs(state.threshold / 60);
          s = Math.abs(state.threshold / 60) + over / state.ratio;
          s *= Math.pow(10, state.makeupGain / 20) * 0.52;
        }
        if (state.reverbEnabled) s *= (1 + state.reverbSend * 0.3);
        if (state.limiterEnabled) s = Math.min(ceil * 0.94, s);
        return Math.min(0.93, Math.max(0.01, s));
      });
      setProcessedWave(pw); setIsProcessing(false); setProcessed(true);
    }, 1600);
  };

  const canUndo = histIdx > 0;
  const canRedo = histIdx < history.length - 1;
  const currentPreset = ALL_PRESETS.find(p => p.id === activePreset);
  const displayPreset = hoveredPreset ? ALL_PRESETS.find(p => p.id === hoveredPreset) : currentPreset;

  // ── What's active in the chain
  const activeModules = [
    state.eqEnabled && "EQ",
    state.gateEnabled && "Gate",
    state.deEsserEnabled && "De-Esser",
    state.compEnabled && "Compressor",
    state.amplify !== 0 && "Amplify",
    state.reverbEnabled && "Reverb",
    state.pitchEnabled && "Pitch",
    state.limiterEnabled && "Limiter",
  ].filter(Boolean);

  const TABS = ["presets", "mixer", "eq", "dynamics", "fx"];

  return (
    <div style={{ minHeight: "100vh", background: "#050509", color: "#f0e8ff", fontFamily: "'Courier New', monospace" }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 15% 55%, rgba(232,121,249,0.035) 0%, transparent 50%), radial-gradient(ellipse at 85% 20%, rgba(56,189,248,0.025) 0%, transparent 50%)" }} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, height: 52,
        borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,9,0.98)", backdropFilter: "blur(24px)",
        padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #e879f9, #38bdf8)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            boxShadow: "0 0 14px rgba(232,121,249,0.4)" }}>🎚</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#fff" }}>PRO STUDIO</div>
            <div style={{ fontSize: 8, color: "rgba(232,121,249,0.55)", letterSpacing: "0.25em", marginTop: -1 }}>STARALIVE · PREMIUM</div>
          </div>
        </div>

        {/* Active chain summary */}
        {activeModules.length > 0 && (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {activeModules.map(m => (
              <span key={m} style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3,
                background: "rgba(232,121,249,0.1)", color: "rgba(232,121,249,0.7)",
                border: "1px solid rgba(232,121,249,0.2)", letterSpacing: "0.08em" }}>{m}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* Undo/Redo */}
          {[
            { fn: undo, can: canUndo, label: "↩", title: canUndo ? `Undo: ${history[histIdx-1]?.label}` : "Nothing to undo", color: "#e879f9" },
            { fn: redo, can: canRedo, label: "↪", title: canRedo ? `Redo: ${history[histIdx+1]?.label}` : "Nothing to redo", color: "#38bdf8" },
          ].map(b => (
            <button key={b.label} onClick={b.fn} disabled={!b.can} title={b.title} style={{
              width: 32, height: 28, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${b.can ? `${b.color}40` : "rgba(255,255,255,0.07)"}`,
              background: b.can ? `${b.color}0e` : "transparent",
              color: b.can ? b.color : "rgba(255,255,255,0.18)",
              fontSize: 15, cursor: b.can ? "pointer" : "not-allowed"
            }}>{b.label}</button>
          ))}
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.08)", margin: "0 3px" }} />
          <button onClick={() => setIsPlaying(p => !p)} style={{
            padding: "5px 14px", borderRadius: 6, fontFamily: "monospace", fontSize: 11, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.1em",
            background: isPlaying ? "rgba(239,68,68,0.14)" : "rgba(232,121,249,0.1)",
            border: `1px solid ${isPlaying ? "#ef4444" : "#e879f9"}`,
            color: isPlaying ? "#ef4444" : "#e879f9"
          }}>{isPlaying ? "⏹ STOP" : "▶ PLAY"}</button>
          <button onClick={runProcess} disabled={isProcessing} style={{
            padding: "5px 14px", borderRadius: 6, fontFamily: "monospace", fontSize: 11, fontWeight: 700,
            cursor: isProcessing ? "not-allowed" : "pointer", letterSpacing: "0.1em",
            opacity: isProcessing ? 0.6 : 1,
            background: processed ? "rgba(52,211,153,0.1)" : "rgba(56,189,248,0.1)",
            border: `1px solid ${processed ? "#34d399" : "#38bdf8"}`,
            color: processed ? "#34d399" : "#38bdf8"
          }}>{isProcessing ? "⏳ Working..." : processed ? "✓ Re-apply" : "⚡ Apply"}</button>
        </div>
      </header>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <nav style={{ display: "flex", padding: "0 18px", background: "rgba(5,5,9,0.94)",
        borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 52, zIndex: 99 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
            borderBottom: `2px solid ${activeTab === t ? "#e879f9" : "transparent"}`,
            color: activeTab === t ? "#e879f9" : "rgba(255,255,255,0.28)",
            fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", transition: "all 0.14s"
          }}>{t}</button>
        ))}
      </nav>

      <main style={{ position: "relative", zIndex: 1, padding: "16px", maxWidth: 960, margin: "0 auto" }}>

        {/* ══════════════════ PRESETS TAB ══════════════════════════════════ */}
        {activeTab === "presets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Waveform */}
            <Panel title="Bohemian Rhapsody — Take 3" color="#e879f9" compact>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.22)", letterSpacing: "0.14em", marginBottom: 5 }}>ORIGINAL</div>
                  <Waveform data={rawWave} color="#334155" height={44} />
                </div>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.14em", marginBottom: 5,
                    color: processed ? "rgba(52,211,153,0.75)" : "rgba(255,255,255,0.16)" }}>
                    {processed ? `✓ ${currentPreset?.name || "Custom"}` : "Hit ⚡ Apply to preview"}
                  </div>
                  <Waveform data={processed ? processedWave : null} color={currentPreset?.color || "#38bdf8"} height={44} glow={processed} />
                </div>
              </div>
            </Panel>

            {/* Description card */}
            <div style={{ minHeight: 70, padding: "13px 16px", borderRadius: 12, transition: "all 0.2s",
              background: displayPreset ? `${displayPreset.color}0b` : "rgba(255,255,255,0.015)",
              border: `1px solid ${displayPreset ? `${displayPreset.color}25` : "rgba(255,255,255,0.06)"}` }}>
              {displayPreset ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
                  <div style={{ fontSize: 30, lineHeight: 1 }}>{displayPreset.emoji}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: displayPreset.color }}>{displayPreset.name}</span>
                      <span style={{ fontSize: 9, color: `${displayPreset.color}88`, letterSpacing: "0.12em", textTransform: "uppercase" }}>{displayPreset.tagline}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(240,232,255,0.55)", lineHeight: 1.65, maxWidth: 580 }}>{displayPreset.description}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🎛️</span> Hover a preset to see what it does — tap to apply
                </div>
              )}
            </div>

            {/* Preset tiers */}
            {PRESET_TIERS.map(tier => (
              <div key={tier.tier}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 9 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    {tier.tier}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>{tier.description}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(138px, 1fr))", gap: 8, marginBottom: 4 }}>
                  {tier.presets.map(preset => {
                    const isActive = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        onMouseEnter={() => setHoveredPreset(preset.id)}
                        onMouseLeave={() => setHoveredPreset(null)}
                        style={{
                          padding: "13px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                          transition: "all 0.15s",
                          border: `1.5px solid ${isActive ? preset.color : "rgba(255,255,255,0.07)"}`,
                          background: isActive ? `${preset.color}10` : "rgba(255,255,255,0.02)",
                          boxShadow: isActive ? `0 0 16px ${preset.color}30` : "none",
                          transform: isActive ? "translateY(-2px)" : "none",
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 6, lineHeight: 1 }}>{preset.emoji}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 2,
                          color: isActive ? preset.color : "#e8e0f0" }}>{preset.name}</div>
                        <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                          color: isActive ? `${preset.color}aa` : "rgba(255,255,255,0.25)" }}>{preset.tagline}</div>
                        {isActive && <div style={{ marginTop: 7, width: 18, height: 2, borderRadius: 2, background: preset.color, boxShadow: `0 0 5px ${preset.color}` }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* History ribbon */}
            <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase", flexShrink: 0 }}>History</span>
              <div style={{ display: "flex", gap: 3, flex: 1, overflowX: "auto" }}>
                {history.map((h, i) => {
                  const cur = i === histIdx;
                  return (
                    <button key={i} onClick={() => { setHistIdx(i); setState(history[i].state); setProcessed(false); }} style={{
                      padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0,
                      border: `1px solid ${cur ? "#e879f9" : "rgba(255,255,255,0.06)"}`,
                      background: cur ? "rgba(232,121,249,0.1)" : "transparent",
                      color: cur ? "#e879f9" : "rgba(255,255,255,0.25)",
                      fontFamily: "monospace", fontSize: 9, cursor: "pointer"
                    }}>{i === 0 ? "Start" : h.label}</button>
                  );
                })}
              </div>
              <button onClick={undo} disabled={!canUndo} style={{
                padding: "3px 10px", borderRadius: 4, flexShrink: 0,
                border: `1px solid ${canUndo ? "rgba(232,121,249,0.4)" : "rgba(255,255,255,0.06)"}`,
                background: canUndo ? "rgba(232,121,249,0.08)" : "transparent",
                color: canUndo ? "#e879f9" : "rgba(255,255,255,0.18)",
                fontFamily: "monospace", fontSize: 9, fontWeight: 700, cursor: canUndo ? "pointer" : "not-allowed"
              }}>↩ Undo</button>
            </div>

            {/* Publish row — no download */}
            {processed && (
              <div style={{ padding: "13px 15px", borderRadius: 10,
                border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.05)" }}>
                <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, marginBottom: 8, letterSpacing: "0.07em" }}>
                  ✓ Mix complete · ready to publish
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {[["📀 Save to My Album", "#34d399"], ["🔗 Share In-App", "#38bdf8"], ["📱 Post to Social", "#e879f9"]].map(([label, color]) => (
                    <button key={label} style={{
                      padding: "7px 14px", borderRadius: 7, cursor: "pointer",
                      border: `1px solid ${color}40`, background: `${color}0e`,
                      color, fontFamily: "monospace", fontSize: 10, fontWeight: 700
                    }}>{label}</button>
                  ))}
                </div>
                <div style={{ marginTop: 7, fontSize: 9, color: "rgba(255,255,255,0.18)", lineHeight: 1.6 }}>
                  Performances stream securely within StarAlive. Licensed content is protected — no file downloads.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ MIXER TAB ════════════════════════════════════ */}
        {activeTab === "mixer" && (
          <Panel title="Channel Mixer" color="#38bdf8">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              {[
                { key: "vocalFader", label: "VOCAL", color: "#e879f9", meter: vocalMeter, stereo: false },
                { key: "karaokeLevel", label: "TRACK", color: "#38bdf8", meter: vocalMeter * 0.88, stereo: true },
              ].map(ch => (
                <div key={ch.key} style={{ padding: "12px 15px", borderRadius: 10,
                  background: `${ch.color}07`, border: `1px solid ${ch.color}1e`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 9, color: ch.color, letterSpacing: "0.18em", fontWeight: 700 }}>{ch.label}</div>
                  <Knob value={0} min={-30} max={30} label="PAN" color={ch.color} size={36} onChange={() => {}} />
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                    <VUMeter level={isPlaying ? ch.meter : 0} color={ch.color} height={90} />
                    {ch.stereo && <VUMeter level={isPlaying ? ch.meter * 0.93 : 0} color={ch.color} height={90} />}
                    <Fader value={state[ch.key]} onChange={v => update(ch.key, v, ch.label)} color={ch.color} label="VOL" />
                  </div>
                  <Toggle active color={ch.color}>ON</Toggle>
                </div>
              ))}
              <div style={{ padding: "12px 15px", borderRadius: 10, marginLeft: "auto",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 9, color: "#fff", letterSpacing: "0.18em", fontWeight: 700 }}>MASTER</div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                  <VUMeter level={isPlaying ? masterMeter : 0} color="#fff" height={90} />
                  <VUMeter level={isPlaying ? masterMeter * 0.95 : 0} color="#fff" height={90} />
                  <Fader value={0.9} onChange={() => {}} color="#fff" label="OUT" />
                </div>
                <div style={{ fontSize: 9, color: state.limiterEnabled ? "#f87171" : "rgba(255,255,255,0.18)", letterSpacing: "0.1em" }}>
                  {state.limiterEnabled ? "● LIMITED" : "○ OPEN"}
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* ══════════════════ EQ TAB ═══════════════════════════════════════ */}
        {activeTab === "eq" && (
          <Panel title="5-Band Parametric EQ" color="#e879f9">
            <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <Toggle active={state.eqEnabled} onClick={() => update("eqEnabled", !state.eqEnabled, "EQ Toggle")} color="#e879f9">
                {state.eqEnabled ? "● EQ On" : "○ Bypass"}
              </Toggle>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Drag knobs up to boost, down to cut each frequency range</span>
            </div>

            {/* EQ curve */}
            <div style={{ height: 90, background: "rgba(0,0,0,0.45)", borderRadius: 8, marginBottom: 16,
              border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
              <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none">
                {[0,25,50,75,100].map(y => <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(255,255,255,0.04)" />)}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.09)" strokeDasharray="4,4" />
                {state.eqEnabled && (() => {
                  const xs = [0, 9, 26, 50, 73, 90, 100];
                  const gains = EQ_BANDS.map(b => state.eqGains[b] || 0);
                  const ys = [50, 50, ...gains.map(g => 50 - g * 2.9), 50, 50];
                  const path = xs.map((x,i) => `${i===0?"M":"L"}${x},${ys[i]}`).join(" ");
                  return <>
                    <path d={path} fill="none" stroke="#e879f9" strokeWidth="1.8" style={{ filter: "drop-shadow(0 0 4px #e879f9)" }} />
                    <path d={`${path} L100,100 L0,100 Z`} fill="rgba(232,121,249,0.06)" />
                    {[9,26,50,73,90].map((x,i) => (
                      <circle key={i} cx={`${x}%`} cy={`${ys[i+1]}%`} r="3.5" fill="#e879f9" style={{ filter: "drop-shadow(0 0 4px #e879f9)" }} />
                    ))}
                  </>;
                })()}
              </svg>
              <div style={{ position: "absolute", top: 4, right: 8 }}>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.18)" }}>+12dB</span>
              </div>
              <div style={{ position: "absolute", bottom: 4, right: 8 }}>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.18)" }}>-12dB</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 10 }}>
              {[
                { band: "80Hz", hint: "Sub bass · room rumble" },
                { band: "250Hz", hint: "Low mids · mud / body" },
                { band: "1kHz", hint: "Mids · honk / presence" },
                { band: "4kHz", hint: "High mids · bite / clarity" },
                { band: "12kHz", hint: "Air · sparkle / harshness" },
              ].map(({ band, hint }) => (
                <div key={band} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                  padding: "12px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                  <Knob value={state.eqGains[band] || 0} min={-12} max={12} label={band} unit="dB" color="#e879f9" size={48}
                    onChange={v => updateEq(band, v)} />
                  <input type="range" min={-12} max={12} step={0.5} value={state.eqGains[band] || 0}
                    onChange={e => updateEq(band, parseFloat(e.target.value))}
                    style={{ width: 54, accentColor: "#e879f9" }} />
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.18)", textAlign: "center", maxWidth: 72, lineHeight: 1.4 }}>{hint}</div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* ══════════════════ DYNAMICS TAB ═════════════════════════════════ */}
        {activeTab === "dynamics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <Panel title="Amplification · Raise Your Volume" color="#fbbf24" compact>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <Knob value={state.amplify} min={-20} max={24} label="GAIN" unit="dB" color="#fbbf24" size={56} onChange={v => update("amplify", v, "Amplify")} />
                <div style={{ flex: 1 }}>
                  <input type="range" min={-20} max={24} step={0.5} value={state.amplify}
                    onChange={e => update("amplify", parseFloat(e.target.value), "Amplify")}
                    style={{ width: "100%", accentColor: "#fbbf24" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>
                    <span>Quieter</span><span>No change</span><span>Louder</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: "rgba(240,232,255,0.38)", lineHeight: 1.55 }}>
                    Quiet recording? Slide right. +6dB roughly doubles perceived volume.
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Compressor · Even Out Volume Spikes" color="#34d399" compact>
              <div style={{ marginBottom: 10 }}>
                <Toggle active={state.compEnabled} onClick={() => update("compEnabled", !state.compEnabled, "Comp Toggle")} color="#34d399">
                  {state.compEnabled ? "● On" : "○ Off"}
                </Toggle>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Knob value={state.threshold} min={-60} max={0} label="THRESHOLD" unit="dB" color="#34d399" size={48} onChange={v => update("threshold", v, "Threshold")} />
                  <Knob value={state.ratio} min={1} max={20} label="RATIO" unit=":1" color="#34d399" size={48} onChange={v => update("ratio", v, "Ratio")} />
                  <Knob value={state.attack} min={0.1} max={100} label="ATTACK" unit="ms" color="#34d399" size={48} onChange={v => update("attack", v, "Attack")} />
                  <Knob value={state.release} min={10} max={500} label="RELEASE" unit="ms" color="#34d399" size={48} onChange={v => update("release", v, "Release")} />
                  <Knob value={state.makeupGain} min={0} max={24} label="MAKEUP" unit="dB" color="#34d399" size={48} onChange={v => update("makeupGain", v, "Makeup")} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ fontSize: 8, color: "rgba(52,211,153,0.5)", letterSpacing: "0.12em" }}>GR</div>
                  <VUMeter level={isPlaying ? grMeter : 0} color="#34d399" height={66} />
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.22)" }}>-{(grMeter*12).toFixed(1)}dB</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: "rgba(240,232,255,0.35)", lineHeight: 1.55 }}>
                <span style={{ color: "#34d399" }}>Layperson tip:</span> Leave this to the presets. If you want to tweak: lower Threshold means more compression. Higher Ratio means more aggressive control.
              </div>
            </Panel>

            <Panel title="Hard Limiter · No More Clipping" color="#f87171" compact>
              <div style={{ marginBottom: 10 }}>
                <Toggle active={state.limiterEnabled} onClick={() => update("limiterEnabled", !state.limiterEnabled, "Limiter Toggle")} color="#f87171">
                  {state.limiterEnabled ? "● On" : "○ Off"}
                </Toggle>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <Knob value={state.limiterCeiling} min={-12} max={0} label="CEILING" unit="dB" color="#f87171" size={52} onChange={v => update("limiterCeiling", v, "Ceiling")} />
                <div style={{ fontSize: 11, color: "rgba(240,232,255,0.38)", lineHeight: 1.65, maxWidth: 340 }}>
                  Prevents your recording from ever exceeding the ceiling you set. Eliminates the distorted crackling sound. Set to <span style={{ color: "#f87171" }}>-1.5dB</span> and leave it.
                </div>
              </div>
            </Panel>

            <Panel title="Noise Gate · Silence Background Noise" color="#a78bfa" compact>
              <div style={{ marginBottom: 10 }}>
                <Toggle active={state.gateEnabled} onClick={() => update("gateEnabled", !state.gateEnabled, "Gate Toggle")} color="#a78bfa">
                  {state.gateEnabled ? "● On" : "○ Off"}
                </Toggle>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Knob value={state.gateThresh} min={-80} max={-10} label="OPEN AT" unit="dB" color="#a78bfa" size={50} onChange={v => update("gateThresh", v, "Gate")} />
                <div style={{ fontSize: 11, color: "rgba(240,232,255,0.38)", lineHeight: 1.65 }}>
                  Mic goes silent when you stop singing. Cuts out breathing, room hiss, and rustling between phrases.
                </div>
              </div>
            </Panel>

            <Panel title="De-Esser · Tame Harsh S / Sh Sounds" color="#fb923c" compact>
              <div style={{ marginBottom: 10 }}>
                <Toggle active={state.deEsserEnabled} onClick={() => update("deEsserEnabled", !state.deEsserEnabled, "De-Esser Toggle")} color="#fb923c">
                  {state.deEsserEnabled ? "● On" : "○ Off"}
                </Toggle>
              </div>
              <div style={{ fontSize: 11, color: "rgba(240,232,255,0.38)", lineHeight: 1.65 }}>
                Automatically softens overly sharp "s", "sh", and "ch" sounds that can hurt in headphones. Most genre presets enable this automatically.
              </div>
            </Panel>
          </div>
        )}

        {/* ══════════════════ FX TAB ════════════════════════════════════════ */}
        {activeTab === "fx" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Panel title="Reverb · Space & Depth" color="#a78bfa" compact>
              <div style={{ marginBottom: 10 }}>
                <Toggle active={state.reverbEnabled} onClick={() => update("reverbEnabled", !state.reverbEnabled, "Reverb Toggle")} color="#a78bfa">
                  {state.reverbEnabled ? "● Reverb On" : "○ Reverb Off"}
                </Toggle>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <Knob value={state.reverbSize} min={0} max={1} label="SIZE" color="#a78bfa" size={48} onChange={v => update("reverbSize", v, "Reverb Size")} />
                <Knob value={state.reverbDecay} min={0.1} max={8} label="DECAY" unit="s" color="#a78bfa" size={48} onChange={v => update("reverbDecay", v, "Reverb Decay")} />
                <Knob value={state.reverbSend} min={0} max={1} label="WET" color="#a78bfa" size={48} onChange={v => update("reverbSend", v, "Reverb Mix")} />
              </div>
              <div style={{ fontSize: 9, color: "rgba(167,139,250,0.45)", letterSpacing: "0.14em", marginBottom: 7 }}>ROOM PRESETS</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { name: "🚿 Bathroom", size: 0.1, decay: 0.5 },
                  { name: "🎙️ Booth", size: 0.15, decay: 0.7 },
                  { name: "🎭 Theater", size: 0.5, decay: 2.2 },
                  { name: "🏟️ Arena", size: 0.88, decay: 4.5 },
                  { name: "⛪ Cathedral", size: 0.95, decay: 7 },
                ].map(p => (
                  <button key={p.name} onClick={() => {
                    const ns = { ...state, reverbSize: p.size, reverbDecay: p.decay, reverbEnabled: true };
                    pushHistory(ns, `Room: ${p.name}`);
                  }} style={{ padding: "5px 11px", borderRadius: 6, cursor: "pointer",
                    border: "1px solid rgba(167,139,250,0.22)", background: "rgba(167,139,250,0.07)",
                    color: "#a78bfa", fontFamily: "monospace", fontSize: 10 }}>{p.name}</button>
                ))}
              </div>
            </Panel>

            <Panel title="Pitch Correction · Stay in Tune" color="#34d399" compact>
              <div style={{ marginBottom: 10 }}>
                <Toggle active={state.pitchEnabled} onClick={() => update("pitchEnabled", !state.pitchEnabled, "Pitch Toggle")} color="#34d399">
                  {state.pitchEnabled ? "● On" : "○ Off"}
                </Toggle>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                <Knob value={state.pitchStrength} min={0} max={100} label="STRENGTH" unit="%" color="#34d399" size={52} onChange={v => update("pitchStrength", v, "Pitch Strength")} />
                <div>
                  <div style={{ fontSize: 9, color: "rgba(52,211,153,0.45)", letterSpacing: "0.14em", marginBottom: 6 }}>KEY</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, maxWidth: 210 }}>
                    {["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map(k => (
                      <button key={k} onClick={() => update("pitchKey", k, `Key: ${k}`)} style={{
                        width: 31, height: 24, borderRadius: 4, cursor: "pointer",
                        border: `1px solid ${state.pitchKey === k ? "#34d399" : "rgba(255,255,255,0.07)"}`,
                        background: state.pitchKey === k ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.02)",
                        color: state.pitchKey === k ? "#34d399" : "rgba(255,255,255,0.3)",
                        fontFamily: "monospace", fontSize: 9
                      }}>{k}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 9, fontSize: 10, color: "rgba(240,232,255,0.35)", lineHeight: 1.6 }}>
                20–40% = natural, subtle tuning. 80–100% = T-Pain robot effect. Both are valid.
              </div>
            </Panel>
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(232,121,249,0.2); border-radius: 4px; }
        input[type=range] { height: 4px; cursor: pointer; }
      `}</style>
    </div>
  );
}
