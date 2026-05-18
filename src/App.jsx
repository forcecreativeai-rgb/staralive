import { useState, useEffect, useRef } from 'react'
import ProStudio from './ProStudio'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const GENRES = ['Pop', 'R&B / Soul', 'Rock', 'Hip-Hop', 'Country', 'Indie', 'Electronic', 'Worship']

const AI_SCENES = [
  { id: 'album',     emoji: '🎨', label: 'Album Cover',      desc: 'Debut drop' },
  { id: 'jet',       emoji: '✈️', label: 'Private Jet',       desc: 'Tour life' },
  { id: 'stadium',   emoji: '🏟️', label: 'Stadium Night',     desc: '80K strong' },
  { id: 'carpet',    emoji: '🎬', label: 'Red Carpet',        desc: 'Premiere night' },
  { id: 'backstage', emoji: '🌟', label: 'VIP Backstage',     desc: 'After the show' },
  { id: 'studio',    emoji: '🎛️', label: 'Recording Studio',  desc: 'Back in the lab' },
  { id: 'social',    emoji: '📱', label: 'StarAGramLive',     desc: 'Millions following' },
  { id: 'magazine',  emoji: '📰', label: 'Rock & Stone',        desc: 'Cover story' },
  { id: 'billboard', emoji: '🏙️', label: 'Freeway Billboard',   desc: 'Sold out tour' },
]

const AI_PROMPTS = {
  album:     "Photorealistic music album cover. The artist stands front-facing, sharp direct eye contact with camera, single dramatic overhead spotlight creating deep shadows under cheekbones and jaw, wearing a tailored all-black outfit. Background is pure black negative space. Skin texture, pores, and hair strands rendered with medium format camera fidelity. No graphic design elements — raw portrait photography. Shot on Hasselblad H6D-100c. Ultra-sharp focus on face. Photorealistic, not illustrated.",
  jet:       "Photorealistic candid photograph inside a Gulfstream G700 private jet. The artist is seated sideways in a cream leather captain chair, one leg crossed, looking out the oval window at a city grid 40,000 feet below during golden hour. Warm amber sunlight rakes across their face and hands. Champagne flute on the walnut side table. The artist is not posing — caught in a private moment. Leica M11 snapshot quality. Real leather texture, real light, real person.",
  stadium:   "Photorealistic wide-angle concert photograph from stage level. The artist stands at the front lip of a massive stadium stage, back to camera, arms outstretched facing 80,000 fans whose phone flashlights create a galaxy of white dots filling every seat. Twin pyrotechnic columns fire orange-gold flames 30 feet high on both sides. Blue laser grid sweeps overhead. Shot on Canon EOS R3 with 24mm lens. Raw documentary energy — not a render, not CGI.",
  carpet:    "Photorealistic editorial photograph on a Hollywood awards show red carpet. The artist walks directly toward the camera with total confidence — not pausing to pose. Paparazzi flashguns firing from both sides create a white halo backlight effect around their silhouette. Velvet rope and crowd blur in the background. They wear a custom suit or gown with visible fabric texture and hand-stitching. Getty Images wire photo quality. Sharp, real, present.",
  backstage: "Photorealistic documentary photograph in a sold-out arena green room, minutes after the show. The artist sits on a couch still in their stage outfit, adrenaline visibly fading, towel around neck, sweat still on brow. Champagne bottles open on the coffee table. Platinum records on the cinder block wall. A few people in the background blurred. Ring light visible in the mirror behind them. Available light only — authentic, unposed, real moment.",
  studio:    "Photorealistic behind-the-glass recording studio photograph. Camera is positioned in the control room shooting through the soundproof glass window into the vocal booth. The artist is leaning into a Neumann U87 microphone, eyes closed, one hand raised, headphones clamped on, genuinely performing. The SSL 9000 console fills the foreground, fader lights glowing amber. Late night — empty coffee cups, notebook with handwritten lyrics. Real room, real person, no illustration.",
  social:    "Hyper-realistic smartphone screen mockup showing a social media profile app called StarAGramLive in dark mode. The phone screen shows: circular profile photo of a music artist, verified blue checkmark, username in bold, 4.2M followers, 847 following, bio text reading 'New album dropping · World tour announced · Back in the studio'. Below the bio are 9 square photo grid thumbnails showing concert moments, backstage, studio sessions. A pinned reel shows 847K likes. The phone itself is a modern black smartphone held in a real hand. Photorealistic product photography.",
  magazine:  "Photorealistic luxury magazine cover. Bold serif font masthead at top reads ROCK AND STONE in white on dark background. The artist sits center frame on an enormous sculptural lips-shaped sofa — velvet upholstery in deep maroon and royal purple, the lips shape clearly visible. On both sides of the couch, floor-to-ceiling natural amethyst geode cathedrals and raw quartz crystal clusters glow purple. Above the couch on the wall: an ornate dreamcatcher with long feathers, and centered above it, a framed all-seeing eye occult artwork in a gold frame. A single lamp glows on the floor centered directly behind the couch. The composition — lamp as nose, couch as lips, eye as eye — forms a surreal face in the room. Helmut Newton editorial photography. Deep shadows. Real velvet texture.",
  billboard: "Photorealistic street-level photograph looking up at a massive highway billboard over a downtown Los Angeles intersection at golden hour sunset. The billboard graphic shows: artist name in huge bold white type, dramatic backlit concert performance photo, red block-stamp text reading SOLD OUT, secondary text ONE NIGHT ONLY and WORLD TOUR. City traffic and pedestrians blur below. The billboard structure is weathered steel and real vinyl wrap. Orange and purple sunset sky behind it. Buildings visible on both sides. Shot on 16mm wide angle, slightly distorted perspective from below. Real city, real sign.",
}

// ─── SORA VIDEO DEFINITIONS ──────────────────────────────────────────────────

const SORA_VIDEOS = [
  { id: 'tour',    emoji: '🚌', label: 'Tour Video',     desc: 'Life on the road',    cost: 100 },
  { id: 'hype',    emoji: '⚡', label: 'Hype Reel',      desc: 'Pure energy',         cost: 100 },
  { id: 'mv',      emoji: '🎬', label: 'Music Video',    desc: 'Your visual story',   cost: 100 },
  { id: 'concert', emoji: '🏟️', label: 'Live Concert',   desc: 'The crowd goes wild', cost: 100 },
  { id: 'studio',  emoji: '🎹', label: 'Studio Session', desc: 'Behind the glass',    cost: 100 },
  { id: 'life',    emoji: '🛥️', label: 'Lifestyle',      desc: 'The life you earned', cost: 100 },
]

const SORA_PROMPTS = {
  tour:    "Cinematic tour documentary. A music artist's name lit in massive LED letters on the side of a tour bus pulling away from a sold-out arena at night, crowd still roaring. Camera follows from low angle, city lights blurring into bokeh. Cut to interior — artist silhouette against tinted window watching the city pass. Slow motion confetti. Anamorphic lens flares. 10 seconds.",
  hype:    "High-energy music hype reel. Rapid cinematic cuts: artist on stage grabbing microphone as spotlight hits, crowd of 50,000 arms raised, twin pyrotechnic columns firing, confetti cannon burst, blue laser grid sweeping the arena. Artist center stage arms outstretched, entire crowd behind them as a sea of lights. Deep blacks, electric blues, hot whites. 10 seconds.",
  mv:      "Cinematic music video scene. Artist in slow motion down an empty neon-lit city street at 2am, wearing all black, rain-slicked pavement reflecting pink and blue neon. Low fog on the ground. Camera dollies alongside. Artist pauses, turns toward camera, city lights forming a halo. Shot on 35mm film with grain and anamorphic bokeh. 10 seconds.",
  concert: "Immersive live concert POV. Camera moves through a massive festival crowd — thousands of fans, phone lights waving. Reaches the front barrier as the artist appears center stage in a single white spotlight. Crowd erupts. Pyrotechnic burst from the stage. Camera cranes up to reveal the full stadium — rafters packed, giant LED screens, a banner dropping. 10 seconds.",
  studio:  "Intimate late-night recording studio. Artist at a grand piano in a darkened Los Angeles studio, city lights glowing through floor-to-ceiling windows. Engineer visible through soundproof glass at an SSL mixing console. Artist leans toward the microphone, eyes closed. Warm amber lamp. Candles. Empty coffee cups. Analog tape reels turning slowly. 10 seconds.",
  life:    "Luxury lifestyle cinematic sequence. Artist on the rear sundeck of a superyacht in the Mediterranean, golden hour light, champagne, watching the horizon. Slow drone orbit. Cut to marble interior, fresh orchids, light through a porthole. Cut to aerial of a clifftop villa, infinity pool over the sea. Aspirational, earned, quiet. 10 seconds.",
}

