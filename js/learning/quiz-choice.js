const numbers = [['one','first'],['two','second'],['three','third'],['four','fourth']];
const normalize = value => String(value).toLowerCase().normalize('NFKC').replace(/[^\p{Letter}\p{Number}]/gu,'');
export function optionNames(index) {
  const [number,ordinal]=numbers[index], digit=String(index+1);
  return [number,digit,'option '+number,'option '+digit,'number '+number,'number '+digit,'the '+ordinal+' one'];
}
export function spokenOption(heard, answers) {
  return answers.findIndex((answer,i)=>[answer,...optionNames(i)].some(s=>normalize(s)===normalize(heard)));
}
