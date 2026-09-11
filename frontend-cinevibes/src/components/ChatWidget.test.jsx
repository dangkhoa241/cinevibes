import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ChatWidget from './ChatWidget';
import api from '../api/client';

vi.mock('../api/client', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.get.mockRejectedValue(new Error('not on a movie page'));
});

const openChat = async (user) => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <ChatWidget />
        </MemoryRouter>
    );
    await user.click(screen.getByLabelText('Open CineBot chat'));
};

describe('ChatWidget', () => {
    it('sends the typed message to /api/chat and shows the reply', async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValue({ data: { reply: 'Try Inception, it is great.' } });

        await openChat(user);
        await user.type(screen.getByPlaceholderText('Ask CineBot...'), 'recommend a movie');
        await user.click(screen.getByRole('button', { name: 'Send' }));

        expect(await screen.findByText('Try Inception, it is great.')).toBeInTheDocument();
        expect(api.post).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
            messages: [{ role: 'user', content: 'recommend a movie' }],
        }));
    });

    it('renders a [Title](/movie/id) reply as a clickable link to the movie page', async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValue({
            data: { reply: 'I recommend [Inception](/movie/tt1375666) - a great sci-fi pick.' },
        });

        await openChat(user);
        await user.type(screen.getByPlaceholderText('Ask CineBot...'), 'recommend a movie');
        await user.click(screen.getByRole('button', { name: 'Send' }));

        const link = await screen.findByRole('link', { name: 'Inception' });
        expect(link).toHaveAttribute('href', '/movie/tt1375666');
        expect(screen.getByText(/a great sci-fi pick/)).toBeInTheDocument();
    });

    it('still renders a link when the model adds a stray space after the opening paren', async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValue({
            data: { reply: '1. [Husbands in Action]( /movie/tt36876775) - Action/Comedy/Crime' },
        });

        await openChat(user);
        await user.type(screen.getByPlaceholderText('Ask CineBot...'), 'recommend a movie');
        await user.click(screen.getByRole('button', { name: 'Send' }));

        const link = await screen.findByRole('link', { name: 'Husbands in Action' });
        expect(link).toHaveAttribute('href', '/movie/tt36876775');
    });

    it('closes the chat panel when a movie link is clicked', async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValue({
            data: { reply: 'See [Inception](/movie/tt1375666).' },
        });

        await openChat(user);
        await user.type(screen.getByPlaceholderText('Ask CineBot...'), 'recommend a movie');
        await user.click(screen.getByRole('button', { name: 'Send' }));

        const link = await screen.findByRole('link', { name: 'Inception' });
        await user.click(link);

        await waitFor(() => {
            expect(screen.getByLabelText('Open CineBot chat')).toBeInTheDocument();
        });
    });
});
