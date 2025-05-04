/**
 * 見出し要素の処理（ID割り当て、フィルタリング、重複解決）に関するユーティリティを提供するモジュール
 */
import { generateAnchorText } from './text';
import { getAllHeadingElements } from '../common/dom';
import type { HeadingLevel } from '../common/types';

/**
 * URLエンコード文字列の妥当性をチェックする正規表現
 * %の後に2桁の16進数が続くパターンが正しいものとみなす
 */
const VALID_PERCENT_ENCODING = /%[0-9A-F]{2}/gi;
const INVALID_PERCENT_PATTERN = /%[^0-9A-F]|%[0-9A-F][^0-9A-F]|%$/i;

/**
 * URIコンポーネントを安全にデコードする（例外を発生させない）
 * 不正なエンコーディングの場合は元の文字列を返す
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
    const level = Number(heading.tagName.at(1)) as HeadingLevel;
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
    if (anchor.hash && anchor.hash.length > 1) {
      const rawHeadingId = anchor.hash.slice(1);
      const headingId = safeDecodeURIComponent(rawHeadingId);

      const anchorsForId = idToAnchorsMap.get(headingId) || [];
      anchorsForId.push(anchor);
      idToAnchorsMap.set(headingId, anchorsForId);
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

      const originalIdDecoded = safeDecodeURIComponent(currentHeadingId);

      if (originalIdDecoded) {
        const matchingAnchors = idToAnchorsMap.get(originalIdDecoded) || [];
        for (let j = 0; j < matchingAnchors.length; j++) {
          const anchor = matchingAnchors[j];
          anchor.href = `#${uniqueHeadingId}`;
        }
      }
    }

    headingIdOccurrenceMap.set(heading.id, occurrenceCount + 1);
  }
};
