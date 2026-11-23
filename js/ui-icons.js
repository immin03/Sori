// The same outline and view box keep icons aligned with their labels.
const paths = {
  speech:'M3 4h18v13H9l-5 4v-4H3zM7 9h10m-10 4h6',
  book:'M3 4q5-1 9 2 4-3 9-2v15q-5-1-9 2-4-3-9-2zM12 6v15',
  review:'M3 4v6h6M4 9a8 8 0 1 1-1 6M12 7v6l4 2',
  compass:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM16 8l-2.5 5.5L8 16l2.5-5.5z',
  map:'M2 5l6-2 8 3 6-2v15l-6 2-8-3-6 2zM8 3v15m8-12v15',
  bookmark:'M6 3h12v18l-6-4-6 4z', pin:'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0zM14 10a2 2 0 1 1-4 0 2 2 0 1 1 4 0z',
  fork:'M4 3v5q0 3 3 3t3-3V3M7 3v18m12-18v18m0-17q-6 1-6 8h6',
  coffee:'M3 7h13v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM16 8h2a3 3 0 1 1 0 6h-2M3 22h15',
  train:'M5 5q0-2 2-2h10q2 0 2 2v11q0 2-2 2H7q-2 0-2-2zM5 10h14M8 14h1m6 0h1M8 18l-3 4m11-4 3 4',
  bag:'M4 7h16l-1 14H5zM8 8V6a4 4 0 0 1 8 0v2',
  house:'M2 11l10-8 10 8M5 10v11h14V10M10 21v-7h4v7',
  heart:'M12 20 4 12a5 5 0 1 1 8-6 5 5 0 1 1 8 6z',
  people:'M14 8a4 4 0 1 1-8 0 4 4 0 1 1 8 0zM2 21v-2a8 6 0 0 1 16 0v2M17 5a3 3 0 0 1 0 6m2 3q3 1 3 5',
  work:'M3 7h18v13H3zM8 7V4h8v3M3 12q9 5 18 0M12 13v3',
  film:'M3 10h18v11H3zM3 10 2 5l18-3 1 5zM7 4l3 4m4-5 3 4',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 6v6l4 2',
  music:'M9 17V5l11-2v12M9 17c0 4-6 5-6 2s6-5 6-2zm11-2c0 4-6 5-6 2s6-5 6-2z',
  leaf:'M3 19C1 9 9 4 21 3c0 13-7 19-16 15M3 21l12-12',
  plane:'m2 13 19-9-7 17-3-7zM11 14l10-10', bed:'M3 5v16m18-10v10M3 16h18M3 9h7v7m0-4h11v4',
  car:'m4 11 2-6h12l2 6M3 11h18v7H3zM6 18v3m12-3v3M6 14h2m8 0h2',
  bread:'M5 11a4 4 0 0 1 0-8 5 5 0 0 1 5 0 5 5 0 0 1 5 0 4 4 0 0 1 4 8v9H5z',
  art:'M3 8l9-5 9 5zM4 21h16M6 10v8m6-8v8m6-8v8', gift:'M3 8h18v5H3zM5 13v8h14v-8M12 8v13m0-13C3 9 5 0 9 4zm0 0c9 1 7-8 3-4z',
  spark:'m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z',
  phone:'M7 2h10q2 0 2 2v16q0 2-2 2H7q-2 0-2-2V4q0-2 2-2zM10 18h4',
  sliders:'M3 7h6m4 0h8M3 17h11m4 0h3M9 4v6m8 4v6', health:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  arrow:'M5 12h14m-6-6 6 6-6 6', grid:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z'
};
const aliases = {
  vocabulary:'book',conversations:'speech',stories:'book',discover:'compass',planner:'map',itineraries:'bookmark',
  food:'fork',travel:'train',shopping:'bag',home:'house',feelings:'heart',social:'people',culture:'art',daily:'house',numbers:'clock',trendy:'spark',drama:'film',
  'rice-table':'fork','street-snacks':'fork','fruit-stall':'leaf','vegetable-stall':'leaf',protein:'fork',seasoning:'fork','drink-counter':'coffee',bakery:'bread',
  'neighbourhood-places':'pin','public-spaces':'art','outdoor-places':'leaf','on-transit':'train','airport-words':'plane','hotel-stay':'bed','live-shows':'music','screen-stories':'film',
  greeting:'speech',love:'heart',cafe:'coffee','café':'coffee',restaurant:'fork',tech:'phone',exercise:'health',airport:'plane',hotel:'bed',transport:'train',
  cinema:'film',taxi:'car',bookshop:'book','riverside park':'leaf',classroom:'book',museum:'art',noraebang:'music',gym:'health','railway station':'train',guesthouse:'bed','concert venue':'music','cooking studio':'fork','coworking space':'work','dance studio':'music','flower shop':'leaf',
  'meeting friends':'people','department store':'bag','convenience store':'bag','food stall':'fork',station:'train',market:'bag',shop:'bag',all:'compass',christmas:'gift'
};
export function icon(name, fallback='speech') {
  const key=String(name).toLowerCase();
  const path=paths[aliases[key]||key]||paths[fallback];
  return `<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
}
