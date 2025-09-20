import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAllHeadingElements, createElement, removeAllElements } from './dom';

describe('utils/dom', () => {
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

  describe('removeAllElements', () => {
    it('removes all elements from NodeListOf<Element>', () => {
      container.innerHTML = `
        <div data-test="1"></div>
        <div data-test="2"></div>
        <div data-test="3"></div>
      `;

      const elements = container.querySelectorAll('[data-test]');
      expect(elements).toHaveLength(3);

      removeAllElements(elements);

      const remaining = container.querySelectorAll('[data-test]');
      expect(remaining).toHaveLength(0);
    });

    it('removes all elements from an array', () => {
      container.innerHTML = `
        <span class="remove">1</span>
        <span class="remove">2</span>
        <span class="keep">3</span>
      `;

      const elementsArray = [...container.querySelectorAll('.remove')];
      expect(elementsArray).toHaveLength(2);

      removeAllElements(elementsArray);

      expect(container.querySelectorAll('.remove')).toHaveLength(0);
      expect(container.querySelectorAll('.keep')).toHaveLength(1);
    });

    it('handles empty NodeListOf gracefully', () => {
      const emptyList = container.querySelectorAll('.non-existent');
      expect(emptyList).toHaveLength(0);

      // Should not throw
      expect(() => removeAllElements(emptyList)).not.toThrow();
    });

    it('handles empty array gracefully', () => {
      const emptyArray: Element[] = [];

      // Should not throw
      expect(() => removeAllElements(emptyArray)).not.toThrow();
    });
  });
});
