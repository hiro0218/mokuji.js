/**
 * 見出し横へのアンカーリンク挿入に関する処理を提供するモジュール
 */

import { createElement } from '../common/dom';
import { ANCHOR_DATASET_ATTRIBUTE } from '../common/constants';
import type { MokujiOption, AnchorLinkPosition } from '../common/types';

/**
 * 目次内のアンカー要素から、そのhrefのハッシュ値をキーとするマップを作成する
 */
export const generateAnchorsMap = (anchors: HTMLAnchorElement[]): Map<string, HTMLAnchorElement> => {
  const anchorMap = new Map<string, HTMLAnchorElement>();

  for (let i = 0; i < anchors.length; i++) {
    const anchorId = anchors[i].hash.slice(1);
    if (anchorId) {
      anchorMap.set(anchorId, anchors[i]);
    }
  }

  return anchorMap;
};

/**
 * 要素に複数のクラス名を適用する
 */
const applyClassNamesToElement = (element: HTMLElement, classNameString: string): void => {
  const trimmedClassNames = classNameString.trim();
  if (!trimmedClassNames) return;

  for (const className of trimmedClassNames.split(/\s+/)) {
    const trimmedClass = className.trim();
    if (trimmedClass) {
      element.classList.add(trimmedClass);
    }
  }
};

/**
 * アンカーテンプレート要素を作成する
 */
const createAnchorTemplate = (options: Required<MokujiOption>): HTMLAnchorElement => {
  const anchorTemplate = createElement('a');
  anchorTemplate.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  if (options.anchorLinkClassName) {
    applyClassNamesToElement(anchorTemplate, options.anchorLinkClassName);
  }

  return anchorTemplate;
};

/**
 * 見出し要素内の指定した位置にアンカー要素を挿入する
 */
const placeAnchorInHeading = (
  heading: HTMLHeadingElement,
  anchor: HTMLAnchorElement,
  position: AnchorLinkPosition = 'before',
): void => {
  if (position === 'before') {
    heading.insertBefore(anchor, heading.firstChild);
  } else {
    heading.append(anchor);
  }
};

/**
 * ある見出し要素に対応するアンカー要素を作成する
 */
const createAnchorForHeading = (
  heading: HTMLHeadingElement,
  anchorMap: Map<string, HTMLAnchorElement>,
  anchorTemplate: HTMLAnchorElement,
  options: Required<MokujiOption>,
): HTMLAnchorElement | null => {
  const headingId = heading.id;
  const matchedTocAnchor = anchorMap.get(headingId);

  if (!matchedTocAnchor) {
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const anchorElement = anchorTemplate.cloneNode(false) as HTMLAnchorElement;
  anchorElement.href = matchedTocAnchor.hash;

  if (options.anchorLinkSymbol) {
    anchorElement.textContent = options.anchorLinkSymbol;
  }

  return anchorElement;
};

/**
 * 見出しと、それに対応する見出し横アンカーのペア
 */
type HeadingAnchorPair = {
  heading: HTMLHeadingElement;
  anchor: HTMLAnchorElement;
};

/**
 * 有効な見出しとアンカーのペアを作成する
 */
const createHeadingAnchorPair = (
  heading: HTMLHeadingElement,
  anchorMap: Map<string, HTMLAnchorElement>,
  anchorTemplate: HTMLAnchorElement,
  options: Required<MokujiOption>,
): HeadingAnchorPair | undefined => {
  if (!heading.parentNode) return undefined;

  const anchor = createAnchorForHeading(heading, anchorMap, anchorTemplate, options);
  if (!anchor) return undefined;

  return { heading, anchor };
};

/**
 * 見出しとアンカーのペアを、親要素をキーとするマップに追加する
 */
const addPairToParentMap = (pair: HeadingAnchorPair, headingsByParent: Map<Node, HeadingAnchorPair[]>): void => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parent = pair.heading.parentNode!;

  if (!headingsByParent.has(parent)) {
    headingsByParent.set(parent, []);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  headingsByParent.get(parent)!.push(pair);
};

/**
 * 見出し要素を親要素ごとにグループ化し、対応するアンカーと共に格納する
 */
const groupHeadingsByParent = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  anchorTemplate: HTMLAnchorElement,
  options: Required<MokujiOption>,
): Map<Node, HeadingAnchorPair[]> => {
  const headingsByParent = new Map<Node, HeadingAnchorPair[]>();
  for (let i = 0; i < headings.length; i++) {
    const pair = createHeadingAnchorPair(headings[i], anchorMap, anchorTemplate, options);
    if (pair) {
      addPairToParentMap(pair, headingsByParent);
    }
  }
  return headingsByParent;
};

/**
 * 親要素ごとにグループ化された見出しに、対応するアンカーを挿入する
 */
const insertAnchorsToGroups = (
  headingsByParent: Map<Node, HeadingAnchorPair[]>,
  position: AnchorLinkPosition = 'before',
): void => {
  for (const [, headingsWithAnchors] of headingsByParent.entries()) {
    for (const { heading, anchor } of headingsWithAnchors) {
      placeAnchorInHeading(heading, anchor, position);
    }
  }
};

/**
 * 見出し要素にアンカーリンクを追加する
 */
export const insertAnchorToHeadings = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  options: Required<MokujiOption>,
): void => {
  const anchorTemplate = createAnchorTemplate(options);
  const headingsByParent = groupHeadingsByParent(headings, anchorMap, anchorTemplate, options);
  insertAnchorsToGroups(headingsByParent, options.anchorLinkPosition);
};
