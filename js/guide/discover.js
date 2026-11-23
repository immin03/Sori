import {icon} from '../ui-icons.js';
import {esc} from './postcards.js?v=mobile2';

import {seoulCatalogue} from './seoul-catalogue.js';
import {seoulPhotos} from './seoul-photos.js';
const entry=(id,category,type,name,ko,area,address,detail,visit,budget,source='')=>({id,category,type,name,ko,area,address,detail,visit,budget,source});
export const places=[
 entry('lotte-lights','christmas','Lights & decorations','Lotte Department Store Main Branch','롯데백화점 본점','Myeongdong','81 Namdaemun-ro, Jung-gu, Seoul','Department store windows, elaborate lights and festive displays.','Go after dark; walk to Shinsegae Square afterward. Outdoor displays, weather permitting.','Free outdoors'),
 entry('shinsegae-square','christmas','Lights & decorations','Shinsegae Square','신세계백화점 본점','Myeongdong','63 Sogong-ro, Jung-gu, Seoul','A giant illuminated facade with a seasonal media show. Sori’s November guide lists Nov 6–Jan 31, 17:00–midnight.','Best after sunset. Recheck the current show schedule; use pedestrian areas for photos.','Free outdoors','https://www.shinsegaegroupnewsroom.com/shinsegae-christmas-reveals-landmark-square/'),
 entry('hyundai-village','christmas','Indoor displays','Christmas in New York City at The Hyundai Seoul','더현대 서울','Yeouido','108 Yeoui-daero, Yeongdeungpo-gu, Seoul','A New York-themed holiday installation fills the fifth floor from November 10 through December 31.','Check reservations and walk-in queue before going. Pair with Jinjujip; check its Sunday closure.','Display generally free','https://ehyundai.com/newPortal/EV/EV000003_14_V.do?eventCd=B0349900&eventNo=37057'),
 entry('coex-library','christmas','Indoor displays','Starfield Library, COEX','별마당도서관','Gangnam','513 Yeongdong-daero, Gangnam-gu, Seoul','The towering shelves frame a Korean Christmas scene inspired by the painted royal screen and dokkaebi folklore.','Good on a cold or rainy afternoon. Check the seasonal installation before leaving.','Free entry','https://www.shinsegaegroupnewsroom.com/starfield-library-brings-k-christmas-to-the-world/'),
 entry('jamsil-market','christmas','Christmas markets','Lotte Town Christmas Market','롯데타운 크리스마스 마켓','Jamsil','300 Olympic-ro, Songpa-gu, Seoul','Outdoor market at World Park with festive stalls and lights. The November guide lists Nov 19–Jan 3, 11:30–22:00.','Check current dates, ticket types and entry reservation rules. Bundle with Lotte World Mall.','Entry and purchases vary','https://www.yna.co.kr/view/AKR20261107022600030'),
 entry('flower-market','christmas','Gifts & decorations','Express Bus Terminal Flower Market','고속터미널 꽃시장','Gangnam','194 Sinbanpo-ro, Seocho-gu, Seoul','Artificial trees, wreaths, ribbons and seasonal ornaments on the third floor.','Many shops close earlier than malls; visit in daytime and check Sunday closures.','Shopping varies'),
 entry('miseongok','food','Soup & stews','Miseongok','미성옥','Myeongdong','25-11 Myeongdong-gil, Jung-gu, Seoul','Milky ox-bone soup (seolleongtang) and sliced boiled beef. Add salt and scallions to taste.','Excellent warm breakfast in an alley behind the main shopping streets.','₩15–20k'),
 entry('sarangbang','food','Soup & stews','Sarangbang Kalguksu','사랑방칼국수','Chungmuro','46 Toegye-ro 27-gil, Jung-gu, Seoul','Chicken baeksuk: tender boiled chicken, broth and rice; kalguksu noodles also available.','Casual local lunch. Check Sunday hours and peak-time queue.','₩10–15k'),
 entry('joseonok','food','Meat & grill','Joseonok','조선옥','Euljiro','6-5 Euljiro 15-gil, Jung-gu, Seoul','Charcoal-grilled marinated beef ribs with a traditional Seoul dining-room atmosphere.','Allow extra time at dinner; check break times and Sunday closure.','₩40–60k'),
 entry('wooraeok','food','Noodles','Wooraeok','우래옥','Euljiro','62-29 Changgyeonggung-ro, Jung-gu, Seoul','Pyongyang-style buckwheat naengmyeon with a delicate broth; bulgogi is another signature.','Often busy; check Monday closure. Cold noodles are enjoyed even in winter.','₩20–30k noodles · ₩50–80k grill'),
 entry('jjukkumi','food','Seafood & spicy','Chungmuro Jjukkumi Bulgogi','충무로쭈꾸미불고기','Chungmuro','11 Toegye-ro 31-gil, Jung-gu, Seoul','Spicy grilled small octopus, often followed by fried rice.','Go with friends; ask about spice and minimum portions. Check Sunday closure.','₩25–40k','https://english.visitseoul.net/eat/Chungmuro-Jjukkumi-Bulgogi-EN/ENP013119'),
 entry('mokmyeoksanbang','food','Rice & vegetables','Mokmyeoksanbang Main Branch','목멱산방 본점','Namsan','71 Toegye-ro 20-gil, Jung-gu, Seoul','Bibimbap, vegetables and savory pancakes; a convenient introduction to Korean food.','Self-service style. Ask about meat, stock and allergens if vegetarian.','₩15–25k'),
 entry('koong','food','Dumplings','Gaeseong Mandu Koong','개성만두 궁','Insadong','11-3 Insadong 10-gil, Jongno-gu, Seoul','Large handmade Gaeseong-style mandu, dumpling soup and hotpot.','A warming lunch between the craft museum and Insadong shops. Check break hours.','₩15–30k','https://guide.michelin.com/en/seoul-capital-area/kr-seoul/restaurant/gaeseong-mandu-koong'),
 entry('jinjujip','food','Noodles','Jinjujip Yeouido','진주집','Yeouido','33 Gukjegeumyung-ro 6-gil, Yeongdeungpo-gu, Seoul','Creamy cold soybean noodles (kongguksu), chicken knife-cut noodles and dumplings.','Basement restaurant popular at office lunch; check Sunday closure.','₩15–25k','https://english.visitseoul.net/restaurants/Jinjujip%20/ENP005413'),
 entry('hanilkwan','food','Meat & grill','Hanilkwan Apgujeong','한일관 압구정','Apgujeong','14 Apgujeong-ro 38-gil, Gangnam-gu, Seoul','Classic Seoul-style bulgogi and galbi, suitable for a traditional sit-down meal.','Reserve if possible for a group or a holiday dinner.','₩30–70k'),
 entry('ttukbaegijip','food','Soup & stews','Ttukbaegijip','뚝배기집','Jongno','12 Jong-ro 16-gil, Jongno-gu, Seoul','Individual bubbling pots of soybean-paste or soft-tofu stew, rice and side dishes.','Compact, inexpensive local lunch; avoid the peak office lunch rush.','₩10–15k'),
 entry('kcdf','culture','Craft & design','KCDF Gallery Shop','공예정원','Insadong','8 Insadong 11-gil, Jongno-gu, Seoul','Contemporary Korean ceramics, textiles and small artisan gifts.','First-floor shop; check Monday closure and current hours.','Shopping varies','https://www.kcdf.or.kr/cms/content/view/453'),
 entry('pointofview','culture','Craft & design','POINT OF VIEW Seoul','포인트오브뷰','Seongsu','18 Yeonmujang-gil, Seongdong-gu, Seoul','Curated stationery, paper goods and objects for writing and daily life.','Allow time to browse the floors; check current hours and stairs.','Shopping varies'),
 entry('muds','culture','Museums & gifts','National Museum of Korea MU:DS','국립중앙박물관 뮷즈','Yongsan','137 Seobinggo-ro, Yongsan-gu, Seoul','Museum collection-inspired gifts and objects, from ceramics to small stationery.','Combine with the museum collections. Stock varies by season.','Museum permanent galleries generally free'),
 entry('goto','culture','Shopping','Goto Mall','고투몰','Gangnam','200 Sinbanpo-ro, Seocho-gu, Seoul','Underground shopping streets for affordable winter clothes, scarves and accessories.','Combine with the flower market above ground. Individual shops set their own hours.','Shopping varies','https://english.visitseoul.net/attractions/Goto-Mall/ENP029546'),
 entry('osulloc','culture','Tea & cafés','Osulloc Tea House Bukchon','오설록 티하우스 북촌','Bukchon','45 Bukchon-ro, Jongno-gu, Seoul','Jeju tea, tea-based desserts and a calm break from the traditional neighborhood lanes.','Allow a slow walk uphill; check opening hours.','Menu varies'),
 entry('craftmuseum','culture','Museums & gifts','Seoul Museum of Craft Art','서울공예박물관','Anguk','4 Yulgok-ro 3-gil, Jongno-gu, Seoul','Korean craft history and contemporary exhibitions in a restored school campus.','Check Monday closure, special exhibitions and admission details.','General admission free'),
 ...seoulCatalogue
];
const datedHighlights={
 'hyundai-village':['2026-11-10','2026-12-31'],
 'shinsegae-square':['2026-11-06','2027-01-31'],
 'jamsil-market':['2026-11-19','2027-01-03']
};
for(const place of places)if(datedHighlights[place.id])[place.startsOn,place.endsOn]=datedHighlights[place.id];
export const categories=[['all','All places'],['food','Local food'],['indoor','Indoor places'],['christmas','Christmas'],['markets','Markets'],['culture','Culture'],['outdoors','Outdoors']];
export const dayRoutes=[
 {title:'Myeongdong after dark',note:'Warm soup or grilled ribs before the lights. Mostly walkable.',ids:['miseongok','lotte-lights','shinsegae-square']},
 {title:'Crafts & a slow afternoon',note:'Traditional Seoul, handmade gifts and tea.',ids:['craftmuseum','koong','kcdf','osulloc']},
 {title:'Yeouido Christmas',note:'Lunch, then indoor decorations. Check entry reservations and restaurant closing days.',ids:['jinjujip','hyundai-village']},
 {title:'Gangnam gifts & lights',note:'Shop at the terminal, then take transit to COEX.',ids:['flower-market','goto','coex-library']},
 {title:'Jamsil festive evening',note:'Set aside an evening for the market; check ticket availability first.',ids:['jamsil-market']}
];
export const googleMap=p=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name+' '+p.address)+'&hl=en';
export function filterPlaces(category='all',type='',query=''){
 const terms=query.trim().normalize('NFKC').toLowerCase().split(/\s+/).filter(Boolean);
 return places.filter(p=>(category==='all'||p.category===category)&&(!type||p.type===type)&&terms.every(t=>Object.values(p).join(' ').normalize('NFKC').toLowerCase().includes(t)));
}
const districtPhoto={
 'Gwanghwamun':'gwanghwamun','Seochon':'gwanghwamun','Gyeongbokgung':'gwanghwamun','Magok':'seoul-botanic-park',
 'Mangwon':'mangwon-market','Seongsu':'seoul-forest','Yeongdeungpo':'seonyudo-park','Seonyudo':'seonyudo-park',
 'Seongbuk':'seongbuk-area','Seongbuk-dong':'seongbuk-area','Seorae Village':'seorae-village','Banpo':'banpo-bridge','Seoul Station':'seoul-station',
 'Dongdaemun':'ddp-museum','Sangam':'haneul-park','Dongnimmun':'prison-hall','Hannam':'leeum','Hannam-dong':'leeum','Cheonggyecheon':'cheonggyecheon',
 'Nowon':'buk-seoul-art','Noryangjin':'noryangjin-market','Samgakji':'war-memorial','Jeong-dong':'seoul-museum-of-art','Yeouido':'hyundai-parkone'
};
const areaPhotos={Myeongdong:'myeongdong.jpg',Gangnam:'coex.jpg',Insadong:'insadong.jpg',Bukchon:'palace.jpg',Namsan:'namsan.jpg',Jongno:'insadong.jpg',Samseong:'coex.jpg'};
const photoCredits={"starfield":{"file":"File:Starfield Library COEX 20240218.jpg","license":"CC BY 4.0","artist":"Sean Young (@assanges)","source":"https://commons.wikimedia.org/wiki/File%3AStarfield_Library_COEX_20240218.jpg"},"seolleongtang":{"file":"File:Seolleongtang.jpg","license":"CC0","artist":"이동원","source":"https://commons.wikimedia.org/wiki/File%3ASeolleongtang.jpg"},"baeksuk":{"file":"File:Baeksuk.jpg","license":"CC0","artist":"hyun chun kim","source":"https://commons.wikimedia.org/wiki/File%3ABaeksuk.jpg"},"naengmyeon":{"file":"File:Pyongyang Naengmyeon 20190608 001.jpg","license":"CC BY-SA 4.0","artist":"Mobius6","source":"https://commons.wikimedia.org/wiki/File%3APyongyang_Naengmyeon_20190608_001.jpg"},"kongguksu":{"file":"File:Kong-guksu 1.jpg","license":"CC BY 2.0","artist":"chomjong","source":"https://commons.wikimedia.org/wiki/File%3AKong-guksu_1.jpg"},"doenjang":{"file":"File:Doenjang Jjigae.jpg","license":"CC0","artist":"Suohros","source":"https://commons.wikimedia.org/wiki/File%3ADoenjang_Jjigae.jpg"},"nationalmuseum":{"file":"File:Exterior of the National Museum of Korea in Seoul.jpg","license":"CC BY-SA 4.0","artist":"Ethan Doyle White","source":"https://commons.wikimedia.org/wiki/File%3AExterior_of_the_National_Museum_of_Korea_in_Seoul.jpg"},"mandu":{"file":"File:Korean.cuisine-Kimchi.jjigae-02.jpg","license":"CC BY 2.0","artist":"by denver935","source":"https://commons.wikimedia.org/wiki/File%3AKorean.cuisine-Kimchi.jjigae-02.jpg"},"bibimbap":{"file":"File:Korean Bibimbap.jpg","license":"CC BY 3.0","artist":"Shene81","source":"https://commons.wikimedia.org/wiki/File%3AKorean_Bibimbap.jpg"},"lotteworld":{"file":"File:Lotte World Mall in Seoul.jpg","license":"CC BY-SA 4.0","artist":"Christophe95","source":"https://commons.wikimedia.org/wiki/File%3ALotte_World_Mall_in_Seoul.jpg"},"craftmuseum":{"file":"File:Seoul Museum of Craft Art.jpg","license":"CC BY-SA 4.0","artist":"*Youngjin","source":"https://commons.wikimedia.org/wiki/File%3ASeoul_Museum_of_Craft_Art.jpg"},"shinsegae":{"file":"File:Shinsegae Department Store in Seoul.jpg","license":"CC BY-SA 4.0","artist":"Minseong Kim","source":"https://commons.wikimedia.org/wiki/File%3AShinsegae_Department_Store_in_Seoul.jpg"},"galbi":{"file":"File:Galbi 1.jpg","license":"CC BY-SA 2.0","artist":"donchili","source":"https://commons.wikimedia.org/wiki/File%3AGalbi_1.jpg"},"jjukkumi":{"file":"File:Jjukkumi-samgyeopsal.jpg","license":"CC0","artist":"joannaisabellaabril","source":"https://commons.wikimedia.org/wiki/File%3AJjukkumi-samgyeopsal.jpg"},"lottedepartment":{"file":"File:Lotte Department Main Store.JPG","license":"Public domain","artist":"Abasaa","source":"https://commons.wikimedia.org/wiki/File%3ALotte_Department_Main_Store.JPG"}};
const placePhotos={
 'seoul-mapo-ok':['seolleongtang','Seolleongtang · dish photo'],'seoul-imun-seolnongtang':['seolleongtang','Seolleongtang · dish photo'],
 'seoul-jungin-myeonok':['naengmyeon','Pyongyang-style naengmyeon · dish photo'],'seoul-pyeongyang-myeonok':['naengmyeon','Pyongyang-style naengmyeon · dish photo'],'seoul-nampo-myeonok':['naengmyeon','Pyongyang-style naengmyeon · dish photo'],
 'seoul-guide-shinsegae-main-holiday-market':['shinsegae','Shinsegae main building'],
 'seoul-pildong-myeonok':['naengmyeon','Cold buckwheat noodles · dish photo'],
 'coex-library':['starfield','Starfield Library'], 'lotte-lights':['lottedepartment','Lotte Department Store main building'],
 'shinsegae-square':['shinsegae','Shinsegae main building'], 'jamsil-market':['lotteworld','Lotte World Mall'],
 miseongok:['seolleongtang','Seolleongtang · dish photo'],sarangbang:['baeksuk','Baeksuk · dish photo'],
 joseonok:['galbi','Galbi · dish photo'],wooraeok:['naengmyeon','Pyongyang naengmyeon · dish photo'],
 jjukkumi:['jjukkumi','Jjukkumi and pork belly · dish photo'],mokmyeoksanbang:['bibimbap','Bibimbap · dish photo'],
 jinjujip:['kongguksu','Kongguksu · dish photo'],
 hanilkwan:['galbi','Galbi · dish photo'],ttukbaegijip:['doenjang','Doenjang jjigae · dish photo'],
 muds:['nationalmuseum','National Museum of Korea'],craftmuseum:['craftmuseum','Seoul Museum of Craft Art']
};
const photosById=new Map(seoulPhotos.map(p=>[p.id,p]));
const photosByPlace=new Map(seoulPhotos.flatMap(photo=>photo.placeIds.map(id=>[id,photo])));
const attribution=photo=>`<a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.artist)}</a> · ${photo.licenseUrl?'<a href="'+esc(photo.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(photo.license)+'</a>':esc(photo.license)}`;
function photoFor(p){
 const photo=photosByPlace.get(p.id);
 if(photo)return {src:'assets/photos/seoul/'+photo.file,label:photo.name,kind:photo.id==='lantern-festival'?'2022 festival':photo.type==='dish'?'Dish photo':photo.type==='area'?'Area photo':'Place photo',credit:attribution(photo)+' · Resized and cropped'};
 const match=placePhotos[p.id], info=match&&photoCredits[match[0]];
 if(info)return {src:'assets/photos/'+match[0]+'.jpg',label:match[1],kind:match[1].includes('dish photo')?'Dish photo':'Place photo',credit:`<a href="${esc(info.source)}" target="_blank" rel="noopener noreferrer">${esc(info.artist)} · ${esc(info.license)}</a>`};
 const nearby=photosById.get(districtPhoto[p.area]);
 if(nearby)return {src:'assets/photos/seoul/'+nearby.file,label:nearby.name,kind:'Area photo',credit:attribution(nearby)+' · Resized and cropped'};
 const area=areaPhotos[p.area];
 return {src:'assets/photos/'+(area||'seoul-hero-480.webp'),label:area?'Seoul neighborhood photo':'Seoul city photo',kind:area?'Area photo':'Seoul city photo',credit:''};
}
function imageSearch(p){return 'https://www.google.com/search?tbm=isch&q='+encodeURIComponent(p.ko+' '+p.area+' Seoul');}

