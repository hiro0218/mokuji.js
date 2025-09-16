import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAllHeadingElements, createElement } from './dom';

describe('common/dom', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('section');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('getAllHeadingElements', () => {
    it('returns every heading level in the order they appear to reflect user-visible structure', () => {
      container.innerHTML = `
        <h1>Main Title</h1>
        <div>
          <h3>Nested Section</h3>
          <article>
            <h2>Out of order level</h2>
            <p>Paragraph</p>
            <h6>Deep heading</h6>
          </article>
        </div>
        <p>No heading here</p>
        <h4>Closing Thoughts</h4>
      `;

      const headings = getAllHeadingElements(container);

      expect(headings).toHaveLength(5);
      expect(headings.map((heading) => heading.tagName)).toEqual(['H1', 'H3', 'H2', 'H6', 'H4']);
      expect(headings.every((heading) => heading instanceof HTMLHeadingElement)).toBe(true);
    });

    it('returns an empty array when no headings are present', () => {
      container.innerHTML = '<p>plain text</p>';

      const headings = getAllHeadingElements(container);

      expect(headings).toEqual([]);
    });
  });

  describe('createElement', () => {
    it('creates a fresh element instance each time while reusing the underlying template', () => {
      const firstAnchor = createElement('a');
      firstAnchor.dataset.test = 'value';

      const secondAnchor = createElement('a');

      expect(secondAnchor).not.toBe(firstAnchor);
      expect(secondAnchor.dataset.test).toBeUndefined();
      expect(secondAnchor.tagName).toBe('A');
    });

    it('returns typed elements for standard HTML tags', () => {
      const button = createElement('button');
      button.type = 'button';

      expect(button).toBeInstanceOf(HTMLButtonElement);
      expect(button.type).toBe('button');
    });
  });
});
