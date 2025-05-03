/**
 * 目次生成のための型定義を提供するモジュール
 */

/**
 * 目次コンテナとして使用可能なHTML要素タグ名
 */
export type AnchorContainerTagName = 'ul' | 'ol';

/**
 * 見出しレベルを表す型（h1-h6に対応する1-6の値）
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * アンカーリンクの配置位置
 */
export type AnchorLinkPosition = 'before' | 'after';

/**
 * 目次生成のオプション設定
 */
export type MokujiOption = {
  /**
   * Wikipediaスタイルのアンカーを生成するかどうか
   * デフォルト: true (例: "見出し_テキスト" -> "見出し_テキスト", "見出し:テキスト" -> "見出しテキスト")
   * falseの場合、スペースは '_' に置換されるが、エンコードや特殊文字の変換は最小限になる
   */
  anchorType?: boolean;

  /**
   * 見出し要素の隣に、その見出しへのアンカーリンク（例: #）を追加するかどうか
   * デフォルト: false
   */
  anchorLink?: boolean;

  /**
   * `anchorLink: true` の場合に表示するシンボルまたはテキスト
   * デフォルト: '#'
   */
  anchorLinkSymbol?: string;

  /**
   * `anchorLink: true` の場合のアンカーリンクの配置位置（見出しテキストの前または後）
   * デフォルト: 'before'
   */
  anchorLinkPosition?: AnchorLinkPosition;

  /**
   * `anchorLink: true` の場合にアンカーリンク要素に適用するCSSクラス名（スペース区切りで複数指定可）
   * デフォルト: ''
   */
  anchorLinkClassName?: string;

  /**
   * 生成される目次のリストコンテナ要素のタグ名
   * デフォルト: 'ol' (順序付きリスト)
   */
  anchorContainerTagName?: AnchorContainerTagName;

  /**
   * 目次に含める最小の見出しレベル (1 = h1, 6 = h6)
   * デフォルト: 1
   */
  minLevel?: HeadingLevel;

  /**
   * 目次に含める最大の見出しレベル (1 = h1, 6 = h6)
   * デフォルト: 6
   */
  maxLevel?: HeadingLevel;
};
