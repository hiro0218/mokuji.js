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
  const result = new Map<string, HTMLAnchorElement>();

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    if (anchor.hash && anchor.hash.length > 1) {
      result.set(anchor.hash.slice(1), anchor);
    }
  }

  return result;
};

/**
 * 要素に複数のクラス名を適用する
 */
const applyClassNamesToElement = (element: HTMLElement, classNameString: string): void => {
  const trimmedClassNames = classNameString.trim();
  if (!trimmedClassNames) return;

  element.classList.add(...trimmedClassNames.split(/\s+/).filter(Boolean));
};

/**
 * アンカーテンプレート要素を作成する
 */
const createAnchorTemplate = (options: Required<MokujiOption>): HTMLAnchorElement => {
  const anchorTemplate = createElement('a');
  anchorTemplate.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  // anchorLinkClassNameが空文字列の場合でもクラス名適用処理を実行する
  // 空文字列の場合はapplyClassNamesToElement内で早期リターンされる
  applyClassNamesToElement(anchorTemplate, options.anchorLinkClassName);

  return anchorTemplate;
};

/**
 * 既存の目次アンカーを見出しから取り除き、重複挿入を防ぐ
 */
const removeExistingAnchors = (heading: HTMLHeadingElement): void => {
  const existingAnchors = heading.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  for (let i = 0; i < existingAnchors.length; i++) {
    existingAnchors[i].remove();
  }
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
): HTMLAnchorElement | undefined => {
  const headingId = heading.id;
  let matchedTocAnchor = anchorMap.get(headingId);

  // headingIdから直接対応するアンカーが見つからない場合
  if (!matchedTocAnchor) {
    // IDが「ID_数字」の形式かチェックする（重複により変更されたIDの場合）
    const idWithoutSuffix = headingId.replace(/_\d+$/, '');
    if (idWithoutSuffix !== headingId) {
      // サフィックスを取り除いた元のIDでアンカーを検索
      matchedTocAnchor = anchorMap.get(idWithoutSuffix);
    }

    // それでも見つからない場合はテキスト内容をベースに検索
    if (!matchedTocAnchor) {
      const headingText = heading.textContent?.trim() || '';
      // アンカーマップ内をテキスト内容で検索
      for (const [, anchor] of anchorMap.entries()) {
        if (anchor.textContent?.trim() === headingText) {
          matchedTocAnchor = anchor;
          break;
        }
      }
    }

    // 最終的にもマッチするアンカーが見つからなかった場合
    if (!matchedTocAnchor) {
      return undefined;
    }
  }

  const anchorElement = anchorTemplate.cloneNode(false) as HTMLAnchorElement;
  anchorElement.href = matchedTocAnchor.hash;

  anchorElement.textContent = options.anchorLinkSymbol;

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
 * 見出し要素にアンカーリンクを追加する
 */
export const insertAnchorToHeadings = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  options: Required<MokujiOption>,
): void => {
  const anchorTemplate = createAnchorTemplate(options);

  const headingsByParent = new Map<Node, HeadingAnchorPair[]>();

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    removeExistingAnchors(heading);
    const pair = createHeadingAnchorPair(heading, anchorMap, anchorTemplate, options);
    if (!pair || !pair.heading.parentNode) continue;

    const parent = pair.heading.parentNode;
    const existingPairs = headingsByParent.get(parent) || [];
    existingPairs.push(pair);
    headingsByParent.set(parent, existingPairs);
  }

  for (const [, headingsWithAnchors] of headingsByParent.entries()) {
    for (let j = 0; j < headingsWithAnchors.length; j++) {
      const { heading, anchor } = headingsWithAnchors[j];
      placeAnchorInHeading(heading, anchor, options.anchorLinkPosition);
    }
  }
};
