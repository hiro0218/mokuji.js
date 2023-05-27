export const replaceSpace2Underscore = (text: string) => {
  return text.replaceAll(/\s+/g, '_');
};

export const convert2WikipediaStyleAnchor = (anchor: string) => {
  return encodeURIComponent(anchor).replaceAll(/%+/g, '.');
};

export const getHeadingTagName2Number = (tagName: string) => {
  return Number(tagName.slice(1));
};
