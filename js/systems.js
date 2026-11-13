/* 玩法系统：修炼突破 / 战斗 / 神将培养 / 轮回 / 离线收益 */
(function () {
  "use strict";
  var d = function () { return window.Game.data; };
  var st = function () { return window.Game.store; };
  var util = window.Game.util;
  var S = {};

  /* ---------- 修炼 / 突破 ---------- */
  S.breakNeed = function (s) { return d().realmAt(s.player.realm).exp; };
  S.isMaxRealm = function (s) { return s.player.realm >= d().maxRealm; };
  S.canBreak = function (s) { return !S.isMaxRealm(s) && s.player.exp >= S.breakNeed(s); };
  S.breakthrough = function (s) {
    if (!S.canBreak(s)) return { ok: false, msg: "修为不足" };
    var r = d().realmAt(s.player.realm);
    s.player.exp -= r.exp;
    s.player.breakMult *= r.breakMult;
    s.player.realm += 1;
    s.stats.breakthroughs += 1;
    return { ok: true, realmName: d().realmAt(s.player.realm).name };
  };

  /* ---------- 战斗模拟（回合制，玩家先手，带暴击；速度影响连击） ---------- */
  S.battle = function (s, stageIdx) {
    var stg = d().stageAt(stageIdx);
    var ps = st().stats(s);
    var primary = (d().pathById(s.player.path) || {}).primary;
    var pAtkStat = ps[primary] || ps.atk;

    var bhp = stg.bossHp, batk = stg.bossAtk, bdef = stg.bossDef;
    var php = ps.hp;
    var log = [];
    var doubleTap = ps.speed >= 20; // 速度快则每回合额外追击一次

    function pDmg() {
      var base = Math.max(1, Math.round(ps.atk + pAtkStat * 0.6 - bdef * 0.4));
      if (util.chance(0.15)) { base *= 2; }
      return base;
    }
    function bDmg() {
      return Math.max(1, Math.round(batk - ps.def * 0.35));
    }

    var win = false, turns = 0;
    for (var t = 1; t <= 300; t++) {
      turns = t;
      var pd = pDmg();
      bhp -= pd;
      if (doubleTap && bhp > 0) { var pd2 = pDmg(); bhp -= pd2; pd = pd + "+" + pd2; }
      if (bhp <= 0) { win = true; log.push("第" + t + "回合：你造成 " + pd + " 伤害，击败了「" + stg.boss + "」！"); break; }
      var bd = bDmg();
      php -= bd;
      log.push("第" + t + "回合：你造成 " + pd + "，受到 " + bd);
      if (php <= 0) { win = false; log.push("你不敌「" + stg.boss + "」，败下阵来。"); break; }
    }
    if (turns >= 300 && !win) { win = false; log.push("久战不胜，你主动撤走。"); }
    return { win: win, turns: turns, log: log, bossName: stg.boss, hpLeft: Math.max(0, php) };
  };

  /* ---------- 挑战副本（含奖励与进度） ---------- */
  S.challenge = function (s, stageIdx) {
    if (stageIdx > s.stage) return { ok: false, msg: "尚未解锁该副本" };
    var res = S.battle(s, stageIdx);
    if (res.win) {
      var stg = d().stageAt(stageIdx);
      var gained = [];
      s.lingShi += stg.lingShi;
      s.player.exp += stg.exp;
      s.stats.kills += 1;
      (stg.drops || []).forEach(function (dr) {
        if (util.chance(dr.chance)) {
          s.inventory[dr.id] = (s.inventory[dr.id] || 0) + 1;
          var it = d().itemById(dr.id);
          gained.push(it ? it.name : dr.id);
        }
      });
      if (stageIdx === s.stage) s.stage += 1;
      res.rewards = { lingShi: stg.lingShi, exp: stg.exp, items: gained };
    }
    return res;
  };

  /* ---------- 神将培养 ---------- */
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

  /* ---------- 轮回 ---------- */
  S.rebirthMinRealm = function () { return 4; }; // 元婴起可轮回
  S.rebirthAvailable = function (s) { return s.player.realm >= S.rebirthMinRealm(); };
  S.rebirthEarn = function (s) { return Math.floor(Math.sqrt(s.stage + s.player.realm * 3)) + s.player.realm; };
  S.rebirth = function (s) {
    if (!S.rebirthAvailable(s)) return { ok: false, msg: "需达「元婴」境界方可轮回" };
    var earn = S.rebirthEarn(s);
    s.rebirth.count += 1;
    s.rebirth.points += earn;
    s.player.realm = 0;
    s.player.exp = 0;
    s.player.breakMult = 1;
    s.stage = 0;
    s.lingShi = 100;
    s.inventory = {};
    s.equipment = { weapon: null, armor: null, accessory: null };
    for (var k in s.heroes) { if (s.heroes[k]) s.heroes[k].level = 1; }
    return { ok: true, earned: earn };
  };

  /* ---------- 离线收益 ---------- */
  S.offlineGain = function (s, dtMs) {
    var cap = 8 * 3600 * 1000;
    var dt = Math.min(dtMs, cap);
    var sec = dt / 1000;
    var ps = st().stats(s);
    return {
      sec: Math.floor(sec),
      exp: Math.floor(ps.qiRate * sec * 0.5),
      ling: Math.floor(ps.qiRate * sec * 0.2)
    };
  };
  S.applyOffline = function (s, g) {
    s.player.exp += g.exp;
    s.lingShi += g.ling;
  };

  window.Game.systems = S;
})();
