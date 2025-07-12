/**
 * Type definitions related to table of contents
 */

import type { HeadingInfo, HeadingLevel } from './heading';

/**
 * Container element tag name
 */
export type ContainerTagName = 'ul' | 'ol';

/**
 * Anchor link position
 */
export type AnchorPosition = 'before' | 'after';

/**
 * Definition of TOC item
 */
export type TocItem = {
  /**
   * Item ID
   */
  readonly id: string;

  /**
   * Display text
   */
  readonly text: string;

  /**
   * Link destination URL (usually #id format)
   */
  readonly href: string;

  /**
   * Heading level
   */
  readonly level: HeadingLevel;

  /**
   * Child items
   */
  readonly children: readonly TocItem[];
};

/**
 * Type representing the entire TOC structure
 */
export type TocStructure = {
  /**
   * Hierarchical TOC items
   */
  readonly items: readonly TocItem[];

  /**
   * Source heading information
   */
  readonly headings: readonly HeadingInfo[];
};

/**
 * TOC configuration options
 */
export type MokujiConfig = {
  /**
   * Whether to use Wikipedia style anchors
   */
  readonly anchorType?: boolean;

  /**
   * Whether to add anchor links
   */
  readonly anchorLink?: boolean;

  /**
   * Anchor link symbol
   */
  readonly anchorLinkSymbol?: string;

  /**
   * Anchor link position
   */
  readonly anchorLinkPosition?: AnchorPosition;

  /**
   * Anchor link class name
   */
  readonly anchorLinkClassName?: string;

  /**
   * Container element tag name
   */
  readonly containerTagName?: ContainerTagName;

  /**
   * Minimum heading level
   */
  readonly minLevel?: HeadingLevel;

  /**
   * Maximum heading level
   */
  readonly maxLevel?: HeadingLevel;
};

/**
 * Configuration options with required fields
 */
export type RequiredMokujiConfig = Required<MokujiConfig>;

/**
 * Result of TOC generation
 */
export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  /**
   * Target element
   */
  readonly targetElement: T;

  /**
   * Generated TOC list element
   */
  readonly listElement: HTMLUListElement | HTMLOListElement;

  /**
   * TOC structure
   */
  readonly structure: TocStructure;
};
