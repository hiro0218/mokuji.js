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
