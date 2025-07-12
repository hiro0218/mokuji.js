/**
 * 関数型プログラミングのための型定義
 */

/**
 * 成功または失敗を表す結果型
 * Rustの`Result`型に着想を得たパターン
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * 値が存在するかもしれないし、しないかもしれないことを表す型
 * Rustの`Option`型に相当
 */
export type Option<T> = T | null | undefined;

/**
 * 少なくとも1つの要素を持つ配列型
 */
export type NonEmptyArray<T> = readonly [T, ...T[]];

/**
 * パイプラインで使用する変換関数の型
 */
export type Transform<T, U> = (input: T) => U;

/**
 * エラーハンドラの型
 */
export type ErrorHandler<T, E> = (error: E) => Result<T, E>;

/**
 * 条件式の型
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * 副作用の管理用
 */
export type Effect<T = void> = () => T;