// ─── STAR ENERGY & COMBO DEFINITIONS ─────────────────────────────────────────

const ENERGY_AWARDS = {
  audition: 25,
  sign:     40,
  studio:   60,
  vision:   30,
  rollout:  50,
  era:       0,
}

const MIXDOWN_COMBOS = {
  'Rock':       ['Rock', 'Kick Ass'],
  'Pop':        ['Pop Lead', 'Dreamy'],
  'R&B / Soul': ['R&B / Soul', 'Cinematic'],
  'Hip-Hop':    ['Rap / Spoken', 'Kick Ass'],
  'Country':    ['Singer-Writer', 'Raw'],
  'Indie':      ['Indie / Lo-Fi', 'Singer-Writer'],
  'Electronic': ['Cinematic', 'Dreamy'],
  'Worship':    ['Worship', 'Harmony BG'],
}

// ─── SMALL SHARED COMPONENTS ─────────────────────────────────────────────────

function GoldButton({ children, onClick, disabled, size = 'md', style = {} }) {
  const sizes = {
    sm: { padding: '10px 22px', fontSize: '13px' },
    md: { padding: '14px 36px', fontSize: '15px' },
    lg: { padding: '18px 52px', fontSize: '17px' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizes[size],
        background: disabled
          ? 'rgba(212,175,55,0.15)'
          : 'linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #b8960c 100%)',
        color: disabled ? 'rgba(212,175,55,0.4)' : '#0a0a0a',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        border: disabled ? '1px solid rgba(212,175,55,0.2)' : 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function SceneHeader({ act, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp 0.6s ease both' }}>
      <div style={{
        fontSize: '11px',
        letterSpacing: '0.35em',
        color: 'var(--gold)',
        textTransform: 'uppercase',
        marginBottom: '12px',
        fontWeight: 500,
      }}>
        {act}
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: 900,
        color: 'var(--text)',
        lineHeight: 1.1,
        marginBottom: '14px',
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── STAR ENERGY BURST ───────────────────────────────────────────────────────

function StarBurst({ onDone, message = 'STAR ENERGY', subtitle = 'Level Unlocked' }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  // Two waves of particles — inner burst + outer scatter
  const particles = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * 360 + (Math.random() * 15 - 7.5)
    const dist = i < 24 ? (60 + Math.random() * 140) : (160 + Math.random() * 220)
    const size = i < 24 ? (8 + Math.random() * 14) : (3 + Math.random() * 7)
    const dur = i < 24 ? (0.7 + Math.random() * 0.5) : (1.0 + Math.random() * 0.8)
    const delay = i < 24 ? (Math.random() * 0.2) : (0.1 + Math.random() * 0.4)
    const rad = (angle * Math.PI) / 180
    const tx = Math.cos(rad) * dist
    const ty = Math.sin(rad) * dist
    const colors = ['#FFD700', '#FFC107', '#FFFFFF', '#FFE57F', '#D4AF37']
    const color = colors[i % colors.length]
    return { tx, ty, size, dur, delay, i, color }
  })

  // Sparkle ring positions
  const rings = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360,
    delay: 0.15 + i * 0.06,
    size: 16 + Math.random() * 10,
  }))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* Full screen dramatic flash — white then gold then dark */}
      <div style={{
        position: 'absolute', inset: 0,
        animation: 'megaFlash 0.6s ease forwards',
        background: 'rgba(255,255,255,0)',
      }} />

      {/* Radial gold sweep from center */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.35) 0%, transparent 65%)',
        animation: 'radialPulse 1.2s ease forwards',
      }} />

      {/* Expanding rings — 3 of them */}
      {[0, 0.2, 0.4].map((delay, ri) => (
        <div key={ri} style={{
          position: 'absolute',
          width: '80px', height: '80px',
          borderRadius: '50%',
          border: `${2 - ri * 0.5}px solid rgba(212,175,55,${0.8 - ri * 0.2})`,
          animation: `expandRing 1.4s ${delay}s ease forwards`,
        }} />
      ))}

      {/* Orbiting sparkles */}
      {rings.map((r, ri) => {
        const rad = (r.angle * Math.PI) / 180
        return (
          <div key={ri} style={{
            position: 'absolute',
            width: `${r.size}px`, height: `${r.size}px`,
            animation: `sparkleOrbit 1.8s ${r.delay}s ease forwards`,
            opacity: 0,
            '--ox': `${Math.cos(rad) * 100}px`,
            '--oy': `${Math.sin(rad) * 100}px`,
          }}>
            <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%' }}>
              <polygon points="10,0 12,8 20,8 14,13 16,20 10,15 4,20 6,13 0,8 8,8" fill="#D4AF37" opacity="0.9" />
            </svg>
          </div>
        )
      })}

      {/* Particle burst */}
      {particles.map(p => (
        <div key={p.i} style={{
          position: 'absolute',
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: p.i % 5 === 0 ? '2px' : '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `particleFly${p.i} ${p.dur}s ${p.delay}s cubic-bezier(0.2,0.8,0.4,1) forwards`,
          opacity: 1,
        }} />
      ))}

      {/* Central achievement card */}
      <div style={{
        position: 'absolute',
        textAlign: 'center',
        animation: 'achieveCard 3s ease forwards',
        padding: '0 20px',
      }}>
        {/* Star icon */}
        <div style={{
          fontSize: '52px',
          animation: 'starSpin 0.8s ease forwards',
          display: 'block',
          marginBottom: '12px',
          filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.9))',
        }}>⭐</div>

        <div style={{
          fontSize: 'clamp(32px, 7vw, 56px)',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          color: '#FFD700',
          textShadow: '0 0 30px rgba(212,175,55,1), 0 0 60px rgba(212,175,55,0.6), 0 0 100px rgba(255,215,0,0.3)',
          letterSpacing: '0.06em',
          lineHeight: 1,
          marginBottom: '12px',
        }}>
          {message}
        </div>

        <div style={{
          fontSize: '13px',
          letterSpacing: '0.35em',
          color: 'rgba(255,255,255,0.9)',
          textTransform: 'uppercase',
          fontWeight: 700,
          textShadow: '0 0 20px rgba(255,255,255,0.5)',
        }}>
          ✦ {subtitle} ✦
        </div>
      </div>

      <style>{[
        '@keyframes megaFlash { 0%{opacity:0} 8%{opacity:1;background:rgba(255,255,255,0.9)} 20%{background:rgba(212,175,55,0.4)} 60%{background:rgba(212,175,55,0.1)} 100%{opacity:0;background:rgba(0,0,0,0)} }',
        '@keyframes radialPulse { 0%{opacity:0;transform:scale(0.3)} 30%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(2.5)} }',
        '@keyframes expandRing { 0%{transform:scale(0);opacity:1} 60%{opacity:0.6} 100%{transform:scale(18);opacity:0} }',
        '@keyframes achieveCard { 0%{opacity:0;transform:scale(0.4)} 15%{opacity:1;transform:scale(1.08)} 25%{transform:scale(0.97)} 35%{transform:scale(1)} 75%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.15)} }',
        '@keyframes starSpin { 0%{transform:rotate(-180deg) scale(0)} 60%{transform:rotate(10deg) scale(1.2)} 100%{transform:rotate(0deg) scale(1)} }',
        '@keyframes sparkleOrbit { 0%{opacity:0;transform:translate(0,0) scale(0)} 20%{opacity:1;transform:translate(var(--ox),var(--oy)) scale(1.2)} 60%{opacity:0.8;transform:translate(var(--ox),var(--oy)) scale(1)} 100%{opacity:0;transform:translate(var(--ox),var(--oy)) scale(0)} }',
        ...particles.map(p => `@keyframes particleFly${p.i} { 0%{transform:translate(0,0) scale(1.2);opacity:1} 100%{transform:translate(${p.tx}px,${p.ty}px) scale(0);opacity:0} }`),
      ].join('\n')}</style>
    </div>
  )
}


function Notification({ message, visible }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s ease',
      background: 'var(--gold)',
      color: '#0a0a0a',
      padding: '12px 28px',
      borderRadius: '4px',
      fontWeight: 700,
      fontSize: '13px',
      letterSpacing: '0.06em',
      zIndex: 999,
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

// ─── STAR ENERGY DISPLAY ─────────────────────────────────────────────────────

function StarEnergyDisplay({ energy, gained }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      background: 'rgba(212,175,55,0.08)',
      border: '1px solid rgba(212,175,55,0.25)',
      borderRadius: '20px', padding: '5px 12px',
      position: 'relative', overflow: 'visible',
    }}>
      <span style={{ fontSize: '14px' }}>⚡</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em' }}>
        {energy.toLocaleString()}
      </span>
      {gained > 0 && (
        <span style={{
          position: 'absolute', top: '-22px', right: '4px',
          fontSize: '11px', color: '#4caf50', fontWeight: 700,
          animation: 'energyGain 1.8s ease forwards', pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>+{gained} ⚡</span>
      )}
    </div>
  )
}

