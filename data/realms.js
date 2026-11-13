// ============ 境界表（参考《神将降魔》：大境界 + 小境界，气海阈值突破）============
// exp: 突破到下一小境界所需灵气（气海阈值）· qiRate: 每秒获得灵气
// breakMult: 离开该境界时的属性倍率（凡人→炼气 +100%，小境界 +10%，大境界 +50%）
// shouyuan: 该大境界基本寿元
(function () {
  "use strict";
  var MAJOR = [
    { name:"凡人", subs:[""], exp:[10], hp:100, atk:10, def:5, qi:10, shenshi:6, strength:8, speed:5, qiRate:1, shouyuan:60, desc:"凡胎俗骨，尚未引气入体" },
    { name:"炼气", subs:["初期","中期","后期","巅峰"], exp:[20,40,60,80], hp:200, atk:20, def:10, qi:25, shenshi:12, strength:16, speed:8, qiRate:3, shouyuan:100, desc:"引气入体，初登仙途" },
    { name:"筑基", subs:["初期","中期","后期","巅峰"], exp:[180,320,460,600], hp:450, atk:45, def:22, qi:60, shenshi:30, strength:38, speed:11, qiRate:9, shouyuan:200, desc:"筑就道基，脱胎换骨" },
    { name:"结丹", subs:["初期","中期","后期","巅峰"], exp:[1350,1800,2400,3000], hp:1000, atk:100, def:50, qi:150, shenshi:70, strength:90, speed:17, qiRate:22, shouyuan:500, desc:"金丹大成，寿元大涨" },
    { name:"元婴", subs:["初期","中期","后期","巅峰"], exp:[6750,9000,12000,15000], hp:2200, atk:230, def:110, qi:380, shenshi:170, strength:210, speed:25, qiRate:55, shouyuan:1200, desc:"元婴出窍，自此突破需渡雷劫" },
    { name:"化神", subs:["初期","中期","后期","巅峰"], exp:[33800,45000,60000,75000], hp:5000, atk:540, def:260, qi:900, shenshi:410, strength:510, speed:37, qiRate:140, shouyuan:2600, desc:"化神凝魄，神通初成" },
    { name:"合体", subs:["初期","中期","后期","巅峰"], exp:[168750,225000,300000,375000], hp:11500, atk:1300, def:620, qi:2200, shenshi:1000, strength:1250, speed:53, qiRate:380, shouyuan:6000, desc:"合体归一，肉身如龙" },
    { name:"大乘", subs:["初期","中期","后期","巅峰"], exp:[844000,1125000,1500000,1875000], hp:27000, atk:3200, def:1500, qi:5400, shenshi:2500, strength:3100, speed:78, qiRate:1000, shouyuan:14000, desc:"大乘圆满，仙凡之别" },
    { name:"渡劫", subs:["初期","中期","后期","巅峰"], exp:[4200000,5600000,7500000,9400000], hp:65000, atk:8000, def:3700, qi:13000, shenshi:6200, strength:7700, speed:115, qiRate:2800, shouyuan:30000, desc:"天劫加身，九死一生" }
  ];

  var SUB_MULT = [1, 1.22, 1.5, 1.85]; // 小境界属性成长倍率（初期=1）

  var realms = [];
  var index = 0;
  MAJOR.forEach(function (m, mi) {
    m.subs.forEach(function (sub, si) {
      var isLast = si === m.subs.length - 1;
      var f = SUB_MULT[si] || 1;
      var breakMult = 1.1;                       // 小境界突破 +10%
      if (mi === 0) breakMult = 2.0;             // 凡人→炼气 +100%
      else if (isLast) breakMult = (mi === MAJOR.length - 1) ? 1.0 : 1.5; // 大境界 +50%
      realms.push({
        id: m.name + (sub || ""),
        index: index++,
        name: m.name,
        sub: sub || "",
        exp: m.exp[si],
        hp: Math.round(m.hp * f),
        atk: Math.round(m.atk * f),
        def: Math.round(m.def * f),
        qi: Math.round(m.qi * f),
        shenshi: Math.round(m.shenshi * f),
        strength: Math.round(m.strength * f),
        speed: Math.round(m.speed * f),
        qiRate: m.qiRate,
        breakMult: breakMult,
        shouyuan: m.shouyuan,
        desc: m.desc
      });
    });
  });

  GAME_DATA.realms = realms;
})();
