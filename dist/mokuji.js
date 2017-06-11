/*!
 * mokuji.js v1.0.0
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Merge defaults with user options
 * @private
 * @param {Object} defaults Default settings
 * @param {Object} options User options
 * @returns {Object} Merged values of defaults and options
 */

module.exports = function (defaults, options) {
  var extended = {};
  var prop;
  for (prop in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
      extended[prop] = defaults[prop];
    }
  }
  for (prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      extended[prop] = options[prop];
    }
  }
  return extended;
};

/***/ }),
/* 1 */
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _extend = __webpack_require__(0);

var _extend2 = _interopRequireDefault(_extend);

var _hasParentNode = __webpack_require__(1);

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

/***/ })
/******/ ]);
});