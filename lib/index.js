'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
function init(element) {
  if (!element) {
    return;
  }

  // generate mokuji list
  var mokuji = generateMokuji(element);

  if (!mokuji) {
    return;
  }

  // remove duplicates by adding suffi
  removeDuplicateIds(element, mokuji);

  return mokuji;
}

function createHeadingWalker(element) {
  return document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, function (node) {
    return (/^H[1-6]$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    );
  }, false);
}

function generateMokuji(element) {
  // get heading tags
  var walker = createHeadingWalker(element);
  var node = null;
  var number = 1;

  var ol = document.createElement('ol');
  var li = document.createElement('li');
  var a = document.createElement('a');

  while (node = walker.nextNode()) {
    var currentNumber = node.tagName.match(/\d/g).join(''); // heading number

    // check list hierarchy
    if (number < currentNumber) {
      // number of the heading is large (small as heading)
      var next = document.createElement('ol');
      ol.lastChild.appendChild(next);
      ol = next;
    } else if (number > currentNumber) {
      // number of heading is small (large as heading)
      for (var i = 0; i < number - currentNumber; i++) {
        ol = ol.parentNode.parentNode;
      }
    }

    // add to wrapper
    node.id = node.id || replaceSpace2Underscore(node.textContent);
    ol.appendChild(buildList(node, a.cloneNode(false), li.cloneNode(false)));

    // upadte current number
    number = currentNumber;
  }

  ol = reverseMokuji(ol);

  return ol;
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

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = headings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var heading = _step.value;

        var id = heading.id + '-' + count;

        // search duplicate list
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = lists[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var list = _step2.value;

            if (list.hash === hash) {
              // update hash
              list.href = '#' + id;
              break;
            }
          }
          // update id
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        heading.id = id;
        count++;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
}