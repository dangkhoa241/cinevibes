import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import api from '../api/client';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/client', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

beforeEach(() => {
    mockNavigate.mockReset();
    window.localStorage.clear();
    api.get.mockReset().mockResolvedValue({ data: [] });
    api.post.mockReset().mockResolvedValue({ data: {} });
});

const renderHeader = (props = {}) => render(
    <MemoryRouter>
        <Header user={null} setUser={vi.fn()} {...props} />
    </MemoryRouter>
);

describe('Header', () => {
    it('links the logo back to the homepage', () => {
        renderHeader();
        expect(screen.getByText('CineVibes').closest('a')).toHaveAttribute('href', '/');
    });

    it('shows a Login link when no user is signed in', () => {
        renderHeader();
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('shows a welcome message and Logout button when signed in', () => {
        renderHeader({ user: { username: 'alice' } });
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('clears the stored session and navigates home on logout', async () => {
        window.localStorage.setItem('loggedCineVibesUser', JSON.stringify({ username: 'alice' }));
        const setUser = vi.fn();
        const user = userEvent.setup();
        renderHeader({ user: { username: 'alice' }, setUser });

        await user.click(screen.getByText('Logout'));

        expect(window.localStorage.getItem('loggedCineVibesUser')).toBeNull();
        expect(setUser).toHaveBeenCalledWith(null);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to a search URL when a query is submitted', async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(screen.getByLabelText('Search'));
        await user.type(screen.getByPlaceholderText('Search movies...'), 'batman');
        await user.keyboard('{Enter}');

        expect(mockNavigate).toHaveBeenCalledWith('/?search=batman');
    });

    it('shows an unread count badge and clears it when the dropdown is opened', async () => {
        api.get.mockResolvedValue({
            data: [
                { _id: 'n1', read: false, fromUser: { username: 'bob' }, movieId: 'tt1', createdAt: new Date().toISOString() },
            ],
        });
        const user = userEvent.setup();
        renderHeader({ user: { username: 'alice', token: 'tok' } });

        expect(await screen.findByText('1')).toBeInTheDocument();

        await user.click(screen.getByLabelText('Notifications (1 unread)'));

        expect(await screen.findByText(/bob/)).toBeInTheDocument();
        expect(api.post).toHaveBeenCalledWith(
            '/api/notifications/read',
            {},
            expect.objectContaining({ headers: { Authorization: 'Bearer tok' } })
        );
        await waitFor(() => expect(screen.queryByText('1')).not.toBeInTheDocument());
    });

    it('shows an empty state when there are no notifications', async () => {
        const user = userEvent.setup();
        renderHeader({ user: { username: 'alice', token: 'tok' } });

        await user.click(screen.getByLabelText('Notifications'));

        expect(await screen.findByText(/No notifications yet/i)).toBeInTheDocument();
    });
});
