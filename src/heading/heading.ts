/**
 * 見出し要素の処理（ID割り当て、フィルタリング、重複解決）に関するユーティリティを提供するモジュール
 */
import { generateAnchorText } from './text';
import { getAllHeadingElements } from '../common/dom';
import type { HeadingLevel } from '../common/types';

/**
 * 見出し要素に初期ID（アンカーテキスト）を割り当てる
 * この時点ではIDの重複可能性があるため、後続の ensureUniqueHeadingIds で解決される。
 */
export const assignInitialIdToHeading = (
  heading: HTMLHeadingElement,
  isConvertToWikipediaStyleAnchor: boolean,
): string => {
  const baseHeadingId = (heading.textContent || '').trim();
  const anchorText = generateAnchorText(baseHeadingId, isConvertToWikipediaStyleAnchor);
  heading.id = anchorText;
  return anchorText;
};

/**
 * 見出し要素からリスト要素を作成する (目次用)
 */
export const createListElement = (
  anchorText: string,
  heading: HTMLHeadingElement,
  listItemTemplate: HTMLLIElement,
  anchorTemplate: HTMLAnchorElement,
): HTMLLIElement => {
  const elementList = listItemTemplate.cloneNode(false) as HTMLLIElement;
  const elementAnchor = anchorTemplate.cloneNode(false) as HTMLAnchorElement;

  elementAnchor.href = `#${anchorText}`;
  elementAnchor.textContent = heading.textContent;
  elementList.append(elementAnchor);

  return elementList;
};

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
 * アンカー要素をhrefのハッシュ値（デコード済み）ごとにグループ化する
 */
const groupAnchorsByHeadingId = (anchors: HTMLAnchorElement[]): Map<string, HTMLAnchorElement[]> => {
  const idToAnchorsMap = new Map<string, HTMLAnchorElement[]>();

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    try {
      if (anchor.hash && anchor.hash.length > 1) {
        const headingId = decodeURIComponent(anchor.hash.slice(1));
        const anchorsForId = idToAnchorsMap.get(headingId) || [];
        anchorsForId.push(anchor);
        idToAnchorsMap.set(headingId, anchorsForId);
      }
    } catch (error) {
      console.error(`Mokuji: Failed to decode anchor hash: ${anchor.hash}`, error);
    }
  }

  return idToAnchorsMap;
};

/**
 * 見出し要素のIDが重複している場合に一意になるよう修正し、関連する目次アンカーのhrefも更新する
 */
export const ensureUniqueHeadingIds = (headings: HTMLHeadingElement[], anchors: HTMLAnchorElement[]) => {
  const headingIdOccurrenceMap = new Map<string, number>();
  const idToAnchorsMap = groupAnchorsByHeadingId(anchors);

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const currentHeadingId = heading.id;
    const occurrenceCount = headingIdOccurrenceMap.get(currentHeadingId) || 0;

    if (occurrenceCount > 0) {
      const uniqueHeadingId = `${currentHeadingId}_${occurrenceCount}`;
      heading.id = uniqueHeadingId;

      let originalIdDecoded: string;
      try {
        originalIdDecoded = decodeURIComponent(currentHeadingId);
      } catch (error) {
        console.error(`Mokuji: Failed to decode original heading ID for anchor update: ${currentHeadingId}`, error);
        originalIdDecoded = '';
      }

      if (originalIdDecoded) {
        const matchingAnchors = idToAnchorsMap.get(originalIdDecoded) || [];
        for (const anchor of matchingAnchors) {
          anchor.href = `#${uniqueHeadingId}`;
        }
      }
    }

    headingIdOccurrenceMap.set(heading.id, occurrenceCount + 1);
  }
};
