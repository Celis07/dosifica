/* ===================== PDF ===================== */
const clean = t => String(t??'').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/→/g,'->').replace(/×/g,'x').replace(/[–—]/g,'-').replace(/≈/g,'~').replace(/·/g,'-').replace(/[“”]/g,'"');
async function pdf(){
  if(!window.jspdf){ toast('No se pudo cargar el generador de PDF.'); return; }
  const key=pkey(st), P0=P[key], ph=P0.phases[phaseIdx(st)], days=applyMeso(baseWeek(st).days, st), m=mesoWeek(st);
  const doc=new jspdf.jsPDF({unit:'mm',format:'a4'}); const W=210, H=297, M=14; let y=0;
  const C={cream:[240,238,233], ink:[28,27,25], mut:[107,104,98], line:[224,221,214], coral:[204,77,44], green:[61,138,106], gold:[160,120,40], purple:[107,66,184], blue:[47,111,159], dark:[36,35,31], white:[255,255,255]};
  const TC={act:C.green, neuro:C.purple, central:C.coral};
  const bg=()=>{ doc.setFillColor(...C.cream); doc.rect(0,0,W,H,'F'); };
  const newPage=()=>{ doc.addPage(); bg(); y=14; };
  const need=h=>{ if(y+h>H-12) newPage(); };
  bg();
  doc.setFillColor(...C.dark); doc.rect(0,0,W,30,'F'); doc.setFillColor(...C.coral); doc.rect(0,30,W,1.6,'F');
  doc.setTextColor(...C.white); doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.text('FISIOTERAPEUTA MANUEL CELIS', M, 9);
  doc.setFont('helvetica','bold'); doc.setFontSize(17); doc.text(clean((st.nombre||'Deportista').toUpperCase()), M, 18);
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.text(clean(`${subLabel(st,P0)}${isRod(st)?` - rodilla ${st.lado==='der'?'derecha':'izquierda'}`:''}${st.deporte?' - '+st.deporte:''} - ${days.length} dias por semana`), M, 25);
  const badge=`SEMANA ${num(st.semPlan)||1}`; doc.setFont('helvetica','bold'); doc.setFontSize(10); const bw=doc.getTextWidth(badge)+8;
  doc.setFillColor(...C.coral); doc.roundedRect(W-M-bw, 8, bw, 8, 1.5, 1.5, 'F'); doc.setTextColor(...C.white); doc.text(badge, W-M-bw+4, 13.4);
  const b2=clean(m.l.toUpperCase()); doc.setFontSize(8); const bw2=doc.getTextWidth(b2)+6; doc.setDrawColor(...C.white); doc.roundedRect(W-M-bw2, 19, bw2, 6.5, 1.2, 1.2, 'S'); doc.text(b2, W-M-bw2+3, 23.4);
  y=40;
  const para=(t,size,style,color,indent=0,gap=1.2)=>{ doc.setFont('helvetica',style); doc.setFontSize(size); doc.setTextColor(...color); doc.splitTextToSize(clean(t), W-2*M-indent).forEach(l=>{ need(size*0.45); doc.text(l, M+indent, y); y+=size*0.42; }); y+=gap; };
  para(ph.name.toUpperCase(),12,'bold',C.ink); para(ph.goal,9.5,'normal',C.mut,0,2.5);
  doc.setFont('helvetica','normal'); doc.setFontSize(8.8);
  const nt=tourns(st).find(t=>t.w>=curWeek(st));
  const rl=doc.splitTextToSize(clean(`${isRod(st)?'Regla de dolor: dolor durante <= 3/10 y vuelta a basal a las 24 h -> progresar. 4-5/10 -> mantener. Mas de 5/10 o peor al dia siguiente -> bajar carga. ':'Elige el peso para quedar en el RPE indicado; "Max. intencion" = lo mas rapido posible, sin fatiga. '}RPE 8 = podria hacer 2 repeticiones mas. Esta semana: ${m.l.toLowerCase()} (${m.d})${nt?` Proximo torneo: ${nt.n||'torneo'} (${nt.p}) el ${fmtD(nt.f)}.`:''}`), W-2*M-8);
  const rb=y; doc.setFillColor(...C.white); doc.setDrawColor(...C.line); doc.rect(M, rb, W-2*M, rl.length*3.8+5, 'FD'); doc.setFillColor(...C.coral); doc.rect(M, rb, 1.5, rl.length*3.8+5, 'F'); doc.setTextColor(...C.ink); rl.forEach((l,k)=>doc.text(l, M+5, rb+5+k*3.8)); y=rb+rl.length*3.8+10;
  if(ph.avoid) para('Evitar: '+ph.avoid,8.8,'italic',C.mut,0,3);
  const cols= isRod(st) ? [{k:'e',t:'EJERCICIO',w:52},{k:'lado',t:'LADO',w:18},{k:'s',t:'SERIES',w:13},{k:'r',t:'REPS',w:24},{k:'c',t:'CARGA',w:20},{k:'n',t:'NOTA',w:W-2*M-127}]
    : [{k:'e',t:'EJERCICIO',w:60},{k:'s',t:'SERIES',w:13},{k:'r',t:'REPS',w:26},{k:'c',t:'CARGA',w:24},{k:'n',t:'NOTA',w:W-2*M-123}];
  days.forEach(d=>{
    need(30);
    doc.setFillColor(...C.dark); doc.roundedRect(M, y, W-2*M, 9, 1.5, 1.5, 'F'); doc.setTextColor(...C.white); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(clean(d.name.toUpperCase()), M+4, y+6.2); y+=13;
    d.segs.forEach(sg=>{
      if(!sg.rows.length) return;
      need(22);
      const col=(sg.fmt&&sg.fmt.t==='inter')?C.gold:(TC[sg.type]||C.ink);
      doc.setFillColor(...col); doc.rect(M, y, 1.8, 6, 'F'); doc.setTextColor(...col); doc.setFont('helvetica','bold'); doc.setFontSize(9.2);
      doc.text(clean((SEGS[sg.type]||sg.type).toUpperCase()), M+4, y+4.3);
      const fl=fmtLabel(sg.fmt); if(fl){ doc.setFont('helvetica','normal'); doc.setTextColor(...C.mut); doc.setFontSize(8); doc.text(clean(fl), W-M, y+4.3, {align:'right'}); }
      y+=8;
      doc.setFillColor(...C.white); doc.rect(M, y, W-2*M, 6, 'F'); doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...C.mut);
      let x=M; cols.forEach(c=>{ doc.text(c.t, x+2, y+4); x+=c.w; }); y+=6;
      sg.rows.forEach((r,ri)=>{
        const cue=cueOf(r.e); const vid=videoOf(r.e);
        const vals={...r, e:(r.ter?'[T] ':'')+r.e, lado:r.lado||'-', n:[r.n, cue && !r.ter ? 'Clave: '+cue : ''].filter(Boolean).join(' ')};
        const cell = cols.map(c=>{ doc.setFont('helvetica', c.k==='e'||c.k==='c'?'bold':'normal'); doc.setFontSize(c.k==='n'?7.6:8.4); return doc.splitTextToSize(clean(vals[c.k]||''), c.w-4); });
        const h=Math.max(...cell.map(l=>l.length))*3.5+3.2;
        need(h);
        doc.setFillColor(...(ri%2?[250,249,246]:C.white)); doc.rect(M, y, W-2*M, h, 'F');
        doc.setDrawColor(...C.line); doc.setLineWidth(0.2); doc.line(M, y, W-M, y);
        let xx=M; cols.forEach((c,ci)=>{ doc.setFont('helvetica', c.k==='e'||c.k==='c'?'bold':'normal'); doc.setFontSize(c.k==='n'?7.6:8.4);
          doc.setTextColor(...(c.k==='c'?C.coral:c.k==='n'?C.mut:(c.k==='e'&&vid?C.blue:C.ink)));
          cell[ci].forEach((l,li)=>doc.text(l, xx+2, y+4.2+li*3.5));
          if(c.k==='e'&&vid){ doc.link(xx, y, c.w, h, {url:vid}); }
          xx+=c.w; });
        y+=h;
      });
      y+=4;
    });
    y+=3;
  });
  const tools=[];
  if(ph.tools.includes('iso')) tools.push('Isometria: 5 x 45 s con la rodilla a 60 grados (RPE 6-7), antes de entrenar o si duele.');
  if(ph.tools.includes('bfr')) tools.push('BFR (solo supervisado y con manguito): 30-15-15-15 reps con carga muy ligera, 30 s de pausa.');
  if(ph.tools.includes('mi')) tools.push('Imagineria y observacion de video: 10-15 min, 3-5 veces por semana en casa.');
  if(tools.length){ need(16); para('COMPLEMENTOS',10,'bold',C.ink,0,1); tools.forEach(t=>para('- '+t,8.8,'normal',C.ink,0,0.6)); y+=2; }
  if(st.notas){ need(14); para('NOTAS',10,'bold',C.ink,0,1); para(st.notas,8.8,'normal',C.ink); }
  if(days.some(d=>d.segs.some(sg=>sg.rows.some(r=>videoOf(r.e))))) para('Los ejercicios en azul tienen video: toca el nombre para abrirlo.',8,'italic',C.mut,0,1);
  const blob = doc.output('blob');
  const fname = `Plan ${isRod(st)?'rodilla':modOf(st)} - ${(st.nombre||'deportista').replace(/[^\p{L}\p{N} _-]/gu,'')} - semana ${num(st.semPlan)||1}.pdf`;
  try{
    saveBlob(blob, fname); toast('PDF listo');
  }catch(e){ if(e?.code!=='declined') toast('No se pudo descargar el PDF.'); }
}


