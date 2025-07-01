/**
 * DOM要素識別用のセレクタ定数
 * destroyMokuji実行時のクリーンアップ対象を特定する
 */

export const DATA_ATTRIBUTES = {
  LIST: 'data-mokuji-list',
  ANCHOR: 'data-mokuji-anchor',
} as const;

export const REGEX_PATTERNS = {
  WHITESPACE: /\s+/g,
  COLON: /:/g,
  AMPERSAND: /&+/g,
  AMPERSAND_HTML: /&amp;+/g,
} as const;
