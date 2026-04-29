import { describe, it, expect } from 'vitest';
import { resolveHeadingIdentities, commitHeadingIdentities, type ResolvedHeading } from './heading-identity';

const createHeading = (level: number, text?: string, id?: string): HTMLHeadingElement => {
  const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
  if (text !== undefined) heading.textContent = text;
  if (id !== undefined) heading.setAttribute('id', id);
  return heading;
};

describe('resolveHeadingIdentities', () => {
  it('preserves a trimmed pre-existing id', () => {
    const h = createHeading(2, 'Existing', '  pre-existing-id  ');
    const [r] = resolveHeadingIdentities([h], { anchorType: true });
    expect(r.identity).toBe('pre-existing-id');
    expect(r.level).toBe(2);
    expect(r.heading).toBe(h);
  });

  it('does not mutate heading.id (pure)', () => {
    const h = createHeading(2, 'Test');
    const beforeId = h.id;
    resolveHeadingIdentities([h], { anchorType: false });
    expect(h.id).toBe(beforeId);
  });

  it('derives RFC 3986 encoded identity from text when no id present', () => {
    const h = createHeading(3, 'Generated Heading');
    const [r] = resolveHeadingIdentities([h], { anchorType: false });
    expect(r.identity).toBe('Generated%20Heading');
  });

  it('derives Wikipedia-style identity from text when anchorType is true', () => {
    const h = createHeading(2, 'Hello World');
    const [r] = resolveHeadingIdentities([h], { anchorType: true });
    expect(r.identity).toBe('Hello_World');
  });

  it('encodes Japanese text in Wikipedia style with dot replacement', () => {
    const h = createHeading(2, '日本語');
    const [r] = resolveHeadingIdentities([h], { anchorType: true });
    expect(r.identity).toBe('.E6.97.A5.E6.9C.AC.E8.AA.9E');
  });

  it('encodes Japanese text in RFC 3986 style', () => {
    const h = createHeading(2, '日本語');
    const [r] = resolveHeadingIdentities([h], { anchorType: false });
    expect(r.identity).toBe('%E6%97%A5%E6%9C%AC%E8%AA%9E');
  });

  it('strips colons from text in Wikipedia style', () => {
    const h = createHeading(2, 'foo:bar baz');
    const [r] = resolveHeadingIdentities([h], { anchorType: true });
    expect(r.identity).toBe('foobar_baz');
  });

  it('falls back to mokuji-heading-${i} for empty text without id', () => {
    const h1 = createHeading(2, '');
    const h2 = createHeading(3, '');
    const resolved = resolveHeadingIdentities([h1, h2], { anchorType: false });
    expect(resolved[0].identity).toBe('mokuji-heading-0');
    expect(resolved[1].identity).toBe('mokuji-heading-1');
    expect(resolved[0].level).toBe(2);
    expect(resolved[1].level).toBe(3);
  });

  it('dedupes simple duplicates with _N suffix in document order', () => {
    const h1 = createHeading(2, 'Section', 'section');
    const h2 = createHeading(2, 'Section', 'section');
    const h3 = createHeading(2, 'Section', 'section');
    const resolved = resolveHeadingIdentities([h1, h2, h3], { anchorType: false });
    expect(resolved.map((r) => r.identity)).toEqual(['section', 'section_1', 'section_2']);
  });

  it('reserves pre-existing aaa_N identifiers and skips them during suffix assignment', () => {
    const h1 = createHeading(2, 'aaa', 'aaa');
    const h2 = createHeading(2, 'aaa', 'aaa');
    const h3 = createHeading(2, 'aaa', 'aaa');
    const h4 = createHeading(2, 'aaa_2', 'aaa_2');
    const resolved = resolveHeadingIdentities([h1, h2, h3, h4], { anchorType: false });
    expect(resolved.map((r) => r.identity)).toEqual(['aaa', 'aaa_1', 'aaa_3', 'aaa_2']);
  });

  it('preserves originals when they appear in different orders', () => {
    const h1 = createHeading(2, 'aaa_2', 'aaa_2');
    const h2 = createHeading(2, 'aaa', 'aaa');
    const h3 = createHeading(2, 'aaa', 'aaa');
    const resolved = resolveHeadingIdentities([h1, h2, h3], { anchorType: false });
    expect(resolved.map((r) => r.identity)).toEqual(['aaa_2', 'aaa', 'aaa_1']);
  });

  it('handles multiple originals with same text and reserved suffix', () => {
    const h4 = createHeading(2, 'aaa', 'aaa');
    const h5 = createHeading(2, 'aaa_2', 'aaa_2');
    const h6 = createHeading(2, 'aaa', 'aaa');
    const h7 = createHeading(2, 'aaa_2', 'aaa_2');
    const resolved = resolveHeadingIdentities([h4, h5, h6, h7], { anchorType: false });
    expect(resolved.map((r) => r.identity)).toEqual(['aaa', 'aaa_2', 'aaa_1', 'aaa_3']);
  });

  it('keeps a valid percent-encoded id stable', () => {
    const h = createHeading(2, 'Encoded', 'heading%20one');
    const [r] = resolveHeadingIdentities([h], { anchorType: false });
    expect(r.identity).toBe('heading%20one');
  });

  it('keeps an invalid percent-encoded id as-is without throwing', () => {
    const h = createHeading(2, 'Invalid', 'heading%2');
    const [r] = resolveHeadingIdentities([h], { anchorType: false });
    expect(r.identity).toBe('heading%2');
  });

  it('returns an empty array when no headings are provided', () => {
    expect(resolveHeadingIdentities([], { anchorType: false })).toEqual([]);
  });
});

describe('commitHeadingIdentities', () => {
  it('writes resolved.identity to each heading.id', () => {
    const h = createHeading(2, 'Test');
    const resolved: ResolvedHeading[] = [{ heading: h, identity: 'computed-id', level: 2 }];
    commitHeadingIdentities(resolved);
    expect(h.id).toBe('computed-id');
  });

  it('is idempotent on repeated calls', () => {
    const h = createHeading(2, 'Test');
    const resolved: ResolvedHeading[] = [{ heading: h, identity: 'computed-id', level: 2 }];
    commitHeadingIdentities(resolved);
    commitHeadingIdentities(resolved);
    expect(h.id).toBe('computed-id');
  });

  it('overwrites a previously committed identity', () => {
    const h = createHeading(2, 'Test');
    h.id = 'stale';
    const resolved: ResolvedHeading[] = [{ heading: h, identity: 'fresh', level: 2 }];
    commitHeadingIdentities(resolved);
    expect(h.id).toBe('fresh');
  });
});
