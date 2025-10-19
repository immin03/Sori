// data/trendy.js
(function () {
  window.SORI_DATA = window.SORI_DATA || {};

  window.SORI_DATA.trendy = [
    // Reaction (반응형 표현)
    {t:'Trendy',c:'Reaction',k:'헐!',e:'OMG!',p:'heol',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'말도 안 돼!',e:'No way!',p:'mal-do an-dwae',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'대박이다!',e:'That’s awesome!',p:'dae-bak-i-da',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'쩐다.',e:'That’s sick.',p:'jjeon-da',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'진짜 웃겨!',e:'That’s so funny!',p:'jin-jja ut-gyeo',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'이게 실화야?',e:'Is this real?',p:'i-ge sil-hwa-ya',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'뭐래?',e:'What are you saying?',p:'mwo-rae',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'그치 그치.',e:'Right? Right.',p:'geu-chi geu-chi',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'나도 그래.',e:'Same here.',p:'na-do geu-rae',sub:'Reaction'},
    {t:'Trendy',c:'Reaction',k:'그게 되네?',e:'Oh, that works?',p:'geu-ge dwae-ne',sub:'Reaction'},

    // Emotion (감정)
    {t:'Trendy',c:'Emotion',k:'피곤해 죽겠어.',e:'I’m so tired.',p:'pi-gon-hae juk-ge-sseo',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'귀찮아 죽겠어.',e:'Too lazy to do anything.',p:'gwi-cha-na juk-ge-sseo',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'답답해 미치겠어.',e:'It’s driving me crazy.',p:'dap-dap-hae mi-chi-ge-sseo',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'노답이야.',e:'That’s hopeless.',p:'no-dab-i-ya',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'현타 왔다.',e:'Reality just hit me.',p:'hyeon-ta wat-da',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'킹받네.',e:'So annoying.',p:'king-bad-ne',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'어쩔 수 없지.',e:'It is what it is.',p:'eoj-jeol su eop-ji',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'완전 좋아!',e:'I love it!',p:'wan-jeon jo-a',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'답정너잖아.',e:'You already know the answer.',p:'dap-jeong-neo-ja-na',sub:'Emotion'},
    {t:'Trendy',c:'Emotion',k:'긴장돼.',e:'I’m nervous.',p:'gin-jang-dwae',sub:'Emotion'},

    // Daily Talk (일상 대화)
    {t:'Trendy',c:'Daily Talk',k:'멋지다!',e:'That’s cool!',p:'meot-ji-da',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'짱이다!',e:'That’s awesome!',p:'jjang-i-da',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'오글거려.',e:'So cringe.',p:'o-geul-geo-ryeo',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'노잼이야.',e:'So boring.',p:'no-jaem-i-ya',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'꿀잼이야!',e:'So fun!',p:'kkul-jaem-i-ya',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'미쳤다.',e:'That’s insane.',p:'mi-chyeot-da',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'그건 좀 에바야.',e:'That’s a bit much.',p:'geu-geon jom e-ba-ya',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'너무 오바야.',e:'You’re overreacting.',p:'neo-mu o-ba-ya',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'수상해.',e:'That’s suspicious.',p:'su-sang-hae',sub:'Daily Talk'},
    {t:'Trendy',c:'Daily Talk',k:'진짜야?',e:'Really?',p:'jin-jja-ya',sub:'Daily Talk'},

    // Online (온라인 표현)
    {t:'Trendy',c:'Online',k:'ㅋㅋㅋㅋ',e:'LOL',p:'keu-keu-keu-keu',sub:'Online'},
    {t:'Trendy',c:'Online',k:'ㅠㅠ',e:'Crying face',p:'yu-yu',sub:'Online'},
    {t:'Trendy',c:'Online',k:'개웃겨.',e:'So funny.',p:'gae-ut-gyeo',sub:'Online'},
    {t:'Trendy',c:'Online',k:'진심이야.',e:'For real.',p:'jin-sim-i-ya',sub:'Online'},
    {t:'Trendy',c:'Online',k:'끝도 없어.',e:'It never ends.',p:'kkeut-do eop-seo',sub:'Online'},
    {t:'Trendy',c:'Online',k:'완전 내 얘기야.',e:'So relatable.',p:'wan-jeon nae yae-gi-ya',sub:'Online'},
    {t:'Trendy',c:'Online',k:'그건 니 생각이고~',e:'That’s your opinion.',p:'geu-geon ni saeng-gag-i-go',sub:'Online'},
    {t:'Trendy',c:'Online',k:'레전드다.',e:'That’s legendary.',p:'re-jeon-deu-da',sub:'Online'},
    {t:'Trendy',c:'Online',k:'요즘 유행이야.',e:'It’s trending.',p:'yo-jeum yu-haeng-i-ya',sub:'Online'},
    {t:'Trendy',c:'Online',k:'오늘은 플렉스했어.',e:'I flexed today.',p:'o-neul-eun peul-lek-seu-hae-sseo',sub:'Online'},

    // Support & Life (응원 / 자기관리 / 일상 철학)
    {t:'Trendy',c:'Support & Life',k:'화이팅!',e:'You got this!',p:'hwa-i-ting',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'고생 많았어.',e:'You worked hard.',p:'go-saeng man-at-sseo',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'축하해!',e:'Congrats!',p:'chuk-ha-hae',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'내 잘못이야.',e:'My bad.',p:'nae jal-mo-si-ya',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'미안해.',e:'Sorry.',p:'mi-an-hae',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'고마워!',e:'Thanks!',p:'go-ma-wo',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'같이 가자!',e:'Let’s go together!',p:'ga-chi ga-ja',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'패스할게.',e:'I’ll pass.',p:'pae-seu-hal-ge',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'좋지!',e:'Sure!',p:'jo-chi',sub:'Support & Life'},
    {t:'Trendy',c:'Support & Life',k:'할 수 있다!',e:'I can do it!',p:'hal su it-da',sub:'Support & Life'},

    // Fun (밈스러운 가벼운 표현)
    {t:'Trendy',c:'Fun',k:'현생에 치였어.',e:'Real life hit me.',p:'hyeon-saeng-e chi-yeot-sseo',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'자기관리 중이야.',e:'I’m taking care of myself.',p:'ja-gi-gwan-ri jung-i-ya',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'소확행이야.',e:'Small happiness.',p:'so-hwak-haeng-i-ya',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'오늘도 갓생 살자.',e:'Let’s live productively.',p:'o-neul-do gat-saeng sal-ja',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'번아웃 왔어.',e:'I’m burnt out.',p:'beon-a-ut wat-sseo',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'감정기복 심해.',e:'My mood swings a lot.',p:'gam-jeong-gi-bok sim-hae',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'힐링 중이야.',e:'I’m healing.',p:'hil-ling jung-i-ya',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'킹리적 갓심이야.',e:'Very logical guess.',p:'king-li-jeok gat-sim-i-ya',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'레알이야.',e:'For real.',p:'re-al-i-ya',sub:'Fun'},
    {t:'Trendy',c:'Fun',k:'무야호~',e:'Muu-ya-ho!',p:'mu-ya-ho',sub:'Fun'},
  ];
})();
