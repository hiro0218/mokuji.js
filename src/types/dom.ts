/**
 * Type definitions related to DOM operations
 */

import type { Effect } from './functional';

/**
 * Type representing side effects of DOM operations
 */
export type DomEffect<T = void> = Effect<T>;

/**
 * Type for element factory functions
 */
export type ElementFactory<K extends keyof HTMLElementTagNameMap> = () => HTMLElementTagNameMap[K];
