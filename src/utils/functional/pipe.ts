/**
 * 関数合成とパイプライン処理のためのユーティリティ
 * 安全で型付けされた関数チェーンを実現する
 */

import type { Result, Transform } from '../../types/core';
import { ResultUtils } from './index';

/**
 * 関数を順番に適用する汎用的なパイプ関数
 * @example
 * ```
 * // 数値を2倍にして、文字列に変換する
 * const result = pipe(
 *   5,
 *   num => num * 2,
 *   num => String(num)
 * ); // "10"
 * ```
 */
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D;
export function pipe<A, B, C, D, E>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): F;
export function pipe(value: unknown, ...fns: Array<(arg: unknown) => unknown>): unknown {
  let result = value;

  for (let i = 0, len = fns.length; i < len; i++) {
    result = fns[i](result);
  }

  return result;
}

/**
 * Result型の値に対する関数適用を行うパイプライン関数
 * エラーが発生した時点で処理を中断する
 * @example
 * ```
 * // 数値を検証して、2倍にして、文字列に変換する
 * const result = resultPipe(
 *   5,
 *   validateNumber,
 *   num => ResultUtils.ok(num * 2),
 *   num => ResultUtils.ok(String(num))
 * );
 * ```
 */
export function resultPipe<A, E>(a: A): Result<A, E>;
export function resultPipe<A, B, E>(a: A, ab: (a: A) => Result<B, E>): Result<B, E>;
export function resultPipe<A, B, C, E>(a: A, ab: (a: A) => Result<B, E>, bc: (b: B) => Result<C, E>): Result<C, E>;
export function resultPipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => Result<B, E>,
  bc: (b: B) => Result<C, E>,
  cd: (c: C) => Result<D, E>,
): Result<D, E>;
export function resultPipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => Result<B, F>,
  bc: (b: B) => Result<C, F>,
  cd: (c: C) => Result<D, F>,
  de: (d: D) => Result<E, F>,
): Result<E, F>;
export function resultPipe<A, E>(value: A, ...fns: Array<(arg: unknown) => Result<unknown, E>>): Result<unknown, E> {
  let result: Result<unknown, E> = ResultUtils.ok(value);

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
}

/**
 * Result<T, E>の値をマッピングする関数
 * 成功時のみ変換関数を適用する
 * @example
 * ```
 * const result = mapResult(
 *   ResultUtils.ok(5),
 *   num => num * 2
 * ); // Result.ok(10)
 * ```
 */
export const mapResult = <T, U, E>(result: Result<T, E>, fn: Transform<T, U>): Result<U, E> => {
  // Implement map logic inline to avoid direct callback references
  if (ResultUtils.isOk(result)) {
    return ResultUtils.ok(fn(result.data));
  }
  return result as Result<U, E>;
};

/**
 * Result<T, E>の値を別のResult型に変換する関数
 * @example
 * ```
 * const result = flatMapResult(
 *   ResultUtils.ok(5),
 *   num => validatePositive(num)
 * );
 * ```
 */
export const flatMapResult = <T, U, E>(result: Result<T, E>, fn: Transform<T, Result<U, E>>): Result<U, E> => {
  // Implement flatMap logic inline to avoid direct callback references
  if (ResultUtils.isOk(result)) {
    return fn(result.data);
  }
  return result as Result<U, E>;
};

/**
 * Function to catch and process errors
 * @example
 * ```
 * const result = catchResultError(
 *   ResultUtils.error("Not found"),
 *   error => ResultUtils.ok(defaultValue)
 * );
 * ```
 */
export const catchResultError = <T, E>(result: Result<T, E>, handler: (error: E) => Result<T, E>): Result<T, E> => {
  if (ResultUtils.isError(result)) {
    return handler(result.error);
  }
  return result;
};
