import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '@/app/login/LoginForm';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock react useActionState
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn().mockReturnValue([null, vi.fn(), false]),
  };
});

describe('LoginForm', () => {
  const mockAction = vi.fn();

  it('renders the login form with correct fields', () => {
    render(<LoginForm action={mockAction} />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Log in to edit your wedding site')).toBeInTheDocument();
    expect(screen.getByLabelText('Site Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  it('renders slug input with correct attributes', () => {
    render(<LoginForm action={mockAction} />);

    const slugInput = screen.getByLabelText('Site Name');
    expect(slugInput).toHaveAttribute('name', 'slug');
    expect(slugInput).toHaveAttribute('type', 'text');
    expect(slugInput).toHaveAttribute('required');
    expect(slugInput).toHaveAttribute('placeholder', 'e.g. adamandeve');
  });

  it('renders password input with correct attributes', () => {
    render(<LoginForm action={mockAction} />);

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('displays error message when state has error', async () => {
    const { useActionState } = await import('react');
    vi.mocked(useActionState).mockReturnValue([{ error: 'Invalid password.' }, vi.fn(), false]);

    render(<LoginForm action={mockAction} />);

    expect(screen.getByText('Invalid password.')).toBeInTheDocument();
  });

  it('shows loading state when pending', async () => {
    const { useActionState } = await import('react');
    vi.mocked(useActionState).mockReturnValue([null, vi.fn(), true]);

    render(<LoginForm action={mockAction} />);

    const button = screen.getByRole('button', { name: 'Logging in...' });
    expect(button).toBeDisabled();
  });

  it('shows logged out message when loggedOut param is true', async () => {
    const { useSearchParams } = await import('next/navigation');
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('true'),
    } as any);

    const { useActionState } = await import('react');
    vi.mocked(useActionState).mockReturnValue([null, vi.fn(), false]);

    render(<LoginForm action={mockAction} />);

    expect(screen.getByText('Logged out successfully')).toBeInTheDocument();
  });

  it('does not show logged out message when there is an error', async () => {
    const { useSearchParams } = await import('next/navigation');
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('true'),
    } as any);

    const { useActionState } = await import('react');
    vi.mocked(useActionState).mockReturnValue([{ error: 'Something went wrong' }, vi.fn(), false]);

    render(<LoginForm action={mockAction} />);

    expect(screen.queryByText('Logged out successfully')).not.toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
