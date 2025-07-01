/**
 * メインのユースケース実装
 * 関数型アーキテクチャによる目次生成フロー
 */

import type { MokujiConfig, Option, TocStructure, Result, HeadingInfo, HeadingLevel } from '../types/core';
import { ResultUtils, OptionUtils } from '../utils/functional';
import { generateUniqueId } from '../utils/id-generator';
import { createConfig } from '../config';
import { extractHeadingsInfo, filterHeadingsByLevel, generateAnchorText } from '../domain/heading';
import { createTocStructure, isTocStructureEmpty } from '../domain/toc';
import { ElementSelectors } from '../infrastructure/dom';
import { buildTocElement, addAnchorLinksToHeadings } from '../services/dom-builder';
import { ERROR_MESSAGES, DATA_ATTRIBUTES } from '../constants';

/**
 * 見出し要素から情報を抽出する純粋関数
 */
const extractSingleHeadingInfo = (
  element: HTMLHeadingElement,
  config: ReturnType<typeof createConfig>,
  usedIds: Set<string>,
): HeadingInfo | undefined => {
  const level = Number(element.tagName.charAt(1)) as HeadingLevel;

  // レベルフィルタリングを早期に実行
  if (level < config.minLevel || level > config.maxLevel) {
    return undefined;
  }

  const text = (element.textContent || '').trim();
  const baseId = generateAnchorText(text, config.anchorType);
  const uniqueId = generateUniqueId(baseId, usedIds);

  return { id: uniqueId, text, level, element };
};

/**
 * 要素内の見出しを取得し、処理する純粋関数パイプライン
 * 関数分割により行数を削減し、単一責任原則を遵守
 */
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

/**
 * レベル値の有効性をチェックする純粋関数
 */
const isValidLevel = (level: number | undefined): boolean => level === undefined || (level >= 1 && level <= 6);

/**
 * レベル範囲の整合性をチェックする純粋関数
 */
const isValidRange = (min: number | undefined, max: number | undefined): boolean =>
  min === undefined || max === undefined || min <= max;

/**
 * 設定のバリデーション用ヘルパー
 * 関数型アプローチを採用し、認知的複雑度を低減
 */
export const validateMokujiConfig = (config?: MokujiConfig): boolean => {
  if (!config) return true;

  const { minLevel, maxLevel } = config;
  return isValidLevel(minLevel) && isValidLevel(maxLevel) && isValidRange(minLevel, maxLevel);
};

/**
 * デバッグ用の情報を取得する関数
 */
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
 * 生成された目次とアンカーリンクを削除
 * パフォーマンス最適化: 単一のquerySelectorAllでまとめて削除
 */
export const destroyMokuji = (containerId?: string): void => {
  const selector = containerId
    ? `#${containerId} [${DATA_ATTRIBUTES.LIST}], #${containerId} [${DATA_ATTRIBUTES.ANCHOR}]`
    : `[${DATA_ATTRIBUTES.LIST}], [${DATA_ATTRIBUTES.ANCHOR}]`;

  const elements = document.querySelectorAll(selector);

  // DocumentFragmentを使用してDOM操作をバッチ化
  if (elements.length > 0) {
    // removeは軽量なので直接実行
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  }
};
