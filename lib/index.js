'use strict';

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import hasParentNode from './hasParentNode';
var defaults = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkBefore: true,
  anchorLinkClassName: ''
};
var storeIds = [];
export var Mokuji =
/*#__PURE__*/
function () {
  function Mokuji(element, options) {
    _classCallCheck(this, Mokuji);

    if (!element) {
      return;
    } // set options


    options = _extends(defaults, options); // mokuji start

    var mokuji = this.render(element, options); // unset storeIds

    storeIds = [];
    return mokuji;
  }

  _createClass(Mokuji, [{
    key: "render",
    value: function render(element, options) {
      // generate mokuji list
      var mokuji = this.generateMokuji(element, options); // setup anchor link

      if (options.anchorLink) {
        this.renderAnchorLink(mokuji, options);
      }

      return mokuji;
    }
  }, {
    key: "generateMokuji",
    value: function generateMokuji(element, options) {
      // get heading tags
      var walker = this.createHeadingWalker(element);
      var node = null;
      var number = 0;
      var ol = document.createElement('ol');
      var li = document.createElement('li');
      var a = document.createElement('a');

      while (node = walker.nextNode()) {
        var currentNumber = node.tagName.match(/\d/g).join(''); // heading number

        currentNumber = Number(currentNumber); // check list hierarchy

        if (number !== 0 && number < currentNumber) {
          // number of the heading is large (small as heading)
          var next = document.createElement('ol');
          ol.lastChild.appendChild(next);
          ol = next;
        } else if (number !== 0 && number > currentNumber) {
          // number of heading is small (large as heading)
          for (var i = 0; i < number - currentNumber; i++) {
            if (hasParentNode(ol, ol.parentNode)) {
              ol = ol.parentNode.parentNode;
            }
          }
        }

        var textContent = this.censorshipId(node.textContent); // add to wrapper

        node.id = this.setAnchor(node.id, textContent, options.anchorType);
        ol.appendChild(this.buildList(node, a.cloneNode(false), li.cloneNode(false))); // upadte current number

        number = currentNumber;
      } // not have Iterator


      if (number === 0) {
        return null;
      }

      ol = this.reverseMokuji(ol); // remove duplicates by adding suffix

      this.removeDuplicateIds(ol);
      return ol;
    }
  }, {
    key: "censorshipId",
    value: function censorshipId(textContent) {
      var id = textContent;
      var count = 1;

      if (storeIds.indexOf(id) !== -1) {
        while (count < 10) {
          var tmp_id = "".concat(id, "_").concat(count);

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
  }, {
    key: "createHeadingWalker",
    value: function createHeadingWalker(element) {
      return document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, function (node) {
        return /^H[1-6]$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }, false);
    }
  }, {
    key: "setAnchor",
    value: function setAnchor(id, text, type) {
      // convert spaces to _
      var anchor = id || this.replaceSpace2Underscore(text); // remove &

      anchor = anchor.replace(/\&+/g, '');
      anchor = anchor.replace(/\&amp;+/g, '');

      if (type === true) {
        anchor = encodeURIComponent(anchor);
        anchor = anchor.replace(/\%+/g, '.');
      }

      return anchor;
    }
  }, {
    key: "renderAnchorLink",
    value: function renderAnchorLink(mokuji, options) {
      if (!mokuji) {
        return;
      }

      var lists = mokuji.getElementsByTagName('a');
      var a = document.createElement('a');
      a.classList.add(options.anchorLinkClassName);

      for (var i = 0; i < lists.length; i++) {
        var hash = lists[i].hash;
        var headings = document.querySelector("[id=\"".concat(hash.replace('#', ''), "\"]"));

        if (!headings) {
          continue;
        } // create anchor


        var anchor = a.cloneNode(false);
        anchor.setAttribute('href', hash);
        anchor.textContent = options.anchorLinkSymbol; // insert anchor into headings

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
    key: "replaceSpace2Underscore",
    value: function replaceSpace2Underscore(text) {
      return String(text).replace(/\s+/g, '_');
    }
  }, {
    key: "buildList",
    value: function buildList(node, a, li) {
      a.href = '#' + node.id;
      a.textContent = node.textContent;
      li.appendChild(a);
      return li;
    }
  }, {
    key: "reverseMokuji",
    value: function reverseMokuji(ol) {
      while (ol.parentNode) {
        ol = ol.parentNode;
      }

      return ol;
    }
  }, {
    key: "removeDuplicateIds",
    value: function removeDuplicateIds(mokuji) {
      var lists = mokuji.getElementsByTagName('a');

      for (var i = 0; i < lists.length; i++) {
        var id = lists[i].innerText;
        var hash = lists[i].hash;
        var headings = document.querySelectorAll("[id=\"".concat(id, "\"]"));

        if (headings.length === 1) {
          continue;
        } // duplicated id


        var count = 0; // Array.from polyfill

        if (!Array.from) {
          Array.from = function (arrayLikeObject) {
            return Array.prototype.slice.call(arrayLikeObject);
          };
        }

        var _arr = Array.from(headings);

        for (var _i = 0; _i < _arr.length; _i++) {
          var heading = _arr[_i];
          var heading_id = "".concat(heading.id, "-").concat(count); // search duplicate list

          var _arr2 = Array.from(lists);

          for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
            var list = _arr2[_i2];

            if (list.hash === hash) {
              // update hash
              list.href = "#".concat(heading_id);
              break;
            }
          } // update id


          heading.id = heading_id;
          count++;
        }
      }
    }
  }]);

  return Mokuji;
}();