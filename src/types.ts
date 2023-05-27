type AnchorContainerTagNameProps = 'ul' | 'ol';

export type MokujiOption = {
  anchorType?: boolean;
  anchorLink?: boolean;
  anchorLinkSymbol?: string;
  anchorLinkBefore?: boolean;
  anchorLinkClassName?: string;
  anchorContainerTagName?: AnchorContainerTagNameProps;
};