// ─── UNLOCK BURST ─────────────────────────────────────────────────────────────

function UnlockBurst({ title, subtitle, reward, colors, emoji, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [])
  const [c1, c2, c3] = colors || ['#d946ef', '#818cf8', '#38bdf8']
  const particles = Array.from({ length: 36 }, (_, i) => ({
    i, angle: (i / 36) * Math.PI * 2,
    dist: 80 + Math.random() * 120, color: [c1, c2, c3][i % 3],
    size: 4 + Math.random() * 6, delay: Math.random() * 0.3,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${c1}22 0%, ${c2}11 40%, transparent 70%)`, animation: 'radialPulse 3s ease forwards' }} />
      {particles.map(p => {
        const tx = Math.cos(p.angle) * p.dist; const ty = Math.sin(p.angle) * p.dist
        return <div key={p.i} style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '50%', background: p.color, top: '50%', left: '50%', marginTop: -p.size/2, marginLeft: -p.size/2, animation: `unlockP${p.i} 1.4s ${p.delay}s ease forwards`, boxShadow: `0 0 ${p.size*2}px ${p.color}` }} />
      })}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '40px 48px', background: 'rgba(10,10,10,0.95)', border: `1px solid ${c1}55`, borderRadius: '16px', boxShadow: `0 0 60px ${c1}33`, animation: 'achieveCard 3s ease forwards', maxWidth: '320px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px', animation: 'starSpin 0.6s ease' }}>{emoji}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, marginBottom: '8px', background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>{title}</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', lineHeight: 1.5 }}>{subtitle}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${c1}18`, border: `1px solid ${c1}44`, borderRadius: '20px', padding: '8px 20px' }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, color: c1 }}>+{reward}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Star Energy</span>
        </div>
      </div>
      <style>{particles.map(p => { const tx = Math.cos(p.angle)*p.dist; const ty = Math.sin(p.angle)*p.dist; return `@keyframes unlockP${p.i}{0%{transform:translate(0,0) scale(1.5);opacity:1}100%{transform:translate(${tx}px,${ty}px) scale(0);opacity:0}}` }).join(' ')}</style>
    </div>
  )
}

// ─── SORA VIDEO CARD ─────────────────────────────────────────────────────────

function SoraVideoCard({ video, starEnergy, onGenerate, videoData, onWatch }) {
  const { id, emoji, label, desc, cost } = video
  const status = videoData?.status || 'idle'
  const videoUrl = videoData?.url || null
  const progress = videoData?.progress || 0
  const canAfford = starEnergy >= cost

  function handleClick() {
    if (status === 'done' && videoUrl) { onWatch({ id, url: videoUrl, label }); return }
    if (status === 'idle' && canAfford) { onGenerate(id); return }
  }

  return (
    <div onClick={handleClick}
      style={{
        borderRadius: '10px', overflow: 'hidden',
        border: status === 'done' ? '2px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.08)',
        background: 'var(--surface2)',
        cursor: (status === 'idle' && canAfford) || status === 'done' ? 'pointer' : 'default',
        position: 'relative',
        transition: 'border-color 0.3s, transform 0.2s',
        transform: status === 'done' ? 'scale(1.01)' : 'scale(1)',
      }}>

      {/* Thumbnail / status area */}
      <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

        {status === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px', filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.8))' }}>▶</div>
            <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.1em' }}>TAP TO WATCH</div>
          </div>
        ) : status === 'pending' || status === 'queued' ? (
          <div style={{ textAlign: 'center', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ width: '28px', height: '28px', border: '2px solid rgba(212,175,55,0.2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 10px' }} />
            <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '8px' }}>
              {status === 'queued' ? 'QUEUED — STARTING...' : `RENDERING ${progress}%`}
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>~60–90 sec · Sora AI</div>
          </div>
        ) : status === 'failed' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚠️</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,80,80,0.8)' }}>Failed — energy refunded</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{emoji}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: canAfford ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${canAfford ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '4px 10px', fontSize: '11px', color: canAfford ? 'var(--gold)' : 'var(--text-muted)' }}>
              <span>⚡</span><span>{cost}</span>
            </div>
            {!canAfford && <div style={{ fontSize: '10px', color: 'rgba(255,80,80,0.7)', marginTop: '6px' }}>Need more energy</div>}
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: status === 'done' ? 'var(--gold)' : 'var(--text-muted)' }}>
          {status === 'done' ? '✦ Ready to watch' : desc}
        </div>
      </div>
    </div>
  )
}

// ─── VIDEO PLAYER OVERLAY ────────────────────────────────────────────────────

function VideoPlayer({ videoId, url, label, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(0,0,0,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2px' }}>Sora AI · StarAlive</div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>{label}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
      </div>

      {/* Video */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <video
          src={url}
          controls
          autoPlay
          loop
          playsInline
          style={{ maxWidth: '100%', maxHeight: '100%', width: '100%' }}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px', textAlign: 'center',
        fontSize: '11px', color: 'var(--text-muted)',
        background: 'rgba(0,0,0,0.8)',
      }}>
        Generated by Veo 3.1 · Force Creative AI · StarAlive 2026
      </div>
    </div>
  )
}

// ─── ACT I: AUDITION ─────────────────────────────────────────────────────────

function AuditionScene({ onAdvance }) {
  const [name, setName] = useState('')
  const [genre, setGenre] = useState('')
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 20px' }}>

      {/* Spotlight glow behind headline */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        marginBottom: '40px',
        animation: 'fadeUp 0.6s ease both',
      }}>
        {/* Spotlight beam */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          height: '220px',
          background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontSize: '11px',
          letterSpacing: '0.35em',
          color: 'var(--gold)',
          textTransform: 'uppercase',
          marginBottom: '16px',
          fontWeight: 500,
        }}>
          Discovery
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px, 6vw, 54px)',
          fontWeight: 900,
          lineHeight: 1.05,
          marginBottom: '16px',
          background: 'linear-gradient(180deg, #ffffff 30%, rgba(212,175,55,0.85) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'glow 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.25))',
        }}>
          You've Been<br />Discovered.
        </h1>

        <p style={{
          color: 'var(--text-dim)',
          fontSize: '16px',
          lineHeight: 1.6,
          fontStyle: 'italic',
          letterSpacing: '0.02em',
        }}>
          We'd like to extend you an offer.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0 }}>

        {/* Marquee-style input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'var(--gold)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            What name should we put in lights?
          </label>

          {/* Stage light frame */}
          <div style={{
            position: 'relative',
            borderRadius: '6px',
            padding: '2px',
            background: focused
              ? 'linear-gradient(90deg, #d4af37, #f0d060, #b8960c, #f0d060, #d4af37)'
              : 'rgba(212,175,55,0.2)',
            backgroundSize: focused ? '200% 100%' : '100% 100%',
            animation: focused ? 'shimmer 1.5s linear infinite' : 'none',
            transition: 'background 0.3s',
            boxShadow: focused ? '0 0 24px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.1)' : 'none',
          }}>
            {/* Bulb dots top */}
            {focused && (
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 8px 0' }}>
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'var(--gold)',
                    opacity: 0.4 + (i % 3) * 0.2,
                    animation: `pulse ${0.8 + i * 0.1}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            )}
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name in lights..."
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 20px',
                color: focused ? '#fff' : 'var(--text)',
                fontSize: '18px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                outline: 'none',
                textAlign: 'center',
                textShadow: focused && name ? '0 0 20px rgba(212,175,55,0.6)' : 'none',
                transition: 'all 0.2s',
              }}
            />
            {/* Bulb dots bottom */}
            {focused && (
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 8px 4px' }}>
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'var(--gold)',
                    opacity: 0.4 + (i % 3) * 0.2,
                    animation: `pulse ${0.9 + i * 0.1}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Genre */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Your Genre
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '4px',
                  border: `1px solid ${genre === g ? 'var(--gold)' : 'rgba(212,175,55,0.2)'}`,
                  background: genre === g ? 'rgba(212,175,55,0.12)' : 'transparent',
                  color: genre === g ? 'var(--gold)' : 'var(--text-dim)',
                  fontSize: '13px',
                  fontWeight: genre === g ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: '8px', textAlign: 'center' }}>
          <GoldButton
            onClick={() => onAdvance({ artistName: name, genre })}
            disabled={!name.trim() || !genre}
            size="lg"
          >
            Claim Your Destiny
          </GoldButton>
        </div>
      </div>
    </div>
  )
}

