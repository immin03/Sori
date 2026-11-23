export const extraScenes = {
  "station-locker": {
    "title": "Leave a bag in a station locker",
    "role": "Station attendant",
    "level": "essentials",
    "place": "Station lockers",
    "topic": "Luggage",
    "category": "travel",
    "audio": "cloud",
    "turns": [
      [
        "뭘 찾으세요?",
        "What are you looking for?",
        "Ask where the lockers are.",
        "물품 보관함은 어디예요?",
        "물품 보관함 is the sign to look for when you want a locker.",
        "mwol chajeuseyo?",
        [
          "물품 보관함이 어디에 있어요?"
        ]
      ],
      [
        "가방이 큰가요?",
        "Is your bag big?",
        "Say you need a large locker.",
        "큰 칸이 필요해요.",
        "A compartment is a 칸. Put 큰 in front of it to ask for a large one.",
        "gabangi keungayo?",
        [
          "큰 칸이 필요합니다."
        ]
      ],
      [
        "결제는 어떻게 하실래요?",
        "How would you like to pay?",
        "Say you will pay by card.",
        "카드로 낼게요.",
        "로 tells the listener what you are using to pay.",
        "gyeoljeneun eotteoke hasillaeyo?",
        [
          "카드로 계산할게요."
        ]
      ]
    ]
  },
  "neighborhood-library": {
    "title": "Borrow a book for the weekend",
    "role": "Librarian",
    "level": "essentials",
    "place": "Public library",
    "topic": "Library",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "무슨 책을 찾으세요?",
        "What kind of book are you looking for?",
        "Ask for a Korean picture book.",
        "한국어 그림책 있어요?",
        "그림책 combines 그림, picture, and 책, book.",
        "museun chaegeul chajeuseyo?",
        [
          "한국어 그림책이 있나요?"
        ]
      ],
      [
        "그림책은 이쪽에 있어요.",
        "The picture books are over here.",
        "Ask if you can borrow this one.",
        "이 책 빌려도 돼요?",
        "빌리다 is to borrow. 빌려도 돼요 asks for permission.",
        "geurimchaegeun ijjoge isseoyo.",
        [
          "이 책을 빌려도 될까요?"
        ]
      ],
      [
        "네, 대출해 드릴게요.",
        "Yes, I'll check it out for you.",
        "Ask when you should bring it back.",
        "언제까지 가져오면 돼요?",
        "언제까지 asks for a deadline.",
        "ne, daechulhae deurilgeyo.",
        [
          "언제까지 반납하면 돼요?"
        ]
      ]
    ]
  },
  "laundry-first-load": {
    "title": "Run a first load at the laundromat",
    "role": "Another customer",
    "level": "essentials",
    "place": "Laundromat",
    "topic": "Laundry",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "어떤 기계 쓰실 거예요?",
        "Which machine are you going to use?",
        "Ask if this washer is free.",
        "이 세탁기 비었어요?",
        "비었어요 means something is empty or available.",
        "eotteon gigye sseusil geoyeyo?",
        [
          "이 세탁기 비어 있어요?"
        ]
      ],
      [
        "네, 쓰셔도 돼요.",
        "Yes, you can use it.",
        "Ask where the detergent goes.",
        "세제는 어디에 넣어요?",
        "세제 means detergent. 넣어요 means put something in.",
        "ne, sseusyeodo dwaeyo.",
        [
          "세제를 어디에 넣어요?"
        ]
      ],
      [
        "세제는 여기 넣으세요.",
        "Put the detergent here.",
        "Ask how long a wash takes.",
        "세탁은 얼마나 걸려요?",
        "얼마나 걸려요 asks how much time something takes.",
        "sejeneun yeogi neoeuseyo.",
        [
          "세탁하는 데 얼마나 걸려요?"
        ]
      ]
    ]
  },
  "photo-walk": {
    "title": "Ask someone to take your photo",
    "role": "Passerby",
    "level": "essentials",
    "place": "Palace courtyard",
    "topic": "Photography",
    "category": "travel",
    "audio": "cloud",
    "turns": [
      [
        "사진 찍어 드릴까요?",
        "Would you like me to take your photo?",
        "Ask for a photo with your friend.",
        "친구랑 같이 찍어 주세요.",
        "친구랑 and 친구하고 both mean with a friend.",
        "sajin jjigeo deurilkkayo?",
        [
          "친구하고 같이 찍어 주세요."
        ]
      ],
      [
        "세로로 찍을까요?",
        "Shall I take it vertically?",
        "Ask for a horizontal photo.",
        "가로로 찍어 주세요.",
        "가로로 means horizontally. 세로로 means vertically.",
        "seroro jjigeulkkayo?",
        [
          "가로로 부탁해요."
        ]
      ],
      [
        "사진 한번 보세요.",
        "Have a look at the photo.",
        "Thank them and say the photo turned out well.",
        "잘 나왔어요. 감사합니다.",
        "잘 나왔어요 is a natural compliment when looking at a photo.",
        "sajin hanbeon boseyo.",
        [
          "잘 나왔네요. 고맙습니다."
        ]
      ]
    ]
  },
  "bus-stop-question": {
    "title": "Choose the right bus stop",
    "role": "Fellow passenger",
    "level": "essentials",
    "place": "Bus stop",
    "topic": "Bus travel",
    "category": "travel",
    "audio": "cloud",
    "turns": [
      [
        "어디까지 가세요?",
        "Where are you going?",
        "Say you are going to City Hall.",
        "시청까지 가요.",
        "까지 marks the end of your trip.",
        "eodikkaji gaseyo?",
        [
          "시청까지 가려고요."
        ]
      ],
      [
        "시청 가는 버스는 건너편에 서요.",
        "The bus to City Hall stops across the street.",
        "Ask if there is a crosswalk nearby.",
        "근처에 횡단보도 있어요?",
        "횡단보도 is the marked crossing where people walk across a road.",
        "sicheong ganeun beoseuneun geonneopyeone seoyo.",
        [
          "근처에 횡단보도가 있나요?"
        ]
      ],
      [
        "저기 신호등 보이세요?",
        "Can you see the traffic light over there?",
        "Say you can see it now.",
        "네, 이제 보여요.",
        "보여요 describes something coming into view.",
        "jeogi sinhodeung boiseyo?",
        [
          "이제 보여요."
        ]
      ]
    ]
  },
  "guest-at-door": {
    "title": "Arrive at a Korean friend's home",
    "role": "Host",
    "level": "essentials",
    "place": "Friend’s home",
    "topic": "Visiting friends",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "어서 오세요. 길 찾기 괜찮았어요?",
        "Welcome. Was it easy to find the way?",
        "Say the home was easy to find.",
        "네, 찾기 쉬웠어요.",
        "Add 기 쉬워요 to a verb to say it is easy to do.",
        "eoseo oseyo. gil chatgi gwaenchanasseoyo?",
        [
          "집을 찾기 쉬웠어요."
        ]
      ],
      [
        "가방은 저쪽에 두세요.",
        "You can leave your bag over there.",
        "Ask where to put your shoes.",
        "신발은 어디에 둬요?",
        "둬요 is the short form of 두어요, meaning put or leave.",
        "gabangeun jeojjoge duseyo.",
        [
          "신발은 어디에 두면 돼요?"
        ]
      ],
      [
        "편하게 앉으세요.",
        "Make yourself comfortable and have a seat.",
        "Thank your host for inviting you.",
        "초대해 줘서 고마워요.",
        "Say what someone did before 줘서 고마워요.",
        "pyeonhage anjeuseyo.",
        [
          "초대해 주셔서 감사해요."
        ]
      ]
    ]
  },
  "print-shop-copies": {
    "title": "Print a document from your phone",
    "role": "Print shop clerk",
    "level": "essentials",
    "place": "Print shop",
    "topic": "Printing",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "무엇을 인쇄할까요?",
        "What shall we print?",
        "Say the file is on your phone.",
        "파일은 제 휴대폰에 있어요.",
        "에 marks the place where the file is stored.",
        "mueoseul inswaehalkkayo?",
        [
          "제 핸드폰에 파일이 있어요."
        ]
      ],
      [
        "컬러로 하실래요?",
        "Would you like it in color?",
        "Ask for black and white.",
        "흑백으로 해 주세요.",
        "흑백 means black and white.",
        "keolleoro hasillaeyo?",
        [
          "흑백으로 부탁해요."
        ]
      ],
      [
        "몇 부 필요하세요?",
        "How many copies do you need?",
        "Ask for two copies.",
        "두 부 주세요.",
        "Use 부 to count copies of a document.",
        "myeot bu piryohaseyo?",
        [
          "두 부 부탁해요."
        ]
      ]
    ]
  },
  "ticket-window-ballgame": {
    "title": "Get seats for a baseball game",
    "role": "Ticket clerk",
    "level": "essentials",
    "place": "Baseball stadium",
    "topic": "Sports tickets",
    "category": "travel",
    "audio": "cloud",
    "turns": [
      [
        "몇 분이세요?",
        "How many people are there?",
        "Say there are two of you.",
        "저희 두 명이에요.",
        "저희 politely refers to your own group.",
        "myeot buniseyo?",
        [
          "저희는 두 명이에요."
        ]
      ],
      [
        "어떤 자리 찾으세요?",
        "What kind of seats would you like?",
        "Ask for seats next to each other.",
        "붙어 있는 자리 있어요?",
        "붙어 있는 자리 describes seats next to each other.",
        "eotteon jari chajeuseyo?",
        [
          "나란히 앉을 자리 있나요?"
        ]
      ],
      [
        "이 표 가지고 들어가시면 돼요.",
        "You can go in with this ticket.",
        "Ask where the entrance is.",
        "입구가 어디예요?",
        "입구 is the entrance. 출구 is the exit.",
        "i pyo gajigo deureogasimyeon dwaeyo.",
        [
          "입구는 어디에 있어요?"
        ]
      ]
    ]
  },
  "hanbok-fit": {
    "title": "Try on a hanbok before visiting a palace",
    "role": "Rental shop assistant",
    "level": "intermediate",
    "place": "Hanbok rental shop",
    "topic": "Hanbok rental",
    "category": "travel",
    "audio": "cloud",
    "turns": [
      [
        "어떤 색 치마를 입어 보실래요?",
        "What color skirt would you like to try on?",
        "Ask to try on the light pink skirt.",
        "연분홍색 치마를 입어 볼게요.",
        "입어 보다 means try on clothes.",
        "eotteon saek chimareul ibeo bosillaeyo?",
        [
          "연분홍색 치마 입어 볼게요."
        ]
      ],
      [
        "치마 길이는 어떠세요?",
        "How is the length of the skirt?",
        "Say it is long enough to touch the ground.",
        "치마가 바닥에 닿아요.",
        "닿아요 describes two things touching.",
        "chima girineun eotteoseyo?",
        [
          "치맛자락이 바닥에 닿아요."
        ]
      ],
      [
        "길이를 조금 줄여 드릴게요.",
        "I'll shorten it a little for you.",
        "Ask when you need to return it.",
        "몇 시까지 반납해야 해요?",
        "반납하다 means to return a borrowed or rented item.",
        "girireul jogeum juryeo deurilgeyo.",
        [
          "몇 시까지 돌려드려야 해요?"
        ]
      ]
    ]
  },
  "apartment-recycling": {
    "title": "Sort packaging with a neighbor",
    "role": "Neighbor",
    "level": "intermediate",
    "place": "Recycling area",
    "topic": "Recycling",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "재활용품 버리러 오셨어요?",
        "Are you here to put out the recyclables?",
        "Ask where the plastic bottles go.",
        "페트병은 어디에 버리면 돼요?",
        "Use 버리면 돼요 to ask how to dispose of something.",
        "jaehwalyongpum beorireo osyeosseoyo?",
        [
          "페트병은 어디에 버려요?"
        ]
      ],
      [
        "투명한 병은 저쪽에 따로 모아요.",
        "Clear bottles are collected separately over there.",
        "Ask if you should take the label off first.",
        "라벨을 먼저 떼야 해요?",
        "떼다 means to peel or pull something off.",
        "tumyeonghan byeongeun jeojjoge ttaro moayo.",
        [
          "라벨부터 떼야 하나요?"
        ]
      ],
      [
        "네. 박스도 가져오셨네요.",
        "Yes. I see you brought a box too.",
        "Say you will flatten it before putting it out.",
        "상자는 접어서 내놓을게요.",
        "접어서 links folding something with what you do next.",
        "ne. bakseudo gajyeoosyeonneyo.",
        [
          "상자를 접어서 내놓을게요."
        ]
      ]
    ]
  },
  "hiking-gear": {
    "title": "Rent hiking boots for a walking route",
    "role": "Rental desk staff",
    "level": "intermediate",
    "place": "Hiking center",
    "topic": "Hiking",
    "category": "travel",
    "audio": "cloud",
    "turns": [
      [
        "어떤 장비가 필요하세요?",
        "What gear do you need?",
        "Say you would like to rent hiking boots.",
        "등산화를 빌리고 싶어요.",
        "등산화 means hiking boots. 화 here refers to footwear.",
        "eotteon jangbiga piryohaseyo?",
        [
          "등산화 좀 빌릴 수 있을까요?"
        ]
      ],
      [
        "신어 보니까 어때요?",
        "How do they feel now that you've tried them on?",
        "Ask to try a pair one size larger.",
        "한 치수 큰 걸 신어 봐도 될까요?",
        "Use 신다 for shoes and socks.",
        "sineo bonikka eottaeyo?",
        [
          "한 사이즈 큰 걸 신어 봐도 될까요?"
        ]
      ],
      [
        "돌아오실 때 어느 쪽으로 오세요?",
        "Which way will you come back?",
        "Say you plan to come back the same way.",
        "왔던 길로 돌아올 거예요.",
        "왔던 길 means the route you took to get here.",
        "doraosil ttae eoneu jjogeuro oseyo?",
        [
          "왔던 길로 다시 올 거예요."
        ]
      ]
    ]
  },
  "parcel-intercom": {
    "title": "Coordinate a parcel drop-off",
    "role": "Delivery driver",
    "level": "intermediate",
    "place": "Apartment intercom",
    "topic": "Deliveries",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "택배 왔는데 집에 계세요?",
        "I have a delivery. Are you at home?",
        "Say you stepped out for a moment.",
        "지금 잠깐 나와 있어요.",
        "나와 있어요 describes being out after leaving home.",
        "taekbae wanneunde jibe gyeseyo?",
        [
          "지금 잠시 밖에 있어요."
        ]
      ],
      [
        "어디에 두고 갈까요?",
        "Where would you like me to leave it?",
        "Ask the driver to leave it by the door.",
        "현관문 옆에 놓아 주세요.",
        "놔 주세요 and 놓아 주세요 mean the same thing.",
        "eodie dugo galkkayo?",
        [
          "현관문 옆에 놔 주세요."
        ]
      ],
      [
        "두고 가면 될까요?",
        "Shall I leave it there, then?",
        "Ask for a text when the driver is done.",
        "놓고 나서 문자 한 통 부탁드려요.",
        "고 나서 means after finishing the first action.",
        "dugo gamyeon doelkkayo?",
        [
          "놓고 나서 문자 한 통 보내 주세요."
        ]
      ]
    ]
  },
  "secondhand-meet": {
    "title": "Arrange a secondhand pickup",
    "role": "Local seller",
    "level": "intermediate",
    "place": "Neighborhood pickup",
    "topic": "Secondhand shopping",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "올려 놓은 의자 보셨어요?",
        "Did you see the chair I listed?",
        "Ask if it is still for sale.",
        "그 의자 아직 판매 중인가요?",
        "판매 중 means currently for sale.",
        "ollyeo noeun uija bosyeosseoyo?",
        [
          "의자 아직 파시나요?"
        ]
      ],
      [
        "네. 직접 보러 오실래요?",
        "Yes. Would you like to come see it?",
        "Suggest meeting tomorrow after work.",
        "내일 퇴근하고 만날까요?",
        "퇴근하다 means to leave work for the day.",
        "ne. jikjeop boreo osillaeyo?",
        [
          "내일 퇴근 후에 만날까요?"
        ]
      ],
      [
        "어디에서 만나면 편하세요?",
        "Where would be convenient to meet?",
        "Suggest meeting in front of the bakery.",
        "역 앞 빵집에서 봬요.",
        "봬요 is a polite way to say see you.",
        "eodieseo mannamyeon pyeonhaseyo?",
        [
          "역 앞에 있는 빵집에서 봬요."
        ]
      ]
    ]
  },
  "pottery-workshop": {
    "title": "Choose what to make in a pottery workshop",
    "role": "Pottery teacher",
    "level": "intermediate",
    "place": "Pottery studio",
    "topic": "Craft classes",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "오늘은 어떤 걸 만들고 싶으세요?",
        "What would you like to make today?",
        "Say you want to make a cup with a handle.",
        "손잡이가 있는 컵을 만들고 싶어요.",
        "손잡이 is the part you hold.",
        "oneureun eotteon geol mandeulgo sipeuseyo?",
        [
          "손잡이 달린 컵을 만들고 싶어요."
        ]
      ],
      [
        "손잡이는 이쪽에 붙이면 돼요.",
        "You can attach the handle on this side.",
        "Ask if you can engrave your name on the bottom.",
        "바닥에 이름을 새겨도 될까요?",
        "새기다 means to engrave or carve.",
        "sonjabineun ijjoge buchimyeon dwaeyo.",
        [
          "밑에 이름을 새겨도 될까요?"
        ]
      ],
      [
        "다 구우면 연락드릴게요.",
        "I'll contact you when it's been fired.",
        "Ask if a friend can collect it for you.",
        "친구가 대신 찾으러 와도 돼요?",
        "대신 means in someone else's place.",
        "da guumyeon yeonrakdeurilgeyo.",
        [
          "친구가 대신 받으러 와도 될까요?"
        ]
      ]
    ]
  },
  "picnic-rain": {
    "title": "Change plans when it starts to rain",
    "role": "Friend",
    "level": "intermediate",
    "place": "Meeting point",
    "topic": "Changing plans",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "밖에 비가 꽤 오네요.",
        "It's raining quite a bit outside.",
        "Suggest moving the picnic to next week.",
        "소풍은 다음 주로 미룰까요?",
        "미루다 means to put something off until later.",
        "bakke biga kkwae oneyo.",
        [
          "소풍을 다음 주로 미룰까요?"
        ]
      ],
      [
        "그럼 오늘은 뭘 할까요?",
        "Then what shall we do today?",
        "Suggest going to the exhibition nearby.",
        "근처 전시회에 가는 건 어때요?",
        "가는 건 어때요 is an easygoing way to suggest an outing.",
        "geureom oneureun mwol halkkayo?",
        [
          "근처 전시회에 가면 어때요?"
        ]
      ],
      [
        "좋아요. 지하철역에서 만나요.",
        "Sounds good. Let's meet at the subway station.",
        "Say you will bring an extra umbrella.",
        "우산을 하나 더 챙겨 갈게요.",
        "챙겨 가다 means to remember to take something along.",
        "joayo. jihacheollyeogeseo mannayo.",
        [
          "우산 하나 더 가져갈게요."
        ]
      ]
    ]
  },
  "side-dish-shop": {
    "title": "Choose side dishes for dinner",
    "role": "Shopkeeper",
    "level": "intermediate",
    "place": "Side dish shop",
    "topic": "Home meals",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "오늘은 무슨 반찬 드릴까요?",
        "Which side dishes would you like today?",
        "Ask for something that isn't spicy.",
        "맵지 않은 반찬을 추천해 주세요.",
        "맵지 않은 and 안 매운 both describe food that isn't spicy.",
        "oneureun museun banchan deurilkkayo?",
        [
          "안 매운 반찬 좀 추천해 주세요."
        ]
      ],
      [
        "이건 두부조림이에요.",
        "This is braised tofu.",
        "Ask if you can buy just a small amount.",
        "조금만 살 수 있을까요?",
        "만 after 조금 emphasizes that you want only a little.",
        "igeon dubujorimieyo.",
        [
          "조금만 사도 될까요?"
        ]
      ],
      [
        "다른 반찬도 같이 담을까요?",
        "Shall I put the other side dish in the same container?",
        "Ask for separate containers.",
        "각각 다른 통에 담아 주세요.",
        "각각 means each one separately.",
        "dareun banchando gachi dameulkkayo?",
        [
          "각각 따로 담아 주세요."
        ]
      ]
    ]
  },
  "wrong-order": {
    "title": "Sort out a mix-up at the pickup counter",
    "role": "Restaurant worker",
    "level": "nuance",
    "place": "Takeout counter",
    "topic": "Order mix-ups",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "주문하신 음식 받으셨어요?",
        "Did you get the food you ordered?",
        "Explain that the name on the bag is different.",
        "봉투에 적힌 이름이 제 이름이 아닌 것 같아요.",
        "적힌 describes something already written on an object.",
        "jumunhasin eumsik badeusyeosseoyo?",
        [
          "봉투에 쓰인 이름이 제 이름이 아닌 것 같아요."
        ]
      ],
      [
        "주문 내역을 보여 주시겠어요?",
        "Could you show me the order details?",
        "Explain that you ordered two burgers without onions.",
        "저는 양파 빼고 버거 두 개 주문했어요.",
        "빼고 means leaving something out of an order.",
        "jumun naeyeogeul boyeo jusigesseoyo?",
        [
          "저는 양파를 뺀 버거 두 개를 주문했어요."
        ]
      ],
      [
        "다시 준비하는 데 조금 걸려요.",
        "It will take a little while to prepare it again.",
        "Ask them to let you know when it's ready.",
        "준비되는 대로 알려 주시면 감사하겠어요.",
        "되는 대로 means as soon as it is ready.",
        "dasi junbihaneun de jogeum geollyeoyo.",
        [
          "준비되는 대로 알려 주시면 감사하겠습니다."
        ]
      ]
    ]
  },
  "bank-transfer-receipt": {
    "title": "Explain what you need at a bank",
    "role": "Bank teller",
    "level": "nuance",
    "place": "Bank counter",
    "topic": "Banking",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "어떤 일로 오셨어요?",
        "What brings you in today?",
        "Explain that you need a record of a transfer you made yesterday.",
        "어제 송금한 내역을 확인하고 싶어요.",
        "이체 내역 is a record of a money transfer.",
        "eotteon illo osyeosseoyo?",
        [
          "어제 이체한 내역을 확인하고 싶어요."
        ]
      ],
      [
        "어떤 정보를 확인하실 건가요?",
        "Which information would you like to check?",
        "Say you want to confirm who received it.",
        "받는 분의 이름이 맞는지 보고 싶어서요.",
        "맞는지 expresses whether something is correct.",
        "eotteon jeongboreul hwaginhasil geongayo?",
        [
          "받는 분 성함이 맞는지 확인하고 싶어서요."
        ]
      ],
      [
        "화면으로 보여 드릴까요?",
        "Shall I show it to you on the screen?",
        "Ask for a paper copy to take with you.",
        "가져갈 수 있게 종이로 한 부 부탁드려요.",
        "수 있게 expresses the purpose of your request.",
        "hwamyeoneuro boyeo deurilkkayo?",
        [
          "가져갈 수 있게 한 부 출력해 주세요."
        ]
      ]
    ]
  },
  "community-volunteer": {
    "title": "Offer a useful skill to a volunteer team",
    "role": "Volunteer coordinator",
    "level": "nuance",
    "place": "Community center",
    "topic": "Volunteering",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "어떤 역할을 맡고 싶으세요?",
        "What role would you like to take on?",
        "Offer to help visitors who need an English explanation.",
        "영어 안내가 필요한 분들을 도와드리고 싶어요.",
        "도와드리다 adds courtesy when offering someone help.",
        "eotteon yeokhareul matgo sipeuseyo?",
        [
          "영어로 안내가 필요한 분들을 돕고 싶어요."
        ]
      ],
      [
        "아침부터 오실 수 있나요?",
        "Can you come first thing in the morning?",
        "Say you can start in the afternoon because you work mornings.",
        "오전에는 일해서 오후부터 참여할 수 있어요.",
        "부터 marks when you become available.",
        "achimbuteo osil su innayo?",
        [
          "오전에 일해서 오후부터 참여할 수 있습니다."
        ]
      ],
      [
        "처음 오시는 거죠?",
        "It's your first time here, right?",
        "Ask for an explanation of the route in advance.",
        "미리 동선을 설명해 주시면 도움이 될 것 같아요.",
        "동선 is the route people move along during an event.",
        "cheoeum osineun geojyo?",
        [
          "동선을 미리 알려 주시면 도움이 될 것 같아요."
        ]
      ]
    ]
  },
  "apartment-repair": {
    "title": "Arrange a repair visit around work",
    "role": "Building manager",
    "level": "nuance",
    "place": "Building office",
    "topic": "Home repairs",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "집에 어떤 문제가 있나요?",
        "What seems to be wrong in your home?",
        "Explain that water drips even after you turn off the tap.",
        "수도꼭지를 잠가도 물이 계속 떨어져요.",
        "아도 or 어도 means even if or even after.",
        "jibe eotteon munjega innayo?",
        [
          "수도꼭지를 잠가도 물이 계속 새요."
        ]
      ],
      [
        "언제 방문하면 좋을까요?",
        "When would be a good time to come by?",
        "Ask whether the technician can come after six on a weekday.",
        "평일에는 여섯 시 이후에 와 주실 수 있을까요?",
        "이후에 places the visit after a particular time.",
        "eonje bangmunhamyeon joeulkkayo?",
        [
          "평일 여섯 시 이후에 방문해 주실 수 있을까요?"
        ]
      ],
      [
        "방문 시간이 정해지면 알려 드릴게요.",
        "I'll let you know once we've set a time.",
        "Request a call before the technician arrives.",
        "오시기 전에 전화 한 통 주시면 감사하겠습니다.",
        "기 전에 puts the call before the visit.",
        "bangmun sigani jeonghaejimyeon allyeo deurilgeyo.",
        [
          "방문 전에 전화 한 통 주시면 감사하겠습니다."
        ]
      ]
    ]
  },
  "quiet-neighbor": {
    "title": "Discuss noise without starting an argument",
    "role": "Neighbor",
    "level": "nuance",
    "place": "Apartment hallway",
    "topic": "Neighbors",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "혹시 불편한 점이 있으셨어요?",
        "Has something been bothering you?",
        "Gently explain that you sometimes hear music late at night.",
        "늦은 밤에 음악 소리가 들릴 때가 있어서요.",
        "때가 있어서요 presents the issue without sounding accusatory.",
        "hoksi bulpyeonhan jeomi isseusyeosseoyo?",
        [
          "밤늦게 음악 소리가 들릴 때가 있어서요."
        ]
      ],
      [
        "그렇게 크게 들리는 줄 몰랐어요.",
        "I didn't realize it sounded that loud.",
        "Ask if they could turn it down a little after ten.",
        "열 시가 지나면 소리를 조금만 줄여 주실 수 있을까요?",
        "조금만 softens a request to change something.",
        "geureoke keuge deullineun jul mollasseoyo.",
        [
          "열 시 이후에는 소리를 조금만 줄여 주실 수 있을까요?"
        ]
      ],
      [
        "앞으로 조심할게요.",
        "I'll be more careful from now on.",
        "Thank your neighbor for understanding.",
        "이해해 주셔서 정말 감사해요.",
        "주셔서 acknowledges what the other person has done for you.",
        "apeuro josimhalgeyo.",
        [
          "이해해 주셔서 정말 감사합니다."
        ]
      ]
    ]
  },
  "festive-dinner": {
    "title": "Plan a holiday meal with two households",
    "role": "Friend",
    "level": "nuance",
    "place": "Family gathering",
    "topic": "Holiday gatherings",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "명절에 다 같이 모일까요?",
        "Shall we all get together for the holiday?",
        "Suggest including people who cannot visit their families.",
        "고향에 못 가는 친구들도 함께 부르면 어때요?",
        "부르다 can mean to invite someone to join a gathering.",
        "myeongjeore da gachi moilkkayo?",
        [
          "고향에 못 가는 친구들도 같이 초대하면 어때요?"
        ]
      ],
      [
        "음식은 어떻게 준비할까요?",
        "How shall we prepare the food?",
        "Suggest each person bring one dish they make well.",
        "각자 자신 있는 음식을 한 가지씩 가져오면 좋겠어요.",
        "씩 distributes one item to each person.",
        "eumsigeun eotteoke junbihalkkayo?",
        [
          "각자 잘하는 음식을 한 가지씩 가져오면 좋겠어요."
        ]
      ],
      [
        "같은 음식을 가져올 수도 있겠네요.",
        "Some of us might bring the same dish.",
        "Offer to check what everyone is bringing in advance.",
        "메뉴가 겹치지 않게 제가 미리 확인해 볼게요.",
        "겹치지 않게 explains that you want to avoid overlap.",
        "gateun eumsigeul gajyeool sudo itgenneyo.",
        [
          "음식이 겹치지 않도록 제가 미리 확인할게요."
        ]
      ]
    ]
  },
  "theater-access": {
    "title": "Ask about access before booking a play",
    "role": "Theater box office staff",
    "level": "nuance",
    "place": "Theater box office",
    "topic": "Accessible venues",
    "category": "travel",
    "audio": "cloud",
    "turns": [
      [
        "공연에 관해 궁금한 점이 있으세요?",
        "What would you like to know about the show?",
        "Ask whether you can reach your seat without using stairs.",
        "계단을 이용하지 않고 좌석까지 갈 수 있을까요?",
        "지 않고 means without doing something.",
        "gongyeone gwanhae gunggeumhan jeomi isseuseyo?",
        [
          "계단 없이 좌석까지 갈 수 있나요?"
        ]
      ],
      [
        "출입구에서 직원이 안내해 드릴 수 있어요.",
        "A member of staff can guide you from the entrance.",
        "Ask which entrance will be the most convenient.",
        "어느 출입구로 들어가는 게 가장 편할까요?",
        "가장 편할까요 asks which option would work best.",
        "churipgueseo jigwoni annaehae deuril su isseoyo.",
        [
          "어느 입구로 들어가면 가장 편할까요?"
        ]
      ],
      [
        "다른 문의 사항도 있으세요?",
        "Is there anything else you'd like to ask?",
        "Ask whether a companion can sit next to you.",
        "동행하는 사람도 바로 옆에 앉을 수 있나요?",
        "바로 옆 emphasizes the seat directly beside yours.",
        "dareun munui sahangdo isseuseyo?",
        [
          "같이 가는 사람도 바로 옆에 앉을 수 있나요?"
        ]
      ]
    ]
  },
  "language-exchange": {
    "title": "Negotiate a language exchange that works for both of you",
    "role": "Language partner",
    "level": "nuance",
    "place": "Language exchange",
    "topic": "Language exchange",
    "category": "daily",
    "audio": "cloud",
    "turns": [
      [
        "어떤 식으로 연습하면 좋을까요?",
        "How would you like to practise?",
        "Suggest taking turns speaking Korean and English for ten minutes each.",
        "한국어와 영어로 십 분씩 번갈아 이야기해 볼까요?",
        "번갈아 means taking turns. 십 분씩 means ten minutes each.",
        "eotteon sigeuro yeonseuphamyeon joeulkkayo?",
        [
          "한국어랑 영어로 십 분씩 번갈아 얘기해 볼까요?"
        ]
      ],
      [
        "말하는 중간에 바로 고쳐 드릴까요?",
        "Should I correct you right in the middle of speaking?",
        "Say you would prefer feedback after you finish a sentence.",
        "문장을 끝낸 뒤에 고쳐 주시면 더 좋겠어요.",
        "뒤에 and 다음에 both place the correction afterward.",
        "malhaneun junggane baro gochyeo deurilkkayo?",
        [
          "문장을 끝낸 다음에 고쳐 주시면 더 좋겠어요."
        ]
      ],
      [
        "모르는 표현이 나오면 어떻게 할까요?",
        "What shall we do if an unfamiliar expression comes up?",
        "Offer to write it down and use it together in a new sentence.",
        "적어 뒀다가 새 문장에 함께 써 봐요.",
        "뒀다가 describes keeping something for later use.",
        "moreuneun pyohyeoni naomyeon eotteoke halkkayo?",
        [
          "적어 두었다가 새로운 문장에 같이 써 봐요."
        ]
      ]
    ]
  }
};
