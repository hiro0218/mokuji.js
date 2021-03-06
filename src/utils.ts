export const replaceSpace2Underscore = (text: string) => {
  return text.replace(/\s+/g, "_");
};

export const convert2WikipediaStyleAnchor = (anchor: string) => {
  anchor = encodeURIComponent(anchor);
  anchor = anchor.replace(/\%+/g, ".");

  return anchor;
};

export const getHeadingTagName2Number = (tagName: string) => {
  // @ts-ignore
  const currentNumber = tagName.match(/\d/g).join("");

  return Number(currentNumber);
};
