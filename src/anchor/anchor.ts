/**
 * 見出し横へのアンカーリンク挿入に関する処理を提供するモジュール
 */

import { createElement, removeAllElements } from '../common/dom';
import { ANCHOR_DATASET_ATTRIBUTE } from '../common/constants';
import type { MokujiOption, AnchorLinkPosition } from '../common/types';

/**
 * 目次内のアンカー要素から、そのhrefのハッシュ値をキーとするマップを作成する
 */
export const generateAnchorsMap = (anchors: HTMLAnchorElement[]): Map<string, HTMLAnchorElement> => {
  const result = new Map<string, HTMLAnchorElement>();

  for (const anchor of anchors) {
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
  removeAllElements(existingAnchors);
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
 * アンカーマップから直接IDで検索
 */
const findAnchorById = (anchorMap: Map<string, HTMLAnchorElement>, id: string): HTMLAnchorElement | undefined => {
  return anchorMap.get(id);
};

/**
 * 数字サフィックスを除去したIDで検索
 */
const findAnchorByIdWithoutSuffix = (
  anchorMap: Map<string, HTMLAnchorElement>,
  id: string,
): HTMLAnchorElement | undefined => {
  // IDが「ID_数字」の形式かチェックする（重複により変更されたIDの場合）
  const idWithoutSuffix = id.replace(/_\d+$/, '');
  if (idWithoutSuffix !== id) {
    // サフィックスを取り除いた元のIDでアンカーを検索
    return anchorMap.get(idWithoutSuffix);
  }
  return undefined;
};

/**
 * テキスト内容で検索
 */
const findAnchorByText = (anchorMap: Map<string, HTMLAnchorElement>, text: string): HTMLAnchorElement | undefined => {
  const trimmedText = text.trim();
  if (!trimmedText) return undefined;

  // アンカーマップ内をテキスト内容で検索
  for (const [, anchor] of anchorMap.entries()) {
    if (anchor.textContent?.trim() === trimmedText) {
      return anchor;
    }
  }
  return undefined;
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

  // 3段階のフォールバックで対応するアンカーを検索
  // 1. 直接ID検索 → 2. サフィックス除去後の検索 → 3. テキスト内容での検索
  const matchedTocAnchor =
    findAnchorById(anchorMap, headingId) ||
    findAnchorByIdWithoutSuffix(anchorMap, headingId) ||
    findAnchorByText(anchorMap, heading.textContent || '');

  // 最終的にもマッチするアンカーが見つからなかった場合
  if (!matchedTocAnchor) {
    return undefined;
  }

  const anchorElement = anchorTemplate.cloneNode(false) as HTMLAnchorElement;
  anchorElement.href = matchedTocAnchor.hash;
  anchorElement.textContent = options.anchorLinkSymbol;

  return anchorElement;
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
  for (const heading of headings) {
    removeExistingAnchors(heading);
    const anchor = createAnchorForHeading(heading, anchorMap, anchorTemplate, options);
    if (!anchor) continue;

    placeAnchorInHeading(heading, anchor, options.anchorLinkPosition);
  }
};
