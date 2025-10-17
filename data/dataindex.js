// merged arrays for app
const dramaAll  = [...drama, ...dramaPlus];
const dailyAll  = [...daily, ...dailyPlus];
const travelAll = [...travel, ...travelPlus];

// subcategory and icons
const subCategories = {
  daily: ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
  travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing']
  // drama subfilters intentionally hidden in UI (can add 'Romance','Life','Support')
};

const subIcons = {
  'Greeting':'👋','Cafe':'☕','Restaurant':'🍽️','Shopping':'🛍️','Health':'💊','Social':'👥',
  'Work':'💼','Tech':'🖥️','Exercise':'🏃',
  'Airport':'✈️','Hotel':'🏨','Transport':'🚇','Emergency':'🆘',
  'Convenience':'🏪','Street Food':'🌭','Market':'🧺','Duty Free':'🛂','Department':'🏬',
  'Food Court':'🥢','Payment':'💳','Delivery':'📦','Sightseeing':'📍'
};
