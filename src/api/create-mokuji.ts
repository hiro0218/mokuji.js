/**
 * 目次生成の中核API
 * 外部向けインターフェースとエラーハンドリングの責務を持つ
 */

import type { MokujiConfig, Option, TocStructure, Result, HeadingInfo } from '../types/core';
import { ResultUtils, OptionUtils } from '../utils/functional';
import { createConfig } from '../core/config';
import { extractHeadingInfo, extractHeadingsInfo, filterHeadingsByLevel } from '../core/heading';
import { createTocStructure, isTocStructureEmpty } from '../core/toc';
import { ElementSelectors } from '../dom/selector';
import { buildTocElement, addAnchorLinksToHeadings } from '../dom/builder';
import { ERROR_MESSAGES, DATA_ATTRIBUTES } from '../constants';

/**
 * 単一の見出し要素から情報を抽出する
 * core/heading の拡張関数を利用
 */
const extractSingleHeadingInfo = (
  element: HTMLHeadingElement,
  config: ReturnType<typeof createConfig>,
  usedIds: Set<string>,
): HeadingInfo | undefined => {
  return extractHeadingInfo(element, {
    filterByLevel: true,
    minLevel: config.minLevel,
    maxLevel: config.maxLevel,
    generateId: true,
    usedIds,
    anchorType: config.anchorType,
  });
};

/**
 * 見出し要素を処理して目次構造を生成する
 */
const processHeadings = (element: HTMLElement, config: ReturnType<typeof createConfig>): TocStructure => {
  const headingElements = ElementSelectors.getAllHeadings(element);

  if (headingElements.length === 0) {
    return createTocStructure([]);
  }

  const usedIds = new Set<string>();
  const processedHeadings: HeadingInfo[] = [];

  for (const headingElement of headingElements) {
    const headingInfo = extractSingleHeadingInfo(headingElement, config, usedIds);
    if (headingInfo) {
      processedHeadings.push(headingInfo);
    }
  }

  return createTocStructure(processedHeadings);
};

// 要素の検証を行う関数
const validateElement = <T extends HTMLElement>(element: Option<T>): Result<T, Error> => {
  return OptionUtils.isSome(element)
    ? ResultUtils.ok(element)
    : ResultUtils.error(new Error(ERROR_MESSAGES.ELEMENT_NOT_FOUND));
};

// 設定を適用して構造を生成する
const processWithConfig = <T extends HTMLElement>(
  element: T,
  externalConfig?: MokujiConfig,
): Result<{ element: T; config: ReturnType<typeof createConfig>; structure: TocStructure }, Error> => {
  try {
    const config = createConfig(externalConfig);
    const structure = processHeadings(element, config);

    if (isTocStructureEmpty(structure)) {
      return ResultUtils.error(new Error(ERROR_MESSAGES.NO_HEADINGS));
    }

    return ResultUtils.ok({ element, config, structure });
  } catch (error) {
    return ResultUtils.error(error as Error);
  }
};

// TOC要素を生成する
const buildTocComponents = <T extends HTMLElement>(data: {
  element: T;
  config: ReturnType<typeof createConfig>;
  structure: TocStructure;
}): Result<{ targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure }, Error> => {
  try {
    const { element, config, structure } = data;
    const listElement = buildTocElement(structure, config);
    addAnchorLinksToHeadings(structure, config);

    return ResultUtils.ok({
      targetElement: element,
      listElement,
      structure,
    });
  } catch (error) {
    return ResultUtils.error(error as Error);
  }
};

/**
 * Main function for generating table of contents
 * 関数型プログラミングのパターンを活用
 */
export const createMokuji = <T extends HTMLElement>(
  element: Option<T>,
  externalConfig?: MokujiConfig,
): Result<{ targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure }, Error> => {
  // 要素の検証
  const elementResult = validateElement(element);
  if (ResultUtils.isError(elementResult)) {
    return elementResult as Result<
      { targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure },
      Error
    >;
  }

  // 型ガードを追加して、dataプロパティにアクセスできることを保証
  if (!ResultUtils.isOk(elementResult)) {
    return ResultUtils.error(new Error('Unexpected state: element result is neither success nor error')) as Result<
      { targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure },
      Error
    >;
  }

  // 設定を適用して構造を生成
  const configResult = processWithConfig(elementResult.data, externalConfig);
  if (ResultUtils.isError(configResult)) {
    return configResult as Result<
      { targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure },
      Error
    >;
  }

  // 型ガードを追加
  if (!ResultUtils.isOk(configResult)) {
    return ResultUtils.error(new Error('Unexpected state: config result is neither success nor error')) as Result<
      { targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure },
      Error
    >;
  }

  // TOC要素を生成
  return buildTocComponents(configResult.data);
};

const isValidLevel = (level: number | undefined): boolean => level === undefined || (level >= 1 && level <= 6);

const isValidRange = (min: number | undefined, max: number | undefined): boolean =>
  min === undefined || max === undefined || min <= max;

export const validateMokujiConfig = (config?: MokujiConfig): boolean => {
  if (!config) return true;

  const { minLevel, maxLevel } = config;
  return isValidLevel(minLevel) && isValidLevel(maxLevel) && isValidRange(minLevel, maxLevel);
};

export const getMokujiDebugInfo = <T extends HTMLElement>(element: Option<T>, config?: MokujiConfig) => {
  if (OptionUtils.isNone(element)) {
    return { error: ERROR_MESSAGES.ELEMENT_NOT_FOUND };
  }

  // Option<T>型からT型に変換し、ここでは値が存在することを保証する
  const validElement = element as T;

  const processedConfig = createConfig(config);
  const headingElements = ElementSelectors.getAllHeadings(validElement);
  const headingsInfo = extractHeadingsInfo(headingElements);
  const filteredHeadings = filterHeadingsByLevel(headingsInfo, processedConfig.minLevel, processedConfig.maxLevel);

  return {
    config: processedConfig,
    totalHeadings: headingElements.length,
    filteredHeadings: filteredHeadings.length,
    headingLevels: headingsInfo.map((h) => h.level),
    headingTexts: headingsInfo.map((h) => h.text),
  };
};

/**
 * Cleans up all TOC DOM elements
 * WARNING: Removes all TOC elements from the page - use with caution when using multiple instances
 */
export const destroyMokuji = (containerId?: string): void => {
  const selector = containerId
    ? `#${containerId} [${DATA_ATTRIBUTES.LIST}], #${containerId} [${DATA_ATTRIBUTES.ANCHOR}]`
    : `[${DATA_ATTRIBUTES.LIST}], [${DATA_ATTRIBUTES.ANCHOR}]`;

  const elements = document.querySelectorAll(selector);

  if (elements.length > 0) {
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  }
};
