// render.js - draws the diner: the order board, the plate stack, the
// targeted ticket's checklist, the ingredient counter and the HUD. It
// only reads state (from kitchen.js) and builds DOM; every rule lives
// in kitchen.js, so this file is purely how the game looks.

import { INGREDIENTS, INGREDIENT_BY_ID } from './config.js';
import { multiplier, targetOrder } from './kitchen.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function countsOf(ids) {
  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}

// One customer ticket: dish name, its ingredient list, and a patience
// bar that drains and turns red as the wait runs out.
function ticketNode(state, ticket, onPick) {
  const node = el('article', 'ticket');
  if (ticket.id === targetOrder(state)?.id) node.classList.add('targeted');
  const urgent = ticket.timeLeft / ticket.timeTotal < 0.3;
  if (urgent) node.classList.add('urgent');

  const head = el('div', 'ticket-head');
  head.append(el('span', 'ticket-no', `#${ticket.id}`), el('span', 'ticket-name', ticket.recipe.name));
  node.append(head);

  const onPlate = countsOf(state.plate);
  const need = countsOf(ticket.recipe.items);
  const list = el('ul', 'ticket-items');
  for (const [id, n] of need) {
    const have = Math.min(n, onPlate.get(id) ?? 0);
    const row = el('li', have >= n ? 'done' : '');
    row.append(
      el('span', 'dot', ''),
      el('span', '', INGREDIENT_BY_ID[id].name),
      el('span', 'count', `${have}/${n}`),
    );
    row.querySelector('.dot').style.background = INGREDIENT_BY_ID[id].color;
    list.append(row);
  }
  node.append(list);

  const bar = el('div', 'patience');
  const fill = el('div', 'patience-fill');
  fill.style.width = `${Math.max(0, (ticket.timeLeft / ticket.timeTotal) * 100)}%`;
  bar.append(fill);
  node.append(bar, el('div', 'ticket-time', `${Math.ceil(ticket.timeLeft)}s left`));
  node.addEventListener('click', () => onPick(ticket.id));
  return node;
}

// The plate: ingredients stacked as coloured layers, first added at the
// bottom, on a wide diner plate. An empty plate says how to start.
function plateNode(state) {
  const wrap = el('div', 'plate-wrap');
  const stack = el('div', 'plate-stack');
  if (state.plate.length === 0) {
    stack.append(el('div', 'plate-hint', 'Empty plate - tap an ingredient below'));
  } else {
    [...state.plate].reverse().forEach((id) => {
      const ing = INGREDIENT_BY_ID[id];
      const layer = el('div', `layer layer-${id}`, ing.name);
      layer.style.background = `linear-gradient(180deg, ${ing.color}, ${ing.dark})`;
      stack.append(layer);
    });
  }
  wrap.append(stack, el('div', 'plate-base'));
  return wrap;
}

export function createRenderer(refs, handlers) {
  function render(state) {
    // HUD: score, combo multiplier, served count and the shift clock.
    refs.score.textContent = String(state.score);
    refs.combo.textContent = state.combo > 0 ? `x${multiplier(state).toFixed(2).replace(/\.?0+$/, '')}` : 'x1';
    refs.served.textContent = String(state.served);
    refs.clock.textContent = `${Math.ceil(state.shiftLeft)}s`;

    // Order board.
    refs.board.replaceChildren(
      ...(state.orders.length
        ? state.orders.map((t) => ticketNode(state, t, handlers.onPickTicket))
        : [el('div', 'board-empty', 'No orders yet - the next customer is on their way...')]),
    );

    // The pass: flash line, plate, and the big action buttons' labels.
    refs.flash.textContent = state.flash;
    refs.flash.className = `flash ${state.flashKind}`;
    refs.plate.replaceChildren(plateNode(state));
    const ticket = targetOrder(state);
    refs.serveLabel.textContent = ticket ? `Serve ticket #${ticket.id}` : 'Serve';
    refs.plateCount.textContent = `${state.plate.length} / 8 on the plate`;
  }

  // The counter is built once: one button per ingredient, each with its
  // keyboard hint, so a player can cook by mouse or by number keys.
  function buildCounter() {
    refs.counter.replaceChildren(
      ...INGREDIENTS.map((ing) => {
        const btn = el('button', 'ingredient');
        btn.type = 'button';
        const disc = el('span', 'disc');
        disc.style.background = `radial-gradient(circle at 35% 30%, ${ing.color}, ${ing.dark})`;
        btn.append(disc, el('span', 'ing-name', ing.name), el('kbd', '', ing.key));
        btn.addEventListener('click', () => handlers.onIngredient(ing.id));
        return btn;
      }),
    );
  }

  return { render, buildCounter };
}
