/* ===================== SALUD · DOMICILIO (oct 2026) =====================
   En el módulo Salud, "Dónde entrena: Domicilio" arma sesiones de cuerpo completo con lo que haya
   en la casa: sin nada (peso corporal), banquito, colchoneta y silla o sofá; y más adelante
   mancuernas, bandas, kettlebell o balón. Reparto fijo de la sesión (lo que importa es la distribución,
   no los minutos): calentamiento → intermitente (2 ejercicios alternados) → circuito de fuerza de 6
   estaciones (rodilla, empuje, cadera, unilateral, espalda, core/aductores). Cada ejercicio tiene
   versión por nivel. Base: NSCA en adultos mayores (fuerza progresiva + potencia), ejercicio de
   equilibrio y funcional para caídas, e intervalos de alta intensidad seguros en 70–77 años. */

Object.assign(R, {
  stensvold20:{l:'B',c:'Stensvold D, Viken H, Steinshamn SL, et al. Effect of exercise training for five years on all cause mortality in older adults—the Generation 100 study: randomised controlled trial. BMJ. 2020;371:m3485.',k:'Intervalos de alta intensidad 2 veces por semana durante 5 años en personas de 70–77 años: seguros y sostenibles; sin diferencia clara de mortalidad frente al ejercicio moderado, con tendencia a favor de los intervalos.'}
});

const DOM_MAT = [['banco','Banquito o escalón'], ['colch','Colchoneta'], ['mueble','Silla o sofá'], ['mancuernas','Mancuernas'], ['bandas','Bandas elásticas'], ['kettlebell','Kettlebell'], ['balon','Balón']];
const domOn = s => modOf(s) === 'salud' && s.lugar === 'casa';
const domMat = s => new Set(Array.isArray(s.mat) ? s.mat : []);

/* Cada opción: [nombre por nivel (ini, int, av) o texto, dosis-nota, materiales que necesita] */
function domPick(opts, m, nv){
  const o = opts.find(x => (x.need || []).every(k => m.has(k))) || opts[opts.length - 1];
  const n = typeof o.n === 'string' ? o.n : (o.n[nv] || o.n.int);
  const t = typeof o.t === 'object' && o.t ? (o.t[nv] || o.t.int || '') : (o.t || '');
  return {n, t, d: o.d || ''};
}
const L3 = (ini, int, av) => ({ini, int, av});

