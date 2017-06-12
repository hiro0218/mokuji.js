'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('./extend');

var _extend2 = _interopRequireDefault(_extend);

var _hasParentNode = require('./hasParentNode');

var _hasParentNode2 = _interopRequireDefault(_hasParentNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

'use strict';

var defaults = {
  anchorType: ''
};

var init = exports.init = function () {
  function init(element, options) {
    _classCallCheck(this, init);

    if (!element) {
      return;
    }

    // set options
    options = (0, _extend2.default)(defaults, options);

    // mokuji start
    var mokuji = this.start(element, options);

    return mokuji;
  }

  _createClass(init, [{
    key: 'start',
    value: function start(element, options) {
      // generate mokuji list
      var mokuji = this.generateMokuji(element, options);

      if (!mokuji) {
        return;
      }

      // remove duplicates by adding suffix
      this.removeDuplicateIds(mokuji);

      return mokuji;
    }
  }, {
    key: 'generateMokuji',
    value: function generateMokuji(element, options) {
      // get heading tags
      var walker = this.createHeadingWalker(element);
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
        node.id = this.setAnchor(node.id, node.textContent, options.anchorType);
        ol.appendChild(this.buildList(node, a.cloneNode(false), li.cloneNode(false)));

        // upadte current number
        number = currentNumber;
      }

      ol = this.reverseMokuji(ol);

      return ol;
    }
  }, {
    key: 'createHeadingWalker',
    value: function createHeadingWalker(element) {
      return document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, function (node) {
        return (/^H[1-6]$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
        );
      }, false);
    }
  }, {
    key: 'setAnchor',
    value: function setAnchor(id, text, type) {
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
  }, {
    key: 'replaceSpace2Underscore',
    value: function replaceSpace2Underscore(text) {
      return String(text).replace(/\s+/g, '_');
    }
  }, {
    key: 'buildList',
    value: function buildList(node, a, li) {
      a.href = '#' + node.id;
      a.textContent = node.textContent;
      li.appendChild(a);

      return li;
    }
  }, {
    key: 'reverseMokuji',
    value: function reverseMokuji(ol) {
      while (ol.parentNode) {
        ol = ol.parentNode;
      }

      return ol;
    }
  }, {
    key: 'removeDuplicateIds',
    value: function removeDuplicateIds(mokuji) {
      var lists = mokuji.getElementsByTagName('a');

      for (var i = 0; i < lists.length; i++) {
        var id = lists[i].innerText;
        var hash = lists[i].hash;
        var headings = document.querySelectorAll('[id="' + id + '"]');

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
  }]);

  return init;
}();