const shortlistKey='sori:explore:saved:1';
function shortlist(){try {return new Set(JSON.parse(localStorage.getItem(shortlistKey)||'[]'));}catch{return new Set();}}
const destination=p=>p.ko+' '+p.address;
const directions=p=>'https://www.google.com/maps/dir/?api=1&travelmode=transit&destination='+encodeURIComponent(destination(p));
export function savePlace(root,id){
 if(!places.some(p=>p.id===id))return;
 const list=shortlist();if(list.has(id))list.delete(id);else list.add(id);
 try{localStorage.setItem(shortlistKey,JSON.stringify([...list]));}catch{root.querySelector('[data-save-status]').textContent='This browser could not save your place.';return;}
 refreshDiscover(root,false);
 const next=root.querySelector('[data-save-place="'+id+'"]')||root.querySelector('#discoverSaved');
 next?.focus({preventScroll:true});
}
function card(p,saved){
 const photo=photoFor(p),selected=saved.has(p.id);
 return `<article class="place-card">
   <div class="place-picture"><img src="${photo.src}" alt="${esc(photo.label)}" loading="lazy" width="480" height="300">
     <span class="place-photo-label">${esc(photo.kind)}</span><button class="place-bookmark" type="button" data-save-place="${p.id}" aria-label="Save ${esc(p.name)}" aria-pressed="${selected}">${icon('bookmark')}</button></div>
   <div class="place-info"><span class="place-area">${icon('pin')} ${esc(p.area)}</span><h3>${esc(p.name)}</h3><span lang="ko">${esc(p.ko)}</span>
   ${p.startsOn?seasonDates(p):''}<details><summary>Place details</summary><p>${esc(p.detail)}</p><p>${esc(p.visit)}</p>
     <p><strong>Budget</strong> ${esc(p.budget)}${/^₩\d/.test(p.budget)?' / person, estimate':''}</p><p><strong>Address</strong> ${esc(p.address)}</p>
     <nav class="place-actions" aria-label="Maps and links for ${esc(p.name)}">
       <a href="${esc(directions(p))}" target="_blank" rel="noopener noreferrer">${icon('train')} Transit directions</a>
       <a href="${esc(googleMap(p))}" target="_blank" rel="noopener noreferrer">Google Maps</a><a href="https://map.naver.com/p/search/${encodeURIComponent(p.ko+' '+p.area)}" target="_blank" rel="noopener noreferrer">Naver Map</a>
       <a href="${esc(imageSearch(p))}" target="_blank" rel="noopener noreferrer">Venue photos</a>${p.source?`<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Venue guide</a>`:''}
     </nav><p class="photo-credit">${esc(photo.label)}${photo.credit?' · '+photo.credit:''}</p></details></div></article>`;
}
function seasonDates(p){
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
 const crossesYear=p.startsOn.slice(0,4)!==p.endsOn.slice(0,4);
 const format=date=>new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:crossesYear?'numeric':undefined,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
 const status=today<p.startsOn?'Upcoming':today>p.endsOn?'Ended':'On now';
 return `<p class="season-dates">${status} · ${format(p.startsOn)}${p.startsOn===p.endsOn?'':' – '+format(p.endsOn)}${crossesYear?'':' · '+p.endsOn.slice(0,4)}</p>`;
}
const covers={
 all:['namsan.jpg','Explore Seoul','compass'],christmas:['seoul/lantern-festival.jpg','Christmas in Seoul','gift'],
 food:['bibimbap.jpg','Local food','fork'],culture:['craftmuseum.jpg','Shopping & culture','art'],
 indoor:['seoul/seoul-botanic-park.jpg','Indoor places','house'],markets:['seoul/gwangjang-market.jpg','Seoul markets','bag'],
 outdoors:['seoul/seonyudo-park.jpg','Outdoor Seoul','leaf']
};
function coverCredit(cover){
 const photo=seoulPhotos.find(p=>'seoul/'+p.file===cover);if(photo)return attribution(photo);
 const source=photoCredits[cover.split('.')[0]];
 return source?`<a href="${esc(source.source)}">${esc(source.artist)} · ${esc(source.license)}</a>`:'<a href="https://unsplash.com/photos/fCsZgoFjqs4">Wonhong Jang / Unsplash</a>';
}
export function discoverMarkup(hash){
 const params=new URLSearchParams(hash.slice(1)),choice=params.get('discover');
 const category=categories.some(([id])=>id===choice)?choice:'all', options=filterPlaces(category);
 const types=[...new Set(options.map(p=>p.type))].sort(), selected=types.includes(params.get('type'))?params.get('type'):'';
 const [cover,title]=covers[category];
 const tiles=categories.slice(1).map(([id,label])=>`<a href="#discover=${id}"><img src="assets/photos/${covers[id][0]}" alt="" width="240" height="140"><span>${icon(covers[id][2])} ${esc(label)}<small>${filterPlaces(id).length} places</small></span></a>`).join('');
 const typeTiles=types.map(t=>`<a href="#discover=${category}&amp;type=${encodeURIComponent(t)}" ${t===selected?'aria-current="page"':''}>${esc(t)} <span>${options.filter(p=>p.type===t).length}</span></a>`).join('');
 return `<header class="city-intro photo-heading"><img src="assets/photos/${cover}" alt="" width="700" height="320"><h1>${esc(title)}</h1></header>
 ${category==='all'?`<nav class="discover-tiles" aria-label="Explore by category">${tiles}</nav>`:`<a class="discover-back" href="#discover">‹ All places</a><details class="discover-types" ${selected?'':'open'}><summary>${selected?esc(selected):'Browse by type'}</summary><nav aria-label="Place types"><a href="#discover=${category}">All ${options.length} places</a>${typeTiles}</nav></details>`}
 <div class="place-toolbar"><details><summary>${icon('sliders')} Filters</summary>
   <div class="discover-filter" data-discover-category="${category}"><label>Search<input type="search" class="learn-search" id="discoverSearch" placeholder="Place or neighborhood"></label>
   <label>Type<select id="discoverType"><option value="">All types</option>${types.map(t=>`<option ${t===selected?'selected':''}>${esc(t)}</option>`).join('')}</select></label>
   <label>Neighborhood<select id="discoverArea"><option value="">All neighborhoods</option>${[...new Set(options.map(p=>p.area))].sort().map(a=>`<option>${esc(a)}</option>`).join('')}</select></label></div></details>
   <label class="saved-filter"><input type="checkbox" id="discoverSaved">${icon('bookmark')} Saved <span id="savedPlaceCount"></span></label><span role="status" data-save-status></span></div>
 <div class="discover-results" id="discoverResults" aria-live="polite"></div>
 <details class="discover-routes"><summary>Day routes · ${dayRoutes.length} ideas</summary>${dayRoutes.map(r=>`<article><h3>${esc(r.title)}</h3><p>${esc(r.note)}</p><ol>${r.ids.map(id=>places.find(p=>p.id===id)).map(p=>`<li><a href="${esc(googleMap(p))}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a></li>`).join('')}</ol></article>`).join('')}<a class="sori-primary" href="#guide">Build my itinerary</a></details>
 <details class="guide-notes"><summary>Sources &amp; photos</summary><p>Reviewed November 23, 2026. Each linked listing gives visitor information. Food price bands indicate a relative price level.</p>Cover photo · ${coverCredit(cover)}${category==='all'?categories.slice(1).map(([id,label])=>`<p>${label} · ${coverCredit(covers[id][0])}</p>`).join(''):''}</details>`;
}
export function refreshDiscover(root,reset=true){
 const filter=root.querySelector('.discover-filter');if(!filter)return;
 const saved=shortlist(),area=root.querySelector('#discoverArea').value,onlySaved=root.querySelector('#discoverSaved').checked;
 const category=filter.dataset.discoverCategory, type=root.querySelector('#discoverType').value;
 root.querySelector('#savedPlaceCount').textContent='('+saved.size+')';
 const matches=filterPlaces(category,type,root.querySelector('#discoverSearch').value).filter(p=>(!area||p.area===area)&&(!onlySaved||saved.has(p.id)));
 const limit=reset?9:Number(filter.dataset.limit||9);filter.dataset.limit=limit;
 // Rotate through types so the first screen samples the whole category.
 const groups=new Map();
 for(const p of matches){const key=category==='all'?p.category:p.type;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
 const visible=[];
 for(let i=0;visible.length<Math.min(limit,matches.length);i++)for(const group of groups.values())if(group[i]&&visible.length<limit)visible.push(group[i]);
 const results=root.querySelector('#discoverResults');
 results.innerHTML=`<p class="discover-count">${type?esc(type)+' · ':''}${matches.length} ${matches.length===1?'place':'places'}</p>`+(visible.length?`<div class="discover-card-grid">${visible.map(p=>card(p,saved)).join('')}</div>`:'<p>No matching places. Try a different name or type.</p>')+(visible.length<matches.length?'<button type="button" class="discover-more" data-more-places>Show more places</button>':'');
 const more=results.querySelector('[data-more-places]');
 if(more)more.onclick=()=>{const previous=visible.length;filter.dataset.limit=limit+12;refreshDiscover(root,false);results.querySelectorAll('.place-bookmark')[previous]?.focus({preventScroll:true});};
}
