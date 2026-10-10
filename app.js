const EMPLOYEES = [
 {id:0,nombre:'Damian Reyes',rol:'LIDERPROYECTO',desempenio:1,foto:'assets/perfil_1.jpeg'},
 {id:1,nombre:'Victor Fernandez',rol:'PROGRAMADOR',desempenio:5,foto:'assets/perfil_2.jpeg'},
 {id:2,nombre:'Sergio Perez',rol:'ARQUITECTO',desempenio:4,foto:'assets/perfil_3.jpeg'},
 {id:3,nombre:'Enrique Gonzales',rol:'PROGRAMADOR',desempenio:5,foto:'assets/perfil_4.jpeg'},
 {id:4,nombre:'Juan Rodriguez',rol:'PROGRAMADOR',desempenio:4,foto:'assets/perfil_5.jpeg'},
 {id:5,nombre:'Lian Hub',rol:'LIDERPROYECTO',desempenio:1,foto:'assets/perfil_6.jpeg'},
 {id:6,nombre:'Federico Noria',rol:'LIDERPROYECTO',desempenio:1,foto:'assets/perfil_7.jpeg'},
 {id:7,nombre:'Juan Roman Quiroga',rol:'LIDERPROYECTO',desempenio:3,foto:'assets/perfil_8.jpeg'},
 {id:8,nombre:'Elizabeth Ferrer',rol:'LIDERPROYECTO',desempenio:5,foto:'assets/perfil_9.jpeg'},
 {id:9,nombre:'Nicolas Dario Lower',rol:'ARQUITECTO',desempenio:4,foto:'assets/perfil_10.jpeg'},
 {id:10,nombre:'Micaela Analia Britez',rol:'PROGRAMADOR',desempenio:3,foto:'assets/perfil_11.jpeg'},
 {id:11,nombre:'Julieta Vera',rol:'ARQUITECTO',desempenio:5,foto:'assets/perfil_12.jpeg'},
 {id:12,nombre:'Maria Cham',rol:'ARQUITECTO',desempenio:4,foto:'assets/perfil_13.jpeg'},
 {id:13,nombre:'Hernan Becerra',rol:'ARQUITECTO',desempenio:5,foto:'assets/perfil_14.jpeg'},
 {id:14,nombre:'Magali Nisman',rol:'TESTER',desempenio:5,foto:'assets/perfil_15.jpeg'},
 {id:15,nombre:'Xian Xuan',rol:'TESTER',desempenio:4,foto:'assets/perfil_16.jpeg'},
 {id:16,nombre:'Jhon Carper',rol:'TESTER',desempenio:4,foto:'assets/perfil_17.jpeg'},
 {id:17,nombre:'Jhon Carper',rol:'TESTER',desempenio:4,foto:'assets/perfil_18.jpeg'},
 {id:18,nombre:'Robert Nash',rol:'TESTER',desempenio:3,foto:'assets/perfil_19.jpeg'},
 {id:19,nombre:'Jazmin Gill',rol:'PROGRAMADOR',desempenio:4,foto:'assets/perfil_20.jpeg'}
];
// IDs de incompatibilidades tomados de RRHH/incompatibilidades.json del proyecto original.
const INCOMPATIBILITIES = [[1,2],[3,4],[6,5],[7,8],[8,9],[10,12]];
const ROLE_NAMES = {LIDERPROYECTO:'Líder de proyecto',ARQUITECTO:'Arquitecto',PROGRAMADOR:'Programador',TESTER:'Tester'};
const ROLE_ORDER = ['LIDERPROYECTO','ARQUITECTO','PROGRAMADOR','TESTER'];
const $ = s => document.querySelector(s);
const pairKey = (a,b) => a < b ? `${a}:${b}` : `${b}:${a}`;
const incompatSet = new Set(INCOMPATIBILITIES.map(([a,b])=>pairKey(a,b)));
const isCompatible = (candidate, team) => team.every(member => !incompatSet.has(pairKey(candidate.id,member.id)));
const score = team => team.reduce((sum,e)=>sum+e.desempenio,0);
const roleCounts = () => Object.fromEntries(ROLE_ORDER.map(role=>[role,Number(document.querySelector(`[data-role="${role}"]`).value)]));
const fmtTime = ms => ms < 1 ? `${ms.toFixed(3)} ms` : `${ms.toFixed(2)} ms`;
function renderIncompatibilities(){
 $('#incompat-list').innerHTML = INCOMPATIBILITIES.map(([a,b])=>{
  const x=EMPLOYEES.find(e=>e.id===a), y=EMPLOYEES.find(e=>e.id===b);
  return `<div class="incompat-row"><span><i class="person-chip">${x.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')}</i>${x.nombre}<b class="versus">↔</b><i class="person-chip">${y.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')}</i>${y.nombre}</span><span class="versus">NO COMPATIBLES</span></div>`;
 }).join('');
 $('#incompat-count').textContent=INCOMPATIBILITIES.length; $('#incompat-label').textContent=`${INCOMPATIBILITIES.length} pares`;
}
function validateCounts(counts){
 const errors=[]; for(const role of ROLE_ORDER){if(!Number.isInteger(counts[role])||counts[role]<0||counts[role]>5) errors.push(`La cantidad de ${ROLE_NAMES[role].toLowerCase()} debe estar entre 0 y 5.`);}
 const total=Object.values(counts).reduce((a,b)=>a+b,0); if(total>20) errors.push('El equipo solicitado supera los 20 candidatos disponibles.');
 for(const role of ROLE_ORDER){const available=EMPLOYEES.filter(e=>e.rol===role).length;if(counts[role]>available)errors.push(`Solo hay ${available} candidatos para el rol ${ROLE_NAMES[role].toLowerCase()}.`);}
 return errors;
}
function runBacktracking(counts){
 const start=performance.now(); let best=null,bestScore=-1,nodes=0;
 const selected=[], countsNow=Object.fromEntries(ROLE_ORDER.map(r=>[r,0]));
 const candidates=EMPLOYEES;
 const suffix=Array(candidates.length+1); suffix[candidates.length]=Object.fromEntries(ROLE_ORDER.map(r=>[r,0]));
 for(let i=candidates.length-1;i>=0;i--){suffix[i]={...suffix[i+1]};suffix[i][candidates[i].rol]++;}
 function dfs(index,currentScore){
  nodes++;
  if(ROLE_ORDER.some(role=>countsNow[role]>counts[role]))return;
  if(ROLE_ORDER.some(role=>countsNow[role]+suffix[index][role]<counts[role]))return;
  if(currentScore+remainingUpperBound(index,countsNow,counts)<bestScore)return;
  if(ROLE_ORDER.every(role=>countsNow[role]===counts[role])){if(currentScore>bestScore){bestScore=currentScore;best=selected.slice();}return;}
  if(index>=candidates.length)return;
  const e=candidates[index];
  if(countsNow[e.rol]<counts[e.rol]&&isCompatible(e,selected)){
   selected.push(e);countsNow[e.rol]++;dfs(index+1,currentScore+e.desempenio);countsNow[e.rol]--;selected.pop();
  }
  dfs(index+1,currentScore);
 }
 function remainingUpperBound(index,used,required){
  let bound=0;
  for(const role of ROLE_ORDER){const needed=required[role]-used[role];if(needed<=0)continue;const vals=candidates.slice(index).filter(e=>e.rol===role).map(e=>e.desempenio).sort((a,b)=>b-a);if(vals.length<needed)return -Infinity;bound+=vals.slice(0,needed).reduce((a,b)=>a+b,0);}
  return bound;
 }
 dfs(0,0);
 return {team:best,score:best?bestScore:0,iterations:nodes,time:performance.now()-start};
}
function runGreedy(counts){
 const start=performance.now();let checked=0;const selected=[];const used=new Set();
 // Reproduce la intención de la heurística del proyecto: priorizar candidatos con menor razón incompatibilidades/desempeño.
 const ratio=e=>{const conflicts=INCOMPATIBILITIES.filter(pair=>pair.includes(e.id)).length;return conflicts/Math.max(e.desempenio,1)};
 const sorted=EMPLOYEES.slice().sort((a,b)=>ratio(a)-ratio(b)||b.desempenio-a.desempenio||a.id-b.id);
 const order=['LIDERPROYECTO','PROGRAMADOR','ARQUITECTO','TESTER'];
 for(const role of order){let need=counts[role];for(const e of sorted){if(need===0)break;if(e.rol!==role||used.has(e.id))continue;checked++;if(!isCompatible(e,selected))continue;selected.push(e);used.add(e.id);need--;}}
 const complete=ROLE_ORDER.every(role=>selected.filter(e=>e.rol===role).length===counts[role]);
 return {team:complete?selected:null,score:complete?score(selected):0,iterations:checked,time:performance.now()-start};
}
function renderTeam(result){
 const grid=$('#team-grid'); if(!result?.team){grid.innerHTML='<div class="empty-state"><div class="empty-icon">!</div><strong>No se encontró un equipo válido</strong><span>Probá cambiar las cantidades por rol o revisá las incompatibilidades.</span></div>';return;}
 grid.innerHTML=ROLE_ORDER.flatMap(role=>result.team.filter(e=>e.rol===role)).map(e=>`<article class="employee-card"><img src="${e.foto}" alt="Foto de ${e.nombre}" loading="lazy"><div class="employee-info"><strong title="${e.nombre}">${e.nombre}</strong><span>${ROLE_NAMES[e.rol]}</span></div><span class="performance">${e.desempenio}<small>/5</small></span></article>`).join('');
}
function setMetric(prefix,result){$(`#${prefix}-time`).textContent=fmtTime(result.time);$(`#${prefix}-iterations`).textContent=result.iterations.toLocaleString('es-AR');const status=$(`#${prefix}-status`);status.textContent=result.team?'Solución válida':'Sin solución';status.className=`algo-status ${result.team?'good':'bad'}`;}
function run(){
 const counts=roleCounts(),errors=validateCounts(counts);if(errors.length){$('#notice').className='notice error';$('#notice').textContent=errors.join(' ');return;}
 $('#run-btn').disabled=true;$('#run-btn').innerHTML='<span>◌</span> Ejecutando…';$('#notice').className='notice';$('#notice').textContent='Calculando combinaciones válidas…';
 // Ceder un frame para que el navegador actualice el botón antes de calcular.
 requestAnimationFrame(()=>{setTimeout(()=>{
  const bt=runBacktracking(counts),greedy=runGreedy(counts);setMetric('bt',bt);setMetric('greedy',greedy);
  $('#team-score').innerHTML=bt.team?`${bt.score} <span>/ ${Object.values(counts).reduce((sum,n)=>sum+n,0)*5}</span>`:'—';
  $('#solution-title').textContent=bt.team?`${bt.team.length} personas seleccionadas por backtracking`:'No hay una combinación válida con estas restricciones';
  $('#validation-label').textContent=bt.team?'Roles e incompatibilidades verificados':'Sin solución';$('#validation-label').className=`validation ${bt.team?'valid':'invalid'}`;
  renderTeam(bt);const total=Object.values(counts).reduce((a,b)=>a+b,0);const maxScore=total*5;
  $('#notice').textContent=bt.team?`Backtracking encontró un equipo válido con ${bt.score}/${maxScore} puntos de desempeño. Se exploraron ${bt.iterations.toLocaleString('es-AR')} estados de búsqueda.`:'No se encontró una solución válida. Reducí el equipo solicitado o cambiá las incompatibilidades.';
  $('#comparison').hidden=false;
  if(bt.team&&greedy.team){const diff=bt.score-greedy.score;$('#score-diff').textContent=diff===0?'Mismo desempeño':`Diferencia: +${diff} puntos`;
   $('#comparison-copy').textContent=diff===0?`En este escenario, la heurística golosa alcanzó el mismo desempeño que backtracking. Eso no significa que garantice el óptimo para otras entradas.`:`Backtracking obtuvo ${bt.score} puntos y la heurística golosa ${greedy.score}. En este escenario, la búsqueda encontró una solución de mayor desempeño; el algoritmo goloso no garantiza el óptimo.`;
  }else if(bt.team&&!greedy.team){$('#score-diff').textContent='Solo backtracking encontró solución';$('#comparison-copy').textContent='La heurística golosa no logró completar todos los roles respetando las incompatibilidades. Backtracking sí encontró una combinación válida.';
  }else{$('#score-diff').textContent='Comparación no disponible';$('#comparison-copy').textContent='No se pudo obtener una solución completa para este escenario.';}
  $('#run-btn').disabled=false;$('#run-btn').innerHTML='<span>▶</span> Ejecutar algoritmos <span class="button-arrow">↗</span>';
 },20);});
}
$('#run-btn').addEventListener('click',run);
$('#reset-btn').addEventListener('click',()=>{document.querySelector('[data-role="LIDERPROYECTO"]').value=1;document.querySelector('[data-role="ARQUITECTO"]').value=2;document.querySelector('[data-role="PROGRAMADOR"]').value=4;document.querySelector('[data-role="TESTER"]').value=5;$('#bt-time').textContent=$('#greedy-time').textContent='—';$('#bt-iterations').textContent=$('#greedy-iterations').textContent='—';$('#bt-status').textContent=$('#greedy-status').textContent='Pendiente';$('#bt-status').className=$('#greedy-status').className='algo-status';$('#team-score').innerHTML='— <span>/ 60</span>';$('#solution-title').textContent='Esperando ejecución';$('#validation-label').textContent='Sin validar';$('#validation-label').className='validation';$('#team-grid').innerHTML='<div class="empty-state"><div class="empty-icon">◎</div><strong>Tu equipo aparecerá acá</strong><span>Ejecutá los algoritmos para ver la selección y sus resultados.</span></div>';$('#comparison').hidden=true;$('#notice').className='notice';$('#notice').textContent='Ajustá los roles si querés y ejecutá ambos algoritmos para comparar los resultados.';});
renderIncompatibilities();
