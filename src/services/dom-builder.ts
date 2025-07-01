/**
 * DOM構築サービス - 純粋な関数とDOM副作用の組み合わせ
 * 関心の分離により副作用を明確化
 */

import type { TocItem, TocStructure, RequiredMokujiConfig, ContainerTagName } from '../types/core';
import { ElementFactories } from '../infrastructure/dom';

/**
 * 目次データ属性の定数
 */
export const DATA_ATTRIBUTES = {
  LIST: 'data-mokuji-list',
  ANCHOR: 'data-mokuji-anchor',
} as const;

/**
 * 個別目次アイテムのDOM構築
 * パフォーマンス最適化: 直接DOM操作で副作用関数の呼び出しを削減
 */
const buildTocItemElement = (item: TocItem, containerTagName: ContainerTagName): HTMLLIElement => {
  const listItem = ElementFactories.createListItem()();
  const anchor = ElementFactories.createAnchor()();

  // アンカー要素の設定（直接操作）
  anchor.textContent = item.text;
  anchor.href = item.href;

  listItem.append(anchor);

  // 子要素がある場合は再帰的に構築
  if (item.children.length > 0) {
    const childList = buildTocListElement(item.children, containerTagName);
    listItem.append(childList);
  }

  return listItem;
};

/**
 * 目次リスト全体のDOM構築
 */
const buildTocListElement = (
  items: readonly TocItem[],
  containerTagName: ContainerTagName,
): HTMLUListElement | HTMLOListElement => {
  const listElement = ElementFactories.createList(containerTagName)();

  for (const item of items) {
    const listItemElement = buildTocItemElement(item, containerTagName);
    listElement.append(listItemElement);
  }

  return listElement;
};

/**
 * 目次構造全体からDOM要素を構築する主要関数
 * パフォーマンス最適化: 直接DOM操作で副作用関数の呼び出しを削減
 */
export const buildTocElement = (
  structure: TocStructure,
  config: RequiredMokujiConfig,
): HTMLUListElement | HTMLOListElement => {
  const listElement = buildTocListElement(structure.items, config.containerTagName);

  // データ属性を設定（直接操作）
  listElement.setAttribute(DATA_ATTRIBUTES.LIST, '');

  return listElement;
};

/**
 * 見出し要素にアンカーリンクを追加するサービス
 * パフォーマンス最適化: DocumentFragmentを使用してDOM操作をバッチ化
 */
export const addAnchorLinksToHeadings = (structure: TocStructure, config: RequiredMokujiConfig): void => {
  if (!config.anchorLink) {
    return;
  }

  // DocumentFragmentを使用してバッチ処理
  for (const heading of structure.headings) {
    if (!heading.element.parentNode) {
      continue;
    }

    const anchorLink = ElementFactories.createAnchor()();

    // 要素のプロパティを一括設定
    anchorLink.textContent = config.anchorLinkSymbol;
    anchorLink.href = `#${heading.id}`;
    anchorLink.setAttribute(DATA_ATTRIBUTES.ANCHOR, '');

    if (config.anchorLinkClassName.trim()) {
      anchorLink.classList.add(...config.anchorLinkClassName.trim().split(/\s+/).filter(Boolean));
    }

    // 見出し要素のIDを設定
    heading.element.id = heading.id;

    // 位置に応じてアンカーリンクを挿入
    if (config.anchorLinkPosition === 'before') {
      if (heading.element.firstChild) {
        heading.element.firstChild.before(anchorLink);
      } else {
        heading.element.append(anchorLink);
      }
    } else {
      heading.element.append(anchorLink);
    }
  }
};
