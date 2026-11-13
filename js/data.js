/* 内容数据访问层：境界/物品/神将 + 世界地图 */
(function () {
  "use strict";
  var D = window.GAME_DATA;
  var d = {};

  d.realms = D.realms || [];
  d.heroes = D.heroes || [];
  d.items = D.items || {};
  d.world = D.world;
  d.maxRealm = d.realms.length - 1;

  d.realmAt = function (i) { return d.realms[i]; };
  d.heroById = function (id) { return d.heroes.find(function (h) { return h.id === id; }); };
  d.itemById = function (id) { return d.items[id]; };
  d.pathById = function (id) { return (D.paths || []).find(function (p) { return p.id === id; }); };
  d.linggenById = function (id) { return (D.linggens || []).find(function (l) { return l.id === id; }); };
  d.rarityClass = function (r) {
    return { "白": "bai", "绿": "lv", "蓝": "lan", "紫": "zi", "橙": "cheng", "红": "hong" }[r] || "bai";
  };

  /* ---- 世界地图 ---- */
  d.inBounds = function (x, y) {
    return x >= 0 && y >= 0 && x < d.world.width && y < d.world.height;
  };
  d.tileAt = function (x, y) {
    if (!d.inBounds(x, y)) return null;
    return d.world.map[y][x];
  };
  d.legendOf = function (ch) {
    return (d.world.legend || {})[ch] || { name: "?", walkable: false };
  };
  d.zoneAt = function (x, y) {
    var zones = d.world.zones || [];
    for (var i = 0; i < zones.length; i++) {
      var r = zones[i].rect;
      if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return zones[i];
    }
    return { id: "huangye", name: "荒野", desc: "无名的荒野。" };
  };
  d.monsterOf = function (ch, zoneId) {
    var lg = d.legendOf(ch);
    var key = lg.monster === "zone" ? ((d.world.bossByZone || {})[zoneId] || "shuyao") : lg.monster;
    return d.world.monsters[key] || null;
  };

  window.Game.data = d;
})();
