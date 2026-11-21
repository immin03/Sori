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
{
 id:'matjip-secret',title:'What makes a Korean restaurant a 맛집?',excerpt:'Why a bowl of noodles, a handwritten sign and a line of locals can tell you more about Korean food culture than a luxury dining room.',originalUrl:originals[3].url,figures:[pic('insadong.jpg','Traditional shops and lanes in Seoul','Older commercial neighborhoods reward a little exploration beyond the main street.',4),pic('myeongdong.jpg','Central Seoul streets','Away from the main shopping streets, small restaurants can be hidden in alleys.',8)],sources:[source('Korea 101: When a Restaurant Becomes a Movement',originals[3].url),source('Netflix: Culinary Class Wars','https://www.netflix.com/tudum/articles/culinary-class-wars-season-2-release-date-news'),source('Visit Korea: Gwangjang Market','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=106345')],expressions:[
 expression('맛집 추천해 주세요.','matjip chucheonhae juseyo','Please recommend a good restaurant.','근처 맛집 추천해 주세요.','Please recommend a good restaurant nearby.'),
 expression('웨이팅이 얼마나 걸려요?','weitingi eolmana geollyeoyo','How long is the wait?','지금 웨이팅이 얼마나 걸려요?','How long is the wait right now?'),
 expression('여기 맛집이에요?','yeogi matjibieyo','Is this a good restaurant?','여기 진짜 맛집이에요?','Is this place really good?')],
 body:`What if you asked a Korean friend for a restaurant recommendation and they sent you a pin in an alley, a photograph of a soup bowl and a warning that there might be a long wait? That is often more revealing than receiving a list of five-star restaurants.

맛집 (matjip) combines 맛 (taste) and 집 (house or place). Literally, it is a place with good taste, but the word has become a shorthand for a restaurant worth seeking out. It can be a neighborhood soup shop, a barbecue restaurant or a serious fine-dining destination. The price or interior is not the defining feature.

## Food becomes a national conversation

In September 2024 Netflix released Culinary Class Wars, a Korean cooking competition known locally as 흑백요리사. The premise put established, highly recognized chefs alongside talented competitors who were less familiar to the public. Kwon Sung-jun, competing as Napoli Matfia, won the first season and its 300 million won prize. The program brought attention not just to the dishes but to the cooks' identities and restaurants.

For many viewers in Korea, watching the competition was only the beginning. A memorable technique, a chef's story or an unusual ingredient could become a reason to look up the restaurant, try to make a reservation and discuss the experience with friends. This is especially interesting in a country where the question 맛집 어디야? can be an invitation to explore an entirely different neighborhood.

## Old restaurants, new discoveries

Consider Gwangjang Market, which traces its history to 1905. Shoppers and diners encounter bindaetteok (mung-bean pancakes), gimbap and other longstanding street foods. The experience is not about polished service or a quiet interior. It is the heat from the griddle, the sound of an order being called and the opportunity to watch food being prepared.

In Euljiro, a different kind of food experience awaits. Traditional restaurants tucked into older commercial streets serve specialities such as marinated beef ribs or naengmyeon, cold buckwheat noodles with a clear broth. A place such as Wooraeok is a reason to understand why a bowl of cold noodles can be valued even in winter. At Miseongok in Myeongdong, a warm bowl of seolleongtang represents another side of everyday Seoul: simple ingredients, a broth with a character of its own, rice and kimchi.

Although an unfamiliar restaurant may initially look intimidating, a place that specializes in one or two kinds of food is often easy to order from. You are not expected to understand a huge menu. Start with what the kitchen does best, and ask whether a dish is spicy or designed for sharing.

## Do Koreans trust queues?

It is common to see Korean diners waiting outside a tiny restaurant. A waiting line can signal reputation, but it is not proof that the food will suit everybody. Some queues are created by social media trends. Others are simply the result of a small number of seats or an office lunch rush.

Korean diners use several clues together: recommendations from friends, photos of the actual food, reviews on local platforms, price and the consistency of a restaurant over time. Some restaurants serve a narrow menu for decades, and repeat customers come back for a remembered flavor. Others are newly opened destinations with exciting concepts. Both can be 맛집.

An important word to know is 웨이팅 (waiting). It has become ordinary Korean restaurant vocabulary. Some places use an electronic queue system or ask you to leave a phone number, whereas others simply expect you to wait outside. Ask how long the wait is, and check whether you need a domestic phone number to register.

## How to discover your own favorite

Choose a neighborhood first, then a dish. If you want dumplings, Insadong's Gaeseong Mandu Koong gives you a very different lunch from barbecue in Apgujeong. If you want spicy seafood, Chungmuro's small-octopus restaurants are a more specific destination than searching for generic Korean food. A restaurant that excels at tofu stew is not necessarily the right place for grilled meat.

Do not order too much on your first visit. Some Korean dishes come with side dishes and shared portions, and a meal for two can already cover several flavors. Learn the words for extra rice, water, mild spice and delicious. Ask the staff whether a dish contains ingredients you cannot eat rather than making assumptions based on its appearance.

Finding a 맛집 is not a contest to collect famous names. It can be the tiny restaurant near your guesthouse that quietly serves breakfast, or the place you return to on your last day in Seoul because you liked it so much. That personal discovery is what makes the word worth learning.`,
 travel:'#discover=food'
},
{
 id:'seongsu-old-and-new',title:'How an old shoe-making neighborhood became Seoul’s design district',excerpt:'Seongsu’s brick factories, shoemakers, pop-up stores and coffee culture reveal how a city changes without entirely losing its past.',figures:[pic('seoul-coffee.jpg','Coffee in a Seoul café','A café gives visitors time to appreciate the atmosphere of a neighborhood.',4),pic('ddp.jpg','Modern design architecture in Seoul','Seoul’s design culture stretches beyond Seongsu, including Dongdaemun Design Plaza.',8)],sources:[source('Visit Korea: Seongsu-dong','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=112801'),source('Visit Korea: Seoul design and culture route','https://english.visitkorea.or.kr/svc/whereToGo/hdrdslt/hdrdsltView.do?crsSn=283218')],expressions:[
 expression('구경해도 돼요?','gugyeonghaedo dwaeyo','May I look around?','잠깐 구경해도 돼요?','May I look around for a moment?'),
 expression('한정판이에요?','hanjeongpanieyo','Is it a limited edition?','이거 한정판이에요?','Is this a limited edition?'),
 expression('포장할게요.','pojanghalgeyo','I will take this to go.','커피는 포장할게요.','I will take the coffee to go.')],
 body:`There is a particular kind of Seoul street in which an old brick factory, a shoe workshop and an international cosmetics brand can sit within a few minutes of one another. It is not immediately clear which building is a shop, which is still somebody's workplace and which is a temporary exhibition. Welcome to Seongsu, one of the most striking examples of how a neighborhood in Korea can change its identity.

Seongsu is on the eastern side of central Seoul, near the Han River. It developed a reputation as a manufacturing neighborhood, particularly for handmade shoes. Small industrial workshops occupied modest buildings, producing objects that would be sold elsewhere in the city. Unlike a shopping district constructed from the beginning around fashion, Seongsu has an older working landscape.

## When industrial architecture becomes desirable

As the nature of manufacturing and commerce changed, unused industrial premises provided something difficult to find in a dense city: generous floor space, large doors and distinctive interiors. The former warehouse now known as Daerim Warehouse is an emblematic example of how a place devoted to work can become a café and cultural destination.

For a café owner, an original brick wall and high ceiling create an atmosphere that a new interior might try hard to imitate. For an artist, a large room affords flexible exhibitions. For visitors, the contrast between an understated entrance and a dramatic interior can be an experience in itself.

The Korean word 감성 (gamseong) is often used to describe places with a particular sensibility or atmosphere. It is more than simply calling something pretty. A gamseong café may use light, furniture, music and textures to create a mood. Seongsu's converted spaces are a visible expression of that taste, although a beautiful interior is not always a guarantee of a good coffee.

## The pop-up as a destination

Walk near Yeonmujang-gil and you may encounter queues that are not for restaurants. A pop-up store, 팝업스토어, is a shop or exhibition that exists for a limited period. In Seoul these can be elaborate brand experiences with installations, products, photo opportunities and special items. Fashion, skincare, K-pop and lifestyle companies have embraced the format.

For customers, the temporary nature of a pop-up creates an incentive to visit now. For brands, Seongsu brings a concentration of curious visitors who may also share their experiences online. The shop that looked exciting in a photograph from last month may already have disappeared. That is part of the culture, so check the dates and reservation requirements before traveling specifically for one.

This constantly shifting retail environment is the opposite of the old shoe workshops. A shoemaker may have spent decades refining a craft, whereas a pop-up might last a few weeks. Seeing both in the same area gives Seongsu an unusual sense of time.

## A slower side of Seongsu

Seoul Forest, which opened in 2005, offers a useful counterpoint to the busy streets. Plan a walk among the trees before or after exploring shops. The exact scenery changes with the season. In November the remaining autumn leaves and colder light can make the park especially lovely, while winter may make an indoor café more inviting.

One of the best ways to spend a few hours is to choose a small number of stops rather than constantly moving between famous stores. Look at the independent stationery and design objects at POINT OF VIEW, see what is happening around the warehouse cafés, and leave time for the forest. Many visitors enjoy browsing objects that cannot easily be found in a big department store.

## Who benefits when a neighborhood becomes fashionable?

There is a less comfortable side to the transformation: rising commercial rents and the pressure on the older businesses whose work originally shaped the neighborhood. A formerly industrial street that becomes attractive to large brands can become expensive for the artisans or small cafés that gave it character.

As a visitor, you do not have to choose between celebrating contemporary design and appreciating the older trades. Look beyond the most photographed storefront. Notice the architecture and the signs of everyday work, and be respectful if a workshop is not open for browsing. Seongsu is not a museum of old factories. It is a real neighborhood where people have livelihoods. The Korean term 수제화 refers to handmade shoes, and signs using that word offer a direct connection to the neighborhood's manufacturing heritage.

Seoul often changes quickly, but Seongsu gives the visitor a rare chance to see several phases of that change beside one another. The most interesting object you find may not be a limited-edition product at all. It may be an old building that has found another purpose.`,
 travel:'#discover=culture'
},
{
 id:'hongdae-street-stage',title:'Why Hongdae is a stage, not just a shopping district',excerpt:'Buskers, art students, independent musicians and late-night streets tell a story about youth culture in Seoul.',figures:[pic('ddp.jpg','Seoul design architecture','Seoul has multiple creative districts; Dongdaemun Design Plaza is another distinct design landmark.',4),pic('seoul-coffee.jpg','Coffee at a café','A much quieter kind of Hongdae afternoon can start in a small café.',8)],sources:[source('Visit Seoul: Hongdae R2','https://english.visitseoul.net/attractions/HONGDAE-R2/ENPjggl5r'),source('Visit Seoul: Nighttime adventures','https://english.visitseoul.net/MapoArea/Nighttime-Adventures-in-Seoul/ENP000032')],expressions:[
 expression('공연은 언제 시작해요?','gongyeoneun eonje sijakhaeyo','When does the performance start?','오늘 공연은 언제 시작해요?','When does today’s performance start?'),
 expression('사진 좀 찍어도 돼요?','sajin jom jjigeodo dwaeyo','May I take a photo?','공연 사진 좀 찍어도 돼요?','May I take a photo of the performance?'),
 expression('사진 좀 찍어 주실래요?','sajin jom jjigeo jusillaeyo','Would you take a photo for me?','저희 사진 좀 찍어 주실래요?','Would you take a photo of us?')],
 body:`You are walking near Hongik University Station when you hear a song coming from a side street. A small crowd has formed around a singer with a microphone. A few blocks later, dancers are rehearsing in front of an audience. People stop, cheer, film a few seconds and continue on their way. In Hongdae the boundary between an ordinary street and a stage can be surprisingly thin.

Hongdae is the shortened name for Hongik University (홍익대학교), an institution particularly associated with art and design. The neighborhood’s creative identity has long extended beyond the campus. Independent musicians, artists, small venues and young audiences formed a scene that did not depend entirely on the large entertainment companies associated with Korean pop music.

## Seoul’s other music story

When we hear about Korean music abroad, we often think first of internationally famous K-pop groups. But the public's experience of music in Korea is much broader. Hongdae's indie culture grew through clubs and small live spaces, particularly from the 1990s onward. Musicians could experiment with styles that were not necessarily suited to mainstream television.

The experience was intimate: an audience standing close to a band, a room that might hold fewer people than a large café and a chance to discover artists before they became widely known. Hongdae's creative reputation owes much to this smaller scale. The neighborhood has changed substantially, but the habits of listening, discovering and supporting a performance remain important.

## Street performance is a kind of practice

Busking brings that energy outside. A dancer might use a performance as a rehearsal, a way to meet fans or an opportunity to develop confidence. Singers can try a new song in front of strangers. On designated streets, rules and booking arrangements can govern where and when performers may appear; a busy pedestrian area does not mean that anyone can set up equipment anywhere.

This matters to the audience as well. Give the performers enough space, avoid blocking people trying to pass, and do not step into the performance area for a better photograph. Public settings are not an automatic invitation to film every close interaction. Ask if you are unsure. It is normal to applaud, and some performers have a way of accepting voluntary support.

## Two faces of the neighborhood

Hongdae is often advertised as a nightlife district. At night the lights become brighter, restaurants fill, and bars and clubs attract both local and international visitors. If you want to see street performances, evening can be rewarding, though there is no guarantee of a particular busker or set time.

Come in the daytime and you can have quite another experience. There are design shops, vintage clothes, small stationery stores, cafés and nearby Yeonnam-dong streets that make lovely walking routes. A student browsing materials for a design project might be just as characteristic of the neighborhood as a group of visitors heading out for drinks.

Try an afternoon around Hongik University and Yeonnam-dong, a leisurely meal and then one area of busking streets in the evening. Leave enough time to wander. If you want a live club performance rather than incidental street music, research the venue and ticket schedule in advance.

## What changed as Hongdae became famous?

The neighborhood has attracted international travelers and retail chains, and that visibility brings a complicated trade-off. Popularity offers performers exposure and businesses new customers, while rising cost and noise can place pressure on smaller venues and residents. Some of the creative scenes that once concentrated near the university have extended into adjoining areas such as Sangsu and Hapjeong.

A visitor may therefore find the most memorable music experience outside the very busiest shopping street. An independently organized gig, an exhibition or a quieter record shop can introduce a different layer of Seoul. Not every interesting cultural experience is the one with the longest queue.

One particularly useful cultural word is 홍대 감성, literally the Hongdae sensibility. It may refer to an independent, slightly unconventional aesthetic, whether in music, clothing or a café interior. The phrase is subjective and occasionally used with humor. For a traveler, it is better understood as a clue about a style of place than as an official label. Ask a local friend what they associate with Hongdae and you might receive a completely different answer from someone of another generation.

The next time you hear music while walking through Hongdae, pause for a few minutes if you can. The performer might be a student, a professional, an aspiring artist or someone who simply loves the feeling of sharing a song. You do not have to understand each Korean lyric to participate. Listening attentively is already a small form of connection.`
},
{
 id:'small-bow-korean-hello',title:'Why a small bow changes the meaning of hello in Korea',excerpt:'A slight nod, a polite ending and a choice of words reveal how Koreans navigate relationships without saying much at all.',figures:[pic('palace.jpg','Historic Korean palace','Korea’s built heritage recalls a long history of social rituals and respect.',3),pic('cafe-conversation.webp','Illustrated coffee handoff','AI editorial illustration. Modern greetings vary with the situation.',8)],sources:[source('Visit Seoul: Korean etiquette','https://english.visitseoul.net/tours/Korean-Etiquette/ENN010938'),source('National Institute of Korean Language','https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=261&qna_seq=318182')],expressions:[
 expression('안녕하세요.','annyeonghaseyo','Hello, politely.','안녕하세요. 처음 뵙겠습니다.','Hello. It is a pleasure to meet you.'),
 expression('만나서 반가워요.','mannaseo bangawoyo','Nice to meet you.','오늘 만나서 반가워요.','It is nice to meet you today.'),
 expression('수고하셨습니다.','sugohasyeotseumnida','Thank you for your hard work.','오늘도 수고하셨습니다.','Thank you for your hard work today.')],
 body:`In Korea you can sometimes witness an entire conversation in the space of a second: two people approach each other, one makes a small bow and the other returns it. They may not even stop walking. The gesture is so ordinary that it is easy to miss, particularly if you are accustomed to greetings involving handshakes, embraces or cheek kisses.

The interesting thing is not that Koreans bow. Many societies have forms of respectful bodily greeting. It is that the degree of formality, the accompanying words and the situation all work together. A nod in a café and a formal bow in a serious ceremony do not have exactly the same meaning.

## How history enters a modern greeting

For centuries, Confucian ideas influenced social relationships on the Korean Peninsula, particularly during the Joseon dynasty (1392–1910). Respect for elders, attention to family relationships and formal rituals became important elements of education and social order. The practices have changed enormously since then. Today's Seoul is a modern city with a variety of workplaces, lifestyles and attitudes.

Nevertheless, the language of respect remains part of daily interaction. You might notice a younger person speaking with polite endings to an older colleague, or two people using formal language at a first meeting. The choice is not solely determined by age. Professional roles, familiarity and the social setting matter too.

The Korean greeting 안녕하세요 is useful because it is polite without being excessively ceremonial. Pair it with a small natural nod, and you can use it in most everyday encounters. A visitor does not need to calculate a perfect angle of bow or imitate a formal ancestral ritual.

## The grammar of becoming friends

The language itself expresses distance and familiarity. When two people meet, they will often begin using 존댓말 (jondaetmal), polite speech. Friends of similar age may eventually agree to use 반말 (banmal), casual speech. They might ask 말을 놓아도 될까요? (May we speak casually?). The change is sometimes negotiated because it signals a shift in the relationship.

For a learner, this can feel complicated at first. You may know the word for hello but discover that 안녕 and 안녕하세요 create different impressions. 안녕 is perfectly natural between friends or when addressing a younger child. With strangers, a shop employee or someone you have just met, 안녕하세요 is generally a more comfortable choice.

Koreans do not use these forms identically. Some workplaces encourage informal address and some young people move quickly to first names. Families differ too. Listen to how others speak and, when in doubt, start politely. Someone can invite you to speak casually later.

This distinction also explains why a literal translation from English can occasionally sound strange. Korean speakers often avoid an explicit word for you, particularly when speaking politely. They can use a person's name with an appropriate title, a role such as 선생님 (teacher), or simply omit the subject when it is obvious. When a shop assistant asks whether you need help, the question may contain no pronoun at all. Learning whole sentences in context is more valuable than trying to translate each individual English word.

## Greetings in real situations

Imagine walking into a small independent shop. A simple 안녕하세요 can acknowledge the staff without requiring a conversation. When meeting a new person through a Korean friend, 만나서 반가워요 is warmer than repeating hello. At a workplace meeting, a handshake may accompany a modest bow, depending on the people involved.

When leaving a café, 감사합니다 (thank you) works well. After a group activity, 수고하셨습니다 is a phrase you may hear between coworkers or people who have completed a task together. It recognizes the effort someone has made. However, its use with a much more senior person can depend on workplace custom, so follow the lead of your Korean colleagues.

The polite use of two hands, such as receiving a business card or offering something to an elder, reflects a similar concern with acknowledging the other person. You will notice such gestures when dining, exchanging gifts or making introductions.

## Small gestures, not a checklist

It is tempting to read a list of Korean etiquette and worry that each mistake will offend someone. That is rarely a helpful way to approach a real meeting. Most people appreciate genuine respect and recognize that a visitor or language learner may not know every convention. A warm, ordinary hello is often much more welcome than an exaggerated unfamiliar performance.

At the same time, noticing these gestures can help you understand why Korean conversation feels the way it does. The small bow at the beginning and the polite ending of a sentence say something about how the speakers understand their relationship. Learning Korean is therefore not only about memorizing words. It is also about learning how those words make another person feel.`
},
{
 id:'one-coffee-in-korean',title:'Why do Koreans drink iced coffee even in winter?',excerpt:'From Seoul’s historic coffee houses to 얼죽아, the stubborn love of iced Americanos is an everyday ritual worth understanding.',figures:[pic('insadong.jpg','Older commercial street in Seoul','Seoul’s older commercial neighborhoods provide a contrast to contemporary café design.',3),pic('cafe-conversation.webp','Illustrated coffee handoff','AI editorial illustration. Cafés provide meeting and resting spaces throughout the city.',8)],sources:[source('Visit Korea: Hakrim café','https://english.visitkorea.or.kr/svc/sp/HallyuNew/contentsView.do?dataSetId=70&menuNm=tour&page=1&vcontsId=250745'),source('Korea Herald: Iced Americanos in winter','https://www.koreaherald.com/article/3268846'),source('Korea JoongAng Daily: Cold coffee culture','https://www.koreajoongangdaily.com/kjd-special/why-its-cold-in-korea-why-is-everyone-drinking-iced-americanos/12049349')],expressions:[
 expression('아메리카노 한 잔, 주세요.','amerikano han jan, juseyo','One Americano, please.','아이스 아메리카노 한 잔 주세요.','One iced Americano, please.'),
 expression('얼죽아예요.','eoljukayeyo','I am an iced-Americano-even-in-winter person.','저는 겨울에도 얼죽아예요.','Even in winter I insist on an iced Americano.'),
 expression('따뜻한 걸로 주세요.','ttatteuthan geollo juseyo','A hot one, please.','오늘은 따뜻한 걸로 주세요.','Today I would like a hot one, please.')],
 body:`It is a cold November morning in Seoul. People crossing the street are wearing padded jackets, and several of them are holding transparent cups with ice cubes clinking inside. If you grew up in a country where a hot drink is the natural companion to a cold day, this scene can be quite surprising.

There is even a Korean word for it: 얼죽아 (eoljuk-a), a playful shortening of 얼어 죽어도 아이스 아메리카노. It literally means that even if you freeze to death, you will choose an iced Americano. Of course nobody means the expression literally. It is a humorous declaration of preference, and a small example of how Koreans turn everyday habits into language.

## Coffee before the modern coffee shop

Coffee culture has a longer history in Korea than the proliferation of contemporary coffee chains suggests. The older Korean coffee houses known as 다방 (dabang) were places for conversation, meetings and music. One particularly well-known example is Hakrim, which opened in 1956 near what is now Seoul's Daehangno cultural district. Its long history is associated with students, writers, artists and intellectual life.

These cafés served a social purpose in a city still rebuilding after the Korean War. In later decades, instant coffee, coffee mixes and office coffee became familiar parts of daily life. Large contemporary cafés and independent specialty coffee shops then made espresso-based beverages much more visible.

There is still an interesting contrast between a small old-fashioned coffee room and the modern café with an enormous illuminated menu, a kiosk and takeaway cups. Both can offer a place for people to talk, but the rituals around the drink have changed.

## Why iced Americanos?

An Americano is espresso diluted with water; the iced version uses cold water and ice. Its relatively light texture makes it an easy drink after a rich lunch. It is usually among the least elaborate options on a coffee menu, without milk, whipped cream or extra syrup unless requested.

Several ordinary features of Seoul life help explain its appeal. A person might pick up a coffee on the short walk back to an office, or carry it into a warm indoor space. Someone who spends much of the day in heated offices and subway trains may not think of their drink primarily as protection from outdoor cold. Personal taste, habit and the convenience of a readily available coffee all matter.

It is also fun to identify with a familiar preference. Korean conversation contains many playful shortened expressions, and 얼죽아 is one of the most recognizable in winter. Some people jokingly present themselves as committed members of the iced coffee camp, while friends insist on a hot latte or tea.

## A café as a place, not just a counter

In Seoul it is possible to choose a café for reasons almost unrelated to the drink. One may have a beautiful view, comfortable seating or quiet music. Another specializes in unusual desserts or freshly roasted beans. Large independent cafés in neighborhoods such as Seongsu may use converted industrial spaces, while tiny shops elsewhere serve office workers during the lunch rush.

Some customers use cafés as temporary workspaces or places to study. Others meet a friend over two drinks and share a dessert. That is why 매장에서 (for here) and 포장 (takeaway) are useful words when ordering. If you want to stay and rest, choose the former. If you want to keep walking, choose the latter.

## Ordering like a local, without memorizing a menu

The counter might ask 따뜻한 거요, 아이스요? (Hot or iced?). You can simply answer 아이스로 주세요. If you normally take a different size from the one available, ask 어떤 사이즈 있어요? (What sizes do you have?). Some cafés use self-service touchscreens, but the same words appear on the screen.

There is another little feature worth noticing: Koreans use 한 잔, 두 잔, 세 잔 to count cups or glasses of a drink. That is why 아메리카노 두 잔 주세요 sounds natural when ordering two coffees, rather than directly attaching the number to the beverage name. This familiar construction travels well across situations. A glass of water is 물 한 잔, and a cup of tea is 차 한 잔. Once you learn the pattern, a small piece of Korean grammar becomes useful every time you go to a café.

The next time you see someone drinking an iced coffee on a freezing day in Korea, you will know there is even a word for that choice. Try using it in a conversation rather than treating it as a rule that every Korean follows. Ask a friend whether they are 얼죽아. They may immediately laugh, disagree and explain their own preference.`
},
{
 id:'seoul-cafe-table',title:'A phone on the table. Where did its owner go?',excerpt:'Why someone might leave a phone to hold a café seat in Korea, and what this everyday habit reveals about trust, social expectations and personal boundaries.',originalUrl:originals[4].url,phrase:'자리 먼저 잡고 주문하나요?',figures:[pic('cafe-conversation.webp','Illustrated coffee handoff','AI editorial illustration of a shared café setting.',3),pic('myeongdong.jpg','Busy Seoul neighborhood','Busy commercial areas create a very different setting from a quiet neighborhood shop.',7)],sources:[source('Korea 101: The Strangest Thing in Korean Cafés',originals[4].url),source('The Korea Times: Café space and social norms','https://www.koreatimes.co.kr/opinion/blogs/korea-deconstructed/20230429/maeum-spacing'),source('The Korea Times: Changing café rules','https://www.koreatimes.co.kr/southkorea/society/20250808/fed-up-with-seat-hogs-coffee-shop-chains-take-tougher-stance')],expressions:[
 expression('자리 먼저 잡고 주문하나요?','jari meonjeo japgo jumunhanayo','Do we find a seat before ordering?','여기는 자리 먼저 잡고 주문하나요?','Do we find a seat before ordering here?'),
 expression('여기 자리 있어요?','yeogi jari isseoyo','Is this seat available?','실례지만 여기 자리 있어요?','Excuse me, is this seat taken?'),
 expression('금방 올게요.','geumbang olgeyo','I will be right back.','화장실 다녀올게요. 금방 올게요.','I am going to the bathroom. I will be right back.')],
 body:`Look around a café in Seoul. There is a phone on one table, a bag on another and perhaps a laptop beside an unfinished drink. There are no people sitting at those tables. To many visitors, this is the beginning of a mystery: where are the owners, and why have they left their valuable belongings in full view?

In many Korean cafés the answer is simple. A customer has chosen a table, left something on it to mark the seat and gone to order. Another may have stepped away to the restroom. The everyday assumption that the items will still be there a few minutes later can be surprising to visitors from places where even a short absence would seem risky.

## The meaning of a reserved seat

The expression 자리 잡다 (jari japda) means to take or secure a place. In a self-service café, especially a busy one, customers may want to find somewhere to sit before placing their order. The belongings on a table function as an informal sign: someone is using this seat, even if temporarily absent.

There is a practical reason for the sequence. After ordering, a customer may need to wait at the counter or collect a tray. It is easier to do that when they know where they will sit. A jacket or bag indicates that the place is already occupied, and other customers generally move on.

However, different cafés operate differently. A small shop might ask customers to order before sitting down, while a popular café may have a staff-managed queue. If you are new to the place, you can ask whether you should reserve a seat before ordering. That is more helpful than assuming every Korean café follows the same procedure.

## Is it really all about security cameras?

South Korea's widespread use of cameras in commercial and public spaces is one part of the environment, but cameras alone do not explain the entire social experience. When someone is seen taking an object that clearly belongs to another person, there can be immediate social consequences. Other customers may notice, the staff may intervene and the person may be judged for violating a basic expectation.

This is the idea of social cost: the possible embarrassment, disapproval or loss of trust connected with a behavior, quite apart from any formal legal consequence. People learn such expectations through ordinary interactions. The café table is one small setting in which they become visible.

None of this is a guarantee against theft. A café is still a public space, and visitors should keep passports, wallets, phones and other valuable possessions with them. The fact that someone else takes a risk comfortably does not mean you have to take the same risk.

## When the custom becomes frustrating

Korean café culture also has a complicated relationship with the use of space. In study-oriented neighborhoods or near universities, cafés may have customers who bring laptops and stay for hours. This is sometimes convenient for students or remote workers, but another customer may struggle to find a seat. In 2025, reports described coffee chains taking a firmer approach to customers occupying excessive space or leaving equipment unattended.

There is a difference between a person who steps away for two minutes to collect their drink and a person who uses several tables for hours. The same assumption of trust does not entitle somebody to inconvenience everyone else.

Many independent cafés set their own time limits or ask customers to order one drink per person when busy. Listen to staff and check signs. If you want to work for a long time, choose a place that explicitly welcomes it.

## A small cultural observation, not a universal rule

Perhaps the most interesting part of this seemingly ordinary custom is how quickly we become accustomed to the social habits around us. Someone who grows up carefully holding their bag in a café may notice this Korean practice immediately. Someone who has spent years seeing friends leave a jacket on a chair may not think it unusual at all.

Learn the phrase 자리 있어요? and pay attention to the context. When accompanied by a gesture toward a chair, it can be a way of asking whether the seat is available or already occupied. A simple question avoids awkwardly moving somebody's bag. An alternative is 여기 앉아도 돼요? (May I sit here?), which makes the intended meaning particularly clear.

The next time you visit a café in Korea, notice the little arrangements people make with each other, while keeping your own belongings safe. Ordinary social trust can be fascinating precisely because it is never announced.`
},
{
 id:'tteokguk-seollal',title:'Seollal: when Korea begins a new year with a bowl of soup',excerpt:'An ancient holiday, an unusually quiet Seoul, family rituals and a bowl of rice cake soup reveal why the Lunar New Year matters so much.',originalUrl:originals[5].url,phrase:'새해 복 많이 받으세요.',figures:[pic('bongeunsa.jpg','Traditional temple architecture in Seoul','Traditional architecture recalls the layers of Korean history; this is not a depiction of a Seollal ceremony.',4),pic('market.jpg','Korean food market','Holiday groceries and family meals are an important part of preparing for Seollal.',9)],sources:[source('Korea 101: Seollal',originals[5].url),source('Visit Korea: Seollal','https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=372&vcontsId=140038'),source('Korea.net: The international age system','https://www.korea.net/NewsFocus/Society/view?articleId=226819')],expressions:[
 expression('새해 복 많이 받으세요.','saehae bok mani badeuseyo','Happy New Year (receive lots of good fortune).','할머니, 새해 복 많이 받으세요.','Grandmother, Happy New Year.'),
 expression('떡국 드셨어요?','tteokguk deusyeosseoyo','Have you had rice cake soup?','설날에 떡국 드셨어요?','Did you have rice cake soup on Seollal?'),
 expression('집콕할 거예요.','jipkokhal geoyeyo','I am going to stay at home.','연휴에는 집콕할 거예요.','I am going to stay home over the holiday.')],
 body:`In a busy city like Seoul, there are very few days when office districts become unusually quiet, the traffic rhythm changes and families leave for towns and cities elsewhere in the country. One of those occasions is Seollal (설날), Korea's Lunar New Year. Its date changes according to the lunar calendar, usually falling in late January or February. Koreans celebrate with a customary holiday period of three days, although weekends may affect the length of the break.

For visitors, it is a particularly fascinating time. Some familiar shopping streets may still be lively, but family-run shops and restaurants may close. Trains and buses connecting Seoul to other regions can be booked far ahead. For many families the preparations begin well before the day itself.

## More than a thousand years of history

Lunar New Year observances have deep roots in Korean history, reaching back to the era of the Three Kingdoms, which lasted until the seventh century. In an agricultural society the new year was a natural time for wishes of prosperity, health and a good harvest. Family and community rituals grew around these hopes.

During the Japanese colonial period (1910–1945), the authorities promoted the solar-calendar New Year over the traditional Lunar New Year. Families nevertheless continued many traditional observances. The official holiday status of the lunar new year changed in the decades after liberation in 1945. In 1989, it regained its familiar three-day public holiday form under the name Seollal.

Today the festival combines older practices and contemporary choices. Some families maintain elaborate rituals, while others travel, eat together without a ceremony or simply use the break to rest.

## What happens on the morning of Seollal?

Some households prepare a 차례 (charye), an ancestral memorial rite, with special foods arranged for the occasion. A family may visit an ancestral grave as part of 성묘 (seongmyo), although timing and customs differ. Preparing the food takes time, and contemporary families sometimes simplify their arrangements or share the work differently.

Children may perform 세배 (sebae), a respectful New Year's bow to older family members, and receive words of encouragement as well as 세뱃돈 (money given after the bow). It is easy to see why children look forward to this moment. The customary greeting 새해 복 많이 받으세요 expresses a wish for abundant good fortune in the new year.

Families also play 윷놀이 (yutnori), a traditional board game involving four wooden sticks. The team moves its pieces according to how the sticks land. Part of the enjoyment is watching relatives debate strategy, celebrate lucky throws and tease one another.

## A bowl of soup and another year of age

The most symbolic holiday food is 떡국 (tteokguk), soup with thin oval slices of rice cake, often served with broth, egg and other garnishes depending on the household. The white rice cakes suggest a fresh beginning; their rounded shapes are sometimes associated with prosperity. Other holiday foods include jeon, savory battered and pan-fried dishes, various seasoned vegetables, meat dishes and traditional sweets.

Koreans often joke that eating a bowl of tteokguk means becoming one year older. This connects the food to a broader tradition in which the new year was associated with an increase in age. It is useful to understand the difference between that custom and the way age is calculated today.

Under the older Korean counting method a child could be considered one at birth, with age increasing at the start of a new calendar year. International age starts at zero and increases on one's birthday. In June 2023 South Korea standardized international age for most legal and administrative purposes, with certain statutory exceptions. Korean people may still discuss birth years or traditional counting informally. The bowl of soup is a delightful cultural expression, not a legal rule.

## Visiting Korea during the holiday

Plan transportation and meals in advance, check individual opening hours and enjoy a slower pace rather than expecting ordinary business activity. Palaces and cultural institutions sometimes offer holiday programs; check the dates of the particular year you visit.

There is a lovely reason to learn the word 연휴 (a consecutive holiday period). Before Seollal, it is common to hear 연휴에 뭐 하세요? (What are you doing over the holiday?). Someone might explain that they are going to see family, or reply with the much more informal 집콕, a humorous way of saying they are staying home. Both responses fit modern Seollal.

Seollal is not just a holiday you can explain through a list of customs. For many Koreans, it is a chance to pause, share food and begin again. That feeling is perhaps the best way for someone from another culture to understand it, even if the rituals themselves are unfamiliar.`
},
{
 id:'busan-two-kinds-of-day',title:'Busan is more than a beach: two sides of Korea’s port city',excerpt:'From a hillside shaped by the Korean War to fish-market mornings and the lights of Gwangalli, Busan offers a different rhythm of Korean life.',figures:[pic('jagalchi.jpg','Jagalchi Market area','The market and harbor express the port city’s connection to seafood and commerce.',4),pic('gwangalli.jpg','Gwangalli waterfront','The bridge and evening waterfront show another side of Busan.',8)],sources:[source('Visit Korea: Busan travel information','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140654'),source('Visit Busan','https://www.visitbusan.net/index.do?menuCd=DOM_000000301001001000')],expressions:[
 expression('지하철역이 어디예요?','jihacheolyeogi eodiyeyo','Where is the subway station?','가까운 지하철역이 어디예요?','Where is the nearest subway station?'),
 expression('회 추천해 주세요.','hoe chucheonhae juseyo','Please recommend sashimi.','오늘 회 추천해 주세요.','Please recommend some sashimi today.'),
 expression('바다 보러 가요.','bada boreo gayo','Let’s go see the sea.','저녁에 바다 보러 가요.','Let’s go see the sea in the evening.')],
 body:`A visitor who has spent several days in Seoul may imagine Busan as a smaller version of the capital, with a beach attached. But the port city's landscape and history have given it a personality of its own. The sea appears in the food, the views, the streets and even the practical way a visitor should plan a day.

There is a reason not to try to see all of Busan in one afternoon. The old port neighborhoods in the west and the famous beaches toward the east are quite far apart. Choose the kind of day you want first: history, market streets and hillside lanes, or a slower waterfront day. The neighborhoods themselves will tell you a great deal about the city.

## A city shaped by the Korean War

Busan became a crucial refuge during the Korean War (1950–1953), when large numbers of displaced people arrived in the southeastern port. It served as the temporary capital for much of the war. Housing expanded into the hills surrounding the city, leaving a distinctive landscape of stepped lanes and houses built close to one another.

Gamcheon Culture Village is one of the most visible examples of Busan's hillside character. Its brightly painted buildings and later public-art projects have made it a popular destination. Yet the village is not simply an open-air photo studio. It is a residential area with a history connected to displacement and community life.

Visitors should therefore walk on designated paths, respect private houses and avoid excessive noise. The hills can be surprisingly steep. Instead of racing toward a single famous viewpoint, make time to understand the narrow lanes, the surrounding mountains and how the neighborhood relates to the port below.

## A morning in the old port

Jagalchi Market introduces the city's relationship with the sea particularly directly. The assortment of fish, shellfish and other seafood can be unfamiliar to an overseas visitor. Some market businesses sell seafood which may then be prepared for eating, while established restaurants offer fixed menus.

Ask about prices, whether preparation fees are included and how much food a portion serves before ordering. A group may want to share several dishes, but a solo traveler may find a set meal easier. 회 (hoe) refers to raw sliced fish or seafood, often served with sauces and accompaniments in Korea. If raw seafood is not for you, consider cooked fish, soup or a grilled meal.

Nampo-dong and the streets around the harbor are natural companions to a market visit. They offer a mix of older shopping streets and newer attractions. A reasonable first day might begin in Gamcheon, include the market at lunchtime and end around Nampo, without rushing all the way across the city.

## The other Busan: a walk along the sea

Haeundae offers a different kind of day. The beach, high-rise buildings and contemporary hotels provide a compelling visual contrast to the older port area. Even outside swimming season, the beach can be a good destination for a walk. Winter winds may be much colder than the sunlight suggests, so carry an extra layer.

Gwangalli is particularly memorable around sunset and in the evening, when views toward Gwangan Bridge become part of the experience. The waterfront is lined with places to stop for a meal or coffee. It is an appealing choice if you want to end the day without a packed schedule of landmarks.

A second day might combine a Haeundae walk in the morning and Gwangalli at night, with sufficient time for transit between them. Check public transport rather than assuming the two beaches are just a short stroll apart.

## Listen as well as look

You may hear expressions spoken with the distinctive rhythm of the southeastern Gyeongsang dialect. It is not a substitute for standard Korean learning, nor does every Busan resident speak the same way. But the intonation is a reminder that Korean is not culturally uniform across the country.

An expression often associated with the region is 밥 묵었나? (Have you eaten?), with the regional verb form 묵다. It can sound quite different from the polite standard 밥 먹었어요? and the ending is informal, so it is not something to use with any stranger you meet. More importantly, asking whether somebody has eaten can express concern and familiarity rather than a need for a detailed account of their lunch. Listening to such small differences can be as rewarding as visiting another sight.

Busan's character is not contained in a list of places alone. It is visible in the contrast between a fish-market breakfast and an evening by the bridge, a steep residential lane and a large sandy beach. Give yourself enough time to experience both if you can.`
},
{
 id:'airport-first-journey',title:'The first little adventure in Korea begins at the airport',excerpt:'How a transport card, a subway map and an understanding of Korean station exits can make your first hours in Korea feel much less mysterious.',figures:[pic('coex.jpg','Interior of Seoul’s COEX complex','Large commercial complexes make nearby station and exit information particularly useful.',3),pic('myeongdong.jpg','Central Seoul street','Accurate neighborhood and exit information can save a long walk with luggage.',8)],sources:[source('Visit Korea: Transportation in Korea','https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=469&vcontsId=140654'),source('Airport Railroad','https://www.arex.or.kr/'),source('Incheon International Airport','https://www.airport.kr/')],expressions:[
 expression('지하철역이 어디예요?','jihacheolyeogi eodiyeyo','Where is the subway station?','공항철도 지하철역이 어디예요?','Where is the Airport Railroad subway station?'),
 expression('몇 번 출구예요?','myeot beon chulguyeyo','Which exit number is it?','호텔은 몇 번 출구예요?','Which exit is the hotel near?'),
 expression('교통카드 충전해 주세요.','gyotongkadeu chungjeonhae juseyo','Please top up my transport card.','교통카드 만 원 충전해 주세요.','Please top up my transport card with 10,000 won.')],
 body:`You have spent hours on an airplane, collected a suitcase and perhaps managed your first 안녕하세요 at immigration or a shop. Now you need to get to your hotel. This is a stage of the journey that can feel intimidating, yet it is also an introduction to a particularly interesting part of Korean daily life: public transport.

South Korea's urban transit is an essential part of everyday routines, from students going to university to office workers traveling across Seoul. With a little knowledge of the way stations, trains and payment systems work, your first journey can be a useful learning experience rather than a source of unnecessary stress.

## The airport is not the city center

Incheon International Airport opened in 2001 and is located west of Seoul, on Yeongjong Island. It is important to understand that arriving there does not mean you are already in central Seoul. The best route depends on the terminal, destination, luggage and time of day.

The Airport Railroad (AREX) offers a dedicated rail connection. Its express service and all-stop service have different stopping patterns and ticket arrangements. The express train goes to Seoul Station from the airport, whereas the all-stop service serves several intermediate stations, including useful connections to other parts of the city. If your hotel is near Hongik University, for example, an all-stop train may be a more practical choice than traveling to Seoul Station and backtracking.

Airport limousine buses can be convenient for travelers with luggage because some routes serve major hotel and neighborhood stops. Confirm that the precise stop is in operation and how far you will have to walk from it. Taxis may make sense for a group or difficult-to-reach accommodation, but the cost and journey vary with the destination and traffic.

## A transport card changes the experience

You may see the word 교통카드 (gyotong kadeu), which refers to a transport card. Cards such as T-money are widely used on urban public transportation. You can typically purchase and recharge compatible cards at appropriate sales points and convenience stores, but methods of payment and coverage may vary. Check the current requirements when buying one.

The ordinary rhythm of riding a bus or metro involves tapping in, and when applicable tapping out, rather than buying a separate ticket at each station. Transfers can also be part of an integrated fare system subject to the relevant rules. Do not confuse a standard rechargeable card with a time-limited pass or a card that comes with other tourist services; the coverage may differ.

Keep a small amount of cash available when you first arrive, especially if your payment card is not accepted at a particular machine. The phrase 충전해 주세요 (please top it up) is a practical tool in a convenience store.

## Learn to notice the station exit number

A large Seoul subway station can have many exits opening onto different streets or even different sides of a wide road. Local directions often reference a numbered exit, rather than simply naming the station. Finding the correct exit can save you a surprisingly long walk.

Before you leave the airport, save the exact address and Korean name of your hotel. Look up the recommended station and exit, and check whether there is a lift or escalator if you have luggage. Some navigation services provide route guidance at different levels of detail. A Google Maps place search is useful for locating a destination, while Korean transit apps may offer more specific real-time routing.

## A few simple habits

Allow extra time during your first transfer. Follow directional signs instead of assuming that the two platforms are side by side. Let passengers leave the train before boarding, and notice priority seats and platform markings. If you are unsure, a short polite question is usually enough: 몇 번 출구예요? asks which exit number you need.

If you arrive at Gimpo instead of Incheon, do not blindly follow a guide written for Incheon. Gimpo connects directly to different rail and subway lines and is much closer to many western Seoul neighborhoods. In Busan, Gimhae International Airport has its own light rail connection, requiring different transfers depending on the destination. The Korean name of your destination, the airport name and the neighborhood are more useful than memorizing one supposedly universal airport route.

The first hour of a new country does not need to be an endurance test. Pick a route based on your accommodation and energy, rather than on the idea that one mode is always cheapest or fastest. Once you have taken the first train or bus and understood how the station works, the rest of your stay will already feel a little more familiar.`
}
];
module.exports={issues,originals,source,expression,pic};
