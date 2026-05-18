// DEPRECATED — Sora 2 API shuts down September 24 2026
// This file is no longer called by the app. Kept for reference only.
// Active video generation is handled by generate-video-veo.js

// Sora 2 video generation — async polling + authenticated proxy stream
// Cost: seconds='4' = ~$0.80, seconds='8' = ~$1.60, seconds='12' = ~$2.40

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  // ── PROXY STREAM: GET /api/generate-video?stream=video_id
  // Browser <video> tags can't send auth headers — we proxy through here
  if (req.method === 'GET' && req.query.stream) {
    const videoId = req.query.stream
    try {
      const videoRes = await fetch(
        `https://api.openai.com/v1/videos/${videoId}/content`,
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      )
      if (!videoRes.ok) {
        return res.status(videoRes.status).json({ error: 'Video stream failed' })
      }
      const contentType = videoRes.headers.get('content-type') || 'video/mp4'
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.setHeader('Accept-Ranges', 'bytes')
      // Stream chunks back to browser
      const reader = videoRes.body.getReader()
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(Buffer.from(value))
        }
        res.end()
      }
      await pump()
      return
    } catch (err) {
      console.error('Stream error:', err.message)
      return res.status(500).json({ error: 'Stream error: ' + err.message })
    }
  }

  // ── POLL STATUS: GET /api/generate-video?jobId=xxx
  if (req.method === 'GET' && req.query.jobId) {
    const { jobId } = req.query
    try {
      const r = await fetch(`https://api.openai.com/v1/videos/${jobId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const d = await r.json()
      if (!r.ok) {
        console.error('Sora poll error:', JSON.stringify(d).slice(0, 200))
        return res.status(r.status).json({ error: d?.error?.message || 'Poll failed' })
      }

      const status = d.status // queued | in_progress | completed | failed
      const progress = d.progress || 0
      console.log(`Sora ${jobId}: ${status} ${progress}%`)

      if (status === 'completed') {
        // Return a proxied URL — browser plays this without needing auth headers
        const proxyUrl = `/api/generate-video?stream=${jobId}`
        return res.status(200).json({ status: 'done', url: proxyUrl, progress: 100 })
      }

      if (status === 'failed') {
        const errMsg = d?.error?.message || 'Generation failed'
        const isPolicy = errMsg.toLowerCase().includes('safety') || errMsg.toLowerCase().includes('policy') || errMsg.toLowerCase().includes('content')
        return res.status(200).json({
          status: 'failed',
          error: errMsg,
          isPolicy,
        })
      }

      // Still running — return progress
      return res.status(200).json({ status: 'pending', progress })

    } catch (err) {
      return res.status(500).json({ error: 'Poll error: ' + err.message })
    }
  }

  // ── CREATE VIDEO: POST /api/generate-video
  if (req.method === 'POST') {
    const { prompt, testMode } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt required' })

    // testMode=true uses 4s clips ($0.80) — set to false for investor demo (12s = $2.40)
    const duration = testMode ? '4' : '8'

    try {
      const r = await fetch('https://api.openai.com/v1/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'sora-2',
          prompt: prompt.slice(0, 2000),
          size: '1280x720',
          seconds: duration,
        }),
      })
      const d = await r.json()
      if (!r.ok) {
        console.error('Sora create error:', JSON.stringify(d).slice(0, 300))
        const isPolicy = d?.error?.message?.toLowerCase().includes('safety') || d?.error?.message?.toLowerCase().includes('policy')
        return res.status(r.status).json({
          error: d?.error?.message || 'Video creation failed',
          isPolicy,
        })
      }
      const jobId = d?.id || d?.job_id
      console.log('Sora job created:', jobId, 'duration:', duration + 's')
      return res.status(200).json({ jobId, status: 'queued' })
    } catch (err) {
      console.error('Sora error:', err.message)
      return res.status(500).json({ error: 'Server error: ' + err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
