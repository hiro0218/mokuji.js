/**
 * 親要素内に要素が存在するか判定する
 */
export const hasParentNode = (element: Node | null, parent: Node | null) => {
  if (!element || !parent) {
    return false;
  }

  while (element) {
    if (element === parent) {
      return true;
    }
    element = element.parentNode;
  }

  return false;
};

/**
 * 見出し要素をすべて取得する
 */
export const getHeadingsElement = (element: Element) => {
  return [...element.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')];
};