// ─── ACT II: SIGN ────────────────────────────────────────────────────────────

function SignScene({ artistName, genre, onAdvance }) {
  const [progress, setProgress] = useState(0)
  const [signed, setSigned] = useState(false)
  const [signing, setSigning] = useState(false)

  function handleSign() {
    setSigning(true)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setSigned(true)
          setTimeout(() => onAdvance(), 1200)
          return 100
        }
        return p + 2
      })
    }, 40)
  }

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '0 20px' }}>
      <SceneHeader
        act="Signing"
        title="Sign With StarAlive Records"
        subtitle={`${artistName}, the label has reviewed your audition. This is the moment.`}
      />

      {/* Contract */}
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '6px',
        padding: '32px',
        marginBottom: '28px',
        animation: 'fadeUp 0.6s 0.1s ease both',
        opacity: 0,
        fontFamily: 'Georgia, serif',
        lineHeight: 1.8,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', marginBottom: '4px' }}>
            StarAlive Records
          </div>
          <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Artist Development Agreement
          </div>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '16px' }}>
          This agreement is entered into between <strong style={{ color: 'var(--text)' }}>StarAlive Records</strong> and the artist known as{' '}
          <strong style={{ color: 'var(--gold)' }}>{artistName}</strong>, hereinafter referred to as "The Artist."
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '16px' }}>
          StarAlive Records agrees to provide full studio access, AI-powered image generation, and global distribution infrastructure for all recordings in the genre of{' '}
          <strong style={{ color: 'var(--gold)' }}>{genre}</strong>.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
          The Artist agrees to bring their authentic voice, creative vision, and full commitment to the era ahead.
        </p>

        {/* Signature line */}
        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{
                height: '2px',
                background: signing
                  ? 'linear-gradient(90deg, var(--gold), transparent)'
                  : 'rgba(212,175,55,0.2)',
                width: signing ? `${progress}%` : '200px',
                transition: 'width 0.1s',
                marginBottom: '6px',
                animation: signed ? 'none' : undefined,
              }} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                {signed ? `✓ ${artistName}` : 'ARTIST SIGNATURE'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                StarAlive Records
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2026</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s 0.25s ease both', opacity: 0 }}>
        {!signed && (
          <GoldButton onClick={handleSign} disabled={signing} size="lg">
            {signing ? `Signing... ${progress}%` : 'Sign the Deal'}
          </GoldButton>
        )}
        {signed && (
          <div style={{ color: 'var(--gold)', fontSize: '18px', fontFamily: 'var(--font-display)', animation: 'fadeIn 0.5s ease' }}>
            ✦ Welcome to the roster, {artistName}. ✦
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ACT III: STUDIO ─────────────────────────────────────────────────────────

const BOOTH_TIPS = [
  { tip: 'Wear cans.', sub: 'Headphones keep the track out of the mic.' },
  { tip: 'Dead room only.', sub: 'No bathrooms, glass, or bare walls. Kill the bounce.' },
  { tip: 'Work the mic.', sub: 'Get close for warmth, pull back for loud notes.' },
  { tip: 'Kill your phone.', sub: 'Airplane mode. One buzz ruins the take.' },
  { tip: "Hydrate, don't caffeinate.", sub: 'Coffee dries the cords. Water is the move.' },
  { tip: 'Pop filter up.', sub: "Kills plosives on P's and B's before they hit tape." },
  { tip: 'Rest before you record.', sub: 'Tired voice = thin tone. Sleep is free studio time.' },
  { tip: 'First take energy.', sub: "Your best performance is usually take 2 or 3. Don't overthink it." },
  { tip: "Stand, don't sit.", sub: 'Diaphragm opens up standing. Sitting compresses your air.' },
  { tip: 'Gain staging matters.', sub: 'Peaks above -6dB clip in the mix. Leave headroom.' },
  { tip: 'Record dry.', sub: 'Capture the clean vocal. Add reverb in mix, not tracking.' },
  { tip: 'Nail the consonants.', sub: "Crisp T's and K's cut through the mix. Lazy consonants disappear." },
]

function BoothTip() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * BOOTH_TIPS.length))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % BOOTH_TIPS.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const tip = BOOTH_TIPS[idx]
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '14px 18px',
      background: 'rgba(212,175,55,0.05)',
      border: '1px solid rgba(212,175,55,0.15)',
      borderLeft: '3px solid var(--gold)',
      borderRadius: '6px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.35s ease',
      minHeight: '64px',
      marginTop: '24px',
    }}>
      <div style={{ fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>🎙️</div>
      <div>
        <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
          From the Booth
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>
          {tip.tip}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          {tip.sub}
        </div>
      </div>
    </div>
  )
}

function StudioScene({ artistName, genre, onAdvance, onMixdownCombo }) {
  const [studioBurst, setStudioBurst] = useState(false)
  const [tab, setTab] = useState('record')
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [tracks, setTracks] = useState([])
  const [waveValues, setWaveValues] = useState(Array(32).fill(0.3))
  const timerRef = useRef(null)
  const waveRef = useRef(null)

  function startRecording() {
    let count = 3
    setCountdown(count)
    const cd = setInterval(() => {
      count--
      if (count === 0) {
        clearInterval(cd)
        setCountdown('GO')
        setTimeout(() => {
          setCountdown(null)
          setIsRecording(true)
          setRecordingTime(0)
          timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
          waveRef.current = setInterval(() => {
            setWaveValues(Array(32).fill(0).map(() => 0.15 + Math.random() * 0.85))
          }, 80)
        }, 500)
      } else {
        setCountdown(count)
      }
    }, 800)
  }

  function stopRecording() {
    clearInterval(timerRef.current)
    clearInterval(waveRef.current)
    setIsRecording(false)
    setWaveValues(Array(32).fill(0.3))
    const trackNum = tracks.length + 1
    setTracks(t => [...t, {
      id: trackNum,
      name: `${artistName} — Take ${trackNum}`,
      duration: recordingTime,
      genre,
    }])
    setRecordingTime(0)
  }

  function formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const tabs = [
    { id: 'record', label: '⏺ Record' },
    { id: 'mix',    label: '🎛 Mix' },
    { id: 'tracks', label: `📀 Tracks${tracks.length ? ` (${tracks.length})` : ''}` },
  ]

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>
      <SceneHeader
        act="Studio"
        title="Lay Down Your Track"
        subtitle="The booth is yours. Take as many takes as you need."
      />

      {/* Tab Nav */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--surface2)',
        borderRadius: '6px',
        padding: '4px',
        marginBottom: '28px',
        animation: 'fadeUp 0.5s 0.1s ease both',
        opacity: 0,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '4px',
              background: tab === t.id ? 'var(--surface3)' : 'transparent',
              color: tab === t.id ? 'var(--gold)' : 'var(--text-dim)',
              fontSize: '13px',
              fontWeight: tab === t.id ? 600 : 400,
              border: tab === t.id ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Record Tab */}
      {tab === 'record' && (
        <div style={{ animation: 'fadeUp 0.4s ease both', textAlign: 'center' }}>
          {/* Countdown overlay */}
          {countdown !== null && (
            <div style={{
              fontSize: countdown === 'GO' ? '52px' : '72px',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              color: countdown === 'GO' ? 'var(--gold)' : 'var(--text)',
              marginBottom: '24px',
              animation: 'fadeIn 0.3s ease',
            }}>
              {countdown}
            </div>
          )}

          {/* Waveform */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            height: '80px',
            marginBottom: '28px',
            background: 'var(--surface2)',
            borderRadius: '8px',
            padding: '12px 20px',
            border: isRecording ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'border-color 0.3s',
          }}>
            {waveValues.map((v, i) => (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: `${v * 100}%`,
                  background: isRecording
                    ? `rgba(212,175,55,${0.4 + v * 0.6})`
                    : 'rgba(255,255,255,0.15)',
                  borderRadius: '2px',
                  transition: isRecording ? 'height 0.08s ease' : 'height 0.4s ease',
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Timer */}
          {isRecording && (
            <div style={{ fontFamily: 'monospace', fontSize: '28px', color: 'var(--gold)', marginBottom: '20px', animation: 'pulse 1s infinite' }}>
              ⏺ {formatTime(recordingTime)}
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {!isRecording ? (
              <GoldButton onClick={startRecording} disabled={countdown !== null} size="md">
                {countdown !== null ? 'Get Ready...' : '⏺  Start Recording'}
              </GoldButton>
            ) : (
              <GoldButton onClick={stopRecording} size="md" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff' }}>
                ⏹  Stop & Save
              </GoldButton>
            )}
          </div>

          <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            StarAlive captures your vocal performance.<br />
            Karaoke backing tracks stream via Stingray's licensed catalog.
          </p>

          <BoothTip />
        </div>
      )}

      {/* Mix Tab — Full ProStudio */}
      {tab === 'mix' && (
        <div style={{ animation: 'fadeIn 0.4s ease both' }}>
          {tracks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎛️</div>
              <p>Record a track first, then come back to mix it.</p>
            </div>
          ) : (
            <ProStudio onMixdownCombo={onMixdownCombo} />
          )}
        </div>
      )}

      {/* Tracks Tab */}
      {tab === 'tracks' && (
        <div style={{ animation: 'fadeIn 0.4s ease both' }}>
          {tracks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📀</div>
              <p>No tracks yet. Hit Record and lay something down.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tracks.map(track => (
                <div key={track.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'var(--surface2)',
                  borderRadius: '6px',
                  border: '1px solid rgba(212,175,55,0.1)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold-glow)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      🎤
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{track.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{track.genre} · {formatTime(track.duration)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em' }}>SAVED</div>
                </div>
              ))}

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <GoldButton onClick={() => setStudioBurst(true)} size="md">
                  ⭐ Take This to Rollout →
                </GoldButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advance from record tab if tracks exist */}
      {tab === 'record' && tracks.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <GoldButton onClick={() => setStudioBurst(true)} size="md">
            ⭐ {tracks.length} track{tracks.length > 1 ? 's' : ''} ready — Drop to Rollout
          </GoldButton>
        </div>
      )}
      {studioBurst && <StarBurst message="TRACK LOCKED IN" subtitle="Studio Session Complete" onDone={() => { setStudioBurst(false); onAdvance({ tracks }) }} />}
    </div>
  )
}

// ─── ACT IV: ROLLOUT ─────────────────────────────────────────────────────────

// ─── IMAGE LIGHTBOX ──────────────────────────────────────────────────────────

function ImageLightbox({ url, label, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
        cursor: 'zoom-out',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.1)', border: 'none',
          color: '#fff', borderRadius: '50%', width: '40px', height: '40px',
          fontSize: '20px', cursor: 'pointer', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>

      {/* Label */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px',
        fontSize: '12px', color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.15em', textTransform: 'uppercase',
      }}>
        {label} · Press Shot
      </div>

      {/* Image */}
      <img
        src={url}
        alt={label}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '92vw', maxHeight: '88vh',
          objectFit: 'contain',
          borderRadius: '4px',
          cursor: 'default',
        }}
      />

      {/* Tap to close hint */}
      <div style={{
        position: 'absolute', bottom: '20px',
        fontSize: '11px', color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.1em',
      }}>
        Tap anywhere to close
      </div>
    </div>
  )
}


