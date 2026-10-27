// api/generate.js - Vercel Serverless Function

export default async function handler(req, res) {
    // POST Request විතරක් බාරගැනීම
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Vercel Environment Variables වලින් API Key එක ලබාගැනීම
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Groq API Key missing in Vercel configuration.' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are BuildForge AI, an expert frontend web designer. 
Generate a complete, modern, fully functional, beautifully styled single-page website code based on the user request. 
IMPORTANT: Return ONLY valid, executable raw HTML code including inline CSS in <style> tags and JavaScript inside <script> tags. 
DO NOT include markdown formatting like \`\`\`html or explanation text. Output raw HTML directly.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Groq Error:', data);
            return res.status(500).json({ error: data.error?.message || 'Groq API Error' });
        }

        let generatedCode = data.choices[0].message.content;

        // Clean markdown backticks if present
        generatedCode = generatedCode.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

        return res.status(200).json({ code: generatedCode });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
