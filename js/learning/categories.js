export const groups = [
  ['daily','Everyday Korean','Greetings, relationships, work and daily life'],
  ['travel','Travel Korean','Airports, transport, restaurants and getting around'],
  ['numbers','Numbers & time','Counting, dates, prices and everyday numbers'],
  ['trendy','Natural Korean','Reactions, casual expressions and slang'],
  ['drama','K-drama Korean','Expressions from dramas and real conversations']
];
const order = ['Greeting','Social','Love','Cafe','Restaurant','Shopping','Health','Work','Tech','Exercise'];
export const levelNames = {all:'All levels',essentials:'Beginner',intermediate:'Intermediate',nuance:'Advanced'};
export function phraseLevel(row) {
  const units = row.k.match(/[가-힣]/g)?.length || 0;
  if (units > 15 || /(?:실 수 있|드릴 수|셨으면|더라고|거든요|더라|잖아|기는 하|지 않으면|ㄹ까요)/u.test(row.k)) return 'nuance';
  return units <= 8 ? 'essentials' : 'intermediate';
}
export function situationGroups(index) {
  return groups.map(([id,title,description]) => {
    const rows = index[id] || [];
    const names = [...new Set(rows.map(row=>row.sub || row.t))];
    if(id==='daily') names.sort((a,b)=>(order.indexOf(a) < 0 ? 99 : order.indexOf(a))-(order.indexOf(b) < 0 ? 99 : order.indexOf(b)));
    return {id,title,description,topics:names.map(name=>({name,rows:rows.filter(row=>(row.sub||row.t)===name)}))};
  });
}
export function matchingLevel(rows,level) {return rows.filter(row=>level==='all'||phraseLevel(row)===level);}
