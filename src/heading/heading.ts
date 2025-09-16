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
const HEADING_DUPLICATE_SUFFIX_PATTERN = /_\d+$/;

/**
 * 見出し要素のIDが重複している場合に一意になるよう修正し、関連する目次アンカーのhrefも更新する
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
