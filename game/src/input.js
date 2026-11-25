// input.js - keyboard control for the counter: number keys stack the
// matching ingredient, Enter serves, Backspace takes the last layer
// back, and T clears the plate. Mouse clicks are wired in render.js and
// main.js; this file is only the keyboard half.

import { INGREDIENTS } from './config.js';

const BY_KEY = Object.fromEntries(INGREDIENTS.map((i) => [i.key, i.id]));

export function bindKeys(handlers) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const id = BY_KEY[event.key];
    if (id) {
      handlers.onIngredient(id);
    } else if (event.key === 'Enter') {
      handlers.onServe();
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      handlers.onUndo();
    } else if (event.key.toLowerCase() === 't') {
      handlers.onClear();
    } else if (event.key === ' ') {
      event.preventDefault();
      handlers.onPrimary();
    }
  });
}
