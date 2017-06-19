mokuji.js
===

[![npm version](https://badge.fury.io/js/mokuji.js.svg)](https://www.npmjs.com/package/mokuji.js) [![Code Climate](https://codeclimate.com/github/hiro0218/mokuji.js/badges/gpa.svg)](https://codeclimate.com/github/hiro0218/mokuji.js)

A table of content JavaScript Library.

## Installation

```bash
npm install --save mokuji.js
```

## Usage

```html
<script src="../dist/mokuji.js"></script>
<script>
var mokuji = new Mokuji.init(document.getElementById('target'));

var list = document.getElementById('list');
list.appendChild(mokuji);
</script>
```

## Options

```javascript
{
  anchorType: '',
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkBefore: true,
  anchorLinkClassName: '',
  smoothScroll: true
}
```

### `anchorType`

(default: `''`)

`wikipedia`: Like Wikipedia's anchor, multibyte characters are replaced by escape sequences.

`こんにちは` → `.E3.81.93.E3.82.93.E3.81.AB.E3.81.A1.E3.81.AF`


### `anchorLink`

(default: `false`)

enable/disable the anchor link in the headings

### `anchorLinkSymbol`

(default: `'#'`)

set the anchor link symbol

### `anchorLinkBefore`

(default: `true`)

set position (before/after) the anchor link in headings.


### `anchorLinkClassName`

(default: `''`)

set anchor link class name.


### `smoothScroll`

(default: `true`)

enable/disable native smooth scrolling.
