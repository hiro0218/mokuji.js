import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createAnchorMap,
  findAnchorById,
  findAnchorByIdWithoutSuffix,
  findAnchorByText,
  findMatchingAnchor,
  applyClassNamesToElement,
  createAnchorElement,
  createAnchorForHeading,
  insertAnchorsIntoHeadings,
} from './anchor';
import { ANCHOR_DATASET_ATTRIBUTE, defaultOptions } from './utils/constants';
import type { MokujiOption } from './types';

describe('anchor', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ========================================
  // Anchor Map Generation Tests
  // ========================================

  describe('createAnchorMap', () => {
    it('空の配列から空のMapを生成する', () => {
      const result = createAnchorMap([]);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('アンカー要素からhashをキーとするMapを作成する', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#heading-1';
      const anchor2 = document.createElement('a');
      anchor2.href = '#heading-2';

      const result = createAnchorMap([anchor1, anchor2]);

      expect(result.size).toBe(2);
      expect(result.get('heading-1')).toBe(anchor1);
      expect(result.get('heading-2')).toBe(anchor2);
    });

    it('hashが空のアンカーは無視する', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#';
      const anchor2 = document.createElement('a');
      anchor2.href = '#heading-1';

      const result = createAnchorMap([anchor1, anchor2]);

      expect(result.size).toBe(1);
      expect(result.has('')).toBe(false);
      expect(result.get('heading-1')).toBe(anchor2);
    });

    it('同じhashを持つ複数のアンカーがある場合、最後のものを保持する', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#duplicate';
      anchor1.textContent = 'First';
      const anchor2 = document.createElement('a');
      anchor2.href = '#duplicate';
      anchor2.textContent = 'Second';

      const result = createAnchorMap([anchor1, anchor2]);

      expect(result.size).toBe(1);
      expect(result.get('duplicate')).toBe(anchor2);
    });
  });

  // ========================================
  // Anchor Finding Tests
  // ========================================

  describe('findAnchorById', () => {
    it('直接IDが一致するアンカーを検索する', () => {
      const anchor1 = document.createElement('a');
      const anchor2 = document.createElement('a');
      const anchorMap = new Map([
        ['heading1', anchor1],
        ['heading2', anchor2],
      ]);

      expect(findAnchorById(anchorMap, 'heading1')).toBe(anchor1);
      expect(findAnchorById(anchorMap, 'heading2')).toBe(anchor2);
      expect(findAnchorById(anchorMap, 'not-exist')).toBeUndefined();
    });
  });

  describe('findAnchorByIdWithoutSuffix', () => {
    it('数字サフィックスを除去してIDを検索する', () => {
      const anchor1 = document.createElement('a');
      const anchor2 = document.createElement('a');
      const anchorMap = new Map([
        ['overview', anchor1],
        ['installation', anchor2],
      ]);

      // サフィックス付きIDから検索
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'overview_1')).toBe(anchor1);
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'overview_2')).toBe(anchor1);
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'installation_10')).toBe(anchor2);
    });

    it('サフィックスがないIDの場合はundefinedを返す', () => {
      const anchorMap = new Map([['overview', document.createElement('a')]]);

      // サフィックスがない場合はundefined
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'overview')).toBeUndefined();
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'not_exist')).toBeUndefined();
    });

    it('アンダースコアが含まれるがサフィックスではない場合', () => {
      const anchor = document.createElement('a');
      const anchorMap = new Map([['user_profile', anchor]]);

      // user_profileはサフィックスではない
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'user_profile')).toBeUndefined();
      // user_profile_1はサフィックス付き
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'user_profile_1')).toBe(anchor);
    });
  });

  describe('findAnchorByText', () => {
    it('テキスト内容でアンカーを検索する', () => {
      const anchor1 = document.createElement('a');
      anchor1.textContent = 'Introduction';
      const anchor2 = document.createElement('a');
      anchor2.textContent = 'Getting Started';
      const anchorMap = new Map([
        ['intro', anchor1],
        ['start', anchor2],
      ]);

      expect(findAnchorByText(anchorMap, 'Introduction')).toBe(anchor1);
      expect(findAnchorByText(anchorMap, 'Getting Started')).toBe(anchor2);
      expect(findAnchorByText(anchorMap, 'Not Found')).toBeUndefined();
    });

    it('前後の空白を無視して検索する', () => {
      const anchor = document.createElement('a');
      anchor.textContent = '  Trimmed Text  ';
      const anchorMap = new Map([['trimmed', anchor]]);

      expect(findAnchorByText(anchorMap, 'Trimmed Text')).toBe(anchor);
      expect(findAnchorByText(anchorMap, '  Trimmed Text  ')).toBe(anchor);
    });

    it('空文字列の場合はundefinedを返す', () => {
      const anchorMap = new Map([['test', document.createElement('a')]]);

      expect(findAnchorByText(anchorMap, '')).toBeUndefined();
      expect(findAnchorByText(anchorMap, '  ')).toBeUndefined();
    });
  });

  describe('findMatchingAnchor', () => {
    it('優先順位1: 直接IDが一致する場合', () => {
      const directMatch = document.createElement('a');
      directMatch.textContent = 'Direct';
      const suffixMatch = document.createElement('a');
      suffixMatch.textContent = 'Suffix';
      const textMatch = document.createElement('a');
      textMatch.textContent = 'Text Match';

      const anchorMap = new Map([
        ['heading1', directMatch],
        ['heading', suffixMatch], // heading1_1のサフィックス除去後にマッチ
        ['other', textMatch],
      ]);

      // 直接IDマッチが最優先
      expect(findMatchingAnchor(anchorMap, 'heading1', 'Text Match')).toBe(directMatch);
    });

    it('優先順位2: サフィックス除去後にIDが一致する場合', () => {
      const suffixMatch = document.createElement('a');
      suffixMatch.textContent = 'Suffix Match';
      const textMatch = document.createElement('a');
      textMatch.textContent = 'Duplicate Heading';

      const anchorMap = new Map([
        ['overview', suffixMatch],
        ['other', textMatch],
      ]);

      // 直接マッチなし、サフィックス除去でマッチ
      expect(findMatchingAnchor(anchorMap, 'overview_2', 'Duplicate Heading')).toBe(suffixMatch);
    });

    it('優先順位3: テキスト内容が一致する場合', () => {
      const textMatch = document.createElement('a');
      textMatch.textContent = 'Installation Guide';

      const anchorMap = new Map([['different-id', textMatch]]);

      // IDマッチなし、テキストでマッチ
      expect(findMatchingAnchor(anchorMap, 'install_3', 'Installation Guide')).toBe(textMatch);
    });

    it('どのフォールバックでも見つからない場合', () => {
      const anchor = document.createElement('a');
      anchor.textContent = 'Different Text';

      const anchorMap = new Map([['different', anchor]]);

      expect(findMatchingAnchor(anchorMap, 'not-found', 'No Match')).toBeUndefined();
    });
  });

  // ========================================
  // Anchor Factory Tests
  // ========================================

  describe('applyClassNamesToElement', () => {
    it('単一のクラス名を適用する', () => {
      const element = document.createElement('div');
      applyClassNamesToElement(element, 'test-class');

      expect(element.classList.contains('test-class')).toBe(true);
    });

    it('複数のクラス名を適用する', () => {
      const element = document.createElement('div');
      applyClassNamesToElement(element, 'class1 class2 class3');

      expect(element.classList.contains('class1')).toBe(true);
      expect(element.classList.contains('class2')).toBe(true);
      expect(element.classList.contains('class3')).toBe(true);
    });

    it('空文字の場合はクラスを追加しない', () => {
      const element = document.createElement('div');
      const originalClassListLength = element.classList.length;
      applyClassNamesToElement(element, '');

      expect(element.classList.length).toBe(originalClassListLength);
    });

    it('既存のクラスを保持しつつ新しいクラスを追加する', () => {
      const element = document.createElement('div');
      element.classList.add('existing-class');
      applyClassNamesToElement(element, 'new-class');

      expect(element.classList.contains('existing-class')).toBe(true);
      expect(element.classList.contains('new-class')).toBe(true);
    });
  });

  describe('createAnchorElement', () => {
    it('基本的なアンカーテンプレートを作成する', () => {
      const anchor = createAnchorElement(defaultOptions);

      expect(anchor).toBeInstanceOf(HTMLAnchorElement);
      expect(anchor.dataset.mokujiAnchor).toBe('');
      // テンプレートはtextContentを持たない（clone時に設定される）
      expect(anchor.textContent).toBe('');
    });

    it('デフォルトオプションでクラス名が空の場合', () => {
      const anchor = createAnchorElement(defaultOptions);

      // デフォルトでは anchorLinkClassName が空なのでクラスは追加されない
      expect(anchor.classList.length).toBe(0);
    });

    it('カスタムクラス名を適用する', () => {
      const options = { ...defaultOptions, anchorLinkClassName: 'custom-anchor-class' };
      const anchor = createAnchorElement(options);

      expect(anchor.classList.contains('custom-anchor-class')).toBe(true);
    });
  });

  describe('createAnchorForHeading', () => {
    it('見出しのtextContentがnullの場合でも安全に処理する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      Object.defineProperty(heading, 'textContent', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const anchorTemplate = createAnchorElement(defaultOptions);
      const anchorMap = new Map<string, HTMLAnchorElement>();
      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      anchorMap.set('test-heading', tocAnchor);

      const result = createAnchorForHeading(heading, anchorMap, anchorTemplate, defaultOptions);

      expect(result).toBeDefined();
      expect(result?.href).toContain('#test-heading');
    });

    it('マッチするアンカーが見つからない場合はundefinedを返す', () => {
      const heading = document.createElement('h2');
      heading.id = 'no-match';
      heading.textContent = 'No Match';

      const anchorTemplate = createAnchorElement(defaultOptions);
      const anchorMap = new Map<string, HTMLAnchorElement>();
      // anchorMapに対応するエントリがない

      const result = createAnchorForHeading(heading, anchorMap, anchorTemplate, defaultOptions);

      expect(result).toBeUndefined();
    });
  });

  // ========================================
  // Anchor Insertion Tests
  // ========================================

  describe('insertAnchorsIntoHeadings', () => {
    it('見出しにアンカーリンクを挿入する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: 'anchor-link',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(1);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeTruthy();
      expect(insertedAnchor?.textContent).toBe('#');
    });

    it('anchorLinkPosition="after"の場合、見出しの最後にアンカーを配置する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '🔗',
        anchorLinkPosition: 'after' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(1);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeTruthy();
      expect(insertedAnchor).toBe(heading.lastElementChild);
      expect(insertedAnchor?.textContent).toBe('🔗');
    });

    it('既存のアンカーを削除してから新しいアンカーを挿入する', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';

      // 既存のアンカーを追加
      const existingAnchor = document.createElement('a');
      existingAnchor.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');
      existingAnchor.textContent = 'old';
      heading.append(existingAnchor);
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: 'new',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(1);

      const anchors = heading.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(anchors).toHaveLength(1);
      expect(anchors[0].textContent).toBe('new');
    });

    it('対応するアンカーが見つからない見出しはスキップする', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const anchorMap = new Map(); // 空のMap

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(0); // 空のMapなので挿入されない

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeNull();
    });
  });
});
