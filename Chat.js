export default async function handler(req, res) {
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const { messages, system } = req.body;

if (!messages || !Array.isArray(messages)) {
return res.status(400).json({ error: ‘Invalid request body’ });
}

try {
const apiKey = process.env.GEMINI_API_KEY; // ✅ Secure — never sent to browser

```
// Convert messages to Gemini format
const contents = [];

// Add system prompt as first exchange if provided
if (system) {
  contents.push({ role: 'user', parts: [{ text: '(System instructions: ' + system + ')' }] });
  contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow those instructions.' }] });
}

for (const msg of messages) {
  contents.push({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  });
}

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.9 }
    })
  }
);

const data = await response.json();

if (!response.ok) {
  return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
}

// Return in same format as before so frontend works unchanged
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Let me counter that argument...';
return res.status(200).json({ content: [{ type: 'text', text }] });
```

} catch (error) {
console.error(‘API error:’, error);
return res.status(500).json({ error: ‘Internal server error’ });
}
}
