const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

exports.sendMessage = async (req, res) => {
    const { messages } = req.body;

    if (!isValidHistory(messages)) {
        return res.status(400).json({ error: 'Invalid chat history' });
    }

    try {
        const response = await client.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            max_completion_tokens: 1024,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages,
            ],
        });

        res.json({ reply: response.choices[0]?.message?.content || '' });
    } catch (err) {
        console.error('Chat request failed:', err.message);
        res.status(502).json({ error: 'CineBot is unavailable right now' });
    }
};
