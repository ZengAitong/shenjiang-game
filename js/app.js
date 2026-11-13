/* 入口：启动、主循环、存档、事件委托 */
(function () {
  "use strict";
  var store = window.Game.store;
  var sys = window.Game.systems;
  var ui = window.Game.ui;
  var util = window.Game.util;

  var app = {};
  var S = null;
  var timer = null;

  app.state = function () { return S; };
  app.save = function () { if (S) store.save(S); };

  app.newGame = function (opts) {
    S = store.newGame(opts);
    S.heroes.nezha = { owned: true, level: 1 };
    store.save(S);
    ui.screen = "cultivate";
    startTick();
    ui.render();
  };

  app.refresh = function () { ui.render(); };

  app.reset = function () {
    store.reset();
    stopTick();
    S = null;
    ui.render();
  };

  function startTick() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      if (!S) return;
      S.tiandao = (S.tiandao || 0) + 2;          // 现实每秒 +2 小时天道
      var ps = store.stats(S);
      S.player.exp += ps.qiRate;                   // 打坐获得灵气
      if (S.settings.autoBreak && sys.canBreak(S)) sys.breakthrough(S);
      ui.tick(ps, S);
      if (Date.now() - S.lastSeen > 10000) store.save(S); // 约每 10 秒存档
    }, 1000);
  }
  function stopTick() { if (timer) { clearInterval(timer); timer = null; } }

  function boot() {
    S = store.load();
    if (S) {
      var now = Date.now();
      var dt = now - (S.lastSeen || now);
      if (dt > 60 * 1000) {
        var g = sys.offlineGain(S, dt);
        if (g.exp > 0 || g.ling > 0) {
          sys.applyOffline(S, g);
          store.save(S);
          startTick();
          ui.render();
          ui.showOffline(g);
          return;
        }
      }
      startTick();
      ui.render();
    } else {
      ui.render(); // 创建角色
    }
  }

  /* 事件委托 */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-action]") : null;
    if (!el) return;
    ui.handleAction(el.getAttribute("data-action"), el.getAttribute("data-id"));
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) app.save();
  });
  window.addEventListener("beforeunload", function () { app.save(); });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }

  window.Game.app = app;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
