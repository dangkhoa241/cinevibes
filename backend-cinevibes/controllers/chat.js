const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are CineBot, the friendly movie-chat assistant built into CineVibes, a movie discussion site.
Help users talk about movies: recommendations, plot discussion, trivia, actors, directors, genres.
Keep replies conversational and concise (a few sentences, unless the user asks for more detail).
You do not have live access to CineVibes' own movie catalog or database, so don't claim a specific movie
is or isn't listed on the site — speak from general movie knowledge instead.`;

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

const isValidHistory = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
        return false;
    }
    return messages.every((m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.length > 0 &&
        m.content.length <= MAX_MESSAGE_LENGTH
    );
};

// Gemini uses 'model' instead of 'assistant', and wraps text in a parts array.
const toGeminiContents = (messages) =>
    messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }));

exports.sendMessage = async (req, res) => {
    const { messages } = req.body;

    if (!isValidHistory(messages)) {
        return res.status(400).json({ error: 'Invalid chat history' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: toGeminiContents(messages),
            config: {
                systemInstruction: SYSTEM_PROMPT,
                maxOutputTokens: 1024,
            },
        });

        res.json({ reply: response.text || '' });
    } catch (err) {
        console.error('Chat request failed:', err.message);
        res.status(502).json({ error: 'CineBot is unavailable right now' });
    }
};
