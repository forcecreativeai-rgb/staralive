import { useState, useEffect, useRef } from 'react'
import ProStudio from './ProStudio'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const GENRES = ['Pop', 'R&B / Soul', 'Rock', 'Hip-Hop', 'Country', 'Indie', 'Electronic', 'Worship']

const AI_SCENES = [
  { id: 'album',     emoji: '🎨', label: 'Album Cover',      desc: 'Your debut drop' },
  { id: 'jet',       emoji: '✈️', label: 'Private Jet',       desc: 'Touring season' },
  { id: 'stadium',   emoji: '🏟️', label: 'Stadium Night',     desc: '80K strong' },
  { id: 'carpet',    emoji: '🎬', label: 'Red Carpet',        desc: 'Premiere ready' },
  { id: 'backstage', emoji: '🌟', label: 'VIP Backstage',     desc: 'After the show' },
  { id: 'studio',    emoji: '🎛️', label: 'Recording Studio',  desc: 'LA sessions' },
]

const AI_PROMPTS = {
  album:     "Professional music album cover art, a solo recording artist in dramatic studio lighting, front-facing portrait, dark gradient background from deep purple to black, cinematic grade, high-fashion wardrobe, platinum record aesthetic, award-winning photography, 4K render.",
  jet:       "Interior of an ultra-luxury private jet at sunset, beige leather captain seats, champagne on side table, a music superstar relaxing post-show, city lights below through oval windows, warm golden hour light, exclusive atmosphere.",
  stadium:   "Epic outdoor stadium concert at night, 80,000 fans with phone flashlights creating a sea of light, music superstar commanding the stage, laser beams and pyrotechnics, sold-out energy, cinematic wide shot.",
  carpet:    "Hollywood movie premiere red carpet, celebrity arriving to paparazzi camera flashes from both sides, velvet rope entrance, glamorous fashion, entertainment industry royalty, blinding white light wall.",
  backstage: "Luxury backstage VIP dressing room, gold star on door, fresh flowers, chilled champagne on ice, platinum records on wall, ring lights and mirrors, exclusive tour atmosphere.",
  studio:    "World-class recording studio in Los Angeles, massive analog mixing console with glowing faders, vintage outboard gear, acoustic foam walls, a music star in the vocal booth through glass, warm amber studio lighting.",
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

function StudioScene({ artistName, genre, onAdvance }) {
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
            <ProStudio />
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
                <GoldButton onClick={() => onAdvance({ tracks })} size="md">
                  Take This to Rollout →
                </GoldButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advance from record tab if tracks exist */}
      {tab === 'record' && tracks.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button
            onClick={() => onAdvance({ tracks })}
            style={{ color: 'var(--gold)', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'underline', background: 'none', border: 'none' }}
          >
            {tracks.length} track{tracks.length > 1 ? 's' : ''} saved → continue to Rollout
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ACT IV: ROLLOUT ─────────────────────────────────────────────────────────

function RolloutScene({ artistName, genre, tracks, artistPhotoBase64, customVibe, onAdvance }) {
  const [activeScene, setActiveScene] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState({})
  const [notify, setNotify] = useState({ visible: false, message: '' })

  function showNotify(msg) {
    setNotify({ visible: true, message: msg })
    setTimeout(() => setNotify({ visible: false, message: msg }), 2800)
  }

  async function generateImage(sceneId) {
    if (generated[sceneId]) return
    setActiveScene(sceneId)
    setGenerating(true)

    const fallbacks = {
      album:     'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      jet:       'linear-gradient(135deg, #0d0d0d 0%, #1a1200 50%, #2d1f00 100%)',
      stadium:   'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 40%, #2e1a00 100%)',
      carpet:    'linear-gradient(135deg, #1a0a0a 0%, #2e0a0a 50%, #1a1a00 100%)',
      backstage: 'linear-gradient(135deg, #0d0d0a 0%, #1a1a00 50%, #2e2e00 100%)',
      studio:    'linear-gradient(135deg, #0a1a0a 0%, #001a0a 50%, #0a2e1a 100%)',
    }

    try {
      const vibeDescription = customVibe ? ` Artist style and appearance: ${customVibe}.` : ''
      const prompt = `${AI_PROMPTS[sceneId]} The artist is a ${genre} musician named ${artistName}.${vibeDescription} Cinematic, professional, high quality, photorealistic.`

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Generation failed')
      }

      const data = await response.json()
      setGenerated(g => ({ ...g, [sceneId]: data.url }))
      showNotify('🎨 Image generated — ready for your album')

    } catch (err) {
      console.error('Image error:', err)
      setGenerated(g => ({ ...g, [sceneId]: fallbacks[sceneId] }))
      showNotify('⚠️ Generation failed — showing placeholder')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>
      <SceneHeader
        act="Rollout"
        title="Build Your Visual Identity"
        subtitle="Your music is recorded. Now the world needs to see who you are."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
        animation: 'fadeUp 0.5s 0.1s ease both',
        opacity: 0,
      }}>
        {AI_SCENES.map(scene => {
          const isGenerated = !!generated[scene.id]
          const isLoading = generating && activeScene === scene.id
          return (
            <div
              key={scene.id}
              onClick={() => !isLoading && generateImage(scene.id)}
              style={{
                cursor: isLoading ? 'wait' : 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${isGenerated ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.1)'}`,
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {/* Image area */}
              <div style={{
                height: '140px',
                background: (isGenerated && generated[scene.id].startsWith('linear')) ? generated[scene.id] : 'var(--surface2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Real AI image */}
                {isGenerated && !isLoading && generated[scene.id].startsWith('http') && (
                  <img
                    src={generated[scene.id]}
                    alt={scene.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                  />
                )}
                {isLoading && (
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '28px', height: '28px', border: '2px solid rgba(212,175,55,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em' }}>GENERATING...</div>
                  </div>
                )}
                {!isLoading && !isGenerated && (
                  <div style={{ fontSize: '36px' }}>{scene.emoji}</div>
                )}
                {isGenerated && !isLoading && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--gold)', borderRadius: '3px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, color: '#0a0a0a', zIndex: 2 }}>
                    DONE
                  </div>
                )}
              </div>

              {/* Label */}
              <div style={{ padding: '12px 14px', background: 'var(--surface2)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{scene.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{scene.desc}</div>
                {!isGenerated && !isLoading && (
                  <div style={{ fontSize: '11px', color: 'var(--gold)', marginTop: '6px', letterSpacing: '0.08em' }}>TAP TO GENERATE →</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s 0.3s ease both', opacity: 0 }}>
        <GoldButton
          onClick={() => onAdvance({ generated })}
          disabled={Object.keys(generated).length === 0}
          size="lg"
        >
          Drop My Era →
        </GoldButton>
        {Object.keys(generated).length === 0 && (
          <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Generate at least one image to continue
          </p>
        )}
      </div>

      <Notification message={notify.message} visible={notify.visible} />
    </div>
  )
}

// ─── ACT V: YOUR ERA ─────────────────────────────────────────────────────────

function EraScene({ artistName, genre, tracks, generated }) {
  const [albumTitle, setAlbumTitle] = useState('')
  const [dropped, setDropped] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [notify, setNotify] = useState({ visible: false, message: '' })

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
  const fileRef = useRef(null)

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
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
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
            ✦ Your photo will be sent to OpenAI's image generation API to place <strong style={{ color: 'var(--text)' }}>{artistName}</strong> into each scene. Photos are not stored by StarAlive.
          </div>
        )}

        <div style={{ paddingTop: '8px', textAlign: 'center' }}>
          <GoldButton
            onClick={() => onAdvance({ artistPhotoBase64: photoBase64, customVibe: vibe })}
            size="lg"
          >
            {photo ? 'Build My Scenes →' : 'Skip — Use AI Persona →'}
          </GoldButton>
          {!photo && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              No photo? AI will create a cinematic artist persona from your name and genre.
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
      padding: '20px 24px',
      maxWidth: '420px',
      margin: '0 auto',
    }}>
      {acts.map((act, i) => (
        <div key={act} style={{ display: 'flex', alignItems: 'center', flex: i < acts.length - 1 ? 1 : 'none' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: `1.5px solid ${i <= current ? 'var(--gold)' : 'rgba(212,175,55,0.2)'}`,
            background: i < current ? 'var(--gold)' : i === current ? 'rgba(212,175,55,0.15)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.4s',
            position: 'relative',
          }}>
            {i < current ? (
              <span style={{ fontSize: '11px', color: '#0a0a0a', fontWeight: 700 }}>✓</span>
            ) : (
              <span style={{ fontSize: '10px', color: i === current ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span>
            )}
            <span style={{
              position: 'absolute',
              top: '34px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: i <= current ? 'var(--gold)' : 'var(--text-muted)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {labels[i]}
            </span>
          </div>
          {i < acts.length - 1 && (
            <div style={{
              flex: 1,
              height: '1px',
              background: i < current ? 'var(--gold)' : 'rgba(212,175,55,0.15)',
              transition: 'background 0.4s',
              margin: '0 2px',
            }} />
          )}
        </div>
      ))}
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
  })

  function advance(newData = {}) {
    setData(d => ({ ...d, ...newData }))
    const flow = ['audition', 'sign', 'studio', 'vision', 'rollout', 'era']
    const next = flow[flow.indexOf(scene) + 1]
    if (next) setScene(next)
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
        position: 'relative',
        zIndex: 10,
        padding: '20px 24px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 900,
          letterSpacing: '0.08em',
          color: 'var(--gold)',
          marginBottom: '4px',
        }}>
          STAR<span style={{ color: 'var(--text-dim)' }}>AI</span>IVE
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
            onAdvance={advance}
          />
        )}
        {scene === 'era' && (
          <EraScene
            artistName={data.artistName}
            genre={data.genre}
            tracks={data.tracks}
            generated={data.generated}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          FORCE CREATIVE AI · STARALIVE · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  )
}
