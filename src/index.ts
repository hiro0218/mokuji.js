import { hasParentNode, getHeadingsElement } from './dom';
import { replaceSpace2Underscore, convert2WikipediaStyleAnchor, getHeadingTagName2Number } from './utils';

export type MokujiOption = {
  anchorType: boolean;
  anchorLink: boolean;
  anchorLinkSymbol: string;
  anchorLinkBefore: boolean;
  anchorLinkClassName: string;
  anchorContainerTagName: 'ul' | 'ol';
};

export const renderAnchorLink = (
  headings: NodeListOf<HTMLHeadingElement>,
  anchors: NodeListOf<HTMLAnchorElement> | undefined,
  options: MokujiOption,
) => {
  if (!anchors) return;

  const a = document.createElement('a');
  a.classList.add(options.anchorLinkClassName);

  headings.forEach((heading) => {
    const { id } = heading;

    for (let i = 0; i < anchors.length; i++) {
      const { hash } = anchors[i];

      if (hash.replace('#', '') !== id) {
        continue;
      }

      // create anchor
      const anchor = a.cloneNode(false) as HTMLAnchorElement;
      anchor.setAttribute('href', hash);
      anchor.textContent = options.anchorLinkSymbol;

      // insert anchor into headings
      if (options.anchorLinkBefore) {
        // before
        heading.insertBefore(anchor, heading.firstChild);
      } else {
        // after
        heading.appendChild(anchor);
      }
    }
  });
};

export class Mokuji {
  options: MokujiOption;
  storeIds: string[] = [];

  constructor(element: HTMLElement, externalOptions: MokujiOption) {
    // Merge the default options with the external options.
    this.options = Object.assign(
      // default options
      {
        anchorType: true,
        anchorLink: false,
        anchorLinkSymbol: '#',
        anchorLinkBefore: true,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol',
      } as MokujiOption,
      externalOptions,
    );

    const headings = getHeadingsElement(element);

    // mokuji start
    // generate mokuji list
    const mokuji = this.generateMokuji(headings);

    // setup anchor link
    if (this.options.anchorLink) {
      const anchors = mokuji.querySelectorAll('a');
      renderAnchorLink(headings, anchors, this.options);
    }

    // @ts-ignore
    return mokuji;
  }

  generateMokuji(headings: NodeListOf<HTMLHeadingElement>) {
    let elementContainer = document.createElement(this.options.anchorContainerTagName);

    this.generateHierarchyList(headings, elementContainer);

    // remove duplicates by adding suffix
    this.removeDuplicateIds(headings, elementContainer);

    return elementContainer;
  }

  generateHierarchyList(headings: NodeListOf<HTMLHeadingElement>, elementContainer: HTMLElement) {
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
        // @ts-ignore
        elementContainer.lastChild.appendChild(nextElementOListClone);
        elementContainer = nextElementOListClone;
      } else if (number !== 0 && number > currentNumber) {
        // number of heading is small (large as heading)
        for (let i = 0; i < number - currentNumber; i++) {
          if (hasParentNode(elementContainer, elementContainer.parentNode)) {
            // @ts-ignore
            elementContainer = elementContainer.parentNode.parentNode;
          }
        }
      }

      const textContent = this.censorshipId(headings, heading.textContent);

      // headingへidを付与
      const anchorText = this.generateAnchorText(textContent, this.options.anchorType);
      heading.id = anchorText;

      // add to wrapper
      const elementAnchor = elementAnchorClone.cloneNode(false) as HTMLAnchorElement;
      elementAnchor.href = `#${anchorText}`;
      elementAnchor.textContent = heading.textContent;
      const elementList = elementListClone.cloneNode(false);
      elementList.appendChild(elementAnchor);
      elementContainer.appendChild(elementList);

      // upadte current number
      number = currentNumber;
    }
  }

  censorshipId(headings: NodeListOf<HTMLHeadingElement>, textContent: string | null) {
    let id = textContent || '';
    let suffix_count = 1;

    // IDが重複していた場合はsuffixを付ける
    while (suffix_count <= headings.length) {
      const tmp_id = suffix_count === 1 ? id : `${id}_${suffix_count}`;

      if (this.storeIds.indexOf(tmp_id) === -1) {
        id = tmp_id;
        this.storeIds.push(id);
        break;
      }

      suffix_count++;
    }

    return id;
  }

  generateAnchorText(text: string, type: boolean) {
    // convert spaces to _
    let anchor = replaceSpace2Underscore(text);

    // remove &
    anchor = anchor.replace(/\&+/g, '').replace(/\&amp;+/g, '');

    if (type === true) {
      anchor = convert2WikipediaStyleAnchor(anchor);
    }

    return anchor;
  }

  removeDuplicateIds(headings: NodeListOf<HTMLHeadingElement>, elementContainer: HTMLElement) {
    const anchors = elementContainer.getElementsByTagName('a');

    for (let i = 0; i < anchors.length; i++) {
      const id = anchors[i].innerText;
      const hash = anchors[i].hash;
      const matchedHeadings = Array.from(headings).filter((heading) => heading.id === id);

      if (matchedHeadings.length === 1) {
        continue;
      }

      // duplicated id
      let count = 0;

      matchedHeadings.forEach((heading) => {
        const heading_id = `${heading.id}-${count}`;

        // search duplicate list
        for (const anchor of Array.from(anchors)) {
          if (anchor.hash === hash) {
            // update hash
            anchor.href = `#${heading_id}`;
            break;
          }
        }

        // update id
        heading.id = heading_id;
        count++;
      });
    }
  }
}
