(() => {
  'use strict';
  const d = window.DASHBOARD_DATA;
  const $ = id => document.getElementById(id);
  const nf = new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 1});
  const integer = new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 0});
  const precise = new Intl.NumberFormat('pt-BR', {maximumFractionDigits:3});
  const fmt = n => (Math.abs(n)>0 && Math.abs(n)<.1 ? precise : nf).format(n);
  const signed = n => `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmt(Math.abs(n))}`;
  const total = d.indicators.areaHa;
  const pct = n => n / total * 100;
  // Presentation colors distinguish land-cover classes; source map retains its original legend.
  const palette = {3:'#28704d',9:'#6c8552',11:'#63a4a0',12:'#afbd78',15:'#d4bc72',21:'#ae9264',24:'#be785f',25:'#c49b8d',29:'#7f8b83',30:'#8c6266',32:'#c89b59',33:'#4d8fa5',41:'#b492a0'};
  const classes = d.classes.map(c => ({...c, color:palette[c.id], change:c.area2025-c.area1985}));
  const byId = Object.fromEntries(classes.map(c=>[c.id,c]));
  let selected = 3, filtered = false, unit = 'ha';
  const relative = c => c.area1985 ? `${signed(c.change/c.area1985*100)}%` : c.area2025 ? 'Nova no recorte' : 'Sem variação';
  const tooltip = $('tooltip');
  let focusTip=null;
  const classTip = c => `<strong>${c.name}</strong><div><span>1985</span><b>${fmt(c.area1985)} ha · ${fmt(pct(c.area1985))}%</b></div><div><span>2025</span><b>${fmt(c.area2025)} ha · ${fmt(pct(c.area2025))}%</b></div><small>Variação: ${signed(c.change)} ha · ${relative(c)}<br>Participação: ${signed(pct(c.change))} pontos percentuais</small>`;
  const transitionTip = (from,to,ha) => `<strong>${byId[from].name} → ${byId[to].name}</strong><div><span>1985 → 2025</span><b>${fmt(ha)} ha</b></div><small>${fmt(pct(ha))}% do território · ${from===to?'Permanência na mesma classe':'Mudança de classificação'}<br>${byId[from].area1985 ? fmt(ha/byId[from].area1985*100) : '0'}% da classe de origem em 1985</small>`;
  function positionTip(x,y){
    const box = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(10,Math.min(x+16,window.innerWidth-box.width-10))}px`;
    tooltip.style.top = `${Math.max(10,Math.min(y+16,window.innerHeight-box.height-10))}px`;
  }
  function showTip(el,event){
    if(el.dataset.tipClass) tooltip.innerHTML=classTip(byId[el.dataset.tipClass]);
    else if(el.dataset.from) tooltip.innerHTML=transitionTip(+el.dataset.from,+el.dataset.to,+el.dataset.ha);
    else if(el.dataset.code) tooltip.innerHTML=`<strong>${el.dataset.code} · ${byId[el.dataset.code].name}</strong>`;
    else return;
    tooltip.hidden=false;
    if(event.type==='focusin'){const r=el.getBoundingClientRect();positionTip(r.left+r.width/2,r.top+r.height/2)}
    else positionTip(event.clientX,event.clientY);
  }
  const tipSelector='[data-tip-class],[data-from],[data-code]';
  document.addEventListener('pointerover',e=>{const el=e.target.closest(tipSelector);if(el)showTip(el,e)});
  document.addEventListener('pointermove',e=>{if(!tooltip.hidden)positionTip(e.clientX,e.clientY)});
  document.addEventListener('pointerout',e=>{const el=e.target.closest(tipSelector);if(el&&!el.contains(e.relatedTarget)){if(focusTip)showTip(focusTip,{type:'focusin'});else tooltip.hidden=true}});
  document.addEventListener('focusin',e=>{const el=e.target.closest(tipSelector);focusTip=el;if(el)showTip(el,e)});
  document.addEventListener('focusout',()=>{focusTip=null;tooltip.hidden=true});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){focusTip=null;tooltip.hidden=true}});
  window.addEventListener('scroll',()=>{if(focusTip)showTip(focusTip,{type:'focusin'});else tooltip.hidden=true},{passive:true});
  $('totalArea').textContent=integer.format(total);
  $('stableArea').textContent=integer.format(d.indicators.stableHa);
  $('changedArea').textContent=integer.format(d.indicators.changedHa);
  $('stablePct').textContent=fmt(d.indicators.stablePct)+'%';
  $('changedPct').textContent=fmt(d.indicators.changedPct)+'%';
  $('stableBar').style.width=d.indicators.stablePct+'%';
  $('changedBar').style.width=d.indicators.changedPct+'%';
  $('forestDelta').textContent=signed(byId[3].change);
  $('forestNote').textContent=`${relative(byId[3])} em relação a 1985`;
  const compositionOrder=[...classes].sort((a,b)=>b.area2025-a.area2025);
  function renderYear(year){
    let offset=0;
    const circles=compositionOrder.filter(c=>c['area'+year]>0).map(c=>{
      const share=pct(c['area'+year]);
      const circle=`<circle cx="70" cy="70" r="51" pathLength="100" stroke="${c.color}" stroke-dasharray="${share} ${100-share}" stroke-dashoffset="${-offset}" tabindex="0" role="button" aria-label="${c.name}, ${year}: ${fmt(c['area'+year])} hectares. Selecionar classe" data-select="${c.id}" data-tip-class="${c.id}"/>`;
      offset+=share;return circle;
    }).join('');
    $('year'+year).innerHTML=`<div class="year-heading"><h3>${year}</h3><span>${year===1985?'PONTO DE PARTIDA':'RETRATO RECENTE'}</span></div><div class="donut-layout"><div class="donut"><svg viewBox="0 0 140 140" aria-label="Composição territorial em ${year}">${circles}</svg><div class="donut-center"><strong>${fmt(pct(byId[3]['area'+year]))}%</strong><small>de floresta</small></div></div><div class="year-story"><b>${fmt(byId[3]['area'+year])}</b>ha de formação florestal<span>${year===1985?'O início da comparação':'A maior classe do território'}</span></div></div><div class="year-bottom"><span>13 classes no recorte</span><b>${integer.format(total)} ha</b></div>`;
  }
  renderYear(1985);renderYear(2025);
  function renderLegend(){
    $('compositionLegend').innerHTML=compositionOrder.map(c=>`<button type="button" data-select="${c.id}" data-tip-class="${c.id}" aria-pressed="${selected===c.id}"><i class="color-dot" style="background:${c.color}"></i>${c.name}</button>`).join('');
  }
  function renderDetail(){
    const c=byId[selected];
    $('classDetail').innerHTML=`<div class="detail-eyebrow"><i class="color-dot" style="background:${c.color}"></i>CLASSE EM DESTAQUE</div><h3>${c.name}</h3><div class="detail-values"><div>1985<b>${fmt(c.area1985)}</b><small>ha · ${fmt(pct(c.area1985))}% da área</small></div><div>2025<b>${fmt(c.area2025)}</b><small>ha · ${fmt(pct(c.area2025))}% da área</small></div></div><div class="detail-change">${signed(c.change)} ha <span>· ${relative(c)}</span><small>${signed(pct(c.change))} p.p. na participação territorial</small></div>`;
  }
  function renderClasses(){
    const query=$('classSearch').value.trim().toLocaleLowerCase('pt-BR');
    const sort=$('sortClasses').value;
    const rows=classes.filter(c=>c.name.toLocaleLowerCase('pt-BR').includes(query)).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'pt-BR'):sort==='delta'?Math.abs(b.change)-Math.abs(a.change):b.area2025-a.area2025);
    const max=Math.max(...classes.flatMap(c=>[c.area1985,c.area2025]));
    const value=n=>unit==='ha'?fmt(n):fmt(pct(n))+'%';
    $('classChart').innerHTML=rows.map(c=>`<button type="button" class="class-row ${selected===c.id?'selected':''}" data-select="${c.id}" data-tip-class="${c.id}" aria-pressed="${selected===c.id}" aria-label="${c.name}: ${fmt(c.area1985)} hectares em 1985; ${fmt(c.area2025)} em 2025. Selecionar classe"><span class="class-name"><i class="color-dot" style="background:${c.color}"></i>${c.name}</span><span class="bars"><span class="bar-line"><i class="bar-old" style="width:${c.area1985/max*100}%"></i></span><span class="bar-line"><i class="bar-new" style="width:${c.area2025/max*100}%"></i></span></span><span class="class-value"><span>${value(c.area1985)}</span><small> → </small><span>${value(c.area2025)}</span></span><span class="delta ${c.change>=0?'positive':'negative'}">${unit==='ha'?signed(c.change):signed(pct(c.change))}${unit==='ha'?'':' p.p.'}<small>${relative(c)}</small></span></button>`).join('')||'<p class="section-sub">Nenhuma classe encontrada. Tente outro nome.</p>';
    // Percentage and hectares are proportional, so a single common scale preserves comparison.
  }
  function renderFlows(){
    const flows=d.matrix.filter(t=>t.from!==t.to&&t.ha>0&&(!filtered||t.from===selected||t.to===selected)).sort((a,b)=>b.ha-a.ha).slice(0,8);
    const max=flows[0]?.ha||1;
    $('flowFilter').textContent=filtered?`Entradas e saídas de ${byId[selected].name.toLocaleLowerCase('pt-BR')}.`:'As 8 maiores transições entre classes no território.';
    $('flowCount').textContent=`${flows.length} TRANSIÇÕES`;
    $('clearFilter').textContent=filtered?'Limpar seleção de classe':'Ver todas as classes';
    $('clearFilter').disabled=!filtered;
    $('flowChart').innerHTML=flows.map(t=>`<button class="flow-row" type="button" data-from="${t.from}" data-to="${t.to}" data-ha="${t.ha}" aria-label="${byId[t.from].name} para ${byId[t.to].name}: ${fmt(t.ha)} hectares"><span class="flow-caption"><span>${byId[t.from].name}<small>→</small>${byId[t.to].name}</span><b>${fmt(t.ha)} ha</b></span><span class="flow-track"><i style="width:${t.ha/max*100}%"></i></span></button>`).join('')||'<p class="section-sub">Não há transições registradas para esta classe.</p>';
    document.querySelectorAll('.matrix-row[data-row]').forEach(row=>row.classList.toggle('related',filtered&&+row.dataset.row===selected));
  }
  const ids=classes.map(c=>c.id).sort((a,b)=>a-b);
  const lookup=new Map(d.matrix.map(t=>[`${t.from}-${t.to}`,t.ha]));
  const maxCell=Math.max(...d.matrix.map(t=>t.ha));
  const mix=(a,b,t)=>Math.round(a+(b-a)*t);
  const color=t=>`rgb(${mix(240,30,t)},${mix(244,96,t)},${mix(232,68,t)})`;
  $('matrixChart').innerHTML=`<div class="matrix-row"><span class="matrix-label">Origem / destino</span>${ids.map(id=>`<button class="matrix-head" type="button" data-code="${id}" data-select="${id}" aria-label="${id}, ${byId[id].name}. Selecionar classe">${id}</button>`).join('')}</div>`+ids.map(from=>`<div class="matrix-row" data-row="${from}"><span class="matrix-label" title="${from} · ${byId[from].name}">${from} · ${byId[from].name}</span>${ids.map(to=>{const ha=lookup.get(`${from}-${to}`)||0;return `<button type="button" class="matrix-cell" style="background:${color(Math.log1p(ha)/Math.log1p(maxCell))}" data-from="${from}" data-to="${to}" data-ha="${ha}" aria-label="${byId[from].name} para ${byId[to].name}: ${fmt(ha)} hectares"></button>`}).join('')}</div>`).join('');
  $('matrixCodes').innerHTML=ids.map(id=>`<span><b>${id}</b> · ${byId[id].name}</span>`).join('');
  function selectClass(id){
    selected=id;filtered=true;tooltip.hidden=true;
    for(const year of [1985,2025]){
      const panel=$('year'+year), c=byId[id];
      panel.querySelector('.donut-center strong').textContent=fmt(pct(c['area'+year]))+'%';
      panel.querySelector('.donut-center small').textContent='da área total';
      panel.querySelector('.year-story').innerHTML=`<b>${fmt(c['area'+year])}</b>ha · ${c.name}<span>Classe selecionada</span>`;
      panel.querySelectorAll('circle').forEach(circle=>circle.dataset.highlighted=String(+circle.dataset.select===id));
    }
    renderDetail();renderLegend();renderClasses();renderFlows();
  }
  document.addEventListener('click',e=>{
    const selection=e.target.closest('[data-select]');
    if(selection)selectClass(+selection.dataset.select);
    const transition=e.target.closest('[data-from]');
    if(transition){$('matrixTip').innerHTML=`<b>${byId[transition.dataset.from].name}</b> → <b>${byId[transition.dataset.to].name}</b> · ${fmt(+transition.dataset.ha)} ha (${fmt(pct(+transition.dataset.ha))}% do território)`;}
  });
  document.addEventListener('keydown',e=>{if(e.target.matches('circle[data-select]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectClass(+e.target.dataset.select)}});
  $('classSearch').addEventListener('input',renderClasses);
  $('sortClasses').addEventListener('change',renderClasses);
  document.querySelectorAll('[data-unit]').forEach(button=>button.addEventListener('click',()=>{
    unit=button.dataset.unit;
    document.querySelectorAll('[data-unit]').forEach(b=>b.setAttribute('aria-pressed',b===button));
    renderClasses();
  }));
  $('clearFilter').addEventListener('click',()=>{filtered=false;renderFlows()});
  const navLinks=[...document.querySelectorAll('nav a')];
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(visible)navLinks.forEach(a=>{const active=a.hash==='#'+visible.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
  },{rootMargin:'-5% 0px -55% 0px',threshold:[0,.1,.5]});
  document.querySelectorAll('main[id],section[id]').forEach(section=>observer.observe(section));
  renderLegend();renderDetail();renderClasses();renderFlows();
})();
