// The top navigation, section tabs and menu use the same three destinations.
(function () {
  const services = [
    {id:'speak', title:'Speak', view:'home', children:[
      ['vocabulary','Vocabulary','#home'], ['conversations','Conversations','#conversations'], ['review','Review','#review']
    ]},
    {id:'read', title:'Korea 101', view:'newsletter', children:[
      ['stories','Stories','#read'], ['bookmarks','Saved stories','#read=saved'], ['newsletter','Newsletter','#read=newsletter']
    ]},
    {id:'explore', title:'Explore', view:'guide', children:[
      ['discover','Discover','#discover'], ['planner','Trip planner','#guide'], ['itineraries','My itineraries','#itineraries']
    ]}
  ];
  function locate(hash, roundKind) {
    const p = new URLSearchParams(hash.slice(1));
    const practice = p.get('practice'), view = p.get('view');
    if (hash === '#quiz') return ['speak','review','quiz'];
    if (practice === 'vocabulary') {
      const review = view === 'words' || (view === 'round' && roundKind === 'review');
      return ['speak',review ? 'review' : 'vocabulary','listen'];
    }
    if (practice || p.has('phrase') || ['#phrases','#speak','#collection'].includes(hash)) {
      return ['speak',practice === 'review' || p.get('from') === 'review' ? 'review' : 'conversations','listen'];
    }
    if (hash === '#read=saved' || (p.has('story') && p.get('from') === 'saved')) return ['read','bookmarks','newsletter'];
    if (hash === '#read=newsletter' || p.has('subscribe') || p.has('unsubscribe')) return ['read','newsletter','newsletter'];
    if (hash === '#read' || p.has('story')) return ['read','stories','newsletter'];
    if (hash === '#itineraries' || p.has('day') || p.has('trip') || p.has('invite')) return ['explore','itineraries','guide'];
    if (p.has('discover')) return ['explore','discover','guide'];
    if (hash === '#guide') return ['explore','planner','guide'];
    if (hash === '#conversations') return ['speak','conversations','home'];
    if (hash === '#review' || hash === '#saved-phrases') return ['speak','review','home'];
    return ['speak','vocabulary','home'];
  }
  window.SoriSections = {services,locate};
})();
