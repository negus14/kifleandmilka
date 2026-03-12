import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModernTemplate } from '@/templates/modern/Template';
import { DEFAULT_SECTION_ORDER } from '@/lib/types/wedding-site';

// Mock WeddingSiteClient as it uses browser APIs not available in jsdom easily
vi.mock('../src/templates/modern/WeddingSiteClient', () => ({
  default: () => <div data-testid="mock-client" />
}));

// Mock RSVPForm as it's tested elsewhere
vi.mock('../src/components/RSVPForm', () => ({
  default: () => <div data-testid="mock-rsvp-form" />
}));

describe('ModernTemplate', () => {
  const mockSite: any = {
    templateId: 'modern-dark',
    layoutId: 'modern',
    slug: 'test-wedding',
    partner1Name: 'Adam',
    partner2Name: 'Eve',
    heroPretext: 'Welcome',
    heroTagline: 'To our wedding',
    heroCta: 'RSVP Now',
    dateDisplayText: 'August 1, 2026',
    locationText: 'The Garden',
    navBrand: 'A & E',
    storyTitle: 'Our Story',
    storySubtitle: 'The Beginning',
    storyLeadQuote: 'It was love at first sight',
    storyBody: ['Paragraph 1'],
    storyImageUrl: '/story.jpg',
    eventDays: [{
      id: 'day-1',
      label: 'Day One',
      venues: [{ label: 'Ceremony', name: 'The Park', address: '123 St', time: '2:00 PM' }],
      infoBlocks: [],
      detailsStyle: 'grid'
    }],
    venues: [{ label: 'Ceremony', name: 'The Park', address: '123 St', time: '2:00 PM' }],
    venueInfoBlocks: [],
    scheduleItems: [],
    galleryImages: [],
    exploreGroups: [],
    accommodations: [],
    rsvpHeading: 'RSVP',
    rsvpDeadlineText: 'By July 1',
    rsvpMealOptions: [],
    contactEntries: [],
    footerNames: 'Adam & Eve',
    footerCopyright: '© 2026',
    sectionOrder: DEFAULT_SECTION_ORDER,
  };

  it('renders the hero section with correct names', () => {
    render(<ModernTemplate site={mockSite} />);
    // Check for names in Hero - using getAllByText since names appear in footer too
    const names = screen.getAllByText(/Adam/);
    expect(names.length).toBeGreaterThan(0);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('renders visible sections based on sectionOrder', () => {
    render(<ModernTemplate site={mockSite} />);
    expect(screen.getByText('Our Story')).toBeInTheDocument();
    expect(screen.getByText('The Details')).toBeInTheDocument();
  });

  it('does not render hidden sections', () => {
    const siteWithHiddenStory = {
      ...mockSite,
      sectionOrder: DEFAULT_SECTION_ORDER.map(s => 
        s.id === 'story' ? { ...s, visible: false } : s
      )
    };
    render(<ModernTemplate site={siteWithHiddenStory} />);
    expect(screen.queryByText('Our Story')).not.toBeInTheDocument();
  });

  it('applies preview class when isPreview is true', () => {
    const { container } = render(<ModernTemplate site={mockSite} isPreview />);
    const sections = container.querySelectorAll('.modern-section');
    sections.forEach(s => {
      expect(s.className).toContain('preview');
    });
  });
});
