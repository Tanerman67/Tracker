// Unified editor; persisted fields retain their existing owners and schema.
let settingsSnapshot='',settingsSaving=false;
function settingsValues(){const host=document.getElementById('unifiedSettings');return host?JSON.stringify([...host.querySelectorAll('input,select')].map(e=>[e.id,e.value])):''}
function settingsDirty(){return !!settingsSnapshot&&settingsSnapshot!==settingsValues()}
function settingsMayLeave(){if(settingsSaving)return false;if(!settingsDirty())return true;if(!confirm(trText('Отменить несохранённые изменения?','Discard unsaved changes?')))return false;settingsSnapshot='';renderUnifiedSettings();return true}
addEventListener('beforeunload',e=>{if(settingsDirty()){e.preventDefault();e.returnValue=''}});
function openUnifiedSettings(group='settingsProfile'){show('settings');document.getElementById(group)?.scrollIntoView({block:'start'});document.getElementById(group)?.focus()}
function renderUnifiedSettings(){
 if(settingsSaving)return;
 const dirty=settingsDirty(),draft=dirty?JSON.parse(settingsValues()):null,originalSnapshot=settingsSnapshot,focused=document.activeElement?.id;
 const profile=document.getElementById('settingsProfile');if(!profile)return;
 profile.innerHTML='<h3 tabindex="-1">'+trText('Личные параметры','Personal parameters')+'</h3>'+settingsProfileHTML();
 document.getElementById('settingsEnergyAdvanced').innerHTML=settingsEnergyAdvancedHTML();
 const weight=bodyLatest('weight');const note=document.createElement('p');note.textContent=trText('Вес: ','Weight: ')+(weight?bodyFormatNumber(weight.value)+' '+bodyMetricUnit('weight'):trText('Нет данных. Добавь замер в Body.','No data. Add a Body check-in.'));profile.append(note);
 const stored=data.energyBalance?.profile||{},missing=[];
 if(stored.routine&&stored.baselineIncludedSteps==null)missing.push(trText('обычные шаги в базе','included usual steps'));
 if(!stored.routine)missing.push(trText('обычная активность','usual activity'));
 if(stored.mode==='manual'){if(stored.manualRmr==null)missing.push('RMR')}
 else{if(stored.heightCm==null)missing.push(trText('рост','height'));if(!stored.birthDate)missing.push(trText('дата рождения','date of birth'));if(!stored.variant)missing.push(trText('пол для расчёта','sex used for calculation'))}
 if(missing.length){const hint=document.createElement('p');hint.className='small';hint.textContent=trText('Для оценки расхода укажи: ','For energy estimates, add: ')+missing.join(', ')+'.';profile.append(hint)}
 const button=document.createElement('button');button.className='ghost';button.textContent=trText('Открыть Body Check-in','Open Body Check-in');button.onclick=()=>{if(settingsMayLeave())openBodyCheckin()};profile.append(button);energyProfileMode();
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??''};
 for(const id of ['stepsGoal','sleepGoal','outdoorsGoal','gymGoal','smokeDate'])set(id,data[id]);set('alcoholDate',alcoholTrackingStart());
 for(const id of ['smokeDate','alcoholDate'])document.getElementById(id).max=localDate();
 document.getElementById('alcoholDerivedDate').textContent=trText('Текущая серия: ','Current streak: ')+(alcoholCurrentStreakStart()||'—');
 for(const key of ['calories','fat','carbs'])set('nutritionGoal_'+key,data.nutrition.goals[key]);set('nutritionGoal_protein',data.proteinGoal);
 document.getElementById('goalRuleSettings').innerHTML=goalRuleEditorHTML(['steps','sleep','outdoors','gym']);document.getElementById('proteinGoalRuleSettings').innerHTML=goalRuleEditorHTML(['protein']);
 for(const el of document.querySelectorAll('#unifiedSettings input,#unifiedSettings select')){const error=document.createElement('small');error.id=el.id+'Error';error.className='settings-field-error';error.setAttribute('role','alert');el.setAttribute('aria-describedby',error.id);el.after(error)}
 if(draft){for(const [id,value] of draft){const el=document.getElementById(id);if(el)el.value=value}settingsSnapshot=originalSnapshot;energyProfileMode();document.getElementById(focused)?.focus({preventScroll:true})}else settingsSnapshot=settingsValues();
}
function settingsInvalid(id,message){const el=document.getElementById(id);el?.setAttribute('aria-invalid','true');const error=document.getElementById(id+'Error');if(error)error.textContent=message;el?.focus();throw Error(message)}
function settingsCandidate(){
 const next=structuredClone(data),gv=id=>document.getElementById(id).value.trim();
 const number=(id,min=0,max=1e6)=>{if(document.getElementById(id).validity?.badInput)settingsInvalid(id,trText('Проверь число.','Check the number.'));const raw=gv(id);if(raw==='')return null;const n=Number(raw);if(!Number.isFinite(n)||n<min||n>max)settingsInvalid(id,trText('Проверь значение.','Check the value.'));return n};
 // Unchanged blank fields retain absent/null/zero distinctions and extensions.
 const assign=(obj,key,value,id)=>{const before=JSON.parse(settingsSnapshot||'[]').find(x=>x[0]===id)?.[1];if(before!==gv(id))obj[key]=value};
 for(const id of ['smokeDate','alcoholDate','energyBirth']){const v=gv(id);if(v&&(!validDay(v)||v>localDate()))settingsInvalid(id,trText('Проверь дату.','Check the date.'))}
 assign(next,'smokeDate',gv('smokeDate'),'smokeDate');assign(next,'alcoholTrackingStart',gv('alcoholDate'),'alcoholDate');
 const profile={...next.energyBalance?.profile};
 for(const [key,id,min,max] of [['heightCm','energyHeight',100,250],['manualRmr','energyManualRmr',100,10000],['baselineIncludedSteps','energyBaselineSteps',0,100000]]){const v=number(id,min,max);if(key==='baselineIncludedSteps'&&v!==null&&!Number.isInteger(v))settingsInvalid(id,trText('Нужно целое число.','Use a whole number.'));assign(profile,key,v,id)}
 for(const [key,id] of [['mode','energyMode'],['birthDate','energyBirth'],['variant','energyVariant'],['routine','energyRoutine']])assign(profile,key,gv(id)||null,id);
 MyRhythmEnergy.validateStore({profile,workouts:[],days:{}});
 if(JSON.stringify(profile)!==JSON.stringify(next.energyBalance?.profile||{})&&profile.mode===undefined)profile.mode=gv('energyMode');
 if(JSON.stringify(profile)!==JSON.stringify(next.energyBalance?.profile||{}))next.energyBalance={...(next.energyBalance||{workouts:[],days:{}}),profile};
 for(const [metric,key] of Object.entries({steps:'stepsGoal',sleep:'sleepGoal',outdoors:'outdoorsGoal',gym:'gymGoal',protein:'proteinGoal'})){
  const id=metric==='protein'?'nutritionGoal_protein':key,value=number(id);
  assign(next,key,value,id);
  let rule;try{rule=editedGoalRule(metric,next[key])}catch(e){document.getElementById('settingsCalculation').open=true;settingsInvalid('goalUpper_'+metric,e.message)}
  const old=data.goalRules?.[metric];
  if(gv(id)!==JSON.parse(settingsSnapshot).find(x=>x[0]===id)?.[1]||rule.type!==goalRule(metric).type||rule.type==='range'&&rule.upper!==old?.upper){next.goalRules[metric]=rule;const t=next.trackers.find(t=>t.id===metric);if(t)t.goal=next[key];if(metric==='protein'&&Object.hasOwn(next.nutrition.goals,'protein'))next.nutrition.goals.protein=next[key]}
 }
 for(const key of ['calories','fat','carbs']){const id='nutritionGoal_'+key,v=number(id);if(JSON.parse(settingsSnapshot).find(x=>x[0]===id)?.[1]!==gv(id)){if(v===null)delete next.nutrition.goals[key];else next.nutrition.goals[key]=v}}
 return next;
}
async function saveUnifiedSettings(){
 if(settingsSaving)return false;const status=document.getElementById('settingsSaveStatus');status.textContent='';
 for(const el of document.querySelectorAll('#unifiedSettings [aria-invalid]'))el.removeAttribute('aria-invalid');for(const el of document.querySelectorAll('.settings-field-error'))el.textContent='';
 let before;
 try{const candidate=settingsCandidate();before=structuredClone(data);settingsSaving=true;for(const el of document.querySelectorAll('#unifiedSettings input,#unifiedSettings select,#unifiedSettings .settings-save'))el.disabled=true;data=candidate;const ok=await persistData({renderAfter:false,makeSnapshot:true});if(ok===false){status.textContent=trText('Не сохранено. Проверь сообщение об ошибке. Поля сохранены для повторной попытки.','Not saved. Check the error. Your entries remain for retry.');document.getElementById('advancedSettings').open=true;return false}settingsSnapshot='';settingsSaving=false;render();status.textContent=trText('Изменения сохранены.','Changes saved.');return true}
 catch(e){if(before){data=before;resetStorageBaseline()}status.textContent=e.message;return false}
 finally{settingsSaving=false;for(const el of document.querySelectorAll('#unifiedSettings input,#unifiedSettings select,#unifiedSettings .settings-save'))el.disabled=false}
}

