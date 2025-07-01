/**
 * 見出し処理のビジネスロジック
 * Wikipediaスタイルとの互換性保持が重要な設計要件
 */

import type { HeadingInfo, HeadingLevel } from '../types/core';
import { REGEX_PATTERNS } from '../constants';
import { generateUniqueId } from '../utils/id-generator';

export const extractHeadingInfo = (element: HTMLHeadingElement): HeadingInfo => {
  const level = Number(element.tagName.charAt(1)) as HeadingLevel;
  const text = (element.textContent || '').trim();
  const id = element.id || '';

  return {
    id,
    text,
    level,
    element,
  };
};

export const filterHeadingsByLevel = (
  headings: readonly HeadingInfo[],
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel,
): readonly HeadingInfo[] => {
  return headings.filter((heading) => heading.level >= minLevel && heading.level <= maxLevel);
};

/**
 * Wikipediaのアンカー生成ルールを実装
 * マルチバイト文字は%エンコードし、%を.に変換する
 * 通常スタイルでは&文字と空白を除去する
 */
export const generateAnchorText = (text: string, useWikipediaStyle: boolean): string => {
  if (text.length === 0) {
    return '';
  }

  let baseAnchor = text.trim().replaceAll(REGEX_PATTERNS.WHITESPACE, '_').replaceAll(REGEX_PATTERNS.COLON, '');

  if (useWikipediaStyle) {
    return encodeURIComponent(baseAnchor).replaceAll('%', '.');
  }

  baseAnchor = baseAnchor.replaceAll(REGEX_PATTERNS.AMPERSAND, '').replaceAll(REGEX_PATTERNS.AMPERSAND_HTML, '');

  return baseAnchor;
};

export const assignUniqueIds = (
  headings: readonly HeadingInfo[],
  useWikipediaStyle: boolean,
): readonly HeadingInfo[] => {
  const usedIds = new Set<string>();

  return headings.map((heading) => {
    const baseId = generateAnchorText(heading.text, useWikipediaStyle);
    const uniqueId = generateUniqueId(baseId, usedIds);

    return {
      ...heading,
      id: uniqueId,
    };
  });
};

export const generateHref = (id: string): string => {
  return `#${id}`;
};

export const extractHeadingsInfo = (elements: readonly HTMLHeadingElement[]): readonly HeadingInfo[] => {
  return elements.map((element) => extractHeadingInfo(element));
};
