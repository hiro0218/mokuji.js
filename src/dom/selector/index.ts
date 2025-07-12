/**
 * DOM要素選択の抽象化層
 * テスト時のモック対象となる副作用を集約
 *
 * @deprecated 代わりに ../core の DomCore を使用してください
 */

import { DomCore } from '../core';

// 後方互換性のために従来のインターフェースを維持しつつ、
// 新しいDomCoreを内部で使用するようにリファクタリング
export const ElementSelectors = {
  // 新しい実装を利用
  getAllHeadings: (container: Element): readonly HTMLHeadingElement[] => {
    return DomCore.selector.getAllHeadings(container);
  },

  findByDataAttribute: (container: Document | Element, attribute: string): readonly HTMLElement[] => {
    return DomCore.selector.findByDataAttribute(container, attribute);
  },

  findByTagAndAttribute: (container: Document | Element, tagName: string, attribute: string): HTMLElement | null => {
    return DomCore.selector.findByTagAndAttribute(container, tagName, attribute);
  },
};
