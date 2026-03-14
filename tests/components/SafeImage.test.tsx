import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SafeImage from '@/components/SafeImage';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ onError, ...props }: any) => (
    <img
      {...props}
      data-testid="next-image"
      onError={onError}
    />
  ),
}));

describe('SafeImage', () => {
  it('renders the actual image when src is provided', () => {
    render(<SafeImage src="/photo.jpg" alt="Test photo" width={400} height={300} />);
    const img = screen.getByTestId('next-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Test photo');
  });

  it('renders placeholder when src is empty string', () => {
    render(<SafeImage src="" alt="Missing photo" width={400} height={300} />);
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    expect(screen.getByText('Missing photo')).toBeInTheDocument();
  });

  it('renders placeholder with default text when alt is empty', () => {
    render(<SafeImage src="" alt="" width={400} height={300} />);
    expect(screen.getByText('Photo coming soon')).toBeInTheDocument();
  });

  it('shows placeholder on image error', () => {
    render(<SafeImage src="/broken.jpg" alt="Broken image" width={400} height={300} />);

    const img = screen.getByTestId('next-image');
    fireEvent.error(img);

    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    expect(screen.getByText('Broken image')).toBeInTheDocument();
  });

  it('passes className to the image element', () => {
    render(<SafeImage src="/photo.jpg" alt="Test" width={400} height={300} className="custom-class" />);
    const img = screen.getByTestId('next-image');
    expect(img).toHaveClass('custom-class');
  });

  it('passes className to placeholder when src is empty', () => {
    const { container } = render(
      <SafeImage src="" alt="Test" width={400} height={300} className="placeholder-class" />
    );
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder.className).toContain('placeholder-class');
  });

  it('applies fill positioning styles to placeholder', () => {
    const { container } = render(
      <SafeImage src="" alt="Test" fill />
    );
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder.style.position).toBe('absolute');
    expect(placeholder.style.inset).toBe('0px');
  });

  it('applies aspect ratio for non-fill images in placeholder', () => {
    const { container } = render(
      <SafeImage src="" alt="Test" width={800} height={600} />
    );
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder.style.aspectRatio).toBe('800/600');
  });
});
