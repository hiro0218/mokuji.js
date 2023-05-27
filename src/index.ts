import { hasParentNode, getHeadingsElement } from './dom';
import { replaceSpacesWithUnderscores, convert2WikipediaStyleAnchor, getHeadingTagName2Number } from './utils';
import type { MokujiOption } from './types';

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

const storeIds = new Set<string>();

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

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const { id } = heading;

    for (let j = 0; j < anchors.length; j++) {
      const { hash } = anchors[j];

      if (hash.replace('#', '') !== id) {
        continue;
      }

      // create anchor
      const anchor = a.cloneNode(false) as HTMLAnchorElement;
      anchor.setAttribute('href', hash);

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

const censorshipId = (headings: HTMLHeadingElement[], textContent = '') => {
  let id = textContent;
  let suffix_count = 1;

  // IDが重複していた場合はsuffixを付ける
  while (suffix_count <= headings.length) {
    const tmp_id = suffix_count === 1 ? id : `${id}_${suffix_count}`;

    if (!storeIds.has(tmp_id)) {
      id = tmp_id;
      storeIds.add(id);
      break;
    }

    suffix_count++;
  }

  return id;
};

const generateAnchorText = (text: string, isConvertToWikipediaStyleAnchor: boolean) => {
  // convert spaces to _
  let anchor = replaceSpacesWithUnderscores(text);

  // remove &
  anchor = anchor.replaceAll(/&+/g, '').replaceAll(/&amp;+/g, '');

  if (isConvertToWikipediaStyleAnchor === true) {
    anchor = convert2WikipediaStyleAnchor(anchor);
  }

  return anchor;
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
  const options = Object.assign(
    // default options
    defaultOptions,
    externalOptions,
  );

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
  for (let i = 0; i < mokujiAnchor.length; i++) {
    const element = mokujiAnchor[i];
    element.remove();
  }
};
