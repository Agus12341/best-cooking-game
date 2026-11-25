// config.js - the diner's menu: ingredients, recipes and tuning numbers.
// Everything the other modules need to know about food lives here, so the
// state, the renderer and the order generator never hard-code a dish.

export const INGREDIENTS = [
  { id: 'bun',      name: 'Bun',      key: '1', color: '#e8a84c', dark: '#b97a26' },
  { id: 'patty',    name: 'Patty',    key: '2', color: '#8a4b2a', dark: '#5f3018' },
  { id: 'cheese',   name: 'Cheese',   key: '3', color: '#ffc93c', dark: '#d99a17' },
  { id: 'lettuce',  name: 'Lettuce',  key: '4', color: '#7bc950', dark: '#4f9430' },
  { id: 'tomato',   name: 'Tomato',   key: '5', color: '#e8452c', dark: '#b02a18' },
  { id: 'egg',      name: 'Egg',      key: '6', color: '#fff3d6', dark: '#f0a13c' },
  { id: 'bacon',    name: 'Bacon',    key: '7', color: '#c0392b', dark: '#8c2318' },
  { id: 'onion',    name: 'Onion',    key: '8', color: '#e8d8f0', dark: '#a678c2' },
  { id: 'mushroom', name: 'Mushroom', key: '9', color: '#d9c3a5', dark: '#a3805a' },
  { id: 'sauce',    name: 'Sauce',    key: '0', color: '#f2784b', dark: '#c24e24' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// A recipe is a dish name plus the multiset of ingredient ids it needs.
// The plate matches when it holds exactly these, in any stacking order.
export const RECIPES = [
  { name: 'Classic Burger',  items: ['bun', 'patty', 'cheese', 'lettuce', 'tomato'], price: 100 },
  { name: 'Double Stack',    items: ['bun', 'patty', 'patty', 'cheese', 'bacon'],    price: 120 },
  { name: 'Garden Burger',   items: ['bun', 'lettuce', 'tomato', 'onion', 'mushroom'], price: 110 },
  { name: 'Breakfast Plate', items: ['egg', 'bacon', 'cheese', 'tomato'],            price: 90 },
  { name: 'Sunny Skillet',   items: ['egg', 'patty', 'onion', 'mushroom', 'cheese'],  price: 115 },
  { name: 'BLT Melt',        items: ['bun', 'bacon', 'lettuce', 'tomato', 'sauce'],   price: 105 },
];

export const TUNING = {
  shiftSeconds: 150,      // one shift lasts this long, then the day ends
  maxOrders: 3,           // tickets on the board at once
  firstOrderDelay: 0.4,   // seconds before the first ticket prints
  spawnEveryStart: 9,     // seconds between new tickets early in the shift
  spawnEveryEnd: 4.5,     // ... tightening as the rush builds
  orderTimeStart: 42,     // seconds a fresh ticket allows at the start
  orderTimeEnd: 26,       // ... and near the end of the shift
  wrongServePenalty: 30,  // points lost for serving the wrong dish
  expiredPenalty: 40,     // points lost when a ticket's timer runs out
  timeBonusPerSecond: 2,  // points per second left on a served ticket
  comboStep: 0.25,        // score multiplier growth per consecutive good serve
  comboMax: 3,            // highest combo multiplier
};
