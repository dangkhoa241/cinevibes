import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer', () => {
    it('links the logo and Home nav item back to the homepage', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByText('CineVibes').closest('a')).toHaveAttribute('href', '/');
        expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    });

    it('shows the current year in the copyright line', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
    });
});
