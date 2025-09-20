import { createElement } from './utils/dom';
import { assignInitialIdToHeading, getHeadingLevel } from './heading';

type TocItem = {
  text: string | null;
  href: string;
  level: number;
  children: TocItem[];
};

type TableOfContentsContainer = HTMLUListElement | HTMLOListElement;

/**
 * Build hierarchical data structure from headings
 */
const buildTocHierarchy = (headings: HTMLHeadingElement[], isConvertToWikipediaStyleAnchor: boolean): TocItem[] => {
  const rootLevelItems: TocItem[] = [];
  const levelStack: { level: number; items: TocItem[] }[] = [{ level: 0, items: rootLevelItems }];

  for (const heading of headings) {
    const currentHeadingLevel = getHeadingLevel(heading);
    const anchorText = assignInitialIdToHeading(heading, isConvertToWikipediaStyleAnchor);

    const newItem: TocItem = {
      text: heading.textContent,
      href: `#${anchorText}`,
      level: currentHeadingLevel,
      children: [],
    };

    // Find appropriate parent level
    let topLevel = levelStack.at(-1)!;
    while (levelStack.length > 1 && currentHeadingLevel <= topLevel.level) {
      levelStack.pop();
      topLevel = levelStack.at(-1)!;
    }

    topLevel.items.push(newItem);
    levelStack.push({ level: currentHeadingLevel, items: newItem.children });
  }

  return rootLevelItems;
};

/**
 * Generate DOM elements from TOC hierarchy
 */
const buildTocDom = (items: TocItem[], listContainer: TableOfContentsContainer): void => {
  const listItemTemplate = createElement('li');
  const anchorTemplate = createElement('a');
  const childListTagName = listContainer.tagName.toLowerCase() as 'ul' | 'ol';
  const childListTemplate = createElement(childListTagName);

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

/**
 * Generate hierarchical table of contents data structure from heading elements and build DOM
 *
 * @param headings Array of heading elements to process
 * @param listContainer Container element to store the table of contents (ul or ol)
 * @param isConvertToWikipediaStyleAnchor Flag to generate Wikipedia-style anchors
 */
export const buildMokujiHierarchy = (
  headings: HTMLHeadingElement[],
  listContainer: TableOfContentsContainer,
  isConvertToWikipediaStyleAnchor: boolean,
): void => {
  const tocItems = buildTocHierarchy(headings, isConvertToWikipediaStyleAnchor);
  buildTocDom(tocItems, listContainer);
};
