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

export const getHeadingsTreeWalker = (root: Node) => {
  return document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: function (node: HTMLElement) {
        return /^H[1-6]$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    },
    false,
  );
};
