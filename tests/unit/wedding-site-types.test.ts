/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { DEFAULT_SECTION_ORDER, SECTION_LABELS } from '@/lib/types/wedding-site';

describe('wedding-site types and constants', () => {
  describe('DEFAULT_SECTION_ORDER', () => {
    it('should have 16 section entries', () => {
      expect(DEFAULT_SECTION_ORDER).toHaveLength(16);
    });

    it('should start with hero section', () => {
      expect(DEFAULT_SECTION_ORDER[0]).toEqual({
        id: 'hero',
        type: 'hero',
        visible: true,
      });
    });

    it('should end with footer section', () => {
      const last = DEFAULT_SECTION_ORDER[DEFAULT_SECTION_ORDER.length - 1];
      expect(last).toEqual({
        id: 'footer',
        type: 'footer',
        visible: true,
      });
    });

    it('should have story, faqs, and accommodations hidden by default', () => {
      const story = DEFAULT_SECTION_ORDER.find(s => s.id === 'story');
      expect(story?.visible).toBe(false);
      const faqs = DEFAULT_SECTION_ORDER.find(s => s.id === 'faqs');
      expect(faqs?.visible).toBe(false);
      const accommodations = DEFAULT_SECTION_ORDER.find(s => s.id === 'accommodations');
      expect(accommodations?.visible).toBe(false);
    });

    it('should have all other sections visible by default', () => {
      const hiddenSections = DEFAULT_SECTION_ORDER.filter(s => !s.visible);
      expect(hiddenSections).toHaveLength(3);
      const hiddenIds = hiddenSections.map(s => s.id);
      expect(hiddenIds).toContain('story');
      expect(hiddenIds).toContain('faqs');
      expect(hiddenIds).toContain('accommodations');
    });

    it('each entry should have id, type, and visible', () => {
      for (const section of DEFAULT_SECTION_ORDER) {
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('type');
        expect(section).toHaveProperty('visible');
        expect(typeof section.id).toBe('string');
        expect(typeof section.type).toBe('string');
        expect(typeof section.visible).toBe('boolean');
      }
    });

    it('should have unique IDs', () => {
      const ids = DEFAULT_SECTION_ORDER.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should include all expected section types', () => {
      const types = DEFAULT_SECTION_ORDER.map(s => s.type);
      const expected = ['hero', 'story', 'details', 'quote', 'featuredPhoto', 'letter',
        'schedule', 'menu', 'faqs', 'gallery', 'explore', 'accommodations', 'rsvp', 'gift', 'contact', 'footer'];
      expect(types).toEqual(expected);
    });
  });

  describe('SECTION_LABELS', () => {
    it('should have labels for all section types', () => {
      const expectedKeys = ['hero', 'story', 'details', 'quote', 'featuredPhoto', 'letter',
        'schedule', 'menu', 'faqs', 'gallery', 'explore', 'accommodations', 'rsvp', 'gift', 'contact', 'footer'];
      for (const key of expectedKeys) {
        expect(SECTION_LABELS).toHaveProperty(key);
        expect(typeof SECTION_LABELS[key]).toBe('string');
      }
    });

    it('should have human-readable labels', () => {
      expect(SECTION_LABELS.hero).toBe('Hero');
      expect(SECTION_LABELS.story).toBe('Our Story');
      expect(SECTION_LABELS.details).toBe('Wedding Details');
      expect(SECTION_LABELS.accommodations).toBe('Accommodations');
    });
  });
});
