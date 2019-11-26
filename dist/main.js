/*!
 * mokuji.js v1.4.2
 * https://github.com/hiro0218/mokuji.js
 * 
 * Copyright (C) 2017-2018 hiro
 */
!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.Mokuji=r():e.Mokuji=r()}(window,function(){return function(e){var r={};function n(t){if(r[t])return r[t].exports;var o=r[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=r,n.d=function(e,r,t){n.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,r){if(1&r&&(e=n(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(n.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)n.d(t,o,function(r){return e[r]}.bind(null,o));return t},n.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(r,"a",r),r},n.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},n.p="",n(n.s=0)}([function(e,r,n){n(3),e.exports=n(1)},function(e,r,n){(function(e){var n,t,o;function a(e){return(a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}
/*!
 * mokuji.js v1.4.2
 * https://github.com/hiro0218/mokuji.js
 * 
 * Copyright (C) 2017-2018 hiro
 */!function(i,c){"object"==a(r)&&"object"==a(e)?e.exports=c():(t=[],void 0===(o="function"==typeof(n=c)?n.apply(r,t):n)||(e.exports=o))}("undefined"!=typeof self&&self,function(){return function(e){function r(t){if(n[t])return n[t].exports;var o=n[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,r),o.l=!0,o.exports}var n={};return r.m=e,r.c=n,r.d=function(e,n,t){r.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:t})},r.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(n,"a",n),n},r.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},r.p="",r(r.s=0)}([function(e,r,n){"use strict";function t(e,r){for(;e;){if(e===r)return!0;e=e.parentNode}return!1}function o(){return(o=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var n=arguments[r];for(var t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])}return e}).apply(this,arguments)}function a(e,r){for(var n=0;n<r.length;n++){var t=r[n];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}Object.defineProperty(r,"__esModule",{value:!0}),n.d(r,"init",function(){return u});var i={anchorType:!0,anchorLink:!1,anchorLinkSymbol:"#",anchorLinkBefore:!0,anchorLinkClassName:""},c=[],u=function(){function e(r,n){if(function(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}(this,e),r){n=o(i,n);var t=this.render(r,n);return c=[],t}}return function(e,r,n){r&&a(e.prototype,r),n&&a(e,n)}(e,[{key:"render",value:function(e,r){var n=this.generateMokuji(e,r);return r.anchorLink&&this.renderAnchorLink(n,r),n}},{key:"generateMokuji",value:function(e,r){for(var n=this.createHeadingWalker(e),o=null,a=0,i=document.createElement("ol"),c=document.createElement("li"),u=document.createElement("a");o=n.nextNode();){var l=o.tagName.match(/\d/g).join("");if(l=Number(l),0!==a&&a<l){var f=document.createElement("ol");i.lastChild.appendChild(f),i=f}else if(0!==a&&a>l)for(var d=0;d<a-l;d++)t(i,i.parentNode)&&(i=i.parentNode.parentNode);var s=this.censorshipId(o.textContent);o.id=this.setAnchor(o.id,s,r.anchorType),i.appendChild(this.buildList(o,u.cloneNode(!1),c.cloneNode(!1))),a=l}return 0===a?null:(i=this.reverseMokuji(i),this.removeDuplicateIds(i),i)}},{key:"censorshipId",value:function(e){var r=e,n=1;if(-1!==c.indexOf(r))for(;n<10;){var t="".concat(r,"_").concat(n);if(-1===c.indexOf(t)){r=t,c.push(r);break}n++}else c.push(r);return r}},{key:"createHeadingWalker",value:function(e){return document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,function(e){return/^H[1-6]$/.test(e.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP},!1)}},{key:"setAnchor",value:function(e,r,n){var t=e||this.replaceSpace2Underscore(r);return t=(t=t.replace(/\&+/g,"")).replace(/\&amp;+/g,""),!0===n&&(t=(t=encodeURIComponent(t)).replace(/\%+/g,".")),t}},{key:"renderAnchorLink",value:function(e,r){if(e){var n=e.getElementsByTagName("a"),t=document.createElement("a");t.classList.add(r.anchorLinkClassName);for(var o=0;o<n.length;o++){var a=n[o].hash,i=document.querySelector('[id="'.concat(a.replace("#",""),'"]'));if(i){var c=t.cloneNode(!1);c.setAttribute("href",a),c.textContent=r.anchorLinkSymbol,r.anchorLinkBefore?i.insertBefore(c,i.firstChild):i.appendChild(c)}}}}},{key:"replaceSpace2Underscore",value:function(e){return String(e).replace(/\s+/g,"_")}},{key:"buildList",value:function(e,r,n){return r.href="#"+e.id,r.textContent=e.textContent,n.appendChild(r),n}},{key:"reverseMokuji",value:function(e){for(;e.parentNode;)e=e.parentNode;return e}},{key:"removeDuplicateIds",value:function(e){for(var r=e.getElementsByTagName("a"),n=0;n<r.length;n++){var t=r[n].innerText,o=r[n].hash,a=document.querySelectorAll('[id="'.concat(t,'"]'));if(1!==a.length){var i=0;Array.from||(Array.from=function(e){return Array.prototype.slice.call(e)});for(var c=Array.from(a),u=0;u<c.length;u++){for(var l=c[u],f="".concat(l.id,"-").concat(i),d=Array.from(r),s=0;s<d.length;s++){var p=d[s];if(p.hash===o){p.href="#".concat(f);break}}l.id=f,i++}}}}}]),e}()}])})}).call(this,n(2)(e))},function(e,r){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}},function(e,r,n){"use strict";function t(e,r){for(;e;){if(e===r)return!0;e=e.parentNode}return!1}function o(){return(o=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var n=arguments[r];for(var t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])}return e}).apply(this,arguments)}function a(e,r){for(var n=0;n<r.length;n++){var t=r[n];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}n.r(r),n.d(r,"Mokuji",function(){return u});var i={anchorType:!0,anchorLink:!1,anchorLinkSymbol:"#",anchorLinkBefore:!0,anchorLinkClassName:""},c=[],u=function(){function e(r,n){if(function(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}(this,e),r){n=o(i,n);var t=this.render(r,n);return c=[],t}}return function(e,r,n){r&&a(e.prototype,r),n&&a(e,n)}(e,[{key:"render",value:function(e,r){var n=this.generateMokuji(e,r);return r.anchorLink&&this.renderAnchorLink(n,r),n}},{key:"generateMokuji",value:function(e,r){for(var n=this.createHeadingWalker(e),o=null,a=0,i=document.createElement("ol"),c=document.createElement("li"),u=document.createElement("a");o=n.nextNode();){var l=o.tagName.match(/\d/g).join("");if(l=Number(l),0!==a&&a<l){var f=document.createElement("ol");i.lastChild.appendChild(f),i=f}else if(0!==a&&a>l)for(var d=0;d<a-l;d++)t(i,i.parentNode)&&(i=i.parentNode.parentNode);var s=this.censorshipId(o.textContent);o.id=this.setAnchor(o.id,s,r.anchorType),i.appendChild(this.buildList(o,u.cloneNode(!1),c.cloneNode(!1))),a=l}return 0===a?null:(i=this.reverseMokuji(i),this.removeDuplicateIds(i),i)}},{key:"censorshipId",value:function(e){var r=e,n=1;if(-1!==c.indexOf(r))for(;n<10;){var t="".concat(r,"_").concat(n);if(-1===c.indexOf(t)){r=t,c.push(r);break}n++}else c.push(r);return r}},{key:"createHeadingWalker",value:function(e){return document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,function(e){return/^H[1-6]$/.test(e.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP},!1)}},{key:"setAnchor",value:function(e,r,n){var t=e||this.replaceSpace2Underscore(r);return t=(t=t.replace(/\&+/g,"")).replace(/\&amp;+/g,""),!0===n&&(t=(t=encodeURIComponent(t)).replace(/\%+/g,".")),t}},{key:"renderAnchorLink",value:function(e,r){if(e){var n=e.getElementsByTagName("a"),t=document.createElement("a");t.classList.add(r.anchorLinkClassName);for(var o=0;o<n.length;o++){var a=n[o].hash,i=document.querySelector('[id="'.concat(a.replace("#",""),'"]'));if(i){var c=t.cloneNode(!1);c.setAttribute("href",a),c.textContent=r.anchorLinkSymbol,r.anchorLinkBefore?i.insertBefore(c,i.firstChild):i.appendChild(c)}}}}},{key:"replaceSpace2Underscore",value:function(e){return String(e).replace(/\s+/g,"_")}},{key:"buildList",value:function(e,r,n){return r.href="#"+e.id,r.textContent=e.textContent,n.appendChild(r),n}},{key:"reverseMokuji",value:function(e){for(;e.parentNode;)e=e.parentNode;return e}},{key:"removeDuplicateIds",value:function(e){for(var r=e.getElementsByTagName("a"),n=0;n<r.length;n++){var t=r[n].innerText,o=r[n].hash,a=document.querySelectorAll('[id="'.concat(t,'"]'));if(1!==a.length){var i=0;Array.from||(Array.from=function(e){return Array.prototype.slice.call(e)});for(var c=Array.from(a),u=0;u<c.length;u++){for(var l=c[u],f="".concat(l.id,"-").concat(i),d=Array.from(r),s=0;s<d.length;s++){var p=d[s];if(p.hash===o){p.href="#".concat(f);break}}l.id=f,i++}}}}}]),e}()}])});