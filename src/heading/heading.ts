/**
 * 見出し要素の処理に関するユーティリティを提供するモジュール
 */

import { generateUniqueHeadingId, generateAnchorText } from './text';
import { getAllHeadingElements } from '../common/dom';
import type { HeadingLevel } from '../common/types';

/**
 * 見出し要素にIDを割り当てる
 *
 * @param heading ID割り当て対象の見出し要素
 * @param isConvertToWikipediaStyleAnchor Wikipediaスタイルのアンカー変換を行うかどうかのフラグ
 * @returns 生成されたアンカーテキスト
 */
export const assignIdToHeading = (heading: HTMLHeadingElement, isConvertToWikipediaStyleAnchor: boolean) => {
  const headingText = generateUniqueHeadingId(heading.textContent || '');
  const anchorText = generateAnchorText(headingText, isConvertToWikipediaStyleAnchor);
  heading.id = anchorText;
  return anchorText;
};

/**
 * 見出し要素からリスト要素を作成する
 *
 * @param anchorText アンカーテキスト
 * @param heading 対象の見出し要素
 * @param listItemTemplate リスト項目のテンプレート要素
 * @param anchorTemplate アンカーのテンプレート要素
 * @returns 生成されたリスト要素
 */
export const createListElement = (
  anchorText: string,
  heading: HTMLHeadingElement,
  listItemTemplate: HTMLLIElement,
  anchorTemplate: HTMLAnchorElement,
) => {
  const elementList = listItemTemplate.cloneNode(false) as HTMLLIElement;
  const elementAnchor = anchorTemplate.cloneNode(false) as HTMLAnchorElement;

  elementAnchor.href = `#${encodeURIComponent(anchorText)}`;
  elementAnchor.textContent = heading.textContent;
  elementList.append(elementAnchor);

  return elementList;
};

/**
 * 指定したレベル範囲内の見出し要素を取得する
 *
 * @param element 検索対象の親要素
 * @param minLevel 最小見出しレベル（例: 1はh1を表す）
 * @param maxLevel 最大見出しレベル（例: 6はh6を表す）
 * @returns フィルタリングされた見出し要素の配列
 */
export const getFilteredHeadings = (
  element: Element,
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel,
): HTMLHeadingElement[] => {
  const filteredHeadings: HTMLHeadingElement[] = [];
  const allHeadings = getAllHeadingElements(element);

  for (let i = 0; i < allHeadings.length; i++) {
    const heading = allHeadings[i];
    const level = Number(heading.tagName[1]) as HeadingLevel;
    if (level >= minLevel && level <= maxLevel) {
      filteredHeadings.push(heading);
    }
  }

  return filteredHeadings;
};

/**
 * アンカー要素をIDごとにグループ化する
 *
 * @param anchors グループ化するアンカー要素の配列
 * @returns IDをキーとしたアンカー要素の配列を値とするマップ
 */
const groupAnchorsByHeadingId = (anchors: HTMLAnchorElement[]): Map<string, HTMLAnchorElement[]> => {
  const idToAnchorsMap = new Map<string, HTMLAnchorElement[]>();

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    const headingId = decodeURIComponent(anchor.hash.slice(1));
    const anchorsForId = idToAnchorsMap.get(headingId) || [];
    anchorsForId.push(anchor);
    idToAnchorsMap.set(headingId, anchorsForId);
  }

  return idToAnchorsMap;
};

/**
 * 重複IDを持つ見出しに新しいIDを割り当てる
 *
 * @param heading 見出し要素
 * @param originalHeadingId 元のID
 * @param occurrenceCount 出現回数
 * @param matchingAnchors 対応するアンカー要素の配列
 */
const assignUniqueIdToHeading = (
  heading: HTMLHeadingElement,
  originalHeadingId: string,
  occurrenceCount: number,
  matchingAnchors: HTMLAnchorElement[],
): void => {
  // 重複IDの場合のみ処理
  if (occurrenceCount > 0) {
    const uniqueHeadingId = `${originalHeadingId}-${occurrenceCount}`;
    heading.id = uniqueHeadingId;

    // 対応するアンカー要素のhrefを更新
    for (let i = 0; i < matchingAnchors.length; i++) {
      const anchor = matchingAnchors[i];
      anchor.href = `#${encodeURIComponent(uniqueHeadingId)}`;
    }
  }
};

/**
 * 見出し要素のIDが重複している場合に一意になるよう修正する
 *
 * @param headings 処理対象の見出し要素配列
 * @param anchors 処理対象のアンカー要素配列
 */
export const ensureUniqueHeadingIds = (headings: HTMLHeadingElement[], anchors: HTMLAnchorElement[]) => {
  const headingIdOccurrenceMap = new Map<string, number>();
  const idToAnchorsMap = groupAnchorsByHeadingId(anchors);

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const originalHeadingId = heading.id;
    const occurrenceCount = headingIdOccurrenceMap.get(originalHeadingId) || 0;

    // 重複IDを持つ見出しに新しいIDを割り当てる
    const matchingAnchors = idToAnchorsMap.get(originalHeadingId) || [];
    assignUniqueIdToHeading(heading, originalHeadingId, occurrenceCount, matchingAnchors);

    // 出現回数をインクリメント
    headingIdOccurrenceMap.set(originalHeadingId, occurrenceCount + 1);
  }
};
