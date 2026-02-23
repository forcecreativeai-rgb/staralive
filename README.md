# StarAlive 🎤
### *The World's First AI-Powered Artist Identity Platform*

> **Live Demo:** [staralive.vercel.app](https://staralive.vercel.app)  
> **Parent Company:** [Force Creative AI](https://forcecreativeai.com)  
> **Status:** MVP Live — Seeking Stingray Karaoke API Partnership

---

## What Is StarAlive?

StarAlive is not a karaoke app. It's a **performance-tech operating system** built on the Identity Amplification Economy — the emerging market where people don't just consume entertainment, they *become* the entertainment.

Users are discovered, signed to a label, record in a professional studio, generate AI rockstar imagery of themselves, and drop their debut era to the world. The karaoke experience is the entry point. The artist identity transformation is the product.

**The core insight:** Karaoke's real value was never the singing. It was the 3 minutes where someone got to feel like a star. StarAlive extends that feeling into a full career arc — with AI.

---

## The 6-Stage Artist Journey

| Stage | Name | Experience |
|-------|------|-----------|
| 1 | **Discovery** | "You've Been Discovered" — cinematic spotlight entrance, artist name in lights |
| 2 | **Signing** | Animated record deal contract with their name and genre |
| 3 | **Studio** | Vocal recording interface + Pro Studio 13-preset professional mixer |
| 4 | **Vision** | Upload a selfie — AI will place *them* in every scene |
| 5 | **Rollout** | AI generates: album cover, private jet, stadium night, red carpet, VIP backstage, recording studio |
| 6 | **Era** | Artist profile card, stats dashboard, shareable link, album drop |

---

## Why Stingray + StarAlive = A Defining Partnership

StarAlive's Studio stage is built to integrate the **Stingray Karaoke API** as its exclusive licensed content layer.

### What StarAlive Brings
- A proven mobile-first UI with emotional engagement at its core
- AI image generation that creates viral, shareable content every session
- A user base motivated to perform, not just browse
- An identity-first framework that increases session length and return visits
- Compliant architecture built to Stingray's API requirements from day one

### What Stingray Provides
- 140,000+ licensed karaoke tracks with audio + video files
- Cleared publishing rights across ASCAP, BMI, SESAC
- Proven streaming infrastructure
- Credibility with entertainment industry partners

### The Flywheel
```
User sings on Stingray catalog
        ↓
StarAlive generates AI rockstar imagery
        ↓
User shares album art + era link on social media
        ↓
Friends see it → download StarAlive → new Stingray streams
        ↓
Both platforms grow
```

---

## Current MVP — What's Live Right Now

Visit **[staralive.vercel.app](https://staralive.vercel.app)** to experience the full journey.

**Fully functional today:**
- ✅ Complete 6-stage user journey (Discovery → Era)
- ✅ Cinematic UI — spotlight effects, gold marquee input, animated contract signing
- ✅ Pro Studio mixer — 13 professionally engineered presets across 3 tiers
- ✅ Artist Vision screen — selfie upload + custom vibe prompt
- ✅ AI scene generation — 6 cinematic scenes powered by OpenAI DALL-E 3
- ✅ Photo-to-scene — user's actual face placed into AI-generated rockstar imagery
- ✅ Era drop — artist profile, stats dashboard, shareable link
- ✅ Serverless architecture on Vercel — scales automatically

**Pending Stingray API credentials:**
- ⏳ Karaoke song catalog browse + search
- ⏳ Licensed track streaming (audio + video with lyrics)
- ⏳ Microphone capture synced to backing track
- ⏳ Play-log reporting for royalty tracking
- ⏳ Stingray branding on splash/home screens

---

## Technical Architecture

```
Frontend                 Backend (Serverless)      External APIs
─────────────────        ────────────────────      ─────────────
React 18 + Vite    →     /api/generate-image   →   OpenAI DALL-E 3
Vercel Hosting           (Vercel Function)          gpt-image-1
Web Audio API      →     /api/stingray-auth    →   Stingray Karaoke API
                         (pending credentials)      (140K+ tracks)
```

**Stack:**
- **Frontend:** React 18, Vite, CSS animations (no UI library — fully custom)
- **Hosting:** Vercel (auto-deploys on GitHub push)
- **AI Images:** OpenAI DALL-E 3 / gpt-image-1 via serverless proxy
- **Audio (planned):** Stingray Karaoke API + Web Audio API for vocal capture
- **Bundle:** 207KB production build, sub-1s build time

---

## Stingray API Compliance — Built In From Day One

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| No local/offline storage of karaoke assets | ✅ Ready | All playback via streaming — no download capability in UI |
| Mandatory play-log reporting | ✅ Ready | Serverless endpoint scaffolded for every song play event |
| Stingray logo on home + splash screens | ✅ Ready | Logo placement reserved in Discovery stage UI |
| Songs displayed as "Title in the style of Artist" | ✅ Ready | Song metadata display component built to spec |
| Disney content — subscribed tier only | ✅ Ready | Tier-gating logic in place |
| Watermark on all video renders | ✅ Ready | Overlay component ready for Stingray watermark asset |
| JWT authentication flow | ✅ Ready | OAuth device login flow documented and scaffolded |

---

## Pro Studio Mixer — 13 Presets

**Quick Picks:** Raw & Real · Kick Ass · Karaoke King · Dreamy

**Genre Presets:** Pop Lead · Singer-Songwriter · Rock · Worship · R&B Soul · Indie Lo-Fi · Rap / Spoken Word · Cinematic

**Pro Tools:** Harmony BG · Vintage Tape · Final Polish

Each preset maps exact audio engineering specs: EQ curves across 5 bands (80Hz, 250Hz, 1kHz, 4kHz, 12kHz), compression ratios, reverb decay times, and saturation amounts.

---

## AI Scene Generation — 6 Cinematic Shots

| Scene | Prompt Theme |
|-------|-------------|
| 🎨 Album Cover | Studio portrait, dramatic lighting, platinum record aesthetic |
| ✈️ Private Jet | Post-show luxury travel, sunset, champagne |
| 🏟️ Stadium Night | 80,000 fans, pyrotechnics, laser beams |
| 🎬 Red Carpet | Hollywood premiere, paparazzi, velvet rope |
| 🌟 VIP Backstage | Gold star dressing room, fresh flowers, ring lights |
| 🎛️ Recording Studio | LA studio session, analog console, vocal booth |

---

## Roadmap

### Phase 1 — Stingray Integration (Weeks 1–6)
- [ ] Stingray JWT authentication
- [ ] Song catalog browse + search UI
- [ ] Full-screen karaoke video player (audio + lyrics video)
- [ ] Microphone capture synced to backing track
- [ ] Play-log endpoint for royalty reporting

### Phase 2 — Real Audio Processing (Weeks 7–9)
- [ ] Web Audio API vocal capture
- [ ] Real-time DSP processing (reverb, compression, EQ)
- [ ] Vocal + backing track mix output

### Phase 3 — Monetization (Weeks 10–12)
- [ ] Guest / Free / Superstar subscription tiers
- [ ] Stripe payment integration
- [ ] AI image upsell — standard vs HD generation
- [ ] Duet mode (premium feature)

---

## Business Model

| Tier | Price | Features |
|------|-------|---------|
| Guest | Free | 5 songs/month, 1 AI scene |
| Free | Free | Full song access, 3 AI scenes/month |
| Superstar | $9.99/mo | Unlimited songs, unlimited AI scenes, HD images, duets |

**White-label licensing:** Venues, hotels, cruise ships, and event companies can license StarAlive as a branded experience.

---

## Getting Started

```bash
npm install
cp .env.example .env
# Add your API keys
npm run dev
```

### Environment Variables

```
VITE_OPENAI_API_KEY=           # OpenAI — image generation
VITE_STINGRAY_CLIENT_ID=       # Stingray API client ID (pending)
VITE_STINGRAY_CLIENT_SECRET=   # Stingray API client secret (pending)
```

---

## Project Structure

```
staralive/
├── src/
│   ├── App.jsx            # Full 6-stage journey
│   ├── ProStudio.jsx      # 13-preset mixer
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── api/
│   └── generate-image.js  # Serverless OpenAI proxy
├── vercel.json            # Routing + 30s function timeout
└── .env.example           # API key template
```

---

## About Force Creative AI

StarAlive is the flagship MVP of **Force Creative AI** — a multi-vertical AI application company building a portfolio of AI-powered products across entertainment, education, finance, wellness, and gaming.

**Contact:** [forcecreativeai.com](https://forcecreativeai.com)

---

## Partnership Inquiries

StarAlive is actively seeking API partnership with **Stingray Karaoke** to complete the Studio stage. If you're from Stingray's business development or API team, the full integration proposal and compliance documentation is available on request.

---

*Built by Force Creative AI · StarAlive MVP · 2026 · [staralive.vercel.app](https://staralive.vercel.app)*
