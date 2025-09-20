export const getAllHeadingElements = (containerElement: Element): HTMLHeadingElement[] => {
  const headings = containerElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return [...headings] as HTMLHeadingElement[];
};

export const createElement = <T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] => {
  return document.createElement(tagName);
};

export const removeAllElements = (elements: NodeListOf<Element> | Element[]): void => {
  for (const element of elements) {
    element.remove();
  }
};
