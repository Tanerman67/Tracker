// Optional per-day details; numeric sleep/outdoors logs remain authoritative.
let habitEditor=null;
function habitDetails(date){
  const value=data.logs?.[date]?.habitDetails;
  return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
}
function habitClock(value){
  if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return null;
  const [h,m]=value.split(':').map(Number);return h*60+m;
}
function habitSleepSpan(asleep,wake){
  const a=habitClock(asleep),b=habitClock(wake);
  if(a===null||b===null||a===b)return null;
  return (b-a+1440)%1440;
}
function habitMinutes(value){
  if(value===''||value===null||value===undefined||typeof value==='boolean')return null;
  const n=Number(value);return Number.isFinite(n)&&n>0&&n<=1440?n:null;
}
function habitActivities(date,key){
  const list=habitDetails(date)[key];
  return Array.isArray(list)?list.filter(x=>x&&typeof x==='object'&&habitMinutes(x.minutes)!==null):[];
}
function habitWakeSpread(times){
  const xs=times.map(habitClock).filter(x=>x!==null).sort((a,b)=>a-b);
  if(xs.length<4)return null;
  // Shortest clock arc, so 23:50 and 00:10 are twenty minutes apart.
  let gap=xs[0]+1440-xs[xs.length-1];
  for(let i=1;i<xs.length;i++)gap=Math.max(gap,xs[i]-xs[i-1]);
  return 1440-gap;
}
function habitLabel(ru,en){return escapeHTML(trText(ru,en))}
function habitField(id,ru,en,type='time',extra=''){
  return `<div class="field"><label for="${id}">${habitLabel(ru,en)}</label><input id="${id}" type="${type}" ${extra}></div>`;
}
function openHabitEditor(mode,date=todayDateKey()){
  if(!['sleep','outdoors','blocks'].includes(mode)||date>localDate())return;
  const details=habitDetails(date);
  habitEditor={mode,date,initial:JSON.stringify(details),initialValue:data.logs?.[date]?.[mode],draft:structuredClone(details)};
  if(!Array.isArray(habitEditor.draft.walks))habitEditor.draft.walks=[];
  if(!Array.isArray(habitEditor.draft.blocks))habitEditor.draft.blocks=[];
  const modal=document.getElementById('habitModal');
  modal.classList.add('show');document.body.style.overflow='hidden';
  renderHabitEditor();
}
function closeHabitEditor(){
  document.getElementById('habitModal').classList.remove('show');
  document.body.style.overflow='';habitEditor=null;
}
function renderHabitEditor(){
  if(!habitEditor)return;
  const {mode,date,draft}=habitEditor;
  const name={sleep:trText('Сон','Sleep'),outdoors:trText('Улица и прогулки','Outdoors & walks'),blocks:trText('Работа и отдых','Work & breaks')}[mode];
  document.getElementById('habitTitle').textContent=name+' · '+date;
  document.getElementById('habitClose').setAttribute('aria-label',trText('Закрыть без сохранения','Close without saving'));
  document.getElementById('habitSave').textContent=trText('Сохранить за этот день','Save for this day');
  const duration=mode==='blocks'?'':habitField('habitDuration',mode==='sleep'?'Длительность сна, ч':'Всего на улице за день, мин',mode==='sleep'?'Sleep duration, h':'Total outdoors today, min','number',`min="0" max="${mode==='sleep'?24:1440}" step="0.1" inputmode="decimal"`);
  let content=duration;
  if(mode==='sleep'){
    content+=`<p class="habit-note">${habitLabel('Дата записи — день подъёма. Время необязательно; засыпание может быть накануне.','The entry date is the wake-up day. Times are optional; sleep may start the day before.')}</p><div class="habit-two-fields">${habitField('habitAsleep','Время засыпания','Time you fell asleep')}${habitField('habitWake','Время подъёма','Wake-up time')}</div><p class="habit-note" id="habitSleepPreview"></p><p class="habit-note">${habitLabel('Длительность не меняется по времени автоматически. Пустая длительность сохраняет прежнее значение; пустое время удаляет только это время.','Times do not change duration automatically. Empty duration keeps the existing value; empty time clears only that time.')}</p>`;
  }else if(mode==='outdoors'){
    content+=`<p class="habit-note">${habitLabel('Дневной итог включает прогулки: приложение не складывает его с ними повторно. Время прогулки необязательно.','The daily total includes walks: the app does not add them again. Walk time is optional.')}</p><div id="habitActivityList"></div><div class="habit-two-fields">${habitField('habitActivityTime','Начало прогулки','Walk start')}${habitField('habitActivityMinutes','Минуты прогулки','Walk minutes','number','min="1" max="1440" inputmode="decimal" step="0.1"')}</div><div class="field"><label for="habitActivityKind">${habitLabel('Назначение','Purpose')}</label><select id="habitActivityKind"><option value="walk">${habitLabel('Обычная прогулка','Regular walk')}</option><option value="break">${habitLabel('Перерыв от работы','Break from work')}</option></select></div><button type="button" class="secondary" onclick="addHabitActivity()">${habitLabel('Добавить прогулку','Add walk')}</button><button type="button" class="secondary" onclick="useHabitWalkTotal()">${habitLabel('Подставить сумму прогулок в дневной итог','Use walk minutes as the daily total')}</button><p id="habitWalkSum" class="habit-note"></p><p class="habit-note">${habitLabel('Подстановка заменяет только поле выше; проверь его перед сохранением. Прогулка-перерыв учитывается в отдыхе автоматически. Пустой итог оставляет прежнее значение.','The button replaces only the field above; check it before saving. A break walk counts as a break automatically. An empty total keeps the existing value.')}</p>`;
  }else{
    content+=`<p class="habit-note">${habitLabel('Запиши минуты рабочего блока без отвлечений или отдыха. Это твоя запись, а не измерение качества концентрации.','Log minutes of distraction-free work or a break. This is your record, not a measurement of focus quality.')}</p><div id="habitActivityList"></div><div class="field"><label for="habitActivityKind">${habitLabel('Тип записи','Entry type')}</label><select id="habitActivityKind"><option value="focus">${habitLabel('Рабочий блок','Work block')}</option><option value="break">${habitLabel('Короткий отдых','Short break')}</option></select></div><div class="habit-two-fields">${habitField('habitActivityTime','Начало — необязательно','Start — optional')}${habitField('habitActivityMinutes','Длительность, мин','Duration, min','number','min="1" max="1440" inputmode="decimal" step="0.1"')}</div><button type="button" class="secondary" onclick="addHabitActivity()">${habitLabel('Добавить запись','Add entry')}</button><p class="habit-note">${habitLabel('Прогулку-перерыв записывай в «Улица»: повторно добавлять её здесь не нужно.','Log a break walk under Outdoors; do not add it here again.')}</p>`;
  }
  content+=`<p class="habit-note">${habitLabel('Изменения сохраняются кнопкой внизу.','Changes are saved with the button below.')}</p>`;
  document.getElementById('habitContent').innerHTML=content;
  if(mode!=='blocks')document.getElementById('habitDuration').value=data.logs?.[date]?.[mode]??'';
  if(mode==='sleep'){
    document.getElementById('habitAsleep').value=draft.sleepTiming?.asleep||'';
    document.getElementById('habitWake').value=draft.sleepTiming?.wake||'';
    document.getElementById('habitAsleep').oninput=previewHabitSleep;
    document.getElementById('habitWake').oninput=previewHabitSleep;
    previewHabitSleep();
  }else renderHabitActivities();
}
function previewHabitSleep(){
  const a=document.getElementById('habitAsleep').value,b=document.getElementById('habitWake').value;
  const span=habitSleepSpan(a,b);
  document.getElementById('habitSleepPreview').textContent=span===null
    ?trText('Для разницы нужны два разных времени.','Two different times are needed to show the difference.')
    :trText(`Между указанными часами: ${todayNumber(span/60)} ч. Это разница местного времени, без поправки на перевод часов.`,`Between these clock times: ${todayNumber(span/60)} h. This is local clock time, without clock-change adjustments.`);
}
function renderHabitActivities(){
  if(!habitEditor)return;
  const key=habitEditor.mode==='outdoors'?'walks':'blocks',list=habitEditor.draft[key];
  document.getElementById('habitActivityList').innerHTML=list.length?list.map((item,index)=>{
    const kind=key==='walks'?(item.purpose==='break'?trText('Прогулка-перерыв','Break walk'):trText('Прогулка','Walk')):(item.kind==='focus'?trText('Рабочий блок','Work block'):trText('Отдых','Break'));
    const time=habitClock(item.start)===null?trText('время неизвестно','time unknown'):item.start;
    return `<div class="habit-activity"><span>${escapeHTML(kind)} · ${escapeHTML(time)} · ${escapeHTML(todayNumber(item.minutes))} ${habitLabel('мин','min')}</span><button type="button" class="secondary" onclick="editHabitActivity(${index})">${habitLabel('Изменить','Edit')}</button><button type="button" class="secondary" onclick="removeHabitActivity(${index})">${habitLabel('Удалить','Remove')}</button></div>`;
  }).join(''):`<p class="habit-note">${habitLabel('Записей пока нет.','No entries yet.')}</p>`;
  if(key==='walks'){
    const total=list.reduce((s,x)=>s+(habitMinutes(x.minutes)||0),0);
    document.getElementById('habitWalkSum').textContent=trText(`Сумма записанных прогулок: ${todayNumber(total)} мин.`,`Recorded walks: ${todayNumber(total)} min.`);
  }
}
function editHabitActivity(index){
  const key=habitEditor.mode==='outdoors'?'walks':'blocks',item=habitEditor.draft[key][index];
  if(!item)return;
  habitEditor.editIndex=index;
  document.getElementById('habitActivityTime').value=item.start||'';
  document.getElementById('habitActivityMinutes').value=item.minutes;
  document.getElementById('habitActivityKind').value=key==='walks'?(item.purpose||'walk'):item.kind;
  document.getElementById('habitActivityMinutes').focus();
}
function addHabitActivity(){
  if(!habitEditor)return false;
  const minutes=habitMinutes(document.getElementById('habitActivityMinutes').value);
  const start=document.getElementById('habitActivityTime').value;
  if(minutes===null||(start&&habitClock(start)===null)){alert(trText('Укажи длительность от 0 до 1440 минут, больше нуля, и корректное время или оставь время пустым.','Enter a duration greater than zero and up to 1440 minutes, with a valid or empty start time.'));return false}
  const key=habitEditor.mode==='outdoors'?'walks':'blocks',kind=document.getElementById('habitActivityKind').value;
  const list=habitEditor.draft[key],index=habitEditor.editIndex;
  const previous=Number.isInteger(index)?list[index]:null;
  const item={...(previous||{}),id:previous?.id||`activity_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,minutes};
  if(start)item.start=start;else delete item.start;
  if(key==='walks')item.purpose=kind==='break'?'break':'walk';else item.kind=kind==='break'?'break':'focus';
  if(previous)list[index]=item;else list.push(item);
  delete habitEditor.editIndex;
  document.getElementById('habitActivityTime').value='';document.getElementById('habitActivityMinutes').value='';
  renderHabitActivities();return true;
}
function removeHabitActivity(index){
  const key=habitEditor.mode==='outdoors'?'walks':'blocks';
  habitEditor.draft[key].splice(index,1);delete habitEditor.editIndex;
  document.getElementById('habitActivityTime').value='';document.getElementById('habitActivityMinutes').value='';
  renderHabitActivities();
}
function useHabitWalkTotal(){
  const total=habitEditor.draft.walks.reduce((s,x)=>s+(habitMinutes(x.minutes)||0),0);
  document.getElementById('habitDuration').value=total;
}
function saveHabitEditor(){
  if(!habitEditor)return false;
  const {mode,date,draft,initial,initialValue}=habitEditor;
  if(JSON.stringify(habitDetails(date))!==initial||(mode!=='blocks'&&data.logs?.[date]?.[mode]!==initialValue)){
    alert(trText('Запись изменилась, пока форма была открыта. Закрой и открой её снова, чтобы не перезаписать новые данные.','This entry changed while the form was open. Close and reopen it to avoid overwriting newer data.'));return false;
  }
  if(mode!=='sleep'){
    const pending=document.getElementById('habitActivityMinutes').value.trim()!==''||document.getElementById('habitActivityTime').value.trim()!==''||Number.isInteger(habitEditor.editIndex);
    if(pending&&!addHabitActivity())return false;
  }
  let value=null;
  if(mode!=='blocks'){
    const raw=document.getElementById('habitDuration').value.trim();
    if(raw!==''){
      value=Number(raw);
      if(!Number.isFinite(value)||value<0||value>(mode==='sleep'?24:1440)){
        alert(trText('Проверь длительность: сон — от 0 до 24 ч, улица — от 0 до 1440 мин.','Check duration: sleep 0–24 h, outdoors 0–1440 min.'));return false;
      }
    }
  }
  const next={...habitDetails(date)};
  if(mode==='sleep'){
    const asleep=document.getElementById('habitAsleep').value,wake=document.getElementById('habitWake').value;
    if((asleep&&habitClock(asleep)===null)||(wake&&habitClock(wake)===null)){alert(trText('Проверь время.','Check the times.'));return false}
    const timing={...(next.sleepTiming||{})};
    if(asleep)timing.asleep=asleep;else delete timing.asleep;
    if(wake)timing.wake=wake;else delete timing.wake;
    if(Object.keys(timing).length)next.sleepTiming=timing;else delete next.sleepTiming;
  }else{
    const key=mode==='outdoors'?'walks':'blocks';
    if(draft[key].length)next[key]=draft[key];else delete next[key];
  }
  const row=ensureDay(date);
  if(value!==null)row[mode]=value;
  if(Object.keys(next).length)row.habitDetails=next;else delete row.habitDetails;
  if(!Object.keys(row).length)delete data.logs[date];
  closeHabitEditor();save();return true;
}
function habitWeekData(keys){
  const durations=[],wakes=[],steps=[];let workoutDays=0,workoutLogged=0;
  const walks=[],focus=[],breaks=[],outdoorTotals=[];
  let focusDays=0,breakDays=0;
  for(const date of keys){
    const row=data.logs?.[date]||{};
    const read=id=>row[id]!==undefined&&row[id]!==null&&row[id]!==''&&typeof row[id]!=='boolean'&&Number.isFinite(Number(row[id]))&&Number(row[id])>=0?Number(row[id]):null;
    if(read('sleep')!==null)durations.push(read('sleep'));
    if(read('steps')!==null)steps.push(read('steps'));
    if(read('outdoors')!==null)outdoorTotals.push(read('outdoors'));
    if(typeof row.gym==='boolean'){workoutLogged++;if(row.gym)workoutDays++}
    const wake=habitDetails(date).sleepTiming?.wake;if(habitClock(wake)!==null)wakes.push(wake);
    const w=habitActivities(date,'walks');walks.push(...w);
    const blocks=habitActivities(date,'blocks');
    const f=blocks.filter(x=>x.kind==='focus'),b=blocks.filter(x=>x.kind==='break');
    const walkingBreaks=w.filter(x=>x.purpose==='break');
    focus.push(...f);breaks.push(...b,...walkingBreaks);
    if(f.length)focusDays++;if(b.length||walkingBreaks.length)breakDays++;
  }
  const sum=xs=>xs.reduce((s,x)=>s+x,0);
  return {days:keys.length,durations,wakes,wakeSpread:habitWakeSpread(wakes),steps,workoutDays,workoutLogged,outdoorTotals,
    outdoorsTotal:outdoorTotals.length?sum(outdoorTotals):null,walkCount:walks.length,
    earlyWalks:walks.filter(x=>habitClock(x.start)!==null&&habitClock(x.start)<720).length,
    unknownWalks:walks.filter(x=>habitClock(x.start)===null).length,
    focusCount:focus.length,focusMinutes:focus.length?sum(focus.map(x=>Number(x.minutes))):null,focusDays,
    breakCount:breaks.length,breakMinutes:breaks.length?sum(breaks.map(x=>Number(x.minutes))):null,breakDays};
}
function renderHabitWeek(){
  const host=document.getElementById('habitWeekly');if(!host)return;
  const s=habitWeekData(weeklyWindow().currentKeys),n=todayNumber;
  const coverage=count=>trText(`${count}/${s.days} дней с записями`,`${count}/${s.days} days with records`);
  const rows=[];
  rows.push([trText('Сон','Sleep'),s.durations.length?trText(`Средняя записанная длительность: ${n(s.durations.reduce((a,b)=>a+b,0)/s.durations.length)} ч; ${coverage(s.durations.length)}.`,`Average logged duration: ${n(s.durations.reduce((a,b)=>a+b,0)/s.durations.length)} h; ${coverage(s.durations.length)}.`):trText('Нет записей длительности за эту неделю.','No sleep durations logged this week.')]);
  rows.push([trText('Время подъёма','Wake-up time'),s.wakeSpread===null?trText(`Недостаточно данных: ${s.wakes.length}/4 необходимых записей.`,`Not enough data: ${s.wakes.length}/4 required entries.`):trText(`Разброс по часам: ${n(s.wakeSpread)} мин; ${coverage(s.wakes.length)}. Это описание времени, не качества сна.`,`Clock-time spread: ${n(s.wakeSpread)} min; ${coverage(s.wakes.length)}. This describes timing, not sleep quality.`)]);
  rows.push([trText('Движение','Movement'),(s.steps.length?trText(`Шаги: в среднем ${n(s.steps.reduce((a,b)=>a+b,0)/s.steps.length)}; ${coverage(s.steps.length)}. `,`Steps: average ${n(s.steps.reduce((a,b)=>a+b,0)/s.steps.length)}; ${coverage(s.steps.length)}. `):trText('Шаги не записаны. ','No steps logged. '))+(s.workoutLogged?trText(`Тренировок: ${s.workoutDays}; ${coverage(s.workoutLogged)}.`,`Workouts: ${s.workoutDays}; ${coverage(s.workoutLogged)}.`):trText('Тренировки не записаны; это не означает отсутствие движения.','No workouts logged; this does not mean no movement.'))]);
  rows.push([trText('Улица и прогулки','Outdoors & walks'),(s.outdoorsTotal===null?trText('Дневные итоги не записаны. ','No daily totals logged. '):trText(`По дневным итогам: ${n(s.outdoorsTotal)} мин; ${coverage(s.outdoorTotals.length)}. `,`Daily totals: ${n(s.outdoorsTotal)} min; ${coverage(s.outdoorTotals.length)}. `))+(s.walkCount?trText(`Прогулок: ${s.walkCount}; до 12:00 — ${s.earlyWalks}, время неизвестно — ${s.unknownWalks}. Освещённость не измеряется.`,`Walks: ${s.walkCount}; before noon: ${s.earlyWalks}, time unknown: ${s.unknownWalks}. Light exposure is not measured.`):trText('Время прогулок неизвестно.','Walk timing is unknown.'))]);
  rows.push([trText('Рабочие блоки','Work blocks'),s.focusCount?trText(`Записано ${s.focusCount} блоков, ${n(s.focusMinutes)} мин; ${coverage(s.focusDays)}. Качество концентрации не измеряется.`,`${s.focusCount} blocks logged, ${n(s.focusMinutes)} min; ${coverage(s.focusDays)}. Focus quality is not measured.`):trText('Нет записей рабочих блоков.','No work blocks logged.')]);
  rows.push([trText('Отдых','Breaks'),s.breakCount?trText(`Записано ${s.breakCount} перерывов, ${n(s.breakMinutes)} мин; ${coverage(s.breakDays)}. Прогулки-перерывы включены один раз.`,`${s.breakCount} breaks logged, ${n(s.breakMinutes)} min; ${coverage(s.breakDays)}. Break walks are included once.`):trText('Перерывы не записаны; это не означает, что отдыха не было.','No breaks logged; this does not mean there was no rest.')]);
  host.innerHTML=`<summary>${habitLabel('По записям привычек за неделю','This week’s habit records')}</summary><div class="habit-week-rows">${rows.map(([title,text])=>`<div><strong>${escapeHTML(title)}</strong><p>${escapeHTML(text)}</p></div>`).join('')}</div>`;
}
function renderHabitToday(){
  const date=todayDateKey(),details=habitDetails(date),s=habitWeekData([date]);
  const button=document.getElementById('habitTodayButton');if(!button)return;
  button.textContent=trText('Работа и отдых','Work & breaks')+(s.focusCount||s.breakCount?' · '+trText(`записей: ${s.focusCount+s.breakCount}`,`entries: ${s.focusCount+s.breakCount}`):'');
  button.setAttribute('aria-label',trText(`Работа и отдых за ${date}. Рабочих блоков: ${s.focusCount}, перерывов: ${s.breakCount}.`,`Work and breaks for ${date}. Work blocks: ${s.focusCount}, breaks: ${s.breakCount}.`));
  const sleep=document.querySelector('#todayGrid [data-metric="sleep"] .today-metric-status');
  const timing=details.sleepTiming||{};
  if(sleep&&(habitClock(timing.asleep)!==null||habitClock(timing.wake)!==null))sleep.textContent+=' · '+trText('Сон/подъём: ','Sleep/wake: ')+(habitClock(timing.asleep)!==null?timing.asleep:'—')+' / '+(habitClock(timing.wake)!==null?timing.wake:'—');
  const outdoors=document.querySelector('#todayGrid [data-metric="outdoors"] .today-metric-status');
  if(outdoors&&s.walkCount)outdoors.textContent+=' · '+trText(`Прогулок: ${s.walkCount}`,`Walks: ${s.walkCount}`);
}
