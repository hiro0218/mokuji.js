/**
 * 目次（もくじ）生成の中核ロジックを提供するモジュール (パフォーマンス改善版)
 */
import { createElement } from '../common/dom';
import { assignInitialIdToHeading } from '../heading/heading';

/**
 * 目次アイテムの中間データ構造
 */
type TocItem = {
  text: string | null;
  href: string;
  level: number;
  children: TocItem[];
};

/**
 * 目次コンテナ要素の型 (ul または ol)
 */
type TableOfContentsContainer = HTMLUListElement | HTMLOListElement;

/**
 * 見出し要素から階層構造を持つ目次データ構造を生成し、DOMを一括構築する
 *
 * @param headings 処理対象の見出し要素配列
 * @param listContainer 目次を格納するコンテナ要素 (ul or ol)
 * @param isConvertToWikipediaStyleAnchor Wikipediaスタイルのアンカー生成を行うかどうかのフラグ
 */
export const generateTableOfContents = (
  headings: HTMLHeadingElement[],
  listContainer: TableOfContentsContainer,
  isConvertToWikipediaStyleAnchor: boolean,
): void => {
  const rootLevelItems: TocItem[] = [];
  const levelStack: { level: number; items: TocItem[] }[] = [];
  levelStack.push({ level: 0, items: rootLevelItems });

  const headingsLength = headings.length;
  for (let i = 0; i < headingsLength; i++) {
    const heading = headings[i];
    const currentHeadingLevel = Number(heading.tagName[1]);
    const anchorText = assignInitialIdToHeading(heading, isConvertToWikipediaStyleAnchor);

    const newItem: TocItem = {
      text: heading.textContent,
      href: `#${anchorText}`,
      level: currentHeadingLevel,
      children: [],
    };

    let stackIndex = levelStack.length - 1;
    let currentStackTop = levelStack[stackIndex];

    while (currentHeadingLevel <= currentStackTop.level && stackIndex > 0) {
      levelStack.pop();
      stackIndex--;
      currentStackTop = levelStack[stackIndex];
    }

    currentStackTop.items.push(newItem);
    levelStack.push({ level: currentHeadingLevel, items: newItem.children });
  }

  const listItemTemplate = createElement('li');
  const anchorTemplate = createElement('a');
  const childListTagName = listContainer.tagName.toLowerCase() as 'ul' | 'ol';
  const childListTemplate = createElement(childListTagName);

  const buildListRecursive = (parentListElement: HTMLElement, items: TocItem[]): void => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const elementList = listItemTemplate.cloneNode(false) as HTMLLIElement;
      const elementAnchor = anchorTemplate.cloneNode(false) as HTMLAnchorElement;

      elementAnchor.href = item.href;
      elementAnchor.textContent = item.text;
      elementList.append(elementAnchor);

      if (item.children.length > 0) {
        const childListContainer = childListTemplate.cloneNode(false) as TableOfContentsContainer;
        buildListRecursive(childListContainer, item.children);
        elementList.append(childListContainer);
      }
      parentListElement.append(elementList);
    }
  };

  buildListRecursive(listContainer, rootLevelItems);
};
