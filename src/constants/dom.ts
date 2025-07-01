/**
 * DOM要素識別用のデータ属性定数
 * 要素の識別とセレクタに使用する属性名を統一管理する
 */

export const DATA_ATTRIBUTES = {
  LIST: 'data-mokuji-list',
  ANCHOR: 'data-mokuji-anchor',
} as const;

/**
 * 正規表現パターンの定数
 * パフォーマンス最適化のため事前にコンパイルされた正規表現
 */
export const REGEX_PATTERNS = {
  WHITESPACE: /\s+/g,
  COLON: /:/g,
  AMPERSAND: /&+/g,
  AMPERSAND_HTML: /&amp;+/g,
} as const;
