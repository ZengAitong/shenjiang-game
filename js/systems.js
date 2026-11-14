/* 玩法系统：走格子移动 / 采集 / 战斗 / 修炼 / 建筑 / 轮回（行动制，无挂机收益） */
(function () {
  "use strict";
  var d = function () { return window.Game.data; };
  var st = function () { return window.Game.store; };
  var util = window.Game.util;
  var S = {};

  /* ---------- 移动（4 方向，一步一格） ---------- */
  S.tryMove = function (s, dx, dy) {
    var nx = s.player.x + dx, ny = s.player.y + dy;
    var ch = d().tileAt(nx, ny);
    if (ch == null) return { ok: false, msg: "已到世界尽头。" };
    var lg = d().legendOf(ch);
    if (!lg.walkable) return { ok: false, msg: "前方是" + lg.name + "，无法通行。" };

    s.player.shouyuan -= (ch === "r" ? 0.005 : 0.01); // 移动消耗寿元
    s.player.x = nx; s.player.y = ny;
    s.player.age = (s.player.age || 0) + 1;
    s.stats.steps += 1;

    var res = { ok: true, x: nx, y: ny };
    var zone = d().zoneAt(nx, ny);
    if (s.player.lastZone !== zone.id) {
      s.player.lastZone = zone.id;
      st().addLog(s, "你来到了「" + zone.name + "」——" + zone.desc);
      res.zone = zone;
    }

    var cleared = s.cleared[st().clearedKey(nx, ny)];
    if (!cleared) {
      if (lg.type === "herb") { res.herb = true; }
      else if (lg.type === "ore") { res.ore = true; }
      else if (lg.type === "monster") { res.monster = d().monsterOf(ch, zone.id); res.tileCh = ch; }
      else if (lg.building) { res.building = lg.building; }
      else if (ch === "f" && util.chance(0.12)) { res.monster = d().world.monsters.fenglang; res.ambush = true; }
      else if (ch === "." && util.chance(0.04)) { res.monster = d().world.monsters.fenglang; res.ambush = true; }
    }
    if (lg.building === "sect") s.player.sect = "无量神宫"; // 踏入宗门，登记门墙
    S.afterAction(s);
    return res;
  };

  /* ---------- 采集 ---------- */
  S.collect = function (s, x, y, kind) {
    var gains;
    if (kind === "herb") {
      s.inventory.lingcao = (s.inventory.lingcao || 0) + 1;
      s.lingShi += 5;
      s.player.shouyuan -= 0.01;
      gains = { lingcao: 1, lingShi: 5 };
    } else {
      s.inventory.xuantie = (s.inventory.xuantie || 0) + 1;
      s.lingShi += 20;
      s.player.shouyuan -= 0.02;
      gains = { xuantie: 1, lingShi: 20 };
    }
    s.cleared[st().clearedKey(x, y)] = true;
    s.player.age = (s.player.age || 0) + 1;
    S.afterAction(s);
    return gains;
  };

  /* ---------- 战斗（回合制，生命战后不恢复） ---------- */
  S.fight = function (s, m) {
    var ps = st().stats(s);
    var primary = (d().pathById(s.player.path) || {}).primary;
    var pAtkStat = ps[primary] || ps.atk;
    var mhp = m.hp, matk = m.atk, mdef = m.def;
    var php = s.player.hp;
    var log = [];

    function pDmg() {
      var b = Math.max(1, Math.round(ps.atk + pAtkStat * 0.6 - mdef * 0.4));
      if (util.chance(0.15)) b *= 2;
      return b;
    }
    function mDmg() { return Math.max(1, Math.round(matk - ps.def * 0.35)); }

    var win = false, turns = 0;
    for (var t = 1; t <= 200; t++) {
      turns = t;
      var pd = pDmg();
      mhp -= pd;
      if (mhp <= 0) { win = true; log.push("第" + t + "回合：你造成 " + pd + "，击败了「" + m.name + "」！"); break; }
      var md = mDmg();
      php -= md;
      log.push("第" + t + "回合：你造成 " + pd + "，受到 " + md);
      if (php <= 0) { win = false; log.push("你不敌「" + m.name + "」，败下阵来。"); break; }
    }
    if (turns >= 200 && !win) { win = false; log.push("久战不胜，你主动撤走。"); }
    s.player.hp = Math.max(0, php);

    var res = { win: win, turns: turns, log: log, name: m.name };
    if (win) {
      var ls = m.lingShi;
      var ling = ls[0] + Math.floor(Math.random() * (ls[1] - ls[0] + 1));
      s.lingShi += ling;
      s.stats.kills += 1;
      var items = [];
      (m.drops || []).forEach(function (dr) {
        if (util.chance(dr.chance)) {
          s.inventory[dr.id] = (s.inventory[dr.id] || 0) + 1;
          var it = d().itemById(dr.id);
          items.push(it ? it.name : dr.id);
        }
      });
      s.player.shouyuan -= 0.02;
      s.player.age = (s.player.age || 0) + 2;
      res.rewards = { lingShi: ling, items: items };
    }
    S.afterAction(s);
    return res;
  };

  /* ---------- 死亡与轮回 ---------- */
  S.die = function (s) {
    var w = d().world;
    var ps = st().stats(s);
    s.player.x = w.start.x;
    s.player.y = w.start.y;
    s.player.hp = Math.max(1, Math.round(ps.hp * 0.2));
    s.player.shouyuan -= ps.shouyuan * 0.05;
    st().addLog(s, "你被击败，醒来已在出生点。");
    S.afterAction(s);
  };

  S.rebirthAvailable = function (s) { return s.player.realm >= 4; };
  S.rebirthEarn = function (s) { return Math.floor(s.player.realm / 2) + Math.floor(s.stats.kills / 5); };
  S.rebirth = function (s, forced) {
    var earn = S.rebirthEarn(s);
    s.rebirth.count += 1;
    s.rebirth.points += earn;
    var w = d().world;
    s.player.realm = 0;
    s.player.exp = 0;
    s.player.breakMult = 1;
    s.player.x = w.start.x;
    s.player.y = w.start.y;
    s.player.lastZone = null;
    s.lingShi = 100;
    s.inventory = {};
    s.equipment = { weapon: null, armor: null, accessory: null };
    for (var k in s.heroes) { if (s.heroes[k]) s.heroes[k].level = 1; }
    s.cleared = {};
    var ps = st().stats(s);
    s.player.hp = ps.hp;
    s.player.shouyuan = ps.shouyuan;
    st().addLog(s, (forced ? "寿元耗尽，不得不轮回" : "转世轮回") + "！获得 " + earn + " 轮回点。");
    return { ok: true, earned: earn, forced: !!forced };
  };
  S.afterAction = function (s) {
    if (s.player.shouyuan <= 0) S.rebirth(s, true);
  };

  /* ---------- 修炼 / 突破 ---------- */
  S.breakNeed = function (s) { return d().realmAt(s.player.realm).exp; };
  S.isMaxRealm = function (s) { return s.player.realm >= d().maxRealm; };
  S.canBreak = function (s) { return !S.isMaxRealm(s) && s.player.exp >= S.breakNeed(s); };
  S.breakthrough = function (s) {
    if (!S.canBreak(s)) return { ok: false, msg: "灵气不足" };
    var r = d().realmAt(s.player.realm);
    s.player.exp -= r.exp;
    s.player.breakMult *= r.breakMult;
    s.player.realm += 1;
    s.stats.breakthroughs += 1;
    var ps = st().stats(s);
    s.player.hp = ps.hp;
    s.player.shouyuan = ps.shouyuan;
    return { ok: true, realmName: ps.realmName, sub: d().realmAt(s.player.realm).sub };
  };

  // 打坐：获得灵气、恢复部分生命、消耗寿元
  S.meditate = function (s, atRoom) {
    var ps = st().stats(s);
    var gain = Math.round(ps.qiRate * 5 * (atRoom ? 3 : 1));
    s.player.exp += gain;
    var heal = Math.round(ps.hp * 0.2);
    s.player.hp = Math.min(ps.hp, s.player.hp + heal);
    s.player.shouyuan -= 0.02;
    s.player.age = (s.player.age || 0) + 2;
    S.afterAction(s);
    return { exp: gain, heal: heal, atRoom: !!atRoom };
  };

  /* ---------- 神将 ---------- */
  S.recruitCost = function () { return 200; };
  S.recruit = function (s) {
    var candidates = d().heroes.filter(function (h) { return !s.heroes[h.id]; });
    if (candidates.length === 0) return { ok: false, msg: "神将已全部集齐" };
    if (s.lingShi < S.recruitCost()) return { ok: false, msg: "灵石不足" };
    s.lingShi -= S.recruitCost();
    var h = util.pick(candidates);
    s.heroes[h.id] = { owned: true, level: 1 };
    return { ok: true, hero: h };
  };
  S.upgradeHeroCost = function (lv) {
    lv = lv || 1;
    return { lingShi: Math.round(40 * Math.pow(1.6, lv - 1)), lingcao: lv };
  };
  S.upgradeHero = function (s, hid) {
    var h = s.heroes[hid];
    if (!h) return { ok: false, msg: "尚未拥有该神将" };
    var lv = h.level || 1;
    var c = S.upgradeHeroCost(lv);
    if (s.lingShi < c.lingShi) return { ok: false, msg: "灵石不足" };
    if ((s.inventory.lingcao || 0) < c.lingcao) return { ok: false, msg: "灵草不足" };
    s.lingShi -= c.lingShi;
    s.inventory.lingcao -= c.lingcao;
    h.level = lv + 1;
    return { ok: true };
  };

  /* ---------- 建筑 ---------- */
  S.portalList = function () {
    var out = [], w = d().world;
    for (var y = 0; y < w.height; y++) {
      for (var x = 0; x < w.width; x++) {
        if (w.map[y][x] === "p") out.push({ x: x, y: y });
      }
    }
    return out;
  };
  S.teleport = function (s, x, y) {
    if (d().tileAt(x, y) !== "p") return { ok: false };
    s.player.x = x;
    s.player.y = y;
    s.player.shouyuan -= 0.05;
    s.player.age = (s.player.age || 0) + 6;
    var zone = d().zoneAt(x, y);
    s.player.lastZone = zone.id;
    st().addLog(s, "传送到了「" + zone.name + "」。");
    S.afterAction(s);
    return { ok: true };
  };

  // 遗迹：随机机缘
  S.ruin = function (s) {
    var r = Math.random();
    var res = {};
    s.player.shouyuan -= 0.01;
    s.player.age = (s.player.age || 0) + 2;
    if (r < 0.4) {
      var p = Math.random();
      var id = p < 0.6 ? "lingyu" : (p < 0.85 ? "xuantie_jing" : "shenmo_ling");
      s.inventory[id] = (s.inventory[id] || 0) + 1;
      res.kind = "item";
      res.item = d().itemById(id).name;
    } else if (r < 0.7) {
      res.kind = "fight";
      res.monster = d().world.monsters.xingyao;
    } else if (r < 0.9) {
      var gain = Math.round(st().stats(s).qiRate * 30);
      s.player.exp += gain;
      res.kind = "exp";
      res.exp = gain;
    } else {
      res.kind = "none";
    }
    S.afterAction(s);
    return res;
  };

  // 宗门顿悟：消耗天道
  S.dunwu = function (s) {
    if (s.tiandao < 24) return { ok: false, msg: "天道不足 24 小时" };
    s.tiandao -= 24;
    var gain = Math.round(st().stats(s).qiRate * 50);
    s.player.exp += gain;
    s.player.shouyuan -= 0.05;
    s.player.age = (s.player.age || 0) + 4;
    S.afterAction(s);
    return { ok: true, exp: gain };
  };

  /* ---------- 坊市 ---------- */
  S.SHOP = [
    { id: "jiuwei_wan", price: 50 },
    { id: "peiyuan_dan", price: 400 },
    { id: "qingfeng_jian", price: 300 },
    { id: "jinchan_yi", price: 250 },
    { id: "liuxing_zhu", price: 400 }
  ];
  S.buy = function (s, id) {
    var item = S.SHOP.filter(function (x) { return x.id === id; })[0];
    if (!item) return { ok: false, msg: "无此商品" };
    if (s.lingShi < item.price) return { ok: false, msg: "灵石不足" };
    s.lingShi -= item.price;
    s.inventory[id] = (s.inventory[id] || 0) + 1;
    return { ok: true };
  };
  S.sell = function (s, id) {
    var it = d().itemById(id);
    if (!it || !(s.inventory[id] > 0)) return { ok: false, msg: "没有该物品" };
    s.inventory[id] -= 1;
    s.lingShi += it.value || 1;
    return { ok: true };
  };

  window.Game.systems = S;
})();
