// data/dataIndex.js
import { daily } from './daily.js';
import { drama } from './drama.js';
import { travel } from './travel.js';

export const dailyAll = daily;
export const dramaAll = drama;
export const travelAll = travel;

export const subCategories = {
  daily: ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
  travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing']
};

export const subIcons = {
  'Greeting':'👋','Cafe':'☕','Restaurant':'🍽️','Shopping':'🛍️','Health':'💊','Social':'👥',
  'Work':'💼','Tech':'🖥️','Exercise':'🏃',
  'Airport':'✈️','Hotel':'🏨','Transport':'🚇','Emergency':'🆘',
  'Convenience':'🏪','Street Food':'🌭','Market':'🧺','Duty Free':'🛂','Department':'🏬',
  'Food Court':'🥢','Payment':'💳','Delivery':'📦','Sightseeing':'📍'
};
