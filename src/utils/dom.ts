export const getAllHeadingElements = (containerElement: Element): HTMLHeadingElement[] => {
  const headings = containerElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return [...headings] as HTMLHeadingElement[];
};

const elementCache = new Map<string, HTMLElement>();

export const createElement = <T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] => {
  if (!elementCache.has(tagName)) {
    elementCache.set(tagName, document.createElement(tagName));
  }

  const cachedElement = elementCache.get(tagName)!;
  return cachedElement.cloneNode(false) as HTMLElementTagNameMap[T];
};

export const removeAllElements = (elements: NodeListOf<Element> | Element[]): void => {
  for (const element of elements) {
    element.remove();
  }
};
