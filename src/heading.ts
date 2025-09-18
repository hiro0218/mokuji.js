/**
 * 見出し処理の統合モジュール
 * フィルタリング、ID管理、テキスト変換を一元化する
 */

import { getAllHeadingElements } from './utils/dom';
import type { HeadingLevel } from './types';

// ========================================
// Constants & Patterns
// ========================================

/**
 * テキスト処理とアンカーテキスト生成に使用する正規表現・記号
 */
const WHITESPACE_PATTERN = /\s+/g;
const COLON_CHARACTER = ':';
const AMPERSAND_PATTERN = /&+/g;
const AMPERSAND_ENTITY_PATTERN = /&amp;+/g;
const PERCENT_ENCODING_PATTERN = /%+/g;
const DOT_REPLACEMENT = '.';

/**
 * URLエンコード文字列の妥当性をチェックする正規表現
 */
const VALID_PERCENT_ENCODING = /%[0-9A-F]{2}/gi;
const INVALID_PERCENT_PATTERN = /%[^0-9A-F]|%[0-9A-F][^0-9A-F]|%$/i;

const HEADING_DUPLICATE_SUFFIX_PATTERN = /_\d+$/;

// h1、h6 の許容範囲とフォールバックレベル
const MIN_HEADING_LEVEL: HeadingLevel = 1;
const MAX_HEADING_LEVEL: HeadingLevel = 6;
const FALLBACK_HEADING_LEVEL = MAX_HEADING_LEVEL;

// ========================================
// Text Processing Functions
// ========================================

/**
 * テキスト内のスペースをアンダースコアに置換し、コロンを除去する
 */
const replaceSpacesWithUnderscores = (text: string): string => {
  return text.replaceAll(WHITESPACE_PATTERN, '_').replace(COLON_CHARACTER, '');
};

/**
 * テキストをWikipediaスタイルのアンカー形式に変換する
 */
const convertToWikipediaStyleAnchor = (anchor: string): string => {
  return encodeURIComponent(anchor).replaceAll(PERCENT_ENCODING_PATTERN, DOT_REPLACEMENT);
};

/**
 * アンカーテキストを生成する
 */
export const generateAnchorText = (baseId: string, isConvertToWikipediaStyleAnchor: boolean): string => {
  let anchorText = replaceSpacesWithUnderscores(baseId);

  if (isConvertToWikipediaStyleAnchor) {
    anchorText = convertToWikipediaStyleAnchor(anchorText);
  }

  if (!isConvertToWikipediaStyleAnchor && anchorText.includes('&')) {
    anchorText = anchorText.replaceAll(AMPERSAND_PATTERN, '').replaceAll(AMPERSAND_ENTITY_PATTERN, '');
  }

  return anchorText;
};

/**
 * URIコンポーネントを安全にデコードする
 */
const safeDecodeURIComponent = (encoded: string): string => {
  if (!VALID_PERCENT_ENCODING.test(encoded)) {
    return encoded;
  }

  if (INVALID_PERCENT_PATTERN.test(encoded)) {
    return encoded;
  }

  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

// ========================================
// Heading ID Management
// ========================================

/**
 * 見出し要素にIDを割り当てる
 */
export const assignInitialIdToHeading = (
  heading: HTMLHeadingElement,
  isConvertToWikipediaStyleAnchor: boolean,
): string => {
  const existingId = heading.getAttribute('id')?.trim();
  if (existingId) {
    heading.id = existingId;
    return existingId;
  }

  const baseHeadingId = (heading.textContent || '').trim();
  const anchorText = generateAnchorText(baseHeadingId, isConvertToWikipediaStyleAnchor);
  heading.id = anchorText;
  return anchorText;
};

/**
 * 見出し要素のID重複を解決してアンカーを更新する
 */
export const ensureUniqueHeadingIds = (headings: HTMLHeadingElement[], anchors: HTMLAnchorElement[]) => {
  const anchorList = [...anchors];
  const headingIdOccurrenceMap = new Map<string, number>();

  for (const [i, heading] of headings.entries()) {
    const anchor = anchorList[i];

    const currentHeadingId = heading.id;
    const decodedHeadingId = safeDecodeURIComponent(currentHeadingId);
    const baseHeadingId = decodedHeadingId.replace(HEADING_DUPLICATE_SUFFIX_PATTERN, '') || decodedHeadingId;
    const normalizedBase = baseHeadingId || `mokuji-heading-${i}`;

    const occurrenceCount = headingIdOccurrenceMap.get(normalizedBase) || 0;

    let resolvedId = currentHeadingId;

    if (occurrenceCount > 0 || !resolvedId) {
      resolvedId = `${normalizedBase}_${occurrenceCount}`;
      heading.id = resolvedId;
    }

    if (anchor) {
      anchor.href = `#${resolvedId}`;
    }

    headingIdOccurrenceMap.set(normalizedBase, occurrenceCount + 1);
  }
};

// ========================================
// Heading Level Functions
// ========================================

/**
 * 見出し要素のレベルを数値として取得する
 */
export const getHeadingLevel = (heading: HTMLHeadingElement): HeadingLevel => {
  const numericLevel = Number.parseInt(heading.tagName.slice(1), 10);
  if (numericLevel >= MIN_HEADING_LEVEL && numericLevel <= MAX_HEADING_LEVEL) {
    return numericLevel as HeadingLevel;
  }
  return FALLBACK_HEADING_LEVEL;
};

// ========================================
// Heading Filtering Functions
// ========================================

/**
 * 指定したレベル範囲内の見出し要素を取得する
 */
export const getFilteredHeadings = (
  element: Element,
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel,
): HTMLHeadingElement[] => {
  const filteredHeadings: HTMLHeadingElement[] = [];
  const allHeadings = getAllHeadingElements(element);

  for (const heading of allHeadings) {
    const level = getHeadingLevel(heading);
    if (level >= minLevel && level <= maxLevel) {
      filteredHeadings.push(heading);
    }
  }

  return filteredHeadings;
};
