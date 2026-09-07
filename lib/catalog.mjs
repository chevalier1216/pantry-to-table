export const INGREDIENTS = [
 {id:'egg',name:'雞蛋',unit:'顆',aliases:['雞蛋','蛋'],tags:['egg']},
 {id:'tomato',name:'番茄',unit:'克',aliases:['番茄','蕃茄','西紅柿'],tags:[]},
 {id:'cabbage',name:'高麗菜',unit:'克',aliases:['高麗菜','包心菜'],tags:[]},
 {id:'cookedRice',name:'熟白飯',unit:'克',aliases:['熟白飯','白飯','剩飯','隔夜飯'],tags:[]},
 {id:'tofu',name:'板豆腐',unit:'克',aliases:['板豆腐','豆腐'],tags:['soy']},
 {id:'mushroom',name:'鮮菇',unit:'克',aliases:['鮮菇','香菇','蘑菇','菇類'],tags:[]},
 {id:'noodles',name:'乾麵條',unit:'克',aliases:['乾麵條','麵條','麵'],tags:['wheat']},
 {id:'oil',name:'食用油',unit:'毫升',aliases:['食用油','沙拉油','橄欖油','油'],tags:[]},
 {id:'sugar',name:'糖',unit:'克',aliases:['砂糖','白糖','糖'],tags:[]},
 {id:'salt',name:'鹽',unit:'克',aliases:['食鹽','鹽'],tags:[]},
 {id:'soySauce',name:'醬油',unit:'毫升',aliases:['醬油'],tags:['soy','wheat']},
 {id:'water',name:'飲用水',unit:'毫升',aliases:['飲用水','清水','水'],tags:[]},
];
export const EQUIPMENT=[{id:'pan',name:'平底鍋',aliases:['平底鍋','炒鍋']},{id:'pot',name:'湯鍋',aliases:['湯鍋','煮鍋']},{id:'stove',name:'爐火',aliases:['爐火','瓦斯爐','電磁爐']},{id:'riceCooker',name:'電鍋',aliases:['電鍋']},{id:'microwave',name:'微波爐',aliases:['微波爐']},{id:'oven',name:'烤箱',aliases:['烤箱']},{id:'airFryer',name:'氣炸鍋',aliases:['氣炸鍋']},{id:'castIron',name:'鑄鐵鍋',aliases:['鑄鐵鍋']},{id:'any',name:'不拘',aliases:['廚具不拘','設備不拘','熱源不拘']}];
export const EXCLUSIONS=[{id:'egg',name:'蛋'},{id:'soy',name:'黃豆／豆製品'},{id:'wheat',name:'小麥／麩質'},{id:'peanut',name:'花生'},{id:'sesame',name:'芝麻'},{id:'dairy',name:'乳製品'},{id:'seafood',name:'海鮮'},{id:'spicy',name:'辣椒'},{id:'allium',name:'蔥蒜洋蔥'},{id:'meat',name:'肉類'}];
const R=(id,name,kind,ingredients,equipment,steps,note='')=>({id,name,kind,ingredients,equipment,steps:steps.map(([title,minutes,detail])=>({title,minutes,detail})),note});
// Original home-cooking drafts, base quantities serve two. Times are estimates,
// and cover all listed work (including potable cooking water and washing cookware).
export const RECIPES=[
 R('tomato-eggs','番茄炒蛋','main',{egg:3,tomato:300,oil:15,salt:2},['pan','stove'],[
 ['備料與打蛋',5,'洗淨番茄切小塊。雞蛋打入碗中，加入這道菜所需的一半鹽，攪散。準備好鍋鏟、碗與砧板。'],
 ['先炒雞蛋',4,'平底鍋以中小火預熱，加入這道菜所需的一半油。倒入蛋液，輕推至全部凝固、沒有流動蛋液，盛出。'],
 ['炒番茄並合炒',6,'原鍋加入剩下的油與番茄，中火翻炒至軟化出汁，加入剩下的鹽，再倒回雞蛋拌勻、熱透。'],
 ['盛盤與整理',2,'關火盛盤，整理檯面並清洗鍋具，準備下一道菜。']]),
 R('egg-rice','家常蛋炒飯','staple',{egg:2,cookedRice:400,oil:15,salt:2},['pan','stove'],[
 ['準備食材',4,'打散雞蛋。將熟白飯輕輕撥鬆。這道料理使用已煮熟且妥善冷藏的飯；生米不適用。'],
 ['炒蛋與飯',8,'平底鍋中火預熱後加入油，倒入蛋液翻炒至凝固。加入白飯分散結塊，持續翻炒至整鍋均勻熱透。'],
 ['調味與整理',3,'加入鹽並炒勻，關火盛盤，清洗鍋具。']],'熟飯來源與保存狀態請自行確認；不明或保存不當的飯不使用。'),
 R('cabbage','清炒高麗菜','side',{cabbage:300,oil:10,salt:1,water:30},['pan','stove'],[
 ['清洗與切菜',4,'高麗菜逐葉洗淨，切成容易入口的大小；較厚菜梗切薄。'],
 ['炒菜',6,'平底鍋中火預熱，加入油與菜梗先炒，再放菜葉。加入飲用水與鹽，持續翻炒至菜梗軟化。'],
 ['盛盤與整理',2,'確認菜已熟透，關火盛盤，清洗鍋具。']]),
 R('mushroom-tofu','鮮菇煎豆腐','main',{tofu:300,mushroom:150,oil:15,soySauce:15,water:40},['pan','stove'],[
 ['準備豆腐與菇',5,'板豆腐瀝乾、切片；鮮菇洗淨切片。用廚房紙巾輕壓豆腐表面，減少入鍋油濺。'],
 ['煎豆腐',9,'平底鍋中小火預熱加油，平放豆腐。待底面定型再翻面，兩面煎至淡金色。'],
 ['加入鮮菇',6,'加入菇片、醬油與飲用水，煮至菇片熟透且醬汁略收乾。'],
 ['盛盤與整理',2,'關火盛盤，清洗鍋具。']]),
 R('tomato-soup','番茄蛋花湯','side',{egg:2,tomato:200,water:650,salt:2},['pot','stove'],[
 ['切番茄與打蛋',4,'洗淨番茄切小塊，雞蛋在另一個碗裡打散。'],
 ['煮番茄湯',9,'湯鍋放入飲用水與番茄，加熱至沸騰後轉中小火，煮到番茄軟化。'],
 ['加入蛋花並盛湯',4,'讓湯維持輕滾，慢慢繞圈倒入蛋液，待全部凝固、沒有生蛋液後加入鹽。關火盛湯，整理鍋具。']]),
 R('noodle-soup','鮮菇高麗菜湯麵','staple',{noodles:180,cabbage:200,mushroom:100,water:1200,salt:3},['pot','stove'],[
 ['洗切蔬菜',5,'洗淨高麗菜與鮮菇，切成小片。查看乾麵包裝的建議煮麵時間。'],
 ['煮湯',8,'湯鍋加入飲用水，加熱至沸騰，放入蔬菜與鮮菇煮至軟化。'],
 ['下麵與調味',8,'放入乾麵並輕輕攪散，依包裝指示煮熟，加入鹽。此時間預留約八分鐘；若麵條需要更久，請增加時間上限。'],
 ['盛碗與整理',2,'關火，將麵與湯分裝，整理鍋具。']]),
 R('steamed-egg','電鍋蒸蛋','main',{egg:3,water:650,salt:2},['riceCooker'],[
 ['調配蛋液',5,'將蛋打散，每顆蛋量取約100毫升飲用水加入，放入鹽拌勻。倒入耐熱蒸碗；其餘飲用水供電鍋外鍋使用。'],
 ['電鍋蒸熟',20,'依電鍋型號的蒸蛋方式，放入蒸架與耐熱碗，外鍋加剩餘水。蒸至中心完全凝固，沒有流動蛋液；不同機型若未熟需要延長加熱。'],
 ['取出與整理',3,'小心蒸氣，用隔熱手套取出蒸碗，整理電鍋周邊。']],'需有電鍋隨附蒸架、耐熱碗與隔熱手套；實際時間受機型影響。'),
 R('tofu-soup','鮮菇豆腐湯','side',{tofu:200,mushroom:100,water:700,salt:2},['pot','stove'],[
 ['切豆腐與鮮菇',4,'豆腐瀝乾切丁，鮮菇洗淨切片。'],
 ['煮湯',10,'飲用水入湯鍋煮沸，加入豆腐與鮮菇，轉中小火煮至菇片熟透、豆腐熱透。'],
 ['調味與整理',3,'加入鹽拌勻，關火盛湯，清洗鍋具。']]),
];
