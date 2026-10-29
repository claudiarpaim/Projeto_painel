(() => {
  const d=window.DASHBOARD_DATA;
  const nf=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
  const n2=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:1});
  const area=n=>nf.format(Math.round(n));
  const classes=[...d.classes];
  let descending=true;
  const byId=Object.fromEntries(classes.map(x=>[x.id,x]));
  const maxClass=Math.max(...classes.flatMap(x=>[x.area1985,x.area2025]));
  const total=d.indicators.areaHa;
  document.getElementById('totalArea').textContent=area(total);
  document.getElementById('stableArea').textContent=area(d.indicators.stableHa);
  document.getElementById('changedArea').textContent=area(d.indicators.changedHa);
  document.getElementById('stablePct').textContent=n2.format(d.indicators.stablePct)+'%';
  document.getElementById('changedPct').textContent=n2.format(d.indicators.changedPct)+'%';
  document.getElementById('stableBar').style.width=d.indicators.stablePct+'%';
  document.getElementById('changedBar').style.width=d.indicators.changedPct+'%';
  const forest=byId[3];
  document.getElementById('forestDelta').textContent=(forest.delta>=0?'+':'−')+area(Math.abs(forest.delta));

  function renderClasses(){
    const query=document.getElementById('classSearch').value.trim().toLocaleLowerCase('pt-BR');
    const rows=classes.filter(x=>x.name.toLocaleLowerCase('pt-BR').includes(query)).sort((a,b)=>descending?b.area2025-a.area2025:a.area2025-b.area2025);
    document.getElementById('classChart').innerHTML=rows.map(x=>`<div class="class-row"><div class="class-name" title="${x.name}"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${x.color};margin-right:6px"></span>${x.name}</div><div class="bars"><div class="bar-line" title="1985: ${n2.format(x.area1985)} ha"><i class="bar-old" style="width:${Math.max(0.4,x.area1985/maxClass*100)}%"></i></div><div class="bar-line" title="2025: ${n2.format(x.area2025)} ha"><i class="bar-new" style="width:${Math.max(0.4,x.area2025/maxClass*100)}%"></i></div></div><div class="class-value">${area(x.area1985)} → ${area(x.area2025)}</div></div>`).join('')||'<div class="section-sub">Nenhuma classe encontrada.</div>';
  }
  document.getElementById('classSearch').addEventListener('input',renderClasses);
  document.getElementById('sortClasses').addEventListener('click',e=>{descending=!descending;e.currentTarget.innerHTML=`Ordenar: ${descending?'maior':'menor'} em 2025 <span>↕</span>`;renderClasses()});
  renderClasses();

  const flows=d.flows;
  const maxFlow=Math.max(...flows.map(x=>x.ha));
  document.getElementById('flowChart').innerHTML=flows.map(x=>`<div class="flow-row"><div class="flow-caption"><span>${x.fromName} <small>→</small> ${x.toName}</span><b>${n2.format(x.ha)} ha</b></div><div class="flow-track"><i style="width:${x.ha/maxFlow*100}%"></i></div></div>`).join('');

  const ids=classes.map(x=>x.id).sort((a,b)=>a-b);
  const lookup=new Map(d.matrix.map(x=>[`${x.from}-${x.to}`,x.ha]));
  const maxCell=Math.max(...d.matrix.map(x=>x.ha));
  const mix=(a,b,t)=>Math.round(a+(b-a)*t);
  const color=t=>`rgb(${mix(239,54,t)},${mix(242,105,t)},${mix(235,69,t)})`;
  const chart=document.getElementById('matrixChart');
  const head=document.createElement('div');head.className='matrix-row';head.innerHTML='<span class="matrix-label">1985 ↓ · 2025 →</span>'+ids.map(id=>`<span class="matrix-head" title="${d.names[id]}">${id}</span>`).join('');chart.append(head);
  ids.forEach(from=>{
    const row=document.createElement('div');row.className='matrix-row';row.innerHTML=`<span class="matrix-label" title="${d.names[from]}">${d.names[from]}</span>`+ids.map(to=>{
      const value=lookup.get(`${from}-${to}`)||0;const t=value?Math.max(.08,Math.log1p(value)/Math.log1p(maxCell)):0;
      return `<button class="matrix-cell" type="button" style="background:${color(t)}" aria-label="${d.names[from]} para ${d.names[to]}: ${n2.format(value)} hectares" data-from="${from}" data-to="${to}" data-ha="${value}"></button>`;
    }).join('');chart.append(row);
  });
  const tip=document.getElementById('matrixTip');
  chart.addEventListener('click',e=>{const b=e.target.closest('.matrix-cell');if(!b)return;const from=+b.dataset.from,to=+b.dataset.to;tip.innerHTML=`<b>${d.names[from]}</b> → <b>${d.names[to]}</b> <span>·</span> ${n2.format(+b.dataset.ha)} hectares`});
})();
