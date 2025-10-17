(function () {
  const D = window.SORI_DATA || {};
  const dailyAll  = [...(D.daily?.base || []), ...(D.daily?.plus || [])];
  const dramaAll  = [...(D.drama?.base || []), ...(D.drama?.plus || [])];
  const travelAll = [...(D.travel?.base || []), ...(D.travel?.plus || [])];

  const subCategories = {
    daily: ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing']
  };

  const subIcons = {
    'Greeting':'👋','Cafe':'☕','Restaurant':'🍽️','Shopping':'🛍️','Health':'💊','Social':'👥',
    'Work':'💼','Tech':'🖥️','Exercise':'🏃',
    'Airport':'✈️','Hotel':'🏨','Transport':'🚇','Emergency':'🆘',
    'Convenience':'🏪','Street Food':'🌭','Market':'🧺','Duty Free':'🛂','Department':'🏬',
    'Food Court':'🥢','Payment':'💳','Delivery':'📦','Sightseeing':'📍'
  };

  window.SORI_DATA = { ...D, dailyAll, dramaAll, travelAll, subCategories, subIcons };
})();
