/* 通用工具函数 */
(function () {
  "use strict";
  var u = {};

  // 数字格式化：万 / 亿
  u.fmt = function (n) {
    n = Number(n) || 0;
    if (n >= 1e8) return trim((n / 1e8)) + "亿";
    if (n >= 1e4) return trim((n / 1e4)) + "万";
    return Math.floor(n).toLocaleString("zh-CN");
  };
  function trim(x) {
    return (Math.round(x * 100) / 100).toString();
  }

  // 时长格式化
  u.dur = function (ms) {
    ms = Math.floor(ms / 1000);
    var h = Math.floor(ms / 3600), m = Math.floor((ms % 3600) / 60), s = ms % 60;
    if (h > 0) return h + "小时" + m + "分";
    if (m > 0) return m + "分" + s + "秒";
    return s + "秒";
  };

  u.rnd = function (max) { return Math.random() * max; };
  u.chance = function (p) { return Math.random() < p; };
  u.clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  u.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  u.now = function () { return Date.now(); };

  u.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // 天道时长：小时 → 年/天/时
  u.tiandao = function (h) {
    h = Math.floor(h || 0);
    var y = Math.floor(h / 8760), dd = Math.floor((h % 8760) / 24), hh = h % 24;
    if (y > 0) return y + "年" + dd + "天";
    if (dd > 0) return dd + "天" + hh + "时";
    return hh + "小时";
  };

  window.Game.util = u;
})();
