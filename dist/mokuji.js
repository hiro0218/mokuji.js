/*!
 * mokuji.js v1.3.0
 * https://github.com/hiro0218/mokuji.js
 * 
 * Copyright (C) 2017 hiro
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Mokuji"] = factory();
	else
		root["Mokuji"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__hasParentNode__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__hasParentNode___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__hasParentNode__);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(1).polyfill();


var defaults = {
  anchorType: '',
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkBefore: true,
  anchorLinkClassName: '',
  smoothScroll: true
};

var init = function () {
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
            if (__WEBPACK_IMPORTED_MODULE_0__hasParentNode___default.a(ol, ol.parentNode)) {
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

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = headings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var heading = _step.value;

            var heading_id = heading.id + '-' + count;

            // search duplicate list
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = lists[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var list = _step2.value;

                if (list.hash === hash) {
                  // update hash
                  list.href = '#' + heading_id;
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

            heading.id = heading_id;
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
 * smoothscroll polyfill - v0.3.5
 * https://iamdustan.github.io/smoothscroll
 * 2016 (c) Dustan Kasten, Jeremias Menichelli - MIT License
 */

(function(w, d, undefined) {
  'use strict';

  /*
   * aliases
   * w: window global object
   * d: document
   * undefined: undefined
   */

  // polyfill
  function polyfill() {
    // return when scrollBehavior interface is supported
    if ('scrollBehavior' in d.documentElement.style) {
      return;
    }

    /*
     * globals
     */
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;

    /*
     * object gathering original scroll methods
     */
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      elScroll: Element.prototype.scroll || scrollElement,
      scrollIntoView: Element.prototype.scrollIntoView
    };

    /*
     * define timing method
     */
    var now = w.performance && w.performance.now
      ? w.performance.now.bind(w.performance) : Date.now;

    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }

    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} x
     * @returns {Boolean}
     */
    function shouldBailOut(x) {
      if (typeof x !== 'object'
            || x === null
            || x.behavior === undefined
            || x.behavior === 'auto'
            || x.behavior === 'instant') {
        // first arg not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }

      if (typeof x === 'object'
            && x.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }

      // throw error when behavior is not supported
      throw new TypeError('behavior not valid');
    }

    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;
      var hasScrollableSpace;
      var hasVisibleOverflow;

      do {
        el = el.parentNode;

        // set condition variables
        isBody = el === d.body;
        hasScrollableSpace =
          el.clientHeight < el.scrollHeight ||
          el.clientWidth < el.scrollWidth;
        hasVisibleOverflow =
          w.getComputedStyle(el, null).overflow === 'visible';
      } while (!isBody && !(hasScrollableSpace && !hasVisibleOverflow));

      isBody = hasScrollableSpace = hasVisibleOverflow = null;

      return el;
    }

    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     */
    function step(context) {
      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;

      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;

      // apply easing to elapsed time
      value = ease(elapsed);

      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;

      context.method.call(context.scrollable, currentX, currentY);

      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
      }
    }

    /**
     * scrolls window with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();

      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
      });
    }

    /*
     * ORIGINAL METHODS OVERRIDES
     */

    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scroll.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left,
        ~~arguments[0].top
      );
    };

    // w.scrollBy
    w.scrollBy = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };

    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.elScroll.call(
            this,
            arguments[0].left || arguments[0],
            arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
          this,
          this,
          arguments[0].left,
          arguments[0].top
      );
    };

    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      var arg0 = arguments[0];

      if (typeof arg0 === 'object') {
        this.scroll({
          left: arg0.left + this.scrollLeft,
          top: arg0.top + this.scrollTop,
          behavior: arg0.behavior
        });
      } else {
        this.scroll(
          this.scrollLeft + arg0,
          this.scrollTop + arguments[1]
        );
      }
    };

    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollIntoView.call(this, arguments[0] || true);
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();

      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );
        // reveal parent in viewport
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: 'smooth'
        });
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }

  if (true) {
    // commonjs
    module.exports = { polyfill: polyfill };
  } else {
    // global
    polyfill();
  }
})(window, document);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * hasParentNode
 * @param  {DOM}  element
 * @param  {DOM}  parent
 * @return {Boolean}
 */

module.exports = function hasParentNode(element, parent) {
  while (element) {
    if (element === parent) {
      return true;
    }
    element = element.parentNode;
  }
  return false;
};

/***/ })
/******/ ]);
});