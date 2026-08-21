import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Movie from '../models/movie.js';

const makeMovie = (overrides = {}) => ({
    imdbID: overrides.imdbID || `tt${Math.random().toString().slice(2, 10)}`,
    title: 'Untitled',
    year: '2020',
    genre: 'Drama',
    rating: '5.0',
    discussionCount: 0,
    ...overrides,
});

describe('GET /api/movies/trending', () => {
    it('breaks discussionCount ties by newest year first, not insertion order', async () => {
        await Movie.create(makeMovie({ imdbID: 'tt1', title: 'Old Movie', year: '2022' }));
        await Movie.create(makeMovie({ imdbID: 'tt2', title: 'New Movie', year: '2026' }));
        await Movie.create(makeMovie({ imdbID: 'tt3', title: 'Mid Movie', year: '2024' }));

        const res = await request(app).get('/api/movies/trending');

        expect(res.status).toBe(200);
        expect(res.body.movies.map((m) => m.title)).toEqual(['New Movie', 'Mid Movie', 'Old Movie']);
    });

    it('ranks a higher discussionCount above a newer year', async () => {
        await Movie.create(makeMovie({ imdbID: 'tt1', title: 'Popular Old', year: '2020', discussionCount: 5 }));
        await Movie.create(makeMovie({ imdbID: 'tt2', title: 'Quiet New', year: '2026', discussionCount: 0 }));

        const res = await request(app).get('/api/movies/trending');

        expect(res.body.movies[0].title).toBe('Popular Old');
    });

    it('filters by genre', async () => {
        await Movie.create(makeMovie({ imdbID: 'tt1', title: 'A Comedy', genre: 'Comedy' }));
        await Movie.create(makeMovie({ imdbID: 'tt2', title: 'A Drama', genre: 'Drama' }));

        const res = await request(app).get('/api/movies/trending?genre=Comedy');

        expect(res.body.movies).toHaveLength(1);
        expect(res.body.movies[0].title).toBe('A Comedy');
    });

    it('filters by year prefix', async () => {
        await Movie.create(makeMovie({ imdbID: 'tt1', title: '2024 Movie', year: '2024' }));
        await Movie.create(makeMovie({ imdbID: 'tt2', title: '2024 Series', year: '2024–2025' }));
        await Movie.create(makeMovie({ imdbID: 'tt3', title: '2023 Movie', year: '2023' }));

        const res = await request(app).get('/api/movies/trending?year=2024');

        expect(res.body.movies.map((m) => m.title).sort()).toEqual(['2024 Movie', '2024 Series']);
    });

    it('paginates with a fixed page size of 10', async () => {
        const docs = Array.from({ length: 15 }, (_, i) =>
            makeMovie({ imdbID: `tt${i}`, title: `Movie ${i}`, year: '2020' })
        );
        await Movie.insertMany(docs);

        const page1 = await request(app).get('/api/movies/trending?page=1');
        const page2 = await request(app).get('/api/movies/trending?page=2');

        expect(page1.body.movies).toHaveLength(10);
        expect(page2.body.movies).toHaveLength(5);
        expect(page1.body.totalMovies).toBe(15);
    });
});

describe('GET /api/movies/search', () => {
    beforeEach(async () => {
        await Movie.create(makeMovie({ imdbID: 'tt1', title: 'Batman Begins' }));
        await Movie.create(makeMovie({ imdbID: 'tt2', title: 'The Dark Knight' }));
    });

    it('matches titles case-insensitively', async () => {
        const res = await request(app).get('/api/movies/search?title=batman');

        expect(res.body.movies).toHaveLength(1);
        expect(res.body.movies[0].title).toBe('Batman Begins');
    });

    it('returns an empty list when nothing matches', async () => {
        const res = await request(app).get('/api/movies/search?title=nonexistent');

        expect(res.body.movies).toHaveLength(0);
        expect(res.body.totalMovies).toBe(0);
    });
});

describe('GET /api/movies/:id', () => {
    it('returns the movie for a known imdbID', async () => {
        await Movie.create(makeMovie({ imdbID: 'tt1', title: 'Known Movie' }));

        const res = await request(app).get('/api/movies/tt1');

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Known Movie');
    });

    it('returns 404 for an unknown imdbID', async () => {
        const res = await request(app).get('/api/movies/does-not-exist');

        expect(res.status).toBe(404);
    });
});
