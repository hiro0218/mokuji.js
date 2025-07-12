/**
 * 目次生成の中核API
 * 外部向けインターフェースとエラーハンドリングの責務を持つ
 */

import type { MokujiConfig, Option, TocStructure, Result, HeadingInfo, HeadingLevel } from '../types/core';
import { ResultUtils, OptionUtils } from '../utils/functional';
import { generateUniqueId } from '../utils/id';
import { createConfig } from '../core/config';
import { extractHeadingsInfo, filterHeadingsByLevel, generateAnchorText } from '../core/heading';
import { createTocStructure, isTocStructureEmpty } from '../core/toc';
import { ElementSelectors } from '../dom/selector';
import { buildTocElement, addAnchorLinksToHeadings } from '../dom/builder';
import { ERROR_MESSAGES, DATA_ATTRIBUTES } from '../constants';

const extractSingleHeadingInfo = (
  element: HTMLHeadingElement,
  config: ReturnType<typeof createConfig>,
  usedIds: Set<string>,
): HeadingInfo | undefined => {
  const level = Number(element.tagName.charAt(1)) as HeadingLevel;

  // レベルフィルタリングを早期に実行（パフォーマンス向上）
  if (level < config.minLevel || level > config.maxLevel) {
    return undefined;
  }

  const text = (element.textContent || '').trim();
  const baseId = generateAnchorText(text, config.anchorType);
  const uniqueId = generateUniqueId(baseId, usedIds);

  return { id: uniqueId, text, level, element };
};

const processHeadings = (element: HTMLElement, config: ReturnType<typeof createConfig>) => {
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

/**
 * 目次生成のメイン関数
 */
export const createMokuji = <T extends HTMLElement>(
  element: Option<T>,
  externalConfig?: MokujiConfig,
): Result<{ targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure }, Error> => {
  // 要素の検証
  const elementResult = OptionUtils.isSome(element)
    ? ResultUtils.ok(element)
    : ResultUtils.error(new Error(ERROR_MESSAGES.ELEMENT_NOT_FOUND));

  // 処理チェーンの実行
  if (ResultUtils.isError(elementResult)) {
    return elementResult as Result<
      { targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure },
      Error
    >;
  }

  try {
    if (!ResultUtils.isOk(elementResult)) {
      return elementResult as Result<
        { targetElement: T; listElement: HTMLUListElement | HTMLOListElement; structure: TocStructure },
        Error
      >;
    }

    const validElement = elementResult.data;
    const config = createConfig(externalConfig);
    const structure = processHeadings(validElement, config);

    if (isTocStructureEmpty(structure)) {
      return ResultUtils.error(new Error(ERROR_MESSAGES.NO_HEADINGS));
    }

    const listElement = buildTocElement(structure, config);
    addAnchorLinksToHeadings(structure, config);

    return ResultUtils.ok({
      targetElement: validElement,
      listElement,
      structure,
    });
  } catch (error) {
    return ResultUtils.error(error as Error);
  }
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

  const processedConfig = createConfig(config);
  const headingElements = ElementSelectors.getAllHeadings(element);
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
 * DOM要素のクリーンアップ
 * WARNING: 全ページの目次要素を削除するため、複数インスタンス使用時は注意
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
