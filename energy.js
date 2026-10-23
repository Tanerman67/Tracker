// UI adapter: existing logs + nutritionAggregate -> pure model -> optional UI.
let energyDate=null,energyTab='day',energyWorkoutId='',energyReturnFocus=null;
const ENERGY_ROUTINE_LABELS={seated:['Преимущественно сидя / дома за компьютером','Mostly seated / at home'],light:['Обычно немного двигаюсь','Usually move a little'],moving:['Подвижный обычный день','Usually on my feet']};
const ENERGY_WORKOUT_LABELS={walking:['Ходьба','Walking'],running:['Бег','Running'],cycling:['Велосипед','Cycling'],strength:['Силовая','Strength'],swimming:['Плавание','Swimming'],other:['Другое','Other']};
const ENERGY_ISSUES={
 missingProfile:['Заполни необходимые параметры профиля.','Complete the required profile settings.'],missingWalking:['Нет данных о дополнительных шагах или параметрах ходьбы.','Extra steps or walking parameters are missing.'],staleWeight:['Весу более 30 дней. Оценка менее надёжна.','Weight is over 30 days old. Confidence is lower.'],belowBaseline:['Шагов меньше обычной нормы. База не уменьшена; оценка менее уверенная.','Steps are below your usual allowance. Base energy is unchanged; confidence is lower.'],missingWorkout:['Gym отмечен, но энергия тренировки неизвестна. Добавь тренировку.','Gym is marked but its energy is unknown. Add a workout.'],unknownWorkout:['Энергия тренировки неизвестна и не прибавлена.','Unknown workout energy has not been added.'],totalNeedsDuration:['Для общих калорий тренировки нужна длительность.','Total workout calories need a duration.'],unknownOverlap:['Пересечение с шагами неизвестно. Дополнительная ходьба исключена; баланс не подтверждён.','Step overlap is unknown. Extra walking is excluded; balance cannot be confirmed.'],inconsistentSteps:['Шагов тренировок больше суточных. Проверь записи.','Workout steps exceed daily steps. Check the records.'],invalidWorkout:['Некорректная или повторная тренировка не учтена.','An invalid or duplicate workout has been excluded.'],missingFood:['Нет пригодных данных о калориях питания. Это не ноль.','No usable food calories. This does not mean zero.'],partialFood:['Калории известны только для части еды. Баланс недоступен.','Only part of the food has known calories. Balance is unavailable.'],foodUnconfirmed:['Полнота питания пока не подтверждена.','Food diary completeness is not confirmed.'],foodChanged:['Питание менялось после подтверждения. Подтверди заново.','Food changed after confirmation. Confirm again.'],activityUnconfirmed:['Подтверди, что шаги и все тренировки учтены.','Confirm steps and all workouts are accounted for.'],activityChanged:['Активность менялась после подтверждения. Подтверди заново.','Activity changed after confirmation. Confirm again.']
};
function energyStore(){if(!data.energyBalance)data.energyBalance={profile:{},workouts:[],days:{}};return data.energyBalance}
function energyKey(){return energyDate||todayDateKey()}
function energyDay(date=energyKey()){return MyRhythmEnergy.daily(data,date,nutritionAggregate(date).calories)}
function energyStatus(s){return ({confirmed:trText('Дневник подтверждён','Log confirmed'),provisional:trText('Предварительно','Provisional'),insufficient:trText('Недостаточно данных','Insufficient data')})[s]}
function energyKcal(v){return v===null?'—':nutritionFormat(Math.round(v/10)*10,0)+' kcal'}
function energyBalanceText(v){return v===null?'—':v>=0?trText('Расчётный дефицит: ','Estimated deficit: ')+energyKcal(v):trText('Расчётный профицит: ','Estimated surplus: ')+energyKcal(-v)}
function energyOpen(date=todayDateKey()){
 if(!validDay(date)||date>localDate())return;
 energyDate=date;energyTab='day';energyWorkoutId='';energyReturnFocus=document.activeElement;
 openModule('energy');
}
function energySetDate(date){if(!validDay(date)||date>localDate())return;energyDate=date;energyWorkoutId='';renderEnergy()}
function energySwitch(tab){energyTab=tab;energyWorkoutId='';renderEnergy()}
function energyClose(){energyReturnFocus?.focus?.({preventScroll:true})}
function energyRefresh(){if(moduleView==='energy'&&!document.activeElement?.closest('.energy-workout-form,.energy-form-grid'))renderEnergy()}
function energyRoute(target){const date=energyKey();closeModule();if(target==='food')nutritionOpen(date);else openTodayMetric(target==='body'?'weight':'steps',date)}
function energySelect(id,label,options,value,extra=''){
 return `<div class="field"><label for="${id}">${escapeHTML(label)}</label><select id="${id}" ${extra}>${options.map(([v,label])=>`<option value="${v}" ${value===v?'selected':''}>${escapeHTML(label)}</option>`).join('')}</select></div>`;
}
function energyRenderHeader(){
 const tabs=[['day',trText('День','Day')],['history',trText('История и вес','History & weight')],['profile',trText('Профиль','Profile')]];
 return `<nav class="energy-tabs" aria-label="${trText('Энергетический баланс','Energy Balance')}">${tabs.map(([tab,label])=>`<button class="${energyTab===tab?'':'secondary'}" aria-pressed="${energyTab===tab}" onclick="energySwitch('${tab}')">${label}</button>`).join('')}</nav>`;
}
function renderEnergy(){
 if(moduleView!=='energy')return;
 const body=energyTab==='profile'?energyProfileHTML():energyTab==='history'?energyHistoryHTML():energyDailyHTML();
 moduleShell(trText('Энергетический баланс','Energy Balance'),`<div class="energy-view">${energyRenderHeader()}${body}<p class="small">${trText('Расчётная модель, не измерение. Данные остаются на этом устройстве. Подтверждение дневника означает полноту записей, а не точность расхода.','A model estimate, not a measurement. Data stays on this device. Log confirmation means complete records, not an accurate energy measurement.')}</p><div id="moduleError" role="alert"></div></div>`);
 if(energyTab==='profile')energyProfileMode();
 if(energyTab==='day')energyWorkoutFields();
}
function energyDailyHTML(){
 const date=energyKey(),s=energyDay(date),d=data.energyBalance?.days?.[date]||{};
 const weight=s.resting.weight;
 const rows=[
  [trText('Энергия покоя (RMR)','Resting energy (RMR)'),energyKcal(s.resting.value),s.resting.source==='manual'?trText('Собственный RMR','User supplied RMR'):trText('Миффлин - Сан Жеор, оценка','Mifflin-St Jeor estimate')],
  [trText('Бытовая активность и пищеварение','Routine activity & digestion'),energyKcal(s.routineExtra),trText('Включает обычные шаги и TEF','Includes habitual steps and TEF')],
  [trText('Дополнительная ходьба, net','Extra walking, net'),s.walking.recorded===null&&!d.noExtraSteps?'—':energyKcal(s.walking.value),s.walking.suppressed?trText('Исключена из-за пересечения','Excluded because of overlap'):(s.walking.steps===null?'—':nutritionFormat(s.walking.steps,0)+' '+trText('доп. шагов','extra steps'))+(s.walking.excludedSteps?' · '+nutritionFormat(s.walking.excludedSteps,0)+' '+trText('шагов учтено часами','steps covered by watch'):'')],
  [trText('Тренировки, net','Workouts, net'),(s.incompleteEnergy?'≥ ':'')+energyKcal(s.exercise.value),trText('Только известная энергия без дублирования','Known non-overlapping energy only')],
  [trText('Общий расход за день','Total daily expenditure'),(s.incompleteEnergy?'≥ ':'')+energyKcal(s.tdee),trText('Оценка полного дня, не расход к этому часу','Full-day estimate, not energy spent so far')],
  [trText('Питание','Food intake'),nutritionDisplay(s.food),s.food.qualities?.join(', ')||trText('Нет источника','No source')]
 ];
 return `<div class="energy-date"><button class="secondary" aria-label="${trText('Предыдущий день','Previous day')}" onclick="energySetDate(MyRhythmEnergy.addDays(energyKey(),-1))">‹</button>${moduleInput('energyDate',trText('Дата','Date'),date,'date',`max="${localDate()}" onchange="energySetDate(this.value)"`)}<button class="secondary" ${date>=localDate()?'disabled':''} aria-label="${trText('Следующий день','Next day')}" onclick="energySetDate(MyRhythmEnergy.addDays(energyKey(),1))">›</button></div>
 <div class="energy-summary" data-status="${s.status}"><strong>${energyBalanceText(s.balance)}</strong><span>${energyStatus(s.status)}</span></div>
 <dl class="energy-components">${rows.map(([label,value,note])=>`<div><dt>${label}<small>${escapeHTML(note)}</small></dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>
 <p>${weight?trText('Вес из Body Check-in: ','Weight from Body Check-in: ')+nutritionFormat(weight.value)+' kg · '+weight.date+(weight.stale?' · '+trText('устарел','stale'):''):trText('Вес не найден. Добавь его в существующем Body Check-in.','No weight found. Add it in the existing Body Check-in.')}</p>
 ${s.sensitivity?`<details><summary>${trText('Допущения и чувствительность модели','Assumptions & model sensitivity')}</summary><p>${energyKcal(s.sensitivity[0])} - ${energyKcal(s.sensitivity[1])}. ${trText('Это сценарии обычной активности и длины/стоимости шага, не доверительный интервал. Ошибки RMR и часов сюда не входят. Скорость, наклон, походка и бег могут существенно изменить результат.','These are routine activity and step length/cost scenarios, not a confidence interval. RMR and watch errors are not included. Speed, slope, gait and running can change the result substantially.')}</p><p>RMR × ${s.base!==null?MyRhythmEnergy.ROUTINES[data.energyBalance.profile.routine].pal:'—'} + ${trText('доп. ходьба + net тренировки. TEF уже включён.','extra walking + net workouts. TEF is already included.')}</p></details>`:''}
 <div class="module-actions energy-links"><button class="secondary" onclick="energyRoute('body')">${trText('Вес: Body Check-in','Weight: Body Check-in')}</button><button class="secondary" onclick="energyRoute('food')">${trText('Записать питание','Log food')}</button><button class="secondary" onclick="energyRoute('steps')">${trText('Записать шаги','Log steps')}</button></div>
 <div class="energy-confirm"><label><input id="energyFoodComplete" type="checkbox" ${s.foodConfirmed?'checked':''} onchange="energyConfirmFood(energyKey(),this.checked)"> ${trText('Всё питание за этот день записано','All food for this day is logged')}</label>
 <label><input id="energyNoExtraSteps" type="checkbox" ${d.noExtraSteps?'checked':''} onchange="energySetNoExtra(this.checked)"> ${trText('Если шаги не записаны: ходьбы сверх обычной нормы не было','If steps are missing: no walking beyond my usual allowance')}</label>
 <label><input id="energyActivityComplete" type="checkbox" ${s.activityConfirmed?'checked':''} onchange="energyConfirmActivity(this.checked)"> ${trText('Шаги и все тренировки учтены, либо тренировок не было','Steps and all workouts are accounted for, or there were no workouts')}</label></div>
 ${s.issues.length?`<ul class="energy-issues">${s.issues.map(i=>`<li>${trText(...ENERGY_ISSUES[i])}</li>`).join('')}</ul>`:''}
 <details class="energy-workout-form" ${energyWorkoutId?'open':''}><summary>${energyWorkoutId?trText('Изменить тренировку','Edit workout'):trText('Добавить тренировку','Add workout')}</summary>${energyWorkoutHTML()}</details>
 <h3>${trText('Тренировки этого дня','Workouts for this day')}</h3>${(data.energyBalance?.workouts||[]).filter(w=>w.date===date).map(w=>`<button class="secondary module-history" onclick="energyEditWorkout(${inlineArgument(w.id)})">${trText(...ENERGY_WORKOUT_LABELS[w.type])} · ${w.kcal===null?trText('ккал неизвестны','kcal unknown'):nutritionFormat(w.kcal,0)+' kcal'} · ${w.counting==='steps'?trText('считать по шагам','count from steps'):w.energyType==='active'?trText('активные','active'):w.energyType==='total'?trText('общие','total'):trText('тип энергии неизвестен','energy type unknown')}</button>`).join('')||`<p>${trText('Нет записей. Отметка Gym сама по себе не содержит ккал.','No entries. The Gym checkmark alone does not contain calories.')}</p>`}`;
}
async function energyConfirmFood(date,checked){
 if(!validDay(date)||date>localDate())return;
 const st=energyStore();st.days[date]||={};st.days[date].foodSignature=checked?MyRhythmEnergy.foodSignature(data,date):null;
 await save();if(moduleView==='energy')renderEnergy();
}
async function energySetNoExtra(checked){const st=energyStore(),date=energyKey();st.days[date]||={};st.days[date].noExtraSteps=checked;await save();renderEnergy()}
async function energyConfirmActivity(checked){const st=energyStore(),date=energyKey();st.days[date]||={};st.days[date].activitySignature=checked?MyRhythmEnergy.activitySignature(data,date):null;await save();renderEnergy()}
function energyNutritionCompletion(date){
 const host=document.getElementById('nutritionEnergyComplete');if(!host)return;
 const enabled=!!data.energyBalance||data.dashboard.blocks.some(b=>b.id==='energy');host.hidden=!enabled;if(!enabled)return;
 const s=energyDay(date);host.innerHTML=`<label><input type="checkbox" ${s.foodConfirmed?'checked':''} onchange="energyConfirmFood('${date}',this.checked)"> ${trText('Всё питание за этот день записано','All food for this day is logged')}</label>${s.issues.includes('foodChanged')?`<p>${trText(...ENERGY_ISSUES.foodChanged)}</p>`:''}`;
}
function energyProfileHTML(){
 const p=data.energyBalance?.profile||{};
 return `<p>${trText('Настрой один раз. Вес берётся из Body Check-in на выбранную дату. Формула предназначена для взрослых.','Set this once. Weight comes from Body Check-in as of the selected date. The formula is intended for adults.')}</p><div class="energy-form-grid">
 ${energySelect('energyMode',trText('Источник RMR','RMR source'),[['mifflin',trText('Формула Миффлина - Сан Жеора','Mifflin-St Jeor equation')],['manual',trText('Собственный известный RMR','My known RMR')]],p.mode||'mifflin','onchange="energyProfileMode()"')}
 ${moduleInput('energyHeight',trText('Рост, см (также для длины шага)','Height, cm (also used for step length)'),p.heightCm??'','number','min="100" max="250" step="any" inputmode="decimal"')}
 <div id="energyMifflinFields">${moduleInput('energyBirth',trText('Дата рождения','Date of birth'),p.birthDate||'','date',`max="${localDate()}"`)}${energySelect('energyVariant',trText('Явно выбери вариант физиологической формулы','Choose the physiological formula variant'),[['',trText('Не выбран','Not selected')],['plus5',trText('+5 (мужская формула)','+5 (male equation)')],['minus161',trText('-161 (женская формула)','-161 (female equation)')]],p.variant||'')}</div>
 <div id="energyManualFields">${moduleInput('energyManualRmr',trText('Собственный RMR, ккал/день','My RMR, kcal/day'),p.manualRmr??'','number','min="100" max="10000" step="any" inputmode="decimal"')}</div>
 ${energySelect('energyRoutine',trText('Обычная активность без дополнительных тренировок','Usual activity excluding extra workouts'),[['',trText('Выбери обычную активность','Choose your usual activity')],...Object.entries(ENERGY_ROUTINE_LABELS).map(([k,v])=>[k,trText(...v)])],p.routine||'','onchange="energyPreset(this.value)"')}
 ${moduleInput('energyBaselineSteps',trText('Обычные шаги, уже включённые в базу','Usual steps already included in base energy'),p.baselineIncludedSteps??'','number','min="0" max="100000" step="1" inputmode="numeric"')}
 </div><p>${trText('Предустановки - ориентиры: сидячий день 800 шагов / ×1,20; небольшое движение 2500 / ×1,35; подвижный день 6000 / ×1,55. База включает бытовую активность, эти шаги и пищеварение. Выбери норму, которая соответствует твоему обычному дню. Дополнительно учитываются только шаги сверх неё. Изменения параметров пересчитывают всю историю.','Starting assumptions: seated 800 steps / ×1.20; light movement 2500 / ×1.35; on your feet 6000 / ×1.55. Base energy includes routine movement, these steps and digestion. Choose an allowance that matches your usual day. Only steps above it are added. Profile changes recalculate all history.')}</p><button id="energySaveProfile" onclick="energySaveProfile()">${trText('Сохранить профиль','Save profile')}</button>`;
}
function energyProfileMode(){const manual=document.getElementById('energyMode').value==='manual';document.getElementById('energyMifflinFields').hidden=manual;document.getElementById('energyManualFields').hidden=!manual}
function energyPreset(key){const p=MyRhythmEnergy.ROUTINES[key];if(p)document.getElementById('energyBaselineSteps').value=p.steps}
async function energySaveProfile(){try{
 const value=id=>{const raw=document.getElementById(id).value.trim();return raw===''?null:Number(raw)};
 const p={...data.energyBalance?.profile,mode:document.getElementById('energyMode').value,heightCm:value('energyHeight'),birthDate:document.getElementById('energyBirth').value||null,variant:document.getElementById('energyVariant').value||null,manualRmr:value('energyManualRmr'),routine:document.getElementById('energyRoutine').value||null,baselineIncludedSteps:value('energyBaselineSteps')};
 if(p.birthDate&&p.birthDate>localDate()||p.baselineIncludedSteps!==null&&!Number.isInteger(p.baselineIncludedSteps))throw Error(trText('Проверь дату и число шагов.','Check the date and step count.'));
 MyRhythmEnergy.validateStore({profile:p,workouts:[],days:{}});energyStore().profile=p;await save();energyTab='day';renderEnergy();
 }catch(e){moduleError(e)}}
function energyWorkoutHTML(){
 const w=(data.energyBalance?.workouts||[]).find(w=>w.id===energyWorkoutId)||{};
 return `<p>${trText('Только отдельная тренировка сверх обычного дня. Суточные активные калории с часов сюда вводить нельзя.','Only an individual workout beyond your usual day. Do not enter all-day active calories here.')}</p><div class="energy-form-grid">
 ${energySelect('energyWorkoutType',trText('Тип','Type'),Object.entries(ENERGY_WORKOUT_LABELS).map(([k,v])=>[k,trText(...v)]),w.type||'walking','onchange="energyWorkoutTypeChanged()"')}
 ${energySelect('energyCounting',trText('Как учитывать','Count using'),[['steps',trText('По суточным шагам','Daily steps')],['watch',trText('По калориям тренировки','Workout calories')]],w.counting||'steps','onchange="energyWorkoutFields()"')}
 ${energySelect('energySource',trText('Источник','Source'),[['watch',trText('Часы','Watch')],['manual',trText('Ручная оценка','Manual estimate')]],w.source||'watch')}
 ${moduleInput('energyMinutes',trText('Длительность, мин (нужна для общих ккал)','Duration, min (needed for total kcal)'),w.minutes??'','number','min="0.1" max="1440" step="any" inputmode="decimal"')}
 ${moduleInput('energyKcal',trText('Калории этой тренировки (можно оставить пустым)','Calories for this workout (may be blank)'),w.kcal??'','number','min="0" max="20000" step="any" inputmode="decimal"')}
 ${energySelect('energyEnergyType',trText('Тип калорий','Calorie type'),[['unknown',trText('Неизвестно','Unknown')],['active',trText('Active: сверх покоя','Active: above rest')],['total',trText('Total: включая покой','Total: includes rest')]],w.energyType||'unknown')}
 ${energySelect('energyOverlap',trText('Пересечение с суточными шагами','Overlap with daily steps'),[['included',trText('Включены в суточные шаги','Included in daily steps')],['none',trText('Шаги не пересекаются','No step overlap')],['unknown',trText('Неизвестно','Unknown')]],w.overlap||'included','onchange="energyWorkoutFields()"')}
 ${moduleInput('energyWorkoutSteps',trText('Шаги этой тренировки (если известны)','Steps in this workout (if known)'),w.steps??'','number','min="0" max="200000" step="1" inputmode="numeric"')}
 </div><p id="energyWorkoutHint"></p><button id="energySaveWorkout" onclick="energySaveWorkout()">${trText('Сохранить тренировку','Save workout')}</button>${energyWorkoutId?`<button class="danger" onclick="energyDeleteWorkout()">${trText('Удалить тренировку','Delete workout')}</button><button class="secondary" onclick="energyWorkoutId='';renderEnergy()">${trText('Отмена','Cancel')}</button>`:''}`;
}
function energyWorkoutTypeChanged(){
 const type=document.getElementById('energyWorkoutType').value,related=['walking','running'].includes(type);
 document.getElementById('energyCounting').value=related?'steps':'watch';document.getElementById('energyOverlap').value=related?'included':'unknown';energyWorkoutFields();
}
function energyWorkoutFields(){
 const steps=document.getElementById('energyCounting').value==='steps',overlap=document.getElementById('energyOverlap');
 if(steps)overlap.value='included';
 for(const id of ['energyKcal','energyEnergyType','energySource'])document.getElementById(id).disabled=steps;
 document.getElementById('energyWorkoutSteps').disabled=steps||overlap.value!=='included';
 document.getElementById('energyWorkoutHint').textContent=steps?trText('Калории часов не прибавляются. Шаги уже в дневном счётчике. Для бега это грубая оценка ходьбы; для точности выбери калории часов и укажи шаги тренировки.','Watch calories are not added. Steps are already in the daily count. Running uses a rough walking estimate; choose watch calories and enter workout steps for a better estimate.'):trText('Active учитываются сверх покоя. Из Total вычитается RMR × минуты / 1440. Неизвестная энергия не прибавляется. При неизвестном пересечении дополнительная ходьба исключается, и баланс не подтверждается.','Active calories are above rest. Total calories subtract RMR × minutes / 1440. Unknown energy is not added. Unknown overlap excludes extra walking and prevents a confirmed balance.');
}
function energyEditWorkout(id){energyWorkoutId=id;renderEnergy();document.getElementById('energyWorkoutType').focus()}
async function energySaveWorkout(){try{
 const value=id=>{const raw=document.getElementById(id).value.trim();return raw===''?null:Number(raw)},st=energyStore();
 const old=st.workouts.find(w=>w.id===energyWorkoutId),w={...old,id:old?.id||recordId('workout'),date:energyKey(),type:document.getElementById('energyWorkoutType').value,scope:'workout',source:document.getElementById('energySource').value,counting:document.getElementById('energyCounting').value,energyType:document.getElementById('energyEnergyType').value,overlap:document.getElementById('energyOverlap').value,kcal:value('energyKcal'),minutes:value('energyMinutes'),steps:value('energyWorkoutSteps')};
 if(!MyRhythmEnergy.validWorkout(w))throw Error(trText('Проверь значения и пересечение шагов. У ходьбы и бега шаги пересекаются; выбери способ учёта.','Check values and step overlap. Walking and running overlap with steps; select how to count them.'));
 if(st.workouts.some(x=>x.id!==w.id&&x.date===w.date&&x.type===w.type&&x.kcal===w.kcal&&x.minutes===w.minutes)&&!confirm(trText('Похожая тренировка уже есть. Добавить ещё одну отдельную тренировку?','A similar workout exists. Add another separate workout?')))return;
 if(old)st.workouts[st.workouts.indexOf(old)]=w;else st.workouts.push(w);energyWorkoutId='';await save();renderEnergy();
 }catch(e){moduleError(e)}}
async function energyDeleteWorkout(){if(!confirm(trText('Удалить эту тренировку?','Delete this workout?')))return;const st=energyStore();st.workouts=st.workouts.filter(w=>w.id!==energyWorkoutId);energyWorkoutId='';await save();renderEnergy()}
function energyHistoryHTML(){return `<p>${trText('Аналитика истории','History analysis')}</p>`}
