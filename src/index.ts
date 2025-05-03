/**
 * 目次生成のためのメインエントリーポイント
 */

import { createElement } from './common/dom';
import type { MokujiOption, HeadingLevel } from './common/types';
import { usedHeadingIds } from './heading/text';
import { getFilteredHeadings, ensureUniqueHeadingIds } from './heading/heading';
import { generateAnchorsMap, insertAnchorToHeadings } from './anchor/anchor';
import { generateTableOfContents } from './toc/core';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, ANCHOR_DATASET_ATTRIBUTE, defaultOptions } from './common/constants';

/**
 * 目次生成の結果型定義
 */
export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  /** 目次が生成された元の要素（オプション） */
  element?: T;
  /** 生成された目次のリスト要素 */
  list: HTMLUListElement | HTMLOListElement;
};

export { MokujiOption, HeadingLevel };

/**
 * オプション設定を処理し、有効な範囲内に制限する
 *
 * @param externalOptions 外部から指定されたオプション
 * @returns 処理された有効なオプション
 */
const processOptions = (externalOptions?: MokujiOption) => {
  // オプションをマージ
  const options = {
    ...defaultOptions,
    ...externalOptions,
  };

  // minLevelとmaxLevelの値を有効範囲内に制限する
  options.minLevel = Math.max(1, Math.min(options.minLevel || 1, 6)) as HeadingLevel;
  options.maxLevel = Math.max(options.minLevel || 1, Math.min(options.maxLevel || 6, 6)) as HeadingLevel;

  return options;
};

/**
 * 目次とアンカーを生成する
 *
 * @param filteredHeadings フィルタリングされた見出し要素の配列
 * @param options 目次生成オプション
 * @returns 生成された目次コンテナとアンカー要素の配列
 */
const generateTocAndAnchors = (filteredHeadings: HTMLHeadingElement[], options: Required<MokujiOption>) => {
  // 目次コンテナを作成
  const listContainer = createElement(options.anchorContainerTagName);
  listContainer.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

  // 目次を生成
  generateTableOfContents(filteredHeadings, listContainer, options.anchorType);

  // アンカー要素を一度に取得（効率化）
  const anchors = [...listContainer.querySelectorAll('a')];

  return { listContainer, anchors };
};

/**
 * 与えられた要素内の見出しから目次を生成する
 *
 * @param element 目次を生成する対象のHTML要素
 * @param externalOptions 目次生成オプション
 * @returns 生成された目次情報。要素が見つからないか見出しがない場合はundefined
 */
export const Mokuji = <T extends HTMLElement>(
  element: T | null,
  externalOptions?: MokujiOption,
): MokujiResult<T> | undefined => {
  if (!element) {
    return;
  }

  // オプションを処理
  const options = processOptions(externalOptions);

  // ヘッダー要素を取得し、レベルでフィルタリング
  const { minLevel, maxLevel } = options;
  // 元の要素から直接見出し要素を取得
  const filteredHeadings = getFilteredHeadings(element, minLevel, maxLevel);

  if (filteredHeadings.length === 0) {
    return;
  }

  // 目次とアンカーを生成
  const { listContainer, anchors } = generateTocAndAnchors(filteredHeadings, options);

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

  // 元の要素を返す（修正済み）
  return { element, list: listContainer };
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
