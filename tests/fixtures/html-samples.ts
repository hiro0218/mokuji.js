/**
 * テスト用HTMLサンプルデータ
 */

export const BASIC_HTML = `
<div id="content">
  <h1>Main Heading</h1>
  <p>Some content here.</p>
  <h2>Sub Heading 1</h2>
  <p>More content.</p>
  <h3>Sub-sub Heading</h3>
  <p>Even more content.</p>
  <h2>Sub Heading 2</h2>
  <p>Final content.</p>
</div>
`;

export const NESTED_HEADINGS_HTML = `
<div id="content">
  <h1>Main Heading</h1>
  <p>Some content here.</p>
  <h2>Sub Heading 1</h2>
  <p>More content.</p>
  <h3>Sub-sub Heading 1</h3>
  <p>Even more content.</p>
  <h4>Deep Nested Heading</h4>
  <p>Very nested content.</p>
  <h3>Sub-sub Heading 2</h3>
  <p>Another sub-sub section.</p>
  <h2>Sub Heading 2</h2>
  <p>Final content.</p>
</div>
`;

export const LEVEL_SKIPPING_HTML = `
<div id="content">
  <h1>Main Heading</h1>
  <p>Some content here.</p>
  <h3>Skipped H2</h3>
  <p>Content after skipping h2.</p>
  <h2>Back to H2</h2>
  <p>Content at h2 level.</p>
  <h4>Skipped H3 Again</h4>
  <p>Deep nested content.</p>
</div>
`;

export const EMPTY_HEADINGS_HTML = `
<div id="content">
  <p>No headings here, just paragraphs.</p>
  <p>Another paragraph.</p>
</div>
`;

export const DUPLICATE_TEXT_HTML = `
<div id="content">
  <h1>Duplicate</h1>
  <p>First section.</p>
  <h2>Duplicate</h2>
  <p>Second section with same heading.</p>
  <h2>Duplicate</h2>
  <p>Third section with same heading.</p>
</div>
`;

export const SPECIAL_CHARS_HTML = `
<div id="content">
  <h1>Special & Characters</h1>
  <p>Section with ampersand.</p>
  <h2>Spaces and Symbols: #!?</h2>
  <p>Section with various symbols.</p>
  <h2>日本語の見出し</h2>
  <p>Japanese heading section.</p>
</div>
`;

import { createElementFromHTML } from '../utils/test-dom';

/**
 * HTML文字列からテスト要素を生成
 * @deprecated 代わりに../utils/test-domのcreateElementFromHTMLを使用してください
 */
export const createTestElement = (html: string): HTMLElement => {
  return createElementFromHTML(html);
};
