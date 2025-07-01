/**
 * エラーメッセージとログメッセージの定数
 * 単一責任原則に従い、すべてのメッセージを一箇所で管理する
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
