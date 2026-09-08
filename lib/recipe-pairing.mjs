import {key,principalIngredients} from './recipe-candidates.mjs';

// Conservative culinary directions, not ingredient availability or safety claims.
// The source evidence and assess() must still pass before a pairing is displayed.
function traits(recipe){
 const ingredients=recipe.ingredients.map(i=>key(i.name)).join(' ');
 const cooking=key([recipe.title,...(recipe.steps||[])].join(' '));
 const broth=/湯|湯底/.test(cooking)||/高湯|清湯|雞湯|骨湯/.test(ingredients);
 const sauce=/咖哩|燴|紅燒|滷|燉|醬汁|出汁/.test(cooking)||/咖哩|燉醬/.test(ingredients);
 const coldVegetable=/小黃瓜|黃瓜|胡蘿蔔|紅蘿蔔|白蘿蔔|紫甘藍|紫高麗菜|萵苣/.test(ingredients);
 const cold=coldVegetable&&!/炒|煎|烤|炸|燉|滷|湯/.test(cooking)&&!broth&&!sauce;
 const savory=/蛋|肉|雞|牛|豬|魚|蝦|菇|豆腐|菜|蘿蔔|番茄|茄子|馬鈴薯|南瓜|豆/.test(ingredients);
 const riceIngredients=/蛋|肉|雞|豬|蝦|菇|高麗菜|紅蘿蔔|胡蘿蔔|玉米|豌豆/.test(ingredients);
 return {broth:broth&&savory,sauce:sauce&&savory,cold,
  friedRice:riceIngredients&&/炒|拌炒/.test(cooking)&&!broth&&!sauce&&!cold};
}
export const pairingRules=[
 {matches:t=>t.broth,direction:'湯麵'},
 {matches:t=>t.sauce,direction:'白飯'},
 {matches:t=>t.cold,direction:'涼麵'},
 {matches:t=>t.friedRice,direction:'炒飯'},
];
export function directions(recipe){
 const t=traits(recipe);
 return pairingRules.filter(rule=>rule.matches(t)).map(rule=>rule.direction).slice(0,2);
}
export function pairingQuery(main,direction){return `${main.title} ${direction}`;}

export function supportsDirection(main,evidence,direction){
 const title=key(evidence.title),names=evidence.ingredients.map(i=>key(i.name));
 const noodles=names.some(n=>/麵(?:條)?$/.test(n));
 const rice=names.some(n=>/飯$|^(?:生|白|糙|胚芽|粳|蓬萊|在來|泰國香)?米$/.test(n));
 const context=principalIngredients(main),found=principalIngredients(evidence);
 // A title/search hit alone cannot prove the proposed combination. Require the
 // main's substantive ingredients and an actual staple in the returned recipe.
 if(!context.length||!context.every(n=>found.includes(n)))return false;
 if(direction==='湯麵')return /湯.*麵|麵.*湯/.test(title)&&noodles;
 if(direction==='涼麵')return /涼麵|冷麵/.test(title)&&noodles;
 if(direction==='炒飯')return /炒飯/.test(title)&&rice;
 if(direction==='白飯')return /飯/.test(title)&&rice&&traits(evidence).sauce;
 return false;
}
