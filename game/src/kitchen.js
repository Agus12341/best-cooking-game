// kitchen.js - the whole game state and the actions a player can take:
// stack an ingredient on the plate, take one back, clear the plate, pick
// which ticket to cook for, and serve. Scoring, combo and penalties all
// happen here, so the renderer only ever draws what this module decided.

import { TUNING } from './config.js';
import { ageOrders, maybeSpawnOrder, resetTicketIds } from './orders.js';

export function newShift() {
  resetTicketIds();
  return {
    phase: 'title', // title -> playing -> over
    score: 0,
    combo: 0,          // consecutive good serves
    served: 0,
    missed: 0,
    shiftLeft: TUNING.shiftSeconds,
    spawnIn: TUNING.firstOrderDelay,
    orders: [],        // live tickets, oldest first
    plate: [],         // ingredient ids, bottom of the stack first
    targetId: null,    // ticket the checklist is shown for
    flash: '',         // last feedback line ("+180  Combo x2!")
    flashKind: '',     // good | bad | info
    lastServe: null,   // { name, points } of the most recent good serve
  };
}

export function multiplier(state) {
  return Math.min(TUNING.comboMax, 1 + state.combo * TUNING.comboStep);
}

export function targetOrder(state) {
  return state.orders.find((t) => t.id === state.targetId) ?? state.orders[0] ?? null;
}

export function addIngredient(state, id) {
  if (state.phase !== 'playing') return;
  if (state.plate.length >= 8) return;
  state.plate.push(id);
}

export function undoIngredient(state) {
  if (state.phase !== 'playing') return;
  state.plate.pop();
}

export function clearPlate(state) {
  if (state.phase !== 'playing') return;
  state.plate = [];
}

export function chooseTarget(state, ticketId) {
  if (state.orders.some((t) => t.id === ticketId)) state.targetId = ticketId;
}

// Does the plate hold exactly the recipe's ingredients, in any order?
export function plateMatches(plate, recipe) {
  if (plate.length !== recipe.items.length) return false;
  const need = new Map();
  for (const id of recipe.items) need.set(id, (need.get(id) ?? 0) + 1);
  for (const id of plate) {
    const left = (need.get(id) ?? 0) - 1;
    if (left < 0) return false;
    need.set(id, left);
  }
  return true;
}

function setFlash(state, text, kind) {
  state.flash = text;
  state.flashKind = kind;
}

// Serve the plate to the targeted ticket. A match pays the dish price plus
// a time bonus, all scaled by the combo multiplier; a mismatch costs
// points, breaks the combo and sends the plate back to the counter.
export function servePlate(state) {
  if (state.phase !== 'playing') return;
  const ticket = targetOrder(state);
  if (!ticket) {
    setFlash(state, 'No ticket on the board yet - wait for an order!', 'info');
    return;
  }
  if (state.plate.length === 0) {
    setFlash(state, 'The plate is empty - stack the ingredients first.', 'info');
    return;
  }
  if (plateMatches(state.plate, ticket.recipe)) {
    const timeBonus = Math.round(ticket.timeLeft) * TUNING.timeBonusPerSecond;
    const points = Math.round((ticket.recipe.price + timeBonus) * multiplier(state));
    state.score += points;
    state.combo += 1;
    state.served += 1;
    state.lastServe = { name: ticket.recipe.name, points };
    setFlash(state, `${ticket.recipe.name} served! +${points} points`, 'good');
    state.orders = state.orders.filter((t) => t.id !== ticket.id);
    state.plate = [];
  } else {
    state.score = Math.max(0, state.score - TUNING.wrongServePenalty);
    state.combo = 0;
    setFlash(state, `Wrong dish for ticket #${ticket.id}! -${TUNING.wrongServePenalty} points`, 'bad');
  }
}

// One tick of the shift clock: age tickets, print new ones, end the day.
// random is the shift's seeded source from random.js.
export function tickShift(state, dt, random) {
  if (state.phase !== 'playing') return;
  state.shiftLeft -= dt;
  state.spawnIn -= dt;
  const expired = ageOrders(state, dt);
  for (const ticket of expired) {
    state.score = Math.max(0, state.score - TUNING.expiredPenalty);
    state.missed += 1;
    state.combo = 0;
    setFlash(state, `Ticket #${ticket.id} waited too long! -${TUNING.expiredPenalty} points`, 'bad');
  }
  maybeSpawnOrder(state, random);
  if (!state.orders.some((t) => t.id === state.targetId)) {
    state.targetId = state.orders[0]?.id ?? null;
  }
  if (state.shiftLeft <= 0) {
    state.shiftLeft = 0;
    state.phase = 'over';
  }
}
