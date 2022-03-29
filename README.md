mokuji.js
===

A table of content JavaScript Library.

## Installation

```bash
npm install --save mokuji.js
```

## Usage

```javascript
import { Mokuji } from 'mokuji.js';

const textElement = document.querySelector('.text');
const mokujiList = Mokuji(textElement);

if (!mokujiList) return;

const listElement = document.querySelector('.list');
listElement?.appendChild(mokujiList);
```

## Options

```javascript
{
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkBefore: true,
  anchorLinkClassName: '',
}
```

### `anchorType`

(default: `true`)

Like Wikipedia's anchor, multibyte characters are replaced by escape sequences.

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

