'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _extend = require('./extend');

var _extend2 = _interopRequireDefault(_extend);

var _hasParentNode = require('./hasParentNode');

var _hasParentNode2 = _interopRequireDefault(_hasParentNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

'use strict';

var defaults = {
  anchorType: ''
};

function init(element, options) {
  if (!element) {
    return;
  }

  // set options
  options = (0, _extend2.default)(defaults, options);

  // generate mokuji list
  var mokuji = generateMokuji(element, options);

  if (!mokuji) {
    return;
  }

  // remove duplicates by adding suffix
  removeDuplicateIds(mokuji);

  return mokuji;
}

function createHeadingWalker(element) {
  return document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, function (node) {
    return (/^H[1-6]$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    );
  }, false);
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
        if ((0, _hasParentNode2.default)(ol, ol.parentNode)) {
          ol = ol.parentNode.parentNode;
        }
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
  // convert spaces to _
  var anchor = id || replaceSpace2Underscore(text);

  // remove &
  anchor = anchor.replace(/\&+/g, '');
  anchor = anchor.replace(/\&amp;+/g, '');

  // add '_' if first string is number
  if (isNumber(anchor.substring(0, 1))) {
    anchor = '_' + anchor;
  }

  if (type === 'wikipedia') {
    anchor = encodeURIComponent(anchor);
    anchor = anchor.replace(/\%+/g, '.');
  }

  return anchor;
}

function replaceSpace2Underscore(text) {
  return String(text).replace(/\s+/g, '_');
}

function isNumber(str) {
  return parseInt(str, 10) !== NaN ? true : false;
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