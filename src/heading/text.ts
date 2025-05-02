/**
 * テキスト処理とID生成のためのユーティリティ関数を提供するモジュール
 */

/**
 * 使用済みの見出しIDを格納するセット
 */
export const usedHeadingIds = new Set<string>();

/**
 * 見出しIDごとの出現回数を追跡するマップ
 */
export const headingIdCountMap = new Map<string, number>();

/**
 * 高頻度で使用される正規表現パターンの事前コンパイル
 */
const WHITESPACE_PATTERN = /\s+/g;
const COLON_CHARACTER = ':';
const AMPERSAND_PATTERN = /&+/g;
const AMPERSAND_ENTITY_PATTERN = /&amp;+/g;
const PERCENT_ENCODING_PATTERN = /%+/g;
const DOT_REPLACEMENT = '.';

/**
 * テキスト内のスペースをアンダースコアに置換する
 *
 * @param text 置換対象のテキスト
 * @returns スペースがアンダースコアに置換されたテキスト
 */
const replaceSpacesWithUnderscores = (text: string): string => {
  return text.replaceAll(WHITESPACE_PATTERN, '_').replace(COLON_CHARACTER, '');
};

/**
 * テキストをWikipediaスタイルのアンカーに変換する
 *
 * @param anchor 変換対象のアンカーテキスト
 * @returns Wikipediaスタイルに変換されたアンカーテキスト
 */
const convertToWikipediaStyleAnchor = (anchor: string): string => {
  return encodeURIComponent(anchor).replaceAll(PERCENT_ENCODING_PATTERN, DOT_REPLACEMENT);
};

/**
 * 見出しテキストから一意のIDを生成する
 *
 * @param textContent 見出しのテキスト内容
 * @returns 生成された一意のID
 */
export const generateUniqueHeadingId = (textContent = ''): string => {
  const baseHeadingId = textContent;

  // 現在のIDの出現回数を取得または初期化
  const count = headingIdCountMap.get(baseHeadingId) || 0;

  // 出現回数を増加させる
  headingIdCountMap.set(baseHeadingId, count + 1);

  // 初回出現の場合はそのままのID、それ以外は接尾辞を付ける
  const headingId = count === 0 ? baseHeadingId : `${baseHeadingId}_${count}`;

  // 使用済みセットに追加
  usedHeadingIds.add(headingId);

  return headingId;
};

/**
 * アンカーテキストを生成する
 *
 * @param text 変換対象のテキスト
 * @param isConvertToWikipediaStyleAnchor Wikipediaスタイルの変換を行うかどうかのフラグ
 * @returns 生成されたアンカーテキスト
 */
export const generateAnchorText = (text: string, isConvertToWikipediaStyleAnchor: boolean): string => {
  // 変換ステップを効率化: 一度の関数呼び出しで置換
  let anchorText = replaceSpacesWithUnderscores(text);

  // 特殊文字の一括処理
  if (anchorText.includes('&')) {
    anchorText = anchorText.replaceAll(AMPERSAND_PATTERN, '').replaceAll(AMPERSAND_ENTITY_PATTERN, '');
  }

  // 条件付き変換処理
  if (isConvertToWikipediaStyleAnchor) {
    anchorText = convertToWikipediaStyleAnchor(anchorText);
  }

  return anchorText;
};
