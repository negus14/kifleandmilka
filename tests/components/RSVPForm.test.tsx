import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RSVPForm from '@/components/RSVPForm';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock CountryCodePicker to simplify tests
vi.mock('@/components/CountryCodePicker', () => ({
  default: ({ value, onChange }: any) => (
    <select data-testid="country-picker" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="+44">+44</option>
      <option value="+1">+1</option>
    </select>
  ),
  matchCountry: () => null,
}));

describe('RSVPForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial form fields correctly', () => {
    render(<RSVPForm slug="test-wedding" />);

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Guest full name/i)).toBeInTheDocument();

    // Default meal options
    expect(screen.getByRole('option', { name: /Chicken/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Beef/i })).toBeInTheDocument();
  });

  it('allows adding and removing guests', async () => {
    render(<RSVPForm slug="test-wedding" />);
    const user = userEvent.setup();

    expect(screen.getAllByPlaceholderText(/Guest full name/i)).toHaveLength(1);

    const addButton = screen.getByRole('button', { name: /\+ Add Partner \/ Family Member/i });
    await user.click(addButton);

    expect(screen.getAllByPlaceholderText(/Guest full name/i)).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    expect(removeButtons).toHaveLength(2);
    await user.click(removeButtons[1]);

    expect(screen.getAllByPlaceholderText(/Guest full name/i)).toHaveLength(1);
  });

  it('submits the form data to the API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RSVPForm slug="test-wedding" />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/Guest full name/i), 'John Doe');

    // Select meal (the second combobox — first is attending)
    const selects = screen.getAllByRole('combobox');
    // Find the meal select (has "Select a meal..." option)
    const mealSelect = selects.find(s => {
      const options = s.querySelectorAll('option');
      return Array.from(options).some(o => o.textContent?.includes('Select a meal'));
    });
    if (mealSelect) {
      await user.selectOptions(mealSelect, 'Chicken');
    }

    const submitButton = screen.getByRole('button', { name: /Submit RSVP/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/rsvp');
      expect(options.method).toBe('POST');

      const body = JSON.parse(options.body);
      expect(body.slug).toBe('test-wedding');
      expect(body.email).toBe('test@example.com');
      expect(body.guests[0].name).toBe('John Doe');
      expect(body.guests[0].attending).toBe(true);
      expect(body.guests[0].mealChoice).toBe('Chicken');
    }, { timeout: 10000 });

    // Check success state
    expect(await screen.findByText(/Thank You!/i)).toBeInTheDocument();
  }, 15000);

  it('displays an error message when submission fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Database error' }),
    });

    render(<RSVPForm slug="test-wedding" />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/Guest full name/i), 'Jane Doe');

    const selects = screen.getAllByRole('combobox');
    const mealSelect = selects.find(s => {
      const options = s.querySelectorAll('option');
      return Array.from(options).some(o => o.textContent?.includes('Select a meal'));
    });
    if (mealSelect) {
      await user.selectOptions(mealSelect, 'Beef');
    }

    const submitButton = screen.getByRole('button', { name: /Submit RSVP/i });
    await user.click(submitButton);

    expect(await screen.findByText(/Database error/i)).toBeInTheDocument();
  }, 15000);

  it('uses custom meal options when provided', () => {
    render(<RSVPForm slug="test-wedding" mealOptions={['Pasta', 'Salad', 'Steak']} />);

    expect(screen.getByRole('option', { name: 'Pasta' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Salad' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Steak' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Chicken' })).not.toBeInTheDocument();
  });
});
