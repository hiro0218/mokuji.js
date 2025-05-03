/**
 * アンカーリンク関連の処理を提供するモジュール
 */

import { createElement } from '../common/dom';
import { ANCHOR_DATASET_ATTRIBUTE } from '../common/constants';
import type { MokujiOption, AnchorLinkPosition } from '../common/types';

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
 * 要素に複数のクラス名を適用する
 *
 * @param element クラスを適用する要素
 * @param classNameString スペース区切りのクラス名文字列
 */
const applyClassNamesToElement = (element: HTMLElement, classNameString: string): void => {
  const trimmedClassName = classNameString.trim();
  const classNames = trimmedClassName.split(/\s+/);

  // クラス名が複数ある場合は個別に追加、1つのみの場合はそのまま追加
  if (classNames.length > 1) {
    for (const className of classNames) {
      const trimmedClass = className.trim();
      if (trimmedClass) {
        element.classList.add(trimmedClass);
      }
    }
  } else if (trimmedClassName) {
    element.classList.add(trimmedClassName);
  }
};

/**
 * アンカーテンプレート要素を作成する
 *
 * @param options 目次生成オプション
 * @returns アンカーテンプレート要素
 */
const createAnchorTemplate = (options: MokujiOption): HTMLAnchorElement => {
  const anchorTemplate = createElement('a');
  anchorTemplate.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  if (options.anchorLinkClassName) {
    applyClassNamesToElement(anchorTemplate, options.anchorLinkClassName);
  }

  return anchorTemplate;
};

/**
 * 見出しにアンカー要素を配置する
 *
 * @param heading 見出し要素
 * @param anchor アンカー要素
 * @param position アンカーリンクの配置位置
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
 *
 * @param heading 見出し要素
 * @param anchorMap アンカーIDからアンカー要素へのマップ
 * @param anchorTemplate アンカーテンプレート
 * @param options 目次生成オプション
 * @returns 作成されたアンカー要素（対応するアンカーがない場合はnull）
 */
const createAnchorForHeading = (
  heading: HTMLHeadingElement,
  anchorMap: Map<string, HTMLAnchorElement>,
  anchorTemplate: HTMLAnchorElement,
  options: MokujiOption,
): HTMLAnchorElement | null => {
  const matchedAnchor = anchorMap.get(encodeURIComponent(heading.id));

  // アンカーが見つからない場合はnullを返す
  if (!matchedAnchor) {
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  // アンカー要素を複製して属性を設定
  const anchorElement = anchorTemplate.cloneNode(false) as HTMLAnchorElement;
  anchorElement.setAttribute('href', matchedAnchor.hash);

  if (options.anchorLinkSymbol) {
    anchorElement.textContent = options.anchorLinkSymbol;
  }

  return anchorElement;
};

/**
 * 見出し要素を親要素ごとにグループ化する
 *
 * @param headings 見出し要素の配列
 * @param anchorMap アンカーIDからアンカー要素へのマップ
 * @param anchorTemplate アンカーテンプレート
 * @param options 目次生成オプション
 * @returns 親ノードごとにグループ化された見出しとアンカーのペア
 */
const groupHeadingsByParent = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  anchorTemplate: HTMLAnchorElement,
  options: MokujiOption,
): Map<Node, Array<{ heading: HTMLHeadingElement; anchor: HTMLAnchorElement }>> => {
  const headingsByParent = new Map<Node, Array<{ heading: HTMLHeadingElement; anchor: HTMLAnchorElement }>>();

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];

    // 親要素がない場合はスキップ
    if (!heading.parentNode) {
      continue;
    }

    const anchor = createAnchorForHeading(heading, anchorMap, anchorTemplate, options);

    // アンカーが作成できなかった場合はスキップ
    if (!anchor) {
      continue;
    }

    // 親要素ごとにグループ化
    const parent = heading.parentNode;
    if (!headingsByParent.has(parent)) {
      headingsByParent.set(parent, []);
    }

    const pairs = headingsByParent.get(parent);
    if (pairs) {
      pairs.push({ heading, anchor });
    }
  }

  return headingsByParent;
};

/**
 * 見出し要素のグループにアンカーを挿入する
 *
 * @param headingsByParent 親要素ごとにグループ化された見出しとアンカーのペア
 * @param position アンカーリンクの配置位置
 */
const insertAnchorsToGroups = (
  headingsByParent: Map<Node, Array<{ heading: HTMLHeadingElement; anchor: HTMLAnchorElement }>>,
  position: AnchorLinkPosition = 'before',
): void => {
  // 親要素ごとにアンカーを挿入
  for (const [, headingsWithAnchors] of headingsByParent.entries()) {
    for (const { heading, anchor } of headingsWithAnchors) {
      placeAnchorInHeading(heading, anchor, position);
    }
  }
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
): void => {
  // アンカーテンプレートを作成
  const anchorTemplate = createAnchorTemplate(options);

  // 見出しとアンカーのペアを親要素ごとにグループ化
  const headingsByParent = groupHeadingsByParent(headings, anchorMap, anchorTemplate, options);

  // グループごとにアンカーを挿入
  insertAnchorsToGroups(headingsByParent, options.anchorLinkPosition);
};
