/**
 * 目次生成で使用する定数を提供するモジュール
 */

import type { MokujiOption } from './types';

/**
 * 目次関連の要素を識別するためのデータ属性
 */
export const MOKUJI_LIST_DATASET_ATTRIBUTE = 'data-mokuji-list'; // 目次リスト本体
export const ANCHOR_DATASET_ATTRIBUTE = 'data-mokuji-anchor'; // 見出し横に挿入されるアンカー

/**
 * デフォルトオプション設定
 */
export const defaultOptions: Required<MokujiOption> = {
  anchorType: true, // Wikipediaスタイルのアンカーを生成
  anchorLink: false, // 見出しへのアンカーリンクを追加
  anchorLinkSymbol: '#', // アンカーリンクのシンボル
  anchorLinkPosition: 'before', // アンカーリンクの位置
  anchorLinkClassName: '', // アンカーリンクのCSSクラス名
  anchorContainerTagName: 'ol', // 目次のコンテナ要素
  minLevel: 1, // 最小見出しレベル
  maxLevel: 6, // 最大見出しレベル
} as const; // as const ensures the object is treated as readonly with literal types
