import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GiftContributionForm from '@/components/GiftContributionForm';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const defaultProps = {
  slug: "test-wedding",
  giftItems: [],
  currency: "GBP",
  acceptedCurrencies: ["GBP"],
  paymentOptions: [],
};

describe('GiftContributionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with default currency symbol', () => {
    render(<GiftContributionForm {...defaultProps} />);
    expect(screen.getByText('£')).toBeInTheDocument();
    expect(screen.getByText(/Amount \(GBP\)/)).toBeInTheDocument();
  });

  it('does not show currency selector with single currency', () => {
    render(<GiftContributionForm {...defaultProps} />);
    expect(screen.queryByText('Select Currency')).not.toBeInTheDocument();
  });

  it('shows currency selector when multiple currencies accepted', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        acceptedCurrencies={["GBP", "USD", "EUR"]}
      />
    );
    expect(screen.getByText('Select Currency')).toBeInTheDocument();
    expect(screen.getByText('£ GBP')).toBeInTheDocument();
    expect(screen.getByText('$ USD')).toBeInTheDocument();
    expect(screen.getByText('€ EUR')).toBeInTheDocument();
  });

  it('switches currency when a currency button is clicked', async () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        acceptedCurrencies={["GBP", "USD"]}
      />
    );
    const usdBtn = screen.getByText('$ USD');
    fireEvent.click(usdBtn);
    expect(screen.getByText(/Amount \(USD\)/)).toBeInTheDocument();
  });

  it('marks the active currency button with active class', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        acceptedCurrencies={["GBP", "ETB"]}
      />
    );
    const gbpBtn = screen.getByText('£ GBP');
    expect(gbpBtn.className).toContain('gift-contrib__currency-btn--active');
    const etbBtn = screen.getByText('Br ETB');
    expect(etbBtn.className).not.toContain('gift-contrib__currency-btn--active');
  });

  it('displays correct symbols for various currencies', () => {
    const currencies = ["GBP", "USD", "EUR", "ETB", "NGN", "INR", "JPY", "NZD"];
    render(
      <GiftContributionForm
        {...defaultProps}
        acceptedCurrencies={currencies}
      />
    );
    expect(screen.getByText('£ GBP')).toBeInTheDocument();
    expect(screen.getByText('$ USD')).toBeInTheDocument();
    expect(screen.getByText('€ EUR')).toBeInTheDocument();
    expect(screen.getByText('Br ETB')).toBeInTheDocument();
    expect(screen.getByText('₦ NGN')).toBeInTheDocument();
    expect(screen.getByText('₹ INR')).toBeInTheDocument();
    expect(screen.getByText('¥ JPY')).toBeInTheDocument();
    expect(screen.getByText('NZ$ NZD')).toBeInTheDocument();
  });

  it('falls back to currency code for unknown currencies', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        currency="XYZ"
        acceptedCurrencies={["XYZ", "GBP"]}
      />
    );
    expect(screen.getByText('XYZ XYZ')).toBeInTheDocument();
  });

  it('submits the selected currency with the form', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <GiftContributionForm
        {...defaultProps}
        acceptedCurrencies={["GBP", "ETB"]}
      />
    );

    // Switch to ETB
    fireEvent.click(screen.getByText('Br ETB'));

    // Fill form
    await userEvent.type(screen.getByPlaceholderText('Your full name'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('0'), '100');

    // Submit
    fireEvent.click(screen.getByText('Send Well Wishes'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/gift-contribution', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"currency":"ETB"'),
      }));
    });
  });

  it('shows gift items grid when items are provided', () => {
    const items = [
      { id: '1', name: 'Honeymoon Fund', description: 'Help us travel', suggestedAmount: '50' },
      { id: '2', name: 'Kitchen Set', description: '', suggestedAmount: '100' },
    ];
    render(
      <GiftContributionForm
        {...defaultProps}
        giftItems={items}
        currency="ETB"
        acceptedCurrencies={["ETB"]}
      />
    );
    expect(screen.getByText('Honeymoon Fund')).toBeInTheDocument();
    expect(screen.getByText('Br50')).toBeInTheDocument();
    expect(screen.getByText('Br100')).toBeInTheDocument();
  });
});
