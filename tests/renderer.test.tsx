// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Bike2D } from '../frontend/src/features/builder/Bike2D';
import { seedCatalog, defaultConfiguration } from '../backend/src/catalog';
afterEach(cleanup);
describe('2D viewer', () => {
  it('provides labeled side-profile geometry and keyboard component selection', () => { let selected = ''; render(<Bike2D configuration={defaultConfiguration} catalog={seedCatalog} onSelect={slot => { selected = slot; }}/>); expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Not manufacturer geometry'); fireEvent.keyDown(screen.getByRole('button', { name: 'Select frameset on bicycle' }), { key: 'Enter' }); expect(selected).toBe('frameset'); });
  it('reflects a selected finish and cockpit shape in its geometry', () => { const { container, rerender } = render(<Bike2D configuration={defaultConfiguration} catalog={seedCatalog}/>); const before = container.innerHTML; rerender(<Bike2D configuration={{ ...defaultConfiguration, frameset: 'studio-track-acid', cockpit: 'studio-riser' }} catalog={seedCatalog}/>); expect(container.innerHTML).not.toBe(before); expect(container.innerHTML).toContain('#d9ed85'); expect(container.querySelector('[data-frame-variant]')?.getAttribute('data-frame-variant')).toBe('studio-track-acid'); });
});
