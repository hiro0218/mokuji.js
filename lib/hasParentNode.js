'use strict';

/**
 * hasParentNode
 * @param  {DOM}  element
 * @param  {DOM}  parent
 * @return {Boolean}
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hasParentNode;
function hasParentNode(element, parent) {
  while (element) {
    if (element === parent) {
      return true;
    }
    element = element.parentNode;
  }
  return false;
};