/**
 * Utilities for functional programming
 * Provides Rust-like error handling and type safety
 */

import type { Result, Option, NonEmptyArray } from '../../types/core';

export const ResultUtils = {
  ok: <T>(data: T): Result<T, never> => ({
    success: true,
    data,
  }),

  error: <E>(error: E): Result<never, E> => ({
    success: false,
    error,
  }),

  isOk: <T, E>(result: Result<T, E>): result is { success: true; data: T } => result.success,

  isError: <T, E>(result: Result<T, E>): result is { success: false; error: E } => !result.success,

  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    ResultUtils.isOk(result) ? ResultUtils.ok(fn(result.data)) : (result as Result<U, E>),

  flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> =>
    ResultUtils.isOk(result) ? fn(result.data) : (result as Result<U, E>),

  mapError: <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> =>
    ResultUtils.isError(result) ? ResultUtils.error(fn(result.error)) : (result as Result<T, F>),

  getOrElse: <T, E>(result: Result<T, E>, defaultValue: T): T =>
    ResultUtils.isOk(result) ? result.data : defaultValue,
};

export const OptionUtils = {
  some: <T>(value: T): Option<T> => value,

  none: <T>(): Option<T> => undefined,

  isSome: <T>(option: Option<T>): option is T => option !== undefined && option !== null,

  isNone: <T>(option: Option<T>): option is null | undefined => option === undefined || option === null,

  map: <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> =>
    OptionUtils.isSome(option) ? fn(option as T) : undefined,

  flatMap: <T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
    OptionUtils.isSome(option) ? fn(option as T) : undefined,

  getOrElse: <T>(option: Option<T>, defaultValue: T): T => (OptionUtils.isSome(option) ? (option as T) : defaultValue),
};

/**
 * Generic functional programming utilities
 */
export const FunctionalUtils = {
  /**
   * Generic pipe function
   * Connects functions in series and applies them sequentially
   */
  pipe:
    <T>(...fns: Array<(arg: T) => T>) =>
    (input: T): T => {
      let result = input;

      for (let i = 0, len = fns.length; i < len; i++) {
        result = fns[i](result);
      }

      return result;
    },

  /**
   * Pipe function for Result type
   * Chains functions while keeping values wrapped in Result type
   */
  resultPipe:
    <T, E>(...fns: Array<(arg: T) => Result<T, E>>) =>
    (input: T): Result<T, E> => {
      let result: Result<T, E> = ResultUtils.ok(input);

      for (let i = 0, len = fns.length; i < len; i++) {
        if (ResultUtils.isError(result)) {
          break;
        }
        if (ResultUtils.isOk(result)) {
          result = fns[i](result.data);
        } else {
          // This should never happen because of the previous check,
          // but TypeScript needs this to ensure type safety
          break;
        }
      }

      return result;
    },

  /**
   * Catch errors for Result<T, E> type
   */
  catchError:
    <T, E>(handler: (error: E) => Result<T, E>) =>
    (result: Result<T, E>): Result<T, E> => {
      if (ResultUtils.isError(result)) {
        return handler(result.error);
      }
      return result;
    },
};

export const ArrayUtils = {
  isNonEmpty: <T>(arr: readonly T[]): arr is NonEmptyArray<T> => arr.length > 0,

  head: <T>(arr: readonly T[]): Option<T> => (arr.length > 0 ? arr[0] : undefined),

  last: <T>(arr: readonly T[]): Option<T> => (arr.length > 0 ? (arr.at(-1) ?? undefined) : undefined),

  groupBy: <T, K extends string | number | symbol>(arr: readonly T[], keyFn: (item: T) => K): Record<K, T[]> => {
    const result = {} as Record<K, T[]>;
    for (let i = 0, len = arr.length; i < len; i++) {
      const item = arr[i];
      const key = keyFn(item);
      if (!(key in result)) {
        result[key] = [];
      }
      result[key].push(item);
    }
    return result;
  },

  // ESLintのunicorn/no-array-callback-referenceを無効化
  // eslint-disable-next-line unicorn/no-array-callback-reference
  find: <T>(arr: readonly T[], predicate: (item: T) => boolean): Option<T> => arr.find(predicate),

  // eslint-disable-next-line unicorn/no-array-callback-reference
  flatMap: <T, U>(arr: readonly T[], fn: (item: T) => readonly U[]): U[] => arr.flatMap(fn),
};

// Import utilities for pipeline and Result processing
export * from './pipe';

export const StringUtils = {
  isEmpty: (str: string): boolean => str.length === 0,

  isNonEmpty: (str: string): boolean => str.length > 0,

  safeDecodeURIComponent: (encoded: string): Result<string, Error> => {
    try {
      return ResultUtils.ok(decodeURIComponent(encoded));
    } catch (error) {
      return ResultUtils.error(error as Error);
    }
  },

  /**
   * 文字列用のパイプライン関数
   */
  pipe:
    (...fns: Array<(str: string) => string>) =>
    (str: string): string => {
      let result = str;
      for (let i = 0, len = fns.length; i < len; i++) {
        result = fns[i](result);
      }
      return result;
    },

  safeSplit: (str: string, separator: string | RegExp): NonEmptyArray<string> | [] => {
    const result = str.split(separator);
    return ArrayUtils.isNonEmpty(result) ? result : [];
  },

  /**
   * Join an array of strings
   */
  join:
    (separator: string) =>
    (strings: readonly string[]): string => {
      return strings.join(separator);
    },

  filterNonEmpty: (strings: readonly string[]): string[] => strings.filter((str) => StringUtils.isNonEmpty(str)),
};
