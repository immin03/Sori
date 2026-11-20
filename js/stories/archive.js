export function matchingStories(stories,filter,query,saved){
  const terms=query.trim().normalize('NFKC').toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return stories.filter(s=>{
    if(filter==='Saved'?!saved.includes(s.id):filter!=='All'&&s.category!==filter)return false;
    const words=[s.title,s.excerpt,s.category,s.phrase,...s.paragraphs].join(' ').normalize('NFKC').toLocaleLowerCase();
    return terms.every(term=>words.includes(term));
  });
}

export function nextStory(stories,id){
  const index=stories.findIndex(s=>s.id===id);if(index<0||stories.length<2)return null;
  const rest=[...stories.slice(index+1),...stories.slice(0,index)];
  return rest.find(s=>s.category===stories[index].category)||rest[0];
}
