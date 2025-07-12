/**
 * Core module for enhanced DOM operations
 * Provides common interfaces and abstraction layer for all DOM operations
 */

import type { ContainerTagName } from '../../types/core';

/**
 * Factory interface for creating DOM elements
 */
export interface ElementCreator {
  /**
   * Create list element (ul/ol)
   */
  createList(tagName: ContainerTagName): HTMLUListElement | HTMLOListElement;

  /**
   * Create list item (li)
   */
  createListItem(): HTMLLIElement;

  /**
   * Create anchor element (a)
   */
  createAnchor(): HTMLAnchorElement;

  /**
   * Create heading element (h1-h6)
   */
  createHeading(level: 1 | 2 | 3 | 4 | 5 | 6): HTMLHeadingElement;

  /**
   * Create any element
   */
  createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
}

/**
 * Selector interface for finding DOM elements
 */
export interface ElementSelector {
  /**
   * Get all heading elements (h1-h6)
   */
  getAllHeadings(container: Element): readonly HTMLHeadingElement[];

  /**
   * Find elements by data attribute
   */
  findByDataAttribute(container: Document | Element, attribute: string): readonly HTMLElement[];

  /**
   * Find element by tag and data attribute combination
   */
  findByTagAndAttribute(container: Document | Element, tagName: string, attribute: string): HTMLElement | null;

  /**
   * Find element by selector
   */
  querySelector<E extends Element = Element>(container: Document | Element, selector: string): E | null;

  /**
   * Find multiple elements by selector
   */
  querySelectorAll<E extends Element = Element>(container: Document | Element, selector: string): readonly E[];
}

/**
 * Utility interface for DOM manipulation
 */
export interface DomManipulator {
  /**
   * Set element attribute
   */
  setAttribute(element: Element, name: string, value: string): void;

  /**
   * Add class to element
   */
  addClass(element: Element, className: string): void;

  /**
   * Add child element
   */
  appendChild<T extends Node>(parent: Element | Document | DocumentFragment, child: T): T;

  /**
   * Set element text content
   */
  setTextContent(element: Node, text: string): void;
}

/**
 * Standard DOM implementation
 * Default implementation used in browser environments
 */
class StandardDomImplementation implements ElementCreator, ElementSelector, DomManipulator {
  // Implementation of ElementCreator
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

  // Implementation of ElementSelector
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

  // Implementation of DomManipulator
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

// Create singleton instance
const standardDomImpl = new StandardDomImplementation();

/**
 * Facade providing utilities for DOM operations
 */
export const DomCore = {
  // Access to individual interfaces
  creator: standardDomImpl as ElementCreator,
  selector: standardDomImpl as ElementSelector,
  manipulator: standardDomImpl as DomManipulator,

  // Convenient shortcut methods
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

  // Method for setting mock implementation for testing
  setImplementation(impl: Partial<ElementCreator & ElementSelector & DomManipulator>): void {
    Object.assign(standardDomImpl, impl);
  },
};
