/**
 * 目次生成ライブラリ - 公開APIインターフェース
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

export { createConfig, getDefaultConfig, validateConfig } from './config';

export { ResultUtils, OptionUtils, ArrayUtils, StringUtils } from './utils/functional';

export { extractHeadingInfo, filterHeadingsByLevel, generateAnchorText, assignUniqueIds } from './domain/heading';

export {
  createTocStructure,
  buildTocHierarchy,
  isTocStructureEmpty,
  flattenTocItems,
  findTocItemById,
  getTocStatistics,
} from './domain/toc';

export { DATA_ATTRIBUTES } from './services/dom-builder';
