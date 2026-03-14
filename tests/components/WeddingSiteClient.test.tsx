import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WeddingSiteClient from '@/templates/modern/WeddingSiteClient';

describe('WeddingSiteClient (Modern)', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();

    // Mock IntersectionObserver (must use function, not arrow, for `new`)
    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(function () {
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    }));

    // Mock DOM elements for countdown
    document.body.innerHTML = `
      <div id="countdown-days">---</div>
      <div id="countdown-hours">--</div>
      <div id="countdown-mins">--</div>
      <div id="countdown-secs">--</div>
      <nav class="modern-nav"></nav>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should render null (no visual output)', () => {
    const { container } = render(
      <WeddingSiteClient weddingDate="2030-01-01T00:00:00Z" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should start countdown timer', () => {
    render(<WeddingSiteClient weddingDate="2030-06-15T14:00:00Z" />);

    // After initial render, countdown should update
    act(() => {
      vi.advanceTimersByTime(100); // past the setTimeout
    });

    const daysEl = document.getElementById('countdown-days');
    expect(daysEl?.textContent).not.toBe('---');
  });

  it('should show 0 when wedding date is in the past', () => {
    render(<WeddingSiteClient weddingDate="2020-01-01T00:00:00Z" />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(document.getElementById('countdown-days')?.textContent).toBe('0');
    expect(document.getElementById('countdown-hours')?.textContent).toBe('0');
    expect(document.getElementById('countdown-mins')?.textContent).toBe('0');
    expect(document.getElementById('countdown-secs')?.textContent).toBe('0');
  });

  it('should set up IntersectionObserver for reveal elements', () => {
    // Add reveal elements
    const revealEl = document.createElement('div');
    revealEl.classList.add('reveal');
    document.body.appendChild(revealEl);

    render(<WeddingSiteClient weddingDate="2030-01-01T00:00:00Z" />);

    // IntersectionObserver should have been created
    expect(IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();
  });

  it('should listen for scroll events', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');

    render(<WeddingSiteClient weddingDate="2030-01-01T00:00:00Z" />);

    expect(addEventSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should handle SCROLL_TO_SECTION messages', () => {
    const targetEl = document.createElement('section');
    targetEl.id = 'rsvp';
    targetEl.scrollIntoView = vi.fn();
    document.body.appendChild(targetEl);

    render(<WeddingSiteClient weddingDate="2030-01-01T00:00:00Z" />);

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'SCROLL_TO_SECTION', sectionId: 'rsvp' },
      }));
    });

    expect(targetEl.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('should clean up on unmount', () => {
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <WeddingSiteClient weddingDate="2030-01-01T00:00:00Z" />
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
    expect(removeEventSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should add scrolled class to nav on scroll past 80px', () => {
    const nav = document.querySelector('.modern-nav') as HTMLElement;

    render(<WeddingSiteClient weddingDate="2030-01-01T00:00:00Z" />);

    // Simulate scroll past 80px
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(nav.classList.contains('scrolled')).toBe(true);
  });
});
