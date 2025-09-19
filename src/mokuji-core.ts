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
 * Generate hierarchical table of contents data structure from heading elements and build DOM in bulk
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
  const rootLevelItems: TocItem[] = [];
  const levelStack: { level: number; items: TocItem[] }[] = [];
  levelStack.push({ level: 0, items: rootLevelItems });

  for (const heading of headings) {
    const currentHeadingLevel = getHeadingLevel(heading);
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

  buildListRecursive(listContainer, rootLevelItems);
};
