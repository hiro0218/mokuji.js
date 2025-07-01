/**
 * メインのユースケース実装
 * 関数型アーキテクチャによる目次生成フロー
 */

import type { MokujiConfig, Option, TocStructure, Result, HeadingInfo, HeadingLevel } from '../types/core';
import { ResultUtils, OptionUtils } from '../utils/functional';
import { createConfig } from '../config';
import { extractHeadingsInfo, filterHeadingsByLevel, generateAnchorText } from '../domain/heading';
import { createTocStructure, isTocStructureEmpty } from '../domain/toc';
import { ElementSelectors } from '../infrastructure/dom';
import { buildTocElement, addAnchorLinksToHeadings } from '../services/dom-builder';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, ANCHOR_DATASET_ATTRIBUTE } from '../common/constants';

/**
 * エラーメッセージの定数
 */
const ERROR_MESSAGES = {
  ELEMENT_NOT_FOUND: 'Mokuji: Target element not found.',
  NO_HEADINGS: 'Mokuji: No headings found in the target element.',
  INVALID_CONFIG: 'Mokuji: Invalid configuration provided.',
} as const;

/**
 * 要素内の見出しを取得し、処理する純粋関数パイプライン
 * パフォーマンス最適化: 中間変数を削減し、単一パスでの処理を最適化
 */
const processHeadings = (element: HTMLElement, config: ReturnType<typeof createConfig>) => {
  // 1. 見出し要素を取得し、一気に処理
  const headingElements = ElementSelectors.getAllHeadings(element);

  if (headingElements.length === 0) {
    return createTocStructure([]);
  }

  // 2-4. 見出し情報の抽出、フィルタリング、ID割り当てを統合
  const processedHeadings: HeadingInfo[] = [];
  const usedIds = new Set<string>();

  for (const element of headingElements) {
    const level = Number(element.tagName.charAt(1)) as HeadingLevel;

    // レベルフィルタリングを早期に実行
    if (level < config.minLevel || level > config.maxLevel) {
      continue;
    }

    const text = (element.textContent || '').trim();
    const baseId = generateAnchorText(text, config.anchorType);

    // 一意なID生成
    let uniqueId = baseId;
    let suffix = 1;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}_${suffix++}`;
    }
    usedIds.add(uniqueId);

    processedHeadings.push({
      id: uniqueId,
      text,
      level,
      element,
    });
  }

  // 5. 目次構造を作成
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
 * 設定のバリデーション用ヘルパー
 */
export const validateMokujiConfig = (config?: MokujiConfig): boolean => {
  if (!config) return true;

  const { minLevel, maxLevel } = config;

  if (minLevel !== undefined && (minLevel < 1 || minLevel > 6)) {
    return false;
  }

  if (maxLevel !== undefined && (maxLevel < 1 || maxLevel > 6)) {
    return false;
  }

  if (minLevel !== undefined && maxLevel !== undefined && minLevel > maxLevel) {
    return false;
  }

  return true;
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
    ? `#${containerId} [${MOKUJI_LIST_DATASET_ATTRIBUTE}], #${containerId} [${ANCHOR_DATASET_ATTRIBUTE}]`
    : `[${MOKUJI_LIST_DATASET_ATTRIBUTE}], [${ANCHOR_DATASET_ATTRIBUTE}]`;

  const elements = document.querySelectorAll(selector);

  // DocumentFragmentを使用してDOM操作をバッチ化
  if (elements.length > 0) {
    // removeは軽量なので直接実行
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  }
};
