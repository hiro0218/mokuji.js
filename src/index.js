import extend from './extend';
import hasParentNode from './hasParentNode';

'use strict';

const defaults = {
  anchorType: ''
};

export class init {

  constructor(element, options) {
    if (!element) {
      return;
    }

    // set options
    options = extend(defaults, options);

    // mokuji start
    var mokuji = this.start(element, options);

    return mokuji;
  }

  start(element, options) {
    // generate mokuji list
    var mokuji = this.generateMokuji(element, options);

    if (!mokuji) {
      return;
    }

    // remove duplicates by adding suffix
    this.removeDuplicateIds(mokuji);

    return mokuji;
  }

  generateMokuji(element, options) {
    // get heading tags
    var walker = this.createHeadingWalker(element);
    var node = null;
    var number = 1;

    var ol = document.createElement('ol');
    var li = document.createElement('li');
    var a = document.createElement('a');

    while (node = walker.nextNode()) {
      var currentNumber = node.tagName.match(/\d/g).join('');  // heading number

      // check list hierarchy
      if (number < currentNumber) {
        // number of the heading is large (small as heading)
        var next = document.createElement('ol');
        ol.lastChild.appendChild(next);
        ol = next;
      } else if (number > currentNumber) {
        // number of heading is small (large as heading)
        for (var i = 0; i < number-currentNumber; i++) {
          if (hasParentNode(ol, ol.parentNode)) {
            ol = ol.parentNode.parentNode;
          }
        }
      }

      // add to wrapper
      node.id = this.setAnchor(node.id, node.textContent, options.anchorType);
      ol.appendChild(this.buildList(node, a.cloneNode(false), li.cloneNode(false)));

      // upadte current number
      number = currentNumber;
    }

    ol = this.reverseMokuji(ol);

    return ol;
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

    if (type === 'wikipedia') {
      anchor = encodeURIComponent(anchor);
      anchor = anchor.replace(/\%+/g, '.');
    }

    return anchor;
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

    for (var i = 0; i < lists.length; i++) {
      var id = lists[i].innerText;
      var hash = lists[i].hash;
      var headings = document.querySelectorAll(`[id="${id}"]`);

      if (headings.length === 1) {
        continue;
      }

      // duplicated id
      var count = 0;

      for (var heading of headings) {
        var id = `${heading.id}-${count}`;

        // search duplicate list
        for (var list of lists) {
          if (list.hash === hash) {
            // update hash
            list.href = `#${id}`;
            break;
          }
        }

        // update id
        heading.id = id;
        count++;
      }
    }
  }

}
