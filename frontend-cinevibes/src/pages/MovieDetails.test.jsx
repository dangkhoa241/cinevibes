import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MovieDetail from './MovieDetails';
import api from '../api/client';

vi.mock('../api/client', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

const movie = {
    imdbID: 'tt1', title: 'Inception', director: 'Christopher Nolan',
    actors: 'Leonardo DiCaprio', rating: '8.8', plot: 'A thief who steals dreams.',
};

const comment = (overrides = {}) => ({
    _id: 'c1', content: 'Great movie!', category: 'normal', isSpoiler: false,
    createdAt: new Date().toISOString(), user: { username: 'alice' }, likedBy: [], ...overrides,
});

const mockGet = (comments = [comment()]) => {
    api.get.mockImplementation((url) => {
        if (url === '/api/movies/tt1') return Promise.resolve({ data: movie });
        if (url.includes('category=normal')) return Promise.resolve({ data: comments });
        return Promise.resolve({ data: [] });
    });
};

const renderPage = (user = { id: 'u1', token: 'tok', username: 'alice' }) => render(
    <MemoryRouter initialEntries={['/movie/tt1']}>
        <Routes>
            <Route path="/movie/:id" element={<MovieDetail user={user} />} />
        </Routes>
    </MemoryRouter>
);

beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
});

describe('MovieDetail comment likes', () => {
    it('shows the like count for each comment', async () => {
        mockGet([comment({ likedBy: ['u1', 'u2'] })]);
        renderPage();

        expect(await screen.findByRole('button', { name: 'Unlike comment' })).toHaveTextContent('2');
    });

    it('shows as not-liked when the current user has not liked it', async () => {
        mockGet([comment({ likedBy: ['u2'] })]);
        renderPage();

        expect(await screen.findByRole('button', { name: 'Like comment' })).toHaveTextContent('1');
    });

    it('liking a comment calls the API and updates the count optimistically from the response', async () => {
        const user = userEvent.setup();
        mockGet([comment({ likedBy: [] })]);
        api.post.mockResolvedValue({ data: { likeCount: 1, liked: true } });
        renderPage();

        const button = await screen.findByRole('button', { name: 'Like comment' });
        await user.click(button);

        expect(api.post).toHaveBeenCalledWith(
            '/api/movies/tt1/comments/c1/like',
            {},
            expect.objectContaining({ headers: { Authorization: 'Bearer tok' } })
        );
        expect(await screen.findByRole('button', { name: 'Unlike comment' })).toHaveTextContent('1');
    });

    it('unliking a previously-liked comment decrements the count', async () => {
        const user = userEvent.setup();
        mockGet([comment({ likedBy: ['u1'] })]);
        api.post.mockResolvedValue({ data: { likeCount: 0, liked: false } });
        renderPage();

        const button = await screen.findByRole('button', { name: 'Unlike comment' });
        await user.click(button);

        expect(await screen.findByRole('button', { name: 'Like comment' })).toHaveTextContent('0');
    });

    it('disables the like button for logged-out users', async () => {
        mockGet([comment()]);
        renderPage(null);

        await waitFor(() => expect(screen.getByRole('button', { name: 'Like comment' })).toBeDisabled());
    });
});
