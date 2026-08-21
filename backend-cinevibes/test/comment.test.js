import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';

let token;

beforeEach(async () => {
    await request(app)
        .post('/api/users')
        .send({ username: 'reviewer', name: 'Reviewer', password: 'secret123' });

    const loginRes = await request(app)
        .post('/api/login')
        .send({ username: 'reviewer', password: 'secret123' });

    token = loginRes.body.token;
});

describe('POST /api/movies/:id/comments', () => {
    it('rejects a request with no auth token', async () => {
        const res = await request(app)
            .post('/api/movies/tt1/comments')
            .send({ content: 'Great movie!', category: 'normal' });

        expect(res.status).toBe(401);
    });

    it('saves a comment for an authenticated user', async () => {
        const res = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Great movie!', category: 'technical' });

        expect(res.status).toBe(201);
        expect(res.body.content).toBe('Great movie!');
        expect(res.body.category).toBe('technical');
        expect(res.body.movieId).toBe('tt1');
    });
});

describe('GET /api/movies/:id/comments', () => {
    it('only returns comments for the requested category', async () => {
        await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Normal comment', category: 'normal' });

        await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Technical comment', category: 'technical' });

        const res = await request(app).get('/api/movies/tt1/comments?category=normal');

        expect(res.body).toHaveLength(1);
        expect(res.body[0].content).toBe('Normal comment');
    });
});
