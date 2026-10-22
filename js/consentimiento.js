/* ===================== CONSENTIMIENTO INFORMADO · PANEL DEL FISIO (oct 2026) =====================
   En Datos de cada usuario: estado del consentimiento (v2), PDF para enviar por WhatsApp o imprimir,
   mensaje listo para WhatsApp y registro de la aceptación recibida por WhatsApp o firmada en persona. */
let cfOpen = false;
const cfFmt = iso => { if(!iso) return ''; const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('es-CO', {day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'}); };
const CF_MEDIO = {app: 'en la app', whatsapp: 'por WhatsApp', presencial: 'en persona'};
const cfFrase = () => `Yo, [nombre completo], con documento [número], leí el consentimiento informado de fisioterapia ${CONSENT_VERSION} y lo acepto.`;
function cfMsgWA(nombre){
  return `Hola${nombre ? ' ' + nombre.split(' ')[0] : ''}. Te envío el consentimiento informado para tu tratamiento de fisioterapia. Léelo con calma y, si estás de acuerdo, respóndeme este mensaje así:\n\n"${cfFrase()}"\n\nSi eres menor de edad, debe responder también tu papá, mamá o representante con su nombre y documento.`;
}
function cfCard(){
  const c = consentBy[curId], o = consentOld[curId], nom = st.nombre || '';
  const est = c ? `<div class="cf-ok"><b>Aceptado ${esc(CF_MEDIO[c.medio] || '')}</b><span>${esc(c.nombre_firma)}${c.documento ? ' · ' + esc(c.documento) : ''} · ${esc(cfFmt(c.firmado_at))}${c.menor && c.representante ? ` · representante: ${esc(c.representante.nombre)} (${esc(c.representante.parentesco || '')})` : ''}</span></div>`
    : `<div class="cf-no"><b>Pendiente</b><span>${o ? `Aceptó la versión anterior (${esc(o.version)}). Debe aceptar la ${esc(CONSENT_VERSION)}: la app se la pide al entrar.` : 'Si tiene acceso a la app, se lo pide al entrar. Si no, envíaselo por WhatsApp o fírmenlo en persona.'}</span></div>`;
  const tp = LS.get('apex_tp') || '';
  const form = cfOpen ? `<div class="cf-form">
      <label class="f">¿Cómo aceptó?<select id="cfMedio"><option value="whatsapp">Respondió por WhatsApp</option><option value="presencial">En persona, en este dispositivo</option></select></label>
      <div class="row2"><label class="f">Nombre completo<input id="cfN" value="${esc(nom)}"></label><label class="f">Documento<input id="cfD"></label></div>
      <label class="chk"><input type="checkbox" id="cfM"> Es menor de 18 años</label>
      <div id="cfMen" hidden><div class="row2"><label class="f">Representante<input id="cfRN"></label><label class="f">Documento del representante<input id="cfRD"></label></div>
        <label class="f">Parentesco<input id="cfRP" placeholder="Madre, padre, tutor…"></label></div>
      <label class="f">Nota (opcional)<input id="cfNota" placeholder="Ej.: respondió el 21 oct a las 9 p. m.; captura guardada"></label>
      <label class="chk"><input type="checkbox" id="cfYa"> Confirmo que la persona${'' } leyó el documento y lo aceptó.</label>
      <p class="small">Si fue por WhatsApp, guarda la captura del mensaje: es tu prueba junto con este registro.</p>
      <div class="actions"><button class="primary" data-cf="save">Registrar aceptación</button><button data-cf="cancel">Cancelar</button></div></div>` : '';
  return `<section class="card fx-cc${c || cfOpen ? (FX.open.has('datos:Consentimiento') ? '' : ' fx-closed') : ''} cf-card"><button type="button" class="fx-ch" data-fxcc="datos:Consentimiento" aria-expanded="${!c || FX.open.has('datos:Consentimiento')}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg><span>Consentimiento informado</span></button>
    <h3 class="sec fx-hidt">Consentimiento informado</h3>
    ${est}
    <div class="cf-acts"><button type="button" data-cf="pdf">PDF para enviar</button><button type="button" data-cf="wa">Mensaje de WhatsApp</button>${!c ? '<button type="button" class="primary" data-cf="reg">Registrar aceptación</button>' : ''}</div>
    <label class="f cf-tp">Tu tarjeta profesional (sale en el PDF)<input id="cfTP" value="${esc(tp)}" placeholder="Número de TP"></label>
    ${form}
    <details class="cf-txt"><summary>Ver el texto completo (${esc(CONSENT_VERSION)})</summary>${consentBlockHTML()}</details>
  </section>`;
}
const _renderCf = render;
render = function(){
  const r = _renderCf.apply(this, arguments);
  if(view === 'datos' && document.body.classList.contains('fx') && curId && !isExample){
    const nav = document.querySelector('#out > .fx-secsel'); if(nav && !document.querySelector('#out .cf-card')) nav.insertAdjacentHTML('afterend', cfCard());
  }
  return r;
};

/* ---------- PDF ---------- */
function cfPDF(nom){
  if(nom === undefined) nom = st.nombre || '';
  const doc = new jspdf.jsPDF({unit: 'mm', format: 'a4'}), W = 210, M = 18, H = 297; let y = 20;
  const need = h => { if(y + h > H - 18){ doc.addPage(); y = 20; } };
  const txt = (t, size, style, gap) => { doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size); doc.setTextColor(29, 29, 31);
    doc.splitTextToSize(t, W - 2 * M).forEach(l => { need(size * 0.45); doc.text(l, M, y); y += size * 0.43; }); y += gap ?? 1.5; };
  const bullet = t => { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.splitTextToSize(t, W - 2 * M - 5).forEach((l, i) => { need(4.3); if(i === 0) doc.text('•', M + 1, y); doc.text(l, M + 5, y); y += 4.1; }); y += 0.8; };
  const linea = (lab, val) => { need(10); doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.text(lab, M, y); doc.setDrawColor(150); doc.line(M + 48, y + 0.8, W - M, y + 0.8); if(val){ doc.setFont('helvetica', 'bold'); doc.text(val, M + 50, y); } y += 9; };
  doc.setFillColor(229, 32, 46); doc.rect(0, 0, W, 4, 'F');
  txt('CONSENTIMIENTO INFORMADO PARA TRATAMIENTO DE FISIOTERAPIA', 13, 'bold', 1);
  txt(`Versión ${CONSENT_VERSION} · Ápex`, 9, 'normal', 3);
  const tp = (LS.get('apex_tp') || '').trim();
  txt(`Fisioterapeuta tratante: ${fisioNombre || 'Manuel Celis'}${tp ? ' · Tarjeta profesional ' + tp : ' · Tarjeta profesional ________'}`, 9.5, 'normal', 1);
  txt(`Usuario o usuaria: ${nom || '______________________________'}`, 9.5, 'normal', 4);
  CONSENT_TEXT.forEach(([t, p]) => { need(10); txt(t, 10.5, 'bold', 1); if(Array.isArray(p)) p.forEach(bullet); else txt(p, 9.5, 'normal', 2.5); });
  need(70); y += 2; txt('ACEPTACIÓN', 10.5, 'bold', 3);
  linea('Nombre completo', nom || ''); linea('Documento de identidad', ''); linea('Firma', ''); linea('Fecha', '');
  txt('Si es menor de 18 años, firma también:', 9.5, 'bold', 3);
  linea('Representante legal', ''); linea('Documento y parentesco', ''); linea('Firma', '');
  need(24); y += 2; txt('Aceptación por WhatsApp', 10.5, 'bold', 1);
  txt('Si recibes este documento por WhatsApp, puedes aceptarlo respondiendo desde tu número con esta frase:', 9.5, 'normal', 1);
  txt(`"${cfFrase()}"`, 9.5, 'italic', 1);
  txt('Tu respuesta queda como constancia con la misma validez de la firma escrita (Ley 527 de 1999, arts. 5 a 7).', 9, 'normal', 0);
  const n = doc.getNumberOfPages();
  for(let i = 1; i <= n; i++){ doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120); doc.text(`Página ${i} de ${n}`, W - M, H - 10, {align: 'right'}); }
  return doc;
}
async function cfCompartir(nom){
  if(nom === undefined) nom = st.nombre || '';
  const nombre = 'Consentimiento ' + (nom || 'fisioterapia') + '.pdf';
  const blob = cfPDF(nom).output('blob'), file = new File([blob], nombre, {type: 'application/pdf'});
  try{
    if(navigator.canShare && navigator.canShare({files: [file]})){ await navigator.share({files: [file], title: 'Consentimiento informado', text: cfMsgWA(nom)}); return; }
  }catch(e){ if(e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  toast('PDF descargado. Adjúntalo en WhatsApp.');
}

/* ---------- Acciones ---------- */
$('#out').addEventListener('click', async e => {
  const b = e.target.closest('[data-cf]'); if(!b) return;
  const k = b.dataset.cf;
  if(k === 'pdf') return cfCompartir();
  if(k === 'wa'){ window.open('https://wa.me/?text=' + encodeURIComponent(cfMsgWA(st.nombre)), '_blank', 'noopener'); return; }
  if(k === 'reg'){ cfOpen = true; FX.open.add('datos:Consentimiento'); render(); setTimeout(() => $('#cfD')?.focus(), 50); return; }
  if(k === 'cancel'){ cfOpen = false; render(); return; }
  if(k === 'save'){
    const n = ($('#cfN').value || '').trim(), d = ($('#cfD').value || '').trim(), menor = $('#cfM').checked;
    if(n.length < 3 || d.length < 4){ toast('Escribe el nombre completo y el documento.'); return; }
    if(!$('#cfYa').checked){ toast('Confirma que la persona leyó y aceptó el documento.'); return; }
    let rep = null;
    if(menor){ rep = {nombre: ($('#cfRN').value || '').trim(), documento: ($('#cfRD').value || '').trim(), parentesco: ($('#cfRP').value || '').trim()};
      if(rep.nombre.length < 3 || rep.documento.length < 4){ toast('Falta el nombre y el documento del representante.'); return; } }
    b.disabled = true;
    const {data, error} = await sb.from('consentimientos').insert({paciente_id: curId, version: CONSENT_VERSION, nombre_firma: n.slice(0, 120), documento: d.slice(0, 30), acepta_datos: true, acepta_tratamiento: true,
      menor, representante: rep, medio: $('#cfMedio').value, nota: ($('#cfNota').value || '').trim().slice(0, 300) || null, registrado_por: (me && me.email) || null, user_agent: navigator.userAgent.slice(0, 400)}).select('paciente_id,firmado_at,nombre_firma,documento,version,medio,menor,representante').single();
    b.disabled = false;
    if(error){ toast('No se pudo registrar. Revisa tu conexión.'); return; }
    consentBy[curId] = data; cfOpen = false; render(); if(typeof renderHome === 'function') try{ renderHome(); }catch(x){}
    toast('Consentimiento registrado');
  }
});
$('#out').addEventListener('change', e => {
  if(e.target.id === 'cfM'){ const m = $('#cfMen'); if(m) m.hidden = !e.target.checked; }
  if(e.target.id === 'cfTP'){ LS.set('apex_tp', e.target.value.trim()); toast('Tarjeta profesional guardada'); }
});

/* ---------- En Cuenta, debajo de Tabla de usuarios: el documento en blanco ---------- */
const _renderHomeCf = renderHome;
renderHome = function(){
  const r = _renderHomeCf.apply(this, arguments);
  if(typeof FX !== 'undefined' && FX.tab === 'cuenta'){
    const tabla = document.querySelector('#home [data-fx="tabla"]');
    if(tabla && !document.querySelector('#home [data-cfc]')) tabla.insertAdjacentHTML('afterend', `<button type="button" class="fx-rb" data-cfc="open"><span class="fx-ic sq"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/></svg></span><span class="fx-rt"><b>Consentimiento informado</b><span>Ver, enviar en PDF o por WhatsApp · ${esc(CONSENT_VERSION)}</span></span>${FX_I.chev}</button>`);
  }
  return r;
};
function cfSheet(){
  let d = $('#cfDlg');
  if(!d){ d = document.createElement('div'); d.id = 'cfDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'cfDlgT'); document.body.appendChild(d); }
  d.hidden = false;
  d.innerHTML = `<div class="md-card cf-sheet"><div class="px-fch"><h2 id="cfDlgT">Consentimiento informado</h2><button type="button" class="xbtn" data-cfc="close" aria-label="Cerrar">×</button></div>
    <p class="small" style="margin:0 0 10px">Versión ${esc(CONSENT_VERSION)}. Quien tiene la app lo acepta al entrar. A quien no, envíaselo y registra su aceptación en la ficha (lápiz → Consentimiento).</p>
    <label class="f">Nombre de la persona (opcional, sale en el PDF)<input id="cfcN" placeholder="Déjalo vacío para un PDF en blanco"></label>
    <div class="cf-acts"><button type="button" class="primary" data-cfc="pdf">PDF para enviar</button><button type="button" data-cfc="wa">Mensaje de WhatsApp</button></div>
    <label class="f cf-tp">Tu tarjeta profesional (sale en el PDF)<input id="cfTP2" value="${esc(LS.get('apex_tp') || '')}" placeholder="Número de TP"></label>
    <div class="cf-txt cf-full">${consentBlockHTML()}</div></div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-cfc]'); if(!b){ const d = $('#cfDlg'); if(d && !d.hidden && e.target === d) d.hidden = true; return; }
  const k = b.dataset.cfc, nom = ($('#cfcN')?.value || '').trim();
  if(k === 'open') return cfSheet();
  if(k === 'close'){ $('#cfDlg').hidden = true; return; }
  if(k === 'pdf') return cfCompartir(nom);
  if(k === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(cfMsgWA(nom)), '_blank', 'noopener');
});
document.addEventListener('change', e => { if(e.target.id === 'cfTP2'){ LS.set('apex_tp', e.target.value.trim()); toast('Tarjeta profesional guardada'); } });
document.addEventListener('keydown', e => { const d = $('#cfDlg'); if(e.key === 'Escape' && d && !d.hidden) d.hidden = true; });
