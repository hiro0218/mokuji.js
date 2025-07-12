/**
 * Type definitions for functional programming
 */

/**
 * Result type representing success or failure
 * Pattern inspired by Rust's `Result` type
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Type representing a value that may or may not exist
 * Equivalent to Rust's `Option` type
 */
export type Option<T> = T | null | undefined;

/**
 * Array type with at least one element
 */
export type NonEmptyArray<T> = readonly [T, ...T[]];

/**
 * Type for transformation functions used in pipelines
 */
export type Transform<T, U> = (input: T) => U;

/**
 * Type for error handlers
 */
export type ErrorHandler<T, E> = (error: E) => Result<T, E>;

/**
 * Type for predicates
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * For managing side effects
 */
export type Effect<T = void> = () => T;
