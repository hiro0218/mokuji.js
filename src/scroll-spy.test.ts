import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupScrollSpy } from './scroll-spy';
import { ACTIVE_DATASET_ATTRIBUTE } from './utils/constants';
import type { ResolvedHeading } from './heading-identity';
import type { HeadingLevel } from './types';

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  targets = new Set<Element>();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    observerInstances.push(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  disconnect(): void {
    this.targets.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(): void {
    this.callback([], this as unknown as IntersectionObserver);
  }
}

const observerInstances: Array<MockIntersectionObserver> = [];
let frameCallbacks: FrameRequestCallback[] = [];
let resizeCallbacks: ResizeObserverCallback[] = [];

const lastObserver = (): MockIntersectionObserver => {
  const last = observerInstances.at(-1);
  if (!last) throw new Error('No IntersectionObserver instance was created');
  return last;
};

const setHeadingTop = (heading: HTMLHeadingElement, top: number): void => {
  heading.getBoundingClientRect = () =>
    ({ top, bottom: top + 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: top }) as DOMRect;
};

const setScrollTop = (scrollTop: number): void => {
  Object.defineProperty(globalThis, 'scrollY', { configurable: true, value: scrollTop });
};

const buildResolved = (headings: ReadonlyArray<HTMLHeadingElement>, level: HeadingLevel = 2): Array<ResolvedHeading> =>
  headings.map((heading) => ({ heading, identity: heading.id, level }));

const buildList = (identities: ReadonlyArray<string>): HTMLOListElement => {
  const list = document.createElement('ol');
  for (const id of identities) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('href', `#${id}`);
    a.textContent = id;
    li.append(a);
    list.append(li);
  }
  return list;
};

const findAnchor = (list: HTMLElement, identity: string): HTMLAnchorElement | null =>
  list.querySelector<HTMLAnchorElement>(`a[href="#${identity}"]`);

const flushAnimationFrames = (): void => {
  const callbacks = frameCallbacks;
  frameCallbacks = [];
  for (const callback of callbacks) callback(0);
};

class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    resizeCallbacks.push(callback);
  }

  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}

const triggerResize = (): void => {
  for (const callback of resizeCallbacks) callback([], {} as ResizeObserver);
};