/* ---------- Calentamiento ---------- */
const DOM_WARM = [
  [{n:'Marcha en el sitio con brazos', d:'1 × 2 min', t:'Subiendo el ritmo poco a poco.'}],
  [{n:'Círculos de cadera y hombros', d:'1 × 1 min'}, {n:'Gato-camello en cuadrupedia', d:'1 × 8', need:['colch']}],
  [{n:'Sentadilla a la silla lenta', d:'2 × 8', need:['mueble'], t:'3 s al bajar.'}, {n:'Sentadilla lenta', d:'2 × 8', t:'3 s al bajar.'}],
  [{n:L3('Gusanito sin flexión','Gusanito sin flexión','Gusanito con flexión'), d:'2 × 5'}],
  [{n:'Bajar al suelo y levantarse', d:'2 × 4', need:['colch'], t:'Ensayo de levantarse tras una caída. Con apoyo en el mueble si hace falta.'}, {n:'Apoyo en un pie cerca de la pared', d:'2 × 30 s por lado'}]
];
/* ---------- Intermitente: dos ejercicios alternados ---------- */
const DOM_INT = [
  // Variante A
  [[{n:'Subidas rápidas al banquito', need:['banco'], t:'Cambia la pierna que sube en cada ronda.'}, {n:'Lanzamiento de balón a la pared', need:['balon']}, {n:'Marcha rápida con rodillas arriba', t:'Brazos activos.'}],
   [{n:L3('Levantarse rápido de la silla y sentarse controlado','Burpee con paso atrás y manos en el sofá','Burpee con paso atrás'), need:['mueble'], t:L3('Sube lo más rápido posible, baja en 3 s.','Sin salto; las manos en el borde del sofá.','Si va bien, termina con un salto pequeño.')},
    {n:L3('Sentadilla rápida','Burpee con paso atrás (sin salto)','Burpee con paso atrás'), t:L3('Sube lo más rápido posible.','',"Si va bien, termina con un salto pequeño.")}]],
  // Variante B
  [[{n:L3('Pasos laterales rápidos','Pasos laterales rápidos','Saltos laterales pequeños')}],
   [{n:'Kettlebell swing', need:['kettlebell'], t:'Bisagra de cadera, brazos relajados.'}, {n:L3('Sentadilla a la silla rápida','Escaladores con manos en el sofá','Escaladores en el piso'), need:['mueble']}, {n:L3('Sentadilla rápida','Escaladores con manos en la pared','Escaladores en el piso')}]]
];
/* ---------- Circuito de fuerza: 6 estaciones, dos variantes ---------- */
const DOM_CIR = [
  [ // Variante A
    [{n:L3('Sentadilla goblet con mancuerna','Sentadilla goblet con mancuerna','Sentadilla goblet con mancuerna, subida rápida'), need:['mancuernas']},
     {n:L3('Sentadilla a la silla con subida rápida','Sentadilla a la silla con subida explosiva','Sentadilla a la silla con salto pequeño'), need:['mueble'], t:'Baja controlado, sube lo más rápido posible.'},
     {n:L3('Sentadilla con subida rápida','Sentadilla con subida explosiva','Sentadilla con salto pequeño')}],
    [{n:L3('Flexiones con manos en la pared','Flexiones con manos en el borde del sofá','Flexiones en el piso'), need:['mueble']}, {n:L3('Flexiones con manos en la pared','Flexiones con rodillas apoyadas','Flexiones en el piso')}],
    [{n:L3('Hip thrust con la espalda en el sofá','Hip thrust con la espalda en el sofá','Hip thrust a una pierna con la espalda en el sofá'), need:['mueble'], t:L3('','','Por lado.')},
     {n:L3('Puente de glúteo','Puente de glúteo','Puente de glúteo a una pierna'), t:'En la colchoneta o en el piso.'}],
    [{n:L3('Zancada atrás con la mano en el mueble','Zancada atrás con la mano en el mueble','Zancada atrás sin apoyo'), need:['mueble'], t:'Alterna piernas.'}, {n:L3('Zancada atrás con la mano en la pared','Zancada atrás','Zancada atrás'), t:'Alterna piernas.'}],
    [{n:'Remo con banda elástica', need:['bandas'], t:'Junta las escápulas al final.'}, {n:'Nadadores boca abajo en Y, T y W', need:['colch']}, {n:'Nadadores boca abajo en Y, T y W', t:'Sobre una toalla o el piso.'}],
    [{n:L3('Aducción de cadera acostado de lado','Plancha Copenhague corta con la rodilla en el sofá','Plancha Copenhague corta con la rodilla en el sofá'), need:['mueble'], t:L3('Pierna de abajo sube y baja.','15–20 s por lado.','20–30 s por lado.')}, {n:L3('Plancha lateral con rodillas apoyadas','Plancha lateral','Plancha lateral con elevación de pierna'), t:'Por lado.'}]
  ],
  [ // Variante B
    [{n:L3('Step up al banquito','Step up al banquito','Step up al banquito con rodilla arriba'), need:['banco'], t:'Alterna piernas; sube con fuerza.'}, {n:L3('Sentadilla con subida rápida','Sentadilla con subida explosiva','Sentadilla con salto pequeño')}],
    [{n:'Press de hombro con mancuernas', need:['mancuernas']}, {n:L3('Flexiones con manos en la pared','Flexiones con manos en el borde del sofá','Flexiones en el piso con pausa abajo'), need:['mueble']}, {n:L3('Flexiones con manos en la pared','Flexiones con rodillas apoyadas','Flexiones en el piso con pausa abajo')}],
    [{n:'Peso muerto rumano con mancuernas', need:['mancuernas']}, {n:L3('Puente de glúteo','Puente de glúteo con pausa arriba','Puente de glúteo a una pierna'), t:'En la colchoneta o en el piso.'}],
    [{n:L3('Apoyo en un pie con alcances','Sentadilla búlgara con apoyo de mano','Sentadilla búlgara con el pie atrás en el sofá'), need:['mueble'], t:'Por lado.'}, {n:L3('Apoyo en un pie con alcances','Zancada atrás','Zancada atrás con pausa abajo'), t:'Por lado.'}],
    [{n:'Remo con banda elástica', need:['bandas']}, {n:'Superman alterno brazo y pierna', need:['colch']}, {n:'Superman alterno brazo y pierna'}],
    [{n:L3('Dead bug','Dead bug','Plancha con toques de hombro'), need:['colch']}, {n:L3('Plancha en la pared','Plancha frontal','Plancha con toques de hombro')}]
  ]
];

