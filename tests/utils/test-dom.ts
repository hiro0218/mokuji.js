/**
 * DOM utility functions common to tests and benchmarks
 */

import { JSDOM } from 'jsdom';

/**
 * Create an empty DOM document
 */
export const createEmptyDocument = (): { document: Document; body: HTMLElement } => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const document = dom.window.document;
  return { document, body: document.body };
};

/**
 * Generate a test document with a specified number and hierarchy of headings
 * Creates customizable complex DOM structure for benchmarking
 *
 * @param headingsCount Total number of headings to generate
 * @param nestedDepth Maximum nesting level for headings (default: 3)
 * @returns Generated body element
 */
export const createTestDocument = (headingsCount: number, nestedDepth = 3): HTMLElement => {
  const { document, body } = createEmptyDocument();

  // Helper function to create heading elements
  const createHeading = (level: number, text: string): HTMLHeadingElement => {
    const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
    heading.textContent = text;
    body.append(heading);

    // Add some paragraphs after the heading
    const paragraphCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < paragraphCount; i++) {
      const p = document.createElement('p');
      p.textContent = `Paragraph ${i + 1} under ${text}`;
      body.append(p);
    }
    return heading;
  };

  let headingCounter = 0;

  // Recursively generate nested heading structure
  const createNestedHeadings = (currentLevel: number, maxLevel: number, parentPrefix = ''): void => {
    if (currentLevel > maxLevel || headingCounter >= headingsCount) return;

    const siblingCount = Math.min(Math.floor(Math.random() * 3) + 1, headingsCount - headingCounter);

    for (let i = 0; i < siblingCount; i++) {
      const prefix = parentPrefix ? `${parentPrefix}.${i + 1}` : `${i + 1}`;
      const text = `Heading ${prefix}`;
      createHeading(currentLevel, text);
      headingCounter++;

      if (headingCounter >= headingsCount) return;

      // Recursively create child headings
      createNestedHeadings(currentLevel + 1, maxLevel, prefix);
    }
  };

  createNestedHeadings(1, nestedDepth);
  return body;
};

/**
 * Create element from HTML text (for simple tests)
 */
export const createElementFromHTML = (html: string): HTMLElement => {
  const { document } = createEmptyDocument();
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
};
