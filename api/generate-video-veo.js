// Google Veo 3.1 video generation — async long-running operation via Gemini API
// POST: start a generation job  →  returns { jobName, status: 'queued' }
// GET ?jobName=xxx: poll status →  returns { status, url|error }

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

  // ── POLL STATUS: GET /api/generate-video-veo?jobName=operations/xxx
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

      console.log('[veo] Poll response done:', d.done, 'has error:', !!d.error)

      // Still running
      if (!d.done) {
        return res.status(200).json({ status: 'pending', progress: 50 })
      }

      // Completed with error
      if (d.error) {
        const errMsg = d.error.message || 'Generation failed'
        console.error('[veo] Job failed:', errMsg)
        return res.status(200).json({ status: 'failed', error: errMsg })
      }

      // Log the full done response so we can see the actual shape
      console.log('[veo] Done response keys:', Object.keys(d).join(', '))
      console.log('[veo] Done response.response keys:', d.response ? Object.keys(d.response).join(', ') : 'none')
      console.log('[veo] Full done response:', JSON.stringify(d).slice(0, 800))

      // Try every known Veo response shape
      const predictions = d.response?.predictions
      const videos      = d.response?.videos || d.response?.generatedSamples

      // Shape A: predictions array (Imagen-style)
      if (predictions && predictions.length > 0) {
        const pred = predictions[0]
        const videoUrl = pred.videoUri || pred.video?.uri || pred.uri || null
        const videoB64 = pred.bytesBase64Encoded || pred.video?.bytesBase64Encoded || null
        if (videoUrl) {
          console.log('[veo] Shape A videoUri:', videoUrl.slice(0, 120))
          return res.status(200).json({ status: 'done', url: videoUrl })
        }
        if (videoB64) {
          const mimeType = pred.mimeType || 'video/mp4'
          console.log('[veo] Shape A base64, mimeType:', mimeType)
          return res.status(200).json({ status: 'done', url: `data:${mimeType};base64,${videoB64}` })
        }
      }

      // Shape B: videos / generatedSamples array (Veo-native)
      if (videos && videos.length > 0) {
        const vid = videos[0]
        const videoUrl = vid.videoUri || vid.uri || vid.video?.uri || null
        const videoB64 = vid.bytesBase64Encoded || vid.video?.bytesBase64Encoded || null
        if (videoUrl) {
          console.log('[veo] Shape B videoUri:', videoUrl.slice(0, 120))
          return res.status(200).json({ status: 'done', url: videoUrl })
        }
        if (videoB64) {
          const mimeType = vid.mimeType || 'video/mp4'
          console.log('[veo] Shape B base64, mimeType:', mimeType)
          return res.status(200).json({ status: 'done', url: `data:${mimeType};base64,${videoB64}` })
        }
      }

      // Unknown shape — return raw for debugging
      console.error('[veo] Unrecognised done response shape')
      return res.status(200).json({
        status: 'failed',
        error: 'Unrecognised response shape',
        _debug: JSON.stringify(d).slice(0, 600),
      })

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
      // Build instance — conditionally include reference image
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

      // Long-running operation name e.g. "operations/123456"
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
