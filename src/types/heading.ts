/**
 * 見出し要素関連の型定義
 */

/**
 * 見出しのレベル（h1-h6）
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 見出しの情報
 */
export type HeadingInfo = {
  /**
   * 見出しのID (アンカーリンクのターゲット)
   */
  readonly id: string;

  /**
   * 見出しのテキスト内容
   */
  readonly text: string;

  /**
   * 見出しのレベル (h1=1, h2=2, etc.)
   */
  readonly level: HeadingLevel;

  /**
   * 対応するDOM要素への参照
   */
  readonly element: HTMLHeadingElement;
};

/**
 * 見出し抽出オプション
 */
export type HeadingExtractOptions = {
  /**
   * レベルによるフィルタリングを行うか
   */
  filterByLevel?: boolean;

  /**
   * 最小レベル (例: 2 = h2以上)
   */
  minLevel?: HeadingLevel;

  /**
   * 最大レベル (例: 4 = h4以下)
   */
  maxLevel?: HeadingLevel;

  /**
   * IDを生成するか
   */
  generateId?: boolean;

  /**
   * 使用済みIDの集合
   */
  usedIds?: Set<string>;

  /**
   * Wikipediaスタイルのアンカーを使用するか
   */
  anchorType?: boolean;
};
