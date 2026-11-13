/* 界面渲染与路由：地图 / 角色 / 背包 / 设置 */
(function () {
  "use strict";
  var u = window.Game.util;
  var d = function () { return window.Game.data; };
  var st = function () { return window.Game.store; };
  var sys = window.Game.systems;
  var G = window.GAME_DATA;

  var ui = {};
  ui.screen = "map";
  ui.draft = { name: "", path: "lingxiu", linggen: "shui" };

  var NAV = [
    { id: "map", ic: "图", label: "地图" },
    { id: "char", ic: "身", label: "角色" },
    { id: "bag", ic: "袋", label: "背包" },
    { id: "set", ic: "设", label: "设置" }
  ];

  ui.SYMBOLS = {
    '#': { s: "山", c: "rock" },
    '~': { s: "水", c: "water" },
    '.': { s: "·", c: "plain" },
    'f': { s: "林", c: "forest" },
    'r': { s: "·", c: "road" },
    'c': { s: "草", c: "herb" },
    'm': { s: "矿", c: "ore" },
    'g': { s: "妖", c: "mob" },
    'G': { s: "妖", c: "mobbig" },
    'B': { s: "王", c: "boss" },
    's': { s: "宗", c: "bld" },
    'd': { s: "修", c: "bld" },
    'b': { s: "市", c: "bld" },
    'p': { s: "阵", c: "bld" },
    'x': { s: "迹", c: "bld" },
    '@': { s: "我", c: "me" }
  };

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
    ui.scrollLog();
  };

  ui.topbarHTML = function (s) {
    var zone = d().zoneAt(s.player.x, s.player.y);
    return '<div class="topbar">' +
      '<div><div class="title">轮回修正</div><div class="sub" id="zone-label">' + zone.name + ' · 坐标 [' + s.player.x + ', ' + s.player.y + ']</div></div>' +
      '<div class="spacer"></div>' +
      '<span class="muted" id="lingshi-top">🪙 ' + u.fmt(s.lingShi) + '</span>' +
      '</div>';
  };

  ui.navHTML = function () {
    return '<nav class="nav">' + NAV.map(function (n) {
      return '<div class="tab' + (ui.screen === n.id ? " on" : "") + '" data-action="nav" data-id="' + n.id + '">' +
        '<span class="ic">' + n.ic + '</span>' + n.label + '</div>';
    }).join("") + '</nav>';
  };

  ui.screenHTML = function (s) {
    var fn = { map: ui.mapHTML, char: ui.charHTML, bag: ui.bagHTML, set: ui.setHTML }[ui.screen];
    return '<div class="screen">' + (fn ? fn(s) : "") + '</div>';
  };

  /* ---------- 地图页 ---------- */
  ui.cellHTML = function (tx, ty, s) {
    var ch = d().tileAt(tx, ty);
    var isPlayer = (tx === s.player.x && ty === s.player.y);
    var cleared = ch && (ch === "c" || ch === "m" || ch === "g" || ch === "G" || ch === "B") &&
      s.cleared[st().clearedKey(tx, ty)];
    var sym = "", cls = "cell";
    if (ch == null) { cls += " void"; }
    else if (cleared) { sym = "·"; cls += " plain"; }
    else {
      var m = ui.SYMBOLS[ch] || { s: "?", c: "plain" };
      sym = m.s; cls += " " + m.c;
    }
    if (isPlayer) { sym = "我"; cls += " me"; }
    if (Math.abs(tx - s.player.x) + Math.abs(ty - s.player.y) === 1) cls += " reach";
    return '<div class="' + cls + '" data-action="cellmove" data-x="' + tx + '" data-y="' + ty + '">' + sym + '</div>';
  };

  ui.actionHTML = function (s, lg, cleared) {
    var a = "";
    if (!cleared) {
      if (lg.type === "herb") a += '<button class="btn sm" data-action="collect">采灵草</button>';
      if (lg.type === "ore") a += '<button class="btn sm" data-action="collect">采矿脉</button>';
      if (lg.type === "monster") a += '<button class="btn sm danger" data-action="battle">战斗！</button>';
      if (lg.building === "sect") a += '<button class="btn sm" data-action="sect">进宗门</button>';
      if (lg.building === "room") a += '<button class="btn sm" data-action="meditateRoom">闭关修炼</button>';
      if (lg.building === "shop") a += '<button class="btn sm" data-action="shop">进坊市</button>';
      if (lg.building === "portal") a += '<button class="btn sm" data-action="portal">使用传送阵</button>';
      if (lg.building === "ruin") a += '<button class="btn sm" data-action="ruin">探索遗迹</button>';
    }
    if (!lg.building || lg.building !== "room") a += '<button class="btn sm ghost" data-action="meditate">打坐</button>';
    return a;
  };

  ui.dpadHTML = function () {
    return '<div class="dpad">' +
      '<button class="dbtn" data-action="move" data-dx="0" data-dy="-1">↑</button>' +
      '<div class="drow">' +
      '<button class="dbtn" data-action="move" data-dx="-1" data-dy="0">←</button>' +
      '<button class="dbtn" data-action="move" data-dx="1" data-dy="0">→</button>' +
      '</div>' +
      '<button class="dbtn" data-action="move" data-dx="0" data-dy="1">↓</button>' +
      '</div>';
  };

  ui.logHTML = function (s) {
    var items = (s.log || []).map(function (ln) { return '<p>' + u.esc(ln) + '</p>'; }).join("");
    return '<div class="card logwrap"><h3>经历</h3><div class="log" id="logbox">' +
      (items || '<p class="muted">你站在天柱山下，前路未卜……</p>') + '</div></div>';
  };

  ui.mapHTML = function (s) {
    var zone = d().zoneAt(s.player.x, s.player.y);
    var ch = d().tileAt(s.player.x, s.player.y);
    var lg = d().legendOf(ch);
    var cleared = s.cleared[st().clearedKey(s.player.x, s.player.y)];
    var cells = [];
    for (var dy = -5; dy <= 5; dy++) {
      for (var dx = -5; dx <= 5; dx++) {
        cells.push(ui.cellHTML(s.player.x + dx, s.player.y + dy, s));
      }
    }
    var stateNote = "";
    if (cleared && lg.type === "monster") stateNote = "（已伏诛）";
    if (cleared && (lg.type === "herb" || lg.type === "ore")) stateNote = "（已采集）";
    return '<div class="map-grid">' + cells.join("") + '</div>' +
      '<div class="locinfo"><b>' + zone.name + '</b><span class="muted"> · ' + lg.name + stateNote + '</span>' +
      '<div class="d">' + u.esc(zone.desc) + '</div></div>' +
      '<div class="actions">' + ui.actionHTML(s, lg, cleared) + '</div>' +
      ui.dpadHTML() +
      ui.logHTML(s);
  };

  /* ---------- 角色页 ---------- */
  ui.charHTML = function (s) {
    var ps = st().stats(s);
    var path = d().pathById(s.player.path) || {};
    var lg = d().linggenById(s.player.linggen) || {};
    var cur = d().realmAt(s.player.realm);
    var need = sys.breakNeed(s);
    var maxed = sys.isMaxRealm(s);
    var canBreak = sys.canBreak(s);
    var hpPct = u.clamp(s.player.hp / Math.max(1, ps.hp) * 100, 0, 100);
    var expPct = maxed ? 100 : u.clamp(s.player.exp / need * 100, 0, 100);
    var next = "已圆满";
    if (!maxed) {
      var nr = d().realmAt(s.player.realm + 1);
      next = "突破 · " + nr.name + (nr.sub ? " " + nr.sub : "");
    }

    var card = '<div class="hero-card">' +
      '<div class="avatar">' + (path.icon || "修") + '</div>' +
      '<div class="grow"><div class="hero-name">' + u.esc(s.player.name) + '</div>' +
      '<div class="hero-realm">' + ps.realmName + (cur.sub ? " · " + cur.sub : "") + '</div>' +
      '<div class="muted" style="font-size:11px">' + u.esc(ps.realmDesc) + '</div></div>' +
      '<div class="center"><div class="muted" style="font-size:11px">战力</div><div class="cp-big" id="cp-val">' + u.fmt(ps.cp) + '</div></div>' +
      '</div>';

    var hp = '<div class="card"><h3>生命 ' + u.fmt(Math.max(0, Math.floor(s.player.hp))) + ' / ' + u.fmt(ps.hp) + '</h3>' +
      '<div class="progress hp"><div class="fill" id="hp-fill" style="width:' + hpPct + '%"></div><div class="txt" id="hp-txt">' + hpPct.toFixed(0) + '%</div></div></div>';

    var exp = '<div class="card"><h3>灵气 ' + (maxed ? "已圆满" : u.fmt(Math.floor(s.player.exp)) + " / " + u.fmt(need)) + '</h3>' +
      '<div class="progress gold"><div class="fill" id="exp-fill" style="width:' + expPct + '%"></div><div class="txt" id="exp-txt">' + (maxed ? "已圆满" : expPct.toFixed(1) + "%") + '</div></div>' +
      '<button class="btn block mt" id="break-btn" data-action="break" ' + (canBreak ? "" : "disabled") + '>' + next + '</button>' +
      '<button class="btn block ghost mt" data-action="meditate">打坐修炼</button></div>';

    var grid = '<div class="card"><h3>属性</h3><div class="stats-grid">' +
      statBox("攻击", u.fmt(ps.atk)) + statBox("防御", u.fmt(ps.def)) + statBox("气海", u.fmt(ps.qi)) +
      statBox("神识", u.fmt(ps.shenshi)) + statBox("力量", u.fmt(ps.strength)) + statBox("速度", u.fmt(ps.speed)) +
      statBox("寿元", u.fmt(Math.max(0, Math.floor(s.player.shouyuan))) + "年") + statBox("天道", u.tiandao(ps.tiandao), "tiandao-val") + statBox("轮回点", s.rebirth.points) +
      '</div></div>';

    var inherit = '<div class="card"><h3>传承</h3>' +
      '<div class="list-item"><div class="ic">' + path.icon + '</div><div class="grow"><div class="t">' + path.name + '</div><div class="d">' + path.desc + '</div></div></div>' +
      '<div class="list-item" style="margin-top:8px"><div class="ic">' + lg.icon + '</div><div class="grow"><div class="t">' + lg.name + '</div><div class="d">' + lg.desc + '</div></div></div>' +
      '</div>';

    var heroes = '<div class="card"><h3>神将（宗门招募）</h3>';
    var has = false;
    d().heroes.forEach(function (hd) {
      var own = s.heroes[hd.id];
      if (!own || !own.owned) return;
      has = true;
      var c = sys.upgradeHeroCost(own.level);
      var rc = d().rarityClass(hd.rarity);
      heroes += '<div class="list-item"><div class="ic">' + hd.element + '</div>' +
        '<div class="grow"><div class="t">' + hd.name + ' <span class="tag ' + rc + '">' + hd.rarity + '</span></div>' +
        '<div class="d">' + hd.desc + ' · Lv.' + own.level + '</div></div>' +
        '<button class="btn sm" data-action="upgradeHero" data-id="' + hd.id + '">升阶 (' + c.lingShi + '🪙+' + c.lingcao + '草)</button></div>';
    });
    if (!has) heroes += '<div class="empty">尚未招募神将，去无量神宫招募</div>';
    heroes += '</div>';

    return card + hp + exp + grid + inherit + heroes;
  };

  /* ---------- 背包页 ---------- */
  ui.bagHTML = function (s) {
    var html = '<div class="card"><h3>灵石</h3><div class="cp-big" id="lingshi-val">🪙 ' + u.fmt(s.lingShi) + '</div></div>';
    html += '<div class="card"><h3>装备</h3>';
    ["weapon", "armor", "accessory"].forEach(function (slot) {
      var id = s.equipment[slot];
      var name = id ? d().itemById(id).name : "空";
      html += '<div class="list-item"><div class="ic">' + slotIcon(slot) + '</div><div class="grow"><div class="t">' + slotName(slot) + '</div><div class="d">' + name + '</div></div></div>';
    });
    html += '</div>';
    html += '<div class="card"><h3>物品</h3>';
    var has = false;
    for (var id in s.inventory) {
      var n = s.inventory[id];
      if (n <= 0) continue;
      var it = d().itemById(id);
      if (!it) continue;
      has = true;
      html += '<div class="list-item"><div class="ic">' + itemIcon(it.type) + '</div>' +
        '<div class="grow"><div class="t">' + it.name + '</div><div class="d">' + it.desc + '</div></div>' +
        '<span class="muted">×' + n + '</span>' +
        (it.type === "consumable" ? '<button class="btn sm" data-action="useItem" data-id="' + id + '">使用</button>' : (it.type === "equipment" ? '<button class="btn sm ghost" data-action="equipItem" data-id="' + id + '">装备</button>' : "")) +
        '</div>';
    }
    if (!has) html += '<div class="empty">空空如也，去地图采集吧</div>';
    html += '</div>';
    return html;
  };

  /* ---------- 设置页 ---------- */
  ui.setHTML = function (s) {
    var avail = sys.rebirthAvailable(s);
    var earn = sys.rebirthEarn(s);
    return '<div class="card"><h3>轮回</h3>' +
      '<div class="muted" style="font-size:13px">达到「元婴」后可主动轮回；寿元耗尽将强制轮回。轮回后境界、物品、灵石、地图重置；保留神将拥有、天道、轮回点（每点 +10% 全属性）。</div>' +
      '<div class="row" style="margin-top:12px">' +
      '<div class="stat-box grow"><div class="k">已轮回</div><div class="v">' + s.rebirth.count + ' 次</div></div>' +
      '<div class="stat-box grow"><div class="k">轮回点</div><div class="v">' + s.rebirth.points + '</div></div>' +
      '<div class="stat-box grow"><div class="k">步数</div><div class="v">' + s.stats.steps + '</div></div>' +
      '<div class="stat-box grow"><div class="k">击杀</div><div class="v">' + s.stats.kills + '</div></div>' +
      '</div></div>' +
      '<div class="card"><button class="btn block danger" data-action="rebirth" ' + (avail ? "" : "disabled") + '>转世重修' + (avail ? ("（+" + earn + " 轮回点）") : "") + '</button>' +
      (avail ? "" : '<div class="muted center" style="margin-top:8px;font-size:12px">需达「元婴」境界（当前 ' + d().realmAt(s.player.realm).name + '）</div>') +
      '</div>' +
      '<div class="card"><h3>存档</h3>' +
      '<div class="muted" style="font-size:12px">存档保存在本机，删除后重新开始。</div>' +
      '<button class="btn block danger mt" data-action="confirmReset">删除存档</button></div>' +
      '<div class="card"><h3>关于</h3><div class="muted" style="font-size:12px">轮回修正 · 文字修仙 MUD · 走格子探索版</div></div>';
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
      '<div class="hero-card"><div class="avatar">修</div><div class="grow"><div class="hero-name">创建角色</div><div class="muted" style="font-size:12px">选择流派与灵根，从格子地图开启修仙之路</div></div></div>' +
      '<div class="card"><h3>道号</h3><input type="text" id="name-input" placeholder="无名散修" value="' + u.esc(ui.draft.name) + '" maxlength="12"></div>' +
      '<div class="card"><h3>流派</h3><div class="choice-grid">' + phtml + '</div></div>' +
      '<div class="card"><h3>灵根</h3><div class="choice-grid">' + lhtml + '</div></div>' +
      '<button class="btn block" data-action="startGame">踏入仙途</button>' +
      '</div>';
  };

  /* ---------- 弹窗 ---------- */
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
    setTimeout(function () { t.remove(); }, 2400);
  };

  ui.showFight = function (fr, s, m) {
    var logHtml = (fr.log || []).map(function (ln) {
      var cls = ln.indexOf("击败") >= 0 ? "win" : (ln.indexOf("不敌") >= 0 ? "lose" : "");
      return '<p class="' + cls + '">' + u.esc(ln) + '</p>';
    }).join("");
    var rew = "";
    if (fr.win && fr.rewards) {
      rew = '<div class="row" style="margin-top:8px;flex-wrap:wrap"><span class="tag lv">灵石 +' + fr.rewards.lingShi + '</span></div>' +
        (fr.rewards.items.length ? '<div class="muted" style="margin-top:6px">掉落：' + fr.rewards.items.join("、") + '</div>' : "");
    }
    ui.modal(
      (fr.win ? "⚔ 胜利" : "💀 战败") + " · " + u.esc(fr.name),
      '<div class="muted">回合数：' + fr.turns + '</div>' + rew + '<div class="battle-log">' + logHtml + '</div>',
      [{ label: "确定", action: "closeModal", cls: "" }]
    );
  };

  ui.showSect = function () {
    var s = app().state();
    ui.modal("无量神宫",
      '<div class="muted">仙门重地。可顿悟参道，或招募神将。</div>' +
      '<div class="list-item" style="margin-top:8px"><div class="grow"><div class="t">顿悟</div><div class="d">消耗 24 小时天道，大幅增进修为（当前 ' + u.tiandao(s.tiandao) + '）</div></div>' +
      '<button class="btn sm" data-action="dunwu">顿悟</button></div>' +
      '<div class="list-item"><div class="grow"><div class="t">招募神将</div><div class="d">随机招募一位未拥有的神将（' + sys.recruitCost() + ' 灵石）</div></div>' +
      '<button class="btn sm" data-action="recruit">招募</button></div>',
      [{ label: "离开", action: "closeModal", cls: "ghost" }]
    );
  };

  ui.showShop = function () {
    var s = app().state();
    var buyHtml = sys.SHOP.map(function (it) {
      var def = d().itemById(it.id);
      return '<div class="list-item"><div class="ic">' + itemIcon(def.type) + '</div>' +
        '<div class="grow"><div class="t">' + def.name + '</div><div class="d">' + def.desc + '</div></div>' +
        '<button class="btn sm" data-action="buy" data-id="' + it.id + '">' + it.price + '🪙</button></div>';
    }).join("");
    var sellHtml = "";
    for (var id in s.inventory) {
      var n = s.inventory[id];
      if (n <= 0) continue;
      var it = d().itemById(id);
      if (!it) continue;
      sellHtml += '<div class="list-item"><div class="ic">' + itemIcon(it.type) + '</div>' +
        '<div class="grow"><div class="t">' + it.name + '</div><div class="d">×' + n + '</div></div>' +
        '<button class="btn sm ghost" data-action="sell" data-id="' + id + '">卖 ' + (it.value || 1) + '🪙</button></div>';
    }
    ui.modal("坊市",
      '<div class="muted" style="margin-bottom:8px">灵石：🪙 ' + u.fmt(s.lingShi) + '</div>' +
      '<h3 style="font-size:13px;color:var(--muted);margin:6px 0">买入</h3>' + buyHtml +
      '<h3 style="font-size:13px;color:var(--muted);margin:10px 0 6px">卖出</h3>' + (sellHtml || '<div class="empty">没有可卖的物品</div>'),
      [{ label: "离开", action: "closeModal", cls: "ghost" }]
    );
  };

  ui.showPortal = function () {
    var s = app().state();
    var list = sys.portalList().filter(function (p) { return !(p.x === s.player.x && p.y === s.player.y); });
    var html = list.map(function (p) {
      var z = d().zoneAt(p.x, p.y);
      return '<div class="list-item"><div class="grow"><div class="t">' + z.name + '</div><div class="d">坐标 [' + p.x + ', ' + p.y + ']</div></div>' +
        '<button class="btn sm" data-action="teleport" data-id="' + p.x + "," + p.y + '">传送</button></div>';
    }).join("");
    ui.modal("传送阵", html || '<div class="empty">没有其他传送阵</div>',
      [{ label: "离开", action: "closeModal", cls: "ghost" }]);
  };

  ui.confirmRebirth = function () {
    ui.modal("确认轮回", '<div class="muted">境界、物品、灵石、地图进度将重置。确定转世重修？</div>',
      [{ label: "转世", action: "doRebirth", cls: "danger" }, { label: "取消", action: "closeModal", cls: "ghost" }]);
  };
  ui.confirmReset = function () {
    ui.modal("确认删除存档", '<div class="muted">将永久删除当前存档并重新开始，无法恢复。</div>',
      [{ label: "确认删除", action: "resetSave", cls: "danger" }, { label: "取消", action: "closeModal", cls: "ghost" }]);
  };

  /* ---------- 物品操作 ---------- */
  ui.useItem = function (id) {
    var s = app().state();
    var it = d().itemById(id);
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
    var it = d().itemById(id);
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

  /* ---------- 移动（核心） ---------- */
  ui.movePlayer = function (dx, dy) {
    var s = app().state();
    var r = sys.tryMove(s, dx, dy);
    if (!r.ok) { ui.toast(r.msg); return; }
    app().save();
    if (r.monster) {
      if (r.ambush) {
        var fr = sys.fight(s, r.monster);
        app().save();
        ui.showFight(fr, s, null);
      } else {
        st().addLog(s, "你发现了「" + r.monster.name + "」，是否一战？");
      }
    } else if (r.herb) {
      st().addLog(s, "你发现了一片灵草。");
    } else if (r.ore) {
      st().addLog(s, "你发现了一条灵石矿脉。");
    }
    app().refresh();
  };

  /* ---------- 每秒刷新 ---------- */
  ui.tick = function () {
    var s = app().state();
    if (!s) return;
    var ps = st().stats(s);
    function set(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; }
    var need = sys.breakNeed(s);
    var maxed = sys.isMaxRealm(s);
    var expPct = maxed ? 100 : u.clamp(s.player.exp / need * 100, 0, 100);
    set("exp-txt", maxed ? "已圆满" : expPct.toFixed(1) + "%");
    var ef = document.getElementById("exp-fill"); if (ef) ef.style.width = expPct + "%";
    var hpPct = u.clamp(s.player.hp / Math.max(1, ps.hp) * 100, 0, 100);
    set("hp-txt", hpPct.toFixed(0) + "%");
    var hf = document.getElementById("hp-fill"); if (hf) hf.style.width = hpPct + "%";
    set("cp-val", u.fmt(ps.cp));
    set("lingshi-top", "🪙 " + u.fmt(s.lingShi));
    set("lingshi-val", "🪙 " + u.fmt(s.lingShi));
    set("tiandao-val", u.tiandao(ps.tiandao));
    var bb = document.getElementById("break-btn");
    if (bb) {
      bb.disabled = !sys.canBreak(s);
      if (maxed) bb.textContent = "已登峰造极";
    }
  };

  ui.scrollLog = function () {
    var el = document.getElementById("logbox");
    if (el) el.scrollTop = el.scrollHeight;
  };

  /* ---------- 动作分发 ---------- */
  ui.handleAction = function (action, id, el) {
    var s = app().state();
    if (!s && action !== "startGame" && action !== "pickPath" && action !== "pickLinggen") return;
    switch (action) {
      case "nav": ui.screen = id; ui.render(); break;
      case "move": {
        var dx = parseInt(el.getAttribute("data-dx") || "0", 10);
        var dy = parseInt(el.getAttribute("data-dy") || "0", 10);
        ui.movePlayer(dx, dy);
        break;
      }
      case "cellmove": {
        var tx = parseInt(el.getAttribute("data-x"), 10);
        var ty = parseInt(el.getAttribute("data-y"), 10);
        var cdx = tx - s.player.x, cdy = ty - s.player.y;
        if (cdx === 0 && cdy === 0) break;
        var md = Math.abs(cdx) + Math.abs(cdy);
        if (md === 1) ui.movePlayer(cdx, cdy);
        else if (Math.abs(cdx) >= Math.abs(cdy)) ui.movePlayer(cdx > 0 ? 1 : -1, 0);
        else ui.movePlayer(0, cdy > 0 ? 1 : -1);
        break;
      }
      case "collect": {
        var ch = d().tileAt(s.player.x, s.player.y);
        var kind = d().legendOf(ch).type;
        sys.collect(s, s.player.x, s.player.y, kind);
        var msg = kind === "herb" ? "采集灵草 +1，灵石 +5" : "开采矿脉：玄铁 +1，灵石 +20";
        st().addLog(s, msg);
        app().save();
        ui.toast(msg);
        app().refresh();
        break;
      }
      case "battle": {
        var ch2 = d().tileAt(s.player.x, s.player.y);
        var zone = d().zoneAt(s.player.x, s.player.y);
        var m = d().monsterOf(ch2, zone.id);
        if (!m) break;
        var fr = sys.fight(s, m);
        if (fr.win) {
          s.cleared[st().clearedKey(s.player.x, s.player.y)] = true;
          st().addLog(s, "击败「" + m.name + "」！");
        } else {
          sys.die(s);
        }
        app().save();
        ui.showFight(fr, s, m);
        app().refresh();
        break;
      }
      case "meditate": {
        var mr = sys.meditate(s, false);
        st().addLog(s, "打坐：灵气 +" + mr.exp + "，生命 +" + mr.heal);
        app().save();
        app().refresh();
        break;
      }
      case "meditateRoom": {
        var mr2 = sys.meditate(s, true);
        st().addLog(s, "练功房闭关：灵气 +" + mr2.exp + "，生命 +" + mr2.heal);
        app().save();
        app().refresh();
        break;
      }
      case "sect": ui.showSect(); break;
      case "shop": ui.showShop(); break;
      case "portal": ui.showPortal(); break;
      case "ruin": {
        var rr = sys.ruin(s);
        if (rr.kind === "fight") {
          var rfr = sys.fight(s, rr.monster);
          app().save();
          ui.showFight(rfr, s, null);
        } else {
          var msg = rr.kind === "item" ? ("你在遗迹中发现：" + rr.item)
            : rr.kind === "exp" ? ("你参悟遗迹，灵气 +" + rr.exp)
            : "遗迹空空如也。";
          st().addLog(s, msg);
          app().save();
          ui.toast(msg);
        }
        app().refresh();
        break;
      }
      case "teleport": {
        var xy = (id || "").split(",");
        var tr = sys.teleport(s, parseInt(xy[0], 10), parseInt(xy[1], 10));
        if (tr.ok) { app().save(); ui.closeModal(); ui.toast("传送成功"); app().refresh(); }
        break;
      }
      case "buy": {
        var br = sys.buy(s, id);
        if (br.ok) { app().save(); ui.toast("购买成功"); ui.showShop(); } else ui.toast(br.msg);
        break;
      }
      case "sell": {
        var sr = sys.sell(s, id);
        if (sr.ok) { app().save(); ui.toast("已出售"); ui.showShop(); } else ui.toast(sr.msg);
        break;
      }
      case "dunwu": {
        var dr = sys.dunwu(s);
        if (dr.ok) { app().save(); ui.toast("顿悟：灵气 +" + dr.exp); ui.showSect(); } else ui.toast(dr.msg);
        break;
      }
      case "recruit": {
        var rr = sys.recruit(s);
        if (rr.ok) { app().save(); ui.toast("招募到「" + rr.hero.name + "」！"); ui.showSect(); } else ui.toast(rr.msg);
        break;
      }
      case "break": {
        var b = sys.breakthrough(s);
        if (b.ok) {
          app().save();
          ui.toast("突破成功：" + b.realmName + (b.sub ? " · " + b.sub : ""));
          app().refresh();
        }
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
      case "rebirth": ui.confirmRebirth(); break;
      case "doRebirth": {
        var rb = sys.rebirth(s, false);
        ui.closeModal();
        app().save();
        ui.toast("轮回成功，+" + rb.earned + " 轮回点");
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
