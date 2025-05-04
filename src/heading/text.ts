/**
 * テキスト処理とアンカーテキスト生成のためのユーティリティ関数
 */

// 正規表現定義
const WHITESPACE_PATTERN = /\s+/g;
const COLON_CHARACTER = ':';
const AMPERSAND_PATTERN = /&+/g;
const AMPERSAND_ENTITY_PATTERN = /&amp;+/g;
const PERCENT_ENCODING_PATTERN = /%+/g;
const DOT_REPLACEMENT = '.';

/**
 * テキスト内のスペースをアンダースコアに置換し、コロンを除去する
 */
const replaceSpacesWithUnderscores = (text: string): string => {
  return text.replaceAll(WHITESPACE_PATTERN, '_').replace(COLON_CHARACTER, '');
};

/**
 * テキストをWikipediaスタイルのアンカー形式（パーセントエンコーディング後に%を.に置換）に変換する
 */
const convertToWikipediaStyleAnchor = (anchor: string): string => {
  return encodeURIComponent(anchor).replaceAll(PERCENT_ENCODING_PATTERN, DOT_REPLACEMENT);
};

/**
 * アンカーテキストを生成する
 * HTMLのid属性やhrefで使用される最終的な文字列を生成する。
 */
export const generateAnchorText = (baseId: string, isConvertToWikipediaStyleAnchor: boolean): string => {
  let anchorText = replaceSpacesWithUnderscores(baseId);

  if (isConvertToWikipediaStyleAnchor) {
    anchorText = convertToWikipediaStyleAnchor(anchorText);
  }

  if (!isConvertToWikipediaStyleAnchor && anchorText.includes('&')) {
    anchorText = anchorText.replaceAll(AMPERSAND_PATTERN, '').replaceAll(AMPERSAND_ENTITY_PATTERN, '');
  }

  return anchorText;
};
