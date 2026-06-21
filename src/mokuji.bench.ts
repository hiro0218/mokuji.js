import { bench, describe } from 'vitest';
import { Mokuji } from './index';
import type { MokujiOption } from './types';

const options = {
  time: 1000,
  warmupTime: 300,
  warmupIterations: 10,
};

const createHeadingText = (index: number, duplicateHeadings: boolean): string => {
  if (duplicateHeadings) {
    return `Repeated heading ${index % 10}`;
  }
  return `Heading ${index}`;
};

const createContent = (
  headingCount: number,
  fixtureOptions: { duplicateHeadings?: boolean; includeBlockquotes?: boolean } = {},
): HTMLElement => {
  const container = document.createElement('main');
  const duplicateHeadings = fixtureOptions.duplicateHeadings ?? false;
  const includeBlockquotes = fixtureOptions.includeBlockquotes ?? false;

  for (let i = 0; i < headingCount; i++) {
    const heading = document.createElement(`h${(i % 6) + 1}`) as HTMLHeadingElement;
    heading.textContent = createHeadingText(i, duplicateHeadings);

    if (includeBlockquotes && i % 5 === 0) {
      const blockquote = document.createElement('blockquote');
      blockquote.append(heading);
      container.append(blockquote);
    } else {
      container.append(heading);
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = `Paragraph ${i}`;
    container.append(paragraph);
  }

  return container;
};

const runMokuji = (
  headingCount: number,
  mokujiOptions?: MokujiOption,
  fixtureOptions?: Parameters<typeof createContent>[1],
): void => {
  const container = createContent(headingCount, fixtureOptions);
  const result = Mokuji(container, mokujiOptions);
  result?.destroy();
};

describe('Mokuji benchmark', () => {
  bench(
    'generate toc: 100 headings',
    () => {
      runMokuji(100);
    },
    options,
  );

  bench(
    'generate toc with anchor links: 100 headings',
    () => {
      runMokuji(100, { anchorLink: true });
    },
    options,
  );

  bench(
    'generate toc with duplicate headings: 1000 headings',
    () => {
      runMokuji(1000, undefined, { duplicateHeadings: true });
    },
    options,
  );

  bench(
    'generate toc excluding blockquote headings: 1000 headings',
    () => {
      runMokuji(1000, undefined, { includeBlockquotes: true });
    },
    options,
  );

  bench(
    'generate toc: 1000 headings',
    () => {
      runMokuji(1000);
    },
    options,
  );
});
