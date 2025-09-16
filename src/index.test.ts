import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Mokuji, Destroy } from './index';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, ANCHOR_DATASET_ATTRIBUTE } from './common/constants';

describe('Mokuji.js', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // テスト用のDOM要素を作成する
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    // テスト後にクリーンアップする
    Destroy();
    container.remove();
    vi.restoreAllMocks();
  });

  it('returns undefined when no headings exist', () => {
    // 見出しを含まない要素を渡す
    container.innerHTML = '<p>This is a paragraph</p>';
    const result = Mokuji(container);

    expect(result).toBeUndefined();
  });

  it('generates a table of contents from heading elements', () => {
    // 見出し要素を含むHTMLを設定する
    container.innerHTML = `
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <h2>Section 1</h2>
      <p>Paragraph 2</p>
      <h2>Section 2</h2>
      <h3>Subsection</h3>
    `;

    const result = Mokuji(container);

    expect(result).toBeDefined();
    expect(result?.element).toBe(container);
    // OLまたはULのいずれかのリスト要素が生成されることを検証する
    expect(result?.list).toBeInstanceOf(HTMLElement);
    expect(['OL', 'UL'].includes(result?.list.tagName || '')).toBe(true);
    expect(result?.list.getAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE)).toBe('');

    // 生成された目次の構造を検証する
    const listItems = result?.list.querySelectorAll('li');
    expect(listItems?.length).toBe(4); // 見出しの数

    // 目次のリンクが正しく生成されていることを確認する
    const links = result?.list.querySelectorAll('a');
    expect(links?.length).toBe(4);
  });

  it('correctly applies minLevel and maxLevel options', () => {
    container.innerHTML = `
      <h1>Title</h1>
      <h2>Section 1</h2>
      <h3>Subsection 1</h3>
      <h4>Sub-subsection</h4>
      <h5>Detail section</h5>
      <h6>Minimal section</h6>
    `;

    // h2からh4までの見出しのみを対象とする
    const result = Mokuji(container, { minLevel: 2, maxLevel: 4 });

    expect(result).toBeDefined();
    const links = result?.list.querySelectorAll('a');
    expect(links?.length).toBe(3); // h2, h3, h4の3つの見出し

    // h1とh5, h6が含まれていないことを確認する
    const linkTexts = [...(links || [])].map((a) => a.textContent);
    expect(linkTexts).toContain('Section 1');
    expect(linkTexts).toContain('Subsection 1');
    expect(linkTexts).toContain('Sub-subsection');
    expect(linkTexts).not.toContain('Title');
    expect(linkTexts).not.toContain('Detail section');
    expect(linkTexts).not.toContain('Minimal section');
  });

  it('inserts anchor links to headings when anchorLink option is enabled', () => {
    container.innerHTML = `
      <h1>Title</h1>
      <h2>Section 1</h2>
    `;

    const result = Mokuji(container, { anchorLink: true });

    expect(result).toBeDefined();

    // 見出しにアンカーリンクが挿入されていることを確認する
    const anchorLinks = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchorLinks.length).toBe(2); // 2つの見出しにアンカーが追加される
  });

  it('removes table of contents and anchor links when Destroy function is called', () => {
    container.innerHTML = `
      <h1>Title</h1>
      <h2>Section 1</h2>
    `;

    // 目次を生成する
    const result = Mokuji(container, { anchorLink: true });
    expect(result).toBeDefined();

    // 生成された目次を明示的にドキュメントに追加する
    if (result && result.list) {
      document.body.append(result.list);
    }

    // 目次とアンカーリンクが存在することを確認する
    const tocList = document.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
    const anchorLinks = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(tocList).not.toBeNull();
    expect(anchorLinks.length).toBe(2);

    // Destroy関数を呼び出す
    Destroy();

    // 目次とアンカーリンクが削除されていることを確認する
    const tocListAfter = document.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
    const anchorLinksAfter = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(tocListAfter).toBeNull();
    expect(anchorLinksAfter.length).toBe(0);
  });

  it('outputs a warning and returns undefined when element is falsy', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = Mokuji(undefined as unknown as HTMLElement);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Mokuji: Target element not found.');
  });

  it('removes all table of contents lists when Destroy is called with multiple lists', () => {
    // 複数の目次リストを手動でDOMに追加
    const list1 = document.createElement('ol');
    list1.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');
    document.body.append(list1);

    const list2 = document.createElement('ul');
    list2.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');
    document.body.append(list2);

    const list3 = document.createElement('ol');
    list3.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');
    container.append(list3);

    // 複数のアンカーも追加
    const anchor1 = document.createElement('a');
    anchor1.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');
    container.append(anchor1);

    const anchor2 = document.createElement('a');
    anchor2.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');
    document.body.append(anchor2);

    // 削除前の確認
    expect(document.querySelectorAll(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`).length).toBe(3);
    expect(document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`).length).toBe(2);

    // Destroy関数を呼び出す
    Destroy();

    // 完了条件の検証: 全ての目次リストが削除されていること
    expect(document.querySelectorAll(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`).length).toBe(0);
    expect(document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`).length).toBe(0);
  });

  it('does not duplicate anchors when called twice on duplicate headings', () => {
    // 同じテキストの見出しを複数作成（重複見出し）
    container.innerHTML = `
      <h2>Section</h2>
      <p>Paragraph 1</p>
      <h2>Section</h2>
      <p>Paragraph 2</p>
      <h2>Section</h2>
      <h3>Another Section</h3>
      <h2>Different</h2>
    `;

    // 1回目の呼び出し
    const result1 = Mokuji(container, { anchorLink: true });

    expect(result1).toBeDefined();

    // 見出しのIDが一意であることを確認
    const headings = container.querySelectorAll('h2, h3');
    const ids = new Set<string>();
    for (const h of headings) {
      expect(h.id).toBeTruthy();
      ids.add(h.id);
    }
    expect(ids.size).toBe(headings.length); // IDが全て一意

    // アンカーの数を確認（1回目の後）
    const anchorsAfterFirst = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchorsAfterFirst.length).toBe(5); // 5つの見出しにアンカー

    // 2回目の呼び出し（重複呼び出し）
    const result2 = Mokuji(container, { anchorLink: true });

    expect(result2).toBeDefined();

    // アンカーが増殖していないことを確認
    const anchorsAfterSecond = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
    expect(anchorsAfterSecond.length).toBe(5); // まだ5つのまま（増殖していない）

    // 各見出しには1つのアンカーしかないことを確認
    for (const h of headings) {
      const headingAnchors = h.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(headingAnchors.length).toBe(1);
    }

    // 目次のリンクが一意なhrefを持つことを確認
    const tocLinks1 = result1?.list.querySelectorAll('a');
    const hrefs1 = new Set<string>();
    if (tocLinks1) {
      for (const link of tocLinks1) {
        hrefs1.add(link.getAttribute('href') || '');
      }
    }
    expect(hrefs1.size).toBe(tocLinks1?.length); // 1回目のhrefが全て一意

    const tocLinks2 = result2?.list.querySelectorAll('a');
    const hrefs2 = new Set<string>();
    if (tocLinks2) {
      for (const link of tocLinks2) {
        hrefs2.add(link.getAttribute('href') || '');
      }
    }
    expect(hrefs2.size).toBe(tocLinks2?.length); // 2回目のhrefも全て一意
  });
});
