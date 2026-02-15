export type AnchorContainerTagName = 'ul' | 'ol';

/**
 * Type representing heading levels (values 1-6 corresponding to h1-h6)
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Anchor link placement position
 */
export type AnchorLinkPosition = 'before' | 'after';

/**
 * Option settings for TOC generation
 */
export type MokujiOption = {
  /**
   * Whether to generate Wikipedia-style anchors
   * Default: true (e.g., "heading_text" -> "heading_text", "heading:text" -> "headingtext")
   * If false, spaces are replaced with '_' but encoding and special character conversion is minimal
   */
  anchorType?: boolean;

  /**
   * Whether to add anchor links (e.g., #) next to heading elements
   * Default: false
   */
  anchorLink?: boolean;

  /**
   * Symbol or text to display when `anchorLink: true`
   * Default: '#'
   */
  anchorLinkSymbol?: string;

  /**
   * Anchor link placement position (before or after heading text) when `anchorLink: true`
   * Default: 'before'
   */
  anchorLinkPosition?: AnchorLinkPosition;

  /**
   * CSS class names to apply to anchor link elements when `anchorLink: true` (multiple classes can be specified with space separation)
   * Default: ''
   */
  anchorLinkClassName?: string;

  /**
   * Tag name of the generated TOC list container element
   * Default: 'ol' (ordered list)
   */
  anchorContainerTagName?: AnchorContainerTagName;

  /**
   * Minimum heading level to include in TOC (1 = h1, 6 = h6)
   * Default: 1
   */
  minLevel?: HeadingLevel;

  /**
   * Maximum heading level to include in TOC (1 = h1, 6 = h6)
   * Default: 6
   */
  maxLevel?: HeadingLevel;

  /**
   * Whether to include headings inside blockquote elements in TOC
   * Default: false (blockquote headings are excluded)
   */
  includeBlockquoteHeadings?: boolean;
};
