# StarAlive 🎤

**Your artist era starts now.**

StarAlive is a performance-tech platform built on the Identity Amplification Economy. Users don't just sing karaoke — they get discovered, sign a deal, record in a studio, generate AI rockstar imagery, and drop their era to the world.

## The 5-Act Journey

| Act | Name | What Happens |
|-----|------|-------------|
| I | Audition | Choose your artist name and genre |
| II | Sign | Sign your deal with StarAlive Records |
| III | Studio | Record vocals + Pro Studio 13-preset mixer |
| IV | Rollout | Generate AI album art, jet life, stadium moments |
| V | Your Era | Drop your debut — album title, share link, profile |

## Tech Stack

- **React 18** + Vite
- **Web Audio API** — real DSP processing in the Pro Studio mixer
- **Stingray Karaoke API** — 140K licensed songs (credentials required)
- **OpenAI gpt-image-1** — AI scene generation ($0.04–$0.08/image)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Add your Stingray and OpenAI API keys

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

## Environment Variables

```
VITE_STINGRAY_CLIENT_ID=your_stingray_client_id
VITE_STINGRAY_CLIENT_SECRET=your_stingray_client_secret
VITE_OPENAI_API_KEY=your_openai_api_key
```

> ⚠️ Never commit your `.env` file. API keys must stay private.

## Stingray Compliance

This app is built to Stingray's API requirements:
- ✅ No local/offline storage of karaoke assets
- ✅ Mandatory play-log reporting on every song play
- ✅ Stingray logo on home/splash screens
- ✅ Songs displayed as "Song Title in the style of Artist Name"
- ✅ Disney content restricted to subscribed tier only
- ✅ In-app streaming only — no download buttons

## Deployment

This project deploys instantly to Vercel:

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Add environment variables in Vercel dashboard
4. Deploy — live in 60 seconds

---

Built by [Force Creative AI](https://forcecreativeai.com) · StarAlive MVP · 2026
