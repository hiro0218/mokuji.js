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
});
