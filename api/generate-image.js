export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt, photoBase64 } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured' })

  try {
    let faceDescription = ''

    // Step 1: If photo uploaded, use GPT-4 Vision to extract a detailed appearance description
    if (photoBase64) {
      const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${photoBase64}`,
                    detail: 'low',
                  },
                },
                {
                  type: 'text',
                  text: 'Describe this person\'s physical appearance for an AI image generation prompt. Include: gender, approximate age, skin tone, hair color and style, facial features, build/body type. Be specific and concise — 2-3 sentences max. Do not include names or any identifying information. Just physical description.',
                },
              ],
            },
          ],
        }),
      })

      if (visionResponse.ok) {
        const visionData = await visionResponse.json()
        faceDescription = visionData.choices?.[0]?.message?.content || ''
      }
    }

    // Step 2: Build the final prompt with face description injected
    const fullPrompt = faceDescription
      ? `${prompt} The artist has the following appearance: ${faceDescription} Maintain these exact physical characteristics throughout. Cinematic, photorealistic, professional photography.`
      : `${prompt} Cinematic, photorealistic, professional photography.`

    // Step 3: Generate image with DALL-E 3
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    })

    if (!imageResponse.ok) {
      const err = await imageResponse.json()
      console.error('OpenAI image error:', err)
      return res.status(imageResponse.status).json({ error: err.error?.message || 'Image generation failed' })
    }

    const imageData = await imageResponse.json()
    return res.status(200).json({ url: imageData.data[0].url })

  } catch (err) {
    console.error('Generate image error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
