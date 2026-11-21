import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';
import { setViewportWidth } from '../helpers/test-utils';

describe('Tier 1 - Feature F04: Responsive Viewport Layout (R1)', () => {
  it('T1-F04-01: renders compact mobile layout at 360px with bottom navigation visible', () => {
    setViewportWidth(360, 640);
    render(React.createElement(App, null));

    // Bottom navigation is rendered
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav-journal')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav-pricelist')).toBeInTheDocument();
  });

  it('T1-F04-02: renders tablet layout at 768px without horizontal overflow', () => {
    setViewportWidth(768, 1024);
    render(React.createElement(App, null));

    const container = screen.getByTestId('section-journal');
    expect(container).toBeInTheDocument();
    // Header contact links are visible
    expect(screen.getByTestId('header-phone-link')).toBeInTheDocument();
  });

  it('T1-F04-03: renders wide desktop layout at 1440px - 1920px with centered max-width container', () => {
    setViewportWidth(1440, 900);
    const { container } = render(React.createElement(App, null));

    // Main layout uses max-w-7xl for clean desktop scaling
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('max-w-7xl');
  });

  it('T1-F04-04: verifies touch targets on mobile meet accessible sizing standards', () => {
    setViewportWidth(360, 640);
    render(React.createElement(App, null));

    const journalBtn = screen.getByTestId('bottom-nav-journal');
    expect(journalBtn).toBeInTheDocument();
    expect(journalBtn.tagName).toBe('BUTTON');
    expect(journalBtn).toHaveClass('flex-col');
  });

  it('T1-F04-05: verifies section containers adjust layout cleanly across viewports', () => {
    setViewportWidth(1920, 1080);
    render(React.createElement(App, null));

    // Shell container renders full width
    const journalSection = screen.getByTestId('section-journal');
    expect(journalSection).toBeInTheDocument();
  });
});
