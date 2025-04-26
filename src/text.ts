/**
 * 使用済みの見出しIDを格納するセット
 */
export const usedHeadingIds = new Set<string>();

/**
 * テキスト内のスペースをアンダースコアに置換する
 */
const replaceSpacesWithUnderscores = (text: string) => {
  return text.replaceAll(/\s+/g, '_').replaceAll(':', '');
};

/**
 * テキストをWikipediaスタイルのアンカーに変換する
 */
const convertToWikipediaStyleAnchor = (anchor: string) => {
  return encodeURIComponent(anchor).replaceAll(/%+/g, '.');
};

/**
 * 見出しテキストから一意のIDを生成する
 */
export const generateUniqueHeadingId = (headings: HTMLHeadingElement[], textContent = '') => {
  let headingId = textContent;
  let suffixCount = 1;

  // IDの重複を回避
  while (suffixCount <= headings.length) {
    const candidateId = suffixCount === 1 ? headingId : `${headingId}_${suffixCount}`;

    if (!usedHeadingIds.has(candidateId)) {
      headingId = candidateId;
      usedHeadingIds.add(headingId);
      break;
    }

    suffixCount++;
  }

  return headingId;
};

/**
 * アンカーテキストを生成する
 */
export const generateAnchorText = (text: string, isConvertToWikipediaStyleAnchor: boolean) => {
  let anchorText = replaceSpacesWithUnderscores(text);
  anchorText = anchorText.replaceAll(/&+/g, '').replaceAll(/&amp;+/g, '');

  if (isConvertToWikipediaStyleAnchor) {
    anchorText = convertToWikipediaStyleAnchor(anchorText);
  }

  return anchorText;
};
