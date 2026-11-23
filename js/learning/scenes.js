// Each reply is an exact expression in the Sori lesson collection.
import {placeScenes} from "./place-scenes.js?v=20261123beta";
export const scenes = {
  ...placeScenes,
  "cafe": {
    "title": "Order at a café",
    "role": "Barista",
    "turns": [
      [
        "주문 도와드릴게요. 뭐 드릴까요?",
        "What can I get you?",
        "Order one Americano.",
        "아메리카노 한 잔, 주세요.",
        "Listen for the small pause after 한 잔, the amount you’re ordering.",
        "jumun dowadeurilgeyo. mwo deurilkkayo?",
        [
          "아메리카노 한 잔이요.",
          "아메리카노 한 잔 부탁드려요."
        ]
      ],
      [
        "얼음은 얼마나 넣어 드릴까요?",
        "How much ice would you like?",
        "Ask them to leave out the ice.",
        "얼음은 빼 주세요.",
        "Give 빼 a moment of its own. That’s the word for leaving something out.",
        "eoreumeun eolmana neoeo deurilkkayo?",
        [
          "얼음 빼 주세요.",
          "얼음 없이 주세요."
        ]
      ],
      [
        "드시고 가세요?",
        "Will you be having it here?",
        "Tell the barista you’ll take it to go.",
        "포장할게요.",
        "Try 포장할게요 in one breath. Keep the polite 요 audible at the end.",
        "deusigo gaseyo?",
        [
          "포장해 주세요.",
          "포장 부탁드려요."
        ]
      ]
    ]
  },
  "market": {
    "title": "Try something at a market",
    "role": "Vendor",
    "turns": [
      [
        "오늘 귤이 맛있어요.",
        "The tangerines are good today.",
        "Ask if you can taste one.",
        "맛 좀 봐도 돼요?",
        "Say 맛 좀 together, then listen to how 봐도 돼요 flows.",
        "oneul gyuri masisseoyo.",
        [
          "맛 좀 봐도 될까요?",
          "맛봐도 돼요?"
        ]
      ],
      [
        "하나 드셔 보세요.",
        "Go ahead and try one.",
        "You’d like to buy some. Ask the price.",
        "얼마예요?",
        "Listen for the 예요 at the end of this short question.",
        "hana deusyeo boseyo.",
        [
          "가격이 얼마예요?",
          "얼마인가요?"
        ]
      ],
      [
        "한 봉지에 오천 원이에요. 어떻게 결제하시겠어요?",
        "A bag is 5,000 won. How would you like to pay?",
        "Say you’ll pay by card.",
        "카드로 결제할게요.",
        "Keep 카드로 together. The 로 tells the vendor how you’ll pay.",
        "han bongjie ocheon wonieyo. eotteoke gyeoljehasigesseoyo?",
        [
          "카드로 할게요.",
          "카드로 계산할게요."
        ]
      ]
    ]
  },
  "restaurant": {
    "title": "Sit down for a meal",
    "role": "Server",
    "turns": [
      [
        "몇 분이세요?",
        "How many people?",
        "Ask for a table for two.",
        "두 명이에요.",
        "Listen to the space between 두 and 명이에요, then try them together.",
        "myeot buniseyo?",
        [
          "두 명이요.",
          "두 사람이에요.",
          "둘이요."
        ]
      ],
      [
        "메뉴 보셨어요?",
        "Have you had a look at the menu?",
        "Ask what they recommend.",
        "추천 메뉴가 있나요?",
        "Listen for 메뉴가 before the question 있나요.",
        "menyu bosyeosseoyo?",
        [
          "추천 메뉴가 있어요?",
          "어떤 메뉴를 추천하세요?"
        ]
      ],
      [
        "식사 맛있게 하셨어요?",
        "Did you enjoy your meal?",
        "It’s time to leave. Ask for the bill.",
        "계산서 부탁드려요.",
        "Try it in two parts, 계산서 and 부탁드려요. Then join them.",
        "siksa masitge hasyeosseoyo?",
        [
          "계산서 주세요.",
          "계산서 부탁해요."
        ]
      ]
    ]
  },
  "airport": {
    "title": "Arrive in Korea",
    "role": "Airport officer",
    "turns": [
      [
        "한국에 왜 오셨어요?",
        "Why are you visiting Korea?",
        "Say you are here as a tourist.",
        "관광하러 왔습니다.",
        "Use the formal ending 습니다.",
        "hanguge wae osyeosseoyo?",
        []
      ],
      [
        "얼마나 머무르실 거예요?",
        "How long will you stay?",
        "Say you will stay a week.",
        "일주일 머물 예정입니다.",
        "일주일 means one week.",
        "eolmana meomureusil geoyeyo?",
        []
      ],
      [
        "더 필요한 것이 있으세요?",
        "Do you need anything else?",
        "Ask where to take the airport bus.",
        "공항버스는 어디에서 타요?",
        "어디에서 asks where an action happens.",
        "deo piryohan geosi isseuseyo?",
        []
      ]
    ]
  },
  "hotel": {
    "title": "Check in at a hotel",
    "role": "Receptionist",
    "turns": [
      [
        "어서 오세요. 예약하셨어요?",
        "Welcome. Do you have a booking?",
        "Say you have a booking and want to check in.",
        "예약했어요. 체크인 하고 싶어요.",
        "예약 means reservation.",
        "eoseo oseyo. yeyak hasyeosseoyo?",
        []
      ],
      [
        "객실 안내해 드릴게요.",
        "Let me show you your room.",
        "Ask for the Wi-Fi password.",
        "와이파이 비밀번호가 뭐예요?",
        "비밀번호 means password.",
        "gaeksil annaehae deurilgeyo.",
        []
      ],
      [
        "객실에 필요한 게 있으세요?",
        "Do you need anything for the room?",
        "Ask for more towels.",
        "수건을 더 가져다 주세요.",
        "더 means more.",
        "gaeksire piryohan ge isseuseyo?",
        []
      ]
    ]
  },
  "transport": {
    "title": "Get around by subway",
    "role": "Station attendant",
    "turns": [
      [
        "무엇을 도와드릴까요?",
        "How can I help?",
        "Ask where the subway station is.",
        "지하철역이 어디예요?",
        "역 means station.",
        "mueoseul dowadeurilkkayo?",
        []
      ],
      [
        "교통카드 있으세요?",
        "Do you have a transit card?",
        "Ask to top up your transit card.",
        "교통카드 충전하고 싶어요.",
        "충전 means top up.",
        "gyotongkadeu isseuseyo?",
        []
      ],
      [
        "또 궁금한 점 있으세요?",
        "Anything else you want to know?",
        "Ask when the last train is.",
        "막차가 몇 시예요?",
        "막차 means last train.",
        "tto gunggeumhan jeom isseuseyo?",
        []
      ]
    ]
  },
  "shopping": {
    "title": "Shop for clothes",
    "role": "Shop assistant",
    "turns": [
      [
        "어서 오세요. 편하게 구경하세요.",
        "Welcome. Feel free to look around.",
        "Ask to try it on.",
        "입어봐도 될까요?",
        "입다 means to wear.",
        "eoseo oseyo. pyeonhage gugyeonghaseyo.",
        []
      ],
      [
        "사이즈는 괜찮으세요?",
        "Does the size fit?",
        "Ask for another size.",
        "이거 다른 사이즈 있어요?",
        "다른 means another.",
        "saijeuneun gwaenchaneuseyo?",
        []
      ],
      [
        "결제 도와드릴게요.",
        "I can help you pay.",
        "Ask for a receipt.",
        "영수증 주세요.",
        "영수증 means receipt.",
        "gyeolje dowadeurilgeyo.",
        []
      ]
    ]
  },
  "convenience": {
    "title": "Visit a convenience store",
    "role": "Cashier",
    "turns": [
      [
        "필요하신 거 있으세요?",
        "Do you need anything?",
        "Ask for a bottle of water.",
        "생수 한 병 주세요.",
        "병 is the counter for bottles.",
        "piryohasin geo isseuseyo?",
        []
      ],
      [
        "도시락도 구매하셨네요.",
        "You also bought a lunchbox.",
        "Ask to heat it up.",
        "이거 데워 주실 수 있어요?",
        "데우다 means to heat up.",
        "dosirakdo gumaehasyeonneyo.",
        []
      ],
      [
        "더 필요한 것 있으세요?",
        "Do you need anything else?",
        "Ask for disposable utensils.",
        "일회용 수저 좀 주세요.",
        "수저 refers to eating utensils.",
        "deo piryohan geot isseuseyo?",
        []
      ]
    ]
  },
  "street-food": {
    "title": "Order street food",
    "role": "Vendor",
    "turns": [
      [
        "뭐 드릴까요?",
        "What can I get you?",
        "Order two fish cake skewers.",
        "어묵 두 꼬치 주세요.",
        "꼬치 is a skewer.",
        "mwo deurilkkayo?",
        []
      ],
      [
        "떡볶이도 드릴까요?",
        "Would you like tteokbokki?",
        "Ask for less spicy tteokbokki.",
        "덜 매운 떡볶이 있어요?",
        "덜 means less.",
        "tteokbokkido deurilkkayo?",
        []
      ],
      [
        "드시고 가세요? 포장하세요?",
        "Eat here or take away?",
        "Ask for a takeaway container.",
        "포장 용기로 부탁해요.",
        "포장 means takeaway.",
        "deusigo gaseyo? pojanghaseyo?",
        []
      ]
    ]
  },
  "department": {
    "title": "Visit a department store",
    "role": "Sales assistant",
    "turns": [
      [
        "화장품 찾으세요?",
        "Are you looking for cosmetics?",
        "Ask to use the tester.",
        "테스터 사용해 봐도 될까요?",
        "사용하다 means use.",
        "hwajangpum chajeuseyo?",
        []
      ],
      [
        "이 옷도 보시겠어요?",
        "Would you also like to see this clothing?",
        "Ask if a size exchange is possible.",
        "사이즈 교환 가능해요?",
        "교환 means exchange.",
        "i otdo bosigesseoyo?",
        []
      ],
      [
        "선물이세요?",
        "Is it a gift?",
        "Ask for gift wrapping.",
        "선물 포장 가능할까요?",
        "선물 means gift.",
        "seonmuriseyo?",
        []
      ]
    ]
  },
  "social": {
    "title": "Meet someone new",
    "role": "New friend",
    "turns": [
      [
        "안녕하세요! 처음 뵙겠습니다.",
        "Hello! Nice to meet you.",
        "Say nice to meet you.",
        "만나서 반가워요.",
        "반가워요 expresses pleasure at meeting.",
        "annyeonghaseyo! cheoeum boepgetseumnida.",
        []
      ],
      [
        "오늘 같이 영화 볼까요?",
        "Shall we watch a movie today?",
        "Politely say today is difficult.",
        "미안하지만, 오늘은 어려워요.",
        "미안하지만 softens a refusal.",
        "oneul gachi yeonghwa bolkkayo?",
        []
      ],
      [
        "그럼 다음에 봐요.",
        "Then let’s meet another time.",
        "Ask if tomorrow works.",
        "내일 시간, 괜찮으세요?",
        "내일 means tomorrow.",
        "geureom daeume bwayo.",
        []
      ]
    ]
  },
  "help": {
    "title": "Ask for help",
    "role": "Passerby",
    "turns": [
      [
        "괜찮으세요?",
        "Are you okay?",
        "Say you are lost.",
        "길을 잃었어요.",
        "길 means road or way.",
        "gwaenchaneuseyo?",
        []
      ],
      [
        "무슨 일이 있었어요?",
        "What happened?",
        "Say you lost your wallet.",
        "지갑을 잃어버렸어요.",
        "지갑 means wallet.",
        "museun iri isseosseoyo?",
        []
      ],
      [
        "제가 도와드릴까요?",
        "Can I help you?",
        "Thank them for their help.",
        "도와주셔서 감사합니다.",
        "감사합니다 is a polite thank you.",
        "jega dowadeurilkkayo?",
        []
      ]
    ]
  }
};
