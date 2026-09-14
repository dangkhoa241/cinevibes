import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MovieDetail from './MovieDetails';
import api from '../api/client';

vi.mock('../api/client', () => ({
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const movie = {
    imdbID: 'tt1', title: 'Inception', director: 'Christopher Nolan',
    actors: 'Leonardo DiCaprio', rating: '8.8', plot: 'A thief who steals dreams.',
};

const makeComment = (overrides = {}) => ({
    _id: 'c1', content: 'Great movie!', category: 'normal', isSpoiler: false,
    createdAt: new Date().toISOString(), user: { id: 'u1', username: 'alice' }, likedBy: [], ...overrides,
});

// A tiny in-memory "server": api.get reads from `store`, and the mutation
// mocks (post/put/delete) update it in place, so refetch-after-mutation -
// the real behavior of the component - is exercised end to end rather than
// asserting on the raw mutation response.
let store;

const setupApi = (initialComments = [makeComment()]) => {
    store = initialComments;

    api.get.mockImplementation((url) => {
        if (url === '/api/movies/tt1') return Promise.resolve({ data: movie });
        if (url.includes('category=normal')) return Promise.resolve({ data: store });
        return Promise.resolve({ data: [] });
    });

    api.post.mockImplementation((url) => {
        if (url.endsWith('/like')) {
            const commentId = url.split('/').at(-2);
            store = store.map((c) => {
                if (c._id !== commentId) return c;
                const liked = c.likedBy.includes('u1');
                return { ...c, likedBy: liked ? c.likedBy.filter((u) => u !== 'u1') : [...c.likedBy, 'u1'] };
            });
            const updated = store.find((c) => c._id === commentId);
            return Promise.resolve({ data: { likeCount: updated.likedBy.length, liked: updated.likedBy.includes('u1') } });
        }
        return Promise.resolve({ data: {} });
    });

    api.put.mockImplementation((url, body) => {
        const commentId = url.split('/').at(-1);
        store = store.map((c) => (c._id === commentId ? { ...c, ...body } : c));
        return Promise.resolve({ data: store.find((c) => c._id === commentId) });
    });

    api.delete.mockImplementation((url) => {
        const commentId = url.split('/').at(-1);
        store = store.filter((c) => c._id !== commentId);
        return Promise.resolve({});
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
    api.put.mockReset();
    api.delete.mockReset();
});

describe('MovieDetail comment likes', () => {
    it('shows the like count for each comment', async () => {
        setupApi([makeComment({ likedBy: ['u1', 'u2'] })]);
        renderPage();

        expect(await screen.findByRole('button', { name: 'Unlike comment' })).toHaveTextContent('2');
    });

    it('shows as not-liked when the current user has not liked it', async () => {
        setupApi([makeComment({ likedBy: ['u2'] })]);
        renderPage();

        expect(await screen.findByRole('button', { name: 'Like comment' })).toHaveTextContent('1');
    });

    it('liking a comment persists and reflects in a refetch', async () => {
        const user = userEvent.setup();
        setupApi([makeComment({ likedBy: [] })]);
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
        setupApi([makeComment({ likedBy: ['u1'] })]);
        renderPage();

        const button = await screen.findByRole('button', { name: 'Unlike comment' });
        await user.click(button);

        expect(await screen.findByRole('button', { name: 'Like comment' })).toHaveTextContent('0');
    });

    it('tells a logged-out user to login instead of liking', async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        setupApi([makeComment()]);
        renderPage(null);

        const button = await screen.findByRole('button', { name: 'Like comment' });
        await user.click(button);

        expect(alertSpy).toHaveBeenCalledWith('Please login to like a comment.');
        expect(api.post).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });
});

describe('MovieDetail comment edit/delete', () => {
    it('shows Edit and Delete for the comment owner', async () => {
        setupApi([makeComment({ user: { id: 'u1', username: 'alice' } })]);
        renderPage({ id: 'u1', token: 'tok', username: 'alice' });

        expect(await screen.findByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('does not show Edit/Delete for someone else\'s comment', async () => {
        setupApi([makeComment({ user: { id: 'someone-else', username: 'bob' } })]);
        renderPage({ id: 'u1', token: 'tok', username: 'alice' });

        await screen.findByText('Great movie!');
        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    });

    it('editing a comment sends the update and shows the new content', async () => {
        const user = userEvent.setup();
        setupApi([makeComment({ user: { id: 'u1', username: 'alice' } })]);
        renderPage({ id: 'u1', token: 'tok', username: 'alice' });

        await user.click(await screen.findByRole('button', { name: 'Edit' }));
        const textarea = screen.getByDisplayValue('Great movie!');
        await user.clear(textarea);
        await user.type(textarea, 'Edited!');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(api.put).toHaveBeenCalledWith(
            '/api/movies/tt1/comments/c1',
            { content: 'Edited!', isSpoiler: false },
            expect.objectContaining({ headers: { Authorization: 'Bearer tok' } })
        );
        expect(await screen.findByText('Edited!')).toBeInTheDocument();
    });

    it('deleting a comment asks for confirmation, then removes it', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        setupApi([makeComment({ user: { id: 'u1', username: 'alice' } })]);
        renderPage({ id: 'u1', token: 'tok', username: 'alice' });

        await user.click(await screen.findByRole('button', { name: 'Delete' }));

        expect(confirmSpy).toHaveBeenCalled();
        expect(api.delete).toHaveBeenCalledWith(
            '/api/movies/tt1/comments/c1',
            expect.objectContaining({ headers: { Authorization: 'Bearer tok' } })
        );
        await waitFor(() => expect(screen.queryByText('Great movie!')).not.toBeInTheDocument());
        confirmSpy.mockRestore();
    });

    it('does not delete when the confirmation is dismissed', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        setupApi([makeComment({ user: { id: 'u1', username: 'alice' } })]);
        renderPage({ id: 'u1', token: 'tok', username: 'alice' });

        await user.click(await screen.findByRole('button', { name: 'Delete' }));

        expect(api.delete).not.toHaveBeenCalled();
        expect(screen.getByText('Great movie!')).toBeInTheDocument();
        confirmSpy.mockRestore();
    });
});
