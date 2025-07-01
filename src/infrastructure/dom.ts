/**
 * DOM操作の抽象化とファクトリー関数群
 * 副作用の明確化とテスト容易性の向上
 */

import type { ContainerTagName, ElementFactory, DomEffect } from '../types/core';

/**
 * DOM要素作成のファクトリー関数群
 */
const createListItem = () => document.createElement('li');
const createAnchor = () => document.createElement('a');

export const ElementFactories = {
  /**
   * コンテナ要素のファクトリー
   */
  createList:
    (tagName: ContainerTagName): ElementFactory<typeof tagName> =>
    () =>
      document.createElement(tagName),

  /**
   * リストアイテムのファクトリー
   */
  createListItem: (): ElementFactory<'li'> => createListItem,

  /**
   * アンカー要素のファクトリー
   */
  createAnchor: (): ElementFactory<'a'> => createAnchor,
};

/**
 * DOM要素のプロパティ設定のための純粋関数群
 */
export const ElementProperties = {
  /**
   * 要素にテキストコンテンツを設定する
   */
  setTextContent:
    (element: HTMLElement, text: string): DomEffect =>
    () => {
      element.textContent = text;
    },

  /**
   * 要素にhref属性を設定する
   */
  setHref:
    (element: HTMLAnchorElement, href: string): DomEffect =>
    () => {
      element.href = href;
    },

  /**
   * 要素にクラス名を追加する
   */
  addClass:
    (element: HTMLElement, className: string): DomEffect =>
    () => {
      if (className.trim()) {
        element.classList.add(...className.trim().split(/\s+/).filter(Boolean));
      }
    },

  /**
   * 要素にデータ属性を設定する
   */
  setDataAttribute:
    (element: HTMLElement, name: string, value?: string): DomEffect =>
    () => {
      element.setAttribute(name, value ?? '');
    },

  /**
   * 要素にIDを設定する
   */
  setId:
    (element: HTMLElement, id: string): DomEffect =>
    () => {
      element.id = id;
    },
};

/**
 * DOM操作の組み合わせ関数群
 */
export const DomEffects = {
  /**
   * 複数のDOM効果を組み合わせる
   */
  combine:
    (...effects: DomEffect[]): DomEffect =>
    () => {
      for (const effect of effects) {
        effect();
      }
    },

  /**
   * 子要素を親要素に追加する
   */
  appendChild:
    (parent: HTMLElement, child: HTMLElement): DomEffect =>
    () => {
      parent.append(child);
    },

  /**
   * 要素を特定の位置に挿入する
   */
  insertBefore:
    (parent: HTMLElement, newNode: HTMLElement, referenceNode: Node | null): DomEffect =>
    () => {
      if (referenceNode && referenceNode.parentNode === parent) {
        // Element型の場合はbeforeメソッドを使用、そうでなければinsertBeforeを使用
        if (referenceNode instanceof Element) {
          referenceNode.before(newNode);
        } else {
          // Node型にはbeforeメソッドが存在しないため、insertBeforeを使用
          // @ts-expect-error before method is not available on Node
          referenceNode.before(newNode);
        }
      } else {
        parent.append(newNode);
      }
    },

  /**
   * 要素を末尾に追加する
   */
  append:
    (parent: HTMLElement, child: HTMLElement): DomEffect =>
    () => {
      parent.append(child);
    },
};

/**
 * DOM要素の検索関数群
 */
export const ElementSelectors = {
  /**
   * コンテナ内のすべての見出し要素を取得する
   * パフォーマンス最適化: Array.fromよりforループを使用
   */
  getAllHeadings: (container: Element): readonly HTMLHeadingElement[] => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const result: HTMLHeadingElement[] = Array.from({ length: headings.length });

    for (let i = 0; i < headings.length; i++) {
      result[i] = headings[i] as HTMLHeadingElement;
    }

    return result;
  },

  /**
   * 特定のデータ属性を持つ要素を検索する
   */
  findByDataAttribute: (container: Document | Element, attribute: string): readonly HTMLElement[] => {
    const elements = container.querySelectorAll(`[${attribute}]`);
    const result: HTMLElement[] = Array.from({ length: elements.length });

    for (let i = 0; i < elements.length; i++) {
      result[i] = elements[i] as HTMLElement;
    }

    return result;
  },

  /**
   * 特定のタグ名とデータ属性を持つ要素を検索する
   */
  findByTagAndAttribute: (container: Document | Element, tagName: string, attribute: string): HTMLElement | null => {
    return container.querySelector(`${tagName}[${attribute}]`) as HTMLElement | null;
  },
};
