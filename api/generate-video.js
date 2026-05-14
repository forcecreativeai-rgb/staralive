export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  // POLL: GET /api/generate-video?jobId=xxx
  if (req.method === 'GET') {
    const { jobId } = req.query
    if (!jobId) return res.status(400).json({ error: 'jobId required' })
    try {
      const r = await fetch(`https://api.openai.com/v1/videos/${jobId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const d = await r.json()
      if (!r.ok) {
        console.error('Sora poll error:', JSON.stringify(d).slice(0, 300))
        return res.status(r.status).json({ error: d?.error?.message || 'Poll failed' })
      }

      // Log full structure so we can see the URL format
      console.log('Sora job response:', JSON.stringify(d).slice(0, 800))

      if (d.status === 'completed') {
        // Try every possible URL location in the response
        let videoUrl = d?.data?.[0]?.url
          || d?.generations?.[0]?.url
          || d?.result?.url
          || d?.output?.[0]?.url
          || d?.url
          || null

        // If still no URL, call the content endpoint to get the MP4 stream URL
        if (!videoUrl) {
          try {
            // Use no-redirect first to get the Location header
            const contentRes = await fetch(
              `https://api.openai.com/v1/videos/${jobId}/content`,
              {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                redirect: 'manual', // Don't follow redirect — capture Location header
              }
            )
            console.log('Content status:', contentRes.status)
            console.log('Content headers:', JSON.stringify([...contentRes.headers.entries()]))

            // 302 redirect — Location header has the actual MP4 URL
            if (contentRes.status === 302 || contentRes.status === 301) {
              videoUrl = contentRes.headers.get('location')
            } else if (contentRes.ok) {
              // Might return JSON with URL inside
              const ct = contentRes.headers.get('content-type') || ''
              if (ct.includes('application/json')) {
                const cd = await contentRes.json()
                videoUrl = cd?.url || cd?.data?.[0]?.url || null
              } else {
                // It's the actual video binary — we can't return this directly
                // Return the URL we used to fetch it as a proxy
                videoUrl = `https://api.openai.com/v1/videos/${jobId}/content`
              }
            }
          } catch (e) {
            console.warn('Content fetch error:', e.message)
          }
        }

        console.log('Returning video URL:', videoUrl)
        return res.status(200).json({ status: 'done', url: videoUrl })
      }

      if (d.status === 'failed') {
        return res.status(200).json({ status: 'failed', error: d?.error?.message || 'Generation failed' })
      }

      // queued, running, processing
      return res.status(200).json({ status: 'pending', jobStatus: d.status })

    } catch (err) {
      return res.status(500).json({ error: 'Poll error: ' + err.message })
    }
  }

  // CREATE: POST /api/generate-video
  if (req.method === 'POST') {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt required' })
    try {
      const body = {
        model: 'sora-2',
        prompt: prompt.slice(0, 2000),
        size: '1280x720',
        seconds: '12',
      }
      const r = await fetch('https://api.openai.com/v1/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) {
        console.error('Sora create error:', JSON.stringify(d).slice(0, 300))
        return res.status(r.status).json({ error: d?.error?.message || 'Video creation failed' })
      }
      const jobId = d?.id || d?.job_id
      console.log('Sora job created:', jobId, 'status:', d?.status)
      return res.status(200).json({ jobId, status: 'queued' })
    } catch (err) {
      console.error('Sora error:', err.message)
      return res.status(500).json({ error: 'Server error: ' + err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
