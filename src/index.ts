import { hasParentNode, getHeadingsElement, createElement } from './dom';
import type { MokujiOption } from './types';
import { censorshipId, generateAnchorText } from './text';

export { MokujiOption };

const ANCHOR_DATASET_ATTRIBUTE = 'data-mokuji-anchor';

const defaultOptions = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkPosition: 'before',
  anchorLinkClassName: '',
  anchorContainerTagName: 'ol',
} as const;

const generateAnchorsMap = (anchors: HTMLAnchorElement[]) => {
  const anchorMap = new Map<string, HTMLAnchorElement>();

  for (let i = 0; i < anchors.length; i++) {
    const anchorId = anchors[i].hash.replace('#', '');
    anchorMap.set(anchorId, anchors[i]);
  }

  return anchorMap;
};

const insertAnchorToHeadings = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  options: MokujiOption,
) => {
  const a = createElement('a');
  a.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  if (options.anchorLinkClassName) {
    a.classList.add(options.anchorLinkClassName);
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const matchedAnchor = anchorMap.get(encodeURIComponent(heading.id));

    if (!matchedAnchor) {
      continue;
    }

    // create anchor
    const anchor = a.cloneNode(false) as HTMLAnchorElement;
    anchor.setAttribute('href', matchedAnchor.hash);

    if (options.anchorLinkSymbol) {
      anchor.textContent = options.anchorLinkSymbol;
    }

    // insert anchor into headings
    if (options.anchorLinkPosition === 'before') {
      // before
      heading.insertBefore(anchor, heading.firstChild);
    } else {
      // after
      heading.append(anchor);
    }
  }
};

const removeDuplicateIds = (headings: HTMLHeadingElement[], anchors: HTMLAnchorElement[]) => {
  const idCountMap = new Map<string, number>();
  const anchorMap = new Map<string, HTMLAnchorElement[]>();

  // Build an anchor map based on hash
  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    const id = anchor.hash.slice(1); // remove the '#' prefix
    const list = anchorMap.get(id) || [];
    list.push(anchor);
    anchorMap.set(id, list);
  }

  // Deduplicate ids and update headings and anchors
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const originalId = heading.id;
    const count = idCountMap.get(originalId) || 0;

    // If this is a duplicate id, append count to make it unique
    if (count > 0) {
      const newId = `${originalId}-${count}`;
      heading.id = newId;

      // Update the href of matching anchors
      const matchingAnchors = anchorMap.get(originalId) || [];
      for (let j = 0; j < matchingAnchors.length; j++) {
        const anchor = matchingAnchors[j];
        anchor.href = `#${newId}`;
      }
    }

    idCountMap.set(originalId, count + 1);
  }
};

const generateHierarchyList = (
  headings: HTMLHeadingElement[],
  elementContainer: HTMLUListElement | HTMLOListElement,
  isConvertToWikipediaStyleAnchor: boolean,
) => {
  let number = 0;
  const elementListClone = createElement('li');
  const elementAnchorClone = createElement('a');

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const currentNumber = Number(heading.tagName[1]);

    // check list hierarchy
    if (number !== 0 && number < currentNumber) {
      // number of the heading is large (small as heading)
      const nextElementOListClone = createElement('ol');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      elementContainer.lastChild.append(nextElementOListClone);
      elementContainer = nextElementOListClone;
    } else if (number !== 0 && number > currentNumber) {
      // number of heading is small (large as heading)
      for (let i = 0; i < number - currentNumber; i++) {
        if (hasParentNode(elementContainer, elementContainer.parentNode)) {
          elementContainer = elementContainer.parentNode?.parentNode as HTMLUListElement | HTMLOListElement;
        }
      }
    }

    const textContent = censorshipId(headings, heading.textContent || '');

    // headingへidを付与
    const anchorText = generateAnchorText(textContent, isConvertToWikipediaStyleAnchor);
    heading.id = anchorText;

    // add to wrapper
    const elementAnchor = elementAnchorClone.cloneNode(false) as HTMLAnchorElement;
    elementAnchor.href = `#${anchorText}`;
    elementAnchor.textContent = heading.textContent;
    const elementList = elementListClone.cloneNode(false) as HTMLLIElement;
    elementList.append(elementAnchor);

    elementContainer.append(elementList);

    // update current number
    number = currentNumber;
  }
};

export const Mokuji = (
  element: HTMLElement | null,
  externalOptions?: MokujiOption,
): HTMLUListElement | HTMLOListElement | undefined => {
  if (!element) {
    return;
  }

  // Merge the default options with the external options.
  const options = {
    ...defaultOptions,
    ...externalOptions,
  };

  const headings = [...getHeadingsElement(element)];

  if (headings.length === 0) {
    return;
  }

  // mokuji start
  const elementContainer = createElement(options.anchorContainerTagName);

  // generate mokuji list
  generateHierarchyList(headings, elementContainer, options.anchorType);

  const anchors = [...elementContainer.querySelectorAll('a')];

  if (anchors.length === 0) {
    return;
  }

  // remove duplicates by adding suffix
  removeDuplicateIds(headings, anchors);

  // setup anchor link
  if (options.anchorLink) {
    const anchorsMap = generateAnchorsMap(anchors);
    insertAnchorToHeadings(headings, anchorsMap, options);
  }

  return elementContainer;
};

// [data-mokuji-anchor]要素をすべて破棄する
export const Destroy = () => {
  const mokujiAnchor = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  for (let i = mokujiAnchor.length - 1; i >= 0; i--) {
    const element = mokujiAnchor[i];
    element.remove();
  }
};
