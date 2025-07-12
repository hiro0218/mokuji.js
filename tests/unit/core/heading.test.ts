/**
 * 見出し処理機能のテスト
 */
import { describe, it, expect } from 'vitest';
import {
  extractHeadingInfo,
  filterHeadingsByLevel,
  generateAnchorText,
  assignUniqueIds,
} from '../../../src/core/heading';
import type { HeadingInfo } from '../../../src/types/core';

describe('見出し処理', () => {
  describe('extractHeadingInfo', () => {
    it('見出し要素から正しい情報を抽出すること', () => {
      // テスト用の見出し要素を作成
      const h2 = document.createElement('h2');
      h2.textContent = 'テスト見出し';
      h2.id = 'test-id';

      const result = extractHeadingInfo(h2);

      expect(result).toEqual({
        id: 'test-id',
        text: 'テスト見出し',
        level: 2,
        element: h2,
      });
    });

    it('IDがない場合は空文字を返すこと', () => {
      const h3 = document.createElement('h3');
      h3.textContent = 'ID無し見出し';

      const result = extractHeadingInfo(h3);

      expect(result.id).toBe('');
    });
  });

  describe('filterHeadingsByLevel', () => {
    it('指定された範囲内の見出しのみをフィルタリングすること', () => {
      const headings: HeadingInfo[] = [
        { id: '1', text: 'H1', level: 1, element: document.createElement('h1') },
        { id: '2', text: 'H2', level: 2, element: document.createElement('h2') },
        { id: '3', text: 'H3', level: 3, element: document.createElement('h3') },
        { id: '4', text: 'H4', level: 4, element: document.createElement('h4') },
        { id: '5', text: 'H5', level: 5, element: document.createElement('h5') },
        { id: '6', text: 'H6', level: 6, element: document.createElement('h6') },
      ];

      const filtered = filterHeadingsByLevel(headings, 2, 4);

      expect(filtered).toHaveLength(3);
      expect(filtered[0].level).toBe(2);
      expect(filtered[1].level).toBe(3);
      expect(filtered[2].level).toBe(4);
    });
  });

  describe('generateAnchorText', () => {
    it('通常スタイルで正しくアンカーテキストを生成すること', () => {
      expect(generateAnchorText('Test Heading', false)).toBe('Test_Heading');
      expect(generateAnchorText('Test & Heading', false)).toBe('Test__Heading');
      expect(generateAnchorText('Test:Heading', false)).toBe('TestHeading');
    });

    it('Wikipediaスタイルで正しくアンカーテキストを生成すること', () => {
      expect(generateAnchorText('Test Heading', true)).toBe('Test_Heading');
      expect(generateAnchorText('テスト見出し', true)).toBe('.E3.83.86.E3.82.B9.E3.83.88.E8.A6.8B.E5.87.BA.E3.81.97');
    });

    it('空の文字列の場合は空を返すこと', () => {
      expect(generateAnchorText('', false)).toBe('');
      expect(generateAnchorText('', true)).toBe('');
    });
  });

  describe('assignUniqueIds', () => {
    it('見出しに一意のIDを割り当てること', () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Heading';

      const h2 = document.createElement('h2');
      h2.textContent = 'Heading';

      const headings: HeadingInfo[] = [
        { id: '', text: 'Heading', level: 1, element: h1 },
        { id: '', text: 'Heading', level: 2, element: h2 },
      ];

      const result = assignUniqueIds(headings, false);

      expect(result[0].id).toBe('Heading');
      expect(result[1].id).toBe('Heading_1');
    });
  });
});
