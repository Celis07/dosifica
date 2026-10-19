/* ===================== DEPORTISTA EN REHABILITACIÓN (oct 2026) =====================
   Para procesos de selección o temporada donde no se puede dejar de entrenar: el plan sigue
   el calendario de torneos del módulo Deporte y la terapia de la lesión entra en Activación y
   Neuro, marcada como terapia (no se recorta por tiempo, ni en la descarga, ni en día rojo).
   Además se cambian o condicionan los ejercicios que más cargan la zona según la irritabilidad.
   Lo ideal es no entrenar ni competir lesionado; esta opción existe para cuando no hay otra.

   Fascitis plantar (fasciopatía plantar):
   - Estiramiento específico de la fascia y de gemelo y sóleo: grado A (Koc et al. 2023).
   - Fortalecimiento del pie y el tobillo: grado B (Koc et al. 2023). Protocolo de carga alta de
     Rathleff et al. 2015: elevación de talón unilateral con toalla bajo los dedos, 3 s arriba,
     2 s arriba sostenido, 3 s abajo; 3 × 12 (12RM) → 4 × 10 → 5 × 8, en días alternos.
   - Monitoreo del dolor para seguir haciendo deporte (Silbernagel et al. 2007).
   - Saltos, aletas y la elección del ejercicio según irritabilidad: razonamiento clínico. */

Object.assign(R, {
  koc23:{l:'C',c:'Koc TA Jr, Bise CG, Neville C, Carreira D, Martin RL, McDonough CM. Heel pain – plantar fasciitis: revision 2023. J Orthop Sports Phys Ther. 2023;53(12):CPG1-CPG39.',k:'Estiramiento de la fascia plantar y de gemelo y sóleo, terapia manual y férula nocturna (grado A); fortalecimiento de pie y tobillo (grado B).'},
  rathleff15:{l:'B',c:'Rathleff MS, Mølgaard CM, Fredberg U, et al. High-load strength training improves outcome in patients with plantar fasciitis: a randomized controlled trial with 12-month follow-up. Scand J Med Sci Sports. 2015;25(3):e292-e300.',k:'Elevación de talón con toalla bajo los dedos, lenta y pesada, en días alternos: mejor que solo estirar a los 3 meses e igual a los 12.'},
  digiovanni03:{l:'B',c:'DiGiovanni BF, Nawoczenski DA, Lintal ME, et al. Tissue-specific plantar fascia-stretching exercise enhances outcomes in patients with chronic heel pain. J Bone Joint Surg Am. 2003;85(7):1270-1277.',k:'Estirar la fascia tirando los dedos hacia la espinilla, 10 × 10 s tres veces al día, la primera antes de los primeros pasos.'}
});

const REHAB_DEP = {
  fp:{l:'Fascitis plantar', zona:'pie', chk:'tobillo', ev:['koc23','rathleff15','digiovanni03','silbernagel','exp'],
    regla:'Dolor del pie hasta 3/10 durante el entrenamiento y, al día siguiente, los primeros pasos al levantarte igual o mejor: vas bien. Entre 4 y 5: no subas carga. Más de 5, o los primeros pasos peor que el día anterior: quita los saltos, baja la carga y avísale a tu fisioterapeuta.'},
  otra:{l:'Otra lesión (la terapia la pongo yo)', zona:'', chk:'', ev:['silbernagel','exp'],
    regla:'Dolor de la zona lesionada hasta 3/10 durante el entrenamiento y al día siguiente igual o mejor: vas bien. Entre 4 y 5: no subas carga. Más de 5 o peor al día siguiente: baja la carga y avísale a tu fisioterapeuta.'}
};
const REHAB_IRR = {
  alta:'Alta · dolor fuerte en los primeros pasos, cojea o duele en reposo',
  mod:'Moderada · duele al empezar y cede al calentar',
  baja:'Baja · molestia leve, ya tolera trotar y saltos suaves'
};
const rehabOn = s => !!(s && s.rehab && modOf(s) === 'deporte' && REHAB_DEP[s.rehabCond || 'fp']);
const rehabLadoTxt = s => (s.rehabLado || 'der') === 'izq' ? 'izquierdo' : 'derecho';
function rehabWeek(s){
  if(!s.rehabIni) return 1;
  const d = Math.floor((new Date(todayISO() + 'T12:00:00') - new Date(s.rehabIni + 'T12:00:00')) / (7 * 864e5));
  return Math.max(1, d + 1 + (curWeek(s) - todayWeek(s)));
}

