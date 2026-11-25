// main.js - boots Sunny Side Diner: builds the counter, wires the
// buttons and keys, runs the shift clock, and shows the title and
// game-over overlays. It also exposes window.diner, a small handle the
// screenshot driver uses to pose real game states in a browser.

import {
  addIngredient,
  chooseTarget,
  clearPlate,
  newShift,
  servePlate,
  tickShift,
  undoIngredient,
} from './kitchen.js';
import { createRenderer } from './render.js';
import { bindKeys } from './input.js';
import { makeRandom } from './random.js';
import { badSound, popSound, serveSound, unlockAudio } from './sound.js';

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? (Date.now() % 100000)) || 1;
const random = makeRandom(seed);

let state = newShift();

const refs = {
  score: document.querySelector('#score'),
  combo: document.querySelector('#combo'),
  served: document.querySelector('#served'),
  clock: document.querySelector('#clock'),
  board: document.querySelector('#board'),
  flash: document.querySelector('#flash'),
  plate: document.querySelector('#plate'),
  serveLabel: document.querySelector('#serve-label'),
  plateCount: document.querySelector('#plate-count'),
  counter: document.querySelector('#counter'),
  overlay: document.querySelector('#overlay'),
  overlayTitle: document.querySelector('#overlay-title'),
  overlayText: document.querySelector('#overlay-text'),
  overlayButton: document.querySelector('#overlay-button'),
};

const renderer = createRenderer(refs, {
  onIngredient: (id) => doAdd(id),
  onPickTicket: (id) => {
    chooseTarget(state, id);
    renderer.render(state);
  },
});

function doAdd(id) {
  unlockAudio();
  addIngredient(state, id);
  popSound();
  renderer.render(state);
}

function doServe() {
  unlockAudio();
  const before = state.served;
  servePlate(state);
  if (state.served > before) serveSound();
  else if (state.flashKind === 'bad') badSound();
  renderer.render(state);
}

function startShift() {
  unlockAudio();
  state = newShift();
  state.phase = 'playing';
  refs.overlay.classList.add('hidden');
  renderer.render(state);
}

refs.overlayButton.addEventListener('click', startShift);
document.querySelector('#serve').addEventListener('click', doServe);
document.querySelector('#undo').addEventListener('click', () => {
  undoIngredient(state);
  renderer.render(state);
});
document.querySelector('#clear').addEventListener('click', () => {
  clearPlate(state);
  renderer.render(state);
});

bindKeys({
  onIngredient: doAdd,
  onServe: doServe,
  onUndo: () => {
    undoIngredient(state);
    renderer.render(state);
  },
  onClear: () => {
    clearPlate(state);
    renderer.render(state);
  },
  onPrimary: () => {
    if (state.phase !== 'playing') startShift();
  },
});

function showGameOver() {
  refs.overlayTitle.textContent = 'Shift over!';
  refs.overlayText.textContent =
    `You served ${state.served} dishes and scored ${state.score} points` +
    (state.missed ? `, with ${state.missed} ticket${state.missed > 1 ? 's' : ''} walking out.` : '. A flawless board!');
  refs.overlayButton.textContent = 'Work another shift';
  refs.overlay.classList.remove('hidden');
}

// The shift clock: advance the state with real elapsed time, repaint,
// and swap to the game-over overlay when the day ends.
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (state.phase === 'playing') {
    const wasPlaying = state.phase === 'playing';
    tickShift(state, dt, random);
    if (wasPlaying && state.phase === 'over') showGameOver();
    renderer.render(state);
  }
  requestAnimationFrame(frame);
}

renderer.buildCounter();
renderer.render(state);
requestAnimationFrame(frame);

// A handle for the screenshot driver and for curious players in the
// console: the same actions the buttons and keys perform, nothing more.
window.diner = {
  start: startShift,
  add: doAdd,
  serve: doServe,
  pick: (id) => {
    chooseTarget(state, id);
    renderer.render(state);
  },
  setTimeLeft: (ticketId, seconds) => {
    const ticket = state.orders.find((t) => t.id === ticketId);
    if (ticket) ticket.timeLeft = seconds;
    renderer.render(state);
  },
  get state() {
    return state;
  },
};
