import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '@/app/(marketing)/page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock SafeImage
vi.mock('@/components/SafeImage', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />);
    const headings = screen.getAllByText('I Think She Wifey');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(<LandingPage />);
    const howItWorks = screen.getAllByText(/How It Works/i);
    expect(howItWorks.length).toBeGreaterThan(0);
    const features = screen.getAllByText(/Features/i);
    expect(features.length).toBeGreaterThan(0);
  });

  it('renders signup CTA buttons', () => {
    render(<LandingPage />);
    const signupLinks = screen.getAllByText(/Get Started/i);
    expect(signupLinks.length).toBeGreaterThan(0);
  });

  it('renders the how-it-works section', () => {
    render(<LandingPage />);
    const howItWorks = screen.getAllByText(/how it works/i);
    expect(howItWorks.length).toBeGreaterThan(0);
  });

  it('renders login link', () => {
    render(<LandingPage />);
    const loginLinks = screen.getAllByText(/Log In/i);
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it('has links pointing to /signup', () => {
    render(<LandingPage />);
    const signupLinks = screen.getAllByRole('link').filter(
      link => link.getAttribute('href') === '/signup'
    );
    expect(signupLinks.length).toBeGreaterThan(0);
  });

  it('has links pointing to /login', () => {
    render(<LandingPage />);
    const loginLinks = screen.getAllByRole('link').filter(
      link => link.getAttribute('href') === '/login'
    );
    expect(loginLinks.length).toBeGreaterThan(0);
  });
});
