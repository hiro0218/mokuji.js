/**
 * DOM操作の抽象化とファクトリー関数群
 * 副作用の明確化とテスト容易性の向上
 */

import type { ContainerTagName, ElementFactory } from '../types/core';

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
