/**
 * 目次生成のための型定義を提供するモジュール
 */

/** 目次コンテナとして使用可能なHTML要素タグ名 */
export type AnchorContainerTagName = 'ul' | 'ol';

/** 見出しレベルを表す型（h1-h6に対応する1-6の値） */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** アンカーリンクの配置位置 */
export type AnchorLinkPosition = 'before' | 'after';

export type MokujiOption = {
  /** Wikipediaスタイルのアンカーを生成するかどうか */
  anchorType?: boolean;

  /** 見出しへのアンカーリンクを追加するかどうか */
  anchorLink?: boolean;

  /** アンカーリンクとして表示するシンボル */
  anchorLinkSymbol?: string;

  /** アンカーリンクの配置位置 */
  anchorLinkPosition?: AnchorLinkPosition;

  /** アンカーリンクに適用するCSSクラス名 */
  anchorLinkClassName?: string;

  /** 目次のコンテナとして使用するHTML要素のタグ名 */
  anchorContainerTagName?: AnchorContainerTagName;

  /** 最小見出しレベル */
  minLevel?: HeadingLevel;

  /** 最大見出しレベル */
  maxLevel?: HeadingLevel;
};
