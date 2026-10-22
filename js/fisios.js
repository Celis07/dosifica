/* ===================== VARIOS FISIOS (oct 2026) =====================
   - Administrador (Manuel): en Cuenta → Fisioterapeutas agrega o quita fisios con nombre y correo.
     Cada fisio tiene su propio panel: no ve los usuarios de los demás.
   - Plantillas: se pueden marcar como compartidas y las ven todos los fisios.
   - El deportista ve en el consentimiento el nombre y correo de su propio fisio. */
let fxAdmin = false, fxLista = [], fxFAdd = false;
async function fxCargarFisios(){
  try{
    const {data} = await sb.from('fisios').select('email,nombre,admin,tp,created_at').order('created_at', {ascending: true});
    const yo = (me && me.email || '').toLowerCase();
    fxLista = data || []; fxAdmin = !!fxLista.find(f => f.email === yo && f.admin);
    const tp = fxLista.find(f => f.email === yo)?.tp; if(tp && !LS.get('apex_tp')) LS.set('apex_tp', tp);
  }catch(e){ fxAdmin = false; }
}
const _loadPatientsFs = loadPatients;
loadPatients = async function(){ const r = await _loadPatientsFs.apply(this, arguments); await fxCargarFisios(); return r; };

function fxFisiosSec(){
  const yo = (me && me.email || '').toLowerCase();
  return `<section class="fx-sec fx-fisios"><h2>Fisioterapeutas</h2><div class="fx-list">
    ${fxLista.map(f => `<div class="fx-rb"><span class="fx-av">${esc(fxIni(f.nombre || f.email))}</span><span class="fx-rt"><b>${esc(f.nombre || f.email)}${f.admin ? ' · administrador' : ''}</b><span>${esc(f.email)}</span></span>${!f.admin && f.email !== yo ? `<button type="button" class="fx-mini" data-ffx="quitar|${esc(f.email)}">Quitar</button>` : ''}</div>`).join('')}
    ${fxFAdd ? `<div class="fx-rb fx-fform"><label class="f">Nombre<input id="ffN" autocomplete="off"></label><label class="f">Correo<input id="ffE" type="email" autocomplete="off" inputmode="email"></label>
      <div class="actions"><button type="button" class="primary" data-ffx="guardar">Agregar</button><button type="button" data-ffx="cancelar">Cancelar</button></div>
      <p class="small" style="margin:0">Entra a Ápex con ese correo, toca "Entrar con el código de tu correo" la primera vez y crea su contraseña. Tendrá su propio panel; no verá tus usuarios ni tú los suyos. Solo comparten las plantillas que marquen como compartidas.</p></div>`
      : `<button type="button" class="fx-rb" data-ffx="nuevo"><span class="fx-ic sq">${FX_I.plus}</span><span class="fx-rt"><b>Agregar fisioterapeuta</b><span>Con su nombre y correo</span></span></button>`}
  </div></section>`;
}
const _renderHomeFs = renderHome;
renderHome = function(){
  const r = _renderHomeFs.apply(this, arguments);
  if(typeof FX !== 'undefined' && FX.tab === 'cuenta' && fxAdmin && !document.querySelector('#home .fx-fisios')){
    const herr = [...document.querySelectorAll('#home .fx-sec')].find(s => /Herramientas/.test(s.querySelector('h2')?.textContent || ''));
    herr ? herr.insertAdjacentHTML('afterend', fxFisiosSec()) : document.querySelector('#home .fx-page')?.insertAdjacentHTML('beforeend', fxFisiosSec());
  }
  return r;
};
let fxQuitarArm = null;
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-ffx]'); if(!b) return;
  const [k, v] = b.dataset.ffx.split('|');
  if(k === 'nuevo'){ fxFAdd = true; renderHome(); setTimeout(() => $('#ffN')?.focus(), 50); return; }
  if(k === 'cancelar'){ fxFAdd = false; renderHome(); return; }
  if(k === 'guardar'){
    const n = ($('#ffN').value || '').trim(), em = ($('#ffE').value || '').trim().toLowerCase();
    if(n.length < 3 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ toast('Escribe el nombre y un correo válido.'); return; }
    b.disabled = true;
    const {error} = await sb.rpc('agregar_fisio', {p_email: em, p_nombre: n});
    b.disabled = false;
    if(error){ toast(/administrador/.test(error.message) ? 'Solo el administrador puede agregar fisios.' : 'No se pudo agregar. Revisa el correo.'); return; }
    fxFAdd = false; await fxCargarFisios(); renderHome(); toast(`${n} quedó como fisioterapeuta`);
    return;
  }
  if(k === 'quitar'){
    if(fxQuitarArm !== v){ fxQuitarArm = v; b.textContent = '¿Seguro?'; setTimeout(() => { if(fxQuitarArm === v){ fxQuitarArm = null; if(b.isConnected) b.textContent = 'Quitar'; } }, 4000); return; }
    fxQuitarArm = null;
    const {error} = await sb.rpc('quitar_fisio', {p_email: v});
    if(error){ toast('No se pudo quitar.'); return; }
    await fxCargarFisios(); renderHome(); toast('Fisioterapeuta quitado. Sus usuarios quedan guardados, pero ya no puede entrar al panel.');
  }
});

/* Plantillas compartidas: marcar o desmarcar */
document.addEventListener('change', async e => {
  const t = e.target; if(!t.matches?.('[data-tpl-share]')) return;
  const id = t.dataset.tplShare, on = t.checked;
  const {error} = await sb.from('plantillas').update({compartida: on, autor: fisioNombre || null}).eq('id', id);
  if(error){ t.checked = !on; toast('No se pudo cambiar.'); return; }
  const p = plantillas.find(x => x.id === id); if(p) p.compartida = on;
  toast(on ? 'Plantilla compartida con los otros fisios' : 'Plantilla solo para ti');
});

/* Deportista: datos de su fisio para el consentimiento */
const _startAthleteFs = startAthlete;
startAthlete = async function(p){
  await _startAthleteFs.apply(this, arguments);
  try{ const {data} = await sb.rpc('mi_fisio'); if(data){ A.fisio = data; if(!A.consent) renderAthlete(); } }catch(e){}
};
