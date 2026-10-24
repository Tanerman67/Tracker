// Unified editor; persisted fields retain their existing owners and schema.
let settingsSnapshot='',settingsSaving=false;
function settingsValues(){const host=document.getElementById('unifiedSettings');return host?JSON.stringify([...host.querySelectorAll('input,select')].map(e=>[e.id,e.value])):''}
function settingsDirty(){return !!settingsSnapshot&&settingsSnapshot!==settingsValues()}
function settingsMayLeave(){if(settingsSaving)return false;if(!settingsDirty())return true;if(!confirm(trText('Отменить несохранённые изменения?','Discard unsaved changes?')))return false;settingsSnapshot='';renderUnifiedSettings();return true}
addEventListener('beforeunload',e=>{if(settingsDirty()){e.preventDefault();e.returnValue=''}});
function openUnifiedSettings(group='settingsProfile'){show('settings');document.getElementById(group)?.scrollIntoView({block:'start'});document.getElementById(group)?.focus()}
function renderUnifiedSettings(){
 if(settingsDirty()||settingsSaving)return;
 const profile=document.getElementById('settingsProfile');if(!profile)return;
 profile.innerHTML='<h3 tabindex="-1">'+trText('Личные параметры','Personal parameters')+'</h3>'+energyProfileHTML();
 const advanced=document.getElementById('settingsEnergyAdvanced');advanced.replaceChildren();
 const details=profile.querySelector('details');advanced.append(...details.children);advanced.querySelector('summary')?.remove();details.remove();
 advanced.append(document.getElementById('energyBaselineSteps').closest('.field'));
 document.getElementById('energyMifflinFields').hidden=false;
 // Choosing a routine must not silently change an existing step allowance.
 document.getElementById('energyRoutine').removeAttribute('onchange');
 const weight=bodyLatest('weight');const note=document.createElement('p');note.textContent=trText('Вес: ','Weight: ')+(weight?bodyFormatNumber(weight.value)+' '+bodyMetricUnit('weight'):trText('Нет данных. Добавь замер в Body.','No data. Add a Body check-in.'));profile.append(note);
 const button=document.createElement('button');button.className='ghost';button.textContent=trText('Открыть Body Check-in','Open Body Check-in');button.onclick=()=>{if(settingsMayLeave())openBodyCheckin()};profile.append(button);energyProfileMode();
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??''};
 for(const id of ['stepsGoal','sleepGoal','outdoorsGoal','gymGoal','smokeDate'])set(id,data[id]);set('alcoholDate',alcoholTrackingStart());
 for(const id of ['smokeDate','alcoholDate'])document.getElementById(id).max=localDate();
 document.getElementById('alcoholDerivedDate').textContent=trText('Текущая серия: ','Current streak: ')+(alcoholCurrentStreakStart()||'—');
 for(const key of ['calories','fat','carbs'])set('nutritionGoal_'+key,data.nutrition.goals[key]);set('nutritionGoal_protein',data.proteinGoal);
 document.getElementById('goalRuleSettings').innerHTML=goalRuleEditorHTML(['steps','sleep','outdoors','gym']);document.getElementById('proteinGoalRuleSettings').innerHTML=goalRuleEditorHTML(['protein']);
 for(const el of document.querySelectorAll('#unifiedSettings input,#unifiedSettings select')){const error=document.createElement('small');error.id=el.id+'Error';error.className='settings-field-error';error.setAttribute('role','alert');el.setAttribute('aria-describedby',error.id);el.after(error)}
 settingsSnapshot=settingsValues();
}
function settingsInvalid(id,message){const el=document.getElementById(id);el?.setAttribute('aria-invalid','true');const error=document.getElementById(id+'Error');if(error)error.textContent=message;el?.focus();throw Error(message)}
function settingsCandidate(){
 const next=structuredClone(data),gv=id=>document.getElementById(id).value.trim();
 const number=(id,min=0,max=1e6)=>{const raw=gv(id);if(raw==='')return null;const n=Number(raw);if(!Number.isFinite(n)||n<min||n>max)settingsInvalid(id,trText('Проверь значение.','Check the value.'));return n};
 // Unchanged blank fields retain absent/null/zero distinctions and extensions.
 const assign=(obj,key,value,id)=>{const before=JSON.parse(settingsSnapshot||'[]').find(x=>x[0]===id)?.[1];if(before!==gv(id))obj[key]=value};
 for(const id of ['smokeDate','alcoholDate','energyBirth']){const v=gv(id);if(v&&(!validDay(v)||v>localDate()))settingsInvalid(id,trText('Проверь дату.','Check the date.'))}
 assign(next,'smokeDate',gv('smokeDate'),'smokeDate');assign(next,'alcoholTrackingStart',gv('alcoholDate'),'alcoholDate');
 const profile={...next.energyBalance?.profile};
 for(const [key,id,min,max] of [['heightCm','energyHeight',100,250],['manualRmr','energyManualRmr',100,10000],['baselineIncludedSteps','energyBaselineSteps',0,100000]]){const v=number(id,min,max);if(key==='baselineIncludedSteps'&&v!==null&&!Number.isInteger(v))settingsInvalid(id,trText('Нужно целое число.','Use a whole number.'));assign(profile,key,v,id)}
 for(const [key,id] of [['mode','energyMode'],['birthDate','energyBirth'],['variant','energyVariant'],['routine','energyRoutine']])assign(profile,key,gv(id)||null,id);
 MyRhythmEnergy.validateStore({profile,workouts:[],days:{}});
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
