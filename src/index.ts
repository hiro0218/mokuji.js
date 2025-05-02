/**
 * 目次（もくじ）生成のためのメインエントリーポイント
 */

import { createElement } from './common/dom';
import type { MokujiOption } from './common/types';
import { usedHeadingIds } from './heading/text';
import { getFilteredHeadings, ensureUniqueHeadingIds } from './heading/heading';
import { generateAnchorsMap, insertAnchorToHeadings } from './anchor/anchor';
import { generateTableOfContents } from './toc/core';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, ANCHOR_DATASET_ATTRIBUTE, defaultOptions } from './common/constants';

/**
 * 目次生成の結果型定義
 */
type ResultProps<T> =
  | {
      element?: T;
      list: HTMLUListElement | HTMLOListElement;
    }
  | undefined;

export { MokujiOption, ResultProps };

/**
 * 与えられた要素内の見出しから目次を生成する
 */
export const Mokuji = <T extends HTMLElement>(element: T | null, externalOptions?: MokujiOption): ResultProps<T> => {
  if (!element) {
    return;
  }

  // 要素のコピーを作成
  const modifiedElement = element.cloneNode(true) as T;

  // オプションをマージ
  const options = {
    ...defaultOptions,
    ...externalOptions,
  };

  // ヘッダー要素を取得し、レベルでフィルタリング
  const { minLevel, maxLevel } = options;
  const filteredHeadings = getFilteredHeadings(modifiedElement, minLevel, maxLevel);

  if (filteredHeadings.length === 0) {
    return;
  }

  // 目次コンテナを作成
  const listContainer = createElement(options.anchorContainerTagName);
  listContainer.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

  // 目次を生成
  generateTableOfContents(filteredHeadings, listContainer, options.anchorType);

  // アンカー要素を一度に取得（効率化）
  const anchors = [...listContainer.querySelectorAll('a')];

  if (anchors.length === 0) {
    return;
  }

  // 重複IDを修正
  ensureUniqueHeadingIds(filteredHeadings, anchors);

  // アンカーリンクを設定
  if (options.anchorLink) {
    const anchorsMap = generateAnchorsMap(anchors);
    insertAnchorToHeadings(filteredHeadings, anchorsMap, options);
  }

  return { element: modifiedElement, list: listContainer };
};

/**
 * 生成された目次とアンカーリンクを破棄する
 */
export const Destroy = () => {
  // アンカー要素を削除
  const mokujiAnchors = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  for (let i = mokujiAnchors.length - 1; i >= 0; i--) {
    const anchorElement = mokujiAnchors[i];
    anchorElement.remove();
  }

  // 目次リストを削除
  const tableOfContentsList = document.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
  if (tableOfContentsList) {
    tableOfContentsList.remove();
  }

  // 使用済みIDをクリア
  usedHeadingIds.clear();
};
