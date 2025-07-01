/**
 * 目次DOM構築の責務を担当
 * 階層構造の再帰処理が複雑なため、分離して可読性を向上
 */

import type { TocItem, TocStructure, RequiredMokujiConfig, ContainerTagName } from '../types/core';
import { ElementFactories } from '../infrastructure/dom';
import { DATA_ATTRIBUTES } from '../constants';

const buildTocItemElement = (item: TocItem, containerTagName: ContainerTagName): HTMLLIElement => {
  const listItem = ElementFactories.createListItem()();
  const anchor = ElementFactories.createAnchor()();

  // アンカー要素の設定
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

  // データ属性を設定
  listElement.setAttribute(DATA_ATTRIBUTES.LIST, '');

  return listElement;
};

export const addAnchorLinksToHeadings = (structure: TocStructure, config: RequiredMokujiConfig): void => {
  if (!config.anchorLink) {
    return;
  }

  for (const heading of structure.headings) {
    if (!heading.element.parentNode) {
      continue;
    }

    const anchorLink = ElementFactories.createAnchor()();

    anchorLink.textContent = config.anchorLinkSymbol;
    anchorLink.href = `#${heading.id}`;
    anchorLink.setAttribute(DATA_ATTRIBUTES.ANCHOR, '');

    if (config.anchorLinkClassName.trim()) {
      anchorLink.classList.add(...config.anchorLinkClassName.trim().split(/\s+/).filter(Boolean));
    }

    heading.element.id = heading.id;

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
