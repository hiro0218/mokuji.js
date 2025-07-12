/**
 * ID生成とユニーク性保証のユーティリティ関数群
 * 関数型アプローチによる純粋関数の集合
 */

/**
 * 一意なIDを生成する純粋関数
 * 既存のIDセットを変更し、副作用を明示的に管理する
 */
export const generateUniqueId = (baseId: string, usedIds: Set<string>): string => {
  let uniqueId = baseId;
  let suffix = 1;
  while (usedIds.has(uniqueId)) {
    uniqueId = `${baseId}_${suffix++}`;
  }
  usedIds.add(uniqueId);
  return uniqueId;
};

/**
 * IDセットを管理するファクトリー関数
 */
export const createIdTracker = () => {
  const usedIds = new Set<string>();

  return {
    generateUniqueId: (baseId: string) => generateUniqueId(baseId, usedIds),
    hasId: (id: string) => usedIds.has(id),
    clear: () => usedIds.clear(),
    getUsedIds: () => new Set(usedIds), // 不変性を保証したコピーを返す
  };
};
