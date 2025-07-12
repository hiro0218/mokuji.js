/**
 * DOM操作関連の型定義
 */

import type { Effect } from './functional';

/**
 * DOM操作の副作用を表す型
 */
export type DomEffect<T = void> = Effect<T>;

/**
 * 要素ファクトリー関数の型
 */
export type ElementFactory<K extends keyof HTMLElementTagNameMap> = () => HTMLElementTagNameMap[K];
