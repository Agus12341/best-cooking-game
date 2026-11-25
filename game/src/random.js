// random.js - a tiny seeded random source, so a shift can be replayed
// exactly (the screenshot driver uses a fixed seed) while normal play
// still gets a fresh shuffle every time.

export function makeRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 1;
  return function next() {
    // xorshift32: small, fast, and good enough for picking dishes.
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

export function pickRandom(random, list) {
  return list[Math.floor(random() * list.length)];
}
