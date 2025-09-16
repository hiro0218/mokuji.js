import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateTableOfContents } from './core';

const createHeading = (level: number, text: string): HTMLHeadingElement => {
  const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
  heading.textContent = text;
  return heading;
};

describe('generateTableOfContents', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('returns an empty list when no headings are provided', () => {
    const listContainer = document.createElement('ol');

    generateTableOfContents([], listContainer, false);

    expect(listContainer.children).toHaveLength(0);
  });

  it('renders a single heading as a list item hyperlink', () => {
    const heading = createHeading(2, 'Test Heading');
    container.append(heading);
    const listContainer = document.createElement('ol');

    generateTableOfContents([heading], listContainer, false);

    const firstItem = listContainer.children[0] as HTMLLIElement;
    expect(firstItem.tagName).toBe('LI');
    const anchor = firstItem.querySelector('a');
    expect(anchor?.textContent).toBe('Test Heading');
    expect(anchor?.getAttribute('href')).toBe('#Test_Heading');
  });

  it('renders multiple top-level headings in the order they appear', () => {
    const headingOne = createHeading(2, 'First Heading');
    const headingTwo = createHeading(2, 'Second Heading');
    container.append(headingOne, headingTwo);
    const listContainer = document.createElement('ol');

    generateTableOfContents([headingOne, headingTwo], listContainer, false);

    const anchors = [...listContainer.querySelectorAll('a')].map((node) => ({
      text: node.textContent,
      href: node.getAttribute('href'),
    }));

    expect(anchors).toEqual([
      { text: 'First Heading', href: '#First_Heading' },
      { text: 'Second Heading', href: '#Second_Heading' },
    ]);
  });

  it('creates nested lists that mirror heading hierarchy', () => {
    const h1 = createHeading(1, 'Main Title');
    const h2 = createHeading(2, 'Subtitle');
    const h3 = createHeading(3, 'Subsection');
    container.append(h1, h2, h3);
    const listContainer = document.createElement('ol');

    generateTableOfContents([h1, h2, h3], listContainer, false);

    const mainItem = listContainer.children[0] as HTMLLIElement;
    expect(mainItem.querySelector('a')?.textContent).toBe('Main Title');

    const nestedList = mainItem.querySelector('ol');
    expect(nestedList?.children).toHaveLength(1);
    const subtitleItem = nestedList?.children[0] as HTMLLIElement;
    expect(subtitleItem.querySelector('a')?.textContent).toBe('Subtitle');

    const deeperList = subtitleItem.querySelector('ol');
    expect(deeperList?.children).toHaveLength(1);
    expect(deeperList?.children[0].querySelector('a')?.textContent).toBe('Subsection');
  });

  it('generates Wikipedia-style anchors when requested', () => {
    const heading = createHeading(2, 'Sこkao16L');
    container.append(heading);
    const listContainer = document.createElement('ol');

    generateTableOfContents([heading], listContainer, true);

    const anchor = listContainer.querySelector('a');
    expect(anchor?.getAttribute('href')).toContain('.E3.81.93');
    expect(heading.id).toContain('.E3.81.93');
  });

  it('preserves an existing heading id', () => {
    const heading = createHeading(2, 'Test Heading');
    heading.id = 'custom-id';
    container.append(heading);
    const listContainer = document.createElement('ol');

    generateTableOfContents([heading], listContainer, false);

    const anchor = listContainer.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('#custom-id');
    expect(heading.id).toBe('custom-id');
  });

  it('keeps document order even when heading levels jump', () => {
    const h1 = createHeading(1, 'Level 1');
    const h3 = createHeading(3, 'Level 3');
    const h2 = createHeading(2, 'Level 2');
    container.append(h1, h3, h2);
    const listContainer = document.createElement('ol');

    generateTableOfContents([h1, h3, h2], listContainer, false);

    const nestedList = listContainer.querySelector('ol');
    expect(nestedList?.children).toHaveLength(2);
    const [firstChild, secondChild] = [...(nestedList?.children ?? [])] as HTMLLIElement[];
    expect(firstChild.querySelector('a')?.textContent).toBe('Level 3');
    expect(secondChild.querySelector('a')?.textContent).toBe('Level 2');
  });

  it('supports list containers other than ordered lists', () => {
    const h1 = createHeading(1, 'Main');
    const h2 = createHeading(2, 'Sub');
    container.append(h1, h2);
    const listContainer = document.createElement('ul');

    generateTableOfContents([h1, h2], listContainer, false);

    const nestedList = listContainer.querySelector('ul');
    expect(nestedList?.tagName).toBe('UL');
  });

  it('sanitizes anchors for headings with surrounding whitespace and symbols', () => {
    const heading = createHeading(2, '  Test & Special: Characters  ');
    container.append(heading);
    const listContainer = document.createElement('ol');

    generateTableOfContents([heading], listContainer, false);

    const anchor = listContainer.querySelector('a');
    expect(anchor?.textContent).toBe('  Test & Special: Characters  ');
    expect(anchor?.getAttribute('href')).toBe('#Test__Special_Characters');
    expect(heading.id).toBe('Test__Special_Characters');
  });

  it('builds nested lists for multiple chapters and sections', () => {
    const h1One = createHeading(1, 'Chapter 1');
    const h2One = createHeading(2, 'Section 1.1');
    const h3One = createHeading(3, 'Subsection 1.1.1');
    const h3Two = createHeading(3, 'Subsection 1.1.2');
    const h2Two = createHeading(2, 'Section 1.2');
    const h1Two = createHeading(1, 'Chapter 2');
    container.append(h1One, h2One, h3One, h3Two, h2Two, h1Two);
    const listContainer = document.createElement('ol');

    generateTableOfContents([h1One, h2One, h3One, h3Two, h2Two, h1Two], listContainer, false);

    expect(listContainer.children).toHaveLength(2);

    const [chapterOneItem, chapterTwoItem] = [...listContainer.children] as HTMLLIElement[];
    const chapterOneList = chapterOneItem.querySelector('ol');
    expect(chapterOneList?.children).toHaveLength(2);

    const sectionOneItem = chapterOneList?.children[0] as HTMLLIElement;
    const sectionOneList = sectionOneItem.querySelector('ol');
    expect(sectionOneList?.children).toHaveLength(2);

    expect(chapterTwoItem.querySelector('a')?.textContent).toBe('Chapter 2');
  });
});
