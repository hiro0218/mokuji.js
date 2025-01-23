import { hasParentNode, getHeadingsElement, createElement } from './dom';
import type { MokujiOption } from './types';
import { censorshipId, generateAnchorText, storeIds } from './text';

type ResultProps<T> =
  | {
      element?: T;
      list: HTMLUListElement | HTMLOListElement;
    }
  | undefined;

export { MokujiOption, ResultProps };

const MOKUJI_LIST_DATASET_ATTRIBUTE = 'data-mokuji-list';
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
    const anchorLinkClassName = options.anchorLinkClassName.trim();
    const classNames = anchorLinkClassName.split(/\s+/);
    // スペース区切りの場合
    if (classNames.length > 1) {
      // eslint-disable-next-line unicorn/no-array-for-each
      classNames.forEach((className) => {
        a.classList.add(className.trim());
      });
    } else {
      // 通常の場合
      a.classList.add(anchorLinkClassName);
    }
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

export const Mokuji = <T extends HTMLElement>(element: T | null, externalOptions?: MokujiOption): ResultProps<T> => {
  if (!element) {
    return;
  }

  // Create a copy of the element to avoid destructive changes
  const modifiedElement = element.cloneNode(true) as T;

  // Merge the default options with the external options.
  const options = {
    ...defaultOptions,
    ...externalOptions,
  };

  const headings = [...getHeadingsElement(modifiedElement)];

  if (headings.length === 0) {
    return;
  }

  // mokuji start
  const elementContainer = createElement(options.anchorContainerTagName);
  elementContainer.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

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

  return { element: modifiedElement, list: elementContainer };
};

export const Destroy = () => {
  // アンカー: [data-mokuji-anchor]要素をすべて破棄する
  const mokujiAnchor = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  for (let i = mokujiAnchor.length - 1; i >= 0; i--) {
    const element = mokujiAnchor[i];
    element.remove();
  }

  // 目次リスト: [data-mokuji-list]要素を破棄する
  const mokujiList = document.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
  if (mokujiList) {
    mokujiList.remove();
  }

  // 格納したidをクリアして次回の採番時に影響しないようにする
  storeIds.clear();
};
