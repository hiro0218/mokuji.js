'use strict';

require('es6-object-assign').polyfill();
require('smoothscroll-polyfill').polyfill();
import hasParentNode from './hasParentNode';

const defaults = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkBefore: true,
  anchorLinkClassName: '',
  smoothScroll: true,
};

var storeIds = [];

export class init {

  constructor(element, options) {
    if (!element) {
      return;
    }

    // set options
    options = Object.assign(defaults, options);

    // mokuji start
    var mokuji = this.render(element, options);

    return mokuji;
  }

  render(element, options) {
    // generate mokuji list
    var mokuji = this.generateMokuji(element, options);

    if (!mokuji) {
      return;
    }

    // setup anchor link
    if (options.anchorLink) {
      this.renderAnchorLink(mokuji, options);
    }

    // setup smooth scroll
    if (options.smoothScroll) {
      this.setSmoothScroll(mokuji);
    }

    return mokuji;
  }

  generateMokuji(element, options) {
    // get heading tags
    var walker = this.createHeadingWalker(element);
    var node = null;
    var number = 0;

    var ol = document.createElement('ol');
    var li = document.createElement('li');
    var a = document.createElement('a');

    while (node = walker.nextNode()) {
      var currentNumber = node.tagName.match(/\d/g).join('');  // heading number
      currentNumber = Number(currentNumber);

      // check list hierarchy
      if (number !== 0 && number < currentNumber) {
        // number of the heading is large (small as heading)
        var next = document.createElement('ol');
        ol.lastChild.appendChild(next);
        ol = next;
      } else if (number !== 0 && number > currentNumber) {
        // number of heading is small (large as heading)
        for (let i = 0; i < number-currentNumber; i++) {
          if (hasParentNode(ol, ol.parentNode)) {
            ol = ol.parentNode.parentNode;
          }
        }
      }

      let textContent = this.censorshipId(node.textContent);

      // add to wrapper
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

  censorshipId(textContent) {
    let id = textContent;
    let count = 1;

    if (storeIds.indexOf(id) !== -1) {
      while (count < 10) {
        let tmp_id = `${id}_${count}`;
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

  createHeadingWalker(element) {
    return document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT,
      function(node) {
        return (/^H[1-6]$/.test(node.tagName)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
      false
    );
  }

  setAnchor(id, text, type) {
    // convert spaces to _
    var anchor = id || this.replaceSpace2Underscore(text);

    // remove &
    anchor = anchor.replace(/\&+/g, '');
    anchor = anchor.replace(/\&amp;+/g, '');

    if (type === true) {
      anchor = encodeURIComponent(anchor);
      anchor = anchor.replace(/\%+/g, '.');
    }

    return anchor;
  }

  renderAnchorLink(mokuji, options) {
    if (!mokuji) {
      return;
    }

    var lists = mokuji.getElementsByTagName('a');
    var a = document.createElement('a');
    a.classList.add(options.anchorLinkClassName);

    for (let i = 0; i < lists.length; i++) {
      var hash = lists[i].hash;
      var headings = document.querySelector(`[id="${hash.replace('#', '')}"]`);

      // create anchor
      var anchor = a.cloneNode(false);
      anchor.setAttribute('href', hash);
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

  setSmoothScroll(mokuji) {
    if (!mokuji) {
      return;
    }

    var lists = mokuji.getElementsByTagName('a');
    for (let i = 0; i < lists.length; i++) {
      lists[i].addEventListener('click', function(e) {
        var hash = this.hash;
        e.preventDefault();
        document.querySelector(`[id="${hash.replace('#', '')}"]`).scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, null, hash);
      });
    }
  }

  replaceSpace2Underscore(text) {
    return String(text).replace(/\s+/g, '_');
  }

  buildList(node, a, li) {
    a.href = '#' + node.id;
    a.textContent = node.textContent;
    li.appendChild(a);

    return li;
  }

  reverseMokuji(ol) {
    while (ol.parentNode) {
      ol = ol.parentNode;
    }

    return ol;
  }

  removeDuplicateIds(mokuji) {
    var lists = mokuji.getElementsByTagName('a');

    for (let i = 0; i < lists.length; i++) {
      var id = lists[i].innerText;
      var hash = lists[i].hash;
      var headings = document.querySelectorAll(`[id="${id}"]`);

      if (headings.length === 1) {
        continue;
      }

      // duplicated id
      var count = 0;

      // Array.from polyfill
      if (!Array.from) {
        Array.from = function(arrayLikeObject) {
          return Array.prototype.slice.call(arrayLikeObject);
        };
      }

      for (let heading of Array.from(headings)) {
        var heading_id = `${heading.id}-${count}`;

        // search duplicate list
        for (let list of Array.from(lists)) {
          if (list.hash === hash) {
            // update hash
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
