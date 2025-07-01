/**
 * ユーザー向けメッセージの定数定義
 * 国際化対応時の変更ポイントとなる
 */

export const ERROR_MESSAGES = {
  ELEMENT_NOT_FOUND: 'Mokuji: Target element not found.',
  NO_HEADINGS: 'Mokuji: No headings found in the target element.',
  INVALID_CONFIG: 'Mokuji: Invalid configuration provided.',
} as const;

export const DEBUG_MESSAGES = {
  GENERATING_TOC: 'Generating table of contents...',
  TOC_CREATED: 'Table of contents created successfully',
  CLEANUP_COMPLETED: 'Cleanup completed',
} as const;
