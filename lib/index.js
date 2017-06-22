'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('es6-object-assign').polyfill();
require('smoothscroll-polyfill').polyfill();
import hasParentNode from './hasParentNode';

var defaults = {
  anchorType: '',
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkBefore: true,
  anchorLinkClassName: '',
  smoothScroll: true
};

export var init = function () {
  function init(element, options) {
    _classCallCheck(this, init);

    if (!element) {
      return;
    }

    // set options
    options = Object.assign(defaults, options);

    // mokuji start
    var mokuji = this.render(element, options);

    return mokuji;
  }

  _createClass(init, [{
    key: 'render',
    value: function render(element, options) {
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

      // remove duplicates by adding suffix
      this.removeDuplicateIds(ol);

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
    key: 'renderAnchorLink',
    value: function renderAnchorLink(mokuji, options) {
      if (!mokuji) {
        return;
      }

      var lists = mokuji.getElementsByTagName('a');
      var a = document.createElement('a');
      a.classList.add(options.anchorLinkClassName);

      for (var i = 0; i < lists.length; i++) {
        var hash = lists[i].hash;
        var headings = document.querySelector('[id="' + hash.replace('#', '') + '"]');

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
  }, {
    key: 'setSmoothScroll',
    value: function setSmoothScroll(mokuji) {
      if (!mokuji) {
        return;
      }

      var lists = mokuji.getElementsByTagName('a');
      for (var i = 0; i < lists.length; i++) {
        lists[i].addEventListener('click', function (e) {
          var hash = this.hash;
          e.preventDefault();
          document.querySelector('[id="' + hash.replace('#', '') + '"]').scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, null, hash);
        });
      }
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

        // Array.from polyfill
        if (!Array.from) {
          Array.from = function (arrayLikeObject) {
            return Array.prototype.slice.call(arrayLikeObject);
          };
        }

        for (var _iterator = Array.from(headings), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
          }

          var heading = _ref;

          var heading_id = heading.id + '-' + count;

          // search duplicate list
          for (var _iterator2 = Array.from(lists), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref2 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref2 = _i2.value;
            }

            var list = _ref2;

            if (list.hash === hash) {
              // update hash
              list.href = '#' + heading_id;
              break;
            }
          }

          // update id
          heading.id = heading_id;
          count++;
        }
      }
    }
  }]);

  return init;
}();