/* ===================== EXCEL ===================== */
async function excel(){
  if(!window.XLSX){ toast('No se pudo cargar el generador de Excel.'); return; }
  const key=pkey(st), P0=P[key], i=phaseIdx(st), ph=P0.phases[i], days=applyMeso(baseWeek(st).days, st), m=mesoWeek(st);
  const COLOR={act:'#3D8A6A',neuro:'#6B42B8',central:'#CC4D2C'};
  // Hoja 1: plan en formato tabla
  const rows=[['Día','Bloque','Formato del bloque','Color del bloque','Ejercicio','Lado','Terapia','Series','Reps','Carga','Nota','Clave técnica','Video']];
  days.forEach(d=>d.segs.forEach(sg=>sg.rows.forEach(r=>{
    rows.push([d.name, SEGS[sg.type]||sg.type, fmtLabel(sg.fmt)||'Series', (sg.fmt&&sg.fmt.t==='inter')?'#A07828':(COLOR[sg.type]||''), r.e, r.lado||'', r.ter?'Sí':'', r.s, r.r, r.c, r.n, cueOf(r.e), videoOf(r.e)]);
  })));
  const ws1=XLSX.utils.aoa_to_sheet(rows);
  ws1['!cols']=[{wch:8},{wch:16},{wch:26},{wch:11},{wch:42},{wch:11},{wch:8},{wch:8},{wch:22},{wch:12},{wch:50},{wch:45},{wch:30}];
  ws1['!autofilter']={ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length-1,c:12}})};
  // Hoja 2: datos del deportista y de la fase
  const crit = ph.next.map(id=>{ const v=critVal(id,st); return [CR[id].t, v===true?'Cumple':v===false?'No cumple':'Sin dato']; });
  const info=[
    ['Campo','Valor'],
    ['Fisioterapeuta','Manuel Celis'],
    ['Deportista', st.nombre||''],
    ['Deporte', st.deporte||''],
    ['Módulo', MODULOS[modOf(st)]],
    ['Condición o perfil', subLabel(st,P0)],
    ['Rodilla', isRod(st)?(st.lado==='der'?'Derecha':'Izquierda'):'—'],
    ['Fase', ph.name],
    ['Objetivo de la fase', ph.goal],
    ['Semana del plan', num(st.semPlan)||1],
    ['Tipo de semana', `${m.l} — ${m.d}`],
    ['Torneos', tourns(st).map(t=>`${t.p} · ${t.n||'Torneo'} · ${t.f}`).join(' | ')||'—'],
    ['Días por semana', days.length],
    [isRod(st)?'Regla de dolor':'Regla de dolor (si hay molestias)','Dolor ≤ 3/10 y vuelta a basal a las 24 h → progresar. 4–5/10 → mantener. Más de 5/10 o peor al día siguiente → bajar carga.'],
    ['Escala de carga','RPE 8 = podría hacer 2 repeticiones más; RPE 7 = 3 más.'],
    ['Evitar en esta fase', ph.avoid||''],
    ['Notas', st.notas||''],
    [],
    [ph.nextLabel,'Estado'],
    ...crit
  ];
  const ws2=XLSX.utils.aoa_to_sheet(info); ws2['!cols']=[{wch:28},{wch:90}];
  // Hoja 3: guía de diseño para Claude Design
  const guide=[
    ['Elemento','Valor'],
    ['Fondo','#F0EEE9 (crema)'],
    ['Barra lateral y acento','#CC4D2C (coral)'],
    ['Cabecera de día','#24231F (oscuro), texto blanco'],
    ['Tipografía de títulos','Oswald, mayúsculas'],
    ['Tipografía de texto','DM Sans'],
    ['Columnas de la tabla','Ejercicio / Lado / Series / Reps / Carga / Nota'],
    ['Bloques','Activación, Neuro y Bloque central en cada día; [T] = terapia'],
    ['Bloque intermitente','#A07828 (dorado)'],
    ['Días','Día 1, Día 2… sin fechas'],
    ['Insignia','SEMANA '+(num(st.semPlan)||1)],
    [],
    ['Bloque','Color'],
    ...Object.keys(COLOR).map(k=>[SEGS[k], COLOR[k]])
  ];
  const ws3=XLSX.utils.aoa_to_sheet(guide); ws3['!cols']=[{wch:30},{wch:50}];
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Plan');
  XLSX.utils.book_append_sheet(wb, ws2, 'Deportista y fase');
  XLSX.utils.book_append_sheet(wb, ws3, 'Guía de diseño');
  const buf=XLSX.write(wb,{bookType:'xlsx',type:'array'});
  const fname=`Plan ${isRod(st)?'rodilla':modOf(st)} - ${(st.nombre||'deportista').replace(/[^\p{L}\p{N} _-]/gu,'')} - semana ${num(st.semPlan)||1}.xlsx`;
  try{
    saveBlob(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}), fname); toast('Excel listo');
  }catch(e){ if(e?.code!=='declined') toast(e?.code==='extension_not_enabled'?'La descarga de Excel no está habilitada en esta vista.':'No se pudo descargar el Excel.'); }
}
