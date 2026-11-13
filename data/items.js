// ============ 物品表（占位数据）============
// type: material 材料 / consumable 丹药(一次性) / equipment 装备
// equipment.slot: weapon 武器 / armor 护甲 / accessory 饰品 · stats: 属性加成
GAME_DATA.items = {
  lingcao:        { id:"lingcao",        name:"灵草",     type:"material",   desc:"炼丹基础材料", value:5 },
  xuantie:        { id:"xuantie",        name:"玄铁",     type:"material",   desc:"锻造装备材料", value:20 },
  yaoshou_neidan: { id:"yaoshou_neidan", name:"妖兽内丹", type:"material",   desc:"突破与培养辅料", value:80 },
  xuantie_jing:   { id:"xuantie_jing",   name:"玄铁精",   type:"material",   desc:"锻造高阶装备材料", value:300 },
  lingyu:         { id:"lingyu",         name:"灵玉",     type:"material",   desc:"珍贵的灵石精华", value:200 },
  shenmo_ling:    { id:"shenmo_ling",    name:"神魔之灵", type:"material",   desc:"神魔战场遗留的精华", value:1000 },

  jiuwei_wan:     { id:"jiuwei_wan",     name:"聚气丸",   type:"consumable", effect:{ exp:200 },  desc:"服用后获得 200 修为" },
  peiyuan_dan:    { id:"peiyuan_dan",    name:"培元丹",   type:"consumable", effect:{ exp:2000 }, desc:"服用后获得 2000 修为" },

  qingfeng_jian:  { id:"qingfeng_jian",  name:"青锋剑",   type:"equipment", slot:"weapon",    stats:{ atk:30 },          desc:"下品飞剑" },
  chiyan_fajian:  { id:"chiyan_fajian",  name:"赤炎法剑", type:"equipment", slot:"weapon",    stats:{ atk:90, qi:20 },   desc:"中品法剑，附带火灵" },
  leihu_feijian:  { id:"leihu_feijian",  name:"雷虎飞剑", type:"equipment", slot:"weapon",    stats:{ atk:220, shenshi:40 }, desc:"上品飞剑" },

  jinchan_yi:     { id:"jinchan_yi",     name:"金蝉衣",   type:"equipment", slot:"armor",     stats:{ hp:150, def:20 },  desc:"下品护甲" },
  liuxing_zhu:    { id:"liuxing_zhu",    name:"流星坠",   type:"equipment", slot:"accessory", stats:{ atk:60, speed:8 }, desc:"下品饰品，提速" }
};
