/* !
 * OverlayScrollbars
 * https://github.com/KingSora/OverlayScrollbars
 *
 * Version: 1.11.0
 *
 * Copyright KingSora | Rene Haas.
 * https://github.com/KingSora
 *
 * Released under the MIT license.
 * Date: 29.02.2020
 */

(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(() => factory(global, global.document, undefined))
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(global, global.document, undefined)
  } else {
    factory(global, global.document, undefined)
  }
}(typeof window !== 'undefined' ? window : this,
  (window, document, undefined) => {
    const PLUGINNAME = 'OverlayScrollbars'
    const TYPES = {
      o: 'object',
      f: 'function',
      a: 'array',
      s: 'string',
      b: 'boolean',
      n: 'number',
      u: 'undefined',
      z: 'null'
      // d : 'date',
      // e : 'error',
      // r : 'regexp',
      // y : 'symbol'
    }
    const LEXICON = {
      c: 'class',
      s: 'style',
      i: 'id',
      l: 'length',
      p: 'prototype',
      ti: 'tabindex',
      oH: 'offsetHeight',
      cH: 'clientHeight',
      sH: 'scrollHeight',
      oW: 'offsetWidth',
      cW: 'clientWidth',
      sW: 'scrollWidth',
      hOP: 'hasOwnProperty',
      bCR: 'getBoundingClientRect'
    }
    const VENDORS = (function () {
      // https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix
      const jsCache = {}
      const cssCache = {}
      const cssPrefixes = ['-webkit-', '-moz-', '-o-', '-ms-']
      const jsPrefixes = ['WebKit', 'Moz', 'O', 'MS']
      function firstLetterToUpper(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
      }

      return {
        _cssPrefixes: cssPrefixes,
        _jsPrefixes: jsPrefixes,
        _cssProperty(name) {
          let result = cssCache[name]

          if (cssCache[LEXICON.hOP](name)) {
            return result
          }

          const uppercasedName = firstLetterToUpper(name)
          const elmStyle = document.createElement('div')[LEXICON.s]
          let resultPossibilities
          let i = 0
          let v
          let currVendorWithoutDashes

          for (; i < cssPrefixes.length; i++) {
            currVendorWithoutDashes = cssPrefixes[i].replace(/-/g, '')
            resultPossibilities = [
              name, // transition
              cssPrefixes[i] + name, // -webkit-transition
              currVendorWithoutDashes + uppercasedName, // webkitTransition
              firstLetterToUpper(currVendorWithoutDashes) + uppercasedName // WebkitTransition
            ]
            for (v = 0; v < resultPossibilities[LEXICON.l]; v++) {
              if (elmStyle[resultPossibilities[v]] !== undefined) {
                result = resultPossibilities[v]
                break
              }
            }
          }

          cssCache[name] = result
          return result
        },
        _jsAPI(name, isInterface, fallback) {
          let i = 0
          let result = jsCache[name]

          if (!jsCache[LEXICON.hOP](name)) {
            result = window[name]
            for (; i < jsPrefixes[LEXICON.l]; i++) {
              result = result || window[(isInterface ? jsPrefixes[i] : jsPrefixes[i].toLowerCase()) + firstLetterToUpper(name)]
            }
            jsCache[name] = result
          }
          return result || fallback
        }

      }
    }())
    const COMPATIBILITY = (function () {
      function windowSize(x) {
        return x ? window.innerWidth || document.documentElement[LEXICON.cW] || document.body[LEXICON.cW] : window.innerHeight || document.documentElement[LEXICON.cH] || document.body[LEXICON.cH]
      }
      function bind(func, thisObj) {
        if (typeof func !== TYPES.f) {
          throw 'Can\'t bind function!'
          // closest thing possible to the ECMAScript 5
          // internal IsCallable function
          // throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        const proto = LEXICON.p
        const aArgs = Array[proto].slice.call(arguments, 2)
        const fNOP = function () { }
        const fBound = function () {
          return func.apply(this instanceof fNOP ? this : thisObj, aArgs.concat(Array[proto].slice.call(arguments)))
        }

        if (func[proto]) {
          fNOP[proto] = func[proto]
        } // Function.prototype doesn't have a prototype property
        fBound[proto] = new fNOP()

        return fBound
      }

      return {
        /**
                 * Gets the current window width.
                 * @returns {Number|number} The current window width in pixel.
                 */
        wW: bind(windowSize, 0, true),

        /**
                 * Gets the current window height.
                 * @returns {Number|number} The current window height in pixel.
                 */
        wH: bind(windowSize, 0),

        /**
                 * Gets the MutationObserver Object or undefined if not supported.
                 * @returns {MutationObserver|*|undefined} The MutationsObserver Object or undefined.
                 */
        mO: bind(VENDORS._jsAPI, 0, 'MutationObserver', true),

        /**
                 * Gets the ResizeObserver Object or undefined if not supported.
                 * @returns {MutationObserver|*|undefined} The ResizeObserver Object or undefined.
                 */
        rO: bind(VENDORS._jsAPI, 0, 'ResizeObserver', true),

        /**
                 * Gets the RequestAnimationFrame method or it's corresponding polyfill.
                 * @returns {*|Function} The RequestAnimationFrame method or it's corresponding polyfill.
                 */
        rAF: bind(VENDORS._jsAPI, 0, 'requestAnimationFrame', false, (func) => window.setTimeout(func, 1000 / 60)),

        /**
                 * Gets the CancelAnimationFrame method or it's corresponding polyfill.
                 * @returns {*|Function} The CancelAnimationFrame method or it's corresponding polyfill.
                 */
        cAF: bind(VENDORS._jsAPI, 0, 'cancelAnimationFrame', false, (id) => window.clearTimeout(id)),

        /**
                 * Gets the current time.
                 * @returns {number} The current time.
                 */
        now() {
          return Date.now && Date.now() || new Date().getTime()
        },

        /**
                 * Stops the propagation of the given event.
                 * @param event The event of which the propagation shall be stoped.
                 */
        stpP(event) {
          if (event.stopPropagation) {
            event.stopPropagation()
          } else {
            event.cancelBubble = true
          }
        },

        /**
                 * Prevents the default action of the given event.
                 * @param event The event of which the default action shall be prevented.
                 */
        prvD(event) {
          if (event.preventDefault && event.cancelable) {
            event.preventDefault()
          } else {
            event.returnValue = false
          }
        },

        /**
                 * Gets the pageX and pageY values of the given mouse event.
                 * @param event The mouse event of which the pageX and pageX shall be got.
                 * @returns {{x: number, y: number}} x = pageX value, y = pageY value.
                 */
        page(event) {
          event = event.originalEvent || event

          const strPage = 'page'
          const strClient = 'client'
          const strX = 'X'
          const strY = 'Y'
          const target = event.target || event.srcElement || document
          const eventDoc = target.ownerDocument || document
          const doc = eventDoc.documentElement
          const body = eventDoc.body

          // if touch event return return pageX/Y of it
          if (event.touches !== undefined) {
            const touch = event.touches[0]
            return {
              x: touch[strPage + strX],
              y: touch[strPage + strY]
            }
          }

          // Calculate pageX/Y if not native supported
          if (!event[strPage + strX] && event[strClient + strX] && event[strClient + strX] != null) {
            return {
              x: event[strClient + strX] +
                                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                                (doc && doc.clientLeft || body && body.clientLeft || 0),
              y: event[strClient + strY] +
                                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                                (doc && doc.clientTop || body && body.clientTop || 0)
            }
          }
          return {
            x: event[strPage + strX],
            y: event[strPage + strY]
          }
        },

        /**
                 * Gets the clicked mouse button of the given mouse event.
                 * @param event The mouse event of which the clicked button shal be got.
                 * @returns {number} The number of the clicked mouse button. (0 : none | 1 : leftButton | 2 : middleButton | 3 : rightButton)
                 */
        mBtn(event) {
          const button = event.button
          if (!event.which && button !== undefined) {
            return button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0
          }
          return event.which
        },

        /**
                 * Checks whether a item is in the given array and returns its index.
                 * @param item The item of which the position in the array shall be determined.
                 * @param arr The array.
                 * @returns {number} The zero based index of the item or -1 if the item isn't in the array.
                 */
        inA(item, arr) {
          for (let i = 0; i < arr[LEXICON.l]; i++)
          // Sometiems in IE a "SCRIPT70" Permission denied error occurs if HTML elements in a iFrame are compared
          {
            try {
              if (arr[i] === item) {
                return i
              }
            } catch (e) { }
          }
          return -1
        },

        /**
                 * Returns true if the given value is a array.
                 * @param arr The potential array.
                 * @returns {boolean} True if the given value is a array, false otherwise.
                 */
        isA(arr) {
          const def = Array.isArray
          return def ? def(arr) : this.type(arr) == TYPES.a
        },

        /**
                 * Determine the internal JavaScript [[Class]] of the given object.
                 * @param obj The object of which the type shall be determined.
                 * @returns {string} The type of the given object.
                 */
        type(obj) {
          if (obj === undefined) {
            return `${obj}`
          }
          if (obj === null) {
            return `${obj}`
          }
          return Object[LEXICON.p].toString.call(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase()
        },


        bind

        /**
                 * Gets the vendor-prefixed CSS property by the given name.
                 * For example the given name is "transform" and you're using a old Firefox browser then the returned value would be "-moz-transform".
                 * If the browser doesn't need a vendor-prefix, then the returned string is the given name.
                 * If the browser doesn't support the given property name at all (not even with a vendor-prefix) the returned value is null.
                 * @param propName The unprefixed CSS property name.
                 * @returns {string|null} The vendor-prefixed CSS property or null if the browser doesn't support the given CSS property.

                cssProp: function(propName) {
                    return VENDORS._cssProperty(propName);
                }
                */
      }
    }())

    const MATH = Math
    const JQUERY = window.jQuery
    const EASING = (function () {
      const _easingsMath = {
        p: MATH.PI,
        c: MATH.cos,
        s: MATH.sin,
        w: MATH.pow,
        t: MATH.sqrt,
        n: MATH.asin,
        a: MATH.abs,
        o: 1.70158
      }

      /*
             x : current percent (0 - 1),
             t : current time (duration * percent),
             b : start value (from),
             c : end value (to),
             d : duration

             easingName : function(x, t, b, c, d) { return easedValue; }
             */

      return {
        swing(x, t, b, c, d) {
          return 0.5 - _easingsMath.c(x * _easingsMath.p) / 2
        },
        linear(x, t, b, c, d) {
          return x
        },
        easeInQuad(x, t, b, c, d) {
          return c * (t /= d) * t + b
        },
        easeOutQuad(x, t, b, c, d) {
          return -c * (t /= d) * (t - 2) + b
        },
        easeInOutQuad(x, t, b, c, d) {
          return (t /= d / 2) < 1 ? c / 2 * t * t + b : -c / 2 * (--t * (t - 2) - 1) + b
        },
        easeInCubic(x, t, b, c, d) {
          return c * (t /= d) * t * t + b
        },
        easeOutCubic(x, t, b, c, d) {
          return c * ((t = t / d - 1) * t * t + 1) + b
        },
        easeInOutCubic(x, t, b, c, d) {
          return (t /= d / 2) < 1 ? c / 2 * t * t * t + b : c / 2 * ((t -= 2) * t * t + 2) + b
        },
        easeInQuart(x, t, b, c, d) {
          return c * (t /= d) * t * t * t + b
        },
        easeOutQuart(x, t, b, c, d) {
          return -c * ((t = t / d - 1) * t * t * t - 1) + b
        },
        easeInOutQuart(x, t, b, c, d) {
          return (t /= d / 2) < 1 ? c / 2 * t * t * t * t + b : -c / 2 * ((t -= 2) * t * t * t - 2) + b
        },
        easeInQuint(x, t, b, c, d) {
          return c * (t /= d) * t * t * t * t + b
        },
        easeOutQuint(x, t, b, c, d) {
          return c * ((t = t / d - 1) * t * t * t * t + 1) + b
        },
        easeInOutQuint(x, t, b, c, d) {
          return (t /= d / 2) < 1 ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b
        },
        easeInSine(x, t, b, c, d) {
          return -c * _easingsMath.c(t / d * (_easingsMath.p / 2)) + c + b
        },
        easeOutSine(x, t, b, c, d) {
          return c * _easingsMath.s(t / d * (_easingsMath.p / 2)) + b
        },
        easeInOutSine(x, t, b, c, d) {
          return -c / 2 * (_easingsMath.c(_easingsMath.p * t / d) - 1) + b
        },
        easeInExpo(x, t, b, c, d) {
          return t == 0 ? b : c * _easingsMath.w(2, 10 * (t / d - 1)) + b
        },
        easeOutExpo(x, t, b, c, d) {
          return t == d ? b + c : c * (-_easingsMath.w(2, -10 * t / d) + 1) + b
        },
        easeInOutExpo(x, t, b, c, d) {
          if (t == 0) {
            return b
          }
          if (t == d) {
            return b + c
          }
          if ((t /= d / 2) < 1) {
            return c / 2 * _easingsMath.w(2, 10 * (t - 1)) + b
          }
          return c / 2 * (-_easingsMath.w(2, -10 * --t) + 2) + b
        },
        easeInCirc(x, t, b, c, d) {
          return -c * (_easingsMath.t(1 - (t /= d) * t) - 1) + b
        },
        easeOutCirc(x, t, b, c, d) {
          return c * _easingsMath.t(1 - (t = t / d - 1) * t) + b
        },
        easeInOutCirc(x, t, b, c, d) {
          return (t /= d / 2) < 1 ? -c / 2 * (_easingsMath.t(1 - t * t) - 1) + b : c / 2 * (_easingsMath.t(1 - (t -= 2) * t) + 1) + b
        },
        easeInElastic(x, t, b, c, d) {
          let s = _easingsMath.o; let p = 0; let a = c
          if (t == 0) {
            return b
          } if ((t /= d) == 1) {
            return b + c
          } if (!p) {
            p = d * 0.3
          }
          if (a < _easingsMath.a(c)) {
            a = c; s = p / 4
          } else {
            s = p / (2 * _easingsMath.p) * _easingsMath.n(c / a)
          }
          return -(a * _easingsMath.w(2, 10 * (t -= 1)) * _easingsMath.s((t * d - s) * (2 * _easingsMath.p) / p)) + b
        },
        easeOutElastic(x, t, b, c, d) {
          let s = _easingsMath.o; let p = 0; let a = c
          if (t == 0) {
            return b
          }
          if ((t /= d) == 1) {
            return b + c
          }
          if (!p) {
            p = d * 0.3
          }
          if (a < _easingsMath.a(c)) {
            a = c; s = p / 4
          } else {
            s = p / (2 * _easingsMath.p) * _easingsMath.n(c / a)
          }
          return a * _easingsMath.w(2, -10 * t) * _easingsMath.s((t * d - s) * (2 * _easingsMath.p) / p) + c + b
        },
        easeInOutElastic(x, t, b, c, d) {
          let s = _easingsMath.o; let p = 0; let a = c
          if (t == 0) {
            return b
          }
          if ((t /= d / 2) == 2) {
            return b + c
          }
          if (!p) {
            p = d * (0.3 * 1.5)
          }
          if (a < _easingsMath.a(c)) {
            a = c; s = p / 4
          } else {
            s = p / (2 * _easingsMath.p) * _easingsMath.n(c / a)
          }
          if (t < 1) {
            return -0.5 * (a * _easingsMath.w(2, 10 * (t -= 1)) * _easingsMath.s((t * d - s) * (2 * _easingsMath.p) / p)) + b
          }
          return a * _easingsMath.w(2, -10 * (t -= 1)) * _easingsMath.s((t * d - s) * (2 * _easingsMath.p) / p) * 0.5 + c + b
        },
        easeInBack(x, t, b, c, d, s) {
          s = s || _easingsMath.o
          return c * (t /= d) * t * ((s + 1) * t - s) + b
        },
        easeOutBack(x, t, b, c, d, s) {
          s = s || _easingsMath.o
          return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
        },
        easeInOutBack(x, t, b, c, d, s) {
          s = s || _easingsMath.o
          return (t /= d / 2) < 1 ? c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b : c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b
        },
        easeInBounce(x, t, b, c, d) {
          return c - this.easeOutBounce(x, d - t, 0, c, d) + b
        },
        easeOutBounce(x, t, b, c, d) {
          const o = 7.5625
          if ((t /= d) < 1 / 2.75) {
            return c * (o * t * t) + b
          } else if (t < 2 / 2.75) {
            return c * (o * (t -= 1.5 / 2.75) * t + 0.75) + b
          } else if (t < 2.5 / 2.75) {
            return c * (o * (t -= 2.25 / 2.75) * t + 0.9375) + b
          }
          return c * (o * (t -= 2.625 / 2.75) * t + 0.984375) + b
        },
        easeInOutBounce(x, t, b, c, d) {
          return t < d / 2 ? this.easeInBounce(x, t * 2, 0, c, d) * 0.5 + b : this.easeOutBounce(x, t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b
        }
      }
      /*
             *
             * TERMS OF USE - EASING EQUATIONS
             *
             * Open source under the BSD License.
             *
             * Copyright Â© 2001 Robert Penner
             * All rights reserved.
             *
             * Redistribution and use in source and binary forms, with or without modification,
             * are permitted provided that the following conditions are met:
             *
             * Redistributions of source code must retain the above copyright notice, this list of
             * conditions and the following disclaimer.
             * Redistributions in binary form must reproduce the above copyright notice, this list
             * of conditions and the following disclaimer in the documentation and/or other materials
             * provided with the distribution.
             *
             * Neither the name of the author nor the names of contributors may be used to endorse
             * or promote products derived from this software without specific prior written permission.
             *
             * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
             * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
             * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
             *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
             *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
             *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
             * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
             *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
             * OF THE POSSIBILITY OF SUCH DAMAGE.
             *
             */
    }())
    const FRAMEWORK = (function () {
      const _rnothtmlwhite = (/[^\x20\t\r\n\f]+/g)
      const _strSpace = ' '
      const _strEmpty = ''
      const _strScrollLeft = 'scrollLeft'
      const _strScrollTop = 'scrollTop'
      const _animations = []
      const _type = COMPATIBILITY.type
      const _cssNumber = {
        animationIterationCount: true,
        columnCount: true,
        fillOpacity: true,
        flexGrow: true,
        flexShrink: true,
        fontWeight: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        widows: true,
        zIndex: true,
        zoom: true
      }

      function extend() {
        let src; let copyIsArray; let copy; let name; let options; let clone; let target = arguments[0] || {}
        let i = 1
        const length = arguments[LEXICON.l]
        let deep = false

        // Handle a deep copy situation
        if (_type(target) == TYPES.b) {
          deep = target
          target = arguments[1] || {}
          // skip the boolean and the target
          i = 2
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (_type(target) != TYPES.o && !_type(target) == TYPES.f) {
          target = {}
        }

        // extend jQuery itself if only one argument is passed
        if (length === i) {
          target = FakejQuery
          --i
        }

        for (; i < length; i++) {
          // Only deal with non-null/undefined values
          if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
              src = target[name]
              copy = options[name]

              // Prevent never-ending loop
              if (target === copy) {
                continue
              }

              // Recurse if we're merging plain objects or arrays
              if (deep && copy && (isPlainObject(copy) || (copyIsArray = COMPATIBILITY.isA(copy)))) {
                if (copyIsArray) {
                  copyIsArray = false
                  clone = src && COMPATIBILITY.isA(src) ? src : []
                } else {
                  clone = src && isPlainObject(src) ? src : {}
                }

                // Never move original objects, clone them
                target[name] = extend(deep, clone, copy)

                // Don't bring in undefined values
              } else if (copy !== undefined) {
                target[name] = copy
              }
            }
          }
        }

        // Return the modified object
        return target
      }

      function inArray(item, arr, fromIndex) {
        for (let i = fromIndex || 0; i < arr[LEXICON.l]; i++) {
          if (arr[i] === item) {
            return i
          }
        }
        return -1
      }

      function isFunction(obj) {
        return _type(obj) == TYPES.f
      }

      function isEmptyObject(obj) {
        for (const name in obj) {
          return false
        }
        return true
      }

      function isPlainObject(obj) {
        if (!obj || _type(obj) != TYPES.o) {
          return false
        }

        let key
        const proto = LEXICON.p
        const hasOwnProperty = Object[proto].hasOwnProperty
        const hasOwnConstructor = hasOwnProperty.call(obj, 'constructor')
        const hasIsPrototypeOf = obj.constructor && obj.constructor[proto] && hasOwnProperty.call(obj.constructor[proto], 'isPrototypeOf')

        if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
          return false
        }


        for (key in obj) { /**/ }

        return _type(key) == TYPES.u || hasOwnProperty.call(obj, key)
      }

      function each(obj, callback) {
        let i = 0

        if (isArrayLike(obj)) {
          for (; i < obj[LEXICON.l]; i++) {
            if (callback.call(obj[i], i, obj[i]) === false) {
              break
            }
          }
        } else {
          for (i in obj) {
            if (callback.call(obj[i], i, obj[i]) === false) {
              break
            }
          }
        }

        return obj
      }

      function isArrayLike(obj) {
        const length = Boolean(obj) && [LEXICON.l] in obj && obj[LEXICON.l]
        const t = _type(obj)
        return isFunction(t) ? false : t == TYPES.a || length === 0 || _type(length) == TYPES.n && length > 0 && length - 1 in obj
      }

      function stripAndCollapse(value) {
        const tokens = value.match(_rnothtmlwhite) || []
        return tokens.join(_strSpace)
      }

      function matches(elem, selector) {
        const nodeList = (elem.parentNode || document).querySelectorAll(selector) || []
        let i = nodeList[LEXICON.l]

        while (i--) {
          if (nodeList[i] == elem) {
            return true
          }
        }

        return false
      }

      function insertAdjacentElement(el, strategy, child) {
        if (_type(child) == TYPES.a) {
          for (let i = 0; i < child[LEXICON.l]; i++) {
            insertAdjacentElement(el, strategy, child[i])
          }
        } else if (_type(child) == TYPES.s) {
          el.insertAdjacentHTML(strategy, child)
        } else {
          el.insertAdjacentElement(strategy, child.nodeType ? child : child[0])
        }
      }

      function setCSSVal(el, prop, val) {
        try {
          if (el[LEXICON.s][prop] !== undefined) {
            el[LEXICON.s][prop] = parseCSSVal(prop, val)
          }
        } catch (e) { }
      }

      function parseCSSVal(prop, val) {
        if (!_cssNumber[prop.toLowerCase()] && _type(val) == TYPES.n) {
          val += 'px'
        }
        return val
      }

      function startNextAnimationInQ(animObj, removeFromQ) {
        let index
        let nextAnim
        if (removeFromQ !== false) {
          animObj.q.splice(0, 1)
        }
        if (animObj.q[LEXICON.l] > 0) {
          nextAnim = animObj.q[0]
          animate(animObj.el, nextAnim.props, nextAnim.duration, nextAnim.easing, nextAnim.complete, true)
        } else {
          index = inArray(animObj, _animations)
          if (index > -1) {
            _animations.splice(index, 1)
          }
        }
      }

      function setAnimationValue(el, prop, value) {
        if (prop === _strScrollLeft || prop === _strScrollTop) {
          el[prop] = value
        } else {
          setCSSVal(el, prop, value)
        }
      }

      function animate(el, props, options, easing, complete, guaranteedNext) {
        const hasOptions = isPlainObject(options)
        const from = {}
        const to = {}
        let i = 0
        let key
        let animObj
        let start
        let progress
        let step
        let specialEasing
        let duration
        if (hasOptions) {
          easing = options.easing
          start = options.start
          progress = options.progress
          step = options.step
          specialEasing = options.specialEasing
          complete = options.complete
          duration = options.duration
        } else {
          duration = options
        }
        specialEasing = specialEasing || {}
        duration = duration || 400
        easing = easing || 'swing'
        guaranteedNext = guaranteedNext || false

        for (; i < _animations[LEXICON.l]; i++) {
          if (_animations[i].el === el) {
            animObj = _animations[i]
            break
          }
        }

        if (!animObj) {
          animObj = {
            el,
            q: []
          }
          _animations.push(animObj)
        }

        for (key in props) {
          if (key === _strScrollLeft || key === _strScrollTop) {
            from[key] = el[key]
          } else {
            from[key] = FakejQuery(el).css(key)
          }
        }

        for (key in from) {
          if (from[key] !== props[key] && props[key] !== undefined) {
            to[key] = props[key]
          }
        }

        if (!isEmptyObject(to)) {
          let timeNow
          let end
          let percent
          let fromVal
          let toVal
          let easedVal
          let timeStart
          let frame
          let elapsed
          let qPos = guaranteedNext ? 0 : inArray(qObj, animObj.q)
          var qObj = {
            props: to,
            duration: hasOptions ? options : duration,
            easing,
            complete
          }
          if (qPos === -1) {
            qPos = animObj.q[LEXICON.l]
            animObj.q.push(qObj)
          }

          if (qPos === 0) {
            if (duration > 0) {
              timeStart = COMPATIBILITY.now()
              frame = function () {
                timeNow = COMPATIBILITY.now()
                elapsed = timeNow - timeStart
                end = qObj.stop || elapsed >= duration
                percent = 1 - (MATH.max(0, timeStart + duration - timeNow) / duration || 0)

                for (key in to) {
                  fromVal = parseFloat(from[key])
                  toVal = parseFloat(to[key])
                  easedVal = (toVal - fromVal) * EASING[specialEasing[key] || easing](percent, percent * duration, 0, 1, duration) + fromVal
                  setAnimationValue(el, key, easedVal)
                  if (isFunction(step)) {
                    step(easedVal, {
                      elem: el,
                      prop: key,
                      start: fromVal,
                      now: easedVal,
                      end: toVal,
                      pos: percent,
                      options: {
                        easing,
                        speacialEasing: specialEasing,
                        duration,
                        complete,
                        step
                      },
                      startTime: timeStart
                    })
                  }
                }

                if (isFunction(progress)) {
                  progress({}, percent, MATH.max(0, duration - elapsed))
                }

                if (end) {
                  startNextAnimationInQ(animObj)
                  if (isFunction(complete)) {
                    complete()
                  }
                } else {
                  qObj.frame = COMPATIBILITY.rAF()(frame)
                }
              }
              qObj.frame = COMPATIBILITY.rAF()(frame)
            } else {
              for (key in to) {
                setAnimationValue(el, key, to[key])
              }
              startNextAnimationInQ(animObj)
            }
          }
        } else if (guaranteedNext) {
          startNextAnimationInQ(animObj)
        }
      }

      function stop(el, clearQ, jumpToEnd) {
        let animObj
        let qObj
        let key
        let i = 0
        for (; i < _animations[LEXICON.l]; i++) {
          animObj = _animations[i]
          if (animObj.el === el) {
            if (animObj.q[LEXICON.l] > 0) {
              qObj = animObj.q[0]
              qObj.stop = true
              COMPATIBILITY.cAF()(qObj.frame)
              animObj.q.splice(0, 1)

              if (jumpToEnd) {
                for (key in qObj.props) {
                  setAnimationValue(el, key, qObj.props[key])
                }
              }

              if (clearQ) {
                animObj.q = []
              } else {
                startNextAnimationInQ(animObj, false)
              }
            }
            break
          }
        }
      }

      function elementIsVisible(el) {
        return Boolean(el[LEXICON.oW] || el[LEXICON.oH] || el.getClientRects()[LEXICON.l])
      }

      function FakejQuery(selector) {
        if (arguments[LEXICON.l] === 0) {
          return this
        }

        const base = new FakejQuery()
        let elements = selector
        let i = 0
        let elms
        let el

        if (_type(selector) == TYPES.s) {
          elements = []
          if (selector.charAt(0) === '<') {
            el = document.createElement('div')
            el.innerHTML = selector
            elms = el.children
          } else {
            elms = document.querySelectorAll(selector)
          }

          for (; i < elms[LEXICON.l]; i++) {
            elements.push(elms[i])
          }
        }

        if (elements) {
          if (_type(elements) != TYPES.s && (!isArrayLike(elements) || elements === window || elements === elements.self)) {
            elements = [elements]
          }

          for (i = 0; i < elements[LEXICON.l]; i++) {
            base[i] = elements[i]
          }

          base[LEXICON.l] = elements[LEXICON.l]
        }

        return base
      }

      FakejQuery[LEXICON.p] = {

        // EVENTS:

        on(eventName, handler) {
          eventName = (eventName || _strEmpty).match(_rnothtmlwhite) || [_strEmpty]

          const eventNameLength = eventName[LEXICON.l]
          let i = 0
          let el
          return this.each(function () {
            el = this
            try {
              if (el.addEventListener) {
                for (; i < eventNameLength; i++) {
                  el.addEventListener(eventName[i], handler)
                }
              } else if (el.detachEvent) {
                for (; i < eventNameLength; i++) {
                  el.attachEvent(`on${eventName[i]}`, handler)
                }
              }
            } catch (e) { }
          })
        },

        off(eventName, handler) {
          eventName = (eventName || _strEmpty).match(_rnothtmlwhite) || [_strEmpty]

          const eventNameLength = eventName[LEXICON.l]
          let i = 0
          let el
          return this.each(function () {
            el = this
            try {
              if (el.removeEventListener) {
                for (; i < eventNameLength; i++) {
                  el.removeEventListener(eventName[i], handler)
                }
              } else if (el.detachEvent) {
                for (; i < eventNameLength; i++) {
                  el.detachEvent(`on${eventName[i]}`, handler)
                }
              }
            } catch (e) { }
          })
        },

        one(eventName, handler) {
          eventName = (eventName || _strEmpty).match(_rnothtmlwhite) || [_strEmpty]
          return this.each(function () {
            const el = FakejQuery(this)
            FakejQuery.each(eventName, (i, oneEventName) => {
              var oneHandler = function (e) {
                handler.call(this, e)
                el.off(oneEventName, oneHandler)
              }
              el.on(oneEventName, oneHandler)
            })
          })
        },

        trigger(eventName) {
          let el
          let event
          return this.each(function () {
            el = this
            if (document.createEvent) {
              event = document.createEvent('HTMLEvents')
              event.initEvent(eventName, true, false)
              el.dispatchEvent(event)
            } else {
              el.fireEvent(`on${eventName}`)
            }
          })
        },

        // DOM NODE INSERTING / REMOVING:

        append(child) {
          return this.each(function () {
            insertAdjacentElement(this, 'beforeend', child)
          })
        },

        prepend(child) {
          return this.each(function () {
            insertAdjacentElement(this, 'afterbegin', child)
          })
        },

        before(child) {
          return this.each(function () {
            insertAdjacentElement(this, 'beforebegin', child)
          })
        },

        after(child) {
          return this.each(function () {
            insertAdjacentElement(this, 'afterend', child)
          })
        },

        remove() {
          return this.each(function () {
            const el = this
            const parentNode = el.parentNode
            if (parentNode != null) {
              parentNode.removeChild(el)
            }
          })
        },

        unwrap() {
          const parents = []
          let i
          let el
          let parent

          this.each(function () {
            parent = this.parentNode
            if (inArray(parent, parents) === -1) {
              parents.push(parent)
            }
          })

          for (i = 0; i < parents[LEXICON.l]; i++) {
            el = parents[i]
            parent = el.parentNode
            while (el.firstChild) {
              parent.insertBefore(el.firstChild, el)
            }
            parent.removeChild(el)
          }

          return this
        },

        wrapAll(wrapperHTML) {
          let i
          const nodes = this
          const wrapper = FakejQuery(wrapperHTML)[0]
          let deepest = wrapper
          const parent = nodes[0].parentNode
          const previousSibling = nodes[0].previousSibling
          while (deepest.childNodes[LEXICON.l] > 0) {
            deepest = deepest.childNodes[0]
          }

          for (i = 0; nodes[LEXICON.l] - i; deepest.firstChild === nodes[0] && i++) {
            deepest.appendChild(nodes[i])
          }

          const nextSibling = previousSibling ? previousSibling.nextSibling : parent.firstChild
          parent.insertBefore(wrapper, nextSibling)

          return this
        },

        wrapInner(wrapperHTML) {
          return this.each(function () {
            const el = FakejQuery(this)
            const contents = el.contents()

            if (contents[LEXICON.l]) {
              contents.wrapAll(wrapperHTML)
            } else {
              el.append(wrapperHTML)
            }
          })
        },

        wrap(wrapperHTML) {
          return this.each(function () {
            FakejQuery(this).wrapAll(wrapperHTML)
          })
        },


        // DOM NODE MANIPULATION / INFORMATION:

        css(styles, val) {
          let el
          let key
          let cptStyle
          const getCptStyle = window.getComputedStyle
          if (_type(styles) == TYPES.s) {
            if (val === undefined) {
              el = this[0]
              cptStyle = getCptStyle ? getCptStyle(el, null) : el.currentStyle[styles]

              // https://bugzilla.mozilla.org/show_bug.cgi?id=548397 can be null sometimes if iframe with display: none (firefox only!)
              return getCptStyle ? cptStyle != null ? cptStyle.getPropertyValue(styles) : el[LEXICON.s][styles] : cptStyle
            }

            return this.each(function () {
              setCSSVal(this, styles, val)
            })
          }

          return this.each(function () {
            for (key in styles) {
              setCSSVal(this, key, styles[key])
            }
          })
        },

        hasClass(className) {
          let elem; let
            i = 0
          const classNamePrepared = _strSpace + className + _strSpace
          let classList

          while (elem = this[i++]) {
            classList = elem.classList
            if (classList && classList.contains(className)) {
              return true
            } else if (elem.nodeType === 1 && (_strSpace + stripAndCollapse(elem.className + _strEmpty) + _strSpace).indexOf(classNamePrepared) > -1) {
              return true
            }
          }

          return false
        },

        addClass(className) {
          let classes
          let elem
          let cur
          let curValue
          let clazz
          let finalValue
          let supportClassList
          let elmClassList
          let i = 0
          let v = 0

          if (className) {
            classes = className.match(_rnothtmlwhite) || []

            while (elem = this[i++]) {
              elmClassList = elem.classList
              if (supportClassList === undefined) {
                supportClassList = elmClassList !== undefined
              }

              if (supportClassList) {
                while (clazz = classes[v++]) {
                  elmClassList.add(clazz)
                }
              } else {
                curValue = elem.className + _strEmpty
                cur = elem.nodeType === 1 && _strSpace + stripAndCollapse(curValue) + _strSpace

                if (cur) {
                  while (clazz = classes[v++]) {
                    if (cur.indexOf(_strSpace + clazz + _strSpace) < 0) {
                      cur += clazz + _strSpace
                    }
                  }

                  finalValue = stripAndCollapse(cur)
                  if (curValue !== finalValue) {
                    elem.className = finalValue
                  }
                }
              }
            }
          }

          return this
        },

        removeClass(className) {
          let classes
          let elem
          let cur
          let curValue
          let clazz
          let finalValue
          let supportClassList
          let elmClassList
          let i = 0
          let v = 0

          if (className) {
            classes = className.match(_rnothtmlwhite) || []

            while (elem = this[i++]) {
              elmClassList = elem.classList
              if (supportClassList === undefined) {
                supportClassList = elmClassList !== undefined
              }

              if (supportClassList) {
                while (clazz = classes[v++]) {
                  elmClassList.remove(clazz)
                }
              } else {
                curValue = elem.className + _strEmpty
                cur = elem.nodeType === 1 && _strSpace + stripAndCollapse(curValue) + _strSpace

                if (cur) {
                  while (clazz = classes[v++]) {
                    while (cur.indexOf(_strSpace + clazz + _strSpace) > -1) {
                      cur = cur.replace(_strSpace + clazz + _strSpace, _strSpace)
                    }
                  }

                  finalValue = stripAndCollapse(cur)
                  if (curValue !== finalValue) {
                    elem.className = finalValue
                  }
                }
              }
            }
          }

          return this
        },

        hide() {
          return this.each(function () {
            this[LEXICON.s].display = 'none'
          })
        },

        show() {
          return this.each(function () {
            this[LEXICON.s].display = 'block'
          })
        },

        attr(attrName, value) {
          let i = 0
          let el
          while (el = this[i++]) {
            if (value === undefined) {
              return el.getAttribute(attrName)
            }
            el.setAttribute(attrName, value)
          }
          return this
        },

        removeAttr(attrName) {
          return this.each(function () {
            this.removeAttribute(attrName)
          })
        },

        offset() {
          const el = this[0]
          const rect = el[LEXICON.bCR]()
          const scrollLeft = window.pageXOffset || document.documentElement[_strScrollLeft]
          const scrollTop = window.pageYOffset || document.documentElement[_strScrollTop]
          return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
          }
        },

        position() {
          const el = this[0]
          return {
            top: el.offsetTop,
            left: el.offsetLeft
          }
        },

        scrollLeft(value) {
          let i = 0
          let el
          while (el = this[i++]) {
            if (value === undefined) {
              return el[_strScrollLeft]
            }
            el[_strScrollLeft] = value
          }
          return this
        },

        scrollTop(value) {
          let i = 0
          let el
          while (el = this[i++]) {
            if (value === undefined) {
              return el[_strScrollTop]
            }
            el[_strScrollTop] = value
          }
          return this
        },

        val(value) {
          const el = this[0]
          if (!value) {
            return el.value
          }
          el.value = value
          return this
        },


        // DOM TRAVERSAL / FILTERING:

        first() {
          return this.eq(0)
        },

        last() {
          return this.eq(-1)
        },

        eq(index) {
          return FakejQuery(this[index >= 0 ? index : this[LEXICON.l] + index])
        },

        find(selector) {
          const children = []
          let i
          this.each(function () {
            const el = this
            const ch = el.querySelectorAll(selector)
            for (i = 0; i < ch[LEXICON.l]; i++) {
              children.push(ch[i])
            }
          })
          return FakejQuery(children)
        },

        children(selector) {
          const children = []
          let el
          let ch
          let i

          this.each(function () {
            ch = this.children
            for (i = 0; i < ch[LEXICON.l]; i++) {
              el = ch[i]
              if (selector) {
                if (el.matches && el.matches(selector) || matches(el, selector)) {
                  children.push(el)
                }
              } else {
                children.push(el)
              }
            }
          })
          return FakejQuery(children)
        },

        parent(selector) {
          const parents = []
          let parent
          this.each(function () {
            parent = this.parentNode
            if (selector ? FakejQuery(parent).is(selector) : true) {
              parents.push(parent)
            }
          })
          return FakejQuery(parents)
        },

        is(selector) {
          let el
          let i
          for (i = 0; i < this[LEXICON.l]; i++) {
            el = this[i]
            if (selector === ':visible') {
              return elementIsVisible(el)
            }
            if (selector === ':hidden') {
              return !elementIsVisible(el)
            }
            if (el.matches && el.matches(selector) || matches(el, selector)) {
              return true
            }
          }
          return false
        },

        contents() {
          const contents = []
          let childs
          let i

          this.each(function () {
            childs = this.childNodes
            for (i = 0; i < childs[LEXICON.l]; i++) {
              contents.push(childs[i])
            }
          })

          return FakejQuery(contents)
        },

        each(callback) {
          return each(this, callback)
        },


        // ANIMATION:

        animate(props, duration, easing, complete) {
          return this.each(function () {
            animate(this, props, duration, easing, complete)
          })
        },

        stop(clearQ, jump) {
          return this.each(function () {
            stop(this, clearQ, jump)
          })
        }
      }

      extend(FakejQuery, {
        extend,
        inArray,
        isEmptyObject,
        isPlainObject,
        each
      })

      return FakejQuery
    }())
    const INSTANCES = (function () {
      const _targets = []
      const _instancePropertyString = '__overlayScrollbars__'

      /**
             * Register, unregister or get a certain (or all) instances.
             * Register: Pass the target and the instance.
             * Unregister: Pass the target and null.
             * Get Instance: Pass the target from which the instance shall be got.
             * Get Targets: Pass no arguments.
             * @param target The target to which the instance shall be registered / from which the instance shall be unregistered / the instance shall be got
             * @param instance The instance.
             * @returns {*|void} Returns the instance from the given target.
             */
      return function (target, instance) {
        const argLen = arguments[LEXICON.l]
        if (argLen < 1) {
          // return all targets
          return _targets
        }

        if (instance) {
          // register instance
          target[_instancePropertyString] = instance
          _targets.push(target)
        } else {
          const index = COMPATIBILITY.inA(target, _targets)
          if (index > -1) {
            if (argLen > 1) {
              // unregister instance
              delete target[_instancePropertyString]
              _targets.splice(index, 1)
            } else {
              // get instance from target
              return _targets[index][_instancePropertyString]
            }
          }
        }
      }
    }())
    const PLUGIN = (function () {
      let _plugin
      let _pluginsGlobals
      let _pluginsAutoUpdateLoop
      const _pluginsExtensions = []
      const _pluginsOptions = (function () {
        const type = COMPATIBILITY.type
        const possibleTemplateTypes = [
          TYPES.b, // boolean
          TYPES.n, // number
          TYPES.s, // string
          TYPES.a, // array
          TYPES.o, // object
          TYPES.f, // function
          TYPES.z  // null
        ]
        const restrictedStringsSplit = ' '
        const restrictedStringsPossibilitiesSplit = ':'
        const classNameAllowedValues = [TYPES.z, TYPES.s]
        const numberAllowedValues = TYPES.n
        const booleanNullAllowedValues = [TYPES.z, TYPES.b]
        const booleanTrueTemplate = [true, TYPES.b]
        const booleanFalseTemplate = [false, TYPES.b]
        const callbackTemplate = [null, [TYPES.z, TYPES.f]]
        const inheritedAttrsTemplate = [['style', 'class'], [TYPES.s, TYPES.a, TYPES.z]]
        const resizeAllowedValues = 'n:none b:both h:horizontal v:vertical'
        const overflowBehaviorAllowedValues = 'v-h:visible-hidden v-s:visible-scroll s:scroll h:hidden'
        const scrollbarsVisibilityAllowedValues = 'v:visible h:hidden a:auto'
        const scrollbarsAutoHideAllowedValues = 'n:never s:scroll l:leave m:move'
        const optionsDefaultsAndTemplate = {
          className: ['os-theme-dark', classNameAllowedValues],                // null || string
          resize: ['none', resizeAllowedValues],                               // none || both  || horizontal || vertical || n || b || h || v
          sizeAutoCapable: booleanTrueTemplate,                                // true || false
          clipAlways: booleanTrueTemplate,                                     // true || false
          normalizeRTL: booleanTrueTemplate,                                   // true || false
          paddingAbsolute: booleanFalseTemplate,                               // true || false
          autoUpdate: [null, booleanNullAllowedValues],                        // true || false || null
          autoUpdateInterval: [33, numberAllowedValues],                       // number
          nativeScrollbarsOverlaid: {
            showNativeScrollbars: booleanFalseTemplate,                      // true || false
            initialize: booleanTrueTemplate                                  // true || false
          },
          overflowBehavior: {
            x: ['scroll', overflowBehaviorAllowedValues],                    // visible-hidden  || visible-scroll || hidden || scroll || v-h || v-s || h || s
            y: ['scroll', overflowBehaviorAllowedValues]                     // visible-hidden  || visible-scroll || hidden || scroll || v-h || v-s || h || s
          },
          scrollbars: {
            visibility: ['auto', scrollbarsVisibilityAllowedValues],         // visible || hidden || auto || v || h || a
            autoHide: ['never', scrollbarsAutoHideAllowedValues],            // never || scroll || leave || move || n || s || l || m
            autoHideDelay: [800, numberAllowedValues],                       // number
            dragScrolling: booleanTrueTemplate,                              // true || false
            clickScrolling: booleanFalseTemplate,                            // true || false
            touchSupport: booleanTrueTemplate,                               // true || false
            snapHandle: booleanFalseTemplate                                 // true || false
          },
          textarea: {
            dynWidth: booleanFalseTemplate,                                  // true || false
            dynHeight: booleanFalseTemplate,                                 // true || false
            inheritedAttrs: inheritedAttrsTemplate                          // string || array || null
          },
          callbacks: {
            onInitialized: callbackTemplate,                                 // null || function
            onInitializationWithdrawn: callbackTemplate,                     // null || function
            onDestroyed: callbackTemplate,                                   // null || function
            onScrollStart: callbackTemplate,                                 // null || function
            onScroll: callbackTemplate,                                      // null || function
            onScrollStop: callbackTemplate,                                  // null || function
            onOverflowChanged: callbackTemplate,                             // null || function
            onOverflowAmountChanged: callbackTemplate,                       // null || function
            onDirectionChanged: callbackTemplate,                            // null || function
            onContentSizeChanged: callbackTemplate,                          // null || function
            onHostSizeChanged: callbackTemplate,                             // null || function
            onUpdated: callbackTemplate                                      // null || function
          }
        }
        const convert = function (template) {
          var recursive = function (obj) {
            let key
            let val
            let valType
            for (key in obj) {
              if (!obj[LEXICON.hOP](key)) {
                continue
              }
              val = obj[key]
              valType = type(val)
              if (valType == TYPES.a) {
                obj[key] = val[template ? 1 : 0]
              } else if (valType == TYPES.o) {
                obj[key] = recursive(val)
              }
            }
            return obj
          }
          return recursive(FRAMEWORK.extend(true, {}, optionsDefaultsAndTemplate))
        }

        return {
          _defaults: convert(),

          _template: convert(true),

          /**
                     * Validates the passed object by the passed template.
                     * @param obj The object which shall be validated.
                     * @param template The template which defines the allowed values and types.
                     * @param writeErrors True if errors shall be logged to the console.
                     * @param diffObj If a object is passed then only valid differences to this object will be returned.
                     * @returns {{}} A object which contains two objects called "default" and "prepared" which contains only the valid properties of the passed original object and discards not different values compared to the passed diffObj.
                     */
          _validate(obj, template, writeErrors, diffObj) {
            const validatedOptions = {}
            const validatedOptionsPrepared = {}
            const objectCopy = FRAMEWORK.extend(true, {}, obj)
            const inArray = FRAMEWORK.inArray
            const isEmptyObj = FRAMEWORK.isEmptyObject
            var checkObjectProps = function (data, template, diffData, validatedOptions, validatedOptionsPrepared, prevPropName) {
              for (var prop in template) {
                if (template[LEXICON.hOP](prop) && data[LEXICON.hOP](prop)) {
                  let isValid = false
                  let isDiff = false
                  const templateValue = template[prop]
                  let templateValueType = type(templateValue)
                  const templateIsComplex = templateValueType == TYPES.o
                  const templateTypes = type(templateValue) != TYPES.a ? [templateValue] : templateValue
                  let dataDiffValue = diffData[prop]
                  const dataValue = data[prop]
                  const dataValueType = type(dataValue)
                  const propPrefix = prevPropName ? `${prevPropName}.` : ''
                  const error = `The option "${propPrefix}${prop}" wasn't set, because`
                  const errorPossibleTypes = []
                  let errorRestrictedStrings = []
                  var restrictedStringValuesSplit
                  var restrictedStringValuesPossibilitiesSplit
                  var isRestrictedValue
                  var mainPossibility
                  var currType
                  var i
                  var v
                  var j

                  dataDiffValue = dataDiffValue === undefined ? {} : dataDiffValue

                  // if the template has a object as value, it means that the options are complex (verschachtelt)
                  if (templateIsComplex && dataValueType == TYPES.o) {
                    validatedOptions[prop] = {}
                    validatedOptionsPrepared[prop] = {}
                    checkObjectProps(dataValue, templateValue, dataDiffValue, validatedOptions[prop], validatedOptionsPrepared[prop], propPrefix + prop)
                    FRAMEWORK.each([data, validatedOptions, validatedOptionsPrepared], (index, value) => {
                      if (isEmptyObj(value[prop])) {
                        delete value[prop]
                      }
                    })
                  } else if (!templateIsComplex) {
                    for (i = 0; i < templateTypes[LEXICON.l]; i++) {
                      currType = templateTypes[i]
                      templateValueType = type(currType)
                      // if currtype is string and starts with restrictedStringPrefix and end with restrictedStringSuffix
                      isRestrictedValue = templateValueType == TYPES.s && inArray(currType, possibleTemplateTypes) === -1
                      if (isRestrictedValue) {
                        errorPossibleTypes.push(TYPES.s)

                        // split it into a array which contains all possible values for example: ["y:yes", "n:no", "m:maybe"]
                        restrictedStringValuesSplit = currType.split(restrictedStringsSplit)
                        errorRestrictedStrings = errorRestrictedStrings.concat(restrictedStringValuesSplit)
                        for (v = 0; v < restrictedStringValuesSplit[LEXICON.l]; v++) {
                          // split the possible values into their possibiliteis for example: ["y", "yes"] -> the first is always the mainPossibility
                          restrictedStringValuesPossibilitiesSplit = restrictedStringValuesSplit[v].split(restrictedStringsPossibilitiesSplit)
                          mainPossibility = restrictedStringValuesPossibilitiesSplit[0]
                          for (j = 0; j < restrictedStringValuesPossibilitiesSplit[LEXICON.l]; j++) {
                            // if any possibility matches with the dataValue, its valid
                            if (dataValue === restrictedStringValuesPossibilitiesSplit[j]) {
                              isValid = true
                              break
                            }
                          }
                          if (isValid) {
                            break
                          }
                        }
                      } else {
                        errorPossibleTypes.push(currType)

                        if (dataValueType === currType) {
                          isValid = true
                          break
                        }
                      }
                    }

                    if (isValid) {
                      isDiff = dataValue !== dataDiffValue

                      if (isDiff) {
                        validatedOptions[prop] = dataValue
                      }

                      if (isRestrictedValue ? inArray(dataDiffValue, restrictedStringValuesPossibilitiesSplit) < 0 : isDiff) {
                        validatedOptionsPrepared[prop] = isRestrictedValue ? mainPossibility : dataValue
                      }
                    } else if (writeErrors) {
                      console.warn(`${error} it doesn't accept the type [ ${dataValueType.toUpperCase()} ] with the value of "${dataValue}".\r\n` +
                                                `Accepted types are: [ ${errorPossibleTypes.join(', ').toUpperCase()} ].${
                                                  errorRestrictedStrings[length] > 0 ? `\r\nValid strings are: [ ${errorRestrictedStrings.join(', ').split(restrictedStringsPossibilitiesSplit).join(', ')} ].` : ''}`)
                    }
                    delete data[prop]
                  }
                }
              }
            }
            checkObjectProps(objectCopy, template, diffObj || {}, validatedOptions, validatedOptionsPrepared)

            // add values which aren't specified in the template to the finished validated object to prevent them from being discarded
            /*
                        if(keepForeignProps) {
                            FRAMEWORK.extend(true, validatedOptions, objectCopy);
                            FRAMEWORK.extend(true, validatedOptionsPrepared, objectCopy);
                        }
                        */

            if (!isEmptyObj(objectCopy) && writeErrors) {
              console.warn(`The following options are discarded due to invalidity:\r\n${window.JSON.stringify(objectCopy, null, 2)}`)
            }

            return {
              _default: validatedOptions,
              _prepared: validatedOptionsPrepared
            }
          }
        }
      }())

      /**
             * Initializes the object which contains global information about the plugin and each instance of it.
             */
      function initOverlayScrollbarsStatics() {
        if (!_pluginsGlobals) {
          _pluginsGlobals = new OverlayScrollbarsGlobals(_pluginsOptions._defaults)
        }
        if (!_pluginsAutoUpdateLoop) {
          _pluginsAutoUpdateLoop = new OverlayScrollbarsAutoUpdateLoop(_pluginsGlobals)
        }
      }

      /**
             * The global object for the OverlayScrollbars objects. It contains resources which every OverlayScrollbars object needs. This object is initialized only once: if the first OverlayScrollbars object gets initialized.
             * @param defaultOptions
             * @constructor
             */
      function OverlayScrollbarsGlobals(defaultOptions) {
        const _base = this
        const strOverflow = 'overflow'
        const strHidden = 'hidden'
        const strScroll = 'scroll'
        const bodyElement = FRAMEWORK('body')
        const scrollbarDummyElement = FRAMEWORK('<div id="os-dummy-scrollbar-size"><div></div></div>')
        const scrollbarDummyElement0 = scrollbarDummyElement[0]
        const dummyContainerChild = FRAMEWORK(scrollbarDummyElement.children('div').eq(0))

        bodyElement.append(scrollbarDummyElement)
        scrollbarDummyElement.hide().show() // fix IE8 bug (incorrect measuring)

        const nativeScrollbarSize = calcNativeScrollbarSize(scrollbarDummyElement0)
        const nativeScrollbarIsOverlaid = {
          x: nativeScrollbarSize.x === 0,
          y: nativeScrollbarSize.y === 0
        }
        const msie = (function () {
          const ua = window.navigator.userAgent
          const strIndexOf = 'indexOf'
          const strSubString = 'substring'
          const msie = ua[strIndexOf]('MSIE ')
          const trident = ua[strIndexOf]('Trident/')
          const edge = ua[strIndexOf]('Edge/')
          const rv = ua[strIndexOf]('rv:')
          let result
          const parseIntFunc = parseInt

          // IE 10 or older => return version number
          if (msie > 0) {
            result = parseIntFunc(ua[strSubString](msie + 5, ua[strIndexOf]('.', msie)), 10)
          }

          // IE 11 => return version number
          else if (trident > 0) {
            result = parseIntFunc(ua[strSubString](rv + 3, ua[strIndexOf]('.', rv)), 10)
          }

          // Edge (IE 12+) => return version number
          else if (edge > 0) {
            result = parseIntFunc(ua[strSubString](edge + 5, ua[strIndexOf]('.', edge)), 10)
          }

          // other browser
          return result
        }())

        FRAMEWORK.extend(_base, {
          defaultOptions,
          msie,
          autoUpdateLoop: false,
          autoUpdateRecommended: !COMPATIBILITY.mO(),
          nativeScrollbarSize,
          nativeScrollbarIsOverlaid,
          nativeScrollbarStyling: (function () {
            let result = false
            scrollbarDummyElement.addClass('os-viewport-native-scrollbars-invisible')
            try {
              result = scrollbarDummyElement.css('scrollbar-width') === 'none' && (msie > 9 || !msie) || window.getComputedStyle(scrollbarDummyElement0, '::-webkit-scrollbar').getPropertyValue('display') === 'none'
            } catch (ex) { }

            // fix opera bug: scrollbar styles will only appear if overflow value is scroll or auto during the activation of the style.
            // and set overflow to scroll
            // scrollbarDummyElement.css(strOverflow, strHidden).hide().css(strOverflow, strScroll).show();
            // return (scrollbarDummyElement0[LEXICON.oH] - scrollbarDummyElement0[LEXICON.cH]) === 0 && (scrollbarDummyElement0[LEXICON.oW] - scrollbarDummyElement0[LEXICON.cW]) === 0;

            return result
          }()),
          overlayScrollbarDummySize: {
            x: 30,
            y: 30
          },
          cssCalc: (function () {
            const dummyStyle = document.createElement('div')[LEXICON.s]
            const strCalc = 'calc'
            let i = -1
            let prop

            for (; i < VENDORS._cssPrefixes[LEXICON.l]; i++) {
              prop = i < 0 ? strCalc : VENDORS._cssPrefixes[i] + strCalc
              dummyStyle.cssText = `width:${prop}(1px);`
              if (dummyStyle[LEXICON.l]) {
                return prop
              }
            }
            return null
          }()),
          restrictedMeasuring: (function () {
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1439305
            // since 1.11.0 always false -> fixed via CSS (hopefully)
            scrollbarDummyElement.css(strOverflow, strHidden)
            const scrollSize = {
              w: scrollbarDummyElement0[LEXICON.sW],
              h: scrollbarDummyElement0[LEXICON.sH]
            }
            scrollbarDummyElement.css(strOverflow, 'visible')
            const scrollSize2 = {
              w: scrollbarDummyElement0[LEXICON.sW],
              h: scrollbarDummyElement0[LEXICON.sH]
            }
            return scrollSize.w - scrollSize2.w !== 0 || scrollSize.h - scrollSize2.h !== 0
          }()),
          rtlScrollBehavior: (function () {
            scrollbarDummyElement.css({
              'overflow-y': strHidden,
              'overflow-x': strScroll,
              direction: 'rtl'
            }).scrollLeft(0)
            const dummyContainerOffset = scrollbarDummyElement.offset()
            const dummyContainerChildOffset = dummyContainerChild.offset()
            // https://github.com/KingSora/OverlayScrollbars/issues/187
            scrollbarDummyElement.scrollLeft(-999)
            const dummyContainerChildOffsetAfterScroll = dummyContainerChild.offset()
            return {
              // origin direction = determines if the zero scroll position is on the left or right side
              // 'i' means 'invert' (i === true means that the axis must be inverted to be correct)
              // true = on the left side
              // false = on the right side
              i: dummyContainerOffset.left === dummyContainerChildOffset.left,
              // negative = determines if the maximum scroll is positive or negative
              // 'n' means 'negate' (n === true means that the axis must be negated to be correct)
              // true = negative
              // false = positive
              n: dummyContainerChildOffset.left !== dummyContainerChildOffsetAfterScroll.left
            }
          }()),
          supportTransform: VENDORS._cssProperty('transform') !== undefined,
          supportTransition: VENDORS._cssProperty('transition') !== undefined,
          supportPassiveEvents: (function () {
            let supportsPassive = false
            try {
              window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
                get() {
                  supportsPassive = true
                }
              }))
            } catch (e) { }
            return supportsPassive
          }()),
          supportResizeObserver: Boolean(COMPATIBILITY.rO()),
          supportMutationObserver: Boolean(COMPATIBILITY.mO())
        })

        scrollbarDummyElement.removeAttr(LEXICON.s).remove();

        // Catch zoom event:
        (function () {
          if (nativeScrollbarIsOverlaid.x && nativeScrollbarIsOverlaid.y) {
            return
          }

          const abs = MATH.abs
          let windowWidth = COMPATIBILITY.wW()
          let windowHeight = COMPATIBILITY.wH()
          let windowDpr = getWindowDPR()
          const onResize = function () {
            if (INSTANCES().length > 0) {
              const newW = COMPATIBILITY.wW()
              const newH = COMPATIBILITY.wH()
              const deltaW = newW - windowWidth
              const deltaH = newH - windowHeight

              if (deltaW === 0 && deltaH === 0) {
                return
              }

              const deltaWRatio = MATH.round(newW / (windowWidth / 100.0))
              const deltaHRatio = MATH.round(newH / (windowHeight / 100.0))
              const absDeltaW = abs(deltaW)
              const absDeltaH = abs(deltaH)
              const absDeltaWRatio = abs(deltaWRatio)
              const absDeltaHRatio = abs(deltaHRatio)
              const newDPR = getWindowDPR()

              const deltaIsBigger = absDeltaW > 2 && absDeltaH > 2
              const difference = !differenceIsBiggerThanOne(absDeltaWRatio, absDeltaHRatio)
              const dprChanged = newDPR !== windowDpr && windowDpr > 0
              const isZoom = deltaIsBigger && difference && dprChanged
              const oldScrollbarSize = _base.nativeScrollbarSize
              let newScrollbarSize

              if (isZoom) {
                bodyElement.append(scrollbarDummyElement)
                newScrollbarSize = _base.nativeScrollbarSize = calcNativeScrollbarSize(scrollbarDummyElement[0])
                scrollbarDummyElement.remove()
                if (oldScrollbarSize.x !== newScrollbarSize.x || oldScrollbarSize.y !== newScrollbarSize.y) {
                  FRAMEWORK.each(INSTANCES(), function () {
                    if (INSTANCES(this)) {
                      INSTANCES(this).update('zoom')
                    }
                  })
                }
              }

              windowWidth = newW
              windowHeight = newH
              windowDpr = newDPR
            }
          }

          function differenceIsBiggerThanOne(valOne, valTwo) {
            const absValOne = abs(valOne)
            const absValTwo = abs(valTwo)
            return !(absValOne === absValTwo || absValOne + 1 === absValTwo || absValOne - 1 === absValTwo)
          }

          function getWindowDPR() {
            const dDPI = window.screen.deviceXDPI || 0
            const sDPI = window.screen.logicalXDPI || 1
            return window.devicePixelRatio || dDPI / sDPI
          }

          FRAMEWORK(window).on('resize', onResize)
        }())

        function calcNativeScrollbarSize(measureElement) {
          return {
            x: measureElement[LEXICON.oH] - measureElement[LEXICON.cH],
            y: measureElement[LEXICON.oW] - measureElement[LEXICON.cW]
          }
        }
      }

      /**
             * The object which manages the auto update loop for all OverlayScrollbars objects. This object is initialized only once: if the first OverlayScrollbars object gets initialized.
             * @constructor
             */
      function OverlayScrollbarsAutoUpdateLoop(globals) {
        const _base = this
        const _inArray = FRAMEWORK.inArray
        const _getNow = COMPATIBILITY.now
        const _strAutoUpdate = 'autoUpdate'
        const _strAutoUpdateInterval = `${_strAutoUpdate}Interval`
        const _strLength = LEXICON.l
        const _loopingInstances = []
        const _loopingInstancesIntervalCache = []
        let _loopIsActive = false
        const _loopIntervalDefault = 33
        let _loopInterval = _loopIntervalDefault
        let _loopTimeOld = _getNow()
        let _loopID


        /**
                 * The auto update loop which will run every 50 milliseconds or less if the update interval of a instance is lower than 50 milliseconds.
                 */
        var loop = function () {
          if (_loopingInstances[_strLength] > 0 && _loopIsActive) {
            _loopID = COMPATIBILITY.rAF()(() => {
              loop()
            })
            const timeNew = _getNow()
            const timeDelta = timeNew - _loopTimeOld
            let lowestInterval
            let instance
            let instanceOptions
            let instanceAutoUpdateAllowed
            let instanceAutoUpdateInterval
            let now

            if (timeDelta > _loopInterval) {
              _loopTimeOld = timeNew - timeDelta % _loopInterval
              lowestInterval = _loopIntervalDefault
              for (let i = 0; i < _loopingInstances[_strLength]; i++) {
                instance = _loopingInstances[i]
                if (instance !== undefined) {
                  instanceOptions = instance.options()
                  instanceAutoUpdateAllowed = instanceOptions[_strAutoUpdate]
                  instanceAutoUpdateInterval = MATH.max(1, instanceOptions[_strAutoUpdateInterval])
                  now = _getNow()

                  if ((instanceAutoUpdateAllowed === true || instanceAutoUpdateAllowed === null) && now - _loopingInstancesIntervalCache[i] > instanceAutoUpdateInterval) {
                    instance.update('auto')
                    _loopingInstancesIntervalCache[i] = new Date(now += instanceAutoUpdateInterval)
                  }

                  lowestInterval = MATH.max(1, MATH.min(lowestInterval, instanceAutoUpdateInterval))
                }
              }
              _loopInterval = lowestInterval
            }
          } else {
            _loopInterval = _loopIntervalDefault
          }
        }

        /**
                 * Add OverlayScrollbars instance to the auto update loop. Only successful if the instance isn't already added.
                 * @param instance The instance which shall be updated in a loop automatically.
                 */
        _base.add = function (instance) {
          if (_inArray(instance, _loopingInstances) === -1) {
            _loopingInstances.push(instance)
            _loopingInstancesIntervalCache.push(_getNow())
            if (_loopingInstances[_strLength] > 0 && !_loopIsActive) {
              _loopIsActive = true
              globals.autoUpdateLoop = _loopIsActive
              loop()
            }
          }
        }

        /**
                 * Remove OverlayScrollbars instance from the auto update loop. Only successful if the instance was added before.
                 * @param instance The instance which shall be updated in a loop automatically.
                 */
        _base.remove = function (instance) {
          const index = _inArray(instance, _loopingInstances)
          if (index > -1) {
            // remove from loopingInstances list
            _loopingInstancesIntervalCache.splice(index, 1)
            _loopingInstances.splice(index, 1)

            // correct update loop behavior
            if (_loopingInstances[_strLength] === 0 && _loopIsActive) {
              _loopIsActive = false
              globals.autoUpdateLoop = _loopIsActive
              if (_loopID !== undefined) {
                COMPATIBILITY.cAF()(_loopID)
                _loopID = -1
              }
            }
          }
        }
      }

      /**
             * A object which manages the scrollbars visibility of the target element.
             * @param pluginTargetElement The element from which the scrollbars shall be hidden.
             * @param options The custom options.
             * @param extensions The custom extensions.
             * @param globals
             * @param autoUpdateLoop
             * @returns {*}
             * @constructor
             */
      function OverlayScrollbarsInstance(pluginTargetElement, options, extensions, globals, autoUpdateLoop) {
        // shortcuts
        const type = COMPATIBILITY.type
        const inArray = FRAMEWORK.inArray
        const each = FRAMEWORK.each

        // make correct instanceof
        const _base = new _plugin()
        const _frameworkProto = FRAMEWORK[LEXICON.p]

        // if passed element is no HTML element: skip and return
        if (!isHTMLElement(pluginTargetElement)) {
          return
        }

        // if passed element is already initialized: set passed options if there are any and return its instance
        if (INSTANCES(pluginTargetElement)) {
          const inst = INSTANCES(pluginTargetElement)
          inst.options(options)
          return inst
        }

        // globals:
        let _nativeScrollbarIsOverlaid
        let _overlayScrollbarDummySize
        let _rtlScrollBehavior
        let _autoUpdateRecommended
        let _msieVersion
        let _nativeScrollbarStyling
        let _cssCalc
        let _nativeScrollbarSize
        let _supportTransition
        let _supportTransform
        let _supportPassiveEvents
        let _supportResizeObserver
        let _supportMutationObserver
        let _restrictedMeasuring

        // general readonly:
        let _initialized
        let _destroyed
        let _isTextarea
        let _isBody
        let _documentMixed
        let _domExists

        // general:
        let _isBorderBox
        let _sizeAutoObserverAdded
        let _paddingX
        let _paddingY
        let _borderX
        let _borderY
        let _marginX
        let _marginY
        let _isRTL
        let _sleeping
        const _contentBorderSize = {}
        const _scrollHorizontalInfo = {}
        const _scrollVerticalInfo = {}
        let _viewportSize = {}
        let _nativeScrollbarMinSize = {}

        // naming:
        const _strMinusHidden = '-hidden'
        const _strMarginMinus = 'margin-'
        const _strPaddingMinus = 'padding-'
        const _strBorderMinus = 'border-'
        const _strTop = 'top'
        const _strRight = 'right'
        const _strBottom = 'bottom'
        const _strLeft = 'left'
        const _strMinMinus = 'min-'
        const _strMaxMinus = 'max-'
        const _strWidth = 'width'
        const _strHeight = 'height'
        const _strFloat = 'float'
        const _strEmpty = ''
        const _strAuto = 'auto'
        const _strSync = 'sync'
        const _strScroll = 'scroll'
        const _strHundredPercent = '100%'
        const _strX = 'x'
        const _strY = 'y'
        const _strDot = '.'
        const _strSpace = ' '
        const _strScrollbar = 'scrollbar'
        const _strMinusHorizontal = '-horizontal'
        const _strMinusVertical = '-vertical'
        const _strScrollLeft = `${_strScroll}Left`
        const _strScrollTop = `${_strScroll}Top`
        const _strMouseTouchDownEvent = 'mousedown touchstart'
        const _strMouseTouchUpEvent = 'mouseup touchend touchcancel'
        const _strMouseTouchMoveEvent = 'mousemove touchmove'
        const _strMouseTouchEnter = 'mouseenter'
        const _strMouseTouchLeave = 'mouseleave'
        const _strKeyDownEvent = 'keydown'
        const _strKeyUpEvent = 'keyup'
        const _strSelectStartEvent = 'selectstart'
        const _strTransitionEndEvent = 'transitionend webkitTransitionEnd oTransitionEnd'
        const _strResizeObserverProperty = '__overlayScrollbarsRO__'

        // class names:
        const _cassNamesPrefix = 'os-'
        const _classNameHTMLElement = `${_cassNamesPrefix}html`
        const _classNameHostElement = `${_cassNamesPrefix}host`
        const _classNameHostTextareaElement = `${_classNameHostElement}-textarea`
        const _classNameHostScrollbarHorizontalHidden = `${_classNameHostElement}-${_strScrollbar}${_strMinusHorizontal}${_strMinusHidden}`
        const _classNameHostScrollbarVerticalHidden = `${_classNameHostElement}-${_strScrollbar}${_strMinusVertical}${_strMinusHidden}`
        const _classNameHostTransition = `${_classNameHostElement}-transition`
        const _classNameHostRTL = `${_classNameHostElement}-rtl`
        const _classNameHostResizeDisabled = `${_classNameHostElement}-resize-disabled`
        const _classNameHostScrolling = `${_classNameHostElement}-scrolling`
        const _classNameHostOverflow = `${_classNameHostElement}-overflow`
        const _classNameHostOverflowX = `${_classNameHostOverflow}-x`
        const _classNameHostOverflowY = `${_classNameHostOverflow}-y`
        const _classNameTextareaElement = `${_cassNamesPrefix}textarea`
        const _classNameTextareaCoverElement = `${_classNameTextareaElement}-cover`
        const _classNamePaddingElement = `${_cassNamesPrefix}padding`
        const _classNameViewportElement = `${_cassNamesPrefix}viewport`
        const _classNameViewportNativeScrollbarsInvisible = `${_classNameViewportElement}-native-scrollbars-invisible`
        const _classNameViewportNativeScrollbarsOverlaid = `${_classNameViewportElement}-native-scrollbars-overlaid`
        const _classNameContentElement = `${_cassNamesPrefix}content`
        const _classNameContentArrangeElement = `${_cassNamesPrefix}content-arrange`
        const _classNameContentGlueElement = `${_cassNamesPrefix}content-glue`
        const _classNameSizeAutoObserverElement = `${_cassNamesPrefix}size-auto-observer`
        const _classNameResizeObserverElement = `${_cassNamesPrefix}resize-observer`
        const _classNameResizeObserverItemElement = `${_cassNamesPrefix}resize-observer-item`
        const _classNameResizeObserverItemFinalElement = `${_classNameResizeObserverItemElement}-final`
        const _classNameTextInherit = `${_cassNamesPrefix}text-inherit`
        const _classNameScrollbar = _cassNamesPrefix + _strScrollbar
        const _classNameScrollbarTrack = `${_classNameScrollbar}-track`
        const _classNameScrollbarTrackOff = `${_classNameScrollbarTrack}-off`
        const _classNameScrollbarHandle = `${_classNameScrollbar}-handle`
        const _classNameScrollbarHandleOff = `${_classNameScrollbarHandle}-off`
        const _classNameScrollbarUnusable = `${_classNameScrollbar}-unusable`
        const _classNameScrollbarAutoHidden = `${_classNameScrollbar}-${_strAuto}${_strMinusHidden}`
        const _classNameScrollbarCorner = `${_classNameScrollbar}-corner`
        const _classNameScrollbarCornerResize = `${_classNameScrollbarCorner}-resize`
        const _classNameScrollbarCornerResizeB = `${_classNameScrollbarCornerResize}-both`
        const _classNameScrollbarCornerResizeH = _classNameScrollbarCornerResize + _strMinusHorizontal
        const _classNameScrollbarCornerResizeV = _classNameScrollbarCornerResize + _strMinusVertical
        const _classNameScrollbarHorizontal = _classNameScrollbar + _strMinusHorizontal
        const _classNameScrollbarVertical = _classNameScrollbar + _strMinusVertical
        const _classNameDragging = `${_cassNamesPrefix}dragging`
        const _classNameThemeNone = `${_cassNamesPrefix}theme-none`
        const _classNamesDynamicDestroy = [
          _classNameViewportNativeScrollbarsInvisible,
          _classNameViewportNativeScrollbarsOverlaid,
          _classNameScrollbarTrackOff,
          _classNameScrollbarHandleOff,
          _classNameScrollbarUnusable,
          _classNameScrollbarAutoHidden,
          _classNameScrollbarCornerResize,
          _classNameScrollbarCornerResizeB,
          _classNameScrollbarCornerResizeH,
          _classNameScrollbarCornerResizeV,
          _classNameDragging].join(_strSpace)

        // callbacks:
        let _callbacksInitQeueue = []

        // attrs viewport shall inherit from target
        const _viewportAttrsFromTarget = [LEXICON.ti]

        // options:
        let _defaultOptions
        let _currentOptions
        let _currentPreparedOptions

        // extensions:
        const _extensions = {}
        const _extensionsPrivateMethods = 'added removed on contract'

        // update
        let _lastUpdateTime
        let _swallowedUpdateHints = {}
        let _swallowedUpdateTimeout
        const _swallowUpdateLag = 42
        let _imgs = []

        // DOM elements:
        let _windowElement
        let _documentElement
        let _htmlElement
        let _bodyElement
        let _targetElement                     // the target element of this OverlayScrollbars object
        let _hostElement                       // the host element of this OverlayScrollbars object -> may be the same as targetElement
        let _sizeAutoObserverElement           // observes size auto changes
        let _sizeObserverElement               // observes size and padding changes
        let _paddingElement                    // manages the padding
        let _viewportElement                   // is the viewport of our scrollbar model
        let _contentElement                    // the element which holds the content
        let _contentArrangeElement             // is needed for correct sizing of the content element (only if native scrollbars are overlays)
        let _contentGlueElement                // has always the size of the content element
        let _textareaCoverElement              // only applied if target is a textarea element. Used for correct size calculation and for prevention of uncontrolled scrolling
        let _scrollbarCornerElement
        let _scrollbarHorizontalElement
        let _scrollbarHorizontalTrackElement
        let _scrollbarHorizontalHandleElement
        let _scrollbarVerticalElement
        let _scrollbarVerticalTrackElement
        let _scrollbarVerticalHandleElement
        let _windowElementNative
        let _documentElementNative
        let _targetElementNative
        let _hostElementNative
        let _sizeAutoObserverElementNative
        let _sizeObserverElementNative
        let _paddingElementNative
        let _viewportElementNative
        let _contentElementNative

        // Cache:
        let _hostSizeCache
        let _contentScrollSizeCache
        let _arrangeContentSizeCache
        let _hasOverflowCache
        let _hideOverflowCache
        let _widthAutoCache
        let _heightAutoCache
        let _cssMaxValueCache
        let _cssBoxSizingCache
        let _cssPaddingCache
        let _cssBorderCache
        let _cssMarginCache
        let _cssDirectionCache
        let _cssDirectionDetectedCache
        let _paddingAbsoluteCache
        let _clipAlwaysCache
        let _contentGlueSizeCache
        let _overflowBehaviorCache
        let _overflowAmountCache
        let _ignoreOverlayScrollbarHidingCache
        let _autoUpdateCache
        let _sizeAutoCapableCache
        let _contentElementScrollSizeChangeDetectedCache
        let _hostElementSizeChangeDetectedCache
        let _scrollbarsVisibilityCache
        let _scrollbarsAutoHideCache
        let _scrollbarsClickScrollingCache
        let _scrollbarsDragScrollingCache
        let _resizeCache
        let _normalizeRTLCache
        let _classNameCache
        let _oldClassName
        let _textareaAutoWrappingCache
        let _textareaInfoCache
        let _textareaSizeCache
        let _textareaDynHeightCache
        let _textareaDynWidthCache
        let _bodyMinSizeCache
        let _displayIsHiddenCache
        const _updateAutoCache = {}

        // MutationObserver:
        let _mutationObserverHost
        let _mutationObserverContent
        let _mutationObserverHostCallback
        let _mutationObserverContentCallback
        let _mutationObserversConnected
        const _mutationObserverAttrsTextarea = ['wrap', 'cols', 'rows']
        const _mutationObserverAttrsHost = [LEXICON.i, LEXICON.c, LEXICON.s, 'open'].concat(_viewportAttrsFromTarget)

        // events:
        const _destroyEvents = []

        // textarea:
        let _textareaHasFocus

        // scrollbars:
        let _scrollbarsAutoHideTimeoutId
        let _scrollbarsAutoHideMoveTimeoutId
        let _scrollbarsAutoHideDelay
        let _scrollbarsAutoHideNever
        let _scrollbarsAutoHideScroll
        let _scrollbarsAutoHideMove
        let _scrollbarsAutoHideLeave
        let _scrollbarsHandleHovered
        let _scrollbarsHandlesDefineScrollPos

        // resize
        let _resizeNone
        let _resizeBoth
        let _resizeHorizontal
        let _resizeVertical


        // ==== Event Listener ====//

        /**
                 * Adds or removes a event listener from the given element.
                 * @param element The element to which the event listener shall be applied or removed.
                 * @param eventNames The name(s) of the events.
                 * @param listener The method which shall be called.
                 * @param remove True if the handler shall be removed, false or undefined if the handler shall be added.
                 */
        function setupResponsiveEventListener(element, eventNames, listener, remove, passive) {
          const collected = type(eventNames) == TYPES.a && type(listener) == TYPES.a
          const method = remove ? 'removeEventListener' : 'addEventListener'
          const onOff = remove ? 'off' : 'on'
          const events = collected ? false : eventNames.split(_strSpace)
          let i = 0

          if (collected) {
            for (; i < eventNames[LEXICON.l]; i++) {
              setupResponsiveEventListener(element, eventNames[i], listener[i], remove)
            }
          } else {
            for (; i < events[LEXICON.l]; i++) {
              if (_supportPassiveEvents) {
                element[0][method](events[i], listener, {
                  passive: passive || false
                })
              } else {
                element[onOff](events[i], listener)
              }
            }
          }
        }


        function addDestroyEventListener(element, eventNames, listener, passive) {
          setupResponsiveEventListener(element, eventNames, listener, false, passive)
          _destroyEvents.push(COMPATIBILITY.bind(setupResponsiveEventListener, 0, element, eventNames, listener, true, passive))
        }

        // ==== Resize Observer ====//

        /**
                 * Adds or removes a resize observer from the given element.
                 * @param targetElement The element to which the resize observer shall be added or removed.
                 * @param onElementResizedCallback The callback which is fired every time the resize observer registers a size change or false / undefined if the resizeObserver shall be removed.
                 */
        function setupResizeObserver(targetElement, onElementResizedCallback) {
          if (targetElement) {
            const resizeObserver = COMPATIBILITY.rO()
            const strAnimationStartEvent = 'animationstart mozAnimationStart webkitAnimationStart MSAnimationStart'
            const strChildNodes = 'childNodes'
            const constScroll = 3333333
            const callback = function () {
              targetElement[_strScrollTop](constScroll)[_strScrollLeft](_isRTL ? _rtlScrollBehavior.n ? -constScroll : _rtlScrollBehavior.i ? 0 : constScroll : constScroll)
              onElementResizedCallback()
            }
            // add resize observer:
            if (onElementResizedCallback) {
              if (_supportResizeObserver) {
                var element = targetElement.addClass('observed').append(generateDiv(_classNameResizeObserverElement)).contents()[0]
                const observer = element[_strResizeObserverProperty] = new resizeObserver(callback)
                observer.observe(element)
              } else if (_msieVersion > 9 || !_autoUpdateRecommended) {
                targetElement.prepend(
                  generateDiv(_classNameResizeObserverElement,
                    generateDiv({
                      c: _classNameResizeObserverItemElement,
                      dir: 'ltr'
                    },
                    generateDiv(_classNameResizeObserverItemElement,
                      generateDiv(_classNameResizeObserverItemFinalElement)
                    ) +
                                                generateDiv(_classNameResizeObserverItemElement,
                                                  generateDiv({
                                                    c: _classNameResizeObserverItemFinalElement,
                                                    style: 'width: 200%; height: 200%'
                                                  })
                                                )
                    )
                  )
                )

                const observerElement = targetElement[0][strChildNodes][0][strChildNodes][0]
                const shrinkElement = FRAMEWORK(observerElement[strChildNodes][1])
                const expandElement = FRAMEWORK(observerElement[strChildNodes][0])
                const expandElementChild = FRAMEWORK(expandElement[0][strChildNodes][0])
                let widthCache = observerElement[LEXICON.oW]
                let heightCache = observerElement[LEXICON.oH]
                let isDirty
                let rAFId
                let currWidth
                let currHeight
                const factor = 2
                const nativeScrollbarSize = globals.nativeScrollbarSize // care don't make changes to this object!!!
                const reset = function () {
                  /*
                                         var sizeResetWidth = observerElement[LEXICON.oW] + nativeScrollbarSize.x * factor + nativeScrollbarSize.y * factor + _overlayScrollbarDummySize.x + _overlayScrollbarDummySize.y;
                                         var sizeResetHeight = observerElement[LEXICON.oH] + nativeScrollbarSize.x * factor + nativeScrollbarSize.y * factor + _overlayScrollbarDummySize.x + _overlayScrollbarDummySize.y;
                                         var expandChildCSS = {};
                                         expandChildCSS[_strWidth] = sizeResetWidth;
                                         expandChildCSS[_strHeight] = sizeResetHeight;
                                         expandElementChild.css(expandChildCSS);


                                         expandElement[_strScrollLeft](sizeResetWidth)[_strScrollTop](sizeResetHeight);
                                         shrinkElement[_strScrollLeft](sizeResetWidth)[_strScrollTop](sizeResetHeight);
                                         */
                  expandElement[_strScrollLeft](constScroll)[_strScrollTop](constScroll)
                  shrinkElement[_strScrollLeft](constScroll)[_strScrollTop](constScroll)
                }
                const onResized = function () {
                  rAFId = 0
                  if (!isDirty) {
                    return
                  }

                  widthCache = currWidth
                  heightCache = currHeight
                  callback()
                }
                const onScroll = function (event) {
                  currWidth = observerElement[LEXICON.oW]
                  currHeight = observerElement[LEXICON.oH]
                  isDirty = currWidth != widthCache || currHeight != heightCache

                  if (event && isDirty && !rAFId) {
                    COMPATIBILITY.cAF()(rAFId)
                    rAFId = COMPATIBILITY.rAF()(onResized)
                  } else if (!event) {
                    onResized()
                  }

                  reset()
                  if (event) {
                    COMPATIBILITY.prvD(event)
                    COMPATIBILITY.stpP(event)
                  }
                  return false
                }
                const expandChildCSS = {}
                const observerElementCSS = {}

                setTopRightBottomLeft(observerElementCSS, _strEmpty, [
                  -((nativeScrollbarSize.y + 1) * factor),
                  nativeScrollbarSize.x * -factor,
                  nativeScrollbarSize.y * -factor,
                  -((nativeScrollbarSize.x + 1) * factor)
                ])

                FRAMEWORK(observerElement).css(observerElementCSS)
                expandElement.on(_strScroll, onScroll)
                shrinkElement.on(_strScroll, onScroll)
                targetElement.on(strAnimationStartEvent, () => {
                  onScroll(false)
                })
                // lets assume that the divs will never be that large and a constant value is enough
                expandChildCSS[_strWidth] = constScroll
                expandChildCSS[_strHeight] = constScroll
                expandElementChild.css(expandChildCSS)

                reset()
              } else {
                const attachEvent = _documentElementNative.attachEvent
                const isIE = _msieVersion !== undefined
                if (attachEvent) {
                  targetElement.prepend(generateDiv(_classNameResizeObserverElement))
                  findFirst(targetElement, _strDot + _classNameResizeObserverElement)[0].attachEvent('onresize', callback)
                } else {
                  const obj = _documentElementNative.createElement(TYPES.o)
                  obj.setAttribute(LEXICON.ti, '-1')
                  obj.setAttribute(LEXICON.c, _classNameResizeObserverElement)
                  obj.onload = function () {
                    const wnd = this.contentDocument.defaultView
                    wnd.addEventListener('resize', callback)
                    wnd.document.documentElement.style.display = 'none'
                  }
                  obj.type = 'text/html'
                  if (isIE) {
                    targetElement.prepend(obj)
                  }
                  obj.data = 'about:blank'
                  if (!isIE) {
                    targetElement.prepend(obj)
                  }
                  targetElement.on(strAnimationStartEvent, callback)
                }
              }

              if (targetElement[0] === _sizeObserverElementNative) {
                const directionChanged = function () {
                  const dir = _hostElement.css('direction')
                  const css = {}
                  let scrollLeftValue = 0
                  let result = false
                  if (dir !== _cssDirectionDetectedCache) {
                    if (dir === 'ltr') {
                      css[_strLeft] = 0
                      css[_strRight] = _strAuto
                      scrollLeftValue = constScroll
                    } else {
                      css[_strLeft] = _strAuto
                      css[_strRight] = 0
                      scrollLeftValue = _rtlScrollBehavior.n ? -constScroll : _rtlScrollBehavior.i ? 0 : constScroll
                    }
                    // execution order is important for IE!!!
                    _sizeObserverElement.children().eq(0).css(css)
                    _sizeObserverElement[_strScrollLeft](scrollLeftValue)[_strScrollTop](constScroll)
                    _cssDirectionDetectedCache = dir
                    result = true
                  }
                  return result
                }
                directionChanged()
                addDestroyEventListener(targetElement, _strScroll, (event) => {
                  if (directionChanged()) {
                    update()
                  }
                  COMPATIBILITY.prvD(event)
                  COMPATIBILITY.stpP(event)
                  return false
                })
              }
            }
            // remove resize observer:
            else if (_supportResizeObserver) {
              var element = targetElement.contents()[0]
              const resizeObserverObj = element[_strResizeObserverProperty]
              if (resizeObserverObj) {
                resizeObserverObj.disconnect()
                delete element[_strResizeObserverProperty]
              }
            } else {
              remove(targetElement.children(_strDot + _classNameResizeObserverElement).eq(0))
            }
          }
        }

        /**
                 * Freezes or unfreezes the given resize observer.
                 * @param targetElement The element to which the target resize observer is applied.
                 * @param freeze True if the resize observer shall be frozen, false otherwise.

                function freezeResizeObserver(targetElement, freeze) {
                    if (targetElement !== undefined) {
                        if(freeze) {
                            if (_supportResizeObserver) {
                                var element = targetElement.contents()[0];
                                element[_strResizeObserverProperty].unobserve(element);
                            }
                            else {
                                targetElement = targetElement.children(_strDot + _classNameResizeObserverElement).eq(0);
                                var w = targetElement.css(_strWidth);
                                var h = targetElement.css(_strHeight);
                                var css = {};
                                css[_strWidth] = w;
                                css[_strHeight] = h;
                                targetElement.css(css);
                            }
                        }
                        else {
                            if (_supportResizeObserver) {
                                var element = targetElement.contents()[0];
                                element[_strResizeObserverProperty].observe(element);
                            }
                            else {
                                var css = { };
                                css[_strHeight] = _strEmpty;
                                css[_strWidth] = _strEmpty;
                                targetElement.children(_strDot + _classNameResizeObserverElement).eq(0).css(css);
                            }
                        }
                    }
                }
                */


        // ==== Mutation Observers ====//

        /**
                 * Creates MutationObservers for the host and content Element if they are supported.
                 */
        function createMutationObservers() {
          if (_supportMutationObserver) {
            const mutationObserverContentLag = 11
            const mutationObserver = COMPATIBILITY.mO()
            let contentLastUpdate = COMPATIBILITY.now()
            let mutationTarget
            let mutationAttrName
            let contentTimeout
            let now
            let sizeAuto
            let action

            _mutationObserverHostCallback = function (mutations) {
              let doUpdate = false
              let mutation
              const mutatedAttrs = []

              if (_initialized && !_sleeping) {
                each(mutations, function () {
                  mutation = this
                  mutationTarget = mutation.target
                  mutationAttrName = mutation.attributeName

                  if (!doUpdate) {
                    if (mutationAttrName === LEXICON.c) {
                      doUpdate = hostClassNamesChanged(mutation.oldValue, mutationTarget.className)
                    } else if (mutationAttrName === LEXICON.s) {
                      doUpdate = mutation.oldValue !== mutationTarget[LEXICON.s].cssText
                    } else {
                      doUpdate = true
                    }
                  }

                  mutatedAttrs.push(mutationAttrName)
                })

                updateViewportAttrsFromTarget(mutatedAttrs)

                if (doUpdate) {
                  _base.update(_strAuto)
                }
              }
              return doUpdate
            }
            _mutationObserverContentCallback = function (mutations) {
              let doUpdate = false
              let mutation

              if (_initialized && !_sleeping) {
                each(mutations, function () {
                  mutation = this
                  doUpdate = isUnknownMutation(mutation)
                  return !doUpdate
                })

                if (doUpdate) {
                  now = COMPATIBILITY.now()
                  sizeAuto = _heightAutoCache || _widthAutoCache
                  action = function () {
                    if (!_destroyed) {
                      contentLastUpdate = now

                      // if cols, rows or wrap attr was changed
                      if (_isTextarea) {
                        textareaUpdate()
                      }

                      if (sizeAuto) {
                        update()
                      } else {
                        _base.update(_strAuto)
                      }
                    }
                  }
                  clearTimeout(contentTimeout)
                  if (mutationObserverContentLag <= 0 || now - contentLastUpdate > mutationObserverContentLag || !sizeAuto) {
                    action()
                  } else {
                    contentTimeout = setTimeout(action, mutationObserverContentLag)
                  }
                }
              }
              return doUpdate
            }

            _mutationObserverHost = new mutationObserver(_mutationObserverHostCallback)
            _mutationObserverContent = new mutationObserver(_mutationObserverContentCallback)
          }
        }

        /**
                 * Connects the MutationObservers if they are supported.
                 */
        function connectMutationObservers() {
          if (_supportMutationObserver && !_mutationObserversConnected) {
            _mutationObserverHost.observe(_hostElementNative, {
              attributes: true,
              attributeOldValue: true,
              attributeFilter: _mutationObserverAttrsHost
            })

            _mutationObserverContent.observe(_isTextarea ? _targetElementNative : _contentElementNative, {
              attributes: true,
              attributeOldValue: true,
              subtree: !_isTextarea,
              childList: !_isTextarea,
              characterData: !_isTextarea,
              attributeFilter: _isTextarea ? _mutationObserverAttrsTextarea : _mutationObserverAttrsHost
            })

            _mutationObserversConnected = true
          }
        }

        /**
                 * Disconnects the MutationObservers if they are supported.
                 */
        function disconnectMutationObservers() {
          if (_supportMutationObserver && _mutationObserversConnected) {
            _mutationObserverHost.disconnect()
            _mutationObserverContent.disconnect()

            _mutationObserversConnected = false
          }
        }


        // ==== Events of elements ====//

        /**
                 * This method gets called every time the host element gets resized. IMPORTANT: Padding changes are detected too!!
                 * It refreshes the hostResizedEventArgs and the hostSizeResizeCache.
                 * If there are any size changes, the update method gets called.
                 */
        function hostOnResized() {
          if (!_sleeping) {
            let changed
            const hostSize = {
              w: _sizeObserverElementNative[LEXICON.sW],
              h: _sizeObserverElementNative[LEXICON.sH]
            }

            changed = checkCache(hostSize, _hostElementSizeChangeDetectedCache)
            _hostElementSizeChangeDetectedCache = hostSize
            if (changed) {
              update({
                _hostSizeChanged: true
              })
            }
          }
        }

        /**
                 * The mouse enter event of the host element. This event is only needed for the autoHide feature.
                 */
        function hostOnMouseEnter() {
          if (_scrollbarsAutoHideLeave) {
            refreshScrollbarsAutoHide(true)
          }
        }

        /**
                 * The mouse leave event of the host element. This event is only needed for the autoHide feature.
                 */
        function hostOnMouseLeave() {
          if (_scrollbarsAutoHideLeave && !_bodyElement.hasClass(_classNameDragging)) {
            refreshScrollbarsAutoHide(false)
          }
        }

        /**
                 * The mouse move event of the host element. This event is only needed for the autoHide "move" feature.
                 */
        function hostOnMouseMove() {
          if (_scrollbarsAutoHideMove) {
            refreshScrollbarsAutoHide(true)
            clearTimeout(_scrollbarsAutoHideMoveTimeoutId)
            _scrollbarsAutoHideMoveTimeoutId = setTimeout(() => {
              if (_scrollbarsAutoHideMove && !_destroyed) {
                refreshScrollbarsAutoHide(false)
              }
            }, 100)
          }
        }

        /**
                 * Prevents text from deselection if attached to the document element on the mousedown event of a DOM element.
                 * @param event The select start event.
                 */
        function documentOnSelectStart(event) {
          COMPATIBILITY.prvD(event)
          return false
        }

        /**
                 * A callback which will be called after a img element has downloaded its src asynchronous.
                 */
        function imgOnLoad() {
          update({
            _contentSizeChanged: true
          })
        }

        /**
                * Adds or removes mouse & touch events of the host element. (for handling auto-hiding of the scrollbars)
                * @param destroy Indicates whether the events shall be added or removed.
                */
        function setupHostMouseTouchEvents(destroy) {
          setupResponsiveEventListener(_hostElement,
            _strMouseTouchMoveEvent,
            hostOnMouseMove,
            _scrollbarsAutoHideMove ? destroy : true, true)
          setupResponsiveEventListener(_hostElement,
            [_strMouseTouchEnter, _strMouseTouchLeave],
            [hostOnMouseEnter, hostOnMouseLeave],
            _scrollbarsAutoHideMove ? true : destroy, true)

          // if the plugin is initialized and the mouse is over the host element, make the scrollbars visible
          if (!_initialized && !destroy) {
            _hostElement.one('mouseover', hostOnMouseEnter)
          }
        }


        // ==== Update Detection ====//

        /**
                 * Measures the min width and min height of the body element and refreshes the related cache.
                 * @returns {boolean} True if the min width or min height has changed, false otherwise.
                 */
        function bodyMinSizeChanged() {
          const bodyMinSize = {}
          if (_isBody && _contentArrangeElement) {
            bodyMinSize.w = parseToZeroOrNumber(_contentArrangeElement.css(_strMinMinus + _strWidth))
            bodyMinSize.h = parseToZeroOrNumber(_contentArrangeElement.css(_strMinMinus + _strHeight))
            bodyMinSize.c = checkCache(bodyMinSize, _bodyMinSizeCache)
            bodyMinSize.f = true // flag for "measured at least once"
          }
          _bodyMinSizeCache = bodyMinSize
          return Boolean(bodyMinSize.c)
        }

        /**
                 * Returns true if the class names really changed (new class without plugin host prefix)
                 * @param oldCassNames The old ClassName string.
                 * @param newClassNames The new ClassName string.
                 * @returns {boolean} True if the class names has really changed, false otherwise.
                 */
        function hostClassNamesChanged(oldCassNames, newClassNames) {
          const currClasses = newClassNames !== undefined && newClassNames !== null ? newClassNames.split(_strSpace) : _strEmpty
          const oldClasses = oldCassNames !== undefined && oldCassNames !== null ? oldCassNames.split(_strSpace) : _strEmpty
          if (currClasses === _strEmpty && oldClasses === _strEmpty) {
            return false
          }
          const diff = getArrayDifferences(oldClasses, currClasses)
          let changed = false
          const oldClassNames = _oldClassName !== undefined && _oldClassName !== null ? _oldClassName.split(_strSpace) : [_strEmpty]
          const currClassNames = _classNameCache !== undefined && _classNameCache !== null ? _classNameCache.split(_strSpace) : [_strEmpty]

          // remove none theme from diff list to prevent update
          const idx = inArray(_classNameThemeNone, diff)
          let curr
          let i
          let v
          let o
          let c

          if (idx > -1) {
            diff.splice(idx, 1)
          }

          for (i = 0; i < diff.length; i++) {
            curr = diff[i]
            if (curr.indexOf(_classNameHostElement) !== 0) {
              o = true
              c = true
              for (v = 0; v < oldClassNames.length; v++) {
                if (curr === oldClassNames[v]) {
                  o = false
                  break
                }
              }
              for (v = 0; v < currClassNames.length; v++) {
                if (curr === currClassNames[v]) {
                  c = false
                  break
                }
              }
              if (o && c) {
                changed = true
                break
              }
            }
          }
          return changed
        }

        /**
                 * Returns true if the given mutation is not from a from the plugin generated element. If the target element is a textarea the mutation is always unknown.
                 * @param mutation The mutation which shall be checked.
                 * @returns {boolean} True if the mutation is from a unknown element, false otherwise.
                 */
        function isUnknownMutation(mutation) {
          const attributeName = mutation.attributeName
          const mutationTarget = mutation.target
          const mutationType = mutation.type
          const strClosest = 'closest'

          if (mutationTarget === _contentElementNative) {
            return attributeName === null
          }
          if (mutationType === 'attributes' && (attributeName === LEXICON.c || attributeName === LEXICON.s) && !_isTextarea) {
            // ignore className changes by the plugin
            if (attributeName === LEXICON.c && FRAMEWORK(mutationTarget).hasClass(_classNameHostElement)) {
              return hostClassNamesChanged(mutation.oldValue, mutationTarget.getAttribute(LEXICON.c))
            }

            // only do it of browser support it natively
            if (typeof mutationTarget[strClosest] !== TYPES.f) {
              return true
            }
            if (mutationTarget[strClosest](_strDot + _classNameResizeObserverElement) !== null ||
                            mutationTarget[strClosest](_strDot + _classNameScrollbar) !== null ||
                            mutationTarget[strClosest](_strDot + _classNameScrollbarCorner) !== null) {
              return false
            }
          }
          return true
        }

        /**
                 * Returns true if the content size was changed since the last time this method was called.
                 * @returns {boolean} True if the content size was changed, false otherwise.
                 */
        function updateAutoContentSizeChanged() {
          if (_sleeping) {
            return false
          }

          const contentMeasureElement = getContentMeasureElement()
          const textareaValueLength = _isTextarea && _widthAutoCache && !_textareaAutoWrappingCache ? _targetElement.val().length : 0
          const setCSS = !_mutationObserversConnected && _widthAutoCache && !_isTextarea
          const css = {}
          let float
          let bodyMinSizeC
          let changed
          let contentElementScrollSize

          if (setCSS) {
            float = _contentElement.css(_strFloat)
            css[_strFloat] = _isRTL ? _strRight : _strLeft
            css[_strWidth] = _strAuto
            _contentElement.css(css)
          }
          contentElementScrollSize = {
            w: contentMeasureElement[LEXICON.sW] + textareaValueLength,
            h: contentMeasureElement[LEXICON.sH] + textareaValueLength
          }
          if (setCSS) {
            css[_strFloat] = float
            css[_strWidth] = _strHundredPercent
            _contentElement.css(css)
          }

          bodyMinSizeC = bodyMinSizeChanged()
          changed = checkCache(contentElementScrollSize, _contentElementScrollSizeChangeDetectedCache)

          _contentElementScrollSizeChangeDetectedCache = contentElementScrollSize

          return changed || bodyMinSizeC
        }

        /**
                 * Returns true when a attribute which the MutationObserver would observe has changed.
                 * @returns {boolean} True if one of the attributes which a MutationObserver would observe has changed, false or undefined otherwise.
                 */
        function meaningfulAttrsChanged() {
          if (_sleeping || _mutationObserversConnected) {
            return
          }

          let elem
          let curr
          let cache
          const changedAttrs = []
          const checks = [
            {
              _elem: _hostElement,
              _attrs: _mutationObserverAttrsHost.concat(':visible')
            },
            {
              _elem: _isTextarea ? _targetElement : undefined,
              _attrs: _mutationObserverAttrsTextarea
            }
          ]

          each(checks, (index, check) => {
            elem = check._elem
            if (elem) {
              each(check._attrs, (index, attr) => {
                curr = attr.charAt(0) === ':' ? elem.is(attr) : elem.attr(attr)
                cache = _updateAutoCache[attr]

                if (checkCache(curr, cache)) {
                  changedAttrs.push(attr)
                }

                _updateAutoCache[attr] = curr
              })
            }
          })

          updateViewportAttrsFromTarget(changedAttrs)

          return changedAttrs[LEXICON.l] > 0
        }

        /**
                 * Checks is a CSS Property of a child element is affecting the scroll size of the content.
                 * @param propertyName The CSS property name.
                 * @returns {boolean} True if the property is affecting the content scroll size, false otherwise.
                 */
        function isSizeAffectingCSSProperty(propertyName) {
          if (!_initialized) {
            return true
          }
          const flexGrow = 'flex-grow'
          const flexShrink = 'flex-shrink'
          const flexBasis = 'flex-basis'
          const affectingPropsX = [
            _strWidth,
            _strMinMinus + _strWidth,
            _strMaxMinus + _strWidth,
            _strMarginMinus + _strLeft,
            _strMarginMinus + _strRight,
            _strLeft,
            _strRight,
            'font-weight',
            'word-spacing',
            flexGrow,
            flexShrink,
            flexBasis
          ]
          const affectingPropsXContentBox = [
            _strPaddingMinus + _strLeft,
            _strPaddingMinus + _strRight,
            _strBorderMinus + _strLeft + _strWidth,
            _strBorderMinus + _strRight + _strWidth
          ]
          const affectingPropsY = [
            _strHeight,
            _strMinMinus + _strHeight,
            _strMaxMinus + _strHeight,
            _strMarginMinus + _strTop,
            _strMarginMinus + _strBottom,
            _strTop,
            _strBottom,
            'line-height',
            flexGrow,
            flexShrink,
            flexBasis
          ]
          const affectingPropsYContentBox = [
            _strPaddingMinus + _strTop,
            _strPaddingMinus + _strBottom,
            _strBorderMinus + _strTop + _strWidth,
            _strBorderMinus + _strBottom + _strWidth
          ]
          const _strS = 's'
          const _strVS = 'v-s'
          const checkX = _overflowBehaviorCache.x === _strS || _overflowBehaviorCache.x === _strVS
          const checkY = _overflowBehaviorCache.y === _strS || _overflowBehaviorCache.y === _strVS
          let sizeIsAffected = false
          const checkPropertyName = function (arr, name) {
            for (let i = 0; i < arr[LEXICON.l]; i++) {
              if (arr[i] === name) {
                return true
              }
            }
            return false
          }

          if (checkY) {
            sizeIsAffected = checkPropertyName(affectingPropsY, propertyName)
            if (!sizeIsAffected && !_isBorderBox) {
              sizeIsAffected = checkPropertyName(affectingPropsYContentBox, propertyName)
            }
          }
          if (checkX && !sizeIsAffected) {
            sizeIsAffected = checkPropertyName(affectingPropsX, propertyName)
            if (!sizeIsAffected && !_isBorderBox) {
              sizeIsAffected = checkPropertyName(affectingPropsXContentBox, propertyName)
            }
          }
          return sizeIsAffected
        }


        // ==== Update ====//

        /**
                 * Sets the attribute values of the viewport element to the values from the target element.
                 * The value of a attribute is only set if the attribute is whitelisted.
                 * @attrs attrs The array of attributes which shall be set or undefined if all whitelisted shall be set.
                 */
        function updateViewportAttrsFromTarget(attrs) {
          attrs = attrs || _viewportAttrsFromTarget
          each(attrs, (index, attr) => {
            if (COMPATIBILITY.inA(attr, _viewportAttrsFromTarget) > -1) {
              const targetAttr = _targetElement.attr(attr)
              if (type(targetAttr) == TYPES.s) {
                _viewportElement.attr(attr, targetAttr)
              } else {
                _viewportElement.removeAttr(attr)
              }
            }
          })
        }

        /**
                 * Updates the variables and size of the textarea element, and manages the scroll on new line or new character.
                 */
        function textareaUpdate() {
          if (!_sleeping) {
            const wrapAttrOff = !_textareaAutoWrappingCache
            const minWidth = _viewportSize.w
            const minHeight = _viewportSize.h
            const css = {}
            const doMeasure = _widthAutoCache || wrapAttrOff
            let origWidth
            let width
            let origHeight
            let height

            // reset min size
            css[_strMinMinus + _strWidth] = _strEmpty
            css[_strMinMinus + _strHeight] = _strEmpty

            // set width auto
            css[_strWidth] = _strAuto
            _targetElement.css(css)

            // measure width
            origWidth = _targetElementNative[LEXICON.oW]
            width = doMeasure ? MATH.max(origWidth, _targetElementNative[LEXICON.sW] - 1) : 1
            /* width += (_widthAutoCache ? _marginX + (!_isBorderBox ? wrapAttrOff ? 0 : _paddingX + _borderX : 0) : 0);*/

            // set measured width
            css[_strWidth] = _widthAutoCache ? _strAuto /* width*/ : _strHundredPercent
            css[_strMinMinus + _strWidth] = _strHundredPercent

            // set height auto
            css[_strHeight] = _strAuto
            _targetElement.css(css)

            // measure height
            origHeight = _targetElementNative[LEXICON.oH]
            height = MATH.max(origHeight, _targetElementNative[LEXICON.sH] - 1)

            // append correct size values
            css[_strWidth] = width
            css[_strHeight] = height
            _textareaCoverElement.css(css)

            // apply min width / min height to prevent textarea collapsing
            css[_strMinMinus + _strWidth] = minWidth /* + (!_isBorderBox && _widthAutoCache ? _paddingX + _borderX : 0)*/
            css[_strMinMinus + _strHeight] = minHeight /* + (!_isBorderBox && _heightAutoCache ? _paddingY + _borderY : 0)*/
            _targetElement.css(css)

            return {
              _originalWidth: origWidth,
              _originalHeight: origHeight,
              _dynamicWidth: width,
              _dynamicHeight: height
            }
          }
        }

        /**
                 * Updates the plugin and DOM to the current options.
                 * This method should only be called if a update is 100% required.
                 * @param updateHints A objects which contains hints for this update:
                 * {
                 *   _hostSizeChanged : boolean,
                 *   _contentSizeChanged : boolean,
                 *   _force : boolean,                             == preventSwallowing
                 *   _changedOptions : { },                        == preventSwallowing && preventSleep
                *  }
                 */
        function update(updateHints) {
          clearTimeout(_swallowedUpdateTimeout)
          updateHints = updateHints || {}
          _swallowedUpdateHints._hostSizeChanged |= updateHints._hostSizeChanged
          _swallowedUpdateHints._contentSizeChanged |= updateHints._contentSizeChanged
          _swallowedUpdateHints._force |= updateHints._force

          const now = COMPATIBILITY.now()
          let hostSizeChanged = Boolean(_swallowedUpdateHints._hostSizeChanged)
          let contentSizeChanged = Boolean(_swallowedUpdateHints._contentSizeChanged)
          const force = Boolean(_swallowedUpdateHints._force)
          const changedOptions = updateHints._changedOptions
          const swallow = _swallowUpdateLag > 0 && _initialized && !_destroyed && !force && !changedOptions && now - _lastUpdateTime < _swallowUpdateLag && (!_heightAutoCache && !_widthAutoCache)
          let displayIsHidden

          if (swallow) {
            _swallowedUpdateTimeout = setTimeout(update, _swallowUpdateLag)
          }

          // abort update due to:
          // destroyed
          // swallowing
          // sleeping
          // host is hidden or has false display
          if (_destroyed || swallow || _sleeping && !changedOptions || _initialized && !force && (displayIsHidden = _hostElement.is(':hidden')) || _hostElement.css('display') === 'inline') {
            return
          }

          _lastUpdateTime = now
          _swallowedUpdateHints = {}

          // if scrollbar styling is possible and native scrollbars aren't overlaid the scrollbar styling will be applied which hides the native scrollbars completely.
          if (_nativeScrollbarStyling && !(_nativeScrollbarIsOverlaid.x && _nativeScrollbarIsOverlaid.y)) {
            // native scrollbars are hidden, so change the values to zero
            _nativeScrollbarSize.x = 0
            _nativeScrollbarSize.y = 0
          } else {
            // refresh native scrollbar size (in case of zoom)
            _nativeScrollbarSize = extendDeep({}, globals.nativeScrollbarSize)
          }

          // Scrollbar padding is needed for firefox, because firefox hides scrollbar automatically if the size of the div is too small.
          // The calculation: [scrollbar size +3 *3]
          // (+3 because of possible decoration e.g. borders, margins etc., but only if native scrollbar is NOT a overlaid scrollbar)
          // (*3 because (1)increase / (2)decrease -button and (3)resize handle)
          _nativeScrollbarMinSize = {
            x: (_nativeScrollbarSize.x + (_nativeScrollbarIsOverlaid.x ? 0 : 3)) * 3,
            y: (_nativeScrollbarSize.y + (_nativeScrollbarIsOverlaid.y ? 0 : 3)) * 3
          }

          // changedOptions = changedOptions || { };
          // freezeResizeObserver(_sizeObserverElement, true);
          // freezeResizeObserver(_sizeAutoObserverElement, true);

          const checkCacheAutoForce = function () {
            return checkCache.apply(this, [].slice.call(arguments).concat([force]))
          }

          // save current scroll offset
          const currScroll = {
            x: _viewportElement[_strScrollLeft](),
            y: _viewportElement[_strScrollTop]()
          }

          const currentPreparedOptionsScrollbars = _currentPreparedOptions.scrollbars
          const currentPreparedOptionsTextarea = _currentPreparedOptions.textarea

          // scrollbars visibility:
          const scrollbarsVisibility = currentPreparedOptionsScrollbars.visibility
          const scrollbarsVisibilityChanged = checkCacheAutoForce(scrollbarsVisibility, _scrollbarsVisibilityCache)

          // scrollbars autoHide:
          const scrollbarsAutoHide = currentPreparedOptionsScrollbars.autoHide
          const scrollbarsAutoHideChanged = checkCacheAutoForce(scrollbarsAutoHide, _scrollbarsAutoHideCache)

          // scrollbars click scrolling
          const scrollbarsClickScrolling = currentPreparedOptionsScrollbars.clickScrolling
          const scrollbarsClickScrollingChanged = checkCacheAutoForce(scrollbarsClickScrolling, _scrollbarsClickScrollingCache)

          // scrollbars drag scrolling
          const scrollbarsDragScrolling = currentPreparedOptionsScrollbars.dragScrolling
          const scrollbarsDragScrollingChanged = checkCacheAutoForce(scrollbarsDragScrolling, _scrollbarsDragScrollingCache)

          // className
          const className = _currentPreparedOptions.className
          const classNameChanged = checkCacheAutoForce(className, _classNameCache)

          // resize
          const resize = _currentPreparedOptions.resize
          const resizeChanged = checkCacheAutoForce(resize, _resizeCache) && !_isBody // body can't be resized since the window itself acts as resize possibility.

          // paddingAbsolute
          const paddingAbsolute = _currentPreparedOptions.paddingAbsolute
          const paddingAbsoluteChanged = checkCacheAutoForce(paddingAbsolute, _paddingAbsoluteCache)

          // clipAlways
          const clipAlways = _currentPreparedOptions.clipAlways
          const clipAlwaysChanged = checkCacheAutoForce(clipAlways, _clipAlwaysCache)

          // sizeAutoCapable
          const sizeAutoCapable = _currentPreparedOptions.sizeAutoCapable && !_isBody // body can never be size auto, because it shall be always as big as the viewport.
          const sizeAutoCapableChanged = checkCacheAutoForce(sizeAutoCapable, _sizeAutoCapableCache)

          // showNativeScrollbars
          let ignoreOverlayScrollbarHiding = _currentPreparedOptions.nativeScrollbarsOverlaid.showNativeScrollbars
          const ignoreOverlayScrollbarHidingChanged = checkCacheAutoForce(ignoreOverlayScrollbarHiding, _ignoreOverlayScrollbarHidingCache)

          // autoUpdate
          const autoUpdate = _currentPreparedOptions.autoUpdate
          const autoUpdateChanged = checkCacheAutoForce(autoUpdate, _autoUpdateCache)

          // overflowBehavior
          const overflowBehavior = _currentPreparedOptions.overflowBehavior
          const overflowBehaviorChanged = checkCacheAutoForce(overflowBehavior, _overflowBehaviorCache, force)

          // dynWidth:
          const textareaDynWidth = currentPreparedOptionsTextarea.dynWidth
          const textareaDynWidthChanged = checkCacheAutoForce(_textareaDynWidthCache, textareaDynWidth)

          // dynHeight:
          const textareaDynHeight = currentPreparedOptionsTextarea.dynHeight
          const textareaDynHeightChanged = checkCacheAutoForce(_textareaDynHeightCache, textareaDynHeight)

          // scrollbars visibility
          _scrollbarsAutoHideNever = scrollbarsAutoHide === 'n'
          _scrollbarsAutoHideScroll = scrollbarsAutoHide === 's'
          _scrollbarsAutoHideMove = scrollbarsAutoHide === 'm'
          _scrollbarsAutoHideLeave = scrollbarsAutoHide === 'l'

          // scrollbars autoHideDelay
          _scrollbarsAutoHideDelay = currentPreparedOptionsScrollbars.autoHideDelay

          // old className
          _oldClassName = _classNameCache

          // resize
          _resizeNone = resize === 'n'
          _resizeBoth = resize === 'b'
          _resizeHorizontal = resize === 'h'
          _resizeVertical = resize === 'v'

          // normalizeRTL
          _normalizeRTLCache = _currentPreparedOptions.normalizeRTL

          // ignore overlay scrollbar hiding
          ignoreOverlayScrollbarHiding = ignoreOverlayScrollbarHiding && (_nativeScrollbarIsOverlaid.x && _nativeScrollbarIsOverlaid.y)

          // refresh options cache
          _scrollbarsVisibilityCache = scrollbarsVisibility
          _scrollbarsAutoHideCache = scrollbarsAutoHide
          _scrollbarsClickScrollingCache = scrollbarsClickScrolling
          _scrollbarsDragScrollingCache = scrollbarsDragScrolling
          _classNameCache = className
          _resizeCache = resize
          _paddingAbsoluteCache = paddingAbsolute
          _clipAlwaysCache = clipAlways
          _sizeAutoCapableCache = sizeAutoCapable
          _ignoreOverlayScrollbarHidingCache = ignoreOverlayScrollbarHiding
          _autoUpdateCache = autoUpdate
          _overflowBehaviorCache = extendDeep({}, overflowBehavior)
          _textareaDynWidthCache = textareaDynWidth
          _textareaDynHeightCache = textareaDynHeight
          _hasOverflowCache = _hasOverflowCache || {
            x: false,
            y: false
          }

          // set correct class name to the host element
          if (classNameChanged) {
            removeClass(_hostElement, _oldClassName + _strSpace + _classNameThemeNone)
            addClass(_hostElement, className !== undefined && className !== null && className.length > 0 ? className : _classNameThemeNone)
          }

          // set correct auto Update
          if (autoUpdateChanged) {
            if (autoUpdate === true) {
              disconnectMutationObservers()
              autoUpdateLoop.add(_base)
            } else if (autoUpdate === null) {
              if (_autoUpdateRecommended) {
                disconnectMutationObservers()
                autoUpdateLoop.add(_base)
              } else {
                autoUpdateLoop.remove(_base)
                connectMutationObservers()
              }
            } else {
              autoUpdateLoop.remove(_base)
              connectMutationObservers()
            }
          }

          // activate or deactivate size auto capability
          if (sizeAutoCapableChanged) {
            if (sizeAutoCapable) {
              if (!_contentGlueElement) {
                _contentGlueElement = FRAMEWORK(generateDiv(_classNameContentGlueElement))
                _paddingElement.before(_contentGlueElement)
              } else {
                _contentGlueElement.show()
              }
              if (_sizeAutoObserverAdded) {
                _sizeAutoObserverElement.show()
              } else {
                _sizeAutoObserverElement = FRAMEWORK(generateDiv(_classNameSizeAutoObserverElement))
                _sizeAutoObserverElementNative = _sizeAutoObserverElement[0]

                _contentGlueElement.before(_sizeAutoObserverElement)
                let oldSize = {
                  w: -1,
                  h: -1
                }
                setupResizeObserver(_sizeAutoObserverElement, () => {
                  const newSize = {
                    w: _sizeAutoObserverElementNative[LEXICON.oW],
                    h: _sizeAutoObserverElementNative[LEXICON.oH]
                  }
                  if (checkCache(newSize, oldSize)) {
                    if (_initialized && (_heightAutoCache && newSize.h > 0) || _widthAutoCache && newSize.w > 0) {
                      update()
                    } else if (_initialized && (!_heightAutoCache && newSize.h === 0) || !_widthAutoCache && newSize.w === 0) {
                      update()
                    }
                  }
                  oldSize = newSize
                })
                _sizeAutoObserverAdded = true
                // fix heightAuto detector bug if height is fixed but contentHeight is 0.
                // the probability this bug will ever happen is very very low, thats why its ok if we use calc which isn't supported in IE8.
                if (_cssCalc !== null) {
                  _sizeAutoObserverElement.css(_strHeight, `${_cssCalc}(100% + 1px)`)
                }
              }
            } else {
              if (_sizeAutoObserverAdded) {
                _sizeAutoObserverElement.hide()
              }
              if (_contentGlueElement) {
                _contentGlueElement.hide()
              }
            }
          }

          // if force, update all resizeObservers too
          if (force) {
            _sizeObserverElement.find('*').trigger(_strScroll)
            if (_sizeAutoObserverAdded) {
              _sizeAutoObserverElement.find('*').trigger(_strScroll)
            }
          }

          // display hidden:
          displayIsHidden = displayIsHidden === undefined ? _hostElement.is(':hidden') : displayIsHidden
          const displayIsHiddenChanged = checkCacheAutoForce(displayIsHidden, _displayIsHiddenCache)

          // textarea AutoWrapping:
          const textareaAutoWrapping = _isTextarea ? _targetElement.attr('wrap') !== 'off' : false
          const textareaAutoWrappingChanged = checkCacheAutoForce(textareaAutoWrapping, _textareaAutoWrappingCache)

          // detect direction:
          const cssDirection = _hostElement.css('direction')
          const cssDirectionChanged = checkCacheAutoForce(cssDirection, _cssDirectionCache)

          // detect box-sizing:
          const boxSizing = _hostElement.css('box-sizing')
          const boxSizingChanged = checkCacheAutoForce(boxSizing, _cssBoxSizingCache)

          // detect padding:
          const padding = {
            c: force,
            t: parseToZeroOrNumber(_hostElement.css(_strPaddingMinus + _strTop)),
            r: parseToZeroOrNumber(_hostElement.css(_strPaddingMinus + _strRight)),
            b: parseToZeroOrNumber(_hostElement.css(_strPaddingMinus + _strBottom)),
            l: parseToZeroOrNumber(_hostElement.css(_strPaddingMinus + _strLeft))
          }

          // width + height auto detecting var:
          let sizeAutoObserverElementBCRect
          // exception occurs in IE8 sometimes (unknown exception)
          try {
            sizeAutoObserverElementBCRect = _sizeAutoObserverAdded ? _sizeAutoObserverElementNative[LEXICON.bCR]() : null
          } catch (ex) {
            return
          }

          _isRTL = cssDirection === 'rtl'
          _isBorderBox = boxSizing === 'border-box'
          const isRTLLeft = _isRTL ? _strLeft : _strRight
          const isRTLRight = _isRTL ? _strRight : _strLeft

          // detect width auto:
          let widthAutoResizeDetection = false
          const widthAutoObserverDetection = _sizeAutoObserverAdded && _hostElement.css(_strFloat) !== 'none' /* || _isTextarea */ ? MATH.round(sizeAutoObserverElementBCRect.right - sizeAutoObserverElementBCRect.left) === 0 && (!paddingAbsolute ? _hostElementNative[LEXICON.cW] - _paddingX > 0 : true) : false
          if (sizeAutoCapable && !widthAutoObserverDetection) {
            const tmpCurrHostWidth = _hostElementNative[LEXICON.oW]
            const tmpCurrContentGlueWidth = _contentGlueElement.css(_strWidth)
            _contentGlueElement.css(_strWidth, _strAuto)

            let tmpNewHostWidth = _hostElementNative[LEXICON.oW]
            _contentGlueElement.css(_strWidth, tmpCurrContentGlueWidth)
            widthAutoResizeDetection = tmpCurrHostWidth !== tmpNewHostWidth
            if (!widthAutoResizeDetection) {
              _contentGlueElement.css(_strWidth, tmpCurrHostWidth + 1)
              tmpNewHostWidth = _hostElementNative[LEXICON.oW]
              _contentGlueElement.css(_strWidth, tmpCurrContentGlueWidth)
              widthAutoResizeDetection = tmpCurrHostWidth !== tmpNewHostWidth
            }
          }
          const widthAuto = (widthAutoObserverDetection || widthAutoResizeDetection) && sizeAutoCapable && !displayIsHidden
          const widthAutoChanged = checkCacheAutoForce(widthAuto, _widthAutoCache)
          const wasWidthAuto = !widthAuto && _widthAutoCache

          // detect height auto:
          const heightAuto = _sizeAutoObserverAdded && sizeAutoCapable && !displayIsHidden ? MATH.round(sizeAutoObserverElementBCRect.bottom - sizeAutoObserverElementBCRect.top) === 0 /* && (!paddingAbsolute && (_msieVersion > 9 || !_msieVersion) ? true : true) */ : false
          const heightAutoChanged = checkCacheAutoForce(heightAuto, _heightAutoCache)
          const wasHeightAuto = !heightAuto && _heightAutoCache

          // detect border:
          // we need the border only if border box and auto size
          const strMinusWidth = `-${_strWidth}`
          const updateBorderX = widthAuto && _isBorderBox || !_isBorderBox
          const updateBorderY = heightAuto && _isBorderBox || !_isBorderBox
          const border = {
            c: force,
            t: updateBorderY ? parseToZeroOrNumber(_hostElement.css(_strBorderMinus + _strTop + strMinusWidth), true) : 0,
            r: updateBorderX ? parseToZeroOrNumber(_hostElement.css(_strBorderMinus + _strRight + strMinusWidth), true) : 0,
            b: updateBorderY ? parseToZeroOrNumber(_hostElement.css(_strBorderMinus + _strBottom + strMinusWidth), true) : 0,
            l: updateBorderX ? parseToZeroOrNumber(_hostElement.css(_strBorderMinus + _strLeft + strMinusWidth), true) : 0
          }

          // detect margin:
          const margin = {
            c: force,
            t: parseToZeroOrNumber(_hostElement.css(_strMarginMinus + _strTop)),
            r: parseToZeroOrNumber(_hostElement.css(_strMarginMinus + _strRight)),
            b: parseToZeroOrNumber(_hostElement.css(_strMarginMinus + _strBottom)),
            l: parseToZeroOrNumber(_hostElement.css(_strMarginMinus + _strLeft))
          }

          // detect css max width & height:
          const cssMaxValue = {
            h: String(_hostElement.css(_strMaxMinus + _strHeight)),
            w: String(_hostElement.css(_strMaxMinus + _strWidth))
          }

          // vars to apply correct css
          let contentElementCSS = {}
          let contentGlueElementCSS = {}

          // funcs
          const getHostSize = function () {
            // has to be clientSize because offsetSize respect borders
            return {
              w: _hostElementNative[LEXICON.cW],
              h: _hostElementNative[LEXICON.cH]
            }
          }
          const getViewportSize = function () {
            // viewport size is padding container because it never has padding, margin and a border
            // determine zoom rounding error -> sometimes scrollWidth/Height is smaller than clientWidth/Height
            // if this happens add the difference to the viewportSize to compensate the rounding error
            return {
              w: _paddingElementNative[LEXICON.oW] + MATH.max(0, _contentElementNative[LEXICON.cW] - _contentElementNative[LEXICON.sW]),
              h: _paddingElementNative[LEXICON.oH] + MATH.max(0, _contentElementNative[LEXICON.cH] - _contentElementNative[LEXICON.sH])
            }
          }

          // set info for padding
          let paddingAbsoluteX = _paddingX = padding.l + padding.r
          let paddingAbsoluteY = _paddingY = padding.t + padding.b
          paddingAbsoluteX *= paddingAbsolute ? 1 : 0
          paddingAbsoluteY *= paddingAbsolute ? 1 : 0
          padding.c = checkCacheAutoForce(padding, _cssPaddingCache)

          // set info for border
          _borderX = border.l + border.r
          _borderY = border.t + border.b
          border.c = checkCacheAutoForce(border, _cssBorderCache)

          // set info for margin
          _marginX = margin.l + margin.r
          _marginY = margin.t + margin.b
          margin.c = checkCacheAutoForce(margin, _cssMarginCache)

          // set info for css max value
          cssMaxValue.ih = parseToZeroOrNumber(cssMaxValue.h) // ih = integer height
          cssMaxValue.iw = parseToZeroOrNumber(cssMaxValue.w) // iw = integer width
          cssMaxValue.ch = cssMaxValue.h.indexOf('px') > -1 // ch = correct height
          cssMaxValue.cw = cssMaxValue.w.indexOf('px') > -1 // cw = correct width
          cssMaxValue.c = checkCacheAutoForce(cssMaxValue, _cssMaxValueCache)

          // refresh cache
          _displayIsHiddenCache = displayIsHidden
          _textareaAutoWrappingCache = textareaAutoWrapping
          _cssDirectionCache = cssDirection
          _cssBoxSizingCache = boxSizing
          _widthAutoCache = widthAuto
          _heightAutoCache = heightAuto
          _cssPaddingCache = padding
          _cssBorderCache = border
          _cssMarginCache = margin
          _cssMaxValueCache = cssMaxValue

          // IEFix direction changed
          if (cssDirectionChanged && _sizeAutoObserverAdded) {
            _sizeAutoObserverElement.css(_strFloat, isRTLRight)
          }

          // apply padding:
          if (padding.c || cssDirectionChanged || paddingAbsoluteChanged || widthAutoChanged || heightAutoChanged || boxSizingChanged || sizeAutoCapableChanged) {
            var paddingElementCSS = {}
            const textareaCSS = {}
            setTopRightBottomLeft(contentGlueElementCSS, _strMarginMinus, [-padding.t, -padding.r, -padding.b, -padding.l])
            if (paddingAbsolute) {
              setTopRightBottomLeft(paddingElementCSS, _strEmpty, [padding.t, padding.r, padding.b, padding.l])
              if (_isTextarea) {
                setTopRightBottomLeft(textareaCSS, _strPaddingMinus)
              } else {
                setTopRightBottomLeft(contentElementCSS, _strPaddingMinus)
              }
            } else {
              setTopRightBottomLeft(paddingElementCSS, _strEmpty)
              if (_isTextarea) {
                setTopRightBottomLeft(textareaCSS, _strPaddingMinus, [padding.t, padding.r, padding.b, padding.l])
              } else {
                setTopRightBottomLeft(contentElementCSS, _strPaddingMinus, [padding.t, padding.r, padding.b, padding.l])
              }
            }
            _paddingElement.css(paddingElementCSS)
            _targetElement.css(textareaCSS)
          }

          // viewport size is padding container because it never has padding, margin and a border.
          _viewportSize = getViewportSize()

          // update Textarea
          const textareaSize = _isTextarea ? textareaUpdate() : false
          const textareaSizeChanged = _isTextarea && checkCacheAutoForce(textareaSize, _textareaSizeCache)
          const textareaDynOrigSize = _isTextarea && textareaSize ? {
            w: textareaDynWidth ? textareaSize._dynamicWidth : textareaSize._originalWidth,
            h: textareaDynHeight ? textareaSize._dynamicHeight : textareaSize._originalHeight
          } : {}
          _textareaSizeCache = textareaSize

          // fix height auto / width auto in cooperation with current padding & boxSizing behavior:
          if (heightAuto && (heightAutoChanged || paddingAbsoluteChanged || boxSizingChanged || cssMaxValue.c || padding.c || border.c)) {
            /*
                        if (cssMaxValue.ch)
                            contentElementCSS[_strMaxMinus + _strHeight] =
                                (cssMaxValue.ch ? (cssMaxValue.ih - paddingAbsoluteY + (_isBorderBox ? -_borderY : _paddingY))
                                : _strEmpty);
                        */
            contentElementCSS[_strHeight] = _strAuto
          } else if (heightAutoChanged || paddingAbsoluteChanged) {
            contentElementCSS[_strMaxMinus + _strHeight] = _strEmpty
            contentElementCSS[_strHeight] = _strHundredPercent
          }
          if (widthAuto && (widthAutoChanged || paddingAbsoluteChanged || boxSizingChanged || cssMaxValue.c || padding.c || border.c || cssDirectionChanged)) {
            /*
                        if (cssMaxValue.cw)
                            contentElementCSS[_strMaxMinus + _strWidth] =
                                (cssMaxValue.cw ? (cssMaxValue.iw - paddingAbsoluteX + (_isBorderBox ? -_borderX : _paddingX)) +
                                (_nativeScrollbarIsOverlaid.y ? _overlayScrollbarDummySize.y : 0)
                                : _strEmpty);
                        */
            contentElementCSS[_strWidth] = _strAuto
            contentGlueElementCSS[_strMaxMinus + _strWidth] = _strHundredPercent // IE Fix
          } else if (widthAutoChanged || paddingAbsoluteChanged) {
            contentElementCSS[_strMaxMinus + _strWidth] = _strEmpty
            contentElementCSS[_strWidth] = _strHundredPercent
            contentElementCSS[_strFloat] = _strEmpty
            contentGlueElementCSS[_strMaxMinus + _strWidth] = _strEmpty // IE Fix
          }
          if (widthAuto) {
            if (!cssMaxValue.cw) {
              contentElementCSS[_strMaxMinus + _strWidth] = _strEmpty
            }
            // textareaDynOrigSize.w || _strAuto :: doesnt works because applied margin will shift width
            contentGlueElementCSS[_strWidth] = _strAuto

            contentElementCSS[_strWidth] = _strAuto
            contentElementCSS[_strFloat] = isRTLRight
          } else {
            contentGlueElementCSS[_strWidth] = _strEmpty
          }
          if (heightAuto) {
            if (!cssMaxValue.ch) {
              contentElementCSS[_strMaxMinus + _strHeight] = _strEmpty
            }
            // textareaDynOrigSize.h || _contentElementNative[LEXICON.cH] :: use for anti scroll jumping
            contentGlueElementCSS[_strHeight] = textareaDynOrigSize.h || _contentElementNative[LEXICON.cH]
          } else {
            contentGlueElementCSS[_strHeight] = _strEmpty
          }
          if (sizeAutoCapable) {
            _contentGlueElement.css(contentGlueElementCSS)
          }
          _contentElement.css(contentElementCSS)

          // CHECKPOINT HERE ~
          contentElementCSS = {}
          contentGlueElementCSS = {}

          // if [content(host) client / scroll size, or target element direction, or content(host) max-sizes] changed, or force is true
          if (hostSizeChanged || contentSizeChanged || textareaSizeChanged || cssDirectionChanged || boxSizingChanged || paddingAbsoluteChanged || widthAutoChanged || widthAuto || heightAutoChanged || heightAuto || cssMaxValue.c || ignoreOverlayScrollbarHidingChanged || overflowBehaviorChanged || clipAlwaysChanged || resizeChanged || scrollbarsVisibilityChanged || scrollbarsAutoHideChanged || scrollbarsDragScrollingChanged || scrollbarsClickScrollingChanged || textareaDynWidthChanged || textareaDynHeightChanged || textareaAutoWrappingChanged) {
            const strOverflow = 'overflow'
            const strOverflowX = `${strOverflow}-x`
            const strOverflowY = `${strOverflow}-y`
            const strHidden = 'hidden'
            const strVisible = 'visible'

            // Reset the viewport (very important for natively overlaid scrollbars and zoom change
            // don't change the overflow prop as it is very expensive and affects performance !A LOT!
            if (!_nativeScrollbarStyling) {
              var viewportElementResetCSS = {}
              var resetXTmp = _hasOverflowCache.y && _hideOverflowCache.ys && !ignoreOverlayScrollbarHiding ? _nativeScrollbarIsOverlaid.y ? _viewportElement.css(isRTLLeft) : -_nativeScrollbarSize.y : 0
              var resetBottomTmp = _hasOverflowCache.x && _hideOverflowCache.xs && !ignoreOverlayScrollbarHiding ? _nativeScrollbarIsOverlaid.x ? _viewportElement.css(_strBottom) : -_nativeScrollbarSize.x : 0
              setTopRightBottomLeft(viewportElementResetCSS, _strEmpty)
              _viewportElement.css(viewportElementResetCSS)
            }

            // measure several sizes:
            const contentMeasureElement = getContentMeasureElement()
            // in Firefox content element has to have overflow hidden, else element margins aren't calculated properly, this element prevents this bug, but only if scrollbars aren't overlaid
            let contentSize = {
              // use clientSize because natively overlaidScrollbars add borders
              w: textareaDynOrigSize.w || contentMeasureElement[LEXICON.cW],
              h: textareaDynOrigSize.h || contentMeasureElement[LEXICON.cH]
            }
            const scrollSize = {
              w: contentMeasureElement[LEXICON.sW],
              h: contentMeasureElement[LEXICON.sH]
            }

            // apply the correct viewport style and measure viewport size
            if (!_nativeScrollbarStyling) {
              viewportElementResetCSS[_strBottom] = wasHeightAuto ? _strEmpty : resetBottomTmp
              viewportElementResetCSS[isRTLLeft] = wasWidthAuto ? _strEmpty : resetXTmp
              _viewportElement.css(viewportElementResetCSS)
            }
            _viewportSize = getViewportSize()

            // measure and correct several sizes
            let hostSize = getHostSize()
            const contentGlueSize = {
              // client/scrollSize + AbsolutePadding -> because padding is only applied to the paddingElement if its absolute, so you have to add it manually
              // hostSize is clientSize -> so padding should be added manually, right? FALSE! Because content glue is inside hostElement, so we don't have to worry about padding
              w: MATH.max((widthAuto ? contentSize.w : scrollSize.w) + paddingAbsoluteX, hostSize.w),
              h: MATH.max((heightAuto ? contentSize.h : scrollSize.h) + paddingAbsoluteY, hostSize.h)
            }
            contentGlueSize.c = checkCacheAutoForce(contentGlueSize, _contentGlueSizeCache)
            _contentGlueSizeCache = contentGlueSize

            // apply correct contentGlue size
            if (sizeAutoCapable) {
              // size contentGlue correctly to make sure the element has correct size if the sizing switches to auto
              if (contentGlueSize.c || (heightAuto || widthAuto)) {
                contentGlueElementCSS[_strWidth] = contentGlueSize.w
                contentGlueElementCSS[_strHeight] = contentGlueSize.h

                // textarea-sizes are already calculated correctly at this point
                if (!_isTextarea) {
                  contentSize = {
                    // use clientSize because natively overlaidScrollbars add borders
                    w: contentMeasureElement[LEXICON.cW],
                    h: contentMeasureElement[LEXICON.cH]
                  }
                }
              }
              const textareaCoverCSS = {}
              const setContentGlueElementCSSfunction = function (horizontal) {
                const scrollbarVars = getScrollbarVars(horizontal)
                const wh = scrollbarVars._w_h
                const strWH = scrollbarVars._width_height
                const autoSize = horizontal ? widthAuto : heightAuto
                const borderSize = horizontal ? _borderX : _borderY
                const paddingSize = horizontal ? _paddingX : _paddingY
                const marginSize = horizontal ? _marginX : _marginY
                const maxSize = contentGlueElementCSS[strWH] + (_isBorderBox ? borderSize : -paddingSize)

                // make contentGlue size -1 if element is not auto sized, to make sure that a resize event happens when the element shrinks
                if (!autoSize || !autoSize && border.c) {
                  contentGlueElementCSS[strWH] = hostSize[wh] - (_isBorderBox ? 0 : paddingSize + borderSize) - 1 - marginSize
                }

                // if size is auto and host is same size as max size, make content glue size +1 to make sure size changes will be detected
                if (autoSize && cssMaxValue[`c${wh}`] && cssMaxValue[`i${wh}`] === maxSize) {
                  contentGlueElementCSS[strWH] = maxSize + (_isBorderBox ? 0 : paddingSize) + 1
                }

                // if size is auto and host is smaller than size as min size, make content glue size -1 to make sure size changes will be detected (this is only needed if padding is 0)
                if (autoSize && contentSize[wh] < _viewportSize[wh] && (horizontal && _isTextarea ? !textareaAutoWrapping : true)) {
                  if (_isTextarea) {
                    textareaCoverCSS[strWH] = parseToZeroOrNumber(_textareaCoverElement.css(strWH)) - 1
                  }
                  contentGlueElementCSS[strWH] -= 1
                }

                // make sure content glue size is at least 1
                if (contentSize[wh] > 0) {
                  contentGlueElementCSS[strWH] = MATH.max(1, contentGlueElementCSS[strWH])
                }
              }
              setContentGlueElementCSSfunction(true)
              setContentGlueElementCSSfunction(false)

              if (_isTextarea) {
                _textareaCoverElement.css(textareaCoverCSS)
              }
              _contentGlueElement.css(contentGlueElementCSS)
            }
            if (widthAuto) {
              contentElementCSS[_strWidth] = _strHundredPercent
            }
            if (widthAuto && !_isBorderBox && !_mutationObserversConnected) {
              contentElementCSS[_strFloat] = 'none'
            }

            // apply and reset content style
            _contentElement.css(contentElementCSS)
            contentElementCSS = {}

            // measure again, but this time all correct sizes:
            const contentScrollSize = {
              w: contentMeasureElement[LEXICON.sW],
              h: contentMeasureElement[LEXICON.sH]
            }
            contentScrollSize.c = contentSizeChanged = checkCacheAutoForce(contentScrollSize, _contentScrollSizeCache)
            _contentScrollSizeCache = contentScrollSize

            // refresh viewport size after correct measuring
            _viewportSize = getViewportSize()

            hostSize = getHostSize()
            hostSizeChanged = checkCacheAutoForce(hostSize, _hostSizeCache)
            _hostSizeCache = hostSize

            const hideOverflowForceTextarea = _isTextarea && (_viewportSize.w === 0 || _viewportSize.h === 0)
            const previousOverflowAmount = _overflowAmountCache
            const overflowBehaviorIsVS = {}
            const overflowBehaviorIsVH = {}
            const overflowBehaviorIsS = {}
            const overflowAmount = {}
            const hasOverflow = {}
            const hideOverflow = {}
            const canScroll = {}
            const viewportRect = _paddingElementNative[LEXICON.bCR]()
            const setOverflowVariables = function (horizontal) {
              const scrollbarVars = getScrollbarVars(horizontal)
              const scrollbarVarsInverted = getScrollbarVars(!horizontal)
              const xyI = scrollbarVarsInverted._x_y
              const xy = scrollbarVars._x_y
              const wh = scrollbarVars._w_h
              const widthHeight = scrollbarVars._width_height
              const scrollMax = `${_strScroll + scrollbarVars._Left_Top}Max`
              const fractionalOverflowAmount = viewportRect[widthHeight] ? MATH.abs(viewportRect[widthHeight] - _viewportSize[wh]) : 0
              const checkFractionalOverflowAmount = previousOverflowAmount && previousOverflowAmount[xy] > 0 && _viewportElementNative[scrollMax] === 0
              overflowBehaviorIsVS[xy] = overflowBehavior[xy] === 'v-s'
              overflowBehaviorIsVH[xy] = overflowBehavior[xy] === 'v-h'
              overflowBehaviorIsS[xy] = overflowBehavior[xy] === 's'
              overflowAmount[xy] = MATH.max(0, MATH.round((contentScrollSize[wh] - _viewportSize[wh]) * 100) / 100)
              overflowAmount[xy] *= hideOverflowForceTextarea || checkFractionalOverflowAmount && fractionalOverflowAmount > 0 && fractionalOverflowAmount < 1 ? 0 : 1
              hasOverflow[xy] = overflowAmount[xy] > 0

              // hideOverflow:
              // x || y : true === overflow is hidden by "overflow: scroll" OR "overflow: hidden"
              // xs || ys : true === overflow is hidden by "overflow: scroll"
              hideOverflow[xy] = overflowBehaviorIsVS[xy] || overflowBehaviorIsVH[xy] ? hasOverflow[xyI] && !overflowBehaviorIsVS[xyI] && !overflowBehaviorIsVH[xyI] : hasOverflow[xy]
              hideOverflow[`${xy}s`] = hideOverflow[xy] ? overflowBehaviorIsS[xy] || overflowBehaviorIsVS[xy] : false

              canScroll[xy] = hasOverflow[xy] && hideOverflow[`${xy}s`]
            }
            setOverflowVariables(true)
            setOverflowVariables(false)

            overflowAmount.c = checkCacheAutoForce(overflowAmount, _overflowAmountCache)
            _overflowAmountCache = overflowAmount
            hasOverflow.c = checkCacheAutoForce(hasOverflow, _hasOverflowCache)
            _hasOverflowCache = hasOverflow
            hideOverflow.c = checkCacheAutoForce(hideOverflow, _hideOverflowCache)
            _hideOverflowCache = hideOverflow

            // if native scrollbar is overlay at x OR y axis, prepare DOM
            if (_nativeScrollbarIsOverlaid.x || _nativeScrollbarIsOverlaid.y) {
              const borderDesign = 'px solid transparent'
              const contentArrangeElementCSS = {}
              const arrangeContent = {}
              let arrangeChanged = force
              let setContentElementCSS

              if (hasOverflow.x || hasOverflow.y) {
                arrangeContent.w = _nativeScrollbarIsOverlaid.y && hasOverflow.y ? contentScrollSize.w + _overlayScrollbarDummySize.y : _strEmpty
                arrangeContent.h = _nativeScrollbarIsOverlaid.x && hasOverflow.x ? contentScrollSize.h + _overlayScrollbarDummySize.x : _strEmpty
                arrangeChanged = checkCacheAutoForce(arrangeContent, _arrangeContentSizeCache)
                _arrangeContentSizeCache = arrangeContent
              }

              if (hasOverflow.c || hideOverflow.c || contentScrollSize.c || cssDirectionChanged || widthAutoChanged || heightAutoChanged || widthAuto || heightAuto || ignoreOverlayScrollbarHidingChanged) {
                contentElementCSS[_strMarginMinus + isRTLRight] = contentElementCSS[_strBorderMinus + isRTLRight] = _strEmpty
                setContentElementCSS = function (horizontal) {
                  const scrollbarVars = getScrollbarVars(horizontal)
                  const scrollbarVarsInverted = getScrollbarVars(!horizontal)
                  const xy = scrollbarVars._x_y
                  const strDirection = horizontal ? _strBottom : isRTLLeft
                  const invertedAutoSize = horizontal ? heightAuto : widthAuto

                  if (_nativeScrollbarIsOverlaid[xy] && hasOverflow[xy] && hideOverflow[`${xy}s`]) {
                    contentElementCSS[_strMarginMinus + strDirection] = invertedAutoSize ? ignoreOverlayScrollbarHiding ? _strEmpty : _overlayScrollbarDummySize[xy] : _strEmpty
                    contentElementCSS[_strBorderMinus + strDirection] = (horizontal ? !invertedAutoSize : true) && !ignoreOverlayScrollbarHiding ? _overlayScrollbarDummySize[xy] + borderDesign : _strEmpty
                  } else {
                    arrangeContent[scrollbarVarsInverted._w_h] =
                                            contentElementCSS[_strMarginMinus + strDirection] =
                                            contentElementCSS[_strBorderMinus + strDirection] = _strEmpty
                    arrangeChanged = true
                  }
                }

                if (_nativeScrollbarStyling) {
                  if (ignoreOverlayScrollbarHiding) {
                    removeClass(_viewportElement, _classNameViewportNativeScrollbarsInvisible)
                  } else {
                    addClass(_viewportElement, _classNameViewportNativeScrollbarsInvisible)
                  }
                } else {
                  setContentElementCSS(true)
                  setContentElementCSS(false)
                }
              }
              if (ignoreOverlayScrollbarHiding) {
                arrangeContent.w = arrangeContent.h = _strEmpty
                arrangeChanged = true
              }
              if (arrangeChanged && !_nativeScrollbarStyling) {
                contentArrangeElementCSS[_strWidth] = hideOverflow.y ? arrangeContent.w : _strEmpty
                contentArrangeElementCSS[_strHeight] = hideOverflow.x ? arrangeContent.h : _strEmpty

                if (!_contentArrangeElement) {
                  _contentArrangeElement = FRAMEWORK(generateDiv(_classNameContentArrangeElement))
                  _viewportElement.prepend(_contentArrangeElement)
                }
                _contentArrangeElement.css(contentArrangeElementCSS)
              }
              _contentElement.css(contentElementCSS)
            }

            let viewportElementCSS = {}
            var paddingElementCSS = {}
            let setViewportCSS
            if (hostSizeChanged || hasOverflow.c || hideOverflow.c || contentScrollSize.c || overflowBehaviorChanged || boxSizingChanged || ignoreOverlayScrollbarHidingChanged || cssDirectionChanged || clipAlwaysChanged || heightAutoChanged) {
              viewportElementCSS[isRTLRight] = _strEmpty
              setViewportCSS = function (horizontal) {
                const scrollbarVars = getScrollbarVars(horizontal)
                const scrollbarVarsInverted = getScrollbarVars(!horizontal)
                const xy = scrollbarVars._x_y
                const XY = scrollbarVars._X_Y
                const strDirection = horizontal ? _strBottom : isRTLLeft

                const reset = function () {
                  viewportElementCSS[strDirection] = _strEmpty
                  _contentBorderSize[scrollbarVarsInverted._w_h] = 0
                }
                if (hasOverflow[xy] && hideOverflow[`${xy}s`]) {
                  viewportElementCSS[strOverflow + XY] = _strScroll
                  if (ignoreOverlayScrollbarHiding || _nativeScrollbarStyling) {
                    reset()
                  } else {
                    viewportElementCSS[strDirection] = -(_nativeScrollbarIsOverlaid[xy] ? _overlayScrollbarDummySize[xy] : _nativeScrollbarSize[xy])
                    _contentBorderSize[scrollbarVarsInverted._w_h] = _nativeScrollbarIsOverlaid[xy] ? _overlayScrollbarDummySize[scrollbarVarsInverted._x_y] : 0
                  }
                } else {
                  viewportElementCSS[strOverflow + XY] = _strEmpty
                  reset()
                }
              }
              setViewportCSS(true)
              setViewportCSS(false)

              // if the scroll container is too small and if there is any overflow with no overlay scrollbar (and scrollbar styling isn't possible),
              // make viewport element greater in size (Firefox hide Scrollbars fix)
              // because firefox starts hiding scrollbars on too small elements
              // with this behavior the overflow calculation may be incorrect or the scrollbars would appear suddenly
              // https://bugzilla.mozilla.org/show_bug.cgi?id=292284
              if (!_nativeScrollbarStyling &&
                                (_viewportSize.h < _nativeScrollbarMinSize.x || _viewportSize.w < _nativeScrollbarMinSize.y) &&
                                (hasOverflow.x && hideOverflow.x && !_nativeScrollbarIsOverlaid.x || hasOverflow.y && hideOverflow.y && !_nativeScrollbarIsOverlaid.y)) {
                viewportElementCSS[_strPaddingMinus + _strTop] = _nativeScrollbarMinSize.x
                viewportElementCSS[_strMarginMinus + _strTop] = -_nativeScrollbarMinSize.x

                viewportElementCSS[_strPaddingMinus + isRTLRight] = _nativeScrollbarMinSize.y
                viewportElementCSS[_strMarginMinus + isRTLRight] = -_nativeScrollbarMinSize.y
              } else {
                viewportElementCSS[_strPaddingMinus + _strTop] =
                                    viewportElementCSS[_strMarginMinus + _strTop] =
                                    viewportElementCSS[_strPaddingMinus + isRTLRight] =
                                    viewportElementCSS[_strMarginMinus + isRTLRight] = _strEmpty
              }
              viewportElementCSS[_strPaddingMinus + isRTLLeft] =
                                viewportElementCSS[_strMarginMinus + isRTLLeft] = _strEmpty

              // if there is any overflow (x OR y axis) and this overflow shall be hidden, make overflow hidden, else overflow visible
              if (hasOverflow.x && hideOverflow.x || hasOverflow.y && hideOverflow.y || hideOverflowForceTextarea) {
                // only hide if is Textarea
                if (_isTextarea && hideOverflowForceTextarea) {
                  paddingElementCSS[strOverflowX] =
                                        paddingElementCSS[strOverflowY] = strHidden
                }
              } else if (!clipAlways || (overflowBehaviorIsVH.x || overflowBehaviorIsVS.x || overflowBehaviorIsVH.y || overflowBehaviorIsVS.y)) {
                // only un-hide if Textarea
                if (_isTextarea) {
                  paddingElementCSS[strOverflowX] =
                                            paddingElementCSS[strOverflowY] = _strEmpty
                }
                viewportElementCSS[strOverflowX] =
                                        viewportElementCSS[strOverflowY] = strVisible
              }

              _paddingElement.css(paddingElementCSS)
              _viewportElement.css(viewportElementCSS)
              viewportElementCSS = {}

              // force soft redraw in webkit because without the scrollbars will may appear because DOM wont be redrawn under special conditions
              if ((hasOverflow.c || boxSizingChanged || widthAutoChanged || heightAutoChanged) && !(_nativeScrollbarIsOverlaid.x && _nativeScrollbarIsOverlaid.y)) {
                const elementStyle = _contentElementNative[LEXICON.s]
                let dump
                elementStyle.webkitTransform = 'scale(1)'
                elementStyle.display = 'run-in'
                dump = _contentElementNative[LEXICON.oH]
                elementStyle.display = _strEmpty // || dump; //use dump to prevent it from deletion if minify
                elementStyle.webkitTransform = _strEmpty
              }
              /*
                            //force hard redraw in webkit if native overlaid scrollbars shall appear
                            if (ignoreOverlayScrollbarHidingChanged && ignoreOverlayScrollbarHiding) {
                                _hostElement.hide();
                                var dump = _hostElementNative[LEXICON.oH];
                                _hostElement.show();
                            }
                            */
            }

            // change to direction RTL and width auto Bugfix in Webkit
            // without this fix, the DOM still thinks the scrollbar is LTR and thus the content is shifted to the left
            contentElementCSS = {}
            if (cssDirectionChanged || widthAutoChanged || heightAutoChanged) {
              if (_isRTL && widthAuto) {
                const floatTmp = _contentElement.css(_strFloat)
                const posLeftWithoutFloat = MATH.round(_contentElement.css(_strFloat, _strEmpty).css(_strLeft, _strEmpty).position().left)
                _contentElement.css(_strFloat, floatTmp)
                const posLeftWithFloat = MATH.round(_contentElement.position().left)

                if (posLeftWithoutFloat !== posLeftWithFloat) {
                  contentElementCSS[_strLeft] = posLeftWithoutFloat
                }
              } else {
                contentElementCSS[_strLeft] = _strEmpty
              }
            }
            _contentElement.css(contentElementCSS)

            // handle scroll position
            if (_isTextarea && contentSizeChanged) {
              const textareaInfo = getTextareaInfo()
              if (textareaInfo) {
                const textareaRowsChanged = _textareaInfoCache === undefined ? true : textareaInfo._rows !== _textareaInfoCache._rows
                const cursorRow = textareaInfo._cursorRow
                const cursorCol = textareaInfo._cursorColumn
                const widestRow = textareaInfo._widestRow
                const lastRow = textareaInfo._rows
                const lastCol = textareaInfo._columns
                const cursorPos = textareaInfo._cursorPosition
                const cursorMax = textareaInfo._cursorMax
                const cursorIsLastPosition = cursorPos >= cursorMax && _textareaHasFocus
                const textareaScrollAmount = {
                  x: !textareaAutoWrapping && (cursorCol === lastCol && cursorRow === widestRow) ? _overflowAmountCache.x : -1,
                  y: (textareaAutoWrapping ? cursorIsLastPosition || textareaRowsChanged && (previousOverflowAmount ? currScroll.y === previousOverflowAmount.y : false) : (cursorIsLastPosition || textareaRowsChanged) && cursorRow === lastRow) ? _overflowAmountCache.y : -1
                }
                currScroll.x = textareaScrollAmount.x > -1 ? _isRTL && _normalizeRTLCache && _rtlScrollBehavior.i ? 0 : textareaScrollAmount.x : currScroll.x // if inverted, scroll to 0 -> normalized this means to max scroll offset.
                currScroll.y = textareaScrollAmount.y > -1 ? textareaScrollAmount.y : currScroll.y
              }
              _textareaInfoCache = textareaInfo
            }
            if (_isRTL && _rtlScrollBehavior.i && _nativeScrollbarIsOverlaid.y && hasOverflow.x && _normalizeRTLCache) {
              currScroll.x += _contentBorderSize.w || 0
            }
            if (widthAuto) {
              _hostElement[_strScrollLeft](0)
            }
            if (heightAuto) {
              _hostElement[_strScrollTop](0)
            }
            _viewportElement[_strScrollLeft](currScroll.x)[_strScrollTop](currScroll.y)

            // scrollbars management:
            const scrollbarsVisibilityVisible = scrollbarsVisibility === 'v'
            const scrollbarsVisibilityHidden = scrollbarsVisibility === 'h'
            const scrollbarsVisibilityAuto = scrollbarsVisibility === 'a'

            const showScrollbarH = COMPATIBILITY.bind(refreshScrollbarAppearance, 0, true, true, canScroll.x)
            const showScrollbarV = COMPATIBILITY.bind(refreshScrollbarAppearance, 0, false, true, canScroll.y)
            const hideScrollbarH = COMPATIBILITY.bind(refreshScrollbarAppearance, 0, true, false, canScroll.x)
            const hideScrollbarV = COMPATIBILITY.bind(refreshScrollbarAppearance, 0, false, false, canScroll.y)

            // manage class name which indicates scrollable overflow
            if (hideOverflow.x || hideOverflow.y) {
              addClass(_hostElement, _classNameHostOverflow)
            } else {
              removeClass(_hostElement, _classNameHostOverflow)
            }
            if (hideOverflow.x) {
              addClass(_hostElement, _classNameHostOverflowX)
            } else {
              removeClass(_hostElement, _classNameHostOverflowX)
            }
            if (hideOverflow.y) {
              addClass(_hostElement, _classNameHostOverflowY)
            } else {
              removeClass(_hostElement, _classNameHostOverflowY)
            }

            // add or remove rtl class name for styling purposes
            if (cssDirectionChanged) {
              if (_isRTL) {
                addClass(_hostElement, _classNameHostRTL)
              } else {
                removeClass(_hostElement, _classNameHostRTL)
              }
            }

            // manage the resize feature (CSS3 resize "polyfill" for this plugin)
            if (_isBody) {
              addClass(_hostElement, _classNameHostResizeDisabled)
            }
            if (resizeChanged) {
              removeClass(_scrollbarCornerElement, [
                _classNameScrollbarCornerResize,
                _classNameScrollbarCornerResizeB,
                _classNameScrollbarCornerResizeH,
                _classNameScrollbarCornerResizeV].join(_strSpace))
              if (_resizeNone) {
                addClass(_hostElement, _classNameHostResizeDisabled)
              } else {
                removeClass(_hostElement, _classNameHostResizeDisabled)
                addClass(_scrollbarCornerElement, _classNameScrollbarCornerResize)
                if (_resizeBoth) {
                  addClass(_scrollbarCornerElement, _classNameScrollbarCornerResizeB)
                } else if (_resizeHorizontal) {
                  addClass(_scrollbarCornerElement, _classNameScrollbarCornerResizeH)
                } else if (_resizeVertical) {
                  addClass(_scrollbarCornerElement, _classNameScrollbarCornerResizeV)
                }
              }
            }

            // manage the scrollbars general visibility + the scrollbar interactivity (unusable class name)
            if (scrollbarsVisibilityChanged || overflowBehaviorChanged || hideOverflow.c || hasOverflow.c || ignoreOverlayScrollbarHidingChanged) {
              if (ignoreOverlayScrollbarHiding) {
                if (ignoreOverlayScrollbarHidingChanged) {
                  removeClass(_hostElement, _classNameHostScrolling)
                  if (ignoreOverlayScrollbarHiding) {
                    hideScrollbarH()
                    hideScrollbarV()
                  }
                }
              } else if (scrollbarsVisibilityAuto) {
                if (canScroll.x) {
                  showScrollbarH()
                } else {
                  hideScrollbarH()
                }

                if (canScroll.y) {
                  showScrollbarV()
                } else {
                  hideScrollbarV()
                }
              } else if (scrollbarsVisibilityVisible) {
                showScrollbarH()
                showScrollbarV()
              } else if (scrollbarsVisibilityHidden) {
                hideScrollbarH()
                hideScrollbarV()
              }
            }

            // manage the scrollbars auto hide feature (auto hide them after specific actions)
            if (scrollbarsAutoHideChanged || ignoreOverlayScrollbarHidingChanged) {
              if (_scrollbarsAutoHideLeave || _scrollbarsAutoHideMove) {
                setupHostMouseTouchEvents(true)
                setupHostMouseTouchEvents()
              } else {
                setupHostMouseTouchEvents(true)
              }

              if (_scrollbarsAutoHideNever) {
                refreshScrollbarsAutoHide(true)
              } else {
                refreshScrollbarsAutoHide(false, true)
              }
            }

            // manage scrollbars handle length & offset - don't remove!
            if (hostSizeChanged || overflowAmount.c || heightAutoChanged || widthAutoChanged || resizeChanged || boxSizingChanged || paddingAbsoluteChanged || ignoreOverlayScrollbarHidingChanged || cssDirectionChanged) {
              refreshScrollbarHandleLength(true)
              refreshScrollbarHandleOffset(true)
              refreshScrollbarHandleLength(false)
              refreshScrollbarHandleOffset(false)
            }

            // manage interactivity
            if (scrollbarsClickScrollingChanged) {
              refreshScrollbarsInteractive(true, scrollbarsClickScrolling)
            }
            if (scrollbarsDragScrollingChanged) {
              refreshScrollbarsInteractive(false, scrollbarsDragScrolling)
            }

            // callbacks:
            if (cssDirectionChanged) {
              dispatchCallback('onDirectionChanged', {
                isRTL: _isRTL,
                dir: cssDirection
              })
            }
            if (hostSizeChanged) {
              dispatchCallback('onHostSizeChanged', {
                width: _hostSizeCache.w,
                height: _hostSizeCache.h
              })
            }
            if (contentSizeChanged) {
              dispatchCallback('onContentSizeChanged', {
                width: _contentScrollSizeCache.w,
                height: _contentScrollSizeCache.h
              })
            }
            if (hasOverflow.c || hideOverflow.c) {
              dispatchCallback('onOverflowChanged', {
                x: hasOverflow.x,
                y: hasOverflow.y,
                xScrollable: hideOverflow.xs,
                yScrollable: hideOverflow.ys,
                clipped: hideOverflow.x || hideOverflow.y
              })
            }
            if (overflowAmount.c) {
              dispatchCallback('onOverflowAmountChanged', {
                x: overflowAmount.x,
                y: overflowAmount.y
              })
            }
          }

          // fix body min size
          if (_isBody && _bodyMinSizeCache && (_hasOverflowCache.c || _bodyMinSizeCache.c)) {
            // its possible that no min size was measured until now, because the content arrange element was just added now, in this case, measure now the min size.
            if (!_bodyMinSizeCache.f) {
              bodyMinSizeChanged()
            }
            if (_nativeScrollbarIsOverlaid.y && _hasOverflowCache.x) {
              _contentElement.css(_strMinMinus + _strWidth, _bodyMinSizeCache.w + _overlayScrollbarDummySize.y)
            }
            if (_nativeScrollbarIsOverlaid.x && _hasOverflowCache.y) {
              _contentElement.css(_strMinMinus + _strHeight, _bodyMinSizeCache.h + _overlayScrollbarDummySize.x)
            }
            _bodyMinSizeCache.c = false
          }

          // freezeResizeObserver(_sizeObserverElement, false);
          // freezeResizeObserver(_sizeAutoObserverElement, false);

          dispatchCallback('onUpdated', {
            forced: force
          })
        }


        // ==== Options ====//

        /**
                 * Sets new options but doesn't call the update method.
                 * @param newOptions The object which contains the new options.
                 * @returns {*} A object which contains the changed options.
                 */
        function setOptions(newOptions) {
          const validatedOpts = _pluginsOptions._validate(newOptions, _pluginsOptions._template, true, _currentOptions)

          _currentOptions = extendDeep({}, _currentOptions, validatedOpts._default)
          _currentPreparedOptions = extendDeep({}, _currentPreparedOptions, validatedOpts._prepared)

          return validatedOpts._prepared
        }


        // ==== Structure ====//

        /**
                 * Builds or destroys the wrapper and helper DOM elements.
                 * @param destroy Indicates whether the DOM shall be build or destroyed.
                 */
        function setupStructureDOM(destroy) {
          const strParent = 'parent'
          const classNameResizeObserverHost = 'os-resize-observer-host'
          const classNameTextareaElementFull = _classNameTextareaElement + _strSpace + _classNameTextInherit
          const textareaClass = _isTextarea ? _strSpace + _classNameTextInherit : _strEmpty
          let adoptAttrs = _currentPreparedOptions.textarea.inheritedAttrs
          const adoptAttrsMap = {}
          const applyAdoptedAttrs = function () {
            const applyAdoptedAttrsElm = destroy ? _targetElement : _hostElement
            each(adoptAttrsMap, (key, value) => {
              if (type(value) == TYPES.s) {
                if (key == LEXICON.c) {
                  applyAdoptedAttrsElm.addClass(value)
                } else {
                  applyAdoptedAttrsElm.attr(key, value)
                }
              }
            })
          }
          const hostElementClassNames = [
            _classNameHostElement,
            _classNameHostTextareaElement,
            _classNameHostResizeDisabled,
            _classNameHostRTL,
            _classNameHostScrollbarHorizontalHidden,
            _classNameHostScrollbarVerticalHidden,
            _classNameHostTransition,
            _classNameHostScrolling,
            _classNameHostOverflow,
            _classNameHostOverflowX,
            _classNameHostOverflowY,
            _classNameThemeNone,
            _classNameTextareaElement,
            _classNameTextInherit,
            _classNameCache].join(_strSpace)
          const hostElementCSS = {}

          // get host element as first element, because that's the most upper element and required for the other elements
          _hostElement = _hostElement || (_isTextarea ? _domExists ? _targetElement[strParent]()[strParent]()[strParent]()[strParent]() : FRAMEWORK(generateDiv(_classNameHostTextareaElement)) : _targetElement)
          _contentElement = _contentElement || selectOrGenerateDivByClass(_classNameContentElement + textareaClass)
          _viewportElement = _viewportElement || selectOrGenerateDivByClass(_classNameViewportElement + textareaClass)
          _paddingElement = _paddingElement || selectOrGenerateDivByClass(_classNamePaddingElement + textareaClass)
          _sizeObserverElement = _sizeObserverElement || selectOrGenerateDivByClass(classNameResizeObserverHost)
          _textareaCoverElement = _textareaCoverElement || (_isTextarea ? selectOrGenerateDivByClass(_classNameTextareaCoverElement) : undefined)

          // on destroy, remove all generated class names from the host element before collecting the adopted attributes
          // to prevent adopting generated class names
          if (destroy) {
            removeClass(_hostElement, hostElementClassNames)
          }

          // collect all adopted attributes
          adoptAttrs = type(adoptAttrs) == TYPES.s ? adoptAttrs.split(_strSpace) : adoptAttrs
          if (type(adoptAttrs) == TYPES.a && _isTextarea) {
            each(adoptAttrs, (i, v) => {
              if (type(v) == TYPES.s) {
                adoptAttrsMap[v] = destroy ? _hostElement.attr(v) : _targetElement.attr(v)
              }
            })
          }

          if (!destroy) {
            if (_isTextarea) {
              if (!_currentPreparedOptions.sizeAutoCapable) {
                hostElementCSS[_strWidth] = _targetElement.css(_strWidth)
                hostElementCSS[_strHeight] = _targetElement.css(_strHeight)
              }

              if (!_domExists) {
                _targetElement.addClass(_classNameTextInherit).wrap(_hostElement)
              }

              // jQuery clones elements in wrap functions, so we have to select them again
              _hostElement = _targetElement[strParent]().css(hostElementCSS)
            }

            if (!_domExists) {
              // add the correct class to the target element
              addClass(_targetElement, _isTextarea ? classNameTextareaElementFull : _classNameHostElement)

              // wrap the content into the generated elements to create the required DOM
              _hostElement.wrapInner(_contentElement)
                .wrapInner(_viewportElement)
                .wrapInner(_paddingElement)
                .prepend(_sizeObserverElement)

              // jQuery clones elements in wrap functions, so we have to select them again
              _contentElement = findFirst(_hostElement, _strDot + _classNameContentElement)
              _viewportElement = findFirst(_hostElement, _strDot + _classNameViewportElement)
              _paddingElement = findFirst(_hostElement, _strDot + _classNamePaddingElement)

              if (_isTextarea) {
                _contentElement.prepend(_textareaCoverElement)
                applyAdoptedAttrs()
              }
            }

            if (_nativeScrollbarStyling) {
              addClass(_viewportElement, _classNameViewportNativeScrollbarsInvisible)
            }
            if (_nativeScrollbarIsOverlaid.x && _nativeScrollbarIsOverlaid.y) {
              addClass(_viewportElement, _classNameViewportNativeScrollbarsOverlaid)
            }
            if (_isBody) {
              addClass(_htmlElement, _classNameHTMLElement)
            }

            _sizeObserverElementNative = _sizeObserverElement[0]
            _hostElementNative = _hostElement[0]
            _paddingElementNative = _paddingElement[0]
            _viewportElementNative = _viewportElement[0]
            _contentElementNative = _contentElement[0]

            updateViewportAttrsFromTarget()
          } else {
            if (_domExists && _initialized) {
              // clear size observer
              _sizeObserverElement.children().remove()

              // remove the style property and classes from already generated elements
              each([_paddingElement, _viewportElement, _contentElement, _textareaCoverElement], (i, elm) => {
                if (elm) {
                  removeClass(elm.removeAttr(LEXICON.s), _classNamesDynamicDestroy)
                }
              })

              // add classes to the host element which was removed previously to match the expected DOM
              addClass(_hostElement, _isTextarea ? _classNameHostTextareaElement : _classNameHostElement)
            } else {
              // remove size observer
              remove(_sizeObserverElement)

              // unwrap the content to restore DOM
              _contentElement.contents()
                .unwrap()
                .unwrap()
                .unwrap()

              if (_isTextarea) {
                _targetElement.unwrap()
                remove(_hostElement)
                remove(_textareaCoverElement)
                applyAdoptedAttrs()
              }
            }

            if (_isTextarea) {
              _targetElement.removeAttr(LEXICON.s)
            }

            if (_isBody) {
              removeClass(_htmlElement, _classNameHTMLElement)
            }
          }
        }

        /**
                 * Adds or removes all wrapper elements interactivity events.
                 * @param destroy Indicates whether the Events shall be added or removed.
                 */
        function setupStructureEvents() {
          const textareaKeyDownRestrictedKeyCodes = [
            112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 123,    // F1 to F12
            33, 34,                                                   // page up, page down
            37, 38, 39, 40,                                           // left, up, right, down arrows
            16, 17, 18, 19, 20, 144                                   // Shift, Ctrl, Alt, Pause, CapsLock, NumLock
          ]
          let textareaKeyDownKeyCodesList = []
          let textareaUpdateIntervalID
          let scrollStopTimeoutId
          const scrollStopDelay = 175
          const strFocus = 'focus'

          function updateTextarea(doClearInterval) {
            textareaUpdate()
            _base.update(_strAuto)
            if (doClearInterval && _autoUpdateRecommended) {
              clearInterval(textareaUpdateIntervalID)
            }
          }
          function textareaOnScroll(event) {
            _targetElement[_strScrollLeft](_rtlScrollBehavior.i && _normalizeRTLCache ? 9999999 : 0)
            _targetElement[_strScrollTop](0)
            COMPATIBILITY.prvD(event)
            COMPATIBILITY.stpP(event)
            return false
          }
          function textareaOnDrop(event) {
            setTimeout(() => {
              if (!_destroyed) {
                updateTextarea()
              }
            }, 50)
          }
          function textareaOnFocus() {
            _textareaHasFocus = true
            addClass(_hostElement, strFocus)
          }
          function textareaOnFocusout() {
            _textareaHasFocus = false
            textareaKeyDownKeyCodesList = []
            removeClass(_hostElement, strFocus)
            updateTextarea(true)
          }
          function textareaOnKeyDown(event) {
            const keyCode = event.keyCode

            if (inArray(keyCode, textareaKeyDownRestrictedKeyCodes) < 0) {
              if (!textareaKeyDownKeyCodesList[LEXICON.l]) {
                updateTextarea()
                textareaUpdateIntervalID = setInterval(updateTextarea, 1000 / 60)
              }
              if (inArray(keyCode, textareaKeyDownKeyCodesList) < 0) {
                textareaKeyDownKeyCodesList.push(keyCode)
              }
            }
          }
          function textareaOnKeyUp(event) {
            const keyCode = event.keyCode
            const index = inArray(keyCode, textareaKeyDownKeyCodesList)

            if (inArray(keyCode, textareaKeyDownRestrictedKeyCodes) < 0) {
              if (index > -1) {
                textareaKeyDownKeyCodesList.splice(index, 1)
              }
              if (!textareaKeyDownKeyCodesList[LEXICON.l]) {
                updateTextarea(true)
              }
            }
          }
          function contentOnTransitionEnd(event) {
            if (_autoUpdateCache === true) {
              return
            }
            event = event.originalEvent || event
            if (isSizeAffectingCSSProperty(event.propertyName)) {
              _base.update(_strAuto)
            }
          }
          function viewportOnScroll(event) {
            if (!_sleeping) {
              if (scrollStopTimeoutId !== undefined) {
                clearTimeout(scrollStopTimeoutId)
              } else {
                if (_scrollbarsAutoHideScroll || _scrollbarsAutoHideMove) {
                  refreshScrollbarsAutoHide(true)
                }

                if (!nativeOverlayScrollbarsAreActive()) {
                  addClass(_hostElement, _classNameHostScrolling)
                }

                dispatchCallback('onScrollStart', event)
              }

              // if a scrollbars handle gets dragged, the mousemove event is responsible for refreshing the handle offset
              // because if CSS scroll-snap is used, the handle offset gets only refreshed on every snap point
              // this looks laggy & clunky, it looks much better if the offset refreshes with the mousemove
              if (!_scrollbarsHandlesDefineScrollPos) {
                refreshScrollbarHandleOffset(true)
                refreshScrollbarHandleOffset(false)
              }
              dispatchCallback('onScroll', event)

              scrollStopTimeoutId = setTimeout(() => {
                if (!_destroyed) {
                  // OnScrollStop:
                  clearTimeout(scrollStopTimeoutId)
                  scrollStopTimeoutId = undefined

                  if (_scrollbarsAutoHideScroll || _scrollbarsAutoHideMove) {
                    refreshScrollbarsAutoHide(false)
                  }

                  if (!nativeOverlayScrollbarsAreActive()) {
                    removeClass(_hostElement, _classNameHostScrolling)
                  }

                  dispatchCallback('onScrollStop', event)
                }
              }, scrollStopDelay)
            }
          }


          if (_isTextarea) {
            if (_msieVersion > 9 || !_autoUpdateRecommended) {
              addDestroyEventListener(_targetElement, 'input', updateTextarea)
            } else {
              addDestroyEventListener(_targetElement,
                [_strKeyDownEvent, _strKeyUpEvent],
                [textareaOnKeyDown, textareaOnKeyUp])
            }

            addDestroyEventListener(_targetElement,
              [_strScroll, 'drop', strFocus, `${strFocus}out`],
              [textareaOnScroll, textareaOnDrop, textareaOnFocus, textareaOnFocusout])
          } else {
            addDestroyEventListener(_contentElement, _strTransitionEndEvent, contentOnTransitionEnd)
          }
          addDestroyEventListener(_viewportElement, _strScroll, viewportOnScroll, true)
        }


        // ==== Scrollbars ====//

        /**
                 * Builds or destroys all scrollbar DOM elements (scrollbar, track, handle)
                 * @param destroy Indicates whether the DOM shall be build or destroyed.
                 */
        function setupScrollbarsDOM(destroy) {
          const selectOrGenerateScrollbarDOM = function (isHorizontal) {
            const scrollbarClassName = isHorizontal ? _classNameScrollbarHorizontal : _classNameScrollbarVertical
            const scrollbar = selectOrGenerateDivByClass(_classNameScrollbar + _strSpace + scrollbarClassName, true)
            const track = selectOrGenerateDivByClass(_classNameScrollbarTrack, scrollbar)
            const handle = selectOrGenerateDivByClass(_classNameScrollbarHandle, scrollbar)

            if (!_domExists && !destroy) {
              scrollbar.append(track)
              track.append(handle)
            }

            return {
              _scrollbar: scrollbar,
              _track: track,
              _handle: handle
            }
          }
          function resetScrollbarDOM(isHorizontal) {
            const scrollbarVars = getScrollbarVars(isHorizontal)
            const scrollbar = scrollbarVars._scrollbar
            const track = scrollbarVars._track
            const handle = scrollbarVars._handle

            if (_domExists && _initialized) {
              each([scrollbar, track, handle], (i, elm) => {
                removeClass(elm.removeAttr(LEXICON.s), _classNamesDynamicDestroy)
              })
            } else {
              remove(scrollbar || selectOrGenerateScrollbarDOM(isHorizontal)._scrollbar)
            }
          }
          let horizontalElements
          let verticalElements

          if (!destroy) {
            horizontalElements = selectOrGenerateScrollbarDOM(true)
            verticalElements = selectOrGenerateScrollbarDOM()

            _scrollbarHorizontalElement = horizontalElements._scrollbar
            _scrollbarHorizontalTrackElement = horizontalElements._track
            _scrollbarHorizontalHandleElement = horizontalElements._handle
            _scrollbarVerticalElement = verticalElements._scrollbar
            _scrollbarVerticalTrackElement = verticalElements._track
            _scrollbarVerticalHandleElement = verticalElements._handle

            if (!_domExists) {
              _paddingElement.after(_scrollbarVerticalElement)
              _paddingElement.after(_scrollbarHorizontalElement)
            }
          } else {
            resetScrollbarDOM(true)
            resetScrollbarDOM()
          }
        }

        /**
                 * Initializes all scrollbar interactivity events. (track and handle dragging, clicking, scrolling)
                 * @param isHorizontal True if the target scrollbar is the horizontal scrollbar, false if the target scrollbar is the vertical scrollbar.
                 */
        function setupScrollbarEvents(isHorizontal) {
          const scrollbarVars = getScrollbarVars(isHorizontal)
          const scrollbarVarsInfo = scrollbarVars._info
          const insideIFrame = _windowElementNative.top !== _windowElementNative
          const xy = scrollbarVars._x_y
          const XY = scrollbarVars._X_Y
          const scroll = _strScroll + scrollbarVars._Left_Top
          const strActive = 'active'
          const strSnapHandle = 'snapHandle'
          let scrollDurationFactor = 1
          const increaseDecreaseScrollAmountKeyCodes = [16, 17] // shift, ctrl
          let trackTimeout
          let mouseDownScroll
          let mouseDownOffset
          let mouseDownInvertedScale

          function getPointerPosition(event) {
            return _msieVersion && insideIFrame ? event[`screen${XY}`] : COMPATIBILITY.page(event)[xy] // use screen coordinates in EDGE & IE because the page values are incorrect in frames.
          }
          function getPreparedScrollbarsOption(name) {
            return _currentPreparedOptions.scrollbars[name]
          }
          function increaseTrackScrollAmount() {
            scrollDurationFactor = 0.5
          }
          function decreaseTrackScrollAmount() {
            scrollDurationFactor = 1
          }
          function documentKeyDown(event) {
            if (inArray(event.keyCode, increaseDecreaseScrollAmountKeyCodes) > -1) {
              increaseTrackScrollAmount()
            }
          }
          function documentKeyUp(event) {
            if (inArray(event.keyCode, increaseDecreaseScrollAmountKeyCodes) > -1) {
              decreaseTrackScrollAmount()
            }
          }
          function onMouseTouchDownContinue(event) {
            const originalEvent = event.originalEvent || event
            const isTouchEvent = originalEvent.touches !== undefined
            return _sleeping || _destroyed || nativeOverlayScrollbarsAreActive() || !_scrollbarsDragScrollingCache || isTouchEvent && !getPreparedScrollbarsOption('touchSupport') ? false : COMPATIBILITY.mBtn(event) === 1 || isTouchEvent
          }
          function documentDragMove(event) {
            if (onMouseTouchDownContinue(event)) {
              const trackLength = scrollbarVarsInfo._trackLength
              const handleLength = scrollbarVarsInfo._handleLength
              const scrollRange = scrollbarVarsInfo._maxScroll
              const scrollRaw = (getPointerPosition(event) - mouseDownOffset) * mouseDownInvertedScale
              const scrollDeltaPercent = scrollRaw / (trackLength - handleLength)
              let scrollDelta = scrollRange * scrollDeltaPercent
              scrollDelta = isFinite(scrollDelta) ? scrollDelta : 0
              if (_isRTL && isHorizontal && !_rtlScrollBehavior.i) {
                scrollDelta *= -1
              }

              _viewportElement[scroll](MATH.round(mouseDownScroll + scrollDelta))

              if (_scrollbarsHandlesDefineScrollPos) {
                refreshScrollbarHandleOffset(isHorizontal, mouseDownScroll + scrollDelta)
              }

              if (!_supportPassiveEvents) {
                COMPATIBILITY.prvD(event)
              }
            } else {
              documentMouseTouchUp(event)
            }
          }
          function documentMouseTouchUp(event) {
            event = event || event.originalEvent

            setupResponsiveEventListener(_documentElement,
              [_strMouseTouchMoveEvent, _strMouseTouchUpEvent, _strKeyDownEvent, _strKeyUpEvent, _strSelectStartEvent],
              [documentDragMove, documentMouseTouchUp, documentKeyDown, documentKeyUp, documentOnSelectStart],
              true)

            if (_scrollbarsHandlesDefineScrollPos) {
              refreshScrollbarHandleOffset(isHorizontal, true)
            }

            _scrollbarsHandlesDefineScrollPos = false
            removeClass(_bodyElement, _classNameDragging)
            removeClass(scrollbarVars._handle, strActive)
            removeClass(scrollbarVars._track, strActive)
            removeClass(scrollbarVars._scrollbar, strActive)

            mouseDownScroll = undefined
            mouseDownOffset = undefined
            mouseDownInvertedScale = 1

            decreaseTrackScrollAmount()

            if (trackTimeout !== undefined) {
              _base.scrollStop()
              clearTimeout(trackTimeout)
              trackTimeout = undefined
            }

            if (event) {
              const rect = _hostElementNative[LEXICON.bCR]()
              const mouseInsideHost = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom

              // if mouse is outside host element
              if (!mouseInsideHost) {
                hostOnMouseLeave()
              }

              if (_scrollbarsAutoHideScroll || _scrollbarsAutoHideMove) {
                refreshScrollbarsAutoHide(false)
              }
            }
          }
          function onHandleMouseTouchDown(event) {
            if (onMouseTouchDownContinue(event)) {
              onHandleMouseTouchDownAction(event)
            }
          }
          function onHandleMouseTouchDownAction(event) {
            mouseDownScroll = _viewportElement[scroll]()
            mouseDownScroll = isNaN(mouseDownScroll) ? 0 : mouseDownScroll
            if (_isRTL && isHorizontal && !_rtlScrollBehavior.n || !_isRTL) {
              mouseDownScroll = mouseDownScroll < 0 ? 0 : mouseDownScroll
            }

            mouseDownInvertedScale = getHostElementInvertedScale()[xy]
            mouseDownOffset = getPointerPosition(event)

            _scrollbarsHandlesDefineScrollPos = !getPreparedScrollbarsOption(strSnapHandle)
            addClass(_bodyElement, _classNameDragging)
            addClass(scrollbarVars._handle, strActive)
            addClass(scrollbarVars._scrollbar, strActive)

            setupResponsiveEventListener(_documentElement,
              [_strMouseTouchMoveEvent, _strMouseTouchUpEvent, _strSelectStartEvent],
              [documentDragMove, documentMouseTouchUp, documentOnSelectStart])

            if (_msieVersion || !_documentMixed) {
              COMPATIBILITY.prvD(event)
            }
            COMPATIBILITY.stpP(event)
          }
          function onTrackMouseTouchDown(event) {
            if (onMouseTouchDownContinue(event)) {
              const scrollDistance = MATH.round(_viewportSize[scrollbarVars._w_h])
              const trackOffset = scrollbarVars._track.offset()[scrollbarVars._left_top]
              const ctrlKey = event.ctrlKey
              const instantScroll = event.shiftKey
              const instantScrollTransition = instantScroll && ctrlKey
              let isFirstIteration = true
              const easing = 'linear'
              let decreaseScroll
              let finishedCondition
              const scrollActionFinsished = function (transition) {
                if (_scrollbarsHandlesDefineScrollPos) {
                  refreshScrollbarHandleOffset(isHorizontal, transition)
                }
              }
              const scrollActionInstantFinished = function () {
                scrollActionFinsished()
                onHandleMouseTouchDownAction(event)
              }
              var scrollAction = function () {
                if (!_destroyed) {
                  const mouseOffset = (mouseDownOffset - trackOffset) * mouseDownInvertedScale
                  const handleOffset = scrollbarVarsInfo._handleOffset
                  const trackLength = scrollbarVarsInfo._trackLength
                  const handleLength = scrollbarVarsInfo._handleLength
                  const scrollRange = scrollbarVarsInfo._maxScroll
                  const currScroll = scrollbarVarsInfo._currentScroll
                  const scrollDuration = 270 * scrollDurationFactor
                  const timeoutDelay = isFirstIteration ? MATH.max(400, scrollDuration) : scrollDuration
                  let instantScrollPosition = scrollRange * ((mouseOffset - handleLength / 2) / (trackLength - handleLength)) // 100% * positionPercent
                  const rtlIsNormal = _isRTL && isHorizontal && (!_rtlScrollBehavior.i && !_rtlScrollBehavior.n || _normalizeRTLCache)
                  const decreaseScrollCondition = rtlIsNormal ? handleOffset < mouseOffset : handleOffset > mouseOffset
                  const scrollObj = {}
                  const animationObj = {
                    easing,
                    step(now) {
                      if (_scrollbarsHandlesDefineScrollPos) {
                        _viewportElement[scroll](now) // https://github.com/jquery/jquery/issues/4340
                        refreshScrollbarHandleOffset(isHorizontal, now)
                      }
                    }
                  }
                  instantScrollPosition = isFinite(instantScrollPosition) ? instantScrollPosition : 0
                  instantScrollPosition = _isRTL && isHorizontal && !_rtlScrollBehavior.i ? scrollRange - instantScrollPosition : instantScrollPosition

                  // _base.scrollStop();

                  if (instantScroll) {
                    _viewportElement[scroll](instantScrollPosition) // scroll instantly to new position
                    if (instantScrollTransition) {
                      // get the scroll position after instant scroll (in case CSS Snap Points are used) to get the correct snapped scroll position
                      // and the animation stops at the correct point
                      instantScrollPosition = _viewportElement[scroll]()
                      // scroll back to the position before instant scrolling so animation can be performed
                      _viewportElement[scroll](currScroll)

                      instantScrollPosition = rtlIsNormal && _rtlScrollBehavior.i ? scrollRange - instantScrollPosition : instantScrollPosition
                      instantScrollPosition = rtlIsNormal && _rtlScrollBehavior.n ? -instantScrollPosition : instantScrollPosition

                      scrollObj[xy] = instantScrollPosition
                      _base.scroll(scrollObj, extendDeep(animationObj, {
                        duration: 130,
                        complete: scrollActionInstantFinished
                      }))
                    } else {
                      scrollActionInstantFinished()
                    }
                  } else {
                    decreaseScroll = isFirstIteration ? decreaseScrollCondition : decreaseScroll
                    finishedCondition = rtlIsNormal
                      ? decreaseScroll ? handleOffset + handleLength >= mouseOffset : handleOffset <= mouseOffset
                      : decreaseScroll ? handleOffset <= mouseOffset : handleOffset + handleLength >= mouseOffset

                    if (finishedCondition) {
                      clearTimeout(trackTimeout)
                      _base.scrollStop()
                      trackTimeout = undefined
                      scrollActionFinsished(true)
                    } else {
                      trackTimeout = setTimeout(scrollAction, timeoutDelay)

                      scrollObj[xy] = (decreaseScroll ? '-=' : '+=') + scrollDistance
                      _base.scroll(scrollObj, extendDeep(animationObj, {
                        duration: scrollDuration
                      }))
                    }
                    isFirstIteration = false
                  }
                }
              }
              if (ctrlKey) {
                increaseTrackScrollAmount()
              }

              mouseDownInvertedScale = getHostElementInvertedScale()[xy]
              mouseDownOffset = COMPATIBILITY.page(event)[xy]

              _scrollbarsHandlesDefineScrollPos = !getPreparedScrollbarsOption(strSnapHandle)
              addClass(_bodyElement, _classNameDragging)
              addClass(scrollbarVars._track, strActive)
              addClass(scrollbarVars._scrollbar, strActive)

              setupResponsiveEventListener(_documentElement,
                [_strMouseTouchUpEvent, _strKeyDownEvent, _strKeyUpEvent, _strSelectStartEvent],
                [documentMouseTouchUp, documentKeyDown, documentKeyUp, documentOnSelectStart])

              scrollAction()
              COMPATIBILITY.prvD(event)
              COMPATIBILITY.stpP(event)
            }
          }
          function onTrackMouseTouchEnter(event) {
            // make sure both scrollbars will stay visible if one scrollbar is hovered if autoHide is "scroll" or "move".
            _scrollbarsHandleHovered = true
            if (_scrollbarsAutoHideScroll || _scrollbarsAutoHideMove) {
              refreshScrollbarsAutoHide(true)
            }
          }
          function onTrackMouseTouchLeave(event) {
            _scrollbarsHandleHovered = false
            if (_scrollbarsAutoHideScroll || _scrollbarsAutoHideMove) {
              refreshScrollbarsAutoHide(false)
            }
          }
          function onScrollbarMouseTouchDown(event) {
            COMPATIBILITY.stpP(event)
          }

          addDestroyEventListener(scrollbarVars._handle,
            _strMouseTouchDownEvent,
            onHandleMouseTouchDown)
          addDestroyEventListener(scrollbarVars._track,
            [_strMouseTouchDownEvent, _strMouseTouchEnter, _strMouseTouchLeave],
            [onTrackMouseTouchDown, onTrackMouseTouchEnter, onTrackMouseTouchLeave])
          addDestroyEventListener(scrollbarVars._scrollbar,
            _strMouseTouchDownEvent,
            onScrollbarMouseTouchDown)

          if (_supportTransition) {
            addDestroyEventListener(scrollbarVars._scrollbar, _strTransitionEndEvent, (event) => {
              if (event.target !== scrollbarVars._scrollbar[0]) {
                return
              }
              refreshScrollbarHandleLength(isHorizontal)
              refreshScrollbarHandleOffset(isHorizontal)
            })
          }
        }

        /**
                 * Shows or hides the given scrollbar and applied a class name which indicates if the scrollbar is scrollable or not.
                 * @param isHorizontal True if the horizontal scrollbar is the target, false if the vertical scrollbar is the target.
                 * @param shallBeVisible True if the scrollbar shall be shown, false if hidden.
                 * @param canScroll True if the scrollbar is scrollable, false otherwise.
                 */
        function refreshScrollbarAppearance(isHorizontal, shallBeVisible, canScroll) {
          const scrollbarClassName = isHorizontal ? _classNameHostScrollbarHorizontalHidden : _classNameHostScrollbarVerticalHidden
          const scrollbarElement = isHorizontal ? _scrollbarHorizontalElement : _scrollbarVerticalElement

          if (shallBeVisible) {
            removeClass(_hostElement, scrollbarClassName)
          } else {
            addClass(_hostElement, scrollbarClassName)
          }

          if (canScroll) {
            removeClass(scrollbarElement, _classNameScrollbarUnusable)
          } else {
            addClass(scrollbarElement, _classNameScrollbarUnusable)
          }
        }

        /**
                 * Autoshows / autohides both scrollbars with.
                 * @param shallBeVisible True if the scrollbars shall be autoshown (only the case if they are hidden by a autohide), false if the shall be auto hidden.
                 * @param delayfree True if the scrollbars shall be hidden without a delay, false or undefined otherwise.
                 */
        function refreshScrollbarsAutoHide(shallBeVisible, delayfree) {
          clearTimeout(_scrollbarsAutoHideTimeoutId)
          if (shallBeVisible) {
            // if(_hasOverflowCache.x && _hideOverflowCache.xs)
            removeClass(_scrollbarHorizontalElement, _classNameScrollbarAutoHidden)
            // if(_hasOverflowCache.y && _hideOverflowCache.ys)
            removeClass(_scrollbarVerticalElement, _classNameScrollbarAutoHidden)
          } else {
            let anyActive
            const strActive = 'active'
            const hide = function () {
              if (!_scrollbarsHandleHovered && !_destroyed) {
                anyActive = _scrollbarHorizontalHandleElement.hasClass(strActive) || _scrollbarVerticalHandleElement.hasClass(strActive)
                if (!anyActive && (_scrollbarsAutoHideScroll || _scrollbarsAutoHideMove || _scrollbarsAutoHideLeave)) {
                  addClass(_scrollbarHorizontalElement, _classNameScrollbarAutoHidden)
                }
                if (!anyActive && (_scrollbarsAutoHideScroll || _scrollbarsAutoHideMove || _scrollbarsAutoHideLeave)) {
                  addClass(_scrollbarVerticalElement, _classNameScrollbarAutoHidden)
                }
              }
            }
            if (_scrollbarsAutoHideDelay > 0 && delayfree !== true) {
              _scrollbarsAutoHideTimeoutId = setTimeout(hide, _scrollbarsAutoHideDelay)
            } else {
              hide()
            }
          }
        }

        /**
                 * Refreshes the handle length of the given scrollbar.
                 * @param isHorizontal True if the horizontal scrollbar handle shall be refreshed, false if the vertical one shall be refreshed.
                 */
        function refreshScrollbarHandleLength(isHorizontal) {
          const handleCSS = {}
          const scrollbarVars = getScrollbarVars(isHorizontal)
          const scrollbarVarsInfo = scrollbarVars._info
          const digit = 1000000
          // get and apply intended handle length
          const handleRatio = MATH.min(1, (_hostSizeCache[scrollbarVars._w_h] - (_paddingAbsoluteCache ? isHorizontal ? _paddingX : _paddingY : 0)) / _contentScrollSizeCache[scrollbarVars._w_h])
          handleCSS[scrollbarVars._width_height] = `${MATH.floor(handleRatio * 100 * digit) / digit}%` // the last * digit / digit is for flooring to the 4th digit

          if (!nativeOverlayScrollbarsAreActive()) {
            scrollbarVars._handle.css(handleCSS)
          }

          // measure the handle length to respect min & max length
          scrollbarVarsInfo._handleLength = scrollbarVars._handle[0][`offset${scrollbarVars._Width_Height}`]
          scrollbarVarsInfo._handleLengthRatio = handleRatio
        }

        /**
                 * Refreshes the handle offset of the given scrollbar.
                 * @param isHorizontal True if the horizontal scrollbar handle shall be refreshed, false if the vertical one shall be refreshed.
                 * @param scrollOrTransition The scroll position of the given scrollbar axis to which the handle shall be moved or a boolean which indicates whether a transition shall be applied. If undefined or boolean if the current scroll-offset is taken. (if isHorizontal ? scrollLeft : scrollTop)
                 */
        function refreshScrollbarHandleOffset(isHorizontal, scrollOrTransition) {
          const transition = type(scrollOrTransition) == TYPES.b
          const transitionDuration = 250
          const isRTLisHorizontal = _isRTL && isHorizontal
          const scrollbarVars = getScrollbarVars(isHorizontal)
          const scrollbarVarsInfo = scrollbarVars._info
          const strTranslateBrace = 'translate('
          const strTransform = VENDORS._cssProperty('transform')
          const strTransition = VENDORS._cssProperty('transition')
          const nativeScroll = isHorizontal ? _viewportElement[_strScrollLeft]() : _viewportElement[_strScrollTop]()
          const currentScroll = scrollOrTransition === undefined || transition ? nativeScroll : scrollOrTransition

          // measure the handle length to respect min & max length
          const handleLength = scrollbarVarsInfo._handleLength
          const trackLength = scrollbarVars._track[0][`offset${scrollbarVars._Width_Height}`]
          const handleTrackDiff = trackLength - handleLength
          const handleCSS = {}
          let transformOffset
          let translateValue

          // DONT use the variable '_contentScrollSizeCache[scrollbarVars._w_h]' instead of '_viewportElement[0]['scroll' + scrollbarVars._Width_Height]'
          // because its a bit behind during the small delay when content size updates
          // (delay = mutationObserverContentLag, if its 0 then this var could be used)
          const maxScroll = (_viewportElementNative[_strScroll + scrollbarVars._Width_Height] - _viewportElementNative[`client${scrollbarVars._Width_Height}`]) * (_rtlScrollBehavior.n && isRTLisHorizontal ? -1 : 1) //* -1 if rtl scroll max is negative
          const getScrollRatio = function (base) {
            return isNaN(base / maxScroll) ? 0 : MATH.max(0, MATH.min(1, base / maxScroll))
          }
          const getHandleOffset = function (scrollRatio) {
            let offset = handleTrackDiff * scrollRatio
            offset = isNaN(offset) ? 0 : offset
            offset = isRTLisHorizontal && !_rtlScrollBehavior.i ? trackLength - handleLength - offset : offset
            offset = MATH.max(0, offset)
            return offset
          }
          const scrollRatio = getScrollRatio(nativeScroll)
          const unsnappedScrollRatio = getScrollRatio(currentScroll)
          const handleOffset = getHandleOffset(unsnappedScrollRatio)
          const snappedHandleOffset = getHandleOffset(scrollRatio)

          scrollbarVarsInfo._maxScroll = maxScroll
          scrollbarVarsInfo._currentScroll = nativeScroll
          scrollbarVarsInfo._currentScrollRatio = scrollRatio

          if (_supportTransform) {
            transformOffset = isRTLisHorizontal ? -(trackLength - handleLength - handleOffset) : handleOffset // in px
            // transformOffset = (transformOffset / trackLength * 100) * (trackLength / handleLength); //in %
            translateValue = isHorizontal ? `${strTranslateBrace + transformOffset}px, 0)` : `${strTranslateBrace}0, ${transformOffset}px)`

            handleCSS[strTransform] = translateValue

            // apply or clear up transition
            if (_supportTransition) {
              handleCSS[strTransition] = transition && MATH.abs(handleOffset - scrollbarVarsInfo._handleOffset) > 1 ? `${getCSSTransitionString(scrollbarVars._handle)}, ${strTransform + _strSpace + transitionDuration}ms` : _strEmpty
            }
          } else {
            handleCSS[scrollbarVars._left_top] = handleOffset
          }


          // only apply css if offset has changed and overflow exists.
          if (!nativeOverlayScrollbarsAreActive()) {
            scrollbarVars._handle.css(handleCSS)

            // clear up transition
            if (_supportTransform && _supportTransition && transition) {
              scrollbarVars._handle.one(_strTransitionEndEvent, () => {
                if (!_destroyed) {
                  scrollbarVars._handle.css(strTransition, _strEmpty)
                }
              })
            }
          }

          scrollbarVarsInfo._handleOffset = handleOffset
          scrollbarVarsInfo._snappedHandleOffset = snappedHandleOffset
          scrollbarVarsInfo._trackLength = trackLength
        }

        /**
                 * Refreshes the interactivity of the given scrollbar element.
                 * @param isTrack True if the track element is the target, false if the handle element is the target.
                 * @param value True for interactivity false for no interactivity.
                 */
        function refreshScrollbarsInteractive(isTrack, value) {
          const action = value ? 'removeClass' : 'addClass'
          const element1 = isTrack ? _scrollbarHorizontalTrackElement : _scrollbarHorizontalHandleElement
          const element2 = isTrack ? _scrollbarVerticalTrackElement : _scrollbarVerticalHandleElement
          const className = isTrack ? _classNameScrollbarTrackOff : _classNameScrollbarHandleOff

          element1[action](className)
          element2[action](className)
        }

        /**
                 * Returns a object which is used for fast access for specific variables.
                 * @param isHorizontal True if the horizontal scrollbar vars shall be accessed, false if the vertical scrollbar vars shall be accessed.
                 * @returns {{wh: string, WH: string, lt: string, _wh: string, _lt: string, t: *, h: *, c: {}, s: *}}
                 */
        function getScrollbarVars(isHorizontal) {
          return {
            _width_height: isHorizontal ? _strWidth : _strHeight,
            _Width_Height: isHorizontal ? 'Width' : 'Height',
            _left_top: isHorizontal ? _strLeft : _strTop,
            _Left_Top: isHorizontal ? 'Left' : 'Top',
            _x_y: isHorizontal ? _strX : _strY,
            _X_Y: isHorizontal ? 'X' : 'Y',
            _w_h: isHorizontal ? 'w' : 'h',
            _l_t: isHorizontal ? 'l' : 't',
            _track: isHorizontal ? _scrollbarHorizontalTrackElement : _scrollbarVerticalTrackElement,
            _handle: isHorizontal ? _scrollbarHorizontalHandleElement : _scrollbarVerticalHandleElement,
            _scrollbar: isHorizontal ? _scrollbarHorizontalElement : _scrollbarVerticalElement,
            _info: isHorizontal ? _scrollHorizontalInfo : _scrollVerticalInfo
          }
        }


        // ==== Scrollbar Corner ====//

        /**
                 * Builds or destroys the scrollbar corner DOM element.
                 * @param destroy Indicates whether the DOM shall be build or destroyed.
                 */
        function setupScrollbarCornerDOM(destroy) {
          _scrollbarCornerElement = _scrollbarCornerElement || selectOrGenerateDivByClass(_classNameScrollbarCorner, true)

          if (!destroy) {
            if (!_domExists) {
              _hostElement.append(_scrollbarCornerElement)
            }
          } else if (_domExists && _initialized) {
            removeClass(_scrollbarCornerElement.removeAttr(LEXICON.s), _classNamesDynamicDestroy)
          } else {
            remove(_scrollbarCornerElement)
          }
        }

        /**
                 * Initializes all scrollbar corner interactivity events.
                 */
        function setupScrollbarCornerEvents() {
          const insideIFrame = _windowElementNative.top !== _windowElementNative
          let mouseDownPosition = {}
          const mouseDownSize = {}
          let mouseDownInvertedScale = {}
          let reconnectMutationObserver

          function documentDragMove(event) {
            if (onMouseTouchDownContinue(event)) {
              const pageOffset = getCoordinates(event)
              const hostElementCSS = {}
              if (_resizeHorizontal || _resizeBoth) {
                hostElementCSS[_strWidth] = mouseDownSize.w + (pageOffset.x - mouseDownPosition.x) * mouseDownInvertedScale.x
              }
              if (_resizeVertical || _resizeBoth) {
                hostElementCSS[_strHeight] = mouseDownSize.h + (pageOffset.y - mouseDownPosition.y) * mouseDownInvertedScale.y
              }
              _hostElement.css(hostElementCSS)
              COMPATIBILITY.stpP(event)
            } else {
              documentMouseTouchUp(event)
            }
          }
          function documentMouseTouchUp(event) {
            const eventIsTrusted = event !== undefined

            setupResponsiveEventListener(_documentElement,
              [_strSelectStartEvent, _strMouseTouchMoveEvent, _strMouseTouchUpEvent],
              [documentOnSelectStart, documentDragMove, documentMouseTouchUp],
              true)

            removeClass(_bodyElement, _classNameDragging)
            if (_scrollbarCornerElement.releaseCapture) {
              _scrollbarCornerElement.releaseCapture()
            }

            if (eventIsTrusted) {
              if (reconnectMutationObserver) {
                connectMutationObservers()
              }
              _base.update(_strAuto)
            }
            reconnectMutationObserver = false
          }
          function onMouseTouchDownContinue(event) {
            const originalEvent = event.originalEvent || event
            const isTouchEvent = originalEvent.touches !== undefined
            return _sleeping || _destroyed ? false : COMPATIBILITY.mBtn(event) === 1 || isTouchEvent
          }
          function getCoordinates(event) {
            return _msieVersion && insideIFrame ? {
              x: event.screenX,
              y: event.screenY
            } : COMPATIBILITY.page(event)
          }

          addDestroyEventListener(_scrollbarCornerElement, _strMouseTouchDownEvent, (event) => {
            if (onMouseTouchDownContinue(event) && !_resizeNone) {
              if (_mutationObserversConnected) {
                reconnectMutationObserver = true
                disconnectMutationObservers()
              }

              mouseDownPosition = getCoordinates(event)

              mouseDownSize.w = _hostElementNative[LEXICON.oW] - (!_isBorderBox ? _paddingX : 0)
              mouseDownSize.h = _hostElementNative[LEXICON.oH] - (!_isBorderBox ? _paddingY : 0)
              mouseDownInvertedScale = getHostElementInvertedScale()

              setupResponsiveEventListener(_documentElement,
                [_strSelectStartEvent, _strMouseTouchMoveEvent, _strMouseTouchUpEvent],
                [documentOnSelectStart, documentDragMove, documentMouseTouchUp])

              addClass(_bodyElement, _classNameDragging)
              if (_scrollbarCornerElement.setCapture) {
                _scrollbarCornerElement.setCapture()
              }

              COMPATIBILITY.prvD(event)
              COMPATIBILITY.stpP(event)
            }
          })
        }


        // ==== Utils ====//

        /**
                 * Calls the callback with the given name. The Context of this callback is always _base (this).
                 * @param name The name of the target which shall be called.
                 * @param args The args with which the callback shall be called.
                 */
        function dispatchCallback(name, args) {
          if (_initialized) {
            const callback = _currentPreparedOptions.callbacks[name]
            let extensionOnName = name
            let ext

            if (extensionOnName.substr(0, 2) === 'on') {
              extensionOnName = extensionOnName.substr(2, 1).toLowerCase() + extensionOnName.substr(3)
            }

            if (type(callback) == TYPES.f) {
              callback.call(_base, args)
            }

            each(_extensions, function () {
              ext = this
              if (type(ext.on) == TYPES.f) {
                ext.on(extensionOnName, args)
              }
            })
          } else if (!_destroyed) {
            _callbacksInitQeueue.push({
              n: name,
              a: args
            })
          }
        }

        /**
                 * Sets the "top, right, bottom, left" properties, with a given prefix, of the given css object.
                 * @param targetCSSObject The css object to which the values shall be applied.
                 * @param prefix The prefix of the "top, right, bottom, left" css properties. (example: 'padding-' is a valid prefix)
                 * @param values A array of values which shall be applied to the "top, right, bottom, left" -properties. The array order is [top, right, bottom, left].
                 * If this argument is undefined the value '' (empty string) will be applied to all properties.
                 */
        function setTopRightBottomLeft(targetCSSObject, prefix, values) {
          if (values === undefined) {
            values = [_strEmpty, _strEmpty, _strEmpty, _strEmpty]
          }

          targetCSSObject[prefix + _strTop] = values[0]
          targetCSSObject[prefix + _strRight] = values[1]
          targetCSSObject[prefix + _strBottom] = values[2]
          targetCSSObject[prefix + _strLeft] = values[3]
        }

        /**
                 * Returns the computed CSS transition string from the given element.
                 * @param element The element from which the transition string shall be returned.
                 * @returns {string} The CSS transition string from the given element.
                 */
        function getCSSTransitionString(element) {
          const transitionStr = VENDORS._cssProperty('transition')
          const assembledValue = element.css(transitionStr)
          if (assembledValue) {
            return assembledValue
          }
          const regExpString = '\\s*(' + '([^,(]+(\\(.+?\\))?)+' + ')[\\s,]*'
          const regExpMain = new RegExp(regExpString)
          const regExpValidate = new RegExp(`^(${regExpString})+$`)
          const properties = 'property duration timing-function delay'.split(' ')
          const result = []
          let strResult
          let valueArray
          let i = 0
          let j
          const splitCssStyleByComma = function (str) {
            strResult = []
            if (!str.match(regExpValidate)) {
              return str
            }
            while (str.match(regExpMain)) {
              strResult.push(RegExp.$1)
              str = str.replace(regExpMain, _strEmpty)
            }

            return strResult
          }
          for (; i < properties[LEXICON.l]; i++) {
            valueArray = splitCssStyleByComma(element.css(`${transitionStr}-${properties[i]}`))
            for (j = 0; j < valueArray[LEXICON.l]; j++) {
              result[j] = (result[j] ? result[j] + _strSpace : _strEmpty) + valueArray[j]
            }
          }
          return result.join(', ')
        }

        /**
                 * Calculates the host-elements inverted scale. (invertedScale = 1 / scale)
                 * @returns {{x: number, y: number}} The scale of the host-element.
                 */
        function getHostElementInvertedScale() {
          const rect = _paddingElementNative[LEXICON.bCR]()
          return {
            x: _supportTransform ? 1 / (MATH.round(rect.width) / _paddingElementNative[LEXICON.oW]) || 1 : 1,
            y: _supportTransform ? 1 / (MATH.round(rect.height) / _paddingElementNative[LEXICON.oH]) || 1 : 1
          }
        }

        /**
                 * Checks whether the given object is a HTMLElement.
                 * @param o The object which shall be checked.
                 * @returns {boolean} True the given object is a HTMLElement, false otherwise.
                 */
        function isHTMLElement(o) {
          const strOwnerDocument = 'ownerDocument'
          const strHTMLElement = 'HTMLElement'
          const wnd = o && o[strOwnerDocument] ? o[strOwnerDocument].parentWindow || window : window
          return (
            typeof wnd[strHTMLElement] === TYPES.o ? o instanceof wnd[strHTMLElement] // DOM2
              : o && typeof o === TYPES.o && o !== null && o.nodeType === 1 && typeof o.nodeName === TYPES.s
          )
        }

        /**
                 * Compares 2 arrays and returns the differences between them as a array.
                 * @param a1 The first array which shall be compared.
                 * @param a2 The second array which shall be compared.
                 * @returns {Array} The differences between the two arrays.
                 */
        function getArrayDifferences(a1, a2) {
          const a = []
          const diff = []
          let i
          let k
          for (i = 0; i < a1.length; i++) {
            a[a1[i]] = true
          }
          for (i = 0; i < a2.length; i++) {
            if (a[a2[i]]) {
              delete a[a2[i]]
            } else {
              a[a2[i]] = true
            }
          }
          for (k in a) {
            diff.push(k)
          }
          return diff
        }

        /**
                 * Returns Zero or the number to which the value can be parsed.
                 * @param value The value which shall be parsed.
                 * @param toFloat Indicates whether the number shall be parsed to a float.
                 */
        function parseToZeroOrNumber(value, toFloat) {
          const num = toFloat ? parseFloat(value) : parseInt(value, 10)
          return isNaN(num) ? 0 : num
        }

        /**
                 * Gets several information of the textarea and returns them as a object or undefined if the browser doesn't support it.
                 * @returns {{cursorRow: Number, cursorCol, rows: Number, cols: number, wRow: number, pos: number, max : number}} or undefined if not supported.
                 */
        function getTextareaInfo() {
          // read needed values
          const textareaCursorPosition = _targetElementNative.selectionStart
          if (textareaCursorPosition === undefined) {
            return
          }

          const textareaValue = _targetElement.val()
          const textareaLength = textareaValue[LEXICON.l]
          const textareaRowSplit = textareaValue.split('\n')
          const textareaLastRow = textareaRowSplit[LEXICON.l]
          const textareaCurrentCursorRowSplit = textareaValue.substr(0, textareaCursorPosition).split('\n')
          let widestRow = 0
          let textareaLastCol = 0
          const cursorRow = textareaCurrentCursorRowSplit[LEXICON.l]
          const cursorCol = textareaCurrentCursorRowSplit[textareaCurrentCursorRowSplit[LEXICON.l] - 1][LEXICON.l]
          let rowCols
          let i

          // get widest Row and the last column of the textarea
          for (i = 0; i < textareaRowSplit[LEXICON.l]; i++) {
            rowCols = textareaRowSplit[i][LEXICON.l]
            if (rowCols > textareaLastCol) {
              widestRow = i + 1
              textareaLastCol = rowCols
            }
          }

          return {
            _cursorRow: cursorRow, // cursorRow
            _cursorColumn: cursorCol, // cursorCol
            _rows: textareaLastRow, // rows
            _columns: textareaLastCol, // cols
            _widestRow: widestRow, // wRow
            _cursorPosition: textareaCursorPosition, // pos
            _cursorMax: textareaLength // max
          }
        }

        /**
                 * Determines whether native overlay scrollbars are active.
                 * @returns {boolean} True if native overlay scrollbars are active, false otherwise.
                 */
        function nativeOverlayScrollbarsAreActive() {
          return _ignoreOverlayScrollbarHidingCache && (_nativeScrollbarIsOverlaid.x && _nativeScrollbarIsOverlaid.y)
        }

        /**
                 * Gets the element which is used to measure the content size.
                 * @returns {*} TextareaCover if target element is textarea else the ContentElement.
                 */
        function getContentMeasureElement() {
          return _isTextarea ? _textareaCoverElement[0] : _contentElementNative
        }

        /**
                 * Generates a string which represents a HTML div with the given classes or attributes.
                 * @param classesOrAttrs The class of the div as string or a object which represents the attributes of the div. (The class attribute can also be written as "className".)
                 * @param content The content of the div as string.
                 * @returns {string} The concated string which represents a HTML div and its content.
                 */
        function generateDiv(classesOrAttrs, content) {
          return `<div ${classesOrAttrs ? type(classesOrAttrs) == TYPES.s
            ? `class="${classesOrAttrs}"`
            : (function () {
              let key
              let attrs = _strEmpty
              if (FRAMEWORK.isPlainObject(classesOrAttrs)) {
                for (key in classesOrAttrs) {
                  attrs += `${key === 'c' ? 'class' : key}="${classesOrAttrs[key]}" `
                }
              }
              return attrs
            }())
            : _strEmpty
          }>${
            content || _strEmpty
          }</div>`
        }

        /**
                 * Selects or generates a div with the given class attribute.
                 * @param className The class names (divided by spaces) of the div which shall be selected or generated.
                 * @param selectParentOrOnlyChildren The parent element from which of the element shall be selected. (if undefined or boolean its hostElement)
                 * If its a boolean it decides whether only the children of the host element shall be selected.
                 * @returns {*} The generated or selected element.
                 */
        function selectOrGenerateDivByClass(className, selectParentOrOnlyChildren) {
          const onlyChildren = type(selectParentOrOnlyChildren) == TYPES.b
          const selectParent = onlyChildren ? _hostElement : selectParentOrOnlyChildren || _hostElement

          return _domExists && !selectParent[LEXICON.l]
            ? null
            : _domExists
              ? selectParent[onlyChildren ? 'children' : 'find'](_strDot + className.replace(/\s/g, _strDot)).eq(0)
              : FRAMEWORK(generateDiv(className))
        }

        /**
                 * Gets the value of the given property from the given object.
                 * @param obj The object from which the property value shall be got.
                 * @param path The property of which the value shall be got.
                 * @returns {*} Returns the value of the searched property or undefined of the property wasn't found.
                 */
        function getObjectPropVal(obj, path) {
          const splits = path.split(_strDot)
          let i = 0
          let val
          for (; i < splits.length; i++) {
            if (!obj[LEXICON.hOP](splits[i])) {
              return
            }
            val = obj[splits[i]]
            if (i < splits.length && type(val) == TYPES.o) {
              obj = val
            }
          }
          return val
        }

        /**
                 * Sets the value of the given property from the given object.
                 * @param obj The object from which the property value shall be set.
                 * @param path The property of which the value shall be set.
                 * @param val The value of the property which shall be set.
                 */
        function setObjectPropVal(obj, path, val) {
          const splits = path.split(_strDot)
          const splitsLength = splits.length
          let i = 0
          let extendObj = {}
          const extendObjRoot = extendObj
          for (; i < splitsLength; i++) {
            extendObj = extendObj[splits[i]] = i + 1 < splitsLength ? {} : val
          }
          FRAMEWORK.extend(obj, extendObjRoot, true)
        }


        // ==== Utils Cache ====//

        /**
                 * Compares two values or objects and returns true if they aren't equal.
                 * @param current The first value or object which shall be compared.
                 * @param cache The second value or object which shall be compared.
                 * @param force If true the returned value is always true.
                 * @returns {boolean} True if both values or objects aren't equal or force is true, false otherwise.
                 */
        function checkCache(current, cache, force) {
          if (force) {
            return force
          }
          if (type(current) == TYPES.o && type(cache) == TYPES.o) {
            for (const prop in current) {
              if (prop !== 'c') {
                if (current[LEXICON.hOP](prop) && cache[LEXICON.hOP](prop)) {
                  if (checkCache(current[prop], cache[prop])) {
                    return true
                  }
                } else {
                  return true
                }
              }
            }
          } else {
            return current !== cache
          }
          return false
        }


        // ==== Shortcuts ====//

        /**
                 * jQuery extend method shortcut with a appended "true" as first argument.
                 */
        function extendDeep() {
          return FRAMEWORK.extend.apply(this, [true].concat([].slice.call(arguments)))
        }

        /**
                 * jQuery addClass method shortcut.
                 */
        function addClass(el, classes) {
          return _frameworkProto.addClass.call(el, classes)
        }

        /**
                 * jQuery removeClass method shortcut.
                 */
        function removeClass(el, classes) {
          return _frameworkProto.removeClass.call(el, classes)
        }

        /**
                 * jQuery remove method shortcut.
                 */
        function remove(el) {
          return _frameworkProto.remove.call(el)
        }

        /**
                 * Finds the first child element with the given selector of the given element.
                 * @param el The root element from which the selector shall be valid.
                 * @param selector The selector of the searched element.
                 * @returns {*} The first element which is a child of the given element and matches the givens selector.
                 */
        function findFirst(el, selector) {
          return _frameworkProto.find.call(el, selector).eq(0)
        }


        // ==== API ====//

        /**
                 * Puts the instance to sleep. It wont respond to any changes in the DOM and won't update. Scrollbar Interactivity is also disabled as well as the resize handle.
                 * This behavior can be reset by calling the update method.
                 */
        _base.sleep = function () {
          _sleeping = true
        }

        /**
                 * Updates the plugin and DOM to the current options.
                 * This method should only be called if a update is 100% required.
                 * @param force True if every property shall be updated and the cache shall be ignored.
                 * !INTERNAL USAGE! : force can be a string "auto", "sync" or "zoom" too
                 * if "auto" then before a real update the content size and host element attributes gets checked, and if they changed only then the update method will be called.
                 * if "sync" then the async update process (MutationObserver or UpdateLoop) gets synchronized and a corresponding update takes place if one was needed due to pending changes.
                 * if "zoom" then a update takes place where it's assumed that content and host size changed
                 * @returns {boolean|undefined}
                 * If force is "sync" then a boolean is returned which indicates whether a update was needed due to pending changes.
                 * If force is "auto" then a boolean is returned whether a update was needed due to attribute or size changes.
                 * undefined otherwise.
                 */
        _base.update = function (force) {
          if (_destroyed) {
            return
          }

          let attrsChanged
          let contentSizeC
          const isString = type(force) == TYPES.s
          const imgElementSelector = 'img'
          const imgElementLoadEvent = 'load'
          let doUpdateAuto
          let mutHost
          let mutContent

          if (isString) {
            if (force === _strAuto) {
              attrsChanged = meaningfulAttrsChanged()
              contentSizeC = updateAutoContentSizeChanged()
              doUpdateAuto = attrsChanged || contentSizeC
              if (doUpdateAuto) {
                update({
                  _contentSizeChanged: contentSizeC,
                  _changedOptions: _initialized ? undefined : _currentPreparedOptions
                })
              }
            } else if (force === _strSync) {
              if (_mutationObserversConnected) {
                mutHost = _mutationObserverHostCallback(_mutationObserverHost.takeRecords())
                mutContent = _mutationObserverContentCallback(_mutationObserverContent.takeRecords())
              } else {
                mutHost = _base.update(_strAuto)
              }
            } else if (force === 'zoom') {
              update({
                _hostSizeChanged: true,
                _contentSizeChanged: true
              })
            }
          } else {
            force = _sleeping || force
            _sleeping = false
            if (!_base.update(_strSync) || force) {
              update({
                _force: force
              })
            }
          }
          if (!_isTextarea) {
            _contentElement.find(imgElementSelector).each((i, el) => {
              const index = COMPATIBILITY.inA(el, _imgs)
              if (index === -1) {
                FRAMEWORK(el).off(imgElementLoadEvent, imgOnLoad).on(imgElementLoadEvent, imgOnLoad)
              }
            })
          }
          return doUpdateAuto || mutHost || mutContent
        }

        /**
                 Gets or sets the current options. The update method will be called automatically if new options were set.
                 * @param newOptions If new options are given, then the new options will be set, if new options aren't given (undefined or a not a plain object) then the current options will be returned.
                 * @param value If new options is a property path string, then this value will be used to set the option to which the property path string leads.
                 * @returns {*}
                 */
        _base.options = function (newOptions, value) {
          const option = {}
          let changedOps

          // return current options if newOptions are undefined or empty
          if (FRAMEWORK.isEmptyObject(newOptions) || !FRAMEWORK.isPlainObject(newOptions)) {
            if (type(newOptions) == TYPES.s) {
              if (arguments.length > 1) {
                setObjectPropVal(option, newOptions, value)
                changedOps = setOptions(option)
              } else {
                return getObjectPropVal(_currentOptions, newOptions)
              }
            } else {
              return _currentOptions
            }
          } else {
            changedOps = setOptions(newOptions)
          }

          if (!FRAMEWORK.isEmptyObject(changedOps)) {
            update({
              _changedOptions: changedOps
            })
          }
        }

        /**
                 * Restore the DOM, disconnects all observers, remove all resize observers and put the instance to sleep.
                 */
        _base.destroy = function () {
          if (_destroyed) {
            return
          }

          // remove this instance from auto update loop
          autoUpdateLoop.remove(_base)

          // disconnect all mutation observers
          disconnectMutationObservers()

          // remove all resize observers
          setupResizeObserver(_sizeObserverElement)
          setupResizeObserver(_sizeAutoObserverElement)

          // remove all extensions
          for (const extName in _extensions) {
            _base.removeExt(extName)
          }

          // remove all 'destroy' events
          while (_destroyEvents[LEXICON.l] > 0) {
            _destroyEvents.pop()()
          }

          // remove all events from host element
          setupHostMouseTouchEvents(true)

          // remove all helper / detection elements
          if (_contentGlueElement) {
            remove(_contentGlueElement)
          }
          if (_contentArrangeElement) {
            remove(_contentArrangeElement)
          }
          if (_sizeAutoObserverAdded) {
            remove(_sizeAutoObserverElement)
          }

          // remove all generated DOM
          setupScrollbarsDOM(true)
          setupScrollbarCornerDOM(true)
          setupStructureDOM(true)

          // remove all generated image load events
          for (let i = 0; i < _imgs[LEXICON.l]; i++) {
            FRAMEWORK(_imgs[i]).off('load', imgOnLoad)
          }
          _imgs = undefined

          _destroyed = true
          _sleeping = true

          // remove this instance from the instances list
          INSTANCES(pluginTargetElement, 0)
          dispatchCallback('onDestroyed')

          // remove all properties and methods
          // for (var property in _base)
          //    delete _base[property];
          // _base = undefined;
        }

        /**
                 * Scrolls to a given position or element.
                 * @param coordinates
                 * 1. Can be "coordinates" which looks like:
                 *    { x : ?, y : ? } OR          Object with x and y properties
                 *    { left : ?, top : ? } OR     Object with left and top properties
                 *    { l : ?, t : ? } OR          Object with l and t properties
                 *    [ ?, ? ] OR                  Array where the first two element are the coordinates (first is x, second is y)
                 *    ?                            A single value which stays for both axis
                 *    A value can be a number, a string or a calculation.
                 *
                 *    Operators:
                 *    [NONE]  The current scroll will be overwritten by the value.
                 *    '+='    The value will be added to the current scroll offset
                 *    '-='    The value will be subtracted from the current scroll offset
                 *    '*='    The current scroll wil be multiplicated by the value.
                 *    '/='    The current scroll wil be divided by the value.
                 *
                 *    Units:
                 *    [NONE]  The value is the final scroll amount.                   final = (value * 1)
                 *    'px'    Same as none
                 *    '%'     The value is dependent on the current scroll value.     final = ((currentScrollValue / 100) * value)
                 *    'vw'    The value is multiplicated by the viewport width.       final = (value * viewportWidth)
                 *    'vh'    The value is multiplicated by the viewport height.      final = (value * viewportHeight)
                 *
                 *    example final values:
                 *    200, '200px', '50%', '1vw', '1vh', '+=200', '/=1vw', '*=2px', '-=5vh', '+=33%', '+= 50% - 2px', '-= 1vw - 50%'
                 *
                 * 2. Can be a HTML or jQuery element:
                 *    The final scroll offset is the offset (without margin) of the given HTML / jQuery element.
                 *
                 * 3. Can be a object with a HTML or jQuery element with additional settings:
                 *    {
                 *      el : [HTMLElement, jQuery element],             MUST be specified, else this object isn't valid.
                 *      scroll : [string, array, object],               Default value is 'always'.
                 *      block : [string, array, object],                Default value is 'begin'.
                 *      margin : [number, boolean, array, object]       Default value is false.
                 *    }
                 *
                 *    Possible scroll settings are:
                 *    'always'      Scrolls always.
                 *    'ifneeded'    Scrolls only if the element isnt fully in view.
                 *    'never'       Scrolls never.
                 *
                 *    Possible block settings are:
                 *    'begin'   Both axis shall be docked to the "begin" edge. - The element will be docked to the top and left edge of the viewport.
                 *    'end'     Both axis shall be docked to the "end" edge. - The element will be docked to the bottom and right edge of the viewport. (If direction is RTL to the bottom and left edge.)
                 *    'center'  Both axis shall be docked to "center". - The element will be centered in the viewport.
                 *    'nearest' The element will be docked to the nearest edge(s).
                 *
                 *    Possible margin settings are: -- The actual margin of the element wont be affect, this option affects only the final scroll offset.
                 *    [BOOLEAN]                                         If true the css margin of the element will be used, if false no margin will be used.
                 *    [NUMBER]                                          The margin will be used for all edges.
                 *
                 * @param duration The duration of the scroll animation, OR a jQuery animation configuration object.
                 * @param easing The animation easing.
                 * @param complete The animation complete callback.
                 * @returns {{
                 *   position: {x: number, y: number},
                 *   ratio: {x: number, y: number},
                 *   max: {x: number, y: number},
                 *   handleOffset: {x: number, y: number},
                 *   handleLength: {x: number, y: number},
                 *   handleLengthRatio: {x: number, y: number}, t
                 *   rackLength: {x: number, y: number},
                 *   isRTL: boolean,
                 *   isRTLNormalized: boolean
                 *  }}
                 */
        _base.scroll = function (coordinates, duration, easing, complete) {
          if (arguments.length === 0 || coordinates === undefined) {
            const infoX = _scrollHorizontalInfo
            const infoY = _scrollVerticalInfo
            const normalizeInvert = _normalizeRTLCache && _isRTL && _rtlScrollBehavior.i
            const normalizeNegate = _normalizeRTLCache && _isRTL && _rtlScrollBehavior.n
            let scrollX = infoX._currentScroll
            let scrollXRatio = infoX._currentScrollRatio
            let maxScrollX = infoX._maxScroll
            scrollXRatio = normalizeInvert ? 1 - scrollXRatio : scrollXRatio
            scrollX = normalizeInvert ? maxScrollX - scrollX : scrollX
            scrollX *= normalizeNegate ? -1 : 1
            maxScrollX *= normalizeNegate ? -1 : 1

            return {
              position: {
                x: scrollX,
                y: infoY._currentScroll
              },
              ratio: {
                x: scrollXRatio,
                y: infoY._currentScrollRatio
              },
              max: {
                x: maxScrollX,
                y: infoY._maxScroll
              },
              handleOffset: {
                x: infoX._handleOffset,
                y: infoY._handleOffset
              },
              handleLength: {
                x: infoX._handleLength,
                y: infoY._handleLength
              },
              handleLengthRatio: {
                x: infoX._handleLengthRatio,
                y: infoY._handleLengthRatio
              },
              trackLength: {
                x: infoX._trackLength,
                y: infoY._trackLength
              },
              snappedHandleOffset: {
                x: infoX._snappedHandleOffset,
                y: infoY._snappedHandleOffset
              },
              isRTL: _isRTL,
              isRTLNormalized: _normalizeRTLCache
            }
          }

          _base.update(_strSync)

          const normalizeRTL = _normalizeRTLCache
          const coordinatesXAxisProps = [_strX, _strLeft, 'l']
          const coordinatesYAxisProps = [_strY, _strTop, 't']
          const coordinatesOperators = ['+=', '-=', '*=', '/=']
          const durationIsObject = type(duration) == TYPES.o
          const completeCallback = durationIsObject ? duration.complete : complete
          let i
          const finalScroll = {}
          const specialEasing = {}
          let doScrollLeft
          let doScrollTop
          let animationOptions
          const strEnd = 'end'
          const strBegin = 'begin'
          const strCenter = 'center'
          const strNearest = 'nearest'
          const strAlways = 'always'
          const strNever = 'never'
          const strIfNeeded = 'ifneeded'
          const strLength = LEXICON.l
          let settingsAxis
          let settingsScroll
          let settingsBlock
          let settingsMargin
          let finalElement
          const elementObjSettingsAxisValues = [_strX, _strY, 'xy', 'yx']
          const elementObjSettingsBlockValues = [strBegin, strEnd, strCenter, strNearest]
          const elementObjSettingsScrollValues = [strAlways, strNever, strIfNeeded]
          const coordinatesIsElementObj = coordinates[LEXICON.hOP]('el')
          const possibleElement = coordinatesIsElementObj ? coordinates.el : coordinates
          const possibleElementIsJQuery = possibleElement instanceof FRAMEWORK || JQUERY ? possibleElement instanceof JQUERY : false
          const possibleElementIsHTMLElement = possibleElementIsJQuery ? false : isHTMLElement(possibleElement)
          const updateScrollbarInfos = function () {
            if (doScrollLeft) {
              refreshScrollbarHandleOffset(true)
            }
            if (doScrollTop) {
              refreshScrollbarHandleOffset(false)
            }
          }
          const proxyCompleteCallback = type(completeCallback) != TYPES.f ? undefined : function () {
            updateScrollbarInfos()
            completeCallback()
          }
          function checkSettingsStringValue(currValue, allowedValues) {
            for (i = 0; i < allowedValues[strLength]; i++) {
              if (currValue === allowedValues[i]) {
                return true
              }
            }
            return false
          }
          function getRawScroll(isX, coordinates) {
            const coordinateProps = isX ? coordinatesXAxisProps : coordinatesYAxisProps
            coordinates = type(coordinates) == TYPES.s || type(coordinates) == TYPES.n ? [coordinates, coordinates] : coordinates

            if (type(coordinates) == TYPES.a) {
              return isX ? coordinates[0] : coordinates[1]
            } else if (type(coordinates) == TYPES.o) {
              // decides RTL normalization "hack" with .n
              // normalizeRTL = type(coordinates.n) == TYPES.b ? coordinates.n : normalizeRTL;
              for (i = 0; i < coordinateProps[strLength]; i++) {
                if (coordinateProps[i] in coordinates) {
                  return coordinates[coordinateProps[i]]
                }
              }
            }
          }
          function getFinalScroll(isX, rawScroll) {
            const isString = type(rawScroll) == TYPES.s
            let operator
            let amount
            const scrollInfo = isX ? _scrollHorizontalInfo : _scrollVerticalInfo
            const currScroll = scrollInfo._currentScroll
            const maxScroll = scrollInfo._maxScroll
            const mult = ' * '
            let finalValue
            const isRTLisX = _isRTL && isX
            const normalizeShortcuts = isRTLisX && _rtlScrollBehavior.n && !normalizeRTL
            const strReplace = 'replace'
            const evalFunc = eval
            let possibleOperator
            if (isString) {
              // check operator
              if (rawScroll[strLength] > 2) {
                possibleOperator = rawScroll.substr(0, 2)
                if (inArray(possibleOperator, coordinatesOperators) > -1) {
                  operator = possibleOperator
                }
              }

              // calculate units and shortcuts
              rawScroll = operator ? rawScroll.substr(2) : rawScroll
              rawScroll = rawScroll
                [strReplace](/min/g, 0) // 'min' = 0%
                [strReplace](/</g, 0)   // '<'   = 0%
                [strReplace](/max/g, (normalizeShortcuts ? '-' : _strEmpty) + _strHundredPercent)    // 'max' = 100%
                [strReplace](/>/g, (normalizeShortcuts ? '-' : _strEmpty) + _strHundredPercent)      // '>'   = 100%
                [strReplace](/px/g, _strEmpty)
                [strReplace](/%/g, mult + maxScroll * (isRTLisX && _rtlScrollBehavior.n ? -1 : 1) / 100.0)
                [strReplace](/vw/g, mult + _viewportSize.w)
                [strReplace](/vh/g, mult + _viewportSize.h)
              amount = parseToZeroOrNumber(isNaN(rawScroll) ? parseToZeroOrNumber(evalFunc(rawScroll), true).toFixed() : rawScroll)
            } else {
              amount = rawScroll
            }

            if (amount !== undefined && !isNaN(amount) && type(amount) == TYPES.n) {
              const normalizeIsRTLisX = normalizeRTL && isRTLisX
              let operatorCurrScroll = currScroll * (normalizeIsRTLisX && _rtlScrollBehavior.n ? -1 : 1)
              const invert = normalizeIsRTLisX && _rtlScrollBehavior.i
              const negate = normalizeIsRTLisX && _rtlScrollBehavior.n
              operatorCurrScroll = invert ? maxScroll - operatorCurrScroll : operatorCurrScroll
              switch (operator) {
                case '+=':
                  finalValue = operatorCurrScroll + amount
                  break
                case '-=':
                  finalValue = operatorCurrScroll - amount
                  break
                case '*=':
                  finalValue = operatorCurrScroll * amount
                  break
                case '/=':
                  finalValue = operatorCurrScroll / amount
                  break
                default:
                  finalValue = amount
                  break
              }
              finalValue = invert ? maxScroll - finalValue : finalValue
              finalValue *= negate ? -1 : 1
              finalValue = isRTLisX && _rtlScrollBehavior.n ? MATH.min(0, MATH.max(maxScroll, finalValue)) : MATH.max(0, MATH.min(maxScroll, finalValue))
            }
            return finalValue === currScroll ? undefined : finalValue
          }
          function getPerAxisValue(value, valueInternalType, defaultValue, allowedValues) {
            const resultDefault = [defaultValue, defaultValue]
            const valueType = type(value)
            let valueArrLength
            let valueArrItem

            // value can be [ string, or array of two strings ]
            if (valueType == valueInternalType) {
              value = [value, value]
            } else if (valueType == TYPES.a) {
              valueArrLength = value[strLength]
              if (valueArrLength > 2 || valueArrLength < 1) {
                value = resultDefault
              } else {
                if (valueArrLength === 1) {
                  value[1] = defaultValue
                }
                for (i = 0; i < valueArrLength; i++) {
                  valueArrItem = value[i]
                  if (type(valueArrItem) != valueInternalType || !checkSettingsStringValue(valueArrItem, allowedValues)) {
                    value = resultDefault
                    break
                  }
                }
              }
            } else if (valueType == TYPES.o) {
              value = [value[_strX] || defaultValue, value[_strY] || defaultValue]
            } else {
              value = resultDefault
            }
            return {
              x: value[0],
              y: value[1]
            }
          }
          function generateMargin(marginTopRightBottomLeftArray) {
            const result = []
            let currValue
            let currValueType
            const valueDirections = [_strTop, _strRight, _strBottom, _strLeft]
            for (i = 0; i < marginTopRightBottomLeftArray[strLength]; i++) {
              if (i === valueDirections[strLength]) {
                break
              }
              currValue = marginTopRightBottomLeftArray[i]
              currValueType = type(currValue)
              if (currValueType == TYPES.b) {
                result.push(currValue ? parseToZeroOrNumber(finalElement.css(_strMarginMinus + valueDirections[i])) : 0)
              } else {
                result.push(currValueType == TYPES.n ? currValue : 0)
              }
            }
            return result
          }

          if (possibleElementIsJQuery || possibleElementIsHTMLElement) {
            // get settings
            let margin = coordinatesIsElementObj ? coordinates.margin : 0
            const axis = coordinatesIsElementObj ? coordinates.axis : 0
            const scroll = coordinatesIsElementObj ? coordinates.scroll : 0
            const block = coordinatesIsElementObj ? coordinates.block : 0
            const marginDefault = [0, 0, 0, 0]
            const marginType = type(margin)
            let marginLength
            finalElement = possibleElementIsJQuery ? possibleElement : FRAMEWORK(possibleElement)

            if (finalElement[strLength] > 0) {
              // margin can be [ boolean, number, array of 2, array of 4, object ]
              if (marginType == TYPES.n || marginType == TYPES.b) {
                margin = generateMargin([margin, margin, margin, margin])
              } else if (marginType == TYPES.a) {
                marginLength = margin[strLength]
                if (marginLength === 2) {
                  margin = generateMargin([margin[0], margin[1], margin[0], margin[1]])
                } else if (marginLength >= 4) {
                  margin = generateMargin(margin)
                } else {
                  margin = marginDefault
                }
              } else if (marginType == TYPES.o) {
                margin = generateMargin([margin[_strTop], margin[_strRight], margin[_strBottom], margin[_strLeft]])
              } else {
                margin = marginDefault
              }

              // block = type(block) === TYPES.b ? block ? [ strNearest, strBegin ] : [ strNearest, strEnd ] : block;
              settingsAxis = checkSettingsStringValue(axis, elementObjSettingsAxisValues) ? axis : 'xy'
              settingsScroll = getPerAxisValue(scroll, TYPES.s, strAlways, elementObjSettingsScrollValues)
              settingsBlock = getPerAxisValue(block, TYPES.s, strBegin, elementObjSettingsBlockValues)
              settingsMargin = margin

              const viewportScroll = {
                l: _scrollHorizontalInfo._currentScroll,
                t: _scrollVerticalInfo._currentScroll
              }
              // use padding element instead of viewport element because padding element has never padding, margin or position applied.
              const viewportOffset = _paddingElement.offset()

              // get coordinates
              const elementOffset = finalElement.offset()
              const doNotScroll = {
                x: settingsScroll.x == strNever || settingsAxis == _strY,
                y: settingsScroll.y == strNever || settingsAxis == _strX
              }
              elementOffset[_strTop] -= settingsMargin[0]
              elementOffset[_strLeft] -= settingsMargin[3]
              const elementScrollCoordinates = {
                x: MATH.round(elementOffset[_strLeft] - viewportOffset[_strLeft] + viewportScroll.l),
                y: MATH.round(elementOffset[_strTop] - viewportOffset[_strTop] + viewportScroll.t)
              }
              if (_isRTL) {
                if (!_rtlScrollBehavior.n && !_rtlScrollBehavior.i) {
                  elementScrollCoordinates.x = MATH.round(viewportOffset[_strLeft] - elementOffset[_strLeft] + viewportScroll.l)
                }
                if (_rtlScrollBehavior.n && normalizeRTL) {
                  elementScrollCoordinates.x *= -1
                }
                if (_rtlScrollBehavior.i && normalizeRTL) {
                  elementScrollCoordinates.x = MATH.round(viewportOffset[_strLeft] - elementOffset[_strLeft] + (_scrollHorizontalInfo._maxScroll - viewportScroll.l))
                }
              }

              // measuring is required
              if (settingsBlock.x != strBegin || settingsBlock.y != strBegin || settingsScroll.x == strIfNeeded || settingsScroll.y == strIfNeeded || _isRTL) {
                const measuringElm = finalElement[0]
                const rawElementSize = _supportTransform ? measuringElm[LEXICON.bCR]() : {
                  width: measuringElm[LEXICON.oW],
                  height: measuringElm[LEXICON.oH]
                }
                const elementSize = {
                  w: rawElementSize[_strWidth] + settingsMargin[3] + settingsMargin[1],
                  h: rawElementSize[_strHeight] + settingsMargin[0] + settingsMargin[2]
                }
                const finalizeBlock = function (isX) {
                  const vars = getScrollbarVars(isX)
                  const wh = vars._w_h
                  const lt = vars._left_top
                  const xy = vars._x_y
                  let blockIsEnd = settingsBlock[xy] == (isX ? _isRTL ? strBegin : strEnd : strEnd)
                  const blockIsCenter = settingsBlock[xy] == strCenter
                  const blockIsNearest = settingsBlock[xy] == strNearest
                  const scrollNever = settingsScroll[xy] == strNever
                  const scrollIfNeeded = settingsScroll[xy] == strIfNeeded
                  const vpSize = _viewportSize[wh]
                  const vpOffset = viewportOffset[lt]
                  const elSize = elementSize[wh]
                  const elOffset = elementOffset[lt]
                  const divide = blockIsCenter ? 2 : 1
                  const elementCenterOffset = elOffset + elSize / 2
                  const viewportCenterOffset = vpOffset + vpSize / 2
                  const isInView =
                                        elSize <= vpSize &&
                                        elOffset >= vpOffset &&
                                        elOffset + elSize <= vpOffset + vpSize

                  if (scrollNever) {
                    doNotScroll[xy] = true
                  } else if (!doNotScroll[xy]) {
                    if (blockIsNearest || scrollIfNeeded) {
                      doNotScroll[xy] = scrollIfNeeded ? isInView : false
                      blockIsEnd = elSize < vpSize ? elementCenterOffset > viewportCenterOffset : elementCenterOffset < viewportCenterOffset
                    }
                    elementScrollCoordinates[xy] -= blockIsEnd || blockIsCenter ? (vpSize / divide - elSize / divide) * (isX && _isRTL && normalizeRTL ? -1 : 1) : 0
                  }
                }
                finalizeBlock(true)
                finalizeBlock(false)
              }

              if (doNotScroll.y) {
                delete elementScrollCoordinates.y
              }
              if (doNotScroll.x) {
                delete elementScrollCoordinates.x
              }

              coordinates = elementScrollCoordinates
            }
          }

          finalScroll[_strScrollLeft] = getFinalScroll(true, getRawScroll(true, coordinates))
          finalScroll[_strScrollTop] = getFinalScroll(false, getRawScroll(false, coordinates))
          doScrollLeft = finalScroll[_strScrollLeft] !== undefined
          doScrollTop = finalScroll[_strScrollTop] !== undefined

          if ((doScrollLeft || doScrollTop) && (duration > 0 || durationIsObject)) {
            if (durationIsObject) {
              duration.complete = proxyCompleteCallback
              _viewportElement.animate(finalScroll, duration)
            } else {
              animationOptions = {
                duration,
                complete: proxyCompleteCallback
              }
              if (type(easing) == TYPES.a || FRAMEWORK.isPlainObject(easing)) {
                specialEasing[_strScrollLeft] = easing[0] || easing.x
                specialEasing[_strScrollTop] = easing[1] || easing.y
                animationOptions.specialEasing = specialEasing
              } else {
                animationOptions.easing = easing
              }
              _viewportElement.animate(finalScroll, animationOptions)
            }
          } else {
            if (doScrollLeft) {
              _viewportElement[_strScrollLeft](finalScroll[_strScrollLeft])
            }
            if (doScrollTop) {
              _viewportElement[_strScrollTop](finalScroll[_strScrollTop])
            }
            updateScrollbarInfos()
          }
        }

        /**
                 * Stops all scroll animations.
                 * @returns {*} The current OverlayScrollbars instance (for chaining).
                 */
        _base.scrollStop = function (param1, param2, param3) {
          _viewportElement.stop(param1, param2, param3)
          return _base
        }

        /**
                 * Returns all relevant elements.
                 * @param elementName The name of the element which shall be returned.
                 * @returns {{target: *, host: *, padding: *, viewport: *, content: *, scrollbarHorizontal: {scrollbar: *, track: *, handle: *}, scrollbarVertical: {scrollbar: *, track: *, handle: *}, scrollbarCorner: *} | *}
                 */
        _base.getElements = function (elementName) {
          const obj = {
            target: _targetElementNative,
            host: _hostElementNative,
            padding: _paddingElementNative,
            viewport: _viewportElementNative,
            content: _contentElementNative,
            scrollbarHorizontal: {
              scrollbar: _scrollbarHorizontalElement[0],
              track: _scrollbarHorizontalTrackElement[0],
              handle: _scrollbarHorizontalHandleElement[0]
            },
            scrollbarVertical: {
              scrollbar: _scrollbarVerticalElement[0],
              track: _scrollbarVerticalTrackElement[0],
              handle: _scrollbarVerticalHandleElement[0]
            },
            scrollbarCorner: _scrollbarCornerElement[0]
          }
          return type(elementName) == TYPES.s ? getObjectPropVal(obj, elementName) : obj
        }

        /**
                 * Returns a object which describes the current state of this instance.
                 * @param stateProperty A specific property from the state object which shall be returned.
                 * @returns {{widthAuto, heightAuto, overflowAmount, hideOverflow, hasOverflow, contentScrollSize, viewportSize, hostSize, autoUpdate} | *}
                 */
        _base.getState = function (stateProperty) {
          function prepare(obj) {
            if (!FRAMEWORK.isPlainObject(obj)) {
              return obj
            }
            const extended = extendDeep({}, obj)
            const changePropertyName = function (from, to) {
              if (extended[LEXICON.hOP](from)) {
                extended[to] = extended[from]
                delete extended[from]
              }
            }
            changePropertyName('w', _strWidth) // change w to width
            changePropertyName('h', _strHeight) // change h to height
            delete extended.c // delete c (the 'changed' prop)
            return extended
          }
          const obj = {
            destroyed: Boolean(prepare(_destroyed)),
            sleeping: Boolean(prepare(_sleeping)),
            autoUpdate: prepare(!_mutationObserversConnected),
            widthAuto: prepare(_widthAutoCache),
            heightAuto: prepare(_heightAutoCache),
            padding: prepare(_cssPaddingCache),
            overflowAmount: prepare(_overflowAmountCache),
            hideOverflow: prepare(_hideOverflowCache),
            hasOverflow: prepare(_hasOverflowCache),
            contentScrollSize: prepare(_contentScrollSizeCache),
            viewportSize: prepare(_viewportSize),
            hostSize: prepare(_hostSizeCache),
            documentMixed: prepare(_documentMixed)
          }
          return type(stateProperty) == TYPES.s ? getObjectPropVal(obj, stateProperty) : obj
        }

        /**
                 * Gets all or specific extension instance.
                 * @param extName The name of the extension from which the instance shall be got.
                 * @returns {{}} The instance of the extension with the given name or undefined if the instance couldn't be found.
                 */
        _base.ext = function (extName) {
          let result
          const privateMethods = _extensionsPrivateMethods.split(' ')
          let i = 0
          if (type(extName) == TYPES.s) {
            if (_extensions[LEXICON.hOP](extName)) {
              result = extendDeep({}, _extensions[extName])
              for (; i < privateMethods.length; i++) {
                delete result[privateMethods[i]]
              }
            }
          } else {
            result = {}
            for (i in _extensions) {
              result[i] = extendDeep({}, _base.ext(i))
            }
          }
          return result
        }

        /**
                 * Adds a extension to this instance.
                 * @param extName The name of the extension which shall be added.
                 * @param extensionOptions The extension options which shall be used.
                 * @returns {{}} The instance of the added extension or undefined if the extension couldn't be added properly.
                 */
        _base.addExt = function (extName, extensionOptions) {
          const registeredExtensionObj = _plugin.extension(extName)
          let instance
          let instanceAdded
          let instanceContract
          let contractResult
          let contractFulfilled = true
          if (registeredExtensionObj) {
            if (!_extensions[LEXICON.hOP](extName)) {
              instance = registeredExtensionObj.extensionFactory.call(_base,
                extendDeep({}, registeredExtensionObj.defaultOptions),
                FRAMEWORK,
                COMPATIBILITY)

              if (instance) {
                instanceContract = instance.contract
                if (type(instanceContract) == TYPES.f) {
                  contractResult = instanceContract(window)
                  contractFulfilled = type(contractResult) == TYPES.b ? contractResult : contractFulfilled
                }
                if (contractFulfilled) {
                  _extensions[extName] = instance
                  instanceAdded = instance.added
                  if (type(instanceAdded) == TYPES.f) {
                    instanceAdded(extensionOptions)
                  }

                  return _base.ext(extName)
                }
              }
            } else {
              return _base.ext(extName)
            }
          } else {
            console.warn(`A extension with the name "${extName}" isn't registered.`)
          }
        }

        /**
                 * Removes a extension from this instance.
                 * @param extName The name of the extension which shall be removed.
                 * @returns {boolean} True if the extension was removed, false otherwise e.g. if the extension wasn't added before.
                 */
        _base.removeExt = function (extName) {
          const instance = _extensions[extName]
          let instanceRemoved
          if (instance) {
            delete _extensions[extName]

            instanceRemoved = instance.removed
            if (type(instanceRemoved) == TYPES.f) {
              instanceRemoved()
            }

            return true
          }
          return false
        }

        /**
                 * Constructs the plugin.
                 * @param targetElement The element to which the plugin shall be applied.
                 * @param options The initial options of the plugin.
                 * @param extensions The extension(s) which shall be added right after the initialization.
                 * @returns {boolean} True if the plugin was successfully initialized, false otherwise.
                 */
        function construct(targetElement, options, extensions) {
          _defaultOptions = globals.defaultOptions
          _nativeScrollbarStyling = globals.nativeScrollbarStyling
          _nativeScrollbarSize = extendDeep({}, globals.nativeScrollbarSize)
          _nativeScrollbarIsOverlaid = extendDeep({}, globals.nativeScrollbarIsOverlaid)
          _overlayScrollbarDummySize = extendDeep({}, globals.overlayScrollbarDummySize)
          _rtlScrollBehavior = extendDeep({}, globals.rtlScrollBehavior)

          // parse & set options but don't update
          setOptions(extendDeep({}, _defaultOptions, options))

          _cssCalc = globals.cssCalc
          _msieVersion = globals.msie
          _autoUpdateRecommended = globals.autoUpdateRecommended
          _supportTransition = globals.supportTransition
          _supportTransform = globals.supportTransform
          _supportPassiveEvents = globals.supportPassiveEvents
          _supportResizeObserver = globals.supportResizeObserver
          _supportMutationObserver = globals.supportMutationObserver
          _restrictedMeasuring = globals.restrictedMeasuring
          _documentElement = FRAMEWORK(targetElement.ownerDocument)
          _documentElementNative = _documentElement[0]
          _windowElement = FRAMEWORK(_documentElementNative.defaultView || _documentElementNative.parentWindow)
          _windowElementNative = _windowElement[0]
          _htmlElement = findFirst(_documentElement, 'html')
          _bodyElement = findFirst(_htmlElement, 'body')
          _targetElement = FRAMEWORK(targetElement)
          _targetElementNative = _targetElement[0]
          _isTextarea = _targetElement.is('textarea')
          _isBody = _targetElement.is('body')
          _documentMixed = _documentElementNative !== document

          /* On a div Element The if checks only whether:
                     * - the targetElement has the class "os-host"
                     * - the targetElement has a a child with the class "os-padding"
                     *
                     * If that's the case, its assumed the DOM has already the following structure:
                     * (The ".os-host" element is the targetElement)
                     *
                     *  <div class="os-host">
                     *      <div class="os-resize-observer-host"></div>
                     *      <div class="os-padding">
                     *          <div class="os-viewport">
                     *              <div class="os-content"></div>
                     *          </div>
                     *      </div>
                     *      <div class="os-scrollbar os-scrollbar-horizontal ">
                     *          <div class="os-scrollbar-track">
                     *              <div class="os-scrollbar-handle"></div>
                     *          </div>
                     *      </div>
                     *      <div class="os-scrollbar os-scrollbar-vertical">
                     *          <div class="os-scrollbar-track">
                     *              <div class="os-scrollbar-handle"></div>
                     *          </div>
                     *      </div>
                     *      <div class="os-scrollbar-corner"></div>
                     *  </div>
                     *
                     * =====================================================================================
                     *
                     * On a Textarea Element The if checks only whether:
                     * - the targetElement has the class "os-textarea"
                     * - the targetElement is inside a element with the class "os-content"
                     *
                     * If that's the case, its assumed the DOM has already the following structure:
                     * (The ".os-textarea" (textarea) element is the targetElement)
                     *
                     *  <div class="os-host-textarea">
                     *      <div class="os-resize-observer-host"></div>
                     *      <div class="os-padding os-text-inherit">
                     *          <div class="os-viewport os-text-inherit">
                     *              <div class="os-content os-text-inherit">
                     *                  <div class="os-textarea-cover"></div>
                     *                  <textarea class="os-textarea os-text-inherit"></textarea>
                     *              </div>
                     *          </div>
                     *      </div>
                     *      <div class="os-scrollbar os-scrollbar-horizontal ">
                     *          <div class="os-scrollbar-track">
                     *              <div class="os-scrollbar-handle"></div>
                     *          </div>
                     *      </div>
                     *      <div class="os-scrollbar os-scrollbar-vertical">
                     *          <div class="os-scrollbar-track">
                     *              <div class="os-scrollbar-handle"></div>
                     *          </div>
                     *      </div>
                     *      <div class="os-scrollbar-corner"></div>
                     *  </div>
                     */
          _domExists = _isTextarea
            ? _targetElement.hasClass(_classNameTextareaElement) && _targetElement.parent().hasClass(_classNameContentElement)
            : _targetElement.hasClass(_classNameHostElement) && _targetElement.children(_strDot + _classNamePaddingElement)[LEXICON.l]

          let initBodyScroll
          let bodyMouseTouchDownListener

          // check if the plugin hasn't to be initialized
          if (_nativeScrollbarIsOverlaid.x && _nativeScrollbarIsOverlaid.y && !_currentPreparedOptions.nativeScrollbarsOverlaid.initialize) {
            dispatchCallback('onInitializationWithdrawn')
            if (_domExists) {
              setupStructureDOM(true)
              setupScrollbarsDOM(true)
              setupScrollbarCornerDOM(true)
            }

            _destroyed = true
            _sleeping = true

            return _base
          }

          if (_isBody) {
            initBodyScroll = {}
            initBodyScroll.l = MATH.max(_targetElement[_strScrollLeft](), _htmlElement[_strScrollLeft](), _windowElement[_strScrollLeft]())
            initBodyScroll.t = MATH.max(_targetElement[_strScrollTop](), _htmlElement[_strScrollTop](), _windowElement[_strScrollTop]())

            bodyMouseTouchDownListener = function () {
              _viewportElement.removeAttr(LEXICON.ti)
              setupResponsiveEventListener(_viewportElement, _strMouseTouchDownEvent, bodyMouseTouchDownListener, true, true)
            }
          }

          // build OverlayScrollbars DOM
          setupStructureDOM()
          setupScrollbarsDOM()
          setupScrollbarCornerDOM()

          // create OverlayScrollbars events
          setupStructureEvents()
          setupScrollbarEvents(true)
          setupScrollbarEvents(false)
          setupScrollbarCornerEvents()

          // create mutation observers
          createMutationObservers()

          // build resize observer for the host element
          setupResizeObserver(_sizeObserverElement, hostOnResized)

          if (_isBody) {
            // apply the body scroll to handle it right in the update method
            _viewportElement[_strScrollLeft](initBodyScroll.l)[_strScrollTop](initBodyScroll.t)

            // set the focus on the viewport element so you dont have to click on the page to use keyboard keys (up / down / space) for scrolling
            if (document.activeElement == targetElement && _viewportElementNative.focus) {
              // set a tabindex to make the viewportElement focusable
              _viewportElement.attr(LEXICON.ti, '-1')
              _viewportElementNative.focus()

              /* the tabindex has to be removed due to;
                             * If you set the tabindex attribute on an <div>, then its child content cannot be scrolled with the arrow keys unless you set tabindex on the content, too
                             * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
                             */
              setupResponsiveEventListener(_viewportElement, _strMouseTouchDownEvent, bodyMouseTouchDownListener, false, true)
            }
          }

          // update for the first time & initialize cache
          _base.update(_strAuto)

          // the plugin is initialized now!
          _initialized = true
          dispatchCallback('onInitialized')

          // call all callbacks which would fire before the initialized was complete
          each(_callbacksInitQeueue, (index, value) => {
            dispatchCallback(value.n, value.a)
          })
          _callbacksInitQeueue = []

          // add extensions
          if (type(extensions) == TYPES.s) {
            extensions = [extensions]
          }
          if (COMPATIBILITY.isA(extensions)) {
            each(extensions, (index, value) => {
              _base.addExt(value)
            })
          } else if (FRAMEWORK.isPlainObject(extensions)) {
            each(extensions, (key, value) => {
              _base.addExt(key, value)
            })
          }

          // add the transition class for transitions AFTER the first update & AFTER the applied extensions (for preventing unwanted transitions)
          setTimeout(() => {
            if (_supportTransition && !_destroyed) {
              addClass(_hostElement, _classNameHostTransition)
            }
          }, 333)

          return _base
        }

        if (_plugin.valid(construct(pluginTargetElement, options, extensions))) {
          INSTANCES(pluginTargetElement, _base)
        }

        return _base
      }

      /**
             * Initializes a new OverlayScrollbarsInstance object or changes options if already initialized or returns the current instance.
             * @param pluginTargetElements The elements to which the Plugin shall be initialized.
             * @param options The custom options with which the plugin shall be initialized.
             * @param extensions The extension(s) which shall be added right after initialization.
             * @returns {*}
             */
      _plugin = window[PLUGINNAME] = function (pluginTargetElements, options, extensions) {
        if (arguments[LEXICON.l] === 0) {
          return this
        }

        const arr = []
        const optsIsPlainObj = FRAMEWORK.isPlainObject(options)
        let inst
        let result

        // pluginTargetElements is null or undefined
        if (!pluginTargetElements) {
          return optsIsPlainObj || !options ? result : arr
        }

        /*
                   pluginTargetElements will be converted to:
                   1. A jQueryElement Array
                   2. A HTMLElement Array
                   3. A Array with a single HTML Element
                   so pluginTargetElements is always a array.
                */
        pluginTargetElements = pluginTargetElements[LEXICON.l] != undefined ? pluginTargetElements : [pluginTargetElements[0] || pluginTargetElements]
        initOverlayScrollbarsStatics()

        if (pluginTargetElements[LEXICON.l] > 0) {
          if (optsIsPlainObj) {
            FRAMEWORK.each(pluginTargetElements, (i, v) => {
              inst = v
              if (inst !== undefined) {
                arr.push(OverlayScrollbarsInstance(inst, options, extensions, _pluginsGlobals, _pluginsAutoUpdateLoop))
              }
            })
          } else {
            FRAMEWORK.each(pluginTargetElements, (i, v) => {
              inst = INSTANCES(v)
              if (options === '!' && _plugin.valid(inst) || COMPATIBILITY.type(options) == TYPES.f && options(v, inst)) {
                arr.push(inst)
              } else if (options === undefined) {
                arr.push(inst)
              }
            })
          }
          result = arr[LEXICON.l] === 1 ? arr[0] : arr
        }
        return result
      }

      /**
             * Returns a object which contains global information about the plugin and each instance of it.
             * The returned object is just a copy, that means that changes to the returned object won't have any effect to the original object.
             */
      _plugin.globals = function () {
        initOverlayScrollbarsStatics()
        const globals = FRAMEWORK.extend(true, {}, _pluginsGlobals)
        delete globals.msie
        return globals
      }

      /**
             * Gets or Sets the default options for each new plugin initialization.
             * @param newDefaultOptions The object with which the default options shall be extended.
             */
      _plugin.defaultOptions = function (newDefaultOptions) {
        initOverlayScrollbarsStatics()
        const currDefaultOptions = _pluginsGlobals.defaultOptions
        if (newDefaultOptions === undefined) {
          return FRAMEWORK.extend(true, {}, currDefaultOptions)
        }

        // set the new default options
        _pluginsGlobals.defaultOptions = FRAMEWORK.extend(true, {}, currDefaultOptions, _pluginsOptions._validate(newDefaultOptions, _pluginsOptions._template, true, currDefaultOptions)._default)
      }

      /**
             * Checks whether the passed instance is a non-destroyed OverlayScrollbars instance.
             * @param osInstance The potential OverlayScrollbars instance which shall be checked.
             * @returns {boolean} True if the passed value is a non-destroyed OverlayScrollbars instance, false otherwise.
             */
      _plugin.valid = function (osInstance) {
        return osInstance instanceof _plugin && !osInstance.getState().destroyed
      }

      /**
             * Registers, Unregisters or returns a extension.
             * Register: Pass the name and the extension. (defaultOptions is optional)
             * Unregister: Pass the name and anything except a function as extension parameter.
             * Get extension: Pass the name of the extension which shall be got.
             * Get all extensions: Pass no arguments.
             * @param extensionName The name of the extension which shall be registered, unregistered or returned.
             * @param extension A function which generates the instance of the extension or anything other to remove a already registered extension.
             * @param defaultOptions The default options which shall be used for the registered extension.
             */
      _plugin.extension = function (extensionName, extension, defaultOptions) {
        const extNameTypeString = COMPATIBILITY.type(extensionName) == TYPES.s
        const argLen = arguments[LEXICON.l]
        let i = 0
        if (argLen < 1 || !extNameTypeString) {
          // return a copy of all extension objects
          return FRAMEWORK.extend(true, {
            length: _pluginsExtensions[LEXICON.l]
          }, _pluginsExtensions)
        } else if (extNameTypeString) {
          if (COMPATIBILITY.type(extension) == TYPES.f) {
            // register extension
            _pluginsExtensions.push({
              name: extensionName,
              extensionFactory: extension,
              defaultOptions
            })
          } else {
            for (; i < _pluginsExtensions[LEXICON.l]; i++) {
              if (_pluginsExtensions[i].name === extensionName) {
                if (argLen > 1) {
                  _pluginsExtensions.splice(i, 1)
                } // remove extension
                else {
                  return FRAMEWORK.extend(true, {}, _pluginsExtensions[i])
                } // return extension with the given name
              }
            }
          }
        }
      }

      return _plugin
    }())

    if (JQUERY && JQUERY.fn) {
      /**
             * The jQuery initialization interface.
             * @param options The initial options for the construction of the plugin. To initialize the plugin, this option has to be a object! If it isn't a object, the instance(s) are returned and the plugin wont be initialized.
             * @param extensions The extension(s) which shall be added right after initialization.
             * @returns {*} After initialization it returns the jQuery element array, else it returns the instance(s) of the elements which are selected.
             */
      JQUERY.fn.overlayScrollbars = function (options, extensions) {
        const _elements = this
        if (JQUERY.isPlainObject(options)) {
          JQUERY.each(_elements, function () {
            PLUGIN(this, options, extensions)
          })
          return _elements
        }
        return PLUGIN(_elements, options)
      }
    }
    return PLUGIN
  }
))
