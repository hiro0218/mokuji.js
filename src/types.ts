type AnchorContainerTagNameProps = 'ul' | 'ol';

export type MokujiOption = {
  anchorType?: boolean;
  anchorLink?: boolean;
  anchorLinkSymbol?: string;
  /** @deprecated use anchorLinkPosition */
  anchorLinkBefore?: boolean;
  anchorLinkPosition?: 'before' | 'after';
  anchorLinkClassName?: string;
  anchorContainerTagName?: AnchorContainerTagNameProps;
};
