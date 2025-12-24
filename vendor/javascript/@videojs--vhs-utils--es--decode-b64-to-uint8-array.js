// @videojs/vhs-utils/es/decode-b64-to-uint8-array@4.1.1 downloaded from https://ga.jspm.io/npm:@videojs/vhs-utils@4.1.1/es/decode-b64-to-uint8-array.js

import r from"global/window";var o=function atob(o){return r.atob?r.atob(o):Buffer.from(o,"base64").toString("binary")};function decodeB64ToUint8Array(r){var t=o(r);var a=new Uint8Array(t.length);for(var n=0;n<t.length;n++)a[n]=t.charCodeAt(n);return a}export{decodeB64ToUint8Array as default};

