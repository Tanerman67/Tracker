const DASHBOARD_MODULES={
 nutrition:['🍽️','Питание','Nutrition'],protein:['🥩','Белок','Protein'],steps:['🚶','Шаги','Steps'],sleep:['😴','Сон','Sleep'],weight:['⚖️','Вес и замеры','Weight & body'],gym:['🏋️','Тренировка','Workout'],outdoors:['☀️','Улица','Outdoors'],smoke:['🚭','Без сигарет','Smoke-free'],alcohol:['🍷','Без алкоголя','Alcohol-free'],cycle:['◌','Цикл','Cycle'],english:['A','Английский: время','English Activity']
};
function dashboardAvailable(){return {...DASHBOARD_MODULES,...Object.fromEntries(data.trackers.filter(t=>!DASHBOARD_MODULES[t.id]&&t.id!=='english_general'&&!t.id.startsWith('english_')).map(t=>[t.id,[t.icon||'＋',t.name,t.name]]))}}
function dashboardChange(id,action,value){
 const blocks=data.dashboard.blocks,index=blocks.findIndex(b=>b.id===id);
 if(action==='toggle'){if(index>=0)blocks.splice(index,1);else{blocks.push({id,size:'compact'});if(id==='cycle')data.cycle.enabled=true}}
 if(action==='move'&&index>=0){const target=index+Number(value);if(target>=0&&target<blocks.length)[blocks[index],blocks[target]]=[blocks[target],blocks[index]]}
 if(action==='size'&&index>=0)blocks[index].size=value==='expanded'?'expanded':'compact';
 save();renderDashboardSettings();
}
function resetDashboard(){if(!confirm(trText('Вернуть стандартный набор блоков? Записи сохранятся.','Reset dashboard layout? All records will be kept.')))return;data.dashboard.blocks=defaultDashboardBlocks();save();renderDashboardSettings()}
function renderDashboardSettings(){
 const available=dashboardAvailable(),blocks=data.dashboard.blocks;
 moduleShell(trText('Настроить главную','Customize Today'),`<p>${trText('Скрытие блока сохраняет все записи. Кнопки вверх и вниз меняют порядок.','Hiding a block keeps all records. Use up and down buttons to change the order.')}</p>${blocks.filter(b=>available[b.id]).map((b,i)=>{const [icon,ru,en]=available[b.id];return `<div class="layout-row"><strong>${escapeHTML(icon+' '+trText(ru,en))}</strong><div class="layout-actions"><button class="secondary" aria-label="${trText('Вверх','Move up')}" onclick="dashboardChange(${inlineArgument(b.id)},'move',-1)" ${i===0?'disabled':''}>↑</button><button class="secondary" aria-label="${trText('Вниз','Move down')}" onclick="dashboardChange(${inlineArgument(b.id)},'move',1)" ${i===blocks.length-1?'disabled':''}>↓</button><button class="secondary" onclick="dashboardChange(${inlineArgument(b.id)},'size','${b.size==='expanded'?'compact':'expanded'}')">${b.size==='expanded'?trText('Компактно','Compact'):trText('Шире','Expand')}</button><button class="ghost" onclick="dashboardChange(${inlineArgument(b.id)},'toggle')">${trText('Скрыть','Hide')}</button></div></div>`}).join('')}<h3>${trText('Добавить блок','Add a block')}</h3><div class="module-actions">${Object.entries(available).filter(([id])=>!blocks.some(b=>b.id===id)).map(([id,[icon,ru,en]])=>`<button class="secondary" onclick="dashboardChange(${inlineArgument(id)},'toggle')">+ ${escapeHTML(icon+' '+trText(ru,en))}</button>`).join('')}</div><button class="ghost" onclick="resetDashboard()">${trText('Сбросить расположение','Reset layout')}</button>`);
}
function dashboardOpen(id,date){
 if(id==='nutrition'||id==='protein')return nutritionOpen(date);
 if(id==='cycle')return openModule('cycle');
 if(id==='english')return openModule('activity');
 if(id==='smoke'){show('settings',document.getElementById('tabSettings'));document.getElementById('smokeDate').focus();return}
 if(id==='alcohol'&&!alcoholTrackingStart()){show('settings',document.getElementById('tabSettings'));document.getElementById('alcoholDate').focus();return}
 if(tracker(id)?.type==='boolean'&&id!=='gym'){ensureDay(date)[id]=data.logs?.[date]?.[id]!==true;save();return}
 return openTodayMetric(id,date);
}
function dashboardCard(id,date){
 const definitions=dashboardAvailable(),definition=definitions[id];if(!definition)return null;
 const [icon,ru,en]=definition,el=document.createElement('button');el.type='button';el.className='metric-card today-metric';el.dataset.metric=id;el.onclick=()=>dashboardOpen(id,date);
 let main='—',status=trText('Нет данных','No data'),state='neutral',progress=null;
 if(id==='nutrition'){
  const c=nutritionAggregate(date).calories,g=nutritionProgressState(c,data.nutrition.goals.calories);main=nutritionDisplay(c);
  status=g.goal===null?trText('Нажми, чтобы добавить еду','Tap to log food'):g.over?trText('Сверх лимита: ','Over limit: ')+todayNumber(g.over)+' kcal':g.remaining!==null?trText('Осталось: ','Remaining: ')+todayNumber(g.remaining)+' kcal':trText('Часть данных неизвестна','Some values are unknown');
  if(g.percent!==null)status+=' · '+(c.partial?'≥ ':'')+todayNumber(g.percent)+'%';state=g.over?'over':'neutral';progress=g.percent;
 }else if(id==='smoke'){
  if(validDay(data.smokeDate)&&data.smokeDate<=date){main=todayNumber(weeklyDiffDays(data.smokeDate,date))+' '+trText('дней','days');status=trText('От выбранной даты отказа','Since your quit date')}
  else status=trText('Нажми, чтобы выбрать дату','Tap to set a quit date');
 }else if(id==='alcohol'){
  if(!alcoholTrackingStart())status=trText('Нажми, чтобы начать учёт','Tap to start tracking');
  else if(date<alcoholTrackingStart())status=trText('До начала учёта','Before tracking began');
  else{main=alcoholIsDrink(date)?trText('Есть отметка','Logged'):todayNumber(todayAlcoholFreeDays(date))+' '+trText('дней','days');status=trText('По отмеченной истории','Based on marked history')}
 }else if(id==='weight'){
  const measurement=todayLatestWeight(date);if(measurement){main=todayNumber(measurement.value)+' kg';status=measurement.date}
 }else if(id==='cycle'){
  const s=cycleStats(data.cycle.periods,date);if(s.latest){main=s.latest.start;status=s.next?trText('Оценка следующего: ','Estimated next: ')+s.next:trText('Последнее записанное начало','Latest recorded start')}
  else status=trText('Добавить первую запись','Add your first period');
 }else if(id==='english'){
  main=todayNumber(activityMinutes(date))+' '+trText('мин','min');const week=activityWeek(date);status=trText('Неделя: ','Week: ')+todayNumber(week)+(data.englishGoal>0?' / '+todayNumber(data.englishGoal):'')+' '+trText('мин','min');progress=data.englishGoal>0?week/data.englishGoal*100:null;
 }else if(tracker(id)?.type==='boolean'){
  const v=data.logs?.[date]?.[id];main=v===true?trText('Выполнено','Done'):v===false?trText('Нет','No'):'—';status=trText('Нажми, чтобы изменить','Tap to change');
  if(id==='gym')status+= ' · '+weeklyKeys(weeklyMonday(date),7).filter(k=>data.logs?.[k]?.gym===true).length+' / '+(data.gymGoal??'—')+' '+trText('за неделю','this week');
 }else{
  const s=todayMetricState(id,date),rule=goalRule(id),gs=goalState(s.value,rule);state=gs.status;progress=gs.percent;
  main=s.value===null?'—':todayNumber(s.value);if(rule.type==='range')main+=' / '+todayNumber(rule.target)+'-'+todayNumber(rule.upper);else if(s.goal!==null&&rule.type!=='observe')main+=' / '+todayNumber(s.goal);main+=' '+trUnit(tracker(id));
  status=({missing:trText('Нет данных','No data'),logged:trText('Записано','Logged'),met:trText('Цель достигнута','Goal reached'),progress:trText('Ниже цели','Below goal'),within:trText('В пределах лимита','Within limit'),over:trText('Выше диапазона / лимита','Above range / limit')})[state];
  if(id==='protein'){const source=nutritionEffectiveProtein(date);status+=' · '+(source.source==='manual'?trText('ручная запись','manual entry'):source.source==='foods'?trText('из еды','food diary'):trText('нет источника','no source'));if(source.partial)status+=' · '+trText('частично','partial')}
 }
 el.dataset.state=state;
 el.innerHTML=`<div class="today-metric-title"><span aria-hidden="true">${escapeHTML(icon)}</span><span>${escapeHTML(trText(ru,en))}</span></div><div class="today-metric-value">${escapeHTML(main)}</div><div class="today-metric-status">${escapeHTML(status)}</div>${progress===null?'':`<div class="metric-bar" aria-hidden="true"><span style="width:${Math.max(0,Math.min(100,progress))}%"></span></div>`}`;
 if(id==='protein'&&progress!==null){const value=nutritionEffectiveProtein(date);const ring=document.createElement('span');ring.className='today-protein-ring';ring.append(nutritionRingSvg(nutritionProgressState(value,data.proteinGoal),{home:true}));el.querySelector('.today-metric-title').append(ring)}
 return el;
}
function dashboardWeekly(date){
 const keys=weeklyKeys(weeklyMonday(date),7).filter(k=>k<=date),stats=weeklyNumericStats('steps',keys),protein=weeklyNumericStats('protein',keys);
 const format=s=>s.count?todayNumber(s.avg):'—';
 document.getElementById('todayWeekly').textContent=trText('Эта неделя · Средние шаги: ','This week · Average steps: ')+format(stats)+' · '+stats.count+'/'+keys.length+trText(' дней записано. Средний белок: ',' days logged. Average protein: ')+format(protein)+' g · '+protein.count+'/'+keys.length+trText(' дней.',' days.');
 document.getElementById('todayCustomize').textContent=trText('Настроить блоки','Customize blocks');
 document.getElementById('todayPrivacy').textContent=trText('Данные только в этом браузере. На другое устройство их можно перенести через JSON backup.','Records stay in this browser. Use a JSON backup to move them to another device.');
}
