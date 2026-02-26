export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured' })

  try {
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt.slice(0, 3900), // DALL-E 3 max prompt is 4000 chars
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    })

    const imageData = await imageResponse.json()

    if (!imageResponse.ok) {
      console.error('DALL-E error:', JSON.stringify(imageData))
      const msg = imageData?.error?.message || 'Image generation failed'
      return res.status(imageResponse.status).json({ error: msg })
    }

    return res.status(200).json({ url: imageData.data[0].url })

  } catch (err) {
    console.error('Generate image error:', err.message)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
