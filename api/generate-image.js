// gpt-image-1 image generation with character reference support
// Uses text-only generation (most reliable) with strong identity prompting
// Character reference via image edit is attempted but falls back gracefully

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt, photoBase64, characterRefUrl } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  try {
    let refBase64 = null
    let refMime = 'image/jpeg'

    // Resolve character reference image to base64
    // Priority 1: data: URL from previous generation (gpt-image-1 returns base64)
    if (characterRefUrl && characterRefUrl.startsWith('data:')) {
      const match = characterRefUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        refMime = match[1]
        refBase64 = match[2]
      }
    }
    // Priority 2: http URL from previous generation
    else if (characterRefUrl && characterRefUrl.startsWith('http')) {
      try {
        const imgRes = await fetch(characterRefUrl, { signal: AbortSignal.timeout(8000) })
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer()
          refBase64 = Buffer.from(buf).toString('base64')
          refMime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0]
        }
      } catch (e) {
        console.warn('Could not fetch characterRef URL:', e.message)
      }
    }
    // Priority 3: user's original selfie
    else if (photoBase64) {
      // Strip data URL prefix if present
      const match = photoBase64.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        refMime = match[1]
        refBase64 = match[2]
      } else {
        refBase64 = photoBase64
      }
    }

    let imageUrl = null

    // ── ATTEMPT: image edit with reference photo for face consistency
    if (refBase64) {
      try {
        const imgBuffer = Buffer.from(refBase64, 'base64')
        // Validate: don't attempt if buffer is too small (corrupt) or too large (>4MB)
        if (imgBuffer.length > 1000 && imgBuffer.length < 4_000_000) {
          const form = new FormData()
          form.append('model', 'gpt-image-1')
          form.append('prompt', `${prompt.slice(0, 3000)} Preserve the exact face, skin tone, hair color, hair style, and physical build of the person in the reference image. Their appearance must remain identical.`)
          form.append('size', '1024x1024')
          form.append('quality', 'high')
          const blob = new Blob([imgBuffer], { type: refMime })
          form.append('image[]', blob, 'reference.jpg')

          const editRes = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: form,
          })
          const editData = await editRes.json()
          if (editRes.ok) {
            const item = editData.data?.[0]
            imageUrl = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null)
            if (imageUrl) console.log('Character reference edit succeeded')
          } else {
            console.warn('Image edit failed:', editData?.error?.message?.slice(0, 100))
          }
        } else {
          console.warn('Reference image skipped: size out of range', imgBuffer.length)
        }
      } catch (e) {
        console.warn('Image edit exception:', e.message)
      }
    }

    // ── FALLBACK: text-only gpt-image-1 generation
    if (!imageUrl) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 55000) // 55s timeout
      try {
        const genRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: prompt.slice(0, 3500),
            n: 1,
            size: '1024x1024',
            quality: 'high',
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        const genData = await genRes.json()
        if (!genRes.ok) {
          const errMsg = genData?.error?.message || 'Generation failed'
          console.error('gpt-image-1 error:', errMsg)
          return res.status(genRes.status).json({ error: errMsg })
        }
        const item = genData.data?.[0]
        imageUrl = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null)
      } catch (e) {
        clearTimeout(timeout)
        if (e.name === 'AbortError') {
          return res.status(504).json({ error: 'Generation timed out — try again' })
        }
        throw e
      }
    }

    if (!imageUrl) return res.status(500).json({ error: 'No image returned from API' })
    return res.status(200).json({ url: imageUrl })

  } catch (err) {
    console.error('Generate image error:', err.message)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
