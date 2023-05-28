const storeIds = new Set<string>();

const replaceSpacesWithUnderscores = (text: string) => {
  return text.replaceAll(/\s+/g, '_');
};

const convert2WikipediaStyleAnchor = (anchor: string) => {
  return encodeURIComponent(anchor).replaceAll(/%+/g, '.');
};

export const censorshipId = (headings: HTMLHeadingElement[], textContent = '') => {
  let id = textContent;
  let suffix_count = 1;

  // IDが重複していた場合はsuffixを付ける
  while (suffix_count <= headings.length) {
    const tmp_id = suffix_count === 1 ? id : `${id}_${suffix_count}`;

    if (!storeIds.has(tmp_id)) {
      id = tmp_id;
      storeIds.add(id);
      break;
    }

    suffix_count++;
  }

  return id;
};

export const generateAnchorText = (text: string, isConvertToWikipediaStyleAnchor: boolean) => {
  // convert spaces to _
  let anchor = replaceSpacesWithUnderscores(text);

  // remove &
  anchor = anchor.replaceAll(/&+/g, '').replaceAll(/&amp;+/g, '');

  if (isConvertToWikipediaStyleAnchor === true) {
    anchor = convert2WikipediaStyleAnchor(anchor);
  }

  return anchor;
};
