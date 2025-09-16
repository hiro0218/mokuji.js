import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, ANCHOR_DATASET_ATTRIBUTE, defaultOptions } from './constants';

describe('common/constants', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('exposes stable dataset attribute names that allow users to target injected UI', () => {
    const toc = document.createElement('ol');
    toc.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');
    const headingAnchor = document.createElement('a');
    headingAnchor.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

    container.append(toc, headingAnchor);

    expect(container.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`)).toBe(toc);
    expect(container.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`)).toHaveLength(1);
  });

  it('provides documented default options for table of contents generation', () => {
    expect(defaultOptions).toMatchObject({
      anchorType: true,
      anchorLink: false,
      anchorLinkSymbol: '#',
      anchorLinkPosition: 'before',
      anchorLinkClassName: '',
      anchorContainerTagName: 'ol',
      minLevel: 1,
      maxLevel: 6,
    });
  });

  it('keeps defaults immutable from consumer mutations when copied for customization', () => {
    const customized = { ...defaultOptions, anchorLink: true };

    expect(customized.anchorLink).toBe(true);
    expect(defaultOptions.anchorLink).toBe(false);
  });
});
