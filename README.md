mokuji.js
===

[![npm version](https://badge.fury.io/js/mokuji.js.svg)](https://www.npmjs.com/package/mokuji.js)

generate "table of contents".

## Usage

```html
<script src="../dist/mokuji.js"></script>
<script>
var mokuji = Mokuji.init(document.getElementById('target'));

var list = document.getElementById('list');
list.appendChild(mokuji);
</script>
```

### options

```
{
  anchorType: 'wikipedia'
}
```


## Installation

```bash
npm install --save mokuji.js
```
