<!-- travel.js -->
(function () {
  window.SORI_DATA = window.SORI_DATA || {};

  // 기본 세트
  const travelBase = [
    {t:'Airport',c:'Tourism',k:'관광하러 왔습니다.',e:'I am here for tourism',p:'gwangwanghareo wasseumnida',sub:'Airport'},
    {t:'Airport',c:'One week',k:'일주일 머물 예정입니다.',e:'I will stay for one week',p:'iljuil meomul yejeongimnida',sub:'Airport'},
    {t:'Airport',c:'Lost baggage',k:'수하물이 안 나왔어요.',e:'My baggage did not come out',p:'suhamuri an nawasseoyo',sub:'Airport'},
    {t:'Airport',c:'Airport bus',k:'공항버스는 어디에서 타요?',e:'Where do I take the airport bus?',p:'gonghang beoseuneun eodieseo tayo',sub:'Airport'},
    {t:'Airport',c:'Exchange',k:'환전은 어디서 해요?',e:'Where can I exchange money?',p:'hwanjeoneun eodiseo haeyo',sub:'Airport'},

    {t:'Hotel',c:'Check in',k:'예약했어요. 체크인 하고 싶어요.',e:'I have a reservation. I want to check in',p:'yeyakhaesseoyo. chekeuinhago sipeoyo',sub:'Hotel'},
    {t:'Hotel',c:'WiFi',k:'와이파이 비밀번호가 뭐예요?',e:'What is the WiFi password?',p:'waipai bimilbeonhoga mwoyeyo',sub:'Hotel'},
    {t:'Hotel',c:'Towels',k:'수건을 더 가져다 주세요.',e:'Please bring more towels',p:'sugeoneul deo gajyeoda juseyo',sub:'Hotel'},
    {t:'Hotel',c:'No hot water',k:'온수가 나오지 않아요.',e:'There is no hot water',p:'onsuga naoji anayo',sub:'Hotel'},
    {t:'Hotel',c:'Check out',k:'체크아웃은 몇 시예요?',e:'What time is check out?',p:'chekeuauseun myeot siyeyo',sub:'Hotel'},

    {t:'Transport',c:'Subway',k:'지하철역이 어디예요?',e:'Where is the subway station?',p:'jihacheol yeogi eodiyeyo',sub:'Transport'},
    {t:'Transport',c:'Direction',k:'이쪽으로 쭉 가세요.',e:'Go straight this way',p:'ijjogeuro jjuk gaseyo',sub:'Transport'},
    {t:'Transport',c:'Transfer',k:'여기서 갈아타야 해요.',e:'I need to transfer here',p:'yeogiseo garataya haeyo',sub:'Transport'},
    {t:'Transport',c:'Last train',k:'막차가 몇 시예요?',e:'What time is the last train?',p:'makchaga myeot siyeyo',sub:'Transport'},
    {t:'Transport',c:'Top up card',k:'교통카드 충전하고 싶어요.',e:'I want to top up my transit card',p:'gyotong kadeu chungjeonhago sipeoyo',sub:'Transport'},

    {t:'Emergency',c:'Help',k:'도와주세요!',e:'Please help me!',p:'dowajuseyo',sub:'Emergency'},
    {t:'Emergency',c:'Police',k:'경찰을 불러 주세요.',e:'Call the police, please',p:'gyeongchareul bulleo juseyo',sub:'Emergency'},
    {t:'Emergency',c:'Hospital',k:'병원에 가야 해요.',e:'I need to go to a hospital',p:'byeongwone gaya haeyo',sub:'Emergency'},
    {t:'Emergency',c:'Lost wallet',k:'지갑을 잃어버렸어요.',e:'I lost my wallet',p:'jigabeul ileobeoryeosseoyo',sub:'Emergency'},
    {t:'Emergency',c:'Lost',k:'길을 잃었어요.',e:'I am lost',p:'gireul ilheosseoyo',sub:'Emergency'}, /* ← 쉼표 잊지마! */

    {t:'Convenience',c:'Buy water',k:'생수 한 병 주세요.',e:'One bottle of water please',p:'saengsu han byeong juseyo',sub:'Convenience'},
    {t:'Convenience',c:'Microwave',k:'이거 데워 주실 수 있어요?',e:'Can you heat this up?',p:'igeo dewo jusil su isseoyo',sub:'Convenience'},
    {t:'Convenience',c:'T-money',k:'티머니 카드 여기서 살 수 있어요?',e:'Can I buy a T-money card here?',p:'timoni kadeu yeogiseo sal su isseoyo',sub:'Convenience'},
    {t:'Convenience',c:'Top up',k:'충전도 가능해요?',e:'Can I top it up here?',p:'chungjeondo ganeunghaeyo',sub:'Convenience'},
    {t:'Convenience',c:'Utensils',k:'일회용 수저 좀 주세요.',e:'Disposable spoon and chopsticks please',p:'ilhoyeong sujeo jom juseyo',sub:'Convenience'},

    {t:'Street Food',c:'Order skewers',k:'어묵 두 꼬치 주세요.',e:'Two fish cake skewers please',p:'eomuk du kkochi juseyo',sub:'Street Food'},
    {t:'Street Food',c:'Sugar level',k:'설탕은 적게 넣어 주세요.',e:'Please add less sugar',p:'seoltangeun jeokge neo-eo juseyo',sub:'Street Food'},
    {t:'Street Food',c:'Spicy tteokbokki',k:'덜 매운 떡볶이 있어요?',e:'Do you have less spicy tteokbokki?',p:'deol maeun tteokbokki isseoyo',sub:'Street Food'},
    {t:'Street Food',c:'To go pack',k:'포장 용기로 부탁해요.',e:'Please pack it to go',p:'pojang yonggiro butakaeyo',sub:'Street Food'},
    {t:'Street Food',c:'Pay now',k:'지금 계산할게요.',e:'I will pay now',p:'jigeum gyesanhalgeyo',sub:'Street Food'},

    {t:'Market',c:'Sample',k:'맛 좀 봐도 돼요?',e:'May I taste a sample?',p:'mat jom bwado dwaeyo',sub:'Market'},
    {t:'Market',c:'Half kilo',k:'반 근만 주세요.',e:'Half a geun please',p:'ban geunman juseyo',sub:'Market'},
    {t:'Market',c:'Fresh today',k:'오늘 들어온 건가요?',e:'Is this fresh today?',p:'oneul deureoon geongayo',sub:'Market'},
    {t:'Market',c:'Bargain',k:'조금만 깎아 주실 수 있나요?',e:'Could you lower the price a little?',p:'jogeumman kkakka jusil su innayo',sub:'Market'},
    {t:'Market',c:'Bag',k:'봉투 필요해요.',e:'I need a bag',p:'bongtu piryohaeyo',sub:'Market'},

    {t:'Duty Free',c:'Passport check',k:'여권 보여드릴게요.',e:'I will show my passport',p:'yeogwon boyeodeurilgeyo',sub:'Duty Free'},
    {t:'Duty Free',c:'Tax refund desk',k:'택스 리펀드는 어디에서 해요?',e:'Where is the tax refund desk?',p:'taekseu ripeondeuneun eodieseo haeyo',sub:'Duty Free'},

    {t:'Department',c:'Cosmetics tester',k:'테스터 사용해 봐도 될까요?',e:'May I try the tester?',p:'teseuteo sayonghae bwado doelkkayo',sub:'Department'},
    {t:'Department',c:'Exchange size',k:'사이즈 교환 가능해요?',e:'Can I exchange for a different size?',p:'saijeu gyohwan ganeunghaeyo',sub:'Department'},
    {t:'Department',c:'Gift wrap',k:'선물 포장 가능할까요?',e:'Can you gift wrap it?',p:'seonmul pojang ganeunhalkkayo',sub:'Department'},

    {t:'Food Court',c:'Find seat',k:'자리 먼저 잡고 주문하나요?',e:'Do we get seats first then order?',p:'jari meonjeo japgo jumunhanayo',sub:'Food Court'},
    {t:'Food Court',c:'Buzzer',k:'진동벨 받았어요.',e:'I received the buzzer',p:'jindongbel badasseoyo',sub:'Food Court'},
    {t:'Food Court',c:'Pick up',k:'어디서 받아가요?',e:'Where do I pick it up?',p:'eodiseo badagayo',sub:'Food Court'},

    {t:'Restaurant',c:'Wait list',k:'웨이팅 명단에 올려 주세요.',e:'Please put me on the waiting list',p:'weiting myeongdane ollyeo juseyo',sub:'Restaurant'},
    {t:'Restaurant',c:'Share dish',k:'이거 같이 나눠 먹어도 돼요?',e:'Can we share this dish?',p:'igeo gachi nanwo meogeodo dwaeyo',sub:'Restaurant'},
    {t:'Restaurant',c:'Refill water',k:'물은 셀프인가요?',e:'Is water self serve?',p:'mureun selpeu ingayo',sub:'Restaurant'},
    {t:'Restaurant',c:'Extra side',k:'김치 조금 더 주실 수 있나요?',e:'May I have a bit more kimchi?',p:'gimchi jogeum deo jusil su innayo',sub:'Restaurant'},
    {t:'Restaurant',c:'No pork',k:'돼지고기 빼 주세요.',e:'Please remove pork',p:'dwaejigogi ppae juseyo',sub:'Restaurant'},
    {t:'Restaurant',c:'Halal',k:'할랄 메뉴 있나요?',e:'Do you have halal menu?',p:'hallal menyu innayo',sub:'Restaurant'},
    {t:'Restaurant',c:'Vegan',k:'비건 메뉴도 있나요?',e:'Do you have vegan menu?',p:'bigeon menyudo innayo',sub:'Restaurant'},
    {t:'Restaurant',c:'Allergy check',k:'이 음식에 땅콩 들어가요?',e:'Does this dish contain peanuts?',p:'i eumsige ttangkong deureogayo',sub:'Restaurant'},
    {t:'Restaurant',c:'Less salt',k:'짜지 않게 부탁해요.',e:'Please make it less salty',p:'jjaji anke butakaeyo',sub:'Restaurant'},
    {t:'Restaurant',c:'Separate bill',k:'각자 계산할게요.',e:'We will pay separately',p:'gakja gyesanhalgeyo',sub:'Restaurant'},
    {t:'Restaurant',c:'Take leftovers',k:'남은 음식 포장해 주세요.',e:'Please pack the leftovers',p:'nameun eumsik pojanghae juseyo',sub:'Restaurant'},

    {t:'Cafe',c:'Less ice',k:'얼음은 조금만 넣어 주세요.',e:'Less ice please',p:'eoreumeun jogeumman neo-eo juseyo',sub:'Cafe'},
    {t:'Cafe',c:'Syrup',k:'시럽은 빼 주세요.',e:'Please hold the syrup',p:'sireobeun ppae juseyo',sub:'Cafe'},
    {t:'Cafe',c:'Milk choice',k:'두유로 바꿔 주세요.',e:'Please switch to soy milk',p:'duyuro bakkwo juseyo',sub:'Cafe'},
    {t:'Cafe',c:'Name',k:'이름은 Lucia로 적어 주세요.',e:'Please write the name Lucia',p:'ireumeun Lucia-ro jeogeo juseyo',sub:'Cafe'},
    {t:'Cafe',c:'Receipt need',k:'영수증 필요해요.',e:'I need the receipt',p:'yeongsujeung piryohaeyo',sub:'Cafe'},

    {t:'Payment',c:'No tip',k:'팁 문화가 없죠?',e:'There is no tipping culture, right?',p:'tib munhwaga eopjyo',sub:'Payment'},
    {t:'Payment',c:'Mobile pay',k:'간편결제 가능해요?',e:'Do you take mobile pay?',p:'ganpyeon gyeolje ganeunghaeyo',sub:'Payment'},
    {t:'Payment',c:'Split evenly',k:'N분의 1로 계산해 주세요.',e:'Please split evenly',p:'en bune il-lo gyesanhae juseyo',sub:'Payment'},
    {t:'Payment',c:'Prepay',k:'선결제해야 하나요?',e:'Do we pay first?',p:'seongyeolje haeya hanayo',sub:'Payment'},

    {t:'Delivery',c:'App help',k:'배달 앱 주문 도와주실래요?',e:'Could you help me order on the delivery app?',p:'baedal aep jumun dowajusillaeyo',sub:'Delivery'},

    {t:'Sightseeing',c:'Food alley',k:'맛집 골목이 어디예요?',e:'Where is the food alley?',p:'matjib golmogi eodiyeyo',sub:'Sightseeing'},
    {t:'Sightseeing',c:'Opening day',k:'오늘 영업하나요?',e:'Are you open today?',p:'oneul yeongeop hanayo',sub:'Sightseeing'},
    {t:'Sightseeing',c:'Queue time',k:'대기 시간이 얼마나 걸려요?',e:'How long is the wait?',p:'daegi sigani eolmana geollyeoyo',sub:'Sightseeing'}
  ];

  // 추가 세트 (필요 시 확장)
  const travelPlus = [
    // 예: {t:'Transport', c:'Bike', k:'자전거 대여소 어디예요?', e:'Where is the bike rental?', p:'jajeongeo daeyeoso eodiyeyo', sub:'Transport'},
    {"t": "Airport", "c": "Connecting flight", "k": "환승하려면 수하물을 다시 찾아서 부쳐야 하나요?", "e": "Do I need to collect and check my baggage again for my connection?", "p": "hwanseungharyeomyeon suhamureul dasi chajaseo buchyeoya hanayo?", "sub": "Airport", "level": "nuance"},
    {"t": "Hotel", "c": "Early check-in", "k": "체크인 시간 전에 도착할 예정인데 짐을 맡길 수 있을까요?", "e": "I expect to arrive before check-in. Could you store my luggage?", "p": "chekeuin sigan jeone dochakhal yejeonginde jimeul matgil su isseulkkayo?", "sub": "Hotel", "level": "nuance"},
    {"t": "Transport", "c": "Find a route", "k": "환승을 한 번만 하고 갈 수 있는 방법이 있을까요?", "e": "Is there a way to get there with just one transfer?", "p": "hwanseungeul han beonman hago gal su inneun bangbeobi isseulkkayo?", "sub": "Transport", "level": "nuance"},
    {"t": "Emergency", "c": "Lost document", "k": "여권을 잃어버렸는데 가까운 대사관에 가려면 어떻게 해야 하나요?", "e": "I lost my passport. How do I get to the nearest embassy?", "p": "yeogwoneul ireobeoryeonneunde gakkaun daesagwane garyeomyeon eotteoke haeya hanayo?", "sub": "Emergency", "level": "nuance"},
    {"t": "Convenience", "c": "Payment question", "k": "교통카드로 결제하면 나머지는 현금으로 내도 되나요?", "e": "If I pay with my transit card, can I pay the rest in cash?", "p": "gyotongkadeuro gyeoljehamyeon nameojineun hyeongeumeuro naedo doenayo?", "sub": "Convenience", "level": "nuance"},
    {"t": "Street Food", "c": "Explain preference", "k": "매운 양념을 따로 담아 주시면 제가 조금씩 넣을게요.", "e": "If you put the spicy sauce separately, I will add a little at a time.", "p": "maeun yangnyeomeul ttaro dama jusimyeon jega jogeumssik neoeulgeyo.", "sub": "Street Food", "level": "nuance"},
    {"t": "Market", "c": "Ask about freshness", "k": "오늘 들어온 물건 중에서 가장 신선한 걸 추천해 주세요.", "e": "Please recommend the freshest item that arrived today.", "p": "oneul deureoon mulgeon jungeseo gajang sinseonhan geol chucheonhae juseyo.", "sub": "Market", "level": "nuance"},
    {"t": "Duty Free", "c": "Eligibility", "k": "출국 당일에 면세품을 수령하려면 어디로 가야 하나요?", "e": "Where do I go to collect duty-free items on departure day?", "p": "chulguk dangire myeonsepumeul suryeongharyeomyeon eodiro gaya hanayo?", "sub": "Duty Free", "level": "nuance"},
    {"t": "Department", "c": "Find a product", "k": "이 제품이 다른 지점에 재고가 있는지 확인해 주실 수 있나요?", "e": "Could you check whether this product is in stock at another branch?", "p": "i jepumi dareun jijeome jaegoga inneunji hwaginhae jusil su innayo?", "sub": "Department", "level": "nuance"},
    {"t": "Food Court", "c": "Ordering procedure", "k": "주문한 음식이 준비되면 어디에서 받아 가면 되나요?", "e": "Where should I pick up my food when it is ready?", "p": "jumunhan eumsigi junbidoemyeon eodieseo bada gamyeon doenayo?", "sub": "Food Court", "level": "nuance"},
    {"t": "Restaurant", "c": "Allergy communication", "k": "알레르기가 있어서 조리할 때도 땅콩을 사용하지 않았으면 해요.", "e": "I have an allergy, so I would prefer peanuts not to be used in preparation either.", "p": "allereugiga isseoseo jorihal ttaedo ttangkong-eul sayonghaji anasseumyeon haeyo.", "sub": "Restaurant", "level": "nuance"},
    {"t": "Cafe", "c": "Adjust a drink", "k": "디카페인으로 변경하면 추가 요금이 발생하나요?", "e": "Is there an extra charge if I change it to decaf?", "p": "dikapeineuro byeongyeonghamyeon chuga yogeumi balsaenghanayo?", "sub": "Cafe", "level": "nuance"},
    {"t": "Payment", "c": "Payment method", "k": "일부는 카드로 결제하고 나머지는 현금으로 내도 될까요?", "e": "Could I pay part by card and the rest in cash?", "p": "ilbuneun kadeuro gyeoljehago nameojineun hyeongeumeuro naedo doelkkayo?", "sub": "Payment", "level": "nuance"},
    {"t": "Delivery", "c": "Delivery instructions", "k": "호텔 로비에 도착하시면 프런트에 맡겨 주시면 감사하겠습니다.", "e": "When you arrive at the hotel lobby, I would appreciate it if you left it at reception.", "p": "hotel robie dochakhasimyeon peureonteue matgyeo jusimyeon gamsahagetseumnida.", "sub": "Delivery", "level": "nuance"},
    {"t": "Sightseeing", "c": "Check admission", "k": "오늘 관람하려면 사전에 예약해야 하는지 궁금해요.", "e": "I wonder whether I need to book in advance to visit today.", "p": "oneul gwallamharyeomyeon sajeone yeyakhaeya haneunji gunggeumhaeyo.", "sub": "Sightseeing", "level": "nuance"},
    {"t": "Airport", "c": "Passport", "k": "여권이에요.", "e": "Here is my passport.", "p": "yeogwonieyo.", "sub": "Airport", "level": "essentials"},
    {"t": "Hotel", "c": "Room key", "k": "방 열쇠 주세요.", "e": "Room key, please.", "p": "bang yeolsoe juseyo.", "sub": "Hotel", "level": "essentials"},
    {"t": "Transport", "c": "This way", "k": "이쪽이에요?", "e": "Is it this way?", "p": "ijjogieyo?", "sub": "Transport", "level": "essentials"},
    {"t": "Convenience", "c": "Bag", "k": "봉투 주세요.", "e": "A bag, please.", "p": "bongtu juseyo.", "sub": "Convenience", "level": "essentials"},
    {"t": "Street Food", "c": "One portion", "k": "일 인분 주세요.", "e": "One serving, please.", "p": "il inbun juseyo.", "sub": "Street Food", "level": "essentials"},
    {"t": "Duty Free", "c": "Show passport", "k": "여기요.", "e": "Here you are.", "p": "yeogiyo.", "sub": "Duty Free", "level": "essentials"},
    {"t": "Department", "c": "Try it", "k": "써 봐도 돼요?", "e": "May I try it?", "p": "sseo bwado dwaeyo?", "sub": "Department", "level": "essentials"},
    {"t": "Food Court", "c": "Order", "k": "이거 주세요.", "e": "This one, please.", "p": "igeo juseyo.", "sub": "Food Court", "level": "essentials"},
    {"t": "Restaurant", "c": "More rice", "k": "밥 더 주세요.", "e": "More rice, please.", "p": "bap deo juseyo.", "sub": "Restaurant", "level": "essentials"},
    {"t": "Cafe", "c": "Hot drink", "k": "따뜻하게 주세요.", "e": "Hot, please.", "p": "ttatteuthage juseyo.", "sub": "Cafe", "level": "essentials"},
    {"t": "Delivery", "c": "Name", "k": "제 이름이에요.", "e": "That is my name.", "p": "je ireumieyo.", "sub": "Delivery", "level": "essentials"},
    {"t": "Sightseeing", "c": "Ticket", "k": "표 한 장 주세요.", "e": "One ticket, please.", "p": "pyo han jang juseyo.", "sub": "Sightseeing", "level": "essentials"},

    {"id": "scene:taxi-ride:1", "t": "Transport", "c": "Get home in a taxi", "k": "서울역으로 가 주세요.", "e": "Please take me to Seoul Station.", "p": "seoullyeogeuro ga juseyo.", "sub": "Transport", "level": "essentials"},
    {"id": "scene:taxi-ride:2", "t": "Transport", "c": "Get home in a taxi", "k": "가방 하나 있어요.", "e": "I have one bag.", "p": "gabang hana isseoyo.", "sub": "Transport", "level": "essentials"},
    {"id": "scene:taxi-ride:3", "t": "Transport", "c": "Get home in a taxi", "k": "여기서 내릴게요.", "e": "I'll get out here.", "p": "yeogiseo naerilgeyo.", "sub": "Transport", "level": "essentials"},
    {"id": "scene:museum-gallery:1", "t": "Sightseeing", "c": "See a special exhibition", "k": "도자기 전시를 보러 왔어요.", "e": "I came to see the pottery exhibition.", "p": "dojagi jeonsireul boreo wasseoyo.", "sub": "Sightseeing", "level": "intermediate"},
    {"id": "scene:museum-gallery:2", "t": "Sightseeing", "c": "See a special exhibition", "k": "해설은 얼마나 걸려요?", "e": "How long does the gallery talk last?", "p": "haeseoreun eolmana geollyeoyo?", "sub": "Sightseeing", "level": "intermediate"},
    {"id": "scene:museum-gallery:3", "t": "Sightseeing", "c": "See a special exhibition", "k": "여기에서 사진을 찍어도 돼요?", "e": "May I take pictures here?", "p": "yeogieseo sajineul jjigeodo dwaeyo?", "sub": "Sightseeing", "level": "intermediate"},
    {"id": "scene:railway-station:1", "t": "Transport", "c": "Find the right train seat", "k": "부산 가는 다음 열차로 주세요.", "e": "I'd like the next train to Busan.", "p": "busan ganeun daeum yeolcharo juseyo.", "sub": "Transport", "level": "intermediate"},
    {"id": "scene:railway-station:2", "t": "Transport", "c": "Find the right train seat", "k": "통로 쪽 자리로 부탁드려요.", "e": "An aisle seat, please.", "p": "tongno jjok jariro butakdeuryeoyo.", "sub": "Transport", "level": "intermediate"},
    {"id": "scene:railway-station:3", "t": "Transport", "c": "Find the right train seat", "k": "몇 번 승강장으로 가면 돼요?", "e": "Which platform should I go to?", "p": "myeot beon seunggangjangeuro gamyeon dwaeyo?", "sub": "Transport", "level": "intermediate"},
    {"id": "scene:lost-and-found:1", "t": "Emergency", "c": "Identify a lost bag", "k": "남색 배낭인데 손잡이에 열쇠고리가 달려 있어요.", "e": "It's a navy backpack with a key ring on the handle.", "p": "namsaek baenanginde sonjabie yeolsoegoriga dallyeo isseoyo.", "sub": "Emergency", "level": "nuance"},
    {"id": "scene:lost-and-found:2", "t": "Emergency", "c": "Identify a lost bag", "k": "기차를 기다리다가 벤치에 두고 온 것 같아요.", "e": "I think I left it on a bench while I was waiting for the train.", "p": "gichareul gidaridaga benchie dugo on geot gatayo.", "sub": "Emergency", "level": "nuance"},
    {"id": "scene:lost-and-found:3", "t": "Emergency", "c": "Identify a lost bag", "k": "혹시 들어오면 이 번호로 연락 주시겠어요?", "e": "If it turns up, could you contact me at this number?", "p": "hoksi deureoomyeon i beonhoro yeollak jusigesseoyo?", "sub": "Emergency", "level": "nuance"},
    {"id": "scene:guesthouse-desk:1", "t": "Hotel", "c": "Change a guesthouse reservation", "k": "일정이 바뀌어서 하룻밤 더 묵고 싶은데요.", "e": "My plans changed and I'd like to stay one more night.", "p": "iljeongi bakkwieoseo harutbam deo mukgo sipeundeyo.", "sub": "Hotel", "level": "nuance"},
    {"id": "scene:guesthouse-desk:2", "t": "Hotel", "c": "Change a guesthouse reservation", "k": "방을 옮기면 연장이 가능할까요?", "e": "Could I extend my stay if I move rooms?", "p": "bangeul omgimyeon yeonjangi ganeunghalkkayo?", "sub": "Hotel", "level": "nuance"},
    {"id": "scene:guesthouse-desk:3", "t": "Hotel", "c": "Change a guesthouse reservation", "k": "방이 준비될 때까지 짐을 맡겨도 될까요?", "e": "Could I leave my luggage here until the room is ready?", "p": "bangi junbidoel ttaekkaji jimeul matgyeodo doelkkayo?", "sub": "Hotel", "level": "nuance"},
    {"id": "scene:bike-rental:1", "t": "Transport", "c": "Resolve a bike rental problem", "k": "출발한 지 얼마 안 돼서 체인이 빠졌어요.", "e": "The chain came off shortly after I set off.", "p": "chulbalhan ji eolma an dwaeseo cheini ppajyeosseoyo.", "sub": "Transport", "level": "nuance"},
    {"id": "scene:bike-rental:2", "t": "Transport", "c": "Resolve a bike rental problem", "k": "안장을 아까 타던 것과 같은 높이로 맞춰 주세요.", "e": "Please set the saddle at the same height as the one I was riding.", "p": "anjangeul akka tadeon geotgwa gateun nopiro matchwo juseyo.", "sub": "Transport", "level": "nuance"},
    {"id": "scene:bike-rental:3", "t": "Transport", "c": "Resolve a bike rental problem", "k": "그만큼 반납 시간도 늦춰 주실 수 있을까요?", "e": "Could you move my return time back by the same amount?", "p": "geumankeum bannap sigando neutchwo jusil su isseulkkayo?", "sub": "Transport", "level": "nuance"},
    {"id": "scene:craft-market:1", "t": "Market", "c": "Order a handmade gift", "k": "진열된 것과 같은 무늬로 조금 더 밝은 색을 찾고 있어요.", "e": "I'm looking for the same pattern as the one on display, in a slightly lighter color.", "p": "jinyeoldoen geotgwa gateun munuiro jogeum deo balgeun saegeul chatgo isseoyo.", "sub": "Market", "level": "nuance"},
    {"id": "scene:craft-market:2", "t": "Market", "c": "Order a handmade gift", "k": "완성되면 집으로 보내 주실 수 있을까요?", "e": "Could you send it to my home once it's finished?", "p": "wanseongdoemyeon jibeuro bonae jusil su isseulkkayo?", "sub": "Market", "level": "nuance"},
    {"id": "scene:craft-market:3", "t": "Market", "c": "Order a handmade gift", "k": "선물이라 가격이 적힌 건 빼 주시면 좋겠어요.", "e": "It's a gift, so I'd like you to leave out anything that shows the price.", "p": "seonmurira gagyeogi jeokin geon ppae jusimyeon jokesseoyo.", "sub": "Market", "level": "nuance"},
    {"id": "scene:tour-desk:1", "t": "Sightseeing", "c": "Adapt a walking tour", "k": "일행 중에 계단을 오르기 힘든 분이 계세요.", "e": "Someone in our group has difficulty climbing stairs.", "p": "ilhaeng junge gyedaneul oreugi himdeun buni gyeseyo.", "sub": "Sightseeing", "level": "nuance"},
    {"id": "scene:tour-desk:2", "t": "Sightseeing", "c": "Adapt a walking tour", "k": "그쪽으로 돌아가면 시간이 얼마나 더 걸릴까요?", "e": "How much longer would it take if we went that way?", "p": "geujjogeuro doragamyeon sigani eolmana deo geollilkkayo?", "sub": "Sightseeing", "level": "nuance"},
    {"id": "scene:tour-desk:3", "t": "Sightseeing", "c": "Adapt a walking tour", "k": "두 길이 만나는 지점을 지도에 표시해 주시겠어요?", "e": "Could you mark on the map where the two paths meet?", "p": "du giri mannaneun jijeomeul jidoe pyosihae jusigesseoyo?", "sub": "Sightseeing", "level": "nuance"},
];

  // 합치기
  window.SORI_DATA.travel = (window.SORI_DATA.travel || []).concat(travelBase, travelPlus);
  window.SORI_DATA.travel.push(
    {"id": "scene:station-locker:1", "t": "Luggage", "c": "Leave a bag in a station locker", "k": "물품 보관함은 어디예요?", "e": "Where are the lockers?", "p": "mulpum bogwanhameun eodiyeyo?", "sub": "Luggage", "level": "essentials"},
    {"id": "scene:station-locker:2", "t": "Luggage", "c": "Leave a bag in a station locker", "k": "큰 칸이 필요해요.", "e": "I need a large compartment.", "p": "keun kani piryohaeyo.", "sub": "Luggage", "level": "essentials"},
    {"id": "scene:station-locker:3", "t": "Luggage", "c": "Leave a bag in a station locker", "k": "카드로 낼게요.", "e": "I'll pay by card.", "p": "kadeuro naelgeyo.", "sub": "Luggage", "level": "essentials"},
    {"id": "scene:photo-walk:1", "t": "Photography", "c": "Ask someone to take your photo", "k": "친구랑 같이 찍어 주세요.", "e": "Please take a photo of me with my friend.", "p": "chingurang gachi jjigeo juseyo.", "sub": "Photography", "level": "essentials"},
    {"id": "scene:photo-walk:2", "t": "Photography", "c": "Ask someone to take your photo", "k": "가로로 찍어 주세요.", "e": "Please take it horizontally.", "p": "garoro jjigeo juseyo.", "sub": "Photography", "level": "essentials"},
    {"id": "scene:photo-walk:3", "t": "Photography", "c": "Ask someone to take your photo", "k": "잘 나왔어요. 감사합니다.", "e": "It turned out well. Thank you.", "p": "jal nawasseoyo. gamsahamnida.", "sub": "Photography", "level": "essentials"},
    {"id": "scene:bus-stop-question:1", "t": "Bus travel", "c": "Choose the right bus stop", "k": "시청까지 가요.", "e": "I'm going to City Hall.", "p": "sicheongkkaji gayo.", "sub": "Bus travel", "level": "essentials"},
    {"id": "scene:bus-stop-question:2", "t": "Bus travel", "c": "Choose the right bus stop", "k": "근처에 횡단보도 있어요?", "e": "Is there a crosswalk nearby?", "p": "geuncheoe hoengdanbodo isseoyo?", "sub": "Bus travel", "level": "essentials"},
    {"id": "scene:bus-stop-question:3", "t": "Bus travel", "c": "Choose the right bus stop", "k": "네, 이제 보여요.", "e": "Yes, I can see it now.", "p": "ne, ije boyeoyo.", "sub": "Bus travel", "level": "essentials"},
    {"id": "scene:ticket-window-ballgame:1", "t": "Sports tickets", "c": "Get seats for a baseball game", "k": "저희 두 명이에요.", "e": "There are two of us.", "p": "jeohui du myeongieyo.", "sub": "Sports tickets", "level": "essentials"},
    {"id": "scene:ticket-window-ballgame:2", "t": "Sports tickets", "c": "Get seats for a baseball game", "k": "붙어 있는 자리 있어요?", "e": "Are there seats together?", "p": "buteo inneun jari isseoyo?", "sub": "Sports tickets", "level": "essentials"},
    {"id": "scene:hanbok-fit:1", "t": "Hanbok rental", "c": "Try on a hanbok before visiting a palace", "k": "연분홍색 치마를 입어 볼게요.", "e": "I'll try on the light pink skirt.", "p": "yeonbunhongsaek chimareul ibeo bolgeyo.", "sub": "Hanbok rental", "level": "intermediate"},
    {"id": "scene:hanbok-fit:2", "t": "Hanbok rental", "c": "Try on a hanbok before visiting a palace", "k": "치마가 바닥에 닿아요.", "e": "The skirt touches the ground.", "p": "chimaga badage daayo.", "sub": "Hanbok rental", "level": "intermediate"},
    {"id": "scene:hanbok-fit:3", "t": "Hanbok rental", "c": "Try on a hanbok before visiting a palace", "k": "몇 시까지 반납해야 해요?", "e": "What time do I have to return it by?", "p": "myeot sikkaji bannaphaeya haeyo?", "sub": "Hanbok rental", "level": "intermediate"},
    {"id": "scene:hiking-gear:1", "t": "Hiking", "c": "Rent hiking boots for a walking route", "k": "등산화를 빌리고 싶어요.", "e": "I'd like to rent hiking boots.", "p": "deungsanhwareul billigo sipeoyo.", "sub": "Hiking", "level": "intermediate"},
    {"id": "scene:hiking-gear:2", "t": "Hiking", "c": "Rent hiking boots for a walking route", "k": "한 치수 큰 걸 신어 봐도 될까요?", "e": "Could I try a pair one size larger?", "p": "han chisu keun geol sineo bwado doelkkayo?", "sub": "Hiking", "level": "intermediate"},
    {"id": "scene:hiking-gear:3", "t": "Hiking", "c": "Rent hiking boots for a walking route", "k": "왔던 길로 돌아올 거예요.", "e": "I'll come back the way I came.", "p": "watdeon gillo doraol geoyeyo.", "sub": "Hiking", "level": "intermediate"},
    {"id": "scene:theater-access:1", "t": "Accessible venues", "c": "Ask about access before booking a play", "k": "계단을 이용하지 않고 좌석까지 갈 수 있을까요?", "e": "Can I get to my seat without using stairs?", "p": "gyedaneul iyonghaji anko jwaseokkkaji gal su isseulkkayo?", "sub": "Accessible venues", "level": "nuance"},
    {"id": "scene:theater-access:2", "t": "Accessible venues", "c": "Ask about access before booking a play", "k": "어느 출입구로 들어가는 게 가장 편할까요?", "e": "Which entrance would be the most convenient to use?", "p": "eoneu churipguro deureoganeun ge gajang pyeonhalkkayo?", "sub": "Accessible venues", "level": "nuance"},
    {"id": "scene:theater-access:3", "t": "Accessible venues", "c": "Ask about access before booking a play", "k": "동행하는 사람도 바로 옆에 앉을 수 있나요?", "e": "Can the person coming with me sit right next to me?", "p": "donghaenghaneun saramdo baro yeope anjeul su innayo?", "sub": "Accessible venues", "level": "nuance"}
  );
  window.SORI_DATA.travel.push(
    {"id":"situations:luggage:intermediate","t":"Luggage","c":"Ask about collecting a suitcase","k":"맡긴 가방을 저녁에 찾아도 될까요?","e":"May I pick up the bag I left here in the evening?","p":"matgin gabangeul jeonyeoge chajado doelkkayo?","sub":"Luggage","level":"intermediate"},
    {"id":"situations:luggage:nuance","t":"Luggage","c":"Change a luggage collection location","k":"일정이 바뀌었는데 짐을 찾을 곳도 변경할 수 있을까요?","e":"My plans have changed. Could I change where I collect my luggage as well?","p":"iljeongi bakkwieonneunde jimeul chajeul gotdo byeongyeonghal su isseulkkayo?","sub":"Luggage","level":"nuance"},
    {"id":"situations:photography:intermediate","t":"Photography","c":"Frame a photo","k":"뒤에 있는 한옥도 나오게 찍어 주세요.","e":"Please take the photo so the hanok behind me is in the frame as well.","p":"dwie inneun hanokdo naoge jjigeo juseyo.","sub":"Photography","level":"intermediate"},
    {"id":"situations:photography:nuance","t":"Photography","c":"Get permission to post a group photo","k":"혹시 사진을 올리는 게 불편하시면 얼굴이 나오지 않게 자를게요.","e":"If you're uncomfortable with me posting the photo, I'll crop your face out.","p":"hoksi sajineul ollineun ge bulpyeonhasimyeon eolguri naoji anke jareulgeyo.","sub":"Photography","level":"nuance"},
    {"id":"situations:bus-travel:intermediate","t":"Bus travel","c":"Check a bus stop announcement","k":"방금 안내한 곳이 다음 정류장이에요?","e":"Was the place just announced the next stop?","p":"banggeum annaehan gosi daeum jeongnyujangieyo?","sub":"Bus travel","level":"intermediate"},
    {"id":"situations:bus-travel:nuance","t":"Bus travel","c":"Ask about a temporary detour","k":"공사 때문에 버스가 돌아간다면 어디에서 내리는 게 가장 가까울까요?","e":"If the bus is taking a detour because of construction, which stop would be closest?","p":"gongsa ttaemune beoseuga doragandamyeon eodieseo naerineun ge gajang gakkaulkkayo?","sub":"Bus travel","level":"nuance"},
    {"id":"situations:sports-tickets:intermediate","t":"Sports tickets","c":"Choose the cheering section","k":"홈팀을 응원하려면 어느 쪽 자리가 좋아요?","e":"Which side is good if I want to cheer for the home team?","p":"homtimeul eungwonharyeomyeon eoneu jjok jariga joayo?","sub":"Sports tickets","level":"intermediate"},
    {"id":"situations:sports-tickets:nuance","t":"Sports tickets","c":"Ask what happens to a ticket when it rains","k":"비 때문에 경기가 취소되면 예매한 표는 어떻게 처리되나요?","e":"If the game is canceled because of rain, what happens to the ticket I booked?","p":"bi ttaemune gyeonggiga chwisodoemyeon yemaehan pyoneun eotteoke cheoridoenayo?","sub":"Sports tickets","level":"nuance"},
    {"id":"situations:hanbok-rental:essentials","t":"Hanbok rental","c":"Ask to rent a hanbok","k":"한복을 빌리고 싶어요.","e":"I'd like to rent a hanbok.","p":"hanbogeul billigo sipeoyo.","sub":"Hanbok rental","level":"essentials"},
    {"id":"situations:hanbok-rental:nuance","t":"Hanbok rental","c":"Ask about adjusting the fit","k":"계단을 오를 때 치마가 걸리지 않도록 길이를 조절해 주실 수 있을까요?","e":"Could you adjust the length so the skirt won't catch when I climb stairs?","p":"gyedaneul oreul ttae chimaga geolliji antorok girireul jojeolhae jusil su isseulkkayo?","sub":"Hanbok rental","level":"nuance"},
    {"id":"situations:hiking:essentials","t":"Hiking","c":"Look for a trailhead","k":"등산로 입구가 어디예요?","e":"Where is the trail entrance?","p":"deungsallo ipguga eodiyeyo?","sub":"Hiking","level":"essentials"},
    {"id":"situations:hiking:nuance","t":"Hiking","c":"Choose a route before sunset","k":"해가 지기 전에 내려오려면 어느 지점에서 돌아서는 게 좋을까요?","e":"Where would be a good place to turn back if I want to be down before sunset?","p":"haega jigi jeone naeryeooryeomyeon eoneu jijeomeseo doraseoneun ge joeulkkayo?","sub":"Hiking","level":"nuance"},
    {"id":"situations:accessible-venues:essentials","t":"Accessible venues","c":"Find a ramp","k":"경사로가 어디 있어요?","e":"Where is the ramp?","p":"gyeongsaroga eodi isseoyo?","sub":"Accessible venues","level":"essentials"},
    {"id":"situations:accessible-venues:intermediate","t":"Accessible venues","c":"Ask about an elevator at the venue","k":"공연장까지 엘리베이터로 갈 수 있나요?","e":"Can I take an elevator to the performance hall?","p":"gongyeonjangkkaji ellibeiteoro gal su innayo?","sub":"Accessible venues","level":"intermediate"}
  );
})();
