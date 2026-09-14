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

describe('POST /api/login', () => {
    it('includes the user id, so the frontend can tell which comments it has liked', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'reviewer', password: 'secret123' });

        expect(res.body.id).toBeDefined();
    });
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
        expect(res.body.isSpoiler).toBe(false);
    });

    it('saves a comment marked as a spoiler', async () => {
        const res = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'He was dead the whole time!', category: 'normal', isSpoiler: true });

        expect(res.status).toBe(201);
        expect(res.body.isSpoiler).toBe(true);
    });
});

describe('POST /api/movies/:id/comments/:commentId/like', () => {
    it('rejects a like request with no auth token', async () => {
        const posted = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Great movie!', category: 'normal' });

        const res = await request(app).post(`/api/movies/tt1/comments/${posted.body._id}/like`);

        expect(res.status).toBe(401);
    });

    it('returns 404 for a comment that does not exist', async () => {
        const res = await request(app)
            .post('/api/movies/tt1/comments/000000000000000000000000/like')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    it('likes a comment, then unliking it removes the like', async () => {
        const posted = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Great movie!', category: 'normal' });

        const likeRes = await request(app)
            .post(`/api/movies/tt1/comments/${posted.body._id}/like`)
            .set('Authorization', `Bearer ${token}`);

        expect(likeRes.status).toBe(200);
        expect(likeRes.body).toEqual({ likeCount: 1, liked: true });

        const unlikeRes = await request(app)
            .post(`/api/movies/tt1/comments/${posted.body._id}/like`)
            .set('Authorization', `Bearer ${token}`);

        expect(unlikeRes.body).toEqual({ likeCount: 0, liked: false });
    });

    it('does not double-count a like from the same user liking twice in a row without unliking', async () => {
        const posted = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Great movie!', category: 'normal' });

        await request(app)
            .post(`/api/movies/tt1/comments/${posted.body._id}/like`)
            .set('Authorization', `Bearer ${token}`);

        // A second like from the SAME user toggles it off (unlike), not a second like.
        const secondCall = await request(app)
            .post(`/api/movies/tt1/comments/${posted.body._id}/like`)
            .set('Authorization', `Bearer ${token}`);

        expect(secondCall.body.likeCount).toBe(0);
    });
});

describe('PUT /api/movies/:id/comments/:commentId', () => {
    it('lets the author edit their own comment', async () => {
        const posted = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Original text', category: 'normal' });

        const res = await request(app)
            .put(`/api/movies/tt1/comments/${posted.body._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Edited text' });

        expect(res.status).toBe(200);
        expect(res.body.content).toBe('Edited text');
    });

    it('rejects editing someone else\'s comment', async () => {
        const posted = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Original text', category: 'normal' });

        await request(app).post('/api/users').send({ username: 'other', name: 'Other', password: 'secret123' });
        const otherLogin = await request(app).post('/api/login').send({ username: 'other', password: 'secret123' });

        const res = await request(app)
            .put(`/api/movies/tt1/comments/${posted.body._id}`)
            .set('Authorization', `Bearer ${otherLogin.body.token}`)
            .send({ content: 'Hijacked!' });

        expect(res.status).toBe(403);
    });
});

describe('DELETE /api/movies/:id/comments/:commentId', () => {
    it('lets the author delete their own comment', async () => {
        const posted = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Delete me', category: 'normal' });

        const res = await request(app)
            .delete(`/api/movies/tt1/comments/${posted.body._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(204);

        const remaining = await request(app).get('/api/movies/tt1/comments?category=normal');
        expect(remaining.body).toHaveLength(0);
    });

    it('rejects deleting someone else\'s comment', async () => {
        const posted = await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Not yours', category: 'normal' });

        await request(app).post('/api/users').send({ username: 'other', name: 'Other', password: 'secret123' });
        const otherLogin = await request(app).post('/api/login').send({ username: 'other', password: 'secret123' });

        const res = await request(app)
            .delete(`/api/movies/tt1/comments/${posted.body._id}`)
            .set('Authorization', `Bearer ${otherLogin.body.token}`);

        expect(res.status).toBe(403);
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

    it('returns newest comments first, with the author username populated', async () => {
        await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'First comment', category: 'normal' });

        await request(app)
            .post('/api/movies/tt1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Second comment', category: 'normal' });

        const res = await request(app).get('/api/movies/tt1/comments?category=normal');

        expect(res.body.map((c) => c.content)).toEqual(['Second comment', 'First comment']);
        expect(res.body[0].user.username).toBe('reviewer');
    });
});
