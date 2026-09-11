const Groq = require('groq-sdk');
const Movie = require('../models/movie');
const { getSortPipeline } = require('../utils/movieSort');

// Created lazily (not at module load) so requiring this file never throws just
// because GROQ_API_KEY isn't set - a missing key should only break the chat
// endpoint itself, not crash the whole backend process on boot.
let client;
const getClient = () => {
    if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return client;
};

const BASE_SYSTEM_PROMPT = `You are CineBot, the friendly movie-chat assistant built into CineVibes, a movie discussion site.
Help users talk about movies: recommendations, plot discussion, trivia, actors, directors, genres.
Keep replies conversational and concise (a few sentences, unless the user asks for more detail).
You have a search_movies tool that looks up CineVibes' own movie catalog — use it whenever the user names
a specific movie, asks about a year/genre, or wants a "top" or "best" list, so you can answer from real
catalog data instead of guessing. If search_movies finds nothing, say so rather than inventing details.
Whenever you mention a movie that came from search_movies, link it using Markdown in the exact form
[Movie Title](/movie/imdbID) using that movie's real imdbID field, so the user can click through to its
page on the site. Only link movies that actually came from search_movies - never invent an imdbID.
The client only renders that one link syntax, nothing else - do not use any other Markdown (no bold,
no italics, no headings, no bullet/numbered list syntax). Write plain sentences instead, e.g. "1. [Title](/movie/id)
is a great pick because..." rather than wrapping the title in ** or using a Markdown list.`;

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
        description:
            "Search or filter CineVibes' own movie catalog. All parameters are optional and combine as " +
            'filters. Use "year" to find movies from a specific release year, "genre" to filter by genre, ' +
            '"sort" to rank results ("rating" for highest-rated / "top" lists, "year" for newest, "trending" ' +
            'for most-discussed), and "limit" for how many results to return (e.g. for a "top 5" request). ' +
            'Omit "title" when the user is asking about a year or genre in general rather than a specific movie.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Movie title or partial title to search for' },
                year: { type: 'string', description: 'Release year to filter by, e.g. "2026"' },
                genre: { type: 'string', description: 'Genre to filter by, e.g. "Comedy"' },
                sort: { type: 'string', enum: ['rating', 'year', 'trending'], description: 'How to rank results' },
                limit: { type: 'integer', description: 'Max number of results to return (default 5, max 10)' },
            },
        },
    },
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const runSearchMovies = async ({ title, year, genre, sort, limit }) => {
    const filter = {};
    if (title) filter.title = { $regex: escapeRegex(title), $options: 'i' };
    if (year) filter.year = { $regex: `^${escapeRegex(year)}` };
    if (genre) filter.genre = { $regex: escapeRegex(genre), $options: 'i' };

    const resultLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);

    const movies = await Movie.aggregate([
        { $match: filter },
        ...getSortPipeline(sort),
        { $limit: resultLimit },
        { $project: { imdbID: 1, title: 1, year: 1, genre: 1, rating: 1, director: 1, actors: 1, plot: 1, _id: 0 } },
    ]);

    return movies.map((m) => ({
        imdbID: m.imdbID,
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

// Runs the tool-calling loop and returns the final reply text. Takes callModel as an
// explicit argument (rather than reaching for the module-level client) so it can be
// unit-tested directly with a fake, with no need to mock the groq-sdk module.
const runChatLoop = async (messages, movieContext, callModel) => {
    const conversation = [
        { role: 'system', content: buildSystemPrompt(movieContext) },
        ...messages,
    ];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const response = await callModel(conversation);

        const message = response.choices[0]?.message;
        const toolCalls = message?.tool_calls;

        if (!toolCalls || toolCalls.length === 0) {
            return message?.content || '';
        }

        conversation.push(message);

        for (const call of toolCalls) {
            let results = [];
            try {
                const args = JSON.parse(call.function.arguments);
                if (call.function.name === 'search_movies') {
                    results = await runSearchMovies(args);
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

    return '';
};

const callGroq = (conversation) =>
    getClient().chat.completions.create({
        model: 'openai/gpt-oss-20b',
        max_completion_tokens: 1024,
        messages: conversation,
        tools: [searchMoviesTool],
        tool_choice: 'auto',
    });

exports.sendMessage = async (req, res) => {
    const { messages, movieContext } = req.body;

    if (!isValidHistory(messages)) {
        return res.status(400).json({ error: 'Invalid chat history' });
    }

    try {
        const reply = await runChatLoop(messages, movieContext, callGroq);
        res.json({ reply });
    } catch (err) {
        console.error('Chat request failed:', err.message);
        res.status(502).json({ error: 'CineBot is unavailable right now' });
    }
};

exports.runChatLoop = runChatLoop;
exports.isValidHistory = isValidHistory;
exports.runSearchMovies = runSearchMovies;
