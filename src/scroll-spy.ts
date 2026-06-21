import type { ResolvedHeading } from './heading-identity';
import { ACTIVE_DATASET_ATTRIBUTE } from './utils/constants';

const ARIA_CURRENT_ATTRIBUTE = 'aria-current';
const ARIA_CURRENT_VALUE = 'true';

const applyActiveState = (
  next: HTMLAnchorElement | undefined,
  current: HTMLAnchorElement | undefined,
): HTMLAnchorElement | undefined => {
  if (next === current) return current;
  if (current) {
    current.removeAttribute(ACTIVE_DATASET_ATTRIBUTE);
    current.removeAttribute(ARIA_CURRENT_ATTRIBUTE);
  }
  if (next) {
    next.setAttribute(ACTIVE_DATASET_ATTRIBUTE, 'true');
    next.setAttribute(ARIA_CURRENT_ATTRIBUTE, ARIA_CURRENT_VALUE);
  }
  return next;
};

const findActiveIndex = (resolved: ReadonlyArray<ResolvedHeading>, offset: number): number => {
  let low = 0;
  let high = resolved.length - 1;
  let activeIndex = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (resolved[middle].heading.getBoundingClientRect().top - offset <= 0) {
      activeIndex = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  if (activeIndex >= 0 || offset < 0) return activeIndex;

  const firstRect = resolved[0].heading.getBoundingClientRect();
  return firstRect.top < window.innerHeight && firstRect.bottom >= offset ? 0 : -1;
};

/**
 * Mark the TOC list anchor whose heading is currently nearest the top of the viewport.
 * Active = last heading in document order whose top has scrolled past `offset` pixels,
 * or the first visible heading before the document has crossed that boundary.
 */
export const setupScrollSpy = (
  resolved: ReadonlyArray<ResolvedHeading>,
  list: HTMLElement,
  options: { offset: number },
): (() => void) => {
  if (resolved.length === 0) return () => {};

  const offset = options.offset;
  const anchors = list.querySelectorAll<HTMLAnchorElement>('a');
  let active: HTMLAnchorElement | undefined;

  const recompute = (): void => {
    const index = findActiveIndex(resolved, offset);
    active = applyActiveState(index >= 0 ? anchors[index] : undefined, active);
  };

  const observer = new IntersectionObserver(recompute, {
    rootMargin: `${-offset}px 0px 0px 0px`,
    threshold: [0, 1],
  });
  for (const r of resolved) observer.observe(r.heading);
  recompute();

  return () => {
    observer.disconnect();
    active = applyActiveState(undefined, active);
  };
};
