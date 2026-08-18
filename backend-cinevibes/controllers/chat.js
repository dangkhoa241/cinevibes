const Groq = require('groq-sdk');
const Movie = require('../models/movie');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BASE_SYSTEM_PROMPT = `You are CineBot, the friendly movie-chat assistant built into CineVibes, a movie discussion site.
Help users talk about movies: recommendations, plot discussion, trivia, actors, directors, genres.
Keep replies conversational and concise (a few sentences, unless the user asks for more detail).
You have a search_movies tool that looks up CineVibes' own movie catalog by title — use it whenever the
user names a specific movie, so you can check whether it's on the site and answer from its actual data
instead of guessing. If search_movies finds nothing, say so rather than inventing details.`;

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOOL_ROUNDS = 3;

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

const searchMoviesTool = {
    type: 'function',
    function: {
        name: 'search_movies',
        description: "Search CineVibes' own movie catalog by title and return matching entries.",
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Movie title or partial title to search for' },
            },
            required: ['title'],
        },
    },
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const runSearchMovies = async (title) => {
    const movies = await Movie.find({ title: { $regex: escapeRegex(title), $options: 'i' } })
        .limit(5)
        .select('title year genre rating director actors plot -_id');
    return movies.map((m) => ({
        title: m.title,
        year: m.year,
        genre: m.genre,
        rating: m.rating,
        director: m.director,
        actors: m.actors,
        plot: m.plot,
    }));
};

const buildSystemPrompt = (movieContext) => {
    if (!movieContext || typeof movieContext.title !== 'string') return BASE_SYSTEM_PROMPT;

    return `${BASE_SYSTEM_PROMPT}

The user is currently viewing this movie's page on CineVibes:
Title: ${movieContext.title} (${movieContext.year || 'unknown year'})
Genre: ${movieContext.genre || 'unknown'}
Director: ${movieContext.director || 'unknown'}
Actors: ${movieContext.actors || 'unknown'}
Plot: ${movieContext.plot || 'unknown'}
You can use this directly for questions about "this movie" without needing to search for it.`;
};

exports.sendMessage = async (req, res) => {
    const { messages, movieContext } = req.body;

    if (!isValidHistory(messages)) {
        return res.status(400).json({ error: 'Invalid chat history' });
    }

    try {
        const conversation = [
            { role: 'system', content: buildSystemPrompt(movieContext) },
            ...messages,
        ];

        let reply = '';

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
            const response = await client.chat.completions.create({
                model: 'openai/gpt-oss-20b',
                max_completion_tokens: 1024,
                messages: conversation,
                tools: [searchMoviesTool],
                tool_choice: 'auto',
            });

            const message = response.choices[0]?.message;
            const toolCalls = message?.tool_calls;

            if (!toolCalls || toolCalls.length === 0) {
                reply = message?.content || '';
                break;
            }

            conversation.push(message);

            for (const call of toolCalls) {
                let results = [];
                try {
                    const args = JSON.parse(call.function.arguments);
                    if (call.function.name === 'search_movies' && args.title) {
                        results = await runSearchMovies(args.title);
                    }
                } catch (toolErr) {
                    console.error('Tool execution failed:', toolErr.message);
                }

                conversation.push({
                    role: 'tool',
                    tool_call_id: call.id,
                    content: JSON.stringify(results),
                });
            }
        }

        res.json({ reply });
    } catch (err) {
        console.error('Chat request failed:', err.message);
        res.status(502).json({ error: 'CineBot is unavailable right now' });
    }
};