function settingsRoutineChanged(key){const el=document.getElementById('energyBaselineSteps');if(el.value===''&&MyRhythmEnergy.ROUTINES[key])el.value=MyRhythmEnergy.ROUTINES[key].steps}

function settingsProfileHTML(){
 const p=data.energyBalance?.profile||{};
 return `<p>${trText('Настрой один раз. Вес берётся из Body Check-in.','Set up once. Weight comes from Body Check-in.')}</p><div class="energy-form-grid" id="energyMifflinFields">
 ${moduleInput('energyHeight',trText('Рост, см','Height, cm'),p.heightCm??'','number','min="100" max="250" step="any" inputmode="decimal"')}
 ${moduleInput('energyBirth',trText('Дата рождения','Date of birth'),p.birthDate||'','date',`max="${localDate()}"`)}${energySelect('energyVariant',trText('Пол для расчёта','Sex used for calculation'),[['',trText('Не выбран','Not selected')],['plus5',trText('Мужской','Male')],['minus161',trText('Женский','Female')]],p.variant||'')}
 ${energySelect('energyRoutine',trText('Обычная дневная активность','Usual daily activity'),[['',trText('Выбери обычную активность','Choose your usual activity')],...Object.entries(ENERGY_ROUTINE_LABELS).map(([k,v])=>[k,trText(...v)])],p.routine||'','onchange="settingsRoutineChanged(this.value)"')}
</div>`;
}
function settingsEnergyAdvancedHTML(){
 const p=data.energyBalance?.profile||{};
 return `<div class="energy-form-grid">${energySelect('energyMode',trText('Источник RMR','RMR source'),[['mifflin',trText('Формула Миффлина - Сан Жеора','Mifflin-St Jeor equation')],['manual',trText('Собственный известный RMR','My known RMR')]],p.mode||'mifflin','onchange="energyProfileMode()"')}
 <div id="energyManualFields">${moduleInput('energyManualRmr',trText('Собственный RMR, ккал/день','My RMR, kcal/day'),p.manualRmr??'','number','min="100" max="10000" step="any" inputmode="decimal"')}</div>
 </div><p>${trText('Обычный день включает покой, бытовую активность, обычные шаги и пищеварение. Дополнительно учитываются шаги сверх выбранной нормы. Изменение профиля пересчитывает историю.','Usual day includes rest, routine movement, habitual steps and digestion. Only steps above the allowance are added. Profile changes recalculate history.')}</p> ${moduleInput('energyBaselineSteps',trText('Обычные шаги, уже включённые в базу','Usual steps already included in base energy'),p.baselineIncludedSteps??'','number','min="0" max="100000" step="1" inputmode="numeric"')}
`;
}
function energyProfileMode(){const manual=document.getElementById('energyMode').value==='manual';document.getElementById('energyManualFields').hidden=!manual}
