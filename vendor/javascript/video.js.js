// video.js@8.21.0 downloaded from https://ga.jspm.io/npm:video.js@8.21.0/dist/video.es.js

import e from"global/window";import t from"global/document";import s from"@videojs/xhr";import i from"videojs-vtt.js";import n from"@babel/runtime/helpers/extends";import r from"@videojs/vhs-utils/es/resolve-url.js";import{Parser as a}from"m3u8-parser";import{isAudioCodec as o,parseCodecs as l,translateLegacyCodec as d,codecsFromDefault as h,getMimeForCodec as c,DEFAULT_VIDEO_CODEC as u,DEFAULT_AUDIO_CODEC as p,browserSupportsCodec as m,muxerSupportsCodec as f}from"@videojs/vhs-utils/es/codecs.js";import{simpleTypeFromSourceType as g}from"@videojs/vhs-utils/es/media-types.js";import{isArrayBufferView as y,concatTypedArrays as _,stringToBytes as v,toUint8 as T}from"@videojs/vhs-utils/es/byte-helpers";import{parse as b,generateSidxKey as S,addSidxSegmentsToPlaylist as C,parseUTCTiming as k}from"mpd-parser";import w from"mux.js/lib/tools/parse-sidx";import{getId3Offset as E}from"@videojs/vhs-utils/es/id3-helpers";import{detectContainerForBytes as x,isLikelyFmp4MediaSegment as I}from"@videojs/vhs-utils/es/containers";import{ONE_SECOND_IN_TS as P}from"mux.js/lib/utils/clock";
/**
 * @license
 * Video.js 8.21.0 <http://videojs.com/>
 * Copyright Brightcove, Inc. <https://www.brightcove.com/>
 * Available under Apache License Version 2.0
 * <https://github.com/videojs/video.js/blob/main/LICENSE>
 *
 * Includes vtt.js <https://github.com/mozilla/vtt.js>
 * Available under Apache License Version 2.0
 * <https://github.com/mozilla/vtt.js/blob/main/LICENSE>
 */var L="8.21.0";const A={};
/**
 * Get a list of hooks for a specific lifecycle
 *
 * @param  {string} type
 *         the lifecycle to get hooks from
 *
 * @param  {Function|Function[]} [fn]
 *         Optionally add a hook (or hooks) to the lifecycle that your are getting.
 *
 * @return {Array}
 *         an array of hooks, or an empty array if there are none.
 */const hooks=function(e,t){A[e]=A[e]||[];t&&(A[e]=A[e].concat(t));return A[e]};
/**
 * Add a function hook to a specific videojs lifecycle.
 *
 * @param {string} type
 *        the lifecycle to hook the function to.
 *
 * @param {Function|Function[]}
 *        The function or array of functions to attach.
 */const hook=function(e,t){hooks(e,t)};
/**
 * Remove a hook from a specific videojs lifecycle.
 *
 * @param  {string} type
 *         the lifecycle that the function hooked to
 *
 * @param  {Function} fn
 *         The hooked function to remove
 *
 * @return {boolean}
 *         The function that was removed or undef
 */const removeHook=function(e,t){const s=hooks(e).indexOf(t);if(s<=-1)return false;A[e]=A[e].slice();A[e].splice(s,1);return true};
/**
 * Add a function hook that will only run once to a specific videojs lifecycle.
 *
 * @param {string} type
 *        the lifecycle to hook the function to.
 *
 * @param {Function|Function[]}
 *        The function or array of functions to attach.
 */const hookOnce=function(e,t){hooks(e,[].concat(t).map((t=>{const wrapper=(...s)=>{removeHook(e,wrapper);return t(...s)};return wrapper})))};
/**
 * Store the browser-specific methods for the fullscreen API.
 *
 * @type {Object}
 * @see [Specification]{@link https://fullscreen.spec.whatwg.org}
 * @see [Map Approach From Screenfull.js]{@link https://github.com/sindresorhus/screenfull.js}
 */const D={prefixed:true};const O=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror","fullscreen"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror","-webkit-full-screen"]];const M=O[0];let U;for(let e=0;e<O.length;e++)if(O[e][1]in t){U=O[e];break}if(U){for(let e=0;e<U.length;e++)D[M[e]]=U[e];D.prefixed=U[0]!==M[0]}let R=[];
/**
 * Log messages to the console and history based on the type of message
 *
 * @private
 * @param  {string} name
 *         The name of the console method to use.
 *
 * @param  {Object} log
 *         The arguments to be passed to the matching console method.
 *
 * @param {string} [styles]
 *        styles for name
 */const LogByTypeFactory=(t,s,i)=>(n,r,a)=>{const o=s.levels[r];const l=new RegExp(`^(${o})$`);let d=t;n!=="log"&&a.unshift(n.toUpperCase()+":");if(i){d=`%c${t}`;a.unshift(i)}a.unshift(d+":");if(R){R.push([].concat(a));const e=R.length-1e3;R.splice(0,e>0?e:0)}if(!e.console)return;let h=e.console[n];h||n!=="debug"||(h=e.console.info||e.console.log);h&&o&&l.test(n)&&h[Array.isArray(a)?"apply":"call"](e.console,a)};function createLogger$1(e,t=":",s=""){let i="info";let n;
/**
   * Logs plain debug messages. Similar to `console.log`.
   *
   * Due to [limitations](https://github.com/jsdoc3/jsdoc/issues/955#issuecomment-313829149)
   * of our JSDoc template, we cannot properly document this as both a function
   * and a namespace, so its function signature is documented here.
   *
   * #### Arguments
   * ##### *args
   * *[]
   *
   * Any combination of values that could be passed to `console.log()`.
   *
   * #### Return Value
   *
   * `undefined`
   *
   * @namespace
   * @param    {...*} args
   *           One or more messages or objects that should be logged.
   */function log(...e){n("log",i,e)}n=LogByTypeFactory(e,log,s);
/**
   * Create a new subLogger which chains the old name to the new name.
   *
   * For example, doing `mylogger = videojs.log.createLogger('player')` and then using that logger will log the following:
   * ```js
   *  mylogger('foo');
   *  // > VIDEOJS: player: foo
   * ```
   *
   * @param {string} subName
   *        The name to add call the new logger
   * @param {string} [subDelimiter]
   *        Optional delimiter
   * @param {string} [subStyles]
   *        Optional styles
   * @return {Object}
   */log.createLogger=(i,n,r)=>{const a=n!==void 0?n:t;const o=r!==void 0?r:s;const l=`${e} ${a} ${i}`;return createLogger$1(l,a,o)};
/**
   * Create a new logger.
   *
   * @param {string} newName
   *        The name for the new logger
   * @param {string} [newDelimiter]
   *        Optional delimiter
   * @param {string} [newStyles]
   *        Optional styles
   * @return {Object}
   */log.createNewLogger=(e,t,s)=>createLogger$1(e,t,s);
/**
   * Enumeration of available logging levels, where the keys are the level names
   * and the values are `|`-separated strings containing logging methods allowed
   * in that logging level. These strings are used to create a regular expression
   * matching the function name being called.
   *
   * Levels provided by Video.js are:
   *
   * - `off`: Matches no calls. Any value that can be cast to `false` will have
   *   this effect. The most restrictive.
   * - `all`: Matches only Video.js-provided functions (`debug`, `log`,
   *   `log.warn`, and `log.error`).
   * - `debug`: Matches `log.debug`, `log`, `log.warn`, and `log.error` calls.
   * - `info` (default): Matches `log`, `log.warn`, and `log.error` calls.
   * - `warn`: Matches `log.warn` and `log.error` calls.
   * - `error`: Matches only `log.error` calls.
   *
   * @type {Object}
   */log.levels={all:"debug|log|warn|error",off:"",debug:"debug|log|warn|error",info:"log|warn|error",warn:"warn|error",error:"error",DEFAULT:i};
/**
   * Get or set the current logging level.
   *
   * If a string matching a key from {@link module:log.levels} is provided, acts
   * as a setter.
   *
   * @param  {'all'|'debug'|'info'|'warn'|'error'|'off'} [lvl]
   *         Pass a valid level to set a new logging level.
   *
   * @return {string}
   *         The current logging level.
   */log.level=e=>{if(typeof e==="string"){if(!log.levels.hasOwnProperty(e))throw new Error(`"${e}" in not a valid log level`);i=e}return i};log.history=()=>R?[].concat(R):[]
/**
   * Allows you to filter the history by the given logger name
   *
   * @param {string} fname
   *        The name to filter by
   *
   * @return {Array}
   *         The filtered list to return
   */;log.history.filter=e=>(R||[]).filter((t=>new RegExp(`.*${e}.*`).test(t[0])));log.history.clear=()=>{R&&(R.length=0)};log.history.disable=()=>{if(R!==null){R.length=0;R=null}};log.history.enable=()=>{R===null&&(R=[])};
/**
   * Logs error messages. Similar to `console.error`.
   *
   * @param {...*} args
   *        One or more messages or objects that should be logged as an error
   */log.error=(...e)=>n("error",i,e)
/**
   * Logs warning messages. Similar to `console.warn`.
   *
   * @param {...*} args
   *        One or more messages or objects that should be logged as a warning.
   */;log.warn=(...e)=>n("warn",i,e)
/**
   * Logs debug messages. Similar to `console.debug`, but may also act as a comparable
   * log if `console.debug` is not available
   *
   * @param {...*} args
   *        One or more messages or objects that should be logged as debug.
   */;log.debug=(...e)=>n("debug",i,e);return log}const B=createLogger$1("VIDEOJS");const j=B.createLogger;
/**
 * @callback obj:EachCallback
 *
 * @param {*} value
 *        The current key for the object that is being iterated over.
 *
 * @param {string} key
 *        The current key-value for object that is being iterated over
 */
/**
 * @callback obj:ReduceCallback
 *
 * @param {*} accum
 *        The value that is accumulating over the reduce loop.
 *
 * @param {*} value
 *        The current key for the object that is being iterated over.
 *
 * @param {string} key
 *        The current key-value for object that is being iterated over
 *
 * @return {*}
 *         The new accumulated value.
 */const F=Object.prototype.toString;
/**
 * Get the keys of an Object
 *
 * @param {Object}
 *        The Object to get the keys from
 *
 * @return {string[]}
 *         An array of the keys from the object. Returns an empty array if the
 *         object passed in was invalid or had no keys.
 *
 * @private
 */const keys=function(e){return isObject(e)?Object.keys(e):[]};
/**
 * Array-like iteration for objects.
 *
 * @param {Object} object
 *        The object to iterate over
 *
 * @param {obj:EachCallback} fn
 *        The callback function which is called for each key in the object.
 */function each(e,t){keys(e).forEach((s=>t(e[s],s)))}
/**
 * Array-like reduce for objects.
 *
 * @param {Object} object
 *        The Object that you want to reduce.
 *
 * @param {Function} fn
 *         A callback function which is called for each key in the object. It
 *         receives the accumulated value and the per-iteration value and key
 *         as arguments.
 *
 * @param {*} [initial = 0]
 *        Starting value
 *
 * @return {*}
 *         The final accumulated value.
 */function reduce(e,t,s=0){return keys(e).reduce(((s,i)=>t(s,e[i],i)),s)}
/**
 * Returns whether a value is an object of any kind - including DOM nodes,
 * arrays, regular expressions, etc. Not functions, though.
 *
 * This avoids the gotcha where using `typeof` on a `null` value
 * results in `'object'`.
 *
 * @param  {Object} value
 * @return {boolean}
 */function isObject(e){return!!e&&typeof e==="object"}
/**
 * Returns whether an object appears to be a "plain" object - that is, a
 * direct instance of `Object`.
 *
 * @param  {Object} value
 * @return {boolean}
 */function isPlain(e){return isObject(e)&&F.call(e)==="[object Object]"&&e.constructor===Object}
/**
 * Merge two objects recursively.
 *
 * Performs a deep merge like
 * {@link https://lodash.com/docs/4.17.10#merge|lodash.merge}, but only merges
 * plain objects (not arrays, elements, or anything else).
 *
 * Non-plain object values will be copied directly from the right-most
 * argument.
 *
 * @param   {Object[]} sources
 *          One or more objects to merge into a new object.
 *
 * @return {Object}
 *          A new object that is the merged result of all sources.
 */function merge$1(...e){const t={};e.forEach((e=>{e&&each(e,((e,s)=>{if(isPlain(e)){isPlain(t[s])||(t[s]={});t[s]=merge$1(t[s],e)}else t[s]=e}))}));return t}
/**
 * Returns an array of values for a given object
 *
 * @param  {Object} source - target object
 * @return {Array<unknown>} - object values
 */function values(e={}){const t=[];for(const s in e)if(e.hasOwnProperty(s)){const i=e[s];t.push(i)}return t}
/**
 * Object.defineProperty but "lazy", which means that the value is only set after
 * it is retrieved the first time, rather than being set right away.
 *
 * @param {Object} obj the object to set the property on
 * @param {string} key the key for the property to set
 * @param {Function} getValue the function used to get the value when it is needed.
 * @param {boolean} setter whether a setter should be allowed or not
 */function defineLazyProperty(e,t,s,i=true){const set=s=>Object.defineProperty(e,t,{value:s,enumerable:true,writable:true});const n={configurable:true,enumerable:true,get(){const e=s();set(e);return e}};i&&(n.set=set);return Object.defineProperty(e,t,n)}var N=Object.freeze({__proto__:null,each:each,reduce:reduce,isObject:isObject,isPlain:isPlain,merge:merge$1,values:values,defineLazyProperty:defineLazyProperty});
/**
 * Whether or not this device is an iPod.
 *
 * @static
 * @type {Boolean}
 */let $=false;
/**
 * The detected iOS version - or `null`.
 *
 * @static
 * @type {string|null}
 */let H=null;
/**
 * Whether or not this is an Android device.
 *
 * @static
 * @type {Boolean}
 */let q=false;
/**
 * The detected Android version - or `null` if not Android or indeterminable.
 *
 * @static
 * @type {number|string|null}
 */let V;
/**
 * Whether or not this is Mozilla Firefox.
 *
 * @static
 * @type {Boolean}
 */let z=false;
/**
 * Whether or not this is Microsoft Edge.
 *
 * @static
 * @type {Boolean}
 */let W=false;
/**
 * Whether or not this is any Chromium Browser
 *
 * @static
 * @type {Boolean}
 */let G=false;
/**
 * Whether or not this is any Chromium browser that is not Edge.
 *
 * This will also be `true` for Chrome on iOS, which will have different support
 * as it is actually Safari under the hood.
 *
 * Deprecated, as the behaviour to not match Edge was to prevent Legacy Edge's UA matching.
 * IS_CHROMIUM should be used instead.
 * "Chromium but not Edge" could be explicitly tested with IS_CHROMIUM && !IS_EDGE
 *
 * @static
 * @deprecated
 * @type {Boolean}
 */let K=false;
/**
 * The detected Chromium version - or `null`.
 *
 * @static
 * @type {number|null}
 */let Q=null;
/**
 * The detected Google Chrome version - or `null`.
 * This has always been the _Chromium_ version, i.e. would return on Chromium Edge.
 * Deprecated, use CHROMIUM_VERSION instead.
 *
 * @static
 * @deprecated
 * @type {number|null}
 */let X=null;
/**
 * Whether or not this is a Chromecast receiver application.
 *
 * @static
 * @type {Boolean}
 */const Y=Boolean(e.cast&&e.cast.framework&&e.cast.framework.CastReceiverContext);
/**
 * The detected Internet Explorer version - or `null`.
 *
 * @static
 * @deprecated
 * @type {number|null}
 */let J=null;
/**
 * Whether or not this is desktop Safari.
 *
 * @static
 * @type {Boolean}
 */let Z=false;
/**
 * Whether or not this is a Windows machine.
 *
 * @static
 * @type {Boolean}
 */let ee=false;
/**
 * Whether or not this device is an iPad.
 *
 * @static
 * @type {Boolean}
 */let te=false;
/**
 * Whether or not this device is an iPhone.
 *
 * @static
 * @type {Boolean}
 */let se=false;
/**
 * Whether or not this is a Tizen device.
 *
 * @static
 * @type {Boolean}
 */let ie=false;
/**
 * Whether or not this is a WebOS device.
 *
 * @static
 * @type {Boolean}
 */let ne=false;
/**
 * Whether or not this is a Smart TV (Tizen or WebOS) device.
 *
 * @static
 * @type {Boolean}
 */let re=false;
/**
 * Whether or not this device is touch-enabled.
 *
 * @static
 * @const
 * @type {Boolean}
 */const ae=Boolean(isReal()&&("ontouchstart"in e||e.navigator.maxTouchPoints||e.DocumentTouch&&e.document instanceof e.DocumentTouch));const oe=e.navigator&&e.navigator.userAgentData;if(oe&&oe.platform&&oe.brands){q=oe.platform==="Android";W=Boolean(oe.brands.find((e=>e.brand==="Microsoft Edge")));G=Boolean(oe.brands.find((e=>e.brand==="Chromium")));K=!W&&G;Q=X=(oe.brands.find((e=>e.brand==="Chromium"))||{}).version||null;ee=oe.platform==="Windows"}if(!G){const t=e.navigator&&e.navigator.userAgent||"";$=/iPod/i.test(t);H=function(){const e=t.match(/OS (\d+)_/i);return e&&e[1]?e[1]:null}();q=/Android/i.test(t);V=function(){const e=t.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i);if(!e)return null;const s=e[1]&&parseFloat(e[1]);const i=e[2]&&parseFloat(e[2]);return s&&i?parseFloat(e[1]+"."+e[2]):s||null}();z=/Firefox/i.test(t);W=/Edg/i.test(t);G=/Chrome/i.test(t)||/CriOS/i.test(t);K=!W&&G;Q=X=function(){const e=t.match(/(Chrome|CriOS)\/(\d+)/);return e&&e[2]?parseFloat(e[2]):null}();J=function(){const e=/MSIE\s(\d+)\.\d/.exec(t);let s=e&&parseFloat(e[1]);!s&&/Trident\/7.0/i.test(t)&&/rv:11.0/.test(t)&&(s=11);return s}();ie=/Tizen/i.test(t);ne=/Web0S/i.test(t);re=ie||ne;Z=/Safari/i.test(t)&&!K&&!q&&!W&&!re;ee=/Windows/i.test(t);te=/iPad/i.test(t)||Z&&ae&&!/iPhone/i.test(t);se=/iPhone/i.test(t)&&!te}
/**
 * Whether or not this is an iOS device.
 *
 * @static
 * @const
 * @type {Boolean}
 */const le=se||te||$;
/**
 * Whether or not this is any flavor of Safari - including iOS.
 *
 * @static
 * @const
 * @type {Boolean}
 */const de=(Z||le)&&!K;var he=Object.freeze({__proto__:null,get IS_IPOD(){return $},get IOS_VERSION(){return H},get IS_ANDROID(){return q},get ANDROID_VERSION(){return V},get IS_FIREFOX(){return z},get IS_EDGE(){return W},get IS_CHROMIUM(){return G},get IS_CHROME(){return K},get CHROMIUM_VERSION(){return Q},get CHROME_VERSION(){return X},IS_CHROMECAST_RECEIVER:Y,get IE_VERSION(){return J},get IS_SAFARI(){return Z},get IS_WINDOWS(){return ee},get IS_IPAD(){return te},get IS_IPHONE(){return se},get IS_TIZEN(){return ie},get IS_WEBOS(){return ne},get IS_SMART_TV(){return re},TOUCH_ENABLED:ae,IS_IOS:le,IS_ANY_SAFARI:de});
/**
 * Detect if a value is a string with any non-whitespace characters.
 *
 * @private
 * @param  {string} str
 *         The string to check
 *
 * @return {boolean}
 *         Will be `true` if the string is non-blank, `false` otherwise.
 *
 */function isNonBlankString(e){return typeof e==="string"&&Boolean(e.trim())}
/**
 * Throws an error if the passed string has whitespace. This is used by
 * class methods to be relatively consistent with the classList API.
 *
 * @private
 * @param  {string} str
 *         The string to check for whitespace.
 *
 * @throws {Error}
 *         Throws an error if there is whitespace in the string.
 */function throwIfWhitespace(e){if(e.indexOf(" ")>=0)throw new Error("class has illegal whitespace characters")}function isReal(){return t===e.document}
/**
 * Determines, via duck typing, whether or not a value is a DOM element.
 *
 * @param  {*} value
 *         The value to check.
 *
 * @return {boolean}
 *         Will be `true` if the value is a DOM element, `false` otherwise.
 */function isEl(e){return isObject(e)&&e.nodeType===1}function isInFrame(){try{return e.parent!==e.self}catch(e){return true}}
/**
 * Creates functions to query the DOM using a given method.
 *
 * @private
 * @param   {string} method
 *          The method to create the query with.
 *
 * @return  {Function}
 *          The query method
 */function createQuerier(e){return function(s,i){if(!isNonBlankString(s))return t[e](null);isNonBlankString(i)&&(i=t.querySelector(i));const n=isEl(i)?i:t;return n[e]&&n[e](s)}}
/**
 * Creates an element and applies properties, attributes, and inserts content.
 *
 * @param  {string} [tagName='div']
 *         Name of tag to be created.
 *
 * @param  {Object} [properties={}]
 *         Element properties to be applied.
 *
 * @param  {Object} [attributes={}]
 *         Element attributes to be applied.
 *
 * @param {ContentDescriptor} [content]
 *        A content descriptor object.
 *
 * @return {Element}
 *         The element that was created.
 */function createEl(e="div",s={},i={},n){const r=t.createElement(e);Object.getOwnPropertyNames(s).forEach((function(e){const t=s[e];e==="textContent"?textContent(r,t):r[e]===t&&e!=="tabIndex"||(r[e]=t)}));Object.getOwnPropertyNames(i).forEach((function(e){r.setAttribute(e,i[e])}));n&&appendContent(r,n);return r}
/**
 * Injects text into an element, replacing any existing contents entirely.
 *
 * @param  {HTMLElement} el
 *         The element to add text content into
 *
 * @param  {string} text
 *         The text content to add.
 *
 * @return {Element}
 *         The element with added text content.
 */function textContent(e,t){typeof e.textContent==="undefined"?e.innerText=t:e.textContent=t;return e}
/**
 * Insert an element as the first child node of another
 *
 * @param {Element} child
 *        Element to insert
 *
 * @param {Element} parent
 *        Element to insert child into
 */function prependTo(e,t){t.firstChild?t.insertBefore(e,t.firstChild):t.appendChild(e)}
/**
 * Check if an element has a class name.
 *
 * @param  {Element} element
 *         Element to check
 *
 * @param  {string} classToCheck
 *         Class name to check for
 *
 * @return {boolean}
 *         Will be `true` if the element has a class, `false` otherwise.
 *
 * @throws {Error}
 *         Throws an error if `classToCheck` has white space.
 */function hasClass(e,t){throwIfWhitespace(t);return e.classList.contains(t)}
/**
 * Add a class name to an element.
 *
 * @param  {Element} element
 *         Element to add class name to.
 *
 * @param  {...string} classesToAdd
 *         One or more class name to add.
 *
 * @return {Element}
 *         The DOM element with the added class name.
 */function addClass(e,...t){e.classList.add(...t.reduce(((e,t)=>e.concat(t.split(/\s+/))),[]));return e}
/**
 * Remove a class name from an element.
 *
 * @param  {Element} element
 *         Element to remove a class name from.
 *
 * @param  {...string} classesToRemove
 *         One or more class name to remove.
 *
 * @return {Element}
 *         The DOM element with class name removed.
 */function removeClass(e,...t){if(!e){B.warn("removeClass was called with an element that doesn't exist");return null}e.classList.remove(...t.reduce(((e,t)=>e.concat(t.split(/\s+/))),[]));return e}
/**
 * The callback definition for toggleClass.
 *
 * @callback PredicateCallback
 * @param    {Element} element
 *           The DOM element of the Component.
 *
 * @param    {string} classToToggle
 *           The `className` that wants to be toggled
 *
 * @return   {boolean|undefined}
 *           If `true` is returned, the `classToToggle` will be added to the
 *           `element`, but not removed. If `false`, the `classToToggle` will be removed from
 *           the `element`, but not added. If `undefined`, the callback will be ignored.
 *
 */
/**
 * Adds or removes a class name to/from an element depending on an optional
 * condition or the presence/absence of the class name.
 *
 * @param  {Element} element
 *         The element to toggle a class name on.
 *
 * @param  {string} classToToggle
 *         The class that should be toggled.
 *
 * @param  {boolean|PredicateCallback} [predicate]
 *         See the return value for {@link module:dom~PredicateCallback}
 *
 * @return {Element}
 *         The element with a class that has been toggled.
 */function toggleClass(e,t,s){typeof s==="function"&&(s=s(e,t));typeof s!=="boolean"&&(s=void 0);t.split(/\s+/).forEach((t=>e.classList.toggle(t,s)));return e}
/**
 * Apply attributes to an HTML element.
 *
 * @param {Element} el
 *        Element to add attributes to.
 *
 * @param {Object} [attributes]
 *        Attributes to be applied.
 */function setAttributes(e,t){Object.getOwnPropertyNames(t).forEach((function(s){const i=t[s];i===null||typeof i==="undefined"||i===false?e.removeAttribute(s):e.setAttribute(s,i===true?"":i)}))}
/**
 * Get an element's attribute values, as defined on the HTML tag.
 *
 * Attributes are not the same as properties. They're defined on the tag
 * or with setAttribute.
 *
 * @param  {Element} tag
 *         Element from which to get tag attributes.
 *
 * @return {Object}
 *         All attributes of the element. Boolean attributes will be `true` or
 *         `false`, others will be strings.
 */function getAttributes(e){const t={};const s=["autoplay","controls","playsinline","loop","muted","default","defaultMuted"];if(e&&e.attributes&&e.attributes.length>0){const i=e.attributes;for(let e=i.length-1;e>=0;e--){const n=i[e].name;
/** @type {boolean|string} */let r=i[e].value;s.includes(n)&&(r=r!==null);t[n]=r}}return t}
/**
 * Get the value of an element's attribute.
 *
 * @param {Element} el
 *        A DOM element.
 *
 * @param {string} attribute
 *        Attribute to get the value of.
 *
 * @return {string}
 *         The value of the attribute.
 */function getAttribute(e,t){return e.getAttribute(t)}
/**
 * Set the value of an element's attribute.
 *
 * @param {Element} el
 *        A DOM element.
 *
 * @param {string} attribute
 *        Attribute to set.
 *
 * @param {string} value
 *        Value to set the attribute to.
 */function setAttribute(e,t,s){e.setAttribute(t,s)}
/**
 * Remove an element's attribute.
 *
 * @param {Element} el
 *        A DOM element.
 *
 * @param {string} attribute
 *        Attribute to remove.
 */function removeAttribute(e,t){e.removeAttribute(t)}function blockTextSelection(){t.body.focus();t.onselectstart=function(){return false}}function unblockTextSelection(){t.onselectstart=function(){return true}}
/**
 * Identical to the native `getBoundingClientRect` function, but ensures that
 * the method is supported at all (it is in all browsers we claim to support)
 * and that the element is in the DOM before continuing.
 *
 * This wrapper function also shims properties which are not provided by some
 * older browsers (namely, IE8).
 *
 * Additionally, some browsers do not support adding properties to a
 * `ClientRect`/`DOMRect` object; so, we shallow-copy it with the standard
 * properties (except `x` and `y` which are not widely supported). This helps
 * avoid implementations where keys are non-enumerable.
 *
 * @param  {Element} el
 *         Element whose `ClientRect` we want to calculate.
 *
 * @return {Object|undefined}
 *         Always returns a plain object - or `undefined` if it cannot.
 */function getBoundingClientRect(e){if(e&&e.getBoundingClientRect&&e.parentNode){const t=e.getBoundingClientRect();const s={};["bottom","height","left","right","top","width"].forEach((e=>{t[e]!==void 0&&(s[e]=t[e])}));s.height||(s.height=parseFloat(computedStyle(e,"height")));s.width||(s.width=parseFloat(computedStyle(e,"width")));return s}}
/**
 * Represents the position of a DOM element on the page.
 *
 * @typedef  {Object} module:dom~Position
 *
 * @property {number} left
 *           Pixels to the left.
 *
 * @property {number} top
 *           Pixels from the top.
 */
/**
 * Get the position of an element in the DOM.
 *
 * Uses `getBoundingClientRect` technique from John Resig.
 *
 * @see http://ejohn.org/blog/getboundingclientrect-is-awesome/
 *
 * @param  {Element} el
 *         Element from which to get offset.
 *
 * @return {module:dom~Position}
 *         The position of the element that was passed in.
 */function findPosition(e){if(!e||e&&!e.offsetParent)return{left:0,top:0,width:0,height:0};const s=e.offsetWidth;const i=e.offsetHeight;let n=0;let r=0;while(e.offsetParent&&e!==t[D.fullscreenElement]){n+=e.offsetLeft;r+=e.offsetTop;e=e.offsetParent}return{left:n,top:r,width:s,height:i}}
/**
 * Represents x and y coordinates for a DOM element or mouse pointer.
 *
 * @typedef  {Object} module:dom~Coordinates
 *
 * @property {number} x
 *           x coordinate in pixels
 *
 * @property {number} y
 *           y coordinate in pixels
 */
/**
 * Get the pointer position within an element.
 *
 * The base on the coordinates are the bottom left of the element.
 *
 * @param  {Element} el
 *         Element on which to get the pointer position on.
 *
 * @param  {Event} event
 *         Event object.
 *
 * @return {module:dom~Coordinates}
 *         A coordinates object corresponding to the mouse position.
 *
 */function getPointerPosition(t,s){const i={x:0,y:0};if(le){let s=t;while(s&&s.nodeName.toLowerCase()!=="html"){const t=computedStyle(s,"transform");if(/^matrix/.test(t)){const e=t.slice(7,-1).split(/,\s/).map(Number);i.x+=e[4];i.y+=e[5]}else if(/^matrix3d/.test(t)){const e=t.slice(9,-1).split(/,\s/).map(Number);i.x+=e[12];i.y+=e[13]}if(s.assignedSlot&&s.assignedSlot.parentElement&&e.WebKitCSSMatrix){const t=e.getComputedStyle(s.assignedSlot.parentElement).transform;const n=new e.WebKitCSSMatrix(t);i.x+=n.m41;i.y+=n.m42}s=s.parentNode||s.host}}const n={};const r=findPosition(s.target);const a=findPosition(t);const o=a.width;const l=a.height;let d=s.offsetY-(a.top-r.top);let h=s.offsetX-(a.left-r.left);if(s.changedTouches){h=s.changedTouches[0].pageX-a.left;d=s.changedTouches[0].pageY+a.top;if(le){h-=i.x;d-=i.y}}n.y=1-Math.max(0,Math.min(1,d/l));n.x=Math.max(0,Math.min(1,h/o));return n}
/**
 * Determines, via duck typing, whether or not a value is a text node.
 *
 * @param  {*} value
 *         Check if this value is a text node.
 *
 * @return {boolean}
 *         Will be `true` if the value is a text node, `false` otherwise.
 */function isTextNode(e){return isObject(e)&&e.nodeType===3}
/**
 * Empties the contents of an element.
 *
 * @param  {Element} el
 *         The element to empty children from
 *
 * @return {Element}
 *         The element with no children
 */function emptyEl(e){while(e.firstChild)e.removeChild(e.firstChild);return e}
/**
 * This is a mixed value that describes content to be injected into the DOM
 * via some method. It can be of the following types:
 *
 * Type       | Description
 * -----------|-------------
 * `string`   | The value will be normalized into a text node.
 * `Element`  | The value will be accepted as-is.
 * `Text`     | A TextNode. The value will be accepted as-is.
 * `Array`    | A one-dimensional array of strings, elements, text nodes, or functions. These functions should return a string, element, or text node (any other return value, like an array, will be ignored).
 * `Function` | A function, which is expected to return a string, element, text node, or array - any of the other possible values described above. This means that a content descriptor could be a function that returns an array of functions, but those second-level functions must return strings, elements, or text nodes.
 *
 * @typedef {string|Element|Text|Array|Function} ContentDescriptor
 */
/**
 * Normalizes content for eventual insertion into the DOM.
 *
 * This allows a wide range of content definition methods, but helps protect
 * from falling into the trap of simply writing to `innerHTML`, which could
 * be an XSS concern.
 *
 * The content for an element can be passed in multiple types and
 * combinations, whose behavior is as follows:
 *
 * @param {ContentDescriptor} content
 *        A content descriptor value.
 *
 * @return {Array}
 *         All of the content that was passed in, normalized to an array of
 *         elements or text nodes.
 */function normalizeContent(e){typeof e==="function"&&(e=e());return(Array.isArray(e)?e:[e]).map((e=>{typeof e==="function"&&(e=e());return isEl(e)||isTextNode(e)?e:typeof e==="string"&&/\S/.test(e)?t.createTextNode(e):void 0})).filter((e=>e))}
/**
 * Normalizes and appends content to an element.
 *
 * @param  {Element} el
 *         Element to append normalized content to.
 *
 * @param {ContentDescriptor} content
 *        A content descriptor value.
 *
 * @return {Element}
 *         The element with appended normalized content.
 */function appendContent(e,t){normalizeContent(t).forEach((t=>e.appendChild(t)));return e}
/**
 * Normalizes and inserts content into an element; this is identical to
 * `appendContent()`, except it empties the element first.
 *
 * @param {Element} el
 *        Element to insert normalized content into.
 *
 * @param {ContentDescriptor} content
 *        A content descriptor value.
 *
 * @return {Element}
 *         The element with inserted normalized content.
 */function insertContent(e,t){return appendContent(emptyEl(e),t)}
/**
 * Check if an event was a single left click.
 *
 * @param  {MouseEvent} event
 *         Event object.
 *
 * @return {boolean}
 *         Will be `true` if a single left click, `false` otherwise.
 */function isSingleLeftClick(e){return e.button===void 0&&e.buttons===void 0||(e.button===0&&e.buttons===void 0||(e.type==="mouseup"&&e.button===0&&e.buttons===0||(e.type==="mousedown"&&e.button===0&&e.buttons===0||e.button===0&&e.buttons===1)))}
/**
 * Finds a single DOM element matching `selector` within the optional
 * `context` of another DOM element (defaulting to `document`).
 *
 * @param  {string} selector
 *         A valid CSS selector, which will be passed to `querySelector`.
 *
 * @param  {Element|String} [context=document]
 *         A DOM element within which to query. Can also be a selector
 *         string in which case the first matching element will be used
 *         as context. If missing (or no element matches selector), falls
 *         back to `document`.
 *
 * @return {Element|null}
 *         The element that was found or null.
 */const ce=createQuerier("querySelector");
/**
 * Finds a all DOM elements matching `selector` within the optional
 * `context` of another DOM element (defaulting to `document`).
 *
 * @param  {string} selector
 *         A valid CSS selector, which will be passed to `querySelectorAll`.
 *
 * @param  {Element|String} [context=document]
 *         A DOM element within which to query. Can also be a selector
 *         string in which case the first matching element will be used
 *         as context. If missing (or no element matches selector), falls
 *         back to `document`.
 *
 * @return {NodeList}
 *         A element list of elements that were found. Will be empty if none
 *         were found.
 *
 */const ue=createQuerier("querySelectorAll");
/**
 * A safe getComputedStyle.
 *
 * This is needed because in Firefox, if the player is loaded in an iframe with
 * `display:none`, then `getComputedStyle` returns `null`, so, we do a
 * null-check to make sure that the player doesn't break in these cases.
 *
 * @param    {Element} el
 *           The element you want the computed style of
 *
 * @param    {string} prop
 *           The property name you want
 *
 * @see      https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */function computedStyle(t,s){if(!t||!s)return"";if(typeof e.getComputedStyle==="function"){let i;try{i=e.getComputedStyle(t)}catch(e){return""}return i?i.getPropertyValue(s)||i[s]:""}return""}
/**
 * Copy document style sheets to another window.
 *
 * @param    {Window} win
 *           The window element you want to copy the document style sheets to.
 *
 */function copyStyleSheetsToWindow(e){[...t.styleSheets].forEach((s=>{try{const i=[...s.cssRules].map((e=>e.cssText)).join("");const n=t.createElement("style");n.textContent=i;e.document.head.appendChild(n)}catch(i){const n=t.createElement("link");n.rel="stylesheet";n.type=s.type;n.media=s.media.mediaText;n.href=s.href;e.document.head.appendChild(n)}}))}var pe=Object.freeze({__proto__:null,isReal:isReal,isEl:isEl,isInFrame:isInFrame,createEl:createEl,textContent:textContent,prependTo:prependTo,hasClass:hasClass,addClass:addClass,removeClass:removeClass,toggleClass:toggleClass,setAttributes:setAttributes,getAttributes:getAttributes,getAttribute:getAttribute,setAttribute:setAttribute,removeAttribute:removeAttribute,blockTextSelection:blockTextSelection,unblockTextSelection:unblockTextSelection,getBoundingClientRect:getBoundingClientRect,findPosition:findPosition,getPointerPosition:getPointerPosition,isTextNode:isTextNode,emptyEl:emptyEl,normalizeContent:normalizeContent,appendContent:appendContent,insertContent:insertContent,isSingleLeftClick:isSingleLeftClick,$:ce,$$:ue,computedStyle:computedStyle,copyStyleSheetsToWindow:copyStyleSheetsToWindow});let me=false;let fe;const autoSetup=function(){if(fe.options.autoSetup===false)return;const e=Array.prototype.slice.call(t.getElementsByTagName("video"));const s=Array.prototype.slice.call(t.getElementsByTagName("audio"));const i=Array.prototype.slice.call(t.getElementsByTagName("video-js"));const n=e.concat(s,i);if(n&&n.length>0)for(let e=0,t=n.length;e<t;e++){const t=n[e];if(!t||!t.getAttribute){autoSetupTimeout(1);break}if(t.player===void 0){const e=t.getAttribute("data-setup");e!==null&&fe(t)}}else me||autoSetupTimeout(1)};
/**
 * Wait until the page is loaded before running autoSetup. This will be called in
 * autoSetup if `hasLoaded` returns false.
 *
 * @param {number} wait
 *        How long to wait in ms
 *
 * @param {module:videojs} [vjs]
 *        The videojs library function
 */function autoSetupTimeout(t,s){if(isReal()){s&&(fe=s);e.setTimeout(autoSetup,t)}}function setWindowLoaded(){me=true;e.removeEventListener("load",setWindowLoaded)}isReal()&&(t.readyState==="complete"?setWindowLoaded():e.addEventListener("load",setWindowLoaded))
/**
 * Create a DOM style element given a className for it.
 *
 * @param {string} className
 *        The className to add to the created style element.
 *
 * @return {Element}
 *         The element that was created.
 */;const createStyleElement=function(e){const s=t.createElement("style");s.className=e;return s};
/**
 * Add text to a DOM element.
 *
 * @param {Element} el
 *        The Element to add text content to.
 *
 * @param {string} content
 *        The text to add to the element.
 */const setTextContent=function(e,t){e.styleSheet?e.styleSheet.cssText=t:e.textContent=t};
/**
 * Element Data Store.
 *
 * Allows for binding data to an element without putting it directly on the
 * element. Ex. Event listeners are stored here.
 * (also from jsninja.com, slightly modified and updated for closure compiler)
 *
 * @type {Object}
 * @private
 */var ge=new WeakMap;const ye=3;
/**
 * Unique ID for an element or function
 *
 * @type {Number}
 */let _e=ye;function newGUID(){return _e++}
/**
 * Clean up the listener cache and dispatchers
 *
 * @param {Element|Object} elem
 *        Element to clean up
 *
 * @param {string} type
 *        Type of event to clean up
 */function _cleanUpEvents(e,t){if(!ge.has(e))return;const s=ge.get(e);if(s.handlers[t].length===0){delete s.handlers[t];e.removeEventListener?e.removeEventListener(t,s.dispatcher,false):e.detachEvent&&e.detachEvent("on"+t,s.dispatcher)}if(Object.getOwnPropertyNames(s.handlers).length<=0){delete s.handlers;delete s.dispatcher;delete s.disabled}Object.getOwnPropertyNames(s).length===0&&ge.delete(e)}
/**
 * Loops through an array of event types and calls the requested method for each type.
 *
 * @param {Function} fn
 *        The event method we want to use.
 *
 * @param {Element|Object} elem
 *        Element or object to bind listeners to
 *
 * @param {string[]} types
 *        Type of event to bind to.
 *
 * @param {Function} callback
 *        Event listener.
 */function _handleMultipleEvents(e,t,s,i){s.forEach((function(s){e(t,s,i)}))}
/**
 * Fix a native event to have standard property values
 *
 * @param {Object} event
 *        Event object to fix.
 *
 * @return {Object}
 *         Fixed event object.
 */function fixEvent(s){if(s.fixed_)return s;function returnTrue(){return true}function returnFalse(){return false}if(!s||!s.isPropagationStopped||!s.isImmediatePropagationStopped){const i=s||e.event;s={};const n=["layerX","layerY","keyLocation","path","webkitMovementX","webkitMovementY","mozPressure","mozInputSource"];for(const e in i)n.includes(e)||e==="returnValue"&&i.preventDefault||(s[e]=i[e]);s.target||(s.target=s.srcElement||t);s.relatedTarget||(s.relatedTarget=s.fromElement===s.target?s.toElement:s.fromElement);s.preventDefault=function(){i.preventDefault&&i.preventDefault();s.returnValue=false;i.returnValue=false;s.defaultPrevented=true};s.defaultPrevented=false;s.stopPropagation=function(){i.stopPropagation&&i.stopPropagation();s.cancelBubble=true;i.cancelBubble=true;s.isPropagationStopped=returnTrue};s.isPropagationStopped=returnFalse;s.stopImmediatePropagation=function(){i.stopImmediatePropagation&&i.stopImmediatePropagation();s.isImmediatePropagationStopped=returnTrue;s.stopPropagation()};s.isImmediatePropagationStopped=returnFalse;if(s.clientX!==null&&s.clientX!==void 0){const e=t.documentElement;const i=t.body;s.pageX=s.clientX+(e&&e.scrollLeft||i&&i.scrollLeft||0)-(e&&e.clientLeft||i&&i.clientLeft||0);s.pageY=s.clientY+(e&&e.scrollTop||i&&i.scrollTop||0)-(e&&e.clientTop||i&&i.clientTop||0)}s.which=s.charCode||s.keyCode;s.button!==null&&s.button!==void 0&&(s.button=s.button&1?0:s.button&4?1:s.button&2?2:0)}s.fixed_=true;return s}let ve;const supportsPassive=function(){if(typeof ve!=="boolean"){ve=false;try{const t=Object.defineProperty({},"passive",{get(){ve=true}});e.addEventListener("test",null,t);e.removeEventListener("test",null,t)}catch(e){}}return ve};const Te=["touchstart","touchmove"];
/**
 * Add an event listener to element
 * It stores the handler function in a separate cache object
 * and adds a generic handler to the element's event,
 * along with a unique id (guid) to the element.
 *
 * @param {Element|Object} elem
 *        Element or object to bind listeners to
 *
 * @param {string|string[]} type
 *        Type of event to bind to.
 *
 * @param {Function} fn
 *        Event listener.
 */function on(e,t,s){if(Array.isArray(t))return _handleMultipleEvents(on,e,t,s);ge.has(e)||ge.set(e,{});const i=ge.get(e);i.handlers||(i.handlers={});i.handlers[t]||(i.handlers[t]=[]);s.guid||(s.guid=newGUID());i.handlers[t].push(s);if(!i.dispatcher){i.disabled=false;i.dispatcher=function(t,s){if(i.disabled)return;t=fixEvent(t);const n=i.handlers[t.type];if(n){const i=n.slice(0);for(let n=0,r=i.length;n<r;n++){if(t.isImmediatePropagationStopped())break;try{i[n].call(e,t,s)}catch(e){B.error(e)}}}}}if(i.handlers[t].length===1)if(e.addEventListener){let s=false;supportsPassive()&&Te.indexOf(t)>-1&&(s={passive:true});e.addEventListener(t,i.dispatcher,s)}else e.attachEvent&&e.attachEvent("on"+t,i.dispatcher)}
/**
 * Removes event listeners from an element
 *
 * @param {Element|Object} elem
 *        Object to remove listeners from.
 *
 * @param {string|string[]} [type]
 *        Type of listener to remove. Don't include to remove all events from element.
 *
 * @param {Function} [fn]
 *        Specific listener to remove. Don't include to remove listeners for an event
 *        type.
 */function off(e,t,s){if(!ge.has(e))return;const i=ge.get(e);if(!i.handlers)return;if(Array.isArray(t))return _handleMultipleEvents(off,e,t,s);const removeType=function(e,t){i.handlers[t]=[];_cleanUpEvents(e,t)};if(t===void 0){for(const t in i.handlers)Object.prototype.hasOwnProperty.call(i.handlers||{},t)&&removeType(e,t);return}const n=i.handlers[t];if(n)if(s){if(s.guid)for(let e=0;e<n.length;e++)n[e].guid===s.guid&&n.splice(e--,1);_cleanUpEvents(e,t)}else removeType(e,t)}
/**
 * Trigger an event for an element
 *
 * @param {Element|Object} elem
 *        Element to trigger an event on
 *
 * @param {EventTarget~Event|string} event
 *        A string (the type) or an event object with a type attribute
 *
 * @param {Object} [hash]
 *        data hash to pass along with the event
 *
 * @return {boolean|undefined}
 *         Returns the opposite of `defaultPrevented` if default was
 *         prevented. Otherwise, returns `undefined`
 */function trigger(e,t,s){const i=ge.has(e)?ge.get(e):{};const n=e.parentNode||e.ownerDocument;typeof t==="string"?t={type:t,target:e}:t.target||(t.target=e);t=fixEvent(t);i.dispatcher&&i.dispatcher.call(e,t,s);if(n&&!t.isPropagationStopped()&&t.bubbles===true)trigger.call(null,n,t,s);else if(!n&&!t.defaultPrevented&&t.target&&t.target[t.type]){ge.has(t.target)||ge.set(t.target,{});const e=ge.get(t.target);if(t.target[t.type]){e.disabled=true;typeof t.target[t.type]==="function"&&t.target[t.type]();e.disabled=false}}return!t.defaultPrevented}
/**
 * Trigger a listener only once for an event.
 *
 * @param {Element|Object} elem
 *        Element or object to bind to.
 *
 * @param {string|string[]} type
 *        Name/type of event
 *
 * @param {Event~EventListener} fn
 *        Event listener function
 */function one(e,t,s){if(Array.isArray(t))return _handleMultipleEvents(one,e,t,s);const func=function(){off(e,t,func);s.apply(this,arguments)};func.guid=s.guid=s.guid||newGUID();on(e,t,func)}
/**
 * Trigger a listener only once and then turn if off for all
 * configured events
 *
 * @param {Element|Object} elem
 *        Element or object to bind to.
 *
 * @param {string|string[]} type
 *        Name/type of event
 *
 * @param {Event~EventListener} fn
 *        Event listener function
 */function any(e,t,s){const func=function(){off(e,t,func);s.apply(this,arguments)};func.guid=s.guid=s.guid||newGUID();on(e,t,func)}var be=Object.freeze({__proto__:null,fixEvent:fixEvent,on:on,off:off,trigger:trigger,one:one,any:any});const Se=30;
/**
 * A private, internal-only function for changing the context of a function.
 *
 * It also stores a unique id on the function so it can be easily removed from
 * events.
 *
 * @private
 * @function
 * @param    {*} context
 *           The object to bind as scope.
 *
 * @param    {Function} fn
 *           The function to be bound to a scope.
 *
 * @param    {number} [uid]
 *           An optional unique ID for the function to be set
 *
 * @return   {Function}
 *           The new function that will be bound into the context given
 */const bind_=function(e,t,s){t.guid||(t.guid=newGUID());const i=t.bind(e);i.guid=s?s+"_"+t.guid:t.guid;return i};
/**
 * Wraps the given function, `fn`, with a new function that only invokes `fn`
 * at most once per every `wait` milliseconds.
 *
 * @function
 * @param    {Function} fn
 *           The function to be throttled.
 *
 * @param    {number}   wait
 *           The number of milliseconds by which to throttle.
 *
 * @return   {Function}
 */const throttle=function(t,s){let i=e.performance.now();const throttled=function(...n){const r=e.performance.now();if(r-i>=s){t(...n);i=r}};return throttled};
/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked.
 *
 * Inspired by lodash and underscore implementations.
 *
 * @function
 * @param    {Function} func
 *           The function to wrap with debounce behavior.
 *
 * @param    {number} wait
 *           The number of milliseconds to wait after the last invocation.
 *
 * @param    {boolean} [immediate]
 *           Whether or not to invoke the function immediately upon creation.
 *
 * @param    {Object} [context=window]
 *           The "context" in which the debounced function should debounce. For
 *           example, if this function should be tied to a Video.js player,
 *           the player can be passed here. Alternatively, defaults to the
 *           global `window` object.
 *
 * @return   {Function}
 *           A debounced function.
 */const debounce$1=function(t,s,i,n=e){let r;const cancel=()=>{n.clearTimeout(r);r=null};const debounced=function(){const e=this;const a=arguments;let later=function(){r=null;later=null;i||t.apply(e,a)};!r&&i&&t.apply(e,a);n.clearTimeout(r);r=n.setTimeout(later,s)};debounced.cancel=cancel;return debounced};var Ce=Object.freeze({__proto__:null,UPDATE_REFRESH_INTERVAL:Se,bind_:bind_,throttle:throttle,debounce:debounce$1});let ke;class EventTarget$2{
/**
   * Adds an `event listener` to an instance of an `EventTarget`. An `event listener` is a
   * function that will get called when an event with a certain name gets triggered.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} fn
   *        The function to call with `EventTarget`s
   */
on(e,t){const s=this.addEventListener;this.addEventListener=()=>{};on(this,e,t);this.addEventListener=s}
/**
   * Removes an `event listener` for a specific event from an instance of `EventTarget`.
   * This makes it so that the `event listener` will no longer get called when the
   * named event happens.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} fn
   *        The function to remove.
   */off(e,t){off(this,e,t)}
/**
   * This function will add an `event listener` that gets triggered only once. After the
   * first trigger it will get removed. This is like adding an `event listener`
   * with {@link EventTarget#on} that calls {@link EventTarget#off} on itself.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} fn
   *        The function to be called once for each event name.
   */one(e,t){const s=this.addEventListener;this.addEventListener=()=>{};one(this,e,t);this.addEventListener=s}
/**
   * This function will add an `event listener` that gets triggered only once and is
   * removed from all events. This is like adding an array of `event listener`s
   * with {@link EventTarget#on} that calls {@link EventTarget#off} on all events the
   * first time it is triggered.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} fn
   *        The function to be called once for each event name.
   */any(e,t){const s=this.addEventListener;this.addEventListener=()=>{};any(this,e,t);this.addEventListener=s}
/**
   * This function causes an event to happen. This will then cause any `event listeners`
   * that are waiting for that event, to get called. If there are no `event listeners`
   * for an event then nothing will happen.
   *
   * If the name of the `Event` that is being triggered is in `EventTarget.allowedEvents_`.
   * Trigger will also call the `on` + `uppercaseEventName` function.
   *
   * Example:
   * 'click' is in `EventTarget.allowedEvents_`, so, trigger will attempt to call
   * `onClick` if it exists.
   *
   * @param {string|EventTarget~Event|Object} event
   *        The name of the event, an `Event`, or an object with a key of type set to
   *        an event name.
   */trigger(e){const t=e.type||e;typeof e==="string"&&(e={type:t});e=fixEvent(e);this.allowedEvents_[t]&&this["on"+t]&&this["on"+t](e);trigger(this,e)}queueTrigger(t){ke||(ke=new Map);const s=t.type||t;let i=ke.get(this);if(!i){i=new Map;ke.set(this,i)}const n=i.get(s);i.delete(s);e.clearTimeout(n);const r=e.setTimeout((()=>{i.delete(s);if(i.size===0){i=null;ke.delete(this)}this.trigger(t)}),0);i.set(s,r)}}
/**
 * A Custom DOM event.
 *
 * @typedef {CustomEvent} Event
 * @see [Properties]{@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent}
 */
/**
 * All event listeners should follow the following format.
 *
 * @callback EventListener
 * @this {EventTarget}
 *
 * @param {Event} event
 *        the event that triggered this function
 *
 * @param {Object} [hash]
 *        hash of data sent during the event
 */EventTarget$2.prototype.allowedEvents_={};EventTarget$2.prototype.addEventListener=EventTarget$2.prototype.on;EventTarget$2.prototype.removeEventListener=EventTarget$2.prototype.off;EventTarget$2.prototype.dispatchEvent=EventTarget$2.prototype.trigger;const objName=e=>typeof e.name==="function"?e.name():typeof e.name==="string"?e.name:e.name_?e.name_:e.constructor&&e.constructor.name?e.constructor.name:typeof e;
/**
 * Returns whether or not an object has had the evented mixin applied.
 *
 * @param  {Object} object
 *         An object to test.
 *
 * @return {boolean}
 *         Whether or not the object appears to be evented.
 */const isEvented=e=>e instanceof EventTarget$2||!!e.eventBusEl_&&["on","one","off","trigger"].every((t=>typeof e[t]==="function"))
/**
 * Adds a callback to run after the evented mixin applied.
 *
 * @param  {Object} target
 *         An object to Add
 * @param  {Function} callback
 *         The callback to run.
 */;const addEventedCallback=(e,t)=>{if(isEvented(e))t();else{e.eventedCallbacks||(e.eventedCallbacks=[]);e.eventedCallbacks.push(t)}};
/**
 * Whether a value is a valid event type - non-empty string or array.
 *
 * @private
 * @param  {string|Array} type
 *         The type value to test.
 *
 * @return {boolean}
 *         Whether or not the type is a valid event type.
 */const isValidEventType=e=>typeof e==="string"&&/\S/.test(e)||Array.isArray(e)&&!!e.length
/**
 * Validates a value to determine if it is a valid event target. Throws if not.
 *
 * @private
 * @throws {Error}
 *         If the target does not appear to be a valid event target.
 *
 * @param  {Object} target
 *         The object to test.
 *
 * @param  {Object} obj
 *         The evented object we are validating for
 *
 * @param  {string} fnName
 *         The name of the evented mixin function that called this.
 */;const validateTarget=(e,t,s)=>{if(!e||!e.nodeName&&!isEvented(e))throw new Error(`Invalid target for ${objName(t)}#${s}; must be a DOM node or evented object.`)};
/**
 * Validates a value to determine if it is a valid event target. Throws if not.
 *
 * @private
 * @throws {Error}
 *         If the type does not appear to be a valid event type.
 *
 * @param  {string|Array} type
 *         The type to test.
 *
 * @param  {Object} obj
*         The evented object we are validating for
 *
 * @param  {string} fnName
 *         The name of the evented mixin function that called this.
 */const validateEventType=(e,t,s)=>{if(!isValidEventType(e))throw new Error(`Invalid event type for ${objName(t)}#${s}; must be a non-empty string or array.`)};
/**
 * Validates a value to determine if it is a valid listener. Throws if not.
 *
 * @private
 * @throws {Error}
 *         If the listener is not a function.
 *
 * @param  {Function} listener
 *         The listener to test.
 *
 * @param  {Object} obj
 *         The evented object we are validating for
 *
 * @param  {string} fnName
 *         The name of the evented mixin function that called this.
 */const validateListener=(e,t,s)=>{if(typeof e!=="function")throw new Error(`Invalid listener for ${objName(t)}#${s}; must be a function.`)};
/**
 * Takes an array of arguments given to `on()` or `one()`, validates them, and
 * normalizes them into an object.
 *
 * @private
 * @param  {Object} self
 *         The evented object on which `on()` or `one()` was called. This
 *         object will be bound as the `this` value for the listener.
 *
 * @param  {Array} args
 *         An array of arguments passed to `on()` or `one()`.
 *
 * @param  {string} fnName
 *         The name of the evented mixin function that called this.
 *
 * @return {Object}
 *         An object containing useful values for `on()` or `one()` calls.
 */const normalizeListenArgs=(e,t,s)=>{const i=t.length<3||t[0]===e||t[0]===e.eventBusEl_;let n;let r;let a;if(i){n=e.eventBusEl_;t.length>=3&&t.shift();[r,a]=t}else{n=t[0];r=t[1];a=t[2]}validateTarget(n,e,s);validateEventType(r,e,s);validateListener(a,e,s);a=bind_(e,a);return{isTargetingSelf:i,target:n,type:r,listener:a}};
/**
 * Adds the listener to the event type(s) on the target, normalizing for
 * the type of target.
 *
 * @private
 * @param  {Element|Object} target
 *         A DOM node or evented object.
 *
 * @param  {string} method
 *         The event binding method to use ("on" or "one").
 *
 * @param  {string|Array} type
 *         One or more event type(s).
 *
 * @param  {Function} listener
 *         A listener function.
 */const listen=(e,t,s,i)=>{validateTarget(e,e,t);e.nodeName?be[t](e,s,i):e[t](s,i)};const we={
/**
   * Add a listener to an event (or events) on this object or another evented
   * object.
   *
   * @param  {string|Array|Element|Object} targetOrType
   *         If this is a string or array, it represents the event type(s)
   *         that will trigger the listener.
   *
   *         Another evented object can be passed here instead, which will
   *         cause the listener to listen for events on _that_ object.
   *
   *         In either case, the listener's `this` value will be bound to
   *         this object.
   *
   * @param  {string|Array|Function} typeOrListener
   *         If the first argument was a string or array, this should be the
   *         listener function. Otherwise, this is a string or array of event
   *         type(s).
   *
   * @param  {Function} [listener]
   *         If the first argument was another evented object, this will be
   *         the listener function.
   */
on(...e){const{isTargetingSelf:t,target:s,type:i,listener:n}=normalizeListenArgs(this,e,"on");listen(s,"on",i,n);if(!t){const removeListenerOnDispose=()=>this.off(s,i,n);removeListenerOnDispose.guid=n.guid;const removeRemoverOnTargetDispose=()=>this.off("dispose",removeListenerOnDispose);removeRemoverOnTargetDispose.guid=n.guid;listen(this,"on","dispose",removeListenerOnDispose);listen(s,"on","dispose",removeRemoverOnTargetDispose)}},
/**
   * Add a listener to an event (or events) on this object or another evented
   * object. The listener will be called once per event and then removed.
   *
   * @param  {string|Array|Element|Object} targetOrType
   *         If this is a string or array, it represents the event type(s)
   *         that will trigger the listener.
   *
   *         Another evented object can be passed here instead, which will
   *         cause the listener to listen for events on _that_ object.
   *
   *         In either case, the listener's `this` value will be bound to
   *         this object.
   *
   * @param  {string|Array|Function} typeOrListener
   *         If the first argument was a string or array, this should be the
   *         listener function. Otherwise, this is a string or array of event
   *         type(s).
   *
   * @param  {Function} [listener]
   *         If the first argument was another evented object, this will be
   *         the listener function.
   */
one(...e){const{isTargetingSelf:t,target:s,type:i,listener:n}=normalizeListenArgs(this,e,"one");if(t)listen(s,"one",i,n);else{const wrapper=(...e)=>{this.off(s,i,wrapper);n.apply(null,e)};wrapper.guid=n.guid;listen(s,"one",i,wrapper)}},
/**
   * Add a listener to an event (or events) on this object or another evented
   * object. The listener will only be called once for the first event that is triggered
   * then removed.
   *
   * @param  {string|Array|Element|Object} targetOrType
   *         If this is a string or array, it represents the event type(s)
   *         that will trigger the listener.
   *
   *         Another evented object can be passed here instead, which will
   *         cause the listener to listen for events on _that_ object.
   *
   *         In either case, the listener's `this` value will be bound to
   *         this object.
   *
   * @param  {string|Array|Function} typeOrListener
   *         If the first argument was a string or array, this should be the
   *         listener function. Otherwise, this is a string or array of event
   *         type(s).
   *
   * @param  {Function} [listener]
   *         If the first argument was another evented object, this will be
   *         the listener function.
   */
any(...e){const{isTargetingSelf:t,target:s,type:i,listener:n}=normalizeListenArgs(this,e,"any");if(t)listen(s,"any",i,n);else{const wrapper=(...e)=>{this.off(s,i,wrapper);n.apply(null,e)};wrapper.guid=n.guid;listen(s,"any",i,wrapper)}},
/**
   * Removes listener(s) from event(s) on an evented object.
   *
   * @param  {string|Array|Element|Object} [targetOrType]
   *         If this is a string or array, it represents the event type(s).
   *
   *         Another evented object can be passed here instead, in which case
   *         ALL 3 arguments are _required_.
   *
   * @param  {string|Array|Function} [typeOrListener]
   *         If the first argument was a string or array, this may be the
   *         listener function. Otherwise, this is a string or array of event
   *         type(s).
   *
   * @param  {Function} [listener]
   *         If the first argument was another evented object, this will be
   *         the listener function; otherwise, _all_ listeners bound to the
   *         event type(s) will be removed.
   */
off(e,t,s){if(!e||isValidEventType(e))off(this.eventBusEl_,e,t);else{const i=e;const n=t;validateTarget(i,this,"off");validateEventType(n,this,"off");validateListener(s,this,"off");s=bind_(this,s);this.off("dispose",s);if(i.nodeName){off(i,n,s);off(i,"dispose",s)}else if(isEvented(i)){i.off(n,s);i.off("dispose",s)}}},
/**
   * Fire an event on this evented object, causing its listeners to be called.
   *
   * @param   {string|Object} event
   *          An event type or an object with a type property.
   *
   * @param   {Object} [hash]
   *          An additional object to pass along to listeners.
   *
   * @return {boolean}
   *          Whether or not the default behavior was prevented.
   */
trigger(e,t){validateTarget(this.eventBusEl_,this,"trigger");const s=e&&typeof e!=="string"?e.type:e;if(!isValidEventType(s))throw new Error(`Invalid event type for ${objName(this)}#trigger; must be a non-empty string or object with a type key that has a non-empty value.`);return trigger(this.eventBusEl_,e,t)}};
/**
 * Applies {@link module:evented~EventedMixin|EventedMixin} to a target object.
 *
 * @param  {Object} target
 *         The object to which to add event methods.
 *
 * @param  {Object} [options={}]
 *         Options for customizing the mixin behavior.
 *
 * @param  {string} [options.eventBusKey]
 *         By default, adds a `eventBusEl_` DOM element to the target object,
 *         which is used as an event bus. If the target object already has a
 *         DOM element that should be used, pass its key here.
 *
 * @return {Object}
 *         The target object.
 */function evented(t,s={}){const{eventBusKey:i}=s;if(i){if(!t[i].nodeName)throw new Error(`The eventBusKey "${i}" does not refer to an element.`);t.eventBusEl_=t[i]}else t.eventBusEl_=createEl("span",{className:"vjs-event-bus"});Object.assign(t,we);t.eventedCallbacks&&t.eventedCallbacks.forEach((e=>{e()}));t.on("dispose",(()=>{t.off();[t,t.el_,t.eventBusEl_].forEach((function(e){e&&ge.has(e)&&ge.delete(e)}));e.setTimeout((()=>{t.eventBusEl_=null}),0)}));return t}const Ee={
/**
   * A hash containing arbitrary keys and values representing the state of
   * the object.
   *
   * @type {Object}
   */
state:{},
/**
   * Set the state of an object by mutating its
   * {@link module:stateful~StatefulMixin.state|state} object in place.
   *
   * @fires   module:stateful~StatefulMixin#statechanged
   * @param   {Object|Function} stateUpdates
   *          A new set of properties to shallow-merge into the plugin state.
   *          Can be a plain object or a function returning a plain object.
   *
   * @return {Object|undefined}
   *          An object containing changes that occurred. If no changes
   *          occurred, returns `undefined`.
   */
setState(e){typeof e==="function"&&(e=e());let t;each(e,((e,s)=>{if(this.state[s]!==e){t=t||{};t[s]={from:this.state[s],to:e}}this.state[s]=e}));t&&isEvented(this)&&
/**
       * An event triggered on an object that is both
       * {@link module:stateful|stateful} and {@link module:evented|evented}
       * indicating that its state has changed.
       *
       * @event    module:stateful~StatefulMixin#statechanged
       * @type     {Object}
       * @property {Object} changes
       *           A hash containing the properties that were changed and
       *           the values they were changed `from` and `to`.
       */
this.trigger({changes:t,type:"statechanged"});return t}};
/**
 * Applies {@link module:stateful~StatefulMixin|StatefulMixin} to a target
 * object.
 *
 * If the target object is {@link module:evented|evented} and has a
 * `handleStateChanged` method, that method will be automatically bound to the
 * `statechanged` event on itself.
 *
 * @param   {Object} target
 *          The object to be made stateful.
 *
 * @param   {Object} [defaultState]
 *          A default set of properties to populate the newly-stateful object's
 *          `state` property.
 *
 * @return {Object}
 *          Returns the `target`.
 */function stateful(e,t){Object.assign(e,Ee);e.state=Object.assign({},e.state,t);typeof e.handleStateChanged==="function"&&isEvented(e)&&e.on("statechanged",e.handleStateChanged);return e}
/**
 * Lowercase the first letter of a string.
 *
 * @param {string} string
 *        String to be lowercased
 *
 * @return {string}
 *         The string with a lowercased first letter
 */const toLowerCase=function(e){return typeof e!=="string"?e:e.replace(/./,(e=>e.toLowerCase()))};
/**
 * Uppercase the first letter of a string.
 *
 * @param {string} string
 *        String to be uppercased
 *
 * @return {string}
 *         The string with an uppercased first letter
 */const toTitleCase$1=function(e){return typeof e!=="string"?e:e.replace(/./,(e=>e.toUpperCase()))};
/**
 * Compares the TitleCase versions of the two strings for equality.
 *
 * @param {string} str1
 *        The first string to compare
 *
 * @param {string} str2
 *        The second string to compare
 *
 * @return {boolean}
 *         Whether the TitleCase versions of the strings are equal
 */const titleCaseEquals=function(e,t){return toTitleCase$1(e)===toTitleCase$1(t)};var xe=Object.freeze({__proto__:null,toLowerCase:toLowerCase,toTitleCase:toTitleCase$1,titleCaseEquals:titleCaseEquals});
/**
 * A callback to be called if and when the component is ready.
 * `this` will be the Component instance.
 *
 * @callback ReadyCallback
 * @returns  {void}
 */class Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of component options.
   *
   * @param {Object[]} [options.children]
   *        An array of children objects to initialize this component with. Children objects have
   *        a name property that will be used if more than one component of the same type needs to be
   *        added.
   *
   * @param  {string} [options.className]
   *         A class or space separated list of classes to add the component
   *
   * @param {ReadyCallback} [ready]
   *        Function that gets called when the `Component` is ready.
   */
constructor(e,t,s){!e&&this.play?this.player_=e=this:this.player_=e;this.isDisposed_=false;this.parentComponent_=null;this.options_=merge$1({},this.options_);t=this.options_=merge$1(this.options_,t);this.id_=t.id||t.el&&t.el.id;if(!this.id_){const t=e&&e.id&&e.id()||"no_player";this.id_=`${t}_component_${newGUID()}`}this.name_=t.name||null;t.el?this.el_=t.el:t.createEl!==false&&(this.el_=this.createEl());t.className&&this.el_&&t.className.split(" ").forEach((e=>this.addClass(e)));["on","off","one","any","trigger"].forEach((e=>{this[e]=void 0}));if(t.evented!==false){evented(this,{eventBusKey:this.el_?"el_":null});this.handleLanguagechange=this.handleLanguagechange.bind(this);this.on(this.player_,"languagechange",this.handleLanguagechange)}stateful(this,this.constructor.defaultState);this.children_=[];this.childIndex_={};this.childNameIndex_={};this.setTimeoutIds_=new Set;this.setIntervalIds_=new Set;this.rafIds_=new Set;this.namedRafs_=new Map;this.clearingTimersOnDispose_=false;t.initChildren!==false&&this.initChildren();this.ready(s);t.reportTouchActivity!==false&&this.enableTouchActivity()}
/**
   * Adds an `event listener` to an instance of an `EventTarget`. An `event listener` is a
   * function that will get called when an event with a certain name gets triggered.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} fn
   *        The function to call with `EventTarget`s
   */
/**
   * Removes an `event listener` for a specific event from an instance of `EventTarget`.
   * This makes it so that the `event listener` will no longer get called when the
   * named event happens.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} [fn]
   *        The function to remove. If not specified, all listeners managed by Video.js will be removed.
   */
/**
   * This function will add an `event listener` that gets triggered only once. After the
   * first trigger it will get removed. This is like adding an `event listener`
   * with {@link EventTarget#on} that calls {@link EventTarget#off} on itself.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} fn
   *        The function to be called once for each event name.
   */
/**
   * This function will add an `event listener` that gets triggered only once and is
   * removed from all events. This is like adding an array of `event listener`s
   * with {@link EventTarget#on} that calls {@link EventTarget#off} on all events the
   * first time it is triggered.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {Function} fn
   *        The function to be called once for each event name.
   */
/**
   * This function causes an event to happen. This will then cause any `event listeners`
   * that are waiting for that event, to get called. If there are no `event listeners`
   * for an event then nothing will happen.
   *
   * If the name of the `Event` that is being triggered is in `EventTarget.allowedEvents_`.
   * Trigger will also call the `on` + `uppercaseEventName` function.
   *
   * Example:
   * 'click' is in `EventTarget.allowedEvents_`, so, trigger will attempt to call
   * `onClick` if it exists.
   *
   * @param {string|Event|Object} event
   *        The name of the event, an `Event`, or an object with a key of type set to
   *        an event name.
   *
   * @param {Object} [hash]
   *        Optionally extra argument to pass through to an event listener
   */
/**
   * Dispose of the `Component` and all child components.
   *
   * @fires Component#dispose
   *
   * @param {Object} options
   * @param {Element} options.originalEl element with which to replace player element
   */
dispose(e={}){if(!this.isDisposed_){this.readyQueue_&&(this.readyQueue_.length=0)
/**
     * Triggered when a `Component` is disposed.
     *
     * @event Component#dispose
     * @type {Event}
     *
     * @property {boolean} [bubbles=false]
     *           set to false so that the dispose event does not
     *           bubble up
     */;this.trigger({type:"dispose",bubbles:false});this.isDisposed_=true;if(this.children_)for(let e=this.children_.length-1;e>=0;e--)this.children_[e].dispose&&this.children_[e].dispose();this.children_=null;this.childIndex_=null;this.childNameIndex_=null;this.parentComponent_=null;if(this.el_){this.el_.parentNode&&(e.restoreEl?this.el_.parentNode.replaceChild(e.restoreEl,this.el_):this.el_.parentNode.removeChild(this.el_));this.el_=null}this.player_=null}}isDisposed(){return Boolean(this.isDisposed_)}player(){return this.player_}
/**
   * Deep merge of options objects with new options.
   * > Note: When both `obj` and `options` contain properties whose values are objects.
   *         The two properties get merged using {@link module:obj.merge}
   *
   * @param {Object} obj
   *        The object that contains new options.
   *
   * @return {Object}
   *         A new object of `this.options_` and `obj` merged together.
   */options(e){if(!e)return this.options_;this.options_=merge$1(this.options_,e);return this.options_}el(){return this.el_}
/**
   * Create the `Component`s DOM element.
   *
   * @param {string} [tagName]
   *        Element's DOM node type. e.g. 'div'
   *
   * @param {Object} [properties]
   *        An object of properties that should be set.
   *
   * @param {Object} [attributes]
   *        An object of attributes that should be set.
   *
   * @return {Element}
   *         The element that gets created.
   */createEl(e,t,s){return createEl(e,t,s)}
/**
   * Localize a string given the string in english.
   *
   * If tokens are provided, it'll try and run a simple token replacement on the provided string.
   * The tokens it looks for look like `{1}` with the index being 1-indexed into the tokens array.
   *
   * If a `defaultValue` is provided, it'll use that over `string`,
   * if a value isn't found in provided language files.
   * This is useful if you want to have a descriptive key for token replacement
   * but have a succinct localized string and not require `en.json` to be included.
   *
   * Currently, it is used for the progress bar timing.
   * ```js
   * {
   *   "progress bar timing: currentTime={1} duration={2}": "{1} of {2}"
   * }
   * ```
   * It is then used like so:
   * ```js
   * this.localize('progress bar timing: currentTime={1} duration{2}',
   *               [this.player_.currentTime(), this.player_.duration()],
   *               '{1} of {2}');
   * ```
   *
   * Which outputs something like: `01:23 of 24:56`.
   *
   *
   * @param {string} string
   *        The string to localize and the key to lookup in the language files.
   * @param {string[]} [tokens]
   *        If the current item has token replacements, provide the tokens here.
   * @param {string} [defaultValue]
   *        Defaults to `string`. Can be a default value to use for token replacement
   *        if the lookup key is needed to be separate.
   *
   * @return {string}
   *         The localized string or if no localization exists the english string.
   */localize(e,t,s=e){const i=this.player_.language&&this.player_.language();const n=this.player_.languages&&this.player_.languages();const r=n&&n[i];const a=i&&i.split("-")[0];const o=n&&n[a];let l=s;r&&r[e]?l=r[e]:o&&o[e]&&(l=o[e]);t&&(l=l.replace(/\{(\d+)\}/g,(function(e,s){const i=t[s-1];let n=i;typeof i==="undefined"&&(n=e);return n})));return l}handleLanguagechange(){}contentEl(){return this.contentEl_||this.el_}id(){return this.id_}name(){return this.name_}children(){return this.children_}
/**
   * Returns the child `Component` with the given `id`.
   *
   * @param {string} id
   *        The id of the child `Component` to get.
   *
   * @return {Component|undefined}
   *         The child `Component` with the given `id` or undefined.
   */getChildById(e){return this.childIndex_[e]}
/**
   * Returns the child `Component` with the given `name`.
   *
   * @param {string} name
   *        The name of the child `Component` to get.
   *
   * @return {Component|undefined}
   *         The child `Component` with the given `name` or undefined.
   */getChild(e){if(e)return this.childNameIndex_[e]}
/**
   * Returns the descendant `Component` following the givent
   * descendant `names`. For instance ['foo', 'bar', 'baz'] would
   * try to get 'foo' on the current component, 'bar' on the 'foo'
   * component and 'baz' on the 'bar' component and return undefined
   * if any of those don't exist.
   *
   * @param {...string[]|...string} names
   *        The name of the child `Component` to get.
   *
   * @return {Component|undefined}
   *         The descendant `Component` following the given descendant
   *         `names` or undefined.
   */getDescendant(...e){e=e.reduce(((e,t)=>e.concat(t)),[]);let t=this;for(let s=0;s<e.length;s++){t=t.getChild(e[s]);if(!t||!t.getChild)return}return t}
/**
   * Adds an SVG icon element to another element or component.
   *
   * @param {string} iconName
   *        The name of icon. A list of all the icon names can be found at 'sandbox/svg-icons.html'
   *
   * @param {Element} [el=this.el()]
   *        Element to set the title on. Defaults to the current Component's element.
   *
   * @return {Element}
   *        The newly created icon element.
   */setIcon(e,s=this.el()){if(!this.player_.options_.experimentalSvgIcons)return;const i="http://www.w3.org/2000/svg";const n=createEl("span",{className:"vjs-icon-placeholder vjs-svg-icon"},{"aria-hidden":"true"});const r=t.createElementNS(i,"svg");r.setAttributeNS(null,"viewBox","0 0 512 512");const a=t.createElementNS(i,"use");r.appendChild(a);a.setAttributeNS(null,"href",`#vjs-icon-${e}`);n.appendChild(r);this.iconIsSet_?s.replaceChild(n,s.querySelector(".vjs-icon-placeholder")):s.appendChild(n);this.iconIsSet_=true;return n}
/**
   * Add a child `Component` inside the current `Component`.
   *
   * @param {string|Component} child
   *        The name or instance of a child to add.
   *
   * @param {Object} [options={}]
   *        The key/value store of options that will get passed to children of
   *        the child.
   *
   * @param {number} [index=this.children_.length]
   *        The index to attempt to add a child into.
   *
   *
   * @return {Component}
   *         The `Component` that gets added as a child. When using a string the
   *         `Component` will get created by this process.
   */addChild(e,t={},s=this.children_.length){let i;let n;if(typeof e==="string"){n=toTitleCase$1(e);const s=t.componentClass||n;t.name=n;const r=Component$1.getComponent(s);if(!r)throw new Error(`Component ${s} does not exist`);if(typeof r!=="function")return null;i=new r(this.player_||this,t)}else i=e;i.parentComponent_&&i.parentComponent_.removeChild(i);this.children_.splice(s,0,i);i.parentComponent_=this;typeof i.id==="function"&&(this.childIndex_[i.id()]=i);n=n||i.name&&toTitleCase$1(i.name());if(n){this.childNameIndex_[n]=i;this.childNameIndex_[toLowerCase(n)]=i}if(typeof i.el==="function"&&i.el()){let e=null;this.children_[s+1]&&(this.children_[s+1].el_?e=this.children_[s+1].el_:isEl(this.children_[s+1])&&(e=this.children_[s+1]));this.contentEl().insertBefore(i.el(),e)}return i}
/**
   * Remove a child `Component` from this `Component`s list of children. Also removes
   * the child `Component`s element from this `Component`s element.
   *
   * @param {Component} component
   *        The child `Component` to remove.
   */removeChild(e){typeof e==="string"&&(e=this.getChild(e));if(!e||!this.children_)return;let t=false;for(let s=this.children_.length-1;s>=0;s--)if(this.children_[s]===e){t=true;this.children_.splice(s,1);break}if(!t)return;e.parentComponent_=null;this.childIndex_[e.id()]=null;this.childNameIndex_[toTitleCase$1(e.name())]=null;this.childNameIndex_[toLowerCase(e.name())]=null;const s=e.el();s&&s.parentNode===this.contentEl()&&this.contentEl().removeChild(e.el())}initChildren(){const e=this.options_.children;if(e){const t=this.options_;const handleAdd=e=>{const s=e.name;let i=e.opts;t[s]!==void 0&&(i=t[s]);if(i===false)return;i===true&&(i={});i.playerOptions=this.options_.playerOptions;const n=this.addChild(s,i);n&&(this[s]=n)};let s;const i=Component$1.getComponent("Tech");s=Array.isArray(e)?e:Object.keys(e);s.concat(Object.keys(this.options_).filter((function(e){return!s.some((function(t){return typeof t==="string"?e===t:e===t.name}))}))).map((t=>{let s;let i;if(typeof t==="string"){s=t;i=e[s]||this.options_[s]||{}}else{s=t.name;i=t}return{name:s,opts:i}})).filter((e=>{const t=Component$1.getComponent(e.opts.componentClass||toTitleCase$1(e.name));return t&&!i.isTech(t)})).forEach(handleAdd)}}buildCSSClass(){return""}
/**
   * Bind a listener to the component's ready state.
   * Different from event listeners in that if the ready event has already happened
   * it will trigger the function immediately.
   *
   * @param {ReadyCallback} fn
   *        Function that gets called when the `Component` is ready.
   */ready(e,t=false){if(e)if(this.isReady_)t?e.call(this):this.setTimeout(e,1);else{this.readyQueue_=this.readyQueue_||[];this.readyQueue_.push(e)}}triggerReady(){this.isReady_=true;this.setTimeout((function(){const e=this.readyQueue_;this.readyQueue_=[];e&&e.length>0&&e.forEach((function(e){e.call(this)}),this);
/**
       * Triggered when a `Component` is ready.
       *
       * @event Component#ready
       * @type {Event}
       */this.trigger("ready")}),1)}
/**
   * Find a single DOM element matching a `selector`. This can be within the `Component`s
   * `contentEl()` or another custom context.
   *
   * @param {string} selector
   *        A valid CSS selector, which will be passed to `querySelector`.
   *
   * @param {Element|string} [context=this.contentEl()]
   *        A DOM element within which to query. Can also be a selector string in
   *        which case the first matching element will get used as context. If
   *        missing `this.contentEl()` gets used. If  `this.contentEl()` returns
   *        nothing it falls back to `document`.
   *
   * @return {Element|null}
   *         the dom element that was found, or null
   *
   * @see [Information on CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
   */$(e,t){return ce(e,t||this.contentEl())}
/**
   * Finds all DOM element matching a `selector`. This can be within the `Component`s
   * `contentEl()` or another custom context.
   *
   * @param {string} selector
   *        A valid CSS selector, which will be passed to `querySelectorAll`.
   *
   * @param {Element|string} [context=this.contentEl()]
   *        A DOM element within which to query. Can also be a selector string in
   *        which case the first matching element will get used as context. If
   *        missing `this.contentEl()` gets used. If  `this.contentEl()` returns
   *        nothing it falls back to `document`.
   *
   * @return {NodeList}
   *         a list of dom elements that were found
   *
   * @see [Information on CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
   */$$(e,t){return ue(e,t||this.contentEl())}
/**
   * Check if a component's element has a CSS class name.
   *
   * @param {string} classToCheck
   *        CSS class name to check.
   *
   * @return {boolean}
   *         - True if the `Component` has the class.
   *         - False if the `Component` does not have the class`
   */hasClass(e){return hasClass(this.el_,e)}
/**
   * Add a CSS class name to the `Component`s element.
   *
   * @param {...string} classesToAdd
   *        One or more CSS class name to add.
   */addClass(...e){addClass(this.el_,...e)}
/**
   * Remove a CSS class name from the `Component`s element.
   *
   * @param {...string} classesToRemove
   *        One or more CSS class name to remove.
   */removeClass(...e){removeClass(this.el_,...e)}
/**
   * Add or remove a CSS class name from the component's element.
   * - `classToToggle` gets added when {@link Component#hasClass} would return false.
   * - `classToToggle` gets removed when {@link Component#hasClass} would return true.
   *
   * @param  {string} classToToggle
   *         The class to add or remove. Passed to DOMTokenList's toggle()
   *
   * @param  {boolean|Dom.PredicateCallback} [predicate]
   *         A boolean or function that returns a boolean. Passed to DOMTokenList's toggle().
   */toggleClass(e,t){toggleClass(this.el_,e,t)}show(){this.removeClass("vjs-hidden")}hide(){this.addClass("vjs-hidden")}lockShowing(){this.addClass("vjs-lock-showing")}unlockShowing(){this.removeClass("vjs-lock-showing")}
/**
   * Get the value of an attribute on the `Component`s element.
   *
   * @param {string} attribute
   *        Name of the attribute to get the value from.
   *
   * @return {string|null}
   *         - The value of the attribute that was asked for.
   *         - Can be an empty string on some browsers if the attribute does not exist
   *           or has no value
   *         - Most browsers will return null if the attribute does not exist or has
   *           no value.
   *
   * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute}
   */getAttribute(e){return getAttribute(this.el_,e)}
/**
   * Set the value of an attribute on the `Component`'s element
   *
   * @param {string} attribute
   *        Name of the attribute to set.
   *
   * @param {string} value
   *        Value to set the attribute to.
   *
   * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute}
   */setAttribute(e,t){setAttribute(this.el_,e,t)}
/**
   * Remove an attribute from the `Component`s element.
   *
   * @param {string} attribute
   *        Name of the attribute to remove.
   *
   * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute}
   */removeAttribute(e){removeAttribute(this.el_,e)}
/**
   * Get or set the width of the component based upon the CSS styles.
   * See {@link Component#dimension} for more detailed information.
   *
   * @param {number|string} [num]
   *        The width that you want to set postfixed with '%', 'px' or nothing.
   *
   * @param {boolean} [skipListeners]
   *        Skip the componentresize event trigger
   *
   * @return {number|undefined}
   *         The width when getting, zero if there is no width
   */width(e,t){return this.dimension("width",e,t)}
/**
   * Get or set the height of the component based upon the CSS styles.
   * See {@link Component#dimension} for more detailed information.
   *
   * @param {number|string} [num]
   *        The height that you want to set postfixed with '%', 'px' or nothing.
   *
   * @param {boolean} [skipListeners]
   *        Skip the componentresize event trigger
   *
   * @return {number|undefined}
   *         The height when getting, zero if there is no height
   */height(e,t){return this.dimension("height",e,t)}
/**
   * Set both the width and height of the `Component` element at the same time.
   *
   * @param  {number|string} width
   *         Width to set the `Component`s element to.
   *
   * @param  {number|string} height
   *         Height to set the `Component`s element to.
   */dimensions(e,t){this.width(e,true);this.height(t)}
/**
   * Get or set width or height of the `Component` element. This is the shared code
   * for the {@link Component#width} and {@link Component#height}.
   *
   * Things to know:
   * - If the width or height in an number this will return the number postfixed with 'px'.
   * - If the width/height is a percent this will return the percent postfixed with '%'
   * - Hidden elements have a width of 0 with `window.getComputedStyle`. This function
   *   defaults to the `Component`s `style.width` and falls back to `window.getComputedStyle`.
   *   See [this]{@link http://www.foliotek.com/devblog/getting-the-width-of-a-hidden-element-with-jquery-using-width/}
   *   for more information
   * - If you want the computed style of the component, use {@link Component#currentWidth}
   *   and {@link {Component#currentHeight}
   *
   * @fires Component#componentresize
   *
   * @param {string} widthOrHeight
   8        'width' or 'height'
   *
   * @param  {number|string} [num]
   8         New dimension
   *
   * @param  {boolean} [skipListeners]
   *         Skip componentresize event trigger
   *
   * @return {number|undefined}
   *         The dimension when getting or 0 if unset
   */dimension(e,t,s){if(t!==void 0){t!==null&&t===t||(t=0);(""+t).indexOf("%")!==-1||(""+t).indexOf("px")!==-1?this.el_.style[e]=t:this.el_.style[e]=t==="auto"?"":t+"px";s||
/**
         * Triggered when a component is resized.
         *
         * @event Component#componentresize
         * @type {Event}
         */
this.trigger("componentresize");return}if(!this.el_)return 0;const i=this.el_.style[e];const n=i.indexOf("px");return n!==-1?parseInt(i.slice(0,n),10):parseInt(this.el_["offset"+toTitleCase$1(e)],10)}
/**
   * Get the computed width or the height of the component's element.
   *
   * Uses `window.getComputedStyle`.
   *
   * @param {string} widthOrHeight
   *        A string containing 'width' or 'height'. Whichever one you want to get.
   *
   * @return {number}
   *         The dimension that gets asked for or 0 if nothing was set
   *         for that dimension.
   */currentDimension(e){let t=0;if(e!=="width"&&e!=="height")throw new Error("currentDimension only accepts width or height value");t=computedStyle(this.el_,e);t=parseFloat(t);if(t===0||isNaN(t)){const s=`offset${toTitleCase$1(e)}`;t=this.el_[s]}return t}
/**
   * An object that contains width and height values of the `Component`s
   * computed style. Uses `window.getComputedStyle`.
   *
   * @typedef {Object} Component~DimensionObject
   *
   * @property {number} width
   *           The width of the `Component`s computed style.
   *
   * @property {number} height
   *           The height of the `Component`s computed style.
   */currentDimensions(){return{width:this.currentDimension("width"),height:this.currentDimension("height")}}currentWidth(){return this.currentDimension("width")}currentHeight(){return this.currentDimension("height")}getPositions(){const e=this.el_.getBoundingClientRect();const t={x:e.x,y:e.y,width:e.width,height:e.height,top:e.top,right:e.right,bottom:e.bottom,left:e.left};const s={x:e.left+e.width/2,y:e.top+e.height/2,width:0,height:0,top:e.top+e.height/2,right:e.left+e.width/2,bottom:e.top+e.height/2,left:e.left+e.width/2};return{boundingClientRect:t,center:s}}focus(){this.el_.focus()}blur(){this.el_.blur()}
/**
   * When this Component receives a `keydown` event which it does not process,
   *  it passes the event to the Player for handling.
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called.
   */handleKeyDown(e){if(this.player_){e.key==="Tab"||this.player_.options_.playerOptions.spatialNavigation&&this.player_.options_.playerOptions.spatialNavigation.enabled||e.stopPropagation();this.player_.handleKeyDown(e)}}
/**
   * Many components used to have a `handleKeyPress` method, which was poorly
   * named because it listened to a `keydown` event. This method name now
   * delegates to `handleKeyDown`. This means anyone calling `handleKeyPress`
   * will not see their method calls stop working.
   *
   * @param {KeyboardEvent} event
   *        The event that caused this function to be called.
   */handleKeyPress(e){this.handleKeyDown(e)}emitTapEvents(){let t=0;let s=null;const i=10;const n=200;let r;this.on("touchstart",(function(i){if(i.touches.length===1){s={pageX:i.touches[0].pageX,pageY:i.touches[0].pageY};t=e.performance.now();r=true}}));this.on("touchmove",(function(e){if(e.touches.length>1)r=false;else if(s){const t=e.touches[0].pageX-s.pageX;const n=e.touches[0].pageY-s.pageY;const a=Math.sqrt(t*t+n*n);a>i&&(r=false)}}));const noTap=function(){r=false};this.on("touchleave",noTap);this.on("touchcancel",noTap);this.on("touchend",(function(i){s=null;if(r===true){const s=e.performance.now()-t;if(s<n){i.preventDefault();
/**
           * Triggered when a `Component` is tapped.
           *
           * @event Component#tap
           * @type {MouseEvent}
           */this.trigger("tap")}}}))}enableTouchActivity(){if(!this.player()||!this.player().reportUserActivity)return;const e=bind_(this.player(),this.player().reportUserActivity);let t;this.on("touchstart",(function(){e();this.clearInterval(t);t=this.setInterval(e,250)}));const touchEnd=function(s){e();this.clearInterval(t)};this.on("touchmove",e);this.on("touchend",touchEnd);this.on("touchcancel",touchEnd)}
/**
   * Creates a function that runs after an `x` millisecond timeout. This function is a
   * wrapper around `window.setTimeout`. There are a few reasons to use this one
   * instead though:
   * 1. It gets cleared via  {@link Component#clearTimeout} when
   *    {@link Component#dispose} gets called.
   * 2. The function callback will gets turned into a {@link Component~GenericCallback}
   *
   * > Note: You can't use `window.clearTimeout` on the id returned by this function. This
   *         will cause its dispose listener not to get cleaned up! Please use
   *         {@link Component#clearTimeout} or {@link Component#dispose} instead.
   *
   * @param {Component~GenericCallback} fn
   *        The function that will be run after `timeout`.
   *
   * @param {number} timeout
   *        Timeout in milliseconds to delay before executing the specified function.
   *
   * @return {number}
   *         Returns a timeout ID that gets used to identify the timeout. It can also
   *         get used in {@link Component#clearTimeout} to clear the timeout that
   *         was set.
   *
   * @listens Component#dispose
   * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout}
   */setTimeout(t,s){var i;t=bind_(this,t);this.clearTimersOnDispose_();i=e.setTimeout((()=>{this.setTimeoutIds_.has(i)&&this.setTimeoutIds_.delete(i);t()}),s);this.setTimeoutIds_.add(i);return i}
/**
   * Clears a timeout that gets created via `window.setTimeout` or
   * {@link Component#setTimeout}. If you set a timeout via {@link Component#setTimeout}
   * use this function instead of `window.clearTimout`. If you don't your dispose
   * listener will not get cleaned up until {@link Component#dispose}!
   *
   * @param {number} timeoutId
   *        The id of the timeout to clear. The return value of
   *        {@link Component#setTimeout} or `window.setTimeout`.
   *
   * @return {number}
   *         Returns the timeout id that was cleared.
   *
   * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearTimeout}
   */clearTimeout(t){if(this.setTimeoutIds_.has(t)){this.setTimeoutIds_.delete(t);e.clearTimeout(t)}return t}
/**
   * Creates a function that gets run every `x` milliseconds. This function is a wrapper
   * around `window.setInterval`. There are a few reasons to use this one instead though.
   * 1. It gets cleared via  {@link Component#clearInterval} when
   *    {@link Component#dispose} gets called.
   * 2. The function callback will be a {@link Component~GenericCallback}
   *
   * @param {Component~GenericCallback} fn
   *        The function to run every `x` seconds.
   *
   * @param {number} interval
   *        Execute the specified function every `x` milliseconds.
   *
   * @return {number}
   *         Returns an id that can be used to identify the interval. It can also be be used in
   *         {@link Component#clearInterval} to clear the interval.
   *
   * @listens Component#dispose
   * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval}
   */setInterval(t,s){t=bind_(this,t);this.clearTimersOnDispose_();const i=e.setInterval(t,s);this.setIntervalIds_.add(i);return i}
/**
   * Clears an interval that gets created via `window.setInterval` or
   * {@link Component#setInterval}. If you set an interval via {@link Component#setInterval}
   * use this function instead of `window.clearInterval`. If you don't your dispose
   * listener will not get cleaned up until {@link Component#dispose}!
   *
   * @param {number} intervalId
   *        The id of the interval to clear. The return value of
   *        {@link Component#setInterval} or `window.setInterval`.
   *
   * @return {number}
   *         Returns the interval id that was cleared.
   *
   * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearInterval}
   */clearInterval(t){if(this.setIntervalIds_.has(t)){this.setIntervalIds_.delete(t);e.clearInterval(t)}return t}
/**
   * Queues up a callback to be passed to requestAnimationFrame (rAF), but
   * with a few extra bonuses:
   *
   * - Supports browsers that do not support rAF by falling back to
   *   {@link Component#setTimeout}.
   *
   * - The callback is turned into a {@link Component~GenericCallback} (i.e.
   *   bound to the component).
   *
   * - Automatic cancellation of the rAF callback is handled if the component
   *   is disposed before it is called.
   *
   * @param  {Component~GenericCallback} fn
   *         A function that will be bound to this component and executed just
   *         before the browser's next repaint.
   *
   * @return {number}
   *         Returns an rAF ID that gets used to identify the timeout. It can
   *         also be used in {@link Component#cancelAnimationFrame} to cancel
   *         the animation frame callback.
   *
   * @listens Component#dispose
   * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame}
   */requestAnimationFrame(t){this.clearTimersOnDispose_();var s;t=bind_(this,t);s=e.requestAnimationFrame((()=>{this.rafIds_.has(s)&&this.rafIds_.delete(s);t()}));this.rafIds_.add(s);return s}
/**
   * Request an animation frame, but only one named animation
   * frame will be queued. Another will never be added until
   * the previous one finishes.
   *
   * @param {string} name
   *        The name to give this requestAnimationFrame
   *
   * @param  {Component~GenericCallback} fn
   *         A function that will be bound to this component and executed just
   *         before the browser's next repaint.
   */requestNamedAnimationFrame(e,t){this.namedRafs_.has(e)&&this.cancelNamedAnimationFrame(e);this.clearTimersOnDispose_();t=bind_(this,t);const s=this.requestAnimationFrame((()=>{t();this.namedRafs_.has(e)&&this.namedRafs_.delete(e)}));this.namedRafs_.set(e,s);return e}
/**
   * Cancels a current named animation frame if it exists.
   *
   * @param {string} name
   *        The name of the requestAnimationFrame to cancel.
   */cancelNamedAnimationFrame(e){if(this.namedRafs_.has(e)){this.cancelAnimationFrame(this.namedRafs_.get(e));this.namedRafs_.delete(e)}}
/**
   * Cancels a queued callback passed to {@link Component#requestAnimationFrame}
   * (rAF).
   *
   * If you queue an rAF callback via {@link Component#requestAnimationFrame},
   * use this function instead of `window.cancelAnimationFrame`. If you don't,
   * your dispose listener will not get cleaned up until {@link Component#dispose}!
   *
   * @param {number} id
   *        The rAF ID to clear. The return value of {@link Component#requestAnimationFrame}.
   *
   * @return {number}
   *         Returns the rAF ID that was cleared.
   *
   * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/cancelAnimationFrame}
   */cancelAnimationFrame(t){if(this.rafIds_.has(t)){this.rafIds_.delete(t);e.cancelAnimationFrame(t)}return t}clearTimersOnDispose_(){if(!this.clearingTimersOnDispose_){this.clearingTimersOnDispose_=true;this.one("dispose",(()=>{[["namedRafs_","cancelNamedAnimationFrame"],["rafIds_","cancelAnimationFrame"],["setTimeoutIds_","clearTimeout"],["setIntervalIds_","clearInterval"]].forEach((([e,t])=>{this[e].forEach(((e,s)=>this[t](s)))}));this.clearingTimersOnDispose_=false}))}}
/**
    * Decide whether an element is actually disabled or not.
    *
    * @function isActuallyDisabled
    * @param element {Node}
    * @return {boolean}
    *
    * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#concept-element-disabled}
    */getIsDisabled(){return Boolean(this.el_.disabled)}
/**
    * Decide whether the element is expressly inert or not.
    *
    * @see {@link https://html.spec.whatwg.org/multipage/interaction.html#expressly-inert}
    * @function isExpresslyInert
    * @param element {Node}
    * @return {boolean}
    */getIsExpresslyInert(){return this.el_.inert&&!this.el_.ownerDocument.documentElement.inert}
/**
   * Determine whether or not this component can be considered as focusable component.
   *
   * @param {HTMLElement} el - The HTML element representing the component.
   * @return {boolean}
   *         If the component can be focused, will be `true`. Otherwise, `false`.
   */getIsFocusable(e){const t=e||this.el_;return t.tabIndex>=0&&!(this.getIsDisabled()||this.getIsExpresslyInert())}
/**
   * Determine whether or not this component is currently visible/enabled/etc...
   *
   * @param {HTMLElement} el - The HTML element representing the component.
   * @return {boolean}
   *         If the component can is currently visible & enabled, will be `true`. Otherwise, `false`.
   */getIsAvailableToBeFocused(s){
/**
     * Decide the style property of this element is specified whether it's visible or not.
     *
     * @function isVisibleStyleProperty
     * @param element {CSSStyleDeclaration}
     * @return {boolean}
     */
function isVisibleStyleProperty(t){const s=e.getComputedStyle(t,null);const i=s.getPropertyValue("visibility");const n=s.getPropertyValue("display");const r=["hidden","collapse"];return n!=="none"&&!r.includes(i)}
/**
     * Decide whether the element is being rendered or not.
     * 1. If an element has the style as "visibility: hidden | collapse" or "display: none", it is not being rendered.
     * 2. If an element has the style as "opacity: 0", it is not being rendered.(that is, invisible).
     * 3. If width and height of an element are explicitly set to 0, it is not being rendered.
     * 4. If a parent element is hidden, an element itself is not being rendered.
     * (CSS visibility property and display property are inherited.)
     *
     * @see {@link https://html.spec.whatwg.org/multipage/rendering.html#being-rendered}
     * @function isBeingRendered
     * @param element {Node}
     * @return {boolean}
     */function isBeingRendered(t){return!!isVisibleStyleProperty(t.parentElement)&&!(!isVisibleStyleProperty(t)||t.style.opacity==="0"||e.getComputedStyle(t).height==="0px"||e.getComputedStyle(t).width==="0px")}
/**
     * Determine if the element is visible for the user or not.
     * 1. If an element sum of its offsetWidth, offsetHeight, height and width is less than 1 is not visible.
     * 2. If elementCenter.x is less than is not visible.
     * 3. If elementCenter.x is more than the document's width is not visible.
     * 4. If elementCenter.y is less than 0 is not visible.
     * 5. If elementCenter.y is the document's height is not visible.
     *
     * @function isVisible
     * @param element {Node}
     * @return {boolean}
     */function isVisible(s){if(s.offsetWidth+s.offsetHeight+s.getBoundingClientRect().height+s.getBoundingClientRect().width===0)return false;const i={x:s.getBoundingClientRect().left+s.offsetWidth/2,y:s.getBoundingClientRect().top+s.offsetHeight/2};if(i.x<0)return false;if(i.x>(t.documentElement.clientWidth||e.innerWidth))return false;if(i.y<0)return false;if(i.y>(t.documentElement.clientHeight||e.innerHeight))return false;let n=t.elementFromPoint(i.x,i.y);while(n){if(n===s)return true;if(!n.parentNode)return false;n=n.parentNode}}s||(s=this.el());return!(!isVisible(s)||!isBeingRendered(s)||s.parentElement&&!(s.tabIndex>=0))}
/**
   * Register a `Component` with `videojs` given the name and the component.
   *
   * > NOTE: {@link Tech}s should not be registered as a `Component`. {@link Tech}s
   *         should be registered using {@link Tech.registerTech} or
   *         {@link videojs:videojs.registerTech}.
   *
   * > NOTE: This function can also be seen on videojs as
   *         {@link videojs:videojs.registerComponent}.
   *
   * @param {string} name
   *        The name of the `Component` to register.
   *
   * @param {Component} ComponentToRegister
   *        The `Component` class to register.
   *
   * @return {Component}
   *         The `Component` that was registered.
   */static registerComponent(e,t){if(typeof e!=="string"||!e)throw new Error(`Illegal component name, "${e}"; must be a non-empty string.`);const s=Component$1.getComponent("Tech");const i=s&&s.isTech(t);const n=Component$1===t||Component$1.prototype.isPrototypeOf(t.prototype);if(i||!n){let t;t=i?"techs must be registered using Tech.registerTech()":"must be a Component subclass";throw new Error(`Illegal component, "${e}"; ${t}.`)}e=toTitleCase$1(e);Component$1.components_||(Component$1.components_={});const r=Component$1.getComponent("Player");if(e==="Player"&&r&&r.players){const e=r.players;const t=Object.keys(e);if(e&&t.length>0&&t.map((t=>e[t])).every(Boolean))throw new Error("Can not register Player component after player has been created.")}Component$1.components_[e]=t;Component$1.components_[toLowerCase(e)]=t;return t}
/**
   * Get a `Component` based on the name it was registered with.
   *
   * @param {string} name
   *        The Name of the component to get.
   *
   * @return {typeof Component}
   *         The `Component` that got registered under the given name.
   */static getComponent(e){if(e&&Component$1.components_)return Component$1.components_[e]}}Component$1.registerComponent("Component",Component$1);
/**
 * Returns the time for the specified index at the start or end
 * of a TimeRange object.
 *
 * @typedef    {Function} TimeRangeIndex
 *
 * @param      {number} [index=0]
 *             The range number to return the time for.
 *
 * @return     {number}
 *             The time offset at the specified index.
 *
 * @deprecated The index argument must be provided.
 *             In the future, leaving it out will throw an error.
 */
/**
 * An object that contains ranges of time, which mimics {@link TimeRanges}.
 *
 * @typedef  {Object} TimeRange
 *
 * @property {number} length
 *           The number of time ranges represented by this object.
 *
 * @property {module:time~TimeRangeIndex} start
 *           Returns the time offset at which a specified time range begins.
 *
 * @property {module:time~TimeRangeIndex} end
 *           Returns the time offset at which a specified time range ends.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges
 */
/**
 * Check if any of the time ranges are over the maximum index.
 *
 * @private
 * @param   {string} fnName
 *          The function name to use for logging
 *
 * @param   {number} index
 *          The index to check
 *
 * @param   {number} maxIndex
 *          The maximum possible index
 *
 * @throws  {Error} if the timeRanges provided are over the maxIndex
 */function rangeCheck(e,t,s){if(typeof t!=="number"||t<0||t>s)throw new Error(`Failed to execute '${e}' on 'TimeRanges': The index provided (${t}) is non-numeric or out of bounds (0-${s}).`)}
/**
 * Get the time for the specified index at the start or end
 * of a TimeRange object.
 *
 * @private
 * @param      {string} fnName
 *             The function name to use for logging
 *
 * @param      {string} valueIndex
 *             The property that should be used to get the time. should be
 *             'start' or 'end'
 *
 * @param      {Array} ranges
 *             An array of time ranges
 *
 * @param      {Array} [rangeIndex=0]
 *             The index to start the search at
 *
 * @return     {number}
 *             The time that offset at the specified index.
 *
 * @deprecated rangeIndex must be set to a value, in the future this will throw an error.
 * @throws     {Error} if rangeIndex is more than the length of ranges
 */function getRange(e,t,s,i){rangeCheck(e,i,s.length-1);return s[i][t]}
/**
 * Create a time range object given ranges of time.
 *
 * @private
 * @param   {Array} [ranges]
 *          An array of time ranges.
 *
 * @return  {TimeRange}
 */function createTimeRangesObj(t){let s;s=t===void 0||t.length===0?{length:0,start(){throw new Error("This TimeRanges object is empty")},end(){throw new Error("This TimeRanges object is empty")}}:{length:t.length,start:getRange.bind(null,"start",0,t),end:getRange.bind(null,"end",1,t)};e.Symbol&&e.Symbol.iterator&&(s[e.Symbol.iterator]=()=>(t||[]).values());return s}
/**
 * Create a `TimeRange` object which mimics an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges|HTML5 TimeRanges instance}.
 *
 * @param {number|Array[]} start
 *        The start of a single range (a number) or an array of ranges (an
 *        array of arrays of two numbers each).
 *
 * @param {number} end
 *        The end of a single range. Cannot be used with the array form of
 *        the `start` argument.
 *
 * @return {TimeRange}
 */function createTimeRanges$1(e,t){return Array.isArray(e)?createTimeRangesObj(e):e===void 0||t===void 0?createTimeRangesObj():createTimeRangesObj([[e,t]])}
/**
 * Format seconds as a time string, H:MM:SS or M:SS. Supplying a guide (in
 * seconds) will force a number of leading zeros to cover the length of the
 * guide.
 *
 * @private
 * @param  {number} seconds
 *         Number of seconds to be turned into a string
 *
 * @param  {number} guide
 *         Number (in seconds) to model the string after
 *
 * @return {string}
 *         Time formatted as H:MM:SS or M:SS
 */const defaultImplementation=function(e,t){e=e<0?0:e;let s=Math.floor(e%60);let i=Math.floor(e/60%60);let n=Math.floor(e/3600);const r=Math.floor(t/60%60);const a=Math.floor(t/3600);(isNaN(e)||e===Infinity)&&(n=i=s="-");n=n>0||a>0?n+":":"";i=((n||r>=10)&&i<10?"0"+i:i)+":";s=s<10?"0"+s:s;return n+i+s};let Ie=defaultImplementation;
/**
 * Replaces the default formatTime implementation with a custom implementation.
 *
 * @param {Function} customImplementation
 *        A function which will be used in place of the default formatTime
 *        implementation. Will receive the current time in seconds and the
 *        guide (in seconds) as arguments.
 */function setFormatTime(e){Ie=e}function resetFormatTime(){Ie=defaultImplementation}
/**
 * Delegates to either the default time formatting function or a custom
 * function supplied via `setFormatTime`.
 *
 * Formats seconds as a time string (H:MM:SS or M:SS). Supplying a
 * guide (in seconds) will force a number of leading zeros to cover the
 * length of the guide.
 *
 * @example  formatTime(125, 600) === "02:05"
 * @param    {number} seconds
 *           Number of seconds to be turned into a string
 *
 * @param    {number} guide
 *           Number (in seconds) to model the string after
 *
 * @return   {string}
 *           Time formatted as H:MM:SS or M:SS
 */function formatTime(e,t=e){return Ie(e,t)}var Pe=Object.freeze({__proto__:null,createTimeRanges:createTimeRanges$1,createTimeRange:createTimeRanges$1,setFormatTime:setFormatTime,resetFormatTime:resetFormatTime,formatTime:formatTime});
/**
 * Compute the percentage of the media that has been buffered.
 *
 * @param {TimeRange} buffered
 *        The current `TimeRanges` object representing buffered time ranges
 *
 * @param {number} duration
 *        Total duration of the media
 *
 * @return {number}
 *         Percent buffered of the total duration in decimal form.
 */function bufferedPercent(e,t){let s=0;let i;let n;if(!t)return 0;e&&e.length||(e=createTimeRanges$1(0,0));for(let r=0;r<e.length;r++){i=e.start(r);n=e.end(r);n>t&&(n=t);s+=n-i}return s/t}
/**
 * A Custom `MediaError` class which mimics the standard HTML5 `MediaError` class.
 *
 * @param {number|string|Object|MediaError} value
 *        This can be of multiple types:
 *        - number: should be a standard error code
 *        - string: an error message (the code will be 0)
 *        - Object: arbitrary properties
 *        - `MediaError` (native): used to populate a video.js `MediaError` object
 *        - `MediaError` (video.js): will return itself if it's already a
 *          video.js `MediaError` object.
 *
 * @see [MediaError Spec]{@link https://dev.w3.org/html5/spec-author-view/video.html#mediaerror}
 * @see [Encrypted MediaError Spec]{@link https://www.w3.org/TR/2013/WD-encrypted-media-20130510/#error-codes}
 *
 * @class MediaError
 */function MediaError(e){if(e instanceof MediaError)return e;if(typeof e==="number")this.code=e;else if(typeof e==="string")this.message=e;else if(isObject(e)){typeof e.code==="number"&&(this.code=e.code);Object.assign(this,e)}this.message||(this.message=MediaError.defaultMessages[this.code]||"")}
/**
 * The error code that refers two one of the defined `MediaError` types
 *
 * @type {Number}
 */MediaError.prototype.code=0;
/**
 * An optional message that to show with the error. Message is not part of the HTML5
 * video spec but allows for more informative custom errors.
 *
 * @type {String}
 */MediaError.prototype.message="";
/**
 * An optional status code that can be set by plugins to allow even more detail about
 * the error. For example a plugin might provide a specific HTTP status code and an
 * error message for that code. Then when the plugin gets that error this class will
 * know how to display an error message for it. This allows a custom message to show
 * up on the `Player` error overlay.
 *
 * @type {Array}
 */MediaError.prototype.status=null;
/**
 * An object containing an error type, as well as other information regarding the error.
 *
 * @typedef {{errorType: string, [key: string]: any}} ErrorMetadata
 */
/**
 * An optional object to give more detail about the error. This can be used to give
 * a higher level of specificity to an error versus the more generic MediaError codes.
 * `metadata` expects an `errorType` string that should align with the values from videojs.Error.
 *
 * @type {ErrorMetadata}
 */MediaError.prototype.metadata=null;MediaError.errorTypes=["MEDIA_ERR_CUSTOM","MEDIA_ERR_ABORTED","MEDIA_ERR_NETWORK","MEDIA_ERR_DECODE","MEDIA_ERR_SRC_NOT_SUPPORTED","MEDIA_ERR_ENCRYPTED"];
/**
 * The default `MediaError` messages based on the {@link MediaError.errorTypes}.
 *
 * @type {Array}
 * @constant
 */MediaError.defaultMessages={1:"You aborted the media playback",2:"A network error caused the media download to fail part-way.",3:"The media playback was aborted due to a corruption problem or because the media used features your browser did not support.",4:"The media could not be loaded, either because the server or network failed or because the format is not supported.",5:"The media is encrypted and we do not have the keys to decrypt it."};MediaError.MEDIA_ERR_CUSTOM=0;MediaError.prototype.MEDIA_ERR_CUSTOM=0;MediaError.MEDIA_ERR_ABORTED=1;MediaError.prototype.MEDIA_ERR_ABORTED=1;MediaError.MEDIA_ERR_NETWORK=2;MediaError.prototype.MEDIA_ERR_NETWORK=2;MediaError.MEDIA_ERR_DECODE=3;MediaError.prototype.MEDIA_ERR_DECODE=3;MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED=4;MediaError.prototype.MEDIA_ERR_SRC_NOT_SUPPORTED=4;MediaError.MEDIA_ERR_ENCRYPTED=5;MediaError.prototype.MEDIA_ERR_ENCRYPTED=5;
/**
 * Returns whether an object is `Promise`-like (i.e. has a `then` method).
 *
 * @param  {Object}  value
 *         An object that may or may not be `Promise`-like.
 *
 * @return {boolean}
 *         Whether or not the object is `Promise`-like.
 */function isPromise(e){return e!==void 0&&e!==null&&typeof e.then==="function"}
/**
 * Silence a Promise-like object.
 *
 * This is useful for avoiding non-harmful, but potentially confusing "uncaught
 * play promise" rejection error messages.
 *
 * @param  {Object} value
 *         An object that may or may not be `Promise`-like.
 */function silencePromise(e){isPromise(e)&&e.then(null,(e=>{}))}
/**
 * Examine a single {@link TextTrack} and return a JSON-compatible javascript object that
 * represents the {@link TextTrack}'s state.
 *
 * @param {TextTrack} track
 *        The text track to query.
 *
 * @return {Object}
 *         A serializable javascript representation of the TextTrack.
 * @private
 */const trackToJson_=function(e){const t=["kind","label","language","id","inBandMetadataTrackDispatchType","mode","src"].reduce(((t,s,i)=>{e[s]&&(t[s]=e[s]);return t}),{cues:e.cues&&Array.prototype.map.call(e.cues,(function(e){return{startTime:e.startTime,endTime:e.endTime,text:e.text,id:e.id}}))});return t};
/**
 * Examine a {@link Tech} and return a JSON-compatible javascript array that represents the
 * state of all {@link TextTrack}s currently configured. The return array is compatible with
 * {@link text-track-list-converter:jsonToTextTracks}.
 *
 * @param {Tech} tech
 *        The tech object to query
 *
 * @return {Array}
 *         A serializable javascript representation of the {@link Tech}s
 *         {@link TextTrackList}.
 */const textTracksToJson=function(e){const t=e.$$("track");const s=Array.prototype.map.call(t,(e=>e.track));const i=Array.prototype.map.call(t,(function(e){const t=trackToJson_(e.track);e.src&&(t.src=e.src);return t}));return i.concat(Array.prototype.filter.call(e.textTracks(),(function(e){return s.indexOf(e)===-1})).map(trackToJson_))};
/**
 * Create a set of remote {@link TextTrack}s on a {@link Tech} based on an array of javascript
 * object {@link TextTrack} representations.
 *
 * @param {Array} json
 *        An array of `TextTrack` representation objects, like those that would be
 *        produced by `textTracksToJson`.
 *
 * @param {Tech} tech
 *        The `Tech` to create the `TextTrack`s on.
 */const jsonToTextTracks=function(e,t){e.forEach((function(e){const s=t.addRemoteTextTrack(e).track;!e.src&&e.cues&&e.cues.forEach((e=>s.addCue(e)))}));return t.textTracks()};var Le={textTracksToJson:textTracksToJson,jsonToTextTracks:jsonToTextTracks,trackToJson_:trackToJson_};const Ae="vjs-modal-dialog";class ModalDialog extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {ContentDescriptor} [options.content=undefined]
   *        Provide customized content for this modal.
   *
   * @param {string} [options.description]
   *        A text description for the modal, primarily for accessibility.
   *
   * @param {boolean} [options.fillAlways=false]
   *        Normally, modals are automatically filled only the first time
   *        they open. This tells the modal to refresh its content
   *        every time it opens.
   *
   * @param {string} [options.label]
   *        A text label for the modal, primarily for accessibility.
   *
   * @param {boolean} [options.pauseOnOpen=true]
   *        If `true`, playback will will be paused if playing when
   *        the modal opens, and resumed when it closes.
   *
   * @param {boolean} [options.temporary=true]
   *        If `true`, the modal can only be opened once; it will be
   *        disposed as soon as it's closed.
   *
   * @param {boolean} [options.uncloseable=false]
   *        If `true`, the user will not be able to close the modal
   *        through the UI in the normal ways. Programmatic closing is
   *        still possible.
   */
constructor(e,t){super(e,t);this.handleKeyDown_=e=>this.handleKeyDown(e);this.close_=e=>this.close(e);this.opened_=this.hasBeenOpened_=this.hasBeenFilled_=false;this.closeable(!this.options_.uncloseable);this.content(this.options_.content);this.contentEl_=createEl("div",{className:`${Ae}-content`},{role:"document"});this.descEl_=createEl("p",{className:`${Ae}-description vjs-control-text`,id:this.el().getAttribute("aria-describedby")});textContent(this.descEl_,this.description());this.el_.appendChild(this.descEl_);this.el_.appendChild(this.contentEl_)}createEl(){return super.createEl("div",{className:this.buildCSSClass(),tabIndex:-1},{"aria-describedby":`${this.id()}_description`,"aria-hidden":"true","aria-label":this.label(),role:"dialog","aria-live":"polite"})}dispose(){this.contentEl_=null;this.descEl_=null;this.previouslyActiveEl_=null;super.dispose()}buildCSSClass(){return`${Ae} vjs-hidden ${super.buildCSSClass()}`}label(){return this.localize(this.options_.label||"Modal Window")}description(){let e=this.options_.description||this.localize("This is a modal window.");this.closeable()&&(e+=" "+this.localize("This modal can be closed by pressing the Escape key or activating the close button."));return e}open(){if(this.opened_){this.options_.fillAlways&&this.fill();return}const e=this.player();
/**
      * Fired just before a `ModalDialog` is opened.
      *
      * @event ModalDialog#beforemodalopen
      * @type {Event}
      */this.trigger("beforemodalopen");this.opened_=true;(this.options_.fillAlways||!this.hasBeenOpened_&&!this.hasBeenFilled_)&&this.fill();this.wasPlaying_=!e.paused();this.options_.pauseOnOpen&&this.wasPlaying_&&e.pause();this.on("keydown",this.handleKeyDown_);this.hadControls_=e.controls();e.controls(false);this.show();this.conditionalFocus_();this.el().setAttribute("aria-hidden","false");
/**
      * Fired just after a `ModalDialog` is opened.
      *
      * @event ModalDialog#modalopen
      * @type {Event}
      */this.trigger("modalopen");this.hasBeenOpened_=true}
/**
   * If the `ModalDialog` is currently open or closed.
   *
   * @param  {boolean} [value]
   *         If given, it will open (`true`) or close (`false`) the modal.
   *
   * @return {boolean}
   *         the current open state of the modaldialog
   */opened(e){typeof e==="boolean"&&this[e?"open":"close"]();return this.opened_}close(){if(!this.opened_)return;const e=this.player();
/**
      * Fired just before a `ModalDialog` is closed.
      *
      * @event ModalDialog#beforemodalclose
      * @type {Event}
      */this.trigger("beforemodalclose");this.opened_=false;this.wasPlaying_&&this.options_.pauseOnOpen&&e.play();this.off("keydown",this.handleKeyDown_);this.hadControls_&&e.controls(true);this.hide();this.el().setAttribute("aria-hidden","true");
/**
      * Fired just after a `ModalDialog` is closed.
      *
      * @event ModalDialog#modalclose
      * @type {Event}
      *
      * @property {boolean} [bubbles=true]
      */this.trigger({type:"modalclose",bubbles:true});this.conditionalBlur_();this.options_.temporary&&this.dispose()}
/**
   * Check to see if the `ModalDialog` is closeable via the UI.
   *
   * @param  {boolean} [value]
   *         If given as a boolean, it will set the `closeable` option.
   *
   * @return {boolean}
   *         Returns the final value of the closable option.
   */closeable(e){if(typeof e==="boolean"){const t=this.closeable_=!!e;let s=this.getChild("closeButton");if(t&&!s){const e=this.contentEl_;this.contentEl_=this.el_;s=this.addChild("closeButton",{controlText:"Close Modal Dialog"});this.contentEl_=e;this.on(s,"close",this.close_)}if(!t&&s){this.off(s,"close",this.close_);this.removeChild(s);s.dispose()}}return this.closeable_}fill(){this.fillWith(this.content())}
/**
   * Fill the modal's content element with arbitrary content.
   * The content element will be emptied before this change takes place.
   *
   * @fires ModalDialog#beforemodalfill
   * @fires ModalDialog#modalfill
   *
   * @param {ContentDescriptor} [content]
   *        The same rules apply to this as apply to the `content` option.
   */fillWith(e){const t=this.contentEl();const s=t.parentNode;const i=t.nextSibling;
/**
      * Fired just before a `ModalDialog` is filled with content.
      *
      * @event ModalDialog#beforemodalfill
      * @type {Event}
      */this.trigger("beforemodalfill");this.hasBeenFilled_=true;s.removeChild(t);this.empty();insertContent(t,e);
/**
     * Fired just after a `ModalDialog` is filled with content.
     *
     * @event ModalDialog#modalfill
     * @type {Event}
     */this.trigger("modalfill");i?s.insertBefore(t,i):s.appendChild(t);const n=this.getChild("closeButton");n&&s.appendChild(n.el_)
/**
     * Fired after `ModalDialog` is re-filled with content & close button is appended.
     *
     * @event ModalDialog#aftermodalfill
     * @type {Event}
     */;this.trigger("aftermodalfill")}empty(){
/**
    * Fired just before a `ModalDialog` is emptied.
    *
    * @event ModalDialog#beforemodalempty
    * @type {Event}
    */
this.trigger("beforemodalempty");emptyEl(this.contentEl());
/**
    * Fired just after a `ModalDialog` is emptied.
    *
    * @event ModalDialog#modalempty
    * @type {Event}
    */this.trigger("modalempty")}
/**
   * Gets or sets the modal content, which gets normalized before being
   * rendered into the DOM.
   *
   * This does not update the DOM or fill the modal, but it is called during
   * that process.
   *
   * @param  {ContentDescriptor} [value]
   *         If defined, sets the internal content value to be used on the
   *         next call(s) to `fill`. This value is normalized before being
   *         inserted. To "clear" the internal content value, pass `null`.
   *
   * @return {ContentDescriptor}
   *         The current content of the modal dialog
   */content(e){typeof e!=="undefined"&&(this.content_=e);return this.content_}conditionalFocus_(){const e=t.activeElement;const s=this.player_.el_;this.previouslyActiveEl_=null;if(s.contains(e)||s===e){this.previouslyActiveEl_=e;this.focus()}}conditionalBlur_(){if(this.previouslyActiveEl_){this.previouslyActiveEl_.focus();this.previouslyActiveEl_=null}}handleKeyDown(e){
/**
     * Fired a custom keyDown event that bubbles.
     *
     * @event ModalDialog#modalKeydown
     * @type {Event}
     */
this.trigger({type:"modalKeydown",originalEvent:e,target:this,bubbles:true});e.stopPropagation();if(e.key==="Escape"&&this.closeable()){e.preventDefault();this.close();return}if(e.key!=="Tab")return;const s=this.focusableEls_();const i=this.el_.querySelector(":focus");let n;for(let e=0;e<s.length;e++)if(i===s[e]){n=e;break}t.activeElement===this.el_&&(n=0);if(e.shiftKey&&n===0){s[s.length-1].focus();e.preventDefault()}else if(!e.shiftKey&&n===s.length-1){s[0].focus();e.preventDefault()}}focusableEls_(){const t=this.el_.querySelectorAll("*");return Array.prototype.filter.call(t,(t=>(t instanceof e.HTMLAnchorElement||t instanceof e.HTMLAreaElement)&&t.hasAttribute("href")||(t instanceof e.HTMLInputElement||t instanceof e.HTMLSelectElement||t instanceof e.HTMLTextAreaElement||t instanceof e.HTMLButtonElement)&&!t.hasAttribute("disabled")||t instanceof e.HTMLIFrameElement||t instanceof e.HTMLObjectElement||t instanceof e.HTMLEmbedElement||t.hasAttribute("tabindex")&&t.getAttribute("tabindex")!==-1||t.hasAttribute("contenteditable")))}}
/**
 * Default options for `ModalDialog` default options.
 *
 * @type {Object}
 * @private
 */ModalDialog.prototype.options_={pauseOnOpen:true,temporary:true};Component$1.registerComponent("ModalDialog",ModalDialog);class TrackList extends EventTarget$2{
/**
   * Create an instance of this class
   *
   * @param { Track[] } tracks
   *        A list of tracks to initialize the list with.
   *
   * @abstract
   */
constructor(e=[]){super();this.tracks_=[];Object.defineProperty(this,"length",{get(){return this.tracks_.length}});for(let t=0;t<e.length;t++)this.addTrack(e[t])}
/**
   * Add a {@link Track} to the `TrackList`
   *
   * @param {Track} track
   *        The audio, video, or text track to add to the list.
   *
   * @fires TrackList#addtrack
   */addTrack(e){const t=this.tracks_.length;""+t in this||Object.defineProperty(this,t,{get(){return this.tracks_[t]}});if(this.tracks_.indexOf(e)===-1){this.tracks_.push(e);
/**
       * Triggered when a track is added to a track list.
       *
       * @event TrackList#addtrack
       * @type {Event}
       * @property {Track} track
       *           A reference to track that was added.
       */this.trigger({track:e,type:"addtrack",target:this})}
/**
     * Triggered when a track label is changed.
     *
     * @event TrackList#addtrack
     * @type {Event}
     * @property {Track} track
     *           A reference to track that was added.
     */e.labelchange_=()=>{this.trigger({track:e,type:"labelchange",target:this})};isEvented(e)&&e.addEventListener("labelchange",e.labelchange_)}
/**
   * Remove a {@link Track} from the `TrackList`
   *
   * @param {Track} rtrack
   *        The audio, video, or text track to remove from the list.
   *
   * @fires TrackList#removetrack
   */removeTrack(e){let t;for(let s=0,i=this.length;s<i;s++)if(this[s]===e){t=this[s];t.off&&t.off();this.tracks_.splice(s,1);break}t&&
/**
     * Triggered when a track is removed from track list.
     *
     * @event TrackList#removetrack
     * @type {Event}
     * @property {Track} track
     *           A reference to track that was removed.
     */
this.trigger({track:t,type:"removetrack",target:this})}
/**
   * Get a Track from the TrackList by a tracks id
   *
   * @param {string} id - the id of the track to get
   * @method getTrackById
   * @return {Track}
   * @private
   */getTrackById(e){let t=null;for(let s=0,i=this.length;s<i;s++){const i=this[s];if(i.id===e){t=i;break}}return t}}
/**
 * Triggered when a different track is selected/enabled.
 *
 * @event TrackList#change
 * @type {Event}
 */TrackList.prototype.allowedEvents_={change:"change",addtrack:"addtrack",removetrack:"removetrack",labelchange:"labelchange"};for(const e in TrackList.prototype.allowedEvents_)TrackList.prototype["on"+e]=null;
/**
 * Anywhere we call this function we diverge from the spec
 * as we only support one enabled audiotrack at a time
 *
 * @param {AudioTrackList} list
 *        list to work on
 *
 * @param {AudioTrack} track
 *        The track to skip
 *
 * @private
 */const disableOthers$1=function(e,t){for(let s=0;s<e.length;s++)Object.keys(e[s]).length&&t.id!==e[s].id&&(e[s].enabled=false)};class AudioTrackList extends TrackList{
/**
   * Create an instance of this class.
   *
   * @param {AudioTrack[]} [tracks=[]]
   *        A list of `AudioTrack` to instantiate the list with.
   */
constructor(e=[]){for(let t=e.length-1;t>=0;t--)if(e[t].enabled){disableOthers$1(e,e[t]);break}super(e);this.changing_=false}
/**
   * Add an {@link AudioTrack} to the `AudioTrackList`.
   *
   * @param {AudioTrack} track
   *        The AudioTrack to add to the list
   *
   * @fires TrackList#addtrack
   */addTrack(e){e.enabled&&disableOthers$1(this,e);super.addTrack(e);if(e.addEventListener){e.enabledChange_=()=>{if(!this.changing_){this.changing_=true;disableOthers$1(this,e);this.changing_=false;this.trigger("change")}};e.addEventListener("enabledchange",e.enabledChange_)}}removeTrack(e){super.removeTrack(e);if(e.removeEventListener&&e.enabledChange_){e.removeEventListener("enabledchange",e.enabledChange_);e.enabledChange_=null}}}
/**
 * Un-select all other {@link VideoTrack}s that are selected.
 *
 * @param {VideoTrackList} list
 *        list to work on
 *
 * @param {VideoTrack} track
 *        The track to skip
 *
 * @private
 */const disableOthers=function(e,t){for(let s=0;s<e.length;s++)Object.keys(e[s]).length&&t.id!==e[s].id&&(e[s].selected=false)};class VideoTrackList extends TrackList{
/**
   * Create an instance of this class.
   *
   * @param {VideoTrack[]} [tracks=[]]
   *        A list of `VideoTrack` to instantiate the list with.
   */
constructor(e=[]){for(let t=e.length-1;t>=0;t--)if(e[t].selected){disableOthers(e,e[t]);break}super(e);this.changing_=false;Object.defineProperty(this,"selectedIndex",{get(){for(let e=0;e<this.length;e++)if(this[e].selected)return e;return-1},set(){}})}
/**
   * Add a {@link VideoTrack} to the `VideoTrackList`.
   *
   * @param {VideoTrack} track
   *        The VideoTrack to add to the list
   *
   * @fires TrackList#addtrack
   */addTrack(e){e.selected&&disableOthers(this,e);super.addTrack(e);if(e.addEventListener){e.selectedChange_=()=>{if(!this.changing_){this.changing_=true;disableOthers(this,e);this.changing_=false;this.trigger("change")}};e.addEventListener("selectedchange",e.selectedChange_)}}removeTrack(e){super.removeTrack(e);if(e.removeEventListener&&e.selectedChange_){e.removeEventListener("selectedchange",e.selectedChange_);e.selectedChange_=null}}}class TextTrackList extends TrackList{
/**
   * Add a {@link TextTrack} to the `TextTrackList`
   *
   * @param {TextTrack} track
   *        The text track to add to the list.
   *
   * @fires TrackList#addtrack
   */
addTrack(e){super.addTrack(e);this.queueChange_||(this.queueChange_=()=>this.queueTrigger("change"));this.triggerSelectedlanguagechange||(this.triggerSelectedlanguagechange_=()=>this.trigger("selectedlanguagechange"));e.addEventListener("modechange",this.queueChange_);const t=["metadata","chapters"];t.indexOf(e.kind)===-1&&e.addEventListener("modechange",this.triggerSelectedlanguagechange_)}removeTrack(e){super.removeTrack(e);if(e.removeEventListener){this.queueChange_&&e.removeEventListener("modechange",this.queueChange_);this.selectedlanguagechange_&&e.removeEventListener("modechange",this.triggerSelectedlanguagechange_)}}}class HtmlTrackElementList{
/**
   * Create an instance of this class.
   *
   * @param {HtmlTrackElement[]} [tracks=[]]
   *        A list of `HtmlTrackElement` to instantiate the list with.
   */
constructor(e=[]){this.trackElements_=[];Object.defineProperty(this,"length",{get(){return this.trackElements_.length}});for(let t=0,s=e.length;t<s;t++)this.addTrackElement_(e[t])}
/**
   * Add an {@link HtmlTrackElement} to the `HtmlTrackElementList`
   *
   * @param {HtmlTrackElement} trackElement
   *        The track element to add to the list.
   *
   * @private
   */addTrackElement_(e){const t=this.trackElements_.length;""+t in this||Object.defineProperty(this,t,{get(){return this.trackElements_[t]}});this.trackElements_.indexOf(e)===-1&&this.trackElements_.push(e)}
/**
   * Get an {@link HtmlTrackElement} from the `HtmlTrackElementList` given an
   * {@link TextTrack}.
   *
   * @param {TextTrack} track
   *        The track associated with a track element.
   *
   * @return {HtmlTrackElement|undefined}
   *         The track element that was found or undefined.
   *
   * @private
   */getTrackElementByTrack_(e){let t;for(let s=0,i=this.trackElements_.length;s<i;s++)if(e===this.trackElements_[s].track){t=this.trackElements_[s];break}return t}
/**
   * Remove a {@link HtmlTrackElement} from the `HtmlTrackElementList`
   *
   * @param {HtmlTrackElement} trackElement
   *        The track element to remove from the list.
   *
   * @private
   */removeTrackElement_(e){for(let t=0,s=this.trackElements_.length;t<s;t++)if(e===this.trackElements_[t]){this.trackElements_[t].track&&typeof this.trackElements_[t].track.off==="function"&&this.trackElements_[t].track.off();typeof this.trackElements_[t].off==="function"&&this.trackElements_[t].off();this.trackElements_.splice(t,1);break}}}
/**
 * @typedef {Object} TextTrackCueList~TextTrackCue
 *
 * @property {string} id
 *           The unique id for this text track cue
 *
 * @property {number} startTime
 *           The start time for this text track cue
 *
 * @property {number} endTime
 *           The end time for this text track cue
 *
 * @property {boolean} pauseOnExit
 *           Pause when the end time is reached if true.
 *
 * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackcue}
 */class TextTrackCueList{
/**
   * Create an instance of this class..
   *
   * @param {Array} cues
   *        A list of cues to be initialized with
   */
constructor(e){TextTrackCueList.prototype.setCues_.call(this,e);Object.defineProperty(this,"length",{get(){return this.length_}})}
/**
   * A setter for cues in this list. Creates getters
   * an an index for the cues.
   *
   * @param {Array} cues
   *        An array of cues to set
   *
   * @private
   */setCues_(e){const t=this.length||0;let s=0;const i=e.length;this.cues_=e;this.length_=e.length;const defineProp=function(e){""+e in this||Object.defineProperty(this,""+e,{get(){return this.cues_[e]}})};if(t<i){s=t;for(;s<i;s++)defineProp.call(this,s)}}
/**
   * Get a `TextTrackCue` that is currently in the `TextTrackCueList` by id.
   *
   * @param {string} id
   *        The id of the cue that should be searched for.
   *
   * @return {TextTrackCueList~TextTrackCue|null}
   *         A single cue or null if none was found.
   */getCueById(e){let t=null;for(let s=0,i=this.length;s<i;s++){const i=this[s];if(i.id===e){t=i;break}}return t}}
/**
 * All possible `VideoTrackKind`s
 *
 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-videotrack-kind
 * @typedef VideoTrack~Kind
 * @enum
 */const De={alternative:"alternative",captions:"captions",main:"main",sign:"sign",subtitles:"subtitles",commentary:"commentary"};
/**
 * All possible `AudioTrackKind`s
 *
 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-audiotrack-kind
 * @typedef AudioTrack~Kind
 * @enum
 */const Oe={alternative:"alternative",descriptions:"descriptions",main:"main","main-desc":"main-desc",translation:"translation",commentary:"commentary"};
/**
 * All possible `TextTrackKind`s
 *
 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-texttrack-kind
 * @typedef TextTrack~Kind
 * @enum
 */const Me={subtitles:"subtitles",captions:"captions",descriptions:"descriptions",chapters:"chapters",metadata:"metadata"};
/**
 * All possible `TextTrackMode`s
 *
 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackmode
 * @typedef TextTrack~Mode
 * @enum
 */const Ue={disabled:"disabled",hidden:"hidden",showing:"showing"};class Track extends EventTarget$2{
/**
   * Create an instance of this class.
   *
   * @param {Object} [options={}]
   *        Object of option names and values
   *
   * @param {string} [options.kind='']
   *        A valid kind for the track type you are creating.
   *
   * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
   *        A unique id for this AudioTrack.
   *
   * @param {string} [options.label='']
   *        The menu label for this track.
   *
   * @param {string} [options.language='']
   *        A valid two character language code.
   *
   * @abstract
   */
constructor(e={}){super();const t={id:e.id||"vjs_track_"+newGUID(),kind:e.kind||"",language:e.language||""};let s=e.label||"";for(const e in t)Object.defineProperty(this,e,{get(){return t[e]},set(){}});Object.defineProperty(this,"label",{get(){return s},set(e){if(e!==s){s=e;
/**
           * An event that fires when label changes on this track.
           *
           * > Note: This is not part of the spec!
           *
           * @event Track#labelchange
           * @type {Event}
           */this.trigger("labelchange")}}})}}
/**
 * Resolve and parse the elements of a URL.
 *
 * @function
 * @param    {string} url
 *           The url to parse
 *
 * @return   {URL}
 *           An object of url details
 */const parseUrl=function(e){return new URL(e,t.baseURI)};
/**
 * Get absolute version of relative URL.
 *
 * @function
 * @param    {string} url
 *           URL to make absolute
 *
 * @return   {string}
 *           Absolute URL
 */const getAbsoluteURL=function(e){return new URL(e,t.baseURI).href};
/**
 * Returns the extension of the passed file name. It will return an empty string
 * if passed an invalid path.
 *
 * @function
 * @param    {string} path
 *           The fileName path like '/path/to/file.mp4'
 *
 * @return  {string}
 *           The extension in lower case or an empty string if no
 *           extension could be found.
 */const getFileExtension=function(e){if(typeof e==="string"){const t=/^(\/?)([\s\S]*?)((?:\.{1,2}|[^\/]+?)(\.([^\.\/\?]+)))(?:[\/]*|[\?].*)$/;const s=t.exec(e);if(s)return s.pop().toLowerCase()}return""};
/**
 * Returns whether the url passed is a cross domain request or not.
 *
 * @function
 * @param    {string} url
 *           The url to check.
 *
 * @param    {URL} [winLoc]
 *           the domain to check the url against, defaults to window.location
 *
 * @return   {boolean}
 *           Whether it is a cross domain request or not.
 */const isCrossOrigin=function(t,s=e.location){return parseUrl(t).origin!==s.origin};var Re=Object.freeze({__proto__:null,parseUrl:parseUrl,getAbsoluteURL:getAbsoluteURL,getFileExtension:getFileExtension,isCrossOrigin:isCrossOrigin});
/**
 * Takes a webvtt file contents and parses it into cues
 *
 * @param {string} srcContent
 *        webVTT file contents
 *
 * @param {TextTrack} track
 *        TextTrack to add cues to. Cues come from the srcContent.
 *
 * @private
 */const parseCues=function(t,s){const i=new e.WebVTT.Parser(e,e.vttjs,e.WebVTT.StringDecoder());const n=[];i.oncue=function(e){s.addCue(e)};i.onparsingerror=function(e){n.push(e)};i.onflush=function(){s.trigger({type:"loadeddata",target:s})};i.parse(t);if(n.length>0){e.console&&e.console.groupCollapsed&&e.console.groupCollapsed(`Text Track parsing errors for ${s.src}`);n.forEach((e=>B.error(e)));e.console&&e.console.groupEnd&&e.console.groupEnd()}i.flush()};
/**
 * Load a `TextTrack` from a specified url.
 *
 * @param {string} src
 *        Url to load track from.
 *
 * @param {TextTrack} track
 *        Track to add cues to. Comes from the content at the end of `url`.
 *
 * @private
 */const loadTrack=function(t,i){const n={uri:t};const r=isCrossOrigin(t);r&&(n.cors=r);const a=i.tech_.crossOrigin()==="use-credentials";a&&(n.withCredentials=a);s(n,bind_(this,(function(t,s,n){if(t)return B.error(t,s);i.loaded_=true;typeof e.WebVTT!=="function"?i.tech_&&i.tech_.any(["vttjsloaded","vttjserror"],(e=>{if(e.type!=="vttjserror")return parseCues(n,i);B.error(`vttjs failed to load, stopping trying to process ${i.src}`)})):parseCues(n,i)})))};class TextTrack extends Track{
/**
   * Create an instance of this class.
   *
   * @param {Object} options={}
   *        Object of option names and values
   *
   * @param {Tech} options.tech
   *        A reference to the tech that owns this TextTrack.
   *
   * @param {TextTrack~Kind} [options.kind='subtitles']
   *        A valid text track kind.
   *
   * @param {TextTrack~Mode} [options.mode='disabled']
   *        A valid text track mode.
   *
   * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
   *        A unique id for this TextTrack.
   *
   * @param {string} [options.label='']
   *        The menu label for this track.
   *
   * @param {string} [options.language='']
   *        A valid two character language code.
   *
   * @param {string} [options.srclang='']
   *        A valid two character language code. An alternative, but deprioritized
   *        version of `options.language`
   *
   * @param {string} [options.src]
   *        A url to TextTrack cues.
   *
   * @param {boolean} [options.default]
   *        If this track should default to on or off.
   */
constructor(e={}){if(!e.tech)throw new Error("A tech was not provided.");const t=merge$1(e,{kind:Me[e.kind]||"subtitles",language:e.language||e.srclang||""});let s=Ue[t.mode]||"disabled";const i=t.default;t.kind!=="metadata"&&t.kind!=="chapters"||(s="hidden");super(t);this.tech_=t.tech;this.cues_=[];this.activeCues_=[];this.preload_=this.tech_.preloadTextTracks!==false;const n=new TextTrackCueList(this.cues_);const r=new TextTrackCueList(this.activeCues_);let a=false;this.timeupdateHandler=bind_(this,(function(e={}){if(!this.tech_.isDisposed())if(this.tech_.isReady_){this.activeCues=this.activeCues;if(a){this.trigger("cuechange");a=false}e.type!=="timeupdate"&&(this.rvf_=this.tech_.requestVideoFrameCallback(this.timeupdateHandler))}else e.type!=="timeupdate"&&(this.rvf_=this.tech_.requestVideoFrameCallback(this.timeupdateHandler))}));const disposeHandler=()=>{this.stopTracking()};this.tech_.one("dispose",disposeHandler);s!=="disabled"&&this.startTracking();Object.defineProperties(this,{default:{get(){return i},set(){}},mode:{get(){return s},set(e){if(Ue[e]&&s!==e){s=e;this.preload_||s==="disabled"||this.cues.length!==0||loadTrack(this.src,this);this.stopTracking();s!=="disabled"&&this.startTracking()
/**
           * An event that fires when mode changes on this track. This allows
           * the TextTrackList that holds this track to act accordingly.
           *
           * > Note: This is not part of the spec!
           *
           * @event TextTrack#modechange
           * @type {Event}
           */;this.trigger("modechange")}}},cues:{get(){return this.loaded_?n:null},set(){}},activeCues:{get(){if(!this.loaded_)return null;if(this.cues.length===0)return r;const e=this.tech_.currentTime();const t=[];for(let s=0,i=this.cues.length;s<i;s++){const i=this.cues[s];i.startTime<=e&&i.endTime>=e&&t.push(i)}a=false;if(t.length!==this.activeCues_.length)a=true;else for(let e=0;e<t.length;e++)this.activeCues_.indexOf(t[e])===-1&&(a=true);this.activeCues_=t;r.setCues_(this.activeCues_);return r},set(){}}});if(t.src){this.src=t.src;this.preload_||(this.loaded_=true);(this.preload_||t.kind!=="subtitles"&&t.kind!=="captions")&&loadTrack(this.src,this)}else this.loaded_=true}startTracking(){this.rvf_=this.tech_.requestVideoFrameCallback(this.timeupdateHandler);this.tech_.on("timeupdate",this.timeupdateHandler)}stopTracking(){if(this.rvf_){this.tech_.cancelVideoFrameCallback(this.rvf_);this.rvf_=void 0}this.tech_.off("timeupdate",this.timeupdateHandler)}
/**
   * Add a cue to the internal list of cues.
   *
   * @param {TextTrack~Cue} cue
   *        The cue to add to our internal list
   */addCue(t){let s=t;if(!("getCueAsHTML"in s)){s=new e.vttjs.VTTCue(t.startTime,t.endTime,t.text);for(const e in t)e in s||(s[e]=t[e]);s.id=t.id;s.originalCue_=t}const i=this.tech_.textTracks();for(let e=0;e<i.length;e++)i[e]!==this&&i[e].removeCue(s);this.cues_.push(s);this.cues.setCues_(this.cues_)}
/**
   * Remove a cue from our internal list
   *
   * @param {TextTrack~Cue} removeCue
   *        The cue to remove from our internal list
   */removeCue(e){let t=this.cues_.length;while(t--){const s=this.cues_[t];if(s===e||s.originalCue_&&s.originalCue_===e){this.cues_.splice(t,1);this.cues.setCues_(this.cues_);break}}}}TextTrack.prototype.allowedEvents_={cuechange:"cuechange"};class AudioTrack extends Track{
/**
   * Create an instance of this class.
   *
   * @param {Object} [options={}]
   *        Object of option names and values
   *
   * @param {AudioTrack~Kind} [options.kind='']
   *        A valid audio track kind
   *
   * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
   *        A unique id for this AudioTrack.
   *
   * @param {string} [options.label='']
   *        The menu label for this track.
   *
   * @param {string} [options.language='']
   *        A valid two character language code.
   *
   * @param {boolean} [options.enabled]
   *        If this track is the one that is currently playing. If this track is part of
   *        an {@link AudioTrackList}, only one {@link AudioTrack} will be enabled.
   */
constructor(e={}){const t=merge$1(e,{kind:Oe[e.kind]||""});super(t);let s=false;Object.defineProperty(this,"enabled",{get(){return s},set(e){if(typeof e==="boolean"&&e!==s){s=e;
/**
         * An event that fires when enabled changes on this track. This allows
         * the AudioTrackList that holds this track to act accordingly.
         *
         * > Note: This is not part of the spec! Native tracks will do
         *         this internally without an event.
         *
         * @event AudioTrack#enabledchange
         * @type {Event}
         */this.trigger("enabledchange")}}});t.enabled&&(this.enabled=t.enabled);this.loaded_=true}}class VideoTrack extends Track{
/**
   * Create an instance of this class.
   *
   * @param {Object} [options={}]
   *        Object of option names and values
   *
   * @param {string} [options.kind='']
   *        A valid {@link VideoTrack~Kind}
   *
   * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
   *        A unique id for this AudioTrack.
   *
   * @param {string} [options.label='']
   *        The menu label for this track.
   *
   * @param {string} [options.language='']
   *        A valid two character language code.
   *
   * @param {boolean} [options.selected]
   *        If this track is the one that is currently playing.
   */
constructor(e={}){const t=merge$1(e,{kind:De[e.kind]||""});super(t);let s=false;Object.defineProperty(this,"selected",{get(){return s},set(e){if(typeof e==="boolean"&&e!==s){s=e;
/**
         * An event that fires when selected changes on this track. This allows
         * the VideoTrackList that holds this track to act accordingly.
         *
         * > Note: This is not part of the spec! Native tracks will do
         *         this internally without an event.
         *
         * @event VideoTrack#selectedchange
         * @type {Event}
         */this.trigger("selectedchange")}}});t.selected&&(this.selected=t.selected)}}class HTMLTrackElement extends EventTarget$2{
/**
   * Create an instance of this class.
   *
   * @param {Object} options={}
   *        Object of option names and values
   *
   * @param {Tech} options.tech
   *        A reference to the tech that owns this HTMLTrackElement.
   *
   * @param {TextTrack~Kind} [options.kind='subtitles']
   *        A valid text track kind.
   *
   * @param {TextTrack~Mode} [options.mode='disabled']
   *        A valid text track mode.
   *
   * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
   *        A unique id for this TextTrack.
   *
   * @param {string} [options.label='']
   *        The menu label for this track.
   *
   * @param {string} [options.language='']
   *        A valid two character language code.
   *
   * @param {string} [options.srclang='']
   *        A valid two character language code. An alternative, but deprioritized
   *        version of `options.language`
   *
   * @param {string} [options.src]
   *        A url to TextTrack cues.
   *
   * @param {boolean} [options.default]
   *        If this track should default to on or off.
   */
constructor(e={}){super();let t;const s=new TextTrack(e);this.kind=s.kind;this.src=s.src;this.srclang=s.language;this.label=s.label;this.default=s.default;Object.defineProperties(this,{readyState:{get(){return t}},track:{get(){return s}}});t=HTMLTrackElement.NONE;s.addEventListener("loadeddata",(()=>{t=HTMLTrackElement.LOADED;this.trigger({type:"load",target:this})}))}}HTMLTrackElement.prototype.allowedEvents_={load:"load"};
/**
 * The text track not loaded state.
 *
 * @type {number}
 * @static
 */HTMLTrackElement.NONE=0;
/**
 * The text track loading state.
 *
 * @type {number}
 * @static
 */HTMLTrackElement.LOADING=1;
/**
 * The text track loaded state.
 *
 * @type {number}
 * @static
 */HTMLTrackElement.LOADED=2;
/**
 * The text track failed to load state.
 *
 * @type {number}
 * @static
 */HTMLTrackElement.ERROR=3;const Be={audio:{ListClass:AudioTrackList,TrackClass:AudioTrack,capitalName:"Audio"},video:{ListClass:VideoTrackList,TrackClass:VideoTrack,capitalName:"Video"},text:{ListClass:TextTrackList,TrackClass:TextTrack,capitalName:"Text"}};Object.keys(Be).forEach((function(e){Be[e].getterName=`${e}Tracks`;Be[e].privateName=`${e}Tracks_`}));const je={remoteText:{ListClass:TextTrackList,TrackClass:TextTrack,capitalName:"RemoteText",getterName:"remoteTextTracks",privateName:"remoteTextTracks_"},remoteTextEl:{ListClass:HtmlTrackElementList,TrackClass:HTMLTrackElement,capitalName:"RemoteTextTrackEls",getterName:"remoteTextTrackEls",privateName:"remoteTextTrackEls_"}};const Fe=Object.assign({},Be,je);je.names=Object.keys(je);Be.names=Object.keys(Be);Fe.names=[].concat(je.names).concat(Be.names);
/**
 * An Object containing a structure like: `{src: 'url', type: 'mimetype'}` or string
 * that just contains the src url alone.
 * * `var SourceObject = {src: 'http://ex.com/video.mp4', type: 'video/mp4'};`
   * `var SourceString = 'http://example.com/some-video.mp4';`
 *
 * @typedef {Object|string} SourceObject
 *
 * @property {string} src
 *           The url to the source
 *
 * @property {string} type
 *           The mime type of the source
 */
/**
 * A function used by {@link Tech} to create a new {@link TextTrack}.
 *
 * @private
 *
 * @param {Tech} self
 *        An instance of the Tech class.
 *
 * @param {string} kind
 *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata)
 *
 * @param {string} [label]
 *        Label to identify the text track
 *
 * @param {string} [language]
 *        Two letter language abbreviation
 *
 * @param {Object} [options={}]
 *        An object with additional text track options
 *
 * @return {TextTrack}
 *          The text track that was created.
 */function createTrackHelper(e,t,s,i,n={}){const r=e.textTracks();n.kind=t;s&&(n.label=s);i&&(n.language=i);n.tech=e;const a=new Fe.text.TrackClass(n);r.addTrack(a);return a}class Tech extends Component$1{
/**
  * Create an instance of this Tech.
  *
  * @param {Object} [options]
  *        The key/value store of player options.
  *
  * @param {Function} [ready]
  *        Callback function to call when the `HTML5` Tech is ready.
  */
constructor(e={},t=function(){}){e.reportTouchActivity=false;super(null,e,t);this.onDurationChange_=e=>this.onDurationChange(e);this.trackProgress_=e=>this.trackProgress(e);this.trackCurrentTime_=e=>this.trackCurrentTime(e);this.stopTrackingCurrentTime_=e=>this.stopTrackingCurrentTime(e);this.disposeSourceHandler_=e=>this.disposeSourceHandler(e);this.queuedHanders_=new Set;this.hasStarted_=false;this.on("playing",(function(){this.hasStarted_=true}));this.on("loadstart",(function(){this.hasStarted_=false}));Fe.names.forEach((t=>{const s=Fe[t];e&&e[s.getterName]&&(this[s.privateName]=e[s.getterName])}));this.featuresProgressEvents||this.manualProgressOn();this.featuresTimeupdateEvents||this.manualTimeUpdatesOn();["Text","Audio","Video"].forEach((t=>{e[`native${t}Tracks`]===false&&(this[`featuresNative${t}Tracks`]=false)}));e.nativeCaptions===false||e.nativeTextTracks===false?this.featuresNativeTextTracks=false:e.nativeCaptions!==true&&e.nativeTextTracks!==true||(this.featuresNativeTextTracks=true);this.featuresNativeTextTracks||this.emulateTextTracks();this.preloadTextTracks=e.preloadTextTracks!==false;this.autoRemoteTextTracks_=new Fe.text.ListClass;this.initTrackListeners();e.nativeControlsForTouch||this.emitTapEvents();this.constructor&&(this.name_=this.constructor.name||"Unknown Tech")}
/**
   * A special function to trigger source set in a way that will allow player
   * to re-trigger if the player or tech are not ready yet.
   *
   * @fires Tech#sourceset
   * @param {string} src The source string at the time of the source changing.
   */triggerSourceset(e){this.isReady_||this.one("ready",(()=>this.setTimeout((()=>this.triggerSourceset(e)),1)))
/**
     * Fired when the source is set on the tech causing the media element
     * to reload.
     *
     * @see {@link Player#event:sourceset}
     * @event Tech#sourceset
     * @type {Event}
     */;this.trigger({src:e,type:"sourceset"})}manualProgressOn(){this.on("durationchange",this.onDurationChange_);this.manualProgress=true;this.one("ready",this.trackProgress_)}manualProgressOff(){this.manualProgress=false;this.stopTrackingProgress();this.off("durationchange",this.onDurationChange_)}
/**
   * This is used to trigger a `progress` event when the buffered percent changes. It
   * sets an interval function that will be called every 500 milliseconds to check if the
   * buffer end percent has changed.
   *
   * > This function is called by {@link Tech#manualProgressOn}
   *
   * @param {Event} event
   *        The `ready` event that caused this to run.
   *
   * @listens Tech#ready
   * @fires Tech#progress
   */trackProgress(e){this.stopTrackingProgress();this.progressInterval=this.setInterval(bind_(this,(function(){const e=this.bufferedPercent();this.bufferedPercent_!==e&&
/**
         * See {@link Player#progress}
         *
         * @event Tech#progress
         * @type {Event}
         */
this.trigger("progress");this.bufferedPercent_=e;e===1&&this.stopTrackingProgress()})),500)}
/**
   * Update our internal duration on a `durationchange` event by calling
   * {@link Tech#duration}.
   *
   * @param {Event} event
   *        The `durationchange` event that caused this to run.
   *
   * @listens Tech#durationchange
   */onDurationChange(e){this.duration_=this.duration()}buffered(){return createTimeRanges$1(0,0)}bufferedPercent(){return bufferedPercent(this.buffered(),this.duration_)}stopTrackingProgress(){this.clearInterval(this.progressInterval)}manualTimeUpdatesOn(){this.manualTimeUpdates=true;this.on("play",this.trackCurrentTime_);this.on("pause",this.stopTrackingCurrentTime_)}manualTimeUpdatesOff(){this.manualTimeUpdates=false;this.stopTrackingCurrentTime();this.off("play",this.trackCurrentTime_);this.off("pause",this.stopTrackingCurrentTime_)}trackCurrentTime(){this.currentTimeInterval&&this.stopTrackingCurrentTime();this.currentTimeInterval=this.setInterval((function(){
/**
       * Triggered at an interval of 250ms to indicated that time is passing in the video.
       *
       * @event Tech#timeupdate
       * @type {Event}
       */
this.trigger({type:"timeupdate",target:this,manuallyTriggered:true})}),250)}stopTrackingCurrentTime(){this.clearInterval(this.currentTimeInterval);this.trigger({type:"timeupdate",target:this,manuallyTriggered:true})}dispose(){this.clearTracks(Be.names);this.manualProgress&&this.manualProgressOff();this.manualTimeUpdates&&this.manualTimeUpdatesOff();super.dispose()}
/**
   * Clear out a single `TrackList` or an array of `TrackLists` given their names.
   *
   * > Note: Techs without source handlers should call this between sources for `video`
   *         & `audio` tracks. You don't want to use them between tracks!
   *
   * @param {string[]|string} types
   *        TrackList names to clear, valid names are `video`, `audio`, and
   *        `text`.
   */clearTracks(e){e=[].concat(e);e.forEach((e=>{const t=this[`${e}Tracks`]()||[];let s=t.length;while(s--){const i=t[s];e==="text"&&this.removeRemoteTextTrack(i);t.removeTrack(i)}}))}cleanupAutoTextTracks(){const e=this.autoRemoteTextTracks_||[];let t=e.length;while(t--){const s=e[t];this.removeRemoteTextTrack(s)}}reset(){}crossOrigin(){}
/**
   * Set the value of `crossOrigin` on the tech.
   *
   * @abstract
   *
   * @param {string} crossOrigin the crossOrigin value
   * @see {Html5#setCrossOrigin}
   */setCrossOrigin(){}
/**
   * Get or set an error on the Tech.
   *
   * @param {MediaError} [err]
   *        Error to set on the Tech
   *
   * @return {MediaError|null}
   *         The current error object on the tech, or null if there isn't one.
   */error(e){if(e!==void 0){this.error_=new MediaError(e);this.trigger("error")}return this.error_}played(){return this.hasStarted_?createTimeRanges$1(0,0):createTimeRanges$1()}play(){}
/**
   * Set whether we are scrubbing or not
   *
   * @abstract
   * @param {boolean} _isScrubbing
   *                  - true for we are currently scrubbing
   *                  - false for we are no longer scrubbing
   *
   * @see {Html5#setScrubbing}
   */setScrubbing(e){}scrubbing(){}
/**
   * Causes a manual time update to occur if {@link Tech#manualTimeUpdatesOn} was
   * previously called.
   *
   * @param {number} _seconds
   *        Set the current time of the media to this.
   * @fires Tech#timeupdate
   */setCurrentTime(e){this.manualTimeUpdates&&
/**
       * A manual `timeupdate` event.
       *
       * @event Tech#timeupdate
       * @type {Event}
       */
this.trigger({type:"timeupdate",target:this,manuallyTriggered:true})}initTrackListeners(){
/**
      * Triggered when tracks are added or removed on the Tech {@link AudioTrackList}
      *
      * @event Tech#audiotrackchange
      * @type {Event}
      */
/**
      * Triggered when tracks are added or removed on the Tech {@link VideoTrackList}
      *
      * @event Tech#videotrackchange
      * @type {Event}
      */
/**
      * Triggered when tracks are added or removed on the Tech {@link TextTrackList}
      *
      * @event Tech#texttrackchange
      * @type {Event}
      */
Be.names.forEach((e=>{const t=Be[e];const trackListChanges=()=>{this.trigger(`${e}trackchange`)};const s=this[t.getterName]();s.addEventListener("removetrack",trackListChanges);s.addEventListener("addtrack",trackListChanges);this.on("dispose",(()=>{s.removeEventListener("removetrack",trackListChanges);s.removeEventListener("addtrack",trackListChanges)}))}))}addWebVttScript_(){if(!e.WebVTT)if(t.body.contains(this.el())){if(!this.options_["vtt.js"]&&isPlain(i)&&Object.keys(i).length>0){this.trigger("vttjsloaded");return}const s=t.createElement("script");s.src=this.options_["vtt.js"]||"https://vjs.zencdn.net/vttjs/0.14.1/vtt.min.js";s.onload=()=>{
/**
         * Fired when vtt.js is loaded.
         *
         * @event Tech#vttjsloaded
         * @type {Event}
         */
this.trigger("vttjsloaded")};s.onerror=()=>{
/**
         * Fired when vtt.js was not loaded due to an error
         *
         * @event Tech#vttjsloaded
         * @type {Event}
         */
this.trigger("vttjserror")};this.on("dispose",(()=>{s.onload=null;s.onerror=null}));e.WebVTT=true;this.el().parentNode.appendChild(s)}else this.ready(this.addWebVttScript_)}emulateTextTracks(){const e=this.textTracks();const t=this.remoteTextTracks();const handleAddTrack=t=>e.addTrack(t.track);const handleRemoveTrack=t=>e.removeTrack(t.track);t.on("addtrack",handleAddTrack);t.on("removetrack",handleRemoveTrack);this.addWebVttScript_();const updateDisplay=()=>this.trigger("texttrackchange");const textTracksChanges=()=>{updateDisplay();for(let t=0;t<e.length;t++){const s=e[t];s.removeEventListener("cuechange",updateDisplay);s.mode==="showing"&&s.addEventListener("cuechange",updateDisplay)}};textTracksChanges();e.addEventListener("change",textTracksChanges);e.addEventListener("addtrack",textTracksChanges);e.addEventListener("removetrack",textTracksChanges);this.on("dispose",(function(){t.off("addtrack",handleAddTrack);t.off("removetrack",handleRemoveTrack);e.removeEventListener("change",textTracksChanges);e.removeEventListener("addtrack",textTracksChanges);e.removeEventListener("removetrack",textTracksChanges);for(let t=0;t<e.length;t++){const s=e[t];s.removeEventListener("cuechange",updateDisplay)}}))}
/**
   * Create and returns a remote {@link TextTrack} object.
   *
   * @param {string} kind
   *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata)
   *
   * @param {string} [label]
   *        Label to identify the text track
   *
   * @param {string} [language]
   *        Two letter language abbreviation
   *
   * @return {TextTrack}
   *         The TextTrack that gets created.
   */addTextTrack(e,t,s){if(!e)throw new Error("TextTrack kind is required but was not provided");return createTrackHelper(this,e,t,s)}
/**
   * Create an emulated TextTrack for use by addRemoteTextTrack
   *
   * This is intended to be overridden by classes that inherit from
   * Tech in order to create native or custom TextTracks.
   *
   * @param {Object} options
   *        The object should contain the options to initialize the TextTrack with.
   *
   * @param {string} [options.kind]
   *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata).
   *
   * @param {string} [options.label].
   *        Label to identify the text track
   *
   * @param {string} [options.language]
   *        Two letter language abbreviation.
   *
   * @return {HTMLTrackElement}
   *         The track element that gets created.
   */createRemoteTextTrack(e){const t=merge$1(e,{tech:this});return new je.remoteTextEl.TrackClass(t)}
/**
   * Creates a remote text track object and returns an html track element.
   *
   * > Note: This can be an emulated {@link HTMLTrackElement} or a native one.
   *
   * @param {Object} options
   *        See {@link Tech#createRemoteTextTrack} for more detailed properties.
   *
   * @param {boolean} [manualCleanup=false]
   *        - When false: the TextTrack will be automatically removed from the video
   *          element whenever the source changes
   *        - When True: The TextTrack will have to be cleaned up manually
   *
   * @return {HTMLTrackElement}
   *         An Html Track Element.
   *
   */addRemoteTextTrack(e={},t){const s=this.createRemoteTextTrack(e);typeof t!=="boolean"&&(t=false);this.remoteTextTrackEls().addTrackElement_(s);this.remoteTextTracks().addTrack(s.track);t===false&&this.ready((()=>this.autoRemoteTextTracks_.addTrack(s.track)));return s}
/**
   * Remove a remote text track from the remote `TextTrackList`.
   *
   * @param {TextTrack} track
   *        `TextTrack` to remove from the `TextTrackList`
   */removeRemoteTextTrack(e){const t=this.remoteTextTrackEls().getTrackElementByTrack_(e);this.remoteTextTrackEls().removeTrackElement_(t);this.remoteTextTracks().removeTrack(e);this.autoRemoteTextTracks_.removeTrack(e)}getVideoPlaybackQuality(){return{}}requestPictureInPicture(){return Promise.reject()}disablePictureInPicture(){return true}setDisablePictureInPicture(){}
/**
   * A fallback implementation of requestVideoFrameCallback using requestAnimationFrame
   *
   * @param {function} cb
   * @return {number} request id
   */requestVideoFrameCallback(e){const t=newGUID();if(!this.isReady_||this.paused()){this.queuedHanders_.add(t);this.one("playing",(()=>{if(this.queuedHanders_.has(t)){this.queuedHanders_.delete(t);e()}}))}else this.requestNamedAnimationFrame(t,e);return t}
/**
   * A fallback implementation of cancelVideoFrameCallback
   *
   * @param {number} id id of callback to be cancelled
   */cancelVideoFrameCallback(e){this.queuedHanders_.has(e)?this.queuedHanders_.delete(e):this.cancelNamedAnimationFrame(e)}setPoster(){}playsinline(){}setPlaysinline(){}
/**
   * Attempt to force override of native audio tracks.
   *
   * @param {boolean} override - If set to true native audio will be overridden,
   * otherwise native audio will potentially be used.
   *
   * @abstract
   */overrideNativeAudioTracks(e){}
/**
   * Attempt to force override of native video tracks.
   *
   * @param {boolean} override - If set to true native video will be overridden,
   * otherwise native video will potentially be used.
   *
   * @abstract
   */overrideNativeVideoTracks(e){}
/**
   * Check if the tech can support the given mime-type.
   *
   * The base tech does not support any type, but source handlers might
   * overwrite this.
   *
   * @param  {string} _type
   *         The mimetype to check for support
   *
   * @return {string}
   *         'probably', 'maybe', or empty string
   *
   * @see [Spec]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType}
   *
   * @abstract
   */canPlayType(e){return""}
/**
   * Check if the type is supported by this tech.
   *
   * The base tech does not support any type, but source handlers might
   * overwrite this.
   *
   * @param {string} _type
   *        The media type to check
   * @return {string} Returns the native video element's response
   */static canPlayType(e){return""}
/**
   * Check if the tech can support the given source
   *
   * @param {Object} srcObj
   *        The source object
   * @param {Object} options
   *        The options passed to the tech
   * @return {string} 'probably', 'maybe', or '' (empty string)
   */static canPlaySource(e,t){return Tech.canPlayType(e.type)}
/*
   * Return whether the argument is a Tech or not.
   * Can be passed either a Class like `Html5` or a instance like `player.tech_`
   *
   * @param {Object} component
   *        The item to check
   *
   * @return {boolean}
   *         Whether it is a tech or not
   *         - True if it is a tech
   *         - False if it is not
   */static isTech(e){return e.prototype instanceof Tech||e instanceof Tech||e===Tech}
/**
   * Registers a `Tech` into a shared list for videojs.
   *
   * @param {string} name
   *        Name of the `Tech` to register.
   *
   * @param {Object} tech
   *        The `Tech` class to register.
   */static registerTech(e,t){Tech.techs_||(Tech.techs_={});if(!Tech.isTech(t))throw new Error(`Tech ${e} must be a Tech`);if(!Tech.canPlayType)throw new Error("Techs must have a static canPlayType method on them");if(!Tech.canPlaySource)throw new Error("Techs must have a static canPlaySource method on them");e=toTitleCase$1(e);Tech.techs_[e]=t;Tech.techs_[toLowerCase(e)]=t;e!=="Tech"&&Tech.defaultTechOrder_.push(e);return t}
/**
   * Get a `Tech` from the shared list by name.
   *
   * @param {string} name
   *        `camelCase` or `TitleCase` name of the Tech to get
   *
   * @return {Tech|undefined}
   *         The `Tech` or undefined if there was no tech with the name requested.
   */static getTech(t){if(t){if(Tech.techs_&&Tech.techs_[t])return Tech.techs_[t];t=toTitleCase$1(t);if(e&&e.videojs&&e.videojs[t]){B.warn(`The ${t} tech was added to the videojs object when it should be registered using videojs.registerTech(name, tech)`);return e.videojs[t]}}}}
/**
 * Get the {@link VideoTrackList}
 *
 * @returns {VideoTrackList}
 * @method Tech.prototype.videoTracks
 */
/**
 * Get the {@link AudioTrackList}
 *
 * @returns {AudioTrackList}
 * @method Tech.prototype.audioTracks
 */
/**
 * Get the {@link TextTrackList}
 *
 * @returns {TextTrackList}
 * @method Tech.prototype.textTracks
 */
/**
 * Get the remote element {@link TextTrackList}
 *
 * @returns {TextTrackList}
 * @method Tech.prototype.remoteTextTracks
 */
/**
 * Get the remote element {@link HtmlTrackElementList}
 *
 * @returns {HtmlTrackElementList}
 * @method Tech.prototype.remoteTextTrackEls
 */Fe.names.forEach((function(e){const t=Fe[e];Tech.prototype[t.getterName]=function(){this[t.privateName]=this[t.privateName]||new t.ListClass;return this[t.privateName]}}));
/**
 * List of associated text tracks
 *
 * @type {TextTrackList}
 * @private
 * @property Tech#textTracks_
 */
/**
 * List of associated audio tracks.
 *
 * @type {AudioTrackList}
 * @private
 * @property Tech#audioTracks_
 */
/**
 * List of associated video tracks.
 *
 * @type {VideoTrackList}
 * @private
 * @property Tech#videoTracks_
 */
/**
 * Boolean indicating whether the `Tech` supports volume control.
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresVolumeControl=true;
/**
 * Boolean indicating whether the `Tech` supports muting volume.
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresMuteControl=true;
/**
 * Boolean indicating whether the `Tech` supports fullscreen resize control.
 * Resizing plugins using request fullscreen reloads the plugin
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresFullscreenResize=false;
/**
 * Boolean indicating whether the `Tech` supports changing the speed at which the video
 * plays. Examples:
 *   - Set player to play 2x (twice) as fast
 *   - Set player to play 0.5x (half) as fast
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresPlaybackRate=false;
/**
 * Boolean indicating whether the `Tech` supports the `progress` event.
 * This will be used to determine if {@link Tech#manualProgressOn} should be called.
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresProgressEvents=false;
/**
 * Boolean indicating whether the `Tech` supports the `sourceset` event.
 *
 * A tech should set this to `true` and then use {@link Tech#triggerSourceset}
 * to trigger a {@link Tech#event:sourceset} at the earliest time after getting
 * a new source.
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresSourceset=false;
/**
 * Boolean indicating whether the `Tech` supports the `timeupdate` event.
 * This will be used to determine if {@link Tech#manualTimeUpdates} should be called.
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresTimeupdateEvents=false;
/**
 * Boolean indicating whether the `Tech` supports the native `TextTrack`s.
 * This will help us integrate with native `TextTrack`s if the browser supports them.
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresNativeTextTracks=false;
/**
 * Boolean indicating whether the `Tech` supports `requestVideoFrameCallback`.
 *
 * @type {boolean}
 * @default
 */Tech.prototype.featuresVideoFrameCallback=false;
/**
 * A functional mixin for techs that want to use the Source Handler pattern.
 * Source handlers are scripts for handling specific formats.
 * The source handler pattern is used for adaptive formats (HLS, DASH) that
 * manually load video data and feed it into a Source Buffer (Media Source Extensions)
 * Example: `Tech.withSourceHandlers.call(MyTech);`
 *
 * @param {Tech} _Tech
 *        The tech to add source handler functions to.
 *
 * @mixes Tech~SourceHandlerAdditions
 */Tech.withSourceHandlers=function(e){
/**
   * Register a source handler
   *
   * @param {Function} handler
   *        The source handler class
   *
   * @param {number} [index]
   *        Register it at the following index
   */
e.registerSourceHandler=function(t,s){let i=e.sourceHandlers;i||(i=e.sourceHandlers=[]);s===void 0&&(s=i.length);i.splice(s,0,t)};
/**
   * Check if the tech can support the given type. Also checks the
   * Techs sourceHandlers.
   *
   * @param {string} type
   *         The mimetype to check.
   *
   * @return {string}
   *         'probably', 'maybe', or '' (empty string)
   */e.canPlayType=function(t){const s=e.sourceHandlers||[];let i;for(let e=0;e<s.length;e++){i=s[e].canPlayType(t);if(i)return i}return""};
/**
   * Returns the first source handler that supports the source.
   *
   * TODO: Answer question: should 'probably' be prioritized over 'maybe'
   *
   * @param {SourceObject} source
   *        The source object
   *
   * @param {Object} options
   *        The options passed to the tech
   *
   * @return {SourceHandler|null}
   *          The first source handler that supports the source or null if
   *          no SourceHandler supports the source
   */e.selectSourceHandler=function(t,s){const i=e.sourceHandlers||[];let n;for(let e=0;e<i.length;e++){n=i[e].canHandleSource(t,s);if(n)return i[e]}return null};
/**
   * Check if the tech can support the given source.
   *
   * @param {SourceObject} srcObj
   *        The source object
   *
   * @param {Object} options
   *        The options passed to the tech
   *
   * @return {string}
   *         'probably', 'maybe', or '' (empty string)
   */e.canPlaySource=function(t,s){const i=e.selectSourceHandler(t,s);return i?i.canHandleSource(t,s):""};const t=["seekable","seeking","duration"];t.forEach((function(e){const t=this[e];typeof t==="function"&&(this[e]=function(){return this.sourceHandler_&&this.sourceHandler_[e]?this.sourceHandler_[e].apply(this.sourceHandler_,arguments):t.apply(this,arguments)})}),e.prototype);
/**
   * Create a function for setting the source using a source object
   * and source handlers.
   * Should never be called unless a source handler was found.
   *
   * @param {SourceObject} source
   *        A source object with src and type keys
   */e.prototype.setSource=function(t){let s=e.selectSourceHandler(t,this.options_);s||(e.nativeSourceHandler?s=e.nativeSourceHandler:B.error("No source handler found for the current source."));this.disposeSourceHandler();this.off("dispose",this.disposeSourceHandler_);s!==e.nativeSourceHandler&&(this.currentSource_=t);this.sourceHandler_=s.handleSource(t,this,this.options_);this.one("dispose",this.disposeSourceHandler_)};e.prototype.disposeSourceHandler=function(){if(this.currentSource_){this.clearTracks(["audio","video"]);this.currentSource_=null}this.cleanupAutoTextTracks();if(this.sourceHandler_){this.sourceHandler_.dispose&&this.sourceHandler_.dispose();this.sourceHandler_=null}}};Component$1.registerComponent("Tech",Tech);Tech.registerTech("Tech",Tech);Tech.defaultTechOrder_=[];const Ne={};const $e={};const He={};
/**
 * A middleware object is a plain JavaScript object that has methods that
 * match the {@link Tech} methods found in the lists of allowed
 * {@link module:middleware.allowedGetters|getters},
 * {@link module:middleware.allowedSetters|setters}, and
 * {@link module:middleware.allowedMediators|mediators}.
 *
 * @typedef {Object} MiddlewareObject
 */
/**
 * A middleware factory function that should return a
 * {@link module:middleware~MiddlewareObject|MiddlewareObject}.
 *
 * This factory will be called for each player when needed, with the player
 * passed in as an argument.
 *
 * @callback MiddlewareFactory
 * @param {Player} player
 *        A Video.js player.
 */
/**
 * Define a middleware that the player should use by way of a factory function
 * that returns a middleware object.
 *
 * @param  {string} type
 *         The MIME type to match or `"*"` for all MIME types.
 *
 * @param  {MiddlewareFactory} middleware
 *         A middleware factory function that will be executed for
 *         matching types.
 */function use(e,t){Ne[e]=Ne[e]||[];Ne[e].push(t)}
/**
 * Asynchronously sets a source using middleware by recursing through any
 * matching middlewares and calling `setSource` on each, passing along the
 * previous returned value each time.
 *
 * @param  {Player} player
 *         A {@link Player} instance.
 *
 * @param  {Tech~SourceObject} src
 *         A source object.
 *
 * @param  {Function}
 *         The next middleware to run.
 */function setSource(e,t,s){e.setTimeout((()=>setSourceHelper(t,Ne[t.type],s,e)),1)}
/**
 * When the tech is set, passes the tech to each middleware's `setTech` method.
 *
 * @param {Object[]} middleware
 *        An array of middleware instances.
 *
 * @param {Tech} tech
 *        A Video.js tech.
 */function setTech(e,t){e.forEach((e=>e.setTech&&e.setTech(t)))}
/**
 * Calls a getter on the tech first, through each middleware
 * from right to left to the player.
 *
 * @param  {Object[]} middleware
 *         An array of middleware instances.
 *
 * @param  {Tech} tech
 *         The current tech.
 *
 * @param  {string} method
 *         A method name.
 *
 * @return {*}
 *         The final value from the tech after middleware has intercepted it.
 */function get(e,t,s){return e.reduceRight(middlewareIterator(s),t[s]())}
/**
 * Takes the argument given to the player and calls the setter method on each
 * middleware from left to right to the tech.
 *
 * @param  {Object[]} middleware
 *         An array of middleware instances.
 *
 * @param  {Tech} tech
 *         The current tech.
 *
 * @param  {string} method
 *         A method name.
 *
 * @param  {*} arg
 *         The value to set on the tech.
 *
 * @return {*}
 *         The return value of the `method` of the `tech`.
 */function set(e,t,s,i){return t[s](e.reduce(middlewareIterator(s),i))}
/**
 * Takes the argument given to the player and calls the `call` version of the
 * method on each middleware from left to right.
 *
 * Then, call the passed in method on the tech and return the result unchanged
 * back to the player, through middleware, this time from right to left.
 *
 * @param  {Object[]} middleware
 *         An array of middleware instances.
 *
 * @param  {Tech} tech
 *         The current tech.
 *
 * @param  {string} method
 *         A method name.
 *
 * @param  {*} arg
 *         The value to set on the tech.
 *
 * @return {*}
 *         The return value of the `method` of the `tech`, regardless of the
 *         return values of middlewares.
 */function mediate(e,t,s,i=null){const n="call"+toTitleCase$1(s);const r=e.reduce(middlewareIterator(n),i);const a=r===He;const o=a?null:t[s](r);executeRight(e,s,o,a);return o}
/**
 * Enumeration of allowed getters where the keys are method names.
 *
 * @type {Object}
 */const qe={buffered:1,currentTime:1,duration:1,muted:1,played:1,paused:1,seekable:1,volume:1,ended:1};
/**
 * Enumeration of allowed setters where the keys are method names.
 *
 * @type {Object}
 */const Ve={setCurrentTime:1,setMuted:1,setVolume:1};
/**
 * Enumeration of allowed mediators where the keys are method names.
 *
 * @type {Object}
 */const ze={play:1,pause:1};function middlewareIterator(e){return(t,s)=>t===He?He:s[e]?s[e](t):t}function executeRight(e,t,s,i){for(let n=e.length-1;n>=0;n--){const r=e[n];r[t]&&r[t](i,s)}}
/**
 * Clear the middleware cache for a player.
 *
 * @param  {Player} player
 *         A {@link Player} instance.
 */function clearCacheForPlayer(e){$e.hasOwnProperty(e.id())&&delete $e[e.id()]}function getOrCreateFactory(e,t){const s=$e[e.id()];let i=null;if(s===void 0||s===null){i=t(e);$e[e.id()]=[[t,i]];return i}for(let e=0;e<s.length;e++){const[n,r]=s[e];n===t&&(i=r)}if(i===null){i=t(e);s.push([t,i])}return i}function setSourceHelper(e={},t=[],s,i,n=[],r=false){const[a,...o]=t;if(typeof a==="string")setSourceHelper(e,Ne[a],s,i,n,r);else if(a){const t=getOrCreateFactory(i,a);if(!t.setSource){n.push(t);return setSourceHelper(e,o,s,i,n,r)}t.setSource(Object.assign({},e),(function(a,l){if(a)return setSourceHelper(e,o,s,i,n,r);n.push(t);setSourceHelper(l,e.type===l.type?o:Ne[l.type],s,i,n,r)}))}else o.length?setSourceHelper(e,o,s,i,n,r):r?s(e,n):setSourceHelper(e,Ne["*"],s,i,n,true)}
/**
 * Mimetypes
 *
 * @see https://www.iana.org/assignments/media-types/media-types.xhtml
 * @typedef Mimetypes~Kind
 * @enum
 */const We={opus:"video/ogg",ogv:"video/ogg",mp4:"video/mp4",mov:"video/mp4",m4v:"video/mp4",mkv:"video/x-matroska",m4a:"audio/mp4",mp3:"audio/mpeg",aac:"audio/aac",caf:"audio/x-caf",flac:"audio/flac",oga:"audio/ogg",wav:"audio/wav",m3u8:"application/x-mpegURL",mpd:"application/dash+xml",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",png:"image/png",svg:"image/svg+xml",webp:"image/webp"};
/**
 * Get the mimetype of a given src url if possible
 *
 * @param {string} src
 *        The url to the src
 *
 * @return {string}
 *         return the mimetype if it was known or empty string otherwise
 */const getMimetype=function(e=""){const t=getFileExtension(e);const s=We[t.toLowerCase()];return s||""};
/**
 * Find the mime type of a given source string if possible. Uses the player
 * source cache.
 *
 * @param {Player} player
 *        The player object
 *
 * @param {string} src
 *        The source string
 *
 * @return {string}
 *         The type that was found
 */const findMimetype=(e,t)=>{if(!t)return"";if(e.cache_.source.src===t&&e.cache_.source.type)return e.cache_.source.type;const s=e.cache_.sources.filter((e=>e.src===t));if(s.length)return s[0].type;const i=e.$$("source");for(let e=0;e<i.length;e++){const s=i[e];if(s.type&&s.src&&s.src===t)return s.type}return getMimetype(t)};
/**
 * Filter out single bad source objects or multiple source objects in an
 * array. Also flattens nested source object arrays into a 1 dimensional
 * array of source objects.
 *
 * @param {Tech~SourceObject|Tech~SourceObject[]} src
 *        The src object to filter
 *
 * @return {Tech~SourceObject[]}
 *         An array of sourceobjects containing only valid sources
 *
 * @private
 */const filterSource=function(e){if(Array.isArray(e)){let t=[];e.forEach((function(e){e=filterSource(e);Array.isArray(e)?t=t.concat(e):isObject(e)&&t.push(e)}));e=t}else e=typeof e==="string"&&e.trim()?[fixSource({src:e})]:isObject(e)&&typeof e.src==="string"&&e.src&&e.src.trim()?[fixSource(e)]:[];return e};
/**
 * Checks src mimetype, adding it when possible
 *
 * @param {Tech~SourceObject} src
 *        The src object to check
 * @return {Tech~SourceObject}
 *        src Object with known type
 */function fixSource(e){if(!e.type){const t=getMimetype(e.src);t&&(e.type=t)}return e}var Ge='<svg xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-play">\n      <path d="M16 10v28l22-14z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-pause">\n      <path d="M12 38h8V10h-8v28zm16-28v28h8V10h-8z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-audio">\n      <path d="M24 2C14.06 2 6 10.06 6 20v14c0 3.31 2.69 6 6 6h6V24h-8v-4c0-7.73 6.27-14 14-14s14 6.27 14 14v4h-8v16h6c3.31 0 6-2.69 6-6V20c0-9.94-8.06-18-18-18z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-captions">\n      <path d="M38 8H10c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zM22 22h-3v-1h-4v6h4v-1h3v2a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2zm14 0h-3v-1h-4v6h4v-1h3v2a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-subtitles">\n      <path d="M40 8H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zM8 24h8v4H8v-4zm20 12H8v-4h20v4zm12 0h-8v-4h8v4zm0-8H20v-4h20v4z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-fullscreen-enter">\n      <path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-fullscreen-exit">\n      <path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-play-circle">\n      <path d="M20 33l12-9-12-9v18zm4-29C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-volume-mute">\n      <path d="M33 24c0-3.53-2.04-6.58-5-8.05v4.42l4.91 4.91c.06-.42.09-.85.09-1.28zm5 0c0 1.88-.41 3.65-1.08 5.28l3.03 3.03C41.25 29.82 42 27 42 24c0-8.56-5.99-15.72-14-17.54v4.13c5.78 1.72 10 7.07 10 13.41zM8.55 6L6 8.55 15.45 18H6v12h8l10 10V26.55l8.51 8.51c-1.34 1.03-2.85 1.86-4.51 2.36v4.13a17.94 17.94 0 0 0 7.37-3.62L39.45 42 42 39.45l-18-18L8.55 6zM24 8l-4.18 4.18L24 16.36V8z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-volume-low">\n      <path d="M14 18v12h8l10 10V8L22 18h-8z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-volume-medium">\n      <path d="M37 24c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zm-27-6v12h8l10 10V8L18 18h-8z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-volume-high">\n      <path d="M6 18v12h8l10 10V8L14 18H6zm27 6c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zM28 6.46v4.13c5.78 1.72 10 7.07 10 13.41s-4.22 11.69-10 13.41v4.13c8.01-1.82 14-8.97 14-17.54S36.01 8.28 28 6.46z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-spinner">\n      <path d="M18.8 21l9.53-16.51C26.94 4.18 25.49 4 24 4c-4.8 0-9.19 1.69-12.64 4.51l7.33 12.69.11-.2zm24.28-3c-1.84-5.85-6.3-10.52-11.99-12.68L23.77 18h19.31zm.52 2H28.62l.58 1 9.53 16.5C41.99 33.94 44 29.21 44 24c0-1.37-.14-2.71-.4-4zm-26.53 4l-7.8-13.5C6.01 14.06 4 18.79 4 24c0 1.37.14 2.71.4 4h14.98l-2.31-4zM4.92 30c1.84 5.85 6.3 10.52 11.99 12.68L24.23 30H4.92zm22.54 0l-7.8 13.51c1.4.31 2.85.49 4.34.49 4.8 0 9.19-1.69 12.64-4.51L29.31 26.8 27.46 30z"></path>\n    </symbol>\n    <symbol viewBox="0 0 24 24" id="vjs-icon-hd">\n      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm2-6h4c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1h-4V9zm1.5 4.5h2v-3h-2v3z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-chapters">\n      <path d="M6 26h4v-4H6v4zm0 8h4v-4H6v4zm0-16h4v-4H6v4zm8 8h28v-4H14v4zm0 8h28v-4H14v4zm0-20v4h28v-4H14z"></path>\n    </symbol>\n    <symbol viewBox="0 0 40 40" id="vjs-icon-downloading">\n      <path d="M18.208 36.875q-3.208-.292-5.979-1.729-2.771-1.438-4.812-3.729-2.042-2.292-3.188-5.229-1.146-2.938-1.146-6.23 0-6.583 4.334-11.416 4.333-4.834 10.833-5.5v3.166q-5.167.75-8.583 4.646Q6.25 14.75 6.25 19.958q0 5.209 3.396 9.104 3.396 3.896 8.562 4.646zM20 28.417L11.542 20l2.083-2.083 4.917 4.916v-11.25h2.916v11.25l4.875-4.916L28.417 20zm1.792 8.458v-3.167q1.833-.25 3.541-.958 1.709-.708 3.167-1.875l2.333 2.292q-1.958 1.583-4.25 2.541-2.291.959-4.791 1.167zm6.791-27.792q-1.541-1.125-3.25-1.854-1.708-.729-3.541-1.021V3.042q2.5.25 4.77 1.208 2.271.958 4.271 2.5zm4.584 21.584l-2.25-2.25q1.166-1.5 1.854-3.209.687-1.708.937-3.541h3.209q-.292 2.5-1.229 4.791-.938 2.292-2.521 4.209zm.541-12.417q-.291-1.833-.958-3.562-.667-1.73-1.833-3.188l2.375-2.208q1.541 1.916 2.458 4.208.917 2.292 1.167 4.75z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-file-download">\n      <path d="M10.8 40.55q-1.35 0-2.375-1T7.4 37.15v-7.7h3.4v7.7h26.35v-7.7h3.4v7.7q0 1.4-1 2.4t-2.4 1zM24 32.1L13.9 22.05l2.45-2.45 5.95 5.95V7.15h3.4v18.4l5.95-5.95 2.45 2.45z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-file-download-done">\n      <path d="M9.8 40.5v-3.45h28.4v3.45zm9.2-9.05L7.4 19.85l2.45-2.35L19 26.65l19.2-19.2 2.4 2.4z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-file-download-off">\n      <path d="M4.9 4.75L43.25 43.1 41 45.3l-4.75-4.75q-.05.05-.075.025-.025-.025-.075-.025H10.8q-1.35 0-2.375-1T7.4 37.15v-7.7h3.4v7.7h22.05l-7-7-1.85 1.8L13.9 21.9l1.85-1.85L2.7 7zm26.75 14.7l2.45 2.45-3.75 3.8-2.45-2.5zM25.7 7.15V21.1l-3.4-3.45V7.15z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-share">\n      <path d="M36 32.17c-1.52 0-2.89.59-3.93 1.54L17.82 25.4c.11-.45.18-.92.18-1.4s-.07-.95-.18-1.4l14.1-8.23c1.07 1 2.5 1.62 4.08 1.62 3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6c0 .48.07.95.18 1.4l-14.1 8.23c-1.07-1-2.5-1.62-4.08-1.62-3.31 0-6 2.69-6 6s2.69 6 6 6c1.58 0 3.01-.62 4.08-1.62l14.25 8.31c-.1.42-.16.86-.16 1.31A5.83 5.83 0 1 0 36 32.17z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-cog">\n      <path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3a14.8 14.8 0 0 0-3.38 1.97L9.9 10.1a1 1 0 0 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3a14.8 14.8 0 0 0 3.38-1.97l4.98 2.01a1 1 0 0 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-square">\n      <path d="M36 8H12c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h24c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zm0 28H12V12h24v24z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-circle">\n      <circle cx="24" cy="24" r="20"></circle>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-circle-outline">\n      <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-circle-inner-circle">\n      <path d="M24 4C12.97 4 4 12.97 4 24s8.97 20 20 20 20-8.97 20-20S35.03 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zm6-16c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-cancel">\n      <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 27.17L31.17 34 24 26.83 16.83 34 14 31.17 21.17 24 14 16.83 16.83 14 24 21.17 31.17 14 34 16.83 26.83 24 34 31.17z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-replay">\n      <path d="M24 10V2L14 12l10 10v-8c6.63 0 12 5.37 12 12s-5.37 12-12 12-12-5.37-12-12H8c0 8.84 7.16 16 16 16s16-7.16 16-16-7.16-16-16-16z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-repeat">\n      <path d="M14 14h20v6l8-8-8-8v6H10v12h4v-8zm20 20H14v-6l-8 8 8 8v-6h24V26h-4v8z"></path>\n    </symbol>\n    <symbol viewBox="0 96 48 48" id="vjs-icon-replay-5">\n      <path d="M17.689 98l-8.697 8.696 8.697 8.697 2.486-2.485-4.32-4.319h1.302c4.93 0 9.071 1.722 12.424 5.165 3.352 3.443 5.029 7.638 5.029 12.584h3.55c0-2.958-.553-5.73-1.658-8.313-1.104-2.583-2.622-4.841-4.555-6.774-1.932-1.932-4.19-3.45-6.773-4.555-2.584-1.104-5.355-1.657-8.313-1.657H15.5l4.615-4.615zm-8.08 21.659v13.861h11.357v5.008H9.609V143h12.7c.834 0 1.55-.298 2.146-.894.596-.597.895-1.31.895-2.145v-7.781c0-.835-.299-1.55-.895-2.147a2.929 2.929 0 0 0-2.147-.894h-8.227v-5.096H25.35v-4.384z"></path>\n    </symbol>\n    <symbol viewBox="0 96 48 48" id="vjs-icon-replay-10">\n      <path d="M42.315 125.63c0-4.997-1.694-9.235-5.08-12.713-3.388-3.479-7.571-5.218-12.552-5.218h-1.315l4.363 4.363-2.51 2.51-8.787-8.786L25.221 97l2.45 2.45-4.662 4.663h1.375c2.988 0 5.788.557 8.397 1.673 2.61 1.116 4.892 2.65 6.844 4.602 1.953 1.953 3.487 4.234 4.602 6.844 1.116 2.61 1.674 5.41 1.674 8.398zM8.183 142v-19.657H3.176V117.8h9.643V142zm13.63 0c-1.156 0-2.127-.393-2.912-1.178-.778-.778-1.168-1.746-1.168-2.902v-16.04c0-1.156.393-2.127 1.178-2.912.779-.779 1.746-1.168 2.902-1.168h7.696c1.156 0 2.126.392 2.911 1.177.779.78 1.168 1.747 1.168 2.903v16.04c0 1.156-.392 2.127-1.177 2.912-.779.779-1.746 1.168-2.902 1.168zm.556-4.636h6.583v-15.02H22.37z"></path>\n    </symbol>\n    <symbol viewBox="0 96 48 48" id="vjs-icon-replay-30">\n      <path d="M26.047 97l-8.733 8.732 8.733 8.733 2.496-2.494-4.336-4.338h1.307c4.95 0 9.108 1.73 12.474 5.187 3.367 3.458 5.051 7.668 5.051 12.635h3.565c0-2.97-.556-5.751-1.665-8.346-1.109-2.594-2.633-4.862-4.574-6.802-1.94-1.941-4.208-3.466-6.803-4.575-2.594-1.109-5.375-1.664-8.345-1.664H23.85l4.634-4.634zM2.555 117.531v4.688h10.297v5.25H5.873v4.687h6.979v5.156H2.555V142H13.36c1.061 0 1.95-.395 2.668-1.186.718-.79 1.076-1.772 1.076-2.94v-16.218c0-1.168-.358-2.149-1.076-2.94-.717-.79-1.607-1.185-2.668-1.185zm22.482.14c-1.149 0-2.11.39-2.885 1.165-.78.78-1.172 1.744-1.172 2.893v15.943c0 1.149.388 2.11 1.163 2.885.78.78 1.745 1.172 2.894 1.172h7.649c1.148 0 2.11-.388 2.884-1.163.78-.78 1.17-1.745 1.17-2.894v-15.943c0-1.15-.386-2.111-1.16-2.885-.78-.78-1.746-1.172-2.894-1.172zm.553 4.518h6.545v14.93H25.59z"></path>\n    </symbol>\n    <symbol viewBox="0 96 48 48" id="vjs-icon-forward-5">\n      <path d="M29.508 97l-2.431 2.43 4.625 4.625h-1.364c-2.965 0-5.742.554-8.332 1.66-2.589 1.107-4.851 2.629-6.788 4.566-1.937 1.937-3.458 4.2-4.565 6.788-1.107 2.59-1.66 5.367-1.66 8.331h3.557c0-4.957 1.68-9.16 5.04-12.611 3.36-3.45 7.51-5.177 12.451-5.177h1.304l-4.326 4.33 2.49 2.49 8.715-8.716zm-9.783 21.61v13.89h11.382v5.018H19.725V142h12.727a2.93 2.93 0 0 0 2.15-.896 2.93 2.93 0 0 0 .896-2.15v-7.798c0-.837-.299-1.554-.896-2.152a2.93 2.93 0 0 0-2.15-.896h-8.245V123h11.29v-4.392z"></path>\n    </symbol>\n    <symbol viewBox="0 96 48 48" id="vjs-icon-forward-10">\n      <path d="M23.119 97l-2.386 2.383 4.538 4.538h-1.339c-2.908 0-5.633.543-8.173 1.63-2.54 1.085-4.76 2.577-6.66 4.478-1.9 1.9-3.392 4.12-4.478 6.66-1.085 2.54-1.629 5.264-1.629 8.172h3.49c0-4.863 1.648-8.986 4.944-12.372 3.297-3.385 7.368-5.078 12.216-5.078h1.279l-4.245 4.247 2.443 2.442 8.55-8.55zm-9.52 21.45v4.42h4.871V142h4.513v-23.55zm18.136 0c-1.125 0-2.066.377-2.824 1.135-.764.764-1.148 1.709-1.148 2.834v15.612c0 1.124.38 2.066 1.139 2.824.764.764 1.708 1.145 2.833 1.145h7.489c1.125 0 2.066-.378 2.824-1.136.764-.764 1.145-1.709 1.145-2.833v-15.612c0-1.125-.378-2.067-1.136-2.825-.764-.764-1.708-1.145-2.833-1.145zm.54 4.42h6.408v14.617h-6.407z"></path>\n    </symbol>\n    <symbol viewBox="0 96 48 48" id="vjs-icon-forward-30">\n      <path d="M25.549 97l-2.437 2.434 4.634 4.635H26.38c-2.97 0-5.753.555-8.347 1.664-2.594 1.109-4.861 2.633-6.802 4.574-1.94 1.94-3.465 4.207-4.574 6.802-1.109 2.594-1.664 5.377-1.664 8.347h3.565c0-4.967 1.683-9.178 5.05-12.636 3.366-3.458 7.525-5.187 12.475-5.187h1.307l-4.335 4.338 2.495 2.494 8.732-8.732zm-11.553 20.53v4.689h10.297v5.249h-6.978v4.688h6.978v5.156H13.996V142h10.808c1.06 0 1.948-.395 2.666-1.186.718-.79 1.077-1.771 1.077-2.94v-16.217c0-1.169-.36-2.15-1.077-2.94-.718-.79-1.605-1.186-2.666-1.186zm21.174.168c-1.149 0-2.11.389-2.884 1.163-.78.78-1.172 1.745-1.172 2.894v15.942c0 1.15.388 2.11 1.162 2.885.78.78 1.745 1.17 2.894 1.17h7.649c1.149 0 2.11-.386 2.885-1.16.78-.78 1.17-1.746 1.17-2.895v-15.942c0-1.15-.387-2.11-1.161-2.885-.78-.78-1.745-1.172-2.894-1.172zm.552 4.516h6.542v14.931h-6.542z"></path>\n    </symbol>\n    <symbol viewBox="0 0 512 512" id="vjs-icon-audio-description">\n      <g fill-rule="evenodd"><path d="M227.29 381.351V162.993c50.38-1.017 89.108-3.028 117.631 17.126 27.374 19.342 48.734 56.965 44.89 105.325-4.067 51.155-41.335 94.139-89.776 98.475-24.085 2.155-71.972 0-71.972 0s-.84-1.352-.773-2.568m48.755-54.804c31.43 1.26 53.208-16.633 56.495-45.386 4.403-38.51-21.188-63.552-58.041-60.796v103.612c-.036 1.466.575 2.22 1.546 2.57"></path><path d="M383.78 381.328c13.336 3.71 17.387-11.06 23.215-21.408 12.722-22.571 22.294-51.594 22.445-84.774.221-47.594-18.343-82.517-35.6-106.182h-8.51c-.587 3.874 2.226 7.315 3.865 10.276 13.166 23.762 25.367 56.553 25.54 94.194.2 43.176-14.162 79.278-30.955 107.894"></path><path d="M425.154 381.328c13.336 3.71 17.384-11.061 23.215-21.408 12.721-22.571 22.291-51.594 22.445-84.774.221-47.594-18.343-82.517-35.6-106.182h-8.511c-.586 3.874 2.226 7.315 3.866 10.276 13.166 23.762 25.367 56.553 25.54 94.194.2 43.176-14.162 79.278-30.955 107.894"></path><path d="M466.26 381.328c13.337 3.71 17.385-11.061 23.216-21.408 12.722-22.571 22.292-51.594 22.445-84.774.221-47.594-18.343-82.517-35.6-106.182h-8.51c-.587 3.874 2.225 7.315 3.865 10.276 13.166 23.762 25.367 56.553 25.54 94.194.2 43.176-14.162 79.278-30.955 107.894M4.477 383.005H72.58l18.573-28.484 64.169-.135s.065 19.413.065 28.62h48.756V160.307h-58.816c-5.653 9.537-140.85 222.697-140.85 222.697zm152.667-145.282v71.158l-40.453-.27 40.453-70.888z"></path></g>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-next-item">\n      <path d="M12 36l17-12-17-12v24zm20-24v24h4V12h-4z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-previous-item">\n      <path d="M12 12h4v24h-4zm7 12l17 12V12z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-shuffle">\n      <path d="M21.17 18.34L10.83 8 8 10.83l10.34 10.34 2.83-2.83zM29 8l4.09 4.09L8 37.17 10.83 40l25.09-25.09L40 19V8H29zm.66 18.83l-2.83 2.83 6.26 6.26L29 40h11V29l-4.09 4.09-6.25-6.26z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-cast">\n      <path d="M42 6H6c-2.21 0-4 1.79-4 4v6h4v-6h36v28H28v4h14c2.21 0 4-1.79 4-4V10c0-2.21-1.79-4-4-4zM2 36v6h6c0-3.31-2.69-6-6-6zm0-8v4c5.52 0 10 4.48 10 10h4c0-7.73-6.27-14-14-14zm0-8v4c9.94 0 18 8.06 18 18h4c0-12.15-9.85-22-22-22z"></path>\n    </symbol>\n    <symbol viewBox="0 0 48 48" id="vjs-icon-picture-in-picture-enter">\n      <path d="M38 22H22v11.99h16V22zm8 16V9.96C46 7.76 44.2 6 42 6H6C3.8 6 2 7.76 2 9.96V38c0 2.2 1.8 4 4 4h36c2.2 0 4-1.8 4-4zm-4 .04H6V9.94h36v28.1z"></path>\n    </symbol>\n    <symbol viewBox="0 0 22 18" id="vjs-icon-picture-in-picture-exit">\n      <path d="M18 4H4v10h14V4zm4 12V1.98C22 .88 21.1 0 20 0H2C.9 0 0 .88 0 1.98V16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H2V1.97h18v14.05z"></path>\n      <path fill="none" d="M-1-3h24v24H-1z"></path>\n    </symbol>\n    <symbol viewBox="0 0 1792 1792" id="vjs-icon-facebook">\n      <path d="M1343 12v264h-157q-86 0-116 36t-30 108v189h293l-39 296h-254v759H734V905H479V609h255V391q0-186 104-288.5T1115 0q147 0 228 12z"></path>\n    </symbol>\n    <symbol viewBox="0 0 1792 1792" id="vjs-icon-linkedin">\n      <path d="M477 625v991H147V625h330zm21-306q1 73-50.5 122T312 490h-2q-82 0-132-49t-50-122q0-74 51.5-122.5T314 148t133 48.5T498 319zm1166 729v568h-329v-530q0-105-40.5-164.5T1168 862q-63 0-105.5 34.5T999 982q-11 30-11 81v553H659q2-399 2-647t-1-296l-1-48h329v144h-2q20-32 41-56t56.5-52 87-43.5T1285 602q171 0 275 113.5t104 332.5z"></path>\n    </symbol>\n    <symbol viewBox="0 0 1200 1227" id="vjs-icon-twitter">\n      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>\n    </symbol>\n    <symbol viewBox="0 0 1792 1792" id="vjs-icon-tumblr">\n      <path d="M1328 1329l80 237q-23 35-111 66t-177 32q-104 2-190.5-26T787 1564t-95-106-55.5-120-16.5-118V676H452V461q72-26 129-69.5t91-90 58-102 34-99T779 12q1-5 4.5-8.5T791 0h244v424h333v252h-334v518q0 30 6.5 56t22.5 52.5 49.5 41.5 81.5 14q78-2 134-29z"></path>\n    </symbol>\n    <symbol viewBox="0 0 1792 1792" id="vjs-icon-pinterest">\n      <path d="M1664 896q0 209-103 385.5T1281.5 1561 896 1664q-111 0-218-32 59-93 78-164 9-34 54-211 20 39 73 67.5t114 28.5q121 0 216-68.5t147-188.5 52-270q0-114-59.5-214T1180 449t-255-63q-105 0-196 29t-154.5 77-109 110.5-67 129.5T377 866q0 104 40 183t117 111q30 12 38-20 2-7 8-31t8-30q6-23-11-43-51-61-51-151 0-151 104.5-259.5T904 517q151 0 235.5 82t84.5 213q0 170-68.5 289T980 1220q-61 0-98-43.5T859 1072q8-35 26.5-93.5t30-103T927 800q0-50-27-83t-77-33q-62 0-105 57t-43 142q0 73 25 122l-99 418q-17 70-13 177-206-91-333-281T128 896q0-209 103-385.5T510.5 231 896 128t385.5 103T1561 510.5 1664 896z"></path>\n    </symbol>\n  </defs>\n</svg>';const Ke=ie?10009:ne?461:8;const Qe={codes:{play:415,pause:19,ff:417,rw:412,back:Ke},names:{415:"play",19:"pause",417:"ff",412:"rw",[Ke]:"back"},isEventKey(e,t){t=t.toLowerCase();return!(!this.names[e.keyCode]||this.names[e.keyCode]!==t)},getEventName(e){if(this.names[e.keyCode])return this.names[e.keyCode];if(this.codes[e.code]){const t=this.codes[e.code];return this.names[t]}return null}};const Xe=5;class SpatialNavigation extends EventTarget$2{
/**
   * Constructs a SpatialNavigation instance with initial settings.
   * Sets up the player instance, and prepares the spatial navigation system.
   *
   * @class
   * @param {Player} player - The Video.js player instance to which the spatial navigation is attached.
   */
constructor(e){super();this.player_=e;this.focusableComponents=[];this.isListening_=false;this.isPaused_=false;this.onKeyDown_=this.onKeyDown_.bind(this);this.lastFocusedComponent_=null}start(){if(!this.isListening_){this.player_.on("keydown",this.onKeyDown_);this.player_.on("modalKeydown",this.onKeyDown_);this.player_.on("loadedmetadata",(()=>{this.focus(this.updateFocusableComponents()[0])}));this.player_.on("modalclose",(()=>{this.refocusComponent()}));this.player_.on("focusin",this.handlePlayerFocus_.bind(this));this.player_.on("focusout",this.handlePlayerBlur_.bind(this));this.isListening_=true;this.player_.errorDisplay&&this.player_.errorDisplay.on("aftermodalfill",(()=>{this.updateFocusableComponents();this.focusableComponents.length&&(this.focusableComponents.length>1?this.focusableComponents[1].focus():this.focusableComponents[0].focus())}))}}stop(){this.player_.off("keydown",this.onKeyDown_);this.isListening_=false}
/**
   * Responds to keydown events for spatial navigation and media control.
   *
   * Determines if spatial navigation or media control is active and handles key inputs accordingly.
   *
   * @param {KeyboardEvent} event - The keydown event to be handled.
   */onKeyDown_(e){const t=e.originalEvent?e.originalEvent:e;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(t.key)){if(this.isPaused_)return;t.preventDefault();const e=t.key.substring(5).toLowerCase();this.move(e)}else if(Qe.isEventKey(t,"play")||Qe.isEventKey(t,"pause")||Qe.isEventKey(t,"ff")||Qe.isEventKey(t,"rw")){t.preventDefault();const e=Qe.getEventName(t);this.performMediaAction_(e)}else if(Qe.isEventKey(t,"Back")&&e.target&&typeof e.target.closeable==="function"&&e.target.closeable()){t.preventDefault();e.target.close()}}
/**
   * Performs media control actions based on the given key input.
   *
   * Controls the playback and seeking functionalities of the media player.
   *
   * @param {string} key - The key representing the media action to be performed.
   *   Accepted keys: 'play', 'pause', 'ff' (fast-forward), 'rw' (rewind).
   */performMediaAction_(e){if(this.player_)switch(e){case"play":this.player_.paused()&&this.player_.play();break;case"pause":this.player_.paused()||this.player_.pause();break;case"ff":this.userSeek_(this.player_.currentTime()+Xe);break;case"rw":this.userSeek_(this.player_.currentTime()-Xe);break}}
/**
   * Prevent liveThreshold from causing seeks to seem like they
   * are not happening from a user perspective.
   *
   * @param {number} ct
   *        current time to seek to
   */userSeek_(e){this.player_.liveTracker&&this.player_.liveTracker.isLive()&&this.player_.liveTracker.nextSeekedFromUser();this.player_.currentTime(e)}pause(){this.isPaused_=true}resume(){this.isPaused_=false}
/**
   * Handles Player Blur.
   *
   * @param {string|Event|Object} event
   *        The name of the event, an `Event`, or an object with a key of type set to
   *        an event name.
   *
   * Calls for handling of the Player Blur if:
   * *The next focused element is not a child of current focused element &
   * The next focused element is not a child of the Player.
   * *There is no next focused element
   */handlePlayerBlur_(e){const t=e.relatedTarget;let s=null;const i=this.getCurrentComponent(e.target);if(t){s=Boolean(t.closest(".video-js"));t.classList.contains("vjs-text-track-settings")&&!this.isPaused_&&this.searchForTrackSelect_()}if(!e.currentTarget.contains(e.relatedTarget)&&!s||!t)if(i&&i.name()==="CloseButton")this.refocusComponent();else{this.pause();i&&i.el()&&(this.lastFocusedComponent_=i)}}handlePlayerFocus_(){this.getCurrentComponent()&&this.getCurrentComponent().getIsFocusable()&&this.resume()}updateFocusableComponents(){const e=this.player_;const t=[];
/**
     * Searches for children candidates.
     *
     * Pushes Components to array of 'focusableComponents'.
     * Calls itself if there is children elements inside iterated component.
     *
     * @param {Array} componentsArray - The array of components to search for focusable children.
     */function searchForChildrenCandidates(e){for(const s of e){s.hasOwnProperty("el_")&&s.getIsFocusable()&&s.getIsAvailableToBeFocused(s.el())&&t.push(s);s.hasOwnProperty("children_")&&s.children_.length>0&&searchForChildrenCandidates(s.children_)}}e.children_.forEach((e=>{if(e.hasOwnProperty("el_")){if(e.getIsFocusable&&e.getIsAvailableToBeFocused&&e.getIsFocusable()&&e.getIsAvailableToBeFocused(e.el())){t.push(e);return}e.hasOwnProperty("children_")&&e.children_.length>0?searchForChildrenCandidates(e.children_):e.hasOwnProperty("items")&&e.items.length>0?searchForChildrenCandidates(e.items):this.findSuitableDOMChild(e)&&t.push(e)}if(e.name_==="ErrorDisplay"&&e.opened_){const s=e.el_.querySelector(".vjs-errors-ok-button-container");if(s){const e=s.querySelectorAll("button");e.forEach(((e,s)=>{t.push({name:()=>"ModalButton"+(s+1),el:()=>e,getPositions:()=>{const t=e.getBoundingClientRect();const s={x:t.x,y:t.y,width:t.width,height:t.height,top:t.top,right:t.right,bottom:t.bottom,left:t.left};const i={x:t.left+t.width/2,y:t.top+t.height/2,width:0,height:0,top:t.top+t.height/2,right:t.left+t.width/2,bottom:t.top+t.height/2,left:t.left+t.width/2};return{boundingClientRect:s,center:i}},getIsAvailableToBeFocused:()=>true,getIsFocusable:e=>true,focus:()=>e.focus()})}))}}}));this.focusableComponents=t;return this.focusableComponents}
/**
   * Finds a suitable child element within the provided component's DOM element.
   *
   * @param {Object} component - The component containing the DOM element to search within.
   * @return {HTMLElement|null} Returns the suitable child element if found, or null if not found.
   */findSuitableDOMChild(e){
/**
     * Recursively searches for a suitable child node that can be focused within a given component.
     * It first checks if the provided node itself can be focused according to the component's
     * `getIsFocusable` and `getIsAvailableToBeFocused` methods. If not, it recursively searches
     * through the node's children to find a suitable child node that meets the focusability criteria.
     *
     * @param {HTMLElement} node - The DOM node to start the search from.
     * @return {HTMLElement|null} The first child node that is focusable and available to be focused,
     * or `null` if no suitable child is found.
     */
function searchForSuitableChild(t){if(e.getIsFocusable(t)&&e.getIsAvailableToBeFocused(t))return t;for(let e=0;e<t.children.length;e++){const s=t.children[e];const i=searchForSuitableChild(s);if(i)return i}return null}return e.el()?searchForSuitableChild(e.el()):null}
/**
   * Gets the currently focused component from the list of focusable components.
   * If a target element is provided, it uses that element to find the corresponding
   * component. If no target is provided, it defaults to using the document's currently
   * active element.
   *
   * @param {HTMLElement} [target] - The DOM element to check against the focusable components.
   *                                 If not provided, `document.activeElement` is used.
   * @return {Component|null} - Returns the focused component if found among the focusable components,
   *                            otherwise returns null if no matching component is found.
   */getCurrentComponent(e){this.updateFocusableComponents();const t=e||document.activeElement;if(this.focusableComponents.length)for(const e of this.focusableComponents)if(e.el()===t)return e}
/**
   * Adds a component to the array of focusable components.
   *
   * @param {Component} component
   *        The `Component` to be added.
   */add(e){const t=[...this.focusableComponents];e.hasOwnProperty("el_")&&e.getIsFocusable()&&e.getIsAvailableToBeFocused(e.el())&&t.push(e);this.focusableComponents=t;this.trigger({type:"focusableComponentsChanged",focusableComponents:this.focusableComponents})}
/**
   * Removes component from the array of focusable components.
   *
   * @param {Component} component - The component to be removed from the focusable components array.
   */remove(e){for(let t=0;t<this.focusableComponents.length;t++)if(this.focusableComponents[t].name()===e.name()){this.focusableComponents.splice(t,1);this.trigger({type:"focusableComponentsChanged",focusableComponents:this.focusableComponents});return}}clear(){if(this.focusableComponents.length>0){this.focusableComponents=[];this.trigger({type:"focusableComponentsChanged",focusableComponents:this.focusableComponents})}}
/**
   * Navigates to the next focusable component based on the specified direction.
   *
   * @param {string} direction 'up', 'down', 'left', 'right'
   */move(e){const t=this.getCurrentComponent();if(!t)return;const s=t.getPositions();const i=this.focusableComponents.filter((i=>i!==t&&this.isInDirection_(s.boundingClientRect,i.getPositions().boundingClientRect,e)));const n=this.findBestCandidate_(s.center,i,e);n?this.focus(n):this.trigger({type:"endOfFocusableComponents",direction:e,focusedComponent:t})}
/**
   * Finds the best candidate on the current center position,
   * the list of candidates, and the specified navigation direction.
   *
   * @param {Object} currentCenter The center position of the current focused component element.
   * @param {Array} candidates An array of candidate components to receive focus.
   * @param {string} direction The direction of navigation ('up', 'down', 'left', 'right').
   * @return {Object|null} The component that is the best candidate for receiving focus.
   */findBestCandidate_(e,t,s){let i=Infinity;let n=null;for(const r of t){const t=r.getPositions().center;const a=this.calculateDistance_(e,t,s);if(a<i){i=a;n=r}}return n}
/**
   * Determines if a target rectangle is in the specified navigation direction
   * relative to a source rectangle.
   *
   * @param {Object} srcRect The bounding rectangle of the source element.
   * @param {Object} targetRect The bounding rectangle of the target element.
   * @param {string} direction The navigation direction ('up', 'down', 'left', 'right').
   * @return {boolean} True if the target is in the specified direction relative to the source.
   */isInDirection_(e,t,s){switch(s){case"right":return t.left>=e.right;case"left":return t.right<=e.left;case"down":return t.top>=e.bottom;case"up":return t.bottom<=e.top;default:return false}}refocusComponent(){if(this.lastFocusedComponent_){this.player_.userActive()||this.player_.userActive(true);this.updateFocusableComponents();for(let e=0;e<this.focusableComponents.length;e++)if(this.focusableComponents[e].name()===this.lastFocusedComponent_.name()){this.focus(this.focusableComponents[e]);return}}else this.focus(this.updateFocusableComponents()[0])}
/**
   * Focuses on a given component.
   * If the component is available to be focused, it focuses on the component.
   * If not, it attempts to find a suitable DOM child within the component and focuses on it.
   *
   * @param {Component} component - The component to be focused.
   */focus(e){typeof e==="object"&&(e.getIsAvailableToBeFocused(e.el())?e.focus():this.findSuitableDOMChild(e)&&this.findSuitableDOMChild(e).focus())}
/**
   * Calculates the distance between two points, adjusting the calculation based on
   * the specified navigation direction.
   *
   * @param {Object} center1 The center point of the first element.
   * @param {Object} center2 The center point of the second element.
   * @param {string} direction The direction of navigation ('up', 'down', 'left', 'right').
   * @return {number} The calculated distance between the two centers.
   */calculateDistance_(e,t,s){const i=Math.abs(e.x-t.x);const n=Math.abs(e.y-t.y);let r;switch(s){case"right":case"left":r=i+n*100;break;case"up":r=n*2+i*.5;break;case"down":r=n*5+i;break;default:r=i+n}return r}searchForTrackSelect_(){const e=this;for(const t of e.updateFocusableComponents())if(t.constructor.name==="TextTrackSelect"){e.focus(t);break}}}class MediaLoader extends Component$1{
/**
   * Create an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should attach to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Function} [ready]
   *        The function that is run when this component is ready.
   */
constructor(e,t,s){const i=merge$1({createEl:false},t);super(e,i,s);if(t.playerOptions.sources&&t.playerOptions.sources.length!==0)e.src(t.playerOptions.sources);else for(let s=0,i=t.playerOptions.techOrder;s<i.length;s++){const t=toTitleCase$1(i[s]);let n=Tech.getTech(t);t||(n=Component$1.getComponent(t));if(n&&n.isSupported()){e.loadTech_(t);break}}}}Component$1.registerComponent("MediaLoader",MediaLoader);class ClickableComponent extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param  {Player} player
   *         The `Player` that this class should be attached to.
   *
   * @param  {Object} [options]
   *         The key/value store of component options.
   *
   * @param  {function} [options.clickHandler]
   *         The function to call when the button is clicked / activated
   *
   * @param  {string} [options.controlText]
   *         The text to set on the button
   *
   * @param  {string} [options.className]
   *         A class or space separated list of classes to add the component
   *
   */
constructor(e,t){super(e,t);this.options_.controlText&&this.controlText(this.options_.controlText);this.handleMouseOver_=e=>this.handleMouseOver(e);this.handleMouseOut_=e=>this.handleMouseOut(e);this.handleClick_=e=>this.handleClick(e);this.handleKeyDown_=e=>this.handleKeyDown(e);this.emitTapEvents();this.enable()}
/**
   * Create the `ClickableComponent`s DOM element.
   *
   * @param {string} [tag=div]
   *        The element's node type.
   *
   * @param {Object} [props={}]
   *        An object of properties that should be set on the element.
   *
   * @param {Object} [attributes={}]
   *        An object of attributes that should be set on the element.
   *
   * @return {Element}
   *         The element that gets created.
   */createEl(e="div",t={},s={}){t=Object.assign({className:this.buildCSSClass(),tabIndex:0},t);e==="button"&&B.error(`Creating a ClickableComponent with an HTML element of ${e} is not supported; use a Button instead.`);s=Object.assign({role:"button"},s);this.tabIndex_=t.tabIndex;const i=createEl(e,t,s);this.player_.options_.experimentalSvgIcons||i.appendChild(createEl("span",{className:"vjs-icon-placeholder"},{"aria-hidden":true}));this.createControlTextEl(i);return i}dispose(){this.controlTextEl_=null;super.dispose()}
/**
   * Create a control text element on this `ClickableComponent`
   *
   * @param {Element} [el]
   *        Parent element for the control text.
   *
   * @return {Element}
   *         The control text element that gets created.
   */createControlTextEl(e){this.controlTextEl_=createEl("span",{className:"vjs-control-text"},{"aria-live":"polite"});e&&e.appendChild(this.controlTextEl_);this.controlText(this.controlText_,e);return this.controlTextEl_}
/**
   * Get or set the localize text to use for the controls on the `ClickableComponent`.
   *
   * @param {string} [text]
   *        Control text for element.
   *
   * @param {Element} [el=this.el()]
   *        Element to set the title on.
   *
   * @return {string}
   *         - The control text when getting
   */controlText(e,t=this.el()){if(e===void 0)return this.controlText_||"Need Text";const s=this.localize(e);this.controlText_=e;textContent(this.controlTextEl_,s);this.nonIconControl||this.player_.options_.noUITitleAttributes||t.setAttribute("title",s)}buildCSSClass(){return`vjs-control vjs-button ${super.buildCSSClass()}`}enable(){if(!this.enabled_){this.enabled_=true;this.removeClass("vjs-disabled");this.el_.setAttribute("aria-disabled","false");typeof this.tabIndex_!=="undefined"&&this.el_.setAttribute("tabIndex",this.tabIndex_);this.on(["tap","click"],this.handleClick_);this.on("keydown",this.handleKeyDown_)}}disable(){this.enabled_=false;this.addClass("vjs-disabled");this.el_.setAttribute("aria-disabled","true");typeof this.tabIndex_!=="undefined"&&this.el_.removeAttribute("tabIndex");this.off("mouseover",this.handleMouseOver_);this.off("mouseout",this.handleMouseOut_);this.off(["tap","click"],this.handleClick_);this.off("keydown",this.handleKeyDown_)}handleLanguagechange(){this.controlText(this.controlText_)}
/**
   * Event handler that is called when a `ClickableComponent` receives a
   * `click` or `tap` event.
   *
   * @param {Event} event
   *        The `tap` or `click` event that caused this function to be called.
   *
   * @listens tap
   * @listens click
   * @abstract
   */handleClick(e){this.options_.clickHandler&&this.options_.clickHandler.call(this,arguments)}
/**
   * Event handler that is called when a `ClickableComponent` receives a
   * `keydown` event.
   *
   * By default, if the key is Space or Enter, it will trigger a `click` event.
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */handleKeyDown(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();e.stopPropagation();this.trigger("click")}else super.handleKeyDown(e)}}Component$1.registerComponent("ClickableComponent",ClickableComponent);class PosterImage extends ClickableComponent{
/**
   * Create an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should attach to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.update();this.update_=e=>this.update(e);e.on("posterchange",this.update_)}dispose(){this.player().off("posterchange",this.update_);super.dispose()}createEl(){return createEl("div",{className:"vjs-poster"})}
/**
   * Get or set the `PosterImage`'s crossOrigin option.
   *
   * @param {string|null} [value]
   *        The value to set the crossOrigin to. If an argument is
   *        given, must be one of `'anonymous'` or `'use-credentials'`, or 'null'.
   *
   * @return {string|null}
   *         - The current crossOrigin value of the `Player` when getting.
   *         - undefined when setting
   */crossOrigin(e){if(typeof e==="undefined")return this.$("img")?this.$("img").crossOrigin:this.player_.tech_&&this.player_.tech_.isReady_?this.player_.crossOrigin():this.player_.options_.crossOrigin||this.player_.options_.crossorigin||null;e===null||e==="anonymous"||e==="use-credentials"?this.$("img")&&(this.$("img").crossOrigin=e):this.player_.log.warn(`crossOrigin must be null,  "anonymous" or "use-credentials", given "${e}"`)}
/**
   * An {@link EventTarget~EventListener} for {@link Player#posterchange} events.
   *
   * @listens Player#posterchange
   *
   * @param {Event} [event]
   *        The `Player#posterchange` event that triggered this function.
   */update(e){const t=this.player().poster();this.setSrc(t);t?this.show():this.hide()}
/**
   * Set the source of the `PosterImage` depending on the display method. (Re)creates
   * the inner picture and img elementss when needed.
   *
   * @param {string} [url]
   *        The URL to the source for the `PosterImage`. If not specified or falsy,
   *        any source and ant inner picture/img are removed.
   */setSrc(e){if(e){this.$("img")||this.el_.appendChild(createEl("picture",{className:"vjs-poster",tabIndex:-1},{},createEl("img",{loading:"lazy",crossOrigin:this.crossOrigin()},{alt:""})));this.$("img").src=e}else this.el_.textContent=""}
/**
   * An {@link EventTarget~EventListener} for clicks on the `PosterImage`. See
   * {@link ClickableComponent#handleClick} for instances where this will be triggered.
   *
   * @listens tap
   * @listens click
   * @listens keydown
   *
   * @param {Event} event
   +        The `click`, `tap` or `keydown` event that caused this function to be called.
   */handleClick(e){if(this.player_.controls()){this.player_.tech(true)&&this.player_.tech(true).focus();this.player_.paused()?silencePromise(this.player_.play()):this.player_.pause()}}}
/**
 * Get or set the `PosterImage`'s crossorigin option. For the HTML5 player, this
 * sets the `crossOrigin` property on the `<img>` tag to control the CORS
 * behavior.
 *
 * @param {string|null} [value]
 *        The value to set the `PosterImages`'s crossorigin to. If an argument is
 *        given, must be one of `anonymous` or `use-credentials`.
 *
 * @return {string|null|undefined}
 *         - The current crossorigin value of the `Player` when getting.
 *         - undefined when setting
 */PosterImage.prototype.crossorigin=PosterImage.prototype.crossOrigin;Component$1.registerComponent("PosterImage",PosterImage);const Ye="#222";const Je="#ccc";const Ze={monospace:"monospace",sansSerif:"sans-serif",serif:"serif",monospaceSansSerif:'"Andale Mono", "Lucida Console", monospace',monospaceSerif:'"Courier New", monospace',proportionalSansSerif:"sans-serif",proportionalSerif:"serif",casual:'"Comic Sans MS", Impact, fantasy',script:'"Monotype Corsiva", cursive',smallcaps:'"Andale Mono", "Lucida Console", monospace, sans-serif'};
/**
 * Construct an rgba color from a given hex color code.
 *
 * @param {number} color
 *        Hex number for color, like #f0e or #f604e2.
 *
 * @param {number} opacity
 *        Value for opacity, 0.0 - 1.0.
 *
 * @return {string}
 *         The rgba color that was created, like 'rgba(255, 0, 0, 0.3)'.
 */function constructColor(e,t){let s;if(e.length===4)s=e[1]+e[1]+e[2]+e[2]+e[3]+e[3];else{if(e.length!==7)throw new Error("Invalid color code provided, "+e+"; must be formatted as e.g. #f0e or #f604e2.");s=e.slice(1)}return"rgba("+parseInt(s.slice(0,2),16)+","+parseInt(s.slice(2,4),16)+","+parseInt(s.slice(4,6),16)+","+t+")"}
/**
 * Try to update the style of a DOM element. Some style changes will throw an error,
 * particularly in IE8. Those should be noops.
 *
 * @param {Element} el
 *        The DOM element to be styled.
 *
 * @param {string} style
 *        The CSS property on the element that should be styled.
 *
 * @param {string} rule
 *        The style rule that should be applied to the property.
 *
 * @private
 */function tryUpdateStyle(e,t,s){try{e.style[t]=s}catch(e){return}}
/**
 * Converts the CSS top/right/bottom/left property numeric value to string in pixels.
 *
 * @param {number} position
 *        The CSS top/right/bottom/left property value.
 *
 * @return {string}
 *          The CSS property value that was created, like '10px'.
 *
 * @private
 */function getCSSPositionValue(e){return e?`${e}px`:""}class TextTrackDisplay extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Function} [ready]
   *        The function to call when `TextTrackDisplay` is ready.
   */
constructor(t,s,i){super(t,s,i);const updateDisplayTextHandler=e=>this.updateDisplay(e);const updateDisplayHandler=e=>{this.updateDisplayOverlay();this.updateDisplay(e)};t.on("loadstart",(e=>this.toggleDisplay(e)));t.on("texttrackchange",updateDisplayTextHandler);t.on("loadedmetadata",(e=>{this.updateDisplayOverlay();this.preselectTrack(e)}));t.ready(bind_(this,(function(){if(t.tech_&&t.tech_.featuresNativeTextTracks){this.hide();return}t.on("fullscreenchange",updateDisplayHandler);t.on("playerresize",updateDisplayHandler);const s=e.screen.orientation||e;const i=e.screen.orientation?"change":"orientationchange";s.addEventListener(i,updateDisplayHandler);t.on("dispose",(()=>s.removeEventListener(i,updateDisplayHandler)));const n=this.options_.playerOptions.tracks||[];for(let e=0;e<n.length;e++)this.player_.addRemoteTextTrack(n[e],true);this.preselectTrack()})))}preselectTrack(){const e={captions:1,subtitles:1};const t=this.player_.textTracks();const s=this.player_.cache_.selectedLanguage;let i;let n;let r;for(let a=0;a<t.length;a++){const o=t[a];if(s&&s.enabled&&s.language&&s.language===o.language&&o.kind in e)o.kind===s.kind?r=o:r||(r=o);else if(s&&!s.enabled){r=null;i=null;n=null}else o.default&&(o.kind!=="descriptions"||i?o.kind in e&&!n&&(n=o):i=o)}r?r.mode="showing":n?n.mode="showing":i&&(i.mode="showing")}toggleDisplay(){this.player_.tech_&&this.player_.tech_.featuresNativeTextTracks?this.hide():this.show()}createEl(){return super.createEl("div",{className:"vjs-text-track-display"},{translate:"yes","aria-live":"off","aria-atomic":"true"})}clearDisplay(){typeof e.WebVTT==="function"&&e.WebVTT.processCues(e,[],this.el_)}updateDisplay(){const t=this.player_.textTracks();const s=this.options_.allowMultipleShowingTracks;this.clearDisplay();if(s){const e=[];for(let s=0;s<t.length;++s){const i=t[s];i.mode==="showing"&&e.push(i)}this.updateForTrack(e);return}let i=null;let n=null;let r=t.length;while(r--){const e=t[r];e.mode==="showing"&&(e.kind==="descriptions"?i=e:n=e)}if(n){this.getAttribute("aria-live")!=="off"&&this.setAttribute("aria-live","off");this.updateForTrack(n)}else if(i){this.getAttribute("aria-live")!=="assertive"&&this.setAttribute("aria-live","assertive");this.updateForTrack(i)}if(!e.CSS.supports("inset","10px")){const e=this.el_;const t=e.querySelectorAll(".vjs-text-track-cue");const s=this.player_.controlBar.el_.getBoundingClientRect().height;const i=this.player_.el_.getBoundingClientRect().height;e.style="";tryUpdateStyle(e,"position","relative");tryUpdateStyle(e,"height",i-s+"px");tryUpdateStyle(e,"top","unset");tryUpdateStyle(e,"bottom",re?i+"px":"0px");t.length>0&&t.forEach((e=>{if(e.style.inset){const t=e.style.inset.split(" ");t.length===3&&Object.assign(e.style,{top:t[0],right:t[1],bottom:t[2],left:"unset"})}}))}}updateDisplayOverlay(){if(!this.player_.videoHeight()||!e.CSS.supports("inset-inline: 10px"))return;const t=this.player_.currentWidth();const s=this.player_.currentHeight();const i=t/s;const n=this.player_.videoWidth()/this.player_.videoHeight();let r=0;let a=0;Math.abs(i-n)>.1&&(i>n?r=Math.round((t-s*n)/2):a=Math.round((s-t/n)/2));tryUpdateStyle(this.el_,"insetInline",getCSSPositionValue(r));tryUpdateStyle(this.el_,"insetBlock",getCSSPositionValue(a))}
/**
   * Style {@Link TextTrack} activeCues according to {@Link TextTrackSettings}.
   *
   * @param {TextTrack} track
   *        Text track object containing active cues to style.
   */updateDisplayState(t){const s=this.player_.textTrackSettings.getValues();const i=t.activeCues;let n=i.length;while(n--){const t=i[n];if(!t)continue;const r=t.displayState;s.color&&(r.firstChild.style.color=s.color);s.textOpacity&&tryUpdateStyle(r.firstChild,"color",constructColor(s.color||"#fff",s.textOpacity));s.backgroundColor&&(r.firstChild.style.backgroundColor=s.backgroundColor);s.backgroundOpacity&&tryUpdateStyle(r.firstChild,"backgroundColor",constructColor(s.backgroundColor||"#000",s.backgroundOpacity));s.windowColor&&(s.windowOpacity?tryUpdateStyle(r,"backgroundColor",constructColor(s.windowColor,s.windowOpacity)):r.style.backgroundColor=s.windowColor);s.edgeStyle&&(s.edgeStyle==="dropshadow"?r.firstChild.style.textShadow=`2px 2px 3px ${Ye}, 2px 2px 4px ${Ye}, 2px 2px 5px ${Ye}`:s.edgeStyle==="raised"?r.firstChild.style.textShadow=`1px 1px ${Ye}, 2px 2px ${Ye}, 3px 3px ${Ye}`:s.edgeStyle==="depressed"?r.firstChild.style.textShadow=`1px 1px ${Je}, 0 1px ${Je}, -1px -1px ${Ye}, 0 -1px ${Ye}`:s.edgeStyle==="uniform"&&(r.firstChild.style.textShadow=`0 0 4px ${Ye}, 0 0 4px ${Ye}, 0 0 4px ${Ye}, 0 0 4px ${Ye}`));if(s.fontPercent&&s.fontPercent!==1){const t=e.parseFloat(r.style.fontSize);r.style.fontSize=t*s.fontPercent+"px";r.style.height="auto";r.style.top="auto"}s.fontFamily&&s.fontFamily!=="default"&&(s.fontFamily==="small-caps"?r.firstChild.style.fontVariant="small-caps":r.firstChild.style.fontFamily=Ze[s.fontFamily])}}
/**
   * Add an {@link TextTrack} to to the {@link Tech}s {@link TextTrackList}.
   *
   * @param {TextTrack|TextTrack[]} tracks
   *        Text track object or text track array to be added to the list.
   */updateForTrack(t){Array.isArray(t)||(t=[t]);if(typeof e.WebVTT!=="function"||t.every((e=>!e.activeCues)))return;const s=[];for(let e=0;e<t.length;++e){const i=t[e];for(let e=0;e<i.activeCues.length;++e)s.push(i.activeCues[e])}e.WebVTT.processCues(e,s,this.el_);for(let e=0;e<t.length;++e){const s=t[e];for(let t=0;t<s.activeCues.length;++t){const i=s.activeCues[t].displayState;addClass(i,"vjs-text-track-cue","vjs-text-track-cue-"+(s.language?s.language:e));s.language&&setAttribute(i,"lang",s.language)}this.player_.textTrackSettings&&this.updateDisplayState(s)}}}Component$1.registerComponent("TextTrackDisplay",TextTrackDisplay);class LoadingSpinner extends Component$1{createEl(){const e=this.player_.isAudio();const t=this.localize(e?"Audio Player":"Video Player");const s=createEl("span",{className:"vjs-control-text",textContent:this.localize("{1} is loading.",[t])});const i=super.createEl("div",{className:"vjs-loading-spinner",dir:"ltr"});i.appendChild(s);return i}handleLanguagechange(){this.$(".vjs-control-text").textContent=this.localize("{1} is loading.",[this.player_.isAudio()?"Audio Player":"Video Player"])}}Component$1.registerComponent("LoadingSpinner",LoadingSpinner);class Button extends ClickableComponent{
/**
   * Create the `Button`s DOM element.
   *
   * @param {string} [tag="button"]
   *        The element's node type. This argument is IGNORED: no matter what
   *        is passed, it will always create a `button` element.
   *
   * @param {Object} [props={}]
   *        An object of properties that should be set on the element.
   *
   * @param {Object} [attributes={}]
   *        An object of attributes that should be set on the element.
   *
   * @return {Element}
   *         The element that gets created.
   */
createEl(e,t={},s={}){e="button";t=Object.assign({className:this.buildCSSClass()},t);s=Object.assign({type:"button"},s);const i=createEl(e,t,s);this.player_.options_.experimentalSvgIcons||i.appendChild(createEl("span",{className:"vjs-icon-placeholder"},{"aria-hidden":true}));this.createControlTextEl(i);return i}
/**
   * Add a child `Component` inside of this `Button`.
   *
   * @param {string|Component} child
   *        The name or instance of a child to add.
   *
   * @param {Object} [options={}]
   *        The key/value store of options that will get passed to children of
   *        the child.
   *
   * @return {Component}
   *         The `Component` that gets added as a child. When using a string the
   *         `Component` will get created by this process.
   *
   * @deprecated since version 5
   */addChild(e,t={}){const s=this.constructor.name;B.warn(`Adding an actionable (user controllable) child to a Button (${s}) is not supported; use a ClickableComponent instead.`);return Component$1.prototype.addChild.call(this,e,t)}enable(){super.enable();this.el_.removeAttribute("disabled")}disable(){super.disable();this.el_.setAttribute("disabled","disabled")}
/**
   * This gets called when a `Button` has focus and `keydown` is triggered via a key
   * press.
   *
   * @param {KeyboardEvent} event
   *        The event that caused this function to get called.
   *
   * @listens keydown
   */handleKeyDown(e){e.key!==" "&&e.key!=="Enter"?super.handleKeyDown(e):e.stopPropagation()}}Component$1.registerComponent("Button",Button);class BigPlayButton extends Button{constructor(e,t){super(e,t);this.mouseused_=false;this.setIcon("play");this.on("mousedown",(e=>this.handleMouseDown(e)))}buildCSSClass(){return"vjs-big-play-button"}
/**
   * This gets called when a `BigPlayButton` "clicked". See {@link ClickableComponent}
   * for more detailed information on what a click can be.
   *
   * @param {KeyboardEvent|MouseEvent|TouchEvent} event
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){const t=this.player_.play();if(this.mouseused_&&"clientX"in e&&"clientY"in e){silencePromise(t);this.player_.tech(true)&&this.player_.tech(true).focus();return}const s=this.player_.getChild("controlBar");const i=s&&s.getChild("playToggle");if(!i){this.player_.tech(true).focus();return}const playFocus=()=>i.focus();isPromise(t)?t.then(playFocus,(()=>{})):this.setTimeout(playFocus,1)}
/**
   * Event handler that is called when a `BigPlayButton` receives a
   * `keydown` event.
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */handleKeyDown(e){this.mouseused_=false;super.handleKeyDown(e)}
/**
   * Handle `mousedown` events on the `BigPlayButton`.
   *
   * @param {MouseEvent} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   */handleMouseDown(e){this.mouseused_=true}}
/**
 * The text that should display over the `BigPlayButton`s controls. Added to for localization.
 *
 * @type {string}
 * @protected
 */BigPlayButton.prototype.controlText_="Play Video";Component$1.registerComponent("BigPlayButton",BigPlayButton);class CloseButton extends Button{
/**
  * Creates an instance of the this class.
  *
  * @param  {Player} player
  *         The `Player` that this class should be attached to.
  *
  * @param  {Object} [options]
  *         The key/value store of player options.
  */
constructor(e,t){super(e,t);this.setIcon("cancel");this.controlText(t&&t.controlText||this.localize("Close"))}buildCSSClass(){return`vjs-close-button ${super.buildCSSClass()}`}
/**
   * This gets called when a `CloseButton` gets clicked. See
   * {@link ClickableComponent#handleClick} for more information on when
   * this will be triggered
   *
   * @param {Event} event
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   * @fires CloseButton#close
   */handleClick(e){
/**
     * Triggered when the a `CloseButton` is clicked.
     *
     * @event CloseButton#close
     * @type {Event}
     *
     * @property {boolean} [bubbles=false]
     *           set to false so that the close event does not
     *           bubble up to parents if there is no listener
     */
this.trigger({type:"close",bubbles:false})}
/**
   * Event handler that is called when a `CloseButton` receives a
   * `keydown` event.
   *
   * By default, if the key is Esc, it will trigger a `click` event.
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */handleKeyDown(e){if(e.key==="Escape"){e.preventDefault();e.stopPropagation();this.trigger("click")}else super.handleKeyDown(e)}}Component$1.registerComponent("CloseButton",CloseButton);class PlayToggle extends Button{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
constructor(e,t={}){super(e,t);t.replay=t.replay===void 0||t.replay;this.setIcon("play");this.on(e,"play",(e=>this.handlePlay(e)));this.on(e,"pause",(e=>this.handlePause(e)));t.replay&&this.on(e,"ended",(e=>this.handleEnded(e)))}buildCSSClass(){return`vjs-play-control ${super.buildCSSClass()}`}
/**
   * This gets called when an `PlayToggle` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){this.player_.paused()?silencePromise(this.player_.play()):this.player_.pause()}
/**
   * This gets called once after the video has ended and the user seeks so that
   * we can change the replay button back to a play button.
   *
   * @param {Event} [event]
   *        The event that caused this function to run.
   *
   * @listens Player#seeked
   */handleSeeked(e){this.removeClass("vjs-ended");this.player_.paused()?this.handlePause(e):this.handlePlay(e)}
/**
   * Add the vjs-playing class to the element so it can change appearance.
   *
   * @param {Event} [event]
   *        The event that caused this function to run.
   *
   * @listens Player#play
   */handlePlay(e){this.removeClass("vjs-ended","vjs-paused");this.addClass("vjs-playing");this.setIcon("pause");this.controlText("Pause")}
/**
   * Add the vjs-paused class to the element so it can change appearance.
   *
   * @param {Event} [event]
   *        The event that caused this function to run.
   *
   * @listens Player#pause
   */handlePause(e){this.removeClass("vjs-playing");this.addClass("vjs-paused");this.setIcon("play");this.controlText("Play")}
/**
   * Add the vjs-ended class to the element so it can change appearance
   *
   * @param {Event} [event]
   *        The event that caused this function to run.
   *
   * @listens Player#ended
   */handleEnded(e){this.removeClass("vjs-playing");this.addClass("vjs-ended");this.setIcon("replay");this.controlText("Replay");this.one(this.player_,"seeked",(e=>this.handleSeeked(e)))}}
/**
 * The text that should display over the `PlayToggle`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */PlayToggle.prototype.controlText_="Play";Component$1.registerComponent("PlayToggle",PlayToggle);class TimeDisplay extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.on(e,["timeupdate","ended","seeking"],(e=>this.update(e)));this.updateTextNode_()}createEl(){const e=this.buildCSSClass();const t=super.createEl("div",{className:`${e} vjs-time-control vjs-control`});const s=createEl("span",{className:"vjs-control-text",textContent:`${this.localize(this.labelText_)} `},{role:"presentation"});t.appendChild(s);this.contentEl_=createEl("span",{className:`${e}-display`},{role:"presentation"});t.appendChild(this.contentEl_);return t}dispose(){this.contentEl_=null;this.textNode_=null;super.dispose()}
/**
   * Updates the displayed time according to the `updateContent` function which is defined in the child class.
   *
   * @param {Event} [event]
   *          The `timeupdate`, `ended` or `seeking` (if enableSmoothSeeking is true) event that caused this function to be called.
   */update(e){(this.player_.options_.enableSmoothSeeking||e.type!=="seeking")&&this.updateContent(e)}
/**
   * Updates the time display text node with a new time
   *
   * @param {number} [time=0] the time to update to
   *
   * @private
   */updateTextNode_(e=0){e=formatTime(e);if(this.formattedTime_!==e){this.formattedTime_=e;this.requestNamedAnimationFrame("TimeDisplay#updateTextNode_",(()=>{if(!this.contentEl_)return;let e=this.textNode_;if(e&&this.contentEl_.firstChild!==e){e=null;B.warn("TimeDisplay#updateTextnode_: Prevented replacement of text node element since it was no longer a child of this node. Appending a new node instead.")}this.textNode_=t.createTextNode(this.formattedTime_);this.textNode_&&(e?this.contentEl_.replaceChild(this.textNode_,e):this.contentEl_.appendChild(this.textNode_))}))}}
/**
   * To be filled out in the child class, should update the displayed time
   * in accordance with the fact that the current time has changed.
   *
   * @param {Event} [event]
   *        The `timeupdate`  event that caused this to run.
   *
   * @listens Player#timeupdate
   */updateContent(e){}}
/**
 * The text that is added to the `TimeDisplay` for screen reader users.
 *
 * @type {string}
 * @private
 */TimeDisplay.prototype.labelText_="Time";
/**
 * The text that should display over the `TimeDisplay`s controls. Added to for localization.
 *
 * @type {string}
 * @protected
 *
 * @deprecated in v7; controlText_ is not used in non-active display Components
 */TimeDisplay.prototype.controlText_="Time";Component$1.registerComponent("TimeDisplay",TimeDisplay);class CurrentTimeDisplay extends TimeDisplay{buildCSSClass(){return"vjs-current-time"}
/**
   * Update current time display
   *
   * @param {Event} [event]
   *        The `timeupdate` event that caused this function to run.
   *
   * @listens Player#timeupdate
   */updateContent(e){let t;t=this.player_.ended()?this.player_.duration():this.player_.scrubbing()?this.player_.getCache().currentTime:this.player_.currentTime();this.updateTextNode_(t)}}
/**
 * The text that is added to the `CurrentTimeDisplay` for screen reader users.
 *
 * @type {string}
 * @private
 */CurrentTimeDisplay.prototype.labelText_="Current Time";
/**
 * The text that should display over the `CurrentTimeDisplay`s controls. Added to for localization.
 *
 * @type {string}
 * @protected
 *
 * @deprecated in v7; controlText_ is not used in non-active display Components
 */CurrentTimeDisplay.prototype.controlText_="Current Time";Component$1.registerComponent("CurrentTimeDisplay",CurrentTimeDisplay);class DurationDisplay extends TimeDisplay{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);const updateContent=e=>this.updateContent(e);this.on(e,"durationchange",updateContent);this.on(e,"loadstart",updateContent);this.on(e,"loadedmetadata",updateContent)}buildCSSClass(){return"vjs-duration"}
/**
   * Update duration time display.
   *
   * @param {Event} [event]
   *        The `durationchange`, `timeupdate`, or `loadedmetadata` event that caused
   *        this function to be called.
   *
   * @listens Player#durationchange
   * @listens Player#timeupdate
   * @listens Player#loadedmetadata
   */updateContent(e){const t=this.player_.duration();this.updateTextNode_(t)}}
/**
 * The text that is added to the `DurationDisplay` for screen reader users.
 *
 * @type {string}
 * @private
 */DurationDisplay.prototype.labelText_="Duration";
/**
 * The text that should display over the `DurationDisplay`s controls. Added to for localization.
 *
 * @type {string}
 * @protected
 *
 * @deprecated in v7; controlText_ is not used in non-active display Components
 */DurationDisplay.prototype.controlText_="Duration";Component$1.registerComponent("DurationDisplay",DurationDisplay);class TimeDivider extends Component$1{createEl(){const e=super.createEl("div",{className:"vjs-time-control vjs-time-divider"},{"aria-hidden":true});const t=super.createEl("div");const s=super.createEl("span",{textContent:"/"});t.appendChild(s);e.appendChild(t);return e}}Component$1.registerComponent("TimeDivider",TimeDivider);class RemainingTimeDisplay extends TimeDisplay{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.on(e,"durationchange",(e=>this.updateContent(e)))}buildCSSClass(){return"vjs-remaining-time"}createEl(){const e=super.createEl();this.options_.displayNegative!==false&&e.insertBefore(createEl("span",{},{"aria-hidden":true},"-"),this.contentEl_);return e}
/**
   * Update remaining time display.
   *
   * @param {Event} [event]
   *        The `timeupdate` or `durationchange` event that caused this to run.
   *
   * @listens Player#timeupdate
   * @listens Player#durationchange
   */updateContent(e){if(typeof this.player_.duration()!=="number")return;let t;t=this.player_.ended()?0:this.player_.remainingTimeDisplay?this.player_.remainingTimeDisplay():this.player_.remainingTime();this.updateTextNode_(t)}}
/**
 * The text that is added to the `RemainingTimeDisplay` for screen reader users.
 *
 * @type {string}
 * @private
 */RemainingTimeDisplay.prototype.labelText_="Remaining Time";
/**
 * The text that should display over the `RemainingTimeDisplay`s controls. Added to for localization.
 *
 * @type {string}
 * @protected
 *
 * @deprecated in v7; controlText_ is not used in non-active display Components
 */RemainingTimeDisplay.prototype.controlText_="Remaining Time";Component$1.registerComponent("RemainingTimeDisplay",RemainingTimeDisplay);class LiveDisplay extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.updateShowing();this.on(this.player(),"durationchange",(e=>this.updateShowing(e)))}createEl(){const e=super.createEl("div",{className:"vjs-live-control vjs-control"});this.contentEl_=createEl("div",{className:"vjs-live-display"},{"aria-live":"off"});this.contentEl_.appendChild(createEl("span",{className:"vjs-control-text",textContent:`${this.localize("Stream Type")} `}));this.contentEl_.appendChild(t.createTextNode(this.localize("LIVE")));e.appendChild(this.contentEl_);return e}dispose(){this.contentEl_=null;super.dispose()}
/**
   * Check the duration to see if the LiveDisplay should be showing or not. Then show/hide
   * it accordingly
   *
   * @param {Event} [event]
   *        The {@link Player#durationchange} event that caused this function to run.
   *
   * @listens Player#durationchange
   */updateShowing(e){this.player().duration()===Infinity?this.show():this.hide()}}Component$1.registerComponent("LiveDisplay",LiveDisplay);class SeekToLive extends Button{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.updateLiveEdgeStatus();if(this.player_.liveTracker){this.updateLiveEdgeStatusHandler_=e=>this.updateLiveEdgeStatus(e);this.on(this.player_.liveTracker,"liveedgechange",this.updateLiveEdgeStatusHandler_)}}createEl(){const e=super.createEl("button",{className:"vjs-seek-to-live-control vjs-control"});this.setIcon("circle",e);this.textEl_=createEl("span",{className:"vjs-seek-to-live-text",textContent:this.localize("LIVE")},{"aria-hidden":"true"});e.appendChild(this.textEl_);return e}updateLiveEdgeStatus(){if(!this.player_.liveTracker||this.player_.liveTracker.atLiveEdge()){this.setAttribute("aria-disabled",true);this.addClass("vjs-at-live-edge");this.controlText("Seek to live, currently playing live")}else{this.setAttribute("aria-disabled",false);this.removeClass("vjs-at-live-edge");this.controlText("Seek to live, currently behind live")}}handleClick(){this.player_.liveTracker.seekToLiveEdge()}dispose(){this.player_.liveTracker&&this.off(this.player_.liveTracker,"liveedgechange",this.updateLiveEdgeStatusHandler_);this.textEl_=null;super.dispose()}}
/**
 * The text that should display over the `SeekToLive`s control. Added for localization.
 *
 * @type {string}
 * @protected
 */SeekToLive.prototype.controlText_="Seek to live, currently playing live";Component$1.registerComponent("SeekToLive",SeekToLive);
/**
 * Keep a number between a min and a max value
 *
 * @param {number} number
 *        The number to clamp
 *
 * @param {number} min
 *        The minimum value
 * @param {number} max
 *        The maximum value
 *
 * @return {number}
 *         the clamped number
 */function clamp(e,t,s){e=Number(e);return Math.min(s,Math.max(t,isNaN(e)?t:e))}var et=Object.freeze({__proto__:null,clamp:clamp});class Slider extends Component$1{
/**
  * Create an instance of this class
  *
  * @param {Player} player
  *        The `Player` that this class should be attached to.
  *
  * @param {Object} [options]
  *        The key/value store of player options.
  */
constructor(e,t){super(e,t);this.handleMouseDown_=e=>this.handleMouseDown(e);this.handleMouseUp_=e=>this.handleMouseUp(e);this.handleKeyDown_=e=>this.handleKeyDown(e);this.handleClick_=e=>this.handleClick(e);this.handleMouseMove_=e=>this.handleMouseMove(e);this.update_=e=>this.update(e);this.bar=this.getChild(this.options_.barName);this.vertical(!!this.options_.vertical);this.enable()}enabled(){return this.enabled_}enable(){if(!this.enabled()){this.on("mousedown",this.handleMouseDown_);this.on("touchstart",this.handleMouseDown_);this.on("keydown",this.handleKeyDown_);this.on("click",this.handleClick_);this.on(this.player_,"controlsvisible",this.update);this.playerEvent&&this.on(this.player_,this.playerEvent,this.update);this.removeClass("disabled");this.setAttribute("tabindex",0);this.enabled_=true}}disable(){if(!this.enabled())return;const e=this.bar.el_.ownerDocument;this.off("mousedown",this.handleMouseDown_);this.off("touchstart",this.handleMouseDown_);this.off("keydown",this.handleKeyDown_);this.off("click",this.handleClick_);this.off(this.player_,"controlsvisible",this.update_);this.off(e,"mousemove",this.handleMouseMove_);this.off(e,"mouseup",this.handleMouseUp_);this.off(e,"touchmove",this.handleMouseMove_);this.off(e,"touchend",this.handleMouseUp_);this.removeAttribute("tabindex");this.addClass("disabled");this.playerEvent&&this.off(this.player_,this.playerEvent,this.update);this.enabled_=false}
/**
   * Create the `Slider`s DOM element.
   *
   * @param {string} type
   *        Type of element to create.
   *
   * @param {Object} [props={}]
   *        List of properties in Object form.
   *
   * @param {Object} [attributes={}]
   *        list of attributes in Object form.
   *
   * @return {Element}
   *         The element that gets created.
   */createEl(e,t={},s={}){t.className=t.className+" vjs-slider";t=Object.assign({tabIndex:0},t);s=Object.assign({role:"slider","aria-valuenow":0,"aria-valuemin":0,"aria-valuemax":100},s);return super.createEl(e,t,s)}
/**
   * Handle `mousedown` or `touchstart` events on the `Slider`.
   *
   * @param {MouseEvent} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   * @listens touchstart
   * @fires Slider#slideractive
   */handleMouseDown(e){const t=this.bar.el_.ownerDocument;e.type==="mousedown"&&e.preventDefault();e.type!=="touchstart"||K||e.preventDefault();blockTextSelection();this.addClass("vjs-sliding");
/**
     * Triggered when the slider is in an active state
     *
     * @event Slider#slideractive
     * @type {MouseEvent}
     */this.trigger("slideractive");this.on(t,"mousemove",this.handleMouseMove_);this.on(t,"mouseup",this.handleMouseUp_);this.on(t,"touchmove",this.handleMouseMove_);this.on(t,"touchend",this.handleMouseUp_);this.handleMouseMove(e,true)}
/**
   * Handle the `mousemove`, `touchmove`, and `mousedown` events on this `Slider`.
   * The `mousemove` and `touchmove` events will only only trigger this function during
   * `mousedown` and `touchstart`. This is due to {@link Slider#handleMouseDown} and
   * {@link Slider#handleMouseUp}.
   *
   * @param {MouseEvent} event
   *        `mousedown`, `mousemove`, `touchstart`, or `touchmove` event that triggered
   *        this function
   * @param {boolean} mouseDown this is a flag that should be set to true if `handleMouseMove` is called directly. It allows us to skip things that should not happen if coming from mouse down but should happen on regular mouse move handler. Defaults to false.
   *
   * @listens mousemove
   * @listens touchmove
   */handleMouseMove(e){}
/**
   * Handle `mouseup` or `touchend` events on the `Slider`.
   *
   * @param {MouseEvent} event
   *        `mouseup` or `touchend` event that triggered this function.
   *
   * @listens touchend
   * @listens mouseup
   * @fires Slider#sliderinactive
   */handleMouseUp(e){const t=this.bar.el_.ownerDocument;unblockTextSelection();this.removeClass("vjs-sliding");
/**
     * Triggered when the slider is no longer in an active state.
     *
     * @event Slider#sliderinactive
     * @type {Event}
     */this.trigger("sliderinactive");this.off(t,"mousemove",this.handleMouseMove_);this.off(t,"mouseup",this.handleMouseUp_);this.off(t,"touchmove",this.handleMouseMove_);this.off(t,"touchend",this.handleMouseUp_);this.update()}update(){if(!this.el_||!this.bar)return;const e=this.getProgress();if(e===this.progress_)return e;this.progress_=e;this.requestNamedAnimationFrame("Slider#update",(()=>{const t=this.vertical()?"height":"width";this.bar.el().style[t]=(e*100).toFixed(2)+"%"}));return e}getProgress(){return Number(clamp(this.getPercent(),0,1).toFixed(4))}
/**
   * Calculate distance for slider
   *
   * @param {Event} event
   *        The event that caused this function to run.
   *
   * @return {number}
   *         The current position of the Slider.
   *         - position.x for vertical `Slider`s
   *         - position.y for horizontal `Slider`s
   */calculateDistance(e){const t=getPointerPosition(this.el_,e);return this.vertical()?t.y:t.x}
/**
   * Handle a `keydown` event on the `Slider`. Watches for left, right, up, and down
   * arrow keys. This function will only be called when the slider has focus. See
   * {@link Slider#handleFocus} and {@link Slider#handleBlur}.
   *
   * @param {KeyboardEvent} event
   *        the `keydown` event that caused this function to run.
   *
   * @listens keydown
   */handleKeyDown(e){const t=this.options_.playerOptions.spatialNavigation;const s=t&&t.enabled;const i=t&&t.horizontalSeek;if(s)if(i&&e.key==="ArrowLeft"||!i&&e.key==="ArrowDown"){e.preventDefault();e.stopPropagation();this.stepBack()}else if(i&&e.key==="ArrowRight"||!i&&e.key==="ArrowUp"){e.preventDefault();e.stopPropagation();this.stepForward()}else super.handleKeyDown(e);else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){e.preventDefault();e.stopPropagation();this.stepBack()}else if(e.key==="ArrowUp"||e.key==="ArrowRight"){e.preventDefault();e.stopPropagation();this.stepForward()}else super.handleKeyDown(e)}
/**
   * Listener for click events on slider, used to prevent clicks
   *   from bubbling up to parent elements like button menus.
   *
   * @param {Object} event
   *        Event that caused this object to run
   */handleClick(e){e.stopPropagation();e.preventDefault()}
/**
   * Get/set if slider is horizontal for vertical
   *
   * @param {boolean} [bool]
   *        - true if slider is vertical,
   *        - false is horizontal
   *
   * @return {boolean}
   *         - true if slider is vertical, and getting
   *         - false if the slider is horizontal, and getting
   */vertical(e){if(e===void 0)return this.vertical_||false;this.vertical_=!!e;this.vertical_?this.addClass("vjs-slider-vertical"):this.addClass("vjs-slider-horizontal")}}Component$1.registerComponent("Slider",Slider);const percentify=(e,t)=>clamp(e/t*100,0,100).toFixed(2)+"%";class LoadProgressBar extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.partEls_=[];this.on(e,"progress",(e=>this.update(e)))}createEl(){const e=super.createEl("div",{className:"vjs-load-progress"});const s=createEl("span",{className:"vjs-control-text"});const i=createEl("span",{textContent:this.localize("Loaded")});const n=t.createTextNode(": ");this.percentageEl_=createEl("span",{className:"vjs-control-text-loaded-percentage",textContent:"0%"});e.appendChild(s);s.appendChild(i);s.appendChild(n);s.appendChild(this.percentageEl_);return e}dispose(){this.partEls_=null;this.percentageEl_=null;super.dispose()}
/**
   * Update progress bar
   *
   * @param {Event} [event]
   *        The `progress` event that caused this function to run.
   *
   * @listens Player#progress
   */update(e){this.requestNamedAnimationFrame("LoadProgressBar#update",(()=>{const e=this.player_.liveTracker;const t=this.player_.buffered();const s=e&&e.isLive()?e.seekableEnd():this.player_.duration();const i=this.player_.bufferedEnd();const n=this.partEls_;const r=percentify(i,s);if(this.percent_!==r){this.el_.style.width=r;textContent(this.percentageEl_,r);this.percent_=r}for(let e=0;e<t.length;e++){const s=t.start(e);const r=t.end(e);let a=n[e];if(!a){a=this.el_.appendChild(createEl());n[e]=a}if(a.dataset.start!==s||a.dataset.end!==r){a.dataset.start=s;a.dataset.end=r;a.style.left=percentify(s,i);a.style.width=percentify(r-s,i)}}for(let e=n.length;e>t.length;e--)this.el_.removeChild(n[e-1]);n.length=t.length}))}}Component$1.registerComponent("LoadProgressBar",LoadProgressBar);class TimeTooltip extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The {@link Player} that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.update=throttle(bind_(this,this.update),Se)}createEl(){return super.createEl("div",{className:"vjs-time-tooltip"},{"aria-hidden":"true"})}
/**
   * Updates the position of the time tooltip relative to the `SeekBar`.
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   */update(e,t,s){const i=findPosition(this.el_);const n=getBoundingClientRect(this.player_.el());const r=e.width*t;if(!n||!i)return;let a=e.left-n.left+r;let o=e.width-r+(n.right-e.right);if(!o){o=e.width-r;a=r}let l=i.width/2;a<l?l+=l-a:o<l&&(l=o);l<0?l=0:l>i.width&&(l=i.width);l=Math.round(l);this.el_.style.right=`-${l}px`;this.write(s)}
/**
   * Write the time to the tooltip DOM element.
   *
   * @param {string} content
   *        The formatted time for the tooltip.
   */write(e){textContent(this.el_,e)}
/**
   * Updates the position of the time tooltip relative to the `SeekBar`.
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   *
   * @param {number} time
   *        The time to update the tooltip to, not used during live playback
   *
   * @param {Function} cb
   *        A function that will be called during the request animation frame
   *        for tooltips that need to do additional animations from the default
   */updateTime(e,t,s,i){this.requestNamedAnimationFrame("TimeTooltip#updateTime",(()=>{let n;const r=this.player_.duration();if(this.player_.liveTracker&&this.player_.liveTracker.isLive()){const e=this.player_.liveTracker.liveWindow();const s=e-t*e;n=(s<1?"":"-")+formatTime(s,e)}else n=formatTime(s,r);this.update(e,t,n);i&&i()}))}}Component$1.registerComponent("TimeTooltip",TimeTooltip);class PlayProgressBar extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The {@link Player} that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.setIcon("circle");this.update=throttle(bind_(this,this.update),Se)}createEl(){return super.createEl("div",{className:"vjs-play-progress vjs-slider-bar"},{"aria-hidden":"true"})}
/**
   * Enqueues updates to its own DOM as well as the DOM of its
   * {@link TimeTooltip} child.
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   */update(e,t){const s=this.getChild("timeTooltip");if(!s)return;const i=this.player_.scrubbing()?this.player_.getCache().currentTime:this.player_.currentTime();s.updateTime(e,t,i)}}
/**
 * Default options for {@link PlayProgressBar}.
 *
 * @type {Object}
 * @private
 */PlayProgressBar.prototype.options_={children:[]};le||q||PlayProgressBar.prototype.options_.children.push("timeTooltip");Component$1.registerComponent("PlayProgressBar",PlayProgressBar);class MouseTimeDisplay extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The {@link Player} that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.update=throttle(bind_(this,this.update),Se)}createEl(){return super.createEl("div",{className:"vjs-mouse-display"})}
/**
   * Enqueues updates to its own DOM as well as the DOM of its
   * {@link TimeTooltip} child.
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   */update(e,t){const s=t*this.player_.duration();this.getChild("timeTooltip").updateTime(e,t,s,(()=>{this.el_.style.left=e.width*t+"px"}))}}
/**
 * Default options for `MouseTimeDisplay`
 *
 * @type {Object}
 * @private
 */MouseTimeDisplay.prototype.options_={children:["timeTooltip"]};Component$1.registerComponent("MouseTimeDisplay",MouseTimeDisplay);const tt=5;const st=12;class SeekBar extends Slider{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){t=merge$1(SeekBar.prototype.options_,t);t.children=[...t.children];const s=e.options_.disableSeekWhileScrubbingOnMobile&&(le||q);(!le&&!q||s)&&t.children.splice(1,0,"mouseTimeDisplay");super(e,t);this.shouldDisableSeekWhileScrubbingOnMobile_=s;this.pendingSeekTime_=null;this.setEventHandlers_()}setEventHandlers_(){this.update_=bind_(this,this.update);this.update=throttle(this.update_,Se);this.on(this.player_,["durationchange","timeupdate"],this.update);this.on(this.player_,["ended"],this.update_);this.player_.liveTracker&&this.on(this.player_.liveTracker,"liveedgechange",this.update);this.updateInterval=null;this.enableIntervalHandler_=e=>this.enableInterval_(e);this.disableIntervalHandler_=e=>this.disableInterval_(e);this.on(this.player_,["playing"],this.enableIntervalHandler_);this.on(this.player_,["ended","pause","waiting"],this.disableIntervalHandler_);"hidden"in t&&"visibilityState"in t&&this.on(t,"visibilitychange",this.toggleVisibility_)}toggleVisibility_(e){if(t.visibilityState==="hidden"){this.cancelNamedAnimationFrame("SeekBar#update");this.cancelNamedAnimationFrame("Slider#update");this.disableInterval_(e)}else{this.player_.ended()||this.player_.paused()||this.enableInterval_();this.update()}}enableInterval_(){this.updateInterval||(this.updateInterval=this.setInterval(this.update,Se))}disableInterval_(e){if(!(this.player_.liveTracker&&this.player_.liveTracker.isLive()&&e&&e.type!=="ended")&&this.updateInterval){this.clearInterval(this.updateInterval);this.updateInterval=null}}createEl(){return super.createEl("div",{className:"vjs-progress-holder"},{"aria-label":this.localize("Progress Bar")})}
/**
   * This function updates the play progress bar and accessibility
   * attributes to whatever is passed in.
   *
   * @param {Event} [event]
   *        The `timeupdate` or `ended` event that caused this to run.
   *
   * @listens Player#timeupdate
   *
   * @return {number}
   *          The current percent at a number from 0-1
   */update(e){if(t.visibilityState==="hidden")return;const s=super.update();this.requestNamedAnimationFrame("SeekBar#update",(()=>{const e=this.player_.ended()?this.player_.duration():this.getCurrentTime_();const t=this.player_.liveTracker;let i=this.player_.duration();t&&t.isLive()&&(i=this.player_.liveTracker.liveCurrentTime());if(this.percent_!==s){this.el_.setAttribute("aria-valuenow",(s*100).toFixed(2));this.percent_=s}if(this.currentTime_!==e||this.duration_!==i){this.el_.setAttribute("aria-valuetext",this.localize("progress bar timing: currentTime={1} duration={2}",[formatTime(e,i),formatTime(i,i)],"{1} of {2}"));this.currentTime_=e;this.duration_=i}this.bar&&this.bar.update(getBoundingClientRect(this.el()),this.getProgress())}));return s}
/**
   * Prevent liveThreshold from causing seeks to seem like they
   * are not happening from a user perspective.
   *
   * @param {number} ct
   *        current time to seek to
   */userSeek_(e){this.player_.liveTracker&&this.player_.liveTracker.isLive()&&this.player_.liveTracker.nextSeekedFromUser();this.player_.currentTime(e)}getCurrentTime_(){return this.player_.scrubbing()?this.player_.getCache().currentTime:this.player_.currentTime()}getPercent(){if(this.pendingSeekTime_)return this.pendingSeekTime_/this.player_.duration();const e=this.getCurrentTime_();let t;const s=this.player_.liveTracker;if(s&&s.isLive()){t=(e-s.seekableStart())/s.liveWindow();s.atLiveEdge()&&(t=1)}else t=e/this.player_.duration();return t}
/**
   * Handle mouse down on seek bar
   *
   * @param {MouseEvent} event
   *        The `mousedown` event that caused this to run.
   *
   * @listens mousedown
   */handleMouseDown(e){if(isSingleLeftClick(e)){e.stopPropagation();this.videoWasPlaying=!this.player_.paused();this.shouldDisableSeekWhileScrubbingOnMobile_||this.player_.pause();super.handleMouseDown(e)}}
/**
   * Handle mouse move on seek bar
   *
   * @param {MouseEvent} event
   *        The `mousemove` event that caused this to run.
   * @param {boolean} mouseDown this is a flag that should be set to true if `handleMouseMove` is called directly. It allows us to skip things that should not happen if coming from mouse down but should happen on regular mouse move handler. Defaults to false
   *
   * @listens mousemove
   */handleMouseMove(e,t=false){if(!isSingleLeftClick(e)||isNaN(this.player_.duration()))return;t||this.player_.scrubbing()||this.player_.scrubbing(true);let s;const i=this.calculateDistance(e);const n=this.player_.liveTracker;if(n&&n.isLive()){if(i>=.99){n.seekToLiveEdge();return}const e=n.seekableStart();const t=n.liveCurrentTime();s=e+i*n.liveWindow();s>=t&&(s=t);s<=e&&(s=e+.1);if(s===Infinity)return}else{s=i*this.player_.duration();s===this.player_.duration()&&(s-=.1)}this.shouldDisableSeekWhileScrubbingOnMobile_?this.pendingSeekTime_=s:this.userSeek_(s);this.player_.options_.enableSmoothSeeking&&this.update()}enable(){super.enable();const e=this.getChild("mouseTimeDisplay");e&&e.show()}disable(){super.disable();const e=this.getChild("mouseTimeDisplay");e&&e.hide()}
/**
   * Handle mouse up on seek bar
   *
   * @param {MouseEvent} event
   *        The `mouseup` event that caused this to run.
   *
   * @listens mouseup
   */handleMouseUp(e){super.handleMouseUp(e);e&&e.stopPropagation();this.player_.scrubbing(false);if(this.pendingSeekTime_){this.userSeek_(this.pendingSeekTime_);this.pendingSeekTime_=null}
/**
     * Trigger timeupdate because we're done seeking and the time has changed.
     * This is particularly useful for if the player is paused to time the time displays.
     *
     * @event Tech#timeupdate
     * @type {Event}
     */this.player_.trigger({type:"timeupdate",target:this,manuallyTriggered:true});this.videoWasPlaying?silencePromise(this.player_.play()):this.update_()}stepForward(){this.userSeek_(this.player_.currentTime()+tt)}stepBack(){this.userSeek_(this.player_.currentTime()-tt)}
/**
   * Toggles the playback state of the player
   * This gets called when enter or space is used on the seekbar
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called
   *
   */handleAction(e){this.player_.paused()?this.player_.play():this.player_.pause()}
/**
   * Called when this SeekBar has focus and a key gets pressed down.
   * Supports the following keys:
   *
   *   Space or Enter key fire a click event
   *   Home key moves to start of the timeline
   *   End key moves to end of the timeline
   *   Digit "0" through "9" keys move to 0%, 10% ... 80%, 90% of the timeline
   *   PageDown key moves back a larger step than ArrowDown
   *   PageUp key moves forward a large step
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */handleKeyDown(e){const t=this.player_.liveTracker;if(e.key===" "||e.key==="Enter"){e.preventDefault();e.stopPropagation();this.handleAction(e)}else if(e.key==="Home"){e.preventDefault();e.stopPropagation();this.userSeek_(0)}else if(e.key==="End"){e.preventDefault();e.stopPropagation();t&&t.isLive()?this.userSeek_(t.liveCurrentTime()):this.userSeek_(this.player_.duration())}else if(/^[0-9]$/.test(e.key)){e.preventDefault();e.stopPropagation();const s=parseInt(e.key,10)*.1;t&&t.isLive()?this.userSeek_(t.seekableStart()+t.liveWindow()*s):this.userSeek_(this.player_.duration()*s)}else if(e.key==="PageDown"){e.preventDefault();e.stopPropagation();this.userSeek_(this.player_.currentTime()-tt*st)}else if(e.key==="PageUp"){e.preventDefault();e.stopPropagation();this.userSeek_(this.player_.currentTime()+tt*st)}else super.handleKeyDown(e)}dispose(){this.disableInterval_();this.off(this.player_,["durationchange","timeupdate"],this.update);this.off(this.player_,["ended"],this.update_);this.player_.liveTracker&&this.off(this.player_.liveTracker,"liveedgechange",this.update);this.off(this.player_,["playing"],this.enableIntervalHandler_);this.off(this.player_,["ended","pause","waiting"],this.disableIntervalHandler_);"hidden"in t&&"visibilityState"in t&&this.off(t,"visibilitychange",this.toggleVisibility_);super.dispose()}}
/**
 * Default options for the `SeekBar`
 *
 * @type {Object}
 * @private
 */SeekBar.prototype.options_={children:["loadProgressBar","playProgressBar"],barName:"playProgressBar"};Component$1.registerComponent("SeekBar",SeekBar);class ProgressControl extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.handleMouseMove=throttle(bind_(this,this.handleMouseMove),Se);this.throttledHandleMouseSeek=throttle(bind_(this,this.handleMouseSeek),Se);this.handleMouseUpHandler_=e=>this.handleMouseUp(e);this.handleMouseDownHandler_=e=>this.handleMouseDown(e);this.enable()}createEl(){return super.createEl("div",{className:"vjs-progress-control vjs-control"})}
/**
   * When the mouse moves over the `ProgressControl`, the pointer position
   * gets passed down to the `MouseTimeDisplay` component.
   *
   * @param {Event} event
   *        The `mousemove` event that caused this function to run.
   *
   * @listen mousemove
   */handleMouseMove(e){const t=this.getChild("seekBar");if(!t)return;const s=t.getChild("playProgressBar");const i=t.getChild("mouseTimeDisplay");if(!s&&!i)return;const n=t.el();const r=findPosition(n);let a=getPointerPosition(n,e).x;a=clamp(a,0,1);i&&i.update(r,a);s&&s.update(r,t.getProgress())}
/**
   * A throttled version of the {@link ProgressControl#handleMouseSeek} listener.
   *
   * @method ProgressControl#throttledHandleMouseSeek
   * @param {Event} event
   *        The `mousemove` event that caused this function to run.
   *
   * @listen mousemove
   * @listen touchmove
   */
/**
   * Handle `mousemove` or `touchmove` events on the `ProgressControl`.
   *
   * @param {Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousemove
   * @listens touchmove
   */handleMouseSeek(e){const t=this.getChild("seekBar");t&&t.handleMouseMove(e)}enabled(){return this.enabled_}disable(){this.children().forEach((e=>e.disable&&e.disable()));if(this.enabled()){this.off(["mousedown","touchstart"],this.handleMouseDownHandler_);this.off(this.el_,["mousemove","touchmove"],this.handleMouseMove);this.removeListenersAddedOnMousedownAndTouchstart();this.addClass("disabled");this.enabled_=false;if(this.player_.scrubbing()){const e=this.getChild("seekBar");this.player_.scrubbing(false);e.videoWasPlaying&&silencePromise(this.player_.play())}}}enable(){this.children().forEach((e=>e.enable&&e.enable()));if(!this.enabled()){this.on(["mousedown","touchstart"],this.handleMouseDownHandler_);this.on(this.el_,["mousemove","touchmove"],this.handleMouseMove);this.removeClass("disabled");this.enabled_=true}}removeListenersAddedOnMousedownAndTouchstart(){const e=this.el_.ownerDocument;this.off(e,"mousemove",this.throttledHandleMouseSeek);this.off(e,"touchmove",this.throttledHandleMouseSeek);this.off(e,"mouseup",this.handleMouseUpHandler_);this.off(e,"touchend",this.handleMouseUpHandler_)}
/**
   * Handle `mousedown` or `touchstart` events on the `ProgressControl`.
   *
   * @param {Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   * @listens touchstart
   */handleMouseDown(e){const t=this.el_.ownerDocument;const s=this.getChild("seekBar");s&&s.handleMouseDown(e);this.on(t,"mousemove",this.throttledHandleMouseSeek);this.on(t,"touchmove",this.throttledHandleMouseSeek);this.on(t,"mouseup",this.handleMouseUpHandler_);this.on(t,"touchend",this.handleMouseUpHandler_)}
/**
   * Handle `mouseup` or `touchend` events on the `ProgressControl`.
   *
   * @param {Event} event
   *        `mouseup` or `touchend` event that triggered this function.
   *
   * @listens touchend
   * @listens mouseup
   */handleMouseUp(e){const t=this.getChild("seekBar");t&&t.handleMouseUp(e);this.removeListenersAddedOnMousedownAndTouchstart()}}
/**
 * Default options for `ProgressControl`
 *
 * @type {Object}
 * @private
 */ProgressControl.prototype.options_={children:["seekBar"]};Component$1.registerComponent("ProgressControl",ProgressControl);class PictureInPictureToggle extends Button{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @listens Player#enterpictureinpicture
   * @listens Player#leavepictureinpicture
   */
constructor(e,t){super(e,t);this.setIcon("picture-in-picture-enter");this.on(e,["enterpictureinpicture","leavepictureinpicture"],(e=>this.handlePictureInPictureChange(e)));this.on(e,["disablepictureinpicturechanged","loadedmetadata"],(e=>this.handlePictureInPictureEnabledChange(e)));this.on(e,["loadedmetadata","audioonlymodechange","audiopostermodechange"],(()=>this.handlePictureInPictureAudioModeChange()));this.disable()}buildCSSClass(){return`vjs-picture-in-picture-control vjs-hidden ${super.buildCSSClass()}`}handlePictureInPictureAudioModeChange(){const e=this.player_.currentType().substring(0,5)==="audio";const t=e||this.player_.audioPosterMode()||this.player_.audioOnlyMode();if(t){this.player_.isInPictureInPicture()&&this.player_.exitPictureInPicture();this.hide()}else this.show()}handlePictureInPictureEnabledChange(){t.pictureInPictureEnabled&&this.player_.disablePictureInPicture()===false||this.player_.options_.enableDocumentPictureInPicture&&"documentPictureInPicture"in e?this.enable():this.disable()}
/**
   * Handles enterpictureinpicture and leavepictureinpicture on the player and change control text accordingly.
   *
   * @param {Event} [event]
   *        The {@link Player#enterpictureinpicture} or {@link Player#leavepictureinpicture} event that caused this function to be
   *        called.
   *
   * @listens Player#enterpictureinpicture
   * @listens Player#leavepictureinpicture
   */handlePictureInPictureChange(e){if(this.player_.isInPictureInPicture()){this.setIcon("picture-in-picture-exit");this.controlText("Exit Picture-in-Picture")}else{this.setIcon("picture-in-picture-enter");this.controlText("Picture-in-Picture")}this.handlePictureInPictureEnabledChange()}
/**
   * This gets called when an `PictureInPictureToggle` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){this.player_.isInPictureInPicture()?this.player_.exitPictureInPicture():this.player_.requestPictureInPicture()}show(){typeof t.exitPictureInPicture==="function"&&super.show()}}
/**
 * The text that should display over the `PictureInPictureToggle`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */PictureInPictureToggle.prototype.controlText_="Picture-in-Picture";Component$1.registerComponent("PictureInPictureToggle",PictureInPictureToggle);class FullscreenToggle extends Button{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,s){super(e,s);this.setIcon("fullscreen-enter");this.on(e,"fullscreenchange",(e=>this.handleFullscreenChange(e)));t[e.fsApi_.fullscreenEnabled]===false&&this.disable()}buildCSSClass(){return`vjs-fullscreen-control ${super.buildCSSClass()}`}
/**
   * Handles fullscreenchange on the player and change control text accordingly.
   *
   * @param {Event} [event]
   *        The {@link Player#fullscreenchange} event that caused this function to be
   *        called.
   *
   * @listens Player#fullscreenchange
   */handleFullscreenChange(e){if(this.player_.isFullscreen()){this.controlText("Exit Fullscreen");this.setIcon("fullscreen-exit")}else{this.controlText("Fullscreen");this.setIcon("fullscreen-enter")}}
/**
   * This gets called when an `FullscreenToggle` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){this.player_.isFullscreen()?this.player_.exitFullscreen():this.player_.requestFullscreen()}}
/**
 * The text that should display over the `FullscreenToggle`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */FullscreenToggle.prototype.controlText_="Fullscreen";Component$1.registerComponent("FullscreenToggle",FullscreenToggle);
/**
 * Check if volume control is supported and if it isn't hide the
 * `Component` that was passed  using the `vjs-hidden` class.
 *
 * @param {Component} self
 *        The component that should be hidden if volume is unsupported
 *
 * @param {Player} player
 *        A reference to the player
 *
 * @private
 */const checkVolumeSupport=function(e,t){t.tech_&&!t.tech_.featuresVolumeControl&&e.addClass("vjs-hidden");e.on(t,"loadstart",(function(){t.tech_.featuresVolumeControl?e.removeClass("vjs-hidden"):e.addClass("vjs-hidden")}))};class VolumeLevel extends Component$1{createEl(){const e=super.createEl("div",{className:"vjs-volume-level"});this.setIcon("circle",e);e.appendChild(super.createEl("span",{className:"vjs-control-text"}));return e}}Component$1.registerComponent("VolumeLevel",VolumeLevel);class VolumeLevelTooltip extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The {@link Player} that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.update=throttle(bind_(this,this.update),Se)}createEl(){return super.createEl("div",{className:"vjs-volume-tooltip"},{"aria-hidden":"true"})}
/**
   * Updates the position of the tooltip relative to the `VolumeBar` and
   * its content text.
   *
   * @param {Object} rangeBarRect
   *        The `ClientRect` for the {@link VolumeBar} element.
   *
   * @param {number} rangeBarPoint
   *        A number from 0 to 1, representing a horizontal/vertical reference point
   *        from the left edge of the {@link VolumeBar}
   *
   * @param {boolean} vertical
   *        Referees to the Volume control position
   *        in the control bar{@link VolumeControl}
   *
   */update(e,t,s,i){if(!s){const s=getBoundingClientRect(this.el_);const i=getBoundingClientRect(this.player_.el());const n=e.width*t;if(!i||!s)return;const r=e.left-i.left+n;const a=e.width-n+(i.right-e.right);let o=s.width/2;r<o?o+=o-r:a<o&&(o=a);o<0?o=0:o>s.width&&(o=s.width);this.el_.style.right=`-${o}px`}this.write(`${i}%`)}
/**
   * Write the volume to the tooltip DOM element.
   *
   * @param {string} content
   *        The formatted volume for the tooltip.
   */write(e){textContent(this.el_,e)}
/**
   * Updates the position of the volume tooltip relative to the `VolumeBar`.
   *
   * @param {Object} rangeBarRect
   *        The `ClientRect` for the {@link VolumeBar} element.
   *
   * @param {number} rangeBarPoint
   *        A number from 0 to 1, representing a horizontal/vertical reference point
   *        from the left edge of the {@link VolumeBar}
   *
   * @param {boolean} vertical
   *        Referees to the Volume control position
   *        in the control bar{@link VolumeControl}
   *
   * @param {number} volume
   *        The volume level to update the tooltip to
   *
   * @param {Function} cb
   *        A function that will be called during the request animation frame
   *        for tooltips that need to do additional animations from the default
   */updateVolume(e,t,s,i,n){this.requestNamedAnimationFrame("VolumeLevelTooltip#updateVolume",(()=>{this.update(e,t,s,i.toFixed(0));n&&n()}))}}Component$1.registerComponent("VolumeLevelTooltip",VolumeLevelTooltip);class MouseVolumeLevelDisplay extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The {@link Player} that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.update=throttle(bind_(this,this.update),Se)}createEl(){return super.createEl("div",{className:"vjs-mouse-display"})}
/**
   * Enquires updates to its own DOM as well as the DOM of its
   * {@link VolumeLevelTooltip} child.
   *
   * @param {Object} rangeBarRect
   *        The `ClientRect` for the {@link VolumeBar} element.
   *
   * @param {number} rangeBarPoint
   *        A number from 0 to 1, representing a horizontal/vertical reference point
   *        from the left edge of the {@link VolumeBar}
   *
   * @param {boolean} vertical
   *        Referees to the Volume control position
   *        in the control bar{@link VolumeControl}
   *
   */update(e,t,s){const i=100*t;this.getChild("volumeLevelTooltip").updateVolume(e,t,s,i,(()=>{s?this.el_.style.bottom=e.height*t+"px":this.el_.style.left=e.width*t+"px"}))}}
/**
 * Default options for `MouseVolumeLevelDisplay`
 *
 * @type {Object}
 * @private
 */MouseVolumeLevelDisplay.prototype.options_={children:["volumeLevelTooltip"]};Component$1.registerComponent("MouseVolumeLevelDisplay",MouseVolumeLevelDisplay);class VolumeBar extends Slider{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.on("slideractive",(e=>this.updateLastVolume_(e)));this.on(e,"volumechange",(e=>this.updateARIAAttributes(e)));e.ready((()=>this.updateARIAAttributes()))}createEl(){return super.createEl("div",{className:"vjs-volume-bar vjs-slider-bar"},{"aria-label":this.localize("Volume Level"),"aria-live":"polite"})}
/**
   * Handle mouse down on volume bar
   *
   * @param {Event} event
   *        The `mousedown` event that caused this to run.
   *
   * @listens mousedown
   */handleMouseDown(e){isSingleLeftClick(e)&&super.handleMouseDown(e)}
/**
   * Handle movement events on the {@link VolumeMenuButton}.
   *
   * @param {Event} event
   *        The event that caused this function to run.
   *
   * @listens mousemove
   */handleMouseMove(e){const t=this.getChild("mouseVolumeLevelDisplay");if(t){const s=this.el();const i=getBoundingClientRect(s);const n=this.vertical();let r=getPointerPosition(s,e);r=n?r.y:r.x;r=clamp(r,0,1);t.update(i,r,n)}if(isSingleLeftClick(e)){this.checkMuted();this.player_.volume(this.calculateDistance(e))}}checkMuted(){this.player_.muted()&&this.player_.muted(false)}getPercent(){return this.player_.muted()?0:this.player_.volume()}stepForward(){this.checkMuted();this.player_.volume(this.player_.volume()+.1)}stepBack(){this.checkMuted();this.player_.volume(this.player_.volume()-.1)}
/**
   * Update ARIA accessibility attributes
   *
   * @param {Event} [event]
   *        The `volumechange` event that caused this function to run.
   *
   * @listens Player#volumechange
   */updateARIAAttributes(e){const t=this.player_.muted()?0:this.volumeAsPercentage_();this.el_.setAttribute("aria-valuenow",t);this.el_.setAttribute("aria-valuetext",t+"%")}volumeAsPercentage_(){return Math.round(this.player_.volume()*100)}updateLastVolume_(){const e=this.player_.volume();this.one("sliderinactive",(()=>{this.player_.volume()===0&&this.player_.lastVolume_(e)}))}}
/**
 * Default options for the `VolumeBar`
 *
 * @type {Object}
 * @private
 */VolumeBar.prototype.options_={children:["volumeLevel"],barName:"volumeLevel"};le||q||VolumeBar.prototype.options_.children.splice(0,0,"mouseVolumeLevelDisplay")
/**
 * Call the update event for this Slider when this event happens on the player.
 *
 * @type {string}
 */;VolumeBar.prototype.playerEvent="volumechange";Component$1.registerComponent("VolumeBar",VolumeBar);class VolumeControl extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
constructor(e,t={}){t.vertical=t.vertical||false;if(typeof t.volumeBar==="undefined"||isPlain(t.volumeBar)){t.volumeBar=t.volumeBar||{};t.volumeBar.vertical=t.vertical}super(e,t);checkVolumeSupport(this,e);this.throttledHandleMouseMove=throttle(bind_(this,this.handleMouseMove),Se);this.handleMouseUpHandler_=e=>this.handleMouseUp(e);this.on("mousedown",(e=>this.handleMouseDown(e)));this.on("touchstart",(e=>this.handleMouseDown(e)));this.on("mousemove",(e=>this.handleMouseMove(e)));this.on(this.volumeBar,["focus","slideractive"],(()=>{this.volumeBar.addClass("vjs-slider-active");this.addClass("vjs-slider-active");this.trigger("slideractive")}));this.on(this.volumeBar,["blur","sliderinactive"],(()=>{this.volumeBar.removeClass("vjs-slider-active");this.removeClass("vjs-slider-active");this.trigger("sliderinactive")}))}createEl(){let e="vjs-volume-horizontal";this.options_.vertical&&(e="vjs-volume-vertical");return super.createEl("div",{className:`vjs-volume-control vjs-control ${e}`})}
/**
   * Handle `mousedown` or `touchstart` events on the `VolumeControl`.
   *
   * @param {Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   * @listens touchstart
   */handleMouseDown(e){const t=this.el_.ownerDocument;this.on(t,"mousemove",this.throttledHandleMouseMove);this.on(t,"touchmove",this.throttledHandleMouseMove);this.on(t,"mouseup",this.handleMouseUpHandler_);this.on(t,"touchend",this.handleMouseUpHandler_)}
/**
   * Handle `mouseup` or `touchend` events on the `VolumeControl`.
   *
   * @param {Event} event
   *        `mouseup` or `touchend` event that triggered this function.
   *
   * @listens touchend
   * @listens mouseup
   */handleMouseUp(e){const t=this.el_.ownerDocument;this.off(t,"mousemove",this.throttledHandleMouseMove);this.off(t,"touchmove",this.throttledHandleMouseMove);this.off(t,"mouseup",this.handleMouseUpHandler_);this.off(t,"touchend",this.handleMouseUpHandler_)}
/**
   * Handle `mousedown` or `touchstart` events on the `VolumeControl`.
   *
   * @param {Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   * @listens touchstart
   */handleMouseMove(e){this.volumeBar.handleMouseMove(e)}}
/**
 * Default options for the `VolumeControl`
 *
 * @type {Object}
 * @private
 */VolumeControl.prototype.options_={children:["volumeBar"]};Component$1.registerComponent("VolumeControl",VolumeControl);
/**
 * Check if muting volume is supported and if it isn't hide the mute toggle
 * button.
 *
 * @param {Component} self
 *        A reference to the mute toggle button
 *
 * @param {Player} player
 *        A reference to the player
 *
 * @private
 */const checkMuteSupport=function(e,t){t.tech_&&!t.tech_.featuresMuteControl&&e.addClass("vjs-hidden");e.on(t,"loadstart",(function(){t.tech_.featuresMuteControl?e.removeClass("vjs-hidden"):e.addClass("vjs-hidden")}))};class MuteToggle extends Button{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);checkMuteSupport(this,e);this.on(e,["loadstart","volumechange"],(e=>this.update(e)))}buildCSSClass(){return`vjs-mute-control ${super.buildCSSClass()}`}
/**
   * This gets called when an `MuteToggle` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){const t=this.player_.volume();const s=this.player_.lastVolume_();if(t===0){const e=s<.1?.1:s;this.player_.volume(e);this.player_.muted(false)}else this.player_.muted(!this.player_.muted())}
/**
   * Update the `MuteToggle` button based on the state of `volume` and `muted`
   * on the player.
   *
   * @param {Event} [event]
   *        The {@link Player#loadstart} event if this function was called
   *        through an event.
   *
   * @listens Player#loadstart
   * @listens Player#volumechange
   */update(e){this.updateIcon_();this.updateControlText_()}updateIcon_(){const e=this.player_.volume();let t=3;this.setIcon("volume-high");le&&this.player_.tech_&&this.player_.tech_.el_&&this.player_.muted(this.player_.tech_.el_.muted);if(e===0||this.player_.muted()){this.setIcon("volume-mute");t=0}else if(e<.33){this.setIcon("volume-low");t=1}else if(e<.67){this.setIcon("volume-medium");t=2}removeClass(this.el_,[0,1,2,3].reduce(((e,t)=>e+`${t?" ":""}vjs-vol-${t}`),""));addClass(this.el_,`vjs-vol-${t}`)}updateControlText_(){const e=this.player_.muted()||this.player_.volume()===0;const t=e?"Unmute":"Mute";this.controlText()!==t&&this.controlText(t)}}
/**
 * The text that should display over the `MuteToggle`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */MuteToggle.prototype.controlText_="Mute";Component$1.registerComponent("MuteToggle",MuteToggle);class VolumePanel extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
constructor(e,t={}){typeof t.inline!=="undefined"?t.inline=t.inline:t.inline=true;if(typeof t.volumeControl==="undefined"||isPlain(t.volumeControl)){t.volumeControl=t.volumeControl||{};t.volumeControl.vertical=!t.inline}super(e,t);this.handleKeyPressHandler_=e=>this.handleKeyPress(e);this.on(e,["loadstart"],(e=>this.volumePanelState_(e)));this.on(this.muteToggle,"keyup",(e=>this.handleKeyPress(e)));this.on(this.volumeControl,"keyup",(e=>this.handleVolumeControlKeyUp(e)));this.on("keydown",(e=>this.handleKeyPress(e)));this.on("mouseover",(e=>this.handleMouseOver(e)));this.on("mouseout",(e=>this.handleMouseOut(e)));this.on(this.volumeControl,["slideractive"],this.sliderActive_);this.on(this.volumeControl,["sliderinactive"],this.sliderInactive_)}sliderActive_(){this.addClass("vjs-slider-active")}sliderInactive_(){this.removeClass("vjs-slider-active")}volumePanelState_(){this.volumeControl.hasClass("vjs-hidden")&&this.muteToggle.hasClass("vjs-hidden")&&this.addClass("vjs-hidden");this.volumeControl.hasClass("vjs-hidden")&&!this.muteToggle.hasClass("vjs-hidden")&&this.addClass("vjs-mute-toggle-only")}createEl(){let e="vjs-volume-panel-horizontal";this.options_.inline||(e="vjs-volume-panel-vertical");return super.createEl("div",{className:`vjs-volume-panel vjs-control ${e}`})}dispose(){this.handleMouseOut();super.dispose()}
/**
   * Handles `keyup` events on the `VolumeControl`, looking for ESC, which closes
   * the volume panel and sets focus on `MuteToggle`.
   *
   * @param {Event} event
   *        The `keyup` event that caused this function to be called.
   *
   * @listens keyup
   */handleVolumeControlKeyUp(e){e.key==="Escape"&&this.muteToggle.focus()}
/**
   * This gets called when a `VolumePanel` gains hover via a `mouseover` event.
   * Turns on listening for `mouseover` event. When they happen it
   * calls `this.handleMouseOver`.
   *
   * @param {Event} event
   *        The `mouseover` event that caused this function to be called.
   *
   * @listens mouseover
   */handleMouseOver(e){this.addClass("vjs-hover");on(t,"keyup",this.handleKeyPressHandler_)}
/**
   * This gets called when a `VolumePanel` gains hover via a `mouseout` event.
   * Turns on listening for `mouseout` event. When they happen it
   * calls `this.handleMouseOut`.
   *
   * @param {Event} event
   *        The `mouseout` event that caused this function to be called.
   *
   * @listens mouseout
   */handleMouseOut(e){this.removeClass("vjs-hover");off(t,"keyup",this.handleKeyPressHandler_)}
/**
   * Handles `keyup` event on the document or `keydown` event on the `VolumePanel`,
   * looking for ESC, which hides the `VolumeControl`.
   *
   * @param {Event} event
   *        The keypress that triggered this event.
   *
   * @listens keydown | keyup
   */handleKeyPress(e){e.key==="Escape"&&this.handleMouseOut()}}
/**
 * Default options for the `VolumeControl`
 *
 * @type {Object}
 * @private
 */VolumePanel.prototype.options_={children:["muteToggle","volumeControl"]};Component$1.registerComponent("VolumePanel",VolumePanel);class SkipForward extends Button{constructor(e,t){super(e,t);this.validOptions=[5,10,30];this.skipTime=this.getSkipForwardTime();if(this.skipTime&&this.validOptions.includes(this.skipTime)){this.setIcon(`forward-${this.skipTime}`);this.controlText(this.localize("Skip forward {1} seconds",[this.skipTime.toLocaleString(e.language())]));this.show()}else this.hide()}getSkipForwardTime(){const e=this.options_.playerOptions;return e.controlBar&&e.controlBar.skipButtons&&e.controlBar.skipButtons.forward}buildCSSClass(){return`vjs-skip-forward-${this.getSkipForwardTime()} ${super.buildCSSClass()}`}
/**
   * On click, skips forward in the duration/seekable range by a configurable amount of seconds.
   * If the time left in the duration/seekable range is less than the configured 'skip forward' time,
   * skips to end of duration/seekable range.
   *
   * Handle a click on a `SkipForward` button
   *
   * @param {EventTarget~Event} event
   *        The `click` event that caused this function
   *        to be called
   */handleClick(e){if(isNaN(this.player_.duration()))return;const t=this.player_.currentTime();const s=this.player_.liveTracker;const i=s&&s.isLive()?s.seekableEnd():this.player_.duration();let n;n=t+this.skipTime<=i?t+this.skipTime:i;this.player_.currentTime(n)}handleLanguagechange(){this.controlText(this.localize("Skip forward {1} seconds",[this.skipTime]))}}SkipForward.prototype.controlText_="Skip Forward";Component$1.registerComponent("SkipForward",SkipForward);class SkipBackward extends Button{constructor(e,t){super(e,t);this.validOptions=[5,10,30];this.skipTime=this.getSkipBackwardTime();if(this.skipTime&&this.validOptions.includes(this.skipTime)){this.setIcon(`replay-${this.skipTime}`);this.controlText(this.localize("Skip backward {1} seconds",[this.skipTime.toLocaleString(e.language())]));this.show()}else this.hide()}getSkipBackwardTime(){const e=this.options_.playerOptions;return e.controlBar&&e.controlBar.skipButtons&&e.controlBar.skipButtons.backward}buildCSSClass(){return`vjs-skip-backward-${this.getSkipBackwardTime()} ${super.buildCSSClass()}`}
/**
   * On click, skips backward in the video by a configurable amount of seconds.
   * If the current time in the video is less than the configured 'skip backward' time,
   * skips to beginning of video or seekable range.
   *
   * Handle a click on a `SkipBackward` button
   *
   * @param {EventTarget~Event} event
   *        The `click` event that caused this function
   *        to be called
   */handleClick(e){const t=this.player_.currentTime();const s=this.player_.liveTracker;const i=s&&s.isLive()&&s.seekableStart();let n;n=i&&t-this.skipTime<=i?i:t>=this.skipTime?t-this.skipTime:0;this.player_.currentTime(n)}handleLanguagechange(){this.controlText(this.localize("Skip backward {1} seconds",[this.skipTime]))}}SkipBackward.prototype.controlText_="Skip Backward";Component$1.registerComponent("SkipBackward",SkipBackward);class Menu extends Component$1{
/**
   * Create an instance of this class.
   *
   * @param {Player} player
   *        the player that this component should attach to
   *
   * @param {Object} [options]
   *        Object of option names and values
   *
   */
constructor(e,t){super(e,t);t&&(this.menuButton_=t.menuButton);this.focusedChild_=-1;this.on("keydown",(e=>this.handleKeyDown(e)));this.boundHandleBlur_=e=>this.handleBlur(e);this.boundHandleTapClick_=e=>this.handleTapClick(e)}
/**
   * Add event listeners to the {@link MenuItem}.
   *
   * @param {Object} component
   *        The instance of the `MenuItem` to add listeners to.
   *
   */addEventListenerForItem(e){if(e instanceof Component$1){this.on(e,"blur",this.boundHandleBlur_);this.on(e,["tap","click"],this.boundHandleTapClick_)}}
/**
   * Remove event listeners from the {@link MenuItem}.
   *
   * @param {Object} component
   *        The instance of the `MenuItem` to remove listeners.
   *
   */removeEventListenerForItem(e){if(e instanceof Component$1){this.off(e,"blur",this.boundHandleBlur_);this.off(e,["tap","click"],this.boundHandleTapClick_)}}
/**
   * This method will be called indirectly when the component has been added
   * before the component adds to the new menu instance by `addItem`.
   * In this case, the original menu instance will remove the component
   * by calling `removeChild`.
   *
   * @param {Object} component
   *        The instance of the `MenuItem`
   */removeChild(e){typeof e==="string"&&(e=this.getChild(e));this.removeEventListenerForItem(e);super.removeChild(e)}
/**
   * Add a {@link MenuItem} to the menu.
   *
   * @param {Object|string} component
   *        The name or instance of the `MenuItem` to add.
   *
   */addItem(e){const t=this.addChild(e);t&&this.addEventListenerForItem(t)}createEl(){const e=this.options_.contentElType||"ul";this.contentEl_=createEl(e,{className:"vjs-menu-content"});this.contentEl_.setAttribute("role","menu");const t=super.createEl("div",{append:this.contentEl_,className:"vjs-menu"});t.appendChild(this.contentEl_);on(t,"click",(function(e){e.preventDefault();e.stopImmediatePropagation()}));return t}dispose(){this.contentEl_=null;this.boundHandleBlur_=null;this.boundHandleTapClick_=null;super.dispose()}
/**
   * Called when a `MenuItem` loses focus.
   *
   * @param {Event} event
   *        The `blur` event that caused this function to be called.
   *
   * @listens blur
   */handleBlur(e){const s=e.relatedTarget||t.activeElement;if(!this.children().some((e=>e.el()===s))){const e=this.menuButton_;e&&e.buttonPressed_&&s!==e.el().firstChild&&e.unpressButton()}}
/**
   * Called when a `MenuItem` gets clicked or tapped.
   *
   * @param {Event} event
   *        The `click` or `tap` event that caused this function to be called.
   *
   * @listens click,tap
   */handleTapClick(e){if(this.menuButton_){this.menuButton_.unpressButton();const t=this.children();if(!Array.isArray(t))return;const s=t.filter((t=>t.el()===e.target))[0];if(!s)return;s.name()!=="CaptionSettingsMenuItem"&&this.menuButton_.focus()}}
/**
   * Handle a `keydown` event on this menu. This listener is added in the constructor.
   *
   * @param {KeyboardEvent} event
   *        A `keydown` event that happened on the menu.
   *
   * @listens keydown
   */handleKeyDown(e){if(e.key==="ArrowLeft"||e.key==="ArrowDown"){e.preventDefault();e.stopPropagation();this.stepForward()}else if(e.key==="ArrowRight"||e.key==="ArrowUp"){e.preventDefault();e.stopPropagation();this.stepBack()}}stepForward(){let e=0;this.focusedChild_!==void 0&&(e=this.focusedChild_+1);this.focus(e)}stepBack(){let e=0;this.focusedChild_!==void 0&&(e=this.focusedChild_-1);this.focus(e)}
/**
   * Set focus on a {@link MenuItem} in the `Menu`.
   *
   * @param {Object|string} [item=0]
   *        Index of child item set focus on.
   */focus(e=0){const t=this.children().slice();const s=t.length&&t[0].hasClass("vjs-menu-title");s&&t.shift();if(t.length>0){e<0?e=0:e>=t.length&&(e=t.length-1);this.focusedChild_=e;t[e].el_.focus()}}}Component$1.registerComponent("Menu",Menu);class MenuButton extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
constructor(e,s={}){super(e,s);this.menuButton_=new Button(e,s);this.menuButton_.controlText(this.controlText_);this.menuButton_.el_.setAttribute("aria-haspopup","true");const i=Button.prototype.buildCSSClass();this.menuButton_.el_.className=this.buildCSSClass()+" "+i;this.menuButton_.removeClass("vjs-control");this.addChild(this.menuButton_);this.update();this.enabled_=true;const handleClick=e=>this.handleClick(e);this.handleMenuKeyUp_=e=>this.handleMenuKeyUp(e);this.on(this.menuButton_,"tap",handleClick);this.on(this.menuButton_,"click",handleClick);this.on(this.menuButton_,"keydown",(e=>this.handleKeyDown(e)));this.on(this.menuButton_,"mouseenter",(()=>{this.addClass("vjs-hover");this.menu.show();on(t,"keyup",this.handleMenuKeyUp_)}));this.on("mouseleave",(e=>this.handleMouseLeave(e)));this.on("keydown",(e=>this.handleSubmenuKeyDown(e)))}update(){const e=this.createMenu();if(this.menu){this.menu.dispose();this.removeChild(this.menu)}this.menu=e;this.addChild(e);
/**
     * Track the state of the menu button
     *
     * @type {Boolean}
     * @private
     */this.buttonPressed_=false;this.menuButton_.el_.setAttribute("aria-expanded","false");if(this.items&&this.items.length<=this.hideThreshold_){this.hide();this.menu.contentEl_.removeAttribute("role")}else{this.show();this.menu.contentEl_.setAttribute("role","menu")}}createMenu(){const e=new Menu(this.player_,{menuButton:this});
/**
     * Hide the menu if the number of items is less than or equal to this threshold. This defaults
     * to 0 and whenever we add items which can be hidden to the menu we'll increment it. We list
     * it here because every time we run `createMenu` we need to reset the value.
     *
     * @protected
     * @type {Number}
     */this.hideThreshold_=0;if(this.options_.title){const t=createEl("li",{className:"vjs-menu-title",textContent:toTitleCase$1(this.options_.title),tabIndex:-1});const s=new Component$1(this.player_,{el:t});e.addItem(s)}this.items=this.createItems();if(this.items)for(let t=0;t<this.items.length;t++)e.addItem(this.items[t]);return e}createItems(){}createEl(){return super.createEl("div",{className:this.buildWrapperCSSClass()},{})}
/**
   * Overwrites the `setIcon` method from `Component`.
   * In this case, we want the icon to be appended to the menuButton.
   *
   * @param {string} name
   *         The icon name to be added.
   */setIcon(e){super.setIcon(e,this.menuButton_.el_)}buildWrapperCSSClass(){let e="vjs-menu-button";this.options_.inline===true?e+="-inline":e+="-popup";const t=Button.prototype.buildCSSClass();return`vjs-menu-button ${e} ${t} ${super.buildCSSClass()}`}buildCSSClass(){let e="vjs-menu-button";this.options_.inline===true?e+="-inline":e+="-popup";return`vjs-menu-button ${e} ${super.buildCSSClass()}`}
/**
   * Get or set the localized control text that will be used for accessibility.
   *
   * > NOTE: This will come from the internal `menuButton_` element.
   *
   * @param {string} [text]
   *        Control text for element.
   *
   * @param {Element} [el=this.menuButton_.el()]
   *        Element to set the title on.
   *
   * @return {string}
   *         - The control text when getting
   */controlText(e,t=this.menuButton_.el()){return this.menuButton_.controlText(e,t)}dispose(){this.handleMouseLeave();super.dispose()}
/**
   * Handle a click on a `MenuButton`.
   * See {@link ClickableComponent#handleClick} for instances where this is called.
   *
   * @param {Event} event
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){this.buttonPressed_?this.unpressButton():this.pressButton()}
/**
   * Handle `mouseleave` for `MenuButton`.
   *
   * @param {Event} event
   *        The `mouseleave` event that caused this function to be called.
   *
   * @listens mouseleave
   */handleMouseLeave(e){this.removeClass("vjs-hover");off(t,"keyup",this.handleMenuKeyUp_)}focus(){this.menuButton_.focus()}blur(){this.menuButton_.blur()}
/**
   * Handle tab, escape, down arrow, and up arrow keys for `MenuButton`. See
   * {@link ClickableComponent#handleKeyDown} for instances where this is called.
   *
   * @param {Event} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */handleKeyDown(e){if(e.key==="Escape"||e.key==="Tab"){this.buttonPressed_&&this.unpressButton();if(!e.key==="Tab"){e.preventDefault();this.menuButton_.focus()}}else if((e.key==="Up"||e.key==="Down"&&!(this.player_.options_.playerOptions.spatialNavigation&&this.player_.options_.playerOptions.spatialNavigation.enabled))&&!this.buttonPressed_){e.preventDefault();this.pressButton()}}
/**
   * Handle a `keyup` event on a `MenuButton`. The listener for this is added in
   * the constructor.
   *
   * @param {Event} event
   *        Key press event
   *
   * @listens keyup
   */handleMenuKeyUp(e){e.key!=="Escape"&&e.key!=="Tab"||this.removeClass("vjs-hover")}
/**
   * This method name now delegates to `handleSubmenuKeyDown`. This means
   * anyone calling `handleSubmenuKeyPress` will not see their method calls
   * stop working.
   *
   * @param {Event} event
   *        The event that caused this function to be called.
   */handleSubmenuKeyPress(e){this.handleSubmenuKeyDown(e)}
/**
   * Handle a `keydown` event on a sub-menu. The listener for this is added in
   * the constructor.
   *
   * @param {Event} event
   *        Key press event
   *
   * @listens keydown
   */handleSubmenuKeyDown(e){if(e.key==="Escape"||e.key==="Tab"){this.buttonPressed_&&this.unpressButton();if(!e.key==="Tab"){e.preventDefault();this.menuButton_.focus()}}}pressButton(){if(this.enabled_){this.buttonPressed_=true;this.menu.show();this.menu.lockShowing();this.menuButton_.el_.setAttribute("aria-expanded","true");if(le&&isInFrame())return;this.menu.focus()}}unpressButton(){if(this.enabled_){this.buttonPressed_=false;this.menu.unlockShowing();this.menu.hide();this.menuButton_.el_.setAttribute("aria-expanded","false")}}disable(){this.unpressButton();this.enabled_=false;this.addClass("vjs-disabled");this.menuButton_.disable()}enable(){this.enabled_=true;this.removeClass("vjs-disabled");this.menuButton_.enable()}}Component$1.registerComponent("MenuButton",MenuButton);class TrackButton extends MenuButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){const s=t.tracks;super(e,t);this.items.length<=1&&this.hide();if(!s)return;const i=bind_(this,this.update);s.addEventListener("removetrack",i);s.addEventListener("addtrack",i);s.addEventListener("labelchange",i);this.player_.on("ready",i);this.player_.on("dispose",(function(){s.removeEventListener("removetrack",i);s.removeEventListener("addtrack",i);s.removeEventListener("labelchange",i)}))}}Component$1.registerComponent("TrackButton",TrackButton);class MenuItem extends ClickableComponent{
/**
   * Creates an instance of the this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   *
   */
constructor(e,t){super(e,t);this.selectable=t.selectable;this.isSelected_=t.selected||false;this.multiSelectable=t.multiSelectable;this.selected(this.isSelected_);this.selectable?this.multiSelectable?this.el_.setAttribute("role","menuitemcheckbox"):this.el_.setAttribute("role","menuitemradio"):this.el_.setAttribute("role","menuitem")}
/**
   * Create the `MenuItem's DOM element
   *
   * @param {string} [type=li]
   *        Element's node type, not actually used, always set to `li`.
   *
   * @param {Object} [props={}]
   *        An object of properties that should be set on the element
   *
   * @param {Object} [attrs={}]
   *        An object of attributes that should be set on the element
   *
   * @return {Element}
   *         The element that gets created.
   */createEl(e,t,s){this.nonIconControl=true;const i=super.createEl("li",Object.assign({className:"vjs-menu-item",tabIndex:-1},t),s);const n=createEl("span",{className:"vjs-menu-item-text",textContent:this.localize(this.options_.label)});this.player_.options_.experimentalSvgIcons?i.appendChild(n):i.replaceChild(n,i.querySelector(".vjs-icon-placeholder"));return i}
/**
   * Ignore keys which are used by the menu, but pass any other ones up. See
   * {@link ClickableComponent#handleKeyDown} for instances where this is called.
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */handleKeyDown(e){["Tab","Escape","ArrowUp","ArrowLeft","ArrowRight","ArrowDown"].includes(e.key)||super.handleKeyDown(e)}
/**
   * Any click on a `MenuItem` puts it into the selected state.
   * See {@link ClickableComponent#handleClick} for instances where this is called.
   *
   * @param {Event} event
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){this.selected(true)}
/**
   * Set the state for this menu item as selected or not.
   *
   * @param {boolean} selected
   *        if the menu item is selected or not
   */selected(e){if(this.selectable)if(e){this.addClass("vjs-selected");this.el_.setAttribute("aria-checked","true");this.controlText(", selected");this.isSelected_=true}else{this.removeClass("vjs-selected");this.el_.setAttribute("aria-checked","false");this.controlText("");this.isSelected_=false}}}Component$1.registerComponent("MenuItem",MenuItem);class TextTrackMenuItem extends MenuItem{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(s,i){const n=i.track;const r=s.textTracks();i.label=n.label||n.language||"Unknown";i.selected=n.mode==="showing";super(s,i);this.track=n;this.kinds=(i.kinds||[i.kind||this.track.kind]).filter(Boolean);const changeHandler=(...e)=>{this.handleTracksChange.apply(this,e)};const selectedLanguageChangeHandler=(...e)=>{this.handleSelectedLanguageChange.apply(this,e)};s.on(["loadstart","texttrackchange"],changeHandler);r.addEventListener("change",changeHandler);r.addEventListener("selectedlanguagechange",selectedLanguageChangeHandler);this.on("dispose",(function(){s.off(["loadstart","texttrackchange"],changeHandler);r.removeEventListener("change",changeHandler);r.removeEventListener("selectedlanguagechange",selectedLanguageChangeHandler)}));if(r.onchange===void 0){let s;this.on(["tap","click"],(function(){if(typeof e.Event!=="object")try{s=new e.Event("change")}catch(e){}if(!s){s=t.createEvent("Event");s.initEvent("change",true,true)}r.dispatchEvent(s)}))}this.handleTracksChange()}
/**
   * This gets called when an `TextTrackMenuItem` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} event
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){const t=this.track;const s=this.player_.textTracks();super.handleClick(e);if(s)for(let e=0;e<s.length;e++){const i=s[e];this.kinds.indexOf(i.kind)!==-1&&(i===t?i.mode!=="showing"&&(i.mode="showing"):i.mode!=="disabled"&&(i.mode="disabled"))}}
/**
   * Handle text track list change
   *
   * @param {Event} event
   *        The `change` event that caused this function to be called.
   *
   * @listens TextTrackList#change
   */handleTracksChange(e){const t=this.track.mode==="showing";t!==this.isSelected_&&this.selected(t)}handleSelectedLanguageChange(e){if(this.track.mode==="showing"){const e=this.player_.cache_.selectedLanguage;if(e&&e.enabled&&e.language===this.track.language&&e.kind!==this.track.kind)return;this.player_.cache_.selectedLanguage={enabled:true,language:this.track.language,kind:this.track.kind}}}dispose(){this.track=null;super.dispose()}}Component$1.registerComponent("TextTrackMenuItem",TextTrackMenuItem);class OffTextTrackMenuItem extends TextTrackMenuItem{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){t.track={player:e,kind:t.kind,kinds:t.kinds,default:false,mode:"disabled"};t.kinds||(t.kinds=[t.kind]);t.label?t.track.label=t.label:t.track.label=t.kinds.join(" and ")+" off";t.selectable=true;t.multiSelectable=false;super(e,t)}
/**
   * Handle text track change
   *
   * @param {Event} event
   *        The event that caused this function to run
   */handleTracksChange(e){const t=this.player().textTracks();let s=true;for(let e=0,i=t.length;e<i;e++){const i=t[e];if(this.options_.kinds.indexOf(i.kind)>-1&&i.mode==="showing"){s=false;break}}s!==this.isSelected_&&this.selected(s)}handleSelectedLanguageChange(e){const t=this.player().textTracks();let s=true;for(let e=0,i=t.length;e<i;e++){const i=t[e];if(["captions","descriptions","subtitles"].indexOf(i.kind)>-1&&i.mode==="showing"){s=false;break}}s&&(this.player_.cache_.selectedLanguage={enabled:false})}handleLanguagechange(){this.$(".vjs-menu-item-text").textContent=this.player_.localize(this.options_.label);super.handleLanguagechange()}}Component$1.registerComponent("OffTextTrackMenuItem",OffTextTrackMenuItem);class TextTrackButton extends TrackButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
constructor(e,t={}){t.tracks=e.textTracks();super(e,t)}
/**
   * Create a menu item for each text track
   *
   * @param {TextTrackMenuItem[]} [items=[]]
   *        Existing array of items to use during creation
   *
   * @return {TextTrackMenuItem[]}
   *         Array of menu items that were created
   */createItems(e=[],t=TextTrackMenuItem){let s;this.label_&&(s=`${this.label_} off`);e.push(new OffTextTrackMenuItem(this.player_,{kinds:this.kinds_,kind:this.kind_,label:s}));this.hideThreshold_+=1;const i=this.player_.textTracks();Array.isArray(this.kinds_)||(this.kinds_=[this.kind_]);for(let s=0;s<i.length;s++){const n=i[s];if(this.kinds_.indexOf(n.kind)>-1){const s=new t(this.player_,{track:n,kinds:this.kinds_,kind:this.kind_,selectable:true,multiSelectable:false});s.addClass(`vjs-${n.kind}-menu-item`);e.push(s)}}return e}}Component$1.registerComponent("TextTrackButton",TextTrackButton);class ChaptersTrackMenuItem extends MenuItem{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){const s=t.track;const i=t.cue;const n=e.currentTime();t.selectable=true;t.multiSelectable=false;t.label=i.text;t.selected=i.startTime<=n&&n<i.endTime;super(e,t);this.track=s;this.cue=i}
/**
   * This gets called when an `ChaptersTrackMenuItem` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){super.handleClick();this.player_.currentTime(this.cue.startTime)}}Component$1.registerComponent("ChaptersTrackMenuItem",ChaptersTrackMenuItem);class ChaptersButton extends TextTrackButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Function} [ready]
   *        The function to call when this function is ready.
   */
constructor(e,t,s){super(e,t,s);this.setIcon("chapters");this.selectCurrentItem_=()=>{this.items.forEach((e=>{e.selected(this.track_.activeCues[0]===e.cue)}))}}buildCSSClass(){return`vjs-chapters-button ${super.buildCSSClass()}`}buildWrapperCSSClass(){return`vjs-chapters-button ${super.buildWrapperCSSClass()}`}
/**
   * Update the menu based on the current state of its items.
   *
   * @param {Event} [event]
   *        An event that triggered this function to run.
   *
   * @listens TextTrackList#addtrack
   * @listens TextTrackList#removetrack
   * @listens TextTrackList#change
   */update(e){if(e&&e.track&&e.track.kind!=="chapters")return;const t=this.findChaptersTrack();if(t!==this.track_){this.setTrack(t);super.update()}else(!this.items||t&&t.cues&&t.cues.length!==this.items.length)&&super.update()}
/**
   * Set the currently selected track for the chapters button.
   *
   * @param {TextTrack} track
   *        The new track to select. Nothing will change if this is the currently selected
   *        track.
   */setTrack(e){if(this.track_!==e){this.updateHandler_||(this.updateHandler_=this.update.bind(this));if(this.track_){const e=this.player_.remoteTextTrackEls().getTrackElementByTrack_(this.track_);e&&e.removeEventListener("load",this.updateHandler_);this.track_.removeEventListener("cuechange",this.selectCurrentItem_);this.track_=null}this.track_=e;if(this.track_){this.track_.mode="hidden";const e=this.player_.remoteTextTrackEls().getTrackElementByTrack_(this.track_);e&&e.addEventListener("load",this.updateHandler_);this.track_.addEventListener("cuechange",this.selectCurrentItem_)}}}findChaptersTrack(){const e=this.player_.textTracks()||[];for(let t=e.length-1;t>=0;t--){const s=e[t];if(s.kind===this.kind_)return s}}getMenuCaption(){return this.track_&&this.track_.label?this.track_.label:this.localize(toTitleCase$1(this.kind_))}createMenu(){this.options_.title=this.getMenuCaption();return super.createMenu()}createItems(){const e=[];if(!this.track_)return e;const t=this.track_.cues;if(!t)return e;for(let s=0,i=t.length;s<i;s++){const i=t[s];const n=new ChaptersTrackMenuItem(this.player_,{track:this.track_,cue:i});e.push(n)}return e}}
/**
 * `kind` of TextTrack to look for to associate it with this menu.
 *
 * @type {string}
 * @private
 */ChaptersButton.prototype.kind_="chapters";
/**
 * The text that should display over the `ChaptersButton`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */ChaptersButton.prototype.controlText_="Chapters";Component$1.registerComponent("ChaptersButton",ChaptersButton);class DescriptionsButton extends TextTrackButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Function} [ready]
   *        The function to call when this component is ready.
   */
constructor(e,t,s){super(e,t,s);this.setIcon("audio-description");const i=e.textTracks();const n=bind_(this,this.handleTracksChange);i.addEventListener("change",n);this.on("dispose",(function(){i.removeEventListener("change",n)}))}
/**
   * Handle text track change
   *
   * @param {Event} event
   *        The event that caused this function to run
   *
   * @listens TextTrackList#change
   */handleTracksChange(e){const t=this.player().textTracks();let s=false;for(let e=0,i=t.length;e<i;e++){const i=t[e];if(i.kind!==this.kind_&&i.mode==="showing"){s=true;break}}s?this.disable():this.enable()}buildCSSClass(){return`vjs-descriptions-button ${super.buildCSSClass()}`}buildWrapperCSSClass(){return`vjs-descriptions-button ${super.buildWrapperCSSClass()}`}}
/**
 * `kind` of TextTrack to look for to associate it with this menu.
 *
 * @type {string}
 * @private
 */DescriptionsButton.prototype.kind_="descriptions";
/**
 * The text that should display over the `DescriptionsButton`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */DescriptionsButton.prototype.controlText_="Descriptions";Component$1.registerComponent("DescriptionsButton",DescriptionsButton);class SubtitlesButton extends TextTrackButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Function} [ready]
   *        The function to call when this component is ready.
   */
constructor(e,t,s){super(e,t,s);this.setIcon("subtitles")}buildCSSClass(){return`vjs-subtitles-button ${super.buildCSSClass()}`}buildWrapperCSSClass(){return`vjs-subtitles-button ${super.buildWrapperCSSClass()}`}}
/**
 * `kind` of TextTrack to look for to associate it with this menu.
 *
 * @type {string}
 * @private
 */SubtitlesButton.prototype.kind_="subtitles";
/**
 * The text that should display over the `SubtitlesButton`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */SubtitlesButton.prototype.controlText_="Subtitles";Component$1.registerComponent("SubtitlesButton",SubtitlesButton);class CaptionSettingsMenuItem extends TextTrackMenuItem{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){t.track={player:e,kind:t.kind,label:t.kind+" settings",selectable:false,default:false,mode:"disabled"};t.selectable=false;t.name="CaptionSettingsMenuItem";super(e,t);this.addClass("vjs-texttrack-settings");this.controlText(", opens "+t.kind+" settings dialog")}
/**
   * This gets called when an `CaptionSettingsMenuItem` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){this.player().getChild("textTrackSettings").open()}handleLanguagechange(){this.$(".vjs-menu-item-text").textContent=this.player_.localize(this.options_.kind+" settings");super.handleLanguagechange()}}Component$1.registerComponent("CaptionSettingsMenuItem",CaptionSettingsMenuItem);class CaptionsButton extends TextTrackButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Function} [ready]
   *        The function to call when this component is ready.
   */
constructor(e,t,s){super(e,t,s);this.setIcon("captions")}buildCSSClass(){return`vjs-captions-button ${super.buildCSSClass()}`}buildWrapperCSSClass(){return`vjs-captions-button ${super.buildWrapperCSSClass()}`}createItems(){const e=[];if(!(this.player().tech_&&this.player().tech_.featuresNativeTextTracks)&&this.player().getChild("textTrackSettings")){e.push(new CaptionSettingsMenuItem(this.player_,{kind:this.kind_}));this.hideThreshold_+=1}return super.createItems(e)}}
/**
 * `kind` of TextTrack to look for to associate it with this menu.
 *
 * @type {string}
 * @private
 */CaptionsButton.prototype.kind_="captions";
/**
 * The text that should display over the `CaptionsButton`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */CaptionsButton.prototype.controlText_="Captions";Component$1.registerComponent("CaptionsButton",CaptionsButton);class SubsCapsMenuItem extends TextTrackMenuItem{createEl(e,t,s){const i=super.createEl(e,t,s);const n=i.querySelector(".vjs-menu-item-text");if(this.options_.track.kind==="captions"){this.player_.options_.experimentalSvgIcons?this.setIcon("captions",i):n.appendChild(createEl("span",{className:"vjs-icon-placeholder"},{"aria-hidden":true}));n.appendChild(createEl("span",{className:"vjs-control-text",textContent:` ${this.localize("Captions")}`}))}return i}}Component$1.registerComponent("SubsCapsMenuItem",SubsCapsMenuItem);class SubsCapsButton extends TextTrackButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Function} [ready]
   *        The function to call when this component is ready.
   */
constructor(e,t={}){super(e,t);this.label_="subtitles";this.setIcon("subtitles");if(["en","en-us","en-ca","fr-ca"].indexOf(this.player_.language_)>-1){this.label_="captions";this.setIcon("captions")}this.menuButton_.controlText(toTitleCase$1(this.label_))}buildCSSClass(){return`vjs-subs-caps-button ${super.buildCSSClass()}`}buildWrapperCSSClass(){return`vjs-subs-caps-button ${super.buildWrapperCSSClass()}`}createItems(){let e=[];if(!(this.player().tech_&&this.player().tech_.featuresNativeTextTracks)&&this.player().getChild("textTrackSettings")){e.push(new CaptionSettingsMenuItem(this.player_,{kind:this.label_}));this.hideThreshold_+=1}e=super.createItems(e,SubsCapsMenuItem);return e}}
/**
 * `kind`s of TextTrack to look for to associate it with this menu.
 *
 * @type {array}
 * @private
 */SubsCapsButton.prototype.kinds_=["captions","subtitles"];
/**
 * The text that should display over the `SubsCapsButton`s controls.
 *
 *
 * @type {string}
 * @protected
 */SubsCapsButton.prototype.controlText_="Subtitles";Component$1.registerComponent("SubsCapsButton",SubsCapsButton);class AudioTrackMenuItem extends MenuItem{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){const s=t.track;const i=e.audioTracks();t.label=s.label||s.language||"Unknown";t.selected=s.enabled;super(e,t);this.track=s;this.addClass(`vjs-${s.kind}-menu-item`);const changeHandler=(...e)=>{this.handleTracksChange.apply(this,e)};i.addEventListener("change",changeHandler);this.on("dispose",(()=>{i.removeEventListener("change",changeHandler)}))}createEl(e,t,s){const i=super.createEl(e,t,s);const n=i.querySelector(".vjs-menu-item-text");if(["main-desc","descriptions"].indexOf(this.options_.track.kind)>=0){n.appendChild(createEl("span",{className:"vjs-icon-placeholder"},{"aria-hidden":true}));n.appendChild(createEl("span",{className:"vjs-control-text",textContent:" "+this.localize("Descriptions")}))}return i}
/**
   * This gets called when an `AudioTrackMenuItem is "clicked". See {@link ClickableComponent}
   * for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){super.handleClick(e);this.track.enabled=true;if(this.player_.tech_.featuresNativeAudioTracks){const e=this.player_.audioTracks();for(let t=0;t<e.length;t++){const s=e[t];s!==this.track&&(s.enabled=s===this.track)}}}
/**
   * Handle any {@link AudioTrack} change.
   *
   * @param {Event} [event]
   *        The {@link AudioTrackList#change} event that caused this to run.
   *
   * @listens AudioTrackList#change
   */handleTracksChange(e){this.selected(this.track.enabled)}}Component$1.registerComponent("AudioTrackMenuItem",AudioTrackMenuItem);class AudioTrackButton extends TrackButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
constructor(e,t={}){t.tracks=e.audioTracks();super(e,t);this.setIcon("audio")}buildCSSClass(){return`vjs-audio-button ${super.buildCSSClass()}`}buildWrapperCSSClass(){return`vjs-audio-button ${super.buildWrapperCSSClass()}`}
/**
   * Create a menu item for each audio track
   *
   * @param {AudioTrackMenuItem[]} [items=[]]
   *        An array of existing menu items to use.
   *
   * @return {AudioTrackMenuItem[]}
   *         An array of menu items
   */createItems(e=[]){this.hideThreshold_=1;const t=this.player_.audioTracks();for(let s=0;s<t.length;s++){const i=t[s];e.push(new AudioTrackMenuItem(this.player_,{track:i,selectable:true,multiSelectable:false}))}return e}}
/**
 * The text that should display over the `AudioTrackButton`s controls. Added for localization.
 *
 * @type {string}
 * @protected
 */AudioTrackButton.prototype.controlText_="Audio Track";Component$1.registerComponent("AudioTrackButton",AudioTrackButton);class PlaybackRateMenuItem extends MenuItem{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){const s=t.rate;const i=parseFloat(s,10);t.label=s;t.selected=i===e.playbackRate();t.selectable=true;t.multiSelectable=false;super(e,t);this.label=s;this.rate=i;this.on(e,"ratechange",(e=>this.update(e)))}
/**
   * This gets called when an `PlaybackRateMenuItem` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */handleClick(e){super.handleClick();this.player().playbackRate(this.rate)}
/**
   * Update the PlaybackRateMenuItem when the playbackrate changes.
   *
   * @param {Event} [event]
   *        The `ratechange` event that caused this function to run.
   *
   * @listens Player#ratechange
   */update(e){this.selected(this.player().playbackRate()===this.rate)}}
/**
 * The text that should display over the `PlaybackRateMenuItem`s controls. Added for localization.
 *
 * @type {string}
 * @private
 */PlaybackRateMenuItem.prototype.contentElType="button";Component$1.registerComponent("PlaybackRateMenuItem",PlaybackRateMenuItem);class PlaybackRateMenuButton extends MenuButton{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
constructor(e,t){super(e,t);this.menuButton_.el_.setAttribute("aria-describedby",this.labelElId_);this.updateVisibility();this.updateLabel();this.on(e,"loadstart",(e=>this.updateVisibility(e)));this.on(e,"ratechange",(e=>this.updateLabel(e)));this.on(e,"playbackrateschange",(e=>this.handlePlaybackRateschange(e)))}createEl(){const e=super.createEl();this.labelElId_="vjs-playback-rate-value-label-"+this.id_;this.labelEl_=createEl("div",{className:"vjs-playback-rate-value",id:this.labelElId_,textContent:"1x"});e.appendChild(this.labelEl_);return e}dispose(){this.labelEl_=null;super.dispose()}buildCSSClass(){return`vjs-playback-rate ${super.buildCSSClass()}`}buildWrapperCSSClass(){return`vjs-playback-rate ${super.buildWrapperCSSClass()}`}createItems(){const e=this.playbackRates();const t=[];for(let s=e.length-1;s>=0;s--)t.push(new PlaybackRateMenuItem(this.player(),{rate:e[s]+"x"}));return t}handlePlaybackRateschange(e){this.update()}playbackRates(){const e=this.player();return e.playbackRates&&e.playbackRates()||[]}playbackRateSupported(){return this.player().tech_&&this.player().tech_.featuresPlaybackRate&&this.playbackRates()&&this.playbackRates().length>0}
/**
   * Hide playback rate controls when they're no playback rate options to select
   *
   * @param {Event} [event]
   *        The event that caused this function to run.
   *
   * @listens Player#loadstart
   */updateVisibility(e){this.playbackRateSupported()?this.removeClass("vjs-hidden"):this.addClass("vjs-hidden")}
/**
   * Update button label when rate changed
   *
   * @param {Event} [event]
   *        The event that caused this function to run.
   *
   * @listens Player#ratechange
   */updateLabel(e){this.playbackRateSupported()&&(this.labelEl_.textContent=this.player().playbackRate()+"x")}}
/**
 * The text that should display over the `PlaybackRateMenuButton`s controls.
 *
 * Added for localization.
 *
 * @type {string}
 * @protected
 */PlaybackRateMenuButton.prototype.controlText_="Playback Rate";Component$1.registerComponent("PlaybackRateMenuButton",PlaybackRateMenuButton);class Spacer extends Component$1{buildCSSClass(){return`vjs-spacer ${super.buildCSSClass()}`}createEl(e="div",t={},s={}){t.className||(t.className=this.buildCSSClass());return super.createEl(e,t,s)}}Component$1.registerComponent("Spacer",Spacer);class CustomControlSpacer extends Spacer{buildCSSClass(){return`vjs-custom-control-spacer ${super.buildCSSClass()}`}createEl(){return super.createEl("div",{className:this.buildCSSClass(),textContent:" "})}}Component$1.registerComponent("CustomControlSpacer",CustomControlSpacer);class ControlBar extends Component$1{createEl(){return super.createEl("div",{className:"vjs-control-bar",dir:"ltr"})}}
/**
 * Default options for `ControlBar`
 *
 * @type {Object}
 * @private
 */ControlBar.prototype.options_={children:["playToggle","skipBackward","skipForward","volumePanel","currentTimeDisplay","timeDivider","durationDisplay","progressControl","liveDisplay","seekToLive","remainingTimeDisplay","customControlSpacer","playbackRateMenuButton","chaptersButton","descriptionsButton","subsCapsButton","audioTrackButton","pictureInPictureToggle","fullscreenToggle"]};Component$1.registerComponent("ControlBar",ControlBar);class ErrorDisplay extends ModalDialog{
/**
   * Creates an instance of this class.
   *
   * @param  {Player} player
   *         The `Player` that this class should be attached to.
   *
   * @param  {Object} [options]
   *         The key/value store of player options.
   */
constructor(e,t){super(e,t);this.on(e,"error",(e=>{this.open(e)}))}
/**
   * Builds the default DOM `className`.
   *
   * @return {string}
   *         The DOM `className` for this object.
   *
   * @deprecated Since version 5.
   */buildCSSClass(){return`vjs-error-display ${super.buildCSSClass()}`}content(){const e=this.player().error();return e?this.localize(e.message):""}}ErrorDisplay.prototype.options_=Object.assign({},ModalDialog.prototype.options_,{pauseOnOpen:false,fillAlways:true,temporary:false,uncloseable:true});Component$1.registerComponent("ErrorDisplay",ErrorDisplay);class TextTrackSelect extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {ContentDescriptor} [options.content=undefined]
   *        Provide customized content for this modal.
   *
   * @param {string} [options.legendId]
   *        A text with part of an string to create atribute of aria-labelledby.
   *
   * @param {string} [options.id]
   *        A text with part of an string to create atribute of aria-labelledby.
   *
   * @param {Array} [options.SelectOptions]
   *        Array that contains the value & textContent of for each of the
   *        options elements.
   */
constructor(e,t={}){super(e,t);this.el_.setAttribute("aria-labelledby",this.selectLabelledbyIds)}createEl(){this.selectLabelledbyIds=[this.options_.legendId,this.options_.labelId].join(" ").trim();const e=createEl("select",{id:this.options_.id},{},this.options_.SelectOptions.map((e=>{const t=(this.options_.labelId?this.options_.labelId:`vjs-track-option-${newGUID()}`)+"-"+e[1].replace(/\W+/g,"");const s=createEl("option",{id:t,value:this.localize(e[0]),textContent:this.localize(e[1])});s.setAttribute("aria-labelledby",`${this.selectLabelledbyIds} ${t}`);return s})));return e}}Component$1.registerComponent("TextTrackSelect",TextTrackSelect);class TextTrackFieldset extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {ContentDescriptor} [options.content=undefined]
   *        Provide customized content for this modal.
   *
   * @param {string} [options.legendId]
   *        A text with part of an string to create atribute of aria-labelledby.
   *        It passes to 'TextTrackSelect'.
   *
   * @param {string} [options.id]
   *        A text with part of an string to create atribute of aria-labelledby.
   *        It passes to 'TextTrackSelect'.
   *
   * @param {string} [options.legendText]
   *        A text to use as the text content of the legend element.
   *
   * @param {Array} [options.selects]
   *        Array that contains the selects that are use to create 'selects'
   *        components.
   *
   * @param {Array} [options.SelectOptions]
   *        Array that contains the value & textContent of for each of the
   *        options elements, it passes to 'TextTrackSelect'.
   *
   * @param {string} [options.type]
   *        Conditions if some DOM elements will be added to the fieldset
   *        component.
   *
   * @param {Object} [options.selectConfigs]
   *        Object with the following properties that are the selects configurations:
   *        backgroundColor, backgroundOpacity, color, edgeStyle, fontFamily,
   *        fontPercent, textOpacity, windowColor, windowOpacity.
   *        These properties are use to configure the 'TextTrackSelect' Component.
   */
constructor(e,t={}){super(e,t);const s=createEl("legend",{textContent:this.localize(this.options_.legendText),id:this.options_.legendId});this.el().appendChild(s);const i=this.options_.selects;for(const t of i){const s=this.options_.selectConfigs[t];const i=s.className;const n=s.id.replace("%s",this.options_.id_);let r=null;const a=`vjs_select_${newGUID()}`;if(this.options_.type==="colors"){r=createEl("span",{className:i});const e=createEl("label",{id:n,className:"vjs-label",textContent:this.localize(s.label)});e.setAttribute("for",a);r.appendChild(e)}const o=new TextTrackSelect(e,{SelectOptions:s.options,legendId:this.options_.legendId,id:a,labelId:n});this.addChild(o);if(this.options_.type==="colors"){r.appendChild(o.el());this.el().appendChild(r)}}}createEl(){const e=createEl("fieldset",{className:this.options_.className});return e}}Component$1.registerComponent("TextTrackFieldset",TextTrackFieldset);class TextTrackSettingsColors extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {ContentDescriptor} [options.content=undefined]
   *        Provide customized content for this modal.
   *
   * @param {Array} [options.fieldSets]
   *        Array that contains the configurations for the selects.
   *
   * @param {Object} [options.selectConfigs]
   *        Object with the following properties that are the select confugations:
   *        backgroundColor, backgroundOpacity, color, edgeStyle, fontFamily,
   *        fontPercent, textOpacity, windowColor, windowOpacity.
   *        it passes to 'TextTrackFieldset'.
   */
constructor(e,t={}){super(e,t);const s=this.options_.textTrackComponentid;const i=new TextTrackFieldset(e,{id_:s,legendId:`captions-text-legend-${s}`,legendText:this.localize("Text"),className:"vjs-fg vjs-track-setting",selects:this.options_.fieldSets[0],selectConfigs:this.options_.selectConfigs,type:"colors"});this.addChild(i);const n=new TextTrackFieldset(e,{id_:s,legendId:`captions-background-${s}`,legendText:this.localize("Text Background"),className:"vjs-bg vjs-track-setting",selects:this.options_.fieldSets[1],selectConfigs:this.options_.selectConfigs,type:"colors"});this.addChild(n);const r=new TextTrackFieldset(e,{id_:s,legendId:`captions-window-${s}`,legendText:this.localize("Caption Area Background"),className:"vjs-window vjs-track-setting",selects:this.options_.fieldSets[2],selectConfigs:this.options_.selectConfigs,type:"colors"});this.addChild(r)}createEl(){const e=createEl("div",{className:"vjs-track-settings-colors"});return e}}Component$1.registerComponent("TextTrackSettingsColors",TextTrackSettingsColors);class TextTrackSettingsFont extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {ContentDescriptor} [options.content=undefined]
   *        Provide customized content for this modal.
   *
   * @param {Array} [options.fieldSets]
   *        Array that contains the configurations for the selects.
   *
   * @param {Object} [options.selectConfigs]
   *        Object with the following properties that are the select confugations:
   *        backgroundColor, backgroundOpacity, color, edgeStyle, fontFamily,
   *        fontPercent, textOpacity, windowColor, windowOpacity.
   *        it passes to 'TextTrackFieldset'.
   */
constructor(e,t={}){super(e,t);const s=this.options_.textTrackComponentid;const i=new TextTrackFieldset(e,{id_:s,legendId:`captions-font-size-${s}`,legendText:"Font Size",className:"vjs-font-percent vjs-track-setting",selects:this.options_.fieldSets[0],selectConfigs:this.options_.selectConfigs,type:"font"});this.addChild(i);const n=new TextTrackFieldset(e,{id_:s,legendId:`captions-edge-style-${s}`,legendText:this.localize("Text Edge Style"),className:"vjs-edge-style vjs-track-setting",selects:this.options_.fieldSets[1],selectConfigs:this.options_.selectConfigs,type:"font"});this.addChild(n);const r=new TextTrackFieldset(e,{id_:s,legendId:`captions-font-family-${s}`,legendText:this.localize("Font Family"),className:"vjs-font-family vjs-track-setting",selects:this.options_.fieldSets[2],selectConfigs:this.options_.selectConfigs,type:"font"});this.addChild(r)}createEl(){const e=createEl("div",{className:"vjs-track-settings-font"});return e}}Component$1.registerComponent("TextTrackSettingsFont",TextTrackSettingsFont);class TrackSettingsControls extends Component$1{constructor(e,t={}){super(e,t);const s=this.localize("restore all settings to the default values");const i=new Button(e,{controlText:s,className:"vjs-default-button"});i.el().classList.remove("vjs-control","vjs-button");i.el().textContent=this.localize("Reset");this.addChild(i);const n=new Button(e,{controlText:s,className:"vjs-done-button"});n.el().classList.remove("vjs-control","vjs-button");n.el().textContent=this.localize("Done");this.addChild(n)}createEl(){const e=createEl("div",{className:"vjs-track-settings-controls"});return e}}Component$1.registerComponent("TrackSettingsControls",TrackSettingsControls);const it="vjs-text-track-settings";const nt=["#000","Black"];const rt=["#00F","Blue"];const at=["#0FF","Cyan"];const ot=["#0F0","Green"];const lt=["#F0F","Magenta"];const dt=["#F00","Red"];const ht=["#FFF","White"];const ct=["#FF0","Yellow"];const ut=["1","Opaque"];const pt=["0.5","Semi-Transparent"];const mt=["0","Transparent"];const ft={backgroundColor:{selector:".vjs-bg-color > select",id:"captions-background-color-%s",label:"Color",options:[nt,ht,dt,ot,rt,ct,lt,at],className:"vjs-bg-color"},backgroundOpacity:{selector:".vjs-bg-opacity > select",id:"captions-background-opacity-%s",label:"Opacity",options:[ut,pt,mt],className:"vjs-bg-opacity vjs-opacity"},color:{selector:".vjs-text-color > select",id:"captions-foreground-color-%s",label:"Color",options:[ht,nt,dt,ot,rt,ct,lt,at],className:"vjs-text-color"},edgeStyle:{selector:".vjs-edge-style > select",id:"",label:"Text Edge Style",options:[["none","None"],["raised","Raised"],["depressed","Depressed"],["uniform","Uniform"],["dropshadow","Drop shadow"]]},fontFamily:{selector:".vjs-font-family > select",id:"",label:"Font Family",options:[["proportionalSansSerif","Proportional Sans-Serif"],["monospaceSansSerif","Monospace Sans-Serif"],["proportionalSerif","Proportional Serif"],["monospaceSerif","Monospace Serif"],["casual","Casual"],["script","Script"],["small-caps","Small Caps"]]},fontPercent:{selector:".vjs-font-percent > select",id:"",label:"Font Size",options:[["0.50","50%"],["0.75","75%"],["1.00","100%"],["1.25","125%"],["1.50","150%"],["1.75","175%"],["2.00","200%"],["3.00","300%"],["4.00","400%"]],default:2,parser:e=>e==="1.00"?null:Number(e)},textOpacity:{selector:".vjs-text-opacity > select",id:"captions-foreground-opacity-%s",label:"Opacity",options:[ut,pt],className:"vjs-text-opacity vjs-opacity"},windowColor:{selector:".vjs-window-color > select",id:"captions-window-color-%s",label:"Color",className:"vjs-window-color"},windowOpacity:{selector:".vjs-window-opacity > select",id:"captions-window-opacity-%s",label:"Opacity",options:[mt,pt,ut],className:"vjs-window-opacity vjs-opacity"}};ft.windowColor.options=ft.backgroundColor.options;
/**
 * Get the actual value of an option.
 *
 * @param  {string} value
 *         The value to get
 *
 * @param  {Function} [parser]
 *         Optional function to adjust the value.
 *
 * @return {*}
 *         - Will be `undefined` if no value exists
 *         - Will be `undefined` if the given value is "none".
 *         - Will be the actual value otherwise.
 *
 * @private
 */function parseOptionValue(e,t){t&&(e=t(e));if(e&&e!=="none")return e}
/**
 * Gets the value of the selected <option> element within a <select> element.
 *
 * @param  {Element} el
 *         the element to look in
 *
 * @param  {Function} [parser]
 *         Optional function to adjust the value.
 *
 * @return {*}
 *         - Will be `undefined` if no value exists
 *         - Will be `undefined` if the given value is "none".
 *         - Will be the actual value otherwise.
 *
 * @private
 */function getSelectedOptionValue(e,t){const s=e.options[e.options.selectedIndex].value;return parseOptionValue(s,t)}
/**
 * Sets the selected <option> element within a <select> element based on a
 * given value.
 *
 * @param {Element} el
 *        The element to look in.
 *
 * @param {string} value
 *        the property to look on.
 *
 * @param {Function} [parser]
 *        Optional function to adjust the value before comparing.
 *
 * @private
 */function setSelectedOption(e,t,s){if(t)for(let i=0;i<e.options.length;i++)if(parseOptionValue(e.options[i].value,s)===t){e.selectedIndex=i;break}}class TextTrackSettings extends ModalDialog{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *         The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *         The key/value store of player options.
   */
constructor(e,t){t.temporary=false;super(e,t);this.updateDisplay=this.updateDisplay.bind(this);this.fill();this.hasBeenOpened_=this.hasBeenFilled_=true;this.renderModalComponents(e);this.endDialog=createEl("p",{className:"vjs-control-text",textContent:this.localize("End of dialog window.")});this.el().appendChild(this.endDialog);this.setDefaults();t.persistTextTrackSettings===void 0&&(this.options_.persistTextTrackSettings=this.options_.playerOptions.persistTextTrackSettings);this.bindFunctionsToSelectsAndButtons();this.options_.persistTextTrackSettings&&this.restoreSettings()}renderModalComponents(e){const t=new TextTrackSettingsColors(e,{textTrackComponentid:this.id_,selectConfigs:ft,fieldSets:[["color","textOpacity"],["backgroundColor","backgroundOpacity"],["windowColor","windowOpacity"]]});this.addChild(t);const s=new TextTrackSettingsFont(e,{textTrackComponentid:this.id_,selectConfigs:ft,fieldSets:[["fontPercent"],["edgeStyle"],["fontFamily"]]});this.addChild(s);const i=new TrackSettingsControls(e);this.addChild(i)}bindFunctionsToSelectsAndButtons(){this.on(this.$(".vjs-done-button"),["click","tap"],(()=>{this.saveSettings();this.close()}));this.on(this.$(".vjs-default-button"),["click","tap"],(()=>{this.setDefaults();this.updateDisplay()}));each(ft,(e=>{this.on(this.$(e.selector),"change",this.updateDisplay)}))}dispose(){this.endDialog=null;super.dispose()}label(){return this.localize("Caption Settings Dialog")}description(){return this.localize("Beginning of dialog window. Escape will cancel and close the window.")}buildCSSClass(){return super.buildCSSClass()+" vjs-text-track-settings"}getValues(){return reduce(ft,((e,t,s)=>{const i=getSelectedOptionValue(this.$(t.selector),t.parser);i!==void 0&&(e[s]=i);return e}),{})}
/**
   * Sets text track settings from an object of values.
   *
   * @param {Object} values
   *        An object with config values parsed from the DOM or localStorage.
   */setValues(e){each(ft,((t,s)=>{setSelectedOption(this.$(t.selector),e[s],t.parser)}))}setDefaults(){each(ft,(e=>{const t=e.hasOwnProperty("default")?e.default:0;this.$(e.selector).selectedIndex=t}))}restoreSettings(){let t;try{t=JSON.parse(e.localStorage.getItem(it))}catch(e){B.warn(e)}t&&this.setValues(t)}saveSettings(){if(!this.options_.persistTextTrackSettings)return;const t=this.getValues();try{Object.keys(t).length?e.localStorage.setItem(it,JSON.stringify(t)):e.localStorage.removeItem(it)}catch(e){B.warn(e)}}updateDisplay(){const e=this.player_.getChild("textTrackDisplay");e&&e.updateDisplay()}handleLanguagechange(){this.fill();this.renderModalComponents(this.player_);this.bindFunctionsToSelectsAndButtons()}}Component$1.registerComponent("TextTrackSettings",TextTrackSettings);class ResizeManager extends Component$1{
/**
   * Create the ResizeManager.
   *
   * @param {Object} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of ResizeManager options.
   *
   * @param {Object} [options.ResizeObserver]
   *        A polyfill for ResizeObserver can be passed in here.
   *        If this is set to null it will ignore the native ResizeObserver and fall back to the iframe fallback.
   */
constructor(t,s){let i=s.ResizeObserver||e.ResizeObserver;s.ResizeObserver===null&&(i=false);const n=merge$1({createEl:!i,reportTouchActivity:false},s);super(t,n);this.ResizeObserver=s.ResizeObserver||e.ResizeObserver;this.loadListener_=null;this.resizeObserver_=null;this.debouncedHandler_=debounce$1((()=>{this.resizeHandler()}),100,false,this);if(i){this.resizeObserver_=new this.ResizeObserver(this.debouncedHandler_);this.resizeObserver_.observe(t.el())}else{this.loadListener_=()=>{if(!this.el_||!this.el_.contentWindow)return;const e=this.debouncedHandler_;let t=this.unloadListener_=function(){off(this,"resize",e);off(this,"unload",t);t=null};on(this.el_.contentWindow,"unload",t);on(this.el_.contentWindow,"resize",e)};this.one("load",this.loadListener_)}}createEl(){return super.createEl("iframe",{className:"vjs-resize-manager",tabIndex:-1,title:this.localize("No content")},{"aria-hidden":"true"})}resizeHandler(){
/**
     * Called when the player size has changed
     *
     * @event Player#playerresize
     * @type {Event}
     */
this.player_&&this.player_.trigger&&this.player_.trigger("playerresize")}dispose(){this.debouncedHandler_&&this.debouncedHandler_.cancel();if(this.resizeObserver_){this.player_.el()&&this.resizeObserver_.unobserve(this.player_.el());this.resizeObserver_.disconnect()}this.loadListener_&&this.off("load",this.loadListener_);this.el_&&this.el_.contentWindow&&this.unloadListener_&&this.unloadListener_.call(this.el_.contentWindow);this.ResizeObserver=null;this.resizeObserver=null;this.debouncedHandler_=null;this.loadListener_=null;super.dispose()}}Component$1.registerComponent("ResizeManager",ResizeManager);const gt={trackingThreshold:20,liveTolerance:15};class LiveTracker extends Component$1{
/**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {number} [options.trackingThreshold=20]
   *        Number of seconds of live window (seekableEnd - seekableStart) that
   *        media needs to have before the liveui will be shown.
   *
   * @param {number} [options.liveTolerance=15]
   *        Number of seconds behind live that we have to be
   *        before we will be considered non-live. Note that this will only
   *        be used when playing at the live edge. This allows large seekable end
   *        changes to not effect whether we are live or not.
   */
constructor(e,t){const s=merge$1(gt,t,{createEl:false});super(e,s);this.trackLiveHandler_=()=>this.trackLive_();this.handlePlay_=e=>this.handlePlay(e);this.handleFirstTimeupdate_=e=>this.handleFirstTimeupdate(e);this.handleSeeked_=e=>this.handleSeeked(e);this.seekToLiveEdge_=e=>this.seekToLiveEdge(e);this.reset_();this.on(this.player_,"durationchange",(e=>this.handleDurationchange(e)));this.on(this.player_,"canplay",(()=>this.toggleTracking()))}trackLive_(){const t=this.player_.seekable();if(!t||!t.length)return;const s=Number(e.performance.now().toFixed(4));const i=this.lastTime_===-1?0:(s-this.lastTime_)/1e3;this.lastTime_=s;this.pastSeekEnd_=this.pastSeekEnd()+i;const n=this.liveCurrentTime();const r=this.player_.currentTime();let a=this.player_.paused()||this.seekedBehindLive_||Math.abs(n-r)>this.options_.liveTolerance;this.timeupdateSeen_&&n!==Infinity||(a=false);if(a!==this.behindLiveEdge_){this.behindLiveEdge_=a;this.trigger("liveedgechange")}}handleDurationchange(){this.toggleTracking()}toggleTracking(){if(this.player_.duration()===Infinity&&this.liveWindow()>=this.options_.trackingThreshold){this.player_.options_.liveui&&this.player_.addClass("vjs-liveui");this.startTracking()}else{this.player_.removeClass("vjs-liveui");this.stopTracking()}}startTracking(){if(!this.isTracking()){this.timeupdateSeen_||(this.timeupdateSeen_=this.player_.hasStarted());this.trackingInterval_=this.setInterval(this.trackLiveHandler_,Se);this.trackLive_();this.on(this.player_,["play","pause"],this.trackLiveHandler_);if(this.timeupdateSeen_)this.on(this.player_,"seeked",this.handleSeeked_);else{this.one(this.player_,"play",this.handlePlay_);this.one(this.player_,"timeupdate",this.handleFirstTimeupdate_)}}}handleFirstTimeupdate(){this.timeupdateSeen_=true;this.on(this.player_,"seeked",this.handleSeeked_)}handleSeeked(){const e=Math.abs(this.liveCurrentTime()-this.player_.currentTime());this.seekedBehindLive_=this.nextSeekedFromUser_&&e>2;this.nextSeekedFromUser_=false;this.trackLive_()}handlePlay(){this.one(this.player_,"timeupdate",this.seekToLiveEdge_)}reset_(){this.lastTime_=-1;this.pastSeekEnd_=0;this.lastSeekEnd_=-1;this.behindLiveEdge_=true;this.timeupdateSeen_=false;this.seekedBehindLive_=false;this.nextSeekedFromUser_=false;this.clearInterval(this.trackingInterval_);this.trackingInterval_=null;this.off(this.player_,["play","pause"],this.trackLiveHandler_);this.off(this.player_,"seeked",this.handleSeeked_);this.off(this.player_,"play",this.handlePlay_);this.off(this.player_,"timeupdate",this.handleFirstTimeupdate_);this.off(this.player_,"timeupdate",this.seekToLiveEdge_)}nextSeekedFromUser(){this.nextSeekedFromUser_=true}stopTracking(){if(this.isTracking()){this.reset_();this.trigger("liveedgechange")}}seekableEnd(){const e=this.player_.seekable();const t=[];let s=e?e.length:0;while(s--)t.push(e.end(s));return t.length?t.sort()[t.length-1]:Infinity}seekableStart(){const e=this.player_.seekable();const t=[];let s=e?e.length:0;while(s--)t.push(e.start(s));return t.length?t.sort()[0]:0}liveWindow(){const e=this.liveCurrentTime();return e===Infinity?0:e-this.seekableStart()}isLive(){return this.isTracking()}atLiveEdge(){return!this.behindLiveEdge()}liveCurrentTime(){return this.pastSeekEnd()+this.seekableEnd()}pastSeekEnd(){const e=this.seekableEnd();this.lastSeekEnd_!==-1&&e!==this.lastSeekEnd_&&(this.pastSeekEnd_=0);this.lastSeekEnd_=e;return this.pastSeekEnd_}behindLiveEdge(){return this.behindLiveEdge_}isTracking(){return typeof this.trackingInterval_==="number"}seekToLiveEdge(){this.seekedBehindLive_=false;if(!this.atLiveEdge()){this.nextSeekedFromUser_=false;this.player_.currentTime(this.liveCurrentTime())}}dispose(){this.stopTracking();super.dispose()}}Component$1.registerComponent("LiveTracker",LiveTracker);class TitleBar extends Component$1{constructor(e,t){super(e,t);this.on("statechanged",(e=>this.updateDom_()));this.updateDom_()}createEl(){this.els={title:createEl("div",{className:"vjs-title-bar-title",id:`vjs-title-bar-title-${newGUID()}`}),description:createEl("div",{className:"vjs-title-bar-description",id:`vjs-title-bar-description-${newGUID()}`})};return createEl("div",{className:"vjs-title-bar"},{},values(this.els))}updateDom_(){const e=this.player_.tech_;const t=e&&e.el_;const s={title:"aria-labelledby",description:"aria-describedby"};["title","description"].forEach((e=>{const i=this.state[e];const n=this.els[e];const r=s[e];emptyEl(n);i&&textContent(n,i);if(t){t.removeAttribute(r);i&&t.setAttribute(r,n.id)}}));this.state.title||this.state.description?this.show():this.hide()}
/**
   * Update the contents of the title bar component with new title and
   * description text.
   *
   * If both title and description are missing, the title bar will be hidden.
   *
   * If either title or description are present, the title bar will be visible.
   *
   * NOTE: Any previously set value will be preserved. To unset a previously
   * set value, you must pass an empty string or null.
   *
   * For example:
   *
   * ```
   * update({title: 'foo', description: 'bar'}) // title: 'foo', description: 'bar'
   * update({description: 'bar2'}) // title: 'foo', description: 'bar2'
   * update({title: ''}) // title: '', description: 'bar2'
   * update({title: 'foo', description: null}) // title: 'foo', description: null
   * ```
   *
   * @param  {Object} [options={}]
   *         An options object. When empty, the title bar will be hidden.
   *
   * @param  {string} [options.title]
   *         A title to display in the title bar.
   *
   * @param  {string} [options.description]
   *         A description to display in the title bar.
   */update(e){this.setState(e)}dispose(){const e=this.player_.tech_;const t=e&&e.el_;if(t){t.removeAttribute("aria-labelledby");t.removeAttribute("aria-describedby")}super.dispose();this.els=null}}Component$1.registerComponent("TitleBar",TitleBar);
/**
 * @typedef {object} TransientButtonOptions
 * @property {string} [controlText] Control text, usually visible for these buttons
 * @property {number} [initialDisplay=4000] Time in ms that button should initially remain visible
 * @property {Array<'top'|'neartop'|'bottom'|'left'|'right'>} [position] Array of position strings to add basic styles for positioning
 * @property {string} [className] Class(es) to add
 * @property {boolean} [takeFocus=false] Whether element sohuld take focus when shown
 * @property {Function} [clickHandler] Function called on button activation
 */
/** @type {TransientButtonOptions} */const yt={initialDisplay:4e3,position:[],takeFocus:false};class TransientButton extends Button{
/**
   * TransientButton constructor
   *
   * @param {Player} player The button's player
   * @param {TransientButtonOptions} options Options for the transient button
   */
constructor(e,t){t=merge$1(yt,t);super(e,t);this.controlText(t.controlText);this.hide();this.on(this.player_,["useractive","userinactive"],(e=>{this.removeClass("force-display")}))}buildCSSClass(){return`vjs-transient-button focus-visible ${this.options_.position.map((e=>`vjs-${e}`)).join(" ")}`}createEl(){
/** @type HTMLButtonElement */
const e=createEl("button",{},{type:"button",class:this.buildCSSClass()},createEl("span"));this.controlTextEl_=e.querySelector("span");return e}show(){super.show();this.addClass("force-display");this.options_.takeFocus&&this.el().focus({preventScroll:true});this.forceDisplayTimeout=this.player_.setTimeout((()=>{this.removeClass("force-display")}),this.options_.initialDisplay)}hide(){this.removeClass("force-display");super.hide()}dispose(){this.player_.clearTimeout(this.forceDisplayTimeout);super.dispose()}}Component$1.registerComponent("TransientButton",TransientButton);
/**
 * This function is used to fire a sourceset when there is something
 * similar to `mediaEl.load()` being called. It will try to find the source via
 * the `src` attribute and then the `<source>` elements. It will then fire `sourceset`
 * with the source that was found or empty string if we cannot know. If it cannot
 * find a source then `sourceset` will not be fired.
 *
 * @param {Html5} tech
 *        The tech object that sourceset was setup on
 *
 * @return {boolean}
 *         returns false if the sourceset was not fired and true otherwise.
 */const sourcesetLoad=e=>{const t=e.el();if(t.hasAttribute("src")){e.triggerSourceset(t.src);return true}const s=e.$$("source");const i=[];let n="";if(!s.length)return false;for(let e=0;e<s.length;e++){const t=s[e].src;t&&i.indexOf(t)===-1&&i.push(t)}if(!i.length)return false;i.length===1&&(n=i[0]);e.triggerSourceset(n);return true};const _t=Object.defineProperty({},"innerHTML",{get(){return this.cloneNode(true).innerHTML},set(s){const i=t.createElement(this.nodeName.toLowerCase());i.innerHTML=s;const n=t.createDocumentFragment();while(i.childNodes.length)n.appendChild(i.childNodes[0]);this.innerText="";e.Element.prototype.appendChild.call(this,n);return this.innerHTML}});const getDescriptor=(e,t)=>{let s={};for(let i=0;i<e.length;i++){s=Object.getOwnPropertyDescriptor(e[i],t);if(s&&s.set&&s.get)break}s.enumerable=true;s.configurable=true;return s};const getInnerHTMLDescriptor=t=>getDescriptor([t.el(),e.HTMLMediaElement.prototype,e.Element.prototype,_t],"innerHTML")
/**
 * Patches browser internal functions so that we can tell synchronously
 * if a `<source>` was appended to the media element. For some reason this
 * causes a `sourceset` if the the media element is ready and has no source.
 * This happens when:
 * - The page has just loaded and the media element does not have a source.
 * - The media element was emptied of all sources, then `load()` was called.
 *
 * It does this by patching the following functions/properties when they are supported:
 *
 * - `append()` - can be used to add a `<source>` element to the media element
 * - `appendChild()` - can be used to add a `<source>` element to the media element
 * - `insertAdjacentHTML()` -  can be used to add a `<source>` element to the media element
 * - `innerHTML` -  can be used to add a `<source>` element to the media element
 *
 * @param {Html5} tech
 *        The tech object that sourceset is being setup on.
 */;const firstSourceWatch=function(e){const t=e.el();if(t.resetSourceWatch_)return;const s={};const i=getInnerHTMLDescriptor(e);const appendWrapper=s=>(...i)=>{const n=s.apply(t,i);sourcesetLoad(e);return n};["append","appendChild","insertAdjacentHTML"].forEach((e=>{if(t[e]){s[e]=t[e];t[e]=appendWrapper(s[e])}}));Object.defineProperty(t,"innerHTML",merge$1(i,{set:appendWrapper(i.set)}));t.resetSourceWatch_=()=>{t.resetSourceWatch_=null;Object.keys(s).forEach((e=>{t[e]=s[e]}));Object.defineProperty(t,"innerHTML",i)};e.one("sourceset",t.resetSourceWatch_)};const vt=Object.defineProperty({},"src",{get(){return this.hasAttribute("src")?getAbsoluteURL(e.Element.prototype.getAttribute.call(this,"src")):""},set(t){e.Element.prototype.setAttribute.call(this,"src",t);return t}});const getSrcDescriptor=t=>getDescriptor([t.el(),e.HTMLMediaElement.prototype,vt],"src")
/**
 * setup `sourceset` handling on the `Html5` tech. This function
 * patches the following element properties/functions:
 *
 * - `src` - to determine when `src` is set
 * - `setAttribute()` - to determine when `src` is set
 * - `load()` - this re-triggers the source selection algorithm, and can
 *              cause a sourceset.
 *
 * If there is no source when we are adding `sourceset` support or during a `load()`
 * we also patch the functions listed in `firstSourceWatch`.
 *
 * @param {Html5} tech
 *        The tech to patch
 */;const setupSourceset=function(e){if(!e.featuresSourceset)return;const t=e.el();if(t.resetSourceset_)return;const s=getSrcDescriptor(e);const i=t.setAttribute;const n=t.load;Object.defineProperty(t,"src",merge$1(s,{set:i=>{const n=s.set.call(t,i);e.triggerSourceset(t.src);return n}}));t.setAttribute=(s,n)=>{const r=i.call(t,s,n);/src/i.test(s)&&e.triggerSourceset(t.src);return r};t.load=()=>{const s=n.call(t);if(!sourcesetLoad(e)){e.triggerSourceset("");firstSourceWatch(e)}return s};t.currentSrc?e.triggerSourceset(t.currentSrc):sourcesetLoad(e)||firstSourceWatch(e);t.resetSourceset_=()=>{t.resetSourceset_=null;t.load=n;t.setAttribute=i;Object.defineProperty(t,"src",s);t.resetSourceWatch_&&t.resetSourceWatch_()}};class Html5 extends Tech{
/**
  * Create an instance of this Tech.
  *
  * @param {Object} [options]
  *        The key/value store of player options.
  *
  * @param {Function} [ready]
  *        Callback function to call when the `HTML5` Tech is ready.
  */
constructor(e,t){super(e,t);const s=e.source;let i=false;this.featuresVideoFrameCallback=this.featuresVideoFrameCallback&&this.el_.tagName==="VIDEO";s&&(this.el_.currentSrc!==s.src||e.tag&&e.tag.initNetworkState_===3)?this.setSource(s):this.handleLateInit_(this.el_);e.enableSourceset&&this.setupSourcesetHandling_();this.isScrubbing_=false;if(this.el_.hasChildNodes()){const e=this.el_.childNodes;let t=e.length;const s=[];while(t--){const n=e[t];const r=n.nodeName.toLowerCase();if(r==="track")if(this.featuresNativeTextTracks){this.remoteTextTrackEls().addTrackElement_(n);this.remoteTextTracks().addTrack(n.track);this.textTracks().addTrack(n.track);i||this.el_.hasAttribute("crossorigin")||!isCrossOrigin(n.src)||(i=true)}else s.push(n)}for(let e=0;e<s.length;e++)this.el_.removeChild(s[e])}this.proxyNativeTracks_();this.featuresNativeTextTracks&&i&&B.warn("Text Tracks are being loaded from another origin but the crossorigin attribute isn't used.\nThis may prevent text tracks from loading.");this.restoreMetadataTracksInIOSNativePlayer_();(ae||se)&&e.nativeControlsForTouch===true&&this.setControls(true);this.proxyWebkitFullscreen_();this.triggerReady()}dispose(){this.el_&&this.el_.resetSourceset_&&this.el_.resetSourceset_();Html5.disposeMediaElement(this.el_);this.options_=null;super.dispose()}setupSourcesetHandling_(){setupSourceset(this)}restoreMetadataTracksInIOSNativePlayer_(){const e=this.textTracks();let t;const takeMetadataTrackSnapshot=()=>{t=[];for(let s=0;s<e.length;s++){const i=e[s];i.kind==="metadata"&&t.push({track:i,storedMode:i.mode})}};takeMetadataTrackSnapshot();e.addEventListener("change",takeMetadataTrackSnapshot);this.on("dispose",(()=>e.removeEventListener("change",takeMetadataTrackSnapshot)));const restoreTrackMode=()=>{for(let e=0;e<t.length;e++){const s=t[e];s.track.mode==="disabled"&&s.track.mode!==s.storedMode&&(s.track.mode=s.storedMode)}e.removeEventListener("change",restoreTrackMode)};this.on("webkitbeginfullscreen",(()=>{e.removeEventListener("change",takeMetadataTrackSnapshot);e.removeEventListener("change",restoreTrackMode);e.addEventListener("change",restoreTrackMode)}));this.on("webkitendfullscreen",(()=>{e.removeEventListener("change",takeMetadataTrackSnapshot);e.addEventListener("change",takeMetadataTrackSnapshot);e.removeEventListener("change",restoreTrackMode)}))}
/**
   * Attempt to force override of tracks for the given type
   *
   * @param {string} type - Track type to override, possible values include 'Audio',
   * 'Video', and 'Text'.
   * @param {boolean} override - If set to true native audio/video will be overridden,
   * otherwise native audio/video will potentially be used.
   * @private
   */overrideNative_(e,t){if(t!==this[`featuresNative${e}Tracks`])return;const s=e.toLowerCase();this[`${s}TracksListeners_`]&&Object.keys(this[`${s}TracksListeners_`]).forEach((e=>{const t=this.el()[`${s}Tracks`];t.removeEventListener(e,this[`${s}TracksListeners_`][e])}));this[`featuresNative${e}Tracks`]=!t;this[`${s}TracksListeners_`]=null;this.proxyNativeTracksForType_(s)}
/**
   * Attempt to force override of native audio tracks.
   *
   * @param {boolean} override - If set to true native audio will be overridden,
   * otherwise native audio will potentially be used.
   */overrideNativeAudioTracks(e){this.overrideNative_("Audio",e)}
/**
   * Attempt to force override of native video tracks.
   *
   * @param {boolean} override - If set to true native video will be overridden,
   * otherwise native video will potentially be used.
   */overrideNativeVideoTracks(e){this.overrideNative_("Video",e)}
/**
   * Proxy native track list events for the given type to our track
   * lists if the browser we are playing in supports that type of track list.
   *
   * @param {string} name - Track type; values include 'audio', 'video', and 'text'
   * @private
   */proxyNativeTracksForType_(e){const t=Be[e];const s=this.el()[t.getterName];const i=this[t.getterName]();if(!this[`featuresNative${t.capitalName}Tracks`]||!s||!s.addEventListener)return;const n={change:t=>{const s={type:"change",target:i,currentTarget:i,srcElement:i};i.trigger(s);e==="text"&&this[je.remoteText.getterName]().trigger(s)},addtrack(e){i.addTrack(e.track)},removetrack(e){i.removeTrack(e.track)}};const removeOldTracks=function(){const e=[];for(let t=0;t<i.length;t++){let n=false;for(let e=0;e<s.length;e++)if(s[e]===i[t]){n=true;break}n||e.push(i[t])}while(e.length)i.removeTrack(e.shift())};this[t.getterName+"Listeners_"]=n;Object.keys(n).forEach((e=>{const t=n[e];s.addEventListener(e,t);this.on("dispose",(i=>s.removeEventListener(e,t)))}));this.on("loadstart",removeOldTracks);this.on("dispose",(e=>this.off("loadstart",removeOldTracks)))}proxyNativeTracks_(){Be.names.forEach((e=>{this.proxyNativeTracksForType_(e)}))}createEl(){let e=this.options_.tag;if(!e||!(this.options_.playerElIngest||this.movingMediaElementInDOM)){if(e){const t=e.cloneNode(true);e.parentNode&&e.parentNode.insertBefore(t,e);Html5.disposeMediaElement(e);e=t}else{e=t.createElement("video");const s=this.options_.tag&&getAttributes(this.options_.tag);const i=merge$1({},s);ae&&this.options_.nativeControlsForTouch===true||delete i.controls;setAttributes(e,Object.assign(i,{id:this.options_.techId,class:"vjs-tech"}))}e.playerId=this.options_.playerId}typeof this.options_.preload!=="undefined"&&setAttribute(e,"preload",this.options_.preload);this.options_.disablePictureInPicture!==void 0&&(e.disablePictureInPicture=this.options_.disablePictureInPicture);const s=["loop","muted","playsinline","autoplay"];for(let t=0;t<s.length;t++){const i=s[t];const n=this.options_[i];if(typeof n!=="undefined"){n?setAttribute(e,i,i):removeAttribute(e,i);e[i]=n}}return e}handleLateInit_(e){if(e.networkState===0||e.networkState===3)return;if(e.readyState===0){let e=false;const setLoadstartFired=function(){e=true};this.on("loadstart",setLoadstartFired);const triggerLoadstart=function(){e||this.trigger("loadstart")};this.on("loadedmetadata",triggerLoadstart);this.ready((function(){this.off("loadstart",setLoadstartFired);this.off("loadedmetadata",triggerLoadstart);e||this.trigger("loadstart")}));return}const t=["loadstart"];t.push("loadedmetadata");e.readyState>=2&&t.push("loadeddata");e.readyState>=3&&t.push("canplay");e.readyState>=4&&t.push("canplaythrough");this.ready((function(){t.forEach((function(e){this.trigger(e)}),this)}))}
/**
   * Set whether we are scrubbing or not.
   * This is used to decide whether we should use `fastSeek` or not.
   * `fastSeek` is used to provide trick play on Safari browsers.
   *
   * @param {boolean} isScrubbing
   *                  - true for we are currently scrubbing
   *                  - false for we are no longer scrubbing
   */setScrubbing(e){this.isScrubbing_=e}scrubbing(){return this.isScrubbing_}
/**
   * Set current time for the `HTML5` tech.
   *
   * @param {number} seconds
   *        Set the current time of the media to this.
   */setCurrentTime(e){try{this.isScrubbing_&&this.el_.fastSeek&&de?this.el_.fastSeek(e):this.el_.currentTime=e}catch(e){B(e,"Video is not ready. (Video.js)")}}duration(){if(this.el_.duration===Infinity&&q&&K&&this.el_.currentTime===0){const checkProgress=()=>{if(this.el_.currentTime>0){this.el_.duration===Infinity&&this.trigger("durationchange");this.off("timeupdate",checkProgress)}};this.on("timeupdate",checkProgress);return NaN}return this.el_.duration||NaN}width(){return this.el_.offsetWidth}height(){return this.el_.offsetHeight}proxyWebkitFullscreen_(){if(!("webkitDisplayingFullscreen"in this.el_))return;const endFn=function(){this.trigger("fullscreenchange",{isFullscreen:false});this.el_.controls&&!this.options_.nativeControlsForTouch&&this.controls()&&(this.el_.controls=false)};const beginFn=function(){if("webkitPresentationMode"in this.el_&&this.el_.webkitPresentationMode!=="picture-in-picture"){this.one("webkitendfullscreen",endFn);this.trigger("fullscreenchange",{isFullscreen:true,nativeIOSFullscreen:true})}};this.on("webkitbeginfullscreen",beginFn);this.on("dispose",(()=>{this.off("webkitbeginfullscreen",beginFn);this.off("webkitendfullscreen",endFn)}))}supportsFullScreen(){return typeof this.el_.webkitEnterFullScreen==="function"}enterFullScreen(){const e=this.el_;if(e.paused&&e.networkState<=e.HAVE_METADATA){silencePromise(this.el_.play());this.setTimeout((function(){e.pause();try{e.webkitEnterFullScreen()}catch(e){this.trigger("fullscreenerror",e)}}),0)}else try{e.webkitEnterFullScreen()}catch(e){this.trigger("fullscreenerror",e)}}exitFullScreen(){this.el_.webkitDisplayingFullscreen?this.el_.webkitExitFullScreen():this.trigger("fullscreenerror",new Error("The video is not fullscreen"))}requestPictureInPicture(){return this.el_.requestPictureInPicture()}
/**
   * Native requestVideoFrameCallback if supported by browser/tech, or fallback
   * Don't use rVCF on Safari when DRM is playing, as it doesn't fire
   * Needs to be checked later than the constructor
   * This will be a false positive for clear sources loaded after a Fairplay source
   *
   * @param {function} cb function to call
   * @return {number} id of request
   */requestVideoFrameCallback(e){return this.featuresVideoFrameCallback&&!this.el_.webkitKeys?this.el_.requestVideoFrameCallback(e):super.requestVideoFrameCallback(e)}
/**
   * Native or fallback requestVideoFrameCallback
   *
   * @param {number} id request id to cancel
   */cancelVideoFrameCallback(e){this.featuresVideoFrameCallback&&!this.el_.webkitKeys?this.el_.cancelVideoFrameCallback(e):super.cancelVideoFrameCallback(e)}
/**
   * A getter/setter for the `Html5` Tech's source object.
   * > Note: Please use {@link Html5#setSource}
   *
   * @param {Tech~SourceObject} [src]
   *        The source object you want to set on the `HTML5` techs element.
   *
   * @return {Tech~SourceObject|undefined}
   *         - The current source object when a source is not passed in.
   *         - undefined when setting
   *
   * @deprecated Since version 5.
   */src(e){if(e===void 0)return this.el_.src;this.setSrc(e)}
/**
   * Add a <source> element to the <video> element.
   *
   * @param {string} srcUrl
   *        The URL of the video source.
   *
   * @param {string} [mimeType]
   *        The MIME type of the video source. Optional but recommended.
   *
   * @return {boolean}
   *         Returns true if the source element was successfully added, false otherwise.
   */addSourceElement(e,t){if(!e){B.error("Invalid source URL.");return false}const s={src:e};t&&(s.type=t);const i=createEl("source",{},s);this.el_.appendChild(i);return true}
/**
   * Remove a <source> element from the <video> element by its URL.
   *
   * @param {string} srcUrl
   *        The URL of the source to remove.
   *
   * @return {boolean}
   *         Returns true if the source element was successfully removed, false otherwise.
   */removeSourceElement(e){if(!e){B.error("Source URL is required to remove the source element.");return false}const t=this.el_.querySelectorAll("source");for(const s of t)if(s.src===e){this.el_.removeChild(s);return true}B.warn(`No matching source element found with src: ${e}`);return false}reset(){Html5.resetMediaElement(this.el_)}currentSrc(){return this.currentSource_?this.currentSource_.src:this.el_.currentSrc}
/**
   * Set controls attribute for the HTML5 media Element.
   *
   * @param {string} val
   *        Value to set the controls attribute to
   */setControls(e){this.el_.controls=!!e}
/**
   * Create and returns a remote {@link TextTrack} object.
   *
   * @param {string} kind
   *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata)
   *
   * @param {string} [label]
   *        Label to identify the text track
   *
   * @param {string} [language]
   *        Two letter language abbreviation
   *
   * @return {TextTrack}
   *         The TextTrack that gets created.
   */addTextTrack(e,t,s){return this.featuresNativeTextTracks?this.el_.addTextTrack(e,t,s):super.addTextTrack(e,t,s)}
/**
   * Creates either native TextTrack or an emulated TextTrack depending
   * on the value of `featuresNativeTextTracks`
   *
   * @param {Object} options
   *        The object should contain the options to initialize the TextTrack with.
   *
   * @param {string} [options.kind]
   *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata).
   *
   * @param {string} [options.label]
   *        Label to identify the text track
   *
   * @param {string} [options.language]
   *        Two letter language abbreviation.
   *
   * @param {boolean} [options.default]
   *        Default this track to on.
   *
   * @param {string} [options.id]
   *        The internal id to assign this track.
   *
   * @param {string} [options.src]
   *        A source url for the track.
   *
   * @return {HTMLTrackElement}
   *         The track element that gets created.
   */createRemoteTextTrack(e){if(!this.featuresNativeTextTracks)return super.createRemoteTextTrack(e);const s=t.createElement("track");e.kind&&(s.kind=e.kind);e.label&&(s.label=e.label);(e.language||e.srclang)&&(s.srclang=e.language||e.srclang);e.default&&(s.default=e.default);e.id&&(s.id=e.id);e.src&&(s.src=e.src);return s}
/**
   * Creates a remote text track object and returns an html track element.
   *
   * @param {Object} options The object should contain values for
   * kind, language, label, and src (location of the WebVTT file)
   * @param {boolean} [manualCleanup=false] if set to true, the TextTrack
   * will not be removed from the TextTrackList and HtmlTrackElementList
   * after a source change
   * @return {HTMLTrackElement} An Html Track Element.
   * This can be an emulated {@link HTMLTrackElement} or a native one.
   *
   */addRemoteTextTrack(e,t){const s=super.addRemoteTextTrack(e,t);this.featuresNativeTextTracks&&this.el().appendChild(s);return s}
/**
   * Remove remote `TextTrack` from `TextTrackList` object
   *
   * @param {TextTrack} track
   *        `TextTrack` object to remove
   */removeRemoteTextTrack(e){super.removeRemoteTextTrack(e);if(this.featuresNativeTextTracks){const t=this.$$("track");let s=t.length;while(s--)e!==t[s]&&e!==t[s].track||this.el().removeChild(t[s])}}getVideoPlaybackQuality(){if(typeof this.el().getVideoPlaybackQuality==="function")return this.el().getVideoPlaybackQuality();const t={};if(typeof this.el().webkitDroppedFrameCount!=="undefined"&&typeof this.el().webkitDecodedFrameCount!=="undefined"){t.droppedVideoFrames=this.el().webkitDroppedFrameCount;t.totalVideoFrames=this.el().webkitDecodedFrameCount}e.performance&&(t.creationTime=e.performance.now());return t}}
/**
 * Element for testing browser HTML5 media capabilities
 *
 * @type {Element}
 * @constant
 * @private
 */defineLazyProperty(Html5,"TEST_VID",(function(){if(!isReal())return;const e=t.createElement("video");const s=t.createElement("track");s.kind="captions";s.srclang="en";s.label="English";e.appendChild(s);return e}));Html5.isSupported=function(){try{Html5.TEST_VID.volume=.5}catch(e){return false}return!!(Html5.TEST_VID&&Html5.TEST_VID.canPlayType)};
/**
 * Check if the tech can support the given type
 *
 * @param {string} type
 *        The mimetype to check
 * @return {string} 'probably', 'maybe', or '' (empty string)
 */Html5.canPlayType=function(e){return Html5.TEST_VID.canPlayType(e)};
/**
 * Check if the tech can support the given source
 *
 * @param {Object} srcObj
 *        The source object
 * @param {Object} options
 *        The options passed to the tech
 * @return {string} 'probably', 'maybe', or '' (empty string)
 */Html5.canPlaySource=function(e,t){return Html5.canPlayType(e.type)};Html5.canControlVolume=function(){try{const t=Html5.TEST_VID.volume;Html5.TEST_VID.volume=t/2+.1;const s=t!==Html5.TEST_VID.volume;if(s&&le){e.setTimeout((()=>{Html5&&Html5.prototype&&(Html5.prototype.featuresVolumeControl=t!==Html5.TEST_VID.volume)}));return false}return s}catch(e){return false}};Html5.canMuteVolume=function(){try{const e=Html5.TEST_VID.muted;Html5.TEST_VID.muted=!e;Html5.TEST_VID.muted?setAttribute(Html5.TEST_VID,"muted","muted"):removeAttribute(Html5.TEST_VID,"muted","muted");return e!==Html5.TEST_VID.muted}catch(e){return false}};Html5.canControlPlaybackRate=function(){if(q&&K&&X<58)return false;try{const e=Html5.TEST_VID.playbackRate;Html5.TEST_VID.playbackRate=e/2+.1;return e!==Html5.TEST_VID.playbackRate}catch(e){return false}};Html5.canOverrideAttributes=function(){try{const noop=()=>{};Object.defineProperty(t.createElement("video"),"src",{get:noop,set:noop});Object.defineProperty(t.createElement("audio"),"src",{get:noop,set:noop});Object.defineProperty(t.createElement("video"),"innerHTML",{get:noop,set:noop});Object.defineProperty(t.createElement("audio"),"innerHTML",{get:noop,set:noop})}catch(e){return false}return true};Html5.supportsNativeTextTracks=function(){return de||le&&K};Html5.supportsNativeVideoTracks=function(){return!!(Html5.TEST_VID&&Html5.TEST_VID.videoTracks)};Html5.supportsNativeAudioTracks=function(){return!!(Html5.TEST_VID&&Html5.TEST_VID.audioTracks)};
/**
 * An array of events available on the Html5 tech.
 *
 * @private
 * @type {Array}
 */Html5.Events=["loadstart","suspend","abort","error","emptied","stalled","loadedmetadata","loadeddata","canplay","canplaythrough","playing","waiting","seeking","seeked","ended","durationchange","timeupdate","progress","play","pause","ratechange","resize","volumechange"];
/**
 * Boolean indicating whether the `Tech` supports volume control.
 *
 * @type {boolean}
 * @default {@link Html5.canControlVolume}
 */
/**
 * Boolean indicating whether the `Tech` supports muting volume.
 *
 * @type {boolean}
 * @default {@link Html5.canMuteVolume}
 */
/**
 * Boolean indicating whether the `Tech` supports changing the speed at which the media
 * plays. Examples:
 *   - Set player to play 2x (twice) as fast
 *   - Set player to play 0.5x (half) as fast
 *
 * @type {boolean}
 * @default {@link Html5.canControlPlaybackRate}
 */
/**
 * Boolean indicating whether the `Tech` supports the `sourceset` event.
 *
 * @type {boolean}
 * @default
 */
/**
 * Boolean indicating whether the `HTML5` tech currently supports native `TextTrack`s.
 *
 * @type {boolean}
 * @default {@link Html5.supportsNativeTextTracks}
 */
/**
 * Boolean indicating whether the `HTML5` tech currently supports native `VideoTrack`s.
 *
 * @type {boolean}
 * @default {@link Html5.supportsNativeVideoTracks}
 */
/**
 * Boolean indicating whether the `HTML5` tech currently supports native `AudioTrack`s.
 *
 * @type {boolean}
 * @default {@link Html5.supportsNativeAudioTracks}
 */[["featuresMuteControl","canMuteVolume"],["featuresPlaybackRate","canControlPlaybackRate"],["featuresSourceset","canOverrideAttributes"],["featuresNativeTextTracks","supportsNativeTextTracks"],["featuresNativeVideoTracks","supportsNativeVideoTracks"],["featuresNativeAudioTracks","supportsNativeAudioTracks"]].forEach((function([e,t]){defineLazyProperty(Html5.prototype,e,(()=>Html5[t]()),true)}));Html5.prototype.featuresVolumeControl=Html5.canControlVolume();
/**
 * Boolean indicating whether the `HTML5` tech currently supports the media element
 * moving in the DOM. iOS breaks if you move the media element, so this is set this to
 * false there. Everywhere else this should be true.
 *
 * @type {boolean}
 * @default
 */Html5.prototype.movingMediaElementInDOM=!le;
/**
 * Boolean indicating whether the `HTML5` tech currently supports automatic media resize
 * when going into fullscreen.
 *
 * @type {boolean}
 * @default
 */Html5.prototype.featuresFullscreenResize=true;
/**
 * Boolean indicating whether the `HTML5` tech currently supports the progress event.
 * If this is false, manual `progress` events will be triggered instead.
 *
 * @type {boolean}
 * @default
 */Html5.prototype.featuresProgressEvents=true;Html5.prototype.featuresTimeupdateEvents=true;
/**
 * Whether the HTML5 el supports `requestVideoFrameCallback`
 *
 * @type {boolean}
 */Html5.prototype.featuresVideoFrameCallback=!!(Html5.TEST_VID&&Html5.TEST_VID.requestVideoFrameCallback);Html5.disposeMediaElement=function(e){if(e){e.parentNode&&e.parentNode.removeChild(e);while(e.hasChildNodes())e.removeChild(e.firstChild);e.removeAttribute("src");typeof e.load==="function"&&function(){try{e.load()}catch(e){}}()}};Html5.resetMediaElement=function(e){if(!e)return;const t=e.querySelectorAll("source");let s=t.length;while(s--)e.removeChild(t[s]);e.removeAttribute("src");typeof e.load==="function"&&function(){try{e.load()}catch(e){}}()};["muted","defaultMuted","autoplay","controls","loop","playsinline"].forEach((function(e){Html5.prototype[e]=function(){return this.el_[e]||this.el_.hasAttribute(e)}}));[
/**
 * Set the value of `muted` on the media element. `muted` indicates that the current
 * audio level should be silent.
 *
 * @method Html5#setMuted
 * @param {boolean} muted
 *        - True if the audio should be set to silent
 *        - False otherwise
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#dom-media-muted}
 */
"muted",
/**
 * Set the value of `defaultMuted` on the media element. `defaultMuted` indicates that the current
 * audio level should be silent, but will only effect the muted level on initial playback..
 *
 * @method Html5.prototype.setDefaultMuted
 * @param {boolean} defaultMuted
 *        - True if the audio should be set to silent
 *        - False otherwise
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#dom-media-defaultmuted}
 */
"defaultMuted",
/**
 * Set the value of `autoplay` on the media element. `autoplay` indicates
 * that the media should start to play as soon as the page is ready.
 *
 * @method Html5#setAutoplay
 * @param {boolean} autoplay
 *         - True indicates that the media should start as soon as the page loads.
 *         - False indicates that the media should not start as soon as the page loads.
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#attr-media-autoplay}
 */
"autoplay",
/**
 * Set the value of `loop` on the media element. `loop` indicates
 * that the media should return to the start of the media and continue playing once
 * it reaches the end.
 *
 * @method Html5#setLoop
 * @param {boolean} loop
 *         - True indicates that playback should seek back to start once
 *           the end of a media is reached.
 *         - False indicates that playback should not loop back to the start when the
 *           end of the media is reached.
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#attr-media-loop}
 */
"loop",
/**
 * Set the value of `playsinline` from the media element. `playsinline` indicates
 * to the browser that non-fullscreen playback is preferred when fullscreen
 * playback is the native default, such as in iOS Safari.
 *
 * @method Html5#setPlaysinline
 * @param {boolean} playsinline
 *         - True indicates that the media should play inline.
 *         - False indicates that the media should not play inline.
 *
 * @see [Spec]{@link https://html.spec.whatwg.org/#attr-video-playsinline}
 */
"playsinline"].forEach((function(e){Html5.prototype["set"+toTitleCase$1(e)]=function(t){this.el_[e]=t;t?this.el_.setAttribute(e,e):this.el_.removeAttribute(e)}}));["paused","currentTime","buffered","volume","poster","preload","error","seeking","seekable","ended","playbackRate","defaultPlaybackRate","disablePictureInPicture","played","networkState","readyState","videoWidth","videoHeight","crossOrigin"].forEach((function(e){Html5.prototype[e]=function(){return this.el_[e]}}));[
/**
 * Set the value of `volume` on the media element. `volume` indicates the current
 * audio level as a percentage in decimal form. This means that 1 is 100%, 0.5 is 50%, and
 * so on.
 *
 * @method Html5#setVolume
 * @param {number} percentAsDecimal
 *        The volume percent as a decimal. Valid range is from 0-1.
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#dom-a-volume}
 */
"volume",
/**
 * Set the value of `src` on the media element. `src` indicates the current
 * {@link Tech~SourceObject} for the media.
 *
 * @method Html5#setSrc
 * @param {Tech~SourceObject} src
 *        The source object to set as the current source.
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#dom-media-src}
 */
"src",
/**
 * Set the value of `poster` on the media element. `poster` is the url to
 * an image file that can/will be shown when no media data is available.
 *
 * @method Html5#setPoster
 * @param {string} poster
 *        The url to an image that should be used as the `poster` for the media
 *        element.
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#attr-media-poster}
 */
"poster",
/**
 * Set the value of `preload` on the media element. `preload` indicates
 * what should download before the media is interacted with. It can have the following
 * values:
 * - none: nothing should be downloaded
 * - metadata: poster and the first few frames of the media may be downloaded to get
 *   media dimensions and other metadata
 * - auto: allow the media and metadata for the media to be downloaded before
 *    interaction
 *
 * @method Html5#setPreload
 * @param {string} preload
 *         The value of `preload` to set on the media element. Must be 'none', 'metadata',
 *         or 'auto'.
 *
 * @see [Spec]{@link https://www.w3.org/TR/html5/embedded-content-0.html#attr-media-preload}
 */
"preload","playbackRate","defaultPlaybackRate",
/**
 * Prevents the browser from suggesting a Picture-in-Picture context menu
 * or to request Picture-in-Picture automatically in some cases.
 *
 * @method Html5#setDisablePictureInPicture
 * @param {boolean} value
 *         The true value will disable Picture-in-Picture mode.
 *
 * @see [Spec]{@link https://w3c.github.io/picture-in-picture/#disable-pip}
 */
"disablePictureInPicture",
/**
 * Set the value of `crossOrigin` from the media element. `crossOrigin` indicates
 * to the browser that should sent the cookies along with the requests for the
 * different assets/playlists
 *
 * @method Html5#setCrossOrigin
 * @param {string} crossOrigin
 *         - anonymous indicates that the media should not sent cookies.
 *         - use-credentials indicates that the media should sent cookies along the requests.
 *
 * @see [Spec]{@link https://html.spec.whatwg.org/#attr-media-crossorigin}
 */
"crossOrigin"].forEach((function(e){Html5.prototype["set"+toTitleCase$1(e)]=function(t){this.el_[e]=t}}));["pause","load","play"].forEach((function(e){Html5.prototype[e]=function(){return this.el_[e]()}}));Tech.withSourceHandlers(Html5);Html5.nativeSourceHandler={};
/**
 * Check if the media element can play the given mime type.
 *
 * @param {string} type
 *        The mimetype to check
 *
 * @return {string}
 *         'probably', 'maybe', or '' (empty string)
 */Html5.nativeSourceHandler.canPlayType=function(e){try{return Html5.TEST_VID.canPlayType(e)}catch(e){return""}};
/**
 * Check if the media element can handle a source natively.
 *
 * @param {Tech~SourceObject} source
 *         The source object
 *
 * @param {Object} [options]
 *         Options to be passed to the tech.
 *
 * @return {string}
 *         'probably', 'maybe', or '' (empty string).
 */Html5.nativeSourceHandler.canHandleSource=function(e,t){if(e.type)return Html5.nativeSourceHandler.canPlayType(e.type);if(e.src){const t=getFileExtension(e.src);return Html5.nativeSourceHandler.canPlayType(`video/${t}`)}return""};
/**
 * Pass the source to the native media element.
 *
 * @param {Tech~SourceObject} source
 *        The source object
 *
 * @param {Html5} tech
 *        The instance of the Html5 tech
 *
 * @param {Object} [options]
 *        The options to pass to the source
 */Html5.nativeSourceHandler.handleSource=function(e,t,s){t.setSrc(e.src)};Html5.nativeSourceHandler.dispose=function(){};Html5.registerSourceHandler(Html5.nativeSourceHandler);Tech.registerTech("Html5",Html5);
/**
 * @callback PlayerReadyCallback
 * @this     {Player}
 * @returns  {void}
 */const Tt=[
/**
 * Fired while the user agent is downloading media data.
 *
 * @event Player#progress
 * @type {Event}
 */
"progress",
/**
 * Fires when the loading of an audio/video is aborted.
 *
 * @event Player#abort
 * @type {Event}
 */
"abort",
/**
 * Fires when the browser is intentionally not getting media data.
 *
 * @event Player#suspend
 * @type {Event}
 */
"suspend",
/**
 * Fires when the current playlist is empty.
 *
 * @event Player#emptied
 * @type {Event}
 */
"emptied",
/**
 * Fires when the browser is trying to get media data, but data is not available.
 *
 * @event Player#stalled
 * @type {Event}
 */
"stalled",
/**
 * Fires when the browser has loaded meta data for the audio/video.
 *
 * @event Player#loadedmetadata
 * @type {Event}
 */
"loadedmetadata",
/**
 * Fires when the browser has loaded the current frame of the audio/video.
 *
 * @event Player#loadeddata
 * @type {event}
 */
"loadeddata",
/**
 * Fires when the current playback position has changed.
 *
 * @event Player#timeupdate
 * @type {event}
 */
"timeupdate",
/**
 * Fires when the video's intrinsic dimensions change
 *
 * @event Player#resize
 * @type {event}
 */
"resize",
/**
 * Fires when the volume has been changed
 *
 * @event Player#volumechange
 * @type {event}
 */
"volumechange",
/**
 * Fires when the text track has been changed
 *
 * @event Player#texttrackchange
 * @type {event}
 */
"texttrackchange"];const bt={canplay:"CanPlay",canplaythrough:"CanPlayThrough",playing:"Playing",seeked:"Seeked"};const St=["tiny","xsmall","small","medium","large","xlarge","huge"];const Ct={};St.forEach((e=>{const t=e.charAt(0)==="x"?`x-${e.substring(1)}`:e;Ct[e]=`vjs-layout-${t}`}));const kt={tiny:210,xsmall:320,small:425,medium:768,large:1440,xlarge:2560,huge:Infinity};class Player extends Component$1{
/**
   * Create an instance of this class.
   *
   * @param {Element} tag
   *        The original video DOM element used for configuring options.
   *
   * @param {Object} [options]
   *        Object of option names and values.
   *
   * @param {PlayerReadyCallback} [ready]
   *        Ready callback function.
   */
constructor(s,i,n){s.id=s.id||i.id||`vjs_video_${newGUID()}`;i=Object.assign(Player.getTagSettings(s),i);i.initChildren=false;i.createEl=false;i.evented=false;i.reportTouchActivity=false;if(!i.language){const e=s.closest("[lang]");e&&(i.language=e.getAttribute("lang"))}super(null,i,n);this.boundDocumentFullscreenChange_=e=>this.documentFullscreenChange_(e);this.boundFullWindowOnEscKey_=e=>this.fullWindowOnEscKey(e);this.boundUpdateStyleEl_=e=>this.updateStyleEl_(e);this.boundApplyInitTime_=e=>this.applyInitTime_(e);this.boundUpdateCurrentBreakpoint_=e=>this.updateCurrentBreakpoint_(e);this.boundHandleTechClick_=e=>this.handleTechClick_(e);this.boundHandleTechDoubleClick_=e=>this.handleTechDoubleClick_(e);this.boundHandleTechTouchStart_=e=>this.handleTechTouchStart_(e);this.boundHandleTechTouchMove_=e=>this.handleTechTouchMove_(e);this.boundHandleTechTouchEnd_=e=>this.handleTechTouchEnd_(e);this.boundHandleTechTap_=e=>this.handleTechTap_(e);this.boundUpdatePlayerHeightOnAudioOnlyMode_=e=>this.updatePlayerHeightOnAudioOnlyMode_(e);this.isFullscreen_=false;this.log=j(this.id_);this.fsApi_=D;this.isPosterFromTech_=false;this.queuedCallbacks_=[];this.isReady_=false;this.hasStarted_=false;this.userActive_=false;this.debugEnabled_=false;this.audioOnlyMode_=false;this.audioPosterMode_=false;this.audioOnlyCache_={controlBarHeight:null,playerHeight:null,hiddenChildren:[]};if(!this.options_||!this.options_.techOrder||!this.options_.techOrder.length)throw new Error("No techOrder specified. Did you overwrite videojs.options instead of just changing the properties you want to override?");this.tag=s;this.tagAttributes=s&&getAttributes(s);this.language(this.options_.language);if(i.languages){const e={};Object.getOwnPropertyNames(i.languages).forEach((function(t){e[t.toLowerCase()]=i.languages[t]}));this.languages_=e}else this.languages_=Player.prototype.options_.languages;this.resetCache_();
/** @type string */this.poster_=i.poster||"";
/** @type {boolean} */this.controls_=!!i.controls;s.controls=false;s.removeAttribute("controls");this.changingSrc_=false;this.playCallbacks_=[];this.playTerminatedQueue_=[];s.hasAttribute("autoplay")?this.autoplay(true):this.autoplay(this.options_.autoplay);i.plugins&&Object.keys(i.plugins).forEach((e=>{if(typeof this[e]!=="function")throw new Error(`plugin "${e}" does not exist`)}));this.scrubbing_=false;this.el_=this.createEl();evented(this,{eventBusKey:"el_"});if(this.fsApi_.requestFullscreen){on(t,this.fsApi_.fullscreenchange,this.boundDocumentFullscreenChange_);this.on(this.fsApi_.fullscreenchange,this.boundDocumentFullscreenChange_)}this.fluid_&&this.on(["playerreset","resize"],this.boundUpdateStyleEl_);const r=merge$1(this.options_);i.plugins&&Object.keys(i.plugins).forEach((e=>{this[e](i.plugins[e])}));i.debug&&this.debug(true);this.options_.playerOptions=r;this.middleware_=[];this.playbackRates(i.playbackRates);if(i.experimentalSvgIcons){const t=new e.DOMParser;const s=t.parseFromString(Ge,"image/svg+xml");const i=s.querySelector("parsererror");if(i){B.warn("Failed to load SVG Icons. Falling back to Font Icons.");this.options_.experimentalSvgIcons=null}else{const e=s.documentElement;e.style.display="none";this.el_.appendChild(e);this.addClass("vjs-svg-icons-enabled")}}this.initChildren();this.isAudio(s.nodeName.toLowerCase()==="audio");this.controls()?this.addClass("vjs-controls-enabled"):this.addClass("vjs-controls-disabled");this.el_.setAttribute("role","region");this.isAudio()?this.el_.setAttribute("aria-label",this.localize("Audio Player")):this.el_.setAttribute("aria-label",this.localize("Video Player"));this.isAudio()&&this.addClass("vjs-audio");if(i.spatialNavigation&&i.spatialNavigation.enabled){this.spatialNavigation=new SpatialNavigation(this);this.addClass("vjs-spatial-navigation-enabled")}ae&&this.addClass("vjs-touch-enabled");le||this.addClass("vjs-workinghover");Player.players[this.id_]=this;const a=L.split(".")[0];this.addClass(`vjs-v${a}`);this.userActive(true);this.reportUserActivity();this.one("play",(e=>this.listenForUserActivity_(e)));this.on("keydown",(e=>this.handleKeyDown(e)));this.on("languagechange",(e=>this.handleLanguagechange(e)));this.breakpoints(this.options_.breakpoints);this.responsive(this.options_.responsive);this.on("ready",(()=>{this.audioPosterMode(this.options_.audioPosterMode);this.audioOnlyMode(this.options_.audioOnlyMode)}))}dispose(){
/**
     * Called when the player is being disposed of.
     *
     * @event Player#dispose
     * @type {Event}
     */
this.trigger("dispose");this.off("dispose");off(t,this.fsApi_.fullscreenchange,this.boundDocumentFullscreenChange_);off(t,"keydown",this.boundFullWindowOnEscKey_);if(this.styleEl_&&this.styleEl_.parentNode){this.styleEl_.parentNode.removeChild(this.styleEl_);this.styleEl_=null}Player.players[this.id_]=null;this.tag&&this.tag.player&&(this.tag.player=null);this.el_&&this.el_.player&&(this.el_.player=null);if(this.tech_){this.tech_.dispose();this.isPosterFromTech_=false;this.poster_=""}this.playerElIngest_&&(this.playerElIngest_=null);this.tag&&(this.tag=null);clearCacheForPlayer(this);Fe.names.forEach((e=>{const t=Fe[e];const s=this[t.getterName]();s&&s.off&&s.off()}));super.dispose({restoreEl:this.options_.restoreEl})}createEl(){let s=this.tag;let i;let n=this.playerElIngest_=s.parentNode&&s.parentNode.hasAttribute&&s.parentNode.hasAttribute("data-vjs-player");const r=this.tag.tagName.toLowerCase()==="video-js";n?i=this.el_=s.parentNode:r||(i=this.el_=super.createEl("div"));const a=getAttributes(s);if(r){i=this.el_=s;s=this.tag=t.createElement("video");while(i.children.length)s.appendChild(i.firstChild);hasClass(i,"video-js")||addClass(i,"video-js");i.appendChild(s);n=this.playerElIngest_=i;Object.keys(i).forEach((e=>{try{s[e]=i[e]}catch(e){}}))}s.setAttribute("tabindex","-1");a.tabindex="-1";if(K&&ee){s.setAttribute("role","application");a.role="application"}s.removeAttribute("width");s.removeAttribute("height");"width"in a&&delete a.width;"height"in a&&delete a.height;Object.getOwnPropertyNames(a).forEach((function(e){r&&e==="class"||i.setAttribute(e,a[e]);r&&s.setAttribute(e,a[e])}));s.playerId=s.id;s.id+="_html5_api";s.className="vjs-tech";s.player=i.player=this;this.addClass("vjs-paused");const o=["IS_SMART_TV","IS_TIZEN","IS_WEBOS","IS_ANDROID","IS_IPAD","IS_IPHONE","IS_CHROMECAST_RECEIVER"].filter((e=>he[e])).map((e=>"vjs-device-"+e.substring(3).toLowerCase().replace(/\_/g,"-")));this.addClass(...o);if(e.VIDEOJS_NO_DYNAMIC_STYLE!==true){this.styleEl_=createStyleElement("vjs-styles-dimensions");const e=ce(".vjs-styles-defaults");const t=ce("head");t.insertBefore(this.styleEl_,e?e.nextSibling:t.firstChild)}this.fill_=false;this.fluid_=false;this.width(this.options_.width);this.height(this.options_.height);this.fill(this.options_.fill);this.fluid(this.options_.fluid);this.aspectRatio(this.options_.aspectRatio);this.crossOrigin(this.options_.crossOrigin||this.options_.crossorigin);const l=s.getElementsByTagName("a");for(let e=0;e<l.length;e++){const t=l.item(e);addClass(t,"vjs-hidden");t.setAttribute("hidden","hidden")}s.initNetworkState_=s.networkState;s.parentNode&&!n&&s.parentNode.insertBefore(i,s);prependTo(s,i);this.children_.unshift(s);this.el_.setAttribute("lang",this.language_);this.el_.setAttribute("translate","no");this.el_=i;return i}
/**
   * Get or set the `Player`'s crossOrigin option. For the HTML5 player, this
   * sets the `crossOrigin` property on the `<video>` tag to control the CORS
   * behavior.
   *
   * @see [Video Element Attributes]{@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-crossorigin}
   *
   * @param {string|null} [value]
   *        The value to set the `Player`'s crossOrigin to. If an argument is
   *        given, must be one of `'anonymous'` or `'use-credentials'`, or 'null'.
   *
   * @return {string|null|undefined}
   *         - The current crossOrigin value of the `Player` when getting.
   *         - undefined when setting
   */crossOrigin(e){if(typeof e==="undefined")return this.techGet_("crossOrigin");if(e===null||e==="anonymous"||e==="use-credentials"){this.techCall_("setCrossOrigin",e);this.posterImage&&this.posterImage.crossOrigin(e)}else B.warn(`crossOrigin must be null,  "anonymous" or "use-credentials", given "${e}"`)}
/**
   * A getter/setter for the `Player`'s width. Returns the player's configured value.
   * To get the current width use `currentWidth()`.
   *
   * @param {number|string} [value]
   *        CSS value to set the `Player`'s width to.
   *
   * @return {number|undefined}
   *         - The current width of the `Player` when getting.
   *         - Nothing when setting
   */width(e){return this.dimension("width",e)}
/**
   * A getter/setter for the `Player`'s height. Returns the player's configured value.
   * To get the current height use `currentheight()`.
   *
   * @param {number|string} [value]
   *        CSS value to set the `Player`'s height to.
   *
   * @return {number|undefined}
   *         - The current height of the `Player` when getting.
   *         - Nothing when setting
   */height(e){return this.dimension("height",e)}
/**
   * A getter/setter for the `Player`'s width & height.
   *
   * @param {string} dimension
   *        This string can be:
   *        - 'width'
   *        - 'height'
   *
   * @param {number|string} [value]
   *        Value for dimension specified in the first argument.
   *
   * @return {number}
   *         The dimension arguments value when getting (width/height).
   */dimension(e,t){const s=e+"_";if(t===void 0)return this[s]||0;if(t===""||t==="auto"){this[s]=void 0;this.updateStyleEl_();return}const i=parseFloat(t);if(isNaN(i))B.error(`Improper value "${t}" supplied for for ${e}`);else{this[s]=i;this.updateStyleEl_()}}
/**
   * A getter/setter/toggler for the vjs-fluid `className` on the `Player`.
   *
   * Turning this on will turn off fill mode.
   *
   * @param {boolean} [bool]
   *        - A value of true adds the class.
   *        - A value of false removes the class.
   *        - No value will be a getter.
   *
   * @return {boolean|undefined}
   *         - The value of fluid when getting.
   *         - `undefined` when setting.
   */fluid(e){if(e===void 0)return!!this.fluid_;this.fluid_=!!e;isEvented(this)&&this.off(["playerreset","resize"],this.boundUpdateStyleEl_);if(e){this.addClass("vjs-fluid");this.fill(false);addEventedCallback(this,(()=>{this.on(["playerreset","resize"],this.boundUpdateStyleEl_)}))}else this.removeClass("vjs-fluid");this.updateStyleEl_()}
/**
   * A getter/setter/toggler for the vjs-fill `className` on the `Player`.
   *
   * Turning this on will turn off fluid mode.
   *
   * @param {boolean} [bool]
   *        - A value of true adds the class.
   *        - A value of false removes the class.
   *        - No value will be a getter.
   *
   * @return {boolean|undefined}
   *         - The value of fluid when getting.
   *         - `undefined` when setting.
   */fill(e){if(e===void 0)return!!this.fill_;this.fill_=!!e;if(e){this.addClass("vjs-fill");this.fluid(false)}else this.removeClass("vjs-fill")}
/**
   * Get/Set the aspect ratio
   *
   * @param {string} [ratio]
   *        Aspect ratio for player
   *
   * @return {string|undefined}
   *         returns the current aspect ratio when getting
   */
/**
   * A getter/setter for the `Player`'s aspect ratio.
   *
   * @param {string} [ratio]
   *        The value to set the `Player`'s aspect ratio to.
   *
   * @return {string|undefined}
   *         - The current aspect ratio of the `Player` when getting.
   *         - undefined when setting
   */aspectRatio(e){if(e===void 0)return this.aspectRatio_;if(!/^\d+\:\d+$/.test(e))throw new Error("Improper value supplied for aspect ratio. The format should be width:height, for example 16:9.");this.aspectRatio_=e;this.fluid(true);this.updateStyleEl_()}updateStyleEl_(){if(e.VIDEOJS_NO_DYNAMIC_STYLE===true){const e=typeof this.width_==="number"?this.width_:this.options_.width;const t=typeof this.height_==="number"?this.height_:this.options_.height;const s=this.tech_&&this.tech_.el();if(s){e>=0&&(s.width=e);t>=0&&(s.height=t)}return}let t;let s;let i;let n;i=this.aspectRatio_!==void 0&&this.aspectRatio_!=="auto"?this.aspectRatio_:this.videoWidth()>0?this.videoWidth()+":"+this.videoHeight():"16:9";const r=i.split(":");const a=r[1]/r[0];t=this.width_!==void 0?this.width_:this.height_!==void 0?this.height_/a:this.videoWidth()||300;s=this.height_!==void 0?this.height_:t*a;n=/^[^a-zA-Z]/.test(this.id())?"dimensions-"+this.id():this.id()+"-dimensions";this.addClass(n);setTextContent(this.styleEl_,`\n      .${n} {\n        width: ${t}px;\n        height: ${s}px;\n      }\n\n      .${n}.vjs-fluid:not(.vjs-audio-only-mode) {\n        padding-top: ${a*100}%;\n      }\n    `)}
/**
   * Load/Create an instance of playback {@link Tech} including element
   * and API methods. Then append the `Tech` element in `Player` as a child.
   *
   * @param {string} techName
   *        name of the playback technology
   *
   * @param {string} source
   *        video source
   *
   * @private
   */loadTech_(e,t){this.tech_&&this.unloadTech_();const s=toTitleCase$1(e);const i=e.charAt(0).toLowerCase()+e.slice(1);if(s!=="Html5"&&this.tag){Tech.getTech("Html5").disposeMediaElement(this.tag);this.tag.player=null;this.tag=null}this.techName_=s;this.isReady_=false;let n=this.autoplay();(typeof this.autoplay()==="string"||this.autoplay()===true&&this.options_.normalizeAutoplay)&&(n=false);const r={source:t,autoplay:n,nativeControlsForTouch:this.options_.nativeControlsForTouch,playerId:this.id(),techId:`${this.id()}_${i}_api`,playsinline:this.options_.playsinline,preload:this.options_.preload,loop:this.options_.loop,disablePictureInPicture:this.options_.disablePictureInPicture,muted:this.options_.muted,poster:this.poster(),language:this.language(),playerElIngest:this.playerElIngest_||false,"vtt.js":this.options_["vtt.js"],canOverridePoster:!!this.options_.techCanOverridePoster,enableSourceset:this.options_.enableSourceset};Fe.names.forEach((e=>{const t=Fe[e];r[t.getterName]=this[t.privateName]}));Object.assign(r,this.options_[s]);Object.assign(r,this.options_[i]);Object.assign(r,this.options_[e.toLowerCase()]);this.tag&&(r.tag=this.tag);t&&t.src===this.cache_.src&&this.cache_.currentTime>0&&(r.startTime=this.cache_.currentTime);const a=Tech.getTech(e);if(!a)throw new Error(`No Tech named '${s}' exists! '${s}' should be registered using videojs.registerTech()'`);this.tech_=new a(r);this.tech_.ready(bind_(this,this.handleTechReady_),true);Le.jsonToTextTracks(this.textTracksJson_||[],this.tech_);Tt.forEach((e=>{this.on(this.tech_,e,(t=>this[`handleTech${toTitleCase$1(e)}_`](t)))}));Object.keys(bt).forEach((e=>{this.on(this.tech_,e,(t=>{this.tech_.playbackRate()===0&&this.tech_.seeking()?this.queuedCallbacks_.push({callback:this[`handleTech${bt[e]}_`].bind(this),event:t}):this[`handleTech${bt[e]}_`](t)}))}));this.on(this.tech_,"loadstart",(e=>this.handleTechLoadStart_(e)));this.on(this.tech_,"sourceset",(e=>this.handleTechSourceset_(e)));this.on(this.tech_,"waiting",(e=>this.handleTechWaiting_(e)));this.on(this.tech_,"ended",(e=>this.handleTechEnded_(e)));this.on(this.tech_,"seeking",(e=>this.handleTechSeeking_(e)));this.on(this.tech_,"play",(e=>this.handleTechPlay_(e)));this.on(this.tech_,"pause",(e=>this.handleTechPause_(e)));this.on(this.tech_,"durationchange",(e=>this.handleTechDurationChange_(e)));this.on(this.tech_,"fullscreenchange",((e,t)=>this.handleTechFullscreenChange_(e,t)));this.on(this.tech_,"fullscreenerror",((e,t)=>this.handleTechFullscreenError_(e,t)));this.on(this.tech_,"enterpictureinpicture",(e=>this.handleTechEnterPictureInPicture_(e)));this.on(this.tech_,"leavepictureinpicture",(e=>this.handleTechLeavePictureInPicture_(e)));this.on(this.tech_,"error",(e=>this.handleTechError_(e)));this.on(this.tech_,"posterchange",(e=>this.handleTechPosterChange_(e)));this.on(this.tech_,"textdata",(e=>this.handleTechTextData_(e)));this.on(this.tech_,"ratechange",(e=>this.handleTechRateChange_(e)));this.on(this.tech_,"loadedmetadata",this.boundUpdateStyleEl_);this.usingNativeControls(this.techGet_("controls"));this.controls()&&!this.usingNativeControls()&&this.addTechControlsListeners_();this.tech_.el().parentNode===this.el()||s==="Html5"&&this.tag||prependTo(this.tech_.el(),this.el());if(this.tag){this.tag.player=null;this.tag=null}}unloadTech_(){Fe.names.forEach((e=>{const t=Fe[e];this[t.privateName]=this[t.getterName]()}));this.textTracksJson_=Le.textTracksToJson(this.tech_);this.isReady_=false;this.tech_.dispose();this.tech_=false;if(this.isPosterFromTech_){this.poster_="";this.trigger("posterchange")}this.isPosterFromTech_=false}
/**
   * Return a reference to the current {@link Tech}.
   * It will print a warning by default about the danger of using the tech directly
   * but any argument that is passed in will silence the warning.
   *
   * @param {*} [safety]
   *        Anything passed in to silence the warning
   *
   * @return {Tech}
   *         The Tech
   */tech(e){e===void 0&&B.warn("Using the tech directly can be dangerous. I hope you know what you're doing.\nSee https://github.com/videojs/video.js/issues/2617 for more info.\n");return this.tech_}
/**
   * An object that contains Video.js version.
   *
   * @typedef {Object} PlayerVersion
   *
   * @property {string} 'video.js' - Video.js version
   */version(){return{"video.js":L}}addTechControlsListeners_(){this.removeTechControlsListeners_();this.on(this.tech_,"click",this.boundHandleTechClick_);this.on(this.tech_,"dblclick",this.boundHandleTechDoubleClick_);this.on(this.tech_,"touchstart",this.boundHandleTechTouchStart_);this.on(this.tech_,"touchmove",this.boundHandleTechTouchMove_);this.on(this.tech_,"touchend",this.boundHandleTechTouchEnd_);this.on(this.tech_,"tap",this.boundHandleTechTap_)}removeTechControlsListeners_(){this.off(this.tech_,"tap",this.boundHandleTechTap_);this.off(this.tech_,"touchstart",this.boundHandleTechTouchStart_);this.off(this.tech_,"touchmove",this.boundHandleTechTouchMove_);this.off(this.tech_,"touchend",this.boundHandleTechTouchEnd_);this.off(this.tech_,"click",this.boundHandleTechClick_);this.off(this.tech_,"dblclick",this.boundHandleTechDoubleClick_)}handleTechReady_(){this.triggerReady();this.cache_.volume&&this.techCall_("setVolume",this.cache_.volume);this.handleTechPosterChange_();this.handleTechDurationChange_()}handleTechLoadStart_(){this.removeClass("vjs-ended","vjs-seeking");this.error(null);this.handleTechDurationChange_();if(this.paused()){this.hasStarted(false);this.trigger("loadstart")}else
/**
       * Fired when the user agent begins looking for media data
       *
       * @event Player#loadstart
       * @type {Event}
       */
this.trigger("loadstart");this.manualAutoplay_(this.autoplay()===true&&this.options_.normalizeAutoplay?"play":this.autoplay())}manualAutoplay_(e){if(!this.tech_||typeof e!=="string")return;const resolveMuted=()=>{const e=this.muted();this.muted(true);const restoreMuted=()=>{this.muted(e)};this.playTerminatedQueue_.push(restoreMuted);const t=this.play();if(isPromise(t))return t.catch((e=>{restoreMuted();throw new Error(`Rejection at manualAutoplay. Restoring muted value. ${e||""}`)}))};let t;if(e!=="any"||this.muted())t=e!=="muted"||this.muted()?this.play():resolveMuted();else{t=this.play();isPromise(t)&&(t=t.catch(resolveMuted))}return isPromise(t)?t.then((()=>{this.trigger({type:"autoplay-success",autoplay:e})})).catch((()=>{this.trigger({type:"autoplay-failure",autoplay:e})})):void 0}
/**
   * Update the internal source caches so that we return the correct source from
   * `src()`, `currentSource()`, and `currentSources()`.
   *
   * > Note: `currentSources` will not be updated if the source that is passed in exists
   *         in the current `currentSources` cache.
   *
   *
   * @param {Tech~SourceObject} srcObj
   *        A string or object source to update our caches to.
   */updateSourceCaches_(e=""){let t=e;let s="";if(typeof t!=="string"){t=e.src;s=e.type}this.cache_.source=this.cache_.source||{};this.cache_.sources=this.cache_.sources||[];t&&!s&&(s=findMimetype(this,t));this.cache_.source=merge$1({},e,{src:t,type:s});const i=this.cache_.sources.filter((e=>e.src&&e.src===t));const n=[];const r=this.$$("source");const a=[];for(let e=0;e<r.length;e++){const s=getAttributes(r[e]);n.push(s);s.src&&s.src===t&&a.push(s.src)}a.length&&!i.length?this.cache_.sources=n:i.length||(this.cache_.sources=[this.cache_.source]);this.cache_.src=t}
/**
   * *EXPERIMENTAL* Fired when the source is set or changed on the {@link Tech}
   * causing the media element to reload.
   *
   * It will fire for the initial source and each subsequent source.
   * This event is a custom event from Video.js and is triggered by the {@link Tech}.
   *
   * The event object for this event contains a `src` property that will contain the source
   * that was available when the event was triggered. This is generally only necessary if Video.js
   * is switching techs while the source was being changed.
   *
   * It is also fired when `load` is called on the player (or media element)
   * because the {@link https://html.spec.whatwg.org/multipage/media.html#dom-media-load|specification for `load`}
   * says that the resource selection algorithm needs to be aborted and restarted.
   * In this case, it is very likely that the `src` property will be set to the
   * empty string `""` to indicate we do not know what the source will be but
   * that it is changing.
   *
   * *This event is currently still experimental and may change in minor releases.*
   * __To use this, pass `enableSourceset` option to the player.__
   *
   * @event Player#sourceset
   * @type {Event}
   * @prop {string} src
   *                The source url available when the `sourceset` was triggered.
   *                It will be an empty string if we cannot know what the source is
   *                but know that the source will change.
   */handleTechSourceset_(e){if(!this.changingSrc_){let updateSourceCaches=e=>this.updateSourceCaches_(e);const t=this.currentSource().src;const s=e.src;t&&!/^blob:/.test(t)&&/^blob:/.test(s)&&(!this.lastSource_||this.lastSource_.tech!==s&&this.lastSource_.player!==t)&&(updateSourceCaches=()=>{});updateSourceCaches(s);e.src||this.tech_.any(["sourceset","loadstart"],(e=>{if(e.type==="sourceset")return;const t=this.techGet_("currentSrc");this.lastSource_.tech=t;this.updateSourceCaches_(t)}))}this.lastSource_={player:this.currentSource().src,tech:e.src};this.trigger({src:e.src,type:"sourceset"})}
/**
   * Add/remove the vjs-has-started class
   *
   *
   * @param {boolean} request
   *        - true: adds the class
   *        - false: remove the class
   *
   * @return {boolean}
   *         the boolean value of hasStarted_
   */hasStarted(e){if(e===void 0)return this.hasStarted_;if(e!==this.hasStarted_){this.hasStarted_=e;this.hasStarted_?this.addClass("vjs-has-started"):this.removeClass("vjs-has-started")}}handleTechPlay_(){this.removeClass("vjs-ended","vjs-paused");this.addClass("vjs-playing");this.hasStarted(true);
/**
     * Triggered whenever an {@link Tech#play} event happens. Indicates that
     * playback has started or resumed.
     *
     * @event Player#play
     * @type {Event}
     */this.trigger("play")}handleTechRateChange_(){if(this.tech_.playbackRate()>0&&this.cache_.lastPlaybackRate===0){this.queuedCallbacks_.forEach((e=>e.callback(e.event)));this.queuedCallbacks_=[]}this.cache_.lastPlaybackRate=this.tech_.playbackRate();
/**
     * Fires when the playing speed of the audio/video is changed
     *
     * @event Player#ratechange
     * @type {event}
     */this.trigger("ratechange")}handleTechWaiting_(){this.addClass("vjs-waiting");
/**
     * A readyState change on the DOM element has caused playback to stop.
     *
     * @event Player#waiting
     * @type {Event}
     */this.trigger("waiting");const e=this.currentTime();const timeUpdateListener=()=>{if(e!==this.currentTime()){this.removeClass("vjs-waiting");this.off("timeupdate",timeUpdateListener)}};this.on("timeupdate",timeUpdateListener)}handleTechCanPlay_(){this.removeClass("vjs-waiting");
/**
     * The media has a readyState of HAVE_FUTURE_DATA or greater.
     *
     * @event Player#canplay
     * @type {Event}
     */this.trigger("canplay")}handleTechCanPlayThrough_(){this.removeClass("vjs-waiting");
/**
     * The media has a readyState of HAVE_ENOUGH_DATA or greater. This means that the
     * entire media file can be played without buffering.
     *
     * @event Player#canplaythrough
     * @type {Event}
     */this.trigger("canplaythrough")}handleTechPlaying_(){this.removeClass("vjs-waiting");
/**
     * The media is no longer blocked from playback, and has started playing.
     *
     * @event Player#playing
     * @type {Event}
     */this.trigger("playing")}handleTechSeeking_(){this.addClass("vjs-seeking");
/**
     * Fired whenever the player is jumping to a new time
     *
     * @event Player#seeking
     * @type {Event}
     */this.trigger("seeking")}handleTechSeeked_(){this.removeClass("vjs-seeking","vjs-ended");
/**
     * Fired when the player has finished jumping to a new time
     *
     * @event Player#seeked
     * @type {Event}
     */this.trigger("seeked")}handleTechPause_(){this.removeClass("vjs-playing");this.addClass("vjs-paused");
/**
     * Fired whenever the media has been paused
     *
     * @event Player#pause
     * @type {Event}
     */this.trigger("pause")}handleTechEnded_(){this.addClass("vjs-ended");this.removeClass("vjs-waiting");if(this.options_.loop){this.currentTime(0);this.play()}else this.paused()||this.pause()
/**
     * Fired when the end of the media resource is reached (currentTime == duration)
     *
     * @event Player#ended
     * @type {Event}
     */;this.trigger("ended")}handleTechDurationChange_(){this.duration(this.techGet_("duration"))}
/**
   * Handle a click on the media element to play/pause
   *
   * @param {Event} event
   *        the event that caused this function to trigger
   *
   * @listens Tech#click
   * @private
   */handleTechClick_(e){this.controls_&&(this.options_!==void 0&&this.options_.userActions!==void 0&&this.options_.userActions.click!==void 0&&this.options_.userActions.click===false||(this.options_!==void 0&&this.options_.userActions!==void 0&&typeof this.options_.userActions.click==="function"?this.options_.userActions.click.call(this,e):this.paused()?silencePromise(this.play()):this.pause()))}
/**
   * Handle a double-click on the media element to enter/exit fullscreen,
   * or exit documentPictureInPicture mode
   *
   * @param {Event} event
   *        the event that caused this function to trigger
   *
   * @listens Tech#dblclick
   * @private
   */handleTechDoubleClick_(e){if(!this.controls_)return;const s=Array.prototype.some.call(this.$$(".vjs-control-bar, .vjs-modal-dialog"),(t=>t.contains(e.target)));s||this.options_!==void 0&&this.options_.userActions!==void 0&&this.options_.userActions.doubleClick!==void 0&&this.options_.userActions.doubleClick===false||(this.options_!==void 0&&this.options_.userActions!==void 0&&typeof this.options_.userActions.doubleClick==="function"?this.options_.userActions.doubleClick.call(this,e):this.isInPictureInPicture()&&!t.pictureInPictureElement?this.exitPictureInPicture():this.isFullscreen()?this.exitFullscreen():this.requestFullscreen())}handleTechTap_(){this.userActive(!this.userActive())}handleTechTouchStart_(){this.userWasActive=this.userActive()}handleTechTouchMove_(){this.userWasActive&&this.reportUserActivity()}
/**
   * Handle touch to end
   *
   * @param {Event} event
   *        the touchend event that triggered
   *        this function
   *
   * @listens Tech#touchend
   * @private
   */handleTechTouchEnd_(e){e.cancelable&&e.preventDefault()}toggleFullscreenClass_(){this.isFullscreen()?this.addClass("vjs-fullscreen"):this.removeClass("vjs-fullscreen")}documentFullscreenChange_(e){const s=e.target.player;if(s&&s!==this)return;const i=this.el();let n=t[this.fsApi_.fullscreenElement]===i;!n&&i.matches&&(n=i.matches(":"+this.fsApi_.fullscreen));this.isFullscreen(n)}
/**
   * Handle Tech Fullscreen Change
   *
   * @param {Event} event
   *        the fullscreenchange event that triggered this function
   *
   * @param {Object} data
   *        the data that was sent with the event
   *
   * @private
   * @listens Tech#fullscreenchange
   * @fires Player#fullscreenchange
   */handleTechFullscreenChange_(e,t){if(t){if(t.nativeIOSFullscreen){this.addClass("vjs-ios-native-fs");this.tech_.one("webkitendfullscreen",(()=>{this.removeClass("vjs-ios-native-fs")}))}this.isFullscreen(t.isFullscreen)}}handleTechFullscreenError_(e,t){this.trigger("fullscreenerror",t)}togglePictureInPictureClass_(){this.isInPictureInPicture()?this.addClass("vjs-picture-in-picture"):this.removeClass("vjs-picture-in-picture")}
/**
   * Handle Tech Enter Picture-in-Picture.
   *
   * @param {Event} event
   *        the enterpictureinpicture event that triggered this function
   *
   * @private
   * @listens Tech#enterpictureinpicture
   */handleTechEnterPictureInPicture_(e){this.isInPictureInPicture(true)}
/**
   * Handle Tech Leave Picture-in-Picture.
   *
   * @param {Event} event
   *        the leavepictureinpicture event that triggered this function
   *
   * @private
   * @listens Tech#leavepictureinpicture
   */handleTechLeavePictureInPicture_(e){this.isInPictureInPicture(false)}handleTechError_(){const e=this.tech_.error();e&&this.error(e)}handleTechTextData_(){let e=null;arguments.length>1&&(e=arguments[1])
/**
     * Fires when we get a textdata event from tech
     *
     * @event Player#textdata
     * @type {Event}
     */;this.trigger("textdata",e)}getCache(){return this.cache_}resetCache_(){this.cache_={currentTime:0,initTime:0,inactivityTimeout:this.options_.inactivityTimeout,duration:NaN,lastVolume:1,lastPlaybackRate:this.defaultPlaybackRate(),media:null,src:"",source:{},sources:[],playbackRates:[],volume:1}}
/**
   * Pass values to the playback tech
   *
   * @param {string} [method]
   *        the method to call
   *
   * @param {Object} [arg]
   *        the argument to pass
   *
   * @private
   */techCall_(e,t){this.ready((function(){if(e in Ve)return set(this.middleware_,this.tech_,e,t);if(e in ze)return mediate(this.middleware_,this.tech_,e,t);try{this.tech_&&this.tech_[e](t)}catch(e){B(e);throw e}}),true)}
/**
   * Mediate attempt to call playback tech method
   * and return the value of the method called.
   *
   * @param {string} method
   *        Tech method
   *
   * @return {*}
   *         Value returned by the tech method called, undefined if tech
   *         is not ready or tech method is not present
   *
   * @private
   */techGet_(e){if(this.tech_&&this.tech_.isReady_){if(e in qe)return get(this.middleware_,this.tech_,e);if(e in ze)return mediate(this.middleware_,this.tech_,e);try{return this.tech_[e]()}catch(t){if(this.tech_[e]===void 0){B(`Video.js: ${e} method not defined for ${this.techName_} playback technology.`,t);throw t}if(t.name==="TypeError"){B(`Video.js: ${e} unavailable on ${this.techName_} playback technology element.`,t);this.tech_.isReady_=false;throw t}B(t);throw t}}}play(){return new Promise((e=>{this.play_(e)}))}
/**
   * The actual logic for play, takes a callback that will be resolved on the
   * return value of play. This allows us to resolve to the play promise if there
   * is one on modern browsers.
   *
   * @private
   * @param {Function} [callback]
   *        The callback that should be called when the techs play is actually called
   */play_(e=silencePromise){this.playCallbacks_.push(e);const t=Boolean(!this.changingSrc_&&(this.src()||this.currentSrc()));const s=Boolean(de||le);if(this.waitToPlay_){this.off(["ready","loadstart"],this.waitToPlay_);this.waitToPlay_=null}if(!this.isReady_||!t){this.waitToPlay_=e=>{this.play_()};this.one(["ready","loadstart"],this.waitToPlay_);!t&&s&&this.load();return}const i=this.techGet_("play");const n=s&&this.hasClass("vjs-ended");n&&this.resetProgressBar_();i===null?this.runPlayTerminatedQueue_():this.runPlayCallbacks_(i)}runPlayTerminatedQueue_(){const e=this.playTerminatedQueue_.slice(0);this.playTerminatedQueue_=[];e.forEach((function(e){e()}))}
/**
   * When a callback to play is delayed we have to run these
   * callbacks when play is actually called on the tech. This function
   * runs the callbacks that were delayed and accepts the return value
   * from the tech.
   *
   * @param {undefined|Promise} val
   *        The return value from the tech.
   */runPlayCallbacks_(e){const t=this.playCallbacks_.slice(0);this.playCallbacks_=[];this.playTerminatedQueue_=[];t.forEach((function(t){t(e)}))}pause(){this.techCall_("pause")}paused(){return this.techGet_("paused")!==false}played(){return this.techGet_("played")||createTimeRanges$1(0,0)}
/**
   * Sets or returns whether or not the user is "scrubbing". Scrubbing is
   * when the user has clicked the progress bar handle and is
   * dragging it along the progress bar.
   *
   * @param {boolean} [isScrubbing]
   *        whether the user is or is not scrubbing
   *
   * @return {boolean|undefined}
   *         - The value of scrubbing when getting
   *         - Nothing when setting
   */scrubbing(e){if(typeof e==="undefined")return this.scrubbing_;this.scrubbing_=!!e;this.techCall_("setScrubbing",this.scrubbing_);e?this.addClass("vjs-scrubbing"):this.removeClass("vjs-scrubbing")}
/**
   * Get or set the current time (in seconds)
   *
   * @param {number|string} [seconds]
   *        The time to seek to in seconds
   *
   * @return {number|undefined}
   *         - the current time in seconds when getting
   *         - Nothing when setting
   */currentTime(e){if(e===void 0){this.cache_.currentTime=this.techGet_("currentTime")||0;return this.cache_.currentTime}e<0&&(e=0);if(this.isReady_&&!this.changingSrc_&&this.tech_&&this.tech_.isReady_){this.techCall_("setCurrentTime",e);this.cache_.initTime=0;isFinite(e)&&(this.cache_.currentTime=Number(e))}else{this.cache_.initTime=e;this.off("canplay",this.boundApplyInitTime_);this.one("canplay",this.boundApplyInitTime_)}}applyInitTime_(){this.currentTime(this.cache_.initTime)}
/**
   * Normally gets the length in time of the video in seconds;
   * in all but the rarest use cases an argument will NOT be passed to the method
   *
   * > **NOTE**: The video must have started loading before the duration can be
   * known, and depending on preload behaviour may not be known until the video starts
   * playing.
   *
   * @fires Player#durationchange
   *
   * @param {number} [seconds]
   *        The duration of the video to set in seconds
   *
   * @return {number|undefined}
   *         - The duration of the video in seconds when getting
   *         - Nothing when setting
   */duration(e){if(e===void 0)return this.cache_.duration!==void 0?this.cache_.duration:NaN;e=parseFloat(e);e<0&&(e=Infinity);if(e!==this.cache_.duration){this.cache_.duration=e;e===Infinity?this.addClass("vjs-live"):this.removeClass("vjs-live");isNaN(e)||
/**
         * @event Player#durationchange
         * @type {Event}
         */
this.trigger("durationchange")}}remainingTime(){return this.duration()-this.currentTime()}remainingTimeDisplay(){return Math.floor(this.duration())-Math.floor(this.currentTime())}buffered(){let e=this.techGet_("buffered");e&&e.length||(e=createTimeRanges$1(0,0));return e}seekable(){let e=this.techGet_("seekable");e&&e.length||(e=createTimeRanges$1(0,0));return e}seeking(){return this.techGet_("seeking")}ended(){return this.techGet_("ended")}networkState(){return this.techGet_("networkState")}readyState(){return this.techGet_("readyState")}bufferedPercent(){return bufferedPercent(this.buffered(),this.duration())}bufferedEnd(){const e=this.buffered();const t=this.duration();let s=e.end(e.length-1);s>t&&(s=t);return s}
/**
   * Get or set the current volume of the media
   *
   * @param  {number} [percentAsDecimal]
   *         The new volume as a decimal percent:
   *         - 0 is muted/0%/off
   *         - 1.0 is 100%/full
   *         - 0.5 is half volume or 50%
   *
   * @return {number|undefined}
   *         The current volume as a percent when getting
   */volume(e){let t;if(e===void 0){t=parseFloat(this.techGet_("volume"));return isNaN(t)?1:t}t=Math.max(0,Math.min(1,e));this.cache_.volume=t;this.techCall_("setVolume",t);t>0&&this.lastVolume_(t)}
/**
   * Get the current muted state, or turn mute on or off
   *
   * @param {boolean} [muted]
   *        - true to mute
   *        - false to unmute
   *
   * @return {boolean|undefined}
   *         - true if mute is on and getting
   *         - false if mute is off and getting
   *         - nothing if setting
   */muted(e){if(e===void 0)return this.techGet_("muted")||false;this.techCall_("setMuted",e)}
/**
   * Get the current defaultMuted state, or turn defaultMuted on or off. defaultMuted
   * indicates the state of muted on initial playback.
   *
   * ```js
   *   var myPlayer = videojs('some-player-id');
   *
   *   myPlayer.src("http://www.example.com/path/to/video.mp4");
   *
   *   // get, should be false
   *   console.log(myPlayer.defaultMuted());
   *   // set to true
   *   myPlayer.defaultMuted(true);
   *   // get should be true
   *   console.log(myPlayer.defaultMuted());
   * ```
   *
   * @param {boolean} [defaultMuted]
   *        - true to mute
   *        - false to unmute
   *
   * @return {boolean|undefined}
   *         - true if defaultMuted is on and getting
   *         - false if defaultMuted is off and getting
   *         - Nothing when setting
   */defaultMuted(e){e!==void 0&&this.techCall_("setDefaultMuted",e);return this.techGet_("defaultMuted")||false}
/**
   * Get the last volume, or set it
   *
   * @param  {number} [percentAsDecimal]
   *         The new last volume as a decimal percent:
   *         - 0 is muted/0%/off
   *         - 1.0 is 100%/full
   *         - 0.5 is half volume or 50%
   *
   * @return {number|undefined}
   *         - The current value of lastVolume as a percent when getting
   *         - Nothing when setting
   *
   * @private
   */lastVolume_(e){if(e===void 0||e===0)return this.cache_.lastVolume;this.cache_.lastVolume=e}supportsFullScreen(){return this.techGet_("supportsFullScreen")||false}
/**
   * Check if the player is in fullscreen mode or tell the player that it
   * is or is not in fullscreen mode.
   *
   * > NOTE: As of the latest HTML5 spec, isFullscreen is no longer an official
   * property and instead document.fullscreenElement is used. But isFullscreen is
   * still a valuable property for internal player workings.
   *
   * @param  {boolean} [isFS]
   *         Set the players current fullscreen state
   *
   * @return {boolean|undefined}
   *         - true if fullscreen is on and getting
   *         - false if fullscreen is off and getting
   *         - Nothing when setting
   */isFullscreen(e){if(e===void 0)return this.isFullscreen_;{const t=this.isFullscreen_;this.isFullscreen_=Boolean(e);this.isFullscreen_!==t&&this.fsApi_.prefixed&&
/**
           * @event Player#fullscreenchange
           * @type {Event}
           */
this.trigger("fullscreenchange");this.toggleFullscreenClass_()}}
/**
   * Increase the size of the video to full screen
   * In some browsers, full screen is not supported natively, so it enters
   * "full window mode", where the video fills the browser window.
   * In browsers and devices that support native full screen, sometimes the
   * browser's default controls will be shown, and not the Video.js custom skin.
   * This includes most mobile devices (iOS, Android) and older versions of
   * Safari.
   *
   * @param  {Object} [fullscreenOptions]
   *         Override the player fullscreen options
   *
   * @fires Player#fullscreenchange
   */requestFullscreen(e){this.isInPictureInPicture()&&this.exitPictureInPicture();const t=this;return new Promise(((s,i)=>{function offHandler(){t.off("fullscreenerror",errorHandler);t.off("fullscreenchange",changeHandler)}function changeHandler(){offHandler();s()}function errorHandler(e,t){offHandler();i(t)}t.one("fullscreenchange",changeHandler);t.one("fullscreenerror",errorHandler);const n=t.requestFullscreenHelper_(e);if(n){n.then(offHandler,offHandler);n.then(s,i)}}))}requestFullscreenHelper_(e){let t;if(!this.fsApi_.prefixed){t=this.options_.fullscreen&&this.options_.fullscreen.options||{};e!==void 0&&(t=e)}if(this.fsApi_.requestFullscreen){const e=this.el_[this.fsApi_.requestFullscreen](t);e&&e.then((()=>this.isFullscreen(true)),(()=>this.isFullscreen(false)));return e}this.tech_.supportsFullScreen()&&!this.options_.preferFullWindow===true?this.techCall_("enterFullScreen"):this.enterFullWindow()}exitFullscreen(){const e=this;return new Promise(((t,s)=>{function offHandler(){e.off("fullscreenerror",errorHandler);e.off("fullscreenchange",changeHandler)}function changeHandler(){offHandler();t()}function errorHandler(e,t){offHandler();s(t)}e.one("fullscreenchange",changeHandler);e.one("fullscreenerror",errorHandler);const i=e.exitFullscreenHelper_();if(i){i.then(offHandler,offHandler);i.then(t,s)}}))}exitFullscreenHelper_(){if(this.fsApi_.requestFullscreen){const e=t[this.fsApi_.exitFullscreen]();e&&silencePromise(e.then((()=>this.isFullscreen(false))));return e}this.tech_.supportsFullScreen()&&!this.options_.preferFullWindow===true?this.techCall_("exitFullScreen"):this.exitFullWindow()}enterFullWindow(){this.isFullscreen(true);this.isFullWindow=true;this.docOrigOverflow=t.documentElement.style.overflow;on(t,"keydown",this.boundFullWindowOnEscKey_);t.documentElement.style.overflow="hidden";addClass(t.body,"vjs-full-window");
/**
     * @event Player#enterFullWindow
     * @type {Event}
     */this.trigger("enterFullWindow")}
/**
   * Check for call to either exit full window or
   * full screen on ESC key
   *
   * @param {string} event
   *        Event to check for key press
   */fullWindowOnEscKey(e){e.key==="Escape"&&this.isFullscreen()===true&&(this.isFullWindow?this.exitFullWindow():this.exitFullscreen())}exitFullWindow(){this.isFullscreen(false);this.isFullWindow=false;off(t,"keydown",this.boundFullWindowOnEscKey_);t.documentElement.style.overflow=this.docOrigOverflow;removeClass(t.body,"vjs-full-window");
/**
     * @event Player#exitFullWindow
     * @type {Event}
     */this.trigger("exitFullWindow")}
/**
   * Get or set disable Picture-in-Picture mode.
   *
   * @param {boolean} [value]
   *                  - true will disable Picture-in-Picture mode
   *                  - false will enable Picture-in-Picture mode
   */disablePictureInPicture(e){if(e===void 0)return this.techGet_("disablePictureInPicture");this.techCall_("setDisablePictureInPicture",e);this.options_.disablePictureInPicture=e;this.trigger("disablepictureinpicturechanged")}
/**
   * Check if the player is in Picture-in-Picture mode or tell the player that it
   * is or is not in Picture-in-Picture mode.
   *
   * @param  {boolean} [isPiP]
   *         Set the players current Picture-in-Picture state
   *
   * @return {boolean|undefined}
   *         - true if Picture-in-Picture is on and getting
   *         - false if Picture-in-Picture is off and getting
   *         - nothing if setting
   */isInPictureInPicture(e){if(e===void 0)return!!this.isInPictureInPicture_;this.isInPictureInPicture_=!!e;this.togglePictureInPictureClass_()}requestPictureInPicture(){if(this.options_.enableDocumentPictureInPicture&&e.documentPictureInPicture){const s=t.createElement(this.el().tagName);s.classList=this.el().classList;s.classList.add("vjs-pip-container");this.posterImage&&s.appendChild(this.posterImage.el().cloneNode(true));this.titleBar&&s.appendChild(this.titleBar.el().cloneNode(true));s.appendChild(createEl("p",{className:"vjs-pip-text"},{},this.localize("Playing in picture-in-picture")));return e.documentPictureInPicture.requestWindow({width:this.videoWidth(),height:this.videoHeight()}).then((e=>{copyStyleSheetsToWindow(e);this.el_.parentNode.insertBefore(s,this.el_);e.document.body.appendChild(this.el_);e.document.body.classList.add("vjs-pip-window");this.player_.isInPictureInPicture(true);this.player_.trigger({type:"enterpictureinpicture",pipWindow:e});e.addEventListener("pagehide",(e=>{const t=e.target.querySelector(".video-js");s.parentNode.replaceChild(t,s);this.player_.isInPictureInPicture(false);this.player_.trigger("leavepictureinpicture")}));return e}))}return"pictureInPictureEnabled"in t&&this.disablePictureInPicture()===false?this.techGet_("requestPictureInPicture"):Promise.reject("No PiP mode is available")}exitPictureInPicture(){if(e.documentPictureInPicture&&e.documentPictureInPicture.window){e.documentPictureInPicture.window.close();return Promise.resolve()}if("pictureInPictureEnabled"in t)
/**
       * This event fires when the player leaves picture in picture mode
       *
       * @event Player#leavepictureinpicture
       * @type {Event}
       */
return t.exitPictureInPicture()}
/**
   * Called when this Player has focus and a key gets pressed down, or when
   * any Component of this player receives a key press that it doesn't handle.
   * This allows player-wide hotkeys (either as defined below, or optionally
   * by an external function).
   *
   * @param {KeyboardEvent} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */handleKeyDown(e){const{userActions:t}=this.options_;if(!t||!t.hotkeys)return;const excludeElement=e=>{const t=e.tagName.toLowerCase();if(e.isContentEditable)return true;const s=["button","checkbox","hidden","radio","reset","submit"];if(t==="input")return s.indexOf(e.type)===-1;const i=["textarea"];return i.indexOf(t)!==-1};excludeElement(this.el_.ownerDocument.activeElement)||(typeof t.hotkeys==="function"?t.hotkeys.call(this,e):this.handleHotkeys(e))}
/**
   * Called when this Player receives a hotkey keydown event.
   * Supported player-wide hotkeys are:
   *
   *   f          - toggle fullscreen
   *   m          - toggle mute
   *   k or Space - toggle play/pause
   *
   * @param {Event} event
   *        The `keydown` event that caused this function to be called.
   */handleHotkeys(e){const s=this.options_.userActions?this.options_.userActions.hotkeys:{};const{fullscreenKey:i=(t=>e.key.toLowerCase()==="f"),muteKey:n=(t=>e.key.toLowerCase()==="m"),playPauseKey:r=(t=>e.key.toLowerCase()==="k"||e.key.toLowerCase()===" ")}=s;if(i.call(this,e)){e.preventDefault();e.stopPropagation();const s=Component$1.getComponent("FullscreenToggle");t[this.fsApi_.fullscreenEnabled]!==false&&s.prototype.handleClick.call(this,e)}else if(n.call(this,e)){e.preventDefault();e.stopPropagation();const t=Component$1.getComponent("MuteToggle");t.prototype.handleClick.call(this,e)}else if(r.call(this,e)){e.preventDefault();e.stopPropagation();const t=Component$1.getComponent("PlayToggle");t.prototype.handleClick.call(this,e)}}
/**
   * Check whether the player can play a given mimetype
   *
   * @see https://www.w3.org/TR/2011/WD-html5-20110113/video.html#dom-navigator-canplaytype
   *
   * @param {string} type
   *        The mimetype to check
   *
   * @return {string}
   *         'probably', 'maybe', or '' (empty string)
   */canPlayType(e){let t;for(let s=0,i=this.options_.techOrder;s<i.length;s++){const n=i[s];let r=Tech.getTech(n);r||(r=Component$1.getComponent(n));if(r){if(r.isSupported()){t=r.canPlayType(e);if(t)return t}}else B.error(`The "${n}" tech is undefined. Skipped browser support check for that tech.`)}return""}
/**
   * Select source based on tech-order or source-order
   * Uses source-order selection if `options.sourceOrder` is truthy. Otherwise,
   * defaults to tech-order selection
   *
   * @param {Array} sources
   *        The sources for a media asset
   *
   * @return {Object|boolean}
   *         Object of source and tech order or false
   */selectSource(e){const t=this.options_.techOrder.map((e=>[e,Tech.getTech(e)])).filter((([e,t])=>{if(t)return t.isSupported();B.error(`The "${e}" tech is undefined. Skipped browser support check for that tech.`);return false}));const findFirstPassingTechSourcePair=function(e,t,s){let i;e.some((e=>t.some((t=>{i=s(e,t);if(i)return true}))));return i};let s;const flip=e=>(t,s)=>e(s,t);const finder=([e,t],s)=>{if(t.canPlaySource(s,this.options_[e.toLowerCase()]))return{source:s,tech:e}};s=this.options_.sourceOrder?findFirstPassingTechSourcePair(e,t,flip(finder)):findFirstPassingTechSourcePair(t,e,finder);return s||false}
/**
   * Executes source setting and getting logic
   *
   * @param {Tech~SourceObject|Tech~SourceObject[]|string} [source]
   *        A SourceObject, an array of SourceObjects, or a string referencing
   *        a URL to a media source. It is _highly recommended_ that an object
   *        or array of objects is used here, so that source selection
   *        algorithms can take the `type` into account.
   *
   *        If not provided, this method acts as a getter.
   * @param {boolean} [isRetry]
   *        Indicates whether this is being called internally as a result of a retry
   *
   * @return {string|undefined}
   *         If the `source` argument is missing, returns the current source
   *         URL. Otherwise, returns nothing/undefined.
   */handleSrc_(e,t){if(typeof e==="undefined")return this.cache_.src||"";this.resetRetryOnError_&&this.resetRetryOnError_();const s=filterSource(e);if(s.length){this.changingSrc_=true;t||(this.cache_.sources=s);this.updateSourceCaches_(s[0]);setSource(this,s[0],((e,i)=>{this.middleware_=i;t||(this.cache_.sources=s);this.updateSourceCaches_(e);const n=this.src_(e);if(n){if(s.length>1)return this.handleSrc_(s.slice(1));this.changingSrc_=false;this.setTimeout((function(){this.error({code:4,message:this.options_.notSupportedMessage})}),0);this.triggerReady()}else setTech(i,this.tech_)}));if(s.length>1){const retry=()=>{this.error(null);this.handleSrc_(s.slice(1),true)};const stopListeningForErrors=()=>{this.off("error",retry)};this.one("error",retry);this.one("playing",stopListeningForErrors);this.resetRetryOnError_=()=>{this.off("error",retry);this.off("playing",stopListeningForErrors)}}}else this.setTimeout((function(){this.error({code:4,message:this.options_.notSupportedMessage})}),0)}
/**
   * Get or set the video source.
   *
   * @param {Tech~SourceObject|Tech~SourceObject[]|string} [source]
   *        A SourceObject, an array of SourceObjects, or a string referencing
   *        a URL to a media source. It is _highly recommended_ that an object
   *        or array of objects is used here, so that source selection
   *        algorithms can take the `type` into account.
   *
   *        If not provided, this method acts as a getter.
   *
   * @return {string|undefined}
   *         If the `source` argument is missing, returns the current source
   *         URL. Otherwise, returns nothing/undefined.
   */src(e){return this.handleSrc_(e,false)}
/**
   * Set the source object on the tech, returns a boolean that indicates whether
   * there is a tech that can play the source or not
   *
   * @param {Tech~SourceObject} source
   *        The source object to set on the Tech
   *
   * @return {boolean}
   *         - True if there is no Tech to playback this source
   *         - False otherwise
   *
   * @private
   */src_(e){const t=this.selectSource([e]);if(!t)return true;if(!titleCaseEquals(t.tech,this.techName_)){this.changingSrc_=true;this.loadTech_(t.tech,t.source);this.tech_.ready((()=>{this.changingSrc_=false}));return false}this.ready((function(){this.tech_.constructor.prototype.hasOwnProperty("setSource")?this.techCall_("setSource",e):this.techCall_("src",e.src);this.changingSrc_=false}),true);return false}
/**
   * Add a <source> element to the <video> element.
   *
   * @param {string} srcUrl
   *        The URL of the video source.
   *
   * @param {string} [mimeType]
   *        The MIME type of the video source. Optional but recommended.
   *
   * @return {boolean}
   *         Returns true if the source element was successfully added, false otherwise.
   */addSourceElement(e,t){return!!this.tech_&&this.tech_.addSourceElement(e,t)}
/**
   * Remove a <source> element from the <video> element by its URL.
   *
   * @param {string} srcUrl
   *        The URL of the source to remove.
   *
   * @return {boolean}
   *         Returns true if the source element was successfully removed, false otherwise.
   */removeSourceElement(e){return!!this.tech_&&this.tech_.removeSourceElement(e)}load(){this.tech_&&this.tech_.vhs?this.src(this.currentSource()):this.techCall_("load")}reset(){if(this.paused())this.doReset_();else{const e=this.play();silencePromise(e.then((()=>this.doReset_())))}}doReset_(){this.tech_&&this.tech_.clearTracks("text");this.removeClass("vjs-playing");this.addClass("vjs-paused");this.resetCache_();this.poster("");this.loadTech_(this.options_.techOrder[0],null);this.techCall_("reset");this.resetControlBarUI_();this.error(null);this.titleBar&&this.titleBar.update({title:void 0,description:void 0});isEvented(this)&&this.trigger("playerreset")}resetControlBarUI_(){this.resetProgressBar_();this.resetPlaybackRate_();this.resetVolumeBar_()}resetProgressBar_(){this.currentTime(0);const{currentTimeDisplay:e,durationDisplay:t,progressControl:s,remainingTimeDisplay:i}=this.controlBar||{};const{seekBar:n}=s||{};e&&e.updateContent();t&&t.updateContent();i&&i.updateContent();if(n){n.update();n.loadProgressBar&&n.loadProgressBar.update()}}resetPlaybackRate_(){this.playbackRate(this.defaultPlaybackRate());this.handleTechRateChange_()}resetVolumeBar_(){this.volume(1);this.trigger("volumechange")}currentSources(){const e=this.currentSource();const t=[];Object.keys(e).length!==0&&t.push(e);return this.cache_.sources||t}currentSource(){return this.cache_.source||{}}currentSrc(){return this.currentSource()&&this.currentSource().src||""}currentType(){return this.currentSource()&&this.currentSource().type||""}
/**
   * Get or set the preload attribute
   *
   * @param {'none'|'auto'|'metadata'} [value]
   *        Preload mode to pass to tech
   *
   * @return {string|undefined}
   *         - The preload attribute value when getting
   *         - Nothing when setting
   */preload(e){if(e===void 0)return this.techGet_("preload");this.techCall_("setPreload",e);this.options_.preload=e}
/**
   * Get or set the autoplay option. When this is a boolean it will
   * modify the attribute on the tech. When this is a string the attribute on
   * the tech will be removed and `Player` will handle autoplay on loadstarts.
   *
   * @param {boolean|'play'|'muted'|'any'} [value]
   *        - true: autoplay using the browser behavior
   *        - false: do not autoplay
   *        - 'play': call play() on every loadstart
   *        - 'muted': call muted() then play() on every loadstart
   *        - 'any': call play() on every loadstart. if that fails call muted() then play().
   *        - *: values other than those listed here will be set `autoplay` to true
   *
   * @return {boolean|string|undefined}
   *         - The current value of autoplay when getting
   *         - Nothing when setting
   */autoplay(e){if(e===void 0)return this.options_.autoplay||false;let t;if(typeof e==="string"&&/(any|play|muted)/.test(e)||e===true&&this.options_.normalizeAutoplay){this.options_.autoplay=e;this.manualAutoplay_(typeof e==="string"?e:"play");t=false}else this.options_.autoplay=!!e;t=typeof t==="undefined"?this.options_.autoplay:t;this.tech_&&this.techCall_("setAutoplay",t)}
/**
   * Set or unset the playsinline attribute.
   * Playsinline tells the browser that non-fullscreen playback is preferred.
   *
   * @param {boolean} [value]
   *        - true means that we should try to play inline by default
   *        - false means that we should use the browser's default playback mode,
   *          which in most cases is inline. iOS Safari is a notable exception
   *          and plays fullscreen by default.
   *
   * @return {string|undefined}
   *         - the current value of playsinline
   *         - Nothing when setting
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/#attr-video-playsinline}
   */playsinline(e){if(e!==void 0){this.techCall_("setPlaysinline",e);this.options_.playsinline=e}return this.techGet_("playsinline")}
/**
   * Get or set the loop attribute on the video element.
   *
   * @param {boolean} [value]
   *        - true means that we should loop the video
   *        - false means that we should not loop the video
   *
   * @return {boolean|undefined}
   *         - The current value of loop when getting
   *         - Nothing when setting
   */loop(e){if(e===void 0)return this.techGet_("loop");this.techCall_("setLoop",e);this.options_.loop=e}
/**
   * Get or set the poster image source url
   *
   * @fires Player#posterchange
   *
   * @param {string} [src]
   *        Poster image source URL
   *
   * @return {string|undefined}
   *         - The current value of poster when getting
   *         - Nothing when setting
   */poster(e){if(e===void 0)return this.poster_;e||(e="");if(e!==this.poster_){this.poster_=e;this.techCall_("setPoster",e);this.isPosterFromTech_=false;
/**
     * This event fires when the poster image is changed on the player.
     *
     * @event Player#posterchange
     * @type {Event}
     */this.trigger("posterchange")}}handleTechPosterChange_(){if((!this.poster_||this.options_.techCanOverridePoster)&&this.tech_&&this.tech_.poster){const e=this.tech_.poster()||"";if(e!==this.poster_){this.poster_=e;this.isPosterFromTech_=true;this.trigger("posterchange")}}}
/**
   * Get or set whether or not the controls are showing.
   *
   * @fires Player#controlsenabled
   *
   * @param {boolean} [bool]
   *        - true to turn controls on
   *        - false to turn controls off
   *
   * @return {boolean|undefined}
   *         - The current value of controls when getting
   *         - Nothing when setting
   */controls(e){if(e===void 0)return!!this.controls_;e=!!e;if(this.controls_!==e){this.controls_=e;this.usingNativeControls()&&this.techCall_("setControls",e);if(this.controls_){this.removeClass("vjs-controls-disabled");this.addClass("vjs-controls-enabled");
/**
       * @event Player#controlsenabled
       * @type {Event}
       */this.trigger("controlsenabled");this.usingNativeControls()||this.addTechControlsListeners_()}else{this.removeClass("vjs-controls-enabled");this.addClass("vjs-controls-disabled");
/**
       * @event Player#controlsdisabled
       * @type {Event}
       */this.trigger("controlsdisabled");this.usingNativeControls()||this.removeTechControlsListeners_()}}}
/**
   * Toggle native controls on/off. Native controls are the controls built into
   * devices (e.g. default iPhone controls) or other techs
   * (e.g. Vimeo Controls)
   * **This should only be set by the current tech, because only the tech knows
   * if it can support native controls**
   *
   * @fires Player#usingnativecontrols
   * @fires Player#usingcustomcontrols
   *
   * @param {boolean} [bool]
   *        - true to turn native controls on
   *        - false to turn native controls off
   *
   * @return {boolean|undefined}
   *         - The current value of native controls when getting
   *         - Nothing when setting
   */usingNativeControls(e){if(e===void 0)return!!this.usingNativeControls_;e=!!e;if(this.usingNativeControls_!==e){this.usingNativeControls_=e;if(this.usingNativeControls_){this.addClass("vjs-using-native-controls");
/**
       * player is using the native device controls
       *
       * @event Player#usingnativecontrols
       * @type {Event}
       */this.trigger("usingnativecontrols")}else{this.removeClass("vjs-using-native-controls");
/**
       * player is using the custom HTML controls
       *
       * @event Player#usingcustomcontrols
       * @type {Event}
       */this.trigger("usingcustomcontrols")}}}
/**
   * Set or get the current MediaError
   *
   * @fires Player#error
   *
   * @param  {MediaError|string|number} [err]
   *         A MediaError or a string/number to be turned
   *         into a MediaError
   *
   * @return {MediaError|null|undefined}
   *         - The current MediaError when getting (or null)
   *         - Nothing when setting
   */error(e){if(e===void 0)return this.error_||null;hooks("beforeerror").forEach((t=>{const s=t(this,e);isObject(s)&&!Array.isArray(s)||typeof s==="string"||typeof s==="number"||s===null?e=s:this.log.error("please return a value that MediaError expects in beforeerror hooks")}));if(this.options_.suppressNotSupportedError&&e&&e.code===4){const triggerSuppressedError=function(){this.error(e)};this.options_.suppressNotSupportedError=false;this.any(["click","touchstart"],triggerSuppressedError);this.one("loadstart",(function(){this.off(["click","touchstart"],triggerSuppressedError)}))}else if(e!==null){this.error_=new MediaError(e);this.addClass("vjs-error");B.error(`(CODE:${this.error_.code} ${MediaError.errorTypes[this.error_.code]})`,this.error_.message,this.error_);
/**
     * @event Player#error
     * @type {Event}
     */this.trigger("error");hooks("error").forEach((e=>e(this,this.error_)))}else{this.error_=null;this.removeClass("vjs-error");this.errorDisplay&&this.errorDisplay.close()}}
/**
   * Report user activity
   *
   * @param {Object} event
   *        Event object
   */reportUserActivity(e){this.userActivity_=true}
/**
   * Get/set if user is active
   *
   * @fires Player#useractive
   * @fires Player#userinactive
   *
   * @param {boolean} [bool]
   *        - true if the user is active
   *        - false if the user is inactive
   *
   * @return {boolean|undefined}
   *         - The current value of userActive when getting
   *         - Nothing when setting
   */userActive(e){if(e===void 0)return this.userActive_;e=!!e;if(e!==this.userActive_){this.userActive_=e;if(this.userActive_){this.userActivity_=true;this.removeClass("vjs-user-inactive");this.addClass("vjs-user-active");
/**
       * @event Player#useractive
       * @type {Event}
       */this.trigger("useractive")}else{this.tech_&&this.tech_.one("mousemove",(function(e){e.stopPropagation();e.preventDefault()}));this.userActivity_=false;this.removeClass("vjs-user-active");this.addClass("vjs-user-inactive");
/**
     * @event Player#userinactive
     * @type {Event}
     */this.trigger("userinactive")}}}listenForUserActivity_(){let e;let t;let s;const i=bind_(this,this.reportUserActivity);const handleMouseMove=function(e){if(e.screenX!==t||e.screenY!==s){t=e.screenX;s=e.screenY;i()}};const handleMouseDown=function(){i();this.clearInterval(e);e=this.setInterval(i,250)};const handleMouseUpAndMouseLeave=function(t){i();this.clearInterval(e)};this.on("mousedown",handleMouseDown);this.on("mousemove",handleMouseMove);this.on("mouseup",handleMouseUpAndMouseLeave);this.on("mouseleave",handleMouseUpAndMouseLeave);const n=this.getChild("controlBar");if(n&&!le&&!q){n.on("mouseenter",(function(e){this.player().options_.inactivityTimeout!==0&&(this.player().cache_.inactivityTimeout=this.player().options_.inactivityTimeout);this.player().options_.inactivityTimeout=0}));n.on("mouseleave",(function(e){this.player().options_.inactivityTimeout=this.player().cache_.inactivityTimeout}))}this.on("keydown",i);this.on("keyup",i);let r;const activityCheck=function(){if(!this.userActivity_)return;this.userActivity_=false;this.userActive(true);this.clearTimeout(r);const e=this.options_.inactivityTimeout;e<=0||(r=this.setTimeout((function(){this.userActivity_||this.userActive(false)}),e))};this.setInterval(activityCheck,250)}
/**
   * Gets or sets the current playback rate. A playback rate of
   * 1.0 represents normal speed and 0.5 would indicate half-speed
   * playback, for instance.
   *
   * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-media-playbackrate
   *
   * @param {number} [rate]
   *       New playback rate to set.
   *
   * @return {number|undefined}
   *         - The current playback rate when getting or 1.0
   *         - Nothing when setting
   */playbackRate(e){if(e===void 0)return this.tech_&&this.tech_.featuresPlaybackRate?this.cache_.lastPlaybackRate||this.techGet_("playbackRate"):1;this.techCall_("setPlaybackRate",e)}
/**
   * Gets or sets the current default playback rate. A default playback rate of
   * 1.0 represents normal speed and 0.5 would indicate half-speed playback, for instance.
   * defaultPlaybackRate will only represent what the initial playbackRate of a video was, not
   * not the current playbackRate.
   *
   * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-media-defaultplaybackrate
   *
   * @param {number} [rate]
   *       New default playback rate to set.
   *
   * @return {number|undefined}
   *         - The default playback rate when getting or 1.0
   *         - Nothing when setting
   */defaultPlaybackRate(e){return e!==void 0?this.techCall_("setDefaultPlaybackRate",e):this.tech_&&this.tech_.featuresPlaybackRate?this.techGet_("defaultPlaybackRate"):1}
/**
   * Gets or sets the audio flag
   *
   * @param {boolean} [bool]
   *        - true signals that this is an audio player
   *        - false signals that this is not an audio player
   *
   * @return {boolean|undefined}
   *         - The current value of isAudio when getting
   *         - Nothing when setting
   */isAudio(e){if(e===void 0)return!!this.isAudio_;this.isAudio_=!!e}updatePlayerHeightOnAudioOnlyMode_(){const e=this.getChild("ControlBar");if(e&&this.audioOnlyCache_.controlBarHeight!==e.currentHeight()){this.audioOnlyCache_.controlBarHeight=e.currentHeight();this.height(this.audioOnlyCache_.controlBarHeight)}}enableAudioOnlyUI_(){this.addClass("vjs-audio-only-mode");const e=this.children();const t=this.getChild("ControlBar");const s=t&&t.currentHeight();e.forEach((e=>{if(e!==t&&e.el_&&!e.hasClass("vjs-hidden")){e.hide();this.audioOnlyCache_.hiddenChildren.push(e)}}));this.audioOnlyCache_.playerHeight=this.currentHeight();this.audioOnlyCache_.controlBarHeight=s;this.on("playerresize",this.boundUpdatePlayerHeightOnAudioOnlyMode_);this.height(s);this.trigger("audioonlymodechange")}disableAudioOnlyUI_(){this.removeClass("vjs-audio-only-mode");this.off("playerresize",this.boundUpdatePlayerHeightOnAudioOnlyMode_);this.audioOnlyCache_.hiddenChildren.forEach((e=>e.show()));this.height(this.audioOnlyCache_.playerHeight);this.trigger("audioonlymodechange")}
/**
   * Get the current audioOnlyMode state or set audioOnlyMode to true or false.
   *
   * Setting this to `true` will hide all player components except the control bar,
   * as well as control bar components needed only for video.
   *
   * @param {boolean} [value]
   *         The value to set audioOnlyMode to.
   *
   * @return {Promise|boolean}
   *        A Promise is returned when setting the state, and a boolean when getting
   *        the present state
   */audioOnlyMode(e){if(typeof e!=="boolean"||e===this.audioOnlyMode_)return this.audioOnlyMode_;this.audioOnlyMode_=e;if(e){const e=[];this.isInPictureInPicture()&&e.push(this.exitPictureInPicture());this.isFullscreen()&&e.push(this.exitFullscreen());this.audioPosterMode()&&e.push(this.audioPosterMode(false));return Promise.all(e).then((()=>this.enableAudioOnlyUI_()))}return Promise.resolve().then((()=>this.disableAudioOnlyUI_()))}enablePosterModeUI_(){const e=this.tech_&&this.tech_;e.hide();this.addClass("vjs-audio-poster-mode");this.trigger("audiopostermodechange")}disablePosterModeUI_(){const e=this.tech_&&this.tech_;e.show();this.removeClass("vjs-audio-poster-mode");this.trigger("audiopostermodechange")}
/**
   * Get the current audioPosterMode state or set audioPosterMode to true or false
   *
   * @param {boolean} [value]
   *         The value to set audioPosterMode to.
   *
   * @return {Promise|boolean}
   *         A Promise is returned when setting the state, and a boolean when getting
   *        the present state
   */audioPosterMode(e){if(typeof e!=="boolean"||e===this.audioPosterMode_)return this.audioPosterMode_;this.audioPosterMode_=e;if(e){if(this.audioOnlyMode()){const e=this.audioOnlyMode(false);return e.then((()=>{this.enablePosterModeUI_()}))}return Promise.resolve().then((()=>{this.enablePosterModeUI_()}))}return Promise.resolve().then((()=>{this.disablePosterModeUI_()}))}
/**
   * A helper method for adding a {@link TextTrack} to our
   * {@link TextTrackList}.
   *
   * In addition to the W3C settings we allow adding additional info through options.
   *
   * @see http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#dom-media-addtexttrack
   *
   * @param {string} [kind]
   *        the kind of TextTrack you are adding
   *
   * @param {string} [label]
   *        the label to give the TextTrack label
   *
   * @param {string} [language]
   *        the language to set on the TextTrack
   *
   * @return {TextTrack|undefined}
   *         the TextTrack that was added or undefined
   *         if there is no tech
   */addTextTrack(e,t,s){if(this.tech_)return this.tech_.addTextTrack(e,t,s)}
/**
   * Create a remote {@link TextTrack} and an {@link HTMLTrackElement}.
   *
   * @param {Object} options
   *        Options to pass to {@link HTMLTrackElement} during creation. See
   *        {@link HTMLTrackElement} for object properties that you should use.
   *
   * @param {boolean} [manualCleanup=false] if set to true, the TextTrack will not be removed
   *                                        from the TextTrackList and HtmlTrackElementList
   *                                        after a source change
   *
   * @return {HtmlTrackElement}
   *         the HTMLTrackElement that was created and added
   *         to the HtmlTrackElementList and the remote
   *         TextTrackList
   *
   */addRemoteTextTrack(e,t){if(this.tech_)return this.tech_.addRemoteTextTrack(e,t)}
/**
   * Remove a remote {@link TextTrack} from the respective
   * {@link TextTrackList} and {@link HtmlTrackElementList}.
   *
   * @param {Object} track
   *        Remote {@link TextTrack} to remove
   *
   * @return {undefined}
   *         does not return anything
   */removeRemoteTextTrack(e={}){let{track:t}=e;t||(t=e);if(this.tech_)return this.tech_.removeRemoteTextTrack(t)}getVideoPlaybackQuality(){return this.techGet_("getVideoPlaybackQuality")}videoWidth(){return this.tech_&&this.tech_.videoWidth&&this.tech_.videoWidth()||0}videoHeight(){return this.tech_&&this.tech_.videoHeight&&this.tech_.videoHeight()||0}
/**
   * Set or get the player's language code.
   *
   * Changing the language will trigger
   * [languagechange]{@link Player#event:languagechange}
   * which Components can use to update control text.
   * ClickableComponent will update its control text by default on
   * [languagechange]{@link Player#event:languagechange}.
   *
   * @fires Player#languagechange
   *
   * @param {string} [code]
   *        the language code to set the player to
   *
   * @return {string|undefined}
   *         - The current language code when getting
   *         - Nothing when setting
   */language(e){if(e===void 0)return this.language_;if(this.language_!==String(e).toLowerCase()){this.language_=String(e).toLowerCase();isEvented(this)&&
/**
        * fires when the player language change
        *
        * @event Player#languagechange
        * @type {Event}
        */
this.trigger("languagechange")}}languages(){return merge$1(Player.prototype.options_.languages,this.languages_)}toJSON(){const e=merge$1(this.options_);const t=e.tracks;e.tracks=[];for(let s=0;s<t.length;s++){let i=t[s];i=merge$1(i);i.player=void 0;e.tracks[s]=i}return e}
/**
   * Creates a simple modal dialog (an instance of the {@link ModalDialog}
   * component) that immediately overlays the player with arbitrary
   * content and removes itself when closed.
   *
   * @param {string|Function|Element|Array|null} content
   *        Same as {@link ModalDialog#content}'s param of the same name.
   *        The most straight-forward usage is to provide a string or DOM
   *        element.
   *
   * @param {Object} [options]
   *        Extra options which will be passed on to the {@link ModalDialog}.
   *
   * @return {ModalDialog}
   *         the {@link ModalDialog} that was created
   */createModal(e,t){t=t||{};t.content=e||"";const s=new ModalDialog(this,t);this.addChild(s);s.on("dispose",(()=>{this.removeChild(s)}));s.open();return s}updateCurrentBreakpoint_(){if(!this.responsive())return;const e=this.currentBreakpoint();const t=this.currentWidth();for(let s=0;s<St.length;s++){const i=St[s];const n=this.breakpoints_[i];if(t<=n){if(e===i)return;e&&this.removeClass(Ct[e]);this.addClass(Ct[i]);this.breakpoint_=i;break}}}removeCurrentBreakpoint_(){const e=this.currentBreakpointClass();this.breakpoint_="";e&&this.removeClass(e)}
/**
   * Get or set breakpoints on the player.
   *
   * Calling this method with an object or `true` will remove any previous
   * custom breakpoints and start from the defaults again.
   *
   * @param  {Object|boolean} [breakpoints]
   *         If an object is given, it can be used to provide custom
   *         breakpoints. If `true` is given, will set default breakpoints.
   *         If this argument is not given, will simply return the current
   *         breakpoints.
   *
   * @param  {number} [breakpoints.tiny]
   *         The maximum width for the "vjs-layout-tiny" class.
   *
   * @param  {number} [breakpoints.xsmall]
   *         The maximum width for the "vjs-layout-x-small" class.
   *
   * @param  {number} [breakpoints.small]
   *         The maximum width for the "vjs-layout-small" class.
   *
   * @param  {number} [breakpoints.medium]
   *         The maximum width for the "vjs-layout-medium" class.
   *
   * @param  {number} [breakpoints.large]
   *         The maximum width for the "vjs-layout-large" class.
   *
   * @param  {number} [breakpoints.xlarge]
   *         The maximum width for the "vjs-layout-x-large" class.
   *
   * @param  {number} [breakpoints.huge]
   *         The maximum width for the "vjs-layout-huge" class.
   *
   * @return {Object}
   *         An object mapping breakpoint names to maximum width values.
   */breakpoints(e){if(e===void 0)return Object.assign(this.breakpoints_);this.breakpoint_="";this.breakpoints_=Object.assign({},kt,e);this.updateCurrentBreakpoint_();return Object.assign(this.breakpoints_)}
/**
   * Get or set a flag indicating whether or not this player should adjust
   * its UI based on its dimensions.
   *
   * @param  {boolean} [value]
   *         Should be `true` if the player should adjust its UI based on its
   *         dimensions; otherwise, should be `false`.
   *
   * @return {boolean|undefined}
   *         Will be `true` if this player should adjust its UI based on its
   *         dimensions; otherwise, will be `false`.
   *         Nothing if setting
   */responsive(e){if(e===void 0)return this.responsive_;e=Boolean(e);const t=this.responsive_;if(e!==t){this.responsive_=e;if(e){this.on("playerresize",this.boundUpdateCurrentBreakpoint_);this.updateCurrentBreakpoint_()}else{this.off("playerresize",this.boundUpdateCurrentBreakpoint_);this.removeCurrentBreakpoint_()}return e}}currentBreakpoint(){return this.breakpoint_}currentBreakpointClass(){return Ct[this.breakpoint_]||""}
/**
   * An object that describes a single piece of media.
   *
   * Properties that are not part of this type description will be retained; so,
   * this can be viewed as a generic metadata storage mechanism as well.
   *
   * @see      {@link https://wicg.github.io/mediasession/#the-mediametadata-interface}
   * @typedef  {Object} Player~MediaObject
   *
   * @property {string} [album]
   *           Unused, except if this object is passed to the `MediaSession`
   *           API.
   *
   * @property {string} [artist]
   *           Unused, except if this object is passed to the `MediaSession`
   *           API.
   *
   * @property {Object[]} [artwork]
   *           Unused, except if this object is passed to the `MediaSession`
   *           API. If not specified, will be populated via the `poster`, if
   *           available.
   *
   * @property {string} [poster]
   *           URL to an image that will display before playback.
   *
   * @property {Tech~SourceObject|Tech~SourceObject[]|string} [src]
   *           A single source object, an array of source objects, or a string
   *           referencing a URL to a media source. It is _highly recommended_
   *           that an object or array of objects is used here, so that source
   *           selection algorithms can take the `type` into account.
   *
   * @property {string} [title]
   *           Unused, except if this object is passed to the `MediaSession`
   *           API.
   *
   * @property {Object[]} [textTracks]
   *           An array of objects to be used to create text tracks, following
   *           the {@link https://www.w3.org/TR/html50/embedded-content-0.html#the-track-element|native track element format}.
   *           For ease of removal, these will be created as "remote" text
   *           tracks and set to automatically clean up on source changes.
   *
   *           These objects may have properties like `src`, `kind`, `label`,
   *           and `language`, see {@link Tech#createRemoteTextTrack}.
   */
/**
   * Populate the player using a {@link Player~MediaObject|MediaObject}.
   *
   * @param  {Player~MediaObject} media
   *         A media object.
   *
   * @param  {Function} ready
   *         A callback to be called when the player is ready.
   */loadMedia(e,t){if(!e||typeof e!=="object")return;const s=this.crossOrigin();this.reset();this.cache_.media=merge$1(e);const{artist:i,artwork:n,description:r,poster:a,src:o,textTracks:l,title:d}=this.cache_.media;!n&&a&&(this.cache_.media.artwork=[{src:a,type:getMimetype(a)}]);s&&this.crossOrigin(s);o&&this.src(o);a&&this.poster(a);Array.isArray(l)&&l.forEach((e=>this.addRemoteTextTrack(e,false)));this.titleBar&&this.titleBar.update({title:d,description:r||i||""});this.ready(t)}getMedia(){if(!this.cache_.media){const e=this.poster();const t=this.currentSources();const s=Array.prototype.map.call(this.remoteTextTracks(),(e=>({kind:e.kind,label:e.label,language:e.language,src:e.src})));const i={src:t,textTracks:s};if(e){i.poster=e;i.artwork=[{src:i.poster,type:getMimetype(i.poster)}]}return i}return merge$1(this.cache_.media)}
/**
   * Gets tag settings
   *
   * @param {Element} tag
   *        The player tag
   *
   * @return {Object}
   *         An object containing all of the settings
   *         for a player tag
   */static getTagSettings(e){const t={sources:[],tracks:[]};const s=getAttributes(e);const i=s["data-setup"];hasClass(e,"vjs-fill")&&(s.fill=true);hasClass(e,"vjs-fluid")&&(s.fluid=true);if(i!==null)try{Object.assign(s,JSON.parse(i||"{}"))}catch(e){B.error("data-setup",e)}Object.assign(t,s);if(e.hasChildNodes()){const s=e.childNodes;for(let e=0,i=s.length;e<i;e++){const i=s[e];const n=i.nodeName.toLowerCase();n==="source"?t.sources.push(getAttributes(i)):n==="track"&&t.tracks.push(getAttributes(i))}}return t}
/**
   * Set debug mode to enable/disable logs at info level.
   *
   * @param {boolean} enabled
   * @fires Player#debugon
   * @fires Player#debugoff
   * @return {boolean|undefined}
   */debug(e){if(e===void 0)return this.debugEnabled_;if(e){this.trigger("debugon");this.previousLogLevel_=this.log.level;this.log.level("debug");this.debugEnabled_=true}else{this.trigger("debugoff");this.log.level(this.previousLogLevel_);this.previousLogLevel_=void 0;this.debugEnabled_=false}}
/**
   * Set or get current playback rates.
   * Takes an array and updates the playback rates menu with the new items.
   * Pass in an empty array to hide the menu.
   * Values other than arrays are ignored.
   *
   * @fires Player#playbackrateschange
   * @param {number[]} [newRates]
   *                   The new rates that the playback rates menu should update to.
   *                   An empty array will hide the menu
   * @return {number[]} When used as a getter will return the current playback rates
   */playbackRates(e){if(e===void 0)return this.cache_.playbackRates;if(Array.isArray(e)&&e.every((e=>typeof e==="number"))){this.cache_.playbackRates=e;
/**
    * fires when the playback rates in a player are changed
    *
    * @event Player#playbackrateschange
    * @type {Event}
    */this.trigger("playbackrateschange")}}
/**
   * Reports whether or not a player has a plugin available.
   *
   * This does not report whether or not the plugin has ever been initialized
   * on this player. For that, [usingPlugin]{@link Player#usingPlugin}.
   *
   * @method hasPlugin
   * @param  {string}  name
   *         The name of a plugin.
   *
   * @return {boolean}
   *         Whether or not this player has the requested plugin available.
   */
/**
   * Reports whether or not a player is using a plugin by name.
   *
   * For basic plugins, this only reports whether the plugin has _ever_ been
   * initialized on this player.
   *
   * @method Player#usingPlugin
   * @param  {string} name
   *         The name of a plugin.
   *
   * @return {boolean}
   *         Whether or not this player is using the requested plugin.
   */}Fe.names.forEach((function(e){const t=Fe[e];Player.prototype[t.getterName]=function(){if(this.tech_)return this.tech_[t.getterName]();this[t.privateName]=this[t.privateName]||new t.ListClass;return this[t.privateName]}}));
/**
 * Get or set the `Player`'s crossorigin option. For the HTML5 player, this
 * sets the `crossOrigin` property on the `<video>` tag to control the CORS
 * behavior.
 *
 * @see [Video Element Attributes]{@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-crossorigin}
 *
 * @param {string} [value]
 *        The value to set the `Player`'s crossorigin to. If an argument is
 *        given, must be one of `anonymous` or `use-credentials`.
 *
 * @return {string|undefined}
 *         - The current crossorigin value of the `Player` when getting.
 *         - undefined when setting
 */Player.prototype.crossorigin=Player.prototype.crossOrigin;
/**
 * Global enumeration of players.
 *
 * The keys are the player IDs and the values are either the {@link Player}
 * instance or `null` for disposed players.
 *
 * @type {Object}
 */Player.players={};const wt=e.navigator;
/*
 * Player instance options, surfaced using options
 * options = Player.prototype.options_
 * Make changes in options, not here.
 *
 * @type {Object}
 * @private
 */Player.prototype.options_={techOrder:Tech.defaultTechOrder_,html5:{},enableSourceset:true,inactivityTimeout:2e3,playbackRates:[],liveui:false,children:["mediaLoader","posterImage","titleBar","textTrackDisplay","loadingSpinner","bigPlayButton","liveTracker","controlBar","errorDisplay","textTrackSettings","resizeManager"],language:wt&&(wt.languages&&wt.languages[0]||wt.userLanguage||wt.language)||"en",languages:{},notSupportedMessage:"No compatible source was found for this media.",normalizeAutoplay:false,fullscreen:{options:{navigationUI:"hide"}},breakpoints:{},responsive:false,audioOnlyMode:false,audioPosterMode:false,spatialNavigation:{enabled:false,horizontalSeek:false},enableSmoothSeeking:false,disableSeekWhileScrubbingOnMobile:false};Tt.forEach((function(e){Player.prototype[`handleTech${toTitleCase$1(e)}_`]=function(){return this.trigger(e)}}));
/**
 * Fired when the player has initial duration and dimension information
 *
 * @event Player#loadedmetadata
 * @type {Event}
 */
/**
 * Fired when the player has downloaded data at the current playback position
 *
 * @event Player#loadeddata
 * @type {Event}
 */
/**
 * Fired when the current playback position has changed *
 * During playback this is fired every 15-250 milliseconds, depending on the
 * playback technology in use.
 *
 * @event Player#timeupdate
 * @type {Event}
 */
/**
 * Fired when the volume changes
 *
 * @event Player#volumechange
 * @type {Event}
 */Component$1.registerComponent("Player",Player);
/**
 * The base plugin name.
 *
 * @private
 * @constant
 * @type {string}
 */const Et="plugin";
/**
 * The key on which a player's active plugins cache is stored.
 *
 * @private
 * @constant
 * @type     {string}
 */const xt="activePlugins_";
/**
 * Stores registered plugins in a private space.
 *
 * @private
 * @type    {Object}
 */const It={};
/**
 * Reports whether or not a plugin has been registered.
 *
 * @private
 * @param   {string} name
 *          The name of a plugin.
 *
 * @return {boolean}
 *          Whether or not the plugin has been registered.
 */const pluginExists=e=>It.hasOwnProperty(e)
/**
 * Get a single registered plugin by name.
 *
 * @private
 * @param   {string} name
 *          The name of a plugin.
 *
 * @return {typeof Plugin|Function|undefined}
 *          The plugin (or undefined).
 */;const getPlugin=e=>pluginExists(e)?It[e]:void 0
/**
 * Marks a plugin as "active" on a player.
 *
 * Also, ensures that the player has an object for tracking active plugins.
 *
 * @private
 * @param   {Player} player
 *          A Video.js player instance.
 *
 * @param   {string} name
 *          The name of a plugin.
 */;const markPluginAsActive=(e,t)=>{e[xt]=e[xt]||{};e[xt][t]=true};
/**
 * Triggers a pair of plugin setup events.
 *
 * @private
 * @param  {Player} player
 *         A Video.js player instance.
 *
 * @param  {PluginEventHash} hash
 *         A plugin event hash.
 *
 * @param  {boolean} [before]
 *         If true, prefixes the event name with "before". In other words,
 *         use this to trigger "beforepluginsetup" instead of "pluginsetup".
 */const triggerSetupEvent=(e,t,s)=>{const i=(s?"before":"")+"pluginsetup";e.trigger(i,t);e.trigger(i+":"+t.name,t)};
/**
 * Takes a basic plugin function and returns a wrapper function which marks
 * on the player that the plugin has been activated.
 *
 * @private
 * @param   {string} name
 *          The name of the plugin.
 *
 * @param   {Function} plugin
 *          The basic plugin.
 *
 * @return {Function}
 *          A wrapper function for the given plugin.
 */const createBasicPlugin=function(e,t){const basicPluginWrapper=function(){triggerSetupEvent(this,{name:e,plugin:t,instance:null},true);const s=t.apply(this,arguments);markPluginAsActive(this,e);triggerSetupEvent(this,{name:e,plugin:t,instance:s});return s};Object.keys(t).forEach((function(e){basicPluginWrapper[e]=t[e]}));return basicPluginWrapper};
/**
 * Takes a plugin sub-class and returns a factory function for generating
 * instances of it.
 *
 * This factory function will replace itself with an instance of the requested
 * sub-class of Plugin.
 *
 * @private
 * @param   {string} name
 *          The name of the plugin.
 *
 * @param   {Plugin} PluginSubClass
 *          The advanced plugin.
 *
 * @return {Function}
 */const createPluginFactory=(e,t)=>{t.prototype.name=e;return function(...s){triggerSetupEvent(this,{name:e,plugin:t,instance:null},true);const i=new t(...[this,...s]);this[e]=()=>i;triggerSetupEvent(this,i.getEventHash());return i}};class Plugin{
/**
   * Creates an instance of this class.
   *
   * Sub-classes should call `super` to ensure plugins are properly initialized.
   *
   * @param {Player} player
   *        A Video.js player instance.
   */
constructor(e){if(this.constructor===Plugin)throw new Error("Plugin must be sub-classed; not directly instantiated.");this.player=e;this.log||(this.log=this.player.log.createLogger(this.name));evented(this);delete this.trigger;stateful(this,this.constructor.defaultState);markPluginAsActive(e,this.name);this.dispose=this.dispose.bind(this);e.on("dispose",this.dispose)}version(){return this.constructor.VERSION}
/**
   * Each event triggered by plugins includes a hash of additional data with
   * conventional properties.
   *
   * This returns that object or mutates an existing hash.
   *
   * @param   {Object} [hash={}]
   *          An object to be used as event an event hash.
   *
   * @return {PluginEventHash}
   *          An event hash object with provided properties mixed-in.
   */getEventHash(e={}){e.name=this.name;e.plugin=this.constructor;e.instance=this;return e}
/**
   * Triggers an event on the plugin object and overrides
   * {@link module:evented~EventedMixin.trigger|EventedMixin.trigger}.
   *
   * @param   {string|Object} event
   *          An event type or an object with a type property.
   *
   * @param   {Object} [hash={}]
   *          Additional data hash to merge with a
   *          {@link PluginEventHash|PluginEventHash}.
   *
   * @return {boolean}
   *          Whether or not default was prevented.
   */trigger(e,t={}){return trigger(this.eventBusEl_,e,this.getEventHash(t))}
/**
   * Handles "statechanged" events on the plugin. No-op by default, override by
   * subclassing.
   *
   * @abstract
   * @param    {Event} e
   *           An event object provided by a "statechanged" event.
   *
   * @param    {Object} e.changes
   *           An object describing changes that occurred with the "statechanged"
   *           event.
   */handleStateChanged(e){}dispose(){const{name:e,player:t}=this;
/**
     * Signals that a advanced plugin is about to be disposed.
     *
     * @event Plugin#dispose
     * @type  {Event}
     */this.trigger("dispose");this.off();t.off("dispose",this.dispose);t[xt][e]=false;this.player=this.state=null;t[e]=createPluginFactory(e,It[e])}
/**
   * Determines if a plugin is a basic plugin (i.e. not a sub-class of `Plugin`).
   *
   * @param   {string|Function} plugin
   *          If a string, matches the name of a plugin. If a function, will be
   *          tested directly.
   *
   * @return {boolean}
   *          Whether or not a plugin is a basic plugin.
   */static isBasic(e){const t=typeof e==="string"?getPlugin(e):e;return typeof t==="function"&&!Plugin.prototype.isPrototypeOf(t.prototype)}
/**
   * Register a Video.js plugin.
   *
   * @param   {string} name
   *          The name of the plugin to be registered. Must be a string and
   *          must not match an existing plugin or a method on the `Player`
   *          prototype.
   *
   * @param   {typeof Plugin|Function} plugin
   *          A sub-class of `Plugin` or a function for basic plugins.
   *
   * @return {typeof Plugin|Function}
   *          For advanced plugins, a factory function for that plugin. For
   *          basic plugins, a wrapper function that initializes the plugin.
   */static registerPlugin(e,t){if(typeof e!=="string")throw new Error(`Illegal plugin name, "${e}", must be a string, was ${typeof e}.`);if(pluginExists(e))B.warn(`A plugin named "${e}" already exists. You may want to avoid re-registering plugins!`);else if(Player.prototype.hasOwnProperty(e))throw new Error(`Illegal plugin name, "${e}", cannot share a name with an existing player method!`);if(typeof t!=="function")throw new Error(`Illegal plugin for "${e}", must be a function, was ${typeof t}.`);It[e]=t;e!==Et&&(Plugin.isBasic(t)?Player.prototype[e]=createBasicPlugin(e,t):Player.prototype[e]=createPluginFactory(e,t));return t}
/**
   * De-register a Video.js plugin.
   *
   * @param  {string} name
   *         The name of the plugin to be de-registered. Must be a string that
   *         matches an existing plugin.
   *
   * @throws {Error}
   *         If an attempt is made to de-register the base plugin.
   */static deregisterPlugin(e){if(e===Et)throw new Error("Cannot de-register base plugin.");if(pluginExists(e)){delete It[e];delete Player.prototype[e]}}
/**
   * Gets an object containing multiple Video.js plugins.
   *
   * @param   {Array} [names]
   *          If provided, should be an array of plugin names. Defaults to _all_
   *          plugin names.
   *
   * @return {Object|undefined}
   *          An object containing plugin(s) associated with their name(s) or
   *          `undefined` if no matching plugins exist).
   */static getPlugins(e=Object.keys(It)){let t;e.forEach((e=>{const s=getPlugin(e);if(s){t=t||{};t[e]=s}}));return t}
/**
   * Gets a plugin's version, if available
   *
   * @param   {string} name
   *          The name of a plugin.
   *
   * @return {string}
   *          The plugin's version or an empty string.
   */static getPluginVersion(e){const t=getPlugin(e);return t&&t.VERSION||""}}
/**
 * Gets a plugin by name if it exists.
 *
 * @static
 * @method   getPlugin
 * @memberOf Plugin
 * @param    {string} name
 *           The name of a plugin.
 *
 * @returns  {typeof Plugin|Function|undefined}
 *           The plugin (or `undefined`).
 */Plugin.getPlugin=getPlugin;
/**
 * The name of the base plugin class as it is registered.
 *
 * @type {string}
 */Plugin.BASE_PLUGIN_NAME=Et;Plugin.registerPlugin(Et,Plugin);Player.prototype.usingPlugin=function(e){return!!this[xt]&&this[xt][e]===true};Player.prototype.hasPlugin=function(e){return!!pluginExists(e)};
/**
 * Signals that a plugin is about to be set up on a player.
 *
 * @event    Player#beforepluginsetup
 * @type     {PluginEventHash}
 */
/**
 * Signals that a plugin is about to be set up on a player - by name. The name
 * is the name of the plugin.
 *
 * @event    Player#beforepluginsetup:$name
 * @type     {PluginEventHash}
 */
/**
 * Signals that a plugin has just been set up on a player.
 *
 * @event    Player#pluginsetup
 * @type     {PluginEventHash}
 */
/**
 * Signals that a plugin has just been set up on a player - by name. The name
 * is the name of the plugin.
 *
 * @event    Player#pluginsetup:$name
 * @type     {PluginEventHash}
 */
/**
 * @typedef  {Object} PluginEventHash
 *
 * @property {string} instance
 *           For basic plugins, the return value of the plugin function. For
 *           advanced plugins, the plugin instance on which the event is fired.
 *
 * @property {string} name
 *           The name of the plugin.
 *
 * @property {string} plugin
 *           For basic plugins, the plugin function. For advanced plugins, the
 *           plugin class/constructor.
 */
/**
 * Decorate a function with a deprecation message the first time it is called.
 *
 * @param  {string}   message
 *         A deprecation message to log the first time the returned function
 *         is called.
 *
 * @param  {Function} fn
 *         The function to be deprecated.
 *
 * @return {Function}
 *         A wrapper function that will log a deprecation warning the first
 *         time it is called. The return value will be the return value of
 *         the wrapped function.
 */function deprecate(e,t){let s=false;return function(...i){s||B.warn(e);s=true;return t.apply(this,i)}}
/**
 * Internal function used to mark a function as deprecated in the next major
 * version with consistent messaging.
 *
 * @param  {number}   major   The major version where it will be removed
 * @param  {string}   oldName The old function name
 * @param  {string}   newName The new function name
 * @param  {Function} fn      The function to deprecate
 * @return {Function}         The decorated function
 */function deprecateForMajor(e,t,s,i){return deprecate(`${t} is deprecated and will be removed in ${e}.0; please use ${s} instead.`,i)}var Pt={NetworkBadStatus:"networkbadstatus",NetworkRequestFailed:"networkrequestfailed",NetworkRequestAborted:"networkrequestaborted",NetworkRequestTimeout:"networkrequesttimeout",NetworkBodyParserFailed:"networkbodyparserfailed",StreamingHlsPlaylistParserError:"streaminghlsplaylistparsererror",StreamingDashManifestParserError:"streamingdashmanifestparsererror",StreamingContentSteeringParserError:"streamingcontentsteeringparsererror",StreamingVttParserError:"streamingvttparsererror",StreamingFailedToSelectNextSegment:"streamingfailedtoselectnextsegment",StreamingFailedToDecryptSegment:"streamingfailedtodecryptsegment",StreamingFailedToTransmuxSegment:"streamingfailedtotransmuxsegment",StreamingFailedToAppendSegment:"streamingfailedtoappendsegment",StreamingCodecsChangeError:"streamingcodecschangeerror"};
/**
 * Normalize an `id` value by trimming off a leading `#`
 *
 * @private
 * @param   {string} id
 *          A string, maybe with a leading `#`.
 *
 * @return {string}
 *          The string, without any leading `#`.
 */const normalizeId=e=>e.indexOf("#")===0?e.slice(1):e
/**
 * The `videojs()` function doubles as the main function for users to create a
 * {@link Player} instance as well as the main library namespace.
 *
 * It can also be used as a getter for a pre-existing {@link Player} instance.
 * However, we _strongly_ recommend using `videojs.getPlayer()` for this
 * purpose because it avoids any potential for unintended initialization.
 *
 * Due to [limitations](https://github.com/jsdoc3/jsdoc/issues/955#issuecomment-313829149)
 * of our JSDoc template, we cannot properly document this as both a function
 * and a namespace, so its function signature is documented here.
 *
 * #### Arguments
 * ##### id
 * string|Element, **required**
 *
 * Video element or video element ID.
 *
 * ##### options
 * Object, optional
 *
 * Options object for providing settings.
 * See: [Options Guide](https://docs.videojs.com/tutorial-options.html).
 *
 * ##### ready
 * {@link Component~ReadyCallback}, optional
 *
 * A function to be called when the {@link Player} and {@link Tech} are ready.
 *
 * #### Return Value
 *
 * The `videojs()` function returns a {@link Player} instance.
 *
 * @namespace
 *
 * @borrows AudioTrack as AudioTrack
 * @borrows Component.getComponent as getComponent
 * @borrows module:events.on as on
 * @borrows module:events.one as one
 * @borrows module:events.off as off
 * @borrows module:events.trigger as trigger
 * @borrows EventTarget as EventTarget
 * @borrows module:middleware.use as use
 * @borrows Player.players as players
 * @borrows Plugin.registerPlugin as registerPlugin
 * @borrows Plugin.deregisterPlugin as deregisterPlugin
 * @borrows Plugin.getPlugins as getPlugins
 * @borrows Plugin.getPlugin as getPlugin
 * @borrows Plugin.getPluginVersion as getPluginVersion
 * @borrows Tech.getTech as getTech
 * @borrows Tech.registerTech as registerTech
 * @borrows TextTrack as TextTrack
 * @borrows VideoTrack as VideoTrack
 *
 * @param  {string|Element} id
 *         Video element or video element ID.
 *
 * @param  {Object} [options]
 *         Options object for providing settings.
 *         See: [Options Guide](https://docs.videojs.com/tutorial-options.html).
 *
 * @param  {PlayerReadyCallback} [ready]
 *         A function to be called when the {@link Player} and {@link Tech} are
 *         ready.
 *
 * @return {Player}
 *         The `videojs()` function returns a {@link Player|Player} instance.
 */;function videojs(t,s,i){let n=videojs.getPlayer(t);if(n){s&&B.warn(`Player "${t}" is already initialised. Options will not be applied.`);i&&n.ready(i);return n}const r=typeof t==="string"?ce("#"+normalizeId(t)):t;if(!isEl(r))throw new TypeError("The element or ID supplied is not valid. (videojs)");const a="getRootNode"in r&&r.getRootNode()instanceof e.ShadowRoot;const o=a?r.getRootNode():r.ownerDocument.body;r.ownerDocument.defaultView&&o.contains(r)||B.warn("The element supplied is not included in the DOM");s=s||{};s.restoreEl===true&&(s.restoreEl=(r.parentNode&&r.parentNode.hasAttribute&&r.parentNode.hasAttribute("data-vjs-player")?r.parentNode:r).cloneNode(true));hooks("beforesetup").forEach((e=>{const t=e(r,merge$1(s));isObject(t)&&!Array.isArray(t)?s=merge$1(s,t):B.error("please return an object in beforesetup hooks")}));const l=Component$1.getComponent("Player");n=new l(r,s,i);hooks("setup").forEach((e=>e(n)));return n}videojs.hooks_=A;videojs.hooks=hooks;videojs.hook=hook;videojs.hookOnce=hookOnce;videojs.removeHook=removeHook;if(e.VIDEOJS_NO_DYNAMIC_STYLE!==true&&isReal()){let e=ce(".vjs-styles-defaults");if(!e){e=createStyleElement("vjs-styles-defaults");const t=ce("head");t&&t.insertBefore(e,t.firstChild);setTextContent(e,"\n      .video-js {\n        width: 300px;\n        height: 150px;\n      }\n\n      .vjs-fluid:not(.vjs-audio-only-mode) {\n        padding-top: 56.25%\n      }\n    ")}}autoSetupTimeout(1,videojs);
/**
 * Current Video.js version. Follows [semantic versioning](https://semver.org/).
 *
 * @type {string}
 */videojs.VERSION=L;
/**
 * The global options object. These are the settings that take effect
 * if no overrides are specified when the player is created.
 *
 * @type {Object}
 */videojs.options=Player.prototype.options_;videojs.getPlayers=()=>Player.players
/**
 * Get a single player based on an ID or DOM element.
 *
 * This is useful if you want to check if an element or ID has an associated
 * Video.js player, but not create one if it doesn't.
 *
 * @param   {string|Element} id
 *          An HTML element - `<video>`, `<audio>`, or `<video-js>` -
 *          or a string matching the `id` of such an element.
 *
 * @return {Player|undefined}
 *          A player instance or `undefined` if there is no player instance
 *          matching the argument.
 */;videojs.getPlayer=e=>{const t=Player.players;let s;if(typeof e==="string"){const i=normalizeId(e);const n=t[i];if(n)return n;s=ce("#"+i)}else s=e;if(isEl(s)){const{player:e,playerId:i}=s;if(e||t[i])return e||t[i]}};videojs.getAllPlayers=()=>Object.keys(Player.players).map((e=>Player.players[e])).filter(Boolean);videojs.players=Player.players;videojs.getComponent=Component$1.getComponent;
/**
 * Register a component so it can referred to by name. Used when adding to other
 * components, either through addChild `component.addChild('myComponent')` or through
 * default children options  `{ children: ['myComponent'] }`.
 *
 * > NOTE: You could also just initialize the component before adding.
 * `component.addChild(new MyComponent());`
 *
 * @param {string} name
 *        The class name of the component
 *
 * @param {typeof Component} comp
 *        The component class
 *
 * @return {typeof Component}
 *         The newly registered component
 */videojs.registerComponent=(e,t)=>{Tech.isTech(t)&&B.warn(`The ${e} tech was registered as a component. It should instead be registered using videojs.registerTech(name, tech)`);return Component$1.registerComponent.call(Component$1,e,t)};videojs.getTech=Tech.getTech;videojs.registerTech=Tech.registerTech;videojs.use=use;
/**
 * An object that can be returned by a middleware to signify
 * that the middleware is being terminated.
 *
 * @type {object}
 * @property {object} middleware.TERMINATOR
 */Object.defineProperty(videojs,"middleware",{value:{},writeable:false,enumerable:true});Object.defineProperty(videojs.middleware,"TERMINATOR",{value:He,writeable:false,enumerable:true});
/**
 * A reference to the {@link module:browser|browser utility module} as an object.
 *
 * @type {Object}
 * @see  {@link module:browser|browser}
 */videojs.browser=he;
/**
 * A reference to the {@link module:obj|obj utility module} as an object.
 *
 * @type {Object}
 * @see  {@link module:obj|obj}
 */videojs.obj=N;
/**
 * Deprecated reference to the {@link module:obj.merge|merge function}
 *
 * @type {Function}
 * @see {@link module:obj.merge|merge}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.obj.merge instead.
 */videojs.mergeOptions=deprecateForMajor(9,"videojs.mergeOptions","videojs.obj.merge",merge$1);
/**
 * Deprecated reference to the {@link module:obj.defineLazyProperty|defineLazyProperty function}
 *
 * @type {Function}
 * @see {@link module:obj.defineLazyProperty|defineLazyProperty}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.obj.defineLazyProperty instead.
 */videojs.defineLazyProperty=deprecateForMajor(9,"videojs.defineLazyProperty","videojs.obj.defineLazyProperty",defineLazyProperty);
/**
 * Deprecated reference to the {@link module:fn.bind_|fn.bind_ function}
 *
 * @type {Function}
 * @see {@link module:fn.bind_|fn.bind_}
 * @deprecated Deprecated and will be removed in 9.0. Please use native Function.prototype.bind instead.
 */videojs.bind=deprecateForMajor(9,"videojs.bind","native Function.prototype.bind",bind_);videojs.registerPlugin=Plugin.registerPlugin;videojs.deregisterPlugin=Plugin.deregisterPlugin;
/**
 * Deprecated method to register a plugin with Video.js
 *
 * @deprecated Deprecated and will be removed in 9.0. Use videojs.registerPlugin() instead.
 *
 * @param {string} name
 *        The plugin name
*
 * @param {typeof Plugin|Function} plugin
 *         The plugin sub-class or function
 *
 * @return {typeof Plugin|Function}
 */videojs.plugin=(e,t)=>{B.warn("videojs.plugin() is deprecated; use videojs.registerPlugin() instead");return Plugin.registerPlugin(e,t)};videojs.getPlugins=Plugin.getPlugins;videojs.getPlugin=Plugin.getPlugin;videojs.getPluginVersion=Plugin.getPluginVersion;
/**
 * Adding languages so that they're available to all players.
 * Example: `videojs.addLanguage('es', { 'Hello': 'Hola' });`
 *
 * @param {string} code
 *        The language code or dictionary property
 *
 * @param {Object} data
 *        The data values to be translated
 *
 * @return {Object}
 *         The resulting language dictionary object
 */videojs.addLanguage=function(e,t){e=(""+e).toLowerCase();videojs.options.languages=merge$1(videojs.options.languages,{[e]:t});return videojs.options.languages[e]};
/**
 * A reference to the {@link module:log|log utility module} as an object.
 *
 * @type {Function}
 * @see  {@link module:log|log}
 */videojs.log=B;videojs.createLogger=j;
/**
 * A reference to the {@link module:time|time utility module} as an object.
 *
 * @type {Object}
 * @see {@link module:time|time}
 */videojs.time=Pe;
/**
 * Deprecated reference to the {@link module:time.createTimeRanges|createTimeRanges function}
 *
 * @type {Function}
 * @see {@link module:time.createTimeRanges|createTimeRanges}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.time.createTimeRanges instead.
 */videojs.createTimeRange=deprecateForMajor(9,"videojs.createTimeRange","videojs.time.createTimeRanges",createTimeRanges$1);
/**
 * Deprecated reference to the {@link module:time.createTimeRanges|createTimeRanges function}
 *
 * @type {Function}
 * @see {@link module:time.createTimeRanges|createTimeRanges}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.time.createTimeRanges instead.
 */videojs.createTimeRanges=deprecateForMajor(9,"videojs.createTimeRanges","videojs.time.createTimeRanges",createTimeRanges$1);
/**
 * Deprecated reference to the {@link module:time.formatTime|formatTime function}
 *
 * @type {Function}
 * @see {@link module:time.formatTime|formatTime}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.time.format instead.
 */videojs.formatTime=deprecateForMajor(9,"videojs.formatTime","videojs.time.formatTime",formatTime);
/**
 * Deprecated reference to the {@link module:time.setFormatTime|setFormatTime function}
 *
 * @type {Function}
 * @see {@link module:time.setFormatTime|setFormatTime}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.time.setFormat instead.
 */videojs.setFormatTime=deprecateForMajor(9,"videojs.setFormatTime","videojs.time.setFormatTime",setFormatTime);
/**
 * Deprecated reference to the {@link module:time.resetFormatTime|resetFormatTime function}
 *
 * @type {Function}
 * @see {@link module:time.resetFormatTime|resetFormatTime}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.time.resetFormat instead.
 */videojs.resetFormatTime=deprecateForMajor(9,"videojs.resetFormatTime","videojs.time.resetFormatTime",resetFormatTime);
/**
 * Deprecated reference to the {@link module:url.parseUrl|Url.parseUrl function}
 *
 * @type {Function}
 * @see {@link module:url.parseUrl|parseUrl}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.url.parseUrl instead.
 */videojs.parseUrl=deprecateForMajor(9,"videojs.parseUrl","videojs.url.parseUrl",parseUrl);
/**
 * Deprecated reference to the {@link module:url.isCrossOrigin|Url.isCrossOrigin function}
 *
 * @type {Function}
 * @see {@link module:url.isCrossOrigin|isCrossOrigin}
 * @deprecated Deprecated and will be removed in 9.0. Please use videojs.url.isCrossOrigin instead.
 */videojs.isCrossOrigin=deprecateForMajor(9,"videojs.isCrossOrigin","videojs.url.isCrossOrigin",isCrossOrigin);videojs.EventTarget=EventTarget$2;videojs.any=any;videojs.on=on;videojs.one=one;videojs.off=off;videojs.trigger=trigger;
/**
 * A cross-browser XMLHttpRequest wrapper.
 *
 * @function
 * @param    {Object} options
 *           Settings for the request.
 *
 * @return   {XMLHttpRequest|XDomainRequest}
 *           The request object.
 *
 * @see      https://github.com/Raynos/xhr
 */videojs.xhr=s;videojs.TextTrack=TextTrack;videojs.AudioTrack=AudioTrack;videojs.VideoTrack=VideoTrack;["isEl","isTextNode","createEl","hasClass","addClass","removeClass","toggleClass","setAttributes","getAttributes","emptyEl","appendContent","insertContent"].forEach((e=>{videojs[e]=function(){B.warn(`videojs.${e}() is deprecated; use videojs.dom.${e}() instead`);return pe[e].apply(null,arguments)}}));videojs.computedStyle=deprecateForMajor(9,"videojs.computedStyle","videojs.dom.computedStyle",computedStyle);
/**
 * A reference to the {@link module:dom|DOM utility module} as an object.
 *
 * @type {Object}
 * @see {@link module:dom|dom}
 */videojs.dom=pe;
/**
 * A reference to the {@link module:fn|fn utility module} as an object.
 *
 * @type {Object}
 * @see {@link module:fn|fn}
 */videojs.fn=Ce;
/**
 * A reference to the {@link module:num|num utility module} as an object.
 *
 * @type {Object}
 * @see {@link module:num|num}
 */videojs.num=et;
/**
 * A reference to the {@link module:str|str utility module} as an object.
 *
 * @type {Object}
 * @see {@link module:str|str}
 */videojs.str=xe;
/**
 * A reference to the {@link module:url|URL utility module} as an object.
 *
 * @type {Object}
 * @see {@link module:url|url}
 */videojs.url=Re;videojs.Error=Pt;
/*! @name videojs-contrib-quality-levels @version 4.1.0 @license Apache-2.0 */class QualityLevel{
/**
   * Creates a QualityLevel
   *
   * @param {Representation|Object} representation The representation of the quality level
   * @param {string}   representation.id        Unique id of the QualityLevel
   * @param {number=}  representation.width     Resolution width of the QualityLevel
   * @param {number=}  representation.height    Resolution height of the QualityLevel
   * @param {number}   representation.bandwidth Bitrate of the QualityLevel
   * @param {number=}  representation.frameRate Frame-rate of the QualityLevel
   * @param {Function} representation.enabled   Callback to enable/disable QualityLevel
   */
constructor(e){let t=this;t.id=e.id;t.label=t.id;t.width=e.width;t.height=e.height;t.bitrate=e.bandwidth;t.frameRate=e.frameRate;t.enabled_=e.enabled;Object.defineProperty(t,"enabled",{get(){return t.enabled_()},
/**
       * Enable or disable the QualityLevel.
       *
       * @param {boolean} enable true to enable QualityLevel, false to disable.
       */
set(e){t.enabled_(e)}});return t}}class QualityLevelList extends videojs.EventTarget{constructor(){super();let e=this;e.levels_=[];e.selectedIndex_=-1;
/**
     * Get the index of the currently selected QualityLevel.
     *
     * @returns {number} The index of the selected QualityLevel. -1 if none selected.
     * @readonly
     */Object.defineProperty(e,"selectedIndex",{get(){return e.selectedIndex_}});
/**
     * Get the length of the list of QualityLevels.
     *
     * @returns {number} The length of the list.
     * @readonly
     */Object.defineProperty(e,"length",{get(){return e.levels_.length}});e[Symbol.iterator]=()=>e.levels_.values();return e}
/**
   * Adds a quality level to the list.
   *
   * @param {Representation|Object} representation The representation of the quality level
   * @param {string}   representation.id        Unique id of the QualityLevel
   * @param {number=}  representation.width     Resolution width of the QualityLevel
   * @param {number=}  representation.height    Resolution height of the QualityLevel
   * @param {number}   representation.bandwidth Bitrate of the QualityLevel
   * @param {number=}  representation.frameRate Frame-rate of the QualityLevel
   * @param {Function} representation.enabled   Callback to enable/disable QualityLevel
   * @return {QualityLevel} the QualityLevel added to the list
   * @method addQualityLevel
   */addQualityLevel(e){let t=this.getQualityLevelById(e.id);if(t)return t;const s=this.levels_.length;t=new QualityLevel(e);""+s in this||Object.defineProperty(this,s,{get(){return this.levels_[s]}});this.levels_.push(t);this.trigger({qualityLevel:t,type:"addqualitylevel"});return t}
/**
   * Removes a quality level from the list.
   *
   * @param {QualityLevel} qualityLevel The QualityLevel to remove from the list.
   * @return {QualityLevel|null} the QualityLevel removed or null if nothing removed
   * @method removeQualityLevel
   */removeQualityLevel(e){let t=null;for(let s=0,i=this.length;s<i;s++)if(this[s]===e){t=this.levels_.splice(s,1)[0];this.selectedIndex_===s?this.selectedIndex_=-1:this.selectedIndex_>s&&this.selectedIndex_--;break}t&&this.trigger({qualityLevel:e,type:"removequalitylevel"});return t}
/**
   * Searches for a QualityLevel with the given id.
   *
   * @param {string} id The id of the QualityLevel to find.
   * @return {QualityLevel|null} The QualityLevel with id, or null if not found.
   * @method getQualityLevelById
   */getQualityLevelById(e){for(let t=0,s=this.length;t<s;t++){const s=this[t];if(s.id===e)return s}return null}dispose(){this.selectedIndex_=-1;this.levels_.length=0}}QualityLevelList.prototype.allowedEvents_={change:"change",addqualitylevel:"addqualitylevel",removequalitylevel:"removequalitylevel"};for(const e in QualityLevelList.prototype.allowedEvents_)QualityLevelList.prototype["on"+e]=null;var Lt="4.1.0";
/**
 * Initialization function for the qualityLevels plugin. Sets up the QualityLevelList and
 * event handlers.
 *
 * @param {Player} player Player object.
 * @param {Object} options Plugin options object.
 * @return {QualityLevelList} a list of QualityLevels
 */const initPlugin$1=function(e,t){const s=e.qualityLevels;const i=new QualityLevelList;const disposeHandler=function(){i.dispose();e.qualityLevels=s;e.off("dispose",disposeHandler)};e.on("dispose",disposeHandler);e.qualityLevels=()=>i;e.qualityLevels.VERSION=Lt;return i};
/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @param {Object} options Plugin options object
 * @return {QualityLevelList} a list of QualityLevels
 */const qualityLevels=function(e){return initPlugin$1(this,videojs.obj.merge({},e))};videojs.registerPlugin("qualityLevels",qualityLevels);qualityLevels.VERSION=Lt;
/*! @name @videojs/http-streaming @version 3.16.2 @license Apache-2.0 */const At=r;
/**
 * If the xhr request was redirected, return the responseURL, otherwise,
 * return the original url.
 *
 * @api private
 *
 * @param  {string} url - an url being requested
 * @param  {XMLHttpRequest} req - xhr request result
 *
 * @return {string}
 */const resolveManifestRedirect=(e,t)=>t&&t.responseURL&&e!==t.responseURL?t.responseURL:e;const logger=e=>videojs.log.debug?videojs.log.debug.bind(videojs,"VHS:",`${e} >`):function(){};function merge(...e){const t=videojs.obj||videojs;const s=t.merge||t.mergeOptions;return s.apply(t,e)}function createTimeRanges(...e){const t=videojs.time||videojs;const s=t.createTimeRanges||t.createTimeRanges;return s.apply(t,e)}
/**
 * Converts provided buffered ranges to a descriptive string
 *
 * @param {TimeRanges} buffered - received buffered time ranges
 *
 * @return {string} - descriptive string
 */function bufferedRangesToString(e){if(e.length===0)return"Buffered Ranges are empty";let t="Buffered Ranges: \n";for(let s=0;s<e.length;s++){const i=e.start(s);const n=e.end(s);t+=`${i} --\x3e ${n}. Duration (${n-i})\n`}return t}const Dt=1/30;const Ot=Dt*3;const filterRanges=function(e,t){const s=[];let i;if(e&&e.length)for(i=0;i<e.length;i++)t(e.start(i),e.end(i))&&s.push([e.start(i),e.end(i)]);return createTimeRanges(s)};
/**
 * Attempts to find the buffered TimeRange that contains the specified
 * time.
 *
 * @param {TimeRanges} buffered - the TimeRanges object to query
 * @param {number} time  - the time to filter on.
 * @return {TimeRanges} a new TimeRanges object
 */const findRange=function(e,t){return filterRanges(e,(function(e,s){return e-Ot<=t&&s+Ot>=t}))};
/**
 * Returns the TimeRanges that begin later than the specified time.
 *
 * @param {TimeRanges} timeRanges - the TimeRanges object to query
 * @param {number} time - the time to filter on.
 * @return {TimeRanges} a new TimeRanges object.
 */const findNextRange=function(e,t){return filterRanges(e,(function(e){return e-Dt>=t}))};
/**
 * Returns gaps within a list of TimeRanges
 *
 * @param {TimeRanges} buffered - the TimeRanges object
 * @return {TimeRanges} a TimeRanges object of gaps
 */const findGaps=function(e){if(e.length<2)return createTimeRanges();const t=[];for(let s=1;s<e.length;s++){const i=e.end(s-1);const n=e.start(s);t.push([i,n])}return createTimeRanges(t)};
/**
 * Calculate the intersection of two TimeRanges
 *
 * @param {TimeRanges} bufferA
 * @param {TimeRanges} bufferB
 * @return {TimeRanges} The interesection of `bufferA` with `bufferB`
 */const bufferIntersection=function(e,t){let s=null;let i=null;let n=0;const r=[];const a=[];if(!e||!e.length||!t||!t.length)return createTimeRanges();let o=e.length;while(o--){r.push({time:e.start(o),type:"start"});r.push({time:e.end(o),type:"end"})}o=t.length;while(o--){r.push({time:t.start(o),type:"start"});r.push({time:t.end(o),type:"end"})}r.sort((function(e,t){return e.time-t.time}));for(o=0;o<r.length;o++){if(r[o].type==="start"){n++;n===2&&(s=r[o].time)}else if(r[o].type==="end"){n--;n===1&&(i=r[o].time)}if(s!==null&&i!==null){a.push([s,i]);s=null;i=null}}return createTimeRanges(a)};
/**
 * Gets a human readable string for a TimeRange
 *
 * @param {TimeRange} range
 * @return {string} a human readable string
 */const printableRange=e=>{const t=[];if(!e||!e.length)return"";for(let s=0;s<e.length;s++)t.push(e.start(s)+" => "+e.end(s));return t.join(", ")};
/**
 * Calculates the amount of time left in seconds until the player hits the end of the
 * buffer and causes a rebuffer
 *
 * @param {TimeRange} buffered
 *        The state of the buffer
 * @param {Numnber} currentTime
 *        The current time of the player
 * @param {number} playbackRate
 *        The current playback rate of the player. Defaults to 1.
 * @return {number}
 *         Time until the player has to start rebuffering in seconds.
 * @function timeUntilRebuffer
 */const timeUntilRebuffer=function(e,t,s=1){const i=e.length?e.end(e.length-1):0;return(i-t)/s};
/**
 * Converts a TimeRanges object into an array representation
 *
 * @param {TimeRanges} timeRanges
 * @return {Array}
 */const timeRangesToArray=e=>{const t=[];for(let s=0;s<e.length;s++)t.push({start:e.start(s),end:e.end(s)});return t};
/**
 * Determines if two time range objects are different.
 *
 * @param {TimeRange} a
 *        the first time range object to check
 *
 * @param {TimeRange} b
 *        the second time range object to check
 *
 * @return {Boolean}
 *         Whether the time range objects differ
 */const isRangeDifferent=function(e,t){if(e===t)return false;if(!e&&t||!t&&e)return true;if(e.length!==t.length)return true;for(let s=0;s<e.length;s++)if(e.start(s)!==t.start(s)||e.end(s)!==t.end(s))return true;return false};const lastBufferedEnd=function(e){if(e&&e.length&&e.end)return e.end(e.length-1)};
/**
 * A utility function to add up the amount of time in a timeRange
 * after a specified startTime.
 * ie:[[0, 10], [20, 40], [50, 60]] with a startTime 0
 *     would return 40 as there are 40s seconds after 0 in the timeRange
 *
 * @param {TimeRange} range
 *        The range to check against
 * @param {number} startTime
 *        The time in the time range that you should start counting from
 *
 * @return {number}
 *          The number of seconds in the buffer passed the specified time.
 */const timeAheadOf=function(e,t){let s=0;if(!e||!e.length)return s;for(let i=0;i<e.length;i++){const n=e.start(i);const r=e.end(i);t>r||(s+=t>n&&t<=r?r-t:r-n)}return s};
/**
 * Get the duration of a segment, with special cases for
 * llhls segments that do not have a duration yet.
 *
 * @param {Object} playlist
 *        the playlist that the segment belongs to.
 * @param {Object} segment
 *        the segment to get a duration for.
 *
 * @return {number}
 *          the segment duration
 */const segmentDurationWithParts=(e,t)=>{if(!t.preload)return t.duration;let s=0;(t.parts||[]).forEach((function(e){s+=e.duration}));(t.preloadHints||[]).forEach((function(t){t.type==="PART"&&(s+=e.partTargetDuration)}));return s};
/**
 * A function to get a combined list of parts and segments with durations
 * and indexes.
 *
 * @param {Playlist} playlist the playlist to get the list for.
 *
 * @return {Array} The part/segment list.
 */const getPartsAndSegments=e=>(e.segments||[]).reduce(((e,t,s)=>{t.parts?t.parts.forEach((function(i,n){e.push({duration:i.duration,segmentIndex:s,partIndex:n,part:i,segment:t})})):e.push({duration:t.duration,segmentIndex:s,partIndex:null,segment:t,part:null});return e}),[]);const getLastParts=e=>{const t=e.segments&&e.segments.length&&e.segments[e.segments.length-1];return t&&t.parts||[]};const getKnownPartCount=({preloadSegment:e})=>{if(!e)return;const{parts:t,preloadHints:s}=e;let i=(s||[]).reduce(((e,t)=>e+(t.type==="PART"?1:0)),0);i+=t&&t.length?t.length:0;return i};
/**
 * Get the number of seconds to delay from the end of a
 * live playlist.
 *
 * @param {Playlist} main the main playlist
 * @param {Playlist} media the media playlist
 * @return {number} the hold back in seconds.
 */const liveEdgeDelay=(e,t)=>{if(t.endList)return 0;if(e&&e.suggestedPresentationDelay)return e.suggestedPresentationDelay;const s=getLastParts(t).length>0;return s&&t.serverControl&&t.serverControl.partHoldBack?t.serverControl.partHoldBack:s&&t.partTargetDuration?t.partTargetDuration*3:t.serverControl&&t.serverControl.holdBack?t.serverControl.holdBack:t.targetDuration?t.targetDuration*3:0};
/**
 * walk backward until we find a duration we can use
 * or return a failure
 *
 * @param {Playlist} playlist the playlist to walk through
 * @param {Number} endSequence the mediaSequence to stop walking on
 */const backwardDuration=function(e,t){let s=0;let i=t-e.mediaSequence;let n=e.segments[i];if(n){if(typeof n.start!=="undefined")return{result:n.start,precise:true};if(typeof n.end!=="undefined")return{result:n.end-n.duration,precise:true}}while(i--){n=e.segments[i];if(typeof n.end!=="undefined")return{result:s+n.end,precise:true};s+=segmentDurationWithParts(e,n);if(typeof n.start!=="undefined")return{result:s+n.start,precise:true}}return{result:s,precise:false}};
/**
 * walk forward until we find a duration we can use
 * or return a failure
 *
 * @param {Playlist} playlist the playlist to walk through
 * @param {number} endSequence the mediaSequence to stop walking on
 */const forwardDuration=function(e,t){let s=0;let i;let n=t-e.mediaSequence;for(;n<e.segments.length;n++){i=e.segments[n];if(typeof i.start!=="undefined")return{result:i.start-s,precise:true};s+=segmentDurationWithParts(e,i);if(typeof i.end!=="undefined")return{result:i.end-s,precise:true}}return{result:-1,precise:false}};
/**
  * Calculate the media duration from the segments associated with a
  * playlist. The duration of a subinterval of the available segments
  * may be calculated by specifying an end index.
  *
  * @param {Object} playlist a media playlist object
  * @param {number=} endSequence an exclusive upper boundary
  * for the playlist.  Defaults to playlist length.
  * @param {number} expired the amount of time that has dropped
  * off the front of the playlist in a live scenario
  * @return {number} the duration between the first available segment
  * and end index.
  */const intervalDuration=function(e,t,s){typeof t==="undefined"&&(t=e.mediaSequence+e.segments.length);if(t<e.mediaSequence)return 0;const i=backwardDuration(e,t);if(i.precise)return i.result;const n=forwardDuration(e,t);return n.precise?n.result:i.result+s};
/**
  * Calculates the duration of a playlist. If a start and end index
  * are specified, the duration will be for the subset of the media
  * timeline between those two indices. The total duration for live
  * playlists is always Infinity.
  *
  * @param {Object} playlist a media playlist object
  * @param {number=} endSequence an exclusive upper
  * boundary for the playlist. Defaults to the playlist media
  * sequence number plus its length.
  * @param {number=} expired the amount of time that has
  * dropped off the front of the playlist in a live scenario
  * @return {number} the duration between the start index and end
  * index.
  */const duration=function(t,s,i){if(!t)return 0;typeof i!=="number"&&(i=0);if(typeof s==="undefined"){if(t.totalDuration)return t.totalDuration;if(!t.endList)return e.Infinity}return intervalDuration(t,s,i)};
/**
  * Calculate the time between two indexes in the current playlist
  * neight the start- nor the end-index need to be within the current
  * playlist in which case, the targetDuration of the playlist is used
  * to approximate the durations of the segments
  *
  * @param {Array} options.durationList list to iterate over for durations.
  * @param {number} options.defaultDuration duration to use for elements before or after the durationList
  * @param {number} options.startIndex partsAndSegments index to start
  * @param {number} options.endIndex partsAndSegments index to end.
  * @return {number} the number of seconds between startIndex and endIndex
  */const sumDurations=function({defaultDuration:e,durationList:t,startIndex:s,endIndex:i}){let n=0;s>i&&([s,i]=[i,s]);if(s<0){for(let t=s;t<Math.min(0,i);t++)n+=e;s=0}for(let e=s;e<i;e++)n+=t[e].duration;return n};
/**
 * Calculates the playlist end time
 *
 * @param {Object} playlist a media playlist object
 * @param {number=} expired the amount of time that has
 *                  dropped off the front of the playlist in a live scenario
 * @param {boolean|false} useSafeLiveEnd a boolean value indicating whether or not the
 *                        playlist end calculation should consider the safe live end
 *                        (truncate the playlist end by three segments). This is normally
 *                        used for calculating the end of the playlist's seekable range.
 *                        This takes into account the value of liveEdgePadding.
 *                        Setting liveEdgePadding to 0 is equivalent to setting this to false.
 * @param {number} liveEdgePadding a number indicating how far from the end of the playlist we should be in seconds.
 *                 If this is provided, it is used in the safe live end calculation.
 *                 Setting useSafeLiveEnd=false or liveEdgePadding=0 are equivalent.
 *                 Corresponds to suggestedPresentationDelay in DASH manifests.
 * @return {number} the end time of playlist
 * @function playlistEnd
 */const playlistEnd=function(e,t,s,i){if(!e||!e.segments)return null;if(e.endList)return duration(e);if(t===null)return null;t=t||0;let n=intervalDuration(e,e.mediaSequence+e.segments.length,t);if(s){i=typeof i==="number"?i:liveEdgeDelay(null,e);n-=i}return Math.max(0,n)};
/**
  * Calculates the interval of time that is currently seekable in a
  * playlist. The returned time ranges are relative to the earliest
  * moment in the specified playlist that is still available. A full
  * seekable implementation for live streams would need to offset
  * these values by the duration of content that has expired from the
  * stream.
  *
  * @param {Object} playlist a media playlist object
  * dropped off the front of the playlist in a live scenario
  * @param {number=} expired the amount of time that has
  * dropped off the front of the playlist in a live scenario
  * @param {number} liveEdgePadding how far from the end of the playlist we should be in seconds.
  *        Corresponds to suggestedPresentationDelay in DASH manifests.
  * @return {TimeRanges} the periods of time that are valid targets
  * for seeking
  */const seekable=function(e,t,s){const i=true;const n=t||0;let r=playlistEnd(e,t,i,s);if(r===null)return createTimeRanges();r<n&&(r=n);return createTimeRanges(n,r)};
/**
 * Determine the index and estimated starting time of the segment that
 * contains a specified playback position in a media playlist.
 *
 * @param {Object} options.playlist the media playlist to query
 * @param {number} options.currentTime The number of seconds since the earliest
 * possible position to determine the containing segment for
 * @param {number} options.startTime the time when the segment/part starts
 * @param {number} options.startingSegmentIndex the segment index to start looking at.
 * @param {number?} [options.startingPartIndex] the part index to look at within the segment.
 *
 * @return {Object} an object with partIndex, segmentIndex, and startTime.
 */const getMediaInfoForTime=function({playlist:e,currentTime:t,startingSegmentIndex:s,startingPartIndex:i,startTime:n,exactManifestTimings:r}){let a=t-n;const o=getPartsAndSegments(e);let l=0;for(let e=0;e<o.length;e++){const t=o[e];if(s===t.segmentIndex&&(typeof i!=="number"||typeof t.partIndex!=="number"||i===t.partIndex)){l=e;break}}if(a<0){if(l>0)for(let t=l-1;t>=0;t--){const s=o[t];a+=s.duration;if(r){if(a<0)continue}else if(a+Dt<=0)continue;return{partIndex:s.partIndex,segmentIndex:s.segmentIndex,startTime:n-sumDurations({defaultDuration:e.targetDuration,durationList:o,startIndex:l,endIndex:t})}}return{partIndex:o[0]&&o[0].partIndex||null,segmentIndex:o[0]&&o[0].segmentIndex||0,startTime:t}}if(l<0){for(let s=l;s<0;s++){a-=e.targetDuration;if(a<0)return{partIndex:o[0]&&o[0].partIndex||null,segmentIndex:o[0]&&o[0].segmentIndex||0,startTime:t}}l=0}for(let t=l;t<o.length;t++){const s=o[t];a-=s.duration;const i=s.duration>Dt;const d=a===0;const h=i&&a+Dt>=0;if(!d&&!h||t===o.length-1){if(r){if(a>0)continue}else if(a-Dt>=0)continue;return{partIndex:s.partIndex,segmentIndex:s.segmentIndex,startTime:n+sumDurations({defaultDuration:e.targetDuration,durationList:o,startIndex:l,endIndex:t})}}}return{segmentIndex:o[o.length-1].segmentIndex,partIndex:o[o.length-1].partIndex,startTime:t}};
/**
 * Check whether the playlist is excluded or not.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is excluded or not
 * @function isExcluded
 */const isExcluded=function(e){return e.excludeUntil&&e.excludeUntil>Date.now()};
/**
 * Check whether the playlist is compatible with current playback configuration or has
 * been excluded permanently for being incompatible.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is incompatible or not
 * @function isIncompatible
 */const isIncompatible=function(e){return e.excludeUntil&&e.excludeUntil===Infinity};
/**
 * Check whether the playlist is enabled or not.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is enabled or not
 * @function isEnabled
 */const isEnabled=function(e){const t=isExcluded(e);return!e.disabled&&!t};
/**
 * Check whether the playlist has been manually disabled through the representations api.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is disabled manually or not
 * @function isDisabled
 */const isDisabled=function(e){return e.disabled};const isAes=function(e){for(let t=0;t<e.segments.length;t++)if(e.segments[t].key)return true;return false};
/**
 * Checks if the playlist has a value for the specified attribute
 *
 * @param {string} attr
 *        Attribute to check for
 * @param {Object} playlist
 *        The media playlist object
 * @return {boolean}
 *         Whether the playlist contains a value for the attribute or not
 * @function hasAttribute
 */const hasAttribute=function(e,t){return t.attributes&&t.attributes[e]};
/**
 * Estimates the time required to complete a segment download from the specified playlist
 *
 * @param {number} segmentDuration
 *        Duration of requested segment
 * @param {number} bandwidth
 *        Current measured bandwidth of the player
 * @param {Object} playlist
 *        The media playlist object
 * @param {number=} bytesReceived
 *        Number of bytes already received for the request. Defaults to 0
 * @return {number|NaN}
 *         The estimated time to request the segment. NaN if bandwidth information for
 *         the given playlist is unavailable
 * @function estimateSegmentRequestTime
 */const estimateSegmentRequestTime=function(e,t,s,i=0){if(!hasAttribute("BANDWIDTH",s))return NaN;const n=e*s.attributes.BANDWIDTH;return(n-i*8)/t};const isLowestEnabledRendition=(e,t)=>{if(e.playlists.length===1)return true;const s=t.attributes.BANDWIDTH||Number.MAX_VALUE;return e.playlists.filter((e=>!!isEnabled(e)&&(e.attributes.BANDWIDTH||0)<s)).length===0};const playlistMatch=(e,t)=>!(!e&&!t||!e&&t||e&&!t)&&(e===t||(!(!e.id||!t.id||e.id!==t.id)||(!(!e.resolvedUri||!t.resolvedUri||e.resolvedUri!==t.resolvedUri)||!(!e.uri||!t.uri||e.uri!==t.uri))));const someAudioVariant=function(e,t){const s=e&&e.mediaGroups&&e.mediaGroups.AUDIO||{};let i=false;for(const e in s){for(const n in s[e]){i=t(s[e][n]);if(i)break}if(i)break}return!!i};const isAudioOnly=e=>{if(!e||!e.playlists||!e.playlists.length){const t=someAudioVariant(e,(e=>e.playlists&&e.playlists.length||e.uri));return t}for(let t=0;t<e.playlists.length;t++){const s=e.playlists[t];const i=s.attributes&&s.attributes.CODECS;if(i&&i.split(",").every((e=>o(e))))continue;const n=someAudioVariant(e,(e=>playlistMatch(s,e)));if(!n)return false}return true};var Mt={liveEdgeDelay:liveEdgeDelay,duration:duration,seekable:seekable,getMediaInfoForTime:getMediaInfoForTime,isEnabled:isEnabled,isDisabled:isDisabled,isExcluded:isExcluded,isIncompatible:isIncompatible,playlistEnd:playlistEnd,isAes:isAes,hasAttribute:hasAttribute,estimateSegmentRequestTime:estimateSegmentRequestTime,isLowestEnabledRendition:isLowestEnabledRendition,isAudioOnly:isAudioOnly,playlistMatch:playlistMatch,segmentDurationWithParts:segmentDurationWithParts};const{log:Ut}=videojs;const createPlaylistID=(e,t)=>`${e}-${t}`;const groupID=(e,t,s)=>`placeholder-uri-${e}-${t}-${s}`;
/**
 * Parses a given m3u8 playlist
 *
 * @param {Function} [onwarn]
 *        a function to call when the parser triggers a warning event.
 * @param {Function} [oninfo]
 *        a function to call when the parser triggers an info event.
 * @param {string} manifestString
 *        The downloaded manifest string
 * @param {Object[]} [customTagParsers]
 *        An array of custom tag parsers for the m3u8-parser instance
 * @param {Object[]} [customTagMappers]
 *        An array of custom tag mappers for the m3u8-parser instance
 * @param {boolean} [llhls]
 *        Whether to keep ll-hls features in the manifest after parsing.
 * @return {Object}
 *         The manifest object
 */const parseManifest=({onwarn:e,oninfo:t,manifestString:s,customTagParsers:i=[],customTagMappers:n=[],llhls:r})=>{const o=new a;e&&o.on("warn",e);t&&o.on("info",t);i.forEach((e=>o.addParser(e)));n.forEach((e=>o.addTagMapper(e)));o.push(s);o.end();const l=o.manifest;if(!r){["preloadSegment","skip","serverControl","renditionReports","partInf","partTargetDuration"].forEach((function(e){l.hasOwnProperty(e)&&delete l[e]}));l.segments&&l.segments.forEach((function(e){["parts","preloadHints"].forEach((function(t){e.hasOwnProperty(t)&&delete e[t]}))}))}if(!l.targetDuration){let t=10;l.segments&&l.segments.length&&(t=l.segments.reduce(((e,t)=>Math.max(e,t.duration)),0));e&&e({message:`manifest has no targetDuration defaulting to ${t}`});l.targetDuration=t}const d=getLastParts(l);if(d.length&&!l.partTargetDuration){const t=d.reduce(((e,t)=>Math.max(e,t.duration)),0);if(e){e({message:`manifest has no partTargetDuration defaulting to ${t}`});Ut.error("LL-HLS manifest has parts but lacks required #EXT-X-PART-INF:PART-TARGET value. See https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-09#section-4.4.3.7. Playback is not guaranteed.")}l.partTargetDuration=t}return l};
/**
 * Loops through all supported media groups in main and calls the provided
 * callback for each group
 *
 * @param {Object} main
 *        The parsed main manifest object
 * @param {Function} callback
 *        Callback to call for each media group
 */const forEachMediaGroup=(e,t)=>{e.mediaGroups&&["AUDIO","SUBTITLES"].forEach((s=>{if(e.mediaGroups[s])for(const i in e.mediaGroups[s])for(const n in e.mediaGroups[s][i]){const r=e.mediaGroups[s][i][n];t(r,s,i,n)}}))};
/**
 * Adds properties and attributes to the playlist to keep consistent functionality for
 * playlists throughout VHS.
 *
 * @param {Object} config
 *        Arguments object
 * @param {Object} config.playlist
 *        The media playlist
 * @param {string} [config.uri]
 *        The uri to the media playlist (if media playlist is not from within a main
 *        playlist)
 * @param {string} id
 *        ID to use for the playlist
 */const setupMediaPlaylist=({playlist:e,uri:t,id:s})=>{e.id=s;e.playlistErrors_=0;t&&(e.uri=t);e.attributes=e.attributes||{}};
/**
 * Adds ID, resolvedUri, and attributes properties to each playlist of the main, where
 * necessary. In addition, creates playlist IDs for each playlist and adds playlist ID to
 * playlist references to the playlists array.
 *
 * @param {Object} main
 *        The main playlist
 */const setupMediaPlaylists=e=>{let t=e.playlists.length;while(t--){const s=e.playlists[t];setupMediaPlaylist({playlist:s,id:createPlaylistID(t,s.uri)});s.resolvedUri=At(e.uri,s.uri);e.playlists[s.id]=s;e.playlists[s.uri]=s;s.attributes.BANDWIDTH||Ut.warn("Invalid playlist STREAM-INF detected. Missing BANDWIDTH attribute.")}};
/**
 * Adds resolvedUri properties to each media group.
 *
 * @param {Object} main
 *        The main playlist
 */const resolveMediaGroupUris=e=>{forEachMediaGroup(e,(t=>{t.uri&&(t.resolvedUri=At(e.uri,t.uri))}))};
/**
 * Creates a main playlist wrapper to insert a sole media playlist into.
 *
 * @param {Object} media
 *        Media playlist
 * @param {string} uri
 *        The media URI
 *
 * @return {Object}
 *         main playlist
 */const mainForMedia=(t,s)=>{const i=createPlaylistID(0,s);const n={mediaGroups:{AUDIO:{},VIDEO:{},"CLOSED-CAPTIONS":{},SUBTITLES:{}},uri:e.location.href,resolvedUri:e.location.href,playlists:[{uri:s,id:i,resolvedUri:s,attributes:{}}]};n.playlists[i]=n.playlists[0];n.playlists[s]=n.playlists[0];return n};
/**
 * Does an in-place update of the main manifest to add updated playlist URI references
 * as well as other properties needed by VHS that aren't included by the parser.
 *
 * @param {Object} main
 *        main manifest object
 * @param {string} uri
 *        The source URI
 * @param {function} createGroupID
 *        A function to determine how to create the groupID for mediaGroups
 */const addPropertiesToMain=(e,t,s=groupID)=>{e.uri=t;for(let t=0;t<e.playlists.length;t++)if(!e.playlists[t].uri){const s=`placeholder-uri-${t}`;e.playlists[t].uri=s}const i=isAudioOnly(e);forEachMediaGroup(e,((t,r,a,o)=>{if(!t.playlists||!t.playlists.length){if(i&&r==="AUDIO"&&!t.uri)for(let t=0;t<e.playlists.length;t++){const s=e.playlists[t];if(s.attributes&&s.attributes.AUDIO&&s.attributes.AUDIO===a)return}t.playlists=[n({},t)]}t.playlists.forEach((function(t,i){const n=s(r,a,o,t);const l=createPlaylistID(i,n);if(t.uri)t.resolvedUri=t.resolvedUri||At(e.uri,t.uri);else{t.uri=i===0?n:l;t.resolvedUri=t.uri}t.id=t.id||l;t.attributes=t.attributes||{};e.playlists[t.id]=t;e.playlists[t.uri]=t}))}));setupMediaPlaylists(e);resolveMediaGroupUris(e)};class DateRangesStorage{constructor(){this.offset_=null;this.pendingDateRanges_=new Map;this.processedDateRanges_=new Map}setOffset(e=[]){if(this.offset_!==null)return;if(!e.length)return;const[t]=e;t.programDateTime!==void 0&&(this.offset_=t.programDateTime/1e3)}setPendingDateRanges(e=[]){if(!e.length)return;const[t]=e;const s=t.startDate.getTime();this.trimProcessedDateRanges_(s);this.pendingDateRanges_=e.reduce(((e,t)=>{e.set(t.id,t);return e}),new Map)}processDateRange(e){this.pendingDateRanges_.delete(e.id);this.processedDateRanges_.set(e.id,e)}getDateRangesToProcess(){if(this.offset_===null)return[];const e={};const t=[];this.pendingDateRanges_.forEach(((s,i)=>{if(!this.processedDateRanges_.has(i)){s.startTime=s.startDate.getTime()/1e3-this.offset_;s.processDateRange=()=>this.processDateRange(s);t.push(s);if(s.class)if(e[s.class]){const t=e[s.class].push(s);s.classListIndex=t-1}else{e[s.class]=[s];s.classListIndex=0}}}));for(const s of t){const t=e[s.class]||[];s.endDate?s.endTime=s.endDate.getTime()/1e3-this.offset_:s.endOnNext&&t[s.classListIndex+1]?s.endTime=t[s.classListIndex+1].startTime:s.duration?s.endTime=s.startTime+s.duration:s.plannedDuration?s.endTime=s.startTime+s.plannedDuration:s.endTime=s.startTime}return t}trimProcessedDateRanges_(e){const t=new Map(this.processedDateRanges_);t.forEach(((t,s)=>{t.startDate.getTime()<e&&this.processedDateRanges_.delete(s)}))}}const Rt=22;const getStreamingNetworkErrorMetadata=({requestType:e,request:t,error:s,parseFailure:i})=>{const r=t.status<200||t.status>299;const a=t.status>=400&&t.status<=499;const o={uri:t.uri,requestType:e};const l=r&&!a||i;if(s&&a){o.error=n({},s);o.errorType=videojs.Error.NetworkRequestFailed}else if(t.aborted)o.errorType=videojs.Error.NetworkRequestAborted;else if(t.timedout)o.erroType=videojs.Error.NetworkRequestTimeout;else if(l){const e=i?videojs.Error.NetworkBodyParserFailed:videojs.Error.NetworkBadStatus;o.errorType=e;o.status=t.status;o.headers=t.headers}return o};const{EventTarget:Bt}=videojs;const addLLHLSQueryDirectives=(t,s)=>{if(s.endList||!s.serverControl)return t;const i={};if(s.serverControl.canBlockReload){const{preloadSegment:e}=s;let t=s.mediaSequence+s.segments.length;if(e){const n=e.parts||[];const r=getKnownPartCount(s)-1;r>-1&&r!==n.length-1&&(i._HLS_part=r);(r>-1||n.length)&&t--}i._HLS_msn=t}s.serverControl&&s.serverControl.canSkipUntil&&(i._HLS_skip=s.serverControl.canSkipDateranges?"v2":"YES");if(Object.keys(i).length){const s=new e.URL(t);["_HLS_skip","_HLS_msn","_HLS_part"].forEach((function(e){i.hasOwnProperty(e)&&s.searchParams.set(e,i[e])}));t=s.toString()}return t};
/**
 * Returns a new segment object with properties and
 * the parts array merged.
 *
 * @param {Object} a the old segment
 * @param {Object} b the new segment
 *
 * @return {Object} the merged segment
 */const updateSegment=(e,t)=>{if(!e)return t;const s=merge(e,t);e.preloadHints&&!t.preloadHints&&delete s.preloadHints;if(e.parts&&!t.parts)delete s.parts;else if(e.parts&&t.parts)for(let i=0;i<t.parts.length;i++)e.parts&&e.parts[i]&&(s.parts[i]=merge(e.parts[i],t.parts[i]));!e.skipped&&t.skipped&&(s.skipped=false);e.preload&&!t.preload&&(s.preload=false);return s};
/**
 * Returns a new array of segments that is the result of merging
 * properties from an older list of segments onto an updated
 * list. No properties on the updated playlist will be ovewritten.
 *
 * @param {Array} original the outdated list of segments
 * @param {Array} update the updated list of segments
 * @param {number=} offset the index of the first update
 * segment in the original segment list. For non-live playlists,
 * this should always be zero and does not need to be
 * specified. For live playlists, it should be the difference
 * between the media sequence numbers in the original and updated
 * playlists.
 * @return {Array} a list of merged segment objects
 */const updateSegments=(e,t,s)=>{const i=e.slice();const n=t.slice();s=s||0;const r=[];let a;for(let e=0;e<n.length;e++){const t=i[e+s];const o=n[e];if(t){a=t.map||a;r.push(updateSegment(t,o))}else{a&&!o.map&&(o.map=a);r.push(o)}}return r};const resolveSegmentUris=(e,t)=>{!e.resolvedUri&&e.uri&&(e.resolvedUri=At(t,e.uri));e.key&&!e.key.resolvedUri&&(e.key.resolvedUri=At(t,e.key.uri));e.map&&!e.map.resolvedUri&&(e.map.resolvedUri=At(t,e.map.uri));e.map&&e.map.key&&!e.map.key.resolvedUri&&(e.map.key.resolvedUri=At(t,e.map.key.uri));e.parts&&e.parts.length&&e.parts.forEach((e=>{e.resolvedUri||(e.resolvedUri=At(t,e.uri))}));e.preloadHints&&e.preloadHints.length&&e.preloadHints.forEach((e=>{e.resolvedUri||(e.resolvedUri=At(t,e.uri))}))};const getAllSegments=function(e){const t=e.segments||[];const s=e.preloadSegment;if(s&&s.parts&&s.parts.length){if(s.preloadHints)for(let e=0;e<s.preloadHints.length;e++)if(s.preloadHints[e].type==="MAP")return t;s.duration=e.targetDuration;s.preload=true;t.push(s)}return t};const isPlaylistUnchanged=(e,t)=>e===t||e.segments&&t.segments&&e.segments.length===t.segments.length&&e.endList===t.endList&&e.mediaSequence===t.mediaSequence&&e.preloadSegment===t.preloadSegment
/**
  * Returns a new main playlist that is the result of merging an
  * updated media playlist into the original version. If the
  * updated media playlist does not match any of the playlist
  * entries in the original main playlist, null is returned.
  *
  * @param {Object} main a parsed main M3U8 object
  * @param {Object} media a parsed media M3U8 object
  * @return {Object} a new object that represents the original
  * main playlist with the updated media playlist merged in, or
  * null if the merge produced no change.
  */;const updateMain$1=(e,t,s=isPlaylistUnchanged)=>{const i=merge(e,{});const n=i.playlists[t.id];if(!n)return null;if(s(n,t))return null;t.segments=getAllSegments(t);const r=merge(n,t);r.preloadSegment&&!t.preloadSegment&&delete r.preloadSegment;if(n.segments){if(t.skip){t.segments=t.segments||[];for(let e=0;e<t.skip.skippedSegments;e++)t.segments.unshift({skipped:true})}r.segments=updateSegments(n.segments,t.segments,t.mediaSequence-n.mediaSequence)}r.segments.forEach((e=>{resolveSegmentUris(e,r.resolvedUri)}));for(let e=0;e<i.playlists.length;e++)i.playlists[e].id===t.id&&(i.playlists[e]=r);i.playlists[t.id]=r;i.playlists[t.uri]=r;forEachMediaGroup(e,((e,s,i,n)=>{if(e.playlists)for(let s=0;s<e.playlists.length;s++)t.id===e.playlists[s].id&&(e.playlists[s]=r)}));return i};
/**
 * Calculates the time to wait before refreshing a live playlist
 *
 * @param {Object} media
 *        The current media
 * @param {boolean} update
 *        True if there were any updates from the last refresh, false otherwise
 * @return {number}
 *         The time in ms to wait before refreshing the live playlist
 */const refreshDelay=(e,t)=>{const s=e.segments||[];const i=s[s.length-1];const n=i&&i.parts&&i.parts[i.parts.length-1];const r=n&&n.duration||i&&i.duration;return t&&r?r*1e3:(e.partTargetDuration||e.targetDuration||10)*500};const playlistMetadataPayload=(e,t,s)=>{if(!e)return;const i=[];e.forEach((e=>{if(!e.attributes)return;const{BANDWIDTH:t,RESOLUTION:s,CODECS:n}=e.attributes;i.push({id:e.id,bandwidth:t,resolution:s,codecs:n})}));return{type:t,isLive:s,renditions:i}};
/**
 * Load a playlist from a remote location
 *
 * @class PlaylistLoader
 * @extends Stream
 * @param {string|Object} src url or object of manifest
 * @param {boolean} withCredentials the withCredentials xhr option
 * @class
 */class PlaylistLoader extends Bt{constructor(e,t,s={}){super();if(!e)throw new Error("A non-empty playlist URL or object is required");this.logger_=logger("PlaylistLoader");const{withCredentials:i=false}=s;this.src=e;this.vhs_=t;this.withCredentials=i;this.addDateRangesToTextTrack_=s.addDateRangesToTextTrack;const n=t.options_;this.customTagParsers=n&&n.customTagParsers||[];this.customTagMappers=n&&n.customTagMappers||[];this.llhls=n&&n.llhls;this.dateRangesStorage_=new DateRangesStorage;this.state="HAVE_NOTHING";this.handleMediaupdatetimeout_=this.handleMediaupdatetimeout_.bind(this);this.on("mediaupdatetimeout",this.handleMediaupdatetimeout_);this.on("loadedplaylist",this.handleLoadedPlaylist_.bind(this))}handleLoadedPlaylist_(){const e=this.media();if(!e)return;this.dateRangesStorage_.setOffset(e.segments);this.dateRangesStorage_.setPendingDateRanges(e.dateRanges);const t=this.dateRangesStorage_.getDateRangesToProcess();t.length&&this.addDateRangesToTextTrack_&&this.addDateRangesToTextTrack_(t)}handleMediaupdatetimeout_(){if(this.state!=="HAVE_METADATA")return;const e=this.media();let t=At(this.main.uri,e.uri);this.llhls&&(t=addLLHLSQueryDirectives(t,e));this.state="HAVE_CURRENT_METADATA";this.request=this.vhs_.xhr({uri:t,withCredentials:this.withCredentials,requestType:"hls-playlist"},((e,t)=>{if(this.request){if(e)return this.playlistRequestError(this.request,this.media(),"HAVE_METADATA");this.haveMetadata({playlistString:this.request.responseText,url:this.media().uri,id:this.media().id})}}))}playlistRequestError(e,t,s){const{uri:i,id:n}=t;this.request=null;s&&(this.state=s);this.error={playlist:this.main.playlists[n],status:e.status,message:`HLS playlist request error at URL: ${i}.`,responseText:e.responseText,code:e.status>=500?4:2,metadata:getStreamingNetworkErrorMetadata({requestType:e.requestType,request:e,error:e.error})};this.trigger("error")}parseManifest_({url:e,manifestString:t}){try{return parseManifest({onwarn:({message:t})=>this.logger_(`m3u8-parser warn for ${e}: ${t}`),oninfo:({message:t})=>this.logger_(`m3u8-parser info for ${e}: ${t}`),manifestString:t,customTagParsers:this.customTagParsers,customTagMappers:this.customTagMappers,llhls:this.llhls})}catch(e){this.error=e;this.error.metadata={errorType:videojs.Error.StreamingHlsPlaylistParserError,error:e}}}
/**
   * Update the playlist loader's state in response to a new or updated playlist.
   *
   * @param {string} [playlistString]
   *        Playlist string (if playlistObject is not provided)
   * @param {Object} [playlistObject]
   *        Playlist object (if playlistString is not provided)
   * @param {string} url
   *        URL of playlist
   * @param {string} id
   *        ID to use for playlist
   */haveMetadata({playlistString:e,playlistObject:t,url:s,id:i}){this.request=null;this.state="HAVE_METADATA";const n={playlistInfo:{type:"media",uri:s}};this.trigger({type:"playlistparsestart",metadata:n});const r=t||this.parseManifest_({url:s,manifestString:e});r.lastRequest=Date.now();setupMediaPlaylist({playlist:r,uri:s,id:i});const a=updateMain$1(this.main,r);this.targetDuration=r.partTargetDuration||r.targetDuration;this.pendingMedia_=null;if(a){this.main=a;this.media_=this.main.playlists[i]}else this.trigger("playlistunchanged");this.updateMediaUpdateTimeout_(refreshDelay(this.media(),!!a));n.parsedPlaylist=playlistMetadataPayload(this.main.playlists,n.playlistInfo.type,!this.media_.endList);this.trigger({type:"playlistparsecomplete",metadata:n});this.trigger("loadedplaylist")}dispose(){this.trigger("dispose");this.stopRequest();e.clearTimeout(this.mediaUpdateTimeout);e.clearTimeout(this.finalRenditionTimeout);this.dateRangesStorage_=new DateRangesStorage;this.off()}stopRequest(){if(this.request){const e=this.request;this.request=null;e.onreadystatechange=null;e.abort()}}
/**
    * When called without any arguments, returns the currently
    * active media playlist. When called with a single argument,
    * triggers the playlist loader to asynchronously switch to the
    * specified media playlist. Calling this method while the
    * loader is in the HAVE_NOTHING causes an error to be emitted
    * but otherwise has no effect.
    *
    * @param {Object=} playlist the parsed media playlist
    * object to switch to
    * @param {boolean=} shouldDelay whether we should delay the request by half target duration
    *
    * @return {Playlist} the current loaded media
    */media(t,s){if(!t)return this.media_;if(this.state==="HAVE_NOTHING")throw new Error("Cannot switch media playlist from "+this.state);if(typeof t==="string"){if(!this.main.playlists[t])throw new Error("Unknown playlist URI: "+t);t=this.main.playlists[t]}e.clearTimeout(this.finalRenditionTimeout);if(s){const s=(t.partTargetDuration||t.targetDuration)/2*1e3||5e3;this.finalRenditionTimeout=e.setTimeout(this.media.bind(this,t,false),s);return}const i=this.state;const n=!this.media_||t.id!==this.media_.id;const r=this.main.playlists[t.id];if(r&&r.endList||t.endList&&t.segments.length){if(this.request){this.request.onreadystatechange=null;this.request.abort();this.request=null}this.state="HAVE_METADATA";this.media_=t;if(n){this.trigger("mediachanging");i==="HAVE_MAIN_MANIFEST"?this.trigger("loadedmetadata"):this.trigger("mediachange")}return}this.updateMediaUpdateTimeout_(refreshDelay(t,true));if(!n)return;this.state="SWITCHING_MEDIA";if(this.request){if(t.resolvedUri===this.request.url)return;this.request.onreadystatechange=null;this.request.abort();this.request=null}this.media_&&this.trigger("mediachanging");this.pendingMedia_=t;const a={playlistInfo:{type:"media",uri:t.uri}};this.trigger({type:"playlistrequeststart",metadata:a});this.request=this.vhs_.xhr({uri:t.resolvedUri,withCredentials:this.withCredentials,requestType:"hls-playlist"},((e,s)=>{if(this.request){t.lastRequest=Date.now();t.resolvedUri=resolveManifestRedirect(t.resolvedUri,s);if(e)return this.playlistRequestError(this.request,t,i);this.trigger({type:"playlistrequestcomplete",metadata:a});this.haveMetadata({playlistString:s.responseText,url:t.uri,id:t.id});i==="HAVE_MAIN_MANIFEST"?this.trigger("loadedmetadata"):this.trigger("mediachange")}}))}pause(){if(this.mediaUpdateTimeout){e.clearTimeout(this.mediaUpdateTimeout);this.mediaUpdateTimeout=null}this.stopRequest();this.state==="HAVE_NOTHING"&&(this.started=false);this.state==="SWITCHING_MEDIA"?this.media_?this.state="HAVE_METADATA":this.state="HAVE_MAIN_MANIFEST":this.state==="HAVE_CURRENT_METADATA"&&(this.state="HAVE_METADATA")}load(t){if(this.mediaUpdateTimeout){e.clearTimeout(this.mediaUpdateTimeout);this.mediaUpdateTimeout=null}const s=this.media();if(t){const t=s?(s.partTargetDuration||s.targetDuration)/2*1e3:5e3;this.mediaUpdateTimeout=e.setTimeout((()=>{this.mediaUpdateTimeout=null;this.load()}),t)}else this.started?s&&!s.endList?this.trigger("mediaupdatetimeout"):this.trigger("loadedplaylist"):this.start()}updateMediaUpdateTimeout_(t){if(this.mediaUpdateTimeout){e.clearTimeout(this.mediaUpdateTimeout);this.mediaUpdateTimeout=null}this.media()&&!this.media().endList&&(this.mediaUpdateTimeout=e.setTimeout((()=>{this.mediaUpdateTimeout=null;this.trigger("mediaupdatetimeout");this.updateMediaUpdateTimeout_(t)}),t))}start(){this.started=true;if(typeof this.src==="object"){this.src.uri||(this.src.uri=e.location.href);this.src.resolvedUri=this.src.uri;setTimeout((()=>{this.setupInitialPlaylist(this.src)}),0);return}const t={playlistInfo:{type:"multivariant",uri:this.src}};this.trigger({type:"playlistrequeststart",metadata:t});this.request=this.vhs_.xhr({uri:this.src,withCredentials:this.withCredentials,requestType:"hls-playlist"},((e,s)=>{if(!this.request)return;this.request=null;if(e){this.error={status:s.status,message:`HLS playlist request error at URL: ${this.src}.`,responseText:s.responseText,code:2,metadata:getStreamingNetworkErrorMetadata({requestType:s.requestType,request:s,error:e})};this.state==="HAVE_NOTHING"&&(this.started=false);return this.trigger("error")}this.trigger({type:"playlistrequestcomplete",metadata:t});this.src=resolveManifestRedirect(this.src,s);this.trigger({type:"playlistparsestart",metadata:t});const i=this.parseManifest_({manifestString:s.responseText,url:this.src});t.parsedPlaylist=playlistMetadataPayload(i.playlists,t.playlistInfo.type,false);this.trigger({type:"playlistparsecomplete",metadata:t});this.setupInitialPlaylist(i)}))}srcUri(){return typeof this.src==="string"?this.src:this.src.uri}
/**
   * Given a manifest object that's either a main or media playlist, trigger the proper
   * events and set the state of the playlist loader.
   *
   * If the manifest object represents a main playlist, `loadedplaylist` will be
   * triggered to allow listeners to select a playlist. If none is selected, the loader
   * will default to the first one in the playlists array.
   *
   * If the manifest object represents a media playlist, `loadedplaylist` will be
   * triggered followed by `loadedmetadata`, as the only available playlist is loaded.
   *
   * In the case of a media playlist, a main playlist object wrapper with one playlist
   * will be created so that all logic can handle playlists in the same fashion (as an
   * assumed manifest object schema).
   *
   * @param {Object} manifest
   *        The parsed manifest object
   */setupInitialPlaylist(t){this.state="HAVE_MAIN_MANIFEST";if(t.playlists){this.main=t;addPropertiesToMain(this.main,this.srcUri());t.playlists.forEach((e=>{e.segments=getAllSegments(e);e.segments.forEach((t=>{resolveSegmentUris(t,e.resolvedUri)}))}));this.trigger("loadedplaylist");this.request||this.media(this.main.playlists[0]);return}const s=this.srcUri()||e.location.href;this.main=mainForMedia(t,s);this.haveMetadata({playlistObject:t,url:s,id:this.main.playlists[0].id});this.trigger("loadedmetadata")}
/**
   * Updates or deletes a preexisting pathway clone.
   * Ensures that all playlists related to the old pathway clone are
   * either updated or deleted.
   *
   * @param {Object} clone On update, the pathway clone object for the newly updated pathway clone.
   *        On delete, the old pathway clone object to be deleted.
   * @param {boolean} isUpdate True if the pathway is to be updated,
   *        false if it is meant to be deleted.
   */updateOrDeleteClone(e,t){const s=this.main;const i=e.ID;let n=s.playlists.length;while(n--){const r=s.playlists[n];if(r.attributes["PATHWAY-ID"]===i){const a=r.resolvedUri;const o=r.id;if(t){const t=this.createCloneURI_(r.resolvedUri,e);const a=createPlaylistID(i,t);const o=this.createCloneAttributes_(i,r.attributes);const l=this.createClonePlaylist_(r,a,e,o);s.playlists[n]=l;s.playlists[a]=l;s.playlists[t]=l}else s.playlists.splice(n,1);delete s.playlists[o];delete s.playlists[a]}}this.updateOrDeleteCloneMedia(e,t)}
/**
   * Updates or deletes media data based on the pathway clone object.
   * Due to the complexity of the media groups and playlists, in all cases
   * we remove all of the old media groups and playlists.
   * On updates, we then create new media groups and playlists based on the
   * new pathway clone object.
   *
   * @param {Object} clone The pathway clone object for the newly updated pathway clone.
   * @param {boolean} isUpdate True if the pathway is to be updated,
   *        false if it is meant to be deleted.
   */updateOrDeleteCloneMedia(e,t){const s=this.main;const i=e.ID;["AUDIO","SUBTITLES","CLOSED-CAPTIONS"].forEach((e=>{if(s.mediaGroups[e]&&s.mediaGroups[e][i])for(const t in s.mediaGroups[e])if(t===i){for(const i in s.mediaGroups[e][t]){const n=s.mediaGroups[e][t][i];n.playlists.forEach(((e,t)=>{const i=s.playlists[e.id];const n=i.id;const r=i.resolvedUri;delete s.playlists[n];delete s.playlists[r]}))}delete s.mediaGroups[e][t]}}));t&&this.createClonedMediaGroups_(e)}
/**
   * Given a pathway clone object, clones all necessary playlists.
   *
   * @param {Object} clone The pathway clone object.
   * @param {Object} basePlaylist The original playlist to clone from.
   */addClonePathway(e,t={}){const s=this.main;const i=s.playlists.length;const n=this.createCloneURI_(t.resolvedUri,e);const r=createPlaylistID(e.ID,n);const a=this.createCloneAttributes_(e.ID,t.attributes);const o=this.createClonePlaylist_(t,r,e,a);s.playlists[i]=o;s.playlists[r]=o;s.playlists[n]=o;this.createClonedMediaGroups_(e)}
/**
   * Given a pathway clone object we create clones of all media.
   * In this function, all necessary information and updated playlists
   * are added to the `mediaGroup` object.
   * Playlists are also added to the `playlists` array so the media groups
   * will be properly linked.
   *
   * @param {Object} clone The pathway clone object.
   */createClonedMediaGroups_(e){const t=e.ID;const s=e["BASE-ID"];const i=this.main;["AUDIO","SUBTITLES","CLOSED-CAPTIONS"].forEach((r=>{if(i.mediaGroups[r]&&!i.mediaGroups[r][t])for(const a in i.mediaGroups[r])if(a===s){i.mediaGroups[r][t]={};for(const s in i.mediaGroups[r][a]){const o=i.mediaGroups[r][a][s];i.mediaGroups[r][t][s]=n({},o);const l=i.mediaGroups[r][t][s];const d=this.createCloneURI_(o.resolvedUri,e);l.resolvedUri=d;l.uri=d;l.playlists=[];o.playlists.forEach(((n,a)=>{const o=i.playlists[n.id];const d=groupID(r,t,s);const h=createPlaylistID(t,d);if(o&&!i.playlists[h]){const t=this.createClonePlaylist_(o,h,e);const s=t.resolvedUri;i.playlists[h]=t;i.playlists[s]=t}l.playlists[a]=this.createClonePlaylist_(n,h,e)}))}}}))}
/**
   * Using the original playlist to be cloned, and the pathway clone object
   * information, we create a new playlist.
   *
   * @param {Object} basePlaylist  The original playlist to be cloned from.
   * @param {string} id The desired id of the newly cloned playlist.
   * @param {Object} clone The pathway clone object.
   * @param {Object} attributes An optional object to populate the `attributes` property in the playlist.
   *
   * @return {Object} The combined cloned playlist.
   */createClonePlaylist_(e,t,s,i){const n=this.createCloneURI_(e.resolvedUri,s);const r={resolvedUri:n,uri:n,id:t};e.segments&&(r.segments=[]);i&&(r.attributes=i);return merge(e,r)}
/**
   * Generates an updated URI for a cloned pathway based on the original
   * pathway's URI and the paramaters from the pathway clone object in the
   * content steering server response.
   *
   * @param {string} baseUri URI to be updated in the cloned pathway.
   * @param {Object} clone The pathway clone object.
   *
   * @return {string} The updated URI for the cloned pathway.
   */createCloneURI_(e,t){const s=new URL(e);s.hostname=t["URI-REPLACEMENT"].HOST;const i=t["URI-REPLACEMENT"].PARAMS;for(const e of Object.keys(i))s.searchParams.set(e,i[e]);return s.href}
/**
   * Helper function to create the attributes needed for the new clone.
   * This mainly adds the necessary media attributes.
   *
   * @param {string} id The pathway clone object ID.
   * @param {Object} oldAttributes The old attributes to compare to.
   * @return {Object} The new attributes to add to the playlist.
   */createCloneAttributes_(e,t){const s={"PATHWAY-ID":e};["AUDIO","SUBTITLES","CLOSED-CAPTIONS"].forEach((i=>{t[i]&&(s[i]=e)}));return s}
/**
   * Returns the key ID set from a playlist
   *
   * @param {playlist} playlist to fetch the key ID set from.
   * @return a Set of 32 digit hex strings that represent the unique keyIds for that playlist.
   */getKeyIdSet(e){if(e.contentProtection){const t=new Set;for(const s in e.contentProtection){const i=e.contentProtection[s].attributes.keyId;i&&t.add(i.toLowerCase())}return t}}}const callbackWrapper=function(e,t,s,i){const n=e.responseType==="arraybuffer"?e.response:e.responseText;if(!t&&n){e.responseTime=Date.now();e.roundTripTime=e.responseTime-e.requestTime;e.bytesReceived=n.byteLength||n.length;e.bandwidth||(e.bandwidth=Math.floor(e.bytesReceived/e.roundTripTime*8*1e3))}s.headers&&(e.responseHeaders=s.headers);t&&t.code==="ETIMEDOUT"&&(e.timedout=true);t||e.aborted||s.statusCode===200||s.statusCode===206||s.statusCode===0||(t=new Error("XHR Failed with a response of: "+(e&&(n||e.responseText))));i(t,e)};
/**
 * Iterates over the request hooks Set and calls them in order
 *
 * @param {Set} hooks the hook Set to iterate over
 * @param {Object} options the request options to pass to the xhr wrapper
 * @return the callback hook function return value, the modified or new options Object.
 */const callAllRequestHooks=(e,t)=>{if(!e||!e.size)return;let s=t;e.forEach((e=>{s=e(s)}));return s};
/**
 * Iterates over the response hooks Set and calls them in order.
 *
 * @param {Set} hooks the hook Set to iterate over
 * @param {Object} request the xhr request object
 * @param {Object} error the xhr error object
 * @param {Object} response the xhr response object
 */const callAllResponseHooks=(e,t,s,i)=>{e&&e.size&&e.forEach((e=>{e(t,s,i)}))};const xhrFactory=function(){const e=function XhrFunction(e,t){e=merge({timeout:45e3},e);const s=XhrFunction.beforeRequest||videojs.Vhs.xhr.beforeRequest;const i=XhrFunction._requestCallbackSet||videojs.Vhs.xhr._requestCallbackSet||new Set;const n=XhrFunction._responseCallbackSet||videojs.Vhs.xhr._responseCallbackSet;if(s&&typeof s==="function"){videojs.log.warn("beforeRequest is deprecated, use onRequest instead.");i.add(s)}const r=videojs.Vhs.xhr.original===true?videojs.xhr:videojs.Vhs.xhr;const a=callAllRequestHooks(i,e);i.delete(s);const o=r(a||e,(function(e,s){callAllResponseHooks(n,o,e,s);return callbackWrapper(o,e,s,t)}));const l=o.abort;o.abort=function(){o.aborted=true;return l.apply(o,arguments)};o.uri=e.uri;o.requestType=e.requestType;o.requestTime=Date.now();return o};e.original=true;return e};
/**
 * Turns segment byterange into a string suitable for use in
 * HTTP Range requests
 *
 * @param {Object} byterange - an object with two values defining the start and end
 *                             of a byte-range
 */const byterangeStr=function(t){let s;const i=t.offset;s=typeof t.offset==="bigint"||typeof t.length==="bigint"?e.BigInt(t.offset)+e.BigInt(t.length)-e.BigInt(1):t.offset+t.length-1;return"bytes="+i+"-"+s};
/**
 * Defines headers for use in the xhr request for a particular segment.
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 */const segmentXhrHeaders=function(e){const t={};e.byterange&&(t.Range=byterangeStr(e.byterange));return t};
/**
 * convert a TimeRange to text
 *
 * @param {TimeRange} range the timerange to use for conversion
 * @param {number} i the iterator on the range to convert
 * @return {string} the range in string format
 */const textRange=function(e,t){return e.start(t)+"-"+e.end(t)};
/**
 * format a number as hex string
 *
 * @param {number} e The number
 * @param {number} i the iterator
 * @return {string} the hex formatted number as a string
 */const formatHexString=function(e,t){const s=e.toString(16);return"00".substring(0,2-s.length)+s+(t%2?" ":"")};const formatAsciiString=function(e){return e>=32&&e<126?String.fromCharCode(e):"."};
/**
 * Creates an object for sending to a web worker modifying properties that are TypedArrays
 * into a new object with seperated properties for the buffer, byteOffset, and byteLength.
 *
 * @param {Object} message
 *        Object of properties and values to send to the web worker
 * @return {Object}
 *         Modified message with TypedArray values expanded
 * @function createTransferableMessage
 */const createTransferableMessage=function(e){const t={};Object.keys(e).forEach((s=>{const i=e[s];y(i)?t[s]={bytes:i.buffer,byteOffset:i.byteOffset,byteLength:i.byteLength}:t[s]=i}));return t};
/**
 * Returns a unique string identifier for a media initialization
 * segment.
 *
 * @param {Object} initSegment
 *        the init segment object.
 *
 * @return {string} the generated init segment id
 */const initSegmentId=function(e){const t=e.byterange||{length:Infinity,offset:0};return[t.length,t.offset,e.resolvedUri].join(",")};
/**
 * Returns a unique string identifier for a media segment key.
 *
 * @param {Object} key the encryption key
 * @return {string} the unique id for the media segment key.
 */const segmentKeyId=function(e){return e.resolvedUri};
/**
 * utils to help dump binary data to the console
 *
 * @param {Array|TypedArray} data
 *        data to dump to a string
 *
 * @return {string} the data as a hex string.
 */const hexDump=e=>{const t=Array.prototype.slice.call(e);const s=16;let i="";let n;let r;for(let e=0;e<t.length/s;e++){n=t.slice(e*s,e*s+s).map(formatHexString).join("");r=t.slice(e*s,e*s+s).map(formatAsciiString).join("");i+=n+" "+r+"\n"}return i};const tagDump=({bytes:e})=>hexDump(e);const textRanges=e=>{let t="";let s;for(s=0;s<e.length;s++)t+=textRange(e,s)+" ";return t};var jt=Object.freeze({__proto__:null,createTransferableMessage:createTransferableMessage,initSegmentId:initSegmentId,segmentKeyId:segmentKeyId,hexDump:hexDump,tagDump:tagDump,textRanges:textRanges});const Ft=.25;
/**
 * Converts a player time (any time that can be gotten/set from player.currentTime(),
 * e.g., any time within player.seekable().start(0) to player.seekable().end(0)) to a
 * program time (any time referencing the real world (e.g., EXT-X-PROGRAM-DATE-TIME)).
 *
 * The containing segment is required as the EXT-X-PROGRAM-DATE-TIME serves as an "anchor
 * point" (a point where we have a mapping from program time to player time, with player
 * time being the post transmux start of the segment).
 *
 * For more details, see [this doc](../../docs/program-time-from-player-time.md).
 *
 * @param {number} playerTime the player time
 * @param {Object} segment the segment which contains the player time
 * @return {Date} program time
 */const playerTimeToProgramTime=(e,t)=>{if(!t.dateTimeObject)return null;const s=t.videoTimingInfo.transmuxerPrependedSeconds;const i=t.videoTimingInfo.transmuxedPresentationStart;const n=i+s;const r=e-n;return new Date(t.dateTimeObject.getTime()+r*1e3)};const originalSegmentVideoDuration=e=>e.transmuxedPresentationEnd-e.transmuxedPresentationStart-e.transmuxerPrependedSeconds;
/**
 * Finds a segment that contains the time requested given as an ISO-8601 string. The
 * returned segment might be an estimate or an accurate match.
 *
 * @param {string} programTime The ISO-8601 programTime to find a match for
 * @param {Object} playlist A playlist object to search within
 */const findSegmentForProgramTime=(e,t)=>{let s;try{s=new Date(e)}catch(e){return null}if(!t||!t.segments||t.segments.length===0)return null;let i=t.segments[0];if(s<new Date(i.dateTimeObject))return null;for(let e=0;e<t.segments.length-1;e++){i=t.segments[e];const n=new Date(t.segments[e+1].dateTimeObject);if(s<n)break}const n=t.segments[t.segments.length-1];const r=n.dateTimeObject;const a=n.videoTimingInfo?originalSegmentVideoDuration(n.videoTimingInfo):n.duration+n.duration*Ft;const o=new Date(r.getTime()+a*1e3);if(s>o)return null;s>new Date(r)&&(i=n);return{segment:i,estimatedStart:i.videoTimingInfo?i.videoTimingInfo.transmuxedPresentationStart:Mt.duration(t,t.mediaSequence+t.segments.indexOf(i)),type:i.videoTimingInfo?"accurate":"estimate"}};
/**
 * Finds a segment that contains the given player time(in seconds).
 *
 * @param {number} time The player time to find a match for
 * @param {Object} playlist A playlist object to search within
 */const findSegmentForPlayerTime=(e,t)=>{if(!t||!t.segments||t.segments.length===0)return null;let s=0;let i;for(let n=0;n<t.segments.length;n++){i=t.segments[n];s=i.videoTimingInfo?i.videoTimingInfo.transmuxedPresentationEnd:s+i.duration;if(e<=s)break}const n=t.segments[t.segments.length-1];if(n.videoTimingInfo&&n.videoTimingInfo.transmuxedPresentationEnd<e)return null;if(e>s){if(e>s+n.duration*Ft)return null;i=n}return{segment:i,estimatedStart:i.videoTimingInfo?i.videoTimingInfo.transmuxedPresentationStart:s-i.duration,type:i.videoTimingInfo?"accurate":"estimate"}};
/**
 * Gives the offset of the comparisonTimestamp from the programTime timestamp in seconds.
 * If the offset returned is positive, the programTime occurs after the
 * comparisonTimestamp.
 * If the offset is negative, the programTime occurs before the comparisonTimestamp.
 *
 * @param {string} comparisonTimeStamp An ISO-8601 timestamp to compare against
 * @param {string} programTime The programTime as an ISO-8601 string
 * @return {number} offset
 */const getOffsetFromTimestamp=(e,t)=>{let s;let i;try{s=new Date(e);i=new Date(t)}catch(e){}const n=s.getTime();const r=i.getTime();return(r-n)/1e3};
/**
 * Checks that all segments in this playlist have programDateTime tags.
 *
 * @param {Object} playlist A playlist object
 */const verifyProgramDateTimeTags=e=>{if(!e.segments||e.segments.length===0)return false;for(let t=0;t<e.segments.length;t++){const s=e.segments[t];if(!s.dateTimeObject)return false}return true};
/**
 * Returns the programTime of the media given a playlist and a playerTime.
 * The playlist must have programDateTime tags for a programDateTime tag to be returned.
 * If the segments containing the time requested have not been buffered yet, an estimate
 * may be returned to the callback.
 *
 * @param {Object} args
 * @param {Object} args.playlist A playlist object to search within
 * @param {number} time A playerTime in seconds
 * @param {Function} callback(err, programTime)
 * @return {string} err.message A detailed error message
 * @return {Object} programTime
 * @return {number} programTime.mediaSeconds The streamTime in seconds
 * @return {string} programTime.programDateTime The programTime as an ISO-8601 String
 */const getProgramTime=({playlist:e,time:t,callback:s})=>{if(!s)throw new Error("getProgramTime: callback must be provided");if(!e||t===void 0)return s({message:"getProgramTime: playlist and time must be provided"});const i=findSegmentForPlayerTime(t,e);if(!i)return s({message:"valid programTime was not found"});if(i.type==="estimate")return s({message:"Accurate programTime could not be determined. Please seek to e.seekTime and try again",seekTime:i.estimatedStart});const n={mediaSeconds:t};const r=playerTimeToProgramTime(t,i.segment);r&&(n.programDateTime=r.toISOString());return s(null,n)};
/**
 * Seeks in the player to a time that matches the given programTime ISO-8601 string.
 *
 * @param {Object} args
 * @param {string} args.programTime A programTime to seek to as an ISO-8601 String
 * @param {Object} args.playlist A playlist to look within
 * @param {number} args.retryCount The number of times to try for an accurate seek. Default is 2.
 * @param {Function} args.seekTo A method to perform a seek
 * @param {boolean} args.pauseAfterSeek Whether to end in a paused state after seeking. Default is true.
 * @param {Object} args.tech The tech to seek on
 * @param {Function} args.callback(err, newTime) A callback to return the new time to
 * @return {string} err.message A detailed error message
 * @return {number} newTime The exact time that was seeked to in seconds
 */const seekToProgramTime=({programTime:e,playlist:t,retryCount:s=2,seekTo:i,pauseAfterSeek:n=true,tech:r,callback:a})=>{if(!a)throw new Error("seekToProgramTime: callback must be provided");if(typeof e==="undefined"||!t||!i)return a({message:"seekToProgramTime: programTime, seekTo and playlist must be provided"});if(!t.endList&&!r.hasStarted_)return a({message:"player must be playing a live stream to start buffering"});if(!verifyProgramDateTimeTags(t))return a({message:"programDateTime tags must be provided in the manifest "+t.resolvedUri});const o=findSegmentForProgramTime(e,t);if(!o)return a({message:`${e} was not found in the stream`});const l=o.segment;const d=getOffsetFromTimestamp(l.dateTimeObject,e);if(o.type==="estimate"){if(s===0)return a({message:`${e} is not buffered yet. Try again`});i(o.estimatedStart+d);r.one("seeked",(()=>{seekToProgramTime({programTime:e,playlist:t,retryCount:s-1,seekTo:i,pauseAfterSeek:n,tech:r,callback:a})}));return}const h=l.start+d;const seekedCallback=()=>a(null,r.currentTime());r.one("seeked",seekedCallback);n&&r.pause();i(h)};const callbackOnCompleted=(e,t)=>{if(e.readyState===4)return t()};const containerRequest=(e,t,s,i)=>{let n=[];let r;let a=false;const endRequestAndCallback=function(e,t,i,n){t.abort();a=true;return s(e,t,i,n)};const progressListener=function(e,t){if(a)return;if(e){e.metadata=getStreamingNetworkErrorMetadata({requestType:i,request:t,error:e});return endRequestAndCallback(e,t,"",n)}const s=t.responseText.substring(n&&n.byteLength||0,t.responseText.length);n=_(n,v(s,true));r=r||E(n);if(n.length<10||r&&n.length<r+2)return callbackOnCompleted(t,(()=>endRequestAndCallback(e,t,"",n)));const o=x(n);return o==="ts"&&n.length<188||!o&&n.length<376?callbackOnCompleted(t,(()=>endRequestAndCallback(e,t,"",n))):endRequestAndCallback(null,t,o,n)};const o={uri:e,beforeSend(e){e.overrideMimeType("text/plain; charset=x-user-defined");e.addEventListener("progress",(function({total:t,loaded:s}){return callbackWrapper(e,null,{statusCode:e.status},progressListener)}))}};const l=t(o,(function(e,t){return callbackWrapper(l,e,t,progressListener)}));return l};const{EventTarget:Nt}=videojs;const dashPlaylistUnchanged=function(e,t){if(!isPlaylistUnchanged(e,t))return false;if(e.sidx&&t.sidx&&(e.sidx.offset!==t.sidx.offset||e.sidx.length!==t.sidx.length))return false;if(!e.sidx&&t.sidx||e.sidx&&!t.sidx)return false;if(e.segments&&!t.segments||!e.segments&&t.segments)return false;if(!e.segments&&!t.segments)return true;for(let s=0;s<e.segments.length;s++){const i=e.segments[s];const n=t.segments[s];if(i.uri!==n.uri)return false;if(!i.byterange&&!n.byterange)continue;const r=i.byterange;const a=n.byterange;if(r&&!a||!r&&a)return false;if(r.offset!==a.offset||r.length!==a.length)return false}return true};const dashGroupId=(e,t,s,i)=>{const n=i.attributes.NAME||s;return`placeholder-uri-${e}-${t}-${n}`};
/**
 * Parses the main XML string and updates playlist URI references.
 *
 * @param {Object} config
 *        Object of arguments
 * @param {string} config.mainXml
 *        The mpd XML
 * @param {string} config.srcUrl
 *        The mpd URL
 * @param {Date} config.clientOffset
 *         A time difference between server and client
 * @param {Object} config.sidxMapping
 *        SIDX mappings for moof/mdat URIs and byte ranges
 * @return {Object}
 *         The parsed mpd manifest object
 */const parseMainXml=({mainXml:e,srcUrl:t,clientOffset:s,sidxMapping:i,previousManifest:n})=>{const r=b(e,{manifestUri:t,clientOffset:s,sidxMapping:i,previousManifest:n});addPropertiesToMain(r,t,dashGroupId);return r};
/**
 * Removes any mediaGroup labels that no longer exist in the newMain
 *
 * @param {Object} update
 *         The previous mpd object being updated
 * @param {Object} newMain
 *         The new mpd object
 */const removeOldMediaGroupLabels=(e,t)=>{forEachMediaGroup(e,((s,i,n,r)=>{t.mediaGroups[i][n]&&r in t.mediaGroups[i][n]||delete e.mediaGroups[i][n][r]}))};
/**
 * Returns a new main manifest that is the result of merging an updated main manifest
 * into the original version.
 *
 * @param {Object} oldMain
 *        The old parsed mpd object
 * @param {Object} newMain
 *        The updated parsed mpd object
 * @return {Object}
 *         A new object representing the original main manifest with the updated media
 *         playlists merged in
 */const updateMain=(e,t,s)=>{let i=true;let n=merge(e,{duration:t.duration,minimumUpdatePeriod:t.minimumUpdatePeriod,timelineStarts:t.timelineStarts});for(let e=0;e<t.playlists.length;e++){const r=t.playlists[e];if(r.sidx){const e=S(r.sidx);s&&s[e]&&s[e].sidx&&C(r,s[e].sidx,r.sidx.resolvedUri)}const a=updateMain$1(n,r,dashPlaylistUnchanged);if(a){n=a;i=false}}forEachMediaGroup(t,((e,t,s,r)=>{if(e.playlists&&e.playlists.length){const a=e.playlists[0].id;const o=updateMain$1(n,e.playlists[0],dashPlaylistUnchanged);if(o){n=o;r in n.mediaGroups[t][s]||(n.mediaGroups[t][s][r]=e);n.mediaGroups[t][s][r].playlists[0]=n.playlists[a];i=false}}}));removeOldMediaGroupLabels(n,t);t.minimumUpdatePeriod!==e.minimumUpdatePeriod&&(i=false);return i?null:n};const equivalentSidx=(e,t)=>{const s=Boolean(!e.map&&!t.map);const i=s||Boolean(e.map&&t.map&&e.map.byterange.offset===t.map.byterange.offset&&e.map.byterange.length===t.map.byterange.length);return i&&e.uri===t.uri&&e.byterange.offset===t.byterange.offset&&e.byterange.length===t.byterange.length};const compareSidxEntry=(e,t)=>{const s={};for(const i in e){const n=e[i];const r=n.sidx;if(r){const e=S(r);if(!t[e])break;const i=t[e].sidxInfo;equivalentSidx(i,r)&&(s[e]=t[e])}}return s};
/**
 *  A function that filters out changed items as they need to be requested separately.
 *
 *  The method is exported for testing
 *
 *  @param {Object} main the parsed mpd XML returned via mpd-parser
 *  @param {Object} oldSidxMapping the SIDX to compare against
 */const filterChangedSidxMappings=(e,t)=>{const s=compareSidxEntry(e.playlists,t);let i=s;forEachMediaGroup(e,((e,s,n,r)=>{if(e.playlists&&e.playlists.length){const s=e.playlists;i=merge(i,compareSidxEntry(s,t))}}));return i};class DashPlaylistLoader extends Nt{constructor(e,t,s={},i){super();this.isPaused_=true;this.mainPlaylistLoader_=i||this;i||(this.isMain_=true);const{withCredentials:n=false}=s;this.vhs_=t;this.withCredentials=n;this.addMetadataToTextTrack=s.addMetadataToTextTrack;if(!e)throw new Error("A non-empty playlist URL or object is required");this.on("minimumUpdatePeriod",(()=>{this.refreshXml_()}));this.on("mediaupdatetimeout",(()=>{this.refreshMedia_(this.media().id)}));this.state="HAVE_NOTHING";this.loadedPlaylists_={};this.logger_=logger("DashPlaylistLoader");if(this.isMain_){this.mainPlaylistLoader_.srcUrl=e;this.mainPlaylistLoader_.sidxMapping_={}}else this.childPlaylist_=e}get isPaused(){return this.isPaused_}requestErrored_(e,t,s){if(!this.request)return true;this.request=null;if(e){this.error=typeof e!=="object"||e instanceof Error?{status:t.status,message:"DASH request error at URL: "+t.uri,response:t.response,code:2,metadata:e.metadata}:e;s&&(this.state=s);this.trigger("error");return true}}addSidxSegments_(t,s,i){const n=t.sidx&&S(t.sidx);if(!t.sidx||!n||this.mainPlaylistLoader_.sidxMapping_[n]){e.clearTimeout(this.mediaRequest_);this.mediaRequest_=e.setTimeout((()=>i(false)),0);return}const r=resolveManifestRedirect(t.sidx.resolvedUri);const fin=(e,r)=>{if(this.requestErrored_(e,r,s))return;const a=this.mainPlaylistLoader_.sidxMapping_;const{requestType:o}=r;let l;try{l=w(T(r.response).subarray(8))}catch(e){e.metadata=getStreamingNetworkErrorMetadata({requestType:o,request:r,parseFailure:true});this.requestErrored_(e,r,s);return}a[n]={sidxInfo:t.sidx,sidx:l};C(t,l,t.sidx.resolvedUri);return i(true)};const a="dash-sidx";this.request=containerRequest(r,this.vhs_.xhr,((e,s,i,n)=>{if(e)return fin(e,s);if(!i||i!=="mp4"){const e=i||"unknown";return fin({status:s.status,message:`Unsupported ${e} container type for sidx segment at URL: ${r}`,response:"",playlist:t,internal:true,playlistExclusionDuration:Infinity,code:2},s)}const{offset:a,length:o}=t.sidx.byterange;if(n.length>=o+a)return fin(e,{response:n.subarray(a,a+o),status:s.status,uri:s.uri});this.request=this.vhs_.xhr({uri:r,responseType:"arraybuffer",requestType:"dash-sidx",headers:segmentXhrHeaders({byterange:t.sidx.byterange})},fin)}),a)}dispose(){this.isPaused_=true;this.trigger("dispose");this.stopRequest();this.loadedPlaylists_={};e.clearTimeout(this.minimumUpdatePeriodTimeout_);e.clearTimeout(this.mediaRequest_);e.clearTimeout(this.mediaUpdateTimeout);this.mediaUpdateTimeout=null;this.mediaRequest_=null;this.minimumUpdatePeriodTimeout_=null;if(this.mainPlaylistLoader_.createMupOnMedia_){this.off("loadedmetadata",this.mainPlaylistLoader_.createMupOnMedia_);this.mainPlaylistLoader_.createMupOnMedia_=null}this.off()}hasPendingRequest(){return this.request||this.mediaRequest_}stopRequest(){if(this.request){const e=this.request;this.request=null;e.onreadystatechange=null;e.abort()}}media(e){if(!e)return this.media_;if(this.state==="HAVE_NOTHING")throw new Error("Cannot switch media playlist from "+this.state);const t=this.state;if(typeof e==="string"){if(!this.mainPlaylistLoader_.main.playlists[e])throw new Error("Unknown playlist URI: "+e);e=this.mainPlaylistLoader_.main.playlists[e]}const s=!this.media_||e.id!==this.media_.id;if(s&&this.loadedPlaylists_[e.id]&&this.loadedPlaylists_[e.id].endList){this.state="HAVE_METADATA";this.media_=e;if(s){this.trigger("mediachanging");this.trigger("mediachange")}}else if(s){this.media_&&this.trigger("mediachanging");this.addSidxSegments_(e,t,(s=>{this.haveMetadata({startingState:t,playlist:e})}))}}haveMetadata({startingState:t,playlist:s}){this.state="HAVE_METADATA";this.loadedPlaylists_[s.id]=s;e.clearTimeout(this.mediaRequest_);this.mediaRequest_=null;this.refreshMedia_(s.id);t==="HAVE_MAIN_MANIFEST"?this.trigger("loadedmetadata"):this.trigger("mediachange")}pause(){this.isPaused_=true;if(this.mainPlaylistLoader_.createMupOnMedia_){this.off("loadedmetadata",this.mainPlaylistLoader_.createMupOnMedia_);this.mainPlaylistLoader_.createMupOnMedia_=null}this.stopRequest();e.clearTimeout(this.mediaUpdateTimeout);this.mediaUpdateTimeout=null;if(this.isMain_){e.clearTimeout(this.mainPlaylistLoader_.minimumUpdatePeriodTimeout_);this.mainPlaylistLoader_.minimumUpdatePeriodTimeout_=null}this.state==="HAVE_NOTHING"&&(this.started=false)}load(t){this.isPaused_=false;e.clearTimeout(this.mediaUpdateTimeout);this.mediaUpdateTimeout=null;const s=this.media();if(t){const t=s?s.targetDuration/2*1e3:5e3;this.mediaUpdateTimeout=e.setTimeout((()=>this.load()),t)}else if(this.started)if(s&&!s.endList){if(this.isMain_&&!this.minimumUpdatePeriodTimeout_){this.trigger("minimumUpdatePeriod");this.updateMinimumUpdatePeriodTimeout_()}this.trigger("mediaupdatetimeout")}else this.trigger("loadedplaylist");else this.start()}start(){this.started=true;if(this.isMain_)this.requestMain_(((e,t)=>{this.haveMain_();this.hasPendingRequest()||this.media_||this.media(this.mainPlaylistLoader_.main.playlists[0])}));else{e.clearTimeout(this.mediaRequest_);this.mediaRequest_=e.setTimeout((()=>this.haveMain_()),0)}}requestMain_(e){const t={manifestInfo:{uri:this.mainPlaylistLoader_.srcUrl}};this.trigger({type:"manifestrequeststart",metadata:t});this.request=this.vhs_.xhr({uri:this.mainPlaylistLoader_.srcUrl,withCredentials:this.withCredentials,requestType:"dash-manifest"},((s,i)=>{if(s){const{requestType:e}=i;s.metadata=getStreamingNetworkErrorMetadata({requestType:e,request:i,error:s})}if(this.requestErrored_(s,i)){this.state==="HAVE_NOTHING"&&(this.started=false);return}this.trigger({type:"manifestrequestcomplete",metadata:t});const n=i.responseText!==this.mainPlaylistLoader_.mainXml_;this.mainPlaylistLoader_.mainXml_=i.responseText;i.responseHeaders&&i.responseHeaders.date?this.mainLoaded_=Date.parse(i.responseHeaders.date):this.mainLoaded_=Date.now();this.mainPlaylistLoader_.srcUrl=resolveManifestRedirect(this.mainPlaylistLoader_.srcUrl,i);if(!n)return e(i,n);this.handleMain_();this.syncClientServerClock_((()=>e(i,n)))}))}
/**
   * Parses the main xml for UTCTiming node to sync the client clock to the server
   * clock. If the UTCTiming node requires a HEAD or GET request, that request is made.
   *
   * @param {Function} done
   *        Function to call when clock sync has completed
   */syncClientServerClock_(e){const t=k(this.mainPlaylistLoader_.mainXml_);if(t===null){this.mainPlaylistLoader_.clientOffset_=this.mainLoaded_-Date.now();return e()}if(t.method==="DIRECT"){this.mainPlaylistLoader_.clientOffset_=t.value-Date.now();return e()}this.request=this.vhs_.xhr({uri:At(this.mainPlaylistLoader_.srcUrl,t.value),method:t.method,withCredentials:this.withCredentials,requestType:"dash-clock-sync"},((s,i)=>{if(!this.request)return;if(s){const{requestType:t}=i;this.error.metadata=getStreamingNetworkErrorMetadata({requestType:t,request:i,error:s});this.mainPlaylistLoader_.clientOffset_=this.mainLoaded_-Date.now();return e()}let n;n=t.method==="HEAD"?i.responseHeaders&&i.responseHeaders.date?Date.parse(i.responseHeaders.date):this.mainLoaded_:Date.parse(i.responseText);this.mainPlaylistLoader_.clientOffset_=n-Date.now();e()}))}haveMain_(){this.state="HAVE_MAIN_MANIFEST";this.isMain_?this.trigger("loadedplaylist"):this.media_||this.media(this.childPlaylist_)}handleMain_(){e.clearTimeout(this.mediaRequest_);this.mediaRequest_=null;const t=this.mainPlaylistLoader_.main;const s={manifestInfo:{uri:this.mainPlaylistLoader_.srcUrl}};this.trigger({type:"manifestparsestart",metadata:s});let i;try{i=parseMainXml({mainXml:this.mainPlaylistLoader_.mainXml_,srcUrl:this.mainPlaylistLoader_.srcUrl,clientOffset:this.mainPlaylistLoader_.clientOffset_,sidxMapping:this.mainPlaylistLoader_.sidxMapping_,previousManifest:t})}catch(e){this.error=e;this.error.metadata={errorType:videojs.Error.StreamingDashManifestParserError,error:e};this.trigger("error")}t&&(i=updateMain(t,i,this.mainPlaylistLoader_.sidxMapping_));this.mainPlaylistLoader_.main=i||t;const n=this.mainPlaylistLoader_.main.locations&&this.mainPlaylistLoader_.main.locations[0];n&&n!==this.mainPlaylistLoader_.srcUrl&&(this.mainPlaylistLoader_.srcUrl=n);(!t||i&&i.minimumUpdatePeriod!==t.minimumUpdatePeriod)&&this.updateMinimumUpdatePeriodTimeout_();this.addEventStreamToMetadataTrack_(i);if(i){const{duration:e,endList:t}=i;const n=[];i.playlists.forEach((e=>{n.push({id:e.id,bandwidth:e.attributes.BANDWIDTH,resolution:e.attributes.RESOLUTION,codecs:e.attributes.CODECS})}));const r={duration:e,isLive:!t,renditions:n};s.parsedManifest=r;this.trigger({type:"manifestparsecomplete",metadata:s})}return Boolean(i)}updateMinimumUpdatePeriodTimeout_(){const t=this.mainPlaylistLoader_;if(t.createMupOnMedia_){t.off("loadedmetadata",t.createMupOnMedia_);t.createMupOnMedia_=null}if(t.minimumUpdatePeriodTimeout_){e.clearTimeout(t.minimumUpdatePeriodTimeout_);t.minimumUpdatePeriodTimeout_=null}let s=t.main&&t.main.minimumUpdatePeriod;if(s===0)if(t.media())s=t.media().targetDuration*1e3;else{t.createMupOnMedia_=t.updateMinimumUpdatePeriodTimeout_;t.one("loadedmetadata",t.createMupOnMedia_)}typeof s!=="number"||s<=0?s<0&&this.logger_(`found invalid minimumUpdatePeriod of ${s}, not setting a timeout`):this.createMUPTimeout_(s)}createMUPTimeout_(t){const s=this.mainPlaylistLoader_;s.minimumUpdatePeriodTimeout_=e.setTimeout((()=>{s.minimumUpdatePeriodTimeout_=null;s.trigger("minimumUpdatePeriod");s.createMUPTimeout_(t)}),t)}refreshXml_(){this.requestMain_(((e,t)=>{if(t){this.media_&&(this.media_=this.mainPlaylistLoader_.main.playlists[this.media_.id]);this.mainPlaylistLoader_.sidxMapping_=filterChangedSidxMappings(this.mainPlaylistLoader_.main,this.mainPlaylistLoader_.sidxMapping_);this.addSidxSegments_(this.media(),this.state,(e=>{this.refreshMedia_(this.media().id)}))}}))}refreshMedia_(t){if(!t)throw new Error("refreshMedia_ must take a media id");this.media_&&this.isMain_&&this.handleMain_();const s=this.mainPlaylistLoader_.main.playlists;const i=!this.media_||this.media_!==s[t];i?this.media_=s[t]:this.trigger("playlistunchanged");if(!this.mediaUpdateTimeout){const createMediaUpdateTimeout=()=>{this.media().endList||(this.mediaUpdateTimeout=e.setTimeout((()=>{this.trigger("mediaupdatetimeout");createMediaUpdateTimeout()}),refreshDelay(this.media(),Boolean(i))))};createMediaUpdateTimeout()}this.trigger("loadedplaylist")}
/**
   * Takes eventstream data from a parsed DASH manifest and adds it to the metadata text track.
   *
   * @param {manifest} newMain the newly parsed manifest
   */addEventStreamToMetadataTrack_(e){if(e&&this.mainPlaylistLoader_.main.eventStream){const e=this.mainPlaylistLoader_.main.eventStream.map((e=>({cueTime:e.start,frames:[{data:e.messageData}]})));this.addMetadataToTextTrack("EventStream",e,this.mainPlaylistLoader_.main.duration)}}
/**
   * Returns the key ID set from a playlist
   *
   * @param {playlist} playlist to fetch the key ID set from.
   * @return a Set of 32 digit hex strings that represent the unique keyIds for that playlist.
   */getKeyIdSet(e){if(e.contentProtection){const t=new Set;for(const s in e.contentProtection){const i=e.contentProtection[s].attributes["cenc:default_KID"];i&&t.add(i.replace(/-/g,"").toLowerCase())}return t}}}var $t={GOAL_BUFFER_LENGTH:30,MAX_GOAL_BUFFER_LENGTH:60,BACK_BUFFER_LENGTH:30,GOAL_BUFFER_LENGTH_RATE:1,INITIAL_BANDWIDTH:4194304,BANDWIDTH_VARIANCE:1.2,BUFFER_LOW_WATER_LINE:0,MAX_BUFFER_LOW_WATER_LINE:30,EXPERIMENTAL_MAX_BUFFER_LOW_WATER_LINE:16,BUFFER_LOW_WATER_LINE_RATE:1,BUFFER_HIGH_WATER_LINE:30};const stringToArrayBuffer=e=>{const t=new Uint8Array(new ArrayBuffer(e.length));for(let s=0;s<e.length;s++)t[s]=e.charCodeAt(s);return t.buffer};const browserWorkerPolyFill=function(e){e.on=e.addEventListener;e.off=e.removeEventListener;return e};const createObjectURL=function(e){try{return URL.createObjectURL(new Blob([e],{type:"application/javascript"}))}catch(t){const s=new BlobBuilder;s.append(e);return URL.createObjectURL(s.getBlob())}};const factory=function(e){return function(){const t=createObjectURL(e);const s=browserWorkerPolyFill(new Worker(t));s.objURL=t;const i=s.terminate;s.on=s.addEventListener;s.off=s.removeEventListener;s.terminate=function(){URL.revokeObjectURL(t);return i.call(this)};return s}};const transform=function(e){return`var browserWorkerPolyFill = ${browserWorkerPolyFill.toString()};\nbrowserWorkerPolyFill(self);\n`+e};const getWorkerString=function(e){return e.toString().replace(/^function.+?{/,"").slice(0,-1)};const Ht=transform(getWorkerString((function(){var e=typeof globalThis!=="undefined"?globalThis:typeof window!=="undefined"?window:typeof global!=="undefined"?global:typeof self!=="undefined"?self:{};var Stream$8=function(){this.init=function(){var e={};
/**
       * Add a listener for a specified event type.
       * @param type {string} the event name
       * @param listener {function} the callback to be invoked when an event of
       * the specified type occurs
       */this.on=function(t,s){e[t]||(e[t]=[]);e[t]=e[t].concat(s)};
/**
       * Remove a listener for a specified event type.
       * @param type {string} the event name
       * @param listener {function} a function previously registered for this
       * type of event through `on`
       */this.off=function(t,s){var i;if(!e[t])return false;i=e[t].indexOf(s);e[t]=e[t].slice();e[t].splice(i,1);return i>-1};
/**
       * Trigger an event of the specified type on this stream. Any additional
       * arguments to this function are passed as parameters to event listeners.
       * @param type {string} the event name
       */this.trigger=function(t){var s,i,n,r;s=e[t];if(s)if(arguments.length===2){n=s.length;for(i=0;i<n;++i)s[i].call(this,arguments[1])}else{r=[];i=arguments.length;for(i=1;i<arguments.length;++i)r.push(arguments[i]);n=s.length;for(i=0;i<n;++i)s[i].apply(this,r)}};this.dispose=function(){e={}}}};
/**
   * Forwards all `data` events on this stream to the destination stream. The
   * destination stream should provide a method `push` to receive the data
   * events as they arrive.
   * @param destination {stream} the stream that will receive all `data` events
   * @param autoFlush {boolean} if false, we will not call `flush` on the destination
   *                            when the current stream emits a 'done' event
   * @see http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
   */Stream$8.prototype.pipe=function(e){this.on("data",(function(t){e.push(t)}));this.on("done",(function(t){e.flush(t)}));this.on("partialdone",(function(t){e.partialFlush(t)}));this.on("endedtimeline",(function(t){e.endTimeline(t)}));this.on("reset",(function(t){e.reset(t)}));return e};Stream$8.prototype.push=function(e){this.trigger("data",e)};Stream$8.prototype.flush=function(e){this.trigger("done",e)};Stream$8.prototype.partialFlush=function(e){this.trigger("partialdone",e)};Stream$8.prototype.endTimeline=function(e){this.trigger("endedtimeline",e)};Stream$8.prototype.reset=function(e){this.trigger("reset",e)};var t=Stream$8;var s=Math.pow(2,32);var getUint64$5=function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength);var i;if(t.getBigUint64){i=t.getBigUint64(0);return i<Number.MAX_SAFE_INTEGER?Number(i):i}return t.getUint32(0)*s+t.getUint32(4)};var i={getUint64:getUint64$5,MAX_UINT32:s};var n=i.MAX_UINT32;var r,a,o,l,d,h,c,u,p,m,f,g,y,_,v,T,b,S,C,k,w,E,x,I,P,L,A,D,O,M,U,R,B,j,F,N;(function(){var e;x={avc1:[],avcC:[],btrt:[],dinf:[],dref:[],esds:[],ftyp:[],hdlr:[],mdat:[],mdhd:[],mdia:[],mfhd:[],minf:[],moof:[],moov:[],mp4a:[],mvex:[],mvhd:[],pasp:[],sdtp:[],smhd:[],stbl:[],stco:[],stsc:[],stsd:[],stsz:[],stts:[],styp:[],tfdt:[],tfhd:[],traf:[],trak:[],trun:[],trex:[],tkhd:[],vmhd:[]};if(typeof Uint8Array!=="undefined"){for(e in x)x.hasOwnProperty(e)&&(x[e]=[e.charCodeAt(0),e.charCodeAt(1),e.charCodeAt(2),e.charCodeAt(3)]);I=new Uint8Array(["i".charCodeAt(0),"s".charCodeAt(0),"o".charCodeAt(0),"m".charCodeAt(0)]);L=new Uint8Array(["a".charCodeAt(0),"v".charCodeAt(0),"c".charCodeAt(0),"1".charCodeAt(0)]);P=new Uint8Array([0,0,0,1]);A=new Uint8Array([0,0,0,0,0,0,0,0,118,105,100,101,0,0,0,0,0,0,0,0,0,0,0,0,86,105,100,101,111,72,97,110,100,108,101,114,0]);D=new Uint8Array([0,0,0,0,0,0,0,0,115,111,117,110,0,0,0,0,0,0,0,0,0,0,0,0,83,111,117,110,100,72,97,110,100,108,101,114,0]);O={video:A,audio:D};R=new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,12,117,114,108,32,0,0,0,1]);U=new Uint8Array([0,0,0,0,0,0,0,0]);B=new Uint8Array([0,0,0,0,0,0,0,0]);j=B;F=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0]);N=B;M=new Uint8Array([0,0,0,1,0,0,0,0,0,0,0,0])}})();r=function(e){var t,s,i,n=[],r=0;for(t=1;t<arguments.length;t++)n.push(arguments[t]);t=n.length;while(t--)r+=n[t].byteLength;s=new Uint8Array(r+8);i=new DataView(s.buffer,s.byteOffset,s.byteLength);i.setUint32(0,s.byteLength);s.set(e,4);for(t=0,r=8;t<n.length;t++){s.set(n[t],r);r+=n[t].byteLength}return s};a=function(){return r(x.dinf,r(x.dref,R))};o=function(e){return r(x.esds,new Uint8Array([0,0,0,0,3,25,0,0,0,4,17,64,21,0,6,0,0,0,218,192,0,0,218,192,5,2,e.audioobjecttype<<3|e.samplingfrequencyindex>>>1,e.samplingfrequencyindex<<7|e.channelcount<<3,6,1,2]))};l=function(){return r(x.ftyp,I,P,I,L)};T=function(e){return r(x.hdlr,O[e])};d=function(e){return r(x.mdat,e)};v=function(e){var t=new Uint8Array([0,0,0,0,0,0,0,2,0,0,0,3,0,1,95,144,e.duration>>>24&255,e.duration>>>16&255,e.duration>>>8&255,e.duration&255,85,196,0,0]);if(e.samplerate){t[12]=e.samplerate>>>24&255;t[13]=e.samplerate>>>16&255;t[14]=e.samplerate>>>8&255;t[15]=e.samplerate&255}return r(x.mdhd,t)};_=function(e){return r(x.mdia,v(e),T(e.type),c(e))};h=function(e){return r(x.mfhd,new Uint8Array([0,0,0,0,(e&4278190080)>>24,(e&16711680)>>16,(e&65280)>>8,e&255]))};c=function(e){return r(x.minf,e.type==="video"?r(x.vmhd,M):r(x.smhd,U),a(),S(e))};u=function(e,t){var s=[],i=t.length;while(i--)s[i]=k(t[i]);return r.apply(null,[x.moof,h(e)].concat(s))};
/**
   * Returns a movie box.
   * @param tracks {array} the tracks associated with this movie
   * @see ISO/IEC 14496-12:2012(E), section 8.2.1
   */p=function(e){var t=e.length,s=[];while(t--)s[t]=g(e[t]);return r.apply(null,[x.moov,f(4294967295)].concat(s).concat(m(e)))};m=function(e){var t=e.length,s=[];while(t--)s[t]=w(e[t]);return r.apply(null,[x.mvex].concat(s))};f=function(e){var t=new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,2,0,1,95,144,(e&4278190080)>>24,(e&16711680)>>16,(e&65280)>>8,e&255,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255]);return r(x.mvhd,t)};b=function(e){var t,s,i=e.samples||[],n=new Uint8Array(4+i.length);for(s=0;s<i.length;s++){t=i[s].flags;n[s+4]=t.dependsOn<<4|t.isDependedOn<<2|t.hasRedundancy}return r(x.sdtp,n)};S=function(e){return r(x.stbl,C(e),r(x.stts,N),r(x.stsc,j),r(x.stsz,F),r(x.stco,B))};(function(){var e,t;C=function(s){return r(x.stsd,new Uint8Array([0,0,0,0,0,0,0,1]),s.type==="video"?e(s):t(s))};e=function(e){var t,s,i=e.sps||[],n=e.pps||[],a=[],o=[];for(t=0;t<i.length;t++){a.push((i[t].byteLength&65280)>>>8);a.push(i[t].byteLength&255);a=a.concat(Array.prototype.slice.call(i[t]))}for(t=0;t<n.length;t++){o.push((n[t].byteLength&65280)>>>8);o.push(n[t].byteLength&255);o=o.concat(Array.prototype.slice.call(n[t]))}s=[x.avc1,new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(e.width&65280)>>8,e.width&255,(e.height&65280)>>8,e.height&255,0,72,0,0,0,72,0,0,0,0,0,0,0,1,19,118,105,100,101,111,106,115,45,99,111,110,116,114,105,98,45,104,108,115,0,0,0,0,0,0,0,0,0,0,0,0,0,24,17,17]),r(x.avcC,new Uint8Array([1,e.profileIdc,e.profileCompatibility,e.levelIdc,255].concat([i.length],a,[n.length],o))),r(x.btrt,new Uint8Array([0,28,156,128,0,45,198,192,0,45,198,192]))];if(e.sarRatio){var l=e.sarRatio[0],d=e.sarRatio[1];s.push(r(x.pasp,new Uint8Array([(l&4278190080)>>24,(l&16711680)>>16,(l&65280)>>8,l&255,(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255])))}return r.apply(null,s)};t=function(e){return r(x.mp4a,new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,(e.channelcount&65280)>>8,e.channelcount&255,(e.samplesize&65280)>>8,e.samplesize&255,0,0,0,0,(e.samplerate&65280)>>8,e.samplerate&255,0,0]),o(e))}})();y=function(e){var t=new Uint8Array([0,0,0,7,0,0,0,0,0,0,0,0,(e.id&4278190080)>>24,(e.id&16711680)>>16,(e.id&65280)>>8,e.id&255,0,0,0,0,(e.duration&4278190080)>>24,(e.duration&16711680)>>16,(e.duration&65280)>>8,e.duration&255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,(e.width&65280)>>8,e.width&255,0,0,(e.height&65280)>>8,e.height&255,0,0]);return r(x.tkhd,t)};k=function(e){var t,s,i,a,o,l,d;t=r(x.tfhd,new Uint8Array([0,0,0,58,(e.id&4278190080)>>24,(e.id&16711680)>>16,(e.id&65280)>>8,e.id&255,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0]));l=Math.floor(e.baseMediaDecodeTime/n);d=Math.floor(e.baseMediaDecodeTime%n);s=r(x.tfdt,new Uint8Array([1,0,0,0,l>>>24&255,l>>>16&255,l>>>8&255,l&255,d>>>24&255,d>>>16&255,d>>>8&255,d&255]));o=92;if(e.type==="audio"){i=E(e,o);return r(x.traf,t,s,i)}a=b(e);i=E(e,a.length+o);return r(x.traf,t,s,i,a)};
/**
   * Generate a track box.
   * @param track {object} a track definition
   * @return {Uint8Array} the track box
   */g=function(e){e.duration=e.duration||4294967295;return r(x.trak,y(e),_(e))};w=function(e){var t=new Uint8Array([0,0,0,0,(e.id&4278190080)>>24,(e.id&16711680)>>16,(e.id&65280)>>8,e.id&255,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1]);e.type!=="video"&&(t[t.length-1]=0);return r(x.trex,t)};(function(){var e,t,s;s=function(e,t){var s=0,i=0,n=0,r=0;if(e.length){e[0].duration!==void 0&&(s=1);e[0].size!==void 0&&(i=2);e[0].flags!==void 0&&(n=4);e[0].compositionTimeOffset!==void 0&&(r=8)}return[0,0,s|i|n|r,1,(e.length&4278190080)>>>24,(e.length&16711680)>>>16,(e.length&65280)>>>8,e.length&255,(t&4278190080)>>>24,(t&16711680)>>>16,(t&65280)>>>8,t&255]};t=function(e,t){var i,n,a,o,l,d;o=e.samples||[];t+=20+16*o.length;a=s(o,t);n=new Uint8Array(a.length+o.length*16);n.set(a);i=a.length;for(d=0;d<o.length;d++){l=o[d];n[i++]=(l.duration&4278190080)>>>24;n[i++]=(l.duration&16711680)>>>16;n[i++]=(l.duration&65280)>>>8;n[i++]=l.duration&255;n[i++]=(l.size&4278190080)>>>24;n[i++]=(l.size&16711680)>>>16;n[i++]=(l.size&65280)>>>8;n[i++]=l.size&255;n[i++]=l.flags.isLeading<<2|l.flags.dependsOn;n[i++]=l.flags.isDependedOn<<6|l.flags.hasRedundancy<<4|l.flags.paddingValue<<1|l.flags.isNonSyncSample;n[i++]=l.flags.degradationPriority&61440;n[i++]=l.flags.degradationPriority&15;n[i++]=(l.compositionTimeOffset&4278190080)>>>24;n[i++]=(l.compositionTimeOffset&16711680)>>>16;n[i++]=(l.compositionTimeOffset&65280)>>>8;n[i++]=l.compositionTimeOffset&255}return r(x.trun,n)};e=function(e,t){var i,n,a,o,l,d;o=e.samples||[];t+=20+8*o.length;a=s(o,t);i=new Uint8Array(a.length+o.length*8);i.set(a);n=a.length;for(d=0;d<o.length;d++){l=o[d];i[n++]=(l.duration&4278190080)>>>24;i[n++]=(l.duration&16711680)>>>16;i[n++]=(l.duration&65280)>>>8;i[n++]=l.duration&255;i[n++]=(l.size&4278190080)>>>24;i[n++]=(l.size&16711680)>>>16;i[n++]=(l.size&65280)>>>8;i[n++]=l.size&255}return r(x.trun,i)};E=function(s,i){return s.type==="audio"?e(s,i):t(s,i)}})();var $={ftyp:l,mdat:d,moof:u,moov:p,initSegment:function(e){var t,s=l(),i=p(e);t=new Uint8Array(s.byteLength+i.byteLength);t.set(s);t.set(i,s.byteLength);return t}};var groupNalsIntoFrames=function(e){var t,s,i=[],n=[];n.byteLength=0;n.nalCount=0;n.duration=0;i.byteLength=0;for(t=0;t<e.length;t++){s=e[t];if(s.nalUnitType==="access_unit_delimiter_rbsp"){if(i.length){i.duration=s.dts-i.dts;n.byteLength+=i.byteLength;n.nalCount+=i.length;n.duration+=i.duration;n.push(i)}i=[s];i.byteLength=s.data.byteLength;i.pts=s.pts;i.dts=s.dts}else{s.nalUnitType==="slice_layer_without_partitioning_rbsp_idr"&&(i.keyFrame=true);i.duration=s.dts-i.dts;i.byteLength+=s.data.byteLength;i.push(s)}}n.length&&(!i.duration||i.duration<=0)&&(i.duration=n[n.length-1].duration);n.byteLength+=i.byteLength;n.nalCount+=i.length;n.duration+=i.duration;n.push(i);return n};var groupFramesIntoGops=function(e){var t,s,i=[],n=[];i.byteLength=0;i.nalCount=0;i.duration=0;i.pts=e[0].pts;i.dts=e[0].dts;n.byteLength=0;n.nalCount=0;n.duration=0;n.pts=e[0].pts;n.dts=e[0].dts;for(t=0;t<e.length;t++){s=e[t];if(s.keyFrame){if(i.length){n.push(i);n.byteLength+=i.byteLength;n.nalCount+=i.nalCount;n.duration+=i.duration}i=[s];i.nalCount=s.length;i.byteLength=s.byteLength;i.pts=s.pts;i.dts=s.dts;i.duration=s.duration}else{i.duration+=s.duration;i.nalCount+=s.length;i.byteLength+=s.byteLength;i.push(s)}}n.length&&i.duration<=0&&(i.duration=n[n.length-1].duration);n.byteLength+=i.byteLength;n.nalCount+=i.nalCount;n.duration+=i.duration;n.push(i);return n};
/*
   * Search for the first keyframe in the GOPs and throw away all frames
   * until that keyframe. Then extend the duration of the pulled keyframe
   * and pull the PTS and DTS of the keyframe so that it covers the time
   * range of the frames that were disposed.
   *
   * @param {Array} gops video GOPs
   * @returns {Array} modified video GOPs
   */var extendFirstKeyFrame=function(e){var t;if(!e[0][0].keyFrame&&e.length>1){t=e.shift();e.byteLength-=t.byteLength;e.nalCount-=t.nalCount;e[0][0].dts=t.dts;e[0][0].pts=t.pts;e[0][0].duration+=t.duration}return e};var createDefaultSample=function(){return{size:0,flags:{isLeading:0,dependsOn:1,isDependedOn:0,hasRedundancy:0,degradationPriority:0,isNonSyncSample:1}}};
/*
   * Collates information from a video frame into an object for eventual
   * entry into an MP4 sample table.
   *
   * @param {Object} frame the video frame
   * @param {Number} dataOffset the byte offset to position the sample
   * @return {Object} object containing sample table info for a frame
   */var sampleForFrame=function(e,t){var s=createDefaultSample();s.dataOffset=t;s.compositionTimeOffset=e.pts-e.dts;s.duration=e.duration;s.size=4*e.length;s.size+=e.byteLength;if(e.keyFrame){s.flags.dependsOn=2;s.flags.isNonSyncSample=0}return s};var generateSampleTable$1=function(e,t){var s,i,n,r,a,o=t||0,l=[];for(s=0;s<e.length;s++){r=e[s];for(i=0;i<r.length;i++){a=r[i];n=sampleForFrame(a,o);o+=n.size;l.push(n)}}return l};var concatenateNalData=function(e){var t,s,i,n,r,a,o=0,l=e.byteLength,d=e.nalCount,h=l+4*d,c=new Uint8Array(h),u=new DataView(c.buffer);for(t=0;t<e.length;t++){n=e[t];for(s=0;s<n.length;s++){r=n[s];for(i=0;i<r.length;i++){a=r[i];u.setUint32(o,a.data.byteLength);o+=4;c.set(a.data,o);o+=a.data.byteLength}}}return c};var generateSampleTableForFrame=function(e,t){var s,i=t||0,n=[];s=sampleForFrame(e,i);n.push(s);return n};var concatenateNalDataForFrame=function(e){var t,s,i=0,n=e.byteLength,r=e.length,a=n+4*r,o=new Uint8Array(a),l=new DataView(o.buffer);for(t=0;t<e.length;t++){s=e[t];l.setUint32(i,s.data.byteLength);i+=4;o.set(s.data,i);i+=s.data.byteLength}return o};var H={groupNalsIntoFrames:groupNalsIntoFrames,groupFramesIntoGops:groupFramesIntoGops,extendFirstKeyFrame:extendFirstKeyFrame,generateSampleTable:generateSampleTable$1,concatenateNalData:concatenateNalData,generateSampleTableForFrame:generateSampleTableForFrame,concatenateNalDataForFrame:concatenateNalDataForFrame};var q=[33,16,5,32,164,27];var V=[33,65,108,84,1,2,4,8,168,2,4,8,17,191,252];var zeroFill=function(e){var t=[];while(e--)t.push(0);return t};var makeTable=function(e){return Object.keys(e).reduce((function(t,s){t[s]=new Uint8Array(e[s].reduce((function(e,t){return e.concat(t)}),[]));return t}),{})};var z;var silence_1=function(){if(!z){var e={96e3:[q,[227,64],zeroFill(154),[56]],88200:[q,[231],zeroFill(170),[56]],64e3:[q,[248,192],zeroFill(240),[56]],48e3:[q,[255,192],zeroFill(268),[55,148,128],zeroFill(54),[112]],44100:[q,[255,192],zeroFill(268),[55,163,128],zeroFill(84),[112]],32e3:[q,[255,192],zeroFill(268),[55,234],zeroFill(226),[112]],24e3:[q,[255,192],zeroFill(268),[55,255,128],zeroFill(268),[111,112],zeroFill(126),[224]],16e3:[q,[255,192],zeroFill(268),[55,255,128],zeroFill(268),[111,255],zeroFill(269),[223,108],zeroFill(195),[1,192]],12e3:[V,zeroFill(268),[3,127,248],zeroFill(268),[6,255,240],zeroFill(268),[13,255,224],zeroFill(268),[27,253,128],zeroFill(259),[56]],11025:[V,zeroFill(268),[3,127,248],zeroFill(268),[6,255,240],zeroFill(268),[13,255,224],zeroFill(268),[27,255,192],zeroFill(268),[55,175,128],zeroFill(108),[112]],8e3:[V,zeroFill(268),[3,121,16],zeroFill(47),[7]]};z=makeTable(e)}return z};var W,G,K,Q,X,Y,J,Z=9e4;W=function(e){return e*Z};G=function(e,t){return e*t};K=function(e){return e/Z};Q=function(e,t){return e/t};X=function(e,t){return W(Q(e,t))};Y=function(e,t){return G(K(e),t)};J=function(e,t,s){return K(s?e:e-t)};var ee={ONE_SECOND_IN_TS:Z,secondsToVideoTs:W,secondsToAudioTs:G,videoTsToSeconds:K,audioTsToSeconds:Q,audioTsToVideoTs:X,videoTsToAudioTs:Y,metadataTsToSeconds:J};var te=silence_1;var se=ee;var sumFrameByteLengths=function(e){var t,s,i=0;for(t=0;t<e.length;t++){s=e[t];i+=s.data.byteLength}return i};var prefixWithSilence=function(e,t,s,i){var n,r,a,o,l=0,d=0,h=0,c=0;if(t.length){n=se.audioTsToVideoTs(e.baseMediaDecodeTime,e.samplerate);l=Math.ceil(se.ONE_SECOND_IN_TS/(e.samplerate/1024));if(s&&i){d=n-Math.max(s,i);h=Math.floor(d/l);c=h*l}if(!(h<1||c>se.ONE_SECOND_IN_TS/2)){r=te()[e.samplerate];r||(r=t[0].data);for(a=0;a<h;a++){o=t[0];t.splice(0,0,{data:r,dts:o.dts-l,pts:o.pts-l})}e.baseMediaDecodeTime-=Math.floor(se.videoTsToAudioTs(c,e.samplerate));return c}}};var trimAdtsFramesByEarliestDts=function(e,t,s){if(t.minSegmentDts>=s)return e;t.minSegmentDts=Infinity;return e.filter((function(e){if(e.dts>=s){t.minSegmentDts=Math.min(t.minSegmentDts,e.dts);t.minSegmentPts=t.minSegmentDts;return true}return false}))};var generateSampleTable=function(e){var t,s,i=[];for(t=0;t<e.length;t++){s=e[t];i.push({size:s.data.byteLength,duration:1024})}return i};var concatenateFrameData=function(e){var t,s,i=0,n=new Uint8Array(sumFrameByteLengths(e));for(t=0;t<e.length;t++){s=e[t];n.set(s.data,i);i+=s.data.byteLength}return n};var ie={prefixWithSilence:prefixWithSilence,trimAdtsFramesByEarliestDts:trimAdtsFramesByEarliestDts,generateSampleTable:generateSampleTable,concatenateFrameData:concatenateFrameData};var ne=ee.ONE_SECOND_IN_TS;var collectDtsInfo=function(e,t){if(typeof t.pts==="number"){e.timelineStartInfo.pts===void 0&&(e.timelineStartInfo.pts=t.pts);e.minSegmentPts===void 0?e.minSegmentPts=t.pts:e.minSegmentPts=Math.min(e.minSegmentPts,t.pts);e.maxSegmentPts===void 0?e.maxSegmentPts=t.pts:e.maxSegmentPts=Math.max(e.maxSegmentPts,t.pts)}if(typeof t.dts==="number"){e.timelineStartInfo.dts===void 0&&(e.timelineStartInfo.dts=t.dts);e.minSegmentDts===void 0?e.minSegmentDts=t.dts:e.minSegmentDts=Math.min(e.minSegmentDts,t.dts);e.maxSegmentDts===void 0?e.maxSegmentDts=t.dts:e.maxSegmentDts=Math.max(e.maxSegmentDts,t.dts)}};var clearDtsInfo=function(e){delete e.minSegmentDts;delete e.maxSegmentDts;delete e.minSegmentPts;delete e.maxSegmentPts};
/**
   * Calculate the track's baseMediaDecodeTime based on the earliest
   * DTS the transmuxer has ever seen and the minimum DTS for the
   * current track
   * @param track {object} track metadata configuration
   * @param keepOriginalTimestamps {boolean} If true, keep the timestamps
   *        in the source; false to adjust the first segment to start at 0.
   */var calculateTrackBaseMediaDecodeTime=function(e,t){var s,i,n=e.minSegmentDts;t||(n-=e.timelineStartInfo.dts);s=e.timelineStartInfo.baseMediaDecodeTime;s+=n;s=Math.max(0,s);if(e.type==="audio"){i=e.samplerate/ne;s*=i;s=Math.floor(s)}return s};var re={clearDtsInfo:clearDtsInfo,calculateTrackBaseMediaDecodeTime:calculateTrackBaseMediaDecodeTime,collectDtsInfo:collectDtsInfo};var ae=4,oe=128;
/**
    * Parse a supplemental enhancement information (SEI) NAL unit.
    * Stops parsing once a message of type ITU T T35 has been found.
    *
    * @param bytes {Uint8Array} the bytes of a SEI NAL unit
    * @return {object} the parsed SEI payload
    * @see Rec. ITU-T H.264, 7.3.2.3.1
    */var parseSei=function(e){var t=0,s={payloadType:-1,payloadSize:0},i=0,n=0;while(t<e.byteLength){if(e[t]===oe)break;while(e[t]===255){i+=255;t++}i+=e[t++];while(e[t]===255){n+=255;t++}n+=e[t++];if(!s.payload&&i===ae){var r=String.fromCharCode(e[t+3],e[t+4],e[t+5],e[t+6]);if(r==="GA94"){s.payloadType=i;s.payloadSize=n;s.payload=e.subarray(t,t+n);break}s.payload=void 0}t+=n;i=0;n=0}return s};var parseUserData=function(e){return e.payload[0]!==181||(e.payload[1]<<8|e.payload[2])!==49||String.fromCharCode(e.payload[3],e.payload[4],e.payload[5],e.payload[6])!=="GA94"||e.payload[7]!==3?null:e.payload.subarray(8,e.payload.length-1)};var parseCaptionPackets=function(e,t){var s,i,n,r,a=[];if(!(t[0]&64))return a;i=t[0]&31;for(s=0;s<i;s++){n=s*3;r={type:t[n+2]&3,pts:e};if(t[n+2]&4){r.ccData=t[n+3]<<8|t[n+4];a.push(r)}}return a};var discardEmulationPreventionBytes$1=function(e){var t,s,i=e.byteLength,n=[],r=1;while(r<i-2)if(e[r]===0&&e[r+1]===0&&e[r+2]===3){n.push(r+2);r+=2}else r++;if(n.length===0)return e;t=i-n.length;s=new Uint8Array(t);var a=0;for(r=0;r<t;a++,r++){if(a===n[0]){a++;n.shift()}s[r]=e[a]}return s};var le={parseSei:parseSei,parseUserData:parseUserData,parseCaptionPackets:parseCaptionPackets,discardEmulationPreventionBytes:discardEmulationPreventionBytes$1,USER_DATA_REGISTERED_ITU_T_T35:ae};var de=t;var he=le;var CaptionStream$2=function(e){e=e||{};CaptionStream$2.prototype.init.call(this);this.parse708captions_=typeof e.parse708captions!=="boolean"||e.parse708captions;this.captionPackets_=[];this.ccStreams_=[new Cea608Stream(0,0),new Cea608Stream(0,1),new Cea608Stream(1,0),new Cea608Stream(1,1)];this.parse708captions_&&(this.cc708Stream_=new Cea708Stream({captionServices:e.captionServices}));this.reset();this.ccStreams_.forEach((function(e){e.on("data",this.trigger.bind(this,"data"));e.on("partialdone",this.trigger.bind(this,"partialdone"));e.on("done",this.trigger.bind(this,"done"))}),this);if(this.parse708captions_){this.cc708Stream_.on("data",this.trigger.bind(this,"data"));this.cc708Stream_.on("partialdone",this.trigger.bind(this,"partialdone"));this.cc708Stream_.on("done",this.trigger.bind(this,"done"))}};CaptionStream$2.prototype=new de;CaptionStream$2.prototype.push=function(e){var t,s,i;if(e.nalUnitType==="sei_rbsp"){t=he.parseSei(e.escapedRBSP);if(t.payload&&t.payloadType===he.USER_DATA_REGISTERED_ITU_T_T35){s=he.parseUserData(t);if(s)if(e.dts<this.latestDts_)this.ignoreNextEqualDts_=true;else if(e.dts===this.latestDts_&&this.ignoreNextEqualDts_){this.numSameDts_--;this.numSameDts_||(this.ignoreNextEqualDts_=false)}else{i=he.parseCaptionPackets(e.pts,s);this.captionPackets_=this.captionPackets_.concat(i);this.latestDts_!==e.dts&&(this.numSameDts_=0);this.numSameDts_++;this.latestDts_=e.dts}}}};CaptionStream$2.prototype.flushCCStreams=function(e){this.ccStreams_.forEach((function(t){return e==="flush"?t.flush():t.partialFlush()}),this)};CaptionStream$2.prototype.flushStream=function(e){if(this.captionPackets_.length){this.captionPackets_.forEach((function(e,t){e.presortIndex=t}));this.captionPackets_.sort((function(e,t){return e.pts===t.pts?e.presortIndex-t.presortIndex:e.pts-t.pts}));this.captionPackets_.forEach((function(e){e.type<2?this.dispatchCea608Packet(e):this.dispatchCea708Packet(e)}),this);this.captionPackets_.length=0;this.flushCCStreams(e)}else this.flushCCStreams(e)};CaptionStream$2.prototype.flush=function(){return this.flushStream("flush")};CaptionStream$2.prototype.partialFlush=function(){return this.flushStream("partialFlush")};CaptionStream$2.prototype.reset=function(){this.latestDts_=null;this.ignoreNextEqualDts_=false;this.numSameDts_=0;this.activeCea608Channel_=[null,null];this.ccStreams_.forEach((function(e){e.reset()}))};CaptionStream$2.prototype.dispatchCea608Packet=function(e){this.setsTextOrXDSActive(e)?this.activeCea608Channel_[e.type]=null:this.setsChannel1Active(e)?this.activeCea608Channel_[e.type]=0:this.setsChannel2Active(e)&&(this.activeCea608Channel_[e.type]=1);this.activeCea608Channel_[e.type]!==null&&this.ccStreams_[(e.type<<1)+this.activeCea608Channel_[e.type]].push(e)};CaptionStream$2.prototype.setsChannel1Active=function(e){return(e.ccData&30720)===4096};CaptionStream$2.prototype.setsChannel2Active=function(e){return(e.ccData&30720)===6144};CaptionStream$2.prototype.setsTextOrXDSActive=function(e){return(e.ccData&28928)===256||(e.ccData&30974)===4138||(e.ccData&30974)===6186};CaptionStream$2.prototype.dispatchCea708Packet=function(e){this.parse708captions_&&this.cc708Stream_.push(e)};var ce={127:9834,4128:32,4129:160,4133:8230,4138:352,4140:338,4144:9608,4145:8216,4146:8217,4147:8220,4148:8221,4149:8226,4153:8482,4154:353,4156:339,4157:8480,4159:376,4214:8539,4215:8540,4216:8541,4217:8542,4218:9168,4219:9124,4220:9123,4221:9135,4222:9126,4223:9121,4256:12600};var get708CharFromCode=function(e){var t=ce[e]||e;return e&4096&&e===t?"":String.fromCharCode(t)};var within708TextBlock=function(e){return 32<=e&&e<=127||160<=e&&e<=255};var Cea708Window=function(e){this.windowNum=e;this.reset()};Cea708Window.prototype.reset=function(){this.clearText();this.pendingNewLine=false;this.winAttr={};this.penAttr={};this.penLoc={};this.penColor={};this.visible=0;this.rowLock=0;this.columnLock=0;this.priority=0;this.relativePositioning=0;this.anchorVertical=0;this.anchorHorizontal=0;this.anchorPoint=0;this.rowCount=1;this.virtualRowCount=this.rowCount+1;this.columnCount=41;this.windowStyle=0;this.penStyle=0};Cea708Window.prototype.getText=function(){return this.rows.join("\n")};Cea708Window.prototype.clearText=function(){this.rows=[""];this.rowIdx=0};Cea708Window.prototype.newLine=function(e){this.rows.length>=this.virtualRowCount&&typeof this.beforeRowOverflow==="function"&&this.beforeRowOverflow(e);if(this.rows.length>0){this.rows.push("");this.rowIdx++}while(this.rows.length>this.virtualRowCount){this.rows.shift();this.rowIdx--}};Cea708Window.prototype.isEmpty=function(){return this.rows.length===0||this.rows.length===1&&this.rows[0]===""};Cea708Window.prototype.addText=function(e){this.rows[this.rowIdx]+=e};Cea708Window.prototype.backspace=function(){if(!this.isEmpty()){var e=this.rows[this.rowIdx];this.rows[this.rowIdx]=e.substr(0,e.length-1)}};var Cea708Service=function(e,t,s){this.serviceNum=e;this.text="";this.currentWindow=new Cea708Window(-1);this.windows=[];this.stream=s;typeof t==="string"&&this.createTextDecoder(t)};
/**
   * Initialize service windows
   * Must be run before service use
   *
   * @param  {Integer}  pts               PTS value
   * @param  {Function} beforeRowOverflow Function to execute before row overflow of a window
   */Cea708Service.prototype.init=function(e,t){this.startPts=e;for(var s=0;s<8;s++){this.windows[s]=new Cea708Window(s);typeof t==="function"&&(this.windows[s].beforeRowOverflow=t)}};
/**
   * Set current window of service to be affected by commands
   *
   * @param  {Integer} windowNum Window number
   */Cea708Service.prototype.setCurrentWindow=function(e){this.currentWindow=this.windows[e]};Cea708Service.prototype.createTextDecoder=function(e){if(typeof TextDecoder==="undefined")this.stream.trigger("log",{level:"warn",message:"The `encoding` option is unsupported without TextDecoder support"});else try{this.textDecoder_=new TextDecoder(e)}catch(t){this.stream.trigger("log",{level:"warn",message:"TextDecoder could not be created with "+e+" encoding. "+t})}};var Cea708Stream=function(e){e=e||{};Cea708Stream.prototype.init.call(this);var t=this;var s=e.captionServices||{};var i={};var n;Object.keys(s).forEach((e=>{n=s[e];/^SERVICE/.test(e)&&(i[e]=n.encoding)}));this.serviceEncodings=i;this.current708Packet=null;this.services={};this.push=function(e){if(e.type===3){t.new708Packet();t.add708Bytes(e)}else{t.current708Packet===null&&t.new708Packet();t.add708Bytes(e)}}};Cea708Stream.prototype=new de;Cea708Stream.prototype.new708Packet=function(){this.current708Packet!==null&&this.push708Packet();this.current708Packet={data:[],ptsVals:[]}};Cea708Stream.prototype.add708Bytes=function(e){var t=e.ccData;var s=t>>>8;var i=t&255;this.current708Packet.ptsVals.push(e.pts);this.current708Packet.data.push(s);this.current708Packet.data.push(i)};Cea708Stream.prototype.push708Packet=function(){var e=this.current708Packet;var t=e.data;var s=null;var i=null;var n=0;var r=t[n++];e.seq=r>>6;e.sizeCode=r&63;for(;n<t.length;n++){r=t[n++];s=r>>5;i=r&31;if(s===7&&i>0){r=t[n++];s=r}this.pushServiceBlock(s,n,i);i>0&&(n+=i-1)}};
/**
   * Parse service block, execute commands, read text.
   *
   * Note: While many of these commands serve important purposes,
   * many others just parse out the parameters or attributes, but
   * nothing is done with them because this is not a full and complete
   * implementation of the entire 708 spec.
   *
   * @param  {Integer} serviceNum Service number
   * @param  {Integer} start      Start index of the 708 packet data
   * @param  {Integer} size       Block size
   */Cea708Stream.prototype.pushServiceBlock=function(e,t,s){var i;var n=t;var r=this.current708Packet.data;var a=this.services[e];a||(a=this.initService(e,n));for(;n<t+s&&n<r.length;n++){i=r[n];within708TextBlock(i)?n=this.handleText(n,a):i===24?n=this.multiByteCharacter(n,a):i===16?n=this.extendedCommands(n,a):128<=i&&i<=135?n=this.setCurrentWindow(n,a):152<=i&&i<=159?n=this.defineWindow(n,a):i===136?n=this.clearWindows(n,a):i===140?n=this.deleteWindows(n,a):i===137?n=this.displayWindows(n,a):i===138?n=this.hideWindows(n,a):i===139?n=this.toggleWindows(n,a):i===151?n=this.setWindowAttributes(n,a):i===144?n=this.setPenAttributes(n,a):i===145?n=this.setPenColor(n,a):i===146?n=this.setPenLocation(n,a):i===143?a=this.reset(n,a):i===8?a.currentWindow.backspace():i===12?a.currentWindow.clearText():i===13?a.currentWindow.pendingNewLine=true:i===14?a.currentWindow.clearText():i===141&&n++}};
/**
   * Execute an extended command
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.extendedCommands=function(e,t){var s=this.current708Packet.data;var i=s[++e];within708TextBlock(i)&&(e=this.handleText(e,t,{isExtended:true}));return e};
/**
   * Get PTS value of a given byte index
   *
   * @param  {Integer} byteIndex  Index of the byte
   * @return {Integer}            PTS
   */Cea708Stream.prototype.getPts=function(e){return this.current708Packet.ptsVals[Math.floor(e/2)]};
/**
   * Initializes a service
   *
   * @param  {Integer} serviceNum Service number
   * @return {Service}            Initialized service object
   */Cea708Stream.prototype.initService=function(e,t){var s="SERVICE"+e;var i=this;var n;s in this.serviceEncodings&&(n=this.serviceEncodings[s]);this.services[e]=new Cea708Service(e,n,i);this.services[e].init(this.getPts(t),(function(t){i.flushDisplayed(t,i.services[e])}));return this.services[e]};
/**
   * Execute text writing to current window
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.handleText=function(e,t,s){var i=s&&s.isExtended;var n=s&&s.isMultiByte;var r=this.current708Packet.data;var a=i?4096:0;var o=r[e];var l=r[e+1];var d=t.currentWindow;var h;var c;function toHexString(e){return e.map((e=>("0"+(e&255).toString(16)).slice(-2))).join("")}if(n){c=[o,l];e++}else c=[o];if(t.textDecoder_&&!i)h=t.textDecoder_.decode(new Uint8Array(c));else if(n){const e=toHexString(c);h=String.fromCharCode(parseInt(e,16))}else h=get708CharFromCode(a|o);d.pendingNewLine&&!d.isEmpty()&&d.newLine(this.getPts(e));d.pendingNewLine=false;d.addText(h);return e};
/**
   * Handle decoding of multibyte character
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.multiByteCharacter=function(e,t){var s=this.current708Packet.data;var i=s[e+1];var n=s[e+2];within708TextBlock(i)&&within708TextBlock(n)&&(e=this.handleText(++e,t,{isMultiByte:true}));return e};
/**
   * Parse and execute the CW# command.
   *
   * Set the current window.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.setCurrentWindow=function(e,t){var s=this.current708Packet.data;var i=s[e];var n=i&7;t.setCurrentWindow(n);return e};
/**
   * Parse and execute the DF# command.
   *
   * Define a window and set it as the current window.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.defineWindow=function(e,t){var s=this.current708Packet.data;var i=s[e];var n=i&7;t.setCurrentWindow(n);var r=t.currentWindow;i=s[++e];r.visible=(i&32)>>5;r.rowLock=(i&16)>>4;r.columnLock=(i&8)>>3;r.priority=i&7;i=s[++e];r.relativePositioning=(i&128)>>7;r.anchorVertical=i&127;i=s[++e];r.anchorHorizontal=i;i=s[++e];r.anchorPoint=(i&240)>>4;r.rowCount=i&15;i=s[++e];r.columnCount=i&63;i=s[++e];r.windowStyle=(i&56)>>3;r.penStyle=i&7;r.virtualRowCount=r.rowCount+1;return e};
/**
   * Parse and execute the SWA command.
   *
   * Set attributes of the current window.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.setWindowAttributes=function(e,t){var s=this.current708Packet.data;var i=s[e];var n=t.currentWindow.winAttr;i=s[++e];n.fillOpacity=(i&192)>>6;n.fillRed=(i&48)>>4;n.fillGreen=(i&12)>>2;n.fillBlue=i&3;i=s[++e];n.borderType=(i&192)>>6;n.borderRed=(i&48)>>4;n.borderGreen=(i&12)>>2;n.borderBlue=i&3;i=s[++e];n.borderType+=(i&128)>>5;n.wordWrap=(i&64)>>6;n.printDirection=(i&48)>>4;n.scrollDirection=(i&12)>>2;n.justify=i&3;i=s[++e];n.effectSpeed=(i&240)>>4;n.effectDirection=(i&12)>>2;n.displayEffect=i&3;return e};
/**
   * Gather text from all displayed windows and push a caption to output.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   */Cea708Stream.prototype.flushDisplayed=function(e,t){var s=[];for(var i=0;i<8;i++)t.windows[i].visible&&!t.windows[i].isEmpty()&&s.push(t.windows[i].getText());t.endPts=e;t.text=s.join("\n\n");this.pushCaption(t);t.startPts=e};
/**
   * Push a caption to output if the caption contains text.
   *
   * @param  {Service} service  The service object to be affected
   */Cea708Stream.prototype.pushCaption=function(e){if(e.text!==""){this.trigger("data",{startPts:e.startPts,endPts:e.endPts,text:e.text,stream:"cc708_"+e.serviceNum});e.text="";e.startPts=e.endPts}};
/**
   * Parse and execute the DSW command.
   *
   * Set visible property of windows based on the parsed bitmask.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.displayWindows=function(e,t){var s=this.current708Packet.data;var i=s[++e];var n=this.getPts(e);this.flushDisplayed(n,t);for(var r=0;r<8;r++)i&1<<r&&(t.windows[r].visible=1);return e};
/**
   * Parse and execute the HDW command.
   *
   * Set visible property of windows based on the parsed bitmask.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.hideWindows=function(e,t){var s=this.current708Packet.data;var i=s[++e];var n=this.getPts(e);this.flushDisplayed(n,t);for(var r=0;r<8;r++)i&1<<r&&(t.windows[r].visible=0);return e};
/**
   * Parse and execute the TGW command.
   *
   * Set visible property of windows based on the parsed bitmask.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.toggleWindows=function(e,t){var s=this.current708Packet.data;var i=s[++e];var n=this.getPts(e);this.flushDisplayed(n,t);for(var r=0;r<8;r++)i&1<<r&&(t.windows[r].visible^=1);return e};
/**
   * Parse and execute the CLW command.
   *
   * Clear text of windows based on the parsed bitmask.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.clearWindows=function(e,t){var s=this.current708Packet.data;var i=s[++e];var n=this.getPts(e);this.flushDisplayed(n,t);for(var r=0;r<8;r++)i&1<<r&&t.windows[r].clearText();return e};
/**
   * Parse and execute the DLW command.
   *
   * Re-initialize windows based on the parsed bitmask.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.deleteWindows=function(e,t){var s=this.current708Packet.data;var i=s[++e];var n=this.getPts(e);this.flushDisplayed(n,t);for(var r=0;r<8;r++)i&1<<r&&t.windows[r].reset();return e};
/**
   * Parse and execute the SPA command.
   *
   * Set pen attributes of the current window.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.setPenAttributes=function(e,t){var s=this.current708Packet.data;var i=s[e];var n=t.currentWindow.penAttr;i=s[++e];n.textTag=(i&240)>>4;n.offset=(i&12)>>2;n.penSize=i&3;i=s[++e];n.italics=(i&128)>>7;n.underline=(i&64)>>6;n.edgeType=(i&56)>>3;n.fontStyle=i&7;return e};
/**
   * Parse and execute the SPC command.
   *
   * Set pen color of the current window.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.setPenColor=function(e,t){var s=this.current708Packet.data;var i=s[e];var n=t.currentWindow.penColor;i=s[++e];n.fgOpacity=(i&192)>>6;n.fgRed=(i&48)>>4;n.fgGreen=(i&12)>>2;n.fgBlue=i&3;i=s[++e];n.bgOpacity=(i&192)>>6;n.bgRed=(i&48)>>4;n.bgGreen=(i&12)>>2;n.bgBlue=i&3;i=s[++e];n.edgeRed=(i&48)>>4;n.edgeGreen=(i&12)>>2;n.edgeBlue=i&3;return e};
/**
   * Parse and execute the SPL command.
   *
   * Set pen location of the current window.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Integer}          New index after parsing
   */Cea708Stream.prototype.setPenLocation=function(e,t){var s=this.current708Packet.data;var i=s[e];var n=t.currentWindow.penLoc;t.currentWindow.pendingNewLine=true;i=s[++e];n.row=i&15;i=s[++e];n.column=i&63;return e};
/**
   * Execute the RST command.
   *
   * Reset service to a clean slate. Re-initialize.
   *
   * @param  {Integer} i        Current index in the 708 packet
   * @param  {Service} service  The service object to be affected
   * @return {Service}          Re-initialized service
   */Cea708Stream.prototype.reset=function(e,t){var s=this.getPts(e);this.flushDisplayed(s,t);return this.initService(t.serviceNum,e)};var ue={42:225,92:233,94:237,95:243,96:250,123:231,124:247,125:209,126:241,127:9608,304:174,305:176,306:189,307:191,308:8482,309:162,310:163,311:9834,312:224,313:160,314:232,315:226,316:234,317:238,318:244,319:251,544:193,545:201,546:211,547:218,548:220,549:252,550:8216,551:161,552:42,553:39,554:8212,555:169,556:8480,557:8226,558:8220,559:8221,560:192,561:194,562:199,563:200,564:202,565:203,566:235,567:206,568:207,569:239,570:212,571:217,572:249,573:219,574:171,575:187,800:195,801:227,802:205,803:204,804:236,805:210,806:242,807:213,808:245,809:123,810:125,811:92,812:94,813:95,814:124,815:126,816:196,817:228,818:214,819:246,820:223,821:165,822:164,823:9474,824:197,825:229,826:216,827:248,828:9484,829:9488,830:9492,831:9496};var getCharFromCode=function(e){if(e===null)return"";e=ue[e]||e;return String.fromCharCode(e)};var pe=14;var me=[4352,4384,4608,4640,5376,5408,5632,5664,5888,5920,4096,4864,4896,5120,5152];var createDisplayBuffer=function(){var e=[],t=pe+1;while(t--)e.push({text:"",indent:0,offset:0});return e};var Cea608Stream=function(e,t){Cea608Stream.prototype.init.call(this);this.field_=e||0;this.dataChannel_=t||0;this.name_="CC"+(1+(this.field_<<1|this.dataChannel_));this.setConstants();this.reset();this.push=function(e){var t,s,i,n,r;t=e.ccData&32639;if(t!==this.lastControlCode_){(t&61440)===4096?this.lastControlCode_=t:t!==this.PADDING_&&(this.lastControlCode_=null);i=t>>>8;n=t&255;if(t!==this.PADDING_)if(t===this.RESUME_CAPTION_LOADING_)this.mode_="popOn";else if(t===this.END_OF_CAPTION_){this.mode_="popOn";this.clearFormatting(e.pts);this.flushDisplayed(e.pts);s=this.displayed_;this.displayed_=this.nonDisplayed_;this.nonDisplayed_=s;this.startPts_=e.pts}else if(t===this.ROLL_UP_2_ROWS_){this.rollUpRows_=2;this.setRollUp(e.pts)}else if(t===this.ROLL_UP_3_ROWS_){this.rollUpRows_=3;this.setRollUp(e.pts)}else if(t===this.ROLL_UP_4_ROWS_){this.rollUpRows_=4;this.setRollUp(e.pts)}else if(t===this.CARRIAGE_RETURN_){this.clearFormatting(e.pts);this.flushDisplayed(e.pts);this.shiftRowsUp_();this.startPts_=e.pts}else if(t===this.BACKSPACE_)this.mode_==="popOn"?this.nonDisplayed_[this.row_].text=this.nonDisplayed_[this.row_].text.slice(0,-1):this.displayed_[this.row_].text=this.displayed_[this.row_].text.slice(0,-1);else if(t===this.ERASE_DISPLAYED_MEMORY_){this.flushDisplayed(e.pts);this.displayed_=createDisplayBuffer()}else if(t===this.ERASE_NON_DISPLAYED_MEMORY_)this.nonDisplayed_=createDisplayBuffer();else if(t===this.RESUME_DIRECT_CAPTIONING_){if(this.mode_!=="paintOn"){this.flushDisplayed(e.pts);this.displayed_=createDisplayBuffer()}this.mode_="paintOn";this.startPts_=e.pts}else if(this.isSpecialCharacter(i,n)){i=(i&3)<<8;r=getCharFromCode(i|n);this[this.mode_](e.pts,r);this.column_++}else if(this.isExtCharacter(i,n)){this.mode_==="popOn"?this.nonDisplayed_[this.row_].text=this.nonDisplayed_[this.row_].text.slice(0,-1):this.displayed_[this.row_].text=this.displayed_[this.row_].text.slice(0,-1);i=(i&3)<<8;r=getCharFromCode(i|n);this[this.mode_](e.pts,r);this.column_++}else if(this.isMidRowCode(i,n)){this.clearFormatting(e.pts);this[this.mode_](e.pts," ");this.column_++;(n&14)===14&&this.addFormatting(e.pts,["i"]);(n&1)===1&&this.addFormatting(e.pts,["u"])}else if(this.isOffsetControlCode(i,n)){const e=n&3;this.nonDisplayed_[this.row_].offset=e;this.column_+=e}else if(this.isPAC(i,n)){var a=me.indexOf(t&7968);if(this.mode_==="rollUp"){a-this.rollUpRows_+1<0&&(a=this.rollUpRows_-1);this.setRollUp(e.pts,a)}if(a!==this.row_&&a>=0&&a<=14){this.clearFormatting(e.pts);this.row_=a}n&1&&this.formatting_.indexOf("u")===-1&&this.addFormatting(e.pts,["u"]);if((t&16)===16){const e=(t&14)>>1;this.column_=e*4;this.nonDisplayed_[this.row_].indent+=e}this.isColorPAC(n)&&(n&14)===14&&this.addFormatting(e.pts,["i"])}else if(this.isNormalChar(i)){n===0&&(n=null);r=getCharFromCode(i);r+=getCharFromCode(n);this[this.mode_](e.pts,r);this.column_+=r.length}}else this.lastControlCode_=null}};Cea608Stream.prototype=new de;Cea608Stream.prototype.flushDisplayed=function(e){const logWarning=e=>{this.trigger("log",{level:"warn",message:"Skipping a malformed 608 caption at index "+e+"."})};const t=[];this.displayed_.forEach(((e,s)=>{if(e&&e.text&&e.text.length){try{e.text=e.text.trim()}catch(e){logWarning(s)}e.text.length&&t.push({text:e.text,line:s+1,position:10+Math.min(70,e.indent*10)+e.offset*2.5})}else e!==void 0&&e!==null||logWarning(s)}));t.length&&this.trigger("data",{startPts:this.startPts_,endPts:e,content:t,stream:this.name_})};Cea608Stream.prototype.reset=function(){this.mode_="popOn";this.topRow_=0;this.startPts_=0;this.displayed_=createDisplayBuffer();this.nonDisplayed_=createDisplayBuffer();this.lastControlCode_=null;this.column_=0;this.row_=pe;this.rollUpRows_=2;this.formatting_=[]};Cea608Stream.prototype.setConstants=function(){if(this.dataChannel_===0){this.BASE_=16;this.EXT_=17;this.CONTROL_=(20|this.field_)<<8;this.OFFSET_=23}else if(this.dataChannel_===1){this.BASE_=24;this.EXT_=25;this.CONTROL_=(28|this.field_)<<8;this.OFFSET_=31}this.PADDING_=0;this.RESUME_CAPTION_LOADING_=this.CONTROL_|32;this.END_OF_CAPTION_=this.CONTROL_|47;this.ROLL_UP_2_ROWS_=this.CONTROL_|37;this.ROLL_UP_3_ROWS_=this.CONTROL_|38;this.ROLL_UP_4_ROWS_=this.CONTROL_|39;this.CARRIAGE_RETURN_=this.CONTROL_|45;this.RESUME_DIRECT_CAPTIONING_=this.CONTROL_|41;this.BACKSPACE_=this.CONTROL_|33;this.ERASE_DISPLAYED_MEMORY_=this.CONTROL_|44;this.ERASE_NON_DISPLAYED_MEMORY_=this.CONTROL_|46};
/**
   * Detects if the 2-byte packet data is a special character
   *
   * Special characters have a second byte in the range 0x30 to 0x3f,
   * with the first byte being 0x11 (for data channel 1) or 0x19 (for
   * data channel 2).
   *
   * @param  {Integer} char0 The first byte
   * @param  {Integer} char1 The second byte
   * @return {Boolean}       Whether the 2 bytes are an special character
   */Cea608Stream.prototype.isSpecialCharacter=function(e,t){return e===this.EXT_&&t>=48&&t<=63};
/**
   * Detects if the 2-byte packet data is an extended character
   *
   * Extended characters have a second byte in the range 0x20 to 0x3f,
   * with the first byte being 0x12 or 0x13 (for data channel 1) or
   * 0x1a or 0x1b (for data channel 2).
   *
   * @param  {Integer} char0 The first byte
   * @param  {Integer} char1 The second byte
   * @return {Boolean}       Whether the 2 bytes are an extended character
   */Cea608Stream.prototype.isExtCharacter=function(e,t){return(e===this.EXT_+1||e===this.EXT_+2)&&t>=32&&t<=63};
/**
   * Detects if the 2-byte packet is a mid-row code
   *
   * Mid-row codes have a second byte in the range 0x20 to 0x2f, with
   * the first byte being 0x11 (for data channel 1) or 0x19 (for data
   * channel 2).
   *
   * @param  {Integer} char0 The first byte
   * @param  {Integer} char1 The second byte
   * @return {Boolean}       Whether the 2 bytes are a mid-row code
   */Cea608Stream.prototype.isMidRowCode=function(e,t){return e===this.EXT_&&t>=32&&t<=47};
/**
   * Detects if the 2-byte packet is an offset control code
   *
   * Offset control codes have a second byte in the range 0x21 to 0x23,
   * with the first byte being 0x17 (for data channel 1) or 0x1f (for
   * data channel 2).
   *
   * @param  {Integer} char0 The first byte
   * @param  {Integer} char1 The second byte
   * @return {Boolean}       Whether the 2 bytes are an offset control code
   */Cea608Stream.prototype.isOffsetControlCode=function(e,t){return e===this.OFFSET_&&t>=33&&t<=35};
/**
   * Detects if the 2-byte packet is a Preamble Address Code
   *
   * PACs have a first byte in the range 0x10 to 0x17 (for data channel 1)
   * or 0x18 to 0x1f (for data channel 2), with the second byte in the
   * range 0x40 to 0x7f.
   *
   * @param  {Integer} char0 The first byte
   * @param  {Integer} char1 The second byte
   * @return {Boolean}       Whether the 2 bytes are a PAC
   */Cea608Stream.prototype.isPAC=function(e,t){return e>=this.BASE_&&e<this.BASE_+8&&t>=64&&t<=127};
/**
   * Detects if a packet's second byte is in the range of a PAC color code
   *
   * PAC color codes have the second byte be in the range 0x40 to 0x4f, or
   * 0x60 to 0x6f.
   *
   * @param  {Integer} char1 The second byte
   * @return {Boolean}       Whether the byte is a color PAC
   */Cea608Stream.prototype.isColorPAC=function(e){return e>=64&&e<=79||e>=96&&e<=127};
/**
   * Detects if a single byte is in the range of a normal character
   *
   * Normal text bytes are in the range 0x20 to 0x7f.
   *
   * @param  {Integer} char  The byte
   * @return {Boolean}       Whether the byte is a normal character
   */Cea608Stream.prototype.isNormalChar=function(e){return e>=32&&e<=127};
/**
   * Configures roll-up
   *
   * @param  {Integer} pts         Current PTS
   * @param  {Integer} newBaseRow  Used by PACs to slide the current window to
   *                               a new position
   */Cea608Stream.prototype.setRollUp=function(e,t){if(this.mode_!=="rollUp"){this.row_=pe;this.mode_="rollUp";this.flushDisplayed(e);this.nonDisplayed_=createDisplayBuffer();this.displayed_=createDisplayBuffer()}if(t!==void 0&&t!==this.row_)for(var s=0;s<this.rollUpRows_;s++){this.displayed_[t-s]=this.displayed_[this.row_-s];this.displayed_[this.row_-s]={text:"",indent:0,offset:0}}t===void 0&&(t=this.row_);this.topRow_=t-this.rollUpRows_+1};Cea608Stream.prototype.addFormatting=function(e,t){this.formatting_=this.formatting_.concat(t);var s=t.reduce((function(e,t){return e+"<"+t+">"}),"");this[this.mode_](e,s)};Cea608Stream.prototype.clearFormatting=function(e){if(this.formatting_.length){var t=this.formatting_.reverse().reduce((function(e,t){return e+"</"+t+">"}),"");this.formatting_=[];this[this.mode_](e,t)}};Cea608Stream.prototype.popOn=function(e,t){var s=this.nonDisplayed_[this.row_].text;s+=t;this.nonDisplayed_[this.row_].text=s};Cea608Stream.prototype.rollUp=function(e,t){var s=this.displayed_[this.row_].text;s+=t;this.displayed_[this.row_].text=s};Cea608Stream.prototype.shiftRowsUp_=function(){var e;for(e=0;e<this.topRow_;e++)this.displayed_[e]={text:"",indent:0,offset:0};for(e=this.row_+1;e<pe+1;e++)this.displayed_[e]={text:"",indent:0,offset:0};for(e=this.topRow_;e<this.row_;e++)this.displayed_[e]=this.displayed_[e+1];this.displayed_[this.row_]={text:"",indent:0,offset:0}};Cea608Stream.prototype.paintOn=function(e,t){var s=this.displayed_[this.row_].text;s+=t;this.displayed_[this.row_].text=s};var fe={CaptionStream:CaptionStream$2,Cea608Stream:Cea608Stream,Cea708Stream:Cea708Stream};var ge={H264_STREAM_TYPE:27,ADTS_STREAM_TYPE:15,METADATA_STREAM_TYPE:21};var ye=t;var _e=8589934592;var ve=4294967296;var Te="shared";var handleRollover$1=function(e,t){var s=1;e>t&&(s=-1);while(Math.abs(t-e)>ve)e+=s*_e;return e};var TimestampRolloverStream$1=function(e){var t,s;TimestampRolloverStream$1.prototype.init.call(this);this.type_=e||Te;this.push=function(e){if(e.type!=="metadata"){if(this.type_===Te||e.type===this.type_){s===void 0&&(s=e.dts);e.dts=handleRollover$1(e.dts,s);e.pts=handleRollover$1(e.pts,s);t=e.dts;this.trigger("data",e)}}else this.trigger("data",e)};this.flush=function(){s=t;this.trigger("done")};this.endTimeline=function(){this.flush();this.trigger("endedtimeline")};this.discontinuity=function(){s=void 0;t=void 0};this.reset=function(){this.discontinuity();this.trigger("reset")}};TimestampRolloverStream$1.prototype=new ye;var be={TimestampRolloverStream:TimestampRolloverStream$1,handleRollover:handleRollover$1};var typedArrayIndexOf$1=(e,t,s)=>{if(!e)return-1;var i=s;for(;i<e.length;i++)if(e[i]===t)return i;return-1};var Se={typedArrayIndexOf:typedArrayIndexOf$1};var Ce=Se.typedArrayIndexOf,ke={Iso88591:0,Utf16:1,Utf16be:2,Utf8:3},percentEncode$1=function(e,t,s){var i,n="";for(i=t;i<s;i++)n+="%"+("00"+e[i].toString(16)).slice(-2);return n},parseUtf8=function(e,t,s){return decodeURIComponent(percentEncode$1(e,t,s))},parseIso88591$1=function(e,t,s){return unescape(percentEncode$1(e,t,s))},parseSyncSafeInteger$1=function(e){return e[0]<<21|e[1]<<14|e[2]<<7|e[3]},we={APIC:function(e){var t,s,i=1,n="--\x3e";if(e.data[0]===ke.Utf8){t=Ce(e.data,0,i);if(!(t<0)){e.mimeType=parseIso88591$1(e.data,i,t);i=t+1;e.pictureType=e.data[i];i++;s=Ce(e.data,0,i);if(!(s<0)){e.description=parseUtf8(e.data,i,s);i=s+1;e.mimeType===n?e.url=parseIso88591$1(e.data,i,e.data.length):e.pictureData=e.data.subarray(i,e.data.length)}}}},"T*":function(e){if(e.data[0]===ke.Utf8){e.value=parseUtf8(e.data,1,e.data.length).replace(/\0*$/,"");e.values=e.value.split("\0")}},TXXX:function(e){var t;if(e.data[0]===ke.Utf8){t=Ce(e.data,0,1);if(t!==-1){e.description=parseUtf8(e.data,1,t);e.value=parseUtf8(e.data,t+1,e.data.length).replace(/\0*$/,"");e.data=e.value}}},"W*":function(e){e.url=parseIso88591$1(e.data,0,e.data.length).replace(/\0.*$/,"")},WXXX:function(e){var t;if(e.data[0]===ke.Utf8){t=Ce(e.data,0,1);if(t!==-1){e.description=parseUtf8(e.data,1,t);e.url=parseIso88591$1(e.data,t+1,e.data.length).replace(/\0.*$/,"")}}},PRIV:function(e){var t;for(t=0;t<e.data.length;t++)if(e.data[t]===0){e.owner=parseIso88591$1(e.data,0,t);break}e.privateData=e.data.subarray(t+1);e.data=e.privateData}};var parseId3Frames$1=function(e){var t,s,i=10,n=0,r=[];if(!(e.length<10||e[0]!=="I".charCodeAt(0)||e[1]!=="D".charCodeAt(0)||e[2]!=="3".charCodeAt(0))){n=parseSyncSafeInteger$1(e.subarray(6,10));n+=10;var a=e[5]&64;if(a){i+=4;i+=parseSyncSafeInteger$1(e.subarray(10,14));n-=parseSyncSafeInteger$1(e.subarray(16,20))}do{t=parseSyncSafeInteger$1(e.subarray(i+4,i+8));if(t<1)break;s=String.fromCharCode(e[i],e[i+1],e[i+2],e[i+3]);var o={id:s,data:e.subarray(i+10,i+t+10)};o.key=o.id;we[o.id]?we[o.id](o):o.id[0]==="T"?we["T*"](o):o.id[0]==="W"&&we["W*"](o);r.push(o);i+=10;i+=t}while(i<n);return r}};var Ee={parseId3Frames:parseId3Frames$1,parseSyncSafeInteger:parseSyncSafeInteger$1,frameParsers:we};var xe,Ie=t,Pe=ge,Le=Ee;xe=function(e){var t,s={descriptor:e&&e.descriptor},i=0,n=[],r=0;xe.prototype.init.call(this);this.dispatchType=Pe.METADATA_STREAM_TYPE.toString(16);if(s.descriptor)for(t=0;t<s.descriptor.length;t++)this.dispatchType+=("00"+s.descriptor[t].toString(16)).slice(-2);this.push=function(e){var t,s,a,o,l,d;if(e.type==="timed-metadata"){if(e.dataAlignmentIndicator){r=0;n.length=0}if(n.length===0&&(e.data.length<10||e.data[0]!=="I".charCodeAt(0)||e.data[1]!=="D".charCodeAt(0)||e.data[2]!=="3".charCodeAt(0)))this.trigger("log",{level:"warn",message:"Skipping unrecognized metadata packet"});else{n.push(e);r+=e.data.byteLength;if(n.length===1){i=Le.parseSyncSafeInteger(e.data.subarray(6,10));i+=10}if(!(r<i)){t={data:new Uint8Array(i),frames:[],pts:n[0].pts,dts:n[0].dts};for(l=0;l<i;){t.data.set(n[0].data.subarray(0,i-l),l);l+=n[0].data.byteLength;r-=n[0].data.byteLength;n.shift()}s=10;if(t.data[5]&64){s+=4;s+=Le.parseSyncSafeInteger(t.data.subarray(10,14));i-=Le.parseSyncSafeInteger(t.data.subarray(16,20))}do{a=Le.parseSyncSafeInteger(t.data.subarray(s+4,s+8));if(a<1){this.trigger("log",{level:"warn",message:"Malformed ID3 frame encountered. Skipping remaining metadata parsing."});break}d=String.fromCharCode(t.data[s],t.data[s+1],t.data[s+2],t.data[s+3]);o={id:d,data:t.data.subarray(s+10,s+a+10)};o.key=o.id;Le.frameParsers[o.id]?Le.frameParsers[o.id](o):o.id[0]==="T"?Le.frameParsers["T*"](o):o.id[0]==="W"&&Le.frameParsers["W*"](o);if(o.owner==="com.apple.streaming.transportStreamTimestamp"){var h=o.data,c=(h[3]&1)<<30|h[4]<<22|h[5]<<14|h[6]<<6|h[7]>>>2;c*=4;c+=h[7]&3;o.timeStamp=c;if(t.pts===void 0&&t.dts===void 0){t.pts=o.timeStamp;t.dts=o.timeStamp}this.trigger("timestamp",o)}t.frames.push(o);s+=10;s+=a}while(s<i);this.trigger("data",t)}}}}};xe.prototype=new Ie;var Ae=xe;var De=t,Oe=fe,Me=ge,Ue=be.TimestampRolloverStream;var Re,Be,je;var Fe=188,Ne=71;Re=function(){var e=new Uint8Array(Fe),t=0;Re.prototype.init.call(this);this.push=function(s){var i,n=0,r=Fe;if(t){i=new Uint8Array(s.byteLength+t);i.set(e.subarray(0,t));i.set(s,t);t=0}else i=s;while(r<i.byteLength)if(i[n]!==Ne||i[r]!==Ne){n++;r++}else{this.trigger("data",i.subarray(n,r));n+=Fe;r+=Fe}if(n<i.byteLength){e.set(i.subarray(n),0);t=i.byteLength-n}};this.flush=function(){if(t===Fe&&e[0]===Ne){this.trigger("data",e);t=0}this.trigger("done")};this.endTimeline=function(){this.flush();this.trigger("endedtimeline")};this.reset=function(){t=0;this.trigger("reset")}};Re.prototype=new De;Be=function(){var e,t,s,i;Be.prototype.init.call(this);i=this;this.packetsWaitingForPmt=[];this.programMapTable=void 0;e=function(e,i){var n=0;i.payloadUnitStartIndicator&&(n+=e[n]+1);i.type==="pat"?t(e.subarray(n),i):s(e.subarray(n),i)};t=function(e,t){t.section_number=e[7];t.last_section_number=e[8];i.pmtPid=(e[10]&31)<<8|e[11];t.pmtPid=i.pmtPid};
/**
     * Parse out the relevant fields of a Program Map Table (PMT).
     * @param payload {Uint8Array} the PMT-specific portion of an MP2T
     * packet. The first byte in this array should be the table_id
     * field.
     * @param pmt {object} the object that should be decorated with
     * fields parsed from the PMT.
     */s=function(e,t){var s,n,r,a;if(e[5]&1){i.programMapTable={video:null,audio:null,"timed-metadata":{}};s=(e[1]&15)<<8|e[2];n=3+s-4;r=(e[10]&15)<<8|e[11];a=12+r;while(a<n){var o=e[a];var l=(e[a+1]&31)<<8|e[a+2];o===Me.H264_STREAM_TYPE&&i.programMapTable.video===null?i.programMapTable.video=l:o===Me.ADTS_STREAM_TYPE&&i.programMapTable.audio===null?i.programMapTable.audio=l:o===Me.METADATA_STREAM_TYPE&&(i.programMapTable["timed-metadata"][l]=o);a+=5+((e[a+3]&15)<<8|e[a+4])}t.programMapTable=i.programMapTable}};this.push=function(t){var s={},i=4;s.payloadUnitStartIndicator=!!(t[1]&64);s.pid=t[1]&31;s.pid<<=8;s.pid|=t[2];(t[3]&48)>>>4>1&&(i+=t[i]+1);if(s.pid===0){s.type="pat";e(t.subarray(i),s);this.trigger("data",s)}else if(s.pid===this.pmtPid){s.type="pmt";e(t.subarray(i),s);this.trigger("data",s);while(this.packetsWaitingForPmt.length)this.processPes_.apply(this,this.packetsWaitingForPmt.shift())}else this.programMapTable===void 0?this.packetsWaitingForPmt.push([t,i,s]):this.processPes_(t,i,s)};this.processPes_=function(e,t,s){s.pid===this.programMapTable.video?s.streamType=Me.H264_STREAM_TYPE:s.pid===this.programMapTable.audio?s.streamType=Me.ADTS_STREAM_TYPE:s.streamType=this.programMapTable["timed-metadata"][s.pid];s.type="pes";s.data=e.subarray(t);this.trigger("data",s)}};Be.prototype=new De;Be.STREAM_TYPES={h264:27,adts:15};je=function(){var e,t=this,s=false,i={data:[],size:0},n={data:[],size:0},r={data:[],size:0},parsePes=function(e,t){var s;const i=e[0]<<16|e[1]<<8|e[2];t.data=new Uint8Array;if(i===1){t.packetLength=6+(e[4]<<8|e[5]);t.dataAlignmentIndicator=(e[6]&4)!==0;s=e[7];if(s&192){t.pts=(e[9]&14)<<27|(e[10]&255)<<20|(e[11]&254)<<12|(e[12]&255)<<5|(e[13]&254)>>>3;t.pts*=4;t.pts+=(e[13]&6)>>>1;t.dts=t.pts;if(s&64){t.dts=(e[14]&14)<<27|(e[15]&255)<<20|(e[16]&254)<<12|(e[17]&255)<<5|(e[18]&254)>>>3;t.dts*=4;t.dts+=(e[18]&6)>>>1}}t.data=e.subarray(9+e[8])}},flushStream=function(e,s,i){var n,r=new Uint8Array(e.size),a={type:s},o=0,l=0,d=false;if(e.data.length&&!(e.size<9)){a.trackId=e.data[0].pid;for(o=0;o<e.data.length;o++){n=e.data[o];r.set(n.data,l);l+=n.data.byteLength}parsePes(r,a);d=s==="video"||a.packetLength<=e.size;if(i||d){e.size=0;e.data.length=0}d&&t.trigger("data",a)}};je.prototype.init.call(this);this.push=function(a){({pat:function(){},pes:function(){var e,t;switch(a.streamType){case Me.H264_STREAM_TYPE:e=i;t="video";break;case Me.ADTS_STREAM_TYPE:e=n;t="audio";break;case Me.METADATA_STREAM_TYPE:e=r;t="timed-metadata";break;default:return}a.payloadUnitStartIndicator&&flushStream(e,t,true);e.data.push(a);e.size+=a.data.byteLength},pmt:function(){var i={type:"metadata",tracks:[]};e=a.programMapTable;e.video!==null&&i.tracks.push({timelineStartInfo:{baseMediaDecodeTime:0},id:+e.video,codec:"avc",type:"video"});e.audio!==null&&i.tracks.push({timelineStartInfo:{baseMediaDecodeTime:0},id:+e.audio,codec:"adts",type:"audio"});s=true;t.trigger("data",i)}})[a.type]()};this.reset=function(){i.size=0;i.data.length=0;n.size=0;n.data.length=0;this.trigger("reset")};this.flushStreams_=function(){flushStream(i,"video");flushStream(n,"audio");flushStream(r,"timed-metadata")};this.flush=function(){if(!s&&e){var i={type:"metadata",tracks:[]};e.video!==null&&i.tracks.push({timelineStartInfo:{baseMediaDecodeTime:0},id:+e.video,codec:"avc",type:"video"});e.audio!==null&&i.tracks.push({timelineStartInfo:{baseMediaDecodeTime:0},id:+e.audio,codec:"adts",type:"audio"});t.trigger("data",i)}s=false;this.flushStreams_();this.trigger("done")}};je.prototype=new De;var $e={PAT_PID:0,MP2T_PACKET_LENGTH:Fe,TransportPacketStream:Re,TransportParseStream:Be,ElementaryStream:je,TimestampRolloverStream:Ue,CaptionStream:Oe.CaptionStream,Cea608Stream:Oe.Cea608Stream,Cea708Stream:Oe.Cea708Stream,MetadataStream:Ae};for(var He in Me)Me.hasOwnProperty(He)&&($e[He]=Me[He]);var qe=$e;var Ve=t;var ze=ee.ONE_SECOND_IN_TS;var We;var Ge=[96e3,88200,64e3,48e3,44100,32e3,24e3,22050,16e3,12e3,11025,8e3,7350];We=function(e){var t,s=0;We.prototype.init.call(this);this.skipWarn_=function(e,t){this.trigger("log",{level:"warn",message:`adts skiping bytes ${e} to ${t} in frame ${s} outside syncword`})};this.push=function(i){var n,r,a,o,l,d=0;e||(s=0);if(i.type==="audio"){if(t&&t.length){a=t;t=new Uint8Array(a.byteLength+i.data.byteLength);t.set(a);t.set(i.data,a.byteLength)}else t=i.data;var h;while(d+7<t.length)if(t[d]===255&&(t[d+1]&246)===240){if(typeof h==="number"){this.skipWarn_(h,d);h=null}r=2*(1&~t[d+1]);n=(t[d+3]&3)<<11|t[d+4]<<3|(t[d+5]&224)>>5;o=1024*(1+(t[d+6]&3));l=o*ze/Ge[(t[d+2]&60)>>>2];if(t.byteLength-d<n)break;this.trigger("data",{pts:i.pts+s*l,dts:i.dts+s*l,sampleCount:o,audioobjecttype:1+(t[d+2]>>>6&3),channelcount:(t[d+2]&1)<<2|(t[d+3]&192)>>>6,samplerate:Ge[(t[d+2]&60)>>>2],samplingfrequencyindex:(t[d+2]&60)>>>2,samplesize:16,data:t.subarray(d+7+r,d+n)});s++;d+=n}else{typeof h!=="number"&&(h=d);d++}if(typeof h==="number"){this.skipWarn_(h,d);h=null}t=t.subarray(d)}};this.flush=function(){s=0;this.trigger("done")};this.reset=function(){t=void 0;this.trigger("reset")};this.endTimeline=function(){t=void 0;this.trigger("endedtimeline")}};We.prototype=new Ve;var Ke=We;var Qe;Qe=function(e){var t=e.byteLength,s=0,i=0;this.length=function(){return 8*t};this.bitsAvailable=function(){return 8*t+i};this.loadWord=function(){var n=e.byteLength-t,r=new Uint8Array(4),a=Math.min(4,t);if(a===0)throw new Error("no bytes available");r.set(e.subarray(n,n+a));s=new DataView(r.buffer).getUint32(0);i=a*8;t-=a};this.skipBits=function(e){var n;if(i>e){s<<=e;i-=e}else{e-=i;n=Math.floor(e/8);e-=n*8;t-=n;this.loadWord();s<<=e;i-=e}};this.readBits=function(e){var n=Math.min(i,e),r=s>>>32-n;i-=n;i>0?s<<=n:t>0&&this.loadWord();n=e-n;return n>0?r<<n|this.readBits(n):r};this.skipLeadingZeros=function(){var e;for(e=0;e<i;++e)if((s&2147483648>>>e)!==0){s<<=e;i-=e;return e}this.loadWord();return e+this.skipLeadingZeros()};this.skipUnsignedExpGolomb=function(){this.skipBits(1+this.skipLeadingZeros())};this.skipExpGolomb=function(){this.skipBits(1+this.skipLeadingZeros())};this.readUnsignedExpGolomb=function(){var e=this.skipLeadingZeros();return this.readBits(e+1)-1};this.readExpGolomb=function(){var e=this.readUnsignedExpGolomb();return 1&e?1+e>>>1:-1*(e>>>1)};this.readBoolean=function(){return this.readBits(1)===1};this.readUnsignedByte=function(){return this.readBits(8)};this.loadWord()};var Xe=Qe;var Ye=t;var Je=Xe;var Ze,et;var tt;et=function(){var e,t,s=0;et.prototype.init.call(this);
/*
     * Scans a byte stream and triggers a data event with the NAL units found.
     * @param {Object} data Event received from H264Stream
     * @param {Uint8Array} data.data The h264 byte stream to be scanned
     *
     * @see H264Stream.push
     */this.push=function(i){var n;if(t){n=new Uint8Array(t.byteLength+i.data.byteLength);n.set(t);n.set(i.data,t.byteLength);t=n}else t=i.data;var r=t.byteLength;for(;s<r-3;s++)if(t[s+2]===1){e=s+5;break}while(e<r)switch(t[e]){case 0:if(t[e-1]!==0){e+=2;break}if(t[e-2]!==0){e++;break}s+3!==e-2&&this.trigger("data",t.subarray(s+3,e-2));do{e++}while(t[e]!==1&&e<r);s=e-2;e+=3;break;case 1:if(t[e-1]!==0||t[e-2]!==0){e+=3;break}this.trigger("data",t.subarray(s+3,e-2));s=e-2;e+=3;break;default:e+=3;break}t=t.subarray(s);e-=s;s=0};this.reset=function(){t=null;s=0;this.trigger("reset")};this.flush=function(){t&&t.byteLength>3&&this.trigger("data",t.subarray(s+3));t=null;s=0;this.trigger("done")};this.endTimeline=function(){this.flush();this.trigger("endedtimeline")}};et.prototype=new Ye;tt={100:true,110:true,122:true,244:true,44:true,83:true,86:true,118:true,128:true,138:true,139:true,134:true};Ze=function(){var e,t,s,i,n,r,a,o=new et;Ze.prototype.init.call(this);e=this;
/*
     * Pushes a packet from a stream onto the NalByteStream
     *
     * @param {Object} packet - A packet received from a stream
     * @param {Uint8Array} packet.data - The raw bytes of the packet
     * @param {Number} packet.dts - Decode timestamp of the packet
     * @param {Number} packet.pts - Presentation timestamp of the packet
     * @param {Number} packet.trackId - The id of the h264 track this packet came from
     * @param {('video'|'audio')} packet.type - The type of packet
     *
     */this.push=function(e){if(e.type==="video"){t=e.trackId;s=e.pts;i=e.dts;o.push(e)}};
/*
     * Identify NAL unit types and pass on the NALU, trackId, presentation and decode timestamps
     * for the NALUs to the next stream component.
     * Also, preprocess caption and sequence parameter NALUs.
     *
     * @param {Uint8Array} data - A NAL unit identified by `NalByteStream.push`
     * @see NalByteStream.push
     */o.on("data",(function(a){var o={trackId:t,pts:s,dts:i,data:a,nalUnitTypeCode:a[0]&31};switch(o.nalUnitTypeCode){case 5:o.nalUnitType="slice_layer_without_partitioning_rbsp_idr";break;case 6:o.nalUnitType="sei_rbsp";o.escapedRBSP=n(a.subarray(1));break;case 7:o.nalUnitType="seq_parameter_set_rbsp";o.escapedRBSP=n(a.subarray(1));o.config=r(o.escapedRBSP);break;case 8:o.nalUnitType="pic_parameter_set_rbsp";break;case 9:o.nalUnitType="access_unit_delimiter_rbsp";break}e.trigger("data",o)}));o.on("done",(function(){e.trigger("done")}));o.on("partialdone",(function(){e.trigger("partialdone")}));o.on("reset",(function(){e.trigger("reset")}));o.on("endedtimeline",(function(){e.trigger("endedtimeline")}));this.flush=function(){o.flush()};this.partialFlush=function(){o.partialFlush()};this.reset=function(){o.reset()};this.endTimeline=function(){o.endTimeline()};
/**
     * Advance the ExpGolomb decoder past a scaling list. The scaling
     * list is optionally transmitted as part of a sequence parameter
     * set and is not relevant to transmuxing.
     * @param count {number} the number of entries in this scaling list
     * @param expGolombDecoder {object} an ExpGolomb pointed to the
     * start of a scaling list
     * @see Recommendation ITU-T H.264, Section 7.3.2.1.1.1
     */a=function(e,t){var s,i,n=8,r=8;for(s=0;s<e;s++){if(r!==0){i=t.readExpGolomb();r=(n+i+256)%256}n=r===0?n:r}};
/**
     * Expunge any "Emulation Prevention" bytes from a "Raw Byte
     * Sequence Payload"
     * @param data {Uint8Array} the bytes of a RBSP from a NAL
     * unit
     * @return {Uint8Array} the RBSP without any Emulation
     * Prevention Bytes
     */n=function(e){var t,s,i=e.byteLength,n=[],r=1;while(r<i-2)if(e[r]===0&&e[r+1]===0&&e[r+2]===3){n.push(r+2);r+=2}else r++;if(n.length===0)return e;t=i-n.length;s=new Uint8Array(t);var a=0;for(r=0;r<t;a++,r++){if(a===n[0]){a++;n.shift()}s[r]=e[a]}return s};
/**
     * Read a sequence parameter set and return some interesting video
     * properties. A sequence parameter set is the H264 metadata that
     * describes the properties of upcoming video frames.
     * @param data {Uint8Array} the bytes of a sequence parameter set
     * @return {object} an object with configuration parsed from the
     * sequence parameter set, including the dimensions of the
     * associated video frames.
     */r=function(e){var t,s,i,n,r,o,l,d,h,c,u,p,m,f=0,g=0,y=0,_=0,v=[1,1];t=new Je(e);s=t.readUnsignedByte();n=t.readUnsignedByte();i=t.readUnsignedByte();t.skipUnsignedExpGolomb();if(tt[s]){r=t.readUnsignedExpGolomb();r===3&&t.skipBits(1);t.skipUnsignedExpGolomb();t.skipUnsignedExpGolomb();t.skipBits(1);if(t.readBoolean()){u=r!==3?8:12;for(m=0;m<u;m++)t.readBoolean()&&a(m<6?16:64,t)}}t.skipUnsignedExpGolomb();o=t.readUnsignedExpGolomb();if(o===0)t.readUnsignedExpGolomb();else if(o===1){t.skipBits(1);t.skipExpGolomb();t.skipExpGolomb();l=t.readUnsignedExpGolomb();for(m=0;m<l;m++)t.skipExpGolomb()}t.skipUnsignedExpGolomb();t.skipBits(1);d=t.readUnsignedExpGolomb();h=t.readUnsignedExpGolomb();c=t.readBits(1);c===0&&t.skipBits(1);t.skipBits(1);if(t.readBoolean()){f=t.readUnsignedExpGolomb();g=t.readUnsignedExpGolomb();y=t.readUnsignedExpGolomb();_=t.readUnsignedExpGolomb()}if(t.readBoolean()&&t.readBoolean()){p=t.readUnsignedByte();switch(p){case 1:v=[1,1];break;case 2:v=[12,11];break;case 3:v=[10,11];break;case 4:v=[16,11];break;case 5:v=[40,33];break;case 6:v=[24,11];break;case 7:v=[20,11];break;case 8:v=[32,11];break;case 9:v=[80,33];break;case 10:v=[18,11];break;case 11:v=[15,11];break;case 12:v=[64,33];break;case 13:v=[160,99];break;case 14:v=[4,3];break;case 15:v=[3,2];break;case 16:v=[2,1];break;case 255:v=[t.readUnsignedByte()<<8|t.readUnsignedByte(),t.readUnsignedByte()<<8|t.readUnsignedByte()];break}v&&v[0]/v[1]}return{profileIdc:s,levelIdc:i,profileCompatibility:n,width:(d+1)*16-f*2-g*2,height:(2-c)*(h+1)*16-y*2-_*2,sarRatio:v}}};Ze.prototype=new Ye;var st={H264Stream:Ze,NalByteStream:et};var it=[96e3,88200,64e3,48e3,44100,32e3,24e3,22050,16e3,12e3,11025,8e3,7350];var parseId3TagSize=function(e,t){var s=e[t+6]<<21|e[t+7]<<14|e[t+8]<<7|e[t+9],i=e[t+5],n=(i&16)>>4;s=s>=0?s:0;return n?s+20:s+10};var getId3Offset=function(e,t){if(e.length-t<10||e[t]!=="I".charCodeAt(0)||e[t+1]!=="D".charCodeAt(0)||e[t+2]!=="3".charCodeAt(0))return t;t+=parseId3TagSize(e,t);return getId3Offset(e,t)};var isLikelyAacData$1=function(e){var t=getId3Offset(e,0);return e.length>=t+2&&(e[t]&255)===255&&(e[t+1]&240)===240&&(e[t+1]&22)===16};var parseSyncSafeInteger=function(e){return e[0]<<21|e[1]<<14|e[2]<<7|e[3]};var percentEncode=function(e,t,s){var i,n="";for(i=t;i<s;i++)n+="%"+("00"+e[i].toString(16)).slice(-2);return n};var parseIso88591=function(e,t,s){return unescape(percentEncode(e,t,s))};var parseAdtsSize=function(e,t){var s=(e[t+5]&224)>>5,i=e[t+4]<<3,n=e[t+3]&6144;return n|i|s};var parseType$5=function(e,t){return e[t]==="I".charCodeAt(0)&&e[t+1]==="D".charCodeAt(0)&&e[t+2]==="3".charCodeAt(0)?"timed-metadata":e[t]&true&&(e[t+1]&240)===240?"audio":null};var parseSampleRate=function(e){var t=0;while(t+5<e.length){if(e[t]===255&&(e[t+1]&246)===240)return it[(e[t+2]&60)>>>2];t++}return null};var parseAacTimestamp=function(e){var t,s,i,n;t=10;if(e[5]&64){t+=4;t+=parseSyncSafeInteger(e.subarray(10,14))}do{s=parseSyncSafeInteger(e.subarray(t+4,t+8));if(s<1)return null;n=String.fromCharCode(e[t],e[t+1],e[t+2],e[t+3]);if(n==="PRIV"){i=e.subarray(t+10,t+s+10);for(var r=0;r<i.byteLength;r++)if(i[r]===0){var a=parseIso88591(i,0,r);if(a==="com.apple.streaming.transportStreamTimestamp"){var o=i.subarray(r+1);var l=(o[3]&1)<<30|o[4]<<22|o[5]<<14|o[6]<<6|o[7]>>>2;l*=4;l+=o[7]&3;return l}break}}t+=10;t+=s}while(t<e.byteLength);return null};var nt={isLikelyAacData:isLikelyAacData$1,parseId3TagSize:parseId3TagSize,parseAdtsSize:parseAdtsSize,parseType:parseType$5,parseSampleRate:parseSampleRate,parseAacTimestamp:parseAacTimestamp};var rt=t;var at=nt;var ot;ot=function(){var e=new Uint8Array,t=0;ot.prototype.init.call(this);this.setTimestamp=function(e){t=e};this.push=function(s){var i,n,r,a,o=0,l=0;if(e.length){a=e.length;e=new Uint8Array(s.byteLength+a);e.set(e.subarray(0,a));e.set(s,a)}else e=s;while(e.length-l>=3)if(e[l]!=="I".charCodeAt(0)||e[l+1]!=="D".charCodeAt(0)||e[l+2]!=="3".charCodeAt(0))if((e[l]&255)!==255||(e[l+1]&240)!==240)l++;else{if(e.length-l<7)break;o=at.parseAdtsSize(e,l);if(l+o>e.length)break;r={type:"audio",data:e.subarray(l,l+o),pts:t,dts:t};this.trigger("data",r);l+=o}else{if(e.length-l<10)break;o=at.parseId3TagSize(e,l);if(l+o>e.length)break;n={type:"timed-metadata",data:e.subarray(l,l+o)};this.trigger("data",n);l+=o}i=e.length-l;e=i>0?e.subarray(l):new Uint8Array};this.reset=function(){e=new Uint8Array;this.trigger("reset")};this.endTimeline=function(){e=new Uint8Array;this.trigger("endedtimeline")}};ot.prototype=new rt;var lt=ot;var dt=["audioobjecttype","channelcount","samplerate","samplingfrequencyindex","samplesize"];var ht=dt;var ct=["width","height","profileIdc","levelIdc","profileCompatibility","sarRatio"];var ut=ct;var pt=t;var mt=$;var ft=H;var gt=ie;var yt=re;var _t=qe;var vt=ee;var Tt=Ke;var bt=st.H264Stream;var St=lt;var Ct=nt.isLikelyAacData;var kt=ee.ONE_SECOND_IN_TS;var wt=ht;var Et=ut;var xt,It,Pt,Lt;var retriggerForStream=function(e,t){t.stream=e;this.trigger("log",t)};var addPipelineLogRetriggers=function(e,t){var s=Object.keys(t);for(var i=0;i<s.length;i++){var n=s[i];n!=="headOfPipeline"&&t[n].on&&t[n].on("log",retriggerForStream.bind(e,n))}};var arrayEquals=function(e,t){var s;if(e.length!==t.length)return false;for(s=0;s<e.length;s++)if(e[s]!==t[s])return false;return true};var generateSegmentTimingInfo=function(e,t,s,i,n,r){var a=s-t,o=i-t,l=n-s;return{start:{dts:e,pts:e+a},end:{dts:e+o,pts:e+l},prependedContentDuration:r,baseMediaDecodeTime:e}};
/**
   * Constructs a single-track, ISO BMFF media segment from AAC data
   * events. The output of this stream can be fed to a SourceBuffer
   * configured with a suitable initialization segment.
   * @param track {object} track metadata configuration
   * @param options {object} transmuxer options object
   * @param options.keepOriginalTimestamps {boolean} If true, keep the timestamps
   *        in the source; false to adjust the first segment to start at 0.
   */It=function(e,t){var s,i=[],n=0,r=0,a=Infinity;t=t||{};s=t.firstSequenceNumber||0;It.prototype.init.call(this);this.push=function(t){yt.collectDtsInfo(e,t);e&&wt.forEach((function(s){e[s]=t[s]}));i.push(t)};this.setEarliestDts=function(e){n=e};this.setVideoBaseMediaDecodeTime=function(e){a=e};this.setAudioAppendStart=function(e){r=e};this.flush=function(){var o,l,d,h,c,u,p;if(i.length!==0){o=gt.trimAdtsFramesByEarliestDts(i,e,n);e.baseMediaDecodeTime=yt.calculateTrackBaseMediaDecodeTime(e,t.keepOriginalTimestamps);p=gt.prefixWithSilence(e,o,r,a);e.samples=gt.generateSampleTable(o);d=mt.mdat(gt.concatenateFrameData(o));i=[];l=mt.moof(s,[e]);h=new Uint8Array(l.byteLength+d.byteLength);s++;h.set(l);h.set(d,l.byteLength);yt.clearDtsInfo(e);c=Math.ceil(kt*1024/e.samplerate);if(o.length){u=o.length*c;this.trigger("segmentTimingInfo",generateSegmentTimingInfo(vt.audioTsToVideoTs(e.baseMediaDecodeTime,e.samplerate),o[0].dts,o[0].pts,o[0].dts+u,o[0].pts+u,p||0));this.trigger("timingInfo",{start:o[0].pts,end:o[0].pts+u})}this.trigger("data",{track:e,boxes:h});this.trigger("done","AudioSegmentStream")}else this.trigger("done","AudioSegmentStream")};this.reset=function(){yt.clearDtsInfo(e);i=[];this.trigger("reset")}};It.prototype=new pt;
/**
   * Constructs a single-track, ISO BMFF media segment from H264 data
   * events. The output of this stream can be fed to a SourceBuffer
   * configured with a suitable initialization segment.
   * @param track {object} track metadata configuration
   * @param options {object} transmuxer options object
   * @param options.alignGopsAtEnd {boolean} If true, start from the end of the
   *        gopsToAlignWith list when attempting to align gop pts
   * @param options.keepOriginalTimestamps {boolean} If true, keep the timestamps
   *        in the source; false to adjust the first segment to start at 0.
   */xt=function(e,t){var s,i,n,r=[],a=[];t=t||{};s=t.firstSequenceNumber||0;xt.prototype.init.call(this);delete e.minPTS;this.gopCache_=[];
/**
      * Constructs a ISO BMFF segment given H264 nalUnits
      * @param {Object} nalUnit A data event representing a nalUnit
      * @param {String} nalUnit.nalUnitType
      * @param {Object} nalUnit.config Properties for a mp4 track
      * @param {Uint8Array} nalUnit.data The nalUnit bytes
      * @see lib/codecs/h264.js
     **/this.push=function(t){yt.collectDtsInfo(e,t);if(t.nalUnitType==="seq_parameter_set_rbsp"&&!i){i=t.config;e.sps=[t.data];Et.forEach((function(t){e[t]=i[t]}),this)}if(t.nalUnitType==="pic_parameter_set_rbsp"&&!n){n=t.data;e.pps=[t.data]}r.push(t)};this.flush=function(){var i,n,o,l,d,h,c,u,p=0;while(r.length){if(r[0].nalUnitType==="access_unit_delimiter_rbsp")break;r.shift()}if(r.length!==0){i=ft.groupNalsIntoFrames(r);o=ft.groupFramesIntoGops(i);if(!o[0][0].keyFrame){n=this.getGopForFusion_(r[0],e);if(n){p=n.duration;o.unshift(n);o.byteLength+=n.byteLength;o.nalCount+=n.nalCount;o.pts=n.pts;o.dts=n.dts;o.duration+=n.duration}else o=ft.extendFirstKeyFrame(o)}if(a.length){var m;m=t.alignGopsAtEnd?this.alignGopsAtEnd_(o):this.alignGopsAtStart_(o);if(!m){this.gopCache_.unshift({gop:o.pop(),pps:e.pps,sps:e.sps});this.gopCache_.length=Math.min(6,this.gopCache_.length);r=[];this.resetStream_();this.trigger("done","VideoSegmentStream");return}yt.clearDtsInfo(e);o=m}yt.collectDtsInfo(e,o);e.samples=ft.generateSampleTable(o);d=mt.mdat(ft.concatenateNalData(o));e.baseMediaDecodeTime=yt.calculateTrackBaseMediaDecodeTime(e,t.keepOriginalTimestamps);this.trigger("processedGopsInfo",o.map((function(e){return{pts:e.pts,dts:e.dts,byteLength:e.byteLength}})));c=o[0];u=o[o.length-1];this.trigger("segmentTimingInfo",generateSegmentTimingInfo(e.baseMediaDecodeTime,c.dts,c.pts,u.dts+u.duration,u.pts+u.duration,p));this.trigger("timingInfo",{start:o[0].pts,end:o[o.length-1].pts+o[o.length-1].duration});this.gopCache_.unshift({gop:o.pop(),pps:e.pps,sps:e.sps});this.gopCache_.length=Math.min(6,this.gopCache_.length);r=[];this.trigger("baseMediaDecodeTime",e.baseMediaDecodeTime);this.trigger("timelineStartInfo",e.timelineStartInfo);l=mt.moof(s,[e]);h=new Uint8Array(l.byteLength+d.byteLength);s++;h.set(l);h.set(d,l.byteLength);this.trigger("data",{track:e,boxes:h});this.resetStream_();this.trigger("done","VideoSegmentStream")}else{this.resetStream_();this.trigger("done","VideoSegmentStream")}};this.reset=function(){this.resetStream_();r=[];this.gopCache_.length=0;a.length=0;this.trigger("reset")};this.resetStream_=function(){yt.clearDtsInfo(e);i=void 0;n=void 0};this.getGopForFusion_=function(t){var s,i,n,r,a,o=45e3,l=1e4,d=Infinity;for(a=0;a<this.gopCache_.length;a++){r=this.gopCache_[a];n=r.gop;if(e.pps&&arrayEquals(e.pps[0],r.pps[0])&&e.sps&&arrayEquals(e.sps[0],r.sps[0])&&!(n.dts<e.timelineStartInfo.dts)){s=t.dts-n.dts-n.duration;if(s>=-l&&s<=o&&(!i||d>s)){i=r;d=s}}}return i?i.gop:null};this.alignGopsAtStart_=function(e){var t,s,i,n,r,o,l,d;r=e.byteLength;o=e.nalCount;l=e.duration;t=s=0;while(t<a.length&&s<e.length){i=a[t];n=e[s];if(i.pts===n.pts)break;if(n.pts>i.pts)t++;else{s++;r-=n.byteLength;o-=n.nalCount;l-=n.duration}}if(s===0)return e;if(s===e.length)return null;d=e.slice(s);d.byteLength=r;d.duration=l;d.nalCount=o;d.pts=d[0].pts;d.dts=d[0].dts;return d};this.alignGopsAtEnd_=function(e){var t,s,i,n,r,o;t=a.length-1;s=e.length-1;r=null;o=false;while(t>=0&&s>=0){i=a[t];n=e[s];if(i.pts===n.pts){o=true;break}if(i.pts>n.pts)t--;else{t===a.length-1&&(r=s);s--}}if(!o&&r===null)return null;var l;l=o?s:r;if(l===0)return e;var d=e.slice(l);var h=d.reduce((function(e,t){e.byteLength+=t.byteLength;e.duration+=t.duration;e.nalCount+=t.nalCount;return e}),{byteLength:0,duration:0,nalCount:0});d.byteLength=h.byteLength;d.duration=h.duration;d.nalCount=h.nalCount;d.pts=d[0].pts;d.dts=d[0].dts;return d};this.alignGopsWith=function(e){a=e}};xt.prototype=new pt;
/**
   * A Stream that can combine multiple streams (ie. audio & video)
   * into a single output segment for MSE. Also supports audio-only
   * and video-only streams.
   * @param options {object} transmuxer options object
   * @param options.keepOriginalTimestamps {boolean} If true, keep the timestamps
   *        in the source; false to adjust the first segment to start at media timeline start.
   */Lt=function(e,t){this.numberOfTracks=0;this.metadataStream=t;e=e||{};typeof e.remux!=="undefined"?this.remuxTracks=!!e.remux:this.remuxTracks=true;typeof e.keepOriginalTimestamps==="boolean"?this.keepOriginalTimestamps=e.keepOriginalTimestamps:this.keepOriginalTimestamps=false;this.pendingTracks=[];this.videoTrack=null;this.pendingBoxes=[];this.pendingCaptions=[];this.pendingMetadata=[];this.pendingBytes=0;this.emittedTracks=0;Lt.prototype.init.call(this);this.push=function(e){if(e.content||e.text)return this.pendingCaptions.push(e);if(e.frames)return this.pendingMetadata.push(e);this.pendingTracks.push(e.track);this.pendingBytes+=e.boxes.byteLength;if(e.track.type==="video"){this.videoTrack=e.track;this.pendingBoxes.push(e.boxes)}if(e.track.type==="audio"){this.audioTrack=e.track;this.pendingBoxes.unshift(e.boxes)}}};Lt.prototype=new pt;Lt.prototype.flush=function(e){var t,s,i,n,r=0,a={captions:[],captionStreams:{},metadata:[],info:{}},o=0;if(this.pendingTracks.length<this.numberOfTracks){if(e!=="VideoSegmentStream"&&e!=="AudioSegmentStream")return;if(this.remuxTracks)return;if(this.pendingTracks.length===0){this.emittedTracks++;if(this.emittedTracks>=this.numberOfTracks){this.trigger("done");this.emittedTracks=0}return}}if(this.videoTrack){o=this.videoTrack.timelineStartInfo.pts;Et.forEach((function(e){a.info[e]=this.videoTrack[e]}),this)}else if(this.audioTrack){o=this.audioTrack.timelineStartInfo.pts;wt.forEach((function(e){a.info[e]=this.audioTrack[e]}),this)}if(this.videoTrack||this.audioTrack){this.pendingTracks.length===1?a.type=this.pendingTracks[0].type:a.type="combined";this.emittedTracks+=this.pendingTracks.length;i=mt.initSegment(this.pendingTracks);a.initSegment=new Uint8Array(i.byteLength);a.initSegment.set(i);a.data=new Uint8Array(this.pendingBytes);for(n=0;n<this.pendingBoxes.length;n++){a.data.set(this.pendingBoxes[n],r);r+=this.pendingBoxes[n].byteLength}for(n=0;n<this.pendingCaptions.length;n++){t=this.pendingCaptions[n];t.startTime=vt.metadataTsToSeconds(t.startPts,o,this.keepOriginalTimestamps);t.endTime=vt.metadataTsToSeconds(t.endPts,o,this.keepOriginalTimestamps);a.captionStreams[t.stream]=true;a.captions.push(t)}for(n=0;n<this.pendingMetadata.length;n++){s=this.pendingMetadata[n];s.cueTime=vt.metadataTsToSeconds(s.pts,o,this.keepOriginalTimestamps);a.metadata.push(s)}a.metadata.dispatchType=this.metadataStream.dispatchType;this.pendingTracks.length=0;this.videoTrack=null;this.pendingBoxes.length=0;this.pendingCaptions.length=0;this.pendingBytes=0;this.pendingMetadata.length=0;this.trigger("data",a);for(n=0;n<a.captions.length;n++){t=a.captions[n];this.trigger("caption",t)}for(n=0;n<a.metadata.length;n++){s=a.metadata[n];this.trigger("id3Frame",s)}}if(this.emittedTracks>=this.numberOfTracks){this.trigger("done");this.emittedTracks=0}};Lt.prototype.setRemux=function(e){this.remuxTracks=e};Pt=function(e){var t,s,i=this,n=true;Pt.prototype.init.call(this);e=e||{};this.baseMediaDecodeTime=e.baseMediaDecodeTime||0;this.transmuxPipeline_={};this.setupAacPipeline=function(){var n={};this.transmuxPipeline_=n;n.type="aac";n.metadataStream=new _t.MetadataStream;n.aacStream=new St;n.audioTimestampRolloverStream=new _t.TimestampRolloverStream("audio");n.timedMetadataTimestampRolloverStream=new _t.TimestampRolloverStream("timed-metadata");n.adtsStream=new Tt;n.coalesceStream=new Lt(e,n.metadataStream);n.headOfPipeline=n.aacStream;n.aacStream.pipe(n.audioTimestampRolloverStream).pipe(n.adtsStream);n.aacStream.pipe(n.timedMetadataTimestampRolloverStream).pipe(n.metadataStream).pipe(n.coalesceStream);n.metadataStream.on("timestamp",(function(e){n.aacStream.setTimestamp(e.timeStamp)}));n.aacStream.on("data",(function(r){if(!(r.type!=="timed-metadata"&&r.type!=="audio"||n.audioSegmentStream)){s=s||{timelineStartInfo:{baseMediaDecodeTime:i.baseMediaDecodeTime},codec:"adts",type:"audio"};n.coalesceStream.numberOfTracks++;n.audioSegmentStream=new It(s,e);n.audioSegmentStream.on("log",i.getLogTrigger_("audioSegmentStream"));n.audioSegmentStream.on("timingInfo",i.trigger.bind(i,"audioTimingInfo"));n.adtsStream.pipe(n.audioSegmentStream).pipe(n.coalesceStream);i.trigger("trackinfo",{hasAudio:!!s,hasVideo:!!t})}}));n.coalesceStream.on("data",this.trigger.bind(this,"data"));n.coalesceStream.on("done",this.trigger.bind(this,"done"));addPipelineLogRetriggers(this,n)};this.setupTsPipeline=function(){var n={};this.transmuxPipeline_=n;n.type="ts";n.metadataStream=new _t.MetadataStream;n.packetStream=new _t.TransportPacketStream;n.parseStream=new _t.TransportParseStream;n.elementaryStream=new _t.ElementaryStream;n.timestampRolloverStream=new _t.TimestampRolloverStream;n.adtsStream=new Tt;n.h264Stream=new bt;n.captionStream=new _t.CaptionStream(e);n.coalesceStream=new Lt(e,n.metadataStream);n.headOfPipeline=n.packetStream;n.packetStream.pipe(n.parseStream).pipe(n.elementaryStream).pipe(n.timestampRolloverStream);n.timestampRolloverStream.pipe(n.h264Stream);n.timestampRolloverStream.pipe(n.adtsStream);n.timestampRolloverStream.pipe(n.metadataStream).pipe(n.coalesceStream);n.h264Stream.pipe(n.captionStream).pipe(n.coalesceStream);n.elementaryStream.on("data",(function(r){var a;if(r.type==="metadata"){a=r.tracks.length;while(a--)if(t||r.tracks[a].type!=="video"){if(!s&&r.tracks[a].type==="audio"){s=r.tracks[a];s.timelineStartInfo.baseMediaDecodeTime=i.baseMediaDecodeTime}}else{t=r.tracks[a];t.timelineStartInfo.baseMediaDecodeTime=i.baseMediaDecodeTime}if(t&&!n.videoSegmentStream){n.coalesceStream.numberOfTracks++;n.videoSegmentStream=new xt(t,e);n.videoSegmentStream.on("log",i.getLogTrigger_("videoSegmentStream"));n.videoSegmentStream.on("timelineStartInfo",(function(t){if(s&&!e.keepOriginalTimestamps){s.timelineStartInfo=t;n.audioSegmentStream.setEarliestDts(t.dts-i.baseMediaDecodeTime)}}));n.videoSegmentStream.on("processedGopsInfo",i.trigger.bind(i,"gopInfo"));n.videoSegmentStream.on("segmentTimingInfo",i.trigger.bind(i,"videoSegmentTimingInfo"));n.videoSegmentStream.on("baseMediaDecodeTime",(function(e){s&&n.audioSegmentStream.setVideoBaseMediaDecodeTime(e)}));n.videoSegmentStream.on("timingInfo",i.trigger.bind(i,"videoTimingInfo"));n.h264Stream.pipe(n.videoSegmentStream).pipe(n.coalesceStream)}if(s&&!n.audioSegmentStream){n.coalesceStream.numberOfTracks++;n.audioSegmentStream=new It(s,e);n.audioSegmentStream.on("log",i.getLogTrigger_("audioSegmentStream"));n.audioSegmentStream.on("timingInfo",i.trigger.bind(i,"audioTimingInfo"));n.audioSegmentStream.on("segmentTimingInfo",i.trigger.bind(i,"audioSegmentTimingInfo"));n.adtsStream.pipe(n.audioSegmentStream).pipe(n.coalesceStream)}i.trigger("trackinfo",{hasAudio:!!s,hasVideo:!!t})}}));n.coalesceStream.on("data",this.trigger.bind(this,"data"));n.coalesceStream.on("id3Frame",(function(e){e.dispatchType=n.metadataStream.dispatchType;i.trigger("id3Frame",e)}));n.coalesceStream.on("caption",this.trigger.bind(this,"caption"));n.coalesceStream.on("done",this.trigger.bind(this,"done"));addPipelineLogRetriggers(this,n)};this.setBaseMediaDecodeTime=function(i){var n=this.transmuxPipeline_;e.keepOriginalTimestamps||(this.baseMediaDecodeTime=i);if(s){s.timelineStartInfo.dts=void 0;s.timelineStartInfo.pts=void 0;yt.clearDtsInfo(s);n.audioTimestampRolloverStream&&n.audioTimestampRolloverStream.discontinuity()}if(t){n.videoSegmentStream&&(n.videoSegmentStream.gopCache_=[]);t.timelineStartInfo.dts=void 0;t.timelineStartInfo.pts=void 0;yt.clearDtsInfo(t);n.captionStream.reset()}n.timestampRolloverStream&&n.timestampRolloverStream.discontinuity()};this.setAudioAppendStart=function(e){s&&this.transmuxPipeline_.audioSegmentStream.setAudioAppendStart(e)};this.setRemux=function(t){var s=this.transmuxPipeline_;e.remux=t;s&&s.coalesceStream&&s.coalesceStream.setRemux(t)};this.alignGopsWith=function(e){t&&this.transmuxPipeline_.videoSegmentStream&&this.transmuxPipeline_.videoSegmentStream.alignGopsWith(e)};this.getLogTrigger_=function(e){var t=this;return function(s){s.stream=e;t.trigger("log",s)}};this.push=function(e){if(n){var t=Ct(e);t&&this.transmuxPipeline_.type!=="aac"?this.setupAacPipeline():t||this.transmuxPipeline_.type==="ts"||this.setupTsPipeline();n=false}this.transmuxPipeline_.headOfPipeline.push(e)};this.flush=function(){n=true;this.transmuxPipeline_.headOfPipeline.flush()};this.endTimeline=function(){this.transmuxPipeline_.headOfPipeline.endTimeline()};this.reset=function(){this.transmuxPipeline_.headOfPipeline&&this.transmuxPipeline_.headOfPipeline.reset()};this.resetCaptions=function(){this.transmuxPipeline_.captionStream&&this.transmuxPipeline_.captionStream.reset()}};Pt.prototype=new pt;var At={Transmuxer:Pt,VideoSegmentStream:xt,AudioSegmentStream:It,AUDIO_PROPERTIES:wt,VIDEO_PROPERTIES:Et,generateSegmentTimingInfo:generateSegmentTimingInfo};var toUnsigned$3=function(e){return e>>>0};var toHexString$1=function(e){return("00"+e.toString(16)).slice(-2)};var Dt={toUnsigned:toUnsigned$3,toHexString:toHexString$1};var parseType$4=function(e){var t="";t+=String.fromCharCode(e[0]);t+=String.fromCharCode(e[1]);t+=String.fromCharCode(e[2]);t+=String.fromCharCode(e[3]);return t};var Ot=parseType$4;var Mt=Dt.toUnsigned;var Ut=Ot;var findBox$5=function(e,t){var s,i,n,r,a,o=[];if(!t.length)return null;for(s=0;s<e.byteLength;){i=Mt(e[s]<<24|e[s+1]<<16|e[s+2]<<8|e[s+3]);n=Ut(e.subarray(s+4,s+8));r=i>1?s+i:e.byteLength;if(n===t[0])if(t.length===1)o.push(e.subarray(s+8,r));else{a=findBox$5(e.subarray(s+8,r),t.slice(1));a.length&&(o=o.concat(a))}s=r}return o};var Rt=findBox$5;var Bt=Dt.toUnsigned;var jt=i.getUint64;var tfdt=function(e){var t={version:e[0],flags:new Uint8Array(e.subarray(1,4))};t.version===1?t.baseMediaDecodeTime=jt(e.subarray(4)):t.baseMediaDecodeTime=Bt(e[4]<<24|e[5]<<16|e[6]<<8|e[7]);return t};var Ft=tfdt;var tfhd=function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i={version:e[0],flags:new Uint8Array(e.subarray(1,4)),trackId:s.getUint32(4)},n=i.flags[2]&1,r=i.flags[2]&2,a=i.flags[2]&8,o=i.flags[2]&16,l=i.flags[2]&32,d=i.flags[0]&65536,h=i.flags[0]&131072;t=8;if(n){t+=4;i.baseDataOffset=s.getUint32(12);t+=4}if(r){i.sampleDescriptionIndex=s.getUint32(t);t+=4}if(a){i.defaultSampleDuration=s.getUint32(t);t+=4}if(o){i.defaultSampleSize=s.getUint32(t);t+=4}l&&(i.defaultSampleFlags=s.getUint32(t));d&&(i.durationIsEmpty=true);!n&&h&&(i.baseDataOffsetIsMoof=true);return i};var Nt=tfhd;var $t=i.getUint64;var parseSidx=function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength),s={version:e[0],flags:new Uint8Array(e.subarray(1,4)),references:[],referenceId:t.getUint32(4),timescale:t.getUint32(8)},i=12;if(s.version===0){s.earliestPresentationTime=t.getUint32(i);s.firstOffset=t.getUint32(i+4);i+=8}else{s.earliestPresentationTime=$t(e.subarray(i));s.firstOffset=$t(e.subarray(i+8));i+=16}i+=2;var n=t.getUint16(i);i+=2;for(;n>0;i+=12,n--)s.references.push({referenceType:(e[i]&128)>>>7,referencedSize:t.getUint32(i)&2147483647,subsegmentDuration:t.getUint32(i+4),startsWithSap:!!(e[i+8]&128),sapType:(e[i+8]&112)>>>4,sapDeltaTime:t.getUint32(i+8)&268435455});return s};var Ht=parseSidx;var parseSampleFlags$1=function(e){return{isLeading:(e[0]&12)>>>2,dependsOn:e[0]&3,isDependedOn:(e[1]&192)>>>6,hasRedundancy:(e[1]&48)>>>4,paddingValue:(e[1]&14)>>>1,isNonSyncSample:e[1]&1,degradationPriority:e[2]<<8|e[3]}};var qt=parseSampleFlags$1;var Vt=qt;var trun=function(e){var t,s={version:e[0],flags:new Uint8Array(e.subarray(1,4)),samples:[]},i=new DataView(e.buffer,e.byteOffset,e.byteLength),n=s.flags[2]&1,r=s.flags[2]&4,a=s.flags[1]&1,o=s.flags[1]&2,l=s.flags[1]&4,d=s.flags[1]&8,h=i.getUint32(4),c=8;if(n){s.dataOffset=i.getInt32(c);c+=4}if(r&&h){t={flags:Vt(e.subarray(c,c+4))};c+=4;if(a){t.duration=i.getUint32(c);c+=4}if(o){t.size=i.getUint32(c);c+=4}if(d){s.version===1?t.compositionTimeOffset=i.getInt32(c):t.compositionTimeOffset=i.getUint32(c);c+=4}s.samples.push(t);h--}while(h--){t={};if(a){t.duration=i.getUint32(c);c+=4}if(o){t.size=i.getUint32(c);c+=4}if(l){t.flags=Vt(e.subarray(c,c+4));c+=4}if(d){s.version===1?t.compositionTimeOffset=i.getInt32(c):t.compositionTimeOffset=i.getUint32(c);c+=4}s.samples.push(t)}return s};var zt=trun;var Wt=i;var Gt=Wt.getUint64;var Kt,Qt,parseMp4Date=function(e){return new Date(e*1e3-20828448e5)},Xt=Ot,Yt=Rt,nalParse=function(e){var t,s,i=new DataView(e.buffer,e.byteOffset,e.byteLength),n=[];for(t=0;t+4<e.length;t+=s){s=i.getUint32(t);t+=4;if(s<=0)n.push("<span style='color:red;'>MALFORMED DATA</span>");else switch(e[t]&31){case 1:n.push("slice_layer_without_partitioning_rbsp");break;case 5:n.push("slice_layer_without_partitioning_rbsp_idr");break;case 6:n.push("sei_rbsp");break;case 7:n.push("seq_parameter_set_rbsp");break;case 8:n.push("pic_parameter_set_rbsp");break;case 9:n.push("access_unit_delimiter_rbsp");break;default:n.push("UNKNOWN NAL - "+e[t]&31);break}}return n},Jt={avc1:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength);return{dataReferenceIndex:t.getUint16(6),width:t.getUint16(24),height:t.getUint16(26),horizresolution:t.getUint16(28)+t.getUint16(30)/16,vertresolution:t.getUint16(32)+t.getUint16(34)/16,frameCount:t.getUint16(40),depth:t.getUint16(74),config:Kt(e.subarray(78,e.byteLength))}},avcC:function(e){var t,s,i,n,r=new DataView(e.buffer,e.byteOffset,e.byteLength),a={configurationVersion:e[0],avcProfileIndication:e[1],profileCompatibility:e[2],avcLevelIndication:e[3],lengthSizeMinusOne:e[4]&3,sps:[],pps:[]},o=e[5]&31;i=6;for(n=0;n<o;n++){s=r.getUint16(i);i+=2;a.sps.push(new Uint8Array(e.subarray(i,i+s)));i+=s}t=e[i];i++;for(n=0;n<t;n++){s=r.getUint16(i);i+=2;a.pps.push(new Uint8Array(e.subarray(i,i+s)));i+=s}return a},btrt:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength);return{bufferSizeDB:t.getUint32(0),maxBitrate:t.getUint32(4),avgBitrate:t.getUint32(8)}},edts:function edts(e){return{boxes:Kt(e)}},elst:function elst(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i={version:s.getUint8(0),flags:new Uint8Array(e.subarray(1,4)),edits:[]},n=s.getUint32(4);for(t=8;n;n--)if(i.version===0){i.edits.push({segmentDuration:s.getUint32(t),mediaTime:s.getInt32(t+4),mediaRate:s.getUint16(t+8)+s.getUint16(t+10)/65536});t+=12}else{i.edits.push({segmentDuration:Gt(e.subarray(t)),mediaTime:Gt(e.subarray(t+8)),mediaRate:s.getUint16(t+16)+s.getUint16(t+18)/65536});t+=20}return i},esds:function(e){return{version:e[0],flags:new Uint8Array(e.subarray(1,4)),esId:e[6]<<8|e[7],streamPriority:e[8]&31,decoderConfig:{objectProfileIndication:e[11],streamType:e[12]>>>2&63,bufferSize:e[13]<<16|e[14]<<8|e[15],maxBitrate:e[16]<<24|e[17]<<16|e[18]<<8|e[19],avgBitrate:e[20]<<24|e[21]<<16|e[22]<<8|e[23],decoderConfigDescriptor:{tag:e[24],length:e[25],audioObjectType:e[26]>>>3&31,samplingFrequencyIndex:(e[26]&7)<<1|e[27]>>>7&1,channelConfiguration:e[27]>>>3&15}}}},ftyp:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength),s={majorBrand:Xt(e.subarray(0,4)),minorVersion:t.getUint32(4),compatibleBrands:[]},i=8;while(i<e.byteLength){s.compatibleBrands.push(Xt(e.subarray(i,i+4)));i+=4}return s},dinf:function(e){return{boxes:Kt(e)}},dref:function(e){return{version:e[0],flags:new Uint8Array(e.subarray(1,4)),dataReferences:Kt(e.subarray(8))}},hdlr:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength),s={version:t.getUint8(0),flags:new Uint8Array(e.subarray(1,4)),handlerType:Xt(e.subarray(8,12)),name:""},i=8;for(i=24;i<e.byteLength;i++){if(e[i]===0){i++;break}s.name+=String.fromCharCode(e[i])}s.name=decodeURIComponent(escape(s.name));return s},mdat:function(e){return{byteLength:e.byteLength,nals:nalParse(e)}},mdhd:function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i=4,n={version:s.getUint8(0),flags:new Uint8Array(e.subarray(1,4)),language:""};if(n.version===1){i+=4;n.creationTime=parseMp4Date(s.getUint32(i));i+=8;n.modificationTime=parseMp4Date(s.getUint32(i));i+=4;n.timescale=s.getUint32(i);i+=8;n.duration=s.getUint32(i)}else{n.creationTime=parseMp4Date(s.getUint32(i));i+=4;n.modificationTime=parseMp4Date(s.getUint32(i));i+=4;n.timescale=s.getUint32(i);i+=4;n.duration=s.getUint32(i)}i+=4;t=s.getUint16(i);n.language+=String.fromCharCode(96+(t>>10));n.language+=String.fromCharCode(96+((t&992)>>5));n.language+=String.fromCharCode(96+(t&31));return n},mdia:function(e){return{boxes:Kt(e)}},mfhd:function(e){return{version:e[0],flags:new Uint8Array(e.subarray(1,4)),sequenceNumber:e[4]<<24|e[5]<<16|e[6]<<8|e[7]}},minf:function(e){return{boxes:Kt(e)}},mp4a:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength),s={dataReferenceIndex:t.getUint16(6),channelcount:t.getUint16(16),samplesize:t.getUint16(18),samplerate:t.getUint16(24)+t.getUint16(26)/65536};e.byteLength>28&&(s.streamDescriptor=Kt(e.subarray(28))[0]);return s},moof:function(e){return{boxes:Kt(e)}},moov:function(e){return{boxes:Kt(e)}},mvex:function(e){return{boxes:Kt(e)}},mvhd:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength),s=4,i={version:t.getUint8(0),flags:new Uint8Array(e.subarray(1,4))};if(i.version===1){s+=4;i.creationTime=parseMp4Date(t.getUint32(s));s+=8;i.modificationTime=parseMp4Date(t.getUint32(s));s+=4;i.timescale=t.getUint32(s);s+=8;i.duration=t.getUint32(s)}else{i.creationTime=parseMp4Date(t.getUint32(s));s+=4;i.modificationTime=parseMp4Date(t.getUint32(s));s+=4;i.timescale=t.getUint32(s);s+=4;i.duration=t.getUint32(s)}s+=4;i.rate=t.getUint16(s)+t.getUint16(s+2)/16;s+=4;i.volume=t.getUint8(s)+t.getUint8(s+1)/8;s+=2;s+=2;s+=8;i.matrix=new Uint32Array(e.subarray(s,s+36));s+=36;s+=24;i.nextTrackId=t.getUint32(s);return i},pdin:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength);return{version:t.getUint8(0),flags:new Uint8Array(e.subarray(1,4)),rate:t.getUint32(4),initialDelay:t.getUint32(8)}},sdtp:function(e){var t,s={version:e[0],flags:new Uint8Array(e.subarray(1,4)),samples:[]};for(t=4;t<e.byteLength;t++)s.samples.push({dependsOn:(e[t]&48)>>4,isDependedOn:(e[t]&12)>>2,hasRedundancy:e[t]&3});return s},sidx:Ht,smhd:function(e){return{version:e[0],flags:new Uint8Array(e.subarray(1,4)),balance:e[4]+e[5]/256}},stbl:function(e){return{boxes:Kt(e)}},ctts:function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i={version:s.getUint8(0),flags:new Uint8Array(e.subarray(1,4)),compositionOffsets:[]},n=s.getUint32(4);for(t=8;n;t+=8,n--)i.compositionOffsets.push({sampleCount:s.getUint32(t),sampleOffset:s[i.version===0?"getUint32":"getInt32"](t+4)});return i},stss:function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i={version:s.getUint8(0),flags:new Uint8Array(e.subarray(1,4)),syncSamples:[]},n=s.getUint32(4);for(t=8;n;t+=4,n--)i.syncSamples.push(s.getUint32(t));return i},stco:function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i={version:e[0],flags:new Uint8Array(e.subarray(1,4)),chunkOffsets:[]},n=s.getUint32(4);for(t=8;n;t+=4,n--)i.chunkOffsets.push(s.getUint32(t));return i},stsc:function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i=s.getUint32(4),n={version:e[0],flags:new Uint8Array(e.subarray(1,4)),sampleToChunks:[]};for(t=8;i;t+=12,i--)n.sampleToChunks.push({firstChunk:s.getUint32(t),samplesPerChunk:s.getUint32(t+4),sampleDescriptionIndex:s.getUint32(t+8)});return n},stsd:function(e){return{version:e[0],flags:new Uint8Array(e.subarray(1,4)),sampleDescriptions:Kt(e.subarray(8))}},stsz:function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i={version:e[0],flags:new Uint8Array(e.subarray(1,4)),sampleSize:s.getUint32(4),entries:[]};for(t=12;t<e.byteLength;t+=4)i.entries.push(s.getUint32(t));return i},stts:function(e){var t,s=new DataView(e.buffer,e.byteOffset,e.byteLength),i={version:e[0],flags:new Uint8Array(e.subarray(1,4)),timeToSamples:[]},n=s.getUint32(4);for(t=8;n;t+=8,n--)i.timeToSamples.push({sampleCount:s.getUint32(t),sampleDelta:s.getUint32(t+4)});return i},styp:function(e){return Jt.ftyp(e)},tfdt:Ft,tfhd:Nt,tkhd:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength),s=4,i={version:t.getUint8(0),flags:new Uint8Array(e.subarray(1,4))};if(i.version===1){s+=4;i.creationTime=parseMp4Date(t.getUint32(s));s+=8;i.modificationTime=parseMp4Date(t.getUint32(s));s+=4;i.trackId=t.getUint32(s);s+=4;s+=8;i.duration=t.getUint32(s)}else{i.creationTime=parseMp4Date(t.getUint32(s));s+=4;i.modificationTime=parseMp4Date(t.getUint32(s));s+=4;i.trackId=t.getUint32(s);s+=4;s+=4;i.duration=t.getUint32(s)}s+=4;s+=8;i.layer=t.getUint16(s);s+=2;i.alternateGroup=t.getUint16(s);s+=2;i.volume=t.getUint8(s)+t.getUint8(s+1)/8;s+=2;s+=2;i.matrix=new Uint32Array(e.subarray(s,s+36));s+=36;i.width=t.getUint16(s)+t.getUint16(s+2)/65536;s+=4;i.height=t.getUint16(s)+t.getUint16(s+2)/65536;return i},traf:function(e){return{boxes:Kt(e)}},trak:function(e){return{boxes:Kt(e)}},trex:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength);return{version:e[0],flags:new Uint8Array(e.subarray(1,4)),trackId:t.getUint32(4),defaultSampleDescriptionIndex:t.getUint32(8),defaultSampleDuration:t.getUint32(12),defaultSampleSize:t.getUint32(16),sampleDependsOn:e[20]&3,sampleIsDependedOn:(e[21]&192)>>6,sampleHasRedundancy:(e[21]&48)>>4,samplePaddingValue:(e[21]&14)>>1,sampleIsDifferenceSample:!!(e[21]&1),sampleDegradationPriority:t.getUint16(22)}},trun:zt,"url ":function(e){return{version:e[0],flags:new Uint8Array(e.subarray(1,4))}},vmhd:function(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength);return{version:e[0],flags:new Uint8Array(e.subarray(1,4)),graphicsmode:t.getUint16(4),opcolor:new Uint16Array([t.getUint16(6),t.getUint16(8),t.getUint16(10)])}}};
/**
   * Return a javascript array of box objects parsed from an ISO base
   * media file.
   * @param data {Uint8Array} the binary data of the media to be inspected
   * @return {array} a javascript array of potentially nested box objects
   */Kt=function(e){var t,s,i,n,r,a=0,o=[];var l=new ArrayBuffer(e.length);var d=new Uint8Array(l);for(var h=0;h<e.length;++h)d[h]=e[h];t=new DataView(l);while(a<e.byteLength){s=t.getUint32(a);i=Xt(e.subarray(a+4,a+8));n=s>1?a+s:e.byteLength;r=(Jt[i]||function(e){return{data:e}})(e.subarray(a+8,n));r.size=s;r.type=i;o.push(r);a=n}return o};
/**
   * Returns a textual representation of the javascript represtentation
   * of an MP4 file. You can use it as an alternative to
   * JSON.stringify() to compare inspected MP4s.
   * @param inspectedMp4 {array} the parsed array of boxes in an MP4
   * file
   * @param depth {number} (optional) the number of ancestor boxes of
   * the elements of inspectedMp4. Assumed to be zero if unspecified.
   * @return {string} a text representation of the parsed MP4
   */Qt=function(e,t){var s;t=t||0;s=new Array(t*2+1).join(" ");return e.map((function(e,i){return s+e.type+"\n"+Object.keys(e).filter((function(e){return e!=="type"&&e!=="boxes"})).map((function(t){var i=s+"  "+t+": ",n=e[t];if(n instanceof Uint8Array||n instanceof Uint32Array){var r=Array.prototype.slice.call(new Uint8Array(n.buffer,n.byteOffset,n.byteLength)).map((function(e){return" "+("00"+e.toString(16)).slice(-2)})).join("").match(/.{1,24}/g);return r?r.length===1?i+"<"+r.join("").slice(1)+">":i+"<\n"+r.map((function(e){return s+"  "+e})).join("\n")+"\n"+s+"  >":i+"<>"}return i+JSON.stringify(n,null,2).split("\n").map((function(e,t){return t===0?e:s+"  "+e})).join("\n")})).join("\n")+(e.boxes?"\n"+Qt(e.boxes,t+1):"")})).join("\n")};var Zt={inspect:Kt,textify:Qt,parseType:Xt,findBox:Yt,parseTraf:Jt.traf,parseTfdt:Jt.tfdt,parseHdlr:Jt.hdlr,parseTfhd:Jt.tfhd,parseTrun:Jt.trun,parseSidx:Jt.sidx};
/**
   * Returns the first string in the data array ending with a null char '\0'
   * @param {UInt8} data 
   * @returns the string with the null char
   */var uint8ToCString$1=function(e){var t=0;var s=String.fromCharCode(e[t]);var i="";while(s!=="\0"){i+=s;t++;s=String.fromCharCode(e[t])}i+=s;return i};var es={uint8ToCString:uint8ToCString$1};var ts=es.uint8ToCString;var ss=i.getUint64;
/**
   * Based on: ISO/IEC 23009 Section: 5.10.3.3
   * References:
   * https://dashif-documents.azurewebsites.net/Events/master/event.html#emsg-format
   * https://aomediacodec.github.io/id3-emsg/
   * 
   * Takes emsg box data as a uint8 array and returns a emsg box object
   * @param {UInt8Array} boxData data from emsg box
   * @returns A parsed emsg box object
   */var parseEmsgBox=function(e){var t=4;var s=e[0];var i,n,r,a,o,l,d,h;if(s===0){i=ts(e.subarray(t));t+=i.length;n=ts(e.subarray(t));t+=n.length;var c=new DataView(e.buffer);r=c.getUint32(t);t+=4;o=c.getUint32(t);t+=4;l=c.getUint32(t);t+=4;d=c.getUint32(t);t+=4}else if(s===1){c=new DataView(e.buffer);r=c.getUint32(t);t+=4;a=ss(e.subarray(t));t+=8;l=c.getUint32(t);t+=4;d=c.getUint32(t);t+=4;i=ts(e.subarray(t));t+=i.length;n=ts(e.subarray(t));t+=n.length}h=new Uint8Array(e.subarray(t,e.byteLength));var u={scheme_id_uri:i,value:n,timescale:r||1,presentation_time:a,presentation_time_delta:o,event_duration:l,id:d,message_data:h};return isValidEmsgBox(s,u)?u:void 0};
/**
   * Scales a presentation time or time delta with an offset with a provided timescale
   * @param {number} presentationTime 
   * @param {number} timescale 
   * @param {number} timeDelta 
   * @param {number} offset 
   * @returns the scaled time as a number
   */var scaleTime=function(e,t,s,i){return e||e===0?e/t:i+s/t};
/**
   * Checks the emsg box data for validity based on the version
   * @param {number} version of the emsg box to validate
   * @param {Object} emsg the emsg data to validate
   * @returns if the box is valid as a boolean
   */var isValidEmsgBox=function(e,t){var s=t.scheme_id_uri!=="\0";var i=e===0&&isDefined(t.presentation_time_delta)&&s;var n=e===1&&isDefined(t.presentation_time)&&s;return!(e>1)&&i||n};var isDefined=function(e){return e!==void 0||e!==null};var is={parseEmsgBox:parseEmsgBox,scaleTime:scaleTime};var ns;ns=typeof window!=="undefined"?window:typeof e!=="undefined"?e:typeof self!=="undefined"?self:{};var rs=ns;var as=Dt.toUnsigned;var os=Dt.toHexString;var ls=Rt;var ds=Ot;var hs=is;var cs=Nt;var us=zt;var ps=Ft;var ms=i.getUint64;var fs,gs,ys,_s,vs,Ts,bs;var Ss=rs;var Cs=Ee.parseId3Frames;
/**
   * Parses an MP4 initialization segment and extracts the timescale
   * values for any declared tracks. Timescale values indicate the
   * number of clock ticks per second to assume for time-based values
   * elsewhere in the MP4.
   *
   * To determine the start time of an MP4, you need two pieces of
   * information: the timescale unit and the earliest base media decode
   * time. Multiple timescales can be specified within an MP4 but the
   * base media decode time is always expressed in the timescale from
   * the media header box for the track:
   * ```
   * moov > trak > mdia > mdhd.timescale
   * ```
   * @param init {Uint8Array} the bytes of the init segment
   * @return {object} a hash of track ids to timescale values or null if
   * the init segment is malformed.
   */fs=function(e){var t={},s=ls(e,["moov","trak"]);return s.reduce((function(e,t){var s,i,n,r,a;s=ls(t,["tkhd"])[0];if(!s)return null;i=s[0];n=i===0?12:20;r=as(s[n]<<24|s[n+1]<<16|s[n+2]<<8|s[n+3]);a=ls(t,["mdia","mdhd"])[0];if(!a)return null;i=a[0];n=i===0?12:20;e[r]=as(a[n]<<24|a[n+1]<<16|a[n+2]<<8|a[n+3]);return e}),t)};
/**
   * Determine the base media decode start time, in seconds, for an MP4
   * fragment. If multiple fragments are specified, the earliest time is
   * returned.
   *
   * The base media decode time can be parsed from track fragment
   * metadata:
   * ```
   * moof > traf > tfdt.baseMediaDecodeTime
   * ```
   * It requires the timescale value from the mdhd to interpret.
   *
   * @param timescale {object} a hash of track ids to timescale values.
   * @return {number} the earliest base media decode start time for the
   * fragment, in seconds
   */gs=function(e,t){var s;s=ls(t,["moof","traf"]);var i=s.reduce((function(t,s){var i=ls(s,["tfhd"])[0];var n=as(i[4]<<24|i[5]<<16|i[6]<<8|i[7]);var r=e[n]||9e4;var a=ls(s,["tfdt"])[0];var o=new DataView(a.buffer,a.byteOffset,a.byteLength);var l;l=a[0]===1?ms(a.subarray(4,12)):o.getUint32(4);let d;typeof l==="bigint"?d=l/Ss.BigInt(r):typeof l!=="number"||isNaN(l)||(d=l/r);d<Number.MAX_SAFE_INTEGER&&(d=Number(d));d<t&&(t=d);return t}),Infinity);return typeof i==="bigint"||isFinite(i)?i:0};
/**
   * Determine the composition start, in seconds, for an MP4
   * fragment.
   *
   * The composition start time of a fragment can be calculated using the base
   * media decode time, composition time offset, and timescale, as follows:
   *
   * compositionStartTime = (baseMediaDecodeTime + compositionTimeOffset) / timescale
   *
   * All of the aforementioned information is contained within a media fragment's
   * `traf` box, except for timescale info, which comes from the initialization
   * segment, so a track id (also contained within a `traf`) is also necessary to
   * associate it with a timescale
   *
   *
   * @param timescales {object} - a hash of track ids to timescale values.
   * @param fragment {Unit8Array} - the bytes of a media segment
   * @return {number} the composition start time for the fragment, in seconds
   **/ys=function(e,t){var s=ls(t,["moof","traf"]);var i=0;var n=0;var r;if(s&&s.length){var a=ls(s[0],["tfhd"])[0];var o=ls(s[0],["trun"])[0];var l=ls(s[0],["tfdt"])[0];if(a){var d=cs(a);r=d.trackId}if(l){var h=ps(l);i=h.baseMediaDecodeTime}if(o){var c=us(o);c.samples&&c.samples.length&&(n=c.samples[0].compositionTimeOffset||0)}}var u=e[r]||9e4;if(typeof i==="bigint"){n=Ss.BigInt(n);u=Ss.BigInt(u)}var p=(i+n)/u;typeof p==="bigint"&&p<Number.MAX_SAFE_INTEGER&&(p=Number(p));return p};
/**
    * Find the trackIds of the video tracks in this source.
    * Found by parsing the Handler Reference and Track Header Boxes:
    *   moov > trak > mdia > hdlr
    *   moov > trak > tkhd
    *
    * @param {Uint8Array} init - The bytes of the init segment for this source
    * @return {Number[]} A list of trackIds
    *
    * @see ISO-BMFF-12/2015, Section 8.4.3
   **/_s=function(e){var t=ls(e,["moov","trak"]);var s=[];t.forEach((function(e){var t=ls(e,["mdia","hdlr"]);var i=ls(e,["tkhd"]);t.forEach((function(e,t){var n=ds(e.subarray(8,12));var r=i[t];var a;var o;var l;if(n==="vide"){a=new DataView(r.buffer,r.byteOffset,r.byteLength);o=a.getUint8(0);l=o===0?a.getUint32(12):a.getUint32(20);s.push(l)}}))}));return s};Ts=function(e){var t=e[0];var s=t===0?12:20;return as(e[s]<<24|e[s+1]<<16|e[s+2]<<8|e[s+3])};vs=function(e){var t=ls(e,["moov","trak"]);var s=[];t.forEach((function(e){var t={};var i=ls(e,["tkhd"])[0];var n,r;if(i){n=new DataView(i.buffer,i.byteOffset,i.byteLength);r=n.getUint8(0);t.id=r===0?n.getUint32(12):n.getUint32(20)}var a=ls(e,["mdia","hdlr"])[0];if(a){var o=ds(a.subarray(8,12));t.type=o==="vide"?"video":o==="soun"?"audio":o}var l=ls(e,["mdia","minf","stbl","stsd"])[0];if(l){var d=l.subarray(8);t.codec=ds(d.subarray(4,8));var h=ls(d,[t.codec])[0];var c,u;if(h)if(/^[asm]vc[1-9]$/i.test(t.codec)){c=h.subarray(78);u=ds(c.subarray(4,8));if(u==="avcC"&&c.length>11){t.codec+=".";t.codec+=os(c[9]);t.codec+=os(c[10]);t.codec+=os(c[11])}else t.codec="avc1.4d400d"}else if(/^mp4[a,v]$/i.test(t.codec)){c=h.subarray(28);u=ds(c.subarray(4,8));if(u==="esds"&&c.length>20&&c[19]!==0){t.codec+="."+os(c[19]);t.codec+="."+os(c[20]>>>2&63).replace(/^0/,"")}else t.codec="mp4a.40.2"}else t.codec=t.codec.toLowerCase()}var p=ls(e,["mdia","mdhd"])[0];p&&(t.timescale=Ts(p));s.push(t)}));return s};
/**
   * Returns an array of emsg ID3 data from the provided segmentData.
   * An offset can also be provided as the Latest Arrival Time to calculate 
   * the Event Start Time of v0 EMSG boxes. 
   * See: https://dashif-documents.azurewebsites.net/Events/master/event.html#Inband-event-timing
   * 
   * @param {Uint8Array} segmentData the segment byte array.
   * @param {number} offset the segment start time or Latest Arrival Time, 
   * @return {Object[]} an array of ID3 parsed from EMSG boxes
   */bs=function(e,t=0){var s=ls(e,["emsg"]);return s.map((e=>{var s=hs.parseEmsgBox(new Uint8Array(e));var i=Cs(s.message_data);return{cueTime:hs.scaleTime(s.presentation_time,s.timescale,s.presentation_time_delta,t),duration:hs.scaleTime(s.event_duration,s.timescale),frames:i}}))};var ks={findBox:ls,parseType:ds,timescale:fs,startTime:gs,compositionStartTime:ys,videoTrackIds:_s,tracks:vs,getTimescaleFromMediaHeader:Ts,getEmsgID3:bs};const{parseTrun:ws}=Zt;const{findBox:Es}=ks;var xs=rs;
/**
   * Utility function for parsing data from mdat boxes.
   * @param {Array<Uint8Array>} segment the segment data to create mdat/traf pairs from.
   * @returns mdat and traf boxes paired up for easier parsing.
   */var getMdatTrafPairs$2=function(e){var t=Es(e,["moof","traf"]);var s=Es(e,["mdat"]);var i=[];s.forEach((function(e,s){var n=t[s];i.push({mdat:e,traf:n})}));return i};
/**
    * Parses sample information out of Track Run Boxes and calculates
    * the absolute presentation and decode timestamps of each sample.
    *
    * @param {Array<Uint8Array>} truns - The Trun Run boxes to be parsed
    * @param {Number|BigInt} baseMediaDecodeTime - base media decode time from tfdt
        @see ISO-BMFF-12/2015, Section 8.8.12
    * @param {Object} tfhd - The parsed Track Fragment Header
    *   @see inspect.parseTfhd
    * @return {Object[]} the parsed samples
    *
    * @see ISO-BMFF-12/2015, Section 8.8.8
   **/var parseSamples$2=function(e,t,s){var i=t;var n=s.defaultSampleDuration||0;var r=s.defaultSampleSize||0;var a=s.trackId;var o=[];e.forEach((function(e){var t=ws(e);var s=t.samples;s.forEach((function(e){e.duration===void 0&&(e.duration=n);e.size===void 0&&(e.size=r);e.trackId=a;e.dts=i;e.compositionTimeOffset===void 0&&(e.compositionTimeOffset=0);if(typeof i==="bigint"){e.pts=i+xs.BigInt(e.compositionTimeOffset);i+=xs.BigInt(e.duration)}else{e.pts=i+e.compositionTimeOffset;i+=e.duration}}));o=o.concat(s)}));return o};var Is={getMdatTrafPairs:getMdatTrafPairs$2,parseSamples:parseSamples$2};var Ps=le.discardEmulationPreventionBytes;var Ls=fe.CaptionStream;var As=Rt;var Ds=Ft;var Os=Nt;var{getMdatTrafPairs:Ms,parseSamples:Us}=Is;
/**
    * Maps an offset in the mdat to a sample based on the the size of the samples.
    * Assumes that `parseSamples` has been called first.
    *
    * @param {Number} offset - The offset into the mdat
    * @param {Object[]} samples - An array of samples, parsed using `parseSamples`
    * @return {?Object} The matching sample, or null if no match was found.
    *
    * @see ISO-BMFF-12/2015, Section 8.8.8
   **/var mapToSample=function(e,t){var s=e;for(var i=0;i<t.length;i++){var n=t[i];if(s<n.size)return n;s-=n.size}return null};
/**
    * Finds SEI nal units contained in a Media Data Box.
    * Assumes that `parseSamples` has been called first.
    *
    * @param {Uint8Array} avcStream - The bytes of the mdat
    * @param {Object[]} samples - The samples parsed out by `parseSamples`
    * @param {Number} trackId - The trackId of this video track
    * @return {Object[]} seiNals - the parsed SEI NALUs found.
    *   The contents of the seiNal should match what is expected by
    *   CaptionStream.push (nalUnitType, size, data, escapedRBSP, pts, dts)
    *
    * @see ISO-BMFF-12/2015, Section 8.1.1
    * @see Rec. ITU-T H.264, 7.3.2.3.1
   **/var findSeiNals=function(e,t,s){var i,n,r,a,o=new DataView(e.buffer,e.byteOffset,e.byteLength),l={logs:[],seiNals:[]};for(n=0;n+4<e.length;n+=r){r=o.getUint32(n);n+=4;if(!(r<=0))switch(e[n]&31){case 6:var d=e.subarray(n+1,n+1+r);var h=mapToSample(n,t);i={nalUnitType:"sei_rbsp",size:r,data:d,escapedRBSP:Ps(d),trackId:s};if(h){i.pts=h.pts;i.dts=h.dts;a=h}else{if(!a){l.logs.push({level:"warn",message:"We've encountered a nal unit without data at "+n+" for trackId "+s+". See mux.js#223."});break}i.pts=a.pts;i.dts=a.dts}l.seiNals.push(i);break}}return l};
/**
    * Parses out caption nals from an FMP4 segment's video tracks.
    *
    * @param {Uint8Array} segment - The bytes of a single segment
    * @param {Number} videoTrackId - The trackId of a video track in the segment
    * @return {Object.<Number, Object[]>} A mapping of video trackId to
    *   a list of seiNals found in that track
   **/var parseCaptionNals=function(e,t){var s={};var i=Ms(e);i.forEach((function(e){var i=e.mdat;var n=e.traf;var r=As(n,["tfhd"]);var a=Os(r[0]);var o=a.trackId;var l=As(n,["tfdt"]);var d=l.length>0?Ds(l[0]).baseMediaDecodeTime:0;var h=As(n,["trun"]);var c;var u;if(t===o&&h.length>0){c=Us(h,d,a);u=findSeiNals(i,c,o);s[o]||(s[o]={seiNals:[],logs:[]});s[o].seiNals=s[o].seiNals.concat(u.seiNals);s[o].logs=s[o].logs.concat(u.logs)}}));return s};
/**
    * Parses out inband captions from an MP4 container and returns
    * caption objects that can be used by WebVTT and the TextTrack API.
    * @see https://developer.mozilla.org/en-US/docs/Web/API/VTTCue
    * @see https://developer.mozilla.org/en-US/docs/Web/API/TextTrack
    * Assumes that `probe.getVideoTrackIds` and `probe.timescale` have been called first
    *
    * @param {Uint8Array} segment - The fmp4 segment containing embedded captions
    * @param {Number} trackId - The id of the video track to parse
    * @param {Number} timescale - The timescale for the video track from the init segment
    *
    * @return {?Object[]} parsedCaptions - A list of captions or null if no video tracks
    * @return {Number} parsedCaptions[].startTime - The time to show the caption in seconds
    * @return {Number} parsedCaptions[].endTime - The time to stop showing the caption in seconds
    * @return {Object[]} parsedCaptions[].content - A list of individual caption segments
    * @return {String} parsedCaptions[].content.text - The visible content of the caption segment
    * @return {Number} parsedCaptions[].content.line - The line height from 1-15 for positioning of the caption segment
    * @return {Number} parsedCaptions[].content.position - The column indent percentage for cue positioning from 10-80
   **/var parseEmbeddedCaptions=function(e,t,s){var i;if(t===null)return null;i=parseCaptionNals(e,t);var n=i[t]||{};return{seiNals:n.seiNals,logs:n.logs,timescale:s}};var CaptionParser=function(){var e=false;var t;var s;var i;var n;var r;var a;
/**
      * A method to indicate whether a CaptionParser has been initalized
      * @returns {Boolean}
     **/this.isInitialized=function(){return e};this.init=function(s){t=new Ls;e=true;a=!!s&&s.isPartial;t.on("data",(function(e){e.startTime=e.startPts/n;e.endTime=e.endPts/n;r.captions.push(e);r.captionStreams[e.stream]=true}));t.on("log",(function(e){r.logs.push(e)}))};this.isNewInit=function(e,t){return!(e&&e.length===0||t&&typeof t==="object"&&Object.keys(t).length===0)&&(i!==e[0]||n!==t[i])};
/**
      * Parses out SEI captions and interacts with underlying
      * CaptionStream to return dispatched captions
      *
      * @param {Uint8Array} segment - The fmp4 segment containing embedded captions
      * @param {Number[]} videoTrackIds - A list of video tracks found in the init segment
      * @param {Object.<Number, Number>} timescales - The timescales found in the init segment
      * @see parseEmbeddedCaptions
      * @see m2ts/caption-stream.js
     **/this.parse=function(e,t,a){var o;if(!this.isInitialized())return null;if(!t||!a)return null;if(this.isNewInit(t,a)){i=t[0];n=a[i]}else if(i===null||!n){s.push(e);return null}while(s.length>0){var l=s.shift();this.parse(l,t,a)}o=parseEmbeddedCaptions(e,i,n);o&&o.logs&&(r.logs=r.logs.concat(o.logs));if(o===null||!o.seiNals)return r.logs.length?{logs:r.logs,captions:[],captionStreams:[]}:null;this.pushNals(o.seiNals);this.flushStream();return r};
/**
      * Pushes SEI NALUs onto CaptionStream
      * @param {Object[]} nals - A list of SEI nals parsed using `parseCaptionNals`
      * Assumes that `parseCaptionNals` has been called first
      * @see m2ts/caption-stream.js
      **/this.pushNals=function(e){if(!this.isInitialized()||!e||e.length===0)return null;e.forEach((function(e){t.push(e)}))};this.flushStream=function(){if(!this.isInitialized())return null;a?t.partialFlush():t.flush()};this.clearParsedCaptions=function(){r.captions=[];r.captionStreams={};r.logs=[]};this.resetCaptionStream=function(){if(!this.isInitialized())return null;t.reset()};this.clearAllCaptions=function(){this.clearParsedCaptions();this.resetCaptionStream()};this.reset=function(){s=[];i=null;n=null;r?this.clearParsedCaptions():r={captions:[],captionStreams:{},logs:[]};this.resetCaptionStream()};this.reset()};var Rs=CaptionParser;const{parseTfdt:Bs}=Zt;const js=Rt;const{getTimescaleFromMediaHeader:Fs}=ks;const{parseSamples:Ns,getMdatTrafPairs:$s}=Is;const WebVttParser=function(){let e=9e4;
/**
     * Parses the timescale from the init segment.
     * @param {Array<Uint8Array>} segment The initialization segment to parse the timescale from.
     */this.init=function(t){const s=js(t,["moov","trak","mdia","mdhd"])[0];s&&(e=Fs(s))};
/**
     * Parses a WebVTT FMP4 segment.
     * @param {Array<Uint8Array>} segment The content segment to parse the WebVTT cues from.
     * @returns The WebVTT cue text, styling, and timing info as an array of cue objects.
     */this.parseSegment=function(t){const s=[];const i=$s(t);let n=0;i.forEach((function(t){const i=t.mdat;const r=t.traf;const a=js(r,["tfdt"])[0];const o=js(r,["tfhd"])[0];const l=js(r,["trun"]);if(a){const e=Bs(a);n=e.baseMediaDecodeTime}if(l.length&&o){const t=Ns(l,n,o);let r=0;t.forEach((function(t){const n="utf-8";const a=new TextDecoder(n);const o=i.slice(r,r+t.size);const l=js(o,["vtte"])[0];if(l){r+=t.size;return}const d=js(o,["vttc"]);d.forEach((function(i){const n=js(i,["payl"])[0];const r=js(i,["sttg"])[0];const o=t.pts/e;const l=(t.pts+t.duration)/e;let d,h;if(n)try{d=a.decode(n)}catch(e){console.error(e)}if(r)try{h=a.decode(r)}catch(e){console.error(e)}t.duration&&d&&s.push({cueText:d,start:o,end:l,settings:h})}));r+=t.size}))}}));return s}};var Hs=WebVttParser;var qs=ge;var parsePid=function(e){var t=e[1]&31;t<<=8;t|=e[2];return t};var parsePayloadUnitStartIndicator=function(e){return!!(e[1]&64)};var parseAdaptionField=function(e){var t=0;(e[3]&48)>>>4>1&&(t+=e[4]+1);return t};var parseType=function(e,t){var s=parsePid(e);return s===0?"pat":s===t?"pmt":t?"pes":null};var parsePat=function(e){var t=parsePayloadUnitStartIndicator(e);var s=4+parseAdaptionField(e);t&&(s+=e[s]+1);return(e[s+10]&31)<<8|e[s+11]};var parsePmt=function(e){var t={};var s=parsePayloadUnitStartIndicator(e);var i=4+parseAdaptionField(e);s&&(i+=e[i]+1);if(e[i+5]&1){var n,r,a;n=(e[i+1]&15)<<8|e[i+2];r=3+n-4;a=(e[i+10]&15)<<8|e[i+11];var o=12+a;while(o<r){var l=i+o;t[(e[l+1]&31)<<8|e[l+2]]=e[l];o+=5+((e[l+3]&15)<<8|e[l+4])}return t}};var parsePesType=function(e,t){var s=parsePid(e);var i=t[s];switch(i){case qs.H264_STREAM_TYPE:return"video";case qs.ADTS_STREAM_TYPE:return"audio";case qs.METADATA_STREAM_TYPE:return"timed-metadata";default:return null}};var parsePesTime=function(e){var t=parsePayloadUnitStartIndicator(e);if(!t)return null;var s=4+parseAdaptionField(e);if(s>=e.byteLength)return null;var i=null;var n;n=e[s+7];if(n&192){i={};i.pts=(e[s+9]&14)<<27|(e[s+10]&255)<<20|(e[s+11]&254)<<12|(e[s+12]&255)<<5|(e[s+13]&254)>>>3;i.pts*=4;i.pts+=(e[s+13]&6)>>>1;i.dts=i.pts;if(n&64){i.dts=(e[s+14]&14)<<27|(e[s+15]&255)<<20|(e[s+16]&254)<<12|(e[s+17]&255)<<5|(e[s+18]&254)>>>3;i.dts*=4;i.dts+=(e[s+18]&6)>>>1}}return i};var parseNalUnitType=function(e){switch(e){case 5:return"slice_layer_without_partitioning_rbsp_idr";case 6:return"sei_rbsp";case 7:return"seq_parameter_set_rbsp";case 8:return"pic_parameter_set_rbsp";case 9:return"access_unit_delimiter_rbsp";default:return null}};var videoPacketContainsKeyFrame=function(e){var t=4+parseAdaptionField(e);var s=e.subarray(t);var i=0;var n=0;var r=false;var a;for(;n<s.byteLength-3;n++)if(s[n+2]===1){i=n+5;break}while(i<s.byteLength)switch(s[i]){case 0:if(s[i-1]!==0){i+=2;break}if(s[i-2]!==0){i++;break}if(n+3!==i-2){a=parseNalUnitType(s[n+3]&31);a==="slice_layer_without_partitioning_rbsp_idr"&&(r=true)}do{i++}while(s[i]!==1&&i<s.length);n=i-2;i+=3;break;case 1:if(s[i-1]!==0||s[i-2]!==0){i+=3;break}a=parseNalUnitType(s[n+3]&31);a==="slice_layer_without_partitioning_rbsp_idr"&&(r=true);n=i-2;i+=3;break;default:i+=3;break}s=s.subarray(n);i-=n;n=0;if(s&&s.byteLength>3){a=parseNalUnitType(s[n+3]&31);a==="slice_layer_without_partitioning_rbsp_idr"&&(r=true)}return r};var Vs={parseType:parseType,parsePat:parsePat,parsePmt:parsePmt,parsePayloadUnitStartIndicator:parsePayloadUnitStartIndicator,parsePesType:parsePesType,parsePesTime:parsePesTime,videoPacketContainsKeyFrame:videoPacketContainsKeyFrame};var zs=ge;var Ws=be.handleRollover;var Gs={};Gs.ts=Vs;Gs.aac=nt;var Ks=ee.ONE_SECOND_IN_TS;var Qs=188,Xs=71;var parsePsi_=function(e,t){var s,i,n=0,r=Qs;while(r<e.byteLength)if(e[n]!==Xs||e[r]!==Xs){n++;r++}else{s=e.subarray(n,r);i=Gs.ts.parseType(s,t.pid);switch(i){case"pat":t.pid=Gs.ts.parsePat(s);break;case"pmt":var a=Gs.ts.parsePmt(s);t.table=t.table||{};Object.keys(a).forEach((function(e){t.table[e]=a[e]}));break}n+=Qs;r+=Qs}};var parseAudioPes_=function(e,t,s){var i,n,r,a,o,l=0,d=Qs;var h=false;while(d<=e.byteLength)if(e[l]!==Xs||e[d]!==Xs&&d!==e.byteLength){l++;d++}else{i=e.subarray(l,d);n=Gs.ts.parseType(i,t.pid);switch(n){case"pes":r=Gs.ts.parsePesType(i,t.table);a=Gs.ts.parsePayloadUnitStartIndicator(i);if(r==="audio"&&a){o=Gs.ts.parsePesTime(i);if(o){o.type="audio";s.audio.push(o);h=true}}break}if(h)break;l+=Qs;d+=Qs}d=e.byteLength;l=d-Qs;h=false;while(l>=0)if(e[l]!==Xs||e[d]!==Xs&&d!==e.byteLength){l--;d--}else{i=e.subarray(l,d);n=Gs.ts.parseType(i,t.pid);switch(n){case"pes":r=Gs.ts.parsePesType(i,t.table);a=Gs.ts.parsePayloadUnitStartIndicator(i);if(r==="audio"&&a){o=Gs.ts.parsePesTime(i);if(o){o.type="audio";s.audio.push(o);h=true}}break}if(h)break;l-=Qs;d-=Qs}};var parseVideoPes_=function(e,t,s){var i,n,r,a,o,l,d,h,c=0,u=Qs;var p=false;var m={data:[],size:0};while(u<e.byteLength)if(e[c]!==Xs||e[u]!==Xs){c++;u++}else{i=e.subarray(c,u);n=Gs.ts.parseType(i,t.pid);switch(n){case"pes":r=Gs.ts.parsePesType(i,t.table);a=Gs.ts.parsePayloadUnitStartIndicator(i);if(r==="video"){if(a&&!p){o=Gs.ts.parsePesTime(i);if(o){o.type="video";s.video.push(o);p=true}}if(!s.firstKeyFrame){if(a&&m.size!==0){l=new Uint8Array(m.size);d=0;while(m.data.length){h=m.data.shift();l.set(h,d);d+=h.byteLength}if(Gs.ts.videoPacketContainsKeyFrame(l)){var f=Gs.ts.parsePesTime(l);if(f){s.firstKeyFrame=f;s.firstKeyFrame.type="video"}else console.warn("Failed to extract PTS/DTS from PES at first keyframe. This could be an unusual TS segment, or else mux.js did not parse your TS segment correctly. If you know your TS segments do contain PTS/DTS on keyframes please file a bug report! You can try ffprobe to double check for yourself.")}m.size=0}m.data.push(i);m.size+=i.byteLength}}break}if(p&&s.firstKeyFrame)break;c+=Qs;u+=Qs}u=e.byteLength;c=u-Qs;p=false;while(c>=0)if(e[c]!==Xs||e[u]!==Xs){c--;u--}else{i=e.subarray(c,u);n=Gs.ts.parseType(i,t.pid);switch(n){case"pes":r=Gs.ts.parsePesType(i,t.table);a=Gs.ts.parsePayloadUnitStartIndicator(i);if(r==="video"&&a){o=Gs.ts.parsePesTime(i);if(o){o.type="video";s.video.push(o);p=true}}break}if(p)break;c-=Qs;u-=Qs}};var adjustTimestamp_=function(e,t){if(e.audio&&e.audio.length){var s=t;(typeof s==="undefined"||isNaN(s))&&(s=e.audio[0].dts);e.audio.forEach((function(e){e.dts=Ws(e.dts,s);e.pts=Ws(e.pts,s);e.dtsTime=e.dts/Ks;e.ptsTime=e.pts/Ks}))}if(e.video&&e.video.length){var i=t;(typeof i==="undefined"||isNaN(i))&&(i=e.video[0].dts);e.video.forEach((function(e){e.dts=Ws(e.dts,i);e.pts=Ws(e.pts,i);e.dtsTime=e.dts/Ks;e.ptsTime=e.pts/Ks}));if(e.firstKeyFrame){var n=e.firstKeyFrame;n.dts=Ws(n.dts,i);n.pts=Ws(n.pts,i);n.dtsTime=n.dts/Ks;n.ptsTime=n.pts/Ks}}};var inspectAac_=function(e){var t,s=false,i=0,n=null,r=null,a=0,o=0;while(e.length-o>=3){var l=Gs.aac.parseType(e,o);switch(l){case"timed-metadata":if(e.length-o<10){s=true;break}a=Gs.aac.parseId3TagSize(e,o);if(a>e.length){s=true;break}if(r===null){t=e.subarray(o,o+a);r=Gs.aac.parseAacTimestamp(t)}o+=a;break;case"audio":if(e.length-o<7){s=true;break}a=Gs.aac.parseAdtsSize(e,o);if(a>e.length){s=true;break}if(n===null){t=e.subarray(o,o+a);n=Gs.aac.parseSampleRate(t)}i++;o+=a;break;default:o++;break}if(s)return null}if(n===null||r===null)return null;var d=Ks/n;var h={audio:[{type:"audio",dts:r,pts:r},{type:"audio",dts:r+i*1024*d,pts:r+i*1024*d}]};return h};var inspectTs_=function(e){var t={pid:null,table:null};var s={};parsePsi_(e,t);for(var i in t.table)if(t.table.hasOwnProperty(i)){var n=t.table[i];switch(n){case zs.H264_STREAM_TYPE:s.video=[];parseVideoPes_(e,t,s);s.video.length===0&&delete s.video;break;case zs.ADTS_STREAM_TYPE:s.audio=[];parseAudioPes_(e,t,s);s.audio.length===0&&delete s.audio;break}}return s};
/**
   * Inspects segment byte data and returns an object with start and end timing information
   *
   * @param {Uint8Array} bytes The segment byte data
   * @param {Number} baseTimestamp Relative reference timestamp used when adjusting frame
   *  timestamps for rollover. This value must be in 90khz clock.
   * @return {Object} Object containing start and end frame timing info of segment.
   */var inspect=function(e,t){var s=Gs.aac.isLikelyAacData(e);var i;i=s?inspectAac_(e):inspectTs_(e);if(!i||!i.audio&&!i.video)return null;adjustTimestamp_(i,t);return i};var Ys={inspect:inspect,parseAudioPes_:parseAudioPes_};
/**
   * Re-emits transmuxer events by converting them into messages to the
   * world outside the worker.
   *
   * @param {Object} transmuxer the transmuxer to wire events on
   * @private
   */const wireTransmuxerEvents=function(e,t){t.on("data",(function(t){const s=t.initSegment;t.initSegment={data:s.buffer,byteOffset:s.byteOffset,byteLength:s.byteLength};const i=t.data;t.data=i.buffer;e.postMessage({action:"data",segment:t,byteOffset:i.byteOffset,byteLength:i.byteLength},[t.data])}));t.on("done",(function(t){e.postMessage({action:"done"})}));t.on("gopInfo",(function(t){e.postMessage({action:"gopInfo",gopInfo:t})}));t.on("videoSegmentTimingInfo",(function(t){const s={start:{decode:ee.videoTsToSeconds(t.start.dts),presentation:ee.videoTsToSeconds(t.start.pts)},end:{decode:ee.videoTsToSeconds(t.end.dts),presentation:ee.videoTsToSeconds(t.end.pts)},baseMediaDecodeTime:ee.videoTsToSeconds(t.baseMediaDecodeTime)};t.prependedContentDuration&&(s.prependedContentDuration=ee.videoTsToSeconds(t.prependedContentDuration));e.postMessage({action:"videoSegmentTimingInfo",videoSegmentTimingInfo:s})}));t.on("audioSegmentTimingInfo",(function(t){const s={start:{decode:ee.videoTsToSeconds(t.start.dts),presentation:ee.videoTsToSeconds(t.start.pts)},end:{decode:ee.videoTsToSeconds(t.end.dts),presentation:ee.videoTsToSeconds(t.end.pts)},baseMediaDecodeTime:ee.videoTsToSeconds(t.baseMediaDecodeTime)};t.prependedContentDuration&&(s.prependedContentDuration=ee.videoTsToSeconds(t.prependedContentDuration));e.postMessage({action:"audioSegmentTimingInfo",audioSegmentTimingInfo:s})}));t.on("id3Frame",(function(t){e.postMessage({action:"id3Frame",id3Frame:t})}));t.on("caption",(function(t){e.postMessage({action:"caption",caption:t})}));t.on("trackinfo",(function(t){e.postMessage({action:"trackinfo",trackInfo:t})}));t.on("audioTimingInfo",(function(t){e.postMessage({action:"audioTimingInfo",audioTimingInfo:{start:ee.videoTsToSeconds(t.start),end:ee.videoTsToSeconds(t.end)}})}));t.on("videoTimingInfo",(function(t){e.postMessage({action:"videoTimingInfo",videoTimingInfo:{start:ee.videoTsToSeconds(t.start),end:ee.videoTsToSeconds(t.end)}})}));t.on("log",(function(t){e.postMessage({action:"log",log:t})}))};
/**
   * All incoming messages route through this hash. If no function exists
   * to handle an incoming message, then we ignore the message.
   *
   * @class MessageHandlers
   * @param {Object} options the options to initialize with
   */class MessageHandlers{constructor(e,t){this.options=t||{};this.self=e;this.init()}init(){this.transmuxer&&this.transmuxer.dispose();this.transmuxer=new At.Transmuxer(this.options);wireTransmuxerEvents(this.self,this.transmuxer)}pushMp4Captions(e){if(!this.captionParser){this.captionParser=new Rs;this.captionParser.init()}const t=new Uint8Array(e.data,e.byteOffset,e.byteLength);const s=this.captionParser.parse(t,e.trackIds,e.timescales);this.self.postMessage({action:"mp4Captions",captions:s&&s.captions||[],logs:s&&s.logs||[],data:t.buffer},[t.buffer])}
/**
     * Initializes the WebVttParser and passes the init segment.
     *
     * @param {Uint8Array} data mp4 boxed WebVTT init segment data
     */initMp4WebVttParser(e){this.webVttParser||(this.webVttParser=new Hs);const t=new Uint8Array(e.data,e.byteOffset,e.byteLength);this.webVttParser.init(t)}
/**
     * Parse an mp4 encapsulated WebVTT segment and return an array of cues.
     *
     * @param {Uint8Array} data a text/webvtt segment
     * @return {Object[]} an array of parsed cue objects
     */getMp4WebVttText(e){this.webVttParser||(this.webVttParser=new Hs);const t=new Uint8Array(e.data,e.byteOffset,e.byteLength);const s=this.webVttParser.parseSegment(t);this.self.postMessage({action:"getMp4WebVttText",mp4VttCues:s||[],data:t.buffer},[t.buffer])}probeMp4StartTime({timescales:e,data:t}){const s=ks.startTime(e,t);this.self.postMessage({action:"probeMp4StartTime",startTime:s,data:t},[t.buffer])}probeMp4Tracks({data:e}){const t=ks.tracks(e);this.self.postMessage({action:"probeMp4Tracks",tracks:t,data:e},[e.buffer])}
/**
     * Probes an mp4 segment for EMSG boxes containing ID3 data.
     * https://aomediacodec.github.io/id3-emsg/
     *
     * @param {Uint8Array} data segment data
     * @param {number} offset segment start time
     * @return {Object[]} an array of ID3 frames
     */probeEmsgID3({data:e,offset:t}){const s=ks.getEmsgID3(e,t);this.self.postMessage({action:"probeEmsgID3",id3Frames:s,emsgData:e},[e.buffer])}
/**
     * Probe an mpeg2-ts segment to determine the start time of the segment in it's
     * internal "media time," as well as whether it contains video and/or audio.
     *
     * @private
     * @param {Uint8Array} bytes - segment bytes
     * @param {number} baseStartTime
     *        Relative reference timestamp used when adjusting frame timestamps for rollover.
     *        This value should be in seconds, as it's converted to a 90khz clock within the
     *        function body.
     * @return {Object} The start time of the current segment in "media time" as well as
     *                  whether it contains video and/or audio
     */probeTs({data:e,baseStartTime:t}){const s=typeof t!=="number"||isNaN(t)?void 0:t*ee.ONE_SECOND_IN_TS;const i=Ys.inspect(e,s);let n=null;if(i){n={hasVideo:i.video&&i.video.length===2||false,hasAudio:i.audio&&i.audio.length===2||false};n.hasVideo&&(n.videoStart=i.video[0].ptsTime);n.hasAudio&&(n.audioStart=i.audio[0].ptsTime)}this.self.postMessage({action:"probeTs",result:n,data:e},[e.buffer])}clearAllMp4Captions(){this.captionParser&&this.captionParser.clearAllCaptions()}clearParsedMp4Captions(){this.captionParser&&this.captionParser.clearParsedCaptions()}
/**
     * Adds data (a ts segment) to the start of the transmuxer pipeline for
     * processing.
     *
     * @param {ArrayBuffer} data data to push into the muxer
     */push(e){const t=new Uint8Array(e.data,e.byteOffset,e.byteLength);this.transmuxer.push(t)}reset(){this.transmuxer.reset()}
/**
     * Set the value that will be used as the `baseMediaDecodeTime` time for the
     * next segment pushed in. Subsequent segments will have their `baseMediaDecodeTime`
     * set relative to the first based on the PTS values.
     *
     * @param {Object} data used to set the timestamp offset in the muxer
     */setTimestampOffset(e){const t=e.timestampOffset||0;this.transmuxer.setBaseMediaDecodeTime(Math.round(ee.secondsToVideoTs(t)))}setAudioAppendStart(e){this.transmuxer.setAudioAppendStart(Math.ceil(ee.secondsToVideoTs(e.appendStart)))}setRemux(e){this.transmuxer.setRemux(e.remux)}
/**
     * Forces the pipeline to finish processing the last segment and emit it's
     * results.
     *
     * @param {Object} data event data, not really used
     */flush(e){this.transmuxer.flush();self.postMessage({action:"done",type:"transmuxed"})}endTimeline(){this.transmuxer.endTimeline();self.postMessage({action:"endedtimeline",type:"transmuxed"})}alignGopsWith(e){this.transmuxer.alignGopsWith(e.gopsToAlignWith.slice())}}
/**
   * Our web worker interface so that things can talk to mux.js
   * that will be running in a web worker. the scope is passed to this by
   * webworkify.
   *
   * @param {Object} self the scope for the web worker
   */self.onmessage=function(e){if(e.data.action==="init"&&e.data.options)this.messageHandlers=new MessageHandlers(self,e.data.options);else{this.messageHandlers||(this.messageHandlers=new MessageHandlers(self));e.data&&e.data.action&&e.data.action!=="init"&&this.messageHandlers[e.data.action]&&this.messageHandlers[e.data.action](e.data)}}})));var qt=factory(Ht);const handleData_=(e,t,s)=>{const{type:i,initSegment:n,captions:r,captionStreams:a,metadata:o,videoFrameDtsTime:l,videoFramePtsTime:d}=e.data.segment;t.buffer.push({captions:r,captionStreams:a,metadata:o});const h=e.data.segment.boxes||{data:e.data.segment.data};const c={type:i,data:new Uint8Array(h.data,h.data.byteOffset,h.data.byteLength),initSegment:new Uint8Array(n.data,n.byteOffset,n.byteLength)};typeof l!=="undefined"&&(c.videoFrameDtsTime=l);typeof d!=="undefined"&&(c.videoFramePtsTime=d);s(c)};const handleDone_=({transmuxedData:e,callback:t})=>{e.buffer=[];t(e)};const handleGopInfo_=(e,t)=>{t.gopInfo=e.data.gopInfo};const processTransmux=e=>{const{transmuxer:t,bytes:s,audioAppendStart:i,gopsToAlignWith:n,remux:r,onData:a,onTrackInfo:o,onAudioTimingInfo:l,onVideoTimingInfo:d,onVideoSegmentTimingInfo:h,onAudioSegmentTimingInfo:c,onId3:u,onCaptions:p,onDone:m,onEndedTimeline:f,onTransmuxerLog:g,isEndOfTimeline:y,segment:_,triggerSegmentEventFn:v}=e;const T={buffer:[]};let b=y;const handleMessage=s=>{if(t.currentTransmux===e){s.data.action==="data"&&handleData_(s,T,a);s.data.action==="trackinfo"&&o(s.data.trackInfo);s.data.action==="gopInfo"&&handleGopInfo_(s,T);s.data.action==="audioTimingInfo"&&l(s.data.audioTimingInfo);s.data.action==="videoTimingInfo"&&d(s.data.videoTimingInfo);s.data.action==="videoSegmentTimingInfo"&&h(s.data.videoSegmentTimingInfo);s.data.action==="audioSegmentTimingInfo"&&c(s.data.audioSegmentTimingInfo);s.data.action==="id3Frame"&&u([s.data.id3Frame],s.data.id3Frame.dispatchType);s.data.action==="caption"&&p(s.data.caption);if(s.data.action==="endedtimeline"){b=false;f()}s.data.action==="log"&&g(s.data.log);if(s.data.type==="transmuxed"&&!b){t.onmessage=null;handleDone_({transmuxedData:T,callback:m});dequeue(t)}}};const handleError=()=>{const e={message:"Received an error message from the transmuxer worker",metadata:{errorType:videojs.Error.StreamingFailedToTransmuxSegment,segmentInfo:segmentInfoPayload({segment:_})}};m(null,e)};t.onmessage=handleMessage;t.onerror=handleError;i&&t.postMessage({action:"setAudioAppendStart",appendStart:i});Array.isArray(n)&&t.postMessage({action:"alignGopsWith",gopsToAlignWith:n});typeof r!=="undefined"&&t.postMessage({action:"setRemux",remux:r});if(s.byteLength){const e=s instanceof ArrayBuffer?s:s.buffer;const i=s instanceof ArrayBuffer?0:s.byteOffset;v({type:"segmenttransmuxingstart",segment:_});t.postMessage({action:"push",data:e,byteOffset:i,byteLength:s.byteLength},[e])}y&&t.postMessage({action:"endTimeline"});t.postMessage({action:"flush"})};const dequeue=e=>{e.currentTransmux=null;if(e.transmuxQueue.length){e.currentTransmux=e.transmuxQueue.shift();typeof e.currentTransmux==="function"?e.currentTransmux():processTransmux(e.currentTransmux)}};const processAction=(e,t)=>{e.postMessage({action:t});dequeue(e)};const enqueueAction=(e,t)=>{if(t.currentTransmux)t.transmuxQueue.push(processAction.bind(null,t,e));else{t.currentTransmux=e;processAction(t,e)}};const reset=e=>{enqueueAction("reset",e)};const endTimeline=e=>{enqueueAction("endTimeline",e)};const transmux=e=>{if(e.transmuxer.currentTransmux)e.transmuxer.transmuxQueue.push(e);else{e.transmuxer.currentTransmux=e;processTransmux(e)}};const createTransmuxer=e=>{const t=new qt;t.currentTransmux=null;t.transmuxQueue=[];const s=t.terminate;t.terminate=()=>{t.currentTransmux=null;t.transmuxQueue.length=0;return s.call(t)};t.postMessage({action:"init",options:e});return t};var Vt={reset:reset,endTimeline:endTimeline,transmux:transmux,createTransmuxer:createTransmuxer};const workerCallback=function(e){const t=e.transmuxer;const s=e.endAction||e.action;const i=e.callback;const r=n({},e,{endAction:null,transmuxer:null,callback:null});const listenForEndEvent=n=>{if(n.data.action===s){t.removeEventListener("message",listenForEndEvent);if(n.data.data){n.data.data=new Uint8Array(n.data.data,e.byteOffset||0,e.byteLength||n.data.data.byteLength);e.data&&(e.data=n.data.data)}i(n.data)}};t.addEventListener("message",listenForEndEvent);if(e.data){const s=e.data instanceof ArrayBuffer;r.byteOffset=s?0:e.data.byteOffset;r.byteLength=e.data.byteLength;const i=[s?e.data:e.data.buffer];t.postMessage(r,i)}else t.postMessage(r)};const zt={FAILURE:2,TIMEOUT:-101,ABORTED:-102};const Wt="wvtt";
/**
 * Abort all requests
 *
 * @param {Object} activeXhrs - an object that tracks all XHR requests
 */const abortAll=e=>{e.forEach((e=>{e.abort()}))};
/**
 * Gather important bandwidth stats once a request has completed
 *
 * @param {Object} request - the XHR request from which to gather stats
 */const getRequestStats=e=>({bandwidth:e.bandwidth,bytesReceived:e.bytesReceived||0,roundTripTime:e.roundTripTime||0});
/**
 * If possible gather bandwidth stats as a request is in
 * progress
 *
 * @param {Event} progressEvent - an event object from an XHR's progress event
 */const getProgressStats=e=>{const t=e.target;const s=Date.now()-t.requestTime;const i={bandwidth:Infinity,bytesReceived:0,roundTripTime:s||0};i.bytesReceived=e.loaded;i.bandwidth=Math.floor(i.bytesReceived/i.roundTripTime*8*1e3);return i};
/**
 * Handle all error conditions in one place and return an object
 * with all the information
 *
 * @param {Error|null} error - if non-null signals an error occured with the XHR
 * @param {Object} request -  the XHR request that possibly generated the error
 */const handleErrors=(e,t)=>{const{requestType:s}=t;const i=getStreamingNetworkErrorMetadata({requestType:s,request:t,error:e});return t.timedout?{status:t.status,message:"HLS request timed-out at URL: "+t.uri,code:zt.TIMEOUT,xhr:t,metadata:i}:t.aborted?{status:t.status,message:"HLS request aborted at URL: "+t.uri,code:zt.ABORTED,xhr:t,metadata:i}:e?{status:t.status,message:"HLS request errored at URL: "+t.uri,code:zt.FAILURE,xhr:t,metadata:i}:t.responseType==="arraybuffer"&&t.response.byteLength===0?{status:t.status,message:"Empty HLS response at URL: "+t.uri,code:zt.FAILURE,xhr:t,metadata:i}:null};
/**
 * Handle responses for key data and convert the key data to the correct format
 * for the decryption step later
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Array} objects - objects to add the key bytes to.
 * @param {Function} finishProcessingFn - a callback to execute to continue processing
 *                                        this request
 */const handleKeyResponse=(e,t,s,i)=>(n,r)=>{const a=r.response;const o=handleErrors(n,r);if(o)return s(o,e);if(a.byteLength!==16)return s({status:r.status,message:"Invalid HLS key at URL: "+r.uri,code:zt.FAILURE,xhr:r},e);const l=new DataView(a);const d=new Uint32Array([l.getUint32(0),l.getUint32(4),l.getUint32(8),l.getUint32(12)]);for(let e=0;e<t.length;e++)t[e].bytes=d;const h={uri:r.uri};i({type:"segmentkeyloadcomplete",segment:e,keyInfo:h});return s(null,e)}
/**
 * Processes an mp4 init segment depending on the codec through the transmuxer.
 *
 * @param {Object} segment init segment to process
 * @param {string} codec the codec of the text segments
 */;const initMp4Text=(e,t)=>{t===Wt&&e.transmuxer.postMessage({action:"initMp4WebVttParser",data:e.map.bytes})};
/**
 * Parses an mp4 text segment with the transmuxer and calls the doneFn from
 * the segment loader.
 *
 * @param {Object} segment the text segment to parse
 * @param {string} codec the codec of the text segment
 * @param {Function} doneFn the doneFn passed from the segment loader
 */const parseMp4TextSegment=(e,t,s)=>{t===Wt&&workerCallback({action:"getMp4WebVttText",data:e.bytes,transmuxer:e.transmuxer,callback:({data:t,mp4VttCues:i})=>{e.bytes=t;s(null,e,{mp4VttCues:i})}})};const parseInitSegment=(e,t)=>{const s=x(e.map.bytes);if(s!=="mp4"){const i=e.map.resolvedUri||e.map.uri;const n=s||"unknown";return t({internal:true,message:`Found unsupported ${n} container for initialization segment at URL: ${i}`,code:zt.FAILURE,metadata:{mediaType:n}})}workerCallback({action:"probeMp4Tracks",data:e.map.bytes,transmuxer:e.transmuxer,callback:({tracks:s,data:i})=>{e.map.bytes=i;s.forEach((function(t){e.map.tracks=e.map.tracks||{};if(!e.map.tracks[t.type]){e.map.tracks[t.type]=t;if(typeof t.id==="number"&&t.timescale){e.map.timescales=e.map.timescales||{};e.map.timescales[t.id]=t.timescale}t.type==="text"&&initMp4Text(e,t.codec)}}));return t(null)}})};
/**
 * Handle init-segment responses
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} finishProcessingFn - a callback to execute to continue processing
 *                                        this request
 */const handleInitSegmentResponse=({segment:e,finishProcessingFn:t,triggerSegmentEventFn:s})=>(i,n)=>{const r=handleErrors(i,n);if(r)return t(r,e);const a=new Uint8Array(n.response);s({type:"segmentloaded",segment:e});if(e.map.key){e.map.encryptedBytes=a;return t(null,e)}e.map.bytes=a;parseInitSegment(e,(function(s){if(s){s.xhr=n;s.status=n.status;return t(s,e)}t(null,e)}))}
/**
 * Response handler for segment-requests being sure to set the correct
 * property depending on whether the segment is encryped or not
 * Also records and keeps track of stats that are used for ABR purposes
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} finishProcessingFn - a callback to execute to continue processing
 *                                        this request
 */;const handleSegmentResponse=({segment:e,finishProcessingFn:t,responseType:s,triggerSegmentEventFn:i})=>(n,r)=>{const a=handleErrors(n,r);if(a)return t(a,e);i({type:"segmentloaded",segment:e});const o=s!=="arraybuffer"&&r.responseText?stringToArrayBuffer(r.responseText.substring(e.lastReachedChar||0)):r.response;e.stats=getRequestStats(r);e.key?e.encryptedBytes=new Uint8Array(o):e.bytes=new Uint8Array(o);return t(null,e)};const transmuxAndNotify=({segment:e,bytes:t,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p})=>{const m=e.map&&e.map.tracks||{};const f=Boolean(m.audio&&m.video);let g=i.bind(null,e,"audio","start");const y=i.bind(null,e,"audio","end");let _=i.bind(null,e,"video","start");const v=i.bind(null,e,"video","end");const finish=()=>transmux({bytes:t,transmuxer:e.transmuxer,audioAppendStart:e.audioAppendStart,gopsToAlignWith:e.gopsToAlignWith,remux:f,onData:t=>{t.type=t.type==="combined"?"video":t.type;h(e,t)},onTrackInfo:t=>{if(s){f&&(t.isMuxed=true);s(e,t)}},onAudioTimingInfo:e=>{if(g&&typeof e.start!=="undefined"){g(e.start);g=null}y&&typeof e.end!=="undefined"&&y(e.end)},onVideoTimingInfo:e=>{if(_&&typeof e.start!=="undefined"){_(e.start);_=null}v&&typeof e.end!=="undefined"&&v(e.end)},onVideoSegmentTimingInfo:t=>{const s={pts:{start:t.start.presentation,end:t.end.presentation},dts:{start:t.start.decode,end:t.end.decode}};p({type:"segmenttransmuxingtiminginfoavailable",segment:e,timingInfo:s});n(t)},onAudioSegmentTimingInfo:t=>{const s={pts:{start:t.start.pts,end:t.end.pts},dts:{start:t.start.dts,end:t.end.dts}};p({type:"segmenttransmuxingtiminginfoavailable",segment:e,timingInfo:s});r(t)},onId3:(t,s)=>{a(e,t,s)},onCaptions:t=>{o(e,[t])},isEndOfTimeline:l,onEndedTimeline:()=>{d()},onTransmuxerLog:u,onDone:(t,s)=>{if(c){t.type=t.type==="combined"?"video":t.type;p({type:"segmenttransmuxingcomplete",segment:e});c(s,e,t)}},segment:e,triggerSegmentEventFn:p});workerCallback({action:"probeTs",transmuxer:e.transmuxer,data:t,baseStartTime:e.baseStartTime,callback:i=>{e.bytes=t=i.data;const n=i.result;if(n){s(e,{hasAudio:n.hasAudio,hasVideo:n.hasVideo,isMuxed:f});s=null}finish()}})};const handleSegmentBytes=({segment:e,bytes:t,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p})=>{let m=new Uint8Array(t);if(I(m)){e.isFmp4=true;const{tracks:n}=e.map;const r=n.text&&(!n.audio||!n.video);if(r){h(e,{data:m,type:"text"});parseMp4TextSegment(e,n.text.codec,c);return}const l={isFmp4:true,hasVideo:!!n.video,hasAudio:!!n.audio};n.audio&&n.audio.codec&&n.audio.codec!=="enca"&&(l.audioCodec=n.audio.codec);n.video&&n.video.codec&&n.video.codec!=="encv"&&(l.videoCodec=n.video.codec);n.video&&n.audio&&(l.isMuxed=true);s(e,l);const finishLoading=(t,s)=>{h(e,{data:m,type:l.hasAudio&&!l.isMuxed?"audio":"video"});s&&s.length&&a(e,s);t&&t.length&&o(e,t);c(null,e,{})};workerCallback({action:"probeMp4StartTime",timescales:e.map.timescales,data:m,transmuxer:e.transmuxer,callback:({data:s,startTime:r})=>{t=s.buffer;e.bytes=m=s;l.hasAudio&&!l.isMuxed&&i(e,"audio","start",r);l.hasVideo&&i(e,"video","start",r);workerCallback({action:"probeEmsgID3",data:m,transmuxer:e.transmuxer,offset:r,callback:({emsgData:s,id3Frames:i})=>{t=s.buffer;e.bytes=m=s;n.video&&s.byteLength&&e.transmuxer?workerCallback({action:"pushMp4Captions",endAction:"mp4Captions",transmuxer:e.transmuxer,data:m,timescales:e.map.timescales,trackIds:[n.video.id],callback:s=>{t=s.data.buffer;e.bytes=m=s.data;s.logs.forEach((function(e){u(merge(e,{stream:"mp4CaptionParser"}))}));finishLoading(s.captions,i)}}):finishLoading(void 0,i)}})}})}else if(e.transmuxer){typeof e.container==="undefined"&&(e.container=x(m));if(e.container==="ts"||e.container==="aac")transmuxAndNotify({segment:e,bytes:t,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p});else{s(e,{hasAudio:false,hasVideo:false});c(null,e,{})}}else c(null,e,{})};const decrypt=function({id:e,key:t,encryptedBytes:s,decryptionWorker:i,segment:n,doneFn:r},a){const decryptionHandler=t=>{if(t.data.source===e){i.removeEventListener("message",decryptionHandler);const e=t.data.decrypted;a(new Uint8Array(e.bytes,e.byteOffset,e.byteLength))}};i.onerror=()=>{const e="An error occurred in the decryption worker";const t=segmentInfoPayload({segment:n});const s={message:e,metadata:{error:new Error(e),errorType:videojs.Error.StreamingFailedToDecryptSegment,segmentInfo:t,keyInfo:{uri:n.key.resolvedUri||n.map.key.resolvedUri}}};r(s,n)};i.addEventListener("message",decryptionHandler);let o;o=t.bytes.slice?t.bytes.slice():new Uint32Array(Array.prototype.slice.call(t.bytes));i.postMessage(createTransferableMessage({source:e,encrypted:s,key:o,iv:t.iv}),[s.buffer,o.buffer])};
/**
 * Decrypt the segment via the decryption web worker
 *
 * @param {WebWorker} decryptionWorker - a WebWorker interface to AES-128 decryption
 *                                       routines
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} trackInfoFn - a callback that receives track info
 * @param {Function} timingInfoFn - a callback that receives timing info
 * @param {Function} videoSegmentTimingInfoFn
 *                   a callback that receives video timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {Function} audioSegmentTimingInfoFn
 *                   a callback that receives audio timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {boolean}  isEndOfTimeline
 *                   true if this segment represents the last segment in a timeline
 * @param {Function} endedTimelineFn
 *                   a callback made when a timeline is ended, will only be called if
 *                   isEndOfTimeline is true
 * @param {Function} dataFn - a callback that is executed when segment bytes are available
 *                            and ready to use
 * @param {Function} doneFn - a callback that is executed after decryption has completed
 */const decryptSegment=({decryptionWorker:e,segment:t,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p})=>{p({type:"segmentdecryptionstart"});decrypt({id:t.requestId,key:t.key,encryptedBytes:t.encryptedBytes,decryptionWorker:e,segment:t,doneFn:c},(e=>{t.bytes=e;p({type:"segmentdecryptioncomplete",segment:t});handleSegmentBytes({segment:t,bytes:t.bytes,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p})}))};
/**
 * This function waits for all XHRs to finish (with either success or failure)
 * before continueing processing via it's callback. The function gathers errors
 * from each request into a single errors array so that the error status for
 * each request can be examined later.
 *
 * @param {Object} activeXhrs - an object that tracks all XHR requests
 * @param {WebWorker} decryptionWorker - a WebWorker interface to AES-128 decryption
 *                                       routines
 * @param {Function} trackInfoFn - a callback that receives track info
 * @param {Function} timingInfoFn - a callback that receives timing info
 * @param {Function} videoSegmentTimingInfoFn
 *                   a callback that receives video timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {Function} audioSegmentTimingInfoFn
 *                   a callback that receives audio timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {Function} id3Fn - a callback that receives ID3 metadata
 * @param {Function} captionsFn - a callback that receives captions
 * @param {boolean}  isEndOfTimeline
 *                   true if this segment represents the last segment in a timeline
 * @param {Function} endedTimelineFn
 *                   a callback made when a timeline is ended, will only be called if
 *                   isEndOfTimeline is true
 * @param {Function} dataFn - a callback that is executed when segment bytes are available
 *                            and ready to use
 * @param {Function} doneFn - a callback that is executed after all resources have been
 *                            downloaded and any decryption completed
 */const waitForCompletion=({activeXhrs:e,decryptionWorker:t,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p})=>{let m=0;let f=false;return(g,y)=>{if(!f){if(g){f=true;abortAll(e);return c(g,y)}m+=1;if(m===e.length){const segmentFinish=function(){if(y.encryptedBytes)return decryptSegment({decryptionWorker:t,segment:y,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p});handleSegmentBytes({segment:y,bytes:y.bytes,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h,doneFn:c,onTransmuxerLog:u,triggerSegmentEventFn:p})};y.endOfAllRequests=Date.now();if(y.map&&y.map.encryptedBytes&&!y.map.bytes){p({type:"segmentdecryptionstart",segment:y});return decrypt({decryptionWorker:t,id:y.requestId+"-init",encryptedBytes:y.map.encryptedBytes,key:y.map.key,segment:y,doneFn:c},(t=>{y.map.bytes=t;p({type:"segmentdecryptioncomplete",segment:y});parseInitSegment(y,(t=>{if(t){abortAll(e);return c(t,y)}segmentFinish()}))}))}segmentFinish()}}}};
/**
 * Calls the abort callback if any request within the batch was aborted. Will only call
 * the callback once per batch of requests, even if multiple were aborted.
 *
 * @param {Object} loadendState - state to check to see if the abort function was called
 * @param {Function} abortFn - callback to call for abort
 */const handleLoadEnd=({loadendState:e,abortFn:t})=>s=>{const i=s.target;if(i.aborted&&t&&!e.calledAbortFn){t();e.calledAbortFn=true}}
/**
 * Simple progress event callback handler that gathers some stats before
 * executing a provided callback with the `segment` object
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} progressFn - a callback that is executed each time a progress event
 *                                is received
 * @param {Function} trackInfoFn - a callback that receives track info
 * @param {Function} timingInfoFn - a callback that receives timing info
 * @param {Function} videoSegmentTimingInfoFn
 *                   a callback that receives video timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {Function} audioSegmentTimingInfoFn
 *                   a callback that receives audio timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {boolean}  isEndOfTimeline
 *                   true if this segment represents the last segment in a timeline
 * @param {Function} endedTimelineFn
 *                   a callback made when a timeline is ended, will only be called if
 *                   isEndOfTimeline is true
 * @param {Function} dataFn - a callback that is executed when segment bytes are available
 *                            and ready to use
 * @param {Event} event - the progress event object from XMLHttpRequest
 */;const handleProgress=({segment:e,progressFn:t,trackInfoFn:s,timingInfoFn:i,videoSegmentTimingInfoFn:n,audioSegmentTimingInfoFn:r,id3Fn:a,captionsFn:o,isEndOfTimeline:l,endedTimelineFn:d,dataFn:h})=>s=>{const i=s.target;if(!i.aborted){e.stats=merge(e.stats,getProgressStats(s));!e.stats.firstBytesReceivedAt&&e.stats.bytesReceived&&(e.stats.firstBytesReceivedAt=Date.now());return t(s,e)}}
/**
 * Load all resources and does any processing necessary for a media-segment
 *
 * Features:
 *   decrypts the media-segment if it has a key uri and an iv
 *   aborts *all* requests if *any* one request fails
 *
 * The segment object, at minimum, has the following format:
 * {
 *   resolvedUri: String,
 *   [transmuxer]: Object,
 *   [byterange]: {
 *     offset: Number,
 *     length: Number
 *   },
 *   [key]: {
 *     resolvedUri: String
 *     [byterange]: {
 *       offset: Number,
 *       length: Number
 *     },
 *     iv: {
 *       bytes: Uint32Array
 *     }
 *   },
 *   [map]: {
 *     resolvedUri: String,
 *     [byterange]: {
 *       offset: Number,
 *       length: Number
 *     },
 *     [bytes]: Uint8Array
 *   }
 * }
 * ...where [name] denotes optional properties
 *
 * @param {Function} xhr - an instance of the xhr wrapper in xhr.js
 * @param {Object} xhrOptions - the base options to provide to all xhr requests
 * @param {WebWorker} decryptionWorker - a WebWorker interface to AES-128
 *                                       decryption routines
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} abortFn - a callback called (only once) if any piece of a request was
 *                             aborted
 * @param {Function} progressFn - a callback that receives progress events from the main
 *                                segment's xhr request
 * @param {Function} trackInfoFn - a callback that receives track info
 * @param {Function} timingInfoFn - a callback that receives timing info
 * @param {Function} videoSegmentTimingInfoFn
 *                   a callback that receives video timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {Function} audioSegmentTimingInfoFn
 *                   a callback that receives audio timing info based on media times and
 *                   any adjustments made by the transmuxer
 * @param {Function} id3Fn - a callback that receives ID3 metadata
 * @param {Function} captionsFn - a callback that receives captions
 * @param {boolean}  isEndOfTimeline
 *                   true if this segment represents the last segment in a timeline
 * @param {Function} endedTimelineFn
 *                   a callback made when a timeline is ended, will only be called if
 *                   isEndOfTimeline is true
 * @param {Function} dataFn - a callback that receives data from the main segment's xhr
 *                            request, transmuxed if needed
 * @param {Function} doneFn - a callback that is executed only once all requests have
 *                            succeeded or failed
 * @return {Function} a function that, when invoked, immediately aborts all
 *                     outstanding requests
 */;const mediaSegmentRequest=({xhr:e,xhrOptions:t,decryptionWorker:s,segment:i,abortFn:n,progressFn:r,trackInfoFn:a,timingInfoFn:o,videoSegmentTimingInfoFn:l,audioSegmentTimingInfoFn:d,id3Fn:h,captionsFn:c,isEndOfTimeline:u,endedTimelineFn:p,dataFn:m,doneFn:f,onTransmuxerLog:g,triggerSegmentEventFn:y})=>{const _=[];const v=waitForCompletion({activeXhrs:_,decryptionWorker:s,trackInfoFn:a,timingInfoFn:o,videoSegmentTimingInfoFn:l,audioSegmentTimingInfoFn:d,id3Fn:h,captionsFn:c,isEndOfTimeline:u,endedTimelineFn:p,dataFn:m,doneFn:f,onTransmuxerLog:g,triggerSegmentEventFn:y});if(i.key&&!i.key.bytes){const s=[i.key];i.map&&!i.map.bytes&&i.map.key&&i.map.key.resolvedUri===i.key.resolvedUri&&s.push(i.map.key);const n=merge(t,{uri:i.key.resolvedUri,responseType:"arraybuffer",requestType:"segment-key"});const r=handleKeyResponse(i,s,v,y);const a={uri:i.key.resolvedUri};y({type:"segmentkeyloadstart",segment:i,keyInfo:a});const o=e(n,r);_.push(o)}if(i.map&&!i.map.bytes){const s=i.map.key&&(!i.key||i.key.resolvedUri!==i.map.key.resolvedUri);if(s){const s=merge(t,{uri:i.map.key.resolvedUri,responseType:"arraybuffer",requestType:"segment-key"});const n=handleKeyResponse(i,[i.map.key],v,y);const r={uri:i.map.key.resolvedUri};y({type:"segmentkeyloadstart",segment:i,keyInfo:r});const a=e(s,n);_.push(a)}const n=merge(t,{uri:i.map.resolvedUri,responseType:"arraybuffer",headers:segmentXhrHeaders(i.map),requestType:"segment-media-initialization"});const r=handleInitSegmentResponse({segment:i,finishProcessingFn:v,triggerSegmentEventFn:y});y({type:"segmentloadstart",segment:i});const a=e(n,r);_.push(a)}const T=merge(t,{uri:i.part&&i.part.resolvedUri||i.resolvedUri,responseType:"arraybuffer",headers:segmentXhrHeaders(i),requestType:"segment"});const b=handleSegmentResponse({segment:i,finishProcessingFn:v,responseType:T.responseType,triggerSegmentEventFn:y});y({type:"segmentloadstart",segment:i});const S=e(T,b);S.addEventListener("progress",handleProgress({segment:i,progressFn:r,trackInfoFn:a,timingInfoFn:o,videoSegmentTimingInfoFn:l,audioSegmentTimingInfoFn:d,id3Fn:h,captionsFn:c,isEndOfTimeline:u,endedTimelineFn:p,dataFn:m}));_.push(S);const C={};_.forEach((e=>{e.addEventListener("loadend",handleLoadEnd({loadendState:C,abortFn:n}))}));return()=>abortAll(_)};const Gt=logger("CodecUtils");
/**
 * Returns a set of codec strings parsed from the playlist or the default
 * codec strings if no codecs were specified in the playlist
 *
 * @param {Playlist} media the current media playlist
 * @return {Object} an object with the video and audio codecs
 */const getCodecs=function(e){const t=e.attributes||{};if(t.CODECS)return l(t.CODECS)};const isMaat=(e,t)=>{const s=t.attributes||{};return e&&e.mediaGroups&&e.mediaGroups.AUDIO&&s.AUDIO&&e.mediaGroups.AUDIO[s.AUDIO]};const isMuxed=(e,t)=>{if(!isMaat(e,t))return true;const s=t.attributes||{};const i=e.mediaGroups.AUDIO[s.AUDIO];for(const e in i)if(!i[e].uri&&!i[e].playlists)return true;return false};const unwrapCodecList=function(e){const t={};e.forEach((({mediaType:e,type:s,details:i})=>{t[e]=t[e]||[];t[e].push(d(`${s}${i}`))}));Object.keys(t).forEach((function(e){if(t[e].length>1){Gt(`multiple ${e} codecs found as attributes: ${t[e].join(", ")}. Setting playlist codecs to null so that we wait for mux.js to probe segments for real codecs.`);t[e]=null}else t[e]=t[e][0]}));return t};const codecCount=function(e){let t=0;e.audio&&t++;e.video&&t++;return t};
/**
 * Calculates the codec strings for a working configuration of
 * SourceBuffers to play variant streams in a main playlist. If
 * there is no possible working configuration, an empty object will be
 * returned.
 *
 * @param main {Object} the m3u8 object for the main playlist
 * @param media {Object} the m3u8 object for the variant playlist
 * @return {Object} the codec strings.
 *
 * @private
 */const codecsForPlaylist=function(e,t){const s=t.attributes||{};const i=unwrapCodecList(getCodecs(t)||[]);if(isMaat(e,t)&&!i.audio&&!isMuxed(e,t)){const t=unwrapCodecList(h(e,s.AUDIO)||[]);t.audio&&(i.audio=t.audio)}return i};const Kt=logger("PlaylistSelector");const representationToString=function(e){if(!e||!e.playlist)return;const t=e.playlist;return JSON.stringify({id:t.id,bandwidth:e.bandwidth,width:e.width,height:e.height,codecs:t.attributes&&t.attributes.CODECS||""})};
/**
 * Returns the CSS value for the specified property on an element
 * using `getComputedStyle`. Firefox has a long-standing issue where
 * getComputedStyle() may return null when running in an iframe with
 * `display: none`.
 *
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 * @param {HTMLElement} el the htmlelement to work on
 * @param {string} the proprety to get the style for
 */const safeGetComputedStyle=function(t,s){if(!t)return"";const i=e.getComputedStyle(t);return i?i[s]:""};
/**
 * Resuable stable sort function
 *
 * @param {Playlists} array
 * @param {Function} sortFn Different comparators
 * @function stableSort
 */const stableSort=function(e,t){const s=e.slice();e.sort((function(e,i){const n=t(e,i);return n===0?s.indexOf(e)-s.indexOf(i):n}))};
/**
 * A comparator function to sort two playlist object by bandwidth.
 *
 * @param {Object} left a media playlist object
 * @param {Object} right a media playlist object
 * @return {number} Greater than zero if the bandwidth attribute of
 * left is greater than the corresponding attribute of right. Less
 * than zero if the bandwidth of right is greater than left and
 * exactly zero if the two are equal.
 */const comparePlaylistBandwidth=function(t,s){let i;let n;t.attributes.BANDWIDTH&&(i=t.attributes.BANDWIDTH);i=i||e.Number.MAX_VALUE;s.attributes.BANDWIDTH&&(n=s.attributes.BANDWIDTH);n=n||e.Number.MAX_VALUE;return i-n};
/**
 * A comparator function to sort two playlist object by resolution (width).
 *
 * @param {Object} left a media playlist object
 * @param {Object} right a media playlist object
 * @return {number} Greater than zero if the resolution.width attribute of
 * left is greater than the corresponding attribute of right. Less
 * than zero if the resolution.width of right is greater than left and
 * exactly zero if the two are equal.
 */const comparePlaylistResolution=function(t,s){let i;let n;t.attributes.RESOLUTION&&t.attributes.RESOLUTION.width&&(i=t.attributes.RESOLUTION.width);i=i||e.Number.MAX_VALUE;s.attributes.RESOLUTION&&s.attributes.RESOLUTION.width&&(n=s.attributes.RESOLUTION.width);n=n||e.Number.MAX_VALUE;return i===n&&t.attributes.BANDWIDTH&&s.attributes.BANDWIDTH?t.attributes.BANDWIDTH-s.attributes.BANDWIDTH:i-n};
/**
 * Chooses the appropriate media playlist based on bandwidth and player size
 *
 * @param {Object} main
 *        Object representation of the main manifest
 * @param {number} playerBandwidth
 *        Current calculated bandwidth of the player
 * @param {number} playerWidth
 *        Current width of the player element (should account for the device pixel ratio)
 * @param {number} playerHeight
 *        Current height of the player element (should account for the device pixel ratio)
 * @param {boolean} limitRenditionByPlayerDimensions
 *        True if the player width and height should be used during the selection, false otherwise
 * @param {Object} playlistController
 *        the current playlistController object
 * @return {Playlist} the highest bitrate playlist less than the
 * currently detected bandwidth, accounting for some amount of
 * bandwidth variance
 */let simpleSelector=function(t,s,i,n,r,a){if(!t)return;const o={bandwidth:s,width:i,height:n,limitRenditionByPlayerDimensions:r};let l=t.playlists;if(Mt.isAudioOnly(t)){l=a.getAudioTrackPlaylists_();o.audioOnly=true}let d=l.map((t=>{let s;const i=t.attributes&&t.attributes.RESOLUTION&&t.attributes.RESOLUTION.width;const n=t.attributes&&t.attributes.RESOLUTION&&t.attributes.RESOLUTION.height;s=t.attributes&&t.attributes.BANDWIDTH;s=s||e.Number.MAX_VALUE;return{bandwidth:s,width:i,height:n,playlist:t}}));stableSort(d,((e,t)=>e.bandwidth-t.bandwidth));d=d.filter((e=>!Mt.isIncompatible(e.playlist)));let h=d.filter((e=>Mt.isEnabled(e.playlist)));h.length||(h=d.filter((e=>!Mt.isDisabled(e.playlist))));const c=h.filter((e=>e.bandwidth*$t.BANDWIDTH_VARIANCE<s));let u=c[c.length-1];const p=c.filter((e=>e.bandwidth===u.bandwidth))[0];if(r===false){const e=p||h[0]||d[0];if(e&&e.playlist){let t="sortedPlaylistReps";p&&(t="bandwidthBestRep");h[0]&&(t="enabledPlaylistReps");Kt(`choosing ${representationToString(e)} using ${t} with options`,o);return e.playlist}Kt("could not choose a playlist with options",o);return null}const m=c.filter((e=>e.width&&e.height));stableSort(m,((e,t)=>e.width-t.width));const f=m.filter((e=>e.width===i&&e.height===n));u=f[f.length-1];const g=f.filter((e=>e.bandwidth===u.bandwidth))[0];let y;let _;let v;if(!g){y=m.filter((e=>e.width>i||e.height>n));_=y.filter((e=>e.width===y[0].width&&e.height===y[0].height));u=_[_.length-1];v=_.filter((e=>e.bandwidth===u.bandwidth))[0]}let T;if(a.leastPixelDiffSelector){const e=m.map((e=>{e.pixelDiff=Math.abs(e.width-i)+Math.abs(e.height-n);return e}));stableSort(e,((e,t)=>e.pixelDiff===t.pixelDiff?t.bandwidth-e.bandwidth:e.pixelDiff-t.pixelDiff));T=e[0]}const b=T||v||g||p||h[0]||d[0];if(b&&b.playlist){let e="sortedPlaylistReps";T?e="leastPixelDiffRep":v?e="resolutionPlusOneRep":g?e="resolutionBestRep":p?e="bandwidthBestRep":h[0]&&(e="enabledPlaylistReps");Kt(`choosing ${representationToString(b)} using ${e} with options`,o);return b.playlist}Kt("could not choose a playlist with options",o);return null};const lastBandwidthSelector=function(){let t=this.useDevicePixelRatio&&e.devicePixelRatio||1;isNaN(this.customPixelRatio)||(t=this.customPixelRatio);return simpleSelector(this.playlists.main,this.systemBandwidth,parseInt(safeGetComputedStyle(this.tech_.el(),"width"),10)*t,parseInt(safeGetComputedStyle(this.tech_.el(),"height"),10)*t,this.limitRenditionByPlayerDimensions,this.playlistController_)};
/**
 * Chooses the appropriate media playlist based on an
 * exponential-weighted moving average of the bandwidth after
 * filtering for player size.
 *
 * Expects to be called within the context of an instance of VhsHandler
 *
 * @param {number} decay - a number between 0 and 1. Higher values of
 * this parameter will cause previous bandwidth estimates to lose
 * significance more quickly.
 * @return {Function} a function which can be invoked to create a new
 * playlist selector function.
 * @see https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average
 */const movingAverageBandwidthSelector=function(t){let s=-1;let i=-1;if(t<0||t>1)throw new Error("Moving average bandwidth decay must be between 0 and 1.");return function(){let n=this.useDevicePixelRatio&&e.devicePixelRatio||1;isNaN(this.customPixelRatio)||(n=this.customPixelRatio);if(s<0){s=this.systemBandwidth;i=this.systemBandwidth}if(this.systemBandwidth>0&&this.systemBandwidth!==i){s=t*this.systemBandwidth+(1-t)*s;i=this.systemBandwidth}return simpleSelector(this.playlists.main,s,parseInt(safeGetComputedStyle(this.tech_.el(),"width"),10)*n,parseInt(safeGetComputedStyle(this.tech_.el(),"height"),10)*n,this.limitRenditionByPlayerDimensions,this.playlistController_)}};
/**
 * Chooses the appropriate media playlist based on the potential to rebuffer
 *
 * @param {Object} settings
 *        Object of information required to use this selector
 * @param {Object} settings.main
 *        Object representation of the main manifest
 * @param {number} settings.currentTime
 *        The current time of the player
 * @param {number} settings.bandwidth
 *        Current measured bandwidth
 * @param {number} settings.duration
 *        Duration of the media
 * @param {number} settings.segmentDuration
 *        Segment duration to be used in round trip time calculations
 * @param {number} settings.timeUntilRebuffer
 *        Time left in seconds until the player has to rebuffer
 * @param {number} settings.currentTimeline
 *        The current timeline segments are being loaded from
 * @param {SyncController} settings.syncController
 *        SyncController for determining if we have a sync point for a given playlist
 * @return {Object|null}
 *         {Object} return.playlist
 *         The highest bandwidth playlist with the least amount of rebuffering
 *         {Number} return.rebufferingImpact
 *         The amount of time in seconds switching to this playlist will rebuffer. A
 *         negative value means that switching will cause zero rebuffering.
 */const minRebufferMaxBandwidthSelector=function(e){const{main:t,currentTime:s,bandwidth:i,duration:n,segmentDuration:r,timeUntilRebuffer:a,currentTimeline:o,syncController:l}=e;const d=t.playlists.filter((e=>!Mt.isIncompatible(e)));let h=d.filter(Mt.isEnabled);h.length||(h=d.filter((e=>!Mt.isDisabled(e))));const c=h.filter(Mt.hasAttribute.bind(null,"BANDWIDTH"));const u=c.map((e=>{const t=l.getSyncPoint(e,n,o,s);const d=t?1:2;const h=Mt.estimateSegmentRequestTime(r,i,e);const c=h*d-a;return{playlist:e,rebufferingImpact:c}}));const p=u.filter((e=>e.rebufferingImpact<=0));stableSort(p,((e,t)=>comparePlaylistBandwidth(t.playlist,e.playlist)));if(p.length)return p[0];stableSort(u,((e,t)=>e.rebufferingImpact-t.rebufferingImpact));return u[0]||null};const lowestBitrateCompatibleVariantSelector=function(){const e=this.playlists.main.playlists.filter(Mt.isEnabled);stableSort(e,((e,t)=>comparePlaylistBandwidth(e,t)));const t=e.filter((e=>!!codecsForPlaylist(this.playlists.main,e).video));return t[0]||null};
/**
 * Combine all segments into a single Uint8Array
 *
 * @param {Object} segmentObj
 * @return {Uint8Array} concatenated bytes
 * @private
 */const concatSegments=e=>{let t=0;let s;if(e.bytes){s=new Uint8Array(e.bytes);e.segments.forEach((e=>{s.set(e,t);t+=e.byteLength}))}return s};
/**
 * Example:
 * https://host.com/path1/path2/path3/segment.ts?arg1=val1
 * -->
 * path3/segment.ts
 *
 * @param resolvedUri
 * @return {string}
 */function compactSegmentUrlDescription(e){try{return new URL(e).pathname.split("/").slice(-2).join("/")}catch(e){return""}}
/**
 * Create captions text tracks on video.js if they do not exist
 *
 * @param {Object} inbandTextTracks a reference to current inbandTextTracks
 * @param {Object} tech the video.js tech
 * @param {Object} captionStream the caption stream to create
 * @private
 */const createCaptionsTrackIfNotExists=function(e,t,s){if(!e[s]){t.trigger({type:"usage",name:"vhs-608"});let i=s;/^cc708_/.test(s)&&(i="SERVICE"+s.split("_")[1]);const n=t.textTracks().getTrackById(i);if(n)e[s]=n;else{const n=t.options_.vhs&&t.options_.vhs.captionServices||{};let r=s;let a=s;let o=false;const l=n[i];if(l){r=l.label;a=l.language;o=l.default}e[s]=t.addRemoteTextTrack({kind:"captions",id:i,default:o,label:r,language:a},false).track}}};
/**
 * Add caption text track data to a source handler given an array of captions
 *
 * @param {Object}
 *   @param {Object} inbandTextTracks the inband text tracks
 *   @param {number} timestampOffset the timestamp offset of the source buffer
 *   @param {Array} captionArray an array of caption data
 * @private
 */const addCaptionData=function({inbandTextTracks:t,captionArray:s,timestampOffset:i}){if(!s)return;const n=e.WebKitDataCue||e.VTTCue;s.forEach((e=>{const s=e.stream;e.content?e.content.forEach((r=>{const a=new n(e.startTime+i,e.endTime+i,r.text);a.line=r.line;a.align="left";a.position=r.position;a.positionAlign="line-left";t[s].addCue(a)})):t[s].addCue(new n(e.startTime+i,e.endTime+i,e.text))}))};
/**
 * Define properties on a cue for backwards compatability,
 * but warn the user that the way that they are using it
 * is depricated and will be removed at a later date.
 *
 * @param {Cue} cue the cue to add the properties on
 * @private
 */const deprecateOldCue=function(e){Object.defineProperties(e.frame,{id:{get(){videojs.log.warn("cue.frame.id is deprecated. Use cue.value.key instead.");return e.value.key}},value:{get(){videojs.log.warn("cue.frame.value is deprecated. Use cue.value.data instead.");return e.value.data}},privateData:{get(){videojs.log.warn("cue.frame.privateData is deprecated. Use cue.value.data instead.");return e.value.data}}})};
/**
 * Add metadata text track data to a source handler given an array of metadata
 *
 * @param {Object}
 *   @param {Object} inbandTextTracks the inband text tracks
 *   @param {Array} metadataArray an array of meta data
 *   @param {number} timestampOffset the timestamp offset of the source buffer
 *   @param {number} videoDuration the duration of the video
 * @private
 */const addMetadata=({inbandTextTracks:t,metadataArray:s,timestampOffset:i,videoDuration:n})=>{if(!s)return;const r=e.WebKitDataCue||e.VTTCue;const a=t.metadataTrack_;if(!a)return;s.forEach((t=>{const s=t.cueTime+i;!(typeof s!=="number"||e.isNaN(s)||s<0)&&s<Infinity&&t.frames&&t.frames.length&&t.frames.forEach((e=>{const t=new r(s,s,e.value||e.url||e.data||"");t.frame=e;t.value=e;deprecateOldCue(t);a.addCue(t)}))}));if(!a.cues||!a.cues.length)return;const o=a.cues;const l=[];for(let e=0;e<o.length;e++)o[e]&&l.push(o[e]);const d=l.reduce(((e,t)=>{const s=e[t.startTime]||[];s.push(t);e[t.startTime]=s;return e}),{});const h=Object.keys(d).sort(((e,t)=>Number(e)-Number(t)));h.forEach(((e,t)=>{const s=d[e];const i=isFinite(n)?n:e;const r=Number(h[t+1])||i;s.forEach((e=>{e.endTime=r}))}))};const Qt={id:"ID",class:"CLASS",startDate:"START-DATE",duration:"DURATION",endDate:"END-DATE",endOnNext:"END-ON-NEXT",plannedDuration:"PLANNED-DURATION",scte35Out:"SCTE35-OUT",scte35In:"SCTE35-IN"};const Xt=new Set(["id","class","startDate","duration","endDate","endOnNext","startTime","endTime","processDateRange"]);
/**
 * Add DateRange metadata text track to a source handler given an array of metadata
 *
 * @param {Object}
 *   @param {Object} inbandTextTracks the inband text tracks
 *   @param {Array} dateRanges parsed media playlist
 * @private
 */const addDateRangeMetadata=({inbandTextTracks:t,dateRanges:s})=>{const i=t.metadataTrack_;if(!i)return;const n=e.WebKitDataCue||e.VTTCue;s.forEach((e=>{for(const t of Object.keys(e)){if(Xt.has(t))continue;const s=new n(e.startTime,e.endTime,"");s.id=e.id;s.type="com.apple.quicktime.HLS";s.value={key:Qt[t],data:e[t]};t!=="scte35Out"&&t!=="scte35In"||(s.value.data=new Uint8Array(s.value.data.match(/[\da-f]{2}/gi)).buffer);i.addCue(s)}e.processDateRange()}))};
/**
 * Create metadata text track on video.js if it does not exist
 *
 * @param {Object} inbandTextTracks a reference to current inbandTextTracks
 * @param {string} dispatchType the inband metadata track dispatch type
 * @param {Object} tech the video.js tech
 * @private
 */const createMetadataTrackIfNotExists=(e,t,s)=>{if(!e.metadataTrack_){e.metadataTrack_=s.addRemoteTextTrack({kind:"metadata",label:"Timed Metadata"},false).track;videojs.browser.IS_ANY_SAFARI||(e.metadataTrack_.inBandMetadataTrackDispatchType=t)}};
/**
 * Remove cues from a track on video.js.
 *
 * @param {Double} start start of where we should remove the cue
 * @param {Double} end end of where the we should remove the cue
 * @param {Object} track the text track to remove the cues from
 * @private
 */const removeCuesFromTrack=function(e,t,s){let i;let n;if(s&&s.cues){i=s.cues.length;while(i--){n=s.cues[i];n.startTime>=e&&n.endTime<=t&&s.removeCue(n)}}};
/**
 * Remove duplicate cues from a track on video.js (a cue is considered a
 * duplicate if it has the same time interval and text as another)
 *
 * @param {Object} track the text track to remove the duplicate cues from
 * @private
 */const removeDuplicateCuesFromTrack=function(e){const t=e.cues;if(!t)return;const s={};for(let i=t.length-1;i>=0;i--){const n=t[i];const r=`${n.startTime}-${n.endTime}-${n.text}`;s[r]?e.removeCue(n):s[r]=n}};
/**
 * Returns a list of gops in the buffer that have a pts value of 3 seconds or more in
 * front of current time.
 *
 * @param {Array} buffer
 *        The current buffer of gop information
 * @param {number} currentTime
 *        The current time
 * @param {Double} mapping
 *        Offset to map display time to stream presentation time
 * @return {Array}
 *         List of gops considered safe to append over
 */const gopsSafeToAlignWith=(e,t,s)=>{if(typeof t==="undefined"||t===null||!e.length)return[];const i=Math.ceil((t-s+3)*P);let n;for(n=0;n<e.length;n++)if(e[n].pts>i)break;return e.slice(n)};
/**
 * Appends gop information (timing and byteLength) received by the transmuxer for the
 * gops appended in the last call to appendBuffer
 *
 * @param {Array} buffer
 *        The current buffer of gop information
 * @param {Array} gops
 *        List of new gop information
 * @param {boolean} replace
 *        If true, replace the buffer with the new gop information. If false, append the
 *        new gop information to the buffer in the right location of time.
 * @return {Array}
 *         Updated list of gop information
 */const updateGopBuffer=(e,t,s)=>{if(!t.length)return e;if(s)return t.slice();const i=t[0].pts;let n=0;for(n;n<e.length;n++)if(e[n].pts>=i)break;return e.slice(0,n).concat(t)};
/**
 * Removes gop information in buffer that overlaps with provided start and end
 *
 * @param {Array} buffer
 *        The current buffer of gop information
 * @param {Double} start
 *        position to start the remove at
 * @param {Double} end
 *        position to end the remove at
 * @param {Double} mapping
 *        Offset to map display time to stream presentation time
 */const removeGopBuffer=(e,t,s,i)=>{const n=Math.ceil((t-i)*P);const r=Math.ceil((s-i)*P);const a=e.slice();let o=e.length;while(o--)if(e[o].pts<=r)break;if(o===-1)return a;let l=o+1;while(l--)if(e[l].pts<=n)break;l=Math.max(l,0);a.splice(l,o-l+1);return a};const shallowEqual=function(e,t){if(!e&&!t||!e&&t||e&&!t)return false;if(e===t)return true;const s=Object.keys(e).sort();const i=Object.keys(t).sort();if(s.length!==i.length)return false;for(let n=0;n<s.length;n++){const r=s[n];if(r!==i[n])return false;if(e[r]!==t[r])return false}return true};
/**
 * The segment loader has no recourse except to fetch a segment in the
 * current playlist and use the internal timestamps in that segment to
 * generate a syncPoint. This function returns a good candidate index
 * for that process.
 *
 * @param {Array} segments - the segments array from a playlist.
 * @return {number} An index of a segment from the playlist to load
 */const getSyncSegmentCandidate=function(e,t,s){t=t||[];const i=[];let n=0;for(let r=0;r<t.length;r++){const a=t[r];if(e===a.timeline){i.push(r);n+=a.duration;if(n>s)return r}}return i.length===0?0:i[i.length-1]};const Yt=1;const Jt=500;const finite=e=>typeof e==="number"&&isFinite(e);const Zt=1/60;const illegalMediaSwitch=(e,t,s)=>e==="main"&&t&&s?s.hasAudio||s.hasVideo?t.hasVideo&&!s.hasVideo?"Only audio found in segment when we expected video. We can't switch to audio only from a stream that had video. To get rid of this message, please add codec information to the manifest.":!t.hasVideo&&s.hasVideo?"Video found in segment when we expected only audio. We can't switch to a stream with video from an audio only stream. To get rid of this message, please add codec information to the manifest.":null:"Neither audio nor video found in segment.":null;
/**
 * Calculates a time value that is safe to remove from the back buffer without interrupting
 * playback.
 *
 * @param {TimeRange} seekable
 *        The current seekable range
 * @param {number} currentTime
 *        The current time of the player
 * @param {number} targetDuration
 *        The target duration of the current playlist
 * @return {number}
 *         Time that is safe to remove from the back buffer without interrupting playback
 */const safeBackBufferTrimTime=(e,t,s)=>{let i=t-$t.BACK_BUFFER_LENGTH;e.length&&(i=Math.max(i,e.start(0)));const n=t-s;return Math.min(n,i)};const segmentInfoString=e=>{const{startOfSegment:t,duration:s,segment:i,part:n,playlist:{mediaSequence:r,id:a,segments:o=[]},mediaIndex:l,partIndex:d,timeline:h}=e;const c=o.length-1;let u="mediaIndex/partIndex increment";e.getMediaInfoForTime?u=`getMediaInfoForTime (${e.getMediaInfoForTime})`:e.isSyncRequest&&(u="getSyncSegmentCandidate (isSyncRequest)");e.independent&&(u+=` with independent ${e.independent}`);const p=typeof d==="number";const m=e.segment.uri?"segment":"pre-segment";const f=p?getKnownPartCount({preloadSegment:i})-1:0;return`${m} [${r+l}/${r+c}]`+(p?` part [${d}/${f}]`:"")+` segment start/end [${i.start} => ${i.end}]`+(p?` part start/end [${n.start} => ${n.end}]`:"")+` startOfSegment [${t}]`+` duration [${s}]`+` timeline [${h}]`+` selected by [${u}]`+` playlist [${a}]`};const timingInfoPropertyForMedia=e=>`${e}TimingInfo`
/**
 * Returns the timestamp offset to use for the segment.
 *
 * @param {number} segmentTimeline
 *        The timeline of the segment
 * @param {number} currentTimeline
 *        The timeline currently being followed by the loader
 * @param {number} startOfSegment
 *        The estimated segment start
 * @param {TimeRange[]} buffered
 *        The loader's buffer
 * @param {boolean} overrideCheck
 *        If true, no checks are made to see if the timestamp offset value should be set,
 *        but sets it directly to a value.
 *
 * @return {number|null}
 *         Either a number representing a new timestamp offset, or null if the segment is
 *         part of the same timeline
 */;const timestampOffsetForSegment=({segmentTimeline:e,currentTimeline:t,startOfSegment:s,buffered:i,overrideCheck:n})=>n||e!==t?e<t?s:i.length?i.end(i.length-1):s:null;
/**
 * Returns whether or not the loader should wait for a timeline change from the timeline
 * change controller before processing the segment.
 *
 * Primary timing in VHS goes by video. This is different from most media players, as
 * audio is more often used as the primary timing source. For the foreseeable future, VHS
 * will continue to use video as the primary timing source, due to the current logic and
 * expectations built around it.

 * Since the timing follows video, in order to maintain sync, the video loader is
 * responsible for setting both audio and video source buffer timestamp offsets.
 *
 * Setting different values for audio and video source buffers could lead to
 * desyncing. The following examples demonstrate some of the situations where this
 * distinction is important. Note that all of these cases involve demuxed content. When
 * content is muxed, the audio and video are packaged together, therefore syncing
 * separate media playlists is not an issue.
 *
 * CASE 1: Audio prepares to load a new timeline before video:
 *
 * Timeline:       0                 1
 * Audio Segments: 0 1 2 3 4 5 DISCO 6 7 8 9
 * Audio Loader:                     ^
 * Video Segments: 0 1 2 3 4 5 DISCO 6 7 8 9
 * Video Loader              ^
 *
 * In the above example, the audio loader is preparing to load the 6th segment, the first
 * after a discontinuity, while the video loader is still loading the 5th segment, before
 * the discontinuity.
 *
 * If the audio loader goes ahead and loads and appends the 6th segment before the video
 * loader crosses the discontinuity, then when appended, the 6th audio segment will use
 * the timestamp offset from timeline 0. This will likely lead to desyncing. In addition,
 * the audio loader must provide the audioAppendStart value to trim the content in the
 * transmuxer, and that value relies on the audio timestamp offset. Since the audio
 * timestamp offset is set by the video (main) loader, the audio loader shouldn't load the
 * segment until that value is provided.
 *
 * CASE 2: Video prepares to load a new timeline before audio:
 *
 * Timeline:       0                 1
 * Audio Segments: 0 1 2 3 4 5 DISCO 6 7 8 9
 * Audio Loader:             ^
 * Video Segments: 0 1 2 3 4 5 DISCO 6 7 8 9
 * Video Loader                      ^
 *
 * In the above example, the video loader is preparing to load the 6th segment, the first
 * after a discontinuity, while the audio loader is still loading the 5th segment, before
 * the discontinuity.
 *
 * If the video loader goes ahead and loads and appends the 6th segment, then once the
 * segment is loaded and processed, both the video and audio timestamp offsets will be
 * set, since video is used as the primary timing source. This is to ensure content lines
 * up appropriately, as any modifications to the video timing are reflected by audio when
 * the video loader sets the audio and video timestamp offsets to the same value. However,
 * setting the timestamp offset for audio before audio has had a chance to change
 * timelines will likely lead to desyncing, as the audio loader will append segment 5 with
 * a timestamp intended to apply to segments from timeline 1 rather than timeline 0.
 *
 * CASE 3: When seeking, audio prepares to load a new timeline before video
 *
 * Timeline:       0                 1
 * Audio Segments: 0 1 2 3 4 5 DISCO 6 7 8 9
 * Audio Loader:           ^
 * Video Segments: 0 1 2 3 4 5 DISCO 6 7 8 9
 * Video Loader            ^
 *
 * In the above example, both audio and video loaders are loading segments from timeline
 * 0, but imagine that the seek originated from timeline 1.
 *
 * When seeking to a new timeline, the timestamp offset will be set based on the expected
 * segment start of the loaded video segment. In order to maintain sync, the audio loader
 * must wait for the video loader to load its segment and update both the audio and video
 * timestamp offsets before it may load and append its own segment. This is the case
 * whether the seek results in a mismatched segment request (e.g., the audio loader
 * chooses to load segment 3 and the video loader chooses to load segment 4) or the
 * loaders choose to load the same segment index from each playlist, as the segments may
 * not be aligned perfectly, even for matching segment indexes.
 *
 * @param {Object} timelinechangeController
 * @param {number} currentTimeline
 *        The timeline currently being followed by the loader
 * @param {number} segmentTimeline
 *        The timeline of the segment being loaded
 * @param {('main'|'audio')} loaderType
 *        The loader type
 * @param {boolean} audioDisabled
 *        Whether the audio is disabled for the loader. This should only be true when the
 *        loader may have muxed audio in its segment, but should not append it, e.g., for
 *        the main loader when an alternate audio playlist is active.
 *
 * @return {boolean}
 *         Whether the loader should wait for a timeline change from the timeline change
 *         controller before processing the segment
 */const shouldWaitForTimelineChange=({timelineChangeController:e,currentTimeline:t,segmentTimeline:s,loaderType:i,audioDisabled:n})=>{if(t===s)return false;if(i==="audio"){const t=e.lastTimelineChange({type:"main"});return!t||t.to!==s}if(i==="main"&&n){const t=e.pendingTimelineChange({type:"audio"});return!t||t.to!==s}return false};const shouldFixBadTimelineChanges=e=>{if(!e)return false;const t=e.pendingTimelineChange({type:"audio"});const s=e.pendingTimelineChange({type:"main"});const i=t&&s;const n=i&&t.to!==s.to;const r=i&&t.from!==-1&&s.from!==-1;return!(!r||!n)};
/**
 * Check if the pending audio timeline change is behind the
 * pending main timeline change.
 *
 * @param {SegmentLoader} segmentLoader
 * @return {boolean}
 */const isAudioTimelineBehind=e=>{const t=e.timelineChangeController_.pendingTimelineChange({type:"audio"});const s=e.timelineChangeController_.pendingTimelineChange({type:"main"});const i=t&&s;return i&&t.to<s.to};
/**
 * A method to check if the player is waiting for a timeline change, and fixes
 * certain scenarios where the timelines need to be updated.
 *
 * @param {SegmentLoader} segmentLoader
 */const checkAndFixTimelines=e=>{const t=e.pendingSegment_;if(!t)return;const s=shouldWaitForTimelineChange({timelineChangeController:e.timelineChangeController_,currentTimeline:e.currentTimeline_,segmentTimeline:t.timeline,loaderType:e.loaderType_,audioDisabled:e.audioDisabled_});if(s&&shouldFixBadTimelineChanges(e.timelineChangeController_)){if(isAudioTimelineBehind(e)){e.timelineChangeController_.trigger("audioTimelineBehind");return}e.timelineChangeController_.trigger("fixBadTimelineChange")}};const mediaDuration=t=>{let s=0;["video","audio"].forEach((function(i){const n=t[`${i}TimingInfo`];if(!n)return;const{start:r,end:a}=n;let o;typeof r==="bigint"||typeof a==="bigint"?o=e.BigInt(a)-e.BigInt(r):typeof r==="number"&&typeof a==="number"&&(o=a-r);typeof o!=="undefined"&&o>s&&(s=o)}));typeof s==="bigint"&&s<Number.MAX_SAFE_INTEGER&&(s=Number(s));return s};const segmentTooLong=({segmentDuration:e,maxDuration:t})=>!!e&&Math.round(e)>t+Dt;const getTroublesomeSegmentDurationMessage=(e,t)=>{if(t!=="hls")return null;const s=mediaDuration({audioTimingInfo:e.audioTimingInfo,videoTimingInfo:e.videoTimingInfo});if(!s)return null;const i=e.playlist.targetDuration;const n=segmentTooLong({segmentDuration:s,maxDuration:i*2});const r=segmentTooLong({segmentDuration:s,maxDuration:i});const a=`Segment with index ${e.mediaIndex} from playlist ${e.playlist.id} has a duration of ${s} when the reported duration is ${e.duration} and the target duration is ${i}. For HLS content, a duration in excess of the target duration may result in playback issues. See the HLS specification section on EXT-X-TARGETDURATION for more details: https://tools.ietf.org/html/draft-pantos-http-live-streaming-23#section-4.3.3.1`;return n||r?{severity:n?"warn":"info",message:a}:null};
/**
 *
 * @param {Object} options type of segment loader and segment either segmentInfo or simple segment
 * @return a segmentInfo payload for events or errors.
 */const segmentInfoPayload=({type:e,segment:t})=>{if(!t)return;const s=Boolean(t.key||t.map&&t.map.ke);const i=Boolean(t.map&&!t.map.bytes);const n=t.startOfSegment===void 0?t.start:t.startOfSegment;return{type:e||t.type,uri:t.resolvedUri||t.uri,start:n,duration:t.duration,isEncrypted:s,isMediaInitialization:i}};
/**
 * An object that manages segment loading and appending.
 *
 * @class SegmentLoader
 * @param {Object} options required and optional options
 * @extends videojs.EventTarget
 */class SegmentLoader extends videojs.EventTarget{constructor(e,t={}){super();if(!e)throw new TypeError("Initialization settings are required");if(typeof e.currentTime!=="function")throw new TypeError("No currentTime getter specified");if(!e.mediaSource)throw new TypeError("No MediaSource specified");this.bandwidth=e.bandwidth;this.throughput={rate:0,count:0};this.roundTrip=NaN;this.resetStats_();this.mediaIndex=null;this.partIndex=null;this.hasPlayed_=e.hasPlayed;this.currentTime_=e.currentTime;this.seekable_=e.seekable;this.seeking_=e.seeking;this.duration_=e.duration;this.mediaSource_=e.mediaSource;this.vhs_=e.vhs;this.loaderType_=e.loaderType;this.currentMediaInfo_=void 0;this.startingMediaInfo_=void 0;this.segmentMetadataTrack_=e.segmentMetadataTrack;this.goalBufferLength_=e.goalBufferLength;this.sourceType_=e.sourceType;this.sourceUpdater_=e.sourceUpdater;this.inbandTextTracks_=e.inbandTextTracks;this.state_="INIT";this.timelineChangeController_=e.timelineChangeController;this.shouldSaveSegmentTimingInfo_=true;this.parse708captions_=e.parse708captions;this.useDtsForTimestampOffset_=e.useDtsForTimestampOffset;this.captionServices_=e.captionServices;this.exactManifestTimings=e.exactManifestTimings;this.addMetadataToTextTrack=e.addMetadataToTextTrack;this.checkBufferTimeout_=null;this.error_=void 0;this.currentTimeline_=-1;this.shouldForceTimestampOffsetAfterResync_=false;this.pendingSegment_=null;this.xhrOptions_=null;this.pendingSegments_=[];this.audioDisabled_=false;this.isPendingTimestampOffset_=false;this.gopBuffer_=[];this.timeMapping_=0;this.safeAppend_=false;this.appendInitSegment_={audio:true,video:true};this.playlistOfLastInitSegment_={audio:null,video:null};this.callQueue_=[];this.loadQueue_=[];this.metadataQueue_={id3:[],caption:[]};this.waitingOnRemove_=false;this.quotaExceededErrorRetryTimeout_=null;this.activeInitSegmentId_=null;this.initSegments_={};this.cacheEncryptionKeys_=e.cacheEncryptionKeys;this.keyCache_={};this.decrypter_=e.decrypter;this.syncController_=e.syncController;this.syncPoint_={segmentIndex:0,time:0};this.transmuxer_=this.createTransmuxer_();this.triggerSyncInfoUpdate_=()=>this.trigger("syncinfoupdate");this.syncController_.on("syncinfoupdate",this.triggerSyncInfoUpdate_);this.mediaSource_.addEventListener("sourceopen",(()=>{this.isEndOfStream_()||(this.ended_=false)}));this.fetchAtBuffer_=false;this.logger_=logger(`SegmentLoader[${this.loaderType_}]`);Object.defineProperty(this,"state",{get(){return this.state_},set(e){if(e!==this.state_){this.logger_(`${this.state_} -> ${e}`);this.state_=e;this.trigger("statechange")}}});this.sourceUpdater_.on("ready",(()=>{this.hasEnoughInfoToAppend_()?this.processCallQueue_():checkAndFixTimelines(this)}));this.sourceUpdater_.on("codecschange",(e=>{this.trigger(n({type:"codecschange"},e))}));this.loaderType_==="main"&&this.timelineChangeController_.on("pendingtimelinechange",(()=>{this.hasEnoughInfoToAppend_()?this.processCallQueue_():checkAndFixTimelines(this)}));this.loaderType_==="audio"&&this.timelineChangeController_.on("timelinechange",(e=>{this.trigger(n({type:"timelinechange"},e));this.hasEnoughInfoToLoad_()?this.processLoadQueue_():checkAndFixTimelines(this);this.hasEnoughInfoToAppend_()?this.processCallQueue_():checkAndFixTimelines(this)}))}get mediaSequenceSync_(){return this.syncController_.getMediaSequenceSync(this.loaderType_)}createTransmuxer_(){return Vt.createTransmuxer({remux:false,alignGopsAtEnd:this.safeAppend_,keepOriginalTimestamps:true,parse708captions:this.parse708captions_,captionServices:this.captionServices_})}resetStats_(){this.mediaBytesTransferred=0;this.mediaRequests=0;this.mediaRequestsAborted=0;this.mediaRequestsTimedout=0;this.mediaRequestsErrored=0;this.mediaTransferDuration=0;this.mediaSecondsLoaded=0;this.mediaAppends=0}dispose(){this.trigger("dispose");this.state="DISPOSED";this.pause();this.abort_();this.transmuxer_&&this.transmuxer_.terminate();this.resetStats_();this.checkBufferTimeout_&&e.clearTimeout(this.checkBufferTimeout_);this.syncController_&&this.triggerSyncInfoUpdate_&&this.syncController_.off("syncinfoupdate",this.triggerSyncInfoUpdate_);this.off()}setAudio(e){this.audioDisabled_=!e;e?this.appendInitSegment_.audio=true:this.sourceUpdater_.removeAudio(0,this.duration_())}abort(){if(this.state==="WAITING"){this.abort_();this.state="READY";this.paused()||this.monitorBuffer_()}else{this.pendingSegment_&&(this.pendingSegment_=null);this.timelineChangeController_.clearPendingTimelineChange(this.loaderType_)}}abort_(){this.pendingSegment_&&this.pendingSegment_.abortRequests&&this.pendingSegment_.abortRequests();this.pendingSegment_=null;this.callQueue_=[];this.loadQueue_=[];this.metadataQueue_.id3=[];this.metadataQueue_.caption=[];this.timelineChangeController_.clearPendingTimelineChange(this.loaderType_);this.waitingOnRemove_=false;e.clearTimeout(this.quotaExceededErrorRetryTimeout_);this.quotaExceededErrorRetryTimeout_=null}checkForAbort_(e){if(this.state==="APPENDING"&&!this.pendingSegment_){this.state="READY";return true}return!this.pendingSegment_||this.pendingSegment_.requestId!==e}
/**
   * set an error on the segment loader and null out any pending segements
   *
   * @param {Error} error the error to set on the SegmentLoader
   * @return {Error} the error that was set or that is currently set
   */error(e){if(typeof e!=="undefined"){this.logger_("error occurred:",e);this.error_=e}this.pendingSegment_=null;return this.error_}endOfStream(){this.ended_=true;this.transmuxer_&&Vt.reset(this.transmuxer_);this.gopBuffer_.length=0;this.pause();this.trigger("ended")}buffered_(){const e=this.getMediaInfo_();if(!this.sourceUpdater_||!e)return createTimeRanges();if(this.loaderType_==="main"){const{hasAudio:t,hasVideo:s,isMuxed:i}=e;if(s&&t&&!this.audioDisabled_&&!i)return this.sourceUpdater_.buffered();if(s)return this.sourceUpdater_.videoBuffered()}return this.sourceUpdater_.audioBuffered()}
/**
   * Gets and sets init segment for the provided map
   *
   * @param {Object} map
   *        The map object representing the init segment to get or set
   * @param {boolean=} set
   *        If true, the init segment for the provided map should be saved
   * @return {Object}
   *         map object for desired init segment
   */initSegmentForMap(e,t=false){if(!e)return null;const s=initSegmentId(e);let i=this.initSegments_[s];t&&!i&&e.bytes&&(this.initSegments_[s]=i={resolvedUri:e.resolvedUri,byterange:e.byterange,bytes:e.bytes,tracks:e.tracks,timescales:e.timescales});return i||e}
/**
   * Gets and sets key for the provided key
   *
   * @param {Object} key
   *        The key object representing the key to get or set
   * @param {boolean=} set
   *        If true, the key for the provided key should be saved
   * @return {Object}
   *         Key object for desired key
   */segmentKey(e,t=false){if(!e)return null;const s=segmentKeyId(e);let i=this.keyCache_[s];this.cacheEncryptionKeys_&&t&&!i&&e.bytes&&(this.keyCache_[s]=i={resolvedUri:e.resolvedUri,bytes:e.bytes});const n={resolvedUri:(i||e).resolvedUri};i&&(n.bytes=i.bytes);return n}couldBeginLoading_(){return this.playlist_&&!this.paused()}load(){this.monitorBuffer_();if(this.playlist_){if(this.state==="INIT"&&this.couldBeginLoading_())return this.init_();!this.couldBeginLoading_()||this.state!=="READY"&&this.state!=="INIT"||(this.state="READY")}}init_(){this.state="READY";this.resetEverything();return this.monitorBuffer_()}
/**
   * set a playlist on the segment loader
   *
   * @param {PlaylistLoader} media the playlist to set on the segment loader
   */playlist(e,t={}){if(!e)return;if(this.playlist_&&this.playlist_.endList&&e.endList&&this.playlist_.uri===e.uri)return;const s=this.playlist_;const i=this.pendingSegment_;this.playlist_=e;this.xhrOptions_=t;if(this.state==="INIT"){e.syncInfo={mediaSequence:e.mediaSequence,time:0};this.loaderType_==="main"&&this.syncController_.setDateTimeMappingForStart(e)}let n=null;s&&(s.id?n=s.id:s.uri&&(n=s.uri));this.logger_(`playlist update [${n} => ${e.id||e.uri}]`);if(this.mediaSequenceSync_){this.mediaSequenceSync_.update(e,this.currentTime_());this.logger_(`Playlist update:\ncurrentTime: ${this.currentTime_()}\nbufferedEnd: ${lastBufferedEnd(this.buffered_())}\n`,this.mediaSequenceSync_.diagnostics)}this.trigger("syncinfoupdate");if(this.state==="INIT"&&this.couldBeginLoading_())return this.init_();if(!s||s.uri!==e.uri){if(this.mediaIndex!==null){const t=!e.endList&&typeof e.partTargetDuration==="number";t?this.resetLoader():this.resyncLoader()}this.currentMediaInfo_=void 0;this.trigger("playlistupdate");return}const r=e.mediaSequence-s.mediaSequence;this.logger_(`live window shift [${r}]`);if(this.mediaIndex!==null){this.mediaIndex-=r;if(this.mediaIndex<0){this.mediaIndex=null;this.partIndex=null}else{const e=this.playlist_.segments[this.mediaIndex];if(this.partIndex&&(!e.parts||!e.parts.length||!e.parts[this.partIndex])){const e=this.mediaIndex;this.logger_(`currently processing part (index ${this.partIndex}) no longer exists.`);this.resetLoader();this.mediaIndex=e}}}if(i){i.mediaIndex-=r;if(i.mediaIndex<0){i.mediaIndex=null;i.partIndex=null}else{i.mediaIndex>=0&&(i.segment=e.segments[i.mediaIndex]);i.partIndex>=0&&i.segment.parts&&(i.part=i.segment.parts[i.partIndex])}}this.syncController_.saveExpiredSegmentInfo(s,e)}pause(){if(this.checkBufferTimeout_){e.clearTimeout(this.checkBufferTimeout_);this.checkBufferTimeout_=null}}paused(){return this.checkBufferTimeout_===null}
/**
   * Delete all the buffered data and reset the SegmentLoader
   *
   * @param {Function} [done] an optional callback to be executed when the remove
   * operation is complete
   */resetEverything(e){this.ended_=false;this.activeInitSegmentId_=null;this.appendInitSegment_={audio:true,video:true};this.resetLoader();this.remove(0,Infinity,e);if(this.transmuxer_){this.transmuxer_.postMessage({action:"clearAllMp4Captions"});this.transmuxer_.postMessage({action:"reset"})}}resetLoader(){this.fetchAtBuffer_=false;this.mediaSequenceSync_&&this.mediaSequenceSync_.resetAppendedStatus();this.resyncLoader()}resyncLoader(){this.transmuxer_&&Vt.reset(this.transmuxer_);this.mediaIndex=null;this.partIndex=null;this.syncPoint_=null;this.isPendingTimestampOffset_=false;const e=this.currentMediaInfo_&&this.currentMediaInfo_.isFmp4;const t=this.sourceType_==="hls"&&!e;t&&(this.shouldForceTimestampOffsetAfterResync_=true);this.callQueue_=[];this.loadQueue_=[];this.metadataQueue_.id3=[];this.metadataQueue_.caption=[];this.abort();this.transmuxer_&&this.transmuxer_.postMessage({action:"clearParsedMp4Captions"})}
/**
   * Remove any data in the source buffer between start and end times
   *
   * @param {number} start - the start time of the region to remove from the buffer
   * @param {number} end - the end time of the region to remove from the buffer
   * @param {Function} [done] - an optional callback to be executed when the remove
   * @param {boolean} force - force all remove operations to happen
   * operation is complete
   */remove(e,t,s=(()=>{}),i=false){t===Infinity&&(t=this.duration_());if(t<=e){this.logger_("skipping remove because end ${end} is <= start ${start}");return}if(!this.sourceUpdater_||!this.getMediaInfo_()){this.logger_("skipping remove because no source updater or starting media info");return}let n=1;const removeFinished=()=>{n--;n===0&&s()};if(i||!this.audioDisabled_){n++;this.sourceUpdater_.removeAudio(e,t,removeFinished)}if(i||this.loaderType_==="main"){this.gopBuffer_=removeGopBuffer(this.gopBuffer_,e,t,this.timeMapping_);n++;this.sourceUpdater_.removeVideo(e,t,removeFinished)}for(const s in this.inbandTextTracks_)removeCuesFromTrack(e,t,this.inbandTextTracks_[s]);removeCuesFromTrack(e,t,this.segmentMetadataTrack_);removeFinished()}monitorBuffer_(){this.checkBufferTimeout_&&e.clearTimeout(this.checkBufferTimeout_);this.checkBufferTimeout_=e.setTimeout(this.monitorBufferTick_.bind(this),1)}monitorBufferTick_(){this.state==="READY"&&this.fillBuffer_();this.checkBufferTimeout_&&e.clearTimeout(this.checkBufferTimeout_);this.checkBufferTimeout_=e.setTimeout(this.monitorBufferTick_.bind(this),Jt)}fillBuffer_(){if(this.sourceUpdater_.updating())return;const e=this.chooseNextRequest_();if(!e)return;const t={segmentInfo:segmentInfoPayload({type:this.loaderType_,segment:e})};this.trigger({type:"segmentselected",metadata:t});if(typeof e.timestampOffset==="number"){this.isPendingTimestampOffset_=false;this.timelineChangeController_.pendingTimelineChange({type:this.loaderType_,from:this.currentTimeline_,to:e.timeline})}this.loadSegment_(e)}
/**
   * Determines if we should call endOfStream on the media source based
   * on the state of the buffer or if appened segment was the final
   * segment in the playlist.
   *
   * @param {number} [mediaIndex] the media index of segment we last appended
   * @param {Object} [playlist] a media playlist object
   * @return {boolean} do we need to call endOfStream on the MediaSource
   */isEndOfStream_(e=this.mediaIndex,t=this.playlist_,s=this.partIndex){if(!t||!this.mediaSource_)return false;const i=typeof e==="number"&&t.segments[e];const n=e+1===t.segments.length;const r=!i||!i.parts||s+1===i.parts.length;return t.endList&&this.mediaSource_.readyState==="open"&&n&&r}chooseNextRequest_(){const e=this.buffered_();const t=lastBufferedEnd(e)||0;const s=timeAheadOf(e,this.currentTime_());const i=!this.hasPlayed_()&&s>=1;const n=s>=this.goalBufferLength_();const r=this.playlist_.segments;if(!r.length||i||n)return null;this.syncPoint_=this.syncPoint_||this.syncController_.getSyncPoint(this.playlist_,this.duration_(),this.currentTimeline_,this.currentTime_(),this.loaderType_);const a={partIndex:null,mediaIndex:null,startOfSegment:null,playlist:this.playlist_,isSyncRequest:Boolean(!this.syncPoint_)};if(a.isSyncRequest){a.mediaIndex=getSyncSegmentCandidate(this.currentTimeline_,r,t);this.logger_(`choose next request. Can not find sync point. Fallback to media Index: ${a.mediaIndex}`)}else if(this.mediaIndex!==null){const e=r[this.mediaIndex];const s=typeof this.partIndex==="number"?this.partIndex:-1;a.startOfSegment=e.end?e.end:t;if(e.parts&&e.parts[s+1]){a.mediaIndex=this.mediaIndex;a.partIndex=s+1}else a.mediaIndex=this.mediaIndex+1}else{let e;let s;let i;const n=this.fetchAtBuffer_?t:this.currentTime_();this.mediaSequenceSync_&&this.logger_(`chooseNextRequest_ request after Quality Switch:\nFor TargetTime: ${n}.\nCurrentTime: ${this.currentTime_()}\nBufferedEnd: ${t}\nFetch At Buffer: ${this.fetchAtBuffer_}\n`,this.mediaSequenceSync_.diagnostics);if(this.mediaSequenceSync_&&this.mediaSequenceSync_.isReliable){const t=this.getSyncInfoFromMediaSequenceSync_(n);if(!t){const e="No sync info found while using media sequence sync";this.error({message:e,metadata:{errorType:videojs.Error.StreamingFailedToSelectNextSegment,error:new Error(e)}});this.logger_("chooseNextRequest_ - no sync info found using media sequence sync");return null}this.logger_(`chooseNextRequest_ mediaSequence syncInfo (${t.start} --\x3e ${t.end})`);e=t.segmentIndex;s=t.partIndex;i=t.start}else{this.logger_("chooseNextRequest_ - fallback to a regular segment selection algorithm, based on a syncPoint.");const t=Mt.getMediaInfoForTime({exactManifestTimings:this.exactManifestTimings,playlist:this.playlist_,currentTime:n,startingPartIndex:this.syncPoint_.partIndex,startingSegmentIndex:this.syncPoint_.segmentIndex,startTime:this.syncPoint_.time});e=t.segmentIndex;s=t.partIndex;i=t.startTime}a.getMediaInfoForTime=this.fetchAtBuffer_?`bufferedEnd ${n}`:`currentTime ${n}`;a.mediaIndex=e;a.startOfSegment=i;a.partIndex=s;this.logger_(`choose next request. Playlist switched and we have a sync point. Media Index: ${a.mediaIndex} `)}const o=r[a.mediaIndex];let l=o&&typeof a.partIndex==="number"&&o.parts&&o.parts[a.partIndex];if(!o||typeof a.partIndex==="number"&&!l)return null;if(typeof a.partIndex!=="number"&&o.parts){a.partIndex=0;l=o.parts[0]}const d=this.vhs_.playlists&&this.vhs_.playlists.main&&this.vhs_.playlists.main.independentSegments||this.playlist_.independentSegments;if(!s&&l&&!d&&!l.independent)if(a.partIndex===0){const e=r[a.mediaIndex-1];const t=e.parts&&e.parts.length&&e.parts[e.parts.length-1];if(t&&t.independent){a.mediaIndex-=1;a.partIndex=e.parts.length-1;a.independent="previous segment"}}else if(o.parts[a.partIndex-1].independent){a.partIndex-=1;a.independent="previous part"}const h=this.mediaSource_&&this.mediaSource_.readyState==="ended";if(a.mediaIndex>=r.length-1&&h&&!this.seeking_())return null;if(this.shouldForceTimestampOffsetAfterResync_){this.shouldForceTimestampOffsetAfterResync_=false;a.forceTimestampOffset=true;this.logger_("choose next request. Force timestamp offset after loader resync")}return this.generateSegmentInfo_(a)}getSyncInfoFromMediaSequenceSync_(e){if(!this.mediaSequenceSync_)return null;const t=Math.max(e,this.mediaSequenceSync_.start);e!==t&&this.logger_(`getSyncInfoFromMediaSequenceSync_. Pulled target time from ${e} to ${t}`);const s=this.mediaSequenceSync_.getSyncInfoForTime(t);if(!s)return null;if(!s.isAppended)return s;const i=this.mediaSequenceSync_.getSyncInfoForTime(s.end);if(!i)return null;i.isAppended&&this.logger_("getSyncInfoFromMediaSequenceSync_: We encounter unexpected scenario where next media sequence sync info is also appended!");return i}generateSegmentInfo_(e){const{independent:t,playlist:s,mediaIndex:i,startOfSegment:n,isSyncRequest:r,partIndex:a,forceTimestampOffset:o,getMediaInfoForTime:l}=e;const d=s.segments[i];const h=typeof a==="number"&&d.parts[a];const c={requestId:"segment-loader-"+Math.random(),uri:h&&h.resolvedUri||d.resolvedUri,mediaIndex:i,partIndex:h?a:null,isSyncRequest:r,startOfSegment:n,playlist:s,bytes:null,encryptedBytes:null,timestampOffset:null,timeline:d.timeline,duration:h&&h.duration||d.duration,segment:d,part:h,byteLength:0,transmuxer:this.transmuxer_,getMediaInfoForTime:l,independent:t};const u=typeof o!=="undefined"?o:this.isPendingTimestampOffset_;c.timestampOffset=this.timestampOffsetForSegment_({segmentTimeline:d.timeline,currentTimeline:this.currentTimeline_,startOfSegment:n,buffered:this.buffered_(),overrideCheck:u});const p=lastBufferedEnd(this.sourceUpdater_.audioBuffered());typeof p==="number"&&(c.audioAppendStart=p-this.sourceUpdater_.audioTimestampOffset());this.sourceUpdater_.videoBuffered().length&&(c.gopsToAlignWith=gopsSafeToAlignWith(this.gopBuffer_,this.currentTime_()-this.sourceUpdater_.videoTimestampOffset(),this.timeMapping_));return c}timestampOffsetForSegment_(e){return timestampOffsetForSegment(e)}
/**
   * Determines if the network has enough bandwidth to complete the current segment
   * request in a timely manner. If not, the request will be aborted early and bandwidth
   * updated to trigger a playlist switch.
   *
   * @param {Object} stats
   *        Object containing stats about the request timing and size
   * @private
   */earlyAbortWhenNeeded_(e){if(this.vhs_.tech_.paused()||!this.xhrOptions_.timeout||!this.playlist_.attributes.BANDWIDTH)return;if(Date.now()-(e.firstBytesReceivedAt||Date.now())<1e3)return;const t=this.currentTime_();const s=e.bandwidth;const i=this.pendingSegment_.duration;const n=Mt.estimateSegmentRequestTime(i,s,this.playlist_,e.bytesReceived);const r=timeUntilRebuffer(this.buffered_(),t,this.vhs_.tech_.playbackRate())-1;if(n<=r)return;const a=minRebufferMaxBandwidthSelector({main:this.vhs_.playlists.main,currentTime:t,bandwidth:s,duration:this.duration_(),segmentDuration:i,timeUntilRebuffer:r,currentTimeline:this.currentTimeline_,syncController:this.syncController_});if(!a)return;const o=n-r;const l=o-a.rebufferingImpact;let d=.5;r<=Dt&&(d=1);if(a.playlist&&a.playlist.uri!==this.playlist_.uri&&!(l<d)){this.bandwidth=a.playlist.attributes.BANDWIDTH*$t.BANDWIDTH_VARIANCE+1;this.trigger("earlyabort")}}handleAbort_(e){this.logger_(`Aborting ${segmentInfoString(e)}`);this.mediaRequestsAborted+=1}
/**
   * XHR `progress` event handler
   *
   * @param {Event}
   *        The XHR `progress` event
   * @param {Object} simpleSegment
   *        A simplified segment object copy
   * @private
   */handleProgress_(e,t){this.earlyAbortWhenNeeded_(t.stats);this.checkForAbort_(t.requestId)||this.trigger("progress")}handleTrackInfo_(e,t){const{hasAudio:s,hasVideo:i}=t;const n={segmentInfo:segmentInfoPayload({type:this.loaderType_,segment:e}),trackInfo:{hasAudio:s,hasVideo:i}};this.trigger({type:"segmenttransmuxingtrackinfoavailable",metadata:n});this.earlyAbortWhenNeeded_(e.stats);if(!this.checkForAbort_(e.requestId)&&!this.checkForIllegalMediaSwitch(t)){t=t||{};if(!shallowEqual(this.currentMediaInfo_,t)){this.appendInitSegment_={audio:true,video:true};this.startingMediaInfo_=t;this.currentMediaInfo_=t;this.logger_("trackinfo update",t);this.trigger("trackinfo")}if(!this.checkForAbort_(e.requestId)){this.pendingSegment_.trackInfo=t;this.hasEnoughInfoToAppend_()?this.processCallQueue_():checkAndFixTimelines(this)}}}handleTimingInfo_(e,t,s,i){this.earlyAbortWhenNeeded_(e.stats);if(this.checkForAbort_(e.requestId))return;const n=this.pendingSegment_;const r=timingInfoPropertyForMedia(t);n[r]=n[r]||{};n[r][s]=i;this.logger_(`timinginfo: ${t} - ${s} - ${i}`);this.hasEnoughInfoToAppend_()?this.processCallQueue_():checkAndFixTimelines(this)}handleCaptions_(e,t){this.earlyAbortWhenNeeded_(e.stats);if(this.checkForAbort_(e.requestId))return;if(t.length===0){this.logger_("SegmentLoader received no captions from a caption event");return}const s=this.pendingSegment_;if(!s.hasAppendedData_){this.metadataQueue_.caption.push(this.handleCaptions_.bind(this,e,t));return}const i=this.sourceUpdater_.videoTimestampOffset()===null?this.sourceUpdater_.audioTimestampOffset():this.sourceUpdater_.videoTimestampOffset();const n={};t.forEach((e=>{n[e.stream]=n[e.stream]||{startTime:Infinity,captions:[],endTime:0};const t=n[e.stream];t.startTime=Math.min(t.startTime,e.startTime+i);t.endTime=Math.max(t.endTime,e.endTime+i);t.captions.push(e)}));Object.keys(n).forEach((e=>{const{startTime:t,endTime:s,captions:r}=n[e];const a=this.inbandTextTracks_;this.logger_(`adding cues from ${t} -> ${s} for ${e}`);createCaptionsTrackIfNotExists(a,this.vhs_.tech_,e);removeCuesFromTrack(t,s,a[e]);addCaptionData({captionArray:r,inbandTextTracks:a,timestampOffset:i})}));this.transmuxer_&&this.transmuxer_.postMessage({action:"clearParsedMp4Captions"})}handleId3_(e,t,s){this.earlyAbortWhenNeeded_(e.stats);if(this.checkForAbort_(e.requestId))return;const i=this.pendingSegment_;i.hasAppendedData_?this.addMetadataToTextTrack(s,t,this.duration_()):this.metadataQueue_.id3.push(this.handleId3_.bind(this,e,t,s))}processMetadataQueue_(){this.metadataQueue_.id3.forEach((e=>e()));this.metadataQueue_.caption.forEach((e=>e()));this.metadataQueue_.id3=[];this.metadataQueue_.caption=[]}processCallQueue_(){const e=this.callQueue_;this.callQueue_=[];e.forEach((e=>e()))}processLoadQueue_(){const e=this.loadQueue_;this.loadQueue_=[];e.forEach((e=>e()))}hasEnoughInfoToLoad_(){if(this.loaderType_!=="audio")return true;const e=this.pendingSegment_;return!!e&&(!this.getCurrentMediaInfo_()||!shouldWaitForTimelineChange({timelineChangeController:this.timelineChangeController_,currentTimeline:this.currentTimeline_,segmentTimeline:e.timeline,loaderType:this.loaderType_,audioDisabled:this.audioDisabled_}))}getCurrentMediaInfo_(e=this.pendingSegment_){return e&&e.trackInfo||this.currentMediaInfo_}getMediaInfo_(e=this.pendingSegment_){return this.getCurrentMediaInfo_(e)||this.startingMediaInfo_}getPendingSegmentPlaylist(){return this.pendingSegment_?this.pendingSegment_.playlist:null}hasEnoughInfoToAppend_(){if(!this.sourceUpdater_.ready())return false;if(this.waitingOnRemove_||this.quotaExceededErrorRetryTimeout_)return false;const e=this.pendingSegment_;const t=this.getCurrentMediaInfo_();if(!e||!t)return false;const{hasAudio:s,hasVideo:i,isMuxed:n}=t;return!(i&&!e.videoTimingInfo)&&(!(s&&!this.audioDisabled_&&!n&&!e.audioTimingInfo)&&!shouldWaitForTimelineChange({timelineChangeController:this.timelineChangeController_,currentTimeline:this.currentTimeline_,segmentTimeline:e.timeline,loaderType:this.loaderType_,audioDisabled:this.audioDisabled_}))}handleData_(e,t){this.earlyAbortWhenNeeded_(e.stats);if(this.checkForAbort_(e.requestId))return;if(this.callQueue_.length||!this.hasEnoughInfoToAppend_()){checkAndFixTimelines(this);this.callQueue_.push(this.handleData_.bind(this,e,t));return}const s=this.pendingSegment_;this.setTimeMapping_(s.timeline);this.updateMediaSecondsLoaded_(s.part||s.segment);if(this.mediaSource_.readyState!=="closed"){if(e.map){e.map=this.initSegmentForMap(e.map,true);s.segment.map=e.map}e.key&&this.segmentKey(e.key,true);s.isFmp4=e.isFmp4;s.timingInfo=s.timingInfo||{};if(s.isFmp4){this.trigger("fmp4");s.timingInfo.start=s[timingInfoPropertyForMedia(t.type)].start}else{const e=this.getCurrentMediaInfo_();const t=this.loaderType_==="main"&&e&&e.hasVideo;let i;t&&(i=s.videoTimingInfo.start);s.timingInfo.start=this.trueSegmentStart_({currentStart:s.timingInfo.start,playlist:s.playlist,mediaIndex:s.mediaIndex,currentVideoTimestampOffset:this.sourceUpdater_.videoTimestampOffset(),useVideoTimingInfo:t,firstVideoFrameTimeForData:i,videoTimingInfo:s.videoTimingInfo,audioTimingInfo:s.audioTimingInfo})}this.updateAppendInitSegmentStatus(s,t.type);this.updateSourceBufferTimestampOffset_(s);if(s.isSyncRequest){this.updateTimingInfoEnd_(s);this.syncController_.saveSegmentTimingInfo({segmentInfo:s,shouldSaveTimelineMapping:this.loaderType_==="main"});const e=this.chooseNextRequest_();if(e.mediaIndex!==s.mediaIndex||e.partIndex!==s.partIndex){this.logger_("sync segment was incorrect, not appending");return}this.logger_("sync segment was correct, appending")}s.hasAppendedData_=true;this.processMetadataQueue_();this.appendData_(s,t)}}updateAppendInitSegmentStatus(e,t){this.loaderType_!=="main"||typeof e.timestampOffset!=="number"||e.changedTimestampOffset||(this.appendInitSegment_={audio:true,video:true});this.playlistOfLastInitSegment_[t]!==e.playlist&&(this.appendInitSegment_[t]=true)}getInitSegmentAndUpdateState_({type:e,initSegment:t,map:s,playlist:i}){if(s){const e=initSegmentId(s);if(this.activeInitSegmentId_===e)return null;t=this.initSegmentForMap(s,true).bytes;this.activeInitSegmentId_=e}if(t&&this.appendInitSegment_[e]){this.playlistOfLastInitSegment_[e]=i;this.appendInitSegment_[e]=false;this.activeInitSegmentId_=null;return t}return null}handleQuotaExceededError_({segmentInfo:t,type:s,bytes:i},n){const r=this.sourceUpdater_.audioBuffered();const a=this.sourceUpdater_.videoBuffered();r.length>1&&this.logger_("On QUOTA_EXCEEDED_ERR, found gaps in the audio buffer: "+timeRangesToArray(r).join(", "));a.length>1&&this.logger_("On QUOTA_EXCEEDED_ERR, found gaps in the video buffer: "+timeRangesToArray(a).join(", "));const o=r.length?r.start(0):0;const l=r.length?r.end(r.length-1):0;const d=a.length?a.start(0):0;const h=a.length?a.end(a.length-1):0;if(l-o<=Yt&&h-d<=Yt){this.logger_(`On QUOTA_EXCEEDED_ERR, single segment too large to append to buffer, triggering an error. Appended byte length: ${i.byteLength}, audio buffer: ${timeRangesToArray(r).join(", ")}, video buffer: ${timeRangesToArray(a).join(", ")}, `);this.error({message:"Quota exceeded error with append of a single segment of content",excludeUntil:Infinity});this.trigger("error");return}this.waitingOnRemove_=true;this.callQueue_.push(this.appendToSourceBuffer_.bind(this,{segmentInfo:t,type:s,bytes:i}));const c=this.currentTime_();const u=c-Yt;this.logger_(`On QUOTA_EXCEEDED_ERR, removing audio/video from 0 to ${u}`);this.remove(0,u,(()=>{this.logger_(`On QUOTA_EXCEEDED_ERR, retrying append in ${Yt}s`);this.waitingOnRemove_=false;this.quotaExceededErrorRetryTimeout_=e.setTimeout((()=>{this.logger_("On QUOTA_EXCEEDED_ERR, re-processing call queue");this.quotaExceededErrorRetryTimeout_=null;this.processCallQueue_()}),Yt*1e3)}),true)}handleAppendError_({segmentInfo:e,type:t,bytes:s},i){if(i)if(i.code!==Rt){this.logger_("Received non QUOTA_EXCEEDED_ERR on append",i);this.error({message:`${t} append of ${s.length}b failed for segment #${e.mediaIndex} in playlist ${e.playlist.id}`,metadata:{errorType:videojs.Error.StreamingFailedToAppendSegment}});this.trigger("appenderror")}else this.handleQuotaExceededError_({segmentInfo:e,type:t,bytes:s})}appendToSourceBuffer_({segmentInfo:e,type:t,initSegment:s,data:i,bytes:n}){if(!n){const e=[i];let t=i.byteLength;if(s){e.unshift(s);t+=s.byteLength}n=concatSegments({bytes:t,segments:e})}const r={segmentInfo:segmentInfoPayload({type:this.loaderType_,segment:e})};this.trigger({type:"segmentappendstart",metadata:r});this.sourceUpdater_.appendBuffer({segmentInfo:e,type:t,bytes:n},this.handleAppendError_.bind(this,{segmentInfo:e,type:t,bytes:n}))}handleSegmentTimingInfo_(e,t,s){if(!this.pendingSegment_||t!==this.pendingSegment_.requestId)return;const i=this.pendingSegment_.segment;const n=`${e}TimingInfo`;i[n]||(i[n]={});i[n].transmuxerPrependedSeconds=s.prependedContentDuration||0;i[n].transmuxedPresentationStart=s.start.presentation;i[n].transmuxedDecodeStart=s.start.decode;i[n].transmuxedPresentationEnd=s.end.presentation;i[n].transmuxedDecodeEnd=s.end.decode;i[n].baseMediaDecodeTime=s.baseMediaDecodeTime}appendData_(e,t){const{type:s,data:i}=t;if(!i||!i.byteLength)return;if(s==="audio"&&this.audioDisabled_)return;const n=this.getInitSegmentAndUpdateState_({type:s,initSegment:t.initSegment,playlist:e.playlist,map:e.isFmp4?e.segment.map:null});this.appendToSourceBuffer_({segmentInfo:e,type:s,initSegment:n,data:i})}loadSegment_(e){this.state="WAITING";this.pendingSegment_=e;this.trimBackBuffer_(e);typeof e.timestampOffset==="number"&&this.transmuxer_&&this.transmuxer_.postMessage({action:"clearAllMp4Captions"});if(this.hasEnoughInfoToLoad_())this.updateTransmuxerAndRequestSegment_(e);else{checkAndFixTimelines(this);this.loadQueue_.push((()=>{const t=n({},e,{forceTimestampOffset:true});n(e,this.generateSegmentInfo_(t));this.isPendingTimestampOffset_=false;this.updateTransmuxerAndRequestSegment_(e)}))}}updateTransmuxerAndRequestSegment_(e){if(this.shouldUpdateTransmuxerTimestampOffset_(e.timestampOffset)){this.gopBuffer_.length=0;e.gopsToAlignWith=[];this.timeMapping_=0;this.transmuxer_.postMessage({action:"reset"});this.transmuxer_.postMessage({action:"setTimestampOffset",timestampOffset:e.timestampOffset})}const t=this.createSimplifiedSegmentObj_(e);const s=this.isEndOfStream_(e.mediaIndex,e.playlist,e.partIndex);const i=this.mediaIndex!==null;const n=e.timeline!==this.currentTimeline_&&e.timeline>0;const r=s||i&&n;this.logger_(`Requesting\n${compactSegmentUrlDescription(e.uri)}\n${segmentInfoString(e)}`);if(t.map&&!t.map.bytes){this.logger_("going to request init segment.");this.appendInitSegment_={video:true,audio:true}}e.abortRequests=mediaSegmentRequest({xhr:this.vhs_.xhr,xhrOptions:this.xhrOptions_,decryptionWorker:this.decrypter_,segment:t,abortFn:this.handleAbort_.bind(this,e),progressFn:this.handleProgress_.bind(this),trackInfoFn:this.handleTrackInfo_.bind(this),timingInfoFn:this.handleTimingInfo_.bind(this),videoSegmentTimingInfoFn:this.handleSegmentTimingInfo_.bind(this,"video",e.requestId),audioSegmentTimingInfoFn:this.handleSegmentTimingInfo_.bind(this,"audio",e.requestId),captionsFn:this.handleCaptions_.bind(this),isEndOfTimeline:r,endedTimelineFn:()=>{this.logger_("received endedtimeline callback")},id3Fn:this.handleId3_.bind(this),dataFn:this.handleData_.bind(this),doneFn:this.segmentRequestFinished_.bind(this),onTransmuxerLog:({message:t,level:s,stream:i})=>{this.logger_(`${segmentInfoString(e)} logged from transmuxer stream ${i} as a ${s}: ${t}`)},triggerSegmentEventFn:({type:e,segment:t,keyInfo:s,trackInfo:i,timingInfo:n})=>{const r=segmentInfoPayload({segment:t});const a={segmentInfo:r};s&&(a.keyInfo=s);i&&(a.trackInfo=i);n&&(a.timingInfo=n);this.trigger({type:e,metadata:a})}})}
/**
   * trim the back buffer so that we don't have too much data
   * in the source buffer
   *
   * @private
   *
   * @param {Object} segmentInfo - the current segment
   */trimBackBuffer_(e){const t=safeBackBufferTrimTime(this.seekable_(),this.currentTime_(),this.playlist_.targetDuration||10);t>0&&this.remove(0,t)}
/**
   * created a simplified copy of the segment object with just the
   * information necessary to perform the XHR and decryption
   *
   * @private
   *
   * @param {Object} segmentInfo - the current segment
   * @return {Object} a simplified segment object copy
   */createSimplifiedSegmentObj_(e){const t=e.segment;const s=e.part;const i=e.segment.key||e.segment.map&&e.segment.map.key;const n=e.segment.map&&!e.segment.map.bytes;const r={resolvedUri:s?s.resolvedUri:t.resolvedUri,byterange:s?s.byterange:t.byterange,requestId:e.requestId,transmuxer:e.transmuxer,audioAppendStart:e.audioAppendStart,gopsToAlignWith:e.gopsToAlignWith,part:e.part,type:this.loaderType_,start:e.startOfSegment,duration:e.duration,isEncrypted:i,isMediaInitialization:n};const a=e.playlist.segments[e.mediaIndex-1];a&&a.timeline===t.timeline&&(a.videoTimingInfo?r.baseStartTime=a.videoTimingInfo.transmuxedDecodeEnd:a.audioTimingInfo&&(r.baseStartTime=a.audioTimingInfo.transmuxedDecodeEnd));if(t.key){const s=t.key.iv||new Uint32Array([0,0,0,e.mediaIndex+e.playlist.mediaSequence]);r.key=this.segmentKey(t.key);r.key.iv=s}t.map&&(r.map=this.initSegmentForMap(t.map));return r}saveTransferStats_(e){this.mediaRequests+=1;if(e){this.mediaBytesTransferred+=e.bytesReceived;this.mediaTransferDuration+=e.roundTripTime}}saveBandwidthRelatedStats_(e,t){this.pendingSegment_.byteLength=t.bytesReceived;if(e<Zt){this.logger_(`Ignoring segment's bandwidth because its duration of ${e} is less than the min to record ${Zt}`);return}const s={bandwidthInfo:{from:this.bandwidth,to:t.bandwidth}};this.trigger({type:"bandwidthupdated",metadata:s});this.bandwidth=t.bandwidth;this.roundTrip=t.roundTripTime}handleTimeout_(){this.mediaRequestsTimedout+=1;this.bandwidth=1;this.roundTrip=NaN;this.trigger("bandwidthupdate");this.trigger("timeout")}segmentRequestFinished_(e,t,s){if(this.callQueue_.length){this.callQueue_.push(this.segmentRequestFinished_.bind(this,e,t,s));return}this.saveTransferStats_(t.stats);if(!this.pendingSegment_)return;if(t.requestId!==this.pendingSegment_.requestId)return;if(e){this.pendingSegment_=null;this.state="READY";if(e.code===zt.ABORTED)return;this.pause();if(e.code===zt.TIMEOUT){this.handleTimeout_();return}this.mediaRequestsErrored+=1;this.error(e);this.trigger("error");return}const i=this.pendingSegment_;this.saveBandwidthRelatedStats_(i.duration,t.stats);i.endOfAllRequests=t.endOfAllRequests;s.gopInfo&&(this.gopBuffer_=updateGopBuffer(this.gopBuffer_,s.gopInfo,this.safeAppend_));this.state="APPENDING";this.trigger("appending");this.waitForAppendsToComplete_(i)}setTimeMapping_(e){const t=this.syncController_.mappingForTimeline(e);t!==null&&(this.timeMapping_=t)}updateMediaSecondsLoaded_(e){typeof e.start==="number"&&typeof e.end==="number"?this.mediaSecondsLoaded+=e.end-e.start:this.mediaSecondsLoaded+=e.duration}shouldUpdateTransmuxerTimestampOffset_(e){return e!==null&&(this.loaderType_==="main"&&e!==this.sourceUpdater_.videoTimestampOffset()||!this.audioDisabled_&&e!==this.sourceUpdater_.audioTimestampOffset())}trueSegmentStart_({currentStart:e,playlist:t,mediaIndex:s,firstVideoFrameTimeForData:i,currentVideoTimestampOffset:n,useVideoTimingInfo:r,videoTimingInfo:a,audioTimingInfo:o}){if(typeof e!=="undefined")return e;if(!r)return o.start;const l=t.segments[s-1];return s!==0&&l&&typeof l.start!=="undefined"&&l.end===i+n?a.start:i}waitForAppendsToComplete_(e){const t=this.getCurrentMediaInfo_(e);if(!t){this.error({message:"No starting media returned, likely due to an unsupported media format.",playlistExclusionDuration:Infinity});this.trigger("error");return}const{hasAudio:s,hasVideo:i,isMuxed:n}=t;const r=this.loaderType_==="main"&&i;const a=!this.audioDisabled_&&s&&!n;e.waitingOnAppends=0;if(e.hasAppendedData_){r&&e.waitingOnAppends++;a&&e.waitingOnAppends++;r&&this.sourceUpdater_.videoQueueCallback(this.checkAppendsDone_.bind(this,e));a&&this.sourceUpdater_.audioQueueCallback(this.checkAppendsDone_.bind(this,e))}else{e.timingInfo||typeof e.timestampOffset!=="number"||(this.isPendingTimestampOffset_=true);e.timingInfo={start:0};e.waitingOnAppends++;if(!this.isPendingTimestampOffset_){this.updateSourceBufferTimestampOffset_(e);this.processMetadataQueue_()}this.checkAppendsDone_(e)}}checkAppendsDone_(e){if(!this.checkForAbort_(e.requestId)){e.waitingOnAppends--;e.waitingOnAppends===0&&this.handleAppendsDone_()}}checkForIllegalMediaSwitch(e){const t=illegalMediaSwitch(this.loaderType_,this.getCurrentMediaInfo_(),e);if(t){this.error({message:t,playlistExclusionDuration:Infinity});this.trigger("error");return true}return false}updateSourceBufferTimestampOffset_(e){if(e.timestampOffset===null||typeof e.timingInfo.start!=="number"||e.changedTimestampOffset||this.loaderType_!=="main")return;let t=false;e.timestampOffset-=this.getSegmentStartTimeForTimestampOffsetCalculation_({videoTimingInfo:e.segment.videoTimingInfo,audioTimingInfo:e.segment.audioTimingInfo,timingInfo:e.timingInfo});e.changedTimestampOffset=true;if(e.timestampOffset!==this.sourceUpdater_.videoTimestampOffset()){this.sourceUpdater_.videoTimestampOffset(e.timestampOffset);t=true}if(e.timestampOffset!==this.sourceUpdater_.audioTimestampOffset()){this.sourceUpdater_.audioTimestampOffset(e.timestampOffset);t=true}t&&this.trigger("timestampoffset")}getSegmentStartTimeForTimestampOffsetCalculation_({videoTimingInfo:e,audioTimingInfo:t,timingInfo:s}){return this.useDtsForTimestampOffset_?e&&typeof e.transmuxedDecodeStart==="number"?e.transmuxedDecodeStart:t&&typeof t.transmuxedDecodeStart==="number"?t.transmuxedDecodeStart:s.start:s.start}updateTimingInfoEnd_(e){e.timingInfo=e.timingInfo||{};const t=this.getMediaInfo_();const s=this.loaderType_==="main"&&t&&t.hasVideo;const i=s&&e.videoTimingInfo?e.videoTimingInfo:e.audioTimingInfo;i&&(e.timingInfo.end=typeof i.end==="number"?i.end:i.start+e.duration)}handleAppendsDone_(){if(this.pendingSegment_){const e={segmentInfo:segmentInfoPayload({type:this.loaderType_,segment:this.pendingSegment_})};this.trigger({type:"appendsdone",metadata:e})}if(!this.pendingSegment_){this.state="READY";this.paused()||this.monitorBuffer_();return}const e=this.pendingSegment_;e.part&&e.part.syncInfo?e.part.syncInfo.markAppended():e.segment.syncInfo&&e.segment.syncInfo.markAppended();this.updateTimingInfoEnd_(e);this.shouldSaveSegmentTimingInfo_&&this.syncController_.saveSegmentTimingInfo({segmentInfo:e,shouldSaveTimelineMapping:this.loaderType_==="main"});const t=getTroublesomeSegmentDurationMessage(e,this.sourceType_);t&&(t.severity==="warn"?videojs.log.warn(t.message):this.logger_(t.message));this.recordThroughput_(e);this.pendingSegment_=null;this.state="READY";if(e.isSyncRequest){this.trigger("syncinfoupdate");if(!e.hasAppendedData_){this.logger_(`Throwing away un-appended sync request ${segmentInfoString(e)}`);return}}this.logger_(`Appended ${segmentInfoString(e)}`);this.addSegmentMetadataCue_(e);this.fetchAtBuffer_=true;if(this.currentTimeline_!==e.timeline){this.timelineChangeController_.lastTimelineChange({type:this.loaderType_,from:this.currentTimeline_,to:e.timeline});this.loaderType_!=="main"||this.audioDisabled_||this.timelineChangeController_.lastTimelineChange({type:"audio",from:this.currentTimeline_,to:e.timeline})}this.currentTimeline_=e.timeline;this.trigger("syncinfoupdate");const s=e.segment;const i=e.part;const n=s.end&&this.currentTime_()-s.end>e.playlist.targetDuration*3;const r=i&&i.end&&this.currentTime_()-i.end>e.playlist.partTargetDuration*3;if(n||r){this.logger_(`bad ${n?"segment":"part"} ${segmentInfoString(e)}`);this.resetEverything();return}const a=this.mediaIndex!==null;a&&this.trigger("bandwidthupdate");this.trigger("progress");this.mediaIndex=e.mediaIndex;this.partIndex=e.partIndex;this.isEndOfStream_(e.mediaIndex,e.playlist,e.partIndex)&&this.endOfStream();this.trigger("appended");e.hasAppendedData_&&this.mediaAppends++;this.paused()||this.monitorBuffer_()}
/**
   * Records the current throughput of the decrypt, transmux, and append
   * portion of the semgment pipeline. `throughput.rate` is a the cumulative
   * moving average of the throughput. `throughput.count` is the number of
   * data points in the average.
   *
   * @private
   * @param {Object} segmentInfo the object returned by loadSegment
   */recordThroughput_(e){if(e.duration<Zt){this.logger_(`Ignoring segment's throughput because its duration of ${e.duration} is less than the min to record ${Zt}`);return}const t=this.throughput.rate;const s=Date.now()-e.endOfAllRequests+1;const i=Math.floor(e.byteLength/s*8*1e3);this.throughput.rate+=(i-t)/++this.throughput.count}
/**
   * Adds a cue to the segment-metadata track with some metadata information about the
   * segment
   *
   * @private
   * @param {Object} segmentInfo
   *        the object returned by loadSegment
   * @method addSegmentMetadataCue_
   */addSegmentMetadataCue_(t){if(!this.segmentMetadataTrack_)return;const s=t.segment;const i=s.start;const n=s.end;if(!finite(i)||!finite(n))return;removeCuesFromTrack(i,n,this.segmentMetadataTrack_);const r=e.WebKitDataCue||e.VTTCue;const a={custom:s.custom,dateTimeObject:s.dateTimeObject,dateTimeString:s.dateTimeString,programDateTime:s.programDateTime,bandwidth:t.playlist.attributes.BANDWIDTH,resolution:t.playlist.attributes.RESOLUTION,codecs:t.playlist.attributes.CODECS,byteLength:t.byteLength,uri:t.uri,timeline:t.timeline,playlist:t.playlist.id,start:i,end:n};const o=JSON.stringify(a);const l=new r(i,n,o);l.value=a;this.segmentMetadataTrack_.addCue(l)}}function noop(){}const toTitleCase=function(e){return typeof e!=="string"?e:e.replace(/./,(e=>e.toUpperCase()))};const es=["video","audio"];const updating=(e,t)=>{const s=t[`${e}Buffer`];return s&&s.updating||t.queuePending[e]};const nextQueueIndexOfType=(e,t)=>{for(let s=0;s<t.length;s++){const i=t[s];if(i.type==="mediaSource")return null;if(i.type===e)return s}return null};const shiftQueue=(e,t)=>{if(t.queue.length===0)return;let s=0;let i=t.queue[s];if(i.type!=="mediaSource"){if(e!=="mediaSource"&&t.ready()&&t.mediaSource.readyState!=="closed"&&!updating(e,t)){if(i.type!==e){s=nextQueueIndexOfType(e,t.queue);if(s===null)return;i=t.queue[s]}t.queue.splice(s,1);t.queuePending[e]=i;i.action(e,t);if(i.doneFn);else{t.queuePending[e]=null;shiftQueue(e,t)}}}else if(!t.updating()&&t.mediaSource.readyState!=="closed"){t.queue.shift();i.action(t);i.doneFn&&i.doneFn();shiftQueue("audio",t);shiftQueue("video",t)}};const cleanupBuffer=(e,t)=>{const s=t[`${e}Buffer`];const i=toTitleCase(e);if(s){s.removeEventListener("updateend",t[`on${i}UpdateEnd_`]);s.removeEventListener("error",t[`on${i}Error_`]);t.codecs[e]=null;t[`${e}Buffer`]=null}};const inSourceBuffers=(e,t)=>e&&t&&Array.prototype.indexOf.call(e.sourceBuffers,t)!==-1;const ts={appendBuffer:(e,t,s)=>(i,n)=>{const r=n[`${i}Buffer`];if(inSourceBuffers(n.mediaSource,r)){n.logger_(`Appending segment ${t.mediaIndex}'s ${e.length} bytes to ${i}Buffer`);try{r.appendBuffer(e)}catch(e){n.logger_(`Error with code ${e.code} `+(e.code===Rt?"(QUOTA_EXCEEDED_ERR) ":"")+`when appending segment ${t.mediaIndex} to ${i}Buffer`);n.queuePending[i]=null;s(e)}}},remove:(e,t)=>(s,i)=>{const n=i[`${s}Buffer`];if(inSourceBuffers(i.mediaSource,n)){i.logger_(`Removing ${e} to ${t} from ${s}Buffer`);try{n.remove(e,t)}catch(n){i.logger_(`Remove ${e} to ${t} from ${s}Buffer failed`)}}},timestampOffset:e=>(t,s)=>{const i=s[`${t}Buffer`];if(inSourceBuffers(s.mediaSource,i)){s.logger_(`Setting ${t}timestampOffset to ${e}`);i.timestampOffset=e}},callback:e=>(t,s)=>{e()},endOfStream:e=>t=>{if(t.mediaSource.readyState==="open"){t.logger_(`Calling mediaSource endOfStream(${e||""})`);try{t.mediaSource.endOfStream(e)}catch(e){videojs.log.warn("Failed to call media source endOfStream",e)}}},duration:e=>t=>{t.logger_(`Setting mediaSource duration to ${e}`);try{t.mediaSource.duration=e}catch(e){videojs.log.warn("Failed to set media source duration",e)}},abort:()=>(e,t)=>{if(t.mediaSource.readyState!=="open")return;const s=t[`${e}Buffer`];if(inSourceBuffers(t.mediaSource,s)){t.logger_(`calling abort on ${e}Buffer`);try{s.abort()}catch(t){videojs.log.warn(`Failed to abort on ${e}Buffer`,t)}}},addSourceBuffer:(e,t)=>s=>{const i=toTitleCase(e);const n=c(t);s.logger_(`Adding ${e}Buffer with codec ${t} to mediaSource`);const r=s.mediaSource.addSourceBuffer(n);r.addEventListener("updateend",s[`on${i}UpdateEnd_`]);r.addEventListener("error",s[`on${i}Error_`]);s.codecs[e]=t;s[`${e}Buffer`]=r},removeSourceBuffer:e=>t=>{const s=t[`${e}Buffer`];cleanupBuffer(e,t);if(inSourceBuffers(t.mediaSource,s)){t.logger_(`Removing ${e}Buffer with codec ${t.codecs[e]} from mediaSource`);try{t.mediaSource.removeSourceBuffer(s)}catch(t){videojs.log.warn(`Failed to removeSourceBuffer ${e}Buffer`,t)}}},changeType:e=>(t,s)=>{const i=s[`${t}Buffer`];const n=c(e);if(!inSourceBuffers(s.mediaSource,i))return;const r=e.substring(0,e.indexOf("."));const a=s.codecs[t];const o=a.substring(0,a.indexOf("."));if(o===r)return;const l={codecsChangeInfo:{from:a,to:e}};s.trigger({type:"codecschange",metadata:l});s.logger_(`changing ${t}Buffer codec from ${a} to ${e}`);try{i.changeType(n);s.codecs[t]=e}catch(e){l.errorType=videojs.Error.StreamingCodecsChangeError;l.error=e;e.metadata=l;s.error_=e;s.trigger("error");videojs.log.warn(`Failed to changeType on ${t}Buffer`,e)}}};const pushQueue=({type:e,sourceUpdater:t,action:s,doneFn:i,name:n})=>{t.queue.push({type:e,action:s,doneFn:i,name:n});shiftQueue(e,t)};const onUpdateend=(e,t)=>s=>{const i=t[`${e}Buffered`]();const n=bufferedRangesToString(i);t.logger_(`received "updateend" event for ${e} Source Buffer: `,n);if(t.queuePending[e]){const s=t.queuePending[e].doneFn;t.queuePending[e]=null;s&&s(t[`${e}Error_`])}shiftQueue(e,t)}
/**
 * A queue of callbacks to be serialized and applied when a
 * MediaSource and its associated SourceBuffers are not in the
 * updating state. It is used by the segment loader to update the
 * underlying SourceBuffers when new data is loaded, for instance.
 *
 * @class SourceUpdater
 * @param {MediaSource} mediaSource the MediaSource to create the SourceBuffer from
 * @param {string} mimeType the desired MIME type of the underlying SourceBuffer
 */;class SourceUpdater extends videojs.EventTarget{constructor(e){super();this.mediaSource=e;this.sourceopenListener_=()=>shiftQueue("mediaSource",this);this.mediaSource.addEventListener("sourceopen",this.sourceopenListener_);this.logger_=logger("SourceUpdater");this.audioTimestampOffset_=0;this.videoTimestampOffset_=0;this.queue=[];this.queuePending={audio:null,video:null};this.delayedAudioAppendQueue_=[];this.videoAppendQueued_=false;this.codecs={};this.onVideoUpdateEnd_=onUpdateend("video",this);this.onAudioUpdateEnd_=onUpdateend("audio",this);this.onVideoError_=e=>{this.videoError_=e};this.onAudioError_=e=>{this.audioError_=e};this.createdSourceBuffers_=false;this.initializedEme_=false;this.triggeredReady_=false}initializedEme(){this.initializedEme_=true;this.triggerReady()}hasCreatedSourceBuffers(){return this.createdSourceBuffers_}hasInitializedAnyEme(){return this.initializedEme_}ready(){return this.hasCreatedSourceBuffers()&&this.hasInitializedAnyEme()}createSourceBuffers(e){if(!this.hasCreatedSourceBuffers()){this.addOrChangeSourceBuffers(e);this.createdSourceBuffers_=true;this.trigger("createdsourcebuffers");this.triggerReady()}}triggerReady(){if(this.ready()&&!this.triggeredReady_){this.triggeredReady_=true;this.trigger("ready")}}
/**
   * Add a type of source buffer to the media source.
   *
   * @param {string} type
   *        The type of source buffer to add.
   *
   * @param {string} codec
   *        The codec to add the source buffer with.
   */addSourceBuffer(e,t){pushQueue({type:"mediaSource",sourceUpdater:this,action:ts.addSourceBuffer(e,t),name:"addSourceBuffer"})}
/**
   * call abort on a source buffer.
   *
   * @param {string} type
   *        The type of source buffer to call abort on.
   */abort(e){pushQueue({type:e,sourceUpdater:this,action:ts.abort(e),name:"abort"})}
/**
   * Call removeSourceBuffer and remove a specific type
   * of source buffer on the mediaSource.
   *
   * @param {string} type
   *        The type of source buffer to remove.
   */removeSourceBuffer(e){this.canRemoveSourceBuffer()?pushQueue({type:"mediaSource",sourceUpdater:this,action:ts.removeSourceBuffer(e),name:"removeSourceBuffer"}):videojs.log.error("removeSourceBuffer is not supported!")}canRemoveSourceBuffer(){return!videojs.browser.IS_FIREFOX&&e.MediaSource&&e.MediaSource.prototype&&typeof e.MediaSource.prototype.removeSourceBuffer==="function"}static canChangeType(){return e.SourceBuffer&&e.SourceBuffer.prototype&&typeof e.SourceBuffer.prototype.changeType==="function"}canChangeType(){return this.constructor.canChangeType()}
/**
   * Call the changeType function on a source buffer, given the code and type.
   *
   * @param {string} type
   *        The type of source buffer to call changeType on.
   *
   * @param {string} codec
   *        The codec string to change type with on the source buffer.
   */changeType(e,t){this.canChangeType()?pushQueue({type:e,sourceUpdater:this,action:ts.changeType(t),name:"changeType"}):videojs.log.error("changeType is not supported!")}
/**
   * Add source buffers with a codec or, if they are already created,
   * call changeType on source buffers using changeType.
   *
   * @param {Object} codecs
   *        Codecs to switch to
   */addOrChangeSourceBuffers(e){if(!e||typeof e!=="object"||Object.keys(e).length===0)throw new Error("Cannot addOrChangeSourceBuffers to undefined codecs");Object.keys(e).forEach((t=>{const s=e[t];if(!this.hasCreatedSourceBuffers())return this.addSourceBuffer(t,s);this.canChangeType()&&this.changeType(t,s)}))}
/**
   * Queue an update to append an ArrayBuffer.
   *
   * @param {MediaObject} object containing audioBytes and/or videoBytes
   * @param {Function} done the function to call when done
   * @see http://www.w3.org/TR/media-source/#widl-SourceBuffer-appendBuffer-void-ArrayBuffer-data
   */appendBuffer(e,t){const{segmentInfo:s,type:i,bytes:n}=e;this.processedAppend_=true;if(i==="audio"&&this.videoBuffer&&!this.videoAppendQueued_){this.delayedAudioAppendQueue_.push([e,t]);this.logger_(`delayed audio append of ${n.length} until video append`);return}const r=t;pushQueue({type:i,sourceUpdater:this,action:ts.appendBuffer(n,s||{mediaIndex:-1},r),doneFn:t,name:"appendBuffer"});if(i==="video"){this.videoAppendQueued_=true;if(!this.delayedAudioAppendQueue_.length)return;const e=this.delayedAudioAppendQueue_.slice();this.logger_(`queuing delayed audio ${e.length} appendBuffers`);this.delayedAudioAppendQueue_.length=0;e.forEach((e=>{this.appendBuffer.apply(this,e)}))}}audioBuffered(){return inSourceBuffers(this.mediaSource,this.audioBuffer)&&this.audioBuffer.buffered?this.audioBuffer.buffered:createTimeRanges()}videoBuffered(){return inSourceBuffers(this.mediaSource,this.videoBuffer)&&this.videoBuffer.buffered?this.videoBuffer.buffered:createTimeRanges()}buffered(){const e=inSourceBuffers(this.mediaSource,this.videoBuffer)?this.videoBuffer:null;const t=inSourceBuffers(this.mediaSource,this.audioBuffer)?this.audioBuffer:null;return t&&!e?this.audioBuffered():e&&!t?this.videoBuffered():bufferIntersection(this.audioBuffered(),this.videoBuffered())}
/**
   * Add a callback to the queue that will set duration on the mediaSource.
   *
   * @param {number} duration
   *        The duration to set
   *
   * @param {Function} [doneFn]
   *        function to run after duration has been set.
   */setDuration(e,t=noop){pushQueue({type:"mediaSource",sourceUpdater:this,action:ts.duration(e),name:"duration",doneFn:t})}
/**
   * Add a mediaSource endOfStream call to the queue
   *
   * @param {Error} [error]
   *        Call endOfStream with an error
   *
   * @param {Function} [doneFn]
   *        A function that should be called when the
   *        endOfStream call has finished.
   */endOfStream(e=null,t=noop){typeof e!=="string"&&(e=void 0);pushQueue({type:"mediaSource",sourceUpdater:this,action:ts.endOfStream(e),name:"endOfStream",doneFn:t})}
/**
   * Queue an update to remove a time range from the buffer.
   *
   * @param {number} start where to start the removal
   * @param {number} end where to end the removal
   * @param {Function} [done=noop] optional callback to be executed when the remove
   * operation is complete
   * @see http://www.w3.org/TR/media-source/#widl-SourceBuffer-remove-void-double-start-unrestricted-double-end
   */removeAudio(e,t,s=noop){this.audioBuffered().length&&this.audioBuffered().end(0)!==0?pushQueue({type:"audio",sourceUpdater:this,action:ts.remove(e,t),doneFn:s,name:"remove"}):s()}
/**
   * Queue an update to remove a time range from the buffer.
   *
   * @param {number} start where to start the removal
   * @param {number} end where to end the removal
   * @param {Function} [done=noop] optional callback to be executed when the remove
   * operation is complete
   * @see http://www.w3.org/TR/media-source/#widl-SourceBuffer-remove-void-double-start-unrestricted-double-end
   */removeVideo(e,t,s=noop){this.videoBuffered().length&&this.videoBuffered().end(0)!==0?pushQueue({type:"video",sourceUpdater:this,action:ts.remove(e,t),doneFn:s,name:"remove"}):s()}updating(){return!(!updating("audio",this)&&!updating("video",this))}audioTimestampOffset(e){if(typeof e!=="undefined"&&this.audioBuffer&&this.audioTimestampOffset_!==e){pushQueue({type:"audio",sourceUpdater:this,action:ts.timestampOffset(e),name:"timestampOffset"});this.audioTimestampOffset_=e}return this.audioTimestampOffset_}videoTimestampOffset(e){if(typeof e!=="undefined"&&this.videoBuffer&&this.videoTimestampOffset_!==e){pushQueue({type:"video",sourceUpdater:this,action:ts.timestampOffset(e),name:"timestampOffset"});this.videoTimestampOffset_=e}return this.videoTimestampOffset_}
/**
   * Add a function to the queue that will be called
   * when it is its turn to run in the audio queue.
   *
   * @param {Function} callback
   *        The callback to queue.
   */audioQueueCallback(e){this.audioBuffer&&pushQueue({type:"audio",sourceUpdater:this,action:ts.callback(e),name:"callback"})}
/**
   * Add a function to the queue that will be called
   * when it is its turn to run in the video queue.
   *
   * @param {Function} callback
   *        The callback to queue.
   */videoQueueCallback(e){this.videoBuffer&&pushQueue({type:"video",sourceUpdater:this,action:ts.callback(e),name:"callback"})}dispose(){this.trigger("dispose");es.forEach((e=>{this.abort(e);this.canRemoveSourceBuffer()?this.removeSourceBuffer(e):this[`${e}QueueCallback`]((()=>cleanupBuffer(e,this)))}));this.videoAppendQueued_=false;this.delayedAudioAppendQueue_.length=0;this.sourceopenListener_&&this.mediaSource.removeEventListener("sourceopen",this.sourceopenListener_);this.off()}}const uint8ToUtf8=e=>decodeURIComponent(escape(String.fromCharCode.apply(null,e)));const bufferToHexString=e=>{const t=new Uint8Array(e);return Array.from(t).map((e=>e.toString(16).padStart(2,"0"))).join("")};const ss=new Uint8Array("\n\n".split("").map((e=>e.charCodeAt(0))));class NoVttJsError extends Error{constructor(){super("Trying to parse received VTT cues, but there is no WebVTT. Make sure vtt.js is loaded.")}}
/**
 * An object that manages segment loading and appending.
 *
 * @class VTTSegmentLoader
 * @param {Object} options required and optional options
 * @extends videojs.EventTarget
 */class VTTSegmentLoader extends SegmentLoader{constructor(e,t={}){super(e,t);this.mediaSource_=null;this.subtitlesTrack_=null;this.featuresNativeTextTracks_=e.featuresNativeTextTracks;this.loadVttJs=e.loadVttJs;this.shouldSaveSegmentTimingInfo_=false}buffered_(){if(!this.subtitlesTrack_||!this.subtitlesTrack_.cues||!this.subtitlesTrack_.cues.length)return createTimeRanges();const e=this.subtitlesTrack_.cues;const t=e[0].startTime;const s=e[e.length-1].startTime;return createTimeRanges([[t,s]])}
/**
   * Gets and sets init segment for the provided map
   *
   * @param {Object} map
   *        The map object representing the init segment to get or set
   * @param {boolean=} set
   *        If true, the init segment for the provided map should be saved
   * @return {Object}
   *         map object for desired init segment
   */initSegmentForMap(e,t=false){if(!e)return null;const s=initSegmentId(e);let i=this.initSegments_[s];if(t&&!i&&e.bytes){const t=ss.byteLength+e.bytes.byteLength;const n=new Uint8Array(t);n.set(e.bytes);n.set(ss,e.bytes.byteLength);this.initSegments_[s]=i={resolvedUri:e.resolvedUri,byterange:e.byterange,bytes:n}}return i||e}couldBeginLoading_(){return this.playlist_&&this.subtitlesTrack_&&!this.paused()}init_(){this.state="READY";this.resetEverything();return this.monitorBuffer_()}
/**
   * Set a subtitle track on the segment loader to add subtitles to
   *
   * @param {TextTrack=} track
   *        The text track to add loaded subtitles to
   * @return {TextTrack}
   *        Returns the subtitles track
   */track(e){if(typeof e==="undefined")return this.subtitlesTrack_;this.subtitlesTrack_=e;this.state==="INIT"&&this.couldBeginLoading_()&&this.init_();return this.subtitlesTrack_}
/**
   * Remove any data in the source buffer between start and end times
   *
   * @param {number} start - the start time of the region to remove from the buffer
   * @param {number} end - the end time of the region to remove from the buffer
   */remove(e,t){removeCuesFromTrack(e,t,this.subtitlesTrack_)}fillBuffer_(){const e=this.chooseNextRequest_();if(e)if(this.syncController_.timestampOffsetForTimeline(e.timeline)!==null)this.loadSegment_(e);else{const checkTimestampOffset=()=>{this.state="READY";this.paused()||this.monitorBuffer_()};this.syncController_.one("timestampoffset",checkTimestampOffset);this.state="WAITING_ON_TIMELINE"}}timestampOffsetForSegment_(){return null}chooseNextRequest_(){return this.skipEmptySegments_(super.chooseNextRequest_())}
/**
   * Prevents the segment loader from requesting segments we know contain no subtitles
   * by walking forward until we find the next segment that we don't know whether it is
   * empty or not.
   *
   * @param {Object} segmentInfo
   *        a segment info object that describes the current segment
   * @return {Object}
   *         a segment info object that describes the current segment
   */skipEmptySegments_(e){while(e&&e.segment.empty){if(e.mediaIndex+1>=e.playlist.segments.length){e=null;break}e=this.generateSegmentInfo_({playlist:e.playlist,mediaIndex:e.mediaIndex+1,startOfSegment:e.startOfSegment+e.duration,isSyncRequest:e.isSyncRequest})}return e}stopForError(e){this.error(e);this.state="READY";this.pause();this.trigger("error")}segmentRequestFinished_(t,s,i){if(!this.subtitlesTrack_){this.state="READY";return}this.saveTransferStats_(s.stats);if(!this.pendingSegment_){this.state="READY";this.mediaRequestsAborted+=1;return}if(t){t.code===zt.TIMEOUT&&this.handleTimeout_();t.code===zt.ABORTED?this.mediaRequestsAborted+=1:this.mediaRequestsErrored+=1;this.stopForError(t);return}const n=this.pendingSegment_;const r=i.mp4VttCues&&i.mp4VttCues.length;r&&(n.mp4VttCues=i.mp4VttCues);this.saveBandwidthRelatedStats_(n.duration,s.stats);s.key&&this.segmentKey(s.key,true);this.state="APPENDING";this.trigger("appending");const a=n.segment;a.map&&(a.map.bytes=s.map.bytes);n.bytes=s.bytes;if(typeof e.WebVTT==="function"||typeof this.loadVttJs!=="function"){a.requested=true;try{this.parseVTTCues_(n)}catch(e){this.stopForError({message:e.message,metadata:{errorType:videojs.Error.StreamingVttParserError,error:e}});return}r||this.updateTimeMapping_(n,this.syncController_.timelines[n.timeline],this.playlist_);n.cues.length?n.timingInfo={start:n.cues[0].startTime,end:n.cues[n.cues.length-1].endTime}:n.timingInfo={start:n.startOfSegment,end:n.startOfSegment+n.duration};if(n.isSyncRequest){this.trigger("syncinfoupdate");this.pendingSegment_=null;this.state="READY"}else{n.byteLength=n.bytes.byteLength;this.mediaSecondsLoaded+=a.duration;n.cues.forEach((t=>{this.subtitlesTrack_.addCue(this.featuresNativeTextTracks_?new e.VTTCue(t.startTime,t.endTime,t.text):t)}));removeDuplicateCuesFromTrack(this.subtitlesTrack_);this.handleAppendsDone_()}}else{this.state="WAITING_ON_VTTJS";this.loadVttJs().then((()=>this.segmentRequestFinished_(t,s,i)),(()=>this.stopForError({message:"Error loading vtt.js"})))}}handleData_(e,t){const s=e&&e.type==="vtt";const i=t&&t.type==="text";const n=s&&i;n&&super.handleData_(e,t)}updateTimingInfoEnd_(){}
/**
   * Utility function for converting mp4 webvtt cue objects into VTTCues.
   *
   * @param {Object} segmentInfo with mp4 webvtt cues for parsing into VTTCue objecs
   */parseMp4VttCues_(t){const s=this.sourceUpdater_.videoTimestampOffset()===null?this.sourceUpdater_.audioTimestampOffset():this.sourceUpdater_.videoTimestampOffset();t.mp4VttCues.forEach((i=>{const n=i.start+s;const r=i.end+s;const a=new e.VTTCue(n,r,i.cueText);i.settings&&i.settings.split(" ").forEach((e=>{const t=e.split(":");const s=t[0];const i=t[1];a[s]=isNaN(i)?i:Number(i)}));t.cues.push(a)}))}
/**
   * Uses the WebVTT parser to parse the segment response
   *
   * @throws NoVttJsError
   *
   * @param {Object} segmentInfo
   *        a segment info object that describes the current segment
   * @private
   */parseVTTCues_(t){let s;let i=false;if(typeof e.WebVTT!=="function")throw new NoVttJsError;t.cues=[];t.timestampmap={MPEGTS:0,LOCAL:0};if(t.mp4VttCues){this.parseMp4VttCues_(t);return}if(typeof e.TextDecoder==="function")s=new e.TextDecoder("utf8");else{s=e.WebVTT.StringDecoder();i=true}const n=new e.WebVTT.Parser(e,e.vttjs,s);n.oncue=t.cues.push.bind(t.cues);n.ontimestampmap=e=>{t.timestampmap=e};n.onparsingerror=e=>{videojs.log.warn("Error encountered when parsing cues: "+e.message)};if(t.segment.map){let e=t.segment.map.bytes;i&&(e=uint8ToUtf8(e));n.parse(e)}let r=t.bytes;i&&(r=uint8ToUtf8(r));n.parse(r);n.flush()}
/**
   * Updates the start and end times of any cues parsed by the WebVTT parser using
   * the information parsed from the X-TIMESTAMP-MAP header and a TS to media time mapping
   * from the SyncController
   *
   * @param {Object} segmentInfo
   *        a segment info object that describes the current segment
   * @param {Object} mappingObj
   *        object containing a mapping from TS to media time
   * @param {Object} playlist
   *        the playlist object containing the segment
   * @private
   */updateTimeMapping_(e,t,s){const i=e.segment;if(!t)return;if(!e.cues.length){i.empty=true;return}const{MPEGTS:n,LOCAL:r}=e.timestampmap;const a=n/P;const o=a-r+t.mapping;e.cues.forEach((e=>{const s=e.endTime-e.startTime;const i=this.handleRollover_(e.startTime+o,t.time);e.startTime=Math.max(i,0);e.endTime=Math.max(i+s,0)}));if(!s.syncInfo){const t=e.cues[0].startTime;const n=e.cues[e.cues.length-1].startTime;s.syncInfo={mediaSequence:s.mediaSequence+e.mediaIndex,time:Math.min(t,n-i.duration)}}}handleRollover_(e,t){if(t===null)return e;let s=e*P;const i=t*P;let n;n=i<s?-8589934592:8589934592;while(Math.abs(s-i)>4294967296)s+=n;return s/P}}
/**
 * Searches for an ad cue that overlaps with the given mediaTime
 *
 * @param {Object} track
 *        the track to find the cue for
 *
 * @param {number} mediaTime
 *        the time to find the cue at
 *
 * @return {Object|null}
 *         the found cue or null
 */const findAdCue=function(e,t){const s=e.cues;for(let e=0;e<s.length;e++){const i=s[e];if(t>=i.adStartTime&&t<=i.adEndTime)return i}return null};const updateAdCues=function(t,s,i=0){if(!t.segments)return;let n=i;let r;for(let i=0;i<t.segments.length;i++){const a=t.segments[i];r||(r=findAdCue(s,n+a.duration/2));if(r){if("cueIn"in a){r.endTime=n;r.adEndTime=n;n+=a.duration;r=null;continue}if(n<r.endTime){n+=a.duration;continue}r.endTime+=a.duration}else{if("cueOut"in a){r=new e.VTTCue(n,n+a.duration,a.cueOut);r.adStartTime=n;r.adEndTime=n+parseFloat(a.cueOut);s.addCue(r)}if("cueOutCont"in a){const[t,i]=a.cueOutCont.split("/").map(parseFloat);r=new e.VTTCue(n,n+a.duration,"");r.adStartTime=n-t;r.adEndTime=r.adStartTime+i;s.addCue(r)}}n+=a.duration}};class SyncInfo{
/**
   * @param {number} start - media sequence start
   * @param {number} end - media sequence end
   * @param {number} segmentIndex - index for associated segment
   * @param {number|null} [partIndex] - index for associated part
   * @param {boolean} [appended] - appended indicator
   *
   */
constructor({start:e,end:t,segmentIndex:s,partIndex:i=null,appended:n=false}){this.start_=e;this.end_=t;this.segmentIndex_=s;this.partIndex_=i;this.appended_=n}isInRange(e){return e>=this.start&&e<this.end}markAppended(){this.appended_=true}resetAppendedStatus(){this.appended_=false}get isAppended(){return this.appended_}get start(){return this.start_}get end(){return this.end_}get segmentIndex(){return this.segmentIndex_}get partIndex(){return this.partIndex_}}class SyncInfoData{
/**
   *
   * @param {SyncInfo} segmentSyncInfo - sync info for a given segment
   * @param {Array<SyncInfo>} [partsSyncInfo] - sync infos for a list of parts for a given segment
   */
constructor(e,t=[]){this.segmentSyncInfo_=e;this.partsSyncInfo_=t}get segmentSyncInfo(){return this.segmentSyncInfo_}get partsSyncInfo(){return this.partsSyncInfo_}get hasPartsSyncInfo(){return this.partsSyncInfo_.length>0}resetAppendStatus(){this.segmentSyncInfo_.resetAppendedStatus();this.partsSyncInfo_.forEach((e=>e.resetAppendedStatus()))}}class MediaSequenceSync{constructor(){
/**
     * @type {Map<number, SyncInfoData>}
     * @protected
     */
this.storage_=new Map;this.diagnostics_="";this.isReliable_=false;this.start_=-Infinity;this.end_=Infinity}get start(){return this.start_}get end(){return this.end_}get diagnostics(){return this.diagnostics_}get isReliable(){return this.isReliable_}resetAppendedStatus(){this.storage_.forEach((e=>e.resetAppendStatus()))}
/**
   * update sync storage
   *
   * @param {Object} playlist
   * @param {number} currentTime
   *
   * @return {void}
   */update(e,t){const{mediaSequence:s,segments:i}=e;this.isReliable_=this.isReliablePlaylist_(s,i);if(this.isReliable_)return this.updateStorage_(i,s,this.calculateBaseTime_(s,i,t))}
/**
   * @param {number} targetTime
   * @return {SyncInfo|null}
   */getSyncInfoForTime(e){for(const{segmentSyncInfo:t,partsSyncInfo:s}of this.storage_.values())if(s.length){for(const t of s)if(t.isInRange(e))return t}else if(t.isInRange(e))return t;return null}getSyncInfoForMediaSequence(e){return this.storage_.get(e)}updateStorage_(e,t,s){const i=new Map;let n="\n";let r=s;let a=t;this.start_=r;e.forEach(((e,t)=>{const s=this.storage_.get(a);const o=r;const l=o+e.duration;const d=Boolean(s&&s.segmentSyncInfo&&s.segmentSyncInfo.isAppended);const h=new SyncInfo({start:o,end:l,appended:d,segmentIndex:t});e.syncInfo=h;let c=r;const u=(e.parts||[]).map(((e,i)=>{const r=c;const o=c+e.duration;const l=Boolean(s&&s.partsSyncInfo&&s.partsSyncInfo[i]&&s.partsSyncInfo[i].isAppended);const d=new SyncInfo({start:r,end:o,appended:l,segmentIndex:t,partIndex:i});c=o;n+=`Media Sequence: ${a}.${i} | Range: ${r} --\x3e ${o} | Appended: ${l}\n`;e.syncInfo=d;return d}));i.set(a,new SyncInfoData(h,u));n+=`${compactSegmentUrlDescription(e.resolvedUri)} | Media Sequence: ${a} | Range: ${o} --\x3e ${l} | Appended: ${d}\n`;a++;r=l}));this.end_=r;this.storage_=i;this.diagnostics_=n}calculateBaseTime_(e,t,s){if(!this.storage_.size)return 0;if(this.storage_.has(e))return this.storage_.get(e).segmentSyncInfo.start;const i=Math.min(...this.storage_.keys());if(e<i){const s=i-e;let n=this.storage_.get(i).segmentSyncInfo.start;for(let e=0;e<s;e++){const s=t[e];n-=s.duration}return n}return s}isReliablePlaylist_(e,t){return e!==void 0&&e!==null&&Array.isArray(t)&&t.length}}class DependantMediaSequenceSync extends MediaSequenceSync{constructor(e){super();this.parent_=e}calculateBaseTime_(e,t,s){if(!this.storage_.size){const t=this.parent_.getSyncInfoForMediaSequence(e);return t?t.segmentSyncInfo.start:0}return super.calculateBaseTime_(e,t,s)}}const is=86400;const ns=[{name:"VOD",run:(e,t,s,i,n)=>{if(s!==Infinity){const e={time:0,segmentIndex:0,partIndex:null};return e}return null}},{name:"MediaSequence",
/**
   * run media sequence strategy
   *
   * @param {SyncController} syncController
   * @param {Object} playlist
   * @param {number} duration
   * @param {number} currentTimeline
   * @param {number} currentTime
   * @param {string} type
   */
run:(e,t,s,i,n,r)=>{const a=e.getMediaSequenceSync(r);if(!a)return null;if(!a.isReliable)return null;const o=a.getSyncInfoForTime(n);return o?{time:o.start,partIndex:o.partIndex,segmentIndex:o.segmentIndex}:null}},{name:"ProgramDateTime",run:(e,t,s,i,n)=>{if(!Object.keys(e.timelineToDatetimeMappings).length)return null;let r=null;let a=null;const o=getPartsAndSegments(t);n=n||0;for(let s=0;s<o.length;s++){const i=t.endList||n===0?s:o.length-(s+1);const l=o[i];const d=l.segment;const h=e.timelineToDatetimeMappings[d.timeline];if(!h||!d.dateTimeObject)continue;const c=d.dateTimeObject.getTime()/1e3;let u=c+h;if(d.parts&&typeof l.partIndex==="number")for(let e=0;e<l.partIndex;e++)u+=d.parts[e].duration;const p=Math.abs(n-u);if(a!==null&&(p===0||a<p))break;a=p;r={time:u,segmentIndex:l.segmentIndex,partIndex:l.partIndex}}return r}},{name:"Segment",run:(e,t,s,i,n)=>{let r=null;let a=null;n=n||0;const o=getPartsAndSegments(t);for(let e=0;e<o.length;e++){const s=t.endList||n===0?e:o.length-(e+1);const l=o[s];const d=l.segment;const h=l.part&&l.part.start||d&&d.start;if(d.timeline===i&&typeof h!=="undefined"){const e=Math.abs(n-h);if(a!==null&&a<e)break;if(!r||a===null||a>=e){a=e;r={time:h,segmentIndex:l.segmentIndex,partIndex:l.partIndex}}}}return r}},{name:"Discontinuity",run:(e,t,s,i,n)=>{let r=null;n=n||0;if(t.discontinuityStarts&&t.discontinuityStarts.length){let s=null;for(let i=0;i<t.discontinuityStarts.length;i++){const a=t.discontinuityStarts[i];const o=t.discontinuitySequence+i+1;const l=e.discontinuities[o];if(l){const e=Math.abs(n-l.time);if(s!==null&&s<e)break;if(!r||s===null||s>=e){s=e;r={time:l.time,segmentIndex:a,partIndex:null}}}}}return r}},{name:"Playlist",run:(e,t,s,i,n)=>{if(t.syncInfo){const e={time:t.syncInfo.time,segmentIndex:t.syncInfo.mediaSequence-t.mediaSequence,partIndex:null};return e}return null}}];class SyncController extends videojs.EventTarget{constructor(e={}){super();this.timelines=[];this.discontinuities=[];this.timelineToDatetimeMappings={};const t=new MediaSequenceSync;const s=new DependantMediaSequenceSync(t);const i=new DependantMediaSequenceSync(t);this.mediaSequenceStorage_={main:t,audio:s,vtt:i};this.logger_=logger("SyncController")}
/**
   *
   * @param {string} loaderType
   * @return {MediaSequenceSync|null}
   */getMediaSequenceSync(e){return this.mediaSequenceStorage_[e]||null}
/**
   * Find a sync-point for the playlist specified
   *
   * A sync-point is defined as a known mapping from display-time to
   * a segment-index in the current playlist.
   *
   * @param {Playlist} playlist
   *        The playlist that needs a sync-point
   * @param {number} duration
   *        Duration of the MediaSource (Infinite if playing a live source)
   * @param {number} currentTimeline
   *        The last timeline from which a segment was loaded
   * @param {number} currentTime
   *        Current player's time
   * @param {string} type
   *        Segment loader type
   * @return {Object}
   *          A sync-point object
   */getSyncPoint(e,t,s,i,n){if(t!==Infinity){const s=ns.find((({name:e})=>e==="VOD"));return s.run(this,e,t)}const r=this.runStrategies_(e,t,s,i,n);if(!r.length)return null;for(const t of r){const{syncPoint:s,strategy:n}=t;const{segmentIndex:r,time:a}=s;if(r<0)continue;const o=e.segments[r];const l=a;const d=l+o.duration;this.logger_(`Strategy: ${n}. Current time: ${i}. selected segment: ${r}. Time: [${l} -> ${d}]}`);if(i>=l&&i<d){this.logger_("Found sync point with exact match: ",s);return s}}return this.selectSyncPoint_(r,{key:"time",value:i})}
/**
   * Calculate the amount of time that has expired off the playlist during playback
   *
   * @param {Playlist} playlist
   *        Playlist object to calculate expired from
   * @param {number} duration
   *        Duration of the MediaSource (Infinity if playling a live source)
   * @return {number|null}
   *          The amount of time that has expired off the playlist during playback. Null
   *          if no sync-points for the playlist can be found.
   */getExpiredTime(e,t){if(!e||!e.segments)return null;const s=this.runStrategies_(e,t,e.discontinuitySequence,0);if(!s.length)return null;const i=this.selectSyncPoint_(s,{key:"segmentIndex",value:0});i.segmentIndex>0&&(i.time*=-1);return Math.abs(i.time+sumDurations({defaultDuration:e.targetDuration,durationList:e.segments,startIndex:i.segmentIndex,endIndex:0}))}
/**
   * Runs each sync-point strategy and returns a list of sync-points returned by the
   * strategies
   *
   * @private
   * @param {Playlist} playlist
   *        The playlist that needs a sync-point
   * @param {number} duration
   *        Duration of the MediaSource (Infinity if playing a live source)
   * @param {number} currentTimeline
   *        The last timeline from which a segment was loaded
   * @param {number} currentTime
   *        Current player's time
   * @param {string} type
   *        Segment loader type
   * @return {Array}
   *          A list of sync-point objects
   */runStrategies_(e,t,s,i,n){const r=[];for(let a=0;a<ns.length;a++){const o=ns[a];const l=o.run(this,e,t,s,i,n);if(l){l.strategy=o.name;r.push({strategy:o.name,syncPoint:l})}}return r}
/**
   * Selects the sync-point nearest the specified target
   *
   * @private
   * @param {Array} syncPoints
   *        List of sync-points to select from
   * @param {Object} target
   *        Object specifying the property and value we are targeting
   * @param {string} target.key
   *        Specifies the property to target. Must be either 'time' or 'segmentIndex'
   * @param {number} target.value
   *        The value to target for the specified key.
   * @return {Object}
   *          The sync-point nearest the target
   */selectSyncPoint_(e,t){let s=e[0].syncPoint;let i=Math.abs(e[0].syncPoint[t.key]-t.value);let n=e[0].strategy;for(let r=1;r<e.length;r++){const a=Math.abs(e[r].syncPoint[t.key]-t.value);if(a<i){i=a;s=e[r].syncPoint;n=e[r].strategy}}this.logger_(`syncPoint for [${t.key}: ${t.value}] chosen with strategy [${n}]: [time:${s.time}, segmentIndex:${s.segmentIndex}`+(typeof s.partIndex==="number"?`,partIndex:${s.partIndex}`:"")+"]");return s}
/**
   * Save any meta-data present on the segments when segments leave
   * the live window to the playlist to allow for synchronization at the
   * playlist level later.
   *
   * @param {Playlist} oldPlaylist - The previous active playlist
   * @param {Playlist} newPlaylist - The updated and most current playlist
   */saveExpiredSegmentInfo(e,t){const s=t.mediaSequence-e.mediaSequence;if(s>is)videojs.log.warn(`Not saving expired segment info. Media sequence gap ${s} is too large.`);else for(let i=s-1;i>=0;i--){const s=e.segments[i];if(s&&typeof s.start!=="undefined"){t.syncInfo={mediaSequence:e.mediaSequence+i,time:s.start};this.logger_(`playlist refresh sync: [time:${t.syncInfo.time}, mediaSequence: ${t.syncInfo.mediaSequence}]`);this.trigger("syncinfoupdate");break}}}
/**
   * Save the mapping from playlist's ProgramDateTime to display. This should only happen
   * before segments start to load.
   *
   * @param {Playlist} playlist - The currently active playlist
   */setDateTimeMappingForStart(e){this.timelineToDatetimeMappings={};if(e.segments&&e.segments.length&&e.segments[0].dateTimeObject){const t=e.segments[0];const s=t.dateTimeObject.getTime()/1e3;this.timelineToDatetimeMappings[t.timeline]=-s}}
/**
   * Calculates and saves timeline mappings, playlist sync info, and segment timing values
   * based on the latest timing information.
   *
   * @param {Object} options
   *        Options object
   * @param {SegmentInfo} options.segmentInfo
   *        The current active request information
   * @param {boolean} options.shouldSaveTimelineMapping
   *        If there's a timeline change, determines if the timeline mapping should be
   *        saved for timeline mapping and program date time mappings.
   */saveSegmentTimingInfo({segmentInfo:e,shouldSaveTimelineMapping:t}){const s=this.calculateSegmentTimeMapping_(e,e.timingInfo,t);const i=e.segment;if(s){this.saveDiscontinuitySyncInfo_(e);e.playlist.syncInfo||(e.playlist.syncInfo={mediaSequence:e.playlist.mediaSequence+e.mediaIndex,time:i.start})}const n=i.dateTimeObject;i.discontinuity&&t&&n&&(this.timelineToDatetimeMappings[i.timeline]=-n.getTime()/1e3)}timestampOffsetForTimeline(e){return typeof this.timelines[e]==="undefined"?null:this.timelines[e].time}mappingForTimeline(e){return typeof this.timelines[e]==="undefined"?null:this.timelines[e].mapping}
/**
   * Use the "media time" for a segment to generate a mapping to "display time" and
   * save that display time to the segment.
   *
   * @private
   * @param {SegmentInfo} segmentInfo
   *        The current active request information
   * @param {Object} timingInfo
   *        The start and end time of the current segment in "media time"
   * @param {boolean} shouldSaveTimelineMapping
   *        If there's a timeline change, determines if the timeline mapping should be
   *        saved in timelines.
   * @return {boolean}
   *          Returns false if segment time mapping could not be calculated
   */calculateSegmentTimeMapping_(e,t,s){const i=e.segment;const n=e.part;let r=this.timelines[e.timeline];let a;let o;if(typeof e.timestampOffset==="number"){r={time:e.startOfSegment,mapping:e.startOfSegment-t.start};if(s){this.timelines[e.timeline]=r;this.trigger("timestampoffset");this.logger_(`time mapping for timeline ${e.timeline}: [time: ${r.time}] [mapping: ${r.mapping}]`)}a=e.startOfSegment;o=t.end+r.mapping}else{if(!r)return false;a=t.start+r.mapping;o=t.end+r.mapping}if(n){n.start=a;n.end=o}(!i.start||a<i.start)&&(i.start=a);i.end=o;return true}
/**
   * Each time we have discontinuity in the playlist, attempt to calculate the location
   * in display of the start of the discontinuity and save that. We also save an accuracy
   * value so that we save values with the most accuracy (closest to 0.)
   *
   * @private
   * @param {SegmentInfo} segmentInfo - The current active request information
   */saveDiscontinuitySyncInfo_(e){const t=e.playlist;const s=e.segment;if(s.discontinuity)this.discontinuities[s.timeline]={time:s.start,accuracy:0};else if(t.discontinuityStarts&&t.discontinuityStarts.length)for(let i=0;i<t.discontinuityStarts.length;i++){const n=t.discontinuityStarts[i];const r=t.discontinuitySequence+i+1;const a=n-e.mediaIndex;const o=Math.abs(a);if(!this.discontinuities[r]||this.discontinuities[r].accuracy>o){let i;i=a<0?s.start-sumDurations({defaultDuration:t.targetDuration,durationList:t.segments,startIndex:e.mediaIndex,endIndex:n}):s.end+sumDurations({defaultDuration:t.targetDuration,durationList:t.segments,startIndex:e.mediaIndex+1,endIndex:n});this.discontinuities[r]={time:i,accuracy:o}}}}dispose(){this.trigger("dispose");this.off()}}class TimelineChangeController extends videojs.EventTarget{constructor(){super();this.pendingTimelineChanges_={};this.lastTimelineChanges_={}}clearPendingTimelineChange(e){this.pendingTimelineChanges_[e]=null;this.trigger("pendingtimelinechange")}pendingTimelineChange({type:e,from:t,to:s}){if(typeof t==="number"&&typeof s==="number"){this.pendingTimelineChanges_[e]={type:e,from:t,to:s};this.trigger("pendingtimelinechange")}return this.pendingTimelineChanges_[e]}lastTimelineChange({type:e,from:t,to:s}){if(typeof t==="number"&&typeof s==="number"){this.lastTimelineChanges_[e]={type:e,from:t,to:s};delete this.pendingTimelineChanges_[e];const i={timelineChangeInfo:{from:t,to:s}};this.trigger({type:"timelinechange",metadata:i})}return this.lastTimelineChanges_[e]}dispose(){this.trigger("dispose");this.pendingTimelineChanges_={};this.lastTimelineChanges_={};this.off()}}const rs=transform(getWorkerString((function(){var e=function(){function Stream(){this.listeners={}}
/**
     * Add a listener for a specified event type.
     *
     * @param {string} type the event name
     * @param {Function} listener the callback to be invoked when an event of
     * the specified type occurs
     */var e=Stream.prototype;e.on=function on(e,t){this.listeners[e]||(this.listeners[e]=[]);this.listeners[e].push(t)}
/**
     * Remove a listener for a specified event type.
     *
     * @param {string} type the event name
     * @param {Function} listener  a function previously registered for this
     * type of event through `on`
     * @return {boolean} if we could turn it off or not
     */;e.off=function off(e,t){if(!this.listeners[e])return false;var s=this.listeners[e].indexOf(t);this.listeners[e]=this.listeners[e].slice(0);this.listeners[e].splice(s,1);return s>-1}
/**
     * Trigger an event of the specified type on this stream. Any additional
     * arguments to this function are passed as parameters to event listeners.
     *
     * @param {string} type the event name
     */;e.trigger=function trigger(e){var t=this.listeners[e];if(t)if(arguments.length===2){var s=t.length;for(var i=0;i<s;++i)t[i].call(this,arguments[1])}else{var n=Array.prototype.slice.call(arguments,1);var r=t.length;for(var a=0;a<r;++a)t[a].apply(this,n)}};e.dispose=function dispose(){this.listeners={}}
/**
     * Forwards all `data` events on this stream to the destination stream. The
     * destination stream should provide a method `push` to receive the data
     * events as they arrive.
     *
     * @param {Stream} destination the stream that will receive all `data` events
     * @see http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
     */;e.pipe=function pipe(e){this.on("data",(function(t){e.push(t)}))};return Stream}();
/*! @name pkcs7 @version 1.0.4 @license Apache-2.0 */
/**
   * Returns the subarray of a Uint8Array without PKCS#7 padding.
   *
   * @param padded {Uint8Array} unencrypted bytes that have been padded
   * @return {Uint8Array} the unpadded bytes
   * @see http://tools.ietf.org/html/rfc5652
   */function unpad(e){return e.subarray(0,e.byteLength-e[e.byteLength-1])}
/*! @name aes-decrypter @version 4.0.2 @license Apache-2.0 */const precompute=function(){const e=[[[],[],[],[],[]],[[],[],[],[],[]]];const t=e[0];const s=e[1];const i=t[4];const n=s[4];let r;let a;let o;const l=[];const d=[];let h;let c;let u;let p;let m;let f;for(r=0;r<256;r++)d[(l[r]=r<<1^283*(r>>7))^r]=r;for(a=o=0;!i[a];a^=h||1,o=d[o]||1){p=o^o<<1^o<<2^o<<3^o<<4;p=p>>8^p&255^99;i[a]=p;n[p]=a;u=l[c=l[h=l[a]]];f=u*16843009^c*65537^h*257^a*16843008;m=l[p]*257^p*16843008;for(r=0;r<4;r++){t[r][a]=m=m<<24^m>>>8;s[r][p]=f=f<<24^f>>>8}}for(r=0;r<5;r++){t[r]=t[r].slice(0);s[r]=s[r].slice(0)}return e};let t=null;
/**
   * Schedule out an AES key for both encryption and decryption. This
   * is a low-level class. Use a cipher mode to do bulk encryption.
   *
   * @class AES
   * @param key {Array} The key as an array of 4, 6 or 8 words.
   */class AES{constructor(e){t||(t=precompute());this._tables=[[t[0][0].slice(),t[0][1].slice(),t[0][2].slice(),t[0][3].slice(),t[0][4].slice()],[t[1][0].slice(),t[1][1].slice(),t[1][2].slice(),t[1][3].slice(),t[1][4].slice()]];let s;let i;let n;const r=this._tables[0][4];const a=this._tables[1];const o=e.length;let l=1;if(o!==4&&o!==6&&o!==8)throw new Error("Invalid aes key size");const d=e.slice(0);const h=[];this._key=[d,h];for(s=o;s<4*o+28;s++){n=d[s-1];if(s%o===0||o===8&&s%o===4){n=r[n>>>24]<<24^r[n>>16&255]<<16^r[n>>8&255]<<8^r[n&255];if(s%o===0){n=n<<8^n>>>24^l<<24;l=l<<1^283*(l>>7)}}d[s]=d[s-o]^n}for(i=0;s;i++,s--){n=d[i&3?s:s-4];h[i]=s<=4||i<4?n:a[0][r[n>>>24]]^a[1][r[n>>16&255]]^a[2][r[n>>8&255]]^a[3][r[n&255]]}}
/**
     * Decrypt 16 bytes, specified as four 32-bit words.
     *
     * @param {number} encrypted0 the first word to decrypt
     * @param {number} encrypted1 the second word to decrypt
     * @param {number} encrypted2 the third word to decrypt
     * @param {number} encrypted3 the fourth word to decrypt
     * @param {Int32Array} out the array to write the decrypted words
     * into
     * @param {number} offset the offset into the output array to start
     * writing results
     * @return {Array} The plaintext.
     */decrypt(e,t,s,i,n,r){const a=this._key[1];let o=e^a[0];let l=i^a[1];let d=s^a[2];let h=t^a[3];let c;let u;let p;const m=a.length/4-2;let f;let g=4;const y=this._tables[1];const _=y[0];const v=y[1];const T=y[2];const b=y[3];const S=y[4];for(f=0;f<m;f++){c=_[o>>>24]^v[l>>16&255]^T[d>>8&255]^b[h&255]^a[g];u=_[l>>>24]^v[d>>16&255]^T[h>>8&255]^b[o&255]^a[g+1];p=_[d>>>24]^v[h>>16&255]^T[o>>8&255]^b[l&255]^a[g+2];h=_[h>>>24]^v[o>>16&255]^T[l>>8&255]^b[d&255]^a[g+3];g+=4;o=c;l=u;d=p}for(f=0;f<4;f++){n[(3&-f)+r]=S[o>>>24]<<24^S[l>>16&255]<<16^S[d>>8&255]<<8^S[h&255]^a[g++];c=o;o=l;l=d;d=h;h=c}}}class AsyncStream extends e{constructor(){super(e);this.jobs=[];this.delay=1;this.timeout_=null}processJob_(){this.jobs.shift()();this.jobs.length?this.timeout_=setTimeout(this.processJob_.bind(this),this.delay):this.timeout_=null}
/**
     * push a job into the stream
     *
     * @param {Function} job the job to push into the stream
     */push(e){this.jobs.push(e);this.timeout_||(this.timeout_=setTimeout(this.processJob_.bind(this),this.delay))}}const ntoh=function(e){return e<<24|(e&65280)<<8|(e&16711680)>>8|e>>>24};
/**
   * Decrypt bytes using AES-128 with CBC and PKCS#7 padding.
   *
   * @param {Uint8Array} encrypted the encrypted bytes
   * @param {Uint32Array} key the bytes of the decryption key
   * @param {Uint32Array} initVector the initialization vector (IV) to
   * use for the first round of CBC.
   * @return {Uint8Array} the decrypted bytes
   *
   * @see http://en.wikipedia.org/wiki/Advanced_Encryption_Standard
   * @see http://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29
   * @see https://tools.ietf.org/html/rfc2315
   */const decrypt=function(e,t,s){const i=new Int32Array(e.buffer,e.byteOffset,e.byteLength>>2);const n=new AES(Array.prototype.slice.call(t));const r=new Uint8Array(e.byteLength);const a=new Int32Array(r.buffer);let o;let l;let d;let h;let c;let u;let p;let m;let f;o=s[0];l=s[1];d=s[2];h=s[3];for(f=0;f<i.length;f+=4){c=ntoh(i[f]);u=ntoh(i[f+1]);p=ntoh(i[f+2]);m=ntoh(i[f+3]);n.decrypt(c,u,p,m,a,f);a[f]=ntoh(a[f]^o);a[f+1]=ntoh(a[f+1]^l);a[f+2]=ntoh(a[f+2]^d);a[f+3]=ntoh(a[f+3]^h);o=c;l=u;d=p;h=m}return r};
/**
   * The `Decrypter` class that manages decryption of AES
   * data through `AsyncStream` objects and the `decrypt`
   * function
   *
   * @param {Uint8Array} encrypted the encrypted bytes
   * @param {Uint32Array} key the bytes of the decryption key
   * @param {Uint32Array} initVector the initialization vector (IV) to
   * @param {Function} done the function to run when done
   * @class Decrypter
   */class Decrypter{constructor(e,t,s,i){const n=Decrypter.STEP;const r=new Int32Array(e.buffer);const a=new Uint8Array(e.byteLength);let o=0;this.asyncStream_=new AsyncStream;this.asyncStream_.push(this.decryptChunk_(r.subarray(o,o+n),t,s,a));for(o=n;o<r.length;o+=n){s=new Uint32Array([ntoh(r[o-4]),ntoh(r[o-3]),ntoh(r[o-2]),ntoh(r[o-1])]);this.asyncStream_.push(this.decryptChunk_(r.subarray(o,o+n),t,s,a))}this.asyncStream_.push((function(){i(null,unpad(a))}))}static get STEP(){return 32e3}decryptChunk_(e,t,s,i){return function(){const n=decrypt(e,t,s);i.set(n,e.byteOffset)}}}var s=typeof globalThis!=="undefined"?globalThis:typeof window!=="undefined"?window:typeof global!=="undefined"?global:typeof self!=="undefined"?self:{};var i;i=typeof window!=="undefined"?window:typeof s!=="undefined"?s:typeof self!=="undefined"?self:{};var n=i;var r=function isArrayBufferView(e){return ArrayBuffer.isView==="function"?ArrayBuffer.isView(e):e&&e.buffer instanceof ArrayBuffer};var a=n.BigInt||Number;[a("0x1"),a("0x100"),a("0x10000"),a("0x1000000"),a("0x100000000"),a("0x10000000000"),a("0x1000000000000"),a("0x100000000000000"),a("0x10000000000000000")];(function(){var e=new Uint16Array([65484]);var t=new Uint8Array(e.buffer,e.byteOffset,e.byteLength);return t[0]===255?"big":t[0]===204?"little":"unknown"})();
/**
   * Creates an object for sending to a web worker modifying properties that are TypedArrays
   * into a new object with seperated properties for the buffer, byteOffset, and byteLength.
   *
   * @param {Object} message
   *        Object of properties and values to send to the web worker
   * @return {Object}
   *         Modified message with TypedArray values expanded
   * @function createTransferableMessage
   */const createTransferableMessage=function(e){const t={};Object.keys(e).forEach((s=>{const i=e[s];r(i)?t[s]={bytes:i.buffer,byteOffset:i.byteOffset,byteLength:i.byteLength}:t[s]=i}));return t};self.onmessage=function(e){const t=e.data;const s=new Uint8Array(t.encrypted.bytes,t.encrypted.byteOffset,t.encrypted.byteLength);const i=new Uint32Array(t.key.bytes,t.key.byteOffset,t.key.byteLength/4);const n=new Uint32Array(t.iv.bytes,t.iv.byteOffset,t.iv.byteLength/4);new Decrypter(s,i,n,(function(e,s){self.postMessage(createTransferableMessage({source:t.source,decrypted:s}),[s.buffer])}))}})));var as=factory(rs);const audioTrackKind_=e=>{let t=e.default?"main":"alternative";e.characteristics&&e.characteristics.indexOf("public.accessibility.describes-video")>=0&&(t="main-desc");return t};
/**
 * Pause provided segment loader and playlist loader if active
 *
 * @param {SegmentLoader} segmentLoader
 *        SegmentLoader to pause
 * @param {Object} mediaType
 *        Active media type
 * @function stopLoaders
 */const stopLoaders=(e,t)=>{e.abort();e.pause();if(t&&t.activePlaylistLoader){t.activePlaylistLoader.pause();t.activePlaylistLoader=null}};
/**
 * Start loading provided segment loader and playlist loader
 *
 * @param {PlaylistLoader} playlistLoader
 *        PlaylistLoader to start loading
 * @param {Object} mediaType
 *        Active media type
 * @function startLoaders
 */const startLoaders=(e,t)=>{t.activePlaylistLoader=e;e.load()};
/**
 * Returns a function to be called when the media group changes. It performs a
 * non-destructive (preserve the buffer) resync of the SegmentLoader. This is because a
 * change of group is merely a rendition switch of the same content at another encoding,
 * rather than a change of content, such as switching audio from English to Spanish.
 *
 * @param {string} type
 *        MediaGroup type
 * @param {Object} settings
 *        Object containing required information for media groups
 * @return {Function}
 *         Handler for a non-destructive resync of SegmentLoader when the active media
 *         group changes.
 * @function onGroupChanged
 */const onGroupChanged=(e,t)=>()=>{const{segmentLoaders:{[e]:s,main:i},mediaTypes:{[e]:n}}=t;const r=n.activeTrack();const a=n.getActiveGroup();const o=n.activePlaylistLoader;const l=n.lastGroup_;if(!a||!l||a.id!==l.id){n.lastGroup_=a;n.lastTrack_=r;stopLoaders(s,n);if(a&&!a.isMainPlaylist)if(a.playlistLoader){s.resyncLoader();startLoaders(a.playlistLoader,n)}else o&&i.resetEverything()}};const onGroupChanging=(e,t)=>()=>{const{segmentLoaders:{[e]:s},mediaTypes:{[e]:i}}=t;i.lastGroup_=null;s.abort();s.pause()}
/**
 * Returns a function to be called when the media track changes. It performs a
 * destructive reset of the SegmentLoader to ensure we start loading as close to
 * currentTime as possible.
 *
 * @param {string} type
 *        MediaGroup type
 * @param {Object} settings
 *        Object containing required information for media groups
 * @return {Function}
 *         Handler for a destructive reset of SegmentLoader when the active media
 *         track changes.
 * @function onTrackChanged
 */;const onTrackChanged=(e,t)=>()=>{const{mainPlaylistLoader:s,segmentLoaders:{[e]:i,main:n},mediaTypes:{[e]:r}}=t;const a=r.activeTrack();const o=r.getActiveGroup();const l=r.activePlaylistLoader;const d=r.lastTrack_;if(!d||!a||d.id!==a.id){r.lastGroup_=o;r.lastTrack_=a;stopLoaders(i,r);if(o)if(o.isMainPlaylist){if(!a||!d||a.id===d.id)return;const e=t.vhs.playlistController_;const i=e.selectPlaylist();if(e.media()===i)return;r.logger_(`track change. Switching main audio from ${d.id} to ${a.id}`);s.pause();n.resetEverything();e.fastQualityChange_(i)}else{if(e==="AUDIO"){if(!o.playlistLoader){n.setAudio(true);n.resetEverything();return}i.setAudio(true);n.setAudio(false)}if(l!==o.playlistLoader){i.track&&i.track(a);i.resetEverything();startLoaders(o.playlistLoader,r)}else startLoaders(o.playlistLoader,r)}}};const os={
/**
   * Returns a function to be called when a SegmentLoader or PlaylistLoader encounters
   * an error.
   *
   * @param {string} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Error handler. Logs warning (or error if the playlist is excluded) to
   *         console and switches back to default audio track.
   * @function onError.AUDIO
   */
AUDIO:(e,t)=>()=>{const{mediaTypes:{[e]:s},excludePlaylist:i}=t;const n=s.activeTrack();const r=s.activeGroup();const a=(r.filter((e=>e.default))[0]||r[0]).id;const o=s.tracks[a];if(n!==o){videojs.log.warn("Problem encountered loading the alternate audio track.Switching back to default.");for(const e in s.tracks)s.tracks[e].enabled=s.tracks[e]===o;s.onTrackChanged()}else i({error:{message:"Problem encountered loading the default audio track."}})}
/**
   * Returns a function to be called when a SegmentLoader or PlaylistLoader encounters
   * an error.
   *
   * @param {string} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Error handler. Logs warning to console and disables the active subtitle track
   * @function onError.SUBTITLES
   */,SUBTITLES:(e,t)=>()=>{const{mediaTypes:{[e]:s}}=t;videojs.log.warn("Problem encountered loading the subtitle track.Disabling subtitle track.");const i=s.activeTrack();i&&(i.mode="disabled");s.onTrackChanged()}};const ls={
/**
   * Setup event listeners for audio playlist loader
   *
   * @param {string} type
   *        MediaGroup type
   * @param {PlaylistLoader|null} playlistLoader
   *        PlaylistLoader to register listeners on
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function setupListeners.AUDIO
   */
AUDIO:(e,t,s)=>{if(!t)return;const{tech:i,requestOptions:n,segmentLoaders:{[e]:r}}=s;t.on("loadedmetadata",(()=>{const e=t.media();r.playlist(e,n);(!i.paused()||e.endList&&i.preload()!=="none")&&r.load()}));t.on("loadedplaylist",(()=>{r.playlist(t.media(),n);i.paused()||r.load()}));t.on("error",os[e](e,s))},
/**
   * Setup event listeners for subtitle playlist loader
   *
   * @param {string} type
   *        MediaGroup type
   * @param {PlaylistLoader|null} playlistLoader
   *        PlaylistLoader to register listeners on
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function setupListeners.SUBTITLES
   */
SUBTITLES:(e,t,s)=>{const{tech:i,requestOptions:n,segmentLoaders:{[e]:r},mediaTypes:{[e]:a}}=s;t.on("loadedmetadata",(()=>{const e=t.media();r.playlist(e,n);r.track(a.activeTrack());(!i.paused()||e.endList&&i.preload()!=="none")&&r.load()}));t.on("loadedplaylist",(()=>{r.playlist(t.media(),n);i.paused()||r.load()}));t.on("error",os[e](e,s))}};const ds={
/**
   * Setup PlaylistLoaders and AudioTracks for the audio groups
   *
   * @param {string} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function initialize.AUDIO
   */
AUDIO:(e,t)=>{const{vhs:s,sourceType:i,segmentLoaders:{[e]:n},requestOptions:r,main:{mediaGroups:a},mediaTypes:{[e]:{groups:o,tracks:l,logger_:d}},mainPlaylistLoader:h}=t;const c=isAudioOnly(h.main);if(!a[e]||Object.keys(a[e]).length===0){a[e]={main:{default:{default:true}}};c&&(a[e].main.default.playlists=h.main.playlists)}for(const n in a[e]){o[n]||(o[n]=[]);for(const u in a[e][n]){let p=a[e][n][u];let m;if(c){d(`AUDIO group '${n}' label '${u}' is a main playlist`);p.isMainPlaylist=true;m=null}else m=i==="vhs-json"&&p.playlists?new PlaylistLoader(p.playlists[0],s,r):p.resolvedUri?new PlaylistLoader(p.resolvedUri,s,r):p.playlists&&i==="dash"?new DashPlaylistLoader(p.playlists[0],s,r,h):null;p=merge({id:u,playlistLoader:m},p);ls[e](e,p.playlistLoader,t);o[n].push(p);if(typeof l[u]==="undefined"){const e=new videojs.AudioTrack({id:u,kind:audioTrackKind_(p),enabled:false,language:p.language,default:p.default,label:u});l[u]=e}}}n.on("error",os[e](e,t))},
/**
   * Setup PlaylistLoaders and TextTracks for the subtitle groups
   *
   * @param {string} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function initialize.SUBTITLES
   */
SUBTITLES:(e,t)=>{const{tech:s,vhs:i,sourceType:n,segmentLoaders:{[e]:r},requestOptions:a,main:{mediaGroups:o},mediaTypes:{[e]:{groups:l,tracks:d}},mainPlaylistLoader:h}=t;for(const r in o[e]){l[r]||(l[r]=[]);for(const c in o[e][r]){if(!i.options_.useForcedSubtitles&&o[e][r][c].forced)continue;let u=o[e][r][c];let p;if(n==="hls")p=new PlaylistLoader(u.resolvedUri,i,a);else if(n==="dash"){const e=u.playlists.filter((e=>e.excludeUntil!==Infinity));if(!e.length)return;p=new DashPlaylistLoader(u.playlists[0],i,a,h)}else n==="vhs-json"&&(p=new PlaylistLoader(u.playlists?u.playlists[0]:u.resolvedUri,i,a));u=merge({id:c,playlistLoader:p},u);ls[e](e,u.playlistLoader,t);l[r].push(u);if(typeof d[c]==="undefined"){const e=s.addRemoteTextTrack({id:c,kind:"subtitles",default:u.default&&u.autoselect,language:u.language,label:c},false).track;d[c]=e}}}r.on("error",os[e](e,t))},
/**
   * Setup TextTracks for the closed-caption groups
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function initialize['CLOSED-CAPTIONS']
   */
"CLOSED-CAPTIONS":(e,t)=>{const{tech:s,main:{mediaGroups:i},mediaTypes:{[e]:{groups:n,tracks:r}}}=t;for(const t in i[e]){n[t]||(n[t]=[]);for(const a in i[e][t]){const o=i[e][t][a];if(!/^(?:CC|SERVICE)/.test(o.instreamId))continue;const l=s.options_.vhs&&s.options_.vhs.captionServices||{};let d={label:a,language:o.language,instreamId:o.instreamId,default:o.default&&o.autoselect};l[d.instreamId]&&(d=merge(d,l[d.instreamId]));d.default===void 0&&delete d.default;n[t].push(merge({id:a},o));if(typeof r[a]==="undefined"){const e=s.addRemoteTextTrack({id:d.instreamId,kind:"captions",default:d.default,language:d.language,label:d.label},false).track;r[a]=e}}}}};const groupMatch=(e,t)=>{for(let s=0;s<e.length;s++){if(playlistMatch(t,e[s]))return true;if(e[s].playlists&&groupMatch(e[s].playlists,t))return true}return false};
/**
 * Returns a function used to get the active group of the provided type
 *
 * @param {string} type
 *        MediaGroup type
 * @param {Object} settings
 *        Object containing required information for media groups
 * @return {Function}
 *         Function that returns the active media group for the provided type. Takes an
 *         optional parameter {TextTrack} track. If no track is provided, a list of all
 *         variants in the group, otherwise the variant corresponding to the provided
 *         track is returned.
 * @function activeGroup
 */const activeGroup=(e,t)=>s=>{const{mainPlaylistLoader:i,mediaTypes:{[e]:{groups:n}}}=t;const r=i.media();if(!r)return null;let a=null;r.attributes[e]&&(a=n[r.attributes[e]]);const o=Object.keys(n);if(!a)if(e==="AUDIO"&&o.length>1&&isAudioOnly(t.main))for(let e=0;e<o.length;e++){const t=n[o[e]];if(groupMatch(t,r)){a=t;break}}else n.main?a=n.main:o.length===1&&(a=n[o[0]]);return typeof s==="undefined"?a:s!==null&&a&&a.filter((e=>e.id===s.id))[0]||null};const hs={
/**
   * Returns a function used to get the active track of type provided
   *
   * @param {string} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Function that returns the active media track for the provided type. Returns
   *         null if no track is active
   * @function activeTrack.AUDIO
   */
AUDIO:(e,t)=>()=>{const{mediaTypes:{[e]:{tracks:s}}}=t;for(const e in s)if(s[e].enabled)return s[e];return null}
/**
   * Returns a function used to get the active track of type provided
   *
   * @param {string} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Function that returns the active media track for the provided type. Returns
   *         null if no track is active
   * @function activeTrack.SUBTITLES
   */,SUBTITLES:(e,t)=>()=>{const{mediaTypes:{[e]:{tracks:s}}}=t;for(const e in s)if(s[e].mode==="showing"||s[e].mode==="hidden")return s[e];return null}};const getActiveGroup=(e,{mediaTypes:t})=>()=>{const s=t[e].activeTrack();return s?t[e].activeGroup(s):null}
/**
 * Setup PlaylistLoaders and Tracks for media groups (Audio, Subtitles,
 * Closed-Captions) specified in the main manifest.
 *
 * @param {Object} settings
 *        Object containing required information for setting up the media groups
 * @param {Tech} settings.tech
 *        The tech of the player
 * @param {Object} settings.requestOptions
 *        XHR request options used by the segment loaders
 * @param {PlaylistLoader} settings.mainPlaylistLoader
 *        PlaylistLoader for the main source
 * @param {VhsHandler} settings.vhs
 *        VHS SourceHandler
 * @param {Object} settings.main
 *        The parsed main manifest
 * @param {Object} settings.mediaTypes
 *        Object to store the loaders, tracks, and utility methods for each media type
 * @param {Function} settings.excludePlaylist
 *        Excludes the current rendition and forces a rendition switch.
 * @function setupMediaGroups
 */;const setupMediaGroups=e=>{["AUDIO","SUBTITLES","CLOSED-CAPTIONS"].forEach((t=>{ds[t](t,e)}));const{mediaTypes:t,mainPlaylistLoader:s,tech:i,vhs:n,segmentLoaders:{AUDIO:r,main:a}}=e;["AUDIO","SUBTITLES"].forEach((s=>{t[s].activeGroup=activeGroup(s,e);t[s].activeTrack=hs[s](s,e);t[s].onGroupChanged=onGroupChanged(s,e);t[s].onGroupChanging=onGroupChanging(s,e);t[s].onTrackChanged=onTrackChanged(s,e);t[s].getActiveGroup=getActiveGroup(s,e)}));const o=t.AUDIO.activeGroup();if(o){const e=(o.filter((e=>e.default))[0]||o[0]).id;t.AUDIO.tracks[e].enabled=true;t.AUDIO.onGroupChanged();t.AUDIO.onTrackChanged();const s=t.AUDIO.getActiveGroup();if(s.playlistLoader){a.setAudio(false);r.setAudio(true)}else a.setAudio(true)}s.on("mediachange",(()=>{["AUDIO","SUBTITLES"].forEach((e=>t[e].onGroupChanged()))}));s.on("mediachanging",(()=>{["AUDIO","SUBTITLES"].forEach((e=>t[e].onGroupChanging()))}));const onAudioTrackChanged=()=>{t.AUDIO.onTrackChanged();i.trigger({type:"usage",name:"vhs-audio-change"})};i.audioTracks().addEventListener("change",onAudioTrackChanged);i.remoteTextTracks().addEventListener("change",t.SUBTITLES.onTrackChanged);n.on("dispose",(()=>{i.audioTracks().removeEventListener("change",onAudioTrackChanged);i.remoteTextTracks().removeEventListener("change",t.SUBTITLES.onTrackChanged)}));i.clearTracks("audio");for(const e in t.AUDIO.tracks)i.audioTracks().addTrack(t.AUDIO.tracks[e])};const createMediaTypes=()=>{const e={};["AUDIO","SUBTITLES","CLOSED-CAPTIONS"].forEach((t=>{e[t]={groups:{},tracks:{},activePlaylistLoader:null,activeGroup:noop,activeTrack:noop,getActiveGroup:noop,onGroupChanged:noop,onTrackChanged:noop,lastTrack_:null,logger_:logger(`MediaGroups[${t}]`)}}));return e};class SteeringManifest{constructor(){this.priority_=[];this.pathwayClones_=new Map}set version(e){e===1&&(this.version_=e)}set ttl(e){this.ttl_=e||300}set reloadUri(e){e&&(this.reloadUri_=At(this.reloadUri_,e))}set priority(e){e&&e.length&&(this.priority_=e)}set pathwayClones(e){e&&e.length&&(this.pathwayClones_=new Map(e.map((e=>[e.ID,e]))))}get version(){return this.version_}get ttl(){return this.ttl_}get reloadUri(){return this.reloadUri_}get priority(){return this.priority_}get pathwayClones(){return this.pathwayClones_}}
/**
 * This class represents a content steering manifest and associated state. See both HLS and DASH specifications.
 * HLS: https://developer.apple.com/streaming/HLSContentSteeringSpecification.pdf and
 * https://datatracker.ietf.org/doc/draft-pantos-hls-rfc8216bis/ section 4.4.6.6.
 * DASH: https://dashif.org/docs/DASH-IF-CTS-00XX-Content-Steering-Community-Review.pdf
 *
 * @param {function} xhr for making a network request from the browser.
 * @param {function} bandwidth for fetching the current bandwidth from the main segment loader.
 */class ContentSteeringController extends videojs.EventTarget{constructor(e,t){super();this.currentPathway=null;this.defaultPathway=null;this.queryBeforeStart=false;this.availablePathways_=new Set;this.steeringManifest=new SteeringManifest;this.proxyServerUrl_=null;this.manifestType_=null;this.ttlTimeout_=null;this.request_=null;this.currentPathwayClones=new Map;this.nextPathwayClones=new Map;this.excludedSteeringManifestURLs=new Set;this.logger_=logger("Content Steering");this.xhr_=e;this.getBandwidth_=t}
/**
   * Assigns the content steering tag properties to the steering controller
   *
   * @param {string} baseUrl the baseURL from the main manifest for resolving the steering manifest url
   * @param {Object} steeringTag the content steering tag from the main manifest
   */assignTagProperties(e,t){this.manifestType_=t.serverUri?"HLS":"DASH";const s=t.serverUri||t.serverURL;if(s)if(s.startsWith("data:"))this.decodeDataUriManifest_(s.substring(s.indexOf(",")+1));else{this.steeringManifest.reloadUri=At(e,s);this.defaultPathway=t.pathwayId||t.defaultServiceLocation;this.queryBeforeStart=t.queryBeforeStart;this.proxyServerUrl_=t.proxyServerURL;this.defaultPathway&&!this.queryBeforeStart&&this.trigger("content-steering")}else{this.logger_(`steering manifest URL is ${s}, cannot request steering manifest.`);this.trigger("error")}}
/**
   * Requests the content steering manifest and parse the response. This should only be called after
   * assignTagProperties was called with a content steering tag.
   *
   * @param {string} initialUri The optional uri to make the request with.
   *    If set, the request should be made with exactly what is passed in this variable.
   *    This scenario should only happen once on initalization.
   */requestSteeringManifest(e){const t=this.steeringManifest.reloadUri;if(!t)return;const s=e?t:this.getRequestURI(t);if(!s){this.logger_("No valid content steering manifest URIs. Stopping content steering.");this.trigger("error");this.dispose();return}const i={contentSteeringInfo:{uri:s}};this.trigger({type:"contentsteeringloadstart",metadata:i});this.request_=this.xhr_({uri:s,requestType:"content-steering-manifest"},((e,t)=>{if(e){if(t.status===410){this.logger_(`manifest request 410 ${e}.`);this.logger_(`There will be no more content steering requests to ${s} this session.`);this.excludedSteeringManifestURLs.add(s);return}if(t.status===429){const s=t.responseHeaders["retry-after"];this.logger_(`manifest request 429 ${e}.`);this.logger_(`content steering will retry in ${s} seconds.`);this.startTTLTimeout_(parseInt(s,10));return}this.logger_(`manifest failed to load ${e}.`);this.startTTLTimeout_();return}this.trigger({type:"contentsteeringloadcomplete",metadata:i});let n;try{n=JSON.parse(this.request_.responseText)}catch(e){const t={errorType:videojs.Error.StreamingContentSteeringParserError,error:e};this.trigger({type:"error",metadata:t})}this.assignSteeringProperties_(n);const r={contentSteeringInfo:i.contentSteeringInfo,contentSteeringManifest:{version:this.steeringManifest.version,reloadUri:this.steeringManifest.reloadUri,priority:this.steeringManifest.priority}};this.trigger({type:"contentsteeringparsed",metadata:r});this.startTTLTimeout_()}))}
/**
   * Set the proxy server URL and add the steering manifest url as a URI encoded parameter.
   *
   * @param {string} steeringUrl the steering manifest url
   * @return the steering manifest url to a proxy server with all parameters set
   */setProxyServerUrl_(t){const s=new e.URL(t);const i=new e.URL(this.proxyServerUrl_);i.searchParams.set("url",encodeURI(s.toString()));return this.setSteeringParams_(i.toString())}
/**
   * Decodes and parses the data uri encoded steering manifest
   *
   * @param {string} dataUri the data uri to be decoded and parsed.
   */decodeDataUriManifest_(t){const s=JSON.parse(e.atob(t));this.assignSteeringProperties_(s)}
/**
   * Set the HLS or DASH content steering manifest request query parameters. For example:
   * _HLS_pathway="<CURRENT-PATHWAY-ID>" and _HLS_throughput=<THROUGHPUT>
   * _DASH_pathway and _DASH_throughput
   *
   * @param {string} uri to add content steering server parameters to.
   * @return a new uri as a string with the added steering query parameters.
   */setSteeringParams_(t){const s=new e.URL(t);const i=this.getPathway();const n=this.getBandwidth_();if(i){const e=`_${this.manifestType_}_pathway`;s.searchParams.set(e,i)}if(n){const e=`_${this.manifestType_}_throughput`;s.searchParams.set(e,n)}return s.toString()}
/**
   * Assigns the current steering manifest properties and to the SteeringManifest object
   *
   * @param {Object} steeringJson the raw JSON steering manifest
   */assignSteeringProperties_(e){this.steeringManifest.version=e.VERSION;if(!this.steeringManifest.version){this.logger_(`manifest version is ${e.VERSION}, which is not supported.`);this.trigger("error");return}this.steeringManifest.ttl=e.TTL;this.steeringManifest.reloadUri=e["RELOAD-URI"];this.steeringManifest.priority=e["PATHWAY-PRIORITY"]||e["SERVICE-LOCATION-PRIORITY"];this.steeringManifest.pathwayClones=e["PATHWAY-CLONES"];this.nextPathwayClones=this.steeringManifest.pathwayClones;if(!this.availablePathways_.size){this.logger_("There are no available pathways for content steering. Ending content steering.");this.trigger("error");this.dispose()}const chooseNextPathway=e=>{for(const t of e)if(this.availablePathways_.has(t))return t;return[...this.availablePathways_][0]};const t=chooseNextPathway(this.steeringManifest.priority);if(this.currentPathway!==t){this.currentPathway=t;this.trigger("content-steering")}}getPathway(){return this.currentPathway||this.defaultPathway}
/**
   * Chooses the manifest request URI based on proxy URIs and server URLs.
   * Also accounts for exclusion on certain manifest URIs.
   *
   * @param {string} reloadUri the base uri before parameters
   *
   * @return {string} the final URI for the request to the manifest server.
   */getRequestURI(e){if(!e)return null;const isExcluded=e=>this.excludedSteeringManifestURLs.has(e);if(this.proxyServerUrl_){const t=this.setProxyServerUrl_(e);if(!isExcluded(t))return t}const t=this.setSteeringParams_(e);return isExcluded(t)?null:t}
/**
   * Start the timeout for re-requesting the steering manifest at the TTL interval.
   *
   * @param {number} ttl time in seconds of the timeout. Defaults to the
   *        ttl interval in the steering manifest
   */startTTLTimeout_(t=this.steeringManifest.ttl){const s=t*1e3;this.ttlTimeout_=e.setTimeout((()=>{this.requestSteeringManifest()}),s)}clearTTLTimeout_(){e.clearTimeout(this.ttlTimeout_);this.ttlTimeout_=null}abort(){this.request_&&this.request_.abort();this.request_=null}dispose(){this.off("content-steering");this.off("error");this.abort();this.clearTTLTimeout_();this.currentPathway=null;this.defaultPathway=null;this.queryBeforeStart=null;this.proxyServerUrl_=null;this.manifestType_=null;this.ttlTimeout_=null;this.request_=null;this.excludedSteeringManifestURLs=new Set;this.availablePathways_=new Set;this.steeringManifest=new SteeringManifest}
/**
   * adds a pathway to the available pathways set
   *
   * @param {string} pathway the pathway string to add
   */addAvailablePathway(e){e&&this.availablePathways_.add(e)}clearAvailablePathways(){this.availablePathways_.clear()}excludePathway(e){return this.availablePathways_.delete(e)}
/**
   * Checks the refreshed DASH manifest content steering tag for changes.
   *
   * @param {string} baseURL new steering tag on DASH manifest refresh
   * @param {Object} newTag the new tag to check for changes
   * @return a true or false whether the new tag has different values
   */didDASHTagChange(e,t){return!t&&this.steeringManifest.reloadUri||t&&(At(e,t.serverURL)!==this.steeringManifest.reloadUri||t.defaultServiceLocation!==this.defaultPathway||t.queryBeforeStart!==this.queryBeforeStart||t.proxyServerURL!==this.proxyServerUrl_)}getAvailablePathways(){return this.availablePathways_}}const debounce=(e,t)=>{let s=null;return(...i)=>{clearTimeout(s);s=setTimeout((()=>{e.apply(null,i)}),t)}};const cs=10;let us;const ps=["mediaRequests","mediaRequestsAborted","mediaRequestsTimedout","mediaRequestsErrored","mediaTransferDuration","mediaBytesTransferred","mediaAppends"];const sumLoaderStat=function(e){return this.audioSegmentLoader_[e]+this.mainSegmentLoader_[e]};const shouldSwitchToMedia=function({currentPlaylist:e,buffered:t,currentTime:s,nextPlaylist:i,bufferLowWaterLine:n,bufferHighWaterLine:r,duration:a,bufferBasedABR:o,log:l}){if(!i){videojs.log.warn("We received no playlist to switch to. Please check your stream.");return false}const d=`allowing switch ${e&&e.id||"null"} -> ${i.id}`;if(!e){l(`${d} as current playlist is not set`);return true}if(i.id===e.id)return false;const h=Boolean(findRange(t,s).length);if(!e.endList){if(!h&&typeof e.partTargetDuration==="number"){l(`not ${d} as current playlist is live llhls, but currentTime isn't in buffered.`);return false}l(`${d} as current playlist is live`);return true}const c=timeAheadOf(t,s);const u=o?$t.EXPERIMENTAL_MAX_BUFFER_LOW_WATER_LINE:$t.MAX_BUFFER_LOW_WATER_LINE;if(a<u){l(`${d} as duration < max low water line (${a} < ${u})`);return true}const p=i.attributes.BANDWIDTH;const m=e.attributes.BANDWIDTH;if(p<m&&(!o||c<r)){let e=`${d} as next bandwidth < current bandwidth (${p} < ${m})`;o&&(e+=` and forwardBuffer < bufferHighWaterLine (${c} < ${r})`);l(e);return true}if((!o||p>m)&&c>=n){let e=`${d} as forwardBuffer >= bufferLowWaterLine (${c} >= ${n})`;o&&(e+=` and next bandwidth > current bandwidth (${p} > ${m})`);l(e);return true}l(`not ${d} as no switching criteria met`);return false};class PlaylistController extends videojs.EventTarget{constructor(t){super();this.fastQualityChange_=debounce(this.fastQualityChange_.bind(this),100);const{src:s,withCredentials:i,tech:n,bandwidth:r,externVhs:a,useCueTags:o,playlistExclusionDuration:l,enableLowInitialPlaylist:d,sourceType:h,cacheEncryptionKeys:c,bufferBasedABR:u,leastPixelDiffSelector:p,captionServices:m,experimentalUseMMS:f}=t;if(!s)throw new Error("A non-empty playlist URL or JSON manifest string is required");let{maxPlaylistRetries:g}=t;g!==null&&typeof g!=="undefined"||(g=Infinity);us=a;this.bufferBasedABR=Boolean(u);this.leastPixelDiffSelector=Boolean(p);this.withCredentials=i;this.tech_=n;this.vhs_=n.vhs;this.player_=t.player_;this.sourceType_=h;this.useCueTags_=o;this.playlistExclusionDuration=l;this.maxPlaylistRetries=g;this.enableLowInitialPlaylist=d;this.usingManagedMediaSource_=false;if(this.useCueTags_){this.cueTagsTrack_=this.tech_.addTextTrack("metadata","ad-cues");this.cueTagsTrack_.inBandMetadataTrackDispatchType=""}this.requestOptions_={withCredentials:i,maxPlaylistRetries:g,timeout:null};this.on("error",this.pauseLoading);this.mediaTypes_=createMediaTypes();if(f&&e.ManagedMediaSource){this.tech_.el_.disableRemotePlayback=true;this.mediaSource=new e.ManagedMediaSource;this.usingManagedMediaSource_=true;videojs.log("Using ManagedMediaSource")}else e.MediaSource&&(this.mediaSource=new e.MediaSource);this.handleDurationChange_=this.handleDurationChange_.bind(this);this.handleSourceOpen_=this.handleSourceOpen_.bind(this);this.handleSourceEnded_=this.handleSourceEnded_.bind(this);this.load=this.load.bind(this);this.pause=this.pause.bind(this);this.mediaSource.addEventListener("durationchange",this.handleDurationChange_);this.mediaSource.addEventListener("sourceopen",this.handleSourceOpen_);this.mediaSource.addEventListener("sourceended",this.handleSourceEnded_);this.mediaSource.addEventListener("startstreaming",this.load);this.mediaSource.addEventListener("endstreaming",this.pause);this.seekable_=createTimeRanges();this.hasPlayed_=false;this.syncController_=new SyncController(t);this.segmentMetadataTrack_=n.addRemoteTextTrack({kind:"metadata",label:"segment-metadata"},false).track;this.decrypter_=new as;this.sourceUpdater_=new SourceUpdater(this.mediaSource);this.inbandTextTracks_={};this.timelineChangeController_=new TimelineChangeController;this.keyStatusMap_=new Map;const y={vhs:this.vhs_,parse708captions:t.parse708captions,useDtsForTimestampOffset:t.useDtsForTimestampOffset,captionServices:m,mediaSource:this.mediaSource,currentTime:this.tech_.currentTime.bind(this.tech_),seekable:()=>this.seekable(),seeking:()=>this.tech_.seeking(),duration:()=>this.duration(),hasPlayed:()=>this.hasPlayed_,goalBufferLength:()=>this.goalBufferLength(),bandwidth:r,syncController:this.syncController_,decrypter:this.decrypter_,sourceType:this.sourceType_,inbandTextTracks:this.inbandTextTracks_,cacheEncryptionKeys:c,sourceUpdater:this.sourceUpdater_,timelineChangeController:this.timelineChangeController_,exactManifestTimings:t.exactManifestTimings,addMetadataToTextTrack:this.addMetadataToTextTrack.bind(this)};this.mainPlaylistLoader_=this.sourceType_==="dash"?new DashPlaylistLoader(s,this.vhs_,merge(this.requestOptions_,{addMetadataToTextTrack:this.addMetadataToTextTrack.bind(this)})):new PlaylistLoader(s,this.vhs_,merge(this.requestOptions_,{addDateRangesToTextTrack:this.addDateRangesToTextTrack_.bind(this)}));this.setupMainPlaylistLoaderListeners_();this.mainSegmentLoader_=new SegmentLoader(merge(y,{segmentMetadataTrack:this.segmentMetadataTrack_,loaderType:"main"}),t);this.audioSegmentLoader_=new SegmentLoader(merge(y,{loaderType:"audio"}),t);this.subtitleSegmentLoader_=new VTTSegmentLoader(merge(y,{loaderType:"vtt",featuresNativeTextTracks:this.tech_.featuresNativeTextTracks,loadVttJs:()=>new Promise(((e,t)=>{function onLoad(){n.off("vttjserror",onError);e()}function onError(){n.off("vttjsloaded",onLoad);t()}n.one("vttjsloaded",onLoad);n.one("vttjserror",onError);n.addWebVttScript_()}))}),t);const getBandwidth=()=>this.mainSegmentLoader_.bandwidth;this.contentSteeringController_=new ContentSteeringController(this.vhs_.xhr,getBandwidth);this.setupSegmentLoaderListeners_();if(this.bufferBasedABR){this.mainPlaylistLoader_.one("loadedplaylist",(()=>this.startABRTimer_()));this.tech_.on("pause",(()=>this.stopABRTimer_()));this.tech_.on("play",(()=>this.startABRTimer_()))}ps.forEach((e=>{this[e+"_"]=sumLoaderStat.bind(this,e)}));this.logger_=logger("pc");this.triggeredFmp4Usage=false;if(this.tech_.preload()==="none"){this.loadOnPlay_=()=>{this.loadOnPlay_=null;this.mainPlaylistLoader_.load()};this.tech_.one("play",this.loadOnPlay_)}else this.mainPlaylistLoader_.load();this.timeToLoadedData__=-1;this.mainAppendsToLoadedData__=-1;this.audioAppendsToLoadedData__=-1;const _=this.tech_.preload()==="none"?"play":"loadstart";this.tech_.one(_,(()=>{const e=Date.now();this.tech_.one("loadeddata",(()=>{this.timeToLoadedData__=Date.now()-e;this.mainAppendsToLoadedData__=this.mainSegmentLoader_.mediaAppends;this.audioAppendsToLoadedData__=this.audioSegmentLoader_.mediaAppends}))}))}mainAppendsToLoadedData_(){return this.mainAppendsToLoadedData__}audioAppendsToLoadedData_(){return this.audioAppendsToLoadedData__}appendsToLoadedData_(){const e=this.mainAppendsToLoadedData_();const t=this.audioAppendsToLoadedData_();return e===-1||t===-1?-1:e+t}timeToLoadedData_(){return this.timeToLoadedData__}
/**
   * Run selectPlaylist and switch to the new playlist if we should
   *
   * @param {string} [reason=abr] a reason for why the ABR check is made
   * @private
   */checkABR_(e="abr"){const t=this.selectPlaylist();t&&this.shouldSwitchToMedia_(t)&&this.switchMedia_(t,e)}switchMedia_(e,t,s){const i=this.media();const n=i&&(i.id||i.uri);const r=e&&(e.id||e.uri);if(n&&n!==r){this.logger_(`switch media ${n} -> ${r} from ${t}`);const s={renditionInfo:{id:r,bandwidth:e.attributes.BANDWIDTH,resolution:e.attributes.RESOLUTION,codecs:e.attributes.CODECS},cause:t};this.trigger({type:"renditionselected",metadata:s});this.tech_.trigger({type:"usage",name:`vhs-rendition-change-${t}`})}this.mainPlaylistLoader_.media(e,s)}switchMediaForDASHContentSteering_(){["AUDIO","SUBTITLES","CLOSED-CAPTIONS"].forEach((e=>{const t=this.mediaTypes_[e];const s=t?t.activeGroup():null;const i=this.contentSteeringController_.getPathway();if(s&&i){const t=s.length?s[0].playlists:s.playlists;const n=t.filter((e=>e.attributes.serviceLocation===i));n.length&&this.mediaTypes_[e].activePlaylistLoader.media(n[0])}}))}startABRTimer_(){this.stopABRTimer_();this.abrTimer_=e.setInterval((()=>this.checkABR_()),250)}stopABRTimer_(){if(!this.tech_.scrubbing||!this.tech_.scrubbing()){e.clearInterval(this.abrTimer_);this.abrTimer_=null}}getAudioTrackPlaylists_(){const e=this.main();const t=e&&e.playlists||[];if(!e||!e.mediaGroups||!e.mediaGroups.AUDIO)return t;const s=e.mediaGroups.AUDIO;const i=Object.keys(s);let n;if(Object.keys(this.mediaTypes_.AUDIO.groups).length)n=this.mediaTypes_.AUDIO.activeTrack();else{const e=s.main||i.length&&s[i[0]];for(const t in e)if(e[t].default){n={label:t};break}}if(!n)return t;const r=[];for(const t in s)if(s[t][n.label]){const i=s[t][n.label];if(i.playlists&&i.playlists.length)r.push.apply(r,i.playlists);else if(i.uri)r.push(i);else if(e.playlists.length)for(let s=0;s<e.playlists.length;s++){const i=e.playlists[s];i.attributes&&i.attributes.AUDIO&&i.attributes.AUDIO===t&&r.push(i)}}return r.length?r:t}setupMainPlaylistLoaderListeners_(){this.mainPlaylistLoader_.on("loadedmetadata",(()=>{const e=this.mainPlaylistLoader_.media();const t=e.targetDuration*1.5*1e3;isLowestEnabledRendition(this.mainPlaylistLoader_.main,this.mainPlaylistLoader_.media())?this.requestOptions_.timeout=0:this.requestOptions_.timeout=t;if(e.endList&&this.tech_.preload()!=="none"){this.mainSegmentLoader_.playlist(e,this.requestOptions_);this.mainSegmentLoader_.load()}setupMediaGroups({sourceType:this.sourceType_,segmentLoaders:{AUDIO:this.audioSegmentLoader_,SUBTITLES:this.subtitleSegmentLoader_,main:this.mainSegmentLoader_},tech:this.tech_,requestOptions:this.requestOptions_,mainPlaylistLoader:this.mainPlaylistLoader_,vhs:this.vhs_,main:this.main(),mediaTypes:this.mediaTypes_,excludePlaylist:this.excludePlaylist.bind(this)});this.triggerPresenceUsage_(this.main(),e);this.setupFirstPlay();!this.mediaTypes_.AUDIO.activePlaylistLoader||this.mediaTypes_.AUDIO.activePlaylistLoader.media()?this.trigger("selectedinitialmedia"):this.mediaTypes_.AUDIO.activePlaylistLoader.one("loadedmetadata",(()=>{this.trigger("selectedinitialmedia")}))}));this.mainPlaylistLoader_.on("loadedplaylist",(()=>{this.loadOnPlay_&&this.tech_.off("play",this.loadOnPlay_);let e=this.mainPlaylistLoader_.media();if(!e){this.attachContentSteeringListeners_();this.initContentSteeringController_();this.excludeUnsupportedVariants_();let t;this.enableLowInitialPlaylist&&(t=this.selectInitialPlaylist());t||(t=this.selectPlaylist());if(!t||!this.shouldSwitchToMedia_(t))return;this.initialMedia_=t;this.switchMedia_(this.initialMedia_,"initial");const s=this.sourceType_==="vhs-json"&&this.initialMedia_.segments;if(!s)return;e=this.initialMedia_}this.handleUpdatedMediaPlaylist(e)}));this.mainPlaylistLoader_.on("error",(()=>{const e=this.mainPlaylistLoader_.error;this.excludePlaylist({playlistToExclude:e.playlist,error:e})}));this.mainPlaylistLoader_.on("mediachanging",(()=>{this.mainSegmentLoader_.abort();this.mainSegmentLoader_.pause()}));this.mainPlaylistLoader_.on("mediachange",(()=>{const e=this.mainPlaylistLoader_.media();const t=e.targetDuration*1.5*1e3;isLowestEnabledRendition(this.mainPlaylistLoader_.main,this.mainPlaylistLoader_.media())?this.requestOptions_.timeout=0:this.requestOptions_.timeout=t;this.sourceType_==="dash"&&this.mainPlaylistLoader_.isPaused&&this.mainPlaylistLoader_.load();this.mainSegmentLoader_.pause();this.mainSegmentLoader_.playlist(e,this.requestOptions_);this.waitingForFastQualityPlaylistReceived_?this.runFastQualitySwitch_():this.mainSegmentLoader_.load();this.tech_.trigger({type:"mediachange",bubbles:true})}));this.mainPlaylistLoader_.on("playlistunchanged",(()=>{const e=this.mainPlaylistLoader_.media();if(e.lastExcludeReason_==="playlist-unchanged")return;const t=this.stuckAtPlaylistEnd_(e);if(t){this.excludePlaylist({error:{message:"Playlist no longer updating.",reason:"playlist-unchanged"}});this.tech_.trigger("playliststuck")}}));this.mainPlaylistLoader_.on("renditiondisabled",(()=>{this.tech_.trigger({type:"usage",name:"vhs-rendition-disabled"})}));this.mainPlaylistLoader_.on("renditionenabled",(()=>{this.tech_.trigger({type:"usage",name:"vhs-rendition-enabled"})}));const e=["manifestrequeststart","manifestrequestcomplete","manifestparsestart","manifestparsecomplete","playlistrequeststart","playlistrequestcomplete","playlistparsestart","playlistparsecomplete","renditiondisabled","renditionenabled"];e.forEach((e=>{this.mainPlaylistLoader_.on(e,(e=>{this.player_.trigger(n({},e))}))}))}
/**
   * Given an updated media playlist (whether it was loaded for the first time, or
   * refreshed for live playlists), update any relevant properties and state to reflect
   * changes in the media that should be accounted for (e.g., cues and duration).
   *
   * @param {Object} updatedPlaylist the updated media playlist object
   *
   * @private
   */handleUpdatedMediaPlaylist(e){this.useCueTags_&&this.updateAdCues_(e);this.mainSegmentLoader_.pause();this.mainSegmentLoader_.playlist(e,this.requestOptions_);this.waitingForFastQualityPlaylistReceived_&&this.runFastQualitySwitch_();this.updateDuration(!e.endList);if(!this.tech_.paused()){this.mainSegmentLoader_.load();this.audioSegmentLoader_&&this.audioSegmentLoader_.load()}}triggerPresenceUsage_(e,t){const s=e.mediaGroups||{};let i=true;const n=Object.keys(s.AUDIO);for(const e in s.AUDIO)for(const t in s.AUDIO[e]){const n=s.AUDIO[e][t];n.uri||(i=false)}i&&this.tech_.trigger({type:"usage",name:"vhs-demuxed"});Object.keys(s.SUBTITLES).length&&this.tech_.trigger({type:"usage",name:"vhs-webvtt"});us.Playlist.isAes(t)&&this.tech_.trigger({type:"usage",name:"vhs-aes"});n.length&&Object.keys(s.AUDIO[n[0]]).length>1&&this.tech_.trigger({type:"usage",name:"vhs-alternate-audio"});this.useCueTags_&&this.tech_.trigger({type:"usage",name:"vhs-playlist-cue-tags"})}shouldSwitchToMedia_(e){const t=this.mainPlaylistLoader_.media()||this.mainPlaylistLoader_.pendingMedia_;const s=this.tech_.currentTime();const i=this.bufferLowWaterLine();const n=this.bufferHighWaterLine();const r=this.tech_.buffered();return shouldSwitchToMedia({buffered:r,currentTime:s,currentPlaylist:t,nextPlaylist:e,bufferLowWaterLine:i,bufferHighWaterLine:n,duration:this.duration(),bufferBasedABR:this.bufferBasedABR,log:this.logger_})}setupSegmentLoaderListeners_(){this.mainSegmentLoader_.on("bandwidthupdate",(()=>{this.checkABR_("bandwidthupdate");this.tech_.trigger("bandwidthupdate")}));this.mainSegmentLoader_.on("timeout",(()=>{this.bufferBasedABR&&this.mainSegmentLoader_.load()}));this.bufferBasedABR||this.mainSegmentLoader_.on("progress",(()=>{this.trigger("progress")}));this.mainSegmentLoader_.on("error",(()=>{const e=this.mainSegmentLoader_.error();this.excludePlaylist({playlistToExclude:e.playlist,error:e})}));this.mainSegmentLoader_.on("appenderror",(()=>{this.error=this.mainSegmentLoader_.error_;this.trigger("error")}));this.mainSegmentLoader_.on("syncinfoupdate",(()=>{this.onSyncInfoUpdate_()}));this.mainSegmentLoader_.on("timestampoffset",(()=>{this.tech_.trigger({type:"usage",name:"vhs-timestamp-offset"})}));this.audioSegmentLoader_.on("syncinfoupdate",(()=>{this.onSyncInfoUpdate_()}));this.audioSegmentLoader_.on("appenderror",(()=>{this.error=this.audioSegmentLoader_.error_;this.trigger("error")}));this.mainSegmentLoader_.on("ended",(()=>{this.logger_("main segment loader ended");this.onEndOfStream()}));this.timelineChangeController_.on("audioTimelineBehind",(()=>{const e=this.audioSegmentLoader_.pendingSegment_;if(!e||!e.segment||!e.segment.syncInfo)return;const t=e.segment.syncInfo.end+.01;this.tech_.setCurrentTime(t)}));this.timelineChangeController_.on("fixBadTimelineChange",(()=>{this.logger_("Fix bad timeline change. Restarting al segment loaders...");this.mainSegmentLoader_.pause();this.mainSegmentLoader_.resetEverything();if(this.mediaTypes_.AUDIO.activePlaylistLoader){this.audioSegmentLoader_.pause();this.audioSegmentLoader_.resetEverything()}if(this.mediaTypes_.SUBTITLES.activePlaylistLoader){this.subtitleSegmentLoader_.pause();this.subtitleSegmentLoader_.resetEverything()}this.load()}));this.mainSegmentLoader_.on("earlyabort",(e=>{if(!this.bufferBasedABR){this.delegateLoaders_("all",["abort"]);this.excludePlaylist({error:{message:"Aborted early because there isn't enough bandwidth to complete the request without rebuffering."},playlistExclusionDuration:cs})}}));const updateCodecs=()=>{if(!this.sourceUpdater_.hasCreatedSourceBuffers())return this.tryToCreateSourceBuffers_();const e=this.getCodecsOrExclude_();e&&this.sourceUpdater_.addOrChangeSourceBuffers(e)};this.mainSegmentLoader_.on("trackinfo",updateCodecs);this.audioSegmentLoader_.on("trackinfo",updateCodecs);this.mainSegmentLoader_.on("fmp4",(()=>{if(!this.triggeredFmp4Usage){this.tech_.trigger({type:"usage",name:"vhs-fmp4"});this.triggeredFmp4Usage=true}}));this.audioSegmentLoader_.on("fmp4",(()=>{if(!this.triggeredFmp4Usage){this.tech_.trigger({type:"usage",name:"vhs-fmp4"});this.triggeredFmp4Usage=true}}));this.audioSegmentLoader_.on("ended",(()=>{this.logger_("audioSegmentLoader ended");this.onEndOfStream()}));const e=["segmentselected","segmentloadstart","segmentloaded","segmentkeyloadstart","segmentkeyloadcomplete","segmentdecryptionstart","segmentdecryptioncomplete","segmenttransmuxingstart","segmenttransmuxingcomplete","segmenttransmuxingtrackinfoavailable","segmenttransmuxingtiminginfoavailable","segmentappendstart","appendsdone","bandwidthupdated","timelinechange","codecschange"];e.forEach((e=>{this.mainSegmentLoader_.on(e,(e=>{this.player_.trigger(n({},e))}));this.audioSegmentLoader_.on(e,(e=>{this.player_.trigger(n({},e))}));this.subtitleSegmentLoader_.on(e,(e=>{this.player_.trigger(n({},e))}))}))}mediaSecondsLoaded_(){return Math.max(this.audioSegmentLoader_.mediaSecondsLoaded+this.mainSegmentLoader_.mediaSecondsLoaded)}load(){this.mainSegmentLoader_.load();this.mediaTypes_.AUDIO.activePlaylistLoader&&this.audioSegmentLoader_.load();this.mediaTypes_.SUBTITLES.activePlaylistLoader&&this.subtitleSegmentLoader_.load()}pause(){this.mainSegmentLoader_.pause();this.mediaTypes_.AUDIO.activePlaylistLoader&&this.audioSegmentLoader_.pause();this.mediaTypes_.SUBTITLES.activePlaylistLoader&&this.subtitleSegmentLoader_.pause()}fastQualityChange_(e=this.selectPlaylist()){if(e&&e===this.mainPlaylistLoader_.media())this.logger_("skipping fastQualityChange because new media is same as old");else{this.switchMedia_(e,"fast-quality");this.waitingForFastQualityPlaylistReceived_=true}}runFastQualitySwitch_(){this.waitingForFastQualityPlaylistReceived_=false;this.mainSegmentLoader_.pause();this.mainSegmentLoader_.resetEverything();if(this.mediaTypes_.AUDIO.activePlaylistLoader){this.audioSegmentLoader_.pause();this.audioSegmentLoader_.resetEverything()}if(this.mediaTypes_.SUBTITLES.activePlaylistLoader){this.subtitleSegmentLoader_.pause();this.subtitleSegmentLoader_.resetEverything()}this.load()}play(){if(this.setupFirstPlay())return;this.tech_.ended()&&this.tech_.setCurrentTime(0);this.hasPlayed_&&this.load();const e=this.tech_.seekable();return this.tech_.duration()===Infinity&&this.tech_.currentTime()<e.start(0)?this.tech_.setCurrentTime(e.end(e.length-1)):void 0}setupFirstPlay(){const e=this.mainPlaylistLoader_.media();if(!e||this.tech_.paused()||this.hasPlayed_)return false;if(!e.endList||e.start){const t=this.seekable();if(!t.length)return false;const s=t.end(0);let i=s;if(e.start){const n=e.start.timeOffset;i=n<0?Math.max(s+n,t.start(0)):Math.min(s,n)}this.trigger("firstplay");this.tech_.setCurrentTime(i)}this.hasPlayed_=true;this.load();return true}handleSourceOpen_(){this.tryToCreateSourceBuffers_();if(this.tech_.autoplay()){const e=this.tech_.play();typeof e!=="undefined"&&typeof e.then==="function"&&e.then(null,(e=>{}))}this.trigger("sourceopen")}handleSourceEnded_(){if(!this.inbandTextTracks_.metadataTrack_)return;const e=this.inbandTextTracks_.metadataTrack_.cues;if(!e||!e.length)return;const t=this.duration();e[e.length-1].endTime=isNaN(t)||Math.abs(t)===Infinity?Number.MAX_VALUE:t}handleDurationChange_(){this.tech_.trigger("durationchange")}
/**
   * Calls endOfStream on the media source when all active stream types have called
   * endOfStream
   *
   * @param {string} streamType
   *        Stream type of the segment loader that called endOfStream
   * @private
   */onEndOfStream(){let e=this.mainSegmentLoader_.ended_;if(this.mediaTypes_.AUDIO.activePlaylistLoader){const t=this.mainSegmentLoader_.getCurrentMediaInfo_();e=!t||t.hasVideo?e&&this.audioSegmentLoader_.ended_:this.audioSegmentLoader_.ended_}if(e){this.stopABRTimer_();this.sourceUpdater_.endOfStream()}}
/**
   * Check if a playlist has stopped being updated
   *
   * @param {Object} playlist the media playlist object
   * @return {boolean} whether the playlist has stopped being updated or not
   */stuckAtPlaylistEnd_(e){const t=this.seekable();if(!t.length)return false;const s=this.syncController_.getExpiredTime(e,this.duration());if(s===null)return false;const i=us.Playlist.playlistEnd(e,s);const n=this.tech_.currentTime();const r=this.tech_.buffered();if(!r.length)return i-n<=Ot;const a=r.end(r.length-1);return a-n<=Ot&&i-a<=Ot}
/**
   * Exclude a playlist for a set amount of time, making it unavailable for selection by
   * the rendition selection algorithm, then force a new playlist (rendition) selection.
   *
   * @param {Object=} playlistToExclude
   *                  the playlist to exclude, defaults to the currently selected playlist
   * @param {Object=} error
   *                  an optional error
   * @param {number=} playlistExclusionDuration
   *                  an optional number of seconds to exclude the playlist
   */excludePlaylist({playlistToExclude:e=this.mainPlaylistLoader_.media(),error:t={},playlistExclusionDuration:s}){e=e||this.mainPlaylistLoader_.media();s=s||t.playlistExclusionDuration||this.playlistExclusionDuration;if(!e){this.error=t;this.mediaSource.readyState!=="open"?this.trigger("error"):this.sourceUpdater_.endOfStream("network");return}e.playlistErrors_++;const i=this.mainPlaylistLoader_.main.playlists;const n=i.filter(isEnabled);const r=n.length===1&&n[0]===e;if(i.length===1&&s!==Infinity){videojs.log.warn(`Problem encountered with playlist ${e.id}. Trying again since it is the only playlist.`);this.tech_.trigger("retryplaylist");return this.mainPlaylistLoader_.load(r)}if(r){if(this.main().contentSteering){const t=this.pathwayAttribute_(e);const s=this.contentSteeringController_.steeringManifest.ttl*1e3;this.contentSteeringController_.excludePathway(t);this.excludeThenChangePathway_();setTimeout((()=>{this.contentSteeringController_.addAvailablePathway(t)}),s);return}let t=false;i.forEach((s=>{if(s===e)return;const i=s.excludeUntil;if(typeof i!=="undefined"&&i!==Infinity){t=true;delete s.excludeUntil}}));if(t){videojs.log.warn("Removing other playlists from the exclusion list because the last rendition is about to be excluded.");this.tech_.trigger("retryplaylist")}}let a;a=e.playlistErrors_>this.maxPlaylistRetries?Infinity:Date.now()+s*1e3;e.excludeUntil=a;t.reason&&(e.lastExcludeReason_=t.reason);this.tech_.trigger("excludeplaylist");this.tech_.trigger({type:"usage",name:"vhs-rendition-excluded"});const o=this.selectPlaylist();if(!o){this.error="Playback cannot continue. No available working or supported playlists.";this.trigger("error");return}const l=t.internal?this.logger_:videojs.log.warn;const d=t.message?" "+t.message:"";l(`${t.internal?"Internal problem":"Problem"} encountered with playlist ${e.id}.${d} Switching to playlist ${o.id}.`);o.attributes.AUDIO!==e.attributes.AUDIO&&this.delegateLoaders_("audio",["abort","pause"]);o.attributes.SUBTITLES!==e.attributes.SUBTITLES&&this.delegateLoaders_("subtitle",["abort","pause"]);this.delegateLoaders_("main",["abort","pause"]);const h=o.targetDuration/2*1e3||5e3;const c=typeof o.lastRequest==="number"&&Date.now()-o.lastRequest<=h;return this.switchMedia_(o,"exclude",r||c)}pauseLoading(){this.delegateLoaders_("all",["abort","pause"]);this.stopABRTimer_()}
/**
   * Call a set of functions in order on playlist loaders, segment loaders,
   * or both types of loaders.
   *
   * @param {string} filter
   *        Filter loaders that should call fnNames using a string. Can be:
   *        * all - run on all loaders
   *        * audio - run on all audio loaders
   *        * subtitle - run on all subtitle loaders
   *        * main - run on the main loaders
   *
   * @param {Array|string} fnNames
   *        A string or array of function names to call.
   */delegateLoaders_(e,t){const s=[];const i=e==="all";(i||e==="main")&&s.push(this.mainPlaylistLoader_);const n=[];(i||e==="audio")&&n.push("AUDIO");if(i||e==="subtitle"){n.push("CLOSED-CAPTIONS");n.push("SUBTITLES")}n.forEach((e=>{const t=this.mediaTypes_[e]&&this.mediaTypes_[e].activePlaylistLoader;t&&s.push(t)}));["main","audio","subtitle"].forEach((t=>{const i=this[`${t}SegmentLoader_`];!i||e!==t&&e!=="all"||s.push(i)}));s.forEach((e=>t.forEach((t=>{typeof e[t]==="function"&&e[t]()}))))}
/**
   * set the current time on all segment loaders
   *
   * @param {TimeRange} currentTime the current time to set
   * @return {TimeRange} the current time
   */setCurrentTime(e){const t=findRange(this.tech_.buffered(),e);if(!(this.mainPlaylistLoader_&&this.mainPlaylistLoader_.media()))return 0;if(!this.mainPlaylistLoader_.media().segments)return 0;if(t&&t.length)return e;this.mainSegmentLoader_.pause();this.mainSegmentLoader_.resetEverything();if(this.mediaTypes_.AUDIO.activePlaylistLoader){this.audioSegmentLoader_.pause();this.audioSegmentLoader_.resetEverything()}if(this.mediaTypes_.SUBTITLES.activePlaylistLoader){this.subtitleSegmentLoader_.pause();this.subtitleSegmentLoader_.resetEverything()}this.load()}duration(){if(!this.mainPlaylistLoader_)return 0;const e=this.mainPlaylistLoader_.media();return e?e.endList?this.mediaSource?this.mediaSource.duration:us.Playlist.duration(e):Infinity:0}seekable(){return this.seekable_}getSeekableRange_(e,t){const s=e.media();if(!s)return null;const i=this.syncController_.getMediaSequenceSync(t);if(i&&i.isReliable){const e=i.start;const t=i.end;if(!isFinite(e)||!isFinite(t))return null;const n=us.Playlist.liveEdgeDelay(this.mainPlaylistLoader_.main,s);const r=Math.max(0,t-n);return r<e?null:createTimeRanges([[e,r]])}const n=this.syncController_.getExpiredTime(s,this.duration());if(n===null)return null;const r=us.Playlist.seekable(s,n,us.Playlist.liveEdgeDelay(this.mainPlaylistLoader_.main,s));return r.length?r:null}computeFinalSeekable_(e,t){if(!t)return e;const s=e.start(0);const i=e.end(0);const n=t.start(0);const r=t.end(0);return n>i||s>r?e:createTimeRanges([[Math.max(s,n),Math.min(i,r)]])}onSyncInfoUpdate_(){if(!this.mainPlaylistLoader_)return;const e=this.getSeekableRange_(this.mainPlaylistLoader_,"main");if(!e)return;let t;if(this.mediaTypes_.AUDIO.activePlaylistLoader){t=this.getSeekableRange_(this.mediaTypes_.AUDIO.activePlaylistLoader,"audio");if(!t)return}const s=this.seekable_;this.seekable_=this.computeFinalSeekable_(e,t);if(!this.seekable_)return;if(s&&s.length&&this.seekable_.length&&s.start(0)===this.seekable_.start(0)&&s.end(0)===this.seekable_.end(0))return;this.logger_(`seekable updated [${printableRange(this.seekable_)}]`);const i={seekableRanges:this.seekable_};this.trigger({type:"seekablerangeschanged",metadata:i});this.tech_.trigger("seekablechanged")}updateDuration(e){if(this.updateDuration_){this.mediaSource.removeEventListener("sourceopen",this.updateDuration_);this.updateDuration_=null}if(this.mediaSource.readyState!=="open"){this.updateDuration_=this.updateDuration.bind(this,e);this.mediaSource.addEventListener("sourceopen",this.updateDuration_);return}if(e){const e=this.seekable();if(!e.length)return;(isNaN(this.mediaSource.duration)||this.mediaSource.duration<e.end(e.length-1))&&this.sourceUpdater_.setDuration(e.end(e.length-1));return}const t=this.tech_.buffered();let s=us.Playlist.duration(this.mainPlaylistLoader_.media());t.length>0&&(s=Math.max(s,t.end(t.length-1)));this.mediaSource.duration!==s&&this.sourceUpdater_.setDuration(s)}dispose(){this.trigger("dispose");this.decrypter_.terminate();this.mainPlaylistLoader_.dispose();this.mainSegmentLoader_.dispose();this.contentSteeringController_.dispose();this.keyStatusMap_.clear();this.loadOnPlay_&&this.tech_.off("play",this.loadOnPlay_);["AUDIO","SUBTITLES"].forEach((e=>{const t=this.mediaTypes_[e].groups;for(const e in t)t[e].forEach((e=>{e.playlistLoader&&e.playlistLoader.dispose()}))}));this.audioSegmentLoader_.dispose();this.subtitleSegmentLoader_.dispose();this.sourceUpdater_.dispose();this.timelineChangeController_.dispose();this.stopABRTimer_();this.updateDuration_&&this.mediaSource.removeEventListener("sourceopen",this.updateDuration_);this.mediaSource.removeEventListener("durationchange",this.handleDurationChange_);this.mediaSource.removeEventListener("sourceopen",this.handleSourceOpen_);this.mediaSource.removeEventListener("sourceended",this.handleSourceEnded_);this.off()}main(){return this.mainPlaylistLoader_.main}media(){return this.mainPlaylistLoader_.media()||this.initialMedia_}areMediaTypesKnown_(){const e=!!this.mediaTypes_.AUDIO.activePlaylistLoader;const t=!!this.mainSegmentLoader_.getCurrentMediaInfo_();const s=!e||!!this.audioSegmentLoader_.getCurrentMediaInfo_();return!(!t||!s)}getCodecsOrExclude_(){const e={main:this.mainSegmentLoader_.getCurrentMediaInfo_()||{},audio:this.audioSegmentLoader_.getCurrentMediaInfo_()||{}};const t=this.mainSegmentLoader_.getPendingSegmentPlaylist()||this.media();e.video=e.main;const s=codecsForPlaylist(this.main(),t);const i={};const n=!!this.mediaTypes_.AUDIO.activePlaylistLoader;e.main.hasVideo&&(i.video=s.video||e.main.videoCodec||u);e.main.isMuxed&&(i.video+=`,${s.audio||e.main.audioCodec||p}`);if(e.main.hasAudio&&!e.main.isMuxed||e.audio.hasAudio||n){i.audio=s.audio||e.main.audioCodec||e.audio.audioCodec||p;e.audio.isFmp4=e.main.hasAudio&&!e.main.isMuxed?e.main.isFmp4:e.audio.isFmp4}if(!i.audio&&!i.video){this.excludePlaylist({playlistToExclude:t,error:{message:"Could not determine codecs for playlist."},playlistExclusionDuration:Infinity});return}const supportFunction=(e,t)=>e?m(t,this.usingManagedMediaSource_):f(t);const r={};let a;["video","audio"].forEach((function(t){if(i.hasOwnProperty(t)&&!supportFunction(e[t].isFmp4,i[t])){const s=e[t].isFmp4?"browser":"muxer";r[s]=r[s]||[];r[s].push(i[t]);t==="audio"&&(a=s)}}));if(n&&a&&t.attributes.AUDIO){const e=t.attributes.AUDIO;this.main().playlists.forEach((s=>{const i=s.attributes&&s.attributes.AUDIO;i===e&&s!==t&&(s.excludeUntil=Infinity)}));this.logger_(`excluding audio group ${e} as ${a} does not support codec(s): "${i.audio}"`)}if(!Object.keys(r).length){if(this.sourceUpdater_.hasCreatedSourceBuffers()&&!this.sourceUpdater_.canChangeType()){const e=[];["video","audio"].forEach((t=>{const s=(l(this.sourceUpdater_.codecs[t]||"")[0]||{}).type;const n=(l(i[t]||"")[0]||{}).type;s&&n&&s.toLowerCase()!==n.toLowerCase()&&e.push(`"${this.sourceUpdater_.codecs[t]}" -> "${i[t]}"`)}));if(e.length){this.excludePlaylist({playlistToExclude:t,error:{message:`Codec switching not supported: ${e.join(", ")}.`,internal:true},playlistExclusionDuration:Infinity});return}}return i}{const e=Object.keys(r).reduce(((e,t)=>{e&&(e+=", ");e+=`${t} does not support codec(s): "${r[t].join(",")}"`;return e}),"")+".";this.excludePlaylist({playlistToExclude:t,error:{internal:true,message:e},playlistExclusionDuration:Infinity})}}tryToCreateSourceBuffers_(){if(this.mediaSource.readyState!=="open"||this.sourceUpdater_.hasCreatedSourceBuffers())return;if(!this.areMediaTypesKnown_())return;const e=this.getCodecsOrExclude_();if(!e)return;this.sourceUpdater_.createSourceBuffers(e);const t=[e.video,e.audio].filter(Boolean).join(",");this.excludeIncompatibleVariants_(t)}excludeUnsupportedVariants_(){const e=this.main().playlists;const t=[];Object.keys(e).forEach((s=>{const i=e[s];if(t.indexOf(i.id)!==-1)return;t.push(i.id);const n=codecsForPlaylist(this.main,i);const r=[];!n.audio||f(n.audio)||m(n.audio,this.usingManagedMediaSource_)||r.push(`audio codec ${n.audio}`);!n.video||f(n.video)||m(n.video,this.usingManagedMediaSource_)||r.push(`video codec ${n.video}`);n.text&&n.text==="stpp.ttml.im1t"&&r.push(`text codec ${n.text}`);if(r.length){i.excludeUntil=Infinity;this.logger_(`excluding ${i.id} for unsupported: ${r.join(", ")}`)}}))}
/**
   * Exclude playlists that are known to be codec or
   * stream-incompatible with the SourceBuffer configuration. For
   * instance, Media Source Extensions would cause the video element to
   * stall waiting for video data if you switched from a variant with
   * video and audio to an audio-only one.
   *
   * @param {Object} media a media playlist compatible with the current
   * set of SourceBuffers. Variants in the current main playlist that
   * do not appear to have compatible codec or stream configurations
   * will be excluded from the default playlist selection algorithm
   * indefinitely.
   * @private
   */excludeIncompatibleVariants_(e){const t=[];const s=this.main().playlists;const i=unwrapCodecList(l(e));const n=codecCount(i);const r=i.video&&l(i.video)[0]||null;const a=i.audio&&l(i.audio)[0]||null;Object.keys(s).forEach((e=>{const i=s[e];if(t.indexOf(i.id)!==-1||i.excludeUntil===Infinity)return;t.push(i.id);const o=[];const d=codecsForPlaylist(this.mainPlaylistLoader_.main,i);const h=codecCount(d);if(d.audio||d.video){h!==n&&o.push(`codec count "${h}" !== "${n}"`);if(!this.sourceUpdater_.canChangeType()){const e=d.video&&l(d.video)[0]||null;const t=d.audio&&l(d.audio)[0]||null;e&&r&&e.type.toLowerCase()!==r.type.toLowerCase()&&o.push(`video codec "${e.type}" !== "${r.type}"`);t&&a&&t.type.toLowerCase()!==a.type.toLowerCase()&&o.push(`audio codec "${t.type}" !== "${a.type}"`)}if(o.length){i.excludeUntil=Infinity;this.logger_(`excluding ${i.id}: ${o.join(" && ")}`)}}}))}updateAdCues_(e){let t=0;const s=this.seekable();s.length&&(t=s.start(0));updateAdCues(e,this.cueTagsTrack_,t)}goalBufferLength(){const e=this.tech_.currentTime();const t=$t.GOAL_BUFFER_LENGTH;const s=$t.GOAL_BUFFER_LENGTH_RATE;const i=Math.max(t,$t.MAX_GOAL_BUFFER_LENGTH);return Math.min(t+e*s,i)}bufferLowWaterLine(){const e=this.tech_.currentTime();const t=$t.BUFFER_LOW_WATER_LINE;const s=$t.BUFFER_LOW_WATER_LINE_RATE;const i=Math.max(t,$t.MAX_BUFFER_LOW_WATER_LINE);const n=Math.max(t,$t.EXPERIMENTAL_MAX_BUFFER_LOW_WATER_LINE);return Math.min(t+e*s,this.bufferBasedABR?n:i)}bufferHighWaterLine(){return $t.BUFFER_HIGH_WATER_LINE}addDateRangesToTextTrack_(e){createMetadataTrackIfNotExists(this.inbandTextTracks_,"com.apple.streaming",this.tech_);addDateRangeMetadata({inbandTextTracks:this.inbandTextTracks_,dateRanges:e})}addMetadataToTextTrack(e,t,s){const i=this.sourceUpdater_.videoBuffer?this.sourceUpdater_.videoTimestampOffset():this.sourceUpdater_.audioTimestampOffset();createMetadataTrackIfNotExists(this.inbandTextTracks_,e,this.tech_);addMetadata({inbandTextTracks:this.inbandTextTracks_,metadataArray:t,timestampOffset:i,videoDuration:s})}
/**
   * Utility for getting the pathway or service location from an HLS or DASH playlist.
   *
   * @param {Object} playlist for getting pathway from.
   * @return the pathway attribute of a playlist
   */pathwayAttribute_(e){return e.attributes["PATHWAY-ID"]||e.attributes.serviceLocation}initContentSteeringController_(){const e=this.main();if(e.contentSteering){for(const t of e.playlists)this.contentSteeringController_.addAvailablePathway(this.pathwayAttribute_(t));this.contentSteeringController_.assignTagProperties(e.uri,e.contentSteering);this.contentSteeringController_.queryBeforeStart?this.contentSteeringController_.requestSteeringManifest(true):this.tech_.one("canplay",(()=>{this.contentSteeringController_.requestSteeringManifest()}))}}resetContentSteeringController_(){this.contentSteeringController_.clearAvailablePathways();this.contentSteeringController_.dispose();this.initContentSteeringController_()}attachContentSteeringListeners_(){this.contentSteeringController_.on("content-steering",this.excludeThenChangePathway_.bind(this));const e=["contentsteeringloadstart","contentsteeringloadcomplete","contentsteeringparsed"];e.forEach((e=>{this.contentSteeringController_.on(e,(e=>{this.trigger(n({},e))}))}));this.sourceType_==="dash"&&this.mainPlaylistLoader_.on("loadedplaylist",(()=>{const e=this.main();const t=this.contentSteeringController_.didDASHTagChange(e.uri,e.contentSteering);const didPathwaysChange=()=>{const t=this.contentSteeringController_.getAvailablePathways();const s=[];for(const i of e.playlists){const e=i.attributes.serviceLocation;if(e){s.push(e);if(!t.has(e))return true}}return!(s.length||!t.size)};(t||didPathwaysChange())&&this.resetContentSteeringController_()}))}excludeThenChangePathway_(){const e=this.contentSteeringController_.getPathway();if(!e)return;this.handlePathwayClones_();const t=this.main();const s=t.playlists;const i=new Set;let n=false;Object.keys(s).forEach((t=>{const r=s[t];const a=this.pathwayAttribute_(r);const o=a&&e!==a;const l=r.excludeUntil===Infinity&&r.lastExcludeReason_==="content-steering";if(l&&!o){delete r.excludeUntil;delete r.lastExcludeReason_;n=true}const d=!r.excludeUntil&&r.excludeUntil!==Infinity;const h=!i.has(r.id)&&o&&d;if(h){i.add(r.id);r.excludeUntil=Infinity;r.lastExcludeReason_="content-steering";this.logger_(`excluding ${r.id} for ${r.lastExcludeReason_}`)}}));this.contentSteeringController_.manifestType_==="DASH"&&Object.keys(this.mediaTypes_).forEach((t=>{const s=this.mediaTypes_[t];if(s.activePlaylistLoader){const t=s.activePlaylistLoader.media_;t&&t.attributes.serviceLocation!==e&&(n=true)}}));n&&this.changeSegmentPathway_()}handlePathwayClones_(){const e=this.main();const t=e.playlists;const s=this.contentSteeringController_.currentPathwayClones;const i=this.contentSteeringController_.nextPathwayClones;const n=s&&s.size||i&&i.size;if(n){for(const[e,t]of s.entries()){const s=i.get(e);if(!s){this.mainPlaylistLoader_.updateOrDeleteClone(t);this.contentSteeringController_.excludePathway(e)}}for(const[e,n]of i.entries()){const i=s.get(e);if(i){if(!this.equalPathwayClones_(i,n)){this.mainPlaylistLoader_.updateOrDeleteClone(n,true);this.contentSteeringController_.addAvailablePathway(e)}}else{const s=t.filter((e=>e.attributes["PATHWAY-ID"]===n["BASE-ID"]));s.forEach((e=>{this.mainPlaylistLoader_.addClonePathway(n,e)}));this.contentSteeringController_.addAvailablePathway(e)}}this.contentSteeringController_.currentPathwayClones=new Map(JSON.parse(JSON.stringify([...i])))}}
/**
   * Determines whether two pathway clone objects are equivalent.
   *
   * @param {Object} a The first pathway clone object.
   * @param {Object} b The second pathway clone object.
   * @return {boolean} True if the pathway clone objects are equal, false otherwise.
   */equalPathwayClones_(e,t){if(e["BASE-ID"]!==t["BASE-ID"]||e.ID!==t.ID||e["URI-REPLACEMENT"].HOST!==t["URI-REPLACEMENT"].HOST)return false;const s=e["URI-REPLACEMENT"].PARAMS;const i=t["URI-REPLACEMENT"].PARAMS;for(const e in s)if(s[e]!==i[e])return false;for(const e in i)if(s[e]!==i[e])return false;return true}changeSegmentPathway_(){const e=this.selectPlaylist();this.pauseLoading();this.contentSteeringController_.manifestType_==="DASH"&&this.switchMediaForDASHContentSteering_();this.switchMedia_(e,"content-steering")}excludeNonUsablePlaylistsByKeyId_(){if(!this.mainPlaylistLoader_||!this.mainPlaylistLoader_.main)return;let e=0;const t="non-usable";this.mainPlaylistLoader_.main.playlists.forEach((s=>{const i=this.mainPlaylistLoader_.getKeyIdSet(s);i&&i.size&&i.forEach((i=>{const n="usable";const r=this.keyStatusMap_.has(i)&&this.keyStatusMap_.get(i)===n;const a=s.lastExcludeReason_===t&&s.excludeUntil===Infinity;if(r){if(r&&a){delete s.excludeUntil;delete s.lastExcludeReason_;this.logger_(`enabling playlist ${s.id} because key ID ${i} is ${n}`)}}else{if(s.excludeUntil!==Infinity&&s.lastExcludeReason_!==t){s.excludeUntil=Infinity;s.lastExcludeReason_=t;this.logger_(`excluding playlist ${s.id} because the key ID ${i} doesn't exist in the keyStatusMap or is not ${n}`)}e++}}))}));e>=this.mainPlaylistLoader_.main.playlists.length&&this.mainPlaylistLoader_.main.playlists.forEach((e=>{const s=e&&e.attributes&&e.attributes.RESOLUTION&&e.attributes.RESOLUTION.height<720;const i=e.excludeUntil===Infinity&&e.lastExcludeReason_===t;if(s&&i){delete e.excludeUntil;videojs.log.warn(`enabling non-HD playlist ${e.id} because all playlists were excluded due to ${t} key IDs`)}}))}
/**
   * Adds a keystatus to the keystatus map, tries to convert to string if necessary.
   *
   * @param {any} keyId the keyId to add a status for
   * @param {string} status the status of the keyId
   */addKeyStatus_(e,t){const s=typeof e==="string";const i=s?e:bufferToHexString(e);const n=i.slice(0,32).toLowerCase();this.logger_(`KeyStatus '${t}' with key ID ${n} added to the keyStatusMap`);this.keyStatusMap_.set(n,t)}
/**
   * Utility function for adding key status to the keyStatusMap and filtering usable encrypted playlists.
   *
   * @param {any} keyId the keyId from the keystatuschange event
   * @param {string} status the key status string
   */updatePlaylistByKeyStatus(e,t){this.addKeyStatus_(e,t);this.waitingForFastQualityPlaylistReceived_||this.excludeNonUsableThenChangePlaylist_();this.mainPlaylistLoader_.off("loadedplaylist",this.excludeNonUsableThenChangePlaylist_.bind(this));this.mainPlaylistLoader_.on("loadedplaylist",this.excludeNonUsableThenChangePlaylist_.bind(this))}excludeNonUsableThenChangePlaylist_(){this.excludeNonUsablePlaylistsByKeyId_();this.fastQualityChange_()}}
/**
 * Returns a function that acts as the Enable/disable playlist function.
 *
 * @param {PlaylistLoader} loader - The main playlist loader
 * @param {string} playlistID - id of the playlist
 * @param {Function} changePlaylistFn - A function to be called after a
 * playlist's enabled-state has been changed. Will NOT be called if a
 * playlist's enabled-state is unchanged
 * @param {boolean=} enable - Value to set the playlist enabled-state to
 * or if undefined returns the current enabled-state for the playlist
 * @return {Function} Function for setting/getting enabled
 */const enableFunction=(e,t,s)=>i=>{const n=e.main.playlists[t];const r=isIncompatible(n);const a=isEnabled(n);if(typeof i==="undefined")return a;i?delete n.disabled:n.disabled=true;const o={renditionInfo:{id:t,bandwidth:n.attributes.BANDWIDTH,resolution:n.attributes.RESOLUTION,codecs:n.attributes.CODECS},cause:"fast-quality"};if(i!==a&&!r)if(i){s(n);e.trigger({type:"renditionenabled",metadata:o})}else e.trigger({type:"renditiondisabled",metadata:o});return i};class Representation{constructor(e,t,s){const{playlistController_:i}=e;const n=i.fastQualityChange_.bind(i);if(t.attributes){const e=t.attributes.RESOLUTION;this.width=e&&e.width;this.height=e&&e.height;this.bandwidth=t.attributes.BANDWIDTH;this.frameRate=t.attributes["FRAME-RATE"]}this.codecs=codecsForPlaylist(i.main(),t);this.playlist=t;this.id=s;this.enabled=enableFunction(e.playlists,t.id,n)}}
/**
 * A mixin function that adds the `representations` api to an instance
 * of the VhsHandler class
 *
 * @param {VhsHandler} vhsHandler - An instance of VhsHandler to add the
 * representation API into
 */const renditionSelectionMixin=function(e){e.representations=()=>{const t=e.playlistController_.main();const s=isAudioOnly(t)?e.playlistController_.getAudioTrackPlaylists_():t.playlists;return s?s.filter((e=>!isIncompatible(e))).map(((t,s)=>new Representation(e,t,t.id))):[]}};const ms=["seeking","seeked","pause","playing","error"];class PlaybackWatcher extends videojs.EventTarget{
/**
   * Represents an PlaybackWatcher object.
   *
   * @class
   * @param {Object} options an object that includes the tech and settings
   */
constructor(t){super();this.playlistController_=t.playlistController;this.tech_=t.tech;this.seekable=t.seekable;this.allowSeeksWithinUnsafeLiveWindow=t.allowSeeksWithinUnsafeLiveWindow;this.liveRangeSafeTimeDelta=t.liveRangeSafeTimeDelta;this.media=t.media;this.playedRanges_=[];this.consecutiveUpdates=0;this.lastRecordedTime=null;this.checkCurrentTimeTimeout_=null;this.logger_=logger("PlaybackWatcher");this.logger_("initialize");const playHandler=()=>this.monitorCurrentTime_();const canPlayHandler=()=>this.monitorCurrentTime_();const waitingHandler=()=>this.techWaiting_();const cancelTimerHandler=()=>this.resetTimeUpdate_();const s=this.playlistController_;const i=["main","subtitle","audio"];const n={};i.forEach((e=>{n[e]={reset:()=>this.resetSegmentDownloads_(e),updateend:()=>this.checkSegmentDownloads_(e)};s[`${e}SegmentLoader_`].on("appendsdone",n[e].updateend);s[`${e}SegmentLoader_`].on("playlistupdate",n[e].reset);this.tech_.on(["seeked","seeking"],n[e].reset)}));const setSeekingHandlers=e=>{["main","audio"].forEach((t=>{s[`${t}SegmentLoader_`][e]("appended",this.seekingAppendCheck_)}))};this.seekingAppendCheck_=()=>{if(this.fixesBadSeeks_()){this.consecutiveUpdates=0;this.lastRecordedTime=this.tech_.currentTime();setSeekingHandlers("off")}};this.clearSeekingAppendCheck_=()=>setSeekingHandlers("off");this.watchForBadSeeking_=()=>{this.clearSeekingAppendCheck_();setSeekingHandlers("on")};this.tech_.on("seeked",this.clearSeekingAppendCheck_);this.tech_.on("seeking",this.watchForBadSeeking_);this.tech_.on("waiting",waitingHandler);this.tech_.on(ms,cancelTimerHandler);this.tech_.on("canplay",canPlayHandler);this.tech_.one("play",playHandler);this.dispose=()=>{this.clearSeekingAppendCheck_();this.logger_("dispose");this.tech_.off("waiting",waitingHandler);this.tech_.off(ms,cancelTimerHandler);this.tech_.off("canplay",canPlayHandler);this.tech_.off("play",playHandler);this.tech_.off("seeking",this.watchForBadSeeking_);this.tech_.off("seeked",this.clearSeekingAppendCheck_);i.forEach((e=>{s[`${e}SegmentLoader_`].off("appendsdone",n[e].updateend);s[`${e}SegmentLoader_`].off("playlistupdate",n[e].reset);this.tech_.off(["seeked","seeking"],n[e].reset)}));this.checkCurrentTimeTimeout_&&e.clearTimeout(this.checkCurrentTimeTimeout_);this.resetTimeUpdate_()}}monitorCurrentTime_(){this.checkCurrentTime_();this.checkCurrentTimeTimeout_&&e.clearTimeout(this.checkCurrentTimeTimeout_);this.checkCurrentTimeTimeout_=e.setTimeout(this.monitorCurrentTime_.bind(this),250)}
/**
   * Reset stalled download stats for a specific type of loader
   *
   * @param {string} type
   *        The segment loader type to check.
   *
   * @listens SegmentLoader#playlistupdate
   * @listens Tech#seeking
   * @listens Tech#seeked
   */resetSegmentDownloads_(e){const t=this.playlistController_[`${e}SegmentLoader_`];this[`${e}StalledDownloads_`]>0&&this.logger_(`resetting possible stalled download count for ${e} loader`);this[`${e}StalledDownloads_`]=0;this[`${e}Buffered_`]=t.buffered_()}
/**
   * Checks on every segment `appendsdone` to see
   * if segment appends are making progress. If they are not
   * and we are still downloading bytes. We exclude the playlist.
   *
   * @param {string} type
   *        The segment loader type to check.
   *
   * @listens SegmentLoader#appendsdone
   */checkSegmentDownloads_(e){const t=this.playlistController_;const s=t[`${e}SegmentLoader_`];const i=s.buffered_();const n=isRangeDifferent(this[`${e}Buffered_`],i);this[`${e}Buffered_`]=i;if(n){const s={bufferedRanges:i};t.trigger({type:"bufferedrangeschanged",metadata:s});this.resetSegmentDownloads_(e)}else{this[`${e}StalledDownloads_`]++;this.logger_(`found #${this[`${e}StalledDownloads_`]} ${e} appends that did not increase buffer (possible stalled download)`,{playlistId:s.playlist_&&s.playlist_.id,buffered:timeRangesToArray(i)});if(!(this[`${e}StalledDownloads_`]<10)){this.logger_(`${e} loader stalled download exclusion`);this.resetSegmentDownloads_(e);this.tech_.trigger({type:"usage",name:`vhs-${e}-download-exclusion`});e!=="subtitle"&&t.excludePlaylist({error:{message:`Excessive ${e} segment downloading detected.`},playlistExclusionDuration:Infinity})}}}checkCurrentTime_(){if(this.tech_.paused()||this.tech_.seeking())return;const e=this.tech_.currentTime();const t=this.tech_.buffered();if(this.lastRecordedTime===e&&(!t.length||e+Ot>=t.end(t.length-1)))return this.techWaiting_();if(this.consecutiveUpdates>=5&&e===this.lastRecordedTime){this.consecutiveUpdates++;this.waiting_()}else if(e===this.lastRecordedTime)this.consecutiveUpdates++;else{this.playedRanges_.push(createTimeRanges([this.lastRecordedTime,e]));const t={playedRanges:this.playedRanges_};this.playlistController_.trigger({type:"playedrangeschanged",metadata:t});this.consecutiveUpdates=0;this.lastRecordedTime=e}}resetTimeUpdate_(){this.consecutiveUpdates=0}fixesBadSeeks_(){const e=this.tech_.seeking();if(!e)return false;const t=this.seekable();const s=this.tech_.currentTime();const i=this.afterSeekableWindow_(t,s,this.media(),this.allowSeeksWithinUnsafeLiveWindow);let n;if(i){const e=t.end(t.length-1);n=e}if(this.beforeSeekableWindow_(t,s)){const e=t.start(0);n=e+(e===t.end(0)?0:Ot)}if(typeof n!=="undefined"){this.logger_(`Trying to seek outside of seekable at time ${s} with seekable range ${printableRange(t)}. Seeking to ${n}.`);this.tech_.setCurrentTime(n);return true}const r=this.playlistController_.sourceUpdater_;const a=this.tech_.buffered();const o=r.audioBuffer?r.audioBuffered():null;const l=r.videoBuffer?r.videoBuffered():null;const d=this.media();const h=d.partTargetDuration?d.partTargetDuration:2*(d.targetDuration-Dt);const c=[o,l];for(let e=0;e<c.length;e++){if(!c[e])continue;const t=timeAheadOf(c[e],s);if(t<h)return false}const u=findNextRange(a,s);if(u.length===0)return false;n=u.start(0)+Ot;this.logger_(`Buffered region starts (${u.start(0)})  just beyond seek point (${s}). Seeking to ${n}.`);this.tech_.setCurrentTime(n);return true}waiting_(){if(this.techWaiting_())return;const e=this.tech_.currentTime();const t=this.tech_.buffered();const s=findRange(t,e);if(s.length&&e+3<=s.end(0)){this.resetTimeUpdate_();this.tech_.setCurrentTime(e);this.logger_(`Stopped at ${e} while inside a buffered region [${s.start(0)} -> ${s.end(0)}]. Attempting to resume playback by seeking to the current time.`);this.tech_.trigger({type:"usage",name:"vhs-unknown-waiting"})}else;}techWaiting_(){const e=this.seekable();const t=this.tech_.currentTime();if(this.tech_.seeking())return true;if(this.beforeSeekableWindow_(e,t)){const s=e.end(e.length-1);this.logger_(`Fell out of live window at time ${t}. Seeking to live point (seekable end) ${s}`);this.resetTimeUpdate_();this.tech_.setCurrentTime(s);this.tech_.trigger({type:"usage",name:"vhs-live-resync"});return true}const s=this.tech_.vhs.playlistController_.sourceUpdater_;const i=this.tech_.buffered();const n=this.videoUnderflow_({audioBuffered:s.audioBuffered(),videoBuffered:s.videoBuffered(),currentTime:t});if(n){this.resetTimeUpdate_();this.tech_.setCurrentTime(t);this.tech_.trigger({type:"usage",name:"vhs-video-underflow"});return true}const r=findNextRange(i,t);if(r.length>0){this.logger_(`Stopped at ${t} and seeking to ${r.start(0)}`);this.resetTimeUpdate_();this.skipTheGap_(t);return true}return false}afterSeekableWindow_(e,t,s,i=false){if(!e.length)return false;let n=e.end(e.length-1)+Ot;const r=!s.endList;const a=typeof s.partTargetDuration==="number";r&&(a||i)&&(n=e.end(e.length-1)+s.targetDuration*3);return t>n}beforeSeekableWindow_(e,t){return!!(e.length&&e.start(0)>0&&t<e.start(0)-this.liveRangeSafeTimeDelta)}videoUnderflow_({videoBuffered:e,audioBuffered:t,currentTime:s}){if(!e)return;let i;if(e.length&&t.length){const n=findRange(e,s-3);const r=findRange(e,s);const a=findRange(t,s);a.length&&!r.length&&n.length&&(i={start:n.end(0),end:a.end(0)})}else{const t=findNextRange(e,s);t.length||(i=this.gapFromVideoUnderflow_(e,s))}if(i){this.logger_(`Encountered a gap in video from ${i.start} to ${i.end}. Seeking to current time ${s}`);return true}return false}skipTheGap_(e){const t=this.tech_.buffered();const s=this.tech_.currentTime();const i=findNextRange(t,s);this.resetTimeUpdate_();if(i.length===0||s!==e)return;this.logger_("skipTheGap_:","currentTime:",s,"scheduled currentTime:",e,"nextRange start:",i.start(0));this.tech_.setCurrentTime(i.start(0)+Dt);const n={gapInfo:{from:s,to:i.start(0)}};this.playlistController_.trigger({type:"gapjumped",metadata:n});this.tech_.trigger({type:"usage",name:"vhs-gap-skip"})}gapFromVideoUnderflow_(e,t){const s=findGaps(e);for(let e=0;e<s.length;e++){const i=s.start(e);const n=s.end(e);if(t-i<4&&t-i>2)return{start:i,end:n}}return null}}const fs={errorInterval:30,getSource(e){const t=this.tech({IWillNotUseThisInPlugins:true});const s=t.currentSource_||this.currentSource();return e(s)}};
/**
 * Main entry point for the plugin
 *
 * @param {Player} player a reference to a videojs Player instance
 * @param {Object} [options] an object with plugin options
 * @private
 */const initPlugin=function(e,t){let s=0;let i=0;const n=merge(fs,t);e.ready((()=>{e.trigger({type:"usage",name:"vhs-error-reload-initialized"})}));const loadedMetadataHandler=function(){i&&e.currentTime(i)};
/**
   * Set the source on the player element, play, and seek if necessary
   *
   * @param {Object} sourceObj An object specifying the source url and mime-type to play
   * @private
   */const setSource=function(t){if(t!==null&&t!==void 0){i=e.duration()!==Infinity&&e.currentTime()||0;e.one("loadedmetadata",loadedMetadataHandler);e.src(t);e.trigger({type:"usage",name:"vhs-error-reload"});e.play()}};const errorHandler=function(){if(Date.now()-s<n.errorInterval*1e3)e.trigger({type:"usage",name:"vhs-error-reload-canceled"});else{if(n.getSource&&typeof n.getSource==="function"){s=Date.now();return n.getSource.call(e,setSource)}videojs.log.error("ERROR: reloadSourceOnError - The option getSource must be a function!")}};const cleanupEvents=function(){e.off("loadedmetadata",loadedMetadataHandler);e.off("error",errorHandler);e.off("dispose",cleanupEvents)};
/**
   * Cleanup before re-initializing the plugin
   *
   * @param {Object} [newOptions] an object with plugin options
   * @private
   */const reinitPlugin=function(t){cleanupEvents();initPlugin(e,t)};e.on("error",errorHandler);e.on("dispose",cleanupEvents);e.reloadSourceOnError=reinitPlugin};
/**
 * Reload the source when an error is detected as long as there
 * wasn't an error previously within the last 30 seconds
 *
 * @param {Object} [options] an object with plugin options
 */const reloadSourceOnError=function(e){initPlugin(this,e)};var gs="3.16.2";var ys="7.1.0";var _s="1.3.1";var vs="7.2.0";var Ts="4.0.2";const bs={PlaylistLoader:PlaylistLoader,Playlist:Mt,utils:jt,STANDARD_PLAYLIST_SELECTOR:lastBandwidthSelector,INITIAL_PLAYLIST_SELECTOR:lowestBitrateCompatibleVariantSelector,lastBandwidthSelector:lastBandwidthSelector,movingAverageBandwidthSelector:movingAverageBandwidthSelector,comparePlaylistBandwidth:comparePlaylistBandwidth,comparePlaylistResolution:comparePlaylistResolution,xhr:xhrFactory()};Object.keys($t).forEach((e=>{Object.defineProperty(bs,e,{get(){videojs.log.warn(`using Vhs.${e} is UNSAFE be sure you know what you are doing`);return $t[e]},set(t){videojs.log.warn(`using Vhs.${e} is UNSAFE be sure you know what you are doing`);typeof t!=="number"||t<0?videojs.log.warn(`value of Vhs.${e} must be greater than or equal to 0`):$t[e]=t}})}));const Ss="videojs-vhs";
/**
 * Updates the selectedIndex of the QualityLevelList when a mediachange happens in vhs.
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to update.
 * @param {PlaylistLoader} playlistLoader PlaylistLoader containing the new media info.
 * @function handleVhsMediaChange
 */const handleVhsMediaChange=function(e,t){const s=t.media();let i=-1;for(let t=0;t<e.length;t++)if(e[t].id===s.id){i=t;break}e.selectedIndex_=i;e.trigger({selectedIndex:i,type:"change"})};
/**
 * Adds quality levels to list once playlist metadata is available
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to attach events to.
 * @param {Object} vhs Vhs object to listen to for media events.
 * @function handleVhsLoadedMetadata
 */const handleVhsLoadedMetadata=function(e,t){t.representations().forEach((t=>{e.addQualityLevel(t)}));handleVhsMediaChange(e,t.playlists)};bs.canPlaySource=function(){return videojs.log.warn("VHS is no longer a tech. Please remove it from your player's techOrder.")};const emeKeySystems=(e,t,s)=>{if(!e)return e;let i={};t&&t.attributes&&t.attributes.CODECS&&(i=unwrapCodecList(l(t.attributes.CODECS)));s&&s.attributes&&s.attributes.CODECS&&(i.audio=s.attributes.CODECS);const n=c(i.video);const r=c(i.audio);const a={};for(const s in e){a[s]={};r&&(a[s].audioContentType=r);n&&(a[s].videoContentType=n);t.contentProtection&&t.contentProtection[s]&&t.contentProtection[s].pssh&&(a[s].pssh=t.contentProtection[s].pssh);typeof e[s]==="string"&&(a[s].url=e[s])}return merge(e,a)};
/**
 * @typedef {Object} KeySystems
 *
 * keySystems configuration for https://github.com/videojs/videojs-contrib-eme
 * Note: not all options are listed here.
 *
 * @property {Uint8Array} [pssh]
 *           Protection System Specific Header
 */
/**
 * Goes through all the playlists and collects an array of KeySystems options objects
 * containing each playlist's keySystems and their pssh values, if available.
 *
 * @param {Object[]} playlists
 *        The playlists to look through
 * @param {string[]} keySystems
 *        The keySystems to collect pssh values for
 *
 * @return {KeySystems[]}
 *         An array of KeySystems objects containing available key systems and their
 *         pssh values
 */const getAllPsshKeySystemsOptions=(e,t)=>e.reduce(((e,s)=>{if(!s.contentProtection)return e;const i=t.reduce(((e,t)=>{const i=s.contentProtection[t];i&&i.pssh&&(e[t]={pssh:i.pssh});return e}),{});Object.keys(i).length&&e.push(i);return e}),[]);
/**
 * Returns a promise that waits for the
 * [eme plugin](https://github.com/videojs/videojs-contrib-eme) to create a key session.
 *
 * Works around https://bugs.chromium.org/p/chromium/issues/detail?id=895449 in non-IE11
 * browsers.
 *
 * As per the above ticket, this is particularly important for Chrome, where, if
 * unencrypted content is appended before encrypted content and the key session has not
 * been created, a MEDIA_ERR_DECODE will be thrown once the encrypted content is reached
 * during playback.
 *
 * @param {Object} player
 *        The player instance
 * @param {Object[]} sourceKeySystems
 *        The key systems options from the player source
 * @param {Object} [audioMedia]
 *        The active audio media playlist (optional)
 * @param {Object[]} mainPlaylists
 *        The playlists found on the main playlist object
 *
 * @return {Object}
 *         Promise that resolves when the key session has been created
 */const waitForKeySessionCreation=({player:e,sourceKeySystems:t,audioMedia:s,mainPlaylists:i})=>{if(!e.eme.initializeMediaKeys)return Promise.resolve();const n=s?i.concat([s]):i;const r=getAllPsshKeySystemsOptions(n,Object.keys(t));const a=[];const o=[];r.forEach((t=>{o.push(new Promise(((t,s)=>{e.tech_.one("keysessioncreated",t)})));a.push(new Promise(((s,i)=>{e.eme.initializeMediaKeys({keySystems:t},(e=>{e?i(e):s()}))})))}));return Promise.race([Promise.all(a),Promise.race(o)])};
/**
 * If the [eme](https://github.com/videojs/videojs-contrib-eme) plugin is available, and
 * there are keySystems on the source, sets up source options to prepare the source for
 * eme.
 *
 * @param {Object} player
 *        The player instance
 * @param {Object[]} sourceKeySystems
 *        The key systems options from the player source
 * @param {Object} media
 *        The active media playlist
 * @param {Object} [audioMedia]
 *        The active audio media playlist (optional)
 *
 * @return {boolean}
 *         Whether or not options were configured and EME is available
 */const setupEmeOptions=({player:e,sourceKeySystems:t,media:s,audioMedia:i})=>{const n=emeKeySystems(t,s,i);if(!n)return false;e.currentSource().keySystems=n;if(n&&!e.eme){videojs.log.warn("DRM encrypted source cannot be decrypted without a DRM plugin");return false}return true};const getVhsLocalStorage=()=>{if(!e.localStorage)return null;const t=e.localStorage.getItem(Ss);if(!t)return null;try{return JSON.parse(t)}catch(e){return null}};const updateVhsLocalStorage=t=>{if(!e.localStorage)return false;let s=getVhsLocalStorage();s=s?merge(s,t):t;try{e.localStorage.setItem(Ss,JSON.stringify(s))}catch(e){return false}return s};
/**
 * Parses VHS-supported media types from data URIs. See
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * for information on data URIs.
 *
 * @param {string} dataUri
 *        The data URI
 *
 * @return {string|Object}
 *         The parsed object/string, or the original string if no supported media type
 *         was found
 */const expandDataUri=e=>e.toLowerCase().indexOf("data:application/vnd.videojs.vhs+json,")===0?JSON.parse(e.substring(e.indexOf(",")+1)):e;
/**
 * Adds a request hook to an xhr object
 *
 * @param {Object} xhr object to add the onRequest hook to
 * @param {function} callback hook function for an xhr request
 */const addOnRequestHook=(e,t)=>{e._requestCallbackSet||(e._requestCallbackSet=new Set);e._requestCallbackSet.add(t)};
/**
 * Adds a response hook to an xhr object
 *
 * @param {Object} xhr object to add the onResponse hook to
 * @param {function} callback hook function for an xhr response
 */const addOnResponseHook=(e,t)=>{e._responseCallbackSet||(e._responseCallbackSet=new Set);e._responseCallbackSet.add(t)};
/**
 * Removes a request hook on an xhr object, deletes the onRequest set if empty.
 *
 * @param {Object} xhr object to remove the onRequest hook from
 * @param {function} callback hook function to remove
 */const removeOnRequestHook=(e,t)=>{if(e._requestCallbackSet){e._requestCallbackSet.delete(t);e._requestCallbackSet.size||delete e._requestCallbackSet}};
/**
 * Removes a response hook on an xhr object, deletes the onResponse set if empty.
 *
 * @param {Object} xhr object to remove the onResponse hook from
 * @param {function} callback hook function to remove
 */const removeOnResponseHook=(e,t)=>{if(e._responseCallbackSet){e._responseCallbackSet.delete(t);e._responseCallbackSet.size||delete e._responseCallbackSet}};bs.supportsNativeHls=function(){if(!t||!t.createElement)return false;const e=t.createElement("video");if(!videojs.getTech("Html5").isSupported())return false;const s=["application/vnd.apple.mpegurl","audio/mpegurl","audio/x-mpegurl","application/x-mpegurl","video/x-mpegurl","video/mpegurl","application/mpegurl"];return s.some((function(t){return/maybe|probably/i.test(e.canPlayType(t))}))}();bs.supportsNativeDash=function(){return!!(t&&t.createElement&&videojs.getTech("Html5").isSupported())&&/maybe|probably/i.test(t.createElement("video").canPlayType("application/dash+xml"))}();bs.supportsTypeNatively=e=>e==="hls"?bs.supportsNativeHls:e==="dash"&&bs.supportsNativeDash;bs.isSupported=function(){return videojs.log.warn("VHS is no longer a tech. Please remove it from your player's techOrder.")};
/**
 * A global function for setting an onRequest hook
 *
 * @param {function} callback for request modifiction
 */bs.xhr.onRequest=function(e){addOnRequestHook(bs.xhr,e)};
/**
 * A global function for setting an onResponse hook
 *
 * @param {callback} callback for response data retrieval
 */bs.xhr.onResponse=function(e){addOnResponseHook(bs.xhr,e)};
/**
 * Deletes a global onRequest callback if it exists
 *
 * @param {function} callback to delete from the global set
 */bs.xhr.offRequest=function(e){removeOnRequestHook(bs.xhr,e)};
/**
 * Deletes a global onResponse callback if it exists
 *
 * @param {function} callback to delete from the global set
 */bs.xhr.offResponse=function(e){removeOnResponseHook(bs.xhr,e)};const Cs=videojs.getComponent("Component");
/**
 * The Vhs Handler object, where we orchestrate all of the parts
 * of VHS to interact with video.js
 *
 * @class VhsHandler
 * @extends videojs.Component
 * @param {Object} source the soruce object
 * @param {Tech} tech the parent tech object
 * @param {Object} options optional and required options
 */class VhsHandler extends Cs{constructor(e,s,i){super(s,i.vhs);typeof i.initialBandwidth==="number"&&(this.options_.bandwidth=i.initialBandwidth);this.logger_=logger("VhsHandler");if(s.options_&&s.options_.playerId){const e=videojs.getPlayer(s.options_.playerId);this.player_=e}this.tech_=s;this.source_=e;this.stats={};this.ignoreNextSeekingEvent_=false;this.setOptions_();if(this.options_.overrideNative&&s.overrideNativeAudioTracks&&s.overrideNativeVideoTracks){s.overrideNativeAudioTracks(true);s.overrideNativeVideoTracks(true)}else if(this.options_.overrideNative&&(s.featuresNativeVideoTracks||s.featuresNativeAudioTracks))throw new Error("Overriding native VHS requires emulated tracks. See https://git.io/vMpjB");this.on(t,["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"],(e=>{const s=t.fullscreenElement||t.webkitFullscreenElement||t.mozFullScreenElement||t.msFullscreenElement;s&&s.contains(this.tech_.el())?this.playlistController_.fastQualityChange_():this.playlistController_.checkABR_()}));this.on(this.tech_,"seeking",(function(){this.ignoreNextSeekingEvent_?this.ignoreNextSeekingEvent_=false:this.setCurrentTime(this.tech_.currentTime())}));this.on(this.tech_,"error",(function(){this.tech_.error()&&this.playlistController_&&this.playlistController_.pauseLoading()}));this.on(this.tech_,"play",this.play)}
/**
   * Set VHS options based on options from configuration, as well as partial
   * options to be passed at a later time.
   *
   * @param {Object} options A partial chunk of config options
   */setOptions_(e={}){this.options_=merge(this.options_,e);this.options_.withCredentials=this.options_.withCredentials||false;this.options_.limitRenditionByPlayerDimensions=this.options_.limitRenditionByPlayerDimensions!==false;this.options_.useDevicePixelRatio=this.options_.useDevicePixelRatio||false;this.options_.useBandwidthFromLocalStorage=typeof this.source_.useBandwidthFromLocalStorage!=="undefined"?this.source_.useBandwidthFromLocalStorage:this.options_.useBandwidthFromLocalStorage||false;this.options_.useForcedSubtitles=this.options_.useForcedSubtitles||false;this.options_.useNetworkInformationApi=this.options_.useNetworkInformationApi||false;this.options_.useDtsForTimestampOffset=this.options_.useDtsForTimestampOffset||false;this.options_.customTagParsers=this.options_.customTagParsers||[];this.options_.customTagMappers=this.options_.customTagMappers||[];this.options_.cacheEncryptionKeys=this.options_.cacheEncryptionKeys||false;this.options_.llhls=this.options_.llhls!==false;this.options_.bufferBasedABR=this.options_.bufferBasedABR||false;typeof this.options_.playlistExclusionDuration!=="number"&&(this.options_.playlistExclusionDuration=60);if(typeof this.options_.bandwidth!=="number"&&this.options_.useBandwidthFromLocalStorage){const e=getVhsLocalStorage();if(e&&e.bandwidth){this.options_.bandwidth=e.bandwidth;this.tech_.trigger({type:"usage",name:"vhs-bandwidth-from-local-storage"})}if(e&&e.throughput){this.options_.throughput=e.throughput;this.tech_.trigger({type:"usage",name:"vhs-throughput-from-local-storage"})}}typeof this.options_.bandwidth!=="number"&&(this.options_.bandwidth=$t.INITIAL_BANDWIDTH);this.options_.enableLowInitialPlaylist=this.options_.enableLowInitialPlaylist&&this.options_.bandwidth===$t.INITIAL_BANDWIDTH;["withCredentials","useDevicePixelRatio","customPixelRatio","limitRenditionByPlayerDimensions","bandwidth","customTagParsers","customTagMappers","cacheEncryptionKeys","playlistSelector","initialPlaylistSelector","bufferBasedABR","liveRangeSafeTimeDelta","llhls","useForcedSubtitles","useNetworkInformationApi","useDtsForTimestampOffset","exactManifestTimings","leastPixelDiffSelector"].forEach((e=>{typeof this.source_[e]!=="undefined"&&(this.options_[e]=this.source_[e])}));this.limitRenditionByPlayerDimensions=this.options_.limitRenditionByPlayerDimensions;this.useDevicePixelRatio=this.options_.useDevicePixelRatio;const t=this.options_.customPixelRatio;typeof t==="number"&&t>=0&&(this.customPixelRatio=t)}setOptions(e={}){this.setOptions_(e)}
/**
   * called when player.src gets called, handle a new source
   *
   * @param {Object} src the source object to handle
   */src(t,s){if(!t)return;this.setOptions_();this.options_.src=expandDataUri(this.source_.src);this.options_.tech=this.tech_;this.options_.externVhs=bs;this.options_.sourceType=g(s);this.options_.seekTo=e=>{this.tech_.setCurrentTime(e)};this.options_.player_=this.player_;this.playlistController_=new PlaylistController(this.options_);const i=merge({liveRangeSafeTimeDelta:Ot},this.options_,{seekable:()=>this.seekable(),media:()=>this.playlistController_.media(),playlistController:this.playlistController_});this.playbackWatcher_=new PlaybackWatcher(i);this.attachStreamingEventListeners_();this.playlistController_.on("error",(()=>{const e=videojs.players[this.tech_.options_.playerId];let t=this.playlistController_.error;typeof t!=="object"||t.code?typeof t==="string"&&(t={message:t,code:3}):t.code=3;e.error(t)}));const n=this.options_.bufferBasedABR?bs.movingAverageBandwidthSelector(.55):bs.STANDARD_PLAYLIST_SELECTOR;this.playlistController_.selectPlaylist=this.selectPlaylist?this.selectPlaylist.bind(this):n.bind(this);this.playlistController_.selectInitialPlaylist=bs.INITIAL_PLAYLIST_SELECTOR.bind(this);this.playlists=this.playlistController_.mainPlaylistLoader_;this.mediaSource=this.playlistController_.mediaSource;Object.defineProperties(this,{selectPlaylist:{get(){return this.playlistController_.selectPlaylist},set(e){this.playlistController_.selectPlaylist=e.bind(this)}},throughput:{get(){return this.playlistController_.mainSegmentLoader_.throughput.rate},set(e){this.playlistController_.mainSegmentLoader_.throughput.rate=e;this.playlistController_.mainSegmentLoader_.throughput.count=1}},bandwidth:{get(){let t=this.playlistController_.mainSegmentLoader_.bandwidth;const s=e.navigator.connection||e.navigator.mozConnection||e.navigator.webkitConnection;const i=1e7;if(this.options_.useNetworkInformationApi&&s){const e=s.downlink*1e3*1e3;t=e>=i&&t>=i?Math.max(t,e):e}return t},set(e){this.playlistController_.mainSegmentLoader_.bandwidth=e;this.playlistController_.mainSegmentLoader_.throughput={rate:0,count:0}}},systemBandwidth:{get(){const e=1/(this.bandwidth||1);let t;t=this.throughput>0?1/this.throughput:0;const s=Math.floor(1/(e+t));return s},set(){videojs.log.error('The "systemBandwidth" property is read-only')}}});this.options_.bandwidth&&(this.bandwidth=this.options_.bandwidth);this.options_.throughput&&(this.throughput=this.options_.throughput);Object.defineProperties(this.stats,{bandwidth:{get:()=>this.bandwidth||0,enumerable:true},mediaRequests:{get:()=>this.playlistController_.mediaRequests_()||0,enumerable:true},mediaRequestsAborted:{get:()=>this.playlistController_.mediaRequestsAborted_()||0,enumerable:true},mediaRequestsTimedout:{get:()=>this.playlistController_.mediaRequestsTimedout_()||0,enumerable:true},mediaRequestsErrored:{get:()=>this.playlistController_.mediaRequestsErrored_()||0,enumerable:true},mediaTransferDuration:{get:()=>this.playlistController_.mediaTransferDuration_()||0,enumerable:true},mediaBytesTransferred:{get:()=>this.playlistController_.mediaBytesTransferred_()||0,enumerable:true},mediaSecondsLoaded:{get:()=>this.playlistController_.mediaSecondsLoaded_()||0,enumerable:true},mediaAppends:{get:()=>this.playlistController_.mediaAppends_()||0,enumerable:true},mainAppendsToLoadedData:{get:()=>this.playlistController_.mainAppendsToLoadedData_()||0,enumerable:true},audioAppendsToLoadedData:{get:()=>this.playlistController_.audioAppendsToLoadedData_()||0,enumerable:true},appendsToLoadedData:{get:()=>this.playlistController_.appendsToLoadedData_()||0,enumerable:true},timeToLoadedData:{get:()=>this.playlistController_.timeToLoadedData_()||0,enumerable:true},buffered:{get:()=>timeRangesToArray(this.tech_.buffered()),enumerable:true},currentTime:{get:()=>this.tech_.currentTime(),enumerable:true},currentSource:{get:()=>this.tech_.currentSource_,enumerable:true},currentTech:{get:()=>this.tech_.name_,enumerable:true},duration:{get:()=>this.tech_.duration(),enumerable:true},main:{get:()=>this.playlists.main,enumerable:true},playerDimensions:{get:()=>this.tech_.currentDimensions(),enumerable:true},seekable:{get:()=>timeRangesToArray(this.tech_.seekable()),enumerable:true},timestamp:{get:()=>Date.now(),enumerable:true},videoPlaybackQuality:{get:()=>this.tech_.getVideoPlaybackQuality(),enumerable:true}});this.tech_.one("canplay",this.playlistController_.setupFirstPlay.bind(this.playlistController_));this.tech_.on("bandwidthupdate",(()=>{this.options_.useBandwidthFromLocalStorage&&updateVhsLocalStorage({bandwidth:this.bandwidth,throughput:Math.round(this.throughput)})}));this.playlistController_.on("selectedinitialmedia",(()=>{renditionSelectionMixin(this)}));this.playlistController_.sourceUpdater_.on("createdsourcebuffers",(()=>{this.setupEme_()}));this.on(this.playlistController_,"progress",(function(){this.tech_.trigger("progress")}));this.on(this.playlistController_,"firstplay",(function(){this.ignoreNextSeekingEvent_=true}));this.setupQualityLevels_();if(this.tech_.el()){this.mediaSourceUrl_=e.URL.createObjectURL(this.playlistController_.mediaSource);if((videojs.browser.IS_ANY_SAFARI||videojs.browser.IS_IOS)&&this.options_.overrideNative&&this.options_.sourceType==="hls"&&typeof this.tech_.addSourceElement==="function"){this.tech_.addSourceElement(this.mediaSourceUrl_);this.tech_.addSourceElement(this.source_.src)}else this.tech_.src(this.mediaSourceUrl_)}}createKeySessions_(){const e=this.playlistController_.mediaTypes_.AUDIO.activePlaylistLoader;this.logger_("waiting for EME key session creation");waitForKeySessionCreation({player:this.player_,sourceKeySystems:this.source_.keySystems,audioMedia:e&&e.media(),mainPlaylists:this.playlists.main.playlists}).then((()=>{this.logger_("created EME key session");this.playlistController_.sourceUpdater_.initializedEme()})).catch((e=>{this.logger_("error while creating EME key session",e);this.player_.error({message:"Failed to initialize media keys for EME",code:3})}))}handleWaitingForKey_(){this.logger_("waitingforkey fired, attempting to create any new key sessions");this.createKeySessions_()}setupEme_(){const e=this.playlistController_.mediaTypes_.AUDIO.activePlaylistLoader;const t=setupEmeOptions({player:this.player_,sourceKeySystems:this.source_.keySystems,media:this.playlists.media(),audioMedia:e&&e.media()});this.player_.tech_.on("keystatuschange",(e=>{this.playlistController_.updatePlaylistByKeyStatus(e.keyId,e.status)}));this.handleWaitingForKey_=this.handleWaitingForKey_.bind(this);this.player_.tech_.on("waitingforkey",this.handleWaitingForKey_);t?this.createKeySessions_():this.playlistController_.sourceUpdater_.initializedEme()}setupQualityLevels_(){const e=videojs.players[this.tech_.options_.playerId];if(e&&e.qualityLevels&&!this.qualityLevels_){this.qualityLevels_=e.qualityLevels();this.playlistController_.on("selectedinitialmedia",(()=>{handleVhsLoadedMetadata(this.qualityLevels_,this)}));this.playlists.on("mediachange",(()=>{handleVhsMediaChange(this.qualityLevels_,this.playlists)}))}}static version(){return{"@videojs/http-streaming":gs,"mux.js":ys,"mpd-parser":_s,"m3u8-parser":vs,"aes-decrypter":Ts}}version(){return this.constructor.version()}canChangeType(){return SourceUpdater.canChangeType()}play(){this.playlistController_.play()}setCurrentTime(e){this.playlistController_.setCurrentTime(e)}duration(){return this.playlistController_.duration()}seekable(){return this.playlistController_.seekable()}dispose(){this.playbackWatcher_&&this.playbackWatcher_.dispose();this.playlistController_&&this.playlistController_.dispose();this.qualityLevels_&&this.qualityLevels_.dispose();this.tech_&&this.tech_.vhs&&delete this.tech_.vhs;if(this.mediaSourceUrl_&&e.URL.revokeObjectURL){e.URL.revokeObjectURL(this.mediaSourceUrl_);this.mediaSourceUrl_=null}this.tech_&&this.tech_.off("waitingforkey",this.handleWaitingForKey_);super.dispose()}convertToProgramTime(e,t){return getProgramTime({playlist:this.playlistController_.media(),time:e,callback:t})}seekToProgramTime(e,t,s=true,i=2){return seekToProgramTime({programTime:e,playlist:this.playlistController_.media(),retryCount:i,pauseAfterSeek:s,seekTo:this.options_.seekTo,tech:this.options_.tech,callback:t})}setupXhrHooks_(){
/**
     * A player function for setting an onRequest hook
     *
     * @param {function} callback for request modifiction
     */
this.xhr.onRequest=e=>{addOnRequestHook(this.xhr,e)};
/**
     * A player function for setting an onResponse hook
     *
     * @param {callback} callback for response data retrieval
     */this.xhr.onResponse=e=>{addOnResponseHook(this.xhr,e)};
/**
     * Deletes a player onRequest callback if it exists
     *
     * @param {function} callback to delete from the player set
     */this.xhr.offRequest=e=>{removeOnRequestHook(this.xhr,e)};
/**
     * Deletes a player onResponse callback if it exists
     *
     * @param {function} callback to delete from the player set
     */this.xhr.offResponse=e=>{removeOnResponseHook(this.xhr,e)};this.player_.trigger("xhr-hooks-ready")}attachStreamingEventListeners_(){const e=["seekablerangeschanged","bufferedrangeschanged","contentsteeringloadstart","contentsteeringloadcomplete","contentsteeringparsed"];const t=["gapjumped","playedrangeschanged"];e.forEach((e=>{this.playlistController_.on(e,(e=>{this.player_.trigger(n({},e))}))}));t.forEach((e=>{this.playbackWatcher_.on(e,(e=>{this.player_.trigger(n({},e))}))}))}}const ks={name:"videojs-http-streaming",VERSION:gs,canHandleSource(e,t={}){const s=merge(videojs.options,t);return!(!s.vhs.experimentalUseMMS&&!m("avc1.4d400d,mp4a.40.2",false))&&ks.canPlayType(e.type,s)},handleSource(e,t,s={}){const i=merge(videojs.options,s);t.vhs=new VhsHandler(e,t,i);t.vhs.xhr=xhrFactory();t.vhs.setupXhrHooks_();t.vhs.src(e.src,e.type);return t.vhs},canPlayType(e,t){const s=g(e);if(!s)return"";const i=ks.getOverrideNative(t);const n=bs.supportsTypeNatively(s);const r=!n||i;return r?"maybe":""},getOverrideNative(e={}){const{vhs:t={}}=e;const s=!(videojs.browser.IS_ANY_SAFARI||videojs.browser.IS_IOS);const{overrideNative:i=s}=t;return i}};const supportsNativeMediaSources=()=>m("avc1.4d400d,mp4a.40.2",true);supportsNativeMediaSources()&&videojs.getTech("Html5").registerSourceHandler(ks,0);videojs.VhsHandler=VhsHandler;videojs.VhsSourceHandler=ks;videojs.Vhs=bs;videojs.use||videojs.registerComponent("Vhs",bs);videojs.options.vhs=videojs.options.vhs||{};videojs.getPlugin&&videojs.getPlugin("reloadSourceOnError")||videojs.registerPlugin("reloadSourceOnError",reloadSourceOnError);export{videojs as default};

