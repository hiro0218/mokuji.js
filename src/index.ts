/**
 * 目次（もくじ）生成ライブラリのメインエントリーポイント
 */
import { createElement, removeAllElements } from './common/dom';
import type { MokujiOption, HeadingLevel } from './common/types';
import { getFilteredHeadings, ensureUniqueHeadingIds } from './heading/heading';
import { generateAnchorsMap, insertAnchorToHeadings } from './anchor/anchor';
import { generateTableOfContents } from './toc/core';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, ANCHOR_DATASET_ATTRIBUTE, defaultOptions } from './common/constants';

/**
 * 目次生成の結果型定義
 */
export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  element?: T;
  list: HTMLUListElement | HTMLOListElement;
};

// 型エクスポート
export { MokujiOption, HeadingLevel };

/**
 * オプション設定を処理し、デフォルト値とマージして有効な範囲内に制限する
 */
const processOptions = (externalOptions?: MokujiOption): Required<MokujiOption> => {
  const options = {
    ...defaultOptions,
    ...externalOptions,
  };

  options.minLevel = Math.max(1, Math.min(options.minLevel, 6)) as HeadingLevel;
  options.maxLevel = Math.max(options.minLevel, Math.min(options.maxLevel, 6)) as HeadingLevel;

  return options;
};

/**
 * 目次生成の主要ロジック（内部関数）
 */
const generateTocAndAnchorsInternal = (
  filteredHeadings: HTMLHeadingElement[],
  options: Required<MokujiOption>,
): { listContainer: HTMLUListElement | HTMLOListElement; anchors: HTMLAnchorElement[] } => {
  const listContainer = createElement(options.anchorContainerTagName);
  listContainer.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

  generateTableOfContents(filteredHeadings, listContainer, options.anchorType);

  const anchors = [...listContainer.querySelectorAll('a')];

  return { listContainer, anchors };
};

/**
 * 与えられた要素内の見出しから目次を生成する (公開API)
 */
export const Mokuji = <T extends HTMLElement>(
  element: T | undefined,
  externalOptions?: MokujiOption,
): MokujiResult<T> | undefined => {
  if (!element) {
    console.warn('Mokuji: Target element not found.');
    return undefined;
  }

  const options = processOptions(externalOptions);

  const { minLevel, maxLevel } = options;
  const filteredHeadings = getFilteredHeadings(element, minLevel, maxLevel);

  if (filteredHeadings.length === 0) {
    return undefined;
  }

  const { listContainer, anchors } = generateTocAndAnchorsInternal(filteredHeadings, options);

  if (anchors.length === 0) {
    return undefined;
  }

  ensureUniqueHeadingIds(filteredHeadings, anchors);

  if (options.anchorLink) {
    const anchorsMap = generateAnchorsMap(anchors);
    insertAnchorToHeadings(filteredHeadings, anchorsMap, options);
  }

  return { element, list: listContainer };
};

/**
 * 生成された目次とアンカーリンクを破棄（削除）する
 */
export const Destroy = (): void => {
  const mokujiAnchors = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  removeAllElements(mokujiAnchors);

  const tableOfContentsLists = document.querySelectorAll(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
  removeAllElements(tableOfContentsLists);
};
