// Each reply is an exact expression in the Sori lesson collection.
export const scenes = {
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
  }
};
