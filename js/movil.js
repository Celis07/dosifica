/* ===================== CELULAR: menos cosas encima =====================
   - La ficha del paciente se pliega y el plan queda arriba.
   - Las secciones de explicación largas se pliegan (se abren con un toque y se recuerdan).
   - "Eliminar paciente" pasa al final de la ficha. */
const mq = window.matchMedia('(max-width: 760px)');
const isMob = () => mq.matches;
const FOLD_RX = /^(fundamento del plan|herramientas complementarias|consideraciones de este caso|semana tipo|referencias|carga interna|semana \d+)/i;
let foldOpen = new Set(JSON.parse(LS.get('apex_fold') || '[]'));

/* Ficha del paciente plegable */
(function(){
  const aside = $('#form'); if(!aside) return;
  const t = document.createElement('button');
  t.type = 'button'; t.id = 'formToggle'; t.className = 'ftoggle'; t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-controls', 'form');
  aside.prepend(t);
  const del = document.createElement('button');
  del.type = 'button'; del.className = 'fdel'; del.textContent = 'Eliminar ficha';
  del.onclick = () => { $('#bDel').click(); window.scrollTo({top:0, behavior:'smooth'}); };
  aside.append(del);
  t.onclick = () => { const c = aside.classList.toggle('collapsed'); t.setAttribute('aria-expanded', String(!c)); if(!c) aside.scrollIntoView({block:'start'}); };
  aside.classList.add('collapsed');
})();
function formSummary(){
  const t = $('#formToggle'); if(!t) return;
  const name = (st && st.nombre) || 'Usuario nuevo';
  let sub = '';
  try{ const P0 = P[pkey(st)]; sub = subLabel(st, P0) + ' · S' + (st.semPlan || 1); }catch(e){}
  t.innerHTML = `<span class="ft"><b>${esc(name)}</b><i>${esc(sub)}</i></span><span class="fe">Editar ficha<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>`;
}

/* Secciones largas plegables en el plan */
function mobFold(){
  formSummary();
  if(!isMob()) return;
  document.querySelectorAll('#out > section.card, #out .card').forEach(card => {
    const h = card.querySelector(':scope > h3.sec, :scope > .rowhead > h3.sec'); if(!h) return;
    const title = h.textContent.trim(); if(!FOLD_RX.test(title)) return;
    card.classList.add('fold'); card.classList.toggle('open', foldOpen.has(title.split(' ·')[0]));
    h.setAttribute('role', 'button'); h.tabIndex = 0; h.setAttribute('aria-expanded', String(card.classList.contains('open')));
  });
}
document.addEventListener('click', e => {
  const h = e.target.closest('.card.fold h3.sec'); if(!h) return;
  const card = h.closest('.card'), key = h.textContent.trim().split(' ·')[0];
  const open = card.classList.toggle('open'); h.setAttribute('aria-expanded', String(open));
  open ? foldOpen.add(key) : foldOpen.delete(key); LS.set('apex_fold', JSON.stringify([...foldOpen]));
});
document.addEventListener('keydown', e => { if((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.card.fold h3.sec')){ e.preventDefault(); e.target.click(); } });

/* Engancha el pintado del plan */
const _renderBase = render;
render = function(){ _renderBase.apply(this, arguments); mobFold(); };
const _fillBase = fillForm;
fillForm = function(){ _fillBase.apply(this, arguments); formSummary(); };
mq.addEventListener ? mq.addEventListener('change', () => render()) : mq.addListener(() => render());
