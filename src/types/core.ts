/**
 * 型安全性の中核定義
 * 各カテゴリの型定義をインポートしエクスポートする中央モジュール
 */

// 関数型プログラミング関連の型定義
import type { Result, Option, NonEmptyArray, Transform, ErrorHandler, Predicate, Effect } from './functional';

// 見出し関連の型定義
import type { HeadingLevel, HeadingInfo, HeadingExtractOptions } from './heading';

// 目次関連の型定義
import type {
  ContainerTagName,
  AnchorPosition,
  TocItem,
  TocStructure,
  MokujiConfig,
  RequiredMokujiConfig,
  MokujiResult,
} from './toc';

// DOM操作関連の型定義
import type { DomEffect, ElementFactory } from './dom';

// すべての型を再エクスポート
export type {
  // 関数型
  Result,
  Option,
  NonEmptyArray,
  Transform,
  ErrorHandler,
  Predicate,
  Effect,

  // 見出し
  HeadingLevel,
  HeadingInfo,
  HeadingExtractOptions,

  // 目次
  ContainerTagName,
  AnchorPosition,
  TocItem,
  TocStructure,
  MokujiConfig,
  RequiredMokujiConfig,
  MokujiResult,

  // DOM
  DomEffect,
  ElementFactory,
};
