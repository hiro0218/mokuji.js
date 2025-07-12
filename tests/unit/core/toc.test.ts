/**
 * 目次構造機能のテスト
 */
import { describe, it, expect } from 'vitest';
import {
  buildTocHierarchy,
  createTocStructure,
  isTocStructureEmpty,
  flattenTocItems,
  findTocItemById,
} from '../../../src/core/toc';
import type { HeadingInfo } from '../../../src/types/core';

describe('目次構造処理', () => {
  describe('buildTocHierarchy', () => {
    it('空の配列の場合、空の階層を返すこと', () => {
      const result = buildTocHierarchy([]);
      expect(result).toEqual([]);
    });

    it('単一レベルの見出しから階層を正しく構築すること', () => {
      const headings: HeadingInfo[] = [
        { id: 'h1', text: 'H1', level: 1, element: document.createElement('h1') },
        { id: 'h1-2', text: 'H1-2', level: 1, element: document.createElement('h1') },
      ];

      const result = buildTocHierarchy(headings);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('h1');
      expect(result[1].id).toBe('h1-2');
      expect(result[0].children).toEqual([]);
      expect(result[1].children).toEqual([]);
    });

    it('複数レベルの見出しから階層を正しく構築すること', () => {
      const headings: HeadingInfo[] = [
        { id: 'h1', text: 'H1', level: 1, element: document.createElement('h1') },
        { id: 'h2', text: 'H2', level: 2, element: document.createElement('h2') },
        { id: 'h3', text: 'H3', level: 3, element: document.createElement('h3') },
        { id: 'h2-2', text: 'H2-2', level: 2, element: document.createElement('h2') },
      ];

      const result = buildTocHierarchy(headings);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('h1');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].id).toBe('h2');
      expect(result[0].children[0].children[0].id).toBe('h3');
      expect(result[0].children[1].id).toBe('h2-2');
    });

    it('レベルスキップがある場合も階層を正しく構築すること', () => {
      const headings: HeadingInfo[] = [
        { id: 'h1', text: 'H1', level: 1, element: document.createElement('h1') },
        { id: 'h3', text: 'H3', level: 3, element: document.createElement('h3') },
        { id: 'h2', text: 'H2', level: 2, element: document.createElement('h2') },
      ];

      const result = buildTocHierarchy(headings);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('h1');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].id).toBe('h3');
      expect(result[0].children[1].id).toBe('h2');
    });
  });

  describe('createTocStructure', () => {
    it('headingsとitemsを含む構造を作成すること', () => {
      const headings: HeadingInfo[] = [{ id: 'h1', text: 'H1', level: 1, element: document.createElement('h1') }];

      const result = createTocStructure(headings);

      expect(result).toHaveProperty('headings');
      expect(result).toHaveProperty('items');
      expect(result.headings).toBe(headings);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('isTocStructureEmpty', () => {
    it('itemsが空の場合trueを返すこと', () => {
      const result = isTocStructureEmpty({
        items: [],
        headings: [{ id: 'h1', text: 'H1', level: 1, element: document.createElement('h1') }],
      });

      expect(result).toBe(true);
    });

    it('itemsが空でない場合falseを返すこと', () => {
      const result = isTocStructureEmpty({
        items: [{ id: 'h1', text: 'H1', level: 1, href: '#h1', children: [] }],
        headings: [{ id: 'h1', text: 'H1', level: 1, element: document.createElement('h1') }],
      });

      expect(result).toBe(false);
    });
  });

  describe('flattenTocItems', () => {
    it('ネストされた構造を平坦化すること', () => {
      const items = [
        {
          id: 'h1',
          text: 'H1',
          level: 1,
          href: '#h1',
          children: [
            {
              id: 'h2',
              text: 'H2',
              level: 2,
              href: '#h2',
              children: [{ id: 'h3', text: 'H3', level: 3, href: '#h3', children: [] }],
            },
          ],
        },
      ];

      const result = flattenTocItems(items);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('h1');
      expect(result[1].id).toBe('h2');
      expect(result[2].id).toBe('h3');
    });
  });

  describe('findTocItemById', () => {
    it('指定したIDのアイテムを見つけること', () => {
      const items = [
        {
          id: 'h1',
          text: 'H1',
          level: 1,
          href: '#h1',
          children: [
            {
              id: 'h2',
              text: 'H2',
              level: 2,
              href: '#h2',
              children: [],
            },
          ],
        },
      ];

      const result = findTocItemById(items, 'h2');

      expect(result).toBeDefined();
      expect(result?.id).toBe('h2');
    });

    it('IDが存在しない場合undefinedを返すこと', () => {
      const items = [
        {
          id: 'h1',
          text: 'H1',
          level: 1,
          href: '#h1',
          children: [],
        },
      ];

      const result = findTocItemById(items, 'not-exist');

      expect(result).toBeUndefined();
    });
  });
});
