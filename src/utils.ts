export const replaceSpace2Underscore = (text: string) => {
  return text.replace(/\s+/g, '_');
};

export const convert2WikipediaStyleAnchor = (anchor: string) => {
  return encodeURIComponent(anchor).replace(/\%+/g, '.');
};

export const getHeadingTagName2Number = (tagName: string) => {
  return Number(tagName.substring(1));
};
