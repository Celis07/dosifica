/* ===================== PDF · ESTILO ÁPEX (oct 2026) =====================
   Mismo diseño que la plantilla "Plan de entrenamiento" (Liliana Díaz, sep 2026):
   carta, fondo crema, negro y verde lima; Anton (títulos), Oswald (ejercicios) y Space Mono (etiquetas).
   apxPDF(data) arma portada + una página por día (o por bloque de casa). Lo usan el plan semanal
   y el trabajo en casa. Las fuentes se cargan solo al generar el primer PDF. */

const APX = {bg:[243,242,236], ink:[22,21,15], lime:[198,241,53], mut:[112,110,104], soft:[150,148,142], line:[214,213,207], W:612, H:792, L:42, R:570};
const APX_FONTS = [['Anton','Anton_400Regular'], ['OswaldL','Oswald_300Light'], ['Oswald','Oswald_400Regular'], ['OswaldM','Oswald_500Medium'], ['OswaldSB','Oswald_600SemiBold'], ['Mono','SpaceMono_400Regular'], ['MonoB','SpaceMono_700Bold']];
let apxFontData = null;
async function apxLoadFonts(){
  if(apxFontData) return apxFontData;
  const b64 = buf => { let s = ''; const u = new Uint8Array(buf); for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const out = {};
  await Promise.all(APX_FONTS.map(async ([n, f]) => { const r = await fetch(`fonts/${f}.ttf`); if(!r.ok) throw new Error('font'); out[n] = {f, d: b64(await r.arrayBuffer())}; }));
  return (apxFontData = out);
}
const apxClean = t => String(t ?? '').replace(/→/g, 'a').replace(/\s+/g, ' ').trim();
const apxPad = n => String(n).padStart(2, '0');

async function apxPDF(D){
  if(!window.jspdf){ toast('No se pudo cargar el generador de PDF.'); return null; }
  const fonts = await apxLoadFonts();
  const doc = new jspdf.jsPDF({unit: 'pt', format: 'letter'});
  Object.entries(fonts).forEach(([n, {f, d}]) => { doc.addFileToVFS(f + '.ttf', d); doc.addFont(f + '.ttf', n, 'normal'); });
  const {W, H, L, R} = APX, CW = R - L;
  let y = 0, page = 1;
  const pages = [];
  const F = (n, size, col) => { doc.setFont(n, 'normal'); doc.setFontSize(size); doc.setTextColor(...(col || APX.ink)); };
  // Texto con espaciado entre letras y alineación manual (jsPDF no la calcula bien con charSpace)
  const T = (txt, x, yy, o = {}) => {
    const t = apxClean(txt), cs = o.cs || 0; doc.setCharSpace(cs);
    const w = doc.getTextWidth(t) + cs * Math.max(0, t.length - 1);
    const xx = o.al === 'r' ? x - w : o.al === 'c' ? x - w / 2 : x;
    doc.text(t, xx, yy); doc.setCharSpace(0); return w;
  };
  const wrap = (t, w) => doc.splitTextToSize(apxClean(t), w);
  const hline = (yy, col, lw) => { doc.setDrawColor(...(col || APX.line)); doc.setLineWidth(lw || 0.75); doc.line(L, yy, R, yy); };
  const bg = () => { doc.setFillColor(...APX.bg); doc.rect(0, 0, W, H, 'F'); };
  const footer = () => { hline(736); F('Mono', 6.5, APX.mut); T(`${D.autor} · FISIOTERAPEUTA`.toUpperCase(), L, 757, {cs: 1.2}); T(D.footMid || 'BUILT TO MOVE · BUILT TO PERFORM', 384, 757, {cs: 1.2, al: 'c'}); pages.push(page); };
  const top = (right) => { F('MonoB', 7.5, APX.ink); T(D.autor.toUpperCase(), L, 49, {cs: 2.6}); F('Mono', 8, APX.mut); T(right, R, 49, {cs: 2, al: 'r'}); hline(65); };
  const newPage = (right, cont) => { footer(); doc.addPage(); page++; bg(); top(right); y = cont ? 92 : 80; };

  /* ---------- Portada ---------- */
  bg();
  doc.setFillColor(...APX.lime); doc.rect(L, 40, CW, 1.6, 'F');
  F('MonoB', 7.5); T(D.autor.toUpperCase(), L, 66, {cs: 2.6}); F('Mono', 8, APX.mut); T('FISIOTERAPEUTA', R, 66, {cs: 2, al: 'r'});
  doc.setDrawColor(...APX.ink); doc.setLineWidth(1);
  const br = (x, yy, dx, dy) => { doc.line(x, yy, x + dx, yy); doc.line(x, yy, x, yy + dy); };
  br(L, 266, 14, 14); br(R, 266, -14, 14); br(L, 467, 14, -14); br(R, 467, -14, -14);
  F('Mono', 8, APX.mut); T(D.eyebrow, W / 2, 296, {cs: 3, al: 'c'});
  F('Anton', 40, APX.ink); const tl = D.titulo || ['BUILT TO MOVE', 'BUILT TO PERFORM'];
  tl.forEach((l, k) => T(l, W / 2, 346 + k * 40 - (tl.length - 2) * 20, {al: 'c'}));
  if(D.intro){ F('OswaldL', 10.5, [60, 59, 54]); wrap(D.intro, 420).slice(0, 4).forEach((l, k) => T(l, W / 2, 404 + k * 16, {al: 'c'})); }
  // Fila de datos
  doc.setDrawColor(...APX.ink); doc.setLineWidth(1.6); doc.line(L, 661, R, 661);
  const cw = CW / 4;
  (D.info || []).slice(0, 4).forEach(([lab, val, pill], k) => {
    const x = L + k * cw + (k ? 10 : 0);
    if(k){ doc.setDrawColor(...APX.line); doc.setLineWidth(0.75); doc.line(L + k * cw, 662, L + k * cw, 717); }
    F('Mono', 7, APX.mut); T(String(lab).toUpperCase(), x, 682, {cs: 1.8});
    F('OswaldSB', 15, APX.ink); let v = apxClean(val); while(doc.getTextWidth(v) > cw - 16 && v.length > 4) v = v.slice(0, -2).trim() + '…';
    if(pill){ const w = doc.getTextWidth(v) + 14; doc.setFillColor(...APX.lime); doc.roundedRect(x, 689, w, 23, 2, 2, 'F'); T(v, x + 7, 706); }
    else T(v, x, 706);
  });
  hline(736); F('Mono', 6.5, APX.mut); T(`${D.autor} · FISIOTERAPEUTA`.toUpperCase(), L, 757, {cs: 1.2}); T('HUMAN PERFORMANCE', 384, 757, {cs: 1.2, al: 'c'}); pages.push(page);

  /* ---------- Páginas ---------- */
  (D.paginas || []).forEach((pg, pi) => {
    doc.addPage(); page++; bg(); top(D.derecha || '');
    F('Anton', 54, APX.ink); T(pg.titulo, L, 128);
    F('Mono', 8, APX.mut); (pg.tags || []).slice(0, 3).forEach((t, k) => T(String(t).toUpperCase(), R, 102 + k * 15, {cs: 2, al: 'r'}));
    y = 146;
    // Si el día no cabe en una página con notas de 2 líneas, las notas van en 1 línea
    const est = (n, mn) => { let h = 0; (pg.bloques || []).forEach(b => { if(b.texto || !(b.rows || []).length) return; h += 76; b.rows.forEach(r => { F('OswaldM', 10.5); const nl = wrap(r.e, 300).length; F('OswaldL', 8.5); const ml = r.n ? Math.min(n, wrap(r.n, 330).length) : 0; h += Math.max(mn || 25, 10 + nl * 13 + ml * 10 + (mn ? 1 : 4)); }); }); return h; };
    const AV = 733 - 146; pg._nmax = est(2) <= AV ? 2 : 1; pg._min = est(1) > AV ? 21 : 0; if(pg._min && est(1, 21) > AV) pg._nmax = 0;
    (pg.bloques || []).forEach(b => {
      const rows = b.rows || [];
      if(!rows.length && !b.texto) return;
      const rowH = r => { F('OswaldM', 10.5); const nl = wrap(r.e, 300).length; F('OswaldL', 8.5); const ml = r.n ? Math.min(pg._nmax, wrap(r.n, 330).length) : 0; return Math.max(pg._min || 25, 10 + nl * 13 + ml * 10 + (pg._min ? 1 : 4)); };
      let first = rows.length ? rowH(rows[0]) + (rows[1] ? rowH(rows[1]) : 0) : 0;
      if(b.texto){ F('Oswald', 10); first = [].concat(b.texto).reduce((a, p) => a + wrap(p, CW).length * 14 + 5, 12); }
      if(y + 60 + first > 730) newPage(D.derecha || '', true);
      // Barra negra
      doc.setFillColor(...APX.ink); doc.rect(L, y, CW, 23.5, 'F');
      F('Mono', 7.5, APX.bg); T(String(b.barra || b.titulo).toUpperCase(), L + 11, y + 15.5, {cs: 1.8});
      const mt = b.mid || pg.titulo, mid = `// ${mt} //`; doc.setCharSpace(1.8); const mw = doc.getTextWidth(apxClean(mid)) + 1.8 * (apxClean(mid).length - 1); doc.setCharSpace(0);
      const mx = W / 2 - mw / 2; F('Mono', 7.5, APX.lime); const w1 = T('//', mx, y + 15.5, {cs: 1.8}); F('Mono', 7.5, APX.bg); const w2 = T(` ${mt} `, mx + w1 + 1.8, y + 15.5, {cs: 1.8}); F('Mono', 7.5, APX.lime); T('//', mx + w1 + w2 + 3.6, y + 15.5, {cs: 1.8});
      F('Mono', 7.5, APX.bg); T(String(D.fase || '').toUpperCase(), R - 11, y + 15.5, {cs: 1.8, al: 'r'});
      y += 42;
      F('OswaldSB', 17, APX.ink); T(String(b.titulo).toUpperCase(), L, y);
      F('Mono', 7.5, APX.mut); T(b.derecha || (rows.length ? `${apxPad(rows.length)} EJERCICIO${rows.length > 1 ? 'S' : ''}` : ''), R, y - 3, {cs: 1.8, al: 'r'});
      y += 15;
      if(b.texto){
        y += 4; F('Oswald', 10, APX.ink);
        [].concat(b.texto).forEach(par => { wrap(par, CW).forEach(l => { if(y > 722) newPage(D.derecha || '', true); T(l, L, y); y += 14; }); y += 5; });
        y += 8; return;
      }
      const head = () => { F('Mono', 6.5, APX.mut); T('EJERCICIO', L, y, {cs: 1.6}); T('SERIES', 421, y, {cs: 1.6, al: 'c'}); T('REPS / TIEMPO', R, y, {cs: 1.6, al: 'r'}); doc.setDrawColor(...APX.ink); doc.setLineWidth(1.6); doc.line(L, y + 6, R, y + 6); y += 6; };
      head();
      rows.forEach(r => {
        const h = rowH(r);
        if(y + h > 733){ newPage(D.derecha || '', true); F('OswaldSB', 12, APX.soft); T(String(b.titulo).toUpperCase() + ' (SIGUE)', L, y); y += 16; head(); }
        F('OswaldM', 10.5, APX.ink); const nl = wrap(r.e, 300); nl.forEach((l, k) => T(l, L, y + 18 + k * 13));
        let yy = y + 18 + (nl.length - 1) * 13;
        if(r.n && pg._nmax){ F('OswaldL', 8.5, APX.mut); const ml = wrap(r.n, 330), k2 = pg._nmax; if(ml.length > k2) ml[k2 - 1] = ml[k2 - 1].replace(/\s*\S*$/, '') + '…'; ml.slice(0, k2).forEach((l, k) => T(l, L, yy + 11 + k * 10)); }
        F('Mono', 9, APX.ink); T(r.s || '—', 421, y + 18, {al: 'c'});
        F('Oswald', 10.5, APX.ink); const rl = wrap(r.r || '', 120); rl.slice(0, 2).forEach((l, k) => T(l, R, y + 18 + k * 13, {al: 'r'}));
        y += h; hline(y);
      });
      y += 13;
    });
    footer();
  });
  // Numeración "01 / 05"
  const tot = page; F('Mono', 6.5, APX.mut);
  for(let p = 1; p <= tot; p++){ doc.setPage(p); T(`${apxPad(p)} / ${apxPad(tot)}`, R, 757, {cs: 1.2, al: 'r'}); }
  return doc;
}
async function apxSave(doc, fname){
  if(!doc) return;
  try{ saveBlob(doc.output('blob'), fname); toast('PDF listo'); }catch(e){ if(e?.code !== 'declined') toast('No se pudo descargar el PDF.'); }
}
const apxAutor = () => (typeof fisioNombre !== 'undefined' && fisioNombre) ? fisioNombre : 'Manuel Celis';

/* ---------- Plan semanal en el nuevo estilo ---------- */
const _pdfViejo = pdf;
pdf = async function(){
  try{
    const key = pkey(st), P0 = P[key], ph = P0.phases[phaseIdx(st)], days = applyMeso(baseWeek(st).days, st), m = mesoWeek(st);
    const fase = ph.name.split(' · ')[0], nd = days.length, sem = num(st.semPlan) || 1;
    const quien = /^\s*equipo\b/i.test(st.nombre || '') ? 'Equipo' : (st.pf && st.pf.sexo === 'm') ? 'Usuaria' : isRehab(st) ? 'Usuario' : 'Atleta';
    const paginas = days.map((d, i) => {
      const [, ...resto] = String(d.name).split(' · '), rpe = typeof rpeSes === 'function' ? rpeSes(d) : '';
      return {titulo: `DÍA ${apxPad(i + 1)}`, tags: [resto.join(' · ') || subLabel(st, P0).split(' (')[0], rpe ? `RPE ${String(rpe).replace(/^RPE\s*/i, '')}` : m.l].filter(Boolean),
        bloques: d.segs.map(sg => ({...sg, rows: sg.rows.filter(r => String(r.e || '').trim())})).filter(sg => sg.rows.length).map(sg => ({titulo: sg.sub || SEGS[sg.type] || sg.type, derecha: (fmtLabel(sg.fmt) || `${apxPad(sg.rows.length)} EJERCICIO${sg.rows.length > 1 ? 'S' : ''}`).toUpperCase(),
          rows: sg.rows.map(r => ({e: (r.ter ? '[Terapia] ' : '') + r.e, s: r.s, r: r.r, n: [isRod(st) && r.lado && r.lado !== 'Ambas' ? `Pierna ${r.lado.toLowerCase()}.` : '', r.n].filter(Boolean).join(' ')}))}))};
    });
    const regla = isRehab(st) ? ((typeof rehabInfo === 'function' && rehabInfo(st)?.regla) || 'Dolor hasta 3/10 durante el ejercicio y al día siguiente igual o mejor: vas bien. Entre 4 y 5: mantén la carga. Más de 5 o peor al día siguiente: baja la carga y avísale a tu fisioterapeuta.')
      : 'Elige el peso para quedar en el RPE indicado. Si te sobra, sube un poco la próxima vez; si no llegas a las repeticiones, bájalo. "Máx. intención" es cada repetición lo más rápido posible, sin cansarte.';
    const ind = [regla, 'RPE 8 = podrías hacer 2 repeticiones más. RPE 7 = 3 más.', ph.avoid ? 'Evitar por ahora: ' + ph.avoid : '', st.notas ? 'Notas: ' + st.notas : ''].filter(Boolean);
    void ind; /* La guía "Cómo dosificar" ya no se imprime en el PDF del plan. */
    const doc = await apxPDF({autor: apxAutor(), eyebrow: `PLAN DE ENTRENAMIENTO — ${new Date().getFullYear()}`, intro: ph.goal, fase: fase,
      derecha: `${fase} · ${nd} SESION${nd > 1 ? 'ES' : ''} / SEMANA`.toUpperCase(),
      info: [[quien, st.nombre || '—'], ['Fase', fase.toUpperCase(), true], ['Semana', apxPad(sem)], ['Sesiones', `${nd} / SEMANA`]], paginas});
    await apxSave(doc, `Plan ${(st.nombre || 'usuario').replace(/[^\p{L}\p{N} _-]/gu, '')} - semana ${sem}.pdf`);
  }catch(e){ console.error(e); return _pdfViejo(); }
};
