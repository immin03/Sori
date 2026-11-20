// GitHub Pages serves these small pages to link preview crawlers before a reader opens Sori.
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {CITIES} from '../js/guide/planner.js';
import {routes, cityPicks, itineraryParams} from '../js/guide/public-day.js';
import {esc} from '../js/guide/postcards.js';

const origin = 'https://sorikorea.com';
const generic = Object.entries(CITIES).map(([city, name]) => ({
  city, slug:city, title:'Our ' + name + ' itinerary', photo:cityPicks[city].photo,
  intro:'Open the itinerary to see the places we picked in ' + name + ', in visit order.'
}));
for (const route of [...routes, ...generic]) {
  const dir = new URL('../explore/' + route.slug + '/', import.meta.url);
  const url = origin + '/explore/' + route.slug + '/';
  const title = esc(route.title + ' · ' + CITIES[route.city] + ' | Sori');
  const photo = '/assets/photos/' + route.photo + '.jpg';
  const params = route.stops ? itineraryParams(route.city, [{stops: route.stops}]) : new URLSearchParams({day:route.city});
  const copyDays = !route.stops ? `
    for (const stops of new URLSearchParams(location.search).getAll('stops')) target.append('stops', stops);` : '';
  await mkdir(dir, {recursive:true});
  await writeFile(fileURLToPath(new URL('index.html', dir)), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${esc(route.intro)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Sori">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${esc(route.intro)}">
  <meta property="og:image" content="${origin + photo}">
  <meta property="og:image:alt" content="${esc(CITIES[route.city] + ' travel photograph')}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${url}">
  <style>body{max-width:48rem;margin:2rem auto;padding:0 1rem;font:1.1rem/1.6 system-ui;color:#28251f}img{max-width:100%;height:auto}a{color:#923822}</style>
</head>
<body>
  <h1>${esc(route.title)}</h1><p>${esc(route.intro)}</p>
  <p><a href="/#${esc(params.toString())}">Open itinerary in Sori</a></p>
  <img src="${photo}" alt="${CITIES[route.city]}">
  <script>
    const target = new URLSearchParams(${JSON.stringify(params.toString())});${copyDays}
    location.replace('/#' + target.toString());
  </script>
</body>
</html>
`);
}
