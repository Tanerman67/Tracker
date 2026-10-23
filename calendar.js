// One calendar surface for date fields and recorded-day histories. View state is never persisted.
const CALENDAR_MONTHS={ru:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],en:['January','February','March','April','May','June','July','August','September','October','November','December']};
let datePickerState=null;
function calendarLanguage(){return typeof data!=='undefined'&&data.language==='en'?'en':'ru'}
function calendarText(ru,en){return calendarLanguage()==='en'?en:ru}
function calendarDateParts(year,month,day=1){const d=new Date(2000,0,1,12);d.setFullYear(year,month,day);return d}
function calendarKey(d){return String(d.getFullYear()).padStart(4,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function calendarMonthInfo(year,month){return {offset:(calendarDateParts(year,month).getDay()+6)%7,days:calendarDateParts(year,month+1,0).getDate()}}
function calendarMonthHTML(year,month,options={}){
 const lang=calendarLanguage(),months=CALENDAR_MONTHS[lang],week=lang==='en'?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
 const {offset,days}=calendarMonthInfo(year,month),today=localDate(),max=options.max||today;
 const preferred=options.focus||options.selected||today;let tabAssigned=false;
 let body=week.map(d=>`<span class="shared-dow" role="columnheader">${d}</span>`).join('')+'<span class="shared-empty" aria-hidden="true"></span>'.repeat(offset);
 for(let day=1;day<=days;day++){
  const key=calendarKey(calendarDateParts(year,month,day)),mark=options.marker?.(key)||{},disabled=key>max||options.min&&key<options.min||mark.disabled;
  const selected=key===options.selected,focus=key===preferred,cls=[mark.className||'',key===today?'today':'',selected?'selected':'',disabled?'unavailable':''].join(' ');
  const description=`${day} ${months[month]} ${year}${mark.label?'. '+mark.label:''}${key===today?'. '+calendarText('Сегодня','Today'):''}`;
  const tabStop=!disabled&&(focus||!tabAssigned&&preferred.slice(0,7)!==key.slice(0,7));if(tabStop)tabAssigned=true;
  body+=`<button type="button" class="shared-day ${cls}" data-day="${key}" aria-label="${escapeHTML(description)}" aria-pressed="${selected}" ${disabled?'disabled':''} tabindex="${tabStop?'0':'-1'}" onclick="${options.onDay||'calendarPickDay'}('${key}')">${day}${mark.dot?'<span class="shared-dot"></span>':''}</button>`;
 }
 return `<div class="shared-calendar" data-year="${year}" data-month="${month}" data-context="${options.context||''}" role="group" aria-label="${months[month]} ${year}"><div class="shared-calendar-grid">${body}</div></div>`;
}
function calendarControls(kind,year,month){
 const months=CALENDAR_MONTHS[calendarLanguage()];
 return `<div class="shared-calendar-controls"><button class="secondary" type="button" aria-label="${calendarText('Предыдущий месяц','Previous month')}" onclick="calendarControlChange('${kind}',this,-1)">‹</button><select aria-label="${calendarText('Месяц','Month')}" onchange="calendarControlChange('${kind}',this)">${months.map((m,i)=>`<option value="${i}" ${i===month?'selected':''}>${m}</option>`).join('')}</select><input type="number" inputmode="numeric" min="1" max="9999" value="${year}" aria-label="${calendarText('Год','Year')}" onchange="calendarControlChange('${kind}',this)"><button class="secondary" type="button" aria-label="${calendarText('Следующий месяц','Next month')}" onclick="calendarControlChange('${kind}',this,1)">›</button></div>`;
}
function calendarControlChange(kind,control,delta=0){
 const host=control.closest('.shared-calendar-controls');calendarNavigate(kind,Number(host.querySelector('input').value),Number(host.querySelector('select').value)+delta);
}
function calendarNavigate(kind,year,month){
 if(!Number.isInteger(year)||year<1||year>9999||!Number.isInteger(month))return;
 const d=calendarDateParts(year,month);if(d.getFullYear()<1||d.getFullYear()>9999)return;
 if(kind==='picker'&&datePickerState){datePickerState.year=d.getFullYear();datePickerState.month=d.getMonth();calendarRenderPicker()}
 if(kind==='progress'){calendarDate=d;renderCalendar()}
 if(kind==='cycle'){cycleMonth=calendarKey(d);renderCycle()}
 if(kind==='alcohol'){alcoholViewYear=d.getFullYear();alcoholViewMonth=d.getMonth();renderAlcoholCalendar()}
}
function enhanceDateInputs(root=document){
 root.querySelectorAll('input[type="date"]').forEach(input=>{
  if(input.type!=='date'||!input.parentNode)return;
  if(!input.max)input.max=localDate();
  if(input.dataset.sharedDate)return;
  input.dataset.sharedDate='true';
  const wrap=document.createElement('div');wrap.className='shared-date-field';input.parentNode.insertBefore(wrap,input);wrap.append(input);
  const button=document.createElement('button');button.type='button';button.className='secondary shared-date-trigger';button.textContent='▦';button.dataset.dateFor=input.id;
  button.onclick=()=>calendarOpenPicker(input,button);wrap.append(button);
 });
 document.querySelectorAll('.shared-date-trigger').forEach(button=>button.setAttribute('aria-label',calendarText('Открыть календарь','Open calendar')));
}
function calendarOpenPicker(input,trigger){
 if(input.disabled)return;
 if(datePickerState)calendarClosePicker();
 if(input.id==='cycleEnd')input.min=document.getElementById('cycleStart')?.value||'';
 const value=validDay(input.value)?input.value:localDate(),d=new Date(value+'T12:00:00');
 datePickerState={input,trigger,year:d.getFullYear(),month:d.getMonth(),focus:value,overflow:document.body.style.overflow};
 let host=document.getElementById('sharedDatePicker');if(!host){host=document.createElement('div');host.id='sharedDatePicker';host.className='shared-picker';host.dataset.localized='';host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','sharedPickerTitle');document.body.append(host)}
 host.innerHTML='';host.hidden=false;document.body.style.overflow='hidden';calendarRenderPicker();
 const selected=host.querySelector('.shared-day[tabindex="0"]:not(:disabled)')||host.querySelector('.shared-day:not(:disabled)')||host.querySelector('button');selected?.focus();
}
function calendarRenderPicker(){
 if(!datePickerState)return;const s=datePickerState,host=document.getElementById('sharedDatePicker');
 const monthHTML=calendarMonthHTML(s.year,s.month,{selected:s.input.value,focus:s.focus,min:s.input.min,max:s.input.max});
 // Keep focused month/year controls mounted while navigating the picker.
 if(host.querySelector('.shared-picker-sheet')){host.querySelector('.shared-calendar').outerHTML=monthHTML;host.querySelector('.shared-calendar-controls select').value=String(s.month);host.querySelector('.shared-calendar-controls input').value=String(s.year);return}
 const title=s.input.labels?.[0]?.textContent||calendarText('Выбрать дату','Choose date');
 host.innerHTML=`<div class="shared-picker-sheet"><div class="shared-picker-head"><h2 id="sharedPickerTitle">${escapeHTML(title)}</h2><button class="secondary" onclick="calendarClosePicker()">${calendarText('Закрыть','Close')}</button></div>${calendarControls('picker',s.year,s.month)}${monthHTML}<div class="shared-picker-actions"><button class="secondary" ${localDate()>(s.input.max||localDate())||s.input.min&&localDate()<s.input.min?'disabled':''} onclick="calendarPickDay(localDate())">${calendarText('Сегодня','Today')}</button>${['smokeDate','alcoholDate','cycleEnd'].includes(s.input.id)?`<button class="ghost" onclick="calendarPickDay('')">${calendarText('Очистить','Clear')}</button>`:''}</div></div>`;
}
function calendarClosePicker(){
 if(!datePickerState)return;const state=datePickerState;datePickerState=null;document.getElementById('sharedDatePicker').hidden=true;document.body.style.overflow=state.overflow;state.trigger?.focus();
}
function calendarPickDay(key){
 if(!datePickerState)return;const input=datePickerState.input;
 if(key&&(!validDay(key)||key>(input.max||localDate())||input.min&&key<input.min))return;
 calendarClosePicker();input.value=key;
 input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
}
document.addEventListener('keydown',event=>{
 if(datePickerState&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();calendarClosePicker();return}
 if(datePickerState&&event.key==='Tab'){
  const host=document.getElementById('sharedDatePicker'),nodes=[...host.querySelectorAll('button:not(:disabled),select,input')].filter(n=>n.tabIndex>=0),first=nodes[0],last=nodes[nodes.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
 const button=event.target.closest?.('.shared-day');if(!button)return;
 const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key],d=new Date(button.dataset.day+'T12:00:00');
 if(delta)d.setDate(d.getDate()+delta);
 else if(event.key==='Home')d.setDate(d.getDate()-(d.getDay()+6)%7);
 else if(event.key==='End')d.setDate(d.getDate()+6-(d.getDay()+6)%7);
 else if(['PageUp','PageDown'].includes(event.key)){d.setDate(1);d.setMonth(d.getMonth()+(event.key==='PageUp'?-1:1)*(event.shiftKey?12:1))}
 else return;
 event.preventDefault();const key=calendarKey(d);
 if(datePickerState){const s=datePickerState;if(key>(s.input.max||localDate())||s.input.min&&key<s.input.min)return;s.focus=key;s.year=d.getFullYear();s.month=d.getMonth();calendarRenderPicker()}
 let grid=datePickerState?document.getElementById('sharedDatePicker'):button.closest('.shared-calendar');
 if(!datePickerState&&!grid.querySelector(`[data-day="${key}"]`)&&grid.dataset.context&&key<=localDate()){const kind=grid.dataset.context;calendarNavigate(kind,d.getFullYear(),d.getMonth());grid=document.querySelector(`.shared-calendar[data-context="${kind}"][data-year="${d.getFullYear()}"][data-month="${d.getMonth()}"]`)}
 const next=grid?.querySelector(`[data-day="${key}"]:not(:disabled)`);
 if(next){grid.querySelectorAll('.shared-day').forEach(n=>n.tabIndex=-1);next.tabIndex=0;next.focus()}
},true);
