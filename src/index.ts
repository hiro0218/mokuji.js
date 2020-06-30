import { hasParentNode, getHeadingsTreeWalker, reverseElement } from "./dom";
import { replaceSpace2Underscore, convert2WikipediaStyleAnchor, getHeadingTagName2Number } from "./utils";

type MokujiOption = {
  anchorType: Boolean;
  anchorLink: Boolean;
  anchorLinkSymbol: string;
  anchorLinkBefore: Boolean;
  anchorLinkClassName: string;
};

const defaultOptions: MokujiOption = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: "#",
  anchorLinkBefore: true,
  anchorLinkClassName: "",
};

let storeIds: string[] = [];

export default class Mokuji {
  constructor(element: HTMLElement, options: MokujiOption) {
    // set options
    const mergedOptions = Object.assign(defaultOptions, options);

    // mokuji start
    const mokuji = this.render(element, mergedOptions);

    // unset storeIds
    storeIds = [];

    // @ts-ignore
    return mokuji;
  }

  render(element: HTMLElement, options: MokujiOption) {
    // generate mokuji list
    const list = this.generateMokuji(element, options);

    // setup anchor link
    if (options.anchorLink) {
      const anchors = list?.querySelectorAll("a");
      this.renderAnchorLink(anchors, options);
    }

    return list;
  }

  generateMokuji(element: HTMLElement, options: MokujiOption) {
    // get heading tags
    const walker = getHeadingsTreeWalker(element);
    let node = null;
    let number = 0;

    let ol = document.createElement("ol");
    const li = document.createElement("li");
    const a = document.createElement("a");

    while ((node = walker.nextNode() as HTMLHeadingElement)) {
      // @ts-ignore
      const currentNumber = getHeadingTagName2Number(node.tagName);

      // check list hierarchy
      if (number !== 0 && number < currentNumber) {
        // number of the heading is large (small as heading)
        const next = document.createElement("ol");
        // @ts-ignore
        ol.lastChild.appendChild(next);
        ol = next;
      } else if (number !== 0 && number > currentNumber) {
        // number of heading is small (large as heading)
        for (let i = 0; i < number - currentNumber; i++) {
          if (hasParentNode(ol, ol.parentNode)) {
            // @ts-ignore
            ol = ol.parentNode.parentNode;
          }
        }
      }

      const textContent = this.censorshipId(node.textContent);

      // headingへidを付与
      node.id = this.setAnchor(textContent, options.anchorType);

      // add to wrapper
      const anchorList = this.updateAnchorContent(node, a.cloneNode(false) as HTMLAnchorElement);
      const list = li.cloneNode(false);
      list.appendChild(anchorList);
      ol.appendChild(list);

      // upadte current number
      number = currentNumber;
    }

    // not have Iterator
    if (number === 0) {
      return null;
    }

    // @ts-ignore
    ol = reverseElement(ol);

    // remove duplicates by adding suffix
    const anchors = ol.getElementsByTagName("a");
    this.removeDuplicateIds(anchors);

    return ol;
  }

  censorshipId(textContent: string | null) {
    let id = textContent || "";
    let count = 1;

    if (storeIds.indexOf(id) !== -1) {
      while (count < 10) {
        const tmp_id = `${id}_${count}`;
        if (storeIds.indexOf(tmp_id) === -1) {
          id = tmp_id;
          storeIds.push(id);
          break;
        }
        count++;
      }
    } else {
      storeIds.push(id);
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

  renderAnchorLink(anchors: NodeListOf<HTMLAnchorElement> | undefined, options: MokujiOption) {
    if (!anchors) return;

    const a = document.createElement("a");
    a.classList.add(options.anchorLinkClassName);

    for (let i = 0; i < anchors.length; i++) {
      const hash = anchors[i].hash;
      const headings = document.querySelector(`[id="${hash.replace("#", "")}"]`);

      if (!headings) {
        continue;
      }

      // create anchor
      const anchor = a.cloneNode(false) as HTMLAnchorElement;
      anchor.setAttribute("href", hash);
      anchor.textContent = options.anchorLinkSymbol;

      // insert anchor into headings
      if (options.anchorLinkBefore) {
        // before
        headings.insertBefore(anchor, headings.firstChild);
      } else {
        // after
        headings.appendChild(anchor);
      }
    }
  }

  updateAnchorContent({ id, textContent }: HTMLHeadingElement, elementAnchor: HTMLAnchorElement) {
    elementAnchor.href = "#" + id;
    elementAnchor.textContent = textContent;

    return elementAnchor;
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
