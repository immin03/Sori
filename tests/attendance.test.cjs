const test=require('node:test');
const assert=require('node:assert/strict');
test('attendance follows civil days, keeps unique questions, and isolates account history',async()=>{
 const {Attendance}=await import('../js/learning/attendance.js');
 const data=new Map(),storage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 let now=new Date(2026,9,31,23,58).getTime();
 const make=user=>new Attendance(storage,user,{},()=>now);
 const guest=make(null);guest.stamp();guest.stamp('word:1');guest.stamp('word:1');
 assert.equal(guest.stats().count,1);
 const first=make('first');assert.equal(first.stats().total,1);
 now=new Date(2026,10,1,0,1).getTime();first.stamp('word:2');
 const secondTab=make('first');secondTab.stamp('word:3');first.stamp('word:4');first.stamp('word:5');first.stamp('word:6');
 assert.equal(first.stats().current,2);assert.equal(make('first').stats().count,5);
 assert.match(first.markup(),/daily goal met/);first.monthOffset=-1;assert.match(first.markup(),/October 31, 2026, checked in/);
 assert.equal(make('second').stats().total,0);
 now=new Date(2026,10,2,6).getTime();guest.stamp();assert.equal(make('first').stats().total,2);
 now=new Date(2026,10,4,6).getTime();first.stamp();assert.equal(first.stats().current,1);assert.equal(first.stats().longest,2);
});
