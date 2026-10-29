/* ===================== RACHA · DÍAS MARCADOS POR EL FISIO (oct 2026) =====================
   Si el usuario entrenó pero no registró la sesión, el fisio marca ese día en la tarjeta "Racha"
   (Sesiones). Se guarda en pacientes.racha_extra (lista de fechas) y cuenta para la racha en todos
   lados (lista de usuarios, Inicio, app del usuario y su mascota). No crea sesiones: no entra en
   la carga ni en las gráficas. */

const RX_DIAS = 14;
const rxPat = () => patients.find(x => x.id === curId);
function rxDe(){ const p = rxPat(); return p && Array.isArray(p.rx) ? p.rx : []; }
function rxCard(){
  if(!curId || isExample) return '';
  const rx = new Set(rxDe()), ses = new Set((sessions || []).map(s => s.fecha)), chk = new Set((wellness || []).map(w => w.fecha));
  const hoy = todayISO(), dias = [];
  for(let k = RX_DIAS - 1; k >= 0; k--){ const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() - k); dias.push(x.toISOString().slice(0, 10)); }
  const n = rachaCalc(new Set([...chk, ...ses, ...rx]), [...ses, ...rx], nDias(st)).n;
  const L = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  return `<section class="card rx-card"><h3 class="sec">Racha</h3>
    <p class="rx-n"><b>${n}</b> día${n === 1 ? '' : 's'} de racha</p>
    <div class="rx-grid">${dias.map(f => { const d = new Date(f + 'T12:00:00'), k = ses.has(f) ? 'ses' : rx.has(f) ? 'fx' : chk.has(f) ? 'chk' : '';
      const lab = `${['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][d.getDay()]} ${d.getDate()}`;
      return `<button type="button" class="rx-d ${k}${f === hoy ? ' hoy' : ''}" data-rx="${f}"${k === 'ses' ? ' disabled' : ''} aria-pressed="${k === 'fx'}" aria-label="${lab}: ${k === 'ses' ? 'sesión registrada' : k === 'fx' ? 'entrenó (marcado por ti)' : k === 'chk' ? 'solo chequeo' : 'sin registro'}"><span>${L[d.getDay()]}</span><b>${d.getDate()}</b></button>`; }).join('')}</div>
    <div class="rx-ley"><span><i class="rx-i ses"></i>Sesión registrada</span><span><i class="rx-i fx"></i>Entrenó (marcado por ti)</span><span><i class="rx-i chk"></i>Solo chequeo</span></div>
    <p class="small" style="margin:6px 0 0">Toca un día en que entrenó y no lo registró. Cuenta para la racha, no para la carga.</p></section>`;
}
const _sessionsViewRx = sessionsView;
sessionsView = function(){ return rxCard() + _sessionsViewRx.apply(this, arguments); };
$('#out').addEventListener('click', async e => {
  const b = e.target.closest('[data-rx]'); if(!b || b.disabled) return;
  const p = rxPat(); if(!p) return;
  const f = b.dataset.rx, set = new Set(p.rx || []);
  set.has(f) ? set.delete(f) : set.add(f);
  const prev = p.rx; p.rx = [...set].sort().slice(-120);
  render();
  const {error} = await sb.from('pacientes').update({racha_extra: p.rx}).eq('id', curId);
  if(error){ p.rx = prev; render(); toast('No se pudo guardar. Revisa tu conexión.'); return; }
  toast(set.has(f) ? 'Día marcado como entrenado.' : 'Día desmarcado.');
});
