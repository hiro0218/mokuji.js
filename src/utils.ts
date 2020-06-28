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

export const replaceSpace2Underscore = (text: string) => {
  return text.replace(/\s+/g, "_");
};
