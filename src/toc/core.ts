/**
 * 目次生成の中核ロジックを提供するモジュール
 */

import { createElement } from '../common/dom';
import { assignIdToHeading, createListElement } from '../heading/heading';

/**
 * 目次コンテナの型
 */
type TableOfContentsContainer = HTMLUListElement | HTMLOListElement;

/**
 * リストコンテナを初期化する
 *
 * @param listContainer 親となるリストコンテナ
 * @returns 初期化されたリストコンテナとドキュメントフラグメント
 */
const initializeListContainer = (listContainer: TableOfContentsContainer) => {
  const documentFragment = document.createDocumentFragment();
  const currentListContainer = listContainer.cloneNode(false) as TableOfContentsContainer;
  documentFragment.append(currentListContainer);

  return { documentFragment, currentListContainer };
};

/**
 * 小見出しになった場合の階層調整を行う
 *
 * @param currentListContainer 現在のリストコンテナ
 * @param listContainerStack リストコンテナのスタック
 * @returns 更新されたリストコンテナ
 */
const adjustToDeepHeading = (
  currentListContainer: TableOfContentsContainer,
  listContainerStack: TableOfContentsContainer[],
): TableOfContentsContainer => {
  const nestedListElement = createElement('ol');
  const lastListItem = currentListContainer.lastChild;

  if (lastListItem) {
    (lastListItem as HTMLElement).append(nestedListElement);
    listContainerStack.push(nestedListElement);
    return nestedListElement;
  }

  return currentListContainer;
};

/**
 * 大見出しになった場合の階層調整を行う
 *
 * @param previousLevel 前の見出しレベル
 * @param currentLevel 現在の見出しレベル
 * @param listContainerStack リストコンテナのスタック
 * @returns 更新されたリストコンテナとそのインデックス
 */
const adjustToShallowHeading = (
  previousLevel: number,
  currentLevel: number,
  listContainerStack: TableOfContentsContainer[],
): { container: TableOfContentsContainer; newStackIndex: number } => {
  const levelsToGoUp = previousLevel - currentLevel;
  const stackLength = listContainerStack.length;
  const levelsToActuallyGoUp = Math.min(levelsToGoUp, stackLength - 1); // ルートを超えないように調整

  if (levelsToActuallyGoUp > 0) {
    // 一度に複数レベル上がる場合も効率的に処理
    const newStackIndex = stackLength - levelsToActuallyGoUp - 1;
    return {
      container: listContainerStack[newStackIndex],
      newStackIndex,
    };
  }

  return {
    container: listContainerStack[stackLength - 1],
    newStackIndex: stackLength - 1,
  };
};

/**
 * 見出しの階層レベルに基づいてリストコンテナを調整する
 *
 * @param previousHeadingLevel 前の見出しレベル
 * @param currentHeadingLevel 現在の見出しレベル
 * @param currentListContainer 現在のリストコンテナ
 * @param listContainerStack リストコンテナのスタック
 * @returns 調整されたリストコンテナ
 */
const adjustListContainerHierarchy = (
  previousHeadingLevel: number,
  currentHeadingLevel: number,
  currentListContainer: TableOfContentsContainer,
  listContainerStack: TableOfContentsContainer[],
): TableOfContentsContainer => {
  if (previousHeadingLevel === 0) {
    return currentListContainer;
  }

  if (previousHeadingLevel < currentHeadingLevel) {
    // 小見出しになった場合は階層を深くする
    return adjustToDeepHeading(currentListContainer, listContainerStack);
  } else if (previousHeadingLevel > currentHeadingLevel) {
    // 大見出しになった場合は階層を浅くする
    const { container, newStackIndex } = adjustToShallowHeading(
      previousHeadingLevel,
      currentHeadingLevel,
      listContainerStack,
    );

    // スタックも調整
    listContainerStack.length = newStackIndex + 1;
    return container;
  }

  return currentListContainer;
};

/**
 * 見出し要素から階層構造を持つ目次を生成する
 *
 * @param headings 処理対象の見出し要素配列
 * @param listContainer 目次を格納するコンテナ要素
 * @param isConvertToWikipediaStyleAnchor Wikipediaスタイルのアンカー生成を行うかどうかのフラグ
 */
export const generateTableOfContents = (
  headings: HTMLHeadingElement[],
  listContainer: TableOfContentsContainer,
  isConvertToWikipediaStyleAnchor: boolean,
) => {
  let previousHeadingLevel = 0;
  const { documentFragment, currentListContainer } = initializeListContainer(listContainer);
  const listContainerStack: TableOfContentsContainer[] = [currentListContainer];
  let activeListContainer = currentListContainer;

  // リスト要素とアンカー要素のテンプレートを一度だけ作成（メモリ効率化）
  const listItemTemplate = createElement('li');
  const anchorTemplate = createElement('a');

  const headingsLength = headings.length;

  for (let i = 0; i < headingsLength; i++) {
    const heading = headings[i];
    const currentHeadingLevel = Number(heading.tagName[1]);

    // 見出しの階層に合わせてリストの階層を調整
    activeListContainer = adjustListContainerHierarchy(
      previousHeadingLevel,
      currentHeadingLevel,
      activeListContainer,
      listContainerStack,
    );

    // 見出しにIDを割り当て
    const anchorText = assignIdToHeading(heading, isConvertToWikipediaStyleAnchor);

    // リスト要素を作成してフラグメントに追加
    const listItem = createListElement(anchorText, heading, listItemTemplate, anchorTemplate);
    activeListContainer.append(listItem);

    previousHeadingLevel = currentHeadingLevel;
  }

  listContainer.innerHTML = '';
  listContainer.append(documentFragment);
};
