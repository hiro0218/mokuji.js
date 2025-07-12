/**
 * 目次生成APIのテスト
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMokuji, validateMokujiConfig, getMokujiDebugInfo, destroyMokuji } from '../../../src/api/create-mokuji';
import { ResultUtils } from '../../../src/utils/functional';
import { ERROR_MESSAGES, DATA_ATTRIBUTES } from '../../../src/constants';
import { HeadingLevel } from '../../../src/types/core';

describe('目次生成API', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // テスト用のコンテナ要素を作成
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    // テスト後にクリーンアップ
    container.remove();
  });

  describe('createMokuji', () => {
    it('基本的な目次を生成すること', () => {
      container.innerHTML = `
        <h1>Heading 1</h1>
        <p>Paragraph</p>
        <h2>Heading 2</h2>
      `;

      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const { listElement } = result.data;
        expect(listElement).toBeDefined();
        expect(listElement.tagName.toLowerCase()).toBe('ol');
        expect(listElement.children.length).toBe(1); // h1
        expect(listElement.querySelector('li > a')?.textContent).toBe('Heading 1');
        expect(listElement.querySelector('li > ol > li > a')?.textContent).toBe('Heading 2');
      }
    });

    it('要素が存在しない場合はエラーを返すこと', () => {
      const result = createMokuji();

      expect(ResultUtils.isError(result)).toBe(true);
      if (ResultUtils.isError(result)) {
        expect(result.error.message).toBe(ERROR_MESSAGES.ELEMENT_NOT_FOUND);
      }
    });

    it('見出しが存在しない場合はエラーを返すこと', () => {
      container.innerHTML = '<p>No headings here</p>';

      const result = createMokuji(container);

      expect(ResultUtils.isError(result)).toBe(true);
      if (ResultUtils.isError(result)) {
        expect(result.error.message).toBe(ERROR_MESSAGES.NO_HEADINGS);
      }
    });

    it('カスタム設定を適用すること', () => {
      container.innerHTML = '<h1>Test</h1>';

      const result = createMokuji(container, {
        containerTagName: 'ul',
        anchorLink: true,
      });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const { listElement } = result.data;
        expect(listElement.tagName.toLowerCase()).toBe('ul');
        expect(container.querySelector(`[${DATA_ATTRIBUTES.ANCHOR}]`)).not.toBeNull();
      }
    });
  });

  describe('validateMokujiConfig', () => {
    it('正しい設定ではtrueを返すこと', () => {
      expect(
        validateMokujiConfig({
          minLevel: 1,
          maxLevel: 6,
          containerTagName: 'ol',
        }),
      ).toBe(true);
    });

    it('設定がundefinedの場合trueを返すこと', () => {
      expect(validateMokujiConfig()).toBe(true);
    });

    it('minLevel > maxLevelの場合falseを返すこと', () => {
      expect(
        validateMokujiConfig({
          minLevel: 4,
          maxLevel: 2,
        }),
      ).toBe(false);
    });

    it('不正な見出しレベルではfalseを返すこと', () => {
      expect(
        validateMokujiConfig({
          minLevel: 0 as unknown as HeadingLevel,
          maxLevel: 7 as unknown as HeadingLevel,
        }),
      ).toBe(false);
    });
  });

  describe('getMokujiDebugInfo', () => {
    it('要素が存在する場合、デバッグ情報を返すこと', () => {
      container.innerHTML = `
        <h1>Title</h1>
        <h2>Subtitle</h2>
      `;

      const info = getMokujiDebugInfo(container);

      expect(info).toHaveProperty('config');
      expect(info).toHaveProperty('totalHeadings', 2);
      expect(info).toHaveProperty('headingLevels');
      expect(info.headingLevels).toEqual([1, 2]);
    });

    it('要素が存在しない場合、エラーを返すこと', () => {
      const info = getMokujiDebugInfo();
      expect(info).toHaveProperty('error', ERROR_MESSAGES.ELEMENT_NOT_FOUND);
    });
  });

  describe('destroyMokuji', () => {
    it('目次要素を削除すること', () => {
      container.id = 'test-container';
      container.innerHTML = '<h1>Test</h1>';

      const result = createMokuji(container, { anchorLink: true });
      expect(ResultUtils.isOk(result)).toBe(true);

      if (ResultUtils.isOk(result)) {
        const { listElement } = result.data;
        container.append(listElement);

        expect(document.querySelector(`[${DATA_ATTRIBUTES.LIST}]`)).not.toBeNull();
        expect(document.querySelector(`[${DATA_ATTRIBUTES.ANCHOR}]`)).not.toBeNull();

        destroyMokuji('test-container');

        expect(document.querySelector(`[${DATA_ATTRIBUTES.LIST}]`)).toBeNull();
        expect(document.querySelector(`[${DATA_ATTRIBUTES.ANCHOR}]`)).toBeNull();
      }
    });
  });
});
