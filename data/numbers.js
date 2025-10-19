// data/numbers.js
(function () {
  window.SORI_DATA = window.SORI_DATA || {};

  window.SORI_DATA.numbers = [
    // ---------- Basic Numbers ----------
    {t:'Basic Numbers',c:'Native 1–5',k:'하나, 둘, 셋, 넷, 다섯',e:'One to five (native)',p:'hana, dul, set, net, daseot',sub:'Basic'},
    {t:'Basic Numbers',c:'Native 6–10',k:'여섯, 일곱, 여덟, 아홉, 열',e:'Six to ten (native)',p:'yeoseot, ilgop, yeodeol, ahop, yeol',sub:'Basic'},
    {t:'Basic Numbers',c:'Sino 1–5',k:'일, 이, 삼, 사, 오',e:'One to five (sino)',p:'il, i, sam, sa, o',sub:'Basic'},
    {t:'Basic Numbers',c:'Sino 6–10',k:'육, 칠, 팔, 구, 십',e:'Six to ten (sino)',p:'yuk, chil, pal, gu, sip',sub:'Basic'},
    {t:'Basic Numbers',c:'Tens 10–50',k:'십, 이십, 삼십, 사십, 오십',e:'Ten to fifty',p:'sip, isip, samsip, sasip, osip',sub:'Basic'},
    {t:'Basic Numbers',c:'Tens 60–100',k:'육십, 칠십, 팔십, 구십, 백',e:'Sixty to one hundred',p:'yuksip, chilsip, palsip, gusip, baek',sub:'Basic'},

    // ---------- Everyday Counting ----------
    {t:'Counting',c:'Objects A',k:'사과 한 개',e:'One apple',p:'sagwa han gae',sub:'Counting'},
    {t:'Counting',c:'Objects B',k:'책 두 권',e:'Two books',p:'chaek du gwon',sub:'Counting'},
    {t:'Counting',c:'Objects C',k:'컵 세 개',e:'Three cups',p:'keop se gae',sub:'Counting'},
    {t:'Counting',c:'Objects D',k:'티켓 네 장',e:'Four tickets',p:'tiket ne jang',sub:'Counting'},
    {t:'Counting',c:'Drinks A',k:'아메리카노 한 잔 주세요.',e:'One Americano, please.',p:'amerikano han jan juseyo',sub:'Counting'},
    {t:'Counting',c:'Drinks B',k:'라떼 두 잔 주세요.',e:'Two lattes, please.',p:'latte du jan juseyo',sub:'Counting'},
    {t:'Counting',c:'People A',k:'손님 한 분 오셨어요.',e:'One guest arrived.',p:'sonnim han bun osyeosseoyo',sub:'Counting'},
    {t:'Counting',c:'People B',k:'학생 다섯 명이에요.',e:'There are five students.',p:'haksaeng daseot myeong-ieyo',sub:'Counting'},
    {t:'Counting',c:'Age A',k:'스무 살이에요.',e:'I am twenty years old.',p:'seumu sar-ieyo',sub:'Counting'},
    {t:'Counting',c:'Age B',k:'서른한 살이에요.',e:'I am thirty-one.',p:'seoreunhan sar-ieyo',sub:'Counting'},
    {t:'Counting',c:'Time A',k:'지금 세 시예요.',e:'It is three o’clock.',p:'jigeum se siyeyo',sub:'Counting'},
    {t:'Counting',c:'Time B',k:'네 시 반이에요.',e:'It is four thirty.',p:'ne si ban-ieyo',sub:'Counting'},
    {t:'Counting',c:'Time C',k:'일곱 시 십오 분이에요.',e:'It is 7:15.',p:'ilgop si sibo bun-ieyo',sub:'Counting'},

    // ---------- Dates ----------
    {t:'Dates',c:'Months 1',k:'일월, 이월, 삼월',e:'January, February, March',p:'irwol, iwol, samwol',sub:'Dates'},
    {t:'Dates',c:'Months 2',k:'사월, 오월, 유월',e:'April, May, June',p:'sawol, owol, yuwol',sub:'Dates'},
    {t:'Dates',c:'Months 3',k:'칠월, 팔월, 구월',e:'July, August, September',p:'chirwol, parwol, guwol',sub:'Dates'},
    {t:'Dates',c:'Months 4',k:'시월, 십일월, 십이월',e:'October, November, December',p:'siwol, sibirwol, sibiwol',sub:'Dates'},
    {t:'Dates',c:'Weekdays 1',k:'월요일, 화요일, 수요일',e:'Mon, Tue, Wed',p:'woryoil, hwayoil, suyoil',sub:'Dates'},
    {t:'Dates',c:'Weekdays 2',k:'목요일, 금요일',e:'Thu, Fri',p:'mogyoil, geumyoil',sub:'Dates'},
    {t:'Dates',c:'Weekend',k:'토요일, 일요일',e:'Saturday, Sunday',p:'toyoil, iryoil',sub:'Dates'},
    {t:'Dates',c:'Ordinal 1',k:'첫째 날, 둘째 날',e:'First day, second day',p:'cheotjje nal, duljje nal',sub:'Dates'},
    {t:'Dates',c:'Ordinal 2',k:'셋째 날, 넷째 날',e:'Third day, fourth day',p:'setjje nal, netjje nal',sub:'Dates'},
    {t:'Dates',c:'Date Read A',k:'삼월 오일',e:'March fifth',p:'samwol o-il',sub:'Dates'},
    {t:'Dates',c:'Date Read B',k:'유월 십구일',e:'June nineteenth',p:'yuwol sib-gu-il',sub:'Dates'},
    {t:'Dates',c:'Meeting',k:'금요일 오후 세 시',e:'Friday 3 p.m.',p:'geumyoil ohu se si',sub:'Dates'},
    {t:'Dates',c:'Range A',k:'삼 일 동안',e:'For three days',p:'sam il dongan',sub:'Dates'},
    {t:'Dates',c:'Range B',k:'이 주 뒤에',e:'In two weeks',p:'i ju dwie',sub:'Dates'},
    {t:'Dates',c:'Deadline',k:'십일월 말까지',e:'By end of November',p:'sibirwol malkkaji',sub:'Dates'},

    // ---------- Money ----------
    {t:'Money',c:'Units A',k:'원, 십 원, 백 원',e:'Won, ten won, hundred won',p:'won, sip won, baek won',sub:'Money'},
    {t:'Money',c:'Units B',k:'천 원, 만 원',e:'Thousand, ten thousand',p:'cheon won, man won',sub:'Money'},
    {t:'Money',c:'Large 1',k:'십만, 백만',e:'One hundred thousand, one million',p:'sibman, baengman',sub:'Money'},
    {t:'Money',c:'Large 2',k:'천만, 일 억',e:'Ten million, one hundred million',p:'cheonman, il eok',sub:'Money'},
    {t:'Money',c:'Price A',k:'이천 원이에요.',e:'It is 2,000 won.',p:'icheon won-ieyo',sub:'Money'},
    {t:'Money',c:'Price B',k:'오천오백 원이에요.',e:'It is 5,500 won.',p:'ocheon obaek won-ieyo',sub:'Money'},
    {t:'Money',c:'Price C',k:'만이천 원이에요.',e:'It is 12,000 won.',p:'man icheon won-ieyo',sub:'Money'},
    {t:'Money',c:'Ask Price',k:'이거 얼마예요?',e:'How much is this',p:'igeo eolmayeyo',sub:'Money'},
    {t:'Money',c:'Discount',k:'삼십 퍼센트 할인',e:'Thirty percent off',p:'samsip peosenteu harin',sub:'Money'},
    {t:'Money',c:'Total A',k:'합계 이만 원입니다.',e:'The total is 20,000 won.',p:'hapgye iman won-imnida',sub:'Money'},
    {t:'Money',c:'Total B',k:'사만오천 원입니다.',e:'It is 45,000 won.',p:'saman ocheon won-imnida',sub:'Money'},
    {t:'Money',c:'Cash or Card',k:'현금이에요, 카드예요',e:'Cash or card',p:'hyeongeum-ieyo, kadeu-yeyo',sub:'Money'},
    {t:'Money',c:'Split Bill',k:'각자 계산할게요.',e:'We will split the bill.',p:'gakja gyesan-halgeyo',sub:'Money'},
    {t:'Money',c:'Change',k:'거스름돈 이천 원',e:'Change 2,000 won',p:'geoseureumdon icheon won',sub:'Money'},

    // ---------- Tens & Hundreds ----------
    {t:'Tens & Hundreds',c:'21–25',k:'이십일, 이십이, 이십삼, 이십사, 이십오',e:'Twenty-one to twenty-five',p:'isip-il, isip-i, isip-sam, isip-sa, isip-o',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'26–30',k:'이십육, 이십칠, 이십팔, 이십구, 삼십',e:'Twenty-six to thirty',p:'isip-yuk, isip-chil, isip-pal, isip-gu, samsip',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'31–35',k:'삼십일, 삼십이, 삼십삼, 삼십사, 삼십오',e:'Thirty-one to thirty-five',p:'samsip-il, samsip-i, samsip-sam, samsip-sa, samsip-o',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'36–40',k:'삼십육, 삼십칠, 삼십팔, 삼십구, 사십',e:'Thirty-six to forty',p:'samsip-yuk, samsip-chil, samsip-pal, samsip-gu, sasip',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'41–45',k:'사십일, 사십이, 사십삼, 사십사, 사십오',e:'Forty-one to forty-five',p:'sasip-il, sasip-i, sasip-sam, sasip-sa, sasip-o',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'46–50',k:'사십육, 사십칠, 사십팔, 사십구, 오십',e:'Forty-six to fifty',p:'sasip-yuk, sasip-chil, sasip-pal, sasip-gu, osip',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'60–90',k:'육십, 칠십, 팔십, 구십',e:'Sixty, seventy, eighty, ninety',p:'yuksip, chilsip, palsip, gusip',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'100s',k:'백, 이백, 삼백, 사백, 오백',e:'One to five hundred',p:'baek, ibaek, sambaek, sabaek, obaek',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'600–900',k:'육백, 칠백, 팔백, 구백',e:'Six to nine hundred',p:'yukbaek, chilbaek, palbaek, gubaek',sub:'Tens & Hundreds'},
    {t:'Tens & Hundreds',c:'Thousands',k:'천, 이천, 삼천, 오천, 만',e:'One thousand to ten thousand',p:'cheon, icheon, samcheon, ocheon, man',sub:'Tens & Hundreds'},

    // ---------- Practice Scenes ----------
    {t:'Practice',c:'Shopping A',k:'이거 오천 원이에요.',e:'This is five thousand won.',p:'igeo ocheon won-ieyo',sub:'Practice'},
    {t:'Practice',c:'Shopping B',k:'두 개에 만 원이에요.',e:'Two for ten thousand won.',p:'du gae-e man won-ieyo',sub:'Practice'},
    {t:'Practice',c:'Taxi A',k:'삼천오백 원 나왔어요.',e:'The fare is 3,500 won.',p:'samcheon obaek won nawasseoyo',sub:'Practice'},
    {t:'Practice',c:'Taxi B',k:'이천 원 더 주세요.',e:'Please add two thousand won.',p:'icheon won deo juseyo',sub:'Practice'},
    {t:'Practice',c:'Time Ask',k:'지금 몇 시예요?',e:'What time is it now?',p:'jigeum myeot siyeyo',sub:'Practice'},
    {t:'Practice',c:'Time Answer',k:'여섯 시 오 분이에요.',e:'It is 6:05.',p:'yeoseot si o bun-ieyo',sub:'Practice'},
    {t:'Practice',c:'Countdown',k:'셋, 둘, 하나!',e:'Three, two, one!',p:'set, dul, hana',sub:'Practice'},
    {t:'Practice',c:'Lottery',k:'칠, 팔, 구, 이십일, 삼십이',e:'7, 8, 9, 21, 32',p:'chil, pal, gu, isip-il, samsip-i',sub:'Practice'},
    {t:'Practice',c:'Temperature',k:'오늘은 이십삼 도예요.',e:'It is 23 degrees today.',p:'oneureun isip-sam do-yeyo',sub:'Practice'},
    {t:'Practice',c:'Address',k:'삼층 삼백호예요.',e:'Room 300 on the third floor.',p:'samcheung sambaegho-yeyo',sub:'Practice'}
  ];
})();
