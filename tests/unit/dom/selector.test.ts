/**
 * DOMセレクタのテスト
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ElementSelectors } from '../../../src/dom/selector';

describe('DOMセレクタ', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  describe('getAllHeadings', () => {
    it('すべての見出し要素を取得すること', () => {
      container.innerHTML = `
        <h1>Heading 1</h1>
        <p>Paragraph</p>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      `;

      const headings = ElementSelectors.getAllHeadings(container);

      expect(headings).toHaveLength(6);
      expect(headings[0].tagName).toBe('H1');
      expect(headings[1].tagName).toBe('H2');
      expect(headings[2].tagName).toBe('H3');
      expect(headings[3].tagName).toBe('H4');
      expect(headings[4].tagName).toBe('H5');
      expect(headings[5].tagName).toBe('H6');
    });

    it('空の要素では空配列を返すこと', () => {
      container.innerHTML = '<p>No headings</p>';
      const headings = ElementSelectors.getAllHeadings(container);
      expect(headings).toHaveLength(0);
    });
  });

  describe('findByDataAttribute', () => {
    it('データ属性を持つ要素を取得すること', () => {
      container.innerHTML = `
        <div data-test="1">Element 1</div>
        <span>No attribute</span>
        <div data-test="2">Element 2</div>
      `;

      const elements = ElementSelectors.findByDataAttribute(container, 'data-test');

      expect(elements).toHaveLength(2);
      expect(elements[0].textContent).toBe('Element 1');
      expect(elements[1].textContent).toBe('Element 2');
    });

    it('該当する要素がなければ空配列を返すこと', () => {
      container.innerHTML = '<div>No data attribute</div>';
      const elements = ElementSelectors.findByDataAttribute(container, 'data-test');
      expect(elements).toHaveLength(0);
    });
  });

  describe('findByTagAndAttribute', () => {
    it('タグと属性が一致する要素を取得すること', () => {
      container.innerHTML = `
        <div data-test="1">Div element</div>
        <span data-test="2">Span element</span>
      `;

      const div = ElementSelectors.findByTagAndAttribute(container, 'div', 'data-test');
      const span = ElementSelectors.findByTagAndAttribute(container, 'span', 'data-test');

      expect(div?.textContent).toBe('Div element');
      expect(span?.textContent).toBe('Span element');
    });

    it('該当する要素がなければnullを返すこと', () => {
      container.innerHTML = '<div>No attribute</div>';
      const element = ElementSelectors.findByTagAndAttribute(container, 'div', 'data-test');
      expect(element).toBeNull();
    });
  });
});
