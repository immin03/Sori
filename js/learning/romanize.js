// Revised Romanization guide for Hangul spelling; existing authored phrase readings take priority.
const onset=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const vowel=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const coda=['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
const finalOnset=['','g','kk','s','n','j','','d','r','g','m','b','s','t','p','','m','b','s','s','ss','','j','ch','k','t','p',''];
const retained={3:'k',5:'n',6:'n',9:'l',10:'l',11:'l',12:'l',13:'l',14:'l',15:'l',18:'p'};
function parts(char){const code=char.codePointAt(0)-0xac00;if(code<0||code>11171)return null;return {o:Math.floor(code/588),v:Math.floor(code%588/28),c:code%28};}
export function romanize(text){
  const chars=[...String(text||'')], syllables=chars.map(parts);
  return chars.map((char,i)=>{
    const p=syllables[i];if(!p)return char;
    const prev=syllables[i-1],next=syllables[i+1];
    let first=onset[p.o],last=coda[p.c];
    if(p.o===11&&prev?.c&&prev.c!==21)first=finalOnset[prev.c];
    if(p.o===11&&p.v===20&&prev?.c===7)first='j';
    if(p.o===11&&p.v===20&&prev?.c===25)first='ch';
    if(p.c&&p.c!==21&&next?.o===11)last=retained[p.c]||'';
    if(next&&[2,6].includes(next.o)){if(last==='k')last='ng';if(last==='t')last='n';if(last==='p')last='m';}
    return first+vowel[p.v]+last;
  }).join('');
}
