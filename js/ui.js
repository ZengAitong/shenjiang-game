/* 界面渲染与路由 */
(function () {
  "use strict";
  var u = window.Game.util;
  var d = window.Game.data;
  var st = window.Game.store;
  var sys = window.Game.systems;
  var G = window.GAME_DATA;

  var ui = {};
  ui.screen = "cultivate";
  ui.draft = { name: "", path: "lingxiu", linggen: "shui" };

  var NAV = [
    { id: "cultivate", ic: "修", label: "修炼" },
    { id: "stage", ic: "战", label: "副本" },
    { id: "hero", ic: "将", label: "神将" },
    { id: "bag", ic: "袋", label: "背包" },
    { id: "rebirth", ic: "轮", label: "轮回" }
  ];

  function app() { return window.Game.app; }

  /* ---------- 小工具 ---------- */
  function slotName(slot) { return { weapon: "武器", armor: "护甲", accessory: "饰品" }[slot] || slot; }
  function slotIcon(slot) { return { weapon: "🗡", armor: "🛡", accessory: "💍" }[slot] || "•"; }
  function itemIcon(type) { return { material: "🪨", consumable: "💊", equipment: "⚔" }[type] || "•"; }
  function statBox(k, v, id) {
    return '<div class="stat-box"><div class="k">' + k + '</div><div class="v"' + (id ? ' id="' + id + '"' : "") + '>' + v + '</div></div>';
  }

  /* ---------- 顶层 ---------- */
  ui.render = function () {
    var el = document.getElementById("app");
    if (!app().state()) { el.innerHTML = ui.createHTML(); return; }
    var s = app().state();
    el.innerHTML = ui.topbarHTML(s) + ui.screenHTML(s) + ui.navHTML();
  };

  ui.topbarHTML = function (s) {
    return '<div class="topbar">' +
      '<div><div class="title">神将降魔</div><div class="sub">修仙放置 · 框架</div></div>' +
      '<div class="spacer"></div>' +
      '<span class="muted" id="lingshi-top">🪙 ' + u.fmt(s.lingShi) + '</span>' +
      '<button class="icon-btn" data-action="settings">⚙</button>' +
      '</div>';
  };

  ui.navHTML = function () {
    return '<nav class="nav">' + NAV.map(function (n) {
      return '<div class="tab' + (ui.screen === n.id ? " on" : "") + '" data-action="nav" data-id="' + n.id + '">' +
        '<span class="ic">' + n.ic + '</span>' + n.label + '</div>';
    }).join("") + '</nav>';
  };

  ui.screenHTML = function (s) {
    var fn = { cultivate: ui.cultivateHTML, stage: ui.stageHTML, hero: ui.heroHTML, bag: ui.bagHTML, rebirth: ui.rebirthHTML }[ui.screen];
    return '<div class="screen">' + (fn ? fn(s) : "") + '</div>';
  };

  /* ---------- 修炼 ---------- */
  ui.cultivateHTML = function (s) {
    var ps = st.stats(s);
    var path = d.pathById(s.player.path) || {};
    var lg = d.linggenById(s.player.linggen) || {};
    var cur = d.realmAt(s.player.realm);
    var need = sys.breakNeed(s);
    var maxed = sys.isMaxRealm(s);
    var pct = maxed ? 100 : u.clamp(s.player.exp / need * 100, 0, 100);
    var canBreak = sys.canBreak(s);

    var card = '<div class="hero-card">' +
      '<div class="avatar">' + (path.icon || "修") + '</div>' +
      '<div class="grow"><div class="hero-name">' + u.esc(s.player.name) + '</div>' +
      '<div class="hero-realm">' + ps.realmName + (cur.sub ? " · " + cur.sub : "") + '</div>' +
      '<div class="muted" style="font-size:11px">' + u.esc(ps.realmDesc) + '</div></div>' +
      '<div class="center"><div class="muted" style="font-size:11px">战力</div><div class="cp-big" id="cp-val">' + u.fmt(ps.cp) + '</div></div>' +
      '</div>';

    var grid = '<div class="card"><h3>属性</h3><div class="stats-grid">' +
      statBox("生命", u.fmt(ps.hp)) + statBox("攻击", u.fmt(ps.atk)) + statBox("防御", u.fmt(ps.def)) +
      statBox("气海", u.fmt(ps.qi)) + statBox("神识", u.fmt(ps.shenshi)) + statBox("力量", u.fmt(ps.strength)) +
      statBox("速度", u.fmt(ps.speed)) + statBox("寿元", u.fmt(ps.shouyuan)) + statBox("天道", u.tiandao(ps.tiandao), "tiandao-val") +
      '</div></div>';

    var next = "已圆满";
    if (!maxed) {
      var nr = d.realmAt(s.player.realm + 1);
      next = "突破 · " + nr.name + (nr.sub ? " " + nr.sub : "");
    }
    var bar = '<div class="card"><h3>灵气积累</h3>' +
      '<div class="progress gold"><div class="fill" id="exp-fill" style="width:' + pct + '%"></div>' +
      '<div class="txt" id="exp-txt">' + (maxed ? "已圆满" : u.fmt(Math.floor(s.player.exp)) + " / " + u.fmt(need) + " · " + pct.toFixed(1) + "%") + '</div></div>' +
      '<button class="btn block mt" id="break-btn" data-action="break" ' + (canBreak ? "" : "disabled") + '>' + next + '</button>' +
      '<div class="muted center" style="margin-top:8px;font-size:12px">每秒获得 ' + ps.qiRate + ' 灵气 · 天道每秒 +2 小时</div>' +
      '</div>';

    var inherit = '<div class="card"><h3>传承</h3>' +
      '<div class="list-item"><div class="ic">' + path.icon + '</div><div class="grow"><div class="t">' + path.name + '</div><div class="d">' + path.desc + '</div></div></div>' +
      '<div class="list-item" style="margin-top:8px"><div class="ic">' + lg.icon + '</div><div class="grow"><div class="t">' + lg.name + '</div><div class="d">' + lg.desc + '</div></div></div>' +
      '</div>';

    return card + grid + bar + inherit;
  };

  /* ---------- 副本 ---------- */
  ui.stageHTML = function (s) {
    var total = d.stages.length;
    var html = '<div class="card"><h3>除魔进度</h3><div class="row">' +
      '<div class="grow">已通关 <span class="gold">' + s.stage + '</span> / ' + total + ' 关</div>' +
      '<button class="btn sm" data-action="challenge" data-id="' + s.stage + '" ' + (s.stage >= total ? "disabled" : "") + '>挑战下一关</button>' +
      '</div></div>';

    html += '<div class="card"><h3>副本列表</h3>';
    d.stages.forEach(function (stg, i) {
      var locked = i > s.stage;
      var cleared = i < s.stage;
      var tag = locked ? '<span class="tag bai">未解锁</span>' : (cleared ? '<span class="tag lv">已通关</span>' : '<span class="tag cheng">可挑战</span>');
      html += '<div class="list-item"><div class="ic">' + (locked ? "🔒" : (cleared ? "✓" : "⚔")) + '</div>' +
        '<div class="grow"><div class="t">' + stg.name + '</div><div class="d">BOSS：' + stg.boss + ' · 灵石+' + stg.lingShi + ' 灵气+' + stg.exp + '</div></div>' +
        tag +
        (locked ? "" : '<button class="btn sm ghost" data-action="challenge" data-id="' + i + '">挑战</button>') +
        '</div>';
    });
    html += '</div>';
    return html;
  };

  /* ---------- 神将 ---------- */
  ui.heroHTML = function (s) {
    var ownedCount = Object.keys(s.heroes).filter(function (k) { return s.heroes[k].owned; }).length;
    var html = '<div class="card"><h3>神将阁</h3><div class="row">' +
      '<div class="grow">已拥有 <span class="gold">' + ownedCount + '</span> / ' + d.heroes.length + ' 位</div>' +
      '<button class="btn sm" data-action="recruit">招募 · ' + sys.recruitCost() + ' 灵石</button>' +
      '</div></div>';

    html += '<div class="card"><h3>神将列表</h3>';
    d.heroes.forEach(function (hd) {
      var own = s.heroes[hd.id];
      var rc = d.rarityClass(hd.rarity);
      if (own && own.owned) {
        var c = sys.upgradeHeroCost(own.level);
        html += '<div class="list-item"><div class="ic">' + hd.element + '</div>' +
          '<div class="grow"><div class="t">' + hd.name + ' <span class="tag ' + rc + '">' + hd.rarity + '</span></div>' +
          '<div class="d">' + hd.desc + ' · Lv.' + own.level + '</div></div>' +
          '<button class="btn sm" data-action="upgradeHero" data-id="' + hd.id + '">升阶 (' + c.lingShi + '🪙+' + c.lingcao + '草)</button>' +
          '</div>';
      } else {
        html += '<div class="list-item"><div class="ic">?</div>' +
          '<div class="grow"><div class="t">' + hd.name + ' <span class="tag ' + rc + '">' + hd.rarity + '</span></div>' +
          '<div class="d">' + hd.desc + '</div></div>' +
          '<span class="tag bai">未拥有</span></div>';
      }
    });
    html += '</div>';
    return html;
  };

  /* ---------- 背包 ---------- */
  ui.bagHTML = function (s) {
    var html = '<div class="card"><h3>灵石</h3><div class="cp-big" id="lingshi-val">🪙 ' + u.fmt(s.lingShi) + '</div></div>';

    html += '<div class="card"><h3>装备</h3>';
    ["weapon", "armor", "accessory"].forEach(function (slot) {
      var id = s.equipment[slot];
      var name = id ? d.itemById(id).name : "空";
      html += '<div class="list-item"><div class="ic">' + slotIcon(slot) + '</div><div class="grow"><div class="t">' + slotName(slot) + '</div><div class="d">' + name + '</div></div></div>';
    });
    html += '</div>';

    html += '<div class="card"><h3>物品</h3>';
    var has = false;
    for (var id in s.inventory) {
      var n = s.inventory[id];
      if (n <= 0) continue;
      var it = d.itemById(id);
      if (!it) continue;
      has = true;
      html += '<div class="list-item"><div class="ic">' + itemIcon(it.type) + '</div>' +
        '<div class="grow"><div class="t">' + it.name + '</div><div class="d">' + it.desc + '</div></div>' +
        '<span class="muted">×' + n + '</span>' +
        (it.type === "consumable" ? '<button class="btn sm" data-action="useItem" data-id="' + id + '">使用</button>' : (it.type === "equipment" ? '<button class="btn sm ghost" data-action="equipItem" data-id="' + id + '">装备</button>' : "")) +
        '</div>';
    }
    if (!has) html += '<div class="empty">空空如也，去副本掉落吧</div>';
    html += '</div>';
    return html;
  };

  /* ---------- 轮回 ---------- */
  ui.rebirthHTML = function (s) {
    var avail = sys.rebirthAvailable(s);
    var earn = sys.rebirthEarn(s);
    var html = '<div class="card"><h3>轮回</h3>' +
      '<div class="muted" style="font-size:13px">达到「元婴」后可轮回重修：境界、副本进度、物品、装备、灵石归零，神将等级重置；保留神将拥有与轮回点（每点 +10% 全属性）。</div>' +
      '<div class="row" style="margin-top:12px">' +
      '<div class="stat-box grow"><div class="k">已轮回</div><div class="v">' + s.rebirth.count + ' 次</div></div>' +
      '<div class="stat-box grow"><div class="k">轮回点</div><div class="v">' + s.rebirth.points + '</div></div>' +
      '</div></div>';
    html += '<div class="card"><div class="center">' +
      (avail ? ('本次可获 <span class="gold">' + earn + '</span> 轮回点') : ('需达「元婴」境界方可轮回（当前 ' + d.realmAt(s.player.realm).name + '）')) +
      '</div><button class="btn block danger mt" data-action="rebirth" ' + (avail ? "" : "disabled") + '>转世重修</button></div>';
    return html;
  };

  /* ---------- 创建角色 ---------- */
  ui.createHTML = function () {
    var phtml = G.paths.map(function (p) {
      return '<div class="choice' + (ui.draft.path === p.id ? " sel" : "") + '" data-action="pickPath" data-id="' + p.id + '"><div class="ic">' + p.icon + '</div><div class="n">' + p.name + '</div><div class="d">' + p.desc + '</div></div>';
    }).join("");
    var lhtml = G.linggens.map(function (l) {
      return '<div class="choice' + (ui.draft.linggen === l.id ? " sel" : "") + '" data-action="pickLinggen" data-id="' + l.id + '"><div class="ic">' + l.icon + '</div><div class="n">' + l.name + '</div><div class="d">' + l.desc + '</div></div>';
    }).join("");
    return '<div class="screen">' +
      '<div class="topbar"><div class="title">初入仙途</div><div class="spacer"></div></div>' +
      '<div class="hero-card"><div class="avatar">修</div><div class="grow"><div class="hero-name">创建角色</div><div class="muted" style="font-size:12px">选择流派与灵根，踏入修仙之路</div></div></div>' +
      '<div class="card"><h3>道号</h3><input type="text" id="name-input" placeholder="无名散修" value="' + u.esc(ui.draft.name) + '" maxlength="12"></div>' +
      '<div class="card"><h3>流派</h3><div class="choice-grid">' + phtml + '</div></div>' +
      '<div class="card"><h3>灵根</h3><div class="choice-grid">' + lhtml + '</div></div>' +
      '<button class="btn block" data-action="startGame">开始修炼</button>' +
      '</div>';
  };

  /* ---------- 弹窗 / 提示 ---------- */
  ui.modal = function (title, bodyHTML, buttons) {
    ui.closeModal();
    var btns = (buttons || []).map(function (b) {
      return '<button class="btn ' + (b.cls || "") + '" data-action="' + b.action + '">' + b.label + '</button>';
    }).join("");
    var ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = '<div class="modal"><h2>' + title + '</h2><div>' + bodyHTML + '</div>' +
      (btns ? '<div class="actions">' + btns + '</div>' : "") + '</div>';
    document.body.appendChild(ov);
  };
  ui.closeModal = function () {
    document.querySelectorAll(".overlay").forEach(function (n) { n.remove(); });
  };
  ui.toast = function (msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  };

  ui.showBattle = function (r, s) {
    var logHtml = (r.log || []).map(function (ln) {
      var cls = "";
      if (ln.indexOf("击败") >= 0) cls = "win";
      else if (ln.indexOf("不敌") >= 0 || ln.indexOf("败") >= 0) cls = "lose";
      return '<p class="' + cls + '">' + u.esc(ln) + '</p>';
    }).join("");
    var rew = "";
    if (r.win && r.rewards) {
      rew = '<div class="row" style="margin-top:8px;flex-wrap:wrap"><span class="tag lv">灵石 +' + r.rewards.lingShi + '</span><span class="tag lv">灵气 +' + r.rewards.exp + '</span></div>' +
        (r.rewards.items.length ? '<div class="muted" style="margin-top:6px">掉落：' + r.rewards.items.join("、") + '</div>' : "");
    }
    ui.modal(
      (r.win ? "⚔ 胜利" : "💀 战败") + " · " + u.esc(r.bossName),
      '<div class="muted">回合数：' + r.turns + '</div>' + rew + '<div class="battle-log">' + logHtml + '</div>',
      [{ label: "确定", action: "closeModal", cls: "" }]
    );
  };

  ui.openSettings = function () {
    var s = app().state();
    ui.modal("设置",
      '<div class="list-item"><div class="grow"><div class="t">自动突破</div><div class="d">灵气足够时自动突破到下一境界</div></div>' +
      '<button class="btn sm ghost" data-action="toggleAuto">' + (s.settings.autoBreak ? "开" : "关") + '</button></div>' +
      '<div class="muted" style="margin:10px 0 0;font-size:12px">存档保存在本机浏览器，清除浏览器数据会丢失。</div>',
      [
        { label: "删除存档", action: "confirmReset", cls: "danger" },
        { label: "关闭", action: "closeModal", cls: "ghost" }
      ]
    );
  };
  ui.confirmReset = function () {
    ui.modal("确认删除存档", '<div class="muted">将永久删除当前存档并重新开始，无法恢复。</div>',
      [
        { label: "确认删除", action: "resetSave", cls: "danger" },
        { label: "取消", action: "closeModal", cls: "ghost" }
      ]);
  };
  ui.showOffline = function (g) {
    ui.modal("离线收益",
      '<div class="center"><div class="cp-big">欢迎回来</div></div>' +
      '<div class="row" style="margin-top:10px">' +
      '<div class="stat-box grow"><div class="k">离线时长</div><div class="v">' + u.dur(g.sec * 1000) + '</div></div>' +
      '<div class="stat-box grow"><div class="k">灵气</div><div class="v">+' + u.fmt(g.exp) + '</div></div>' +
      '<div class="stat-box grow"><div class="k">灵石</div><div class="v">+' + u.fmt(g.ling) + '</div></div>' +
      '</div>',
      [{ label: "收取", action: "closeModal", cls: "" }]
    );
  };

  /* ---------- 物品操作 ---------- */
  ui.useItem = function (id) {
    var s = app().state();
    var it = d.itemById(id);
    if (!it || (s.inventory[id] || 0) <= 0) return;
    if (it.type === "consumable") {
      if (it.effect && it.effect.exp) s.player.exp += it.effect.exp;
      s.inventory[id] -= 1;
      app().save();
      ui.toast("服用 " + it.name + (it.effect && it.effect.exp ? "，灵气 +" + it.effect.exp : ""));
      app().refresh();
    }
  };
  ui.equipItem = function (id) {
    var s = app().state();
    var it = d.itemById(id);
    if (!it || it.type !== "equipment" || (s.inventory[id] || 0) <= 0) return;
    var slot = it.slot;
    var prev = s.equipment[slot];
    if (prev) s.inventory[prev] = (s.inventory[prev] || 0) + 1;
    s.equipment[slot] = id;
    s.inventory[id] -= 1;
    app().save();
    ui.toast("装备 " + it.name);
    app().refresh();
  };

  /* ---------- 每秒刷新 ---------- */
  ui.tick = function (ps, s) {
    function set(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; }
    var need = sys.breakNeed(s);
    var maxed = sys.isMaxRealm(s);
    var pct = maxed ? 100 : u.clamp(s.player.exp / need * 100, 0, 100);
    set("exp-txt", maxed ? "已圆满" : u.fmt(Math.floor(s.player.exp)) + " / " + u.fmt(need) + " · " + pct.toFixed(1) + "%");
    var f = document.getElementById("exp-fill"); if (f) f.style.width = pct + "%";
    set("cp-val", u.fmt(ps.cp));
    set("lingshi-top", "🪙 " + u.fmt(s.lingShi));
    set("lingshi-val", "🪙 " + u.fmt(s.lingShi));
    set("tiandao-val", u.tiandao(ps.tiandao));
    var bb = document.getElementById("break-btn");
    if (bb) {
      bb.disabled = !sys.canBreak(s);
      if (maxed) bb.textContent = "已圆满";
    }
  };

  /* ---------- 动作分发 ---------- */
  ui.handleAction = function (action, id) {
    var s = app().state();
    if (!s && action !== "startGame" && action !== "pickPath" && action !== "pickLinggen") return;
    switch (action) {
      case "nav": ui.screen = id; ui.render(); break;
      case "settings": ui.openSettings(); break;
      case "break": if (sys.breakthrough(s).ok) { app().save(); app().refresh(); } break;
      case "challenge": {
        var idx = parseInt(id, 10);
        var r = sys.challenge(s, idx);
        if (r.ok === false) { ui.toast(r.msg); break; }
        app().save();
        ui.showBattle(r, s);
        app().refresh();
        break;
      }
      case "recruit": {
        var rr = sys.recruit(s);
        ui.toast(rr.ok ? ("招募到「" + rr.hero.name + "」！") : rr.msg);
        if (rr.ok) { app().save(); app().refresh(); }
        break;
      }
      case "upgradeHero": {
        var ur = sys.upgradeHero(s, id);
        ui.toast(ur.ok ? "升阶成功" : ur.msg);
        if (ur.ok) { app().save(); app().refresh(); }
        break;
      }
      case "useItem": ui.useItem(id); break;
      case "equipItem": ui.equipItem(id); break;
      case "rebirth": {
        var rb = sys.rebirth(s);
        if (rb.ok) { app().save(); ui.toast("轮回成功，获得 " + rb.earned + " 轮回点"); app().refresh(); }
        else ui.toast(rb.msg);
        break;
      }
      case "toggleAuto": {
        s.settings.autoBreak = !s.settings.autoBreak;
        app().save(); ui.closeModal();
        ui.toast("自动突破：" + (s.settings.autoBreak ? "开" : "关"));
        app().refresh();
        break;
      }
      case "confirmReset": ui.confirmReset(); break;
      case "resetSave": { ui.closeModal(); app().reset(); ui.toast("存档已删除"); break; }
      case "closeModal": ui.closeModal(); break;
      case "pickPath": ui.draft.name = ui.readName(); ui.draft.path = id; ui.render(); break;
      case "pickLinggen": ui.draft.name = ui.readName(); ui.draft.linggen = id; ui.render(); break;
      case "startGame": app().newGame({ name: ui.readName() || "无名散修", path: ui.draft.path, linggen: ui.draft.linggen }); break;
    }
  };
  ui.readName = function () {
    var el = document.getElementById("name-input");
    return el ? el.value.trim() : "";
  };

  window.Game.ui = ui;
})();
