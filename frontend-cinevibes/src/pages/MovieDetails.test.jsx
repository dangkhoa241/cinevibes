import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MovieDetail from './MovieDetails';
import api from '../api/client';

vi.mock('../api/client', () => ({
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const movie = {
    imdbID: 'tt1', title: 'Inception', year: '2010', poster: 'poster.jpg',
    director: 'Christopher Nolan', actors: 'Leo', rating: '8.8', plot: 'A dream.', genre: 'Sci-Fi',
};

const topLevelComment = {
    _id: 'c1', content: 'Great movie!', category: 'normal', isSpoiler: false,
    parentComment: null, likedBy: [], createdAt: new Date().toISOString(),
    user: { id: 'u2', username: 'bob' },
};

const mockGetByUrl = (comments) => (url) => {
    if (url.startsWith('/api/movies/tt1/comments')) {
        return Promise.resolve({ data: url.includes('category=normal') ? comments : [] });
    }
    return Promise.resolve({ data: movie });
};

beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    window.alert = vi.fn();
});

const renderMovieDetail = (user) => render(
    <MemoryRouter initialEntries={['/movie/tt1']}>
        <Routes>
            <Route path="/movie/:id" element={<MovieDetail user={user} />} />
        </Routes>
    </MemoryRouter>
);

describe('MovieDetail replies', () => {
    it('prompts a guest to log in instead of opening the reply form', async () => {
        api.get.mockImplementation(mockGetByUrl([topLevelComment]));
        const user = userEvent.setup();
        renderMovieDetail(null);

        await user.click(await screen.findByText('Reply'));

        expect(window.alert).toHaveBeenCalledWith('Please login to reply to a comment.');
        expect(screen.queryByPlaceholderText(/Reply to bob/)).not.toBeInTheDocument();
    });

    it('posts a reply and shows it nested under the parent comment', async () => {
        api.get.mockImplementation(mockGetByUrl([topLevelComment]));
        api.post.mockResolvedValue({ data: {} });
        const loggedInUser = { id: 'u1', username: 'alice', token: 'tok' };
        const user = userEvent.setup();

        renderMovieDetail(loggedInUser);

        await user.click(await screen.findByText('Reply'));
        await user.type(screen.getByPlaceholderText(/Reply to bob/), 'I agree!');

        // After posting, refetch comments to include the new reply.
        api.get.mockImplementation(mockGetByUrl([
            topLevelComment,
            {
                _id: 'c2', content: 'I agree!', category: 'normal', isSpoiler: false,
                parentComment: 'c1', likedBy: [], createdAt: new Date().toISOString(),
                user: { id: 'u1', username: 'alice' },
            },
        ]));

        await user.click(screen.getByText('Post Reply'));

        expect(api.post).toHaveBeenCalledWith(
            '/api/movies/tt1/comments',
            expect.objectContaining({ content: 'I agree!', parentComment: 'c1' }),
            expect.anything()
        );
        expect(await screen.findByText('I agree!')).toBeInTheDocument();
    });
});
