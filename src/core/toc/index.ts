/**
 * 目次階層構造の構築
 * スタックベースアルゴリズムで任意の見出しレベル飛びに対応
 */

import type { TocItem, HeadingInfo, TocStructure } from '../../types/core';
import { generateHref } from '../heading';

/**
 * h1→h3のような見出しレベル飛びを許容する階層構築アルゴリズム
 */
export const buildTocHierarchy = (headings: readonly HeadingInfo[]): readonly TocItem[] => {
  if (headings.length === 0) {
    return [];
  }

  const root: TocItem[] = [];
  const stack: { level: number; items: TocItem[] }[] = [{ level: 0, items: root }];

  for (let i = 0, len = headings.length; i < len; i++) {
    const heading = headings[i];
    const currentLevel = heading.level;

    while (stack.length > 1 && stack.at(-1)!.level >= currentLevel) {
      stack.pop();
    }

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
 * Creates a complete table of contents structure
 */
export const createTocStructure = (headings: readonly HeadingInfo[]): TocStructure => {
  const items = buildTocHierarchy(headings);

  return {
    items,
    headings,
  };
};

export const isTocStructureEmpty = (structure: TocStructure): boolean => {
  return structure.items.length === 0;
};

export const flattenTocItems = (items: readonly TocItem[]): readonly TocItem[] => {
  return items.flatMap((item) => [item, ...flattenTocItems(item.children)]);
};

export const findTocItemById = (items: readonly TocItem[], id: string): TocItem | undefined => {
  return flattenTocItems(items).find((item) => item.id === id);
};

export const getTocStatistics = (structure: TocStructure) => {
  const flatItems = flattenTocItems(structure.items);
  const levels = flatItems.map((item) => item.level);

  // レベル別カウントを計算
  const levelCounts: Record<number, number> = {};
  for (let i = 0, len = levels.length; i < len; i++) {
    const level = levels[i];
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
