/**
 * 目次構造の生成とデータ操作
 * 階層構造の構築と検索・統計機能
 */

import type { TocItem, HeadingInfo, TocStructure } from '../types/core';
import { generateHref } from './heading';

/**
 * 平坦な見出しリストから入れ子構造を構築
 * パフォーマンス最適化: スタック操作の効率化とオブジェクト生成の最小化
 */
export const buildTocHierarchy = (headings: readonly HeadingInfo[]): readonly TocItem[] => {
  if (headings.length === 0) {
    return [];
  }

  const root: TocItem[] = [];
  const stack: { level: number; items: TocItem[] }[] = [{ level: 0, items: root }];

  for (const heading of headings) {
    const currentLevel = heading.level;

    // スタックから現在のレベル以上の項目を取り除く（最適化: while条件を簡素化）
    while (stack.length > 1 && stack.at(-1)!.level >= currentLevel) {
      stack.pop();
    }

    // 新しいアイテムを作成（satisfiesを削除してパフォーマンス向上）
    const newItem: TocItem = {
      id: heading.id,
      text: heading.text,
      href: generateHref(heading.id),
      level: heading.level,
      children: [],
    };

    // 現在のレベルの親に項目を追加
    const parent = stack.at(-1)!;
    parent.items.push(newItem);

    // 新しい項目をスタックに追加
    stack.push({ level: currentLevel, items: newItem.children as TocItem[] });
  }

  return root;
};

/**
 * 目次構造全体を作成する純粋関数
 */
export const createTocStructure = (headings: readonly HeadingInfo[]): TocStructure => {
  const items = buildTocHierarchy(headings);

  return {
    items,
    headings,
  };
};

/**
 * 目次構造が空かどうかを判定する純粋関数
 */
export const isTocStructureEmpty = (structure: TocStructure): boolean => {
  return structure.items.length === 0;
};

/**
 * 目次構造から平坦なアイテムリストを取得する純粋関数
 */
export const flattenTocItems = (items: readonly TocItem[]): readonly TocItem[] => {
  return items.flatMap((item) => [item, ...flattenTocItems(item.children)]);
};

/**
 * 特定のIDの目次アイテムを検索する純粋関数
 * 関数型アプローチを採用し、認知的複雑度を低減
 */
export const findTocItemById = (items: readonly TocItem[], id: string): TocItem | undefined => {
  return flattenTocItems(items).find((item) => item.id === id);
};

/**
 * 目次構造の統計情報を取得する純粋関数
 * 関数型アプローチを採用し、認知的複雑度を低減
 */
export const getTocStatistics = (structure: TocStructure) => {
  const flatItems = flattenTocItems(structure.items);
  const levels = flatItems.map((item) => item.level);

  // レベル別カウントを計算
  const levelCounts: Record<number, number> = {};
  for (const level of levels) {
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  }

  return {
    totalItems: flatItems.length,
    totalHeadings: structure.headings.length,
    levelCounts,
    maxDepth: levels.length > 0 ? Math.max(...levels) : 0,
    minLevel: levels.length > 0 ? Math.min(...levels) : 6,
  };
};
