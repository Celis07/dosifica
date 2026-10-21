/* ===================== EDITOR DEL PLAN (oct 2026) =====================
   El nombre y la nota de cada ejercicio crecen hacia abajo: nunca se cortan.
   Sugerencias del banco al escribir el nombre (reemplaza la lista del navegador). */
function growTA(t){ t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
function growAll(root){ (root || document).querySelectorAll('textarea.grow').forEach(growTA); }
const _renderEd = render;
render = function(){ const r = _renderEd.apply(this, arguments); if(editMode) requestAnimationFrame(() => growAll($('#out'))); return r; };
addEventListener('resize', () => { if(editMode) growAll($('#out')); });

const edNorm = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function edSugClose(){ document.querySelectorAll('.exsug').forEach(x => x.remove()); }
function edSug(t){
  edSugClose();
  const q = edNorm(t.value.trim()); if(q.length < 2) return;
  const all = [...new Set([...(typeof myLib !== 'undefined' ? myLib : []), ...BASE])];
  const hit = all.filter(n => edNorm(n).includes(q) && edNorm(n) !== q).sort((a, b) => edNorm(a).indexOf(q) - edNorm(b).indexOf(q) || a.length - b.length).slice(0, 6);
  if(!hit.length) return;
  const box = document.createElement('div'); box.className = 'exsug'; box.setAttribute('role', 'listbox');
  box.innerHTML = hit.map(n => `<button type="button" role="option" data-exs="${esc(n)}">${esc(n)}</button>`).join('');
  t.after(box);
  box.addEventListener('mousedown', e => {
    const b = e.target.closest('[data-exs]'); if(!b) return; e.preventDefault();
    t.value = b.dataset.exs; edSugClose();
    t.dispatchEvent(new Event('input', {bubbles: true})); t.dispatchEvent(new Event('change', {bubbles: true}));
  });
}
$('#out').addEventListener('input', e => { if(e.target.matches('textarea[data-sugx]')) edSug(e.target); });
$('#out').addEventListener('focusout', e => { if(e.target.matches('textarea[data-sugx]')) setTimeout(edSugClose, 120); });
$('#out').addEventListener('keydown', e => {
  const t = e.target; if(!t.matches || !t.matches('textarea.grow')) return;
  if(e.key === 'Escape') edSugClose();
  if(e.key === 'Enter' && t.dataset.f === 'e'){ e.preventDefault(); t.blur(); }   // el nombre es una línea: Enter confirma
});
