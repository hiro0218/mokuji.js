/**
 * Type definitions related to heading elements
 */

/**
 * Heading level (h1-h6)
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Heading information
 */
export type HeadingInfo = {
  /**
   * Heading ID (target for anchor links)
   */
  readonly id: string;

  /**
   * Heading text content
   */
  readonly text: string;

  /**
   * Heading level (h1=1, h2=2, etc.)
   */
  readonly level: HeadingLevel;

  /**
   * Reference to the corresponding DOM element
   */
  readonly element: HTMLHeadingElement;
};

/**
 * Heading extraction options
 */
export type HeadingExtractOptions = {
  /**
   * Whether to filter by level
   */
  filterByLevel?: boolean;

  /**
   * Minimum level (e.g., 2 = h2 and above)
   */
  minLevel?: HeadingLevel;

  /**
   * Maximum level (e.g., 4 = h4 and below)
   */
  maxLevel?: HeadingLevel;

  /**
   * Whether to generate ID
   */
  generateId?: boolean;

  /**
   * Set of used IDs
   */
  usedIds?: Set<string>;

  /**
   * Whether to use Wikipedia style anchors
   */
  anchorType?: boolean;
};
