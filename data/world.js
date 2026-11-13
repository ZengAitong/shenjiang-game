// ============ 世界地图（固定手绘，36×26） ============
// 图例见 legend：山/水不可通行；c灵草 m矿脉可采集；g小妖 G大妖 B区域BOSS可战斗；
// s宗门 d练功房 b坊市 p传送阵 x遗迹 可进入；@出生点
GAME_DATA.world = {
  width: 36,
  height: 26,
  start: { x: 12, y: 13 },
  map: [
    '####################################',
    '#...........r....########..........#',
    '#...........r....###sb###..........#',
    '#...........r....###d####..........#',
    '#...........r.......p..............#',
    '#...........r.......r..............#',
    '#...........r...ffffrfffffff.......#',
    '#...........r...gfffrfffffff~~~~~~~#',
    '#...........r...ffffrffgffff~~~~~~~#',
    '#...........r...ffffrgffffff.~~~~~~#',
    '#..c.....c..r...fffgrffffGff.~~~~~~#',
    '#.c.c.......r.c.ffgfrfgfffff.~~~~~~#',
    '#..rcrrrrrprrrrrrrrrrrrrrrrrr..B~~~#',
    '#.c.........@...ffffffffGfff.~~~~~~#',
    '#..c........r...fffffffffBff.~~~~~~#',
    '#.......c...rc..ffffffffffff.~~~~~~#',
    '#...........r.............x..~~~~~~#',
    '#...........r............x.x.~~~~~~#',
    '#...........r.............x..~~~~~~#',
    '#....mmm....r............x.........#',
    '#....mmmG...r......................#',
    '#....mmm....r......................#',
    '#...........r...G..G...............#',
    '#...........r....B.................#',
    '#...........r......................#',
    '####################################'
  ],
  zones: [
    { id:"zongmen",   name:"无量神宫", rect:[17,1,24,5],   desc:"仙门重地，可顿悟、招募神将、购置丹药。" },
    { id:"tianzhu",   name:"天柱山",   rect:[4,5,15,16],   desc:"巍峨天柱，新人落脚之地。山间灵草星星点点。" },
    { id:"lingcaopo", name:"灵草坡",   rect:[2,10,6,14],   desc:"灵草遍地，是采集的好去处。" },
    { id:"kuangqu",   name:"灵石矿区", rect:[4,18,9,22],   desc:"矿脉纵横，有妖物盘踞。" },
    { id:"wanlin",    name:"万妖林",   rect:[16,6,27,15],  desc:"古木参天，妖物出没，深处有树妖王。" },
    { id:"donghai",   name:"东海",     rect:[28,7,34,18],  desc:"东海之滨，蛟龙盘踞龙宫。" },
    { id:"yiji",      name:"仙人遗迹", rect:[24,15,29,20], desc:"上古仙人遗留的废墟，机缘与危险并存。" },
    { id:"guixu",     name:"归墟",     rect:[13,21,21,24], desc:"魔气滔天，生人勿近。魔帝盘踞于此。" }
  ],
  bossByZone: { wanlin: "shuyao", donghai: "jiaolong", guixu: "modi" },
  monsters: {
    fenglang: { name:"风狼妖",    hp:80,   atk:16,  def:5,   lingShi:[15,25],      drops:[{id:"yaoshou_neidan",chance:0.3},{id:"lingcao",chance:0.2}] },
    xingyao:  { name:"银刃星曜妖",hp:500,  atk:60,  def:18,  lingShi:[60,120],     drops:[{id:"xuantie",chance:0.4},{id:"lingyu",chance:0.1}] },
    shuyao:   { name:"树妖王",    hp:1200, atk:110, def:30,  lingShi:[250,400],    drops:[{id:"xuantie_jing",chance:0.3},{id:"lingyu",chance:0.2},{id:"qingfeng_jian",chance:0.1}] },
    jiaolong: { name:"东海蛟龙",  hp:2500, atk:180, def:45,  lingShi:[500,800],    drops:[{id:"lingyu",chance:0.3},{id:"chiyan_fajian",chance:0.08}] },
    modi:     { name:"魔帝",      hp:9000, atk:320, def:90,  lingShi:[1800,2500],  drops:[{id:"shenmo_ling",chance:0.25},{id:"leihu_feijian",chance:0.05}] }
  },
  legend: {
    '#': { name:"山",     walkable:false },
    '~': { name:"水",     walkable:false },
    '.': { name:"平原",   walkable:true },
    'f': { name:"森林",   walkable:true },
    'r': { name:"路",     walkable:true },
    'c': { name:"灵草",   walkable:true, type:"herb" },
    'm': { name:"矿脉",   walkable:true, type:"ore" },
    'g': { name:"小妖",   walkable:true, type:"monster", monster:"fenglang" },
    'G': { name:"大妖",   walkable:true, type:"monster", monster:"xingyao" },
    'B': { name:"BOSS",   walkable:true, type:"monster", monster:"zone" },
    's': { name:"宗门",   walkable:true, type:"building", building:"sect" },
    'd': { name:"练功房", walkable:true, type:"building", building:"room" },
    'b': { name:"坊市",   walkable:true, type:"building", building:"shop" },
    'p': { name:"传送阵", walkable:true, type:"building", building:"portal" },
    'x': { name:"遗迹",   walkable:true, type:"building", building:"ruin" },
    '@': { name:"出生点", walkable:true }
  }
};
