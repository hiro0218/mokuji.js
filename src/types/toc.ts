/**
 * 目次関連の型定義
 */

import type { HeadingInfo, HeadingLevel } from './heading';

/**
 * コンテナ要素のタグ名
 */
export type ContainerTagName = 'ul' | 'ol';

/**
 * アンカーリンクの位置
 */
export type AnchorPosition = 'before' | 'after';

/**
 * 目次項目の定義
 */
export type TocItem = {
  /**
   * 項目のID
   */
  readonly id: string;

  /**
   * 表示テキスト
   */
  readonly text: string;

  /**
   * リンク先URL（通常は #id 形式）
   */
  readonly href: string;

  /**
   * 見出しレベル
   */
  readonly level: HeadingLevel;

  /**
   * 子項目
   */
  readonly children: readonly TocItem[];
};

/**
 * 目次構造全体を表す型
 */
export type TocStructure = {
  /**
   * 階層化された目次項目
   */
  readonly items: readonly TocItem[];

  /**
   * 元となった見出し情報
   */
  readonly headings: readonly HeadingInfo[];
};

/**
 * 目次設定オプション
 */
export type MokujiConfig = {
  /**
   * Wikipediaスタイルのアンカーを使用するか
   */
  readonly anchorType?: boolean;

  /**
   * アンカーリンクを追加するか
   */
  readonly anchorLink?: boolean;

  /**
   * アンカーリンクのシンボル
   */
  readonly anchorLinkSymbol?: string;

  /**
   * アンカーリンクの位置
   */
  readonly anchorLinkPosition?: AnchorPosition;

  /**
   * アンカーリンクのクラス名
   */
  readonly anchorLinkClassName?: string;

  /**
   * コンテナ要素のタグ名
   */
  readonly containerTagName?: ContainerTagName;

  /**
   * 最小見出しレベル
   */
  readonly minLevel?: HeadingLevel;

  /**
   * 最大見出しレベル
   */
  readonly maxLevel?: HeadingLevel;
};

/**
 * 必須フィールドを含む設定オプション
 */
export type RequiredMokujiConfig = Required<MokujiConfig>;

/**
 * 目次生成の結果
 */
export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  /**
   * 対象要素
   */
  readonly targetElement: T;

  /**
   * 生成された目次リスト要素
   */
  readonly listElement: HTMLUListElement | HTMLOListElement;

  /**
   * 目次構造
   */
  readonly structure: TocStructure;
};
