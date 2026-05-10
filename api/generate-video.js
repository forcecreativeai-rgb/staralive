export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  if (req.method === 'GET') {
    const { jobId } = req.query
    if (!jobId) return res.status(400).json({ error: 'jobId required' })
    try {
      const r = await fetch(`https://api.openai.com/v1/video/generations/${jobId}`, { headers: { 'Authorization': `Bearer ${apiKey}` } })
      const d = await r.json()
      if (!r.ok) return res.status(r.status).json({ error: d?.error?.message || 'Status check failed' })
      if (d.status === 'succeeded') return res.status(200).json({ status: 'done', url: d?.data?.[0]?.url || d?.result?.url || null })
      if (d.status === 'failed') return res.status(200).json({ status: 'failed', error: d?.error?.message || 'Failed' })
      return res.status(200).json({ status: 'pending' })
    } catch (err) { return res.status(500).json({ error: 'Poll error: ' + err.message }) }
  }

  if (req.method === 'POST') {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt required' })
    try {
      const r = await fetch('https://api.openai.com/v1/video/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'sora-2', prompt: prompt.slice(0, 2000), n: 1, size: '1280x720', duration: 10 }),
      })
      const d = await r.json()
      if (!r.ok) return res.status(r.status).json({ error: d?.error?.message || 'Video creation failed' })
      return res.status(200).json({ jobId: d?.id || d?.job_id, status: 'queued' })
    } catch (err) { return res.status(500).json({ error: 'Server error: ' + err.message }) }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
