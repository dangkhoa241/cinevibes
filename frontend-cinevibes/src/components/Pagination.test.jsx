import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
    it('renders nothing when there is only one page', () => {
        const { container } = render(<Pagination page={1} totalPages={1} setPage={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('disables Prev on the first page and Next on the last page', () => {
        render(<Pagination page={1} totalPages={3} setPage={vi.fn()} />);
        expect(screen.getByText('Prev')).toBeDisabled();
        expect(screen.getByText('Next')).not.toBeDisabled();
    });

    it('calls setPage with the next page number when Next is clicked', async () => {
        const setPage = vi.fn();
        const user = userEvent.setup();
        render(<Pagination page={2} totalPages={5} setPage={setPage} />);

        await user.click(screen.getByText('Next'));

        expect(setPage).toHaveBeenCalledWith(3);
    });

    it('calls setPage with the clicked page number', async () => {
        const setPage = vi.fn();
        const user = userEvent.setup();
        render(<Pagination page={1} totalPages={5} setPage={setPage} />);

        await user.click(screen.getByText('3'));

        expect(setPage).toHaveBeenCalledWith(3);
    });

    it('shows a jump to the last page when far from it', () => {
        render(<Pagination page={1} totalPages={20} setPage={vi.fn()} />);
        expect(screen.getByText('20')).toBeInTheDocument();
    });
});
