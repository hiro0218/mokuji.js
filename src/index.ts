import { hasParentNode } from "./dom";
import { replaceSpace2Underscore } from "./utils";

type MokujiOption = {
  anchorType: Boolean;
  anchorLink: Boolean;
  anchorLinkSymbol: string;
  anchorLinkBefore: Boolean;
  anchorLinkClassName: string;
};

const defaults: MokujiOption = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: "#",
  anchorLinkBefore: true,
  anchorLinkClassName: "",
};

let storeIds: string[] = [];

export default class Mokuji {
  // @ts-ignore
  constructor(element, options: MokujiOption) {
    if (!element) {
      return;
    }

    // set options
    options = Object.assign(defaults, options);

    // mokuji start
    const mokuji = this.render(element, options);

    // unset storeIds
    storeIds = [];

    // @ts-ignore
    return mokuji;
  }

  // @ts-ignore
  render(element, options) {
    // generate mokuji list
    const mokuji = this.generateMokuji(element, options);

    // setup anchor link
    if (options.anchorLink) {
      this.renderAnchorLink(mokuji, options);
    }

    return mokuji;
  }

  // @ts-ignore
  generateMokuji(element, options) {
    // get heading tags
    const walker = this.createHeadingWalker(element);
    let node = null;
    let number = 0;

    let ol = document.createElement("ol");
    const li = document.createElement("li");
    const a = document.createElement("a");

    while ((node = walker.nextNode())) {
      // @ts-ignore
      let currentNumber = node.tagName.match(/\d/g).join(""); // heading number
      currentNumber = Number(currentNumber);

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

      // add to wrapper
      // @ts-ignore
      node.id = this.setAnchor(node.id, textContent, options.anchorType);
      ol.appendChild(this.buildList(node, a.cloneNode(false), li.cloneNode(false)));

      // upadte current number
      number = currentNumber;
    }

    // not have Iterator
    if (number === 0) {
      return null;
    }

    ol = this.reverseMokuji(ol);

    // remove duplicates by adding suffix
    this.removeDuplicateIds(ol);

    return ol;
  }

  // @ts-ignore
  censorshipId(textContent) {
    let id = textContent;
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

  // @ts-ignore
  createHeadingWalker(element) {
    return document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT,
      // @ts-ignore
      function (node) {
        return /^H[1-6]$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
      false,
    );
  }

  // @ts-ignore
  setAnchor(id, text, type) {
    // convert spaces to _
    let anchor = id || replaceSpace2Underscore(text);

    // remove &
    anchor = anchor.replace(/\&+/g, "");
    anchor = anchor.replace(/\&amp;+/g, "");

    if (type === true) {
      anchor = encodeURIComponent(anchor);
      anchor = anchor.replace(/\%+/g, ".");
    }

    return anchor;
  }

  // @ts-ignore
  renderAnchorLink(mokuji, options) {
    if (!mokuji) {
      return;
    }

    const lists = mokuji.getElementsByTagName("a");
    const a = document.createElement("a");
    a.classList.add(options.anchorLinkClassName);

    for (let i = 0; i < lists.length; i++) {
      const hash = lists[i].hash;
      const headings = document.querySelector(`[id="${hash.replace("#", "")}"]`);
      if (!headings) {
        continue;
      }

      // create anchor
      const anchor = a.cloneNode(false);
      // @ts-ignore
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

  // @ts-ignore
  buildList(node, a, li) {
    a.href = "#" + node.id;
    a.textContent = node.textContent;
    li.appendChild(a);

    return li;
  }

  // @ts-ignore
  reverseMokuji(ol) {
    while (ol.parentNode) {
      ol = ol.parentNode;
    }

    return ol;
  }

  // @ts-ignore
  removeDuplicateIds(mokuji) {
    const lists = mokuji.getElementsByTagName("a");

    for (let i = 0; i < lists.length; i++) {
      const id = lists[i].innerText;
      const hash = lists[i].hash;
      const headings = document.querySelectorAll(`[id="${id}"]`);

      if (headings.length === 1) {
        continue;
      }

      // duplicated id
      let count = 0;

      for (const heading of Array.from(headings)) {
        const heading_id = `${heading.id}-${count}`;

        // search duplicate list
        for (const list of Array.from(lists)) {
          // @ts-ignore
          if (list.hash === hash) {
            // update hash
            // @ts-ignore
            list.href = `#${heading_id}`;
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
