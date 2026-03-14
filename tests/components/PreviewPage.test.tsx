import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PreviewPage from '@/app/[slug]/preview/page';
import { DEFAULT_SECTION_ORDER } from '@/lib/types/wedding-site';

// Mock templates
vi.mock('@/templates/classic/Template', () => ({
  default: ({ site, isPreview }: any) => (
    <div data-testid="classic-template" data-preview={isPreview}>
      {site.partner1Name}
    </div>
  ),
}));

vi.mock('@/templates/modern/Template', () => ({
  default: ({ site, isPreview }: any) => (
    <div data-testid="modern-template" data-preview={isPreview}>
      {site.partner1Name}
    </div>
  ),
}));

describe('PreviewPage', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    postMessageSpy = vi.spyOn(window.parent, 'postMessage');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    render(<PreviewPage />);
    expect(screen.getByText('Loading real-time preview...')).toBeInTheDocument();
  });

  it('sends PREVIEW_READY message on mount', () => {
    render(<PreviewPage />);
    expect(postMessageSpy).toHaveBeenCalledWith({ type: 'PREVIEW_READY' }, '*');
  });

  it('renders classic template when site has classic layout', () => {
    render(<PreviewPage />);

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'UPDATE_SITE',
          site: {
            layoutId: 'classic',
            partner1Name: 'Alice',
            templateId: 'classic-cream',
            sectionOrder: DEFAULT_SECTION_ORDER,
            scheduleItems: [],
            galleryImages: [],
            exploreGroups: [],
            accommodations: [],
            contactEntries: [],
            menuItems: [],
            eventDays: [],
          },
        },
      }));
    });

    expect(screen.getByTestId('classic-template')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders modern template when site has modern layout', () => {
    render(<PreviewPage />);

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'UPDATE_SITE',
          site: {
            layoutId: 'modern',
            partner1Name: 'Bob',
            templateId: 'modern-dark',
            sectionOrder: DEFAULT_SECTION_ORDER,
            scheduleItems: [],
            galleryImages: [],
            exploreGroups: [],
            accommodations: [],
            contactEntries: [],
            menuItems: [],
            eventDays: [],
          },
        },
      }));
    });

    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
  });

  it('passes isPreview prop to template', () => {
    render(<PreviewPage />);

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'UPDATE_SITE',
          site: {
            layoutId: 'classic',
            partner1Name: 'Test',
            templateId: 'classic-cream',
            sectionOrder: DEFAULT_SECTION_ORDER,
            scheduleItems: [],
            galleryImages: [],
            exploreGroups: [],
            accommodations: [],
            contactEntries: [],
            menuItems: [],
            eventDays: [],
          },
        },
      }));
    });

    expect(screen.getByTestId('classic-template')).toHaveAttribute('data-preview', 'true');
  });

  it('ignores non-UPDATE_SITE messages', () => {
    render(<PreviewPage />);

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'SOME_OTHER_MESSAGE' },
      }));
    });

    expect(screen.getByText('Loading real-time preview...')).toBeInTheDocument();
  });

  it('cleans up event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<PreviewPage />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
