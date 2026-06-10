import { getHeadingLevel } from './heading';
import { getHeadingText } from './utils/dom';
import type { HeadingLevel } from './types';

const WHITESPACE_PATTERN = /\s+/g;
const COLON_CHARACTER = ':';
const PERCENT_ENCODING_PATTERN = /%+/g;
const DOT_REPLACEMENT = '.';

const VALID_PERCENT_ENCODING = /%[0-9A-F]{2}/i;
const INVALID_PERCENT_PATTERN = /%[^0-9A-F]|%[0-9A-F][^0-9A-F]|%$/i;

const HEADING_DUPLICATE_SUFFIX_PATTERN = /_\d+$/;

export type ResolvedHeading = {
  readonly heading: HTMLHeadingElement;
  readonly identity: string;
  readonly level: HeadingLevel;
};

const replaceSpacesWithUnderscores = (text: string): string => {
  return text.replaceAll(WHITESPACE_PATTERN, '_').replaceAll(COLON_CHARACTER, '');
};

const convertToWikipediaStyleAnchor = (anchor: string): string => {
  return encodeURIComponent(anchor).replaceAll(PERCENT_ENCODING_PATTERN, DOT_REPLACEMENT);
};

const generateAnchorText = (baseId: string, isWikipediaStyle: boolean): string => {
  if (isWikipediaStyle) {
    const anchor = replaceSpacesWithUnderscores(baseId);
    return convertToWikipediaStyleAnchor(anchor);
  }
  return encodeURIComponent(baseId.trim());
};

const safeDecodeURIComponent = (encoded: string): string => {
  if (!VALID_PERCENT_ENCODING.test(encoded)) return encoded;
  if (INVALID_PERCENT_PATTERN.test(encoded)) return encoded;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

const computeInitialIdentity = (heading: HTMLHeadingElement, isWikipediaStyle: boolean): string => {
  const existingId = heading.getAttribute('id')?.trim();
  if (existingId) return existingId;
  const text = getHeadingText(heading).trim();
  return text ? generateAnchorText(text, isWikipediaStyle) : '';
};

/**
 * Resolve the final unique identity for each heading in document order.
 * Pure — use `commitHeadingIdentities` to commit to the DOM.
 *
 * Two passes are required: pass 1 collects every initial identity into
 * `reserved` so that pass 2 can skip pre-existing `${base}_N`-shaped ids when
 * suffixing collisions (e.g. an author-set `aaa_2` reserves the slot before
 * an earlier duplicate `aaa` would otherwise claim it).
 */
export const resolveHeadingIdentities = (
  headings: ReadonlyArray<HTMLHeadingElement>,
  options: { anchorType: boolean },
): ReadonlyArray<ResolvedHeading> => {
  const initials: { encoded: string; decoded: string }[] = [];
  const reserved = new Set<string>();

  for (const [i, heading] of headings.entries()) {
    const computed = computeInitialIdentity(heading, options.anchorType);
    const encoded = computed || `mokuji-heading-${i}`;
    const decoded = safeDecodeURIComponent(encoded);
    initials.push({ encoded, decoded });
    reserved.add(decoded);
  }

  const resolved: ResolvedHeading[] = [];
  const used = new Set<string>();
  const counters = new Map<string, number>();

  for (const [i, heading] of headings.entries()) {
    const { encoded: initial, decoded } = initials[i];

    let identity: string;
    if (used.has(decoded)) {
      const baseId = decoded.replace(HEADING_DUPLICATE_SUFFIX_PATTERN, '') || decoded;
      let counter = (counters.get(baseId) ?? 0) + 1;
      while (used.has(`${baseId}_${counter}`) || reserved.has(`${baseId}_${counter}`)) {
        counter++;
      }
      identity = `${baseId}_${counter}`;
      counters.set(baseId, counter);
      used.add(identity);
    } else {
      identity = initial;
      used.add(decoded);
    }

    resolved.push({
      heading,
      identity,
      level: getHeadingLevel(heading),
    });
  }

  return resolved;
};

/**
 * Commit each resolved identity to its heading element. Idempotent.
 * The only DOM-mutating step in the identity pipeline.
 */
export const commitHeadingIdentities = (resolved: ReadonlyArray<ResolvedHeading>): void => {
  for (const r of resolved) {
    r.heading.id = r.identity;
  }
};
