import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClassicTemplate } from '@/templates/classic/Template';
import { DEFAULT_SECTION_ORDER } from '@/lib/types/wedding-site';

// Mock client components
vi.mock('@/templates/classic/WeddingSiteClient', () => ({
  default: () => <div data-testid="mock-client" />
}));

vi.mock('@/components/RSVPForm', () => ({
  default: () => <div data-testid="mock-rsvp-form" />
}));

vi.mock('@/components/SafeImage', () => ({
  default: ({ fill, priority, sizes, ...props }: any) => <img {...props} />
}));

describe('ClassicTemplate', () => {
  const mockSite: any = {
    templateId: 'classic-cream',
    layoutId: 'classic',
    fontStyleId: 'classic-serif',
    slug: 'test-wedding',
    partner1Name: 'Romeo',
    partner2Name: 'Juliet',
    heroPretext: 'Join us',
    heroTagline: 'A celebration of love',
    heroCta: 'RSVP Now',
    heroImageUrl: '/hero.jpg',
    dateDisplayText: 'December 25, 2026',
    locationText: 'Verona',
    weddingDate: '2026-12-25',
    navBrand: 'R & J',
    storyTitle: 'Our Love Story',
    storySubtitle: 'How it began',
    storyLeadQuote: 'It was meant to be',
    storyBody: ['We met in Verona.'],
    storyImageUrl: '/story.jpg',
    eventDays: [{
      id: 'day-1',
      label: 'Wedding Day',
      venues: [{ label: 'Ceremony', name: 'The Chapel', address: '123 Main St', time: '3:00 PM' }],
      infoBlocks: [],
      detailsStyle: 'grid',
    }],
    venues: [{ label: 'Ceremony', name: 'The Chapel', address: '123 Main St', time: '3:00 PM' }],
    venueInfoBlocks: [],
    weddingDays: [{
      label: 'Wedding Day',
      date: 'December 25, 2026',
      isPrivate: false,
      items: [{ hour: '3', period: 'PM', event: 'Cocktails', venue: 'The Garden', description: 'Enjoy drinks' }],
    }],
    menuItems: [{ name: 'Chicken Parm', description: 'Crispy chicken' }],
    galleryImages: [{ url: '/gallery1.jpg', alt: 'Photo 1' }],
    exploreGroups: [],
    accommodations: [
      { name: 'Grand Hotel', distance: '5 min', description: 'Luxury', bookingUrl: 'https://hotel.com' },
    ],
    letterOpening: 'Dear Friends',
    letterBody: ['We are so excited.'],
    letterClosing: 'With love',
    quoteText: 'Love is patient',
    quoteAttribution: 'Corinthians',
    rsvpHeading: 'Join Us',
    rsvpDeadlineText: 'By Nov 1',
    rsvpMealOptions: ['Chicken', 'Beef'],
    contactEntries: [{ email: 'romeo@love.com', phone: '+1234567890' }],
    contactHeading: 'Contact Us',
    footerNames: 'Romeo & Juliet',
    footerDateText: 'December 25, 2026',
    footerCopyright: '© 2026',
    sectionOrder: DEFAULT_SECTION_ORDER.map(s =>
      (s.id === 'story' || s.id === 'accommodations') ? { ...s, visible: true } : s
    ),
    giftHeading: 'Gifts',
    giftSubheading: 'Your presence is our present',
    giftPaymentLinks: [{ label: 'PayPal', url: 'https://paypal.com' }],
    giftNote: 'Thank you!',
  };

  it('renders the hero section with partner names', () => {
    render(<ClassicTemplate site={mockSite} />);
    const names = screen.getAllByText(/Romeo/);
    expect(names.length).toBeGreaterThan(0);
    expect(screen.getByText('Join us')).toBeInTheDocument();
  });

  it('renders the story section', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getAllByText('Our Love Story').length).toBeGreaterThan(0);
    expect(screen.getByText('We met in Verona.')).toBeInTheDocument();
  });

  it('renders the details section with venue info', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getAllByText('The Chapel').length).toBeGreaterThan(0);
  });

  it('renders the schedule section', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('Our Schedule')).toBeInTheDocument();
    expect(screen.getByText('Cocktails')).toBeInTheDocument();
  });

  it('renders the menu section', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('Chicken Parm')).toBeInTheDocument();
  });

  it('renders the gallery section', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('Our Gallery')).toBeInTheDocument();
  });

  it('renders the accommodations section', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
    expect(screen.getByText('Accommodations')).toBeInTheDocument();
  });

  it('renders the RSVP section with form', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByTestId('mock-rsvp-form')).toBeInTheDocument();
  });

  it('renders the gift section', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('Gifts')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
  });

  it('renders the contact section', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('romeo@love.com')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('Romeo & Juliet')).toBeInTheDocument();
    expect(screen.getByText('© 2026')).toBeInTheDocument();
  });

  it('does not render hidden sections', () => {
    const siteWithHiddenSchedule = {
      ...mockSite,
      sectionOrder: DEFAULT_SECTION_ORDER.map(s =>
        s.id === 'schedule' ? { ...s, visible: false } : s
      ),
    };
    render(<ClassicTemplate site={siteWithHiddenSchedule} />);
    expect(screen.queryByText('Our Schedule')).not.toBeInTheDocument();
  });

  it('does not render gallery section when no images', () => {
    render(<ClassicTemplate site={{ ...mockSite, galleryImages: [] }} />);
    expect(screen.queryByText('Our Gallery')).not.toBeInTheDocument();
  });

  it('does not render gift section when no gift heading', () => {
    render(<ClassicTemplate site={{ ...mockSite, giftHeading: '' }} />);
    expect(screen.queryByText('Choose a Gift Method')).not.toBeInTheDocument();
  });

  it('applies preview class when isPreview is true', () => {
    const { container } = render(<ClassicTemplate site={mockSite} isPreview />);
    const sections = container.querySelectorAll('.preview');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('renders navigation with correct brand', () => {
    render(<ClassicTemplate site={mockSite} />);
    expect(screen.getByText('R & J')).toBeInTheDocument();
  });
});
