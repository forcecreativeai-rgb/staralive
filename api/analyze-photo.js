export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { photoBase64 } = req.body
  if (!photoBase64) return res.status(400).json({ error: 'Photo required' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${photoBase64}`,
                detail: 'low'
              }
            },
            {
              type: 'text',
              text: 'Describe this person\'s physical appearance for AI image generation. Be specific: gender, approximate age, skin tone, hair color and style, face shape, build. 2-3 sentences only. No names or identifying info.'
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      return res.status(response.status).json({ error: err.error?.message || 'Analysis failed' })
    }

    const data = await response.json()
    const description = data.choices?.[0]?.message?.content || ''
    return res.status(200).json({ description })

  } catch (err) {
    console.error('Analyze photo error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
