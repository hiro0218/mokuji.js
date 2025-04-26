/**
 * 子要素が親要素内に存在するか判定する
 */
export const isElementWithinParent = (childElement: Node | null, parentElement: Node | null) => {
  if (!childElement || !parentElement) {
    return false;
  }

  return parentElement.contains(childElement);
};

/**
 * h1からh6までのすべての見出し要素を取得する
 */
export const getAllHeadingElements = (containerElement: Element) => {
  return containerElement.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6');
};

/**
 * 指定したタグ名の新しいHTML要素を作成する
 */
export const createElement = <T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] => {
  return document.createElement(tagName);
};
