/**
 * 目次生成のための型定義を提供するモジュール
 */

/** 目次コンテナとして使用可能なHTML要素タグ名 */
type AnchorContainerTagNameProps = 'ul' | 'ol';

export type MokujiOption = {
  /** Wikipediaスタイルのアンカーを生成するかどうか */
  anchorType?: boolean;

  /** 見出しへのアンカーリンクを追加するかどうか */
  anchorLink?: boolean;

  /** アンカーリンクとして表示するシンボル */
  anchorLinkSymbol?: string;

  /** アンカーリンクの配置位置 */
  anchorLinkPosition?: 'before' | 'after';

  /** アンカーリンクに適用するCSSクラス名 */
  anchorLinkClassName?: string;

  /** 目次のコンテナとして使用するHTML要素のタグ名 */
  anchorContainerTagName?: AnchorContainerTagNameProps;

  /** 最小見出しレベル（例: 1はh1を意味する。これより小さいレベルは表示しない） */
  minLevel?: number;

  /** 最大見出しレベル（例: 3はh3を意味する。これより大きいレベルは表示しない） */
  maxLevel?: number;
};
