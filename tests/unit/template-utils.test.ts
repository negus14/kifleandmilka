import { describe, it, expect } from 'vitest';
import { toEmbedUrl, generateThemeVars, getSectionData } from '@/lib/template-utils';
import { DEFAULT_SECTION_ORDER } from '@/lib/types/wedding-site';

describe('template-utils', () => {
  describe('toEmbedUrl', () => {
    it('should transform a standard Google Maps URL into an embed URL', () => {
      const url = 'https://www.google.com/maps/place/Canadian+Museum+for+Human+Rights/@49.8908133,-97.1327111,17z';
      // The current implementation returns a legacy-style embed URL for places
      expect(toEmbedUrl(url)).toContain('output=embed');
    });

    it('should return the same URL if it is already an embed URL', () => {
      const url = 'https://www.google.com/maps/embed/v1/place?key=123&q=Somewhere';
      expect(toEmbedUrl(url)).toBe(url);
    });
  });

  describe('generateThemeVars', () => {
    it('should return CSS variables for a valid theme', () => {
      const vars = generateThemeVars({ templateId: 'classic-cream', fontStyleId: 'classic-serif' } as any);
      expect(vars).toHaveProperty('--color-dark');
      expect(vars).toHaveProperty('--color-accent');
      expect(vars).toHaveProperty('--font-serif');
    });

    it('should fallback to default theme if themeId is invalid', () => {
      const vars = generateThemeVars({ templateId: 'invalid-theme', fontStyleId: 'classic-serif' } as any);
      expect(vars).toHaveProperty('--color-dark');
    });
  });

  describe('getSectionData', () => {
    const mockSite: any = {
      sectionOrder: DEFAULT_SECTION_ORDER,
      scheduleItems: [{ event: 'Test' }],
      venues: [],
      menuItems: [],
      galleryImages: [],
      exploreGroups: [],
      accommodations: [],
      contactEntries: [],
    };

    it('should return visible sections correctly', () => {
      const { visibleSections } = getSectionData(mockSite);
      expect(visibleSections.has('hero')).toBe(true);
      expect(visibleSections.has('schedule')).toBe(true);
    });

    it('should filter navItems to exclude hero and footer', () => {
      const { navItems } = getSectionData(mockSite);
      expect(navItems.some(n => n.id === 'hero')).toBe(false);
      expect(navItems.some(n => n.id === 'footer')).toBe(false);
      // Details is visible by default
      expect(navItems.some(n => n.id === 'details')).toBe(true);
    });
  });
});
