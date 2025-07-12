/**
 * 関数型ユーティリティのテスト
 */
import { describe, it, expect } from 'vitest';
import { ResultUtils, OptionUtils, ArrayUtils, StringUtils } from '../../../src/utils/functional';
import type { Result, Option } from '../../../src/types/core';

// テスト用のユーティリティ関数
const doubleValue = (x: number): number => x * 2;

// eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
const mapResult = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => ResultUtils.map(result, fn);

// eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
const mapOption = <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> => OptionUtils.map(option, fn);

describe('関数型ユーティリティ', () => {
  describe('ResultUtils', () => {
    describe('ok', () => {
      it('成功の結果を作成すること', () => {
        const result = ResultUtils.ok(42);

        expect(result.success).toBe(true);
        if (ResultUtils.isOk(result)) {
          expect(result.data).toBe(42);
        }
      });
    });

    describe('error', () => {
      it('エラーの結果を作成すること', () => {
        const error = new Error('Test error');
        const result = ResultUtils.error(error);

        expect(result.success).toBe(false);
        if (ResultUtils.isError(result)) {
          expect(result.error).toBe(error);
        }
      });
    });

    describe('isOk', () => {
      it('成功の場合trueを返すこと', () => {
        const result = ResultUtils.ok(42);
        expect(ResultUtils.isOk(result)).toBe(true);
      });

      it('エラーの場合falseを返すこと', () => {
        const result = ResultUtils.error(new Error('Test'));
        expect(ResultUtils.isOk(result)).toBe(false);
      });
    });

    describe('isError', () => {
      it('エラーの場合trueを返すこと', () => {
        const result = ResultUtils.error(new Error('Test'));
        expect(ResultUtils.isError(result)).toBe(true);
      });

      it('成功の場合falseを返すこと', () => {
        const result = ResultUtils.ok(42);
        expect(ResultUtils.isError(result)).toBe(false);
      });
    });

    describe('map', () => {
      it('成功の場合関数を適用すること', () => {
        const result = ResultUtils.ok(2);
        const mapped = mapResult(result, doubleValue);

        expect(ResultUtils.isOk(mapped)).toBe(true);
        if (ResultUtils.isOk(mapped)) {
          expect(mapped.data).toBe(4);
        }
      });

      it('エラーの場合そのまま返すこと', () => {
        const error = new Error('Test');
        const result = ResultUtils.error(error);
        const mapped = mapResult(result, doubleValue);

        expect(ResultUtils.isError(mapped)).toBe(true);
        if (ResultUtils.isError(mapped)) {
          expect(mapped.error).toBe(error);
        }
      });
    });

    describe('getOrElse', () => {
      it('成功の場合データを返すこと', () => {
        const result = ResultUtils.ok(42);
        expect(ResultUtils.getOrElse(result, 0)).toBe(42);
      });

      it('エラーの場合デフォルト値を返すこと', () => {
        const result = ResultUtils.error(new Error('Test'));
        expect(ResultUtils.getOrElse(result, 0)).toBe(0);
      });
    });
  });

  describe('OptionUtils', () => {
    describe('some/none', () => {
      it('値がある場合にsomeが正しく動作すること', () => {
        const option = OptionUtils.some(42);
        expect(option).toBe(42);
      });

      it('noneが正しく動作すること', () => {
        const option = OptionUtils.none();
        expect(option).toBeUndefined();
      });
    });

    describe('isSome', () => {
      it('値がある場合trueを返すこと', () => {
        expect(OptionUtils.isSome(42)).toBe(true);
      });

      it('undefinedの場合falseを返すこと', () => {
        const optionValue = undefined;
        expect(OptionUtils.isSome(optionValue)).toBe(false);
      });
    });

    describe('isNone', () => {
      it('値がある場合falseを返すこと', () => {
        expect(OptionUtils.isNone(42)).toBe(false);
      });

      it('undefinedの場合trueを返すこと', () => {
        const optionValue = undefined;
        expect(OptionUtils.isNone(optionValue)).toBe(true);
      });
    });

    describe('map', () => {
      it('値がある場合関数を適用すること', () => {
        const option = 2;
        const mapped = mapOption(option, doubleValue);
        expect(mapped).toBe(4);
      });

      it('undefinedの場合undefinedを返すこと', () => {
        const option = undefined;
        const mapped = mapOption(option, doubleValue);
        expect(mapped).toBeUndefined();
      });
    });

    describe('getOrElse', () => {
      it('値がある場合その値を返すこと', () => {
        expect(OptionUtils.getOrElse(42, 0)).toBe(42);
      });

      it('値がない場合デフォルト値を返すこと', () => {
        expect(OptionUtils.getOrElse(undefined, 0)).toBe(0);
        expect(OptionUtils.getOrElse(undefined, 0)).toBe(0);
      });
    });
  });

  describe('ArrayUtils', () => {
    describe('isNonEmpty', () => {
      it('空でない配列の場合trueを返すこと', () => {
        expect(ArrayUtils.isNonEmpty([1, 2, 3])).toBe(true);
      });

      it('空の配列の場合falseを返すこと', () => {
        expect(ArrayUtils.isNonEmpty([])).toBe(false);
      });
    });

    describe('head', () => {
      it('空でない配列の場合先頭要素を返すこと', () => {
        expect(ArrayUtils.head([1, 2, 3])).toBe(1);
      });

      it('空の配列の場合undefinedを返すこと', () => {
        expect(ArrayUtils.head([])).toBeUndefined();
      });
    });

    describe('last', () => {
      it('空でない配列の場合最後の要素を返すこと', () => {
        expect(ArrayUtils.last([1, 2, 3])).toBe(3);
      });

      it('空の配列の場合undefinedを返すこと', () => {
        expect(ArrayUtils.last([])).toBeUndefined();
      });
    });
  });

  describe('StringUtils', () => {
    describe('isEmpty/isNonEmpty', () => {
      it('空文字の場合isEmptyはtrueを返すこと', () => {
        expect(StringUtils.isEmpty('')).toBe(true);
      });

      it('空でない文字列の場合isEmptyはfalseを返すこと', () => {
        expect(StringUtils.isEmpty('abc')).toBe(false);
      });

      it('空文字の場合isNonEmptyはfalseを返すこと', () => {
        expect(StringUtils.isNonEmpty('')).toBe(false);
      });

      it('空でない文字列の場合isNonEmptyはtrueを返すこと', () => {
        expect(StringUtils.isNonEmpty('abc')).toBe(true);
      });
    });

    describe('safeDecodeURIComponent', () => {
      it('デコード可能な文字列の場合成功を返すこと', () => {
        const result = StringUtils.safeDecodeURIComponent('hello%20world');

        expect(ResultUtils.isOk(result)).toBe(true);
        expect(ResultUtils.getOrElse(result, '')).toBe('hello world');
      });

      it('デコード不可能な文字列の場合エラーを返すこと', () => {
        const result = StringUtils.safeDecodeURIComponent('%');
        expect(ResultUtils.isError(result)).toBe(true);
      });
    });
  });
});
