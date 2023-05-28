import { hasParentNode, getHeadingsElement } from './dom';
import { getHeadingTagName2Number } from './utils';
import type { MokujiOption } from './types';
import { censorshipId, generateAnchorText } from './text';

export { MokujiOption };

const ANCHOR_DATASET_ATTRIBUTE = 'data-mokuji-anchor';

const defaultOptions = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkBefore: true,
  anchorLinkClassName: '',
  anchorContainerTagName: 'ol',
} as const;

const renderAnchorLink = (
  headings: HTMLHeadingElement[],
  anchors: HTMLAnchorElement[] | undefined,
  options: MokujiOption,
) => {
  if (!anchors) return;

  const a = document.createElement('a');
  a.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  if (options.anchorLinkClassName) {
    a.classList.add(options.anchorLinkClassName);
  }

  // Create a map for faster lookup
  const anchorMap = new Map<string, HTMLAnchorElement>();
  for (let i = 0; i < anchors.length; i++) {
    const anchorId = anchors[i].hash.replace('#', '');
    anchorMap.set(anchorId, anchors[i]);
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const matchedAnchor = anchorMap.get(heading.id);

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
    if (options.anchorLinkBefore) {
      // before
      heading.insertBefore(anchor, heading.firstChild);
    } else {
      // after
      heading.append(anchor);
    }
  }
};

const removeDuplicateIds = (headings: HTMLHeadingElement[], elementContainer: HTMLElement) => {
  const anchors = [...elementContainer.querySelectorAll('a')];

  for (let i = 0; i < anchors.length; i++) {
    const id = anchors[i].textContent;
    const hash = anchors[i].hash;
    const matchedHeadings = headings.filter((heading) => heading.id === id);

    if (matchedHeadings.length === 1) {
      continue;
    }

    // duplicated id
    let count = 0;

    for (let j = 0; j < matchedHeadings.length; j++) {
      const heading = matchedHeadings[j];
      const heading_id = `${heading.id}-${count}`;

      // search duplicate list
      for (let k = 0; k < anchors.length; k++) {
        const anchor = anchors[k];
        if (anchor.hash === hash) {
          // update hash
          anchor.href = `#${heading_id}`;
          break;
        }
      }

      // update id
      heading.id = heading_id;
      count++;
    }
  }
};

const generateHierarchyList = (
  headings: HTMLHeadingElement[],
  elementContainer: HTMLUListElement | HTMLOListElement,
  isConvertToWikipediaStyleAnchor: boolean,
) => {
  let number = 0;
  const elementListClone = document.createElement('li');
  const elementAnchorClone = document.createElement('a');

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const currentNumber = getHeadingTagName2Number(heading.tagName);

    // check list hierarchy
    if (number !== 0 && number < currentNumber) {
      // number of the heading is large (small as heading)
      const nextElementOListClone = document.createElement('ol');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      elementContainer.lastChild.append(nextElementOListClone);
      elementContainer = nextElementOListClone;
    } else if (number !== 0 && number > currentNumber) {
      // number of heading is small (large as heading)
      for (let i = 0; i < number - currentNumber; i++) {
        if (hasParentNode(elementContainer, elementContainer.parentNode)) {
          elementContainer = elementContainer?.parentNode?.parentNode as HTMLUListElement | HTMLOListElement;
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

    // upadte current number
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

  // mokuji start
  const elementContainer = document.createElement(
    options.anchorContainerTagName || defaultOptions.anchorContainerTagName,
  ) as HTMLUListElement | HTMLOListElement;

  // generate mokuji list
  generateHierarchyList(headings, elementContainer, options.anchorType);

  // remove duplicates by adding suffix
  removeDuplicateIds(headings, elementContainer);

  // setup anchor link
  if (options.anchorLink) {
    const anchors = [...elementContainer.querySelectorAll('a')];
    renderAnchorLink(headings, anchors, options);
  }

  return elementContainer;
};

// [data-mokuji-anchor]要素をすべて破棄する
export const destory = () => {
  const mokujiAnchor = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  for (let i = mokujiAnchor.length - 1; i >= 0; i--) {
    const element = mokujiAnchor[i];
    element.remove();
  }
};
