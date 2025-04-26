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
  /** 最小見出しレベル（例: 1はh1を意味する。これより小さいレベルは表示しない） */
  minLevel?: number;
  /** 最大見出しレベル（例: 3はh3を意味する。これより大きいレベルは表示しない） */
  maxLevel?: number;
};
