// orders.js - the order board's brain: it decides when a new customer
// ticket prints, which dish it asks for, and how long the customer waits.
// A ticket is { id, recipe, timeLeft, timeTotal }; the kitchen state owns
// the list, this module only creates and ages tickets.

import { RECIPES, TUNING } from './config.js';
import { pickRandom } from './random.js';

let nextTicketId = 1;

export function resetTicketIds() {
  nextTicketId = 1;
}

// Difficulty eases in over the shift: 0 at the first ticket, 1 at the end.
export function rushProgress(state) {
  const elapsed = TUNING.shiftSeconds - state.shiftLeft;
  return Math.min(1, Math.max(0, elapsed / TUNING.shiftSeconds));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function orderTimeFor(state) {
  return lerp(TUNING.orderTimeStart, TUNING.orderTimeEnd, rushProgress(state));
}

export function spawnIntervalFor(state) {
  return lerp(TUNING.spawnEveryStart, TUNING.spawnEveryEnd, rushProgress(state));
}

// Print a fresh ticket for a random dish, if the board has a free rail.
export function maybeSpawnOrder(state, random) {
  if (state.orders.length >= TUNING.maxOrders) return null;
  if (state.spawnIn > 0) return null;
  const recipe = pickRandom(random, RECIPES);
  const timeTotal = orderTimeFor(state);
  const ticket = { id: nextTicketId++, recipe, timeLeft: timeTotal, timeTotal };
  state.orders.push(ticket);
  state.spawnIn = spawnIntervalFor(state);
  return ticket;
}

// Age every ticket by dt seconds; returns the tickets that just expired.
export function ageOrders(state, dt) {
  const expired = [];
  for (const ticket of state.orders) {
    ticket.timeLeft -= dt;
    if (ticket.timeLeft <= 0) expired.push(ticket);
  }
  if (expired.length > 0) {
    state.orders = state.orders.filter((t) => t.timeLeft > 0);
  }
  return expired;
}