/* ---------- Terapia de fascitis plantar por día ---------- */
// Cerca de un torneo no se mete carga pesada nueva en la pantorrilla (dolor muscular): solo isometría
const FP_LIGHT = ['taper', 'torneo', 'mini'];
// Semanas con carga pesada (Rathleff) desde el inicio de la rehabilitación, sin contar las de torneo
function fpHeavyWeeks(s){
  const w0 = s.rehabIni ? weekOfDate(s, s.rehabIni) : curWeek(s), w1 = curWeek(s); let n = 0;
  for(let w = Math.max(1, w0); w <= w1; w++) if(!FP_LIGHT.includes(weekKind(s, w).wt.k)) n++;
  return Math.max(1, n);
}
function fpTherapy(s, d, n){
  const irr = s.rehabIrr || 'mod', lado = rehabLadoTxt(s), w = rehabWeek(s);
  const k = weekKind(s, curWeek(s)).wt.k, torneo = FP_LIGHT.includes(k);
  const T = (it, seg, ladoRow) => ({seg, row: toRow(it, {ter: true, lado: ladoRow || 'Lesionada'})});
  const out = [];
  out.push(T(X('Estiramiento de fascia plantar', '1 × 10 de 10 s', {t: `Sentado, cruza el pie ${lado} sobre la rodilla y tira los dedos hacia la espinilla hasta sentir tensión en el arco. En casa, 3 veces al día; la primera antes de dar los primeros pasos al levantarte.`}), 'act'));
  // Carga del tríceps sural y la fascia: Rathleff en días alternos; isometría en los otros, con irritabilidad alta o en semana de torneo
  const heavyDay = n <= 2 ? true : d % 2 === 0;
  if(irr === 'alta' || torneo || !heavyDay){
    out.push(T(X('Elevación de talón isométrica unilateral', '4 × 30–45 s', {rpe: '6–7', t: `Sobre el pie ${lado}, talón a media altura, con apoyo de las manos. Analgésica y sin dolor muscular al día siguiente. Dolor hasta 3/10.`}), 'act'));
  } else {
    const hw = fpHeavyWeeks(s), dz = hw <= 2 ? '3 × 12' : hw <= 6 ? '4 × 10' : '5 × 8';
    out.push(T(X('Elevación de talón unilateral con toalla bajo los dedos', dz, {rpe: '8', t: `Pie ${lado} en un escalón con una toalla enrollada bajo los dedos. 3 s arriba, 2 s sostenido, 3 s abajo. Cuando sobran repeticiones, agrega peso en una mochila o mancuerna. Días alternos, nunca dos días seguidos.`}), 'act'));
  }
  // Neuro: pie corto y equilibrio (control del pie); con irritabilidad baja, vuelta al impacto
  if(irr === 'alta') out.push(T(X('Pie corto sentado', '3 × 8 de 5 s', {t: 'Acorta el pie subiendo el arco sin encoger los dedos (músculos intrínsecos del pie).'}), 'neuro'));
  else out.push(T(X('Equilibrio unipodal descalzo con pie corto', '3 × 30 s', {t: `Sobre el pie ${lado}, sosteniendo el arco arriba sin encoger los dedos. Progresa: ojos cerrados, luego superficie blanda.`}), 'neuro'));
  if(irr === 'baja' && !torneo && d % 2 === 1) out.push(T(X('Saltos de tobillo (pogo) bipodales', '3 × 10', {t: 'Contacto corto y rígido. Solo si el pie está en 3/10 o menos y los primeros pasos de hoy no empeoraron.'}), 'neuro'));
  return out;
}

