import type { MokujiOption } from '../types';

export const MOKUJI_LIST_DATASET_ATTRIBUTE = 'data-mokuji-list';
export const ANCHOR_DATASET_ATTRIBUTE = 'data-mokuji-anchor';

export const defaultOptions: Required<MokujiOption> = {
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkPosition: 'before',
  anchorLinkClassName: '',
  anchorContainerTagName: 'ol',
  minLevel: 1,
  maxLevel: 6,
} as const;
