// data/dataIndex.js
// 모든 데이터 파일을 불러와서 하나로 합치고, 서브 카테고리/아이콘을 정의합니다.

import { daily } from './daily.js';
import { drama } from './drama.js';
import { travel } from './travel.js';

// 메인 배열
export const dailyAll = daily;
export const dramaAll = drama;
export const travelAll = travel;

// 카테고리별 세부 주제
export const subCategories = {
  daily: [
    'Greeting',
    'Cafe',
    'Restaurant',
    'Shopping',
    'Health',
    'Social',
    'Work',
    'Tech',
    'Exercise'
  ],
  travel: [
    'Airport',
    'Hotel',
    'Transport',
    'Emergency',
    'Convenience',
    'Street Food',
    'Market',
    'Duty Free',
    'Department',
    'Food Court',
    'Payment',
    'Delivery',
    'Sightseeing'
  ]
};

// 각 세부 주제에 표시할 아이콘
export const subIcons = {
  // Daily
  'Greeting': '👋',
  'Cafe': '☕',
  'Restaurant': '🍽️',
  'Shopping': '🛍️',
  'Health': '💊',
  'Social': '👥',
  'Work': '💼',
  'Tech': '🖥️',
  'Exercise': '🏃',

  // Travel
  'Airport': '✈️',
  'Hotel': '🏨',
  'Transport': '🚇',
  'Emergency': '🆘',
  'Convenience': '🏪',
  'Street Food': '🌭',
  'Market': '🧺',
  'Duty Free': '🛂',
  'Department': '🏬',
  'Food Court': '🥢',
  'Payment': '💳',
  'Delivery': '📦',
  'Sightseeing': '📍'
};
