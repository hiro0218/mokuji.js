/**
 * DOM操作のための共通ユーティリティ関数を提供するモジュール
 */

/**
 * h1からh6までのすべての見出し要素を取得する
 *
 * @param containerElement 見出し要素を検索する親要素
 * @returns 見つかったすべての見出し要素の配列
 */
export const getAllHeadingElements = (containerElement: Element): HTMLHeadingElement[] => {
  // 単一のクエリで全ての見出しを取得
  const headings = containerElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return [...headings] as HTMLHeadingElement[];
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

  return document.createElement(tagName);
};
