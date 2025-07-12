/**
 * 見出し処理のビジネスロジック
 * Wikipediaスタイルとの互換性保持が重要な設計要件
 */

import type { HeadingInfo, HeadingLevel } from '../../types/core';
import { REGEX_PATTERNS } from '../../constants';
import { generateUniqueId } from '../../utils/id-generator';

/**
 * 見出し抽出オプションの型定義
 */
type HeadingExtractOptions = {
  filterByLevel?: boolean;
  minLevel?: HeadingLevel;
  maxLevel?: HeadingLevel;
  generateId?: boolean;
  usedIds?: Set<string>;
  anchorType?: boolean;
};

/**
 * 見出し要素から情報を抽出する拡張関数
 * オプションによって様々なモードでの抽出をサポート
 */
export const extractHeadingInfo = (
  element: HTMLHeadingElement,
  options?: HeadingExtractOptions,
): HeadingInfo | undefined => {
  const level = Number(element.tagName.charAt(1)) as HeadingLevel;

  // レベルフィルタリングが有効な場合
  if (options?.filterByLevel && (level < (options.minLevel || 1) || level > (options.maxLevel || 6))) {
    return undefined;
  }

  const text = (element.textContent || '').trim();
  let id = element.id || '';

  // ID生成が必要な場合
  if (options?.generateId && options?.usedIds) {
    const baseId = generateAnchorText(text, options.anchorType || false);
    id = generateUniqueId(baseId, options.usedIds);
  }

  return { id, text, level, element };
};

/**
 * 単純な見出し情報の抽出（以前のバージョン互換用）
 */
export const extractSimpleHeadingInfo = (element: HTMLHeadingElement): HeadingInfo => {
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

/**
 * 見出し要素群に一括でユニークIDを割り当てる
 * 注意: 既存のIDがある場合は上書きされる
 */
export const assignUniqueIds = (
  headings: readonly HeadingInfo[],
  useWikipediaStyle: boolean,
): readonly HeadingInfo[] => {
  const usedIds = new Set<string>();

  return headings.map((heading) => {
    // 既存のIDがある場合と無い場合で分岐
    if (heading.id.trim()) {
      usedIds.add(heading.id); // 既存IDをセットに追加
      return heading;
    }

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
  return elements.map((element) => extractSimpleHeadingInfo(element));
};
