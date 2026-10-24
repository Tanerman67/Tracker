// Smoke-free history uses the existing smokeDate setting, without inventing daily smoking logs.
let smokeViewYear=new Date().getFullYear(),smokeViewMonth=new Date().getMonth(),smokeViewMode='year';
function openSmoke(){
 smokeViewYear=new Date().getFullYear();
 smokeViewMonth=new Date().getMonth();
 smokeViewMode='year';
 document.getElementById('smokeModal')?.classList.add('show');
 document.body.style.overflow='hidden';
 renderSmokeCalendar();uiRememberForm('smokeModal');
}

function closeSmoke(){
 if(!uiConfirmDiscard('smokeModal'))return false;
 document.getElementById('smokeModal')?.classList.remove('show');
 document.body.style.overflow='';
}

function setSmokeMode(mode){
 smokeViewMode=mode==='month'?'month':'year';renderSmokeCalendar();
}

function changeSmokeYear(delta){
 smokeViewYear+=delta;renderSmokeCalendar();
}

function changeSmokeMonth(delta){
 const date=new Date(smokeViewYear,smokeViewMonth+delta,1,12);
 smokeViewYear=date.getFullYear();smokeViewMonth=date.getMonth();renderSmokeCalendar();
}

function selectSmokeDate(dateKey){
 if(!validDay(dateKey)||dateKey>localDate())return;
 const field=document.getElementById('smokeQuitDate');
 if(field){field.value=dateKey;field.focus()}
}

async function saveSmokeDate(){
 const field=document.getElementById('smokeQuitDate'),status=document.getElementById('smokeSaveStatus');
 if(!field)return;
 const next=field.value,previous=data.smokeDate;
 if(next&&(!validDay(next)||next>localDate())){
  status.textContent=trText('Проверь дату отказа.','Check the quit date.');return;
 }
 if(next===previous){status.textContent=trText('Дата уже сохранена.','Date already saved.');return}
 data.smokeDate=next;
 try{
  const ok=await persistData({renderAfter:true,makeSnapshot:true});
  if(ok===false){status.textContent=trText('Не удалось сохранить дату.','Could not save the date.');return}
  renderSmokeCalendar();uiRememberForm('smokeModal');
  document.getElementById('smokeSaveStatus').textContent=trText('Дата сохранена.','Date saved.');
 }catch(e){
  status.textContent=trText('Не удалось сохранить дату.','Could not save the date.');
 }
}

function smokeMonthHTML(year,month){
 const quit=validDay(data.smokeDate)?data.smokeDate:'';
 const calendar=calendarMonthHTML(year,month,{
  context:'smoke',onDay:'selectSmokeDate',selected:quit,
  marker:key=>{
   const future=key>localDate(),inStreak=!!quit&&key>=quit&&!future;
   return {className:inStreak?'sober':'untracked',disabled:future,
    label:inStreak?trText('После даты отказа','After quit date'):trText('Не учитывается','Not tracked')};
  }
 });
 return `<div class="alcohol-month-card"><div class="alcohol-month-title">${CALENDAR_MONTHS[calendarLanguage()][month]}</div>${calendar}</div>`;
}

function renderSmokeCalendar(){
 const modal=document.getElementById('smokeModal');if(!modal)return;
 const draft=uiFormDirty('smokeModal')?document.getElementById('smokeQuitDate').value:null;
 const date=validDay(data.smokeDate)&&data.smokeDate<=localDate()?data.smokeDate:'';
 const days=date?Math.max(0,weeklyDiffDays(date,localDate())):null;
 const locale=data.language==='en'?'en-NZ':'ru-RU';
 const formatted=date?new Date(date+'T12:00:00').toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'}):'—';
 const label=(id,ru,en)=>{const el=document.getElementById(id);if(el)el.textContent=trText(ru,en)};
 label('smokeTitle','Без сигарет','Smoke-free');
 label('smokeSubtitle','Серия по дате отказа','Streak based on quit date');
 label('smokeCurrentLabel','Дней после отказа','Days since quitting');
 label('smokeStartLabel','Дата отказа','Quit date');
 label('smokeQuitFieldLabel','Дата отказа','Quit date');
 label('smokeSaveButton','Сохранить дату','Save date');
 label('smokeLegendStart','После даты отказа','After quit date');
 label('smokeLegendBefore','До начала отсчёта','Before the start');
 label('smokeLegendFuture','Будущий день','Future day');
 label('smokeHelpTitle','Как это работает','How it works');
 label('smokeHelpText',
  'Календарь показывает дни после выбранной даты отказа. Это расчёт, а не история ежедневных подтверждений. Чтобы начать новую серию, измени дату отказа. Старые замеры и другие записи не меняются.',
  'The calendar shows days since your chosen quit date. It is a calculation, not a daily confirmed smoking history. Change the quit date to start a new streak. Other records are unchanged.');
 label('smokeMonthModeBtn','Месяц','Month');label('smokeYearModeBtn','Год','Year');
 document.getElementById('smokeHeaderStreak').textContent=days??'—';
 document.getElementById('smokeCurrentStreak').textContent=days??'—';
 document.getElementById('smokeQuitDisplay').textContent=formatted;
 document.getElementById('smokeYearLabel').textContent=smokeViewYear;
 const input=document.getElementById('smokeQuitDate');input.value=draft??date;input.max=localDate();
 document.getElementById('smokeSaveStatus').textContent='';
 document.getElementById('smokeMonthModeBtn').classList.toggle('active',smokeViewMode==='month');
 document.getElementById('smokeYearModeBtn').classList.toggle('active',smokeViewMode==='year');
 const host=document.getElementById('smokeCalendarHost');
 if(smokeViewMode==='year'){
  host.innerHTML=`<div class="alcohol-year-grid">${Array.from({length:12},(_,m)=>smokeMonthHTML(smokeViewYear,m)).join('')}</div>`;
 }else{
  const month=CALENDAR_MONTHS[calendarLanguage()][smokeViewMonth];
  host.innerHTML=`<div class="alcohol-month-view"><div class="alcohol-month-switch"><button type="button" class="secondary" aria-label="${trText('Предыдущий месяц','Previous month')}" onclick="changeSmokeMonth(-1)">‹</button><strong>${month} ${smokeViewYear}</strong><button type="button" class="secondary" aria-label="${trText('Следующий месяц','Next month')}" onclick="changeSmokeMonth(1)">›</button></div>${smokeMonthHTML(smokeViewYear,smokeViewMonth)}</div>`;
 }
}
