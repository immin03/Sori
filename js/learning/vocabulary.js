// Each blank has one target word. Accept its spoken inflection and natural versions of the whole sentence.
const prompts = [
  ['I need to buy new clothes.', '새 []을 사야 해요.', '옷', ['옷을','새 옷','새 옷을 사야 돼요','새 옷을 사야 해','새 옷을 사야 돼','새 옷 사야 해요','새 옷 사야 돼요','새 옷들을 사야 해요','새 옷들을 사야 돼요']],
  ['Could I have some water?', '[] 좀 주세요.', '물', ['물을','물 좀 주시겠어요','물을 좀 주세요']],
  ['Where is the subway station?', '[]이 어디예요?', '지하철역', ['지하철역이','지하철역은 어디예요','지하철역이 어디에요']],
  ['Please give me a receipt.', '[] 주세요.', '영수증', ['영수증을','영수증을 주세요','영수증 좀 주세요']],
  ['I left my umbrella at home.', '집에 []을 두고 왔어요.', '우산', ['우산을','우산을 집에 두고 왔어요','집에 우산 두고 왔어요']],
  ['I booked a table for two.', '두 명으로 []했어요.', '예약', ['예약했어요','두 명 예약했어요','두 사람으로 예약했어요']],
  ['Could I see the menu?', '[] 좀 보여 주세요.', '메뉴판', ['메뉴판을','메뉴판을 좀 보여 주세요','메뉴 좀 보여 주세요','메뉴']],
  ['I prefer the window seat.', '저는 [] 자리가 더 좋아요.', '창가', ['창가 자리','저는 창가 쪽 자리가 더 좋아요','창가 자리가 더 좋아요']],
  ['Where is the exit?', '[]가 어디예요?', '출구', ['출구가','출구는 어디예요','출구가 어디에요']],
  ['I need a charger.', '[]가 필요해요.', '충전기', ['충전기가','충전기 필요해요']],
  ['Two tickets, please.', '[] 두 장 주세요.', '표', ['표를','표를 두 장 주세요','티켓','티켓 두 장 주세요']],
  ['There is a pharmacy nearby.', '근처에 []이 있어요.', '약국', ['약국이','근처에 약국 있어요']],
  ['Please open the window.', '[]을 열어 주세요.', '창문', ['창문을','창문 좀 열어 주세요','창문 열어 주세요']],
  ['What time is the last train?', '[]가 몇 시예요?', '막차', ['막차가','막차는 몇 시예요','막차가 몇 시에요']],
  ['May I take a photo?', '[]을 찍어도 돼요?', '사진', ['사진을','사진 찍어도 돼요','사진을 찍어도 되나요']]
];
export const vocabulary = prompts.map(([meaning, frame, word, accepted]) => {
  const [before, after] = frame.split('[]');
  return {meaning, before, after, word, sentence:before + word + after, accepted:[word, ...accepted]};
});

const dailyCount = 3;
function localDay(time) {
  const date = new Date(time);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

export class DailyVocabulary {
  constructor(storage, user, clock = Date.now) {
    this.storage = storage;
    this.key = 'sori:vocabulary:v1:' + (user || 'device');
    this.clock = clock;
    try { this.state = JSON.parse(storage.getItem(this.key)); } catch {}
    this.today();
  }
  save() {
    try { this.storage.setItem(this.key, JSON.stringify(this.state)); } catch {}
  }
  today() {
    const day = localDay(this.clock());
    const anchor = this.state?.anchor;
    const firstDay = Number.isSafeInteger(anchor) && anchor >= 0 && anchor <= day ? anchor : day;
    if (this.state?.day !== day || anchor !== firstDay || !Number.isInteger(this.state.index) ||
        this.state.index < 0 || this.state.index > dailyCount) {
      this.state = {anchor:firstDay, day, index:0};
      this.save();
    }
    const start = (day - firstDay) * dailyCount;
    const words = Array.from({length:dailyCount}, (_, i) => vocabulary[(start + i) % vocabulary.length]);
    return {words, index:this.state.index, day};
  }
  setIndex(index, day) {
    if (this.today().day !== day) return;
    this.state.index = Math.max(0, Math.min(dailyCount, index));
    this.save();
  }
}
