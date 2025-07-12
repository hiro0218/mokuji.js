/**
 * 拡張されたDOM操作のコアモジュール
 * すべてのDOM操作の共通インターフェースと抽象化層を提供
 */

import type { ContainerTagName } from '../../types/core';

/**
 * DOM要素を作成するためのファクトリーインターフェース
 */
export interface ElementCreator {
  /**
   * リスト要素 (ul/ol) を作成
   */
  createList(tagName: ContainerTagName): HTMLUListElement | HTMLOListElement;

  /**
   * リストアイテム (li) を作成
   */
  createListItem(): HTMLLIElement;

  /**
   * アンカー要素 (a) を作成
   */
  createAnchor(): HTMLAnchorElement;

  /**
   * 見出し要素 (h1-h6) を作成
   */
  createHeading(level: 1 | 2 | 3 | 4 | 5 | 6): HTMLHeadingElement;

  /**
   * 任意の要素を作成
   */
  createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
}

/**
 * DOM要素を検索するためのセレクターインターフェース
 */
export interface ElementSelector {
  /**
   * すべての見出し要素 (h1-h6) を取得
   */
  getAllHeadings(container: Element): readonly HTMLHeadingElement[];

  /**
   * データ属性によって要素を検索
   */
  findByDataAttribute(container: Document | Element, attribute: string): readonly HTMLElement[];

  /**
   * タグとデータ属性の組み合わせで要素を検索
   */
  findByTagAndAttribute(container: Document | Element, tagName: string, attribute: string): HTMLElement | null;

  /**
   * セレクターによって要素を検索
   */
  querySelector<E extends Element = Element>(container: Document | Element, selector: string): E | null;

  /**
   * セレクターによって複数の要素を検索
   */
  querySelectorAll<E extends Element = Element>(container: Document | Element, selector: string): readonly E[];
}

/**
 * DOM操作のためのユーティリティインターフェース
 */
export interface DomManipulator {
  /**
   * 要素の属性を設定
   */
  setAttribute(element: Element, name: string, value: string): void;

  /**
   * 要素のクラスを追加
   */
  addClass(element: Element, className: string): void;

  /**
   * 子要素を追加
   */
  appendChild<T extends Node>(parent: Element | Document | DocumentFragment, child: T): T;

  /**
   * 要素のテキスト内容を設定
   */
  setTextContent(element: Node, text: string): void;
}

/**
 * 標準のDOM実装
 * ブラウザ環境で使用されるデフォルト実装
 */
class StandardDomImplementation implements ElementCreator, ElementSelector, DomManipulator {
  // ElementCreator の実装
  createList(tagName: ContainerTagName): HTMLUListElement | HTMLOListElement {
    return document.createElement(tagName);
  }

  createListItem(): HTMLLIElement {
    return document.createElement('li');
  }

  createAnchor(): HTMLAnchorElement {
    return document.createElement('a');
  }

  createHeading(level: 1 | 2 | 3 | 4 | 5 | 6): HTMLHeadingElement {
    return document.createElement(`h${level}`);
  }

  createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
    return document.createElement(tagName);
  }

  // ElementSelector の実装
  getAllHeadings(container: Element): readonly HTMLHeadingElement[] {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    return [...headings] as HTMLHeadingElement[];
  }

  findByDataAttribute(container: Document | Element, attribute: string): readonly HTMLElement[] {
    const elements = container.querySelectorAll(`[${attribute}]`);
    return [...elements] as HTMLElement[];
  }

  findByTagAndAttribute(container: Document | Element, tagName: string, attribute: string): HTMLElement | null {
    return container.querySelector(`${tagName}[${attribute}]`) as HTMLElement | null;
  }

  querySelector<E extends Element = Element>(container: Document | Element, selector: string): E | null {
    return container.querySelector(selector) as E | null;
  }

  querySelectorAll<E extends Element = Element>(container: Document | Element, selector: string): readonly E[] {
    return [...container.querySelectorAll(selector)] as E[];
  }

  // DomManipulator の実装
  setAttribute(element: Element, name: string, value: string): void {
    element.setAttribute(name, value);
  }

  addClass(element: Element, className: string): void {
    element.classList.add(...className.trim().split(/\s+/).filter(Boolean));
  }

  appendChild<T extends Node>(parent: Element | Document | DocumentFragment, child: T): T {
    parent.append(child);
    return child;
  }

  setTextContent(element: Node, text: string): void {
    element.textContent = text;
  }
}

// シングルトンインスタンスの作成
const standardDomImpl = new StandardDomImplementation();

/**
 * DOM操作のユーティリティを提供するファサード
 */
export const DomCore = {
  // 個別のインターフェースへのアクセス
  creator: standardDomImpl as ElementCreator,
  selector: standardDomImpl as ElementSelector,
  manipulator: standardDomImpl as DomManipulator,

  // 便利なショートカットメソッド
  createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
    return standardDomImpl.createElement(tagName);
  },

  createElementWithClass<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    className: string,
  ): HTMLElementTagNameMap[K] {
    const element = standardDomImpl.createElement(tagName);
    standardDomImpl.addClass(element, className);
    return element;
  },

  getAllHeadings(container: Element): readonly HTMLHeadingElement[] {
    return standardDomImpl.getAllHeadings(container);
  },

  // テスト用のモック実装を設定するためのメソッド
  setImplementation(impl: Partial<ElementCreator & ElementSelector & DomManipulator>): void {
    Object.assign(standardDomImpl, impl);
  },
};