function domWeek(s){
  const m = domMat(s), nv = NIVELES[s.nivel] ? s.nivel : 'int', i = phaseIdx(s), n = nDias(s);
  const rpe = i === 0 ? '6–7' : nv === 'ini' ? '7' : '7–8';
  const inter = i === 0 ? {t:'inter', a:20, b:40, c:8} : (i === 2 && nv === 'av') ? {t:'inter', a:40, b:20, c:10} : {t:'inter', a:30, b:30, c:10};
  const rondas = i === 0 || nv === 'ini' ? 2 : 3, tiempo = i === 0 ? '30 s' : '40 s';
  const row = (o, d, extra) => { const p = domPick(o, m, nv); return Object.assign({e:p.n, lado:'', s:'', r:d, c:'', n:p.t, ter:false}, extra || {}); };
  return Array.from({length:n}, (_, d) => {
    const v = d % 2;
    const act = DOM_WARM.map(o => { const x = domPick(o, m, nv), mm = x.d.match(/^(\d+)\s*×\s*(.+)$/); return {e:x.n, lado:'', s:mm ? mm[1] : '', r:mm ? mm[2] : x.d, c:'', n:x.t, ter:false}; });
    const neuro = DOM_INT[v].map((o, k) => { const t = domPick(o, m, nv).t; return row(o, `${inter.a} s`, {n:`${k ? 'B' : 'A'} · alterna con ${k ? 'A' : 'B'}.${t ? ' ' + t : ''}`}); });
    const central = DOM_CIR[v].map(o => row(o, tiempo, {c:'RPE ' + rpe}));
    return {name:`Día ${d + 1} · Domicilio ${v ? 'B' : 'A'}`, rpe, segs:[
      {type:'act', sub:'Calentamiento', fmt:{t:'series'}, rows:act},
      {type:'neuro', sub:'Intermitente', fmt:inter, rows:neuro},
      {type:'central', sub:'Circuito de fuerza', fmt:{t:'rondas', a:rondas, b:'1 min'}, rows:central}]};
  });
}
const _genWeekDom = genWeek;
genWeek = function(s){ return domOn(s) ? domWeek(s) : _genWeekDom.apply(this, arguments); };
const _planKeyDom = planKey;
planKey = function(s){ const k = _planKeyDom(s); return domOn(s) ? k + '|dom:' + [...domMat(s)].sort().join(',') : k; };
const _subLabelDom = subLabel;
subLabel = function(s, P0){ const l = _subLabelDom(s, P0); return domOn(s) ? l + ' · a domicilio' : l; };

/* Fundamento en la vista del plan */
const _planViewDom = planView;
planView = function(){
  const h = _planViewDom.apply(this, arguments); if(!domOn(st)) return h;
  const m = domMat(st), mats = DOM_MAT.filter(([k]) => m.has(k)).map(([, l]) => l.toLowerCase());
  const card = `<section class="card"><h3 class="sec">Sesión a domicilio</h3><div class="mods">
    <div class="mod"><b>Reparto de la sesión.</b> Calentamiento (~25 %), intermitente de 2 ejercicios alternados (~25 %) y circuito de fuerza de 6 estaciones (~50 %): rodilla, empuje, cadera, una pierna, espalda y core o aductores. Si la sesión dura más, se alarga cada parte en la misma proporción. Las sesiones A y B se alternan.</div>
    <div class="mod"><b>Material.</b> ${mats.length ? 'Con ' + esc(mats.join(', ')) + '.' : 'Solo peso corporal.'} Márcalo en Datos; al agregar material, los ejercicios cambian solos.</div>
    <div class="mod"><b>Intensidad.</b> Fuerza progresiva con la subida rápida (potencia), equilibrio y levantarse del suelo, e intervalos de alta intensidad cuando la persona los tolera: en 70–77 años fueron seguros durante 5 años. ${refList(['fragala19','sherrington19','stensvold20'])}</div>
  </div></section>`;
  const i = h.indexOf('<section class="card"><h3 class="sec">Fundamento');
  return i > 0 ? h.slice(0, i) + card + h.slice(i) : h + card;
};

/* ---------- Formulario: dónde entrena y material ---------- */
(function(){
  const pob = document.getElementById('poblacion')?.closest('label'); if(!pob || document.getElementById('lugar')) return;
  pob.insertAdjacentHTML('afterend', `<label class="f" data-modshow="salud">Dónde entrena<select id="lugar" data-k="lugar"><option value="">Gimnasio o centro</option><option value="casa">Domicilio</option></select></label>
    <div class="f dom-mat" data-modshow="salud" data-dommat><span>Material en la casa</span><div class="pf-chips">${DOM_MAT.map(([k, l]) => `<button type="button" class="pf-chip" data-mat="${k}" aria-pressed="false">${esc(l)}</button>`).join('')}</div><p class="small" style="margin:0">Sin nada marcado: solo peso corporal.</p></div>`);
})();
const _syncVisDom = syncVisibility;
syncVisibility = function(){
  _syncVisDom.apply(this, arguments);
  const box = document.querySelector('[data-dommat]'); if(!box) return;
  if(modOf(st) === 'salud') box.hidden = st.lugar !== 'casa';
  const m = domMat(st); box.querySelectorAll('[data-mat]').forEach(b => { const on = m.has(b.dataset.mat); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
};
$('#form').addEventListener('click', e => {
  const b = e.target.closest('[data-mat]'); if(!b) return;
  const m = domMat(st); m.has(b.dataset.mat) ? m.delete(b.dataset.mat) : m.add(b.dataset.mat);
  st.mat = DOM_MAT.map(([k]) => k).filter(k => m.has(k));
  syncVisibility(); render(); markDirty();
});
$('#form').addEventListener('input', e => { if(e.target.dataset.k === 'lugar') syncVisibility(); });
