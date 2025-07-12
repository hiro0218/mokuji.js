/**
 * ID generation and uniqueness utilities
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

export const createIdTracker = () => {
  const usedIds = new Set<string>();

  return {
    generateUniqueId: (baseId: string) => generateUniqueId(baseId, usedIds),
    hasId: (id: string) => usedIds.has(id),
    clear: () => usedIds.clear(),
    getUsedIds: () => new Set(usedIds), // 不変性を保証したコピーを返す
  };
};
