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
  if(!alcoholTrackingStart()||date<alcoholTrackingStart()||alcoholIsDrink(date))return 0;
  const lastDrink=alcoholLatestDrink(date);
  const start=lastDrink?weeklyAddDays(lastDrink,1):alcoholTrackingStart();
  if(!start||start>date)return 0;
  return Math.max(0,weeklyDiffDays(start,date));
}
function todayMetricState(id,date=todayDateKey()){
  const raw=nutritionMetricValue(id,date);
  const has=raw!==undefined&&raw!==null&&raw!==''&&typeof raw!=='boolean'&&Number.isFinite(Number(raw))&&Number(raw)>=0;
  const value=has?Number(raw):null;
  const target=Number(goalFor(id));
  const goal=Number.isFinite(target)&&target>0?target:null;
  return {value,goal,status:!has?'missing':goal===null?'logged':value>=goal?'met':'progress'};
}
function openTodayMetric(id,date=todayDateKey()){
  if(id==='sleep'){openHabitEditor(id,date);return}
  if(id==='weight'){openBodyCheckin(date);return}
  if(id==='protein'){nutritionOpen(date);return}
  if(id==='alcohol'){
    openAlcohol();
    const d=new Date(date+'T12:00:00');
    alcoholViewYear=d.getFullYear();alcoholViewMonth=d.getMonth();alcoholViewMode='month';
    renderAlcoholCalendar();return;
  }
  if(id==='gym'){energyWorkoutOpen(date);return}
  openEntry(id,date);
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
  const grid=document.getElementById('todayGrid');grid.replaceChildren();
  for(const block of data.dashboard.blocks){
    const card=dashboardCard(block.id,date);if(!card)continue;
    card.classList.add(block.size==='expanded'?'block-expanded':'block-compact');grid.append(card);
  }
  document.getElementById('todayCustomize').textContent=trText('Настроить блоки','Customize blocks');
}
