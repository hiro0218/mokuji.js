import { hasParentNode, getHeadingsElement } from "./dom";
import { replaceSpace2Underscore, convert2WikipediaStyleAnchor, getHeadingTagName2Number } from "./utils";

export type MokujiOption = {
  anchorType: Boolean;
  anchorLink: Boolean;
  anchorLinkSymbol: string;
  anchorLinkBefore: Boolean;
  anchorLinkClassName: string;
  anchorContainerTagName: string;
};

export class Mokuji {
  headings: NodeListOf<HTMLHeadingElement>;
  options: MokujiOption;
  storeIds: string[] = [];

  constructor(element: HTMLElement, externalOptions: MokujiOption) {
    // Merge the default options with the external options.
    this.options = Object.assign(
      // default options
      {
        anchorType: true,
        anchorLink: false,
        anchorLinkSymbol: "#",
        anchorLinkBefore: true,
        anchorLinkClassName: "",
        anchorContainerTagName: "ol",
      },
      externalOptions,
    );

    this.headings = getHeadingsElement(element);

    // mokuji start
    const mokuji = this.render();

    // @ts-ignore
    return mokuji;
  }

  render() {
    // generate mokuji list
    const list = this.generateMokuji();

    // setup anchor link
    if (this.options.anchorLink) {
      const anchors = list?.querySelectorAll("a");
      this.renderAnchorLink(anchors);
    }

    return list;
  }

  generateMokuji() {
    let elementContainer = document.createElement(this.options.anchorContainerTagName);

    this.generateHierarchyList(elementContainer);

    // remove duplicates by adding suffix
    const anchors = elementContainer.getElementsByTagName("a");
    this.removeDuplicateIds(anchors);

    return elementContainer;
  }

  generateHierarchyList(elementContainer: HTMLElement) {
    let number = 0;
    const elementListClone = document.createElement("li");
    const elementAnchorClone = document.createElement("a");

    for (let i = 0; i < this.headings.length; i++) {
      const heading = this.headings[i];
      const currentNumber = getHeadingTagName2Number(heading.tagName);

      // check list hierarchy
      if (number !== 0 && number < currentNumber) {
        // number of the heading is large (small as heading)
        const nextElementOListClone = document.createElement("ol");
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

      const textContent = this.censorshipId(heading.textContent);

      // headingへidを付与
      heading.id = this.setAnchor(textContent, this.options.anchorType);

      // add to wrapper
      const elementAnchor = elementAnchorClone.cloneNode(false) as HTMLAnchorElement;
      elementAnchor.href = "#" + heading.id;
      elementAnchor.textContent = heading.textContent;
      const elementList = elementListClone.cloneNode(false);
      elementList.appendChild(elementAnchor);
      elementContainer.appendChild(elementList);

      // upadte current number
      number = currentNumber;
    }
  }

  censorshipId(textContent: string | null) {
    let id = textContent || "";
    let suffix_count = 1;

    // IDが重複していた場合はsuffixを付ける
    while (suffix_count <= this.headings.length) {
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

  setAnchor(text: string, type: Boolean) {
    // convert spaces to _
    let anchor = replaceSpace2Underscore(text);

    // remove &
    anchor = anchor.replace(/\&+/g, "").replace(/\&amp;+/g, "");

    if (type === true) {
      anchor = convert2WikipediaStyleAnchor(anchor);
    }

    return anchor;
  }

  renderAnchorLink(anchors: NodeListOf<HTMLAnchorElement> | undefined) {
    if (!anchors) return;

    const a = document.createElement("a");
    a.classList.add(this.options.anchorLinkClassName);

    for (let i = 0; i < anchors.length; i++) {
      const hash = anchors[i].hash;
      const headings = document.querySelector(`[id="${hash.replace("#", "")}"]`);

      if (!headings) {
        continue;
      }

      // create anchor
      const anchor = a.cloneNode(false) as HTMLAnchorElement;
      anchor.setAttribute("href", hash);
      anchor.textContent = this.options.anchorLinkSymbol;

      // insert anchor into headings
      if (this.options.anchorLinkBefore) {
        // before
        headings.insertBefore(anchor, headings.firstChild);
      } else {
        // after
        headings.appendChild(anchor);
      }
    }
  }

  removeDuplicateIds(anchors: HTMLCollectionOf<HTMLAnchorElement>) {
    for (let i = 0; i < anchors.length; i++) {
      const id = anchors[i].innerText;
      const hash = anchors[i].hash;
      const headings = document.querySelectorAll(`[id="${id}"]`);

      if (headings.length === 1) {
        continue;
      }

      // duplicated id
      let count = 0;

      for (const heading of Array.from(headings)) {
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
      }
    }
  }
}
