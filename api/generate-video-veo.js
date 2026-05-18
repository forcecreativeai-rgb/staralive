// Google Veo 3.1 video generation — async long-running operation via Gemini API
// POST:              start a generation job  →  returns { jobName, status: 'queued' }
// GET ?jobName=xxx:  poll status             →  returns { status, url|error }
// GET ?stream=url:   proxy video stream      →  streams video/mp4 with auth header

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function setCors(res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[veo] GEMINI_API_KEY not configured')
    return res.status(500).json({ error: 'API key not configured' })
  }

  // ── STREAM PROXY: GET /api/generate-video-veo?stream=ENCODED_URL
  // Videos from generativelanguage.googleapis.com require auth — proxy here
  if (req.method === 'GET' && req.query.stream) {
    const fileUrl = decodeURIComponent(req.query.stream)
    console.log('[veo] Stream proxy for:', fileUrl.slice(0, 120))
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
  if (req.method === 'GET') {
    const { jobName } = req.query
    if (!jobName) return res.status(400).json({ error: 'jobName query param required' })

    console.log('[veo] Polling job:', jobName)

    try {
      const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${jobName}?key=${apiKey}`
      const r = await fetch(pollUrl)
      const d = await r.json()

      if (!r.ok) {
        console.error('[veo] Poll HTTP error:', r.status, JSON.stringify(d).slice(0, 300))
        return res.status(r.status).json({ error: d?.error?.message || 'Poll failed' })
      }

      console.log('[veo] Poll done:', d.done, 'has error:', !!d.error)

      if (!d.done) {
        return res.status(200).json({ status: 'pending', progress: 50 })
      }

      if (d.error) {
        console.error('[veo] Job failed:', d.error.message)
        return res.status(200).json({ status: 'failed', error: d.error.message || 'Generation failed' })
      }

      // Extract from confirmed response shape:
      // d.response.generateVideoResponse.generatedSamples[0].video.uri
      const videoUri = d.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri

      if (videoUri) {
        // Return a proxied URL — key stays server-side, never reaches the browser
        const proxyUrl = `/api/generate-video-veo?stream=${encodeURIComponent(videoUri)}`
        console.log('[veo] Done — proxying videoUri:', videoUri.slice(0, 120))
        return res.status(200).json({ status: 'done', url: proxyUrl })
      }

      // Fallback — log full response so we can diagnose unexpected shapes
      console.error('[veo] Done but no videoUri found. Response:', JSON.stringify(d).slice(0, 800))
      return res.status(200).json({ status: 'failed', error: 'No video URI in response' })

    } catch (err) {
      console.error('[veo] Poll exception:', err.message)
      return res.status(500).json({ error: 'Poll error: ' + err.message })
    }
  }

  // ── START JOB: POST /api/generate-video-veo
  if (req.method === 'POST') {
    const { prompt, imageUrl } = req.body || {}
    if (!prompt) return res.status(400).json({ error: 'prompt is required' })

    console.log('[veo] Starting Veo 3.1 job. Prompt:', prompt.slice(0, 100))
    if (imageUrl) console.log('[veo] Reference image provided:', imageUrl.slice(0, 80))

    try {
      const instance = { prompt: prompt.slice(0, 2000) }

      if (imageUrl) {
        console.log('[veo] Fetching reference image...')
        const imgRes = await fetch(imageUrl)
        if (!imgRes.ok) {
          console.error('[veo] Failed to fetch image:', imgRes.status)
          return res.status(400).json({ error: 'Could not fetch imageUrl: ' + imgRes.status })
        }
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
        const mimeType = contentType.split(';')[0].trim()
        const buffer = await imgRes.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        instance.image = { bytesBase64Encoded: base64, mimeType }
        console.log('[veo] Image fetched, mimeType:', mimeType, 'size:', buffer.byteLength, 'bytes')
      }

      const body = {
        instances: [instance],
        parameters: {
          aspectRatio: '16:9',
          durationSeconds: 8,
        },
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${apiKey}`
      console.log('[veo] POSTing to Gemini predictLongRunning...')

      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const d = await r.json()

      if (!r.ok) {
        console.error('[veo] Create error:', r.status, JSON.stringify(d).slice(0, 400))
        return res.status(r.status).json({ error: d?.error?.message || 'Job creation failed' })
      }

      const jobName = d.name
      if (!jobName) {
        console.error('[veo] No operation name in response:', JSON.stringify(d).slice(0, 300))
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
