import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { insertPerHeadingAnchors } from './anchor';
import { ANCHOR_DATASET_ATTRIBUTE, defaultOptions } from './utils/constants';
import type { ResolvedHeading } from './heading-identity';
import type { HeadingLevel, MokujiOption } from './types';

const r = (heading: HTMLHeadingElement, identity: string, level: HeadingLevel): ResolvedHeading => ({
  heading,
  identity,
  level,
});

describe('insertPerHeadingAnchors', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('inserts an anchor before each heading by default', () => {
    const heading = document.createElement('h2');
    heading.textContent = 'Test Heading';
    container.append(heading);

    const inserted = insertPerHeadingAnchors([r(heading, 'test', 2)], defaultOptions);

    expect(inserted).toHaveLength(1);
    const anchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`) as HTMLAnchorElement | null;
    expect(anchor).toBeTruthy();
    expect(anchor?.textContent).toBe(defaultOptions.anchorLinkSymbol);
    expect(anchor?.getAttribute('href')).toBe('#test');
    expect(anchor?.getAttribute('aria-label')).toBe('Test Heading');
    expect(anchor).toBe(heading.firstElementChild);
  });

  it('places the anchor at the end when anchorLinkPosition is "after"', () => {
    const heading = document.createElement('h2');
    heading.textContent = 'Test';
    container.append(heading);

    const options: Required<MokujiOption> = {
      ...defaultOptions,
      anchorLinkSymbol: '🔗',
      anchorLinkPosition: 'after',
    };

    insertPerHeadingAnchors([r(heading, 'test', 2)], options);

    const anchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchor).toBe(heading.lastElementChild);
    expect(anchor?.textContent).toBe('🔗');
  });

  it('removes a previously-inserted anchor before inserting a new one', () => {
    const heading = document.createElement('h2');
    heading.textContent = 'Test Heading';

    const stale = document.createElement('a');
    stale.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');
    stale.textContent = 'old';
    heading.append(stale);
    container.append(heading);

    const options: Required<MokujiOption> = { ...defaultOptions, anchorLinkSymbol: 'new' };
    insertPerHeadingAnchors([r(heading, 'test', 2)], options);

    const anchors = heading.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchors).toHaveLength(1);
    expect(anchors[0].textContent).toBe('new');
  });

  it('applies anchorLinkClassName to inserted anchors', () => {
    const heading = document.createElement('h2');
    heading.textContent = 'Test';
    container.append(heading);

    const options: Required<MokujiOption> = { ...defaultOptions, anchorLinkClassName: 'cls-a cls-b' };
    insertPerHeadingAnchors([r(heading, 'test', 2)], options);

    const anchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchor?.classList.contains('cls-a')).toBe(true);
    expect(anchor?.classList.contains('cls-b')).toBe(true);
  });

  it('inserts one anchor per resolved heading', () => {
    const h1 = document.createElement('h2');
    h1.textContent = 'A';
    const h2 = document.createElement('h2');
    h2.textContent = 'B';
    container.append(h1, h2);

    const inserted = insertPerHeadingAnchors([r(h1, 'a', 2), r(h2, 'b', 2)], defaultOptions);

    expect(inserted).toHaveLength(2);
    expect(h1.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`)).toHaveLength(1);
    expect(h2.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`)).toHaveLength(1);
  });

  it('uses the identity in the aria label when the heading text is empty', () => {
    const heading = document.createElement('h2');
    container.append(heading);

    insertPerHeadingAnchors([r(heading, 'fallback-id', 2)], defaultOptions);

    const anchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchor?.getAttribute('aria-label')).toBe('fallback-id');
  });

  it('returns an empty array when no resolved headings are provided', () => {
    const inserted = insertPerHeadingAnchors([], defaultOptions);
    expect(inserted).toEqual([]);
  });
});
