/**
 * DOM操作のための共通ユーティリティ関数を提供するモジュール
 */

/**
 * h1からh6までのすべての見出し要素を取得する
 *
 * @param containerElement 見出し要素を検索する親要素
 * @returns 見つかったすべての見出し要素の配列
 */
export const getAllHeadingElements = (containerElement: Element) => {
  // 特定の見出しタグの静的リストを使用
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
  const headings: HTMLHeadingElement[] = [];

  // パフォーマンス警告を避けつつDOM要素を効率的に取得
  for (let i = 0; i < headingTags.length; i++) {
    const tagElements = containerElement.querySelectorAll(headingTags[i]);
    for (let j = 0; j < tagElements.length; j++) {
      headings.push(tagElements[j] as HTMLHeadingElement);
    }
  }

  return headings;
};

/**
 * 指定したタグ名の新しいHTML要素を作成する
 * キャッシュを利用して要素生成のパフォーマンスを向上させる
 *
 * @param tagName 作成する要素のタグ名
 * @returns 生成されたHTML要素
 */
// 頻繁に使用される要素のキャッシュ
const elementCache = new Map<string, HTMLElement>();

export const createElement = <T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] => {
  // キャッシュから要素テンプレートを再利用
  if (!elementCache.has(tagName)) {
    elementCache.set(tagName, document.createElement(tagName));
  }

  // キャッシュから要素をクローンして返す（null回避のため安全に取得）
  const cachedElement = elementCache.get(tagName);
  if (cachedElement) {
    return cachedElement.cloneNode(false) as HTMLElementTagNameMap[T];
  }

  // 予備的なフォールバック（通常は実行されない）
  return document.createElement(tagName);
};
