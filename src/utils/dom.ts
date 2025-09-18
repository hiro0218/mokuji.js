/**
 * DOM操作のための共通ユーティリティ関数
 */

/**
 * h1からh6までのすべての見出し要素を取得する
 */
export const getAllHeadingElements = (containerElement: Element): HTMLHeadingElement[] => {
  const headings = containerElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return [...headings] as HTMLHeadingElement[];
};

/**
 * 指定したタグ名の新しいHTML要素を作成する
 * キャッシュを使用して効率化している
 */
const elementCache = new Map<string, HTMLElement>();

export const createElement = <T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] => {
  if (!elementCache.has(tagName)) {
    elementCache.set(tagName, document.createElement(tagName));
  }

  const cachedElement = elementCache.get(tagName)!;
  return cachedElement.cloneNode(false) as HTMLElementTagNameMap[T];
};

/**
 * 指定された全ての要素をDOMから削除する
 */
export const removeAllElements = (elements: NodeListOf<Element> | Element[]): void => {
  // NodeListOfの場合もfor...ofで反復可能
  for (const element of elements) {
    element.remove();
  }
};
