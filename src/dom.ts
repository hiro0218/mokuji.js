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

export const getHeadingsElement = (element: Element): NodeListOf<HTMLHeadingElement> => {
  return element.querySelectorAll("h1, h2, h3, h4, h5, h6");
};
