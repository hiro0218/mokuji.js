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
 * パフォーマンス最適化: 事前に配列サイズを推定して効率化
 */
export const flattenTocItems = (items: readonly TocItem[]): readonly TocItem[] => {
  if (items.length === 0) {
    return [];
  }

  // 最初のパスで概算サイズを計算
  let estimatedSize = 0;
  const countItems = (tocItems: readonly TocItem[]): void => {
    estimatedSize += tocItems.length;
    for (const item of tocItems) {
      if (item.children.length > 0) {
        countItems(item.children);
      }
    }
  };
  countItems(items);

  // 事前に適切なサイズの配列を確保
  const result: TocItem[] = [];
  result.length = estimatedSize;
  let index = 0;

  const traverse = (tocItems: readonly TocItem[]): void => {
    for (const item of tocItems) {
      result[index++] = item;
      if (item.children.length > 0) {
        traverse(item.children);
      }
    }
  };

  traverse(items);
  return result;
};

/**
 * 特定のIDの目次アイテムを検索する純粋関数
 */
export const findTocItemById = (items: readonly TocItem[], id: string): TocItem | undefined => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    if (item.children.length > 0) {
      const found = findTocItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
};

/**
 * 目次構造の統計情報を取得する純粋関数
 * パフォーマンス最適化: 単一パスで複数の統計値を計算
 */
export const getTocStatistics = (structure: TocStructure) => {
  const flatItems = flattenTocItems(structure.items);
  const levelCounts: Record<number, number> = {};
  let maxDepth = 0;
  let minLevel = 6;

  // 単一パスで全統計値を計算
  for (const item of flatItems) {
    const level = item.level;
    levelCounts[level] = (levelCounts[level] || 0) + 1;

    if (level > maxDepth) {
      maxDepth = level;
    }
    if (level < minLevel) {
      minLevel = level;
    }
  }

  return {
    totalItems: flatItems.length,
    totalHeadings: structure.headings.length,
    levelCounts,
    maxDepth: flatItems.length > 0 ? maxDepth : 0,
    minLevel: flatItems.length > 0 ? minLevel : 6,
  };
};
