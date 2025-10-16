// data/dataindex.js
(function(){
  // drama.js, daily.js, travel.js define globals: window.__DRAMA_BASE, window.__DRAMA_PLUS, etc.
  const dramaAll  = [...(window.__DRAMA_BASE || []), ...(window.__DRAMA_PLUS || [])];
  const dailyAll  = [...(window.__DAILY_BASE || []), ...(window.__DAILY_PLUS || [])];
  const travelAll = [...(window.__TRAVEL_BASE || []), ...(window.__TRAVEL_PLUS || [])];

  const subCategories = {
    daily: ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing']
    // drama: currently no subfilters shown in UI. If needed, add keys and enable in app.js.
  };

  const subIcons = {
    'Greeting':'👋','Cafe':'☕','Restaurant':'🍽️','Shopping':'🛍️','Health':'💊','Social':'👥',
    'Work':'💼','Tech':'🖥️','Exercise':'🏃',
    'Airport':'✈️','Hotel':'🏨','Transport':'🚇','Emergency':'🆘',
    'Convenience':'🏪','Street Food':'🌭','Market':'🧺','Duty Free':'🛂','Department':'🏬',
    'Food Court':'🥢','Payment':'💳','Delivery':'📦','Sightseeing':'📍'
  };

  window.SoriData = { dramaAll, dailyAll, travelAll, subCategories, subIcons };
})();

