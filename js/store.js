/* 状态与存档：读档/存档/事件总线/有效属性计算 */
(function () {
  "use strict";
  var KEY = "lunhui_save_v1";
  var bus = { handlers: {} };

  var store = {};

  store.on = function (ev, fn) {
    (bus.handlers[ev] = bus.handlers[ev] || []).push(fn);
  };
  store.emit = function (ev, payload) {
    (bus.handlers[ev] || []).forEach(function (fn) {
      try { fn(payload); } catch (e) { console.error(e); }
    });
  };

  store.newGame = function (opts) {
    opts = opts || {};
    var w = window.Game.data.world;
    var s = {
      v: 2, created: Date.now(), updated: Date.now(), lastSeen: Date.now(),
      player: {
        name: opts.name || "无名散修",
        path: opts.path || "lingxiu",
        linggen: opts.linggen || "shui",
        x: w.start.x, y: w.start.y, lastZone: null,
        realm: 0, exp: 0, breakMult: 1,
        hp: 1, shouyuan: 1
      },
      lingShi: 100,
      tiandao: 0,
      inventory: {},
      equipment: { weapon: null, armor: null, accessory: null },
      heroes: {},
      rebirth: { count: 0, points: 0 },
      cleared: {},
      stats: { kills: 0, breakthroughs: 0, steps: 0 },
      log: []
    };
    var ps = store.stats(s);
    s.player.hp = ps.hp;
    s.player.shouyuan = ps.shouyuan;
    return s;
  };

  store.load = function () {
    var raw = null;
    try {
      if (window.Android && window.Android.load) raw = window.Android.load();
    } catch (e) { console.error(e); }
    if (!raw) {
      try { raw = localStorage.getItem(KEY); } catch (e) { console.error(e); }
    }
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      // 存档结构校验：v2 + 角色有坐标，旧版/损坏的存档一律丢弃
      if (s && s.v === 2 && s.player && typeof s.player.x === "number" && typeof s.player.y === "number") {
        return s;
      }
    } catch (e) { console.error(e); }
    return null;
  };
  store.save = function (s) {
    s.updated = Date.now();
    s.lastSeen = Date.now();
    var json = JSON.stringify(s);
    try {
      if (window.Android && window.Android.save) { window.Android.save(json); return; }
    } catch (e) { console.error(e); }
    try { localStorage.setItem(KEY, json); } catch (e) { console.error(e); }
  };
  store.reset = function () {
    try {
      if (window.Android && window.Android.clear) { window.Android.clear(); }
    } catch (e) { console.error(e); }
    try { localStorage.removeItem(KEY); } catch (e) {}
  };

  // 有效属性与战力（生命=上限）
  store.stats = function (s) {
    var d = window.Game.data;
    var r = d.realms[s.player.realm];
    var path = d.pathById(s.player.path) || {};
    var lg = d.linggenById(s.player.linggen) || {};
    var primary = path.primary;

    var base = { hp: r.hp, atk: r.atk, def: r.def, qi: r.qi, shenshi: r.shenshi, strength: r.strength, speed: r.speed };
    var add = { hp: 0, atk: 0, def: 0, qi: 0, shenshi: 0, strength: 0, speed: 0 };

    for (var slot in s.equipment) {
      var id = s.equipment[slot];
      if (!id) continue;
      var it = d.itemById(id);
      if (it && it.stats) {
        for (var k in it.stats) { if (add[k] != null) add[k] += it.stats[k]; }
      }
    }
    for (var hid in s.heroes) {
      var h = s.heroes[hid];
      if (!h || !h.owned) continue;
      var hd = d.heroById(hid);
      if (!hd) continue;
      var f = 1 + ((h.level || 1) - 1) * 0.15;
      add.hp += hd.hp * f;
      add.atk += hd.atk * f;
      add.def += hd.def * f;
      add.qi += hd.qi * f;
      add.shenshi += hd.shenshi * f;
      add.strength += hd.strength * f;
    }

    var mult = s.player.breakMult * (1 + 0.1 * s.rebirth.points);
    var out = {};
    for (var k2 in base) {
      var v = (base[k2] + add[k2]) * mult;
      if (k2 === primary) v *= (path.bonus && path.bonus[primary]) || 1;
      v *= 1 + ((lg.bonus && lg.bonus[k2]) || 0);
      out[k2] = Math.round(v);
    }

    out.qiRate = Math.round(r.qiRate * (1 + ((lg.bonus && lg.bonus.qiRate) || 0)) * (1 + 0.05 * s.rebirth.points) * 100) / 100;
    out.cp = Math.round(out.hp * 0.5 + out.atk + out.def * 1.5 + out.qi + out.shenshi + out.strength + out.speed * 5);
    out.realmName = r.name;
    out.realmDesc = r.desc;
    out.shouyuan = r.shouyuan || 0;
    out.tiandao = s.tiandao || 0;
    return out;
  };

  store.addLog = function (s, text) {
    s.log.push(text);
    if (s.log.length > 80) s.log.splice(0, s.log.length - 80);
  };
  store.clearedKey = function (x, y) { return x + "," + y; };

  window.Game.store = store;
})();
