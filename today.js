// View state only. All values come from data.logs[date]; no hint data is saved.
let todaySelectedDate=null;
function todayDateKey(){return todaySelectedDate||localDate()}
function setTodayDate(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>localDate())return;
  const parsed=new Date(date+'T12:00:00');
  if(!Number.isFinite(parsed.getTime())||localDate(parsed)!==date)return;
  todaySelectedDate=date===localDate()?null:date;
  renderToday();
}
function toggleTodayDate(){
  const controls=document.getElementById('todayDateControls');
  controls.hidden=!controls.hidden;
  document.getElementById('heroDate').setAttribute('aria-expanded',String(!controls.hidden));
}
function todayLatestWeight(date=todayDateKey()){
  const key=Object.keys(data.logs||{}).filter(k=>k<=date&&todayMetricState('weight',k).value>0).sort().pop();
  return key?{date:key,value:todayMetricState('weight',key).value}:null;
}
function shiftTodayDate(delta){setTodayDate(weeklyAddDays(todayDateKey(),delta))}
function todayNumber(n){return new Intl.NumberFormat(data.language==='en'?'en-NZ':'ru-RU',{maximumFractionDigits:2}).format(n)}
function todayAlcoholFreeDays(date=todayDateKey()){
  if(date<alcoholTrackingStart()||alcoholIsDrink(date))return 0;
  const lastDrink=alcoholLatestDrink(date);
  const start=lastDrink?weeklyAddDays(lastDrink,1):alcoholTrackingStart();
  if(!start||start>date)return 0;
  return Math.max(0,weeklyDiffDays(start,date));
}
function todayMetricState(id,date=todayDateKey()){
  const raw=data.logs?.[date]?.[id];
  const has=raw!==undefined&&raw!==null&&raw!==''&&typeof raw!=='boolean'&&Number.isFinite(Number(raw))&&Number(raw)>=0;
  const value=has?Number(raw):null;
  const target=Number(goalFor(id));
  const goal=Number.isFinite(target)&&target>0?target:null;
  return {value,goal,status:!has?'missing':goal===null?'logged':value>=goal?'met':'progress'};
}
function todayHint(date=todayDateKey()){
  // Stable priority. Prefer useful existing entries over reminders to enter data.
  for(const id of ['steps','outdoors','protein','sleep']){
    const s=todayMetricState(id,date);
    if(s.status!=='progress')continue;
    const unit=id==='steps'?trText('шагов','steps'):trUnit(tracker(id));
    const value=todayNumber(s.value),goal=todayNumber(s.goal);
    if(id==='steps'&&date===localDate())return {id,date,text:trText(`До твоей цели по шагам осталось ${todayNumber(s.goal-s.value)}.`,`You have ${todayNumber(s.goal-s.value)} steps left to reach your goal.`)};
    const label={steps:trText('Шаги','Steps'),outdoors:trText('Улица','Outdoors'),protein:trText('Белок','Protein'),sleep:trText('Сон','Sleep')}[id];
    return {id,date,text:trText(`${label}: записано ${value} ${unit}. Твоя цель — ${goal} ${unit}.`,`${label}: ${value} ${unit} logged. Your goal is ${goal} ${unit}.`)};
  }
  return null;
}
function openTodayMetric(id,date=todayDateKey()){
  if(id==='sleep'||id==='outdoors'){openHabitEditor(id,date);return}
  if(id==='weight'){openBody();openBodyCheckin(date);return}
  if(id==='alcohol'){
    openAlcohol();
    const d=new Date(date+'T12:00:00');
    alcoholViewYear=d.getFullYear();alcoholViewMonth=d.getMonth();alcoholViewMode='month';
    renderAlcoholCalendar();return;
  }
  if(id==='gym'){ensureDay(date).gym=data.logs?.[date]?.gym!==true;save();return}
  openEntry(id,date);
}
function openTodayHero(){
  const hint=todayHint();
  if(hint)openTodayMetric(hint.id,hint.date);else openMotivationDetail();
}
function renderTodayHero(date){
  // Keep the original module and acknowledgement history intact.
  renderMotivationCard();
  const hint=todayHint(date);
  const card=document.getElementById('motivationCard');
  const text=document.getElementById('motivationText');
  const sub=document.getElementById('motivationSub');
  const kicker=document.getElementById('motivationKicker');
  const button=document.getElementById('todayHeroAction');
  document.getElementById('todayMotivationLink').hidden=!hint;
  if(hint){
    card.classList.remove('milestone','medical','personal','generic');
    text.textContent=hint.text;
    kicker.textContent=trText('По записям за выбранный день','From the selected day’s records');
    sub.textContent=trText('Нажми, чтобы открыть запись','Tap to open the entry');
    document.getElementById('motivationIcon').textContent='↗';
  }else if(date!==localDate()){
    // Historical screens must not present today's personal observations.
    const g=MOTIVATION_GENERIC[motivationHash(date)%MOTIVATION_GENERIC.length];
    currentMotivation={kind:'generic',icon:'🌱',ru:g.ru,en:g.en,detailRu:g.ru,detailEn:g.en};
    card.classList.remove('milestone','medical','personal');card.classList.add('generic');
    text.textContent=motivationTitle(currentMotivation);kicker.textContent='';sub.textContent='My Rhythm';
    document.getElementById('motivationIcon').textContent='🌱';
  }
  button.setAttribute('aria-label',hint?hint.text:trText('Открыть мотивацию','Open motivation'));
  const link=document.getElementById('todayMotivationLink');
  link.textContent=trText('Мотивация','Motivation');
}
function renderTodayPage(){
  const date=todayDateKey(),locale=data.language==='en'?'en-NZ':'ru-RU';
  document.getElementById('heroDate').textContent=new Date(date+'T12:00:00').toLocaleDateString(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('todayHeading').textContent=date===localDate()?trText('Сегодня','Today'):trText('Записи за день','Daily records');
  const input=document.getElementById('todayDateInput');input.value=date;input.max=localDate();input.setAttribute('aria-label',trText('Дата записей','Entry date'));
  document.getElementById('todayPrev').setAttribute('aria-label',trText('Предыдущий день','Previous day'));
  document.getElementById('todayNext').setAttribute('aria-label',trText('Следующий день','Next day'));
  document.getElementById('todayNext').disabled=date>=localDate();
  document.getElementById('todayReturn').textContent=trText('Сегодня','Today');
  document.getElementById('todayReturn').hidden=date===localDate();
  const cards=[['smoke','🚭','Без сигарет','Smoke-free'],['alcohol','🍷','Без алкоголя','Alcohol-free'],['weight','⚖️','Вес','Weight'],['protein','🥩','Белок','Protein'],['outdoors','☀️','Улица','Outdoors'],['steps','🚶','Шаги','Steps'],['gym','🏋️','Тренировка','Workout'],['sleep','😴','Сон','Sleep']];
  const grid=document.getElementById('todayGrid');grid.innerHTML='';
  for(const [id,emoji,ru,en] of cards){
    const el=document.createElement(id==='smoke'?'div':'button');
    if(id!=='smoke'){el.type='button';el.onclick=()=>openTodayMetric(id,date)}
    el.className='metric-card today-metric';el.dataset.metric=id;
    let main='—',status='',progress=null,state='neutral';
    if(id==='smoke'){
      const start=data.smokeDate;
      if(start&&start<=date){main=todayNumber(weeklyDiffDays(start,date))+' '+trText('дней','days');status=trText('От даты отказа','Since quit date')}
      else status=trText('Дата отказа не задана для этого дня','No quit date for this day');
    }else if(id==='alcohol'){
      if(date<alcoholTrackingStart()){
        status=trText('До начала учёта','Before tracking began');
      }else if(alcoholIsDrink(date)){
        main=trText('Есть отметка','Logged');
        status=trText('Употребление алкоголя','Alcohol use');
      }else{
        const days=todayAlcoholFreeDays(date);
        main=todayNumber(days)+' '+trText('дней','days');
        status=trText('Без отмеченного алкоголя','No alcohol marked');
      }
    }else if(id==='gym'){
      const v=data.logs?.[date]?.gym;
      main=v===true?trText('Записана','Logged'):v===false?trText('Без тренировки','No workout'):'—';
      status=v===true?trText('Тренировка записана','Workout logged'):v===false?trText('День отдыха — это нормально','Rest days are okay'):trText('Нет записи','No entry');
    }else if(id==='weight'){
      const measurement=todayLatestWeight(date);
      main=measurement?todayNumber(measurement.value)+' '+trText('кг','kg'):'—';
      status=measurement?trText('Замер: ','Measured: ')+new Date(measurement.date+'T12:00:00').toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'}):trText('Нет замеров','No measurements');
    }else{
      const s=todayMetricState(id,date),unit=id==='steps'?trText('шагов','steps'):trUnit(tracker(id));
      state=s.status;
      main=(s.value===null?'—':todayNumber(s.value))+(s.goal!==null?' / '+todayNumber(s.goal):'')+' '+unit;
      status={missing:trText('Нет данных','No data'),logged:trText('Записано','Logged'),met:trText('Цель достигнута','Goal reached'),progress:date===localDate()?trText('Пока ниже цели','Below goal so far'):trText('Ниже цели','Below goal')}[state];
      if(s.goal!==null&&s.value!==null)progress=Math.max(0,Math.min(100,s.value/s.goal*100));
    }
    el.dataset.state=state;
    el.innerHTML=`<div class="today-metric-title"><span aria-hidden="true">${emoji}</span><span>${escapeHTML(trText(ru,en))}</span></div><div class="today-metric-value">${escapeHTML(main)}</div><div class="today-metric-status">${escapeHTML(status)}</div>${progress===null?'':`<div class="metric-bar" aria-hidden="true"><span style="width:${progress}%"></span></div>`}`;
    grid.appendChild(el);
  }
  renderTodayHero(date);
}
