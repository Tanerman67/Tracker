// UI adapter: existing logs + nutritionAggregate -> pure model -> optional UI.
let energyDate=null,energyTab='day',energyWorkoutId='',energyReturnFocus=null;
const ENERGY_ROUTINE_LABELS={seated:['Преимущественно сидя / дома за компьютером','Mostly seated / at home'],light:['Обычно немного двигаюсь','Usually move a little'],moving:['Подвижный обычный день','Usually on my feet']};
const ENERGY_WORKOUT_LABELS={walking:['Ходьба','Walking'],running:['Бег','Running'],cycling:['Велосипед','Cycling'],strength:['Силовая','Strength'],swimming:['Плавание','Swimming'],other:['Другое','Other']};
const ENERGY_ISSUES={
 missingProfile:['Заполни необходимые параметры профиля.','Complete the required profile settings.'],missingWalking:['Нет данных о дополнительных шагах или параметрах ходьбы.','Extra steps or walking parameters are missing.'],staleWeight:['Весу более 30 дней. Оценка менее надёжна.','Weight is over 30 days old. Confidence is lower.'],belowBaseline:['Шагов меньше обычной нормы. База не уменьшена; оценка менее уверенная.','Steps are below your usual allowance. Base energy is unchanged; confidence is lower.'],missingWorkout:['Gym отмечен, но энергия тренировки неизвестна. Добавь тренировку.','Gym is marked but its energy is unknown. Add a workout.'],unknownWorkout:['Энергия тренировки неизвестна и не прибавлена.','Unknown workout energy has not been added.'],totalNeedsDuration:['Для общих калорий тренировки нужна длительность.','Total workout calories need a duration.'],unknownOverlap:['Пересечение с шагами неизвестно. Дополнительная ходьба не прибавлена, чтобы избежать двойного учёта.','Step overlap is unknown. Extra walking is excluded to avoid double counting.'],inconsistentSteps:['Шагов тренировок больше суточных. Проверь записи.','Workout steps exceed daily steps. Check the records.'],invalidWorkout:['Некорректная или повторная тренировка не учтена.','An invalid or duplicate workout has been excluded.'],missingFood:['Нет пригодных данных о калориях питания. Это не ноль.','No usable food calories. This does not mean zero.'],partialFood:['Калории известны только для части еды. Разница показана по известным значениям.','Some food calories are missing. The difference uses known calories only.'],foodUnconfirmed:['Полнота питания пока не подтверждена.','Food diary completeness is not confirmed.'],foodChanged:['Питание менялось после подтверждения. Подтверди заново.','Food changed after confirmation. Confirm again.'],activityUnconfirmed:['Подтверди, что шаги и все тренировки учтены.','Confirm steps and all workouts are accounted for.'],activityChanged:['Активность менялась после подтверждения. Подтверди заново.','Activity changed after confirmation. Confirm again.']
};
function energyStore(){if(!data.energyBalance)data.energyBalance={profile:{},workouts:[],days:{}};return data.energyBalance}
function energyKey(){return energyDate||todayDateKey()}
function energyDay(date=energyKey()){return MyRhythmEnergy.daily(data,date,nutritionAggregate(date).calories)}
function energyStatus(s){return ({provisional:trText('Предварительно','Provisional'),insufficient:trText('Недостаточно данных','Insufficient data')})[s]}
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
// Refresh a read-only energy view after another tab saves, without replacing a draft.
function energyExternalUpdate(){
 if(moduleView!=='energy'||energyTab==='profile'||energyWorkoutId||document.activeElement?.closest('.energy-workout-form,.energy-form-grid'))return;
 saveCoordinationQueue.then(()=>{
  if(moduleView!=='energy'||energyTab==='profile'||energyWorkoutId||document.activeElement?.closest('.energy-workout-form,.energy-form-grid')||JSON.stringify(data)!==JSON.stringify(storageBaseline))return;
  const latest=bestCandidate([parseCandidate(DATA_KEY,storageGet(DATA_KEY),true),parseCandidate(MIRROR_KEY,storageGet(MIRROR_KEY))].filter(Boolean));
  if(latest&&candidateBetter(latest,{data})){data=migrateData(latest.data);resetStorageBaseline();render()}
 });
}
addEventListener('storage',e=>{if(e.key===DATA_KEY&&e.newValue)energyExternalUpdate()});
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
 moduleShell(trText('Энергетический баланс','Energy Balance'),`<div class="energy-view">${energyRenderHeader()}${body}<p class="small">${trText('Расчётная модель, не измерение. Данные остаются на этом устройстве. Баланс автоматически меняется вместе с записями.','A model estimate, not a measurement. Data stays on this device. Balance updates automatically with your records.')}</p><div id="moduleError" role="alert"></div></div>`);
 if(energyTab==='profile')energyProfileMode();
 if(energyTab==='day')energyWorkoutFields();
}
function energyDailyHTML(){
 const date=energyKey(),s=energyDay(date),weight=s.resting.weight,workouts=(data.energyBalance?.workouts||[]).filter(w=>w.date===date);
 const walking=s.walking,steps=walking.recorded===null?trText('Шаги не записаны','Steps not logged'):trText('Всего: ','Total: ')+nutritionFormat(walking.recorded,0)+trText(' · В обычном дне: ',' · Included in usual day: ')+(walking.included===null?'—':nutritionFormat(walking.included,0))+trText(' · Дополнительно: ',' · Extra: ')+(walking.steps===null?'—':nutritionFormat(walking.steps,0));
 const rows=[
  [trText('Обычный день','Usual day'),energyKcal(s.base),trText('Покой, бытовая активность и пищеварение','Rest, routine movement and digestion')],
  [trText('Дополнительные шаги','Extra steps'),walking.suppressed?trText('Учтены часами','Covered by watch'):energyKcal(walking.value),steps+(walking.excludedSteps?' · '+nutritionFormat(walking.excludedSteps,0)+' '+trText('шагов тренировки учтено часами','workout steps covered by watch'):'')],
  [trText('Тренировки','Workouts'),workouts.length?(s.incompleteEnergy?'≥ ':'')+energyKcal(s.exercise.value):trText('Нет записей','No entries'),trText('По записанным тренировкам, без повторного учёта шагов','From logged workouts, with no duplicate step energy')]
 ];
 return `<div class="energy-date"><button class="secondary" aria-label="${trText('Предыдущий день','Previous day')}" onclick="energySetDate(MyRhythmEnergy.addDays(energyKey(),-1))">‹</button>${moduleInput('energyDate',trText('Дата','Date'),date,'date',`max="${localDate()}" onchange="energySetDate(this.value)"`)}<button class="secondary" ${date>=localDate()?'disabled':''} aria-label="${trText('Следующий день','Next day')}" onclick="energySetDate(MyRhythmEnergy.addDays(energyKey(),1))">›</button></div>
 <div class="energy-summary" data-status="${s.status}"><strong>${energyBalanceText(s.balance)}</strong><span>${energyStatus(s.status)} · ${s.usable?trText('по записанным данным','based on logged data'):trText('есть пропуски в данных','some data is missing')}</span></div>
 <div class="energy-totals"><div><span>${trText('Предполагаемый расход','Estimated daily expenditure')}</span><strong id="energyTotal">${energyKcal(s.tdee)}</strong></div><div><span>${trText('Записано питания','Food logged')}</span><strong id="energyIntake">${nutritionDisplay(s.food)}</strong></div></div>
 <p class="small">${trText('Расход рассчитан на полный день. Незаписанная еда и активность могут изменить результат.','Expenditure is for the full day. Unlogged food and activity can change the result.')}</p>
 ${s.base===null?`<button onclick="energySwitch('profile')">${trText('Настроить один раз','Set up once')}</button>`:''}
 <dl class="energy-components">${rows.map(([label,value,note])=>`<div><dt>${label}<small>${escapeHTML(note)}</small></dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>
 <div class="module-actions energy-links"><button class="secondary" onclick="energyRoute('food')">${trText('Записать питание','Log food')}</button><button class="secondary" onclick="energyRoute('steps')">${trText('Записать шаги','Log steps')}</button></div>
 ${s.issues.length?`<details class="energy-data-note"><summary>${trText('Ограничения записей','Record limitations')} (${s.issues.length})</summary><ul class="energy-issues">${s.issues.map(i=>`<li>${trText(...ENERGY_ISSUES[i])}</li>`).join('')}</ul></details>`:''}
 <details class="energy-workout-form" ${energyWorkoutId?'open':''}><summary>${energyWorkoutId?trText('Изменить тренировку','Edit workout'):trText('Добавить тренировку','Add workout')}</summary>${energyWorkoutHTML()}</details>
 ${workouts.length?`<h3>${trText('Тренировки этого дня','Workouts for this day')}</h3>${workouts.map(w=>`<button class="secondary module-history" onclick="energyEditWorkout(${inlineArgument(w.id)})">${trText(...ENERGY_WORKOUT_LABELS[w.type])} · ${w.counting==='steps'?trText('по шагам','from steps'):w.kcal===null?trText('ккал неизвестны','kcal unknown'):nutritionFormat(w.kcal,0)+' kcal'}</button>`).join('')}`:''}
 <p class="small">${weight?trText('Вес из Body Check-in: ','Weight from Body Check-in: ')+nutritionFormat(weight.value)+' kg · '+weight.date:trText('Добавь вес через Body Check-in.','Add weight through Body Check-in.')} <button class="ghost" onclick="energyRoute('body')">${trText('Открыть','Open')}</button></p>
 <details><summary>${trText('Как считается расход','How expenditure is calculated')}</summary><p>${trText('Энергия покоя','Resting energy')}: ${energyKcal(s.resting.value)}. ${trText('Формулы и параметры доступны в расширенных настройках профиля.','Formulas and parameters are in advanced profile settings.')}</p>${s.sensitivity?`<p>${trText('Сценарии модели','Model scenarios')}: ${energyKcal(s.sensitivity[0])} - ${energyKcal(s.sensitivity[1])}. ${trText('Это не доверительный интервал: ошибки часов и формулы покоя сюда не входят.','This is not a confidence interval: watch and resting-equation errors are not included.')}</p>`:''}</details>`;
}

function energyProfileHTML(){
 const p=data.energyBalance?.profile||{};
 return `<p>${trText('Настрой один раз. Вес автоматически берётся из Body Check-in.','Set this once. Weight comes automatically from Body Check-in.')}</p><div class="energy-form-grid">
 ${energySelect('energyRoutine',trText('Обычная активность','Usual activity'),[['',trText('Выбери обычный день','Choose your usual day')],...Object.entries(ENERGY_ROUTINE_LABELS).map(([k,v])=>[k,trText(...v)])],p.routine||'','onchange="energyPreset(this.value)"')}
 ${moduleInput('energyHeight',trText('Рост, см','Height, cm'),p.heightCm??'','number','min="100" max="250" step="any" inputmode="decimal"')}
 <div id="energyMifflinFields">${moduleInput('energyBirth',trText('Дата рождения','Date of birth'),p.birthDate||'','date',`max="${localDate()}"`)}${energySelect('energyVariant',trText('Расчёт для','Calculate for'),[['',trText('Выбери вариант','Choose an option')],['plus5',trText('Мужчины','Male')],['minus161',trText('Женщины','Female')]],p.variant||'')}</div></div>
 <p class="small" id="energyRoutineHelp">${trText('В обычный день уже включено шагов: ','Steps already included in your usual day: ')}${p.baselineIncludedSteps??'—'}. ${trText('Дополнительными считаются только шаги сверх этого числа.','Only steps above this number are extra.')}</p>
 <details id="energyAdvancedProfile" ${p.mode==='manual'?'open':''}><summary>${trText('Расширенные настройки','Advanced settings')}</summary>
 ${energySelect('energyMode',trText('Расход покоя','Resting energy'),[['mifflin',trText('Рассчитать автоматически','Calculate automatically')],['manual',trText('Указать известный расход покоя','Enter my known resting energy')]],p.mode||'mifflin','onchange="energyProfileMode()"')}
 <div id="energyManualFields">${moduleInput('energyManualRmr',trText('Расход покоя, ккал/день','Resting energy, kcal/day'),p.manualRmr??'','number','min="100" max="10000" step="any" inputmode="decimal"')}</div>
 ${moduleInput('energyBaselineSteps',trText('Шаги, уже включённые в обычный день','Steps already included in your usual day'),p.baselineIncludedSteps??'','number','min="0" max="100000" step="1" inputmode="numeric"')}
 <p>${trText('Формула Миффлина - Сан Жеора для взрослых: 10 × вес + 6,25 × рост - 5 × возраст + 5 (мужчины) или -161 (женщины). Обычная активность включает бытовое движение и пищеварение. Коэффициенты и формулы не изменены; изменение параметров пересчитывает историю.','Mifflin-St Jeor for adults: 10 × weight + 6.25 × height - 5 × age + 5 (male) or -161 (female). Usual activity includes routine movement and digestion. Factors and equations are unchanged; changing settings recalculates history.')}</p></details>
 <button id="energySaveProfile" onclick="energySaveProfile()">${trText('Сохранить','Save')}</button>`;
}
function energyProfileMode(){const manual=document.getElementById('energyMode').value==='manual';document.getElementById('energyMifflinFields').hidden=manual;document.getElementById('energyManualFields').hidden=!manual}
function energyPreset(key){const p=MyRhythmEnergy.ROUTINES[key];if(p){document.getElementById('energyBaselineSteps').value=p.steps;document.getElementById('energyRoutineHelp').textContent=trText('В обычный день уже включено шагов: ','Steps already included in your usual day: ')+nutritionFormat(p.steps,0)}}
async function energySaveProfile(){try{
 const value=id=>{const raw=document.getElementById(id).value.trim();return raw===''?null:Number(raw)};
 const p={...data.energyBalance?.profile,mode:document.getElementById('energyMode').value,heightCm:value('energyHeight'),birthDate:document.getElementById('energyBirth').value||null,variant:document.getElementById('energyVariant').value||null,manualRmr:value('energyManualRmr'),routine:document.getElementById('energyRoutine').value||null,baselineIncludedSteps:value('energyBaselineSteps')};
 if(!p.routine||p.heightCm===null||p.baselineIncludedSteps===null||!Number.isInteger(p.baselineIncludedSteps)||p.mode==='mifflin'&&(!p.birthDate||!p.variant||MyRhythmEnergy.ageAt(p.birthDate,localDate())<18||MyRhythmEnergy.ageAt(p.birthDate,localDate())>120)||p.mode==='manual'&&p.manualRmr===null)throw Error(trText('Укажи обычную активность, рост и параметры для расчёта покоя. Формула предназначена для взрослых.','Enter your usual activity, height and resting-energy details. The equation is for adults.'));
 MyRhythmEnergy.validateStore({profile:p,workouts:[],days:{}});energyStore().profile=p;await save();energyTab='day';renderEnergy();
 }catch(e){moduleError(e)}}

function energyWorkoutHTML(){
 const w=(data.energyBalance?.workouts||[]).find(w=>w.id===energyWorkoutId)||{};
 return `<div class="energy-form-grid">
 ${energySelect('energyWorkoutType',trText('Тренировка','Workout'),[['',trText('Выбери тип','Choose a type')],...Object.entries(ENERGY_WORKOUT_LABELS).map(([k,v])=>[k,trText(...v)])],w.type||'','onchange="energyWorkoutTypeChanged()"')}
 ${moduleInput('energyKcal',trText('Активные калории с часов','Active calories from your watch'),w.kcal??'','number','min="0" max="20000" step="any" inputmode="decimal" onchange="energyWorkoutFields()"')}
 </div><p class="small">${trText('Только калории отдельной тренировки, не активность за весь день. Если часы показывают Total, выбери общие калории ниже.','Use one workout, not all-day activity. If your watch shows Total, select total calories below.')}</p>
 <div id="energyStepOptions">${energySelect('energyCounting',trText('Для ходьбы и бега учитывать','For walking and running, use'),[['watch',trText('Калории часов','Watch calories')],['steps',trText('Только суточные шаги','Daily steps only')]],w.counting||'watch','onchange="energyWorkoutFields()"')}
 ${moduleInput('energyWorkoutSteps',trText('Шаги этой тренировки, если известны','Workout steps, if known'),w.steps??'','number','min="0" max="200000" step="1" inputmode="numeric"')}</div>
 <div id="energyOtherOverlap">${energySelect('energyOverlap',trText('Эта тренировка входит в суточные шаги?','Is this workout included in daily steps?'),[['unknown',trText('Не знаю','Not sure')],['none',trText('Нет','No')],['included',trText('Да','Yes')]],w.overlap||'unknown','onchange="energyWorkoutFields()"')}</div>
 <details id="energyWorkoutAdvanced" ${w.energyType==='total'||w.energyType==='unknown'||w.source==='manual'?'open':''}><summary>${trText('Общие калории / другие параметры','Total calories / other details')}</summary><div class="energy-form-grid">
 ${energySelect('energyEnergyType',trText('Какие калории показывают часы','Calories shown on your watch'),[['active',trText('Активные (Active)','Active')],['total',trText('Общие, включая покой (Total)','Total, including rest')],['unknown',trText('Не знаю','Not sure')]],w.energyType||'active','onchange="energyWorkoutFields()"')}
 ${moduleInput('energyMinutes',trText('Длительность, мин','Duration, min'),w.minutes??'','number','min="0.1" max="1440" step="any" inputmode="decimal"')}
 ${energySelect('energySource',trText('Источник','Source'),[['watch',trText('Часы','Watch')],['manual',trText('Ручная оценка','Manual estimate')]],w.source||'watch')}
 </div></details><p id="energyWorkoutHint" class="small"></p><button id="energySaveWorkout" onclick="energySaveWorkout()">${trText('Сохранить тренировку','Save workout')}</button>${energyWorkoutId?`<button class="danger" onclick="energyDeleteWorkout()">${trText('Удалить тренировку','Delete workout')}</button><button class="secondary" onclick="energyWorkoutId='';renderEnergy()">${trText('Отмена','Cancel')}</button>`:''}`;
}
function energyWorkoutTypeChanged(){
 const type=document.getElementById('energyWorkoutType').value,related=['walking','running'].includes(type);
 document.getElementById('energyCounting').value='watch';document.getElementById('energyOverlap').value=related?'included':['cycling','strength','swimming'].includes(type)?'none':'unknown';energyWorkoutFields();
}
function energyWorkoutFields(){
 const type=document.getElementById('energyWorkoutType').value,related=['walking','running'].includes(type),counting=document.getElementById('energyCounting'),overlap=document.getElementById('energyOverlap'),calorieType=document.getElementById('energyEnergyType').value;
 document.getElementById('energyStepOptions').hidden=!related&&overlap.value!=='included';document.getElementById('energyOtherOverlap').hidden=related||['cycling','strength','swimming'].includes(type)&&overlap.value==='none'||!type;
 if(related)overlap.value='included';if(!related&&overlap.value!=='included')counting.value='watch';
 const steps=counting.value==='steps';
 document.querySelector('label[for="energyKcal"]').textContent=calorieType==='total'?trText('Общие калории с часов','Total calories from your watch'):calorieType==='unknown'?trText('Калории с часов (тип неизвестен)','Watch calories (type unknown)'):trText('Активные калории с часов','Active calories from your watch');
 document.getElementById('energyKcal').disabled=steps;document.getElementById('energyWorkoutSteps').closest('.field').hidden=steps||overlap.value!=='included';
 document.getElementById('energyMinutes').closest('.field').hidden=calorieType!=='total'&&!document.getElementById('energyMinutes').value;
 document.getElementById('energyWorkoutHint').textContent=steps?trText('Калории часов не прибавляются: используем записанные шаги. Для бега это приблизительная оценка ходьбы.','Watch calories are not added: logged steps are used. Running uses a rough walking estimate.'):related||overlap.value!=='none'?trText('Без шагов тренировки используем калории часов, а дополнительную ходьбу дня не прибавляем. Укажи шаги тренировки, чтобы учесть остальную ходьбу.','Without workout steps, watch calories are used and extra daily walking is not added. Enter workout steps to include the remaining walking.'):calorieType==='total'?trText('Из общих калорий вычитается расход покоя за время тренировки. Нужна длительность.','Resting energy for the workout is removed from total calories. Duration is needed.'):trText('Калории этой тренировки прибавятся к обычному дню и дополнительным шагам.','This workout is added to your usual day and extra steps.');
}

function energyEditWorkout(id){energyWorkoutId=id;renderEnergy();document.getElementById('energyWorkoutType').focus()}
async function energySaveWorkout(){try{
 const value=id=>{const raw=document.getElementById(id).value.trim();return raw===''?null:Number(raw)},st=energyStore();
 const old=st.workouts.find(w=>w.id===energyWorkoutId),w={...old,id:old?.id||recordId('workout'),date:energyKey(),type:document.getElementById('energyWorkoutType').value,scope:'workout',source:document.getElementById('energySource').value,counting:document.getElementById('energyCounting').value,energyType:document.getElementById('energyEnergyType').value,overlap:document.getElementById('energyOverlap').value,kcal:value('energyKcal'),minutes:value('energyMinutes'),steps:value('energyWorkoutSteps')};
 if(w.counting==='watch'&&w.energyType==='total'&&w.kcal!==null&&w.minutes===null)throw Error(trText('Для общих калорий укажи длительность тренировки.','Enter workout duration for total calories.'));
 if(!MyRhythmEnergy.validWorkout(w))throw Error(trText('Проверь значения и пересечение шагов. У ходьбы и бега шаги пересекаются; выбери способ учёта.','Check values and step overlap. Walking and running overlap with steps; select how to count them.'));
 if(st.workouts.some(x=>x.id!==w.id&&x.date===w.date&&x.type===w.type&&x.kcal===w.kcal&&x.minutes===w.minutes)&&!confirm(trText('Похожая тренировка уже есть. Добавить ещё одну отдельную тренировку?','A similar workout exists. Add another separate workout?')))return;
 if(old)st.workouts[st.workouts.indexOf(old)]=w;else st.workouts.push(w);energyWorkoutId='';await save();renderEnergy();
 }catch(e){moduleError(e)}}
async function energyDeleteWorkout(){if(!confirm(trText('Удалить эту тренировку?','Delete this workout?')))return;const st=energyStore();st.workouts=st.workouts.filter(w=>w.id!==energyWorkoutId);energyWorkoutId='';await save();renderEnergy()}
let energyRange=30,energyRangeStart=null,energyRangeEnd=null;
function energySetRange(days){energyRange=days;renderEnergy()}
function energyApplyRange(){
 const start=document.getElementById('energyRangeStart').value,end=document.getElementById('energyRangeEnd').value;
 try{if(!validDay(start)||!validDay(end)||end>localDate()||MyRhythmEnergy.dayDiff(start,end)<0||MyRhythmEnergy.dayDiff(start,end)>3660)throw Error(trText('Проверь диапазон: до 3661 дня, без будущих дат.','Check the range: up to 3661 days, no future dates.'));energyRangeStart=start;energyRangeEnd=end;energyRange='custom';renderEnergy()}catch(e){moduleError(e)}
}
function energyChart(points,{weight=false}={}){
 const width=600,height=180,pad=24,known=points.filter(p=>p.value!==null);
 if(!known.length)return `<p>${trText('Недостаточно данных для графика.','Not enough data for a chart.')}</p>`;
 const vals=known.map(p=>p.value),min=weight?Math.min(...vals)-0.3:Math.min(0,...vals),max=weight?Math.max(...vals)+0.3:Math.max(0,...vals),span=max-min||1;
 const y=v=>height-pad-(v-min)/span*(height-2*pad),x=i=>pad+i*(width-2*pad)/Math.max(1,points.length-1);
 return `<svg class="energy-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${weight?trText('Вес по датам; точки без интерполяции','Weight by date; points without interpolation'):trText('Расчётный дневной баланс; пропуски не заполнены','Estimated daily balance; missing days stay empty')}"><line x1="${pad}" x2="${width-pad}" y1="${y(weight?min:0)}" y2="${y(weight?min:0)}" stroke="currentColor" opacity=".3"/>${points.map((p,i)=>p.value===null?`<circle cx="${x(i)}" cy="${height-pad}" r="2" fill="none" stroke="currentColor" opacity=".3"/>`:`${weight?'':`<line x1="${x(i)}" x2="${x(i)}" y1="${y(0)}" y2="${y(p.value)}" stroke="currentColor" opacity=".45"/>`}<circle cx="${x(i)}" cy="${y(p.value)}" r="3" fill="${weight?'var(--text)':'var(--green)'}"><title>${p.date}: ${nutritionFormat(p.value,weight?2:0)} ${weight?'kg':'kcal'}</title></circle>`).join('')}<text x="${pad}" y="14" fill="currentColor" font-size="11">${nutritionFormat(max,weight?1:0)} ${weight?'kg':'kcal'}</text><text x="${pad}" y="${height-3}" fill="currentColor" font-size="11">${points[0].date}</text><text x="${width-pad}" y="${height-3}" fill="currentColor" font-size="11" text-anchor="end">${points.at(-1).date}</text></svg>`;
}
function energyHistoryHTML(){
 const end=energyRange==='custom'?(energyRangeEnd||energyKey()):energyKey(),start=energyRange==='custom'?(energyRangeStart||end):MyRhythmEnergy.addDays(end,1-energyRange);
 const p=MyRhythmEnergy.period(data,start,end,date=>nutritionAggregate(date).calories),c=p.comparison;
 const weightMap=new Map(p.weights.map(w=>[w.date,w.smooth]));
 return `<div class="module-actions">${[7,14,30,90].map(n=>`<button class="${energyRange===n?'':'secondary'}" aria-pressed="${energyRange===n}" onclick="energySetRange(${n})">${n} ${trText('дней','days')}</button>`).join('')}</div>
 <details><summary>${trText('Свой диапазон','Custom range')}</summary><div class="energy-form-grid">${moduleInput('energyRangeStart',trText('От','From'),start,'date',`max="${localDate()}"`)}${moduleInput('energyRangeEnd',trText('До','To'),end,'date',`max="${localDate()}"`)}</div><button class="secondary" onclick="energyApplyRange()">${trText('Применить','Apply')}</button></details>
 <p>${start} - ${end}</p><div class="energy-summary"><strong>${energyBalanceText(p.sum)}</strong><span>${trText('Дни с достаточными записями','Days with sufficient records')}: ${p.used}/${p.days.length} · ${trText('Исключено','Excluded')}: ${p.excludedDays}</span></div>
 <p>${trText('Иллюстративный эквивалент массы','Illustrative mass equivalent')}: ${p.equivalent===null?'—':nutritionFormat(p.equivalent,2)+' kg'}. ${trText('Около 7700 ккал/кг - грубый ориентир. Учитываются дни с известными калориями и активностью. Полнота реального питания не гарантирована, сравнение предварительное.','About 7700 kcal/kg is a rough reference. Days need known calories and activity. Real-world food completeness is not guaranteed; comparison is provisional.')}</p>
 ${energyChart(p.days.map(d=>({date:d.date,value:d.usable?d.balance:null})))}
 ${p.excludedDays?`<details><summary>${trText('Почему дни исключены','Why days were excluded')}</summary><ul class="energy-issues">${Object.entries(p.excluded).map(([key,n])=>`<li>${trText(...ENERGY_ISSUES[key])} (${n})</li>`).join('')}</ul><p>${trText('У одного дня может быть несколько причин. Пропуски не экстраполируются.','A day may have several reasons. Missing days are not extrapolated.')}</p></details>`:''}
 <h3>${trText('Вес: среднее за 7 дней','Weight: 7-day average')}</h3>${energyChart(p.days.map(d=>({date:d.date,value:weightMap.get(d.date)??null})),{weight:true})}
 <p>${trText('Не менее 3 взвешиваний в предшествующие 7 календарных дней. Среднее показано только на датах измерений, без заполнения пропусков.','At least 3 measurements in the trailing 7 calendar days. Averages appear only on measurement dates; gaps stay empty.')}</p>
 ${c?`<div class="energy-summary"><strong>${trText('Изменение сглаженного веса','Smoothed weight change')}: ${nutritionFormat(c.actual,2)} kg</strong><span>${c.start} - ${c.end} · ${c.first.count}/${c.last.count} ${trText('замеров в окнах','measurements in windows')}</span><span>${trText('Энергетический ориентир за те же дни','Energy reference for matching days')}: ${c.equivalent===null?'—':nutritionFormat(c.equivalent,2)+' kg'} · ${c.used}/${c.total} ${trText('дней','days')}</span><span>${trText('Расхождение','Difference')}: ${c.discrepancy===null?trText('недоступно: есть неполные дни','unavailable: incomplete days'):nutritionFormat(c.discrepancy,2)+' kg'}</span></div>`:`<p>${trText('Для сопоставления нужны два достаточно заполненных окна среднего, разделённые минимум 7 днями.','Comparison needs two sufficiently populated average windows at least 7 days apart.')}</p>`}
 <p>${trText('Вода, гликоген, содержимое ЖКТ, адаптация и ошибки оценки еды/расхода могут объяснять расхождение. Время взвешивания неизвестно: энергетические дни между датами сравниваются приблизительно. Расход не корректируется автоматически.','Water, glycogen, gut contents, adaptation and food/energy estimation errors can explain differences. Measurement times are unknown: full energy days between dates are only an approximate match. Expenditure is not adjusted automatically.')}</p>
 <details><summary>${trText('Дни и измерения: точные записи','Days & measurements: exact records')}</summary><div class="energy-history-list">${p.days.slice().reverse().map(d=>`<button class="secondary module-history" onclick="energyDate='${d.date}';energySwitch('day')">${d.date} · ${energyStatus(d.status)} · ${energyBalanceText(d.balance)}</button>`).join('')}</div><ul>${p.weights.map(w=>`<li>${w.date}: ${nutritionFormat(w.value,2)} kg · ${trText('среднее','average')}: ${w.smooth===null?'—':nutritionFormat(w.smooth,2)+' kg'}</li>`).join('')}</ul></details>`;
}
