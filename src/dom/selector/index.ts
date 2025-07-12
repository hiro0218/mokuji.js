/**
 * DOM要素選択の抽象化層
 * テスト時のモック対象となる副作用を集約
 */

export const ElementSelectors = {
  // IE11 compatibility
  getAllHeadings: (container: Element): readonly HTMLHeadingElement[] => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const result: HTMLHeadingElement[] = Array.from({ length: headings.length });

    for (let i = 0; i < headings.length; i++) {
      result[i] = headings[i] as HTMLHeadingElement;
    }

    return result;
  },

  findByDataAttribute: (container: Document | Element, attribute: string): readonly HTMLElement[] => {
    const elements = container.querySelectorAll(`[${attribute}]`);
    const result: HTMLElement[] = Array.from({ length: elements.length });

    for (let i = 0; i < elements.length; i++) {
      result[i] = elements[i] as HTMLElement;
    }

    return result;
  },

  findByTagAndAttribute: (container: Document | Element, tagName: string, attribute: string): HTMLElement | null => {
    return container.querySelector(`${tagName}[${attribute}]`) as HTMLElement | null;
  },
};
