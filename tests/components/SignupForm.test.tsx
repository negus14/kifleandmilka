import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignupForm from '@/app/signup/SignupForm';

// Mock react useActionState
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn().mockReturnValue([null, vi.fn(), false]),
  };
});

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('SignupForm', () => {
  const mockAction = vi.fn();

  it('renders the signup form with correct fields', () => {
    render(<SignupForm action={mockAction} />);

    expect(screen.getByText('Create your site')).toBeInTheDocument();
    expect(screen.getByText('Choose a URL and password to get started')).toBeInTheDocument();
    expect(screen.getByLabelText('Desired Site URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Create Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create My Site' })).toBeInTheDocument();
  });

  it('shows the domain prefix', () => {
    render(<SignupForm action={mockAction} />);
    expect(screen.getByText('ithinkshewifey.com/')).toBeInTheDocument();
  });

  it('renders slug input with correct attributes', () => {
    render(<SignupForm action={mockAction} />);

    const slugInput = screen.getByLabelText('Desired Site URL');
    expect(slugInput).toHaveAttribute('name', 'slug');
    expect(slugInput).toHaveAttribute('type', 'text');
    expect(slugInput).toHaveAttribute('required');
    expect(slugInput).toHaveAttribute('placeholder', 'adamandeve');
  });

  it('renders password input with correct attributes', () => {
    render(<SignupForm action={mockAction} />);

    const passwordInput = screen.getByLabelText('Create Password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('displays error message when state has error', async () => {
    const { useActionState } = await import('react');
    vi.mocked(useActionState).mockReturnValue([{ error: 'This site URL is already taken.' }, vi.fn(), false]);

    render(<SignupForm action={mockAction} />);
    expect(screen.getByText('This site URL is already taken.')).toBeInTheDocument();
  });

  it('shows loading state when pending', async () => {
    const { useActionState } = await import('react');
    vi.mocked(useActionState).mockReturnValue([null, vi.fn(), true]);

    render(<SignupForm action={mockAction} />);

    const button = screen.getByRole('button', { name: 'Creating...' });
    expect(button).toBeDisabled();
  });

  it('has a link to login page', () => {
    render(<SignupForm action={mockAction} />);

    const loginLink = screen.getByText('Log In');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows "Already have a site?" text', () => {
    render(<SignupForm action={mockAction} />);
    expect(screen.getByText(/Already have a site/)).toBeInTheDocument();
  });
});
