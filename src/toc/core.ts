/**
 * 目次（もくじ）生成の中核ロジックを提供するモジュール
 */

import { createElement } from '../common/dom';
import { assignIdToHeading, createListElement } from '../heading/heading';

/**
 * 見出し要素から階層構造を持つ目次を生成する
 *
 * @param headings 処理対象の見出し要素配列
 * @param listContainer 目次を格納するコンテナ要素
 * @param isConvertToWikipediaStyleAnchor Wikipediaスタイルのアンカー生成を行うかどうかのフラグ
 */
export const generateTableOfContents = (
  headings: HTMLHeadingElement[],
  listContainer: HTMLUListElement | HTMLOListElement,
  isConvertToWikipediaStyleAnchor: boolean,
) => {
  let previousHeadingLevel = 0;
  const documentFragment = document.createDocumentFragment();
  let currentListContainer = listContainer;
  const listContainerStack: (HTMLUListElement | HTMLOListElement)[] = [listContainer];

  // リスト要素とアンカー要素のテンプレートを一度だけ作成（メモリ効率化）
  const listItemTemplate = createElement('li');
  const anchorTemplate = createElement('a');

  const headingsLength = headings.length;

  for (let i = 0; i < headingsLength; i++) {
    const heading = headings[i];
    const currentHeadingLevel = Number(heading.tagName[1]);

    // 見出しの階層に合わせてリストの階層を調整
    if (previousHeadingLevel !== 0) {
      if (previousHeadingLevel < currentHeadingLevel) {
        // 小見出しになった場合は階層を深くする
        const nestedListElement = createElement('ol');
        const lastListItem = currentListContainer.lastChild;

        if (lastListItem) {
          /** @memo lastChildはNodeなので、appendChildを使用する */
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          lastListItem.appendChild(nestedListElement);
          listContainerStack.push(nestedListElement);
          currentListContainer = nestedListElement;
        }
      } else if (previousHeadingLevel > currentHeadingLevel) {
        // 大見出しになった場合は階層を浅くする
        const levelsToGoUp = previousHeadingLevel - currentHeadingLevel;
        const stackLength = listContainerStack.length;
        const levelsToActuallyGoUp = Math.min(levelsToGoUp, stackLength - 1); // ルートを超えないように調整

        if (levelsToActuallyGoUp > 0) {
          // 一度に複数レベル上がる場合も効率的に処理
          const newStackIndex = stackLength - levelsToActuallyGoUp - 1;
          currentListContainer = listContainerStack[newStackIndex];
          // スタックも一度に調整
          listContainerStack.length = newStackIndex + 1;
        }
      }
    }

    // 見出しにIDを割り当て
    const anchorText = assignIdToHeading(heading, isConvertToWikipediaStyleAnchor);

    // リスト要素を作成してフラグメントに追加
    const listItem = createListElement(anchorText, heading, listItemTemplate, anchorTemplate);
    currentListContainer.append(listItem);

    previousHeadingLevel = currentHeadingLevel;
  }

  listContainer.append(documentFragment);
};