describe('setupScrollSpy', () => {
  let body: HTMLElement;

  beforeEach(() => {
    observerInstances.length = 0;
    frameCallbacks = [];
    resizeCallbacks = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    vi.stubGlobal('requestAnimationFrame', function (this: typeof globalThis, callback: FrameRequestCallback) {
      expect(this).toBe(globalThis);
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', function (this: typeof globalThis) {
      expect(this).toBe(globalThis);
    });
    setScrollTop(0);
    body = document.createElement('div');
    document.body.append(body);
  });

  afterEach(() => {
    body.remove();
    vi.unstubAllGlobals();
  });

  it('marks the heading whose top has scrolled past the viewport top as active', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    const h2 = document.createElement('h2');
    h2.id = 'b';
    const h3 = document.createElement('h2');
    h3.id = 'c';
    body.append(h1, h2, h3);
    setHeadingTop(h1, -200);
    setHeadingTop(h2, -50);
    setHeadingTop(h3, 300);

    const list = buildList(['a', 'b', 'c']);
    body.append(list);

    setupScrollSpy(buildResolved([h1, h2, h3]), list, { offset: 0 });

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'b')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
    expect(findAnchor(list, 'b')?.getAttribute('aria-current')).toBe('true');
    expect(findAnchor(list, 'c')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
  });

  it('updates the active anchor when the viewport scrolls', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    const h2 = document.createElement('h2');
    h2.id = 'b';
    body.append(h1, h2);
    setHeadingTop(h1, -100);
    setHeadingTop(h2, 200);

    const list = buildList(['a', 'b']);
    body.append(list);

    setupScrollSpy(buildResolved([h1, h2]), list, { offset: 0 });

    expect(findAnchor(list, 'a')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
    expect(findAnchor(list, 'b')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);

    setScrollTop(250);
    globalThis.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'b')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
  });

  it('updates the active anchor when the document receives a scroll event', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    const h2 = document.createElement('h2');
    h2.id = 'b';
    body.append(h1, h2);
    setHeadingTop(h1, -100);
    setHeadingTop(h2, 200);

    const list = buildList(['a', 'b']);
    body.append(list);

    setupScrollSpy(buildResolved([h1, h2]), list, { offset: 0 });

    setScrollTop(250);
    document.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'b')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
  });

  it('respects offset so headings only count as active once their top crosses it', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    const h2 = document.createElement('h2');
    h2.id = 'b';
    body.append(h1, h2);
    setHeadingTop(h1, -200);
    setHeadingTop(h2, 120);

    const list = buildList(['a', 'b']);
    body.append(list);

    setupScrollSpy(buildResolved([h1, h2]), list, { offset: 80 });

    expect(findAnchor(list, 'a')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
    expect(findAnchor(list, 'b')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(lastObserver().options?.rootMargin).toBe('-80px 0px 0px 0px');

    setScrollTop(50);
    globalThis.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'b')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
  });

  it('accepts a negative offset and produces a valid expanded root margin', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    body.append(h1);
    setHeadingTop(h1, -5);

    const list = buildList(['a']);
    body.append(list);

    setupScrollSpy(buildResolved([h1]), list, { offset: -10 });

    expect(lastObserver().options?.rootMargin).toBe('10px 0px 0px 0px');
    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);

    setScrollTop(10);
    globalThis.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();

    expect(findAnchor(list, 'a')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
  });

  it('marks the first visible heading before any heading has crossed the offset', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    body.append(h1);
    setHeadingTop(h1, 500);

    const list = buildList(['a']);
    body.append(list);

    setupScrollSpy(buildResolved([h1]), list, { offset: 0 });

    expect(findAnchor(list, 'a')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
    expect(findAnchor(list, 'a')?.getAttribute('aria-current')).toBe('true');
  });

  it('leaves no anchor active when every heading is below the viewport', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    body.append(h1);
    setHeadingTop(h1, window.innerHeight + 100);

    const list = buildList(['a']);
    body.append(list);

    setupScrollSpy(buildResolved([h1]), list, { offset: 0 });

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'a')?.hasAttribute('aria-current')).toBe(false);
  });

  it('selects the visually closest heading when visual order differs from DOM order', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    const h2 = document.createElement('h2');
    h2.id = 'b';
    const h3 = document.createElement('h2');
    h3.id = 'c';
    body.append(h1, h2, h3);
    setHeadingTop(h1, -100);
    setHeadingTop(h2, 200);
    setHeadingTop(h3, -10);

    const list = buildList(['a', 'b', 'c']);
    body.append(list);

    setupScrollSpy(buildResolved([h1, h2, h3]), list, { offset: 0 });

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'c')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
  });

  it('does not read heading layout while handling scroll spy notifications', () => {
    const headings = Array.from({ length: 64 }, (_, i) => {
      const heading = document.createElement('h2');
      heading.id = `h-${i}`;
      let reads = 0;
      heading.getBoundingClientRect = () => {
        reads++;
        return {
          top: i * 40 - 1200,
          bottom: i * 40 - 1180,
          left: 0,
          right: 100,
          width: 100,
          height: 20,
          x: 0,
          y: 0,
        } as DOMRect;
      };
      return { heading, getReads: () => reads };
    });
    body.append(...headings.map(({ heading }) => heading));

    const list = buildList(headings.map(({ heading }) => heading.id));
    body.append(list);

    setupScrollSpy(buildResolved(headings.map(({ heading }) => heading)), list, { offset: 0 });
    const readsAfterSetup = headings.reduce((sum, { getReads }) => sum + getReads(), 0);

    lastObserver().trigger();
    lastObserver().trigger();
    flushAnimationFrames();

    const totalReads = headings.reduce((sum, { getReads }) => sum + getReads(), 0);
    expect(totalReads).toBe(readsAfterSetup);
  });

  it('refreshes measured positions after layout changes', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    const h2 = document.createElement('h2');
    h2.id = 'b';
    body.append(h1, h2);
    setHeadingTop(h1, -50);
    setHeadingTop(h2, 200);

    const list = buildList(['a', 'b']);
    body.append(list);

    setupScrollSpy(buildResolved([h1, h2]), list, { offset: 0 });
    expect(findAnchor(list, 'a')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');

    setHeadingTop(h1, 200);
    setHeadingTop(h2, -20);
    triggerResize();
    flushAnimationFrames();

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'b')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');
  });

  it('coalesces multiple observer notifications into one animation frame', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    body.append(h1);
    setHeadingTop(h1, -10);

    const list = buildList(['a']);
    body.append(list);

    setupScrollSpy(buildResolved([h1]), list, { offset: 0 });
    lastObserver().trigger();
    lastObserver().trigger();
    lastObserver().trigger();

    expect(frameCallbacks).toHaveLength(1);
  });

  it('disconnects the observer and clears the active state on teardown', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    body.append(h1);
    setHeadingTop(h1, -10);

    const list = buildList(['a']);
    body.append(list);

    const teardown = setupScrollSpy(buildResolved([h1]), list, { offset: 0 });
    expect(findAnchor(list, 'a')?.getAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe('true');

    teardown();

    expect(findAnchor(list, 'a')?.hasAttribute(ACTIVE_DATASET_ATTRIBUTE)).toBe(false);
    expect(findAnchor(list, 'a')?.hasAttribute('aria-current')).toBe(false);
    expect(lastObserver().targets.size).toBe(0);
  });

  it('returns a no-op teardown when no resolved headings are provided', () => {
    const list = buildList([]);
    body.append(list);

    const teardown = setupScrollSpy([], list, { offset: 0 });

    expect(observerInstances).toHaveLength(0);
    expect(() => teardown()).not.toThrow();
  });

  it('does not toggle attributes when the active heading does not change', () => {
    const h1 = document.createElement('h2');
    h1.id = 'a';
    body.append(h1);
    setHeadingTop(h1, -10);

    const list = buildList(['a']);
    body.append(list);

    setupScrollSpy(buildResolved([h1]), list, { offset: 0 });
    const anchor = findAnchor(list, 'a');
    if (!anchor) throw new Error('anchor missing');

    const removeSpy = vi.spyOn(anchor, 'removeAttribute');
    const setSpy = vi.spyOn(anchor, 'setAttribute');

    lastObserver().trigger();
    flushAnimationFrames();

    expect(removeSpy).not.toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
  });
});
