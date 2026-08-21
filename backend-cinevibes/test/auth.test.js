import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('POST /api/users (signup)', () => {
    it('creates a user with a valid username and password', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ username: 'alice', name: 'Alice', password: 'secret123' });

        expect(res.status).toBe(201);
        expect(res.body.username).toBe('alice');
        expect(res.body.passwordHash).toBeUndefined();
        expect(res.body.id).toBeDefined();
    });

    it('rejects a password shorter than 3 characters', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ username: 'alice', name: 'Alice', password: 'ab' });

        expect(res.status).toBe(400);
    });

    it('rejects a username shorter than 3 characters', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ username: 'ab', name: 'Alice', password: 'secret123' });

        expect(res.status).toBe(400);
    });

    it('rejects a duplicate username', async () => {
        await request(app)
            .post('/api/users')
            .send({ username: 'alice', name: 'Alice', password: 'secret123' });

        const res = await request(app)
            .post('/api/users')
            .send({ username: 'alice', name: 'Alice Two', password: 'secret456' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/unique/i);
    });
});

describe('POST /api/login', () => {
    beforeEach(async () => {
        await request(app)
            .post('/api/users')
            .send({ username: 'alice', name: 'Alice', password: 'secret123' });
    });

    it('logs in with correct credentials and returns a token', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'alice', password: 'secret123' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.username).toBe('alice');
    });

    it('rejects an incorrect password', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'alice', password: 'wrong-password' });

        expect(res.status).toBe(401);
    });

    it('rejects a nonexistent username', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'nobody', password: 'secret123' });

        expect(res.status).toBe(401);
    });
});
