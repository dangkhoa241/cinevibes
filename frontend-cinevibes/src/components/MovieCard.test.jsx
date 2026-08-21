import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieCard from './MovieCard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
    mockNavigate.mockReset();
});

const renderCard = (movie) => render(
    <MemoryRouter>
        <MovieCard movie={movie} />
    </MemoryRouter>
);

describe('MovieCard', () => {
    it('renders the title, year, and rating', () => {
        renderCard({ imdbID: 'tt1', title: 'Inception', year: '2010', rating: '8.8', poster: 'http://x/poster.jpg' });

        expect(screen.getByText('Inception')).toBeInTheDocument();
        expect(screen.getByText(/2010/)).toBeInTheDocument();
        expect(screen.getByText(/8.8/)).toBeInTheDocument();
    });

    it('navigates to the movie detail page on click', () => {
        renderCard({ imdbID: 'tt1', title: 'Inception', year: '2010', rating: '8.8' });

        fireEvent.click(screen.getByText('Inception'));

        expect(mockNavigate).toHaveBeenCalledWith('/movie/tt1');
    });

    it('falls back to a placeholder image when poster is missing', () => {
        renderCard({ imdbID: 'tt1', title: 'No Poster', year: '2010', rating: 'N/A', poster: 'N/A' });

        expect(screen.getByAltText('No Poster').src).toContain('placeholder.com');
    });

    it('falls back to a placeholder image when the poster fails to load', () => {
        renderCard({ imdbID: 'tt1', title: 'Broken Poster', year: '2010', rating: 'N/A', poster: 'http://x/broken.jpg' });

        const img = screen.getByAltText('Broken Poster');
        fireEvent.error(img);

        expect(img.src).toContain('placeholder.com');
    });
});
