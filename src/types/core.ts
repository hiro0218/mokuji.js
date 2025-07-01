/**
 * 型安全性の中核定義
 * 関数型プログラミングの恩恵を受けるための基盤型
 */

export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export type Option<T> = T | null | undefined;

export type NonEmptyArray<T> = readonly [T, ...T[]];

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ContainerTagName = 'ul' | 'ol';

export type AnchorPosition = 'before' | 'after';

export type HeadingInfo = {
  readonly id: string;
  readonly text: string;
  readonly level: HeadingLevel;
  readonly element: HTMLHeadingElement;
};

export type TocItem = {
  readonly id: string;
  readonly text: string;
  readonly href: string;
  readonly level: HeadingLevel;
  readonly children: readonly TocItem[];
};

export type TocStructure = {
  readonly items: readonly TocItem[];
  readonly headings: readonly HeadingInfo[];
};

/**
 * 副作用の管理用
 */
export type DomEffect<T = void> = () => T;

export type ElementFactory<K extends keyof HTMLElementTagNameMap> = () => HTMLElementTagNameMap[K];

export type MokujiConfig = {
  readonly anchorType?: boolean;
  readonly anchorLink?: boolean;
  readonly anchorLinkSymbol?: string;
  readonly anchorLinkPosition?: AnchorPosition;
  readonly anchorLinkClassName?: string;
  readonly containerTagName?: ContainerTagName;
  readonly minLevel?: HeadingLevel;
  readonly maxLevel?: HeadingLevel;
};

export type RequiredMokujiConfig = Required<MokujiConfig>;

export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  readonly targetElement: T;
  readonly listElement: HTMLUListElement | HTMLOListElement;
  readonly structure: TocStructure;
};
