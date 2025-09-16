import { describe, it, expect } from 'vitest';
import { generateAnchorText } from './text';

describe('generateAnchorText', () => {
  it('normalizes whitespace and removes colons for DOM-friendly anchors', () => {
    const result = generateAnchorText('Chapter 1: Introduction', false);

    expect(result).toBe('Chapter_1_Introduction');
  });

  it('strips literal ampersands while leaving HTML entity text untouched', () => {
    const result = generateAnchorText('Rock & Roll &amp; Stuff', false);

    expect(result.includes('&')).toBe(false);
    expect(result).toBe('Rock__Roll_amp;_Stuff');
  });

  it('emits Wikipedia-style dotted percent encodings for non Latin text', () => {
    const result = generateAnchorText('日本 語', true);

    expect(result).toBe('.E6.97.A5.E6.9C.AC_.E8.AA.9E');
  });

  it('returns an empty anchor when the input is empty regardless of mode', () => {
    expect(generateAnchorText('', true)).toBe('');
    expect(generateAnchorText('', false)).toBe('');
  });
});
