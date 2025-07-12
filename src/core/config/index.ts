/**
 * デフォルト設定とバリデーション
 * 不正な設定値の自動修正ロジックを含む
 */

import type { MokujiConfig, RequiredMokujiConfig, HeadingLevel } from '../../types/core';

const DEFAULT_CONFIG: RequiredMokujiConfig = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkPosition: 'before',
  anchorLinkClassName: '',
  containerTagName: 'ol',
  minLevel: 1,
  maxLevel: 6,
} as const;

const normalizeHeadingLevel = (level: number): HeadingLevel => {
  const normalized = Math.max(1, Math.min(level, 6));
  return normalized as HeadingLevel;
};

/**
 * minLevel > maxLevelの矛盾状態を自動修正
 */
const normalizeConfig = (config: RequiredMokujiConfig): RequiredMokujiConfig => {
  const normalizedMinLevel = normalizeHeadingLevel(config.minLevel);
  const normalizedMaxLevel = normalizeHeadingLevel(config.maxLevel);

  return {
    ...config,
    minLevel: normalizedMinLevel,
    maxLevel: Math.max(normalizedMinLevel, normalizedMaxLevel) as HeadingLevel,
  };
};

/**
 * 外部設定とデフォルト設定をマージ
 */
export const createConfig = (externalConfig?: MokujiConfig): RequiredMokujiConfig => {
  const mergedConfig: RequiredMokujiConfig = {
    ...DEFAULT_CONFIG,
    ...externalConfig,
  };

  return normalizeConfig(mergedConfig);
};

/**
 * 設定値の範囲チェック
 */
export const validateConfig = (config: RequiredMokujiConfig): boolean => {
  return (
    config.minLevel >= 1 &&
    config.minLevel <= 6 &&
    config.maxLevel >= 1 &&
    config.maxLevel <= 6 &&
    config.minLevel <= config.maxLevel &&
    typeof config.anchorLinkSymbol === 'string' &&
    (config.containerTagName === 'ul' || config.containerTagName === 'ol') &&
    (config.anchorLinkPosition === 'before' || config.anchorLinkPosition === 'after')
  );
};

export const getDefaultConfig = (): RequiredMokujiConfig => ({ ...DEFAULT_CONFIG });
