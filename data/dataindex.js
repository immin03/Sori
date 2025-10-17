<script>
(function () {
  // merge
  const D = window.SORI_DATA || {};
  const dailyAll  = [...(D.daily?.base || []), ...(D.daily?.plus || [])];
  const dramaAll  = [...(D.drama?.base || []), ...(D.drama?.plus || [])];
  const travelAll = [...(D.travel?.base || []), ...(D.travel?.plus || [])];

  // 서브카테고리 사전
  const subCategories = {
    daily: ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing']
    // drama는 현재 서브필터 숨김. 필요 시 ['Romance','Life','Support'] 추가.
  };

  const subIcons = {
    'Greeting':'👋','Cafe':'☕','Restaurant':'🍽️','Shopping':'🛍️','Health':'💊','Social':'👥',
    'Work':'💼','Tech':'🖥️','Exercise':'🏃',
    'Airport':'✈️','Hotel':'🏨','Transport':'🚇','Emergency':'🆘',
    'Convenience':'🏪','Street Food':'🌭','Market':'🧺','Duty Free':'🛂','Department':'🏬',
    'Food Court':'🥢','Payment':'💳','Delivery':'📦','Sightseeing':'📍'
  };

  // 공개
  window.SORI_DATA = {
    ...D,
    dailyAll, dramaAll, travelAll,
    subCategories, subIcons
  };
})();
</script>
