/**
 * アンカーリンク関連の処理を提供するモジュール
 */

import { createElement } from '../common/dom';
import { ANCHOR_DATASET_ATTRIBUTE } from '../common/constants';
import type { MokujiOption } from '../common/types';

/**
 * アンカー要素からアンカーIDへのマッピングを生成する
 *
 * @param anchors マッピングするアンカー要素の配列
 * @returns アンカーIDからアンカー要素へのマップ
 */
export const generateAnchorsMap = (anchors: HTMLAnchorElement[]) => {
  const anchorMap = new Map<string, HTMLAnchorElement>();

  for (let i = 0; i < anchors.length; i++) {
    const anchorId = anchors[i].hash.replace('#', '');
    anchorMap.set(anchorId, anchors[i]);
  }

  return anchorMap;
};

/**
 * 見出し要素にアンカーリンクを追加する
 *
 * @param headings アンカーリンクを追加する見出し要素の配列
 * @param anchorMap アンカーIDからアンカー要素へのマップ
 * @param options 目次生成オプション
 */
export const insertAnchorToHeadings = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  options: MokujiOption,
) => {
  const anchorTemplate = createElement('a');
  anchorTemplate.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  if (options.anchorLinkClassName) {
    const anchorLinkClassName = options.anchorLinkClassName.trim();
    const classNames = anchorLinkClassName.split(/\s+/);
    // 複数のクラス名の場合
    if (classNames.length > 1) {
      for (const className of classNames) {
        anchorTemplate.classList.add(className.trim());
      }
    } else {
      anchorTemplate.classList.add(anchorLinkClassName);
    }
  }

  // ヘディング要素ごとに処理を行うが、DOM操作はバッチ処理する
  // 同じ親を持つ見出し要素をグループ化して処理する
  const headingsByParent = new Map<Node, { heading: HTMLHeadingElement; anchor: HTMLAnchorElement }[]>();

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const matchedAnchor = anchorMap.get(encodeURIComponent(heading.id));

    if (!matchedAnchor || !heading.parentNode) {
      continue;
    }

    const anchorElement = anchorTemplate.cloneNode(false) as HTMLAnchorElement;
    anchorElement.setAttribute('href', matchedAnchor.hash);

    if (options.anchorLinkSymbol) {
      anchorElement.textContent = options.anchorLinkSymbol;
    }

    // 親要素ごとにグループ化
    const parent = heading.parentNode;
    if (!headingsByParent.has(parent)) {
      headingsByParent.set(parent, []);
    }
    headingsByParent.get(parent)?.push({ heading, anchor: anchorElement });
  }

  // 親要素ごとにDocumentFragmentを使用して一度にDOM操作を行う
  for (const [, headingsWithAnchors] of headingsByParent.entries()) {
    for (const { heading, anchor } of headingsWithAnchors) {
      // 設定に基づいてアンカーを配置
      if (options.anchorLinkPosition === 'before') {
        heading.insertBefore(anchor, heading.firstChild);
      } else {
        heading.append(anchor);
      }
    }
  }
};
