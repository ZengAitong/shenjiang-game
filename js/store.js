/* 状态与存档：读档/存档/事件总线/有效属性计算 */
(function () {
  "use strict";
  var KEY = "shenjiang_save_v1";
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
    return {
      v: 1, created: Date.now(), updated: Date.now(), lastSeen: Date.now(),
      player: {
        name: opts.name || "无名散修",
        path: opts.path || "lingxiu",
        linggen: opts.linggen || "shui",
        realm: 0, exp: 0, breakMult: 1
      },
      lingShi: 100,
      inventory: {},
      equipment: { weapon: null, armor: null, accessory: null },
      heroes: {},
      stage: 0,
      tiandao: 0,
      rebirth: { count: 0, points: 0 },
      stats: { kills: 0, breakthroughs: 0 },
      settings: { autoBreak: false }
    };
  };

  store.load = function () {
    try {
      if (window.Android && window.Android.load) {
        var raw = window.Android.load();
        if (raw) return JSON.parse(raw);
      }
    } catch (e) { console.error(e); }
    try {
      var r = localStorage.getItem(KEY);
      if (r) return JSON.parse(r);
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

  // 计算有效属性与战力
  store.stats = function (s) {
    var d = window.Game.data;
    var r = d.realms[s.player.realm];
    var path = d.pathById(s.player.path) || {};
    var lg = d.linggenById(s.player.linggen) || {};
    var primary = path.primary;

    var base = { hp: r.hp, atk: r.atk, def: r.def, qi: r.qi, shenshi: r.shenshi, strength: r.strength, speed: r.speed };
    var add = { hp: 0, atk: 0, def: 0, qi: 0, shenshi: 0, strength: 0, speed: 0 };

    // 装备加成
    for (var slot in s.equipment) {
      var id = s.equipment[slot];
      if (!id) continue;
      var it = d.itemById(id);
      if (it && it.stats) {
        for (var k in it.stats) { if (add[k] != null) add[k] += it.stats[k]; }
      }
    }
    // 神将加成
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

  window.Game.store = store;
})();
