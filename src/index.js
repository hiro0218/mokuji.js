import extend from './extend';

'use strict';

const defaults = {
  anchorType: ''
};

export function init(element, options) {
  if (!element) {
    return;
  }

  // set options
  options = extend(defaults, options);

  // generate mokuji list
  var mokuji = generateMokuji(element, options);

  if (!mokuji) {
    return;
  }

  // remove duplicates by adding suffi
  removeDuplicateIds(element, mokuji);

  return mokuji;
}

function createHeadingWalker(element) {
  return document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT,
    function(node) {
      return (/^H[1-6]$/.test(node.tagName)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
    false
  );
}

function generateMokuji(element, options) {
  // get heading tags
  var walker = createHeadingWalker(element);
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
        ol = ol.parentNode.parentNode;
      }
    }

    // add to wrapper
    node.id = setAnchor(node.id, node.textContent, options.anchorType);
    ol.appendChild(buildList(node, a.cloneNode(false), li.cloneNode(false)));

    // upadte current number
    number = currentNumber;
  }

  ol = reverseMokuji(ol);

  return ol;
}

function setAnchor(id, text, type) {
  var anchor = id || replaceSpace2Underscore(text);

  if (type === 'wikipedia') {
    anchor = encodeURIComponent(anchor);
    anchor = anchor.replace(/\%+/g, '.');
  }

  return anchor;
}

function replaceSpace2Underscore(text) {
  return String(text).replace(/\s+/g, '_');
}

function buildList(node, a, li) {
  a.href = '#' + node.id;
  a.textContent = node.textContent;
  li.appendChild(a);

  return li;
}

function reverseMokuji(ol) {
  while (ol.parentNode) {
    ol = ol.parentNode;
  }

  return ol;
}

function removeDuplicateIds(mokuji) {
  var lists = mokuji.getElementsByTagName('a');

  for (var i = 0; i < lists.length; i++) {
    var hash = lists[i].hash;
    var headings = document.querySelectorAll(hash);

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
