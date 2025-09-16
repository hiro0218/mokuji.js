import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateAnchorsMap, insertAnchorToHeadings } from './anchor';
import { ANCHOR_DATASET_ATTRIBUTE } from '../common/constants';
import type { MokujiOption } from '../common/types';

describe('anchor/anchor', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('generateAnchorsMap', () => {
    it('空の配列から空のMapを生成する', () => {
      const result = generateAnchorsMap([]);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('アンカー要素からhashをキーとするMapを作成する', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#heading-1';
      const anchor2 = document.createElement('a');
      anchor2.href = '#heading-2';

      const result = generateAnchorsMap([anchor1, anchor2]);

      expect(result.size).toBe(2);
      expect(result.get('heading-1')).toBe(anchor1);
      expect(result.get('heading-2')).toBe(anchor2);
    });

    it('hashが空のアンカーは無視する', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#';
      const anchor2 = document.createElement('a');
      anchor2.href = '#heading-1';

      const result = generateAnchorsMap([anchor1, anchor2]);

      expect(result.size).toBe(1);
      expect(result.has('')).toBe(false);
      expect(result.get('heading-1')).toBe(anchor2);
    });

    it('同じhashを持つ複数のアンカーがある場合、最後のものを保持する', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#duplicate';
      anchor1.textContent = 'First';
      const anchor2 = document.createElement('a');
      anchor2.href = '#duplicate';
      anchor2.textContent = 'Second';

      const result = generateAnchorsMap([anchor1, anchor2]);

      expect(result.size).toBe(1);
      expect(result.get('duplicate')).toBe(anchor2);
    });
  });

  describe('insertAnchorToHeadings', () => {
    it('見出しにアンカーリンクを挿入する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: 'anchor-link',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      insertAnchorToHeadings([heading], anchorMap, options);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeTruthy();
      expect(insertedAnchor?.textContent).toBe('#');
    });

    it('anchorLinkPosition="after"の場合、見出しの最後にアンカーを配置する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '🔗',
        anchorLinkPosition: 'after' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      insertAnchorToHeadings([heading], anchorMap, options);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeTruthy();
      expect(insertedAnchor).toBe(heading.lastElementChild);
      expect(insertedAnchor?.textContent).toBe('🔗');
    });

    it('既存のアンカーを削除してから新しいアンカーを挿入する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';

      // 既存のアンカーを追加
      const existingAnchor = document.createElement('a');
      existingAnchor.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');
      existingAnchor.textContent = 'old';
      heading.append(existingAnchor);
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: 'new',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      insertAnchorToHeadings([heading], anchorMap, options);

      const anchors = heading.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(anchors).toHaveLength(1);
      expect(anchors[0].textContent).toBe('new');
    });

    it('anchorLinkClassNameが指定されている場合、クラスを適用する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: 'custom-class another-class',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      insertAnchorToHeadings([heading], anchorMap, options);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor?.classList.contains('custom-class')).toBe(true);
      expect(insertedAnchor?.classList.contains('another-class')).toBe(true);
    });

    it('対応するアンカーが見つからない見出しはスキップする', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const anchorMap = new Map(); // 空のMap

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      insertAnchorToHeadings([heading], anchorMap, options);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeNull();
    });
  });
});
