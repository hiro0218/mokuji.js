import { isElementWithinParent, getAllHeadingElements, createElement } from './dom';
import type { MokujiOption } from './types';
import { generateUniqueHeadingId, generateAnchorText, usedHeadingIds } from './text';

type ResultProps<T> =
  | {
      element?: T;
      list: HTMLUListElement | HTMLOListElement;
    }
  | undefined;

export { MokujiOption, ResultProps };

// 目次関連の要素を識別するための属性
const MOKUJI_LIST_DATASET_ATTRIBUTE = 'data-mokuji-list';
const ANCHOR_DATASET_ATTRIBUTE = 'data-mokuji-anchor';

// デフォルトオプション設定
const defaultOptions = {
  anchorType: true, // Wikipediaスタイルのアンカーを生成
  anchorLink: false, // 見出しへのアンカーリンクを追加
  anchorLinkSymbol: '#', // アンカーリンクのシンボル
  anchorLinkPosition: 'before', // アンカーリンクの位置
  anchorLinkClassName: '', // アンカーリンクのクラス名
  anchorContainerTagName: 'ol', // 目次のコンテナ要素
} as const;

/**
 * アンカー要素からアンカーIDへのマッピングを生成する
 */
const generateAnchorsMap = (anchors: HTMLAnchorElement[]) => {
  const anchorMap = new Map<string, HTMLAnchorElement>();

  for (let i = 0; i < anchors.length; i++) {
    const anchorId = anchors[i].hash.replace('#', '');
    anchorMap.set(anchorId, anchors[i]);
  }

  return anchorMap;
};

/**
 * 見出し要素にアンカーリンクを追加する
 */
const insertAnchorToHeadings = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  options: MokujiOption,
) => {
  const a = createElement('a');
  a.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  if (options.anchorLinkClassName) {
    const anchorLinkClassName = options.anchorLinkClassName.trim();
    const classNames = anchorLinkClassName.split(/\s+/);
    // 複数のクラス名の場合
    if (classNames.length > 1) {
      for (const className of classNames) {
        a.classList.add(className.trim());
      }
    } else {
      a.classList.add(anchorLinkClassName);
    }
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const matchedAnchor = anchorMap.get(encodeURIComponent(heading.id));

    if (!matchedAnchor) {
      continue;
    }

    const anchor = a.cloneNode(false) as HTMLAnchorElement;
    anchor.setAttribute('href', matchedAnchor.hash);

    if (options.anchorLinkSymbol) {
      anchor.textContent = options.anchorLinkSymbol;
    }

    // 設定に基づいてアンカーを配置
    if (options.anchorLinkPosition === 'before') {
      heading.insertBefore(anchor, heading.firstChild);
    } else {
      heading.append(anchor);
    }
  }
};

/**
 * 見出し要素のIDが重複している場合に一意になるよう修正する
 */
const ensureUniqueHeadingIds = (headings: HTMLHeadingElement[], anchors: HTMLAnchorElement[]) => {
  const headingIdOccurrenceMap = new Map<string, number>();
  const idToAnchorsMap = new Map<string, HTMLAnchorElement[]>();

  // アンカー要素をIDごとにグループ化
  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    const headingId = anchor.hash.slice(1);
    const anchorsForId = idToAnchorsMap.get(headingId) || [];
    anchorsForId.push(anchor);
    idToAnchorsMap.set(headingId, anchorsForId);
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const originalHeadingId = heading.id;
    const occurrenceCount = headingIdOccurrenceMap.get(originalHeadingId) || 0;

    // 重複IDの処理
    if (occurrenceCount > 0) {
      const uniqueHeadingId = `${originalHeadingId}-${occurrenceCount}`;
      heading.id = uniqueHeadingId;

      // 対応するアンカー要素も更新
      const matchingAnchors = idToAnchorsMap.get(originalHeadingId) || [];
      for (let j = 0; j < matchingAnchors.length; j++) {
        const anchor = matchingAnchors[j];
        anchor.href = `#${uniqueHeadingId}`;
      }
    }

    headingIdOccurrenceMap.set(originalHeadingId, occurrenceCount + 1);
  }
};

/**
 * 見出しの階層構造に基づいてリストの階層を調整する
 */
