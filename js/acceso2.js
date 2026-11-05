/* ===================== ACCESO A LA VISTA (nov 2026) =====================
   Botón "Enviar acceso" en la cabecera de la ficha (junto a Publicar): abre la tarjeta con
   "Crear enlace para enviar" (WhatsApp / copiar) y "Enviar correo de acceso". Si falta el correo,
   lleva a Datos para escribirlo. Antes solo aparecía después de publicar o escondido en Datos. */
const ACC_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><path d="M18 8v6M15 11h6"/></svg>';
function accBtn(){
  if(!document.body.classList.contains('fx') || !curId || isExample) return;
  const acts = document.querySelector('#out .fx-fhead .fx-acts'); if(!acts || acts.querySelector('[data-fxacc]')) return;
  const pub = acts.querySelector('#bPub');
  const b = document.createElement('button'); b.type = 'button'; b.className = 'fx-icb fx-accb' + (accOpen ? ' on' : ''); b.dataset.fxacc = '1';
  b.title = 'Enviar acceso a la app'; b.setAttribute('aria-label', 'Enviar acceso a la app'); b.innerHTML = ACC_ICON;
  pub ? pub.after(b) : acts.prepend(b);
}
const _renderAcc2 = render;
render = function(){ const r = _renderAcc2.apply(this, arguments); try{ accBtn(); }catch(e){} return r; };
document.addEventListener('click', e => {
  if(!e.target.closest('[data-fxacc]')) return;
  if(!(st.email || '').trim()){
    view = 'datos'; render();
    setTimeout(() => { const i = $('#pemail'); if(i){ i.scrollIntoView({block: 'center', behavior: 'smooth'}); i.focus(); } }, 150);
    toast('Escribe su correo: será su usuario. Luego toca otra vez el botón de acceso.'); return;
  }
  accOpen = !accOpen; if(accOpen) ACC = {id: curId, link: '', busy: '', msg: '', kind: ''};
  accRender(); document.querySelector('[data-fxacc]')?.classList.toggle('on', accOpen);
  if(accOpen) $('#accCard')?.scrollIntoView({block: 'start', behavior: 'smooth'});
});
