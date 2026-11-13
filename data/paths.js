// ============ 流派与灵根（占位数据）============
// 流派 primary: 主属性（战斗额外加成）· bonus: 该属性倍率
GAME_DATA.paths = [
  { id:"lingxiu", name:"灵修", icon:"灵", desc:"主修灵气，法术伤害，输出稳定", primary:"qi",       bonus:{ qi:1.5 } },
  { id:"jianxiu", name:"剑修", icon:"剑", desc:"御剑千里，后期上限极高",       primary:"shenshi",  bonus:{ shenshi:1.5 } },
  { id:"tixiu",   name:"体修", icon:"体", desc:"肉身成圣，血厚防高",           primary:"strength", bonus:{ strength:1.5 } }
];

// 灵根 bonus: 对某属性/修为速率的加成比例（0.10 = +10%）
GAME_DATA.linggens = [
  { id:"jin",  name:"金灵根", icon:"金", desc:"锐金之气，攻击更盛",   bonus:{ atk:0.10 } },
  { id:"mu",   name:"木灵根", icon:"木", desc:"生生不息，生命更高",   bonus:{ hp:0.20 } },
  { id:"shui", name:"水灵根", icon:"水", desc:"上善若水，修炼更快",   bonus:{ qiRate:0.25 } },
  { id:"huo",  name:"火灵根", icon:"火", desc:"烈焰燎原，攻击更强",   bonus:{ atk:0.15 } },
  { id:"tu",   name:"土灵根", icon:"土", desc:"厚德载物，防御更厚",   bonus:{ def:0.20 } }
];
