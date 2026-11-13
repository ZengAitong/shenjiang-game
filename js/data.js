/* 内容数据访问层：把 GAME_DATA 的原始数组封装成查询接口 */
(function () {
  "use strict";
  var D = window.GAME_DATA;
  var d = {};

  d.realms = D.realms || [];
  d.heroes = D.heroes || [];
  d.stages = D.stages || [];
  d.items = D.items || {};
  d.maxRealm = d.realms.length - 1;

  d.realmAt = function (i) { return d.realms[i]; };
  d.stageAt = function (i) { return d.stages[i]; };
  d.heroById = function (id) { return d.heroes.find(function (h) { return h.id === id; }); };
  d.itemById = function (id) { return d.items[id]; };
  d.pathById = function (id) { return (D.paths || []).find(function (p) { return p.id === id; }); };
  d.linggenById = function (id) { return (D.linggens || []).find(function (l) { return l.id === id; }); };

  // 稀有度 → css 类
  d.rarityClass = function (r) {
    return { "白": "bai", "绿": "lv", "蓝": "lan", "紫": "zi", "橙": "cheng", "红": "hong" }[r] || "bai";
  };

  window.Game.data = d;
})();
