/**
 * 目次DOM構築の責務を担当
 * 階層構造の再帰処理が複雑なため、分離して可読性を向上
 */

import type { TocItem, TocStructure, RequiredMokujiConfig, ContainerTagName } from '../../types/core';
import { ElementFactories } from '../factory';
import { DomCore } from '../core';
import { DATA_ATTRIBUTES } from '../../constants';

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

  for (let i = 0, len = items.length; i < len; i++) {
    const item = items[i];
    const listItemElement = buildTocItemElement(item, containerTagName);
    listElement.append(listItemElement);
  }

  return listElement;
};

/**
 * Builds a complete TOC DOM element from the structure
 */
export const buildTocElement = (
  structure: TocStructure,
  config: RequiredMokujiConfig,
): HTMLUListElement | HTMLOListElement => {
  const listElement = buildTocListElement(structure.items, config.containerTagName);

  // データ属性を設定
  DomCore.manipulator.setAttribute(listElement, DATA_ATTRIBUTES.LIST, '');

  return listElement;
};

export const addAnchorLinksToHeadings = (structure: TocStructure, config: RequiredMokujiConfig): void => {
  if (!config.anchorLink) {
    return;
  }

  for (let i = 0, len = structure.headings.length; i < len; i++) {
    const heading = structure.headings[i];
    if (!heading.element.parentNode) {
      continue;
    }

    const anchorLink = ElementFactories.createAnchor()();

    DomCore.manipulator.setTextContent(anchorLink, config.anchorLinkSymbol);
    anchorLink.href = `#${heading.id}`;
    DomCore.manipulator.setAttribute(anchorLink, DATA_ATTRIBUTES.ANCHOR, '');

    if (config.anchorLinkClassName.trim()) {
      DomCore.manipulator.addClass(anchorLink, config.anchorLinkClassName);
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
