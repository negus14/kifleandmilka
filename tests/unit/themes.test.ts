/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { themes, fontStyles, getTheme, getFontStyle } from '@/lib/themes';

describe('themes', () => {
  describe('themes array', () => {
    it('should have at least one theme', () => {
      expect(themes.length).toBeGreaterThan(0);
    });

    it('should have unique IDs', () => {
      const ids = themes.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('each theme should have all required color properties', () => {
      const requiredColors = ['dark', 'accent', 'primary', 'accentLight', 'accentDark', 'primaryDark'];
      for (const theme of themes) {
        for (const color of requiredColors) {
          expect(theme.colors).toHaveProperty(color);
          expect(theme.colors[color as keyof typeof theme.colors]).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      }
    });

    it('each theme should have font definitions', () => {
      for (const theme of themes) {
        expect(theme.fonts.script).toBeTruthy();
        expect(theme.fonts.serif).toBeTruthy();
        expect(theme.fonts.sans).toBeTruthy();
      }
    });

    it('each theme should have a Google Fonts URL', () => {
      for (const theme of themes) {
        expect(theme.googleFontsUrl).toContain('fonts.googleapis.com');
      }
    });
  });

  describe('fontStyles array', () => {
    it('should have 8 font styles', () => {
      expect(fontStyles).toHaveLength(8);
    });

    it('should have unique IDs', () => {
      const ids = fontStyles.map(f => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('each font style should have font definitions', () => {
      for (const style of fontStyles) {
        expect(style.fonts.script).toBeTruthy();
        expect(style.fonts.serif).toBeTruthy();
        expect(style.fonts.sans).toBeTruthy();
      }
    });

    it('each font style should have a Google Fonts URL', () => {
      for (const style of fontStyles) {
        expect(style.googleFontsUrl).toContain('fonts.googleapis.com');
      }
    });

    it('should include all expected style IDs', () => {
      const ids = fontStyles.map(f => f.id);
      expect(ids).toContain('timeless');
      expect(ids).toContain('modern');
      expect(ids).toContain('playful');
      expect(ids).toContain('vintage');
      expect(ids).toContain('editorial');
      expect(ids).toContain('bohemian');
      expect(ids).toContain('classic-serif');
      expect(ids).toContain('bold-modern');
    });
  });

  describe('getTheme', () => {
    it('should return the correct theme by ID', () => {
      const theme = getTheme('midnight-navy');
      expect(theme.id).toBe('midnight-navy');
      expect(theme.name).toBe('Midnight Navy');
    });

    it('should return the first theme as fallback for unknown ID', () => {
      const theme = getTheme('nonexistent-theme');
      expect(theme.id).toBe(themes[0].id);
    });

    it('should return the first theme for empty string', () => {
      const theme = getTheme('');
      expect(theme.id).toBe(themes[0].id);
    });
  });

  describe('getFontStyle', () => {
    it('should return the correct font style by ID', () => {
      const style = getFontStyle('editorial');
      expect(style.id).toBe('editorial');
      expect(style.name).toBe('Editorial Luxe');
    });

    it('should return the first font style as fallback for unknown ID', () => {
      const style = getFontStyle('nonexistent');
      expect(style.id).toBe(fontStyles[0].id);
    });

    it('should return the first font style when undefined', () => {
      const style = getFontStyle(undefined);
      expect(style.id).toBe(fontStyles[0].id);
    });

    it('should include overrides when present', () => {
      const editorial = getFontStyle('editorial');
      expect(editorial.overrides).toBeDefined();
      expect(editorial.overrides?.letterSpacingSans).toBe('0.25em');
      expect(editorial.overrides?.fontWeightSans).toBe('200');
    });
  });
});
