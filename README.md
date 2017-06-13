mokuji.js
===

[![npm version](https://badge.fury.io/js/mokuji.js.svg)](https://www.npmjs.com/package/mokuji.js)

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

```
{
  anchorType: 'wikipedia'
}
```

### `anchorType`

default: `''`

`wikipedia`: Like Wikipedia's anchor, multibyte characters are replaced by escape sequences.

`こんにちは` → `.E3.81.93.E3.82.93.E3.81.AB.E3.81.A1.E3.81.AF`
