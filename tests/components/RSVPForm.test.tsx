import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RSVPForm from '@/components/RSVPForm';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('RSVPForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial form fields correctly', () => {
    render(<RSVPForm slug="test-wedding" />);

    // Check for main email and message fields
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();

    // Check for default guest fields
    expect(screen.getByPlaceholderText(/Guest full name/i)).toBeInTheDocument();
    
    // Check meal options exist (default options)
    expect(screen.getByRole('option', { name: /Chicken/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Beef/i })).toBeInTheDocument();
  });

  it('allows adding and removing guests', async () => {
    render(<RSVPForm slug="test-wedding" />);
    const user = userEvent.setup();

    // Initially one guest input
    expect(screen.getAllByPlaceholderText(/Guest full name/i)).toHaveLength(1);

    // Click "Add Guest"
    const addButton = screen.getByRole('button', { name: /\+ Add Partner \/ Family Member/i });
    await user.click(addButton);

    // Should now be two guest inputs
    expect(screen.getAllByPlaceholderText(/Guest full name/i)).toHaveLength(2);

    // Remove the second guest
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    expect(removeButtons).toHaveLength(2); // One for each guest
    await user.click(removeButtons[1]);

    // Back to one guest
    expect(screen.getAllByPlaceholderText(/Guest full name/i)).toHaveLength(1);
  });

  it('submits the form data to the API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RSVPForm slug="test-wedding" />);
    const user = userEvent.setup();

    // Fill out the form
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/Guest full name/i), 'John Doe');
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Chicken');
    
    // Check Halal
    const halalCheckbox = screen.getByLabelText(/Halal/i);
    await user.click(halalCheckbox);

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit RSVP/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'test-wedding',
          email: 'test@example.com',
          message: '',
          guests: [
            {
              name: 'John Doe',
              attending: true,
              mealChoice: 'Chicken',
              isHalal: true,
            },
          ],
        }),
      });
    }, { timeout: 10000 });

    // Check success state
    expect(await screen.findByText(/Thank You!/i)).toBeInTheDocument();
    expect(await screen.findByText(/Your RSVP has been received/i)).toBeInTheDocument();
  }, 10000);

  it('displays an error message when submission fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Database error' }),
    });

    render(<RSVPForm slug="test-wedding" />);
    const user = userEvent.setup();

    // Submit without filling correctly, or just submit
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/Guest full name/i), 'Jane Doe');
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Beef');

    const submitButton = screen.getByRole('button', { name: /Submit RSVP/i });
    await user.click(submitButton);

    expect(await screen.findByText(/Database error/i)).toBeInTheDocument();
  }, 10000);
});
