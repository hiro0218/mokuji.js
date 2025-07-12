/**
 * mokuji.js - Table of Contents Generator
 * TypeScriptで構築された型安全な目次生成ライブラリ
 */

export type {
  MokujiConfig,
  MokujiResult,
  HeadingLevel,
  ContainerTagName,
  AnchorPosition,
  HeadingInfo,
  TocItem,
  TocStructure,
  Option,
  Result,
} from './types/core';

export { destroyMokuji, createMokuji, validateMokujiConfig, getMokujiDebugInfo } from './api/create-mokuji';

export { createConfig, getDefaultConfig, validateConfig } from './core/config';

export { ResultUtils, OptionUtils, ArrayUtils, StringUtils } from './utils/functional';

export { generateUniqueId, createIdTracker } from './utils/id';

export { extractHeadingInfo, filterHeadingsByLevel, generateAnchorText, assignUniqueIds } from './core/heading';

export {
  createTocStructure,
  buildTocHierarchy,
  isTocStructureEmpty,
  flattenTocItems,
  findTocItemById,
  getTocStatistics,
} from './core/toc';

export { ERROR_MESSAGES, DEBUG_MESSAGES, DATA_ATTRIBUTES, REGEX_PATTERNS } from './constants';