/* ---------- Ajuste de lo que más carga la zona ---------- */
const FP_IMPACT = /salto|pogo|hop|sprint|skipping|drop|cuerda|pliom/i;
function fpAdjust(row, s){
  if(row.ter) return row;
  const irr = s.rehabIrr || 'mod', lado = rehabLadoTxt(s);
  const r = Object.assign({}, row);
  if(/^Sentadilla con salto/i.test(r.e) && irr !== 'baja'){
    r.e = 'Sentadilla a velocidad máxima'; r.n = 'Carga ligera; subida lo más rápida posible sin despegar los pies (sin impacto en la fascia).';
  } else if(/salto al caj[oó]n/i.test(r.e) && irr === 'alta'){
    r.e = 'Lanzamiento de balón medicinal hacia abajo'; r.n = 'Potencia sin impacto mientras baja la irritabilidad del pie.';
  } else if(/salto al caj[oó]n/i.test(r.e)){
    r.n = [r.n, `Aterriza sobre el cajón y bájate caminando, sin saltar hacia abajo. Si el pie ${lado} pasa de 3/10, cámbialo por lanzamiento de balón medicinal.`].filter(Boolean).join(' ');
  } else if(FP_IMPACT.test(r.e) && irr === 'alta'){
    r.e = 'Lanzamiento de balón medicinal hacia abajo'; r.n = 'Sin impacto mientras baja la irritabilidad del pie.';
  } else if(/b[uú]lgara/i.test(r.e)){
    r.n = [r.n, `Pie de atrás apoyado con los cordones, sin doblar los dedos: así no se estira la fascia del pie ${lado} con carga.`].filter(Boolean).join(' ');
  } else if(/zancada|step up|granjero/i.test(r.e) && irr === 'alta'){
    r.n = [r.n, `Con zapato con buen soporte. Si el pie ${lado} pasa de 3/10, cámbialo por la variante en máquina o sentado.`].filter(Boolean).join(' ');
  }
  return r;
}

/* ---------- Generador: Deporte + rehabilitación ---------- */
const _genWeekDepBase = genWeekDep;
genWeekDep = function(s){
  const days = _genWeekDepBase(s);
  if(!rehabOn(s)) return days;
  const cond = s.rehabCond || 'fp', n = days.length;
  const c = constraints(s);
  return days.map((day, d) => {
    const segs = day.segs.map(sg => Object.assign({}, sg, {rows: sg.rows.slice()}));
    const seg = t => segs.find(g => g.type === t);
    if(cond === 'fp'){
      segs.forEach(sg => { sg.rows = sg.rows.map(r => fpAdjust(r, s)); });
      // Sin duplicar: si el deporte ya trae una elevación de talón, la terapia la reemplaza
      segs.forEach(sg => { sg.rows = sg.rows.filter(r => !/elevaci[oó]n de tal[oó]n/i.test(r.e)); });
      // Activación: después de la movilidad; quita un ejercicio preventivo para que quepa en 10–15 min
      const act = seg('act'), neuro = seg('neuro');
      // Para que quepa en 10–15 min: queda un solo preventivo del deporte (rota entre días) y sale el core (el central ya trae Pallof o granjero)
      const prev = act.rows.map((r, k) => k).filter(k => k > 1 && !act.rows[k].ter);
      if(prev.length > 1) prev.slice(1).reverse().forEach(k => act.rows.splice(k, 1));
      if(act.rows.length > 2 && !act.rows[1].ter) act.rows.splice(1, 1);
      const mv = act.rows.findIndex(r => /^Movilidad din[aá]mica/i.test(r.e));
      if(mv >= 0) act.rows[mv] = Object.assign({}, act.rows[mv], {e: 'Movilidad dinámica + estiramiento de gemelo y sóleo', ter: true, lado: 'Ambas',
        n: 'Cadera, tobillo y columna torácica. Luego gemelo (rodilla estirada) y sóleo (rodilla doblada) en pared, 2 × 30 s cada uno, sin despegar el talón.'});
      const th = fpTherapy(s, d, n);
      act.rows.splice(1, 0, ...th.filter(x => x.seg === 'act').map(x => x.row));
      neuro.rows.unshift(...th.filter(x => x.seg === 'neuro').map(x => x.row));
      // Neuro sin fatiga: máximo 2 ejercicios de potencia del deporte además de la terapia
      const powK = neuro.rows.map((r, k) => k).filter(k => !neuro.rows[k].ter);
      if(powK.length > 2) powK.slice(2).reverse().forEach(k => neuro.rows.splice(k, 1));
    }
    segs.forEach(sg => { sg.rows = sg.rows.map(r => r.ter ? r : fromBank(r, c)); });
    return Object.assign({}, day, {segs});
  });
};

/* Clave del plan guardado: cambiar la lesión o la irritabilidad regenera la semana */
const _planKeyRehab = planKey;
planKey = function(s){ const k = _planKeyRehab(s); return rehabOn(s) ? k + `|rh:${s.rehabCond || 'fp'}:${s.rehabIrr || 'mod'}:${s.rehabLado || 'der'}` : k; };
const _subLabelRehab = subLabel;
subLabel = function(s, P0){ const l = _subLabelRehab(s, P0); return rehabOn(s) ? `${l} + rehabilitación de ${REHAB_DEP[s.rehabCond || 'fp'].l.toLowerCase()}${s.rehabCond === 'otra' ? '' : ` (${rehabLadoTxt(s)})`}` : l; };

