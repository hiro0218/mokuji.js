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
  const levelStack: { level: number; items: TocItem[] }[] = [{ level: 0, items: rootLevelItems }];

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const currentHeadingLevel = Number(heading.tagName[1]);
    const anchorText = assignInitialIdToHeading(heading, isConvertToWikipediaStyleAnchor);

    const newItem: TocItem = {
      text: heading.textContent,
      href: `#${anchorText}`,
      level: currentHeadingLevel,
      children: [],
    };

    while (currentHeadingLevel <= levelStack.at(-1)!.level) {
      levelStack.pop();
    }

    levelStack.at(-1)!.items.push(newItem);
    levelStack.push({ level: currentHeadingLevel, items: newItem.children });
  }

  const documentFragment = document.createDocumentFragment();
  const rootListElement = listContainer.cloneNode(false) as TableOfContentsContainer;

  const listItemTemplate = createElement('li');
  const anchorTemplate = createElement('a');
  const childListTagName = listContainer.tagName.toLowerCase() as 'ul' | 'ol';
  const childListTemplate = createElement(childListTagName);

  const buildListRecursive = (parentListElement: HTMLElement, items: TocItem[]): void => {
    for (const item of items) {
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

  buildListRecursive(rootListElement, rootLevelItems);
  documentFragment.append(rootListElement);

  listContainer.innerHTML = '';
  listContainer.append(documentFragment);
};
