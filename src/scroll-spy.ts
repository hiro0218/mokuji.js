import type { ResolvedHeading } from './heading-identity';
import { ACTIVE_DATASET_ATTRIBUTE } from './utils/constants';

const ARIA_CURRENT_ATTRIBUTE = 'aria-current';
const ARIA_CURRENT_VALUE = 'true';

type PositionedHeading = {
  index: number;
  top: number;
  bottom: number;
};

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

const getFrameRequest = (): {
  request: (callback: FrameRequestCallback) => number;
  cancel: (handle: number) => void;
} => {
  if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
    return {
      request: globalThis.window.requestAnimationFrame.bind(globalThis.window),
      cancel: globalThis.window.cancelAnimationFrame.bind(globalThis.window),
    };
  }

  return {
    request: (callback) => globalThis.window.setTimeout(() => callback(performance.now()), 0),
    cancel: (handle) => globalThis.window.clearTimeout(handle),
  };
};

const findCommonParent = (resolved: ReadonlyArray<ResolvedHeading>): Element | undefined => {
  let parent: Element | undefined = resolved[0]?.heading.parentElement ?? undefined;
  while (parent) {
    const current = parent;
    if (resolved.every((r) => current.contains(r.heading))) return current;
    parent = current.parentElement ?? undefined;
  }
  return undefined;
};

const measurePositions = (resolved: ReadonlyArray<ResolvedHeading>): PositionedHeading[] => {
  const scrollTop = window.scrollY;
  const positions = resolved.map((r, index) => {
    const rect = r.heading.getBoundingClientRect();
    return { index, top: rect.top + scrollTop, bottom: rect.bottom + scrollTop };
  });
  // eslint-disable-next-line unicorn/no-array-sort -- Keep the library target at ES2022 without Array.prototype.toSorted.
  return positions.sort((a, b) => a.top - b.top || a.index - b.index);
};

const findActiveIndex = (
  positions: ReadonlyArray<PositionedHeading>,
  offset: number,
  scrollTop: number,
  viewportHeight: number,
): number => {
  let low = 0;
  let high = positions.length - 1;
  let activePosition: PositionedHeading | undefined;
  const boundary = scrollTop + offset;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (positions[middle].top <= boundary) {
      activePosition = positions[middle];
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  if (activePosition) return activePosition.index;
  if (offset < 0) return -1;

  const viewportBottom = scrollTop + viewportHeight;
  const firstVisible = positions.find((position) => position.top < viewportBottom && position.bottom >= boundary);
  return firstVisible?.index ?? -1;
};

/**
 * Mark the TOC list anchor whose heading is currently nearest the top of the viewport.
 * Active = visually closest heading above the viewport offset,
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
  const frame = getFrameRequest();
  let positions = measurePositions(resolved);
  let active: HTMLAnchorElement | undefined;
  let pendingFrame = 0;
  let pendingRefresh = false;

  const recompute = (refreshPositions: boolean): void => {
    if (refreshPositions) positions = measurePositions(resolved);
    const index = findActiveIndex(positions, offset, window.scrollY, window.innerHeight);
    active = applyActiveState(index >= 0 ? anchors[index] : undefined, active);
  };

  const scheduleRecompute = (refreshPositions: boolean): void => {
    pendingRefresh ||= refreshPositions;
    if (pendingFrame) return;
    pendingFrame = frame.request(() => {
      pendingFrame = 0;
      const shouldRefresh = pendingRefresh;
      pendingRefresh = false;
      recompute(shouldRefresh);
    });
  };

  const observer = new IntersectionObserver(() => scheduleRecompute(false), {
    rootMargin: `${-offset}px 0px 0px 0px`,
    threshold: [0, 1],
  });
  for (const r of resolved) observer.observe(r.heading);
  recompute(false);

  const commonParent = findCommonParent(resolved);
  let resizeObserver: ResizeObserver | undefined;
  if (commonParent && typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => scheduleRecompute(true));
    resizeObserver.observe(commonParent);
  }
  const handleScroll = () => scheduleRecompute(false);
  const handleResize = () => scheduleRecompute(true);
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize);

  return () => {
    if (pendingFrame) {
      frame.cancel(pendingFrame);
      pendingFrame = 0;
    }
    observer.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    active = applyActiveState(undefined, active);
  };
};
