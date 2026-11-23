// Source of truth for Korea 101. Build with node scripts/build-stories.cjs.
const source=(label,url)=>({label,url});
const expression=(ko,roman,meaning,example,translation)=>({ko,roman,meaning,example,translation});
const pic=(photo,alt,caption,after)=>({photo:'assets/photos/'+photo,alt,caption,after});
const original=(title,date,minutes,slug)=>({title,date,minutes,url:'https://sorikorea.beehiiv.com/p/'+slug});
const originals=[
 original('Welcome to Korea 101','2025-10-29',4,'new-post-32ae'),
 original('The Gold That Saved a Nation','2025-11-09',6,'korea-101-the-gold-that-saved-a-nation'),
 original('Tteokbokki, From Palace Dish to Street Legend','2025-11-17',5,'korea-101-tteokbokki-from-palace-dish-to-street-legend'),
 original('When a Restaurant Becomes a Movement','2026-01-18',7,'korea-101-when-a-restaurant-becomes-a-movement'),
 original('The Strangest Thing in Korean Cafés','2026-01-25',6,'korea-101-the-strangest-thing-in-korean-caf-s'),
 original('Seollal: When the Year Begins with a Bowl of Soup','2026-02-28',7,'korea-101-seollal-when-the-year-begins-with-a-bowl-of-soup')
];
const issues=[
{
  "id": "banchan-little-plates",
  "title": "The little plates that make a Korean meal",
  "category": "Food & traditions",
  "published": "2026-11-23",
  "photo": "assets/photos/jagalchi.jpg",
  "photoAlt": "Seafood stalls and tanks along an indoor aisle at Jagalchi Market in Busan",
  "photoContext": "Context photograph: seafood stalls at Jagalchi Market in Busan, not a banchan meal. Photo: Luke Ow / Unsplash, used under the Unsplash License; source listed in Sori’s photo credits.",
  "excerpt": "The small dishes beside your rice are part of the meal’s rhythm. Here is how to enjoy banchan, and what to say when the kimchi disappears first.",
  "phrase": "김치 조금 더 주실 수 있나요?",
  "question": "Which side dish would you happily build a whole meal around?",
  "figures": [],
  "sources": [
    {
      "label": "Korean Food Promotion Institute: The Roots of Hansik, Home-Cooked Meals",
      "url": "https://www.hansik.or.kr/magazines/list/magazineDetail/146/3877"
    },
    {
      "label": "National Folk Museum of Korea: Hansik",
      "url": "https://folkency.nfm.go.kr/en/topic/detail/12224"
    },
    {
      "label": "Korean Culture and Information Service: K-Food, the culture of side dishes",
      "url": "https://www.korean-culture.org/ebook/access/ecatalogt.jsp?Dir=153&callmode=normal&catimage=&eclang=ko&start=24&um=s"
    }
  ],
  "expressions": [
    {
      "ko": "김치 조금 더 주실 수 있나요?",
      "roman": "gimchi jogeum deo jusil su innayo",
      "meaning": "May I have a bit more kimchi?",
      "example": "김치 조금 더 주실 수 있나요?",
      "translation": "May I have a bit more kimchi?"
    }
  ],
  "body": "Your stew has not arrived, but the table is already busy. Kimchi lands beside a dish of greens, followed by something glossy and braised. If you are waiting for someone to explain which course comes first, here is a pleasant surprise: you do not need a course order.\n\nThese small dishes are banchan (반찬), companions to rice. They help make the meal, rather than serving as a starter you must finish before the main event. The Korean Food Promotion Institute describes everyday Korean meals around bap, or cooked rice, and the dishes eaten alongside it.\n\nTry a little rice, then a bite of kimchi, then some greens. Notice how the same rice feels different with something crisp, soft, sour or savory. You can return to a favorite without working clockwise around the table. Think of the meal as several tastes you can move between.\n\nSmall plates do not mean small effort. One vegetable might be blanched and seasoned; another ingredient might be braised or grilled. Fermentation matters in Korean cooking, but banchan is not another word for fermented food. Nor is there one correct lineup: the kitchen, season and kind of meal all matter.\n\nHere is a quieter surprise: today's shared table is not an unchanged ancient rule. The National Folk Museum of Korea describes how individual dining tables used by men in wealthy households gave way to more communal arrangements as homes and urban life changed. Something that feels timeless can have a history of adaptation.\n\nWhen eating with others, notice which dishes are shared and which bowls belong to each person. Some meals arrive on individual trays, so take your cue from the actual table rather than a drama scene.\n\nIf the kimchi disappears first, try 김치 조금 더 주실 수 있나요? It means ‘May I have a bit more kimchi?’ Ask staff what can be refilled and follow the restaurant's guidance, rather than assuming every plate is unlimited. A small request also makes it easier to finish what you ask for.\n\nThe nicest discovery may be a dish whose name you did not know before sitting down. Let one small plate slow you down enough to notice it. Which side dish would you happily build a whole meal around?"
},
{
 id:'first-snow-seoul',title:'Why the first snow in Korea feels like more than snow',category:'Culture',published:'2026-11-21',photo:'assets/photos/first-snow.webp',photoAlt:'An illustrated winter evening in a Seoul hanok neighborhood',photoContext:'AI editorial illustration, not a photograph of the 2026 snowfall.',excerpt:'Seoul saw its first snow unusually early this November. But why does a handful of snowflakes make so many Koreans think about someone they love?',phrase:'첫눈이 왔어요.',question:'Who would you want to see the first snow with?',figures:[pic('palace.jpg','Traditional palace architecture in Seoul','Seoul’s historic architecture, a different view of the city in every season.',3),pic('seoul-coffee.jpg','A cup of coffee','A warm café is an excellent place to pause on a winter walk.',9)],sources:[source('The Korea Herald: Seoul’s first snow in November 2026','https://www.koreaherald.com/article/10929584'),source('Korea.net: First snow in Seoul','https://www.korea.net/NewsFocus/Society/view?articleId=206229'),source('Visit Korea: Winter snacks','https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=219&vcontsId=1595642')],expressions:[
 expression('첫눈이 왔어요.','cheonnuni wasseoyo','The first snow has fallen.','서울에 첫눈이 왔어요.','The first snow has fallen in Seoul.'),
 expression('눈이 와요.','nuni wayo','It is snowing.','밖에 눈이 와요.','It is snowing outside.'),
 expression('첫눈에 반했어요.','cheonnune banhaesseoyo','I fell in love at first sight.','저는 첫눈에 반했어요.','I fell in love at first sight.')],
 body:`On November 8 this year, Seoul recorded its first snow. It was unusually early, about twelve days ahead of the average reported by the Korea Meteorological Administration. Depending on where you were in a city of millions, you may not even have noticed a flake. And yet the news was enough to make people send messages, look out of their windows and wonder whether winter had really begun.

In Korea, the first snowfall has its own name: cheonnun (첫눈). It is not necessarily a thick blanket of white covering the streets. Sometimes it is only a short flurry that disappears the moment it touches the ground. What matters to many people is the moment itself.

## A very particular kind of first

An official first snowfall is recorded through weather observation, which does not mean every neighborhood experiences snow simultaneously. Seoul contains hills, riverbanks, enormous apartment complexes and crowded streets; the weather one sees from a window is sometimes different from the report at the observation station. That is why a person might hear the news and then spend the rest of the day waiting to see their own first snow.

Korea has four distinct seasons, and the transition from autumn to winter can feel remarkably abrupt. In late October, ginkgo trees and maple leaves color the city. Weeks later, the same streets can feel entirely different. Fallen leaves collect along walls, scarves replace light jackets and the evenings grow dark before dinner. The first snow functions as a small punctuation mark in that seasonal change.

## What makes it romantic?

You may have seen this familiar scene in a Korean drama: two people leave a restaurant or stop in the middle of a conversation. A snowflake lands on someone's coat. Instead of talking about the weather, they suddenly think about the relationship between them.

There is a playful belief that seeing the first snow with someone special is a sign of lasting love. Some people say that a wish made during the first snowfall may come true. These are romantic sayings, not religious customs or promises. Many Koreans simply enjoy the idea, and others do not attach any special significance at all.

The symbolism works because the first snow happens only once each winter. Unlike a scheduled anniversary, nobody can decide exactly when it will arrive. A sudden and ordinary event becomes a rare moment shared by two people. The setting might be a walk home from work, a text message between distant friends or a phone call to someone who loves winter.

## Where to enjoy a snowy Seoul

If you visit during a snowy spell, a palace such as Gyeongbokgung gives you a beautiful contrast between curved rooflines and white snow. The stone walls near Deoksugung are lovely for a short walk. Around Bukchon and the smaller streets near Anguk, traditional roofs make even a light dusting visible, though these are residential neighborhoods where visitors should respect quiet hours and avoid entering private lanes.

You do not need to hurry to every landmark. A café window facing a neighborhood street can be just as memorable. In Korea, coffee shops provide a warm place to wait, watch the city and decide what to do next. Look for a neighborhood bakery, or try a hot street snack such as bungeoppang, the fish-shaped pastry often filled with red bean paste.

The practical side of first snow is less romantic. Snow can melt into slush and freeze when temperatures drop again. Wear shoes with traction, keep your hands warm and check transport updates, particularly during snowfall. Avoid assuming there will be snow just because you booked a December trip. Winter scenery is a gift from the weather, not a guaranteed tourist attraction.

## Two meanings hidden in one word

The Korean word 눈 (nun) means both snow and eye. The two uses are distinguished by context. In 첫눈이 왔어요, it means the first snowfall. In 첫눈에 반했어요, the expression refers to falling in love at first sight. They sound alike, but the particles and surrounding verb tell you what the speaker means. This makes the word especially interesting in a culture where the first snowfall so often appears in romantic stories.

If someone in Korea texts you 첫눈이다! (It's the first snow!), the most natural response might be 어디야? (Where are you?) or 사진 보내 줘! (Send me a picture!). It is a small opening for a conversation, and a lovely reason for learning a little Korean beyond textbook greetings.

The first snowfall is already behind us this year, but there will be other snowy evenings. Whether you are walking through Seoul, studying Korean at home or simply waiting for winter in your own country, perhaps the next first snow will make you notice something you would otherwise have missed. What does the first snow mean where you live?`
},
{
 id:'christmas-in-korea',title:'Christmas in Korea: a holiday for two, a festival for everyone',category:'Culture',published:'2026-11-21',photo:'assets/photos/christmas-seoul.webp',photoAlt:'Illustrated Seoul shopping street with Christmas lights and a tree',photoContext:'AI editorial illustration of a Seoul Christmas atmosphere, not a specific venue or event.',excerpt:'Why do couples reserve dinner weeks ahead, department stores become landmarks and bakeries compete over cakes? A look at Korea’s Christmas, before December arrives.',phrase:'메리 크리스마스!',question:'Is Christmas in your country mostly about family, romance, religion or something else?',travel:'#discover=christmas',figures:[pic('myeongdong.jpg','Shopping streets in Myeongdong','Myeongdong is one of the easiest neighborhoods for an evening of department-store displays.',3),pic('coex.jpg','Starfield Library inside COEX','COEX offers a striking indoor setting even on the coldest days.',8)],sources:[source('Korea.net: Christmas in Korea','https://www.korea.net/NewsFocus/HonoraryReporters/view?articleId=208499'),source('The Korea Times: Christmas in Korea','https://www.koreatimes.co.kr/opinion/20241222/christmas-in-korea-dating-money-and-work'),source('Visit Korea: Winter travel','https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=219&vcontsId=1595020')],expressions:[
 expression('메리 크리스마스!','meri keuriseumaseu','Merry Christmas!','메리 크리스마스! 즐거운 하루 보내세요.','Merry Christmas! Have a lovely day.'),
 expression('예약했어요.','yeyakhaesseoyo','I have a reservation.','저녁 일곱 시에 예약했어요.','I have a reservation for seven in the evening.'),
 expression('선물 포장 가능할까요?','seonmul pojang ganeunghalkkayo','Could you gift-wrap this?','이거 선물 포장 가능할까요?','Could you gift-wrap this item?')],
 body:`Imagine walking through Seoul in December. It is already dark by the time people leave work, department-store walls shimmer with animated lights, bakery windows display elaborate strawberry cakes and couples take photographs in front of enormous Christmas trees. It looks wonderfully familiar, but something about the way the holiday is celebrated may surprise you.

Christmas Day, December 25, is a public holiday in South Korea. This year it falls on a Friday. Unlike the Lunar New Year or Chuseok, it is not primarily a nationwide occasion for visiting one's ancestral hometown. For many younger Koreans, Christmas is an opportunity for a special date. For others, it is a religious celebration, an evening with friends, a relaxed meal at home or simply a welcome day off.

## Why is Christmas a date night?

Korea's two major traditional holidays, Seollal and Chuseok, are periods when extended families often gather, eat customary foods and remember their ancestors. Christmas does not occupy quite the same position in the traditional calendar. The festive scenery, gift-giving, music and a day away from work make it especially appealing as a social occasion.

This is why the question 크리스마스에 뭐 해요? (What are you doing for Christmas?) can sound a little different from the equivalent question in some Western countries. It may be asking about a date, rather than about travel home to the family. On social media, jokes about being single at Christmas appear every year. The expression 솔로 크리스마스 describes spending Christmas without a romantic partner. Of course, being single does not prevent anyone from enjoying the season.

Restaurants and hotel lounges may offer special menus, making advance booking sensible. Some couples dress up, visit an exhibition or take a nighttime walk, and finish with a cake. This is one modern custom, not an obligation. A family might decorate its apartment or exchange presents with children, while a Christian household may consider a Christmas Eve or Christmas Day service the most important part of the holiday.

## Why a cake is such a big deal

Look at Korean bakery advertisements in late November and early December. A particularly competitive product appears: the Christmas cake. From neighborhood bakeries to national chains and luxury hotels, seasonal cakes feature strawberries, decorated cream, chocolate trees and elaborate characters. Reservations for popular designs can fill before Christmas itself.

For someone accustomed to a big roast dinner at home, this may seem like an unusual centerpiece. But the cake travels well between different kinds of gatherings: a couple's restaurant visit, an office celebration, a small party or a family dinner. It creates a festive moment without requiring a particular household tradition. Strawberries are especially visible in Korean winter desserts because the domestic strawberry season and greenhouse cultivation make them a familiar winter food.

## Where the city becomes part of the festival

Seoul's department stores compete to create memorable seasonal destinations. The Lotte Main Store in Myeongdong and Shinsegae Square can be visited on the same walk. Evening is the natural time to see their illuminated facades, but weekend crowds can be substantial. Go on a weekday if your schedule permits, and use crosswalks rather than standing in the road to photograph a display.

For an indoor alternative, The Hyundai Seoul in Yeouido is known for immersive Christmas installations, while Starfield Library in COEX pairs festive decorations with spectacular bookshelves. The Hyundai's special village may use reservations or on-site queues. At Jamsil, a seasonal market near Lotte World Mall provides another option, especially for those who want to browse gifts and snacks. Market entry rules and dates change each season, so check the current venue information rather than relying on a picture from last year.

## A more local Christmas itinerary

Instead of planning a whole day around malls, choose a neighborhood and give yourself time to enjoy it. In central Seoul, begin with a bowl of seolleongtang at Miseongok, then visit Myeongdong's two major displays. If you like crafts, spend an afternoon at the Seoul Museum of Craft Art, explore Insadong and warm up with Jeju tea at Osulloc in Bukchon. Those who enjoy holiday decorations can visit the flower market above the Express Bus Terminal before traveling to COEX.

There is no need to chase every tree, especially if you have only a few days in Seoul. Make one reservation if there is something you truly want to see, choose a dependable restaurant nearby, and leave the rest of the evening open. A surprisingly pleasant moment may be just sitting somewhere warm with a cup of tea.

Whether you celebrate Christmas for religious reasons, with family, as a couple or not at all, Korea offers a fascinating example of how a global holiday can acquire a different local personality. The best part is that you do not have to celebrate it in one particular way to appreciate it.`
},
];
module.exports={issues,originals,source,expression,pic};
