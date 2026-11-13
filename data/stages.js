// ============ 副本 / BOSS（占位数据）============
// 掉落 drops: { id: 物品id, chance: 掉落概率(0~1) }
GAME_DATA.stages = [
  { id:"s1",  name:"试炼之地",  boss:"风狼妖", bossHp:120,    bossAtk:14,  bossDef:4,   lingShi:20,  exp:40,    drops:[{ id:"lingcao", chance:0.5 }, { id:"yaoshou_neidan", chance:0.15 }] },
  { id:"s2",  name:"东海龙宫",  boss:"蛟龙",   bossHp:320,    bossAtk:34,  bossDef:10,  lingShi:55,  exp:130,   drops:[{ id:"lingcao", chance:0.6 }, { id:"xuantie", chance:0.25 }, { id:"qingfeng_jian", chance:0.08 }] },
  { id:"s3",  name:"万妖林",    boss:"树妖王", bossHp:700,    bossAtk:75,  bossDef:22,  lingShi:140, exp:360,   drops:[{ id:"xuantie", chance:0.5 }, { id:"yaoshou_neidan", chance:0.3 }, { id:"jinchan_yi", chance:0.08 }] },
  { id:"s4",  name:"四圣神域",  boss:"青龙",   bossHp:1500,   bossAtk:160, bossDef:48,  lingShi:320, exp:900,   drops:[{ id:"xuantie", chance:0.6 }, { id:"lingyu", chance:0.15 }, { id:"chiyan_fajian", chance:0.06 }] },
  { id:"s5",  name:"上古剑冢",  boss:"剑灵",   bossHp:3300,   bossAtk:360, bossDef:105, lingShi:720, exp:2100,  drops:[{ id:"yaoshou_neidan", chance:0.5 }, { id:"lingyu", chance:0.25 }, { id:"leihu_feijian", chance:0.05 }] },
  { id:"s6",  name:"主宰战场",  boss:"魔君",   bossHp:7200,   bossAtk:800, bossDef:230, lingShi:1600,exp:5000,  drops:[{ id:"lingyu", chance:0.4 }, { id:"xuantie_jing", chance:0.2 }, { id:"liuxing_zhu", chance:0.04 }] },
  { id:"s7",  name:"神魔战场",  boss:"血魔",   bossHp:16000,  bossAtk:1800,bossDef:510, lingShi:3600,exp:12000, drops:[{ id:"lingyu", chance:0.5 }, { id:"xuantie_jing", chance:0.3 }, { id:"shenmo_ling", chance:0.03 }] },
  { id:"s8",  name:"仙人遗迹",  boss:"仙傀",   bossHp:36000,  bossAtk:4000,bossDef:1150,lingShi:8200,exp:30000, drops:[{ id:"xuantie_jing", chance:0.5 }, { id:"shenmo_ling", chance:0.15 }] },
  { id:"s9",  name:"四圣归墟",  boss:"玄武",   bossHp:82000,  bossAtk:9000,bossDef:2600,lingShi:19000,exp:72000,drops:[{ id:"xuantie_jing", chance:0.6 }, { id:"shenmo_ling", chance:0.25 }] },
  { id:"s10", name:"天外天",    boss:"魔帝",   bossHp:190000, bossAtk:20000,bossDef:6000,lingShi:45000,exp:180000,drops:[{ id:"shenmo_ling", chance:0.5 }] }
];
