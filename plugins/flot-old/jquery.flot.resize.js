/* Flot plugin for automatically redrawing plots as the placeholder resizes.

Copyright (c) 2007-2013 IOLA and Ole Laursen.
Licensed under the MIT license.

It works by listening for changes on the placeholder div (through the jQuery
resize event plugin) - if the size changes, it will redraw the plot.

There are no options. If you need to disable the plugin for some plots, you
can just fix the size of their placeholders.

*/

/* Inline dependency:
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function ($, t, n) {
  function p() {
    for (let n = r.length - 1; n >= 0; n--) {
      const o = $(r[n]); if (o[0] == t || o.is(':visible')) {
        const h = o.width(); const d = o.height(); var v = o.data(a); !v || h === v.w && d === v.h ? i[f] = i[l] : (i[f] = i[c], o.trigger(u, [v.w = h, v.h = d]))
      } else {
        v = o.data(a), v.w = 0, v.h = 0
      }
    }s !== null && (s = t.requestAnimationFrame(p))
  } var r = []; var i = $.resize = $.extend($.resize, {}); let s; const o = 'setTimeout'; var u = 'resize'; var a = `${u}-special-event`; var f = 'delay'; var l = 'pendingDelay'; var c = 'activeDelay'; const h = 'throttleWindow'; i[l] = 250, i[c] = 20, i[f] = i[l], i[h] = !0, $.event.special[u] = {
    setup() {
      if (!i[h] && this[o]) {
        return !1
      } const t = $(this); r.push(this), t.data(a, {
        w:t.width(),
        h:t.height()
      }), r.length === 1 && (s = n, p())
    },
    teardown() {
      if (!i[h] && this[o]) {
        return !1
      } const t = $(this); for (let n = r.length - 1; n >= 0; n--) {
        if (r[n] == this) {
          r.splice(n, 1); break
        }
      }t.removeData(a), r.length || (cancelAnimationFrame(s), s = null)
    },
    add(t) {
      function s(t, i, s) {
        const o = $(this); const u = o.data(a); u.w = i !== n ? i : o.width(), u.h = s !== n ? s : o.height(), r.apply(this, arguments)
      } if (!i[h] && this[o]) {
        return !1
      } let r; if ($.isFunction(t)) {
        return r = t, s
      } r = t.handler, t.handler = s
    }
  }, t.requestAnimationFrame || (t.requestAnimationFrame = (function () {
    return t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || t.msRequestAnimationFrame || function (e, n) {
      return t.setTimeout(e, i[f])
    }
  }())), t.cancelAnimationFrame || (t.cancelAnimationFrame = (function () {
    return t.webkitCancelRequestAnimationFrame || t.mozCancelRequestAnimationFrame || t.oCancelRequestAnimationFrame || t.msCancelRequestAnimationFrame || clearTimeout
  }()))
}(jQuery, this));

(function ($) {
  const options = { } // no options

  function init(plot) {
    function onResize() {
      const placeholder = plot.getPlaceholder()

      // somebody might have hidden us and we can't plot
      // when we don't have the dimensions
      if (placeholder.width() == 0 || placeholder.height() == 0) {
        return
      }

      plot.resize()
      plot.setupGrid()
      plot.draw()
    }

    function bindEvents(plot, eventHolder) {
      plot.getPlaceholder().resize(onResize)
    }

    function shutdown(plot, eventHolder) {
      plot.getPlaceholder().unbind('resize', onResize)
    }

    plot.hooks.bindEvents.push(bindEvents)
    plot.hooks.shutdown.push(shutdown)
  }

  $.plot.plugins.push({
    init,
    options,
    name: 'resize',
    version: '1.0'
  })
}(jQuery))
