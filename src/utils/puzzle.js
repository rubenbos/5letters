const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Alle 26 letters, elk 5 unieke nummers (11–140). Per groep van 4 gegenereerd.
export function makeTable() {
  const nums = shuffle(Array.from({ length: 130 }, (_, i) => i + 11));
  const t = {};
  ABC.split('').forEach((l, i) => { t[l] = nums.slice(i * 5, i * 5 + 5); });
  return t;
}

export function makePuzzle(word, num, t) {
  const clues = [], ul = new Set();
  word.split('').forEach((l, pos) => {
    t[l].forEach(c => clues.push(c));
    ul.add(t[l][pos]);
  });
  return { word, num, clues: clues.sort((a, b) => a - b), ul };
}

export function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export const ABC_STR = ABC;
