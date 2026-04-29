import { describe, it, expect } from 'vitest';
import { buildTocList } from './mokuji-core';
import type { ResolvedHeading } from './heading-identity';
import type { HeadingLevel } from './types';

const createHeading = (level: number, text: string): HTMLHeadingElement => {
  const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
  heading.textContent = text;
  return heading;
};

const r = (heading: HTMLHeadingElement, identity: string, level: HeadingLevel): ResolvedHeading => ({
  heading,
  identity,
  level,
});

describe('buildTocList', () => {
  it('returns an empty list when no resolved headings are provided', () => {
    const list = buildTocList([], 'ol');
    expect(list.tagName).toBe('OL');
    expect(list.children).toHaveLength(0);
  });

  it('renders a single resolved heading as a list item hyperlink', () => {
    const heading = createHeading(2, 'Test Heading');
    const list = buildTocList([r(heading, 'Test%20Heading', 2)], 'ol');

    const firstItem = list.children[0] as HTMLLIElement;
    expect(firstItem.tagName).toBe('LI');
    const anchor = firstItem.querySelector('a');
    expect(anchor?.textContent).toBe('Test Heading');
    expect(anchor?.getAttribute('href')).toBe('#Test%20Heading');
  });

  it('renders multiple top-level headings in document order', () => {
    const h1 = createHeading(2, 'First Heading');
    const h2 = createHeading(2, 'Second Heading');
    const list = buildTocList([r(h1, 'First%20Heading', 2), r(h2, 'Second%20Heading', 2)], 'ol');

    const anchors = [...list.querySelectorAll('a')].map((node) => ({
      text: node.textContent,
      href: node.getAttribute('href'),
    }));

    expect(anchors).toEqual([
      { text: 'First Heading', href: '#First%20Heading' },
      { text: 'Second Heading', href: '#Second%20Heading' },
    ]);
  });

  it('creates nested lists that mirror heading hierarchy', () => {
    const h1 = createHeading(1, 'Main Title');
    const h2 = createHeading(2, 'Subtitle');
    const h3 = createHeading(3, 'Subsection');
    const list = buildTocList([r(h1, 'main', 1), r(h2, 'sub', 2), r(h3, 'subsub', 3)], 'ol');

    const mainItem = list.children[0] as HTMLLIElement;
    expect(mainItem.querySelector('a')?.textContent).toBe('Main Title');

    const nested = mainItem.querySelector('ol');
    expect(nested?.children).toHaveLength(1);
    const subItem = nested?.children[0] as HTMLLIElement;
    expect(subItem.querySelector('a')?.textContent).toBe('Subtitle');

    const deeper = subItem.querySelector('ol');
    expect(deeper?.children).toHaveLength(1);
    expect(deeper?.children[0].querySelector('a')?.textContent).toBe('Subsection');
  });

  it('keeps document order even when heading levels jump', () => {
    const h1 = createHeading(1, 'Level 1');
    const h3 = createHeading(3, 'Level 3');
    const h2 = createHeading(2, 'Level 2');
    const list = buildTocList([r(h1, 'l1', 1), r(h3, 'l3', 3), r(h2, 'l2', 2)], 'ol');

    const nested = list.querySelector('ol');
    expect(nested?.children).toHaveLength(2);
    const [firstChild, secondChild] = [...(nested?.children ?? [])] as HTMLLIElement[];
    expect(firstChild.querySelector('a')?.textContent).toBe('Level 3');
    expect(secondChild.querySelector('a')?.textContent).toBe('Level 2');
  });

  it('supports list containers other than ordered lists', () => {
    const h1 = createHeading(1, 'Main');
    const h2 = createHeading(2, 'Sub');
    const list = buildTocList([r(h1, 'main', 1), r(h2, 'sub', 2)], 'ul');

    expect(list.tagName).toBe('UL');
    expect(list.querySelector('ul')?.tagName).toBe('UL');
  });

  it('builds nested lists for multiple chapters and sections', () => {
    const h1a = createHeading(1, 'Chapter 1');
    const h2a = createHeading(2, 'Section 1.1');
    const h3a = createHeading(3, 'Subsection 1.1.1');
    const h3b = createHeading(3, 'Subsection 1.1.2');
    const h2b = createHeading(2, 'Section 1.2');
    const h1b = createHeading(1, 'Chapter 2');

    const list = buildTocList(
      [r(h1a, 'c1', 1), r(h2a, 's11', 2), r(h3a, 'ss111', 3), r(h3b, 'ss112', 3), r(h2b, 's12', 2), r(h1b, 'c2', 1)],
      'ol',
    );

    expect(list.children).toHaveLength(2);
    const [chapterOne, chapterTwo] = [...list.children] as HTMLLIElement[];
    const chapterOneList = chapterOne.querySelector('ol');
    expect(chapterOneList?.children).toHaveLength(2);

    const sectionOne = chapterOneList?.children[0] as HTMLLIElement;
    const sectionOneList = sectionOne.querySelector('ol');
    expect(sectionOneList?.children).toHaveLength(2);

    expect(chapterTwo.querySelector('a')?.textContent).toBe('Chapter 2');
  });
});
