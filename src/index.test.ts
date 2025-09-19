import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Mokuji } from './index';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, ANCHOR_DATASET_ATTRIBUTE } from './utils/constants';

describe('Mokuji.js', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create DOM element for testing
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    // Clean up after test
    container.remove();
    vi.restoreAllMocks();
  });

  it('returns undefined when no headings exist', () => {
    // Pass element without headings
    container.innerHTML = '<p>This is a paragraph</p>';
    const result = Mokuji(container);

    expect(result).toBeUndefined();
  });

  it('generates a table of contents from heading elements', () => {
    // Set HTML containing heading elements
    container.innerHTML = `
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <h2>Section 1</h2>
      <p>Paragraph 2</p>
      <h2>Section 2</h2>
      <h3>Subsection</h3>
    `;

    const result = Mokuji(container);

    expect(result).toBeDefined();
    expect(result?.element).toBe(container);
    // Verify that either OL or UL list element is generated
    expect(result?.list).toBeInstanceOf(HTMLElement);
    expect(['OL', 'UL'].includes(result?.list.tagName || '')).toBe(true);
    expect(result?.list.getAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE)).toBe('');

    // Verify the structure of generated TOC
    const listItems = result?.list.querySelectorAll('li');
    expect(listItems?.length).toBe(4); // Number of headings

    // Verify that TOC links are generated correctly
    const links = result?.list.querySelectorAll('a');
    expect(links?.length).toBe(4);
  });

  it('correctly applies minLevel and maxLevel options', () => {
    container.innerHTML = `
      <h1>Title</h1>
      <h2>Section 1</h2>
      <h3>Subsection 1</h3>
      <h4>Sub-subsection</h4>
      <h5>Detail section</h5>
      <h6>Minimal section</h6>
    `;

    // Target only headings from h2 to h4
    const result = Mokuji(container, { minLevel: 2, maxLevel: 4 });

    expect(result).toBeDefined();
    const links = result?.list.querySelectorAll('a');
    expect(links?.length).toBe(3); // 3 headings: h2, h3, h4

    // Verify that h1, h5, and h6 are not included
    const linkTexts = [...(links || [])].map((a) => a.textContent);
    expect(linkTexts).toContain('Section 1');
    expect(linkTexts).toContain('Subsection 1');
    expect(linkTexts).toContain('Sub-subsection');
    expect(linkTexts).not.toContain('Title');
    expect(linkTexts).not.toContain('Detail section');
    expect(linkTexts).not.toContain('Minimal section');
  });

  it('inserts anchor links to headings when anchorLink option is enabled', () => {
    container.innerHTML = `
      <h1>Title</h1>
      <h2>Section 1</h2>
    `;

    const result = Mokuji(container, { anchorLink: true });

    expect(result).toBeDefined();

    // Verify that anchor links are inserted into headings
    const anchorLinks = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchorLinks.length).toBe(2); // Anchors added to 2 headings
  });

  it('removes table of contents and anchor links when destroy method is called', () => {
    container.innerHTML = `
      <h1>Title</h1>
      <h2>Section 1</h2>
    `;

    // Generate TOC
    const result = Mokuji(container, { anchorLink: true });
    expect(result).toBeDefined();
    expect(result?.destroy).toBeInstanceOf(Function);

    // Explicitly add generated TOC to document
    if (result && result.list) {
      document.body.append(result.list);
    }

    // Verify that TOC and anchor links exist
    const tocList = document.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
    const anchorLinks = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(tocList).not.toBeNull();
    expect(anchorLinks.length).toBe(2);

    // Call the instance's destroy() method
    result?.destroy();

    // Verify that TOC and anchor links have been removed
    const tocListAfter = document.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
    const anchorLinksAfter = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(tocListAfter).toBeNull();
    expect(anchorLinksAfter.length).toBe(0);
  });

  it('outputs a warning and returns undefined when element is falsy', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = Mokuji(undefined as unknown as HTMLElement);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Mokuji: Target element not found.');
  });

  it('scoped destroy only affects its own instance', () => {
    // First container and TOC
    const container1 = document.createElement('div');
    container1.innerHTML = '<h1>Container1</h1><h2>Section1</h2>';
    document.body.append(container1);

    // Second container and TOC
    const container2 = document.createElement('div');
    container2.innerHTML = '<h1>Container2</h1><h2>Section2</h2>';
    document.body.append(container2);

    const result1 = Mokuji(container1, { anchorLink: true });
    const result2 = Mokuji(container2, { anchorLink: true });

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();

    // Add both TOCs to document
    if (result1?.list) document.body.append(result1.list);
    if (result2?.list) document.body.append(result2.list);

    // Verify that both TOCs and anchors exist
    expect(document.querySelectorAll(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`).length).toBe(2);
    expect(document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`).length).toBe(4);

    // Remove only the first instance
    result1?.destroy();

    // Verify that first instance elements are removed and second instance elements remain
    const remainingLists = document.querySelectorAll(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
    const remainingAnchors = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);

    expect(remainingLists.length).toBe(1);
    expect(remainingAnchors.length).toBe(2);

    // Remove second instance as well
    result2?.destroy();

    // Verify that all elements have been removed
    expect(document.querySelectorAll(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`).length).toBe(0);
    expect(document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`).length).toBe(0);

    // Clean up
    container1.remove();
    container2.remove();
  });

  it('does not duplicate anchors when called twice on duplicate headings', () => {
    // Create multiple headings with same text (duplicate headings)
    container.innerHTML = `
      <h2>Section</h2>
      <p>Paragraph 1</p>
      <h2>Section</h2>
      <p>Paragraph 2</p>
      <h2>Section</h2>
      <h3>Another Section</h3>
      <h2>Different</h2>
    `;

    // First call
    const result1 = Mokuji(container, { anchorLink: true });

    expect(result1).toBeDefined();

    // Verify that heading IDs are unique
    const headings = container.querySelectorAll('h2, h3');
    const ids = new Set<string>();
    for (const h of headings) {
      expect(h.id).toBeTruthy();
      ids.add(h.id);
    }
    expect(ids.size).toBe(headings.length); // All IDs are unique

    // Check number of anchors (after first call)
    const anchorsAfterFirst = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchorsAfterFirst.length).toBe(5); // Anchors on 5 headings

    // Second call (duplicate call)
    const result2 = Mokuji(container, { anchorLink: true });

    expect(result2).toBeDefined();

    // Verify that anchors have not multiplied
    const anchorsAfterSecond = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchorsAfterSecond.length).toBe(5); // Still 5 (not multiplied)

    // Verify that each heading has only one anchor
    for (const h of headings) {
      const headingAnchors = h.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(headingAnchors.length).toBe(1);
    }

    // Verify that TOC links have unique hrefs
    const tocLinks1 = result1?.list.querySelectorAll('a');
    const hrefs1 = new Set<string>();
    if (tocLinks1) {
      for (const link of tocLinks1) {
        hrefs1.add(link.getAttribute('href') || '');
      }
    }
    expect(hrefs1.size).toBe(tocLinks1?.length); // All hrefs unique in first call

    const tocLinks2 = result2?.list.querySelectorAll('a');
    const hrefs2 = new Set<string>();
    if (tocLinks2) {
      for (const link of tocLinks2) {
        hrefs2.add(link.getAttribute('href') || '');
      }
    }
    expect(hrefs2.size).toBe(tocLinks2?.length); // All hrefs also unique in second call
  });
});
