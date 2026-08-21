import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { runChatLoop, runSearchMovies } from '../controllers/chat.js';
import Movie from '../models/movie.js';

describe('POST /api/chat validation', () => {
    it('rejects an empty messages array', async () => {
        const res = await request(app).post('/api/chat').send({ messages: [] });
        expect(res.status).toBe(400);
    });

    it('rejects a message with an invalid role', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ messages: [{ role: 'system', content: 'hi' }] });

        expect(res.status).toBe(400);
    });

    it('rejects a message over the length limit', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ messages: [{ role: 'user', content: 'a'.repeat(2001) }] });

        expect(res.status).toBe(400);
    });
});

describe('runChatLoop', () => {
    it('returns the reply text when the model makes no tool calls', async () => {
        const callModel = vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Hello from CineBot', tool_calls: undefined } }],
        });

        const reply = await runChatLoop([{ role: 'user', content: 'hi' }], null, callModel);

        expect(reply).toBe('Hello from CineBot');
        expect(callModel).toHaveBeenCalledTimes(1);
    });

    it('executes a search_movies tool call and feeds the result back to the model', async () => {
        await Movie.create({ imdbID: 'tt1', title: 'Dune', year: '2021', genre: 'Sci-Fi', rating: '8.0' });

        const callModel = vi
            .fn()
            .mockResolvedValueOnce({
                choices: [{
                    message: {
                        role: 'assistant',
                        tool_calls: [{
                            id: 'call_1',
                            type: 'function',
                            function: { name: 'search_movies', arguments: JSON.stringify({ title: 'Dune' }) },
                        }],
                    },
                }],
            })
            .mockResolvedValueOnce({
                choices: [{ message: { content: 'Dune (2021) is a great sci-fi pick.', tool_calls: undefined } }],
            });

        const reply = await runChatLoop([{ role: 'user', content: 'tell me about Dune' }], null, callModel);

        expect(reply).toBe('Dune (2021) is a great sci-fi pick.');
        expect(callModel).toHaveBeenCalledTimes(2);

        const secondCallConversation = callModel.mock.calls[1][0];
        const toolResultMessage = secondCallConversation.find((m) => m.role === 'tool');
        expect(JSON.parse(toolResultMessage.content)[0].title).toBe('Dune');
    });

    it('includes movieContext in the system prompt when provided', async () => {
        const callModel = vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'ok', tool_calls: undefined } }],
        });

        await runChatLoop(
            [{ role: 'user', content: 'what is this movie about?' }],
            { title: 'Dune', year: '2021', plot: 'A duke\'s son leads desert warriors.' },
            callModel
        );

        const conversation = callModel.mock.calls[0][0];
        expect(conversation[0].role).toBe('system');
        expect(conversation[0].content).toContain('Dune');
        expect(conversation[0].content).toContain('desert warriors');
    });

    it('propagates errors from the model call', async () => {
        const callModel = vi.fn().mockRejectedValue(new Error('upstream failure'));

        await expect(runChatLoop([{ role: 'user', content: 'hi' }], null, callModel)).rejects.toThrow(
            'upstream failure'
        );
    });
});

describe('runSearchMovies', () => {
    it('filters by year and sorts by rating', async () => {
        await Movie.create({ imdbID: 'tt1', title: 'A', year: '2024', rating: '9.0', discussionCount: 0 });
        await Movie.create({ imdbID: 'tt2', title: 'B', year: '2024', rating: '6.0', discussionCount: 0 });
        await Movie.create({ imdbID: 'tt3', title: 'C', year: '2023', rating: '10.0', discussionCount: 0 });

        const results = await runSearchMovies({ year: '2024', sort: 'rating', limit: 5 });

        expect(results.map((m) => m.title)).toEqual(['A', 'B']);
    });

    it('caps the limit at 10', async () => {
        const docs = Array.from({ length: 15 }, (_, i) => ({
            imdbID: `tt${i}`,
            title: `Movie ${i}`,
            year: '2024',
        }));
        await Movie.insertMany(docs);

        const results = await runSearchMovies({ year: '2024', limit: 50 });

        expect(results).toHaveLength(10);
    });
});
