// js/state.js
export const st = { cat: 'daily', sub: null, i: 0, spd: 0.75, filteredLines: [], repCount: 0 };

export function showError(msg) {
  const err = document.getElementById('errorMsg');
  if (!err) return;
  err.textContent = msg;
  err.style.display = 'block';
  setTimeout(() => { err.style.display = 'none'; }, 3000);
}
