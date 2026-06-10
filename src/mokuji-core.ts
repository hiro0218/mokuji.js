import { createElement, getHeadingText } from './utils/dom';
import type { ResolvedHeading } from './heading-identity';
import type { AnchorContainerTagName } from './types';

type TocItem = {
  text: string;
  href: string;
  children: TocItem[];
};

type TableOfContentsContainer = HTMLUListElement | HTMLOListElement;

const buildTocHierarchy = (resolved: ReadonlyArray<ResolvedHeading>): TocItem[] => {
  const rootLevelItems: TocItem[] = [];
  const levelStack: { level: number; items: TocItem[] }[] = [{ level: 0, items: rootLevelItems }];

  for (const r of resolved) {
    const newItem: TocItem = {
      text: getHeadingText(r.heading),
      href: `#${r.identity}`,
      children: [],
    };

    let topLevel = levelStack.at(-1) ?? levelStack[0];
    while (levelStack.length > 1 && r.level <= topLevel.level) {
      levelStack.pop();
      topLevel = levelStack.at(-1) ?? levelStack[0];
    }

    topLevel.items.push(newItem);
    levelStack.push({ level: r.level, items: newItem.children });
  }

  return rootLevelItems;
};

const buildTocDom = (
  items: TocItem[],
  listContainer: TableOfContentsContainer,
  containerTag: AnchorContainerTagName,
): void => {
  const listItemTemplate = createElement('li');
  const anchorTemplate = createElement('a');
  const childListTemplate = createElement(containerTag);

  const buildListRecursive = (parentListElement: HTMLElement, tocItems: TocItem[]): void => {
    for (const item of tocItems) {
      const listItem = listItemTemplate.cloneNode(false) as HTMLLIElement;
      const anchor = anchorTemplate.cloneNode(false) as HTMLAnchorElement;

      anchor.href = item.href;
      anchor.textContent = item.text;
      listItem.append(anchor);

      if (item.children.length > 0) {
        const childList = childListTemplate.cloneNode(false) as TableOfContentsContainer;
        buildListRecursive(childList, item.children);
        listItem.append(childList);
      }
      parentListElement.append(listItem);
    }
  };

  buildListRecursive(listContainer, items);
};

export const buildTocList = (
  resolved: ReadonlyArray<ResolvedHeading>,
  containerTag: AnchorContainerTagName,
): TableOfContentsContainer => {
  const container = createElement(containerTag);
  const tocItems = buildTocHierarchy(resolved);
  buildTocDom(tocItems, container, containerTag);
  return container;
};
