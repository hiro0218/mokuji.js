/**
 * 見出し処理のドメインロジック
 * DOM操作から分離された不変データ操作
 */

import type { HeadingInfo, HeadingLevel } from '../types/core';

/**
 * 見出し要素から構造化データを抽出
 */
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

/**
 * 指定レベル範囲の見出しのみを抽出
 */
export const filterHeadingsByLevel = (
  headings: readonly HeadingInfo[],
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel,
): readonly HeadingInfo[] => {
  return headings.filter((heading) => heading.level >= minLevel && heading.level <= maxLevel);
};

/**
 * スタイル設定に応じたアンカーテキスト生成
 * パフォーマンス最適化: 正規表現を事前コンパイル & 単一パス処理
 */
const WHITESPACE_REGEX = /\s+/g;
const COLON_REGEX = /:/g;
const AMPERSAND_REGEX = /&+/g;
const AMPERSAND_HTML_REGEX = /&amp;+/g;

export const generateAnchorText = (text: string, useWikipediaStyle: boolean): string => {
  if (text.length === 0) {
    return '';
  }

  // 単一パスで文字列変換
  let baseAnchor = text.trim().replaceAll(WHITESPACE_REGEX, '_').replaceAll(COLON_REGEX, '');

  if (useWikipediaStyle) {
    return encodeURIComponent(baseAnchor).replaceAll('%', '.');
  }

  // 通常スタイルの場合、&文字の処理を単一パスで実行
  baseAnchor = baseAnchor.replaceAll(AMPERSAND_REGEX, '').replaceAll(AMPERSAND_HTML_REGEX, '');

  return baseAnchor;
};

/**
 * 見出し情報の配列から重複のない一意なIDを持つ新しい配列を生成する純粋関数
 */
export const assignUniqueIds = (
  headings: readonly HeadingInfo[],
  useWikipediaStyle: boolean,
): readonly HeadingInfo[] => {
  const usedIds = new Set<string>();

  return headings.map((heading) => {
    const baseId = generateAnchorText(heading.text, useWikipediaStyle);
    let uniqueId = baseId;
    let suffix = 1;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}_${suffix++}`;
    }
    usedIds.add(uniqueId);

    return {
      ...heading,
      id: uniqueId,
    };
  });
};

/**
 * IDからアンカーhrefを生成する純粋関数
 */
export const generateHref = (id: string): string => {
  return `#${id}`;
};

/**
 * 見出し要素の配列から見出し情報の配列を生成する純粋関数
 */
export const extractHeadingsInfo = (elements: readonly HTMLHeadingElement[]): readonly HeadingInfo[] => {
  return elements.map((element) => extractHeadingInfo(element));
};