const adjustHeadingHierarchy = (
  previousHeadingLevel: number,
  currentHeadingLevel: number,
  listContainer: HTMLUListElement | HTMLOListElement,
) => {
  // 小見出しになった場合は階層を深くする
  if (previousHeadingLevel !== 0 && previousHeadingLevel < currentHeadingLevel) {
    const nestedListElement = createElement('ol');
    if (listContainer.lastChild) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      listContainer.lastChild.append(nestedListElement);
      listContainer = nestedListElement;
    }
  }
  // 大見出しになった場合は階層を浅くする
  else if (previousHeadingLevel !== 0 && previousHeadingLevel > currentHeadingLevel) {
    for (let i = 0; i < previousHeadingLevel - currentHeadingLevel; i++) {
      if (listContainer.parentNode && isElementWithinParent(listContainer, listContainer.parentNode)) {
        listContainer = listContainer.parentNode?.parentNode as HTMLUListElement | HTMLOListElement;
      }
    }
  }
  return listContainer;
};

/**
 * 見出し要素にIDを割り当てる
 */
const assignIdToHeading = (
  heading: HTMLHeadingElement,
  headings: HTMLHeadingElement[],
  isConvertToWikipediaStyleAnchor: boolean,
) => {
  const headingText = generateUniqueHeadingId(headings, heading.textContent || '');
  const anchorText = generateAnchorText(headingText, isConvertToWikipediaStyleAnchor);
  heading.id = anchorText;
  return anchorText;
};

/**
 * 見出しからリスト要素を作成する
 */
const createListElement = (anchorText: string, heading: HTMLHeadingElement) => {
  const elementListClone = createElement('li');
  const elementAnchorClone = createElement('a');
  const elementAnchor = elementAnchorClone.cloneNode(false) as HTMLAnchorElement;

  elementAnchor.href = `#${anchorText}`;
  elementAnchor.textContent = heading.textContent;

  const elementList = elementListClone.cloneNode(false) as HTMLLIElement;
  elementList.append(elementAnchor);
  return elementList;
};

/**
 * 見出し要素から階層構造を持つ目次を生成する
 */
const generateTableOfContents = (
  headings: HTMLHeadingElement[],
  listContainer: HTMLUListElement | HTMLOListElement,
  isConvertToWikipediaStyleAnchor: boolean,
) => {
  let previousHeadingLevel = 0;

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const currentHeadingLevel = Number(heading.tagName[1]);

    // 見出しの階層に合わせてリストの階層を調整
    listContainer = adjustHeadingHierarchy(previousHeadingLevel, currentHeadingLevel, listContainer);

    // 見出しにIDを割り当て
    const anchorText = assignIdToHeading(heading, headings, isConvertToWikipediaStyleAnchor);

    // リスト要素を作成して追加
    const listItem = createListElement(anchorText, heading);
    listContainer.append(listItem);

    previousHeadingLevel = currentHeadingLevel;
  }
};

/**
 * 与えられた要素内の見出しから目次を生成する
 */
export const Mokuji = <T extends HTMLElement>(element: T | null, externalOptions?: MokujiOption): ResultProps<T> => {
  if (!element) {
    return;
  }

  // 要素のコピーを作成
  const modifiedElement = element.cloneNode(true) as T;

  // オプションをマージ
  const options = {
    ...defaultOptions,
    ...externalOptions,
  };

  const headings = [...getAllHeadingElements(modifiedElement)];

  if (headings.length === 0) {
    return;
  }

  // 目次コンテナを作成
  const listContainer = createElement(options.anchorContainerTagName);
  listContainer.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

  // 目次を生成
  generateTableOfContents(headings, listContainer, options.anchorType);

  const anchors = [...listContainer.querySelectorAll('a')];

  if (anchors.length === 0) {
    return;
  }

  // 重複IDを修正
  ensureUniqueHeadingIds(headings, anchors);

  // アンカーリンクを設定
  if (options.anchorLink) {
    const anchorsMap = generateAnchorsMap(anchors);
    insertAnchorToHeadings(headings, anchorsMap, options);
  }

  return { element: modifiedElement, list: listContainer };
};

/**
 * 生成された目次とアンカーリンクを破棄する
 */
export const Destroy = () => {
  // アンカー要素を削除
  const mokujiAnchors = document.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  for (let i = mokujiAnchors.length - 1; i >= 0; i--) {
    const anchorElement = mokujiAnchors[i];
    anchorElement.remove();
  }

  // 目次リストを削除
  const tableOfContentsList = document.querySelector(`[${MOKUJI_LIST_DATASET_ATTRIBUTE}]`);
  if (tableOfContentsList) {
    tableOfContentsList.remove();
  }

  // 使用済みIDをクリア
  usedHeadingIds.clear();
};
