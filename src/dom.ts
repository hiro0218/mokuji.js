// @ts-ignore
export const hasParentNode = (element, parent) => {
  while (element) {
    if (element === parent) {
      return true;
    }
    element = element.parentNode;
  }
  return false;
};

export const reverseElement = (element: Node) => {
  while (element.parentNode) {
    element = element.parentNode;
  }

  return element;
};
