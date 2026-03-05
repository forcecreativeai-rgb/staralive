# StarAlive 🎤
### AI-Powered Artist Identity Platform

© 2026 Force Creative AI LLC — Proprietary and Confidential

**Live:** staralive.vercel.app

---

## What It Does

StarAlive is a performance-tech platform that transforms the karaoke experience into a full AI-powered artist identity journey. Users move through 6 stages: Discovery, Signing, Studio, Vision, Rollout, and Era drop.

The Studio stage is built to integrate the Stingray Karaoke API as its licensed content layer. All other stages are fully functional in the current build.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Hosting | Vercel (auto-deploys on GitHub push) |
| AI Images | OpenAI DALL-E 3 / gpt-image-1 via serverless proxy |
| Audio (planned) | Stingray Karaoke API + Web Audio API |
| Build size | 207KB production build, sub-1s build time |

---

## Project Structure

```
staralive/
├── src/
│   ├── App.jsx              # Full 6-stage journey
│   ├── ProStudio.jsx        # 13-preset mixer
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── api/
│   └── generate-image.js    # Serverless OpenAI proxy
├── vercel.json              # Routing + 30s function timeout
└── .env.example             # Required environment variables
```

---

## Local Development

```bash
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

See `.env.example` for all required environment variables.

> Never commit `.env` to version control. All secrets must remain local or in Vercel environment settings.

---

## Architecture

```
Frontend                 Backend (Serverless)      External APIs
─────────────────        ────────────────────      ─────────────
React 18 + Vite    →     /api/generate-image   →   OpenAI DALL-E 3
Vercel Hosting           (Vercel Function)          gpt-image-1
Web Audio API      →     /api/stingray-auth    →   Stingray Karaoke API
                         (pending credentials)      (140K+ tracks)
```

---

## Pro Studio Mixer — 13 Presets

Each preset maps EQ curves across 5 bands (80Hz, 250Hz, 1kHz, 4kHz, 12kHz), compression ratios, reverb decay times, and saturation amounts.

**Quick Picks:** Raw & Real · Kick Ass · Karaoke King · Dreamy

**Genre Presets:** Pop Lead · Singer-Songwriter · Rock · Worship · R&B Soul · Indie Lo-Fi · Rap / Spoken Word · Cinematic

**Pro Tools:** Harmony BG · Vintage Tape · Final Polish

---

## AI Scene Generation — 6 Cinematic Shots

| Scene | Prompt Theme |
|-------|-------------|
| Album Cover | Studio portrait, dramatic lighting, platinum record aesthetic |
| Private Jet | Post-show luxury travel, sunset, champagne |
| Stadium Night | 80,000 fans, pyrotechnics, laser beams |
| Red Carpet | Hollywood premiere, paparazzi, velvet rope |
| VIP Backstage | Gold star dressing room, fresh flowers, ring lights |
| Recording Studio | LA studio session, analog console, vocal booth |

---

## Stingray API Integration Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| No local/offline storage of karaoke assets | Ready | Streaming only, no download UI |
| Mandatory play-log reporting | Ready | Serverless endpoint scaffolded |
| Stingray logo on home and splash screens | Ready | Placement reserved in UI |
| Songs displayed as "Title in the style of Artist" | Ready | Metadata component built to spec |
| Disney content: subscribed tier only | Ready | Tier-gating logic in place |
| Watermark on all video renders | Ready | Overlay component awaiting asset |
| JWT authentication flow | Ready | OAuth device flow documented and scaffolded |

**Pending Stingray API credentials:**
- Song catalog browse and search
- Licensed track streaming (audio and video with lyrics)
- Microphone capture synced to backing track
- Play-log reporting for royalty tracking
- Stingray branding assets

---

## Roadmap

### Phase 1 — Stingray Integration (April – May 2026)
- JWT authentication
- Song catalog browse and search UI
- Full-screen karaoke video player
- Microphone capture synced to backing track
- Play-log endpoint for royalty reporting

### Phase 2 — Real Audio Processing (June 2026)
- Web Audio API vocal capture
- Real-time DSP (reverb, compression, EQ)
- Vocal and backing track mix output

### Phase 3 — Monetization (July – August 2026)
- Gold / Platinum / Diamond subscription tiers
- Stripe billing integration
- AI image upsell: standard vs HD
- Duet mode (Platinum and Diamond)

---

## License

This software and its source code are proprietary and confidential.
Unauthorized copying, distribution, modification, or use of this software, in whole or in part, is strictly prohibited without the express written permission of Force Creative AI LLC.

© 2026 Force Creative AI LLC — All Rights Reserved

---

*Built by Force Creative AI LLC · staralive.vercel.app · 2026*