/* Para el plan publicado: lo que el portal del deportista necesita saber */
function rehabInfo(s){
  if(!rehabOn(s)) return null;
  const R0 = REHAB_DEP[s.rehabCond || 'fp'];
  return {cond: s.rehabCond || 'fp', l: R0.l, zona: R0.zona, lado: rehabLadoTxt(s), irr: s.rehabIrr || 'mod', regla: R0.regla};
}

/* Tarjeta en "Consideraciones de este caso" (vista del fisio) */
function rehabMod(s){
  if(!rehabOn(s)) return '';
  const cond = s.rehabCond || 'fp', R0 = REHAB_DEP[cond], irr = s.rehabIrr || 'mod', w = rehabWeek(s);
  if(cond === 'otra') return `<div class="mod"><b>Deportista en rehabilitación.</b> El plan sigue su calendario de torneos. Agrega la terapia en Activación y Neuro desde "Editar ejercicios" y márcala como terapia: así no se recorta por tiempo, en la descarga ni en día rojo. Regla de dolor: ${esc(R0.regla)} ${refList(R0.ev)}</div>`;
  const hw = fpHeavyWeeks(s), heavy = hw <= 2 ? '3 × 12' : hw <= 6 ? '4 × 10' : '5 × 8', light = FP_LIGHT.includes(weekKind(s, curWeek(s)).wt.k);
  return `<div class="mod"><b>Fascitis plantar, pie ${esc(rehabLadoTxt(s))} · irritabilidad ${esc(REHAB_IRR[irr].split(' · ')[0].toLowerCase())} · semana ${w} de rehabilitación.</b>
    Activación: estiramiento de la fascia y de gemelo y sóleo todos los días, y ${irr === 'alta' ? 'elevación de talón isométrica (analgésica) mientras la irritabilidad esté alta' : light ? 'esta semana solo elevación de talón isométrica (analgésica): cerca del torneo no se mete carga pesada nueva en la pantorrilla. Después del torneo arranca la elevación de talón con toalla bajo los dedos (Rathleff), en días alternos' : `elevación de talón con toalla bajo los dedos ${heavy} en días alternos (Rathleff) e isometría los otros días`}. Neuro: pie corto${irr === 'alta' ? '' : ' y equilibrio unipodal descalzo'}${irr === 'baja' ? ', y pogo bipodal para volver al impacto' : ''}.
    ${irr === 'alta' ? 'Saltos cambiados por potencia sin impacto.' : irr === 'mod' ? 'Salto al cajón solo aterrizando arriba; sentadilla con salto cambiada por sentadilla a velocidad máxima.' : 'Saltos permitidos con la regla de dolor.'}
    En las semanas de puesta a punto y de torneo la carga pesada pasa a isometría para no llegar con dolor muscular.
    <br><b>Regla de dolor.</b> ${esc(R0.regla)} El dato clave es el dolor de los primeros pasos: la pregunta de la mañana en el portal ahora es por el pie.
    <br><b>Aletas (razonamiento clínico, sin estudios en rugby subacuático).</b> Revisa que el calzante no apriete el arco ni el talón; si los primeros pasos empeoran después de piscina, baja el volumen de aleteo antes que el gimnasio.
    <br><b>Cuándo parar.</b> Dolor en reposo o de noche, hormigueo, o que no mejore en 4–6 semanas: hay que revisar el diagnóstico. ${refList(R0.ev)}</div>`;
}

/* ---------- Formulario del fisio ---------- */
function rehabSync(){
  const on = !!st.rehab && modOf(st) === 'deporte';
  document.querySelectorAll('[data-rshow]').forEach(el => { el.hidden = !on || (el.dataset.rshow === 'fp' && (st.rehabCond || 'fp') !== 'fp'); });
}
const _syncVisRehab = syncVisibility;
syncVisibility = function(){ _syncVisRehab(); rehabSync(); };
$('#form').addEventListener('input', e => {
  const k = e.target.dataset.k || ''; if(!/^rehab/.test(k)) return;
  if(k === 'rehab' && st.rehab){ if(!st.rehabCond) st.rehabCond = 'fp'; if(!st.rehabIrr) st.rehabIrr = 'mod'; if(!st.rehabLado) st.rehabLado = 'der'; if(!st.rehabIni) st.rehabIni = todayISO(); fillForm(); }
  rehabSync();
});
