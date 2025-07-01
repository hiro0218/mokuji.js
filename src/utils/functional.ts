import type { Result, Option, NonEmptyArray } from '../types/core';

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

export const ArrayUtils = {
  isNonEmpty: <T>(arr: readonly T[]): arr is NonEmptyArray<T> => arr.length > 0,

  head: <T>(arr: readonly T[]): Option<T> => (arr.length > 0 ? arr[0] : undefined),

  last: <T>(arr: readonly T[]): Option<T> => (arr.length > 0 ? (arr.at(-1) ?? undefined) : undefined),

  groupBy: <T, K extends string | number | symbol>(arr: readonly T[], keyFn: (item: T) => K): Record<K, T[]> => {
    const result = {} as Record<K, T[]>;
    for (const item of arr) {
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

export const StringUtils = {
  isEmpty: (str: string): boolean => str.length === 0,

  isNonEmpty: (str: string): boolean => str.length > 0,

  // try-catch内でのURL decodeエラーをResult型で安全に処理するため
  safeDecodeURIComponent: (encoded: string): Result<string, Error> => {
    try {
      return ResultUtils.ok(decodeURIComponent(encoded));
    } catch (error) {
      return ResultUtils.error(error as Error);
    }
  },

  // 文字列変換の関数合成でパイプラインパターンを実現するため
  pipe:
    (...fns: Array<(str: string) => string>) =>
    (str: string): string => {
      let result = str;
      for (const fn of fns) {
        result = fn(result);
      }
      return result;
    },

  // splitの結果が空配列になる場合の型安全性を保証するため
  safeSplit: (str: string, separator: string | RegExp): NonEmptyArray<string> | [] => {
    const result = str.split(separator);
    return ArrayUtils.isNonEmpty(result) ? result : [];
  },

  filterNonEmpty: (strings: readonly string[]): string[] => strings.filter((str) => StringUtils.isNonEmpty(str)),
};
