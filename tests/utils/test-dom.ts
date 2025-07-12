/**
 * テスト/ベンチマーク共通のDOMユーティリティ関数
 */

import { JSDOM } from 'jsdom';

/**
 * 空のDOMドキュメントを作成
 */
export const createEmptyDocument = (): { document: Document; body: HTMLElement } => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const document = dom.window.document;
  return { document, body: document.body };
};

/**
 * 指定された数と階層の見出しを持つテストドキュメントを生成
 * ベンチマーク用にカスタマイズ可能な複雑なDOM構造を生成
 *
 * @param headingsCount 生成する見出しの総数
 * @param nestedDepth 見出しの最大階層レベル (デフォルト: 3)
 * @returns 生成されたbody要素
 */
export const createTestDocument = (headingsCount: number, nestedDepth = 3): HTMLElement => {
  const { document, body } = createEmptyDocument();

  // 見出し要素を作成するヘルパー関数
  const createHeading = (level: number, text: string): HTMLHeadingElement => {
    const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
    heading.textContent = text;
    body.append(heading);

    // 見出しの後にいくつかの段落を追加
    const paragraphCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < paragraphCount; i++) {
      const p = document.createElement('p');
      p.textContent = `Paragraph ${i + 1} under ${text}`;
      body.append(p);
    }
    return heading;
  };

  let headingCounter = 0;

  // ネストされた見出し構造を再帰的に生成
  const createNestedHeadings = (currentLevel: number, maxLevel: number, parentPrefix = ''): void => {
    if (currentLevel > maxLevel || headingCounter >= headingsCount) return;

    const siblingCount = Math.min(Math.floor(Math.random() * 3) + 1, headingsCount - headingCounter);

    for (let i = 0; i < siblingCount; i++) {
      const prefix = parentPrefix ? `${parentPrefix}.${i + 1}` : `${i + 1}`;
      const text = `Heading ${prefix}`;
      createHeading(currentLevel, text);
      headingCounter++;

      if (headingCounter >= headingsCount) return;

      // 子見出しを再帰的に作成
      createNestedHeadings(currentLevel + 1, maxLevel, prefix);
    }
  };

  createNestedHeadings(1, nestedDepth);
  return body;
};

/**
 * HTMLテキストから要素を作成（単純なテスト用）
 */
export const createElementFromHTML = (html: string): HTMLElement => {
  const { document } = createEmptyDocument();
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
};
