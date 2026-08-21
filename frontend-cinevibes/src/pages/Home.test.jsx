import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import api from '../api/client';

vi.mock('../api/client', () => ({
    default: { get: vi.fn() },
}));

const movieResponse = (movies = [], overrides = {}) => ({
    data: { movies, totalMovies: movies.length, limit: 10, ...overrides },
});

beforeEach(() => {
    api.get.mockReset();
    api.get.mockResolvedValue(movieResponse([
        { imdbID: 'tt1', title: 'Movie One', year: '2024', rating: '7.5' },
    ]));
    window.scrollTo = vi.fn();
});

const renderHome = (initialEntry = '/') => render(
    <MemoryRouter initialEntries={[initialEntry]}>
        <Home />
    </MemoryRouter>
);

describe('Home', () => {
    it('fetches page 1 of trending movies by default', async () => {
        renderHome('/');

        await waitFor(() => expect(api.get).toHaveBeenCalled());

        const url = api.get.mock.calls[0][0];
        expect(url).toContain('/api/movies/trending');
        expect(url).toContain('page=1');
        expect(url).toContain('sort=trending');
    });

    it('reads the page number from the URL instead of local state', async () => {
        renderHome('/?page=3');

        await waitFor(() => expect(api.get).toHaveBeenCalled());

        expect(api.get.mock.calls[0][0]).toContain('page=3');
    });

    it('renders movies returned from the API', async () => {
        renderHome();

        expect(await screen.findByText('Movie One')).toBeInTheDocument();
    });

    it('shows a message when no movies are found', async () => {
        api.get.mockResolvedValue(movieResponse([]));
        renderHome();

        expect(await screen.findByText(/No movies found/i)).toBeInTheDocument();
    });

    it('switches to the search endpoint and resets to page 1 when searching', async () => {
        const user = userEvent.setup();
        renderHome('/?page=2');

        await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

        await user.type(screen.getByPlaceholderText(/Search for a movie/i), 'batman');

        await waitFor(() => {
            const lastCall = api.get.mock.calls[api.get.mock.calls.length - 1][0];
            expect(lastCall).toContain('/api/movies/search');
            expect(lastCall).toContain('title=batman');
            expect(lastCall).not.toContain('page=2');
        });
    });

    it('includes the selected genre filter in the request and resets to page 1', async () => {
        const user = userEvent.setup();
        renderHome('/?page=2');

        await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

        await user.selectOptions(screen.getByText('Genre:').nextSibling, 'Comedy');

        await waitFor(() => {
            const lastCall = api.get.mock.calls[api.get.mock.calls.length - 1][0];
            expect(lastCall).toContain('genre=Comedy');
            expect(lastCall).not.toContain('page=2');
        });
    });
});