function RolloutScene({ artistName, genre, tracks, artistPhotoBase64, customVibe, faceDescription, onAdvance, onEnergyGain, onSpendEnergy, starEnergy, onCheckVisionary, onCheckIconStatus, hasPhoto, characterRef, onSetCharacterRef }) {
  const [activeScene, setActiveScene] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState({})
  const [selected, setSelected] = useState({})
  const [notify, setNotify] = useState({ visible: false, message: '' })
  const [bursting, setBursting] = useState(false)
  const [videos, setVideos] = useState({})
  const pollRefs = useRef({})
  const [activeVideo, setActiveVideo] = useState(null) // { id, url, label } for fullscreen video
  const [lightbox, setLightbox] = useState(null) // { url, label } for fullscreen image

  useEffect(() => { return () => Object.values(pollRefs.current).forEach(clearInterval) }, [])

  function showNotify(msg) {
    setNotify({ visible: true, message: msg })
    setTimeout(() => setNotify({ visible: false, message: msg }), 2800)
  }

  function getDisplayUrl(sceneId) {
    const imgs = generated[sceneId]
    if (!imgs || imgs.length === 0) return null
    return imgs[selected[sceneId] || 0]
  }

  async function generateImage(sceneId) {
    const existing = generated[sceneId] || []
    if (existing.length >= 2) {
      setSelected(s => ({ ...s, [sceneId]: s[sceneId] === 1 ? 0 : 1 }))
      showNotify('🔄 Showing alternate version')
      return
    }
    if (generating && activeScene === sceneId) return
    setActiveScene(sceneId)
    setGenerating(true)

    const fallbacks = {
      album: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      jet: 'linear-gradient(135deg, #0d0d0d 0%, #1a1200 50%, #2d1f00 100%)',
      stadium: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 40%, #2e1a00 100%)',
      carpet: 'linear-gradient(135deg, #1a0a0a 0%, #2e0a0a 50%, #1a1a00 100%)',
      backstage: 'linear-gradient(135deg, #0d0d0a 0%, #1a1a00 50%, #2e2e00 100%)',
      studio: 'linear-gradient(135deg, #0a1a0a 0%, #001a0a 50%, #0a2e1a 100%)',
      social: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2e0a1a 100%)',
      magazine: 'linear-gradient(135deg, #1a0a2e 0%, #2e0a2e 40%, #1a0020 100%)',
      billboard: 'linear-gradient(135deg, #1a0a00 0%, #2e1a00 40%, #0a0a1a 100%)',
    }

    const altSuffix = existing.length === 1 ? ' Alternative composition, different angle, fresh creative take.' : ''

    try {
      const vibeDescription = customVibe ? ` Style notes: ${customVibe}.` : ''
      // Never include artist name in prompts — avoids copyright/safety flags
      // Use genre, vibe, and face description only
      const prompt = `${AI_PROMPTS[sceneId]} A ${genre} recording artist.${vibeDescription}${altSuffix}`

      const body = { prompt }
      if (characterRef && (characterRef.startsWith('http') || characterRef.startsWith('data:'))) {
        body.characterRefUrl = characterRef
      } else if (artistPhotoBase64) {
        body.photoBase64 = artistPhotoBase64
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const responseText = await response.text()
      let responseData
      try { responseData = JSON.parse(responseText) } catch(e) { throw new Error(`Server error: ${responseText.slice(0, 100)}`) }
      if (!response.ok) {
        const errMsg = responseData?.error || `HTTP ${response.status}`
        // Surface friendly message for safety blocks
        if (errMsg.toLowerCase().includes('safety') || errMsg.toLowerCase().includes('moderation') || errMsg.toLowerCase().includes('rejected') || errMsg.toLowerCase().includes('blocked')) {
          throw new Error('safety_blocked')
        }
        throw new Error(errMsg)
      }

      const newUrl = responseData.url
      const newImgs = [...existing, newUrl]
      setGenerated(g => ({ ...g, [sceneId]: newImgs }))
      setSelected(s => ({ ...s, [sceneId]: newImgs.length - 1 }))

      // Lock character reference ONLY from Album Cover scene
      // Other scenes have props (towels, instruments, etc.) that bleed into subsequent generations
      if (sceneId === 'album' && newUrl && onSetCharacterRef) {
        onSetCharacterRef(newUrl)
        console.log('Character reference locked from Album Cover')
      }

      const award = existing.length === 0 ? 15 : 8
      if (onEnergyGain) onEnergyGain(award)

      const newGenerated = { ...generated, [sceneId]: newImgs }
      const realCount = Object.values(newGenerated).filter(arr => arr.some(u => u?.startsWith('http') || u?.startsWith('data:'))).length
      if (onCheckVisionary) onCheckVisionary(realCount)
      if (onCheckIconStatus) onCheckIconStatus(hasPhoto, realCount)

      const msg = existing.length === 0
        ? `🎨 Shot ready — tap again for an alternate  +${award}⚡`
        : `🎨 Alternate ready — tap to switch  +${award}⚡`
      showNotify(msg)

    } catch (err) {
      console.error('Image error:', err)
      if (existing.length === 0) setGenerated(g => ({ ...g, [sceneId]: [fallbacks[sceneId]] }))
      const msg = err.message === 'safety_blocked' || err.message?.toLowerCase().includes('safety') || err.message?.toLowerCase().includes('moderation') || err.message?.toLowerCase().includes('rejected')
        ? '⚠️ Scene blocked by AI safety filters. Try adjusting your vibe description in the Vision stage.'
        : `⚠️ ${err.message || 'Generation failed — tap to retry'}`
      showNotify(msg)
    } finally {
      setGenerating(false)
      setActiveScene(null)
    }
  }

  async function generateVideo(videoId) {
    if (videos[videoId]?.status === 'pending' || videos[videoId]?.status === 'queued') return
    if (!onSpendEnergy || !onSpendEnergy(200)) { showNotify('⚡ Not enough Star Energy'); return }
    setVideos(v => ({ ...v, [videoId]: { status: 'queued' } }))
    // Never include artist name — avoids copyright/safety flags on Sora
    const charNote = characterRef ? ' Maintain the same artist appearance as the established promotional images.' : faceDescription ? ` The artist has this appearance: ${faceDescription.slice(0, 100)}.` : ''
    const prompt = `${SORA_PROMPTS[videoId]}${charNote} Genre: ${genre}. Do not reference any real artists, song titles, or copyrighted material.`
    try {
      // Pass characterRef as imageUrl so Veo anchors to the Album Cover visual style
      const res = await fetch('/api/generate-video-veo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageUrl: characterRef || null, // Album Cover as visual style anchor
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.jobId) {
        setVideos(v => ({ ...v, [videoId]: { status: 'idle' } }))
        if (onEnergyGain) onEnergyGain(100) // refund if creation fails
        const isBlocked = data.isPolicy || data.error?.toLowerCase().includes('safety') || data.error?.toLowerCase().includes('policy')
        showNotify(isBlocked
          ? '⚠️ Video blocked at creation — energy refunded. Try adjusting your vibe description.'
          : `⚠️ ${data.error || 'Failed to start video — tap to retry'}`)
        return
      }
      setVideos(v => ({ ...v, [videoId]: { status: 'pending', jobId: data.jobName } }))
      showNotify(`🎬 ${SORA_VIDEOS.find(v => v.id === videoId)?.label} rendering...`)
      pollRefs.current[videoId] = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/generate-video-veo?jobName=${encodeURIComponent(data.jobName)}`)
          const pollData = await pollRes.json()
          if (pollData.status === 'done') {
            clearInterval(pollRefs.current[videoId])
            delete pollRefs.current[videoId]
            setVideos(v => ({ ...v, [videoId]: { status: 'done', url: pollData.url } }))
            if (onEnergyGain) onEnergyGain(50)
            showNotify(`🎬 Video ready! Tap to watch  +50⚡`)
          } else if (pollData.status === 'failed') {
            clearInterval(pollRefs.current[videoId])
            delete pollRefs.current[videoId]
            const isBlocked = pollData.isPolicy || pollData.error?.toLowerCase().includes('safety') || pollData.error?.toLowerCase().includes('policy')
            setVideos(v => ({ ...v, [videoId]: { status: 'idle' } }))
            if (onEnergyGain) onEnergyGain(100) // full refund on failure
            showNotify(isBlocked
              ? '⚠️ Video blocked — AI safety filter. Energy refunded. Try adjusting your vibe description.'
              : '⚠️ Video failed — energy refunded. Tap to retry.')
          } else {
            // Update progress
            setVideos(v => ({ ...v, [videoId]: { ...v[videoId], progress: pollData.progress || 0 } }))
          }
        } catch(e) { /* keep polling */ }
      }, 5000)
    } catch(err) {
      setVideos(v => ({ ...v, [videoId]: { status: 'failed' } }))
      showNotify(`⚠️ ${err.message}`)
    }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>
      <SceneHeader
        act="Rollout"
        title="Build Your Visual Identity"
        subtitle={characterRef ? '✦ Character locked in — every scene will match your look' : "The master is finished. Let's get your music to the masses. (Click an image again to generate a variation.)"}
      />

      {/* Character Reference Lock Badge */}
      {characterRef ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px' }}>
          <img src={characterRef} alt="Reference" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>✦ Character Reference Locked</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Album Cover is your identity anchor — all scenes match this look</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '22px', flexShrink: 0 }}>🎨</div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Generate Album Cover First</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Your Album Cover becomes the identity anchor for all other scenes</div>
          </div>
        </div>
      )}

      {/* Press Shots section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>📸 Press Shots</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '2px 8px' }}>9 scenes available</div>
        </div>
        {generating && <div style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.08em' }}>⏳ One at a time — next ready soon</div>}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '14px', lineHeight: 1.5 }}>
        Tap any scene to generate. Tap again for an alternate take. One shoot at a time.
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 45vw), 1fr))',
        gap: '12px',
        marginBottom: '32px',
        animation: 'fadeUp 0.5s 0.1s ease both',
        opacity: 0,
      }}>
        {AI_SCENES.map(scene => {
          const imgs = generated[scene.id] || []
          const hasAny = imgs.length > 0
          const hasTwo = imgs.length >= 2
          const isLoading = generating && activeScene === scene.id
          const displayUrl = getDisplayUrl(scene.id)
          const currentAlt = selected[scene.id] || 0
          const isRealImage = displayUrl && (displayUrl.startsWith('http') || displayUrl.startsWith('data:'))
          const isGradient = displayUrl && displayUrl.startsWith('linear')

          return (
            <div
              key={scene.id}
              onClick={() => {
                if (isLoading) return
                if (isRealImage && hasTwo) {
                  // Has both alts — cycle selection
                  setSelected(s => ({ ...s, [scene.id]: s[scene.id] === 1 ? 0 : 1 }))
                } else {
                  generateImage(scene.id)
                }
              }}
              style={{
                cursor: isLoading ? 'wait' : 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${hasAny ? 'rgba(212,175,55,0.45)' : 'rgba(212,175,55,0.1)'}`,
                transition: 'all 0.2s',
                position: 'relative',
                boxShadow: hasAny ? '0 0 16px rgba(212,175,55,0.08)' : 'none',
              }}
            >
              {/* Image area — square aspect ratio, full image always visible */}
              <div style={{
                aspectRatio: '1 / 1',
                background: isRealImage ? '#000' : isGradient ? displayUrl : 'var(--surface2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
              }}>
                {isRealImage && (
                  <>
                    <img
                      src={displayUrl}
                      alt={scene.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                    {/* Zoom button — tap to fullscreen */}
                    <button
                      onClick={e => { e.stopPropagation(); setLightbox({ url: displayUrl, label: scene.label }) }}
                      style={{
                        position: 'absolute', bottom: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px', color: '#fff', fontSize: '13px',
                        padding: '4px 7px', cursor: 'pointer', zIndex: 3,
                        backdropFilter: 'blur(4px)',
                      }}
                      title="View full size"
                    >⤢</button>
                  </>
                )}
                {isLoading && (
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: '28px', height: '28px', border: '2px solid rgba(212,175,55,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                      {imgs.length === 0 ? 'GENERATING...' : 'ALT SHOT...'}
                    </div>
                  </div>
                )}
                {!isLoading && !hasAny && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>{scene.emoji}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '0.1em' }}>TAP TO GENERATE</div>
                  </div>
                )}
                {/* Top badges */}
                {hasAny && !isLoading && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
                    <div style={{ background: 'rgba(0,0,0,0.7)', borderRadius: '3px', padding: '2px 7px', fontSize: '9px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em' }}>
                      {hasTwo ? `${currentAlt + 1}/2` : '1/2'}
                    </div>
                    {!hasTwo && (
                      <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '3px', padding: '2px 7px', fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.06em' }}>
                        TAP FOR ALT →
                      </div>
                    )}
                    {hasTwo && (
                      <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '3px', padding: '2px 7px', fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.06em' }}>
                        TAP TO SWITCH
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Label */}
              <div style={{ padding: '10px 14px', background: 'var(--surface2)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{scene.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  {isLoading ? 'Generating...' : hasTwo ? `Alt ${currentAlt + 1} selected` : scene.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── VIDEO SHOOTS ── */}
      <div style={{ marginBottom: '32px', animation: 'fadeUp 0.5s 0.2s ease both', opacity: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>🎬 Video Shoots</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '2px 8px' }}>100⚡ each · Veo 3.1</div>
          </div>
          {Object.values(videos).some(v => v?.status === 'pending' || v?.status === 'queued') && (
            <div style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.08em' }}>⏳ Rendering — one at a time</div>
          )}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '14px', lineHeight: 1.5 }}>
          Cinematic AI video shoots for your Era. 100 Star Energy each. Renders in ~60–90 seconds — one shoot at a time.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 45vw), 1fr))', gap: '12px' }}>
          {SORA_VIDEOS.map(video => (
            <SoraVideoCard key={video.id} video={video} starEnergy={starEnergy || 0} videoData={videos[video.id]} onGenerate={generateVideo} onWatch={setActiveVideo} />
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s 0.3s ease both', opacity: 0 }}>
        <GoldButton
          onClick={() => setBursting(true)}
          size="lg"
          style={{ fontSize: '18px', padding: '18px 48px', letterSpacing: '0.15em' }}
        >
          ⭐ Drop My Era ⭐
        </GoldButton>
        {Object.keys(generated).length === 0 && (
          <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)' }}>
            Tap a scene to generate AI imagery — or drop your Era now.
          </p>
        )}
      </div>

      {bursting && <StarBurst message="DROP YOUR ERA" subtitle="The World Is Watching" onDone={() => { setBursting(false); onAdvance({ generated, selectedAlts: selected }) }} />}
      <Notification message={notify.message} visible={notify.visible} />

      {/* Fullscreen Press Shot Lightbox */}
      {lightbox && (
        <ImageLightbox
          url={lightbox.url}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Fullscreen Video Player */}
      {activeVideo && (
        <VideoPlayer
          videoId={activeVideo.id}
          url={activeVideo.url}
          label={activeVideo.label}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  )
}

// ─── ACT V: YOUR ERA ─────────────────────────────────────────────────────────

function EraScene({ artistName, genre, tracks, generated, selectedAlts = {} }) {
  const [albumTitle, setAlbumTitle] = useState('')
  const [dropped, setDropped] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [notify, setNotify] = useState({ visible: false, message: '' })
  const [bursting, setBursting] = useState(false)

  function showNotify(msg) {
    setNotify({ visible: true, message: msg })
    setTimeout(() => setNotify({ visible: false, message: '' }), 2800)
  }

  function dropEra() {
    const slug = artistName.toLowerCase().replace(/\s+/g, '')
    setShareLink(`staralive.com/artists/${slug}`)
    setDropped(true)
    showNotify('🌟 Your era is live!')
  }

  function copyLink() {
    navigator.clipboard?.writeText(`https://${shareLink}`)
    showNotify('🔗 Link copied!')
  }

  const stats = [
    { label: 'Tracks Recorded', value: tracks.length },
    { label: 'AI Promo Shots', value: Object.keys(generated).length },
    { label: 'Genre', value: genre },
    { label: 'Era Status', value: dropped ? 'LIVE' : 'PENDING' },
  ]

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
      <SceneHeader
        act="Era"
        title={`Welcome to Your Era, ${artistName}`}
        subtitle="You recorded. You mixed. You created your visual identity. Now it's time to drop."
      />

      {/* Artist Card */}
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '8px',
        padding: '28px',
        marginBottom: '24px',
        animation: 'fadeUp 0.5s 0.1s ease both',
        opacity: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), #b8960c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            flexShrink: 0,
          }}>
            🎤
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>{artistName}</div>
            <div style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.1em' }}>{genre} · StarAlive Records</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {stats.map(s => (
            <div key={s.label} style={{
              padding: '14px 16px',
              background: 'var(--surface3)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
              <div style={{
                fontSize: s.label === 'Era Status' ? '13px' : '22px',
                fontWeight: 700,
                color: s.label === 'Era Status' && dropped ? 'var(--gold)' : 'var(--text)',
                fontFamily: typeof s.value === 'number' ? 'var(--font-display)' : 'var(--font-body)',
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Album name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Name Your Album
          </label>
          <input
            value={albumTitle}
            onChange={e => setAlbumTitle(e.target.value)}
            placeholder={`${artistName}'s Debut Era`}
            disabled={dropped}
            style={{
              width: '100%',
              background: 'var(--surface3)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '4px',
              padding: '12px 16px',
              color: 'var(--text)',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>

        {/* Drop button or share link */}
        {!dropped ? (
          <GoldButton onClick={dropEra} size="md" style={{ width: '100%' }}>
            🌟 Drop My Era
          </GoldButton>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '14px 16px',
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--gold)', fontFamily: 'monospace' }}>{shareLink}</span>
              <button onClick={copyLink} style={{ fontSize: '12px', color: 'var(--text-dim)', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', background: 'transparent' }}>
                Copy
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => showNotify('📤 Shared to your StarAlive profile!')}
                style={{ flex: 1, padding: '12px', background: 'var(--surface3)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '4px', color: 'var(--text-dim)', fontSize: '13px' }}
              >
                Save to My Album
              </button>
              <button
                onClick={() => showNotify('🌐 Opening share options...')}
                style={{ flex: 1, padding: '12px', background: 'var(--surface3)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '4px', color: 'var(--text-dim)', fontSize: '13px' }}
              >
                Share to Social
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Audio streams in-app via Stingray's licensed catalog. Links open a locked player — no downloads.
            </p>
          </div>
        )}
      </div>

      {/* Generated images gallery — show what they created */}
      {Object.keys(generated).length > 0 && (
        <div style={{
          animation: 'fadeUp 0.5s 0.3s ease both',
          opacity: 0,
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 600 }}>
            Your Visual Identity
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px',
          }}>
            {Object.entries(generated).map(([id, urls]) => {
              const urlArr = Array.isArray(urls) ? urls : [urls]
              // Use selectedAlts if available, else first URL
              const altIdx = (selectedAlts && selectedAlts[id]) || 0
              const url = urlArr[altIdx] || urlArr[0]
              const scene = AI_SCENES.find(s => s.id === id)
              const isValid = url && (url.startsWith('http') || url.startsWith('data:'))
              return isValid ? (
                <div key={id} style={{ borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                  <img src={url} alt={scene?.label || id} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', display: 'block', background: '#000' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {scene?.label || id}
                  </div>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}

      <Notification message={notify.message} visible={notify.visible} />
    </div>
  )
}


// ─── ARTIST VISION SETUP ─────────────────────────────────────────────────────

function VisionScene({ artistName, genre, onAdvance }) {
  const [photo, setPhoto] = useState(null)
  const [photoBase64, setPhotoBase64] = useState(null)
  const [vibe, setVibe] = useState('')
  const [dragging, setDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const fileRef = useRef(null)

  async function analyzeAndAdvance() {
    if (!photoBase64) {
      onAdvance({ artistPhotoBase64: null, customVibe: vibe, faceDescription: '' })
      return
    }
    setAnalyzing(true)
    let faceDescription = ''
    try {
      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoBase64 })
      })
      if (res.ok) {
        const d = await res.json()
        faceDescription = d.description || ''
      }
    } catch(e) { console.error('Vision analysis error:', e) }
    setAnalyzing(false)
    onAdvance({ artistPhotoBase64: photoBase64, customVibe: vibe, faceDescription })
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setPhoto(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = e => {
      // Strip the data:image/...;base64, prefix — OpenAI needs raw base64
      const base64 = e.target.result.split(',')[1]
      setPhotoBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px', animation: 'fadeUp 0.6s ease both' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.35em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>
          Vision
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '14px' }}>
          Who Is the Artist?
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
          Upload a photo and describe your vibe. Every AI scene will be built around <strong style={{ color: 'var(--text)' }}>{artistName}</strong> — the real person behind the name.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeUp 0.6s 0.15s ease both', opacity: 0 }}>

        {/* Photo upload */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Artist Photo
          </label>

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? 'var(--gold)' : photo ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'}`,
              borderRadius: '8px',
              background: dragging ? 'rgba(212,175,55,0.05)' : 'var(--surface2)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              overflow: 'hidden',
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: photo ? '0 0 30px rgba(212,175,55,0.15)' : 'none',
            }}
          >
            {photo ? (
              <>
                <img
                  src={photo}
                  alt="Artist"
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block', background: '#111' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>✓ Photo loaded</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Tap to change</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>
                  {dragging ? 'Drop it here' : 'Upload your photo'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Selfie, portrait, or any photo of the artist<br />
                  Drag & drop or click to browse<br />
                  <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '11px' }}>JPG, PNG, HEIC supported</span>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={e => handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>

        {/* Custom vibe prompt */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Describe Your Vibe <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={vibe}
            onChange={e => setVibe(e.target.value)}
            placeholder={`Describe ${artistName}'s style, energy, look... e.g. "wearing all black with gold chains, intense expression, dark mysterious vibe" or "soft glam, feminine, floral aesthetic, warm lighting"`}
            rows={4}
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '6px',
              padding: '14px 16px',
              color: 'var(--text)',
              fontSize: '14px',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
            The more specific you are, the more accurate your AI photos will be.
          </div>
        </div>

        {/* Note about photo use */}
        {photo && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.15)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-dim)',
            lineHeight: 1.6,
            animation: 'fadeIn 0.4s ease',
          }}>
            ✦ AI will analyze your photo to capture your appearance — hair, skin tone, facial features, build — then place a character matching <strong style={{ color: 'var(--text)' }}>{artistName}</strong> into each scene. Photos are not stored by StarAlive.
          </div>
        )}

        <div style={{ paddingTop: '8px', textAlign: 'center' }}>
          <GoldButton
            onClick={analyzeAndAdvance}
            disabled={analyzing}
            size="lg"
          >
            {analyzing ? '✦ Locking in your look...' : photo ? 'Build My Press Shots →' : vibe.trim() ? 'Generate With My Vision →' : 'Skip — Use AI Persona →'}
          </GoldButton>
          {analyzing && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--gold)' }}>
              Reading your appearance to keep your look consistent across all scenes...
            </p>
          )}
          {!photo && !analyzing && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {vibe.trim()
                ? '✦ Your vision description will guide the AI — no photo needed.'
                : 'No photo? AI will create a cinematic artist persona from your genre and vibe.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────

function ProgressBar({ scene }) {
  const acts = ['audition', 'sign', 'studio', 'vision', 'rollout', 'era']
  const labels = ['Discovery', 'Signing', 'Studio', 'Vision', 'Rollout', 'Era']
  const current = acts.indexOf(scene)

  return (
    <div style={{ padding: '16px 20px 24px', width: '100%', maxWidth: '420px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Dots + connector lines — no labels on dots */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {acts.map((act, i) => (
          <div key={act} style={{ display: 'flex', alignItems: 'center', flex: i < acts.length - 1 ? 1 : 'none' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `1.5px solid ${i <= current ? 'var(--gold)' : 'rgba(212,175,55,0.2)'}`,
              background: i < current ? 'var(--gold)' : i === current ? 'rgba(212,175,55,0.18)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.4s',
              boxShadow: i === current ? '0 0 10px rgba(212,175,55,0.4)' : 'none',
            }}>
              {i < current
                ? <span style={{ fontSize: '10px', color: '#0a0a0a', fontWeight: 800 }}>✓</span>
                : <span style={{ fontSize: '9px', color: i === current ? 'var(--gold)' : 'rgba(212,175,55,0.35)', fontWeight: 600 }}>{i + 1}</span>
              }
            </div>
            {i < acts.length - 1 && (
              <div style={{
                flex: 1,
                height: '1px',
                background: i < current ? 'var(--gold)' : 'rgba(212,175,55,0.12)',
                transition: 'background 0.4s',
                minWidth: '8px',
              }} />
            )}
          </div>
        ))}
      </div>
      {/* Current stage label — centered, clean, no overlap possible */}
      <div style={{
        textAlign: 'center',
        marginTop: '8px',
        fontSize: '9px',
        letterSpacing: '0.25em',
        color: 'var(--gold)',
        textTransform: 'uppercase',
        fontWeight: 700,
        opacity: 0.9,
      }}>
        {labels[current]}
      </div>
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [scene, setScene] = useState('audition')
  const [data, setData] = useState({
    artistName: '',
    genre: '',
    tracks: [],
    generated: {},
    artistPhoto: null,
    artistPhotoBase64: null,
    customVibe: '',
    faceDescription: '',
    selectedAlts: {},
    characterRef: null,
  })
  const [starEnergy, setStarEnergy] = useState(250)
  const [energyGained, setEnergyGained] = useState(0)
  const [burstActive, setBurstActive] = useState(false)
  const [unlock, setUnlock] = useState(null)
  const [claimedUnlocks, setClaimedUnlocks] = useState(new Set())

  function gainEnergy(amount) {
    setStarEnergy(e => e + amount)
    setEnergyGained(amount)
    setTimeout(() => setEnergyGained(0), 2000)
  }

  function spendEnergy(amount) {
    if (starEnergy < amount) return false
    setStarEnergy(e => e - amount)
    return true
  }

  function triggerUnlock(key, config) {
    if (claimedUnlocks.has(key)) return
    setClaimedUnlocks(s => new Set([...s, key]))
    gainEnergy(config.reward)
    setUnlock(config)
  }

  function checkMixdownCombo(presetName) {
    const matches = MIXDOWN_COMBOS[data.genre] || []
    if (matches.includes(presetName)) {
      triggerUnlock(`mixdown_${data.genre}_${presetName}`, {
        title: 'MIXDOWN BONUS', subtitle: `${presetName} is a perfect match for ${data.genre}. The studio knows what sells.`,
        reward: 75, colors: ['#d946ef', '#818cf8', '#38bdf8'], emoji: '🎛️',
      })
    }
  }

  function checkVisionary(generatedCount) {
    if (generatedCount >= 9) triggerUnlock('visionary', { title: 'VISIONARY', subtitle: 'All 9 promo shots generated. Your visual identity is complete.', reward: 200, colors: ['#d4af37', '#f0d060', '#fffbe6'], emoji: '👁️' })
  }

  function checkIconStatus(hasPhoto, generatedCount) {
    if (hasPhoto && generatedCount >= 3) triggerUnlock('icon_status', { title: 'ICON STATUS', subtitle: 'Photo uploaded. Scenes generated. You look like a star.', reward: 150, colors: ['#ec4899', '#f472b6', '#fbcfe8'], emoji: '📸' })
  }

  useEffect(() => {
    const today = new Date().toDateString()
    const last = localStorage.getItem('staralive_last_visit')
    if (last && last !== today) triggerUnlock('daily_' + today, { title: 'DAILY STREAK', subtitle: 'You came back. The studio never sleeps.', reward: 50, colors: ['#38bdf8', '#818cf8', '#6ee7b7'], emoji: '🔥' })
    localStorage.setItem('staralive_last_visit', today)
  }, [])

  function advance(newData = {}) {
    setData(d => ({ ...d, ...newData }))
    const flow = ['audition', 'sign', 'studio', 'vision', 'rollout', 'era']
    const next = flow[flow.indexOf(scene) + 1]
    if (next) {
      const award = ENERGY_AWARDS[scene] || 0
      if (award > 0) gainEnergy(award)
      setBurstActive(true)
      setTimeout(() => setScene(next), 600)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Ambient background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 40% at 20% 10%, rgba(212,175,55,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 80% 90%, rgba(100,60,200,0.05) 0%, transparent 60%)
        `,
      }} />

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 10, padding: '20px 24px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', width: '100%', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '720px', marginBottom: '4px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, letterSpacing: '0.08em', color: 'var(--gold)' }}>
            STAR<span style={{ color: 'var(--text-dim)' }}>AI</span>IVE
          </div>
          <StarEnergyDisplay energy={starEnergy} gained={energyGained} />
        </div>
        <ProgressBar scene={scene} />
      </header>

      {/* Main content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        paddingTop: '20px',
        paddingBottom: '60px',
      }}>
        {scene === 'audition' && (
          <AuditionScene onAdvance={advance} />
        )}
        {scene === 'sign' && (
          <SignScene
            artistName={data.artistName}
            genre={data.genre}
            onAdvance={advance}
          />
        )}
        {scene === 'studio' && (
          <StudioScene
            artistName={data.artistName}
            genre={data.genre}
            onAdvance={advance}
            onMixdownCombo={checkMixdownCombo}
          />
        )}
        {scene === 'vision' && (
          <VisionScene
            artistName={data.artistName}
            genre={data.genre}
            onAdvance={advance}
          />
        )}
        {scene === 'rollout' && (
          <RolloutScene
            artistName={data.artistName}
            genre={data.genre}
            tracks={data.tracks}
            artistPhotoBase64={data.artistPhotoBase64}
            customVibe={data.customVibe}
            faceDescription={data.faceDescription}
            characterRef={data.characterRef}
            onSetCharacterRef={ref => setData(d => ({ ...d, characterRef: ref }))}
            starEnergy={starEnergy}
            onAdvance={advance}
            onEnergyGain={gainEnergy}
            onSpendEnergy={spendEnergy}
            onCheckVisionary={checkVisionary}
            onCheckIconStatus={checkIconStatus}
            hasPhoto={!!data.artistPhotoBase64}
          />
        )}
        {scene === 'era' && (
          <EraScene
            artistName={data.artistName}
            genre={data.genre}
            tracks={data.tracks}
            generated={data.generated}
            selectedAlts={data.selectedAlts || {}}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 10, textAlign: 'center',
        padding: '16px', borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          FORCE CREATIVE AI · STARALIVE · {new Date().getFullYear()}
        </span>
      </footer>
      {burstActive && <StarBurst onDone={() => setBurstActive(false)} />}
      {unlock && <UnlockBurst {...unlock} onDone={() => setUnlock(null)} />}
    </div>
  )
}