// gpt-image-1.5 — Character Reference Architecture
// Pass photoBase64 (selfie) or characterRefUrl (first generated image) for face consistency

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

    // Priority 1: characterRefUrl — fetch previously generated image
    if (characterRefUrl && characterRefUrl.startsWith('http')) {
      try {
        const imgRes = await fetch(characterRefUrl, { signal: AbortSignal.timeout(8000) })
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer()
          refBase64 = Buffer.from(buf).toString('base64')
          refMime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0]
        }
      } catch (e) {
        console.warn('Could not fetch characterRef, trying photoBase64:', e.message)
      }
    }

    // Priority 2: user's original selfie
    if (!refBase64 && photoBase64) {
      refBase64 = photoBase64
    }

    let imageUrl = null

    // ── WITH reference image: use Images Edit API (multipart form)
    if (refBase64) {
      const { FormData, Blob } = await import('node:buffer').catch(() => ({}))

      // Convert base64 to buffer
      const imgBuffer = Buffer.from(refBase64, 'base64')

      // Use the images edit endpoint which accepts image input + prompt
      const form = new FormData()
      form.append('model', 'gpt-image-1')
      form.append('prompt', `${prompt.slice(0, 3500)} Preserve the exact face, skin tone, hair, and physical appearance of the person in the reference image. This is the artist — their look must remain identical across all scenes.`)
      form.append('n', '1')
      form.append('size', '1024x1024')
      form.append('image', new Blob([imgBuffer], { type: refMime }), 'reference.jpg')

      const editRes = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: form,
      })

      const editData = await editRes.json()

      if (editRes.ok && editData.data?.[0]?.url) {
        imageUrl = editData.data[0].url
        console.log('Used image edit (character reference) successfully')
      } else {
        console.warn('Image edit failed, falling back to text-only:', JSON.stringify(editData).slice(0, 200))
      }
    }

    // ── WITHOUT reference (or if edit failed): text-only gpt-image-1
    if (!imageUrl) {
      const genRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt.slice(0, 3500),
          n: 1,
          size: '1024x1024',
          quality: 'high',
        }),
      })

      const genData = await genRes.json()

      if (!genRes.ok) {
        console.error('gpt-image-1 error:', JSON.stringify(genData).slice(0, 300))
        return res.status(genRes.status).json({ error: genData?.error?.message || 'Generation failed' })
      }

      // gpt-image-1 returns base64 by default
      const item = genData.data?.[0]
      if (item?.url) {
        imageUrl = item.url
      } else if (item?.b64_json) {
        imageUrl = `data:image/png;base64,${item.b64_json}`
      }
    }

    if (!imageUrl) return res.status(500).json({ error: 'No image returned' })
    return res.status(200).json({ url: imageUrl })

  } catch (err) {
    console.error('Generate image error:', err.message)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
