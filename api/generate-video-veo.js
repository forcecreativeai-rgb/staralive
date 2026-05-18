// Google Veo 3.1 video generation — async long-running operation via Gemini API
// POST:              start a generation job  →  returns { jobName, status: 'queued' }
// GET ?jobName=xxx:  poll status             →  returns { status, url|error }
// GET ?stream=url:   proxy video stream      →  streams video/mp4 server-side (key never exposed)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// SECURITY: Allowlist for stream proxy — only Gemini Files API URLs allowed
// Prevents SSRF attacks where attacker passes internal URLs
const ALLOWED_STREAM_HOST = 'generativelanguage.googleapis.com'

// SECURITY: Allowlist for image reference URLs
const ALLOWED_IMAGE_HOSTS = [
  'generativelanguage.googleapis.com',
  'staralive.vercel.app',
  'oaidalleapiprodscus.blob.core.windows.net', // OpenAI DALL-E CDN
  'cdn.openai.com',
]

function isAllowedHost(urlStr, allowedHosts) {
  try {
    const parsed = new URL(urlStr)
    return allowedHosts.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))
  } catch { return false }
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[veo] GEMINI_API_KEY not configured')
    return res.status(500).json({ error: 'API key not configured' })
  }

  // ── STREAM PROXY: GET /api/generate-video-veo?stream=ENCODED_URL
  if (req.method === 'GET' && req.query.stream) {
    const fileUrl = decodeURIComponent(req.query.stream)

    // SECURITY: Only proxy Gemini Files API URLs — block SSRF
    if (!isAllowedHost(fileUrl, [ALLOWED_STREAM_HOST])) {
      console.error('[veo] Stream blocked — disallowed host:', fileUrl.slice(0, 80))
      return res.status(403).json({ error: 'Forbidden' })
    }

    console.log('[veo] Stream proxy:', fileUrl.slice(0, 100))
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const videoRes = await fetch(fileUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!videoRes.ok) {
        console.error('[veo] Stream fetch failed:', videoRes.status)
        return res.status(videoRes.status).json({ error: 'Video stream failed' })
      }
      const contentType = videoRes.headers.get('content-type') || 'video/mp4'
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.setHeader('Accept-Ranges', 'bytes')
      const reader = videoRes.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(Buffer.from(value))
      }
      return res.end()
    } catch (err) {
      console.error('[veo] Stream error:', err.message)
      return res.status(500).json({ error: 'Stream error: ' + err.message })
    }
  }

  // ── POLL STATUS: GET /api/generate-video-veo?jobName=models/.../operations/xxx
  if (req.method === 'GET' && req.query.jobName) {
    const { jobName } = req.query

    // SECURITY: Validate jobName format to prevent injection
    if (!jobName.startsWith('models/') || !jobName.includes('/operations/')) {
      return res.status(400).json({ error: 'Invalid jobName format' })
    }

    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${jobName}?key=${apiKey}`
      )
      const d = await r.json()
      if (!r.ok) {
        console.error('[veo] Poll error:', r.status, JSON.stringify(d).slice(0, 200))
        return res.status(r.status).json({ error: d?.error?.message || 'Poll failed' })
      }

      console.log('[veo] Poll done:', d.done, 'progress:', d.metadata?.progressPercent || 'n/a')

      if (!d.done) {
        // Try to extract real progress from metadata if available
        const progress = d.metadata?.progressPercent || d.progress || null
        return res.status(200).json({ status: 'pending', progress })
      }

      if (d.error) {
        const errMsg = d.error.message || 'Generation failed'
        console.error('[veo] Job failed:', errMsg)
        const isPolicy = errMsg.toLowerCase().includes('safety') ||
                         errMsg.toLowerCase().includes('policy') ||
                         errMsg.toLowerCase().includes('prohibited')
        return res.status(200).json({ status: 'failed', error: errMsg, isPolicy })
      }

      const videoUri = d.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri
      if (videoUri) {
        const proxyUrl = `/api/generate-video-veo?stream=${encodeURIComponent(videoUri)}`
        console.log('[veo] Done — proxying:', videoUri.slice(0, 80))
        return res.status(200).json({ status: 'done', url: proxyUrl })
      }

      console.error('[veo] Done but no videoUri:', JSON.stringify(d).slice(0, 400))
      return res.status(200).json({ status: 'failed', error: 'No video URI in response' })

    } catch (err) {
      console.error('[veo] Poll exception:', err.message)
      return res.status(500).json({ error: 'Poll error: ' + err.message })
    }
  }

  // ── CREATE JOB: POST /api/generate-video-veo
  if (req.method === 'POST') {
    const { prompt, imageUrl } = req.body || {}
    if (!prompt) return res.status(400).json({ error: 'prompt is required' })

    // SECURITY: Validate prompt length
    if (prompt.length > 2000) return res.status(400).json({ error: 'Prompt too long' })

    const instance = { prompt: prompt.slice(0, 2000) }

    if (imageUrl) {
      // SECURITY: Only fetch images from allowed hosts — prevent SSRF
      const isDataUrl = imageUrl.startsWith('data:')
      const isAllowed = isDataUrl || isAllowedHost(imageUrl, ALLOWED_IMAGE_HOSTS)

      if (!isAllowed) {
        console.warn('[veo] Image URL blocked — disallowed host:', imageUrl.slice(0, 80))
        // Don't fail — just skip the reference image and continue without it
      } else {
        try {
          let imgBase64, imgMime
          if (isDataUrl) {
            const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/)
            if (match) { imgMime = match[1]; imgBase64 = match[2] }
          } else {
            const imgRes = await fetch(imageUrl, {
              signal: AbortSignal.timeout(8000),
            })
            if (imgRes.ok) {
              const buf = await imgRes.arrayBuffer()
              // SECURITY: Reject suspiciously large images (>4MB)
              if (buf.byteLength > 4_000_000) {
                console.warn('[veo] Reference image too large:', buf.byteLength)
              } else {
                imgBase64 = Buffer.from(buf).toString('base64')
                imgMime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0]
              }
            }
          }
          if (imgBase64 && imgMime) {
            instance.image = { bytesBase64Encoded: imgBase64, mimeType: imgMime }
            console.log('[veo] Reference image encoded:', imgMime, 'size:', imgBase64.length)
          }
        } catch (e) {
          console.warn('[veo] Could not encode reference image:', e.message)
        }
      }
    }

    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [instance],
            parameters: { aspectRatio: '16:9', durationSeconds: 8 },
          }),
        }
      )
      const d = await r.json()
      if (!r.ok) {
        console.error('[veo] Create error:', r.status, JSON.stringify(d).slice(0, 300))
        const isPolicy = d?.error?.message?.toLowerCase().includes('safety') ||
                         d?.error?.message?.toLowerCase().includes('policy')
        return res.status(r.status).json({
          error: d?.error?.message || 'Job creation failed',
          isPolicy,
        })
      }

      const jobName = d.name
      if (!jobName) {
        console.error('[veo] No operation name:', JSON.stringify(d).slice(0, 200))
        return res.status(500).json({ error: 'No operation name returned' })
      }

      console.log('[veo] Job created:', jobName)
      return res.status(200).json({ jobName, status: 'queued' })

    } catch (err) {
      console.error('[veo] Create exception:', err.message)
      return res.status(500).json({ error: 'Server error: ' + err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
