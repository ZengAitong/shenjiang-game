/* 入口：启动、主循环（仅天道累计，无挂机收益）、存档、事件委托 */
(function () {
  "use strict";
  var store = window.Game.store;
  var sys = window.Game.systems;
  var ui = window.Game.ui;

  var app = {};
  var S = null;
  var timer = null;

  // 错误兜底：把完整错误显示到屏幕底部（file:// 下 window.onerror 会被遮蔽成 "Script error."）
  function safe(fn) {
    try {
      fn();
    } catch (e) {
      try {
        var d = document.getElementById('errbox');
        if (!d) {
          d = document.createElement('div');
          d.id = 'errbox';
          d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#7a1f1f;color:#fff;font-size:12px;padding:8px;white-space:pre-wrap;max-height:40%;overflow:auto;font-family:monospace';
          document.body.appendChild(d);
        }
        d.textContent += (d.textContent ? '\n' : '') + '⚠ ' + (e && e.message ? e.message : e) +
          '\n' + (e && e.stack ? String(e.stack).split('\n').slice(0, 2).join('\n') : '');
      } catch (ex) {}
    }
  }

  app.state = function () { return S; };
  app.save = function () { if (S) store.save(S); };

  app.newGame = function (opts) {
    S = store.newGame(opts);
    S.heroes.nezha = { owned: true, level: 1 };
    S.player.hp = store.stats(S).hp;
    store.addLog(S, "你降生在天柱山脚下，从此踏上修仙之路。");
    store.save(S);
    ui.screen = "map";
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
      safe(function () {
        S.tiandao = (S.tiandao || 0) + 2; // 现实每秒 +2 小时天道（原设定）
        ui.tick();
        if (Date.now() - S.lastSeen > 10000) store.save(S); // 约每 10 秒存档
      });
    }, 1000);
  }
  function stopTick() { if (timer) { clearInterval(timer); timer = null; } }

  function boot() {
    S = store.load();
    if (S) {
      startTick();
      ui.render();
    } else {
      ui.render(); // 创建角色
    }
  }

  /* 事件委托 */
  document.addEventListener("click", function (e) {
    safe(function () {
      var el = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!el) return;
      ui.handleAction(el.getAttribute("data-action"), el.getAttribute("data-id"), el);
    });
  });

  /* 键盘方向键（桌面调试用） */
  document.addEventListener("keydown", function (e) {
    var map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    var mv = map[e.key];
    if (mv && S) {
      e.preventDefault();
      safe(function () { ui.movePlayer(mv[0], mv[1]); });
    }
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
