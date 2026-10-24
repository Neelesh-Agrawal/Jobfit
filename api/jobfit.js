export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing GROQ_API_KEY',
      detail: 'Set GROQ_API_KEY in your Vercel environment variables.'
    });
  }

  try {
    // The frontend currently sends an Anthropic-shaped payload:
    // { model, max_tokens, system, messages:[{role:'user', content:'...'}] }
    // We'll translate that into Groq's OpenAI-compatible chat payload,
    // and translate the response back into an Anthropic-like shape so the UI keeps working.
    const {
      model: _ignoredModel,
      max_tokens,
      system,
      messages
    } = (req.body ?? {});

    const incomingMessages = Array.isArray(messages) ? messages : [];
    const groqMessages = [
      ...(system ? [{ role: 'system', content: String(system) }] : []),
      ...incomingMessages.map((m) => ({
        role: m?.role === 'assistant' || m?.role === 'system' ? m.role : 'user',
        content: typeof m?.content === 'string' ? m.content : JSON.stringify(m?.content ?? '')
      }))
    ];

    const groqPayload = {
      model: 'openai/gpt-oss-120b',
      reasoning_effort: 'low',
      messages: groqMessages,
      max_tokens: typeof max_tokens === 'number' ? max_tokens : 1500,
      temperature: 0.2
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(groqPayload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Groq API error',
        detail: data?.error?.message || data?.message || 'Unknown error',
        upstream: data
      });
    }

    const text = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({
      // Anthropic-like response shape expected by current frontend:
      content: [{ type: 'text', text }]
    });
  } catch (error) {
    return res.status(500).json({ error: 'API call failed', detail: error?.message || String(error) });
  }
}

