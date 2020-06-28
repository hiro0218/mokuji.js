'use strict';

/**
 * hasParentNode
 * @param  {DOM}  element
 * @param  {DOM}  parent
 * @return {Boolean}
 */
// @ts-ignore
export default function hasParentNode(element, parent) {
  while (element) {
    if (element === parent) {
      return true;
    }
    element = element.parentNode;
  }
  return false;
}
