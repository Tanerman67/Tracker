// Food diary. Entries are independent from legacy data.logs.protein.
const NUTRITION_IMPORT_FORMAT='my-rhythm-nutrition-import-v1';
const NUTRIENTS={
 calories:['kcal','Energy'],protein:['g','Protein'],fat:['g','Fat'],carbs:['g','Carbohydrates'],fiber:['g','Fiber'],sugars:['g','Sugars'],saturatedFat:['g','Saturated fat'],transFat:['g','Trans fat'],omega3:['g','Omega-3'],cholesterol:['mg','Cholesterol'],
 vitaminA:['µg','Vitamin A'],vitaminB1:['mg','Vitamin B1'],vitaminB2:['mg','Vitamin B2'],vitaminB3:['mg','Vitamin B3'],vitaminB5:['mg','Vitamin B5'],vitaminB6:['mg','Vitamin B6'],vitaminB7:['µg','Vitamin B7'],vitaminB9:['µg','Vitamin B9'],vitaminB12:['µg','Vitamin B12'],vitaminC:['mg','Vitamin C'],vitaminD:['µg','Vitamin D'],vitaminE:['mg','Vitamin E'],vitaminK:['µg','Vitamin K'],
 calcium:['mg','Calcium'],iron:['mg','Iron'],magnesium:['mg','Magnesium'],potassium:['mg','Potassium'],sodium:['mg','Sodium'],phosphorus:['mg','Phosphorus'],zinc:['mg','Zinc'],selenium:['µg','Selenium'],iodine:['µg','Iodine'],copper:['mg','Copper'],manganese:['mg','Manganese']
};
const NUTRITION_MAIN=['calories','protein','fat','carbs'];
const NUTRITION_EXTRA=['fiber','sugars','saturatedFat'];
const NUTRITION_MEALS=['breakfast','lunch','dinner','snack','other'];
const NUTRITION_QUALITIES=['measured','label','calculated','estimated','unknown'];
const NUTRITION_SOURCES=['manual','label','chatgpt-estimate','other'];
const NUTRITION_BASIS={vitaminA:['RAE','retinol','beta-carotene','unspecified'],vitaminB3:['NE','niacin','unspecified'],vitaminB9:['DFE','folate','folic-acid','unspecified'],vitaminE:['alpha-tocopherol','total','unspecified']};
const NUTRITION_MEAL_LABELS={breakfast:['Завтрак','Breakfast'],lunch:['Обед','Lunch'],dinner:['Ужин','Dinner'],snack:['Перекус','Snack'],other:['Другое','Other']};
const NUTRITION_FIELD_IDS={calories:'nutritionCalories',protein:'nutritionProtein',fat:'nutritionFat',carbs:'nutritionCarbs'};
let nutritionFormBase=null,nutritionFormQualities={},nutritionDate=null,nutritionEditId='',nutritionPendingImport=null,nutritionImportFingerprint='',nutritionHistoryOpen=false;
const NUTRITION_RING_CIRCUMFERENCE=2*Math.PI*43;
const nutritionRingOffsets=new Map();
function nutritionStore(){
  if(!data.nutrition||typeof data.nutrition!=='object'||Array.isArray(data.nutrition))data.nutrition={entries:[],goals:{}};
  if(!Array.isArray(data.nutrition.entries))data.nutrition.entries=[];
  if(!data.nutrition.goals||typeof data.nutrition.goals!=='object')data.nutrition.goals={};
  return data.nutrition;
}
function nutritionDateKey(){return nutritionDate||localDate()}
function nutritionDateValid(key){if(typeof key!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(key))return false;const d=new Date(key+'T12:00:00');return Number.isFinite(d.getTime())&&localDate(d)===key}
function nutritionAssert(condition,message){if(!condition)throw new Error(message)}
function nutritionObject(value){return !!value&&typeof value==='object'&&!Array.isArray(value)}
function nutritionText(value,label,limit,required=false){nutritionAssert(typeof value==='string'&&value.length<=limit&&(!required||value.trim()),`Invalid ${label}.`);return value.trim()}
function nutritionNumber(value,label,max=1e7){nutritionAssert(typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=max,`Invalid ${label}.`);return value}
function nutritionNormalizeNutrient(key,input){
  nutritionAssert(Object.prototype.hasOwnProperty.call(NUTRIENTS,key),`Unsupported nutrient: ${key}.`);
  const canonical=NUTRIENTS[key][0];
  nutritionAssert(nutritionObject(input),`Invalid ${key}.`);
  const quality=input.quality||'unknown';
  nutritionAssert(NUTRITION_QUALITIES.includes(quality),`Invalid ${key} quality.`);
  const basis=input.basis||((NUTRITION_BASIS[key]||[]).length?'unspecified':'standard');
  nutritionAssert((NUTRITION_BASIS[key]||['standard']).includes(basis),`Unsupported ${key} measurement basis.`);
  const unit=input.unit||canonical;
  nutritionAssert(['kcal','kJ','g','mg','µg','ug'].includes(unit),`Unsupported ${key} unit.`);
  let value=input.value;
  if(value===null){nutritionAssert(quality==='unknown',`Invalid ${key} unknown value.`);return {value:null,unit:canonical,quality,basis}}
  value=nutritionNumber(value,key);
  nutritionAssert(quality!=='unknown',`Missing ${key} quality.`);
  if(key==='calories')nutritionAssert(unit==='kcal'||unit==='kJ',`Invalid calories unit.`);
  else nutritionAssert(unit!=='kcal'&&unit!=='kJ',`Invalid ${key} unit.`);
  const toMicro={g:1e6,mg:1e3,'µg':1,ug:1};
  const converted=key==='calories'?(unit==='kJ'?value/4.184:value):value*toMicro[unit]/toMicro[canonical];
  nutritionAssert(Number.isFinite(converted)&&converted<=1e7,`Invalid ${key} value.`);
  return {value:converted,unit:canonical,quality,basis};
}
function nutritionNormalizeRecord(input){
  nutritionAssert(nutritionObject(input),'Food record must be an object.');
  const id=nutritionText(input.id,'food ID',100,true);
  nutritionAssert(/^[A-Za-z0-9][A-Za-z0-9_-]{1,99}$/.test(id),'Invalid food ID.');
  nutritionAssert(nutritionDateValid(input.date)&&input.date<=localDate(),'Invalid or future food date.');
  nutritionAssert(NUTRITION_MEALS.includes(input.meal),'Invalid meal.');
  const name=nutritionText(input.name,'food name',160,true);
  const notes=nutritionText(input.notes??'','food notes',2000);
  const source=input.source||'other';nutritionAssert(NUTRITION_SOURCES.includes(source),'Invalid food source.');
  let portion=null;
  if(input.portion!==undefined&&input.portion!==null){
    nutritionAssert(nutritionObject(input.portion),'Invalid portion.');
    nutritionAssert(['g','ml','piece','serving'].includes(input.portion.unit),'Invalid portion unit.');
    portion={amount:nutritionNumber(input.portion.amount,'portion',1e5),unit:input.portion.unit};
    nutritionAssert(portion.amount>0,'Portion must be greater than zero.');
  }
  nutritionAssert(nutritionObject(input.nutrients),'Invalid nutrient map.');
  const nutrients={};
  for(const [key,value] of Object.entries(input.nutrients))nutrients[key]=nutritionNormalizeNutrient(key,value);
  for(const key of ['createdAt','updatedAt'])if(input[key]!==undefined)nutritionAssert(typeof input[key]==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(input[key])&&Number.isFinite(Date.parse(input[key])),`Invalid ${key}.`);
  return {id,date:input.date,meal:input.meal,name,portion,nutrients,notes,source,createdAt:input.createdAt||new Date().toISOString(),updatedAt:input.updatedAt||input.createdAt||new Date().toISOString()};
}
function nutritionSignature(entry){const {id,date,meal,name,portion,nutrients,notes,source}=entry;return JSON.stringify({id,date,meal,name,portion,nutrients,notes,source})}
function nutritionSameFood(entry){const {date,meal,name,portion,nutrients,notes,source}=entry;return JSON.stringify({date,meal,name,portion,nutrients,notes,source})}
function nutritionValidateImport(payload){
  nutritionAssert(nutritionObject(payload)&&payload.format===NUTRITION_IMPORT_FORMAT,'Unsupported nutrition import format.');
  nutritionAssert(Array.isArray(payload.entries)&&payload.entries.length>0&&payload.entries.length<=500,'Expected 1-500 food entries.');
  const ids=new Set(),entries=payload.entries.map(item=>{
    const record=nutritionNormalizeRecord(item);
    nutritionAssert(!ids.has(record.id),'Duplicate ID within import file.');ids.add(record.id);
    return record;
  });
  return entries;
}
function nutritionPreview(entries,existing=nutritionStore().entries){
  const byId=new Map(existing.map(e=>[e.id,e]));
  return entries.map(entry=>{
    const old=byId.get(entry.id);
    if(old)return {entry,action:nutritionSignature(old)===nutritionSignature(entry)?'skip':'conflict'};
    return {entry,action:'add'};
  });
}
function nutritionApplyImport(preview,{replaceConflicts=false}={}){
  const store=nutritionStore(),current=nutritionPreview(preview.map(p=>p.entry),store.entries);
  nutritionAssert(JSON.stringify(current.map(p=>p.action))===JSON.stringify(preview.map(p=>p.action)),'Nutrition changed since preview. Review the import again.');
  const result={added:0,updated:0,skipped:0};
  const next=store.entries.slice();
  for(const row of current){
    if(row.action==='add'){next.push(row.entry);result.added++}
    else if(row.action==='conflict'&&replaceConflicts){const index=next.findIndex(e=>e.id===row.entry.id);next[index]={...next[index],...row.entry,createdAt:next[index].createdAt,updatedAt:new Date().toISOString()};result.updated++}
    else result.skipped++;
  }
  if(result.added||result.updated){store.entries=next;persistData({renderAfter:true,makeSnapshot:true})}
  return result;
}
function nutritionRows(date){return nutritionStore().entries.filter(x=>x.date===date)}
function nutritionAggregate(date){
  const rows=nutritionRows(date),out={};
  for(const key of Object.keys(NUTRIENTS)){
    const reported=rows.map(e=>e.nutrients?.[key]).filter(n=>n&&typeof n.value==='number'&&Number.isFinite(n.value));
    const bases=[...new Set(reported.map(n=>n.basis||'standard'))];
    out[key]={value:reported.length&&bases.length===1?reported.reduce((sum,n)=>sum+n.value,0):null,known:reported.length,total:rows.length,partial:reported.length<rows.length,mixedBasis:bases.length>1,basis:bases.length===1?bases[0]:null,unit:NUTRIENTS[key][0],qualities:[...new Set(reported.map(n=>n.quality))]};
  }
  return out;
}
function nutritionManualProtein(date){const raw=data.logs?.[date]?.protein;return raw!==undefined&&raw!==null&&raw!==''&&typeof raw!=='boolean'&&Number.isFinite(Number(raw))&&Number(raw)>=0?Number(raw):null}
function nutritionEffectiveProtein(date){
  const manual=nutritionManualProtein(date),rows=nutritionRows(date);
  const sum=nutritionAggregate(date).protein;
  if(rows.length&&sum.value!==null&&(!sum.partial||manual===null))return {value:sum.value,source:'foods',partial:sum.partial,manual};
  return {value:manual,source:manual===null?'missing':'manual',partial:false,manual};
}
function nutritionMetricValue(id,date){return id==='protein'?nutritionEffectiveProtein(date).value:data.logs?.[date]?.[id]}
function nutritionFormat(value,max=1){return new Intl.NumberFormat(data.language==='en'?'en-NZ':'ru-RU',{maximumFractionDigits:max}).format(value)}
function nutritionLabel(ru,en){return data.language==='en'?en:ru}
function nutritionNutrientName(key){return nutritionLabel(NUTRIENT_RU[key]||NUTRIENTS[key][1],NUTRIENTS[key][1])}
function nutritionDisplay(stat){if(stat.value===null)return stat.mixedBasis?nutritionLabel('разные основы','mixed bases'):'—';return (stat.partial?'≥ ':'')+nutritionFormat(stat.value,stat.unit==='kcal'?0:1)+' '+stat.unit}
function nutritionProgressState(stat,goal){
  const target=Number(goal);
  const hasGoal=goal!==null&&goal!==undefined&&goal!==''&&Number.isFinite(target)&&target>0;
  const consumed=typeof stat?.value==='number'&&Number.isFinite(stat.value)&&stat.value>=0?stat.value:null;
  const partial=consumed!==null&&!!stat.partial;
  const rawPercent=hasGoal&&consumed!==null?consumed/target*100:null;
  const percent=Number.isFinite(rawPercent)?rawPercent:null;
  return {consumed,goal:hasGoal?target:null,percent,arc:percent===null?0:Math.min(100,Math.max(0,percent)),partial,
    remaining:hasGoal&&consumed!==null&&!partial?Math.max(0,target-consumed):null,
    over:hasGoal&&consumed!==null&&consumed>target?consumed-target:null};
}
function nutritionRingSvg(state,{home=false,key=''}={}){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('nutrition-ring-svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');
  for(const kind of ['track','fill']){
    const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.classList.add('nutrition-ring-'+kind);
    circle.setAttribute('cx','50');circle.setAttribute('cy','50');circle.setAttribute('r','43');
    if(kind==='fill'){
      const end=NUTRITION_RING_CIRCUMFERENCE*(1-state.arc/100);
      circle.style.strokeDasharray=String(NUTRITION_RING_CIRCUMFERENCE);
      const before=nutritionRingOffsets.get(key);
      circle.style.strokeDashoffset=String(home||before===undefined?end:before);
      nutritionRingOffsets.set(key,end);
      if(!home&&before!==undefined&&before!==end)requestAnimationFrame(()=>requestAnimationFrame(()=>{circle.style.strokeDashoffset=String(end)}));
    }
    svg.append(circle);
  }
  return svg;
}
function nutritionRingCard(key,stat,goal,date){
  const state=nutritionProgressState(stat,goal),card=document.createElement('div');
  card.className='nutrition-total card';card.dataset.nutrient=key;
  if(key==='calories')card.classList.add('nutrition-calorie-card');
  if(key==='calories'&&state.over!==null)card.classList.add('nutrition-over-limit');
  if(state.partial)card.classList.add('nutrition-partial');
  const name=document.createElement('div');name.className='nutrition-ring-name';name.textContent=key==='calories'?nutritionLabel('Калории','Calories'):nutritionNutrientName(key);
  const display=document.createElement('div');display.className='nutrition-ring-graphic';
  display.append(nutritionRingSvg(state,{key:date+':'+key}));
  const center=document.createElement('div');center.className='nutrition-ring-center';
  const prominent=document.createElement('strong');prominent.textContent=state.percent!==null?(state.partial?'≥ ':'')+nutritionFormat(state.percent,1)+'%':state.consumed!==null?(state.partial?'≥ ':'')+nutritionFormat(state.consumed,stat.unit==='kcal'?0:1):'—';
  center.append(prominent);
  if(state.percent===null&&state.consumed!==null){const unit=document.createElement('small');unit.textContent=stat.unit;center.append(unit)}
  display.append(center);
  const amounts=document.createElement('div');amounts.className='nutrition-ring-amounts';
  amounts.textContent=(state.consumed===null?'—':nutritionDisplay(stat))+(state.goal===null?'':' / '+nutritionFormat(state.goal,0)+' '+stat.unit);
  const description=document.createElement('small');description.className='nutrition-ring-caption';
  if(key==='calories'&&state.goal!==null){
    description.textContent=state.consumed===null?nutritionLabel('Остаток неизвестен','Remaining unknown'):
      state.over!==null?(state.partial?nutritionLabel('Превышено минимум на ','Over by at least '):nutritionLabel('Превышено на ','Over by '))+nutritionFormat(state.over,0)+' kcal':
      state.partial?nutritionLabel('Остаток неизвестен - данные неполные','Remaining unknown - incomplete data'):
      nutritionLabel('Осталось ','Remaining ')+nutritionFormat(state.remaining,0)+' kcal';
  }else if(state.goal===null)description.textContent=nutritionLabel('Цель не задана','No goal set');
  else if(state.consumed===null)description.textContent=nutritionLabel('Нет данных','No data');
  else if(state.partial)description.textContent=nutritionLabel('Неполные данные','Incomplete data');
  card.append(name,display,amounts,description);
  return card;
}
function nutritionMicronutrientProgress(stat,key,target){
  if(!stat||stat.partial||stat.mixedBasis||stat.value===null)return null;
  if(NUTRITION_BASIS[key]){
    if(!nutritionObject(target)||target.basis!==stat.basis||target.unit!==stat.unit||target.basis==='unspecified')return null;
    target=target.value;
  }
  const progress=nutritionProgressState(stat,target);
  return progress.percent===null?null:progress;
}
function nutritionId(){return 'food_'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,11)).replace(/[^A-Za-z0-9_-]/g,'_')}
function nutritionCheckDate(date){nutritionAssert(nutritionDateValid(date)&&date<=localDate(),'Invalid or future date.');return date}
function nutritionOpen(date=nutritionDateKey()){
 nutritionDate=nutritionCheckDate(date);show('nutritionModal',document.getElementById('tabNutrition'));
}
function nutritionClose(){nutritionCancelForm();nutritionCancelImport();show(previousSection==='nutritionModal'?'today':previousSection)}
let nutritionOverlayContext=null;
function nutritionStartOverlay(id){
 if(!nutritionOverlayContext)nutritionOverlayContext={scroll:window.scrollY||0,overflow:document.body.style.overflow,focus:document.activeElement,date:nutritionDateKey()};
 document.body.style.overflow='hidden';const host=document.getElementById(id);host.classList.add('show');host.scrollTop=0;enhanceDateInputs(host);
}
function nutritionEndOverlay(id){
 const host=document.getElementById(id),wasOpen=host?.classList.contains('show');host?.classList.remove('show');
 if(!wasOpen||!nutritionOverlayContext)return;
 const context=nutritionOverlayContext;nutritionOverlayContext=null;document.body.style.overflow=context.overflow;
 window.scrollTo?.(0,context.date===nutritionDateKey()?context.scroll:0);context.focus?.focus?.({preventScroll:true});
}
function nutritionSetDate(date){try{nutritionDate=nutritionCheckDate(date);nutritionRender()}catch(e){nutritionMessage(e.message)}}
function nutritionShiftDate(days){nutritionSetDate(weeklyAddDays(nutritionDateKey(),days))}
function nutritionMessage(message){const el=document.getElementById('nutritionStatus');if(el)el.textContent=message}
function nutritionMealLabel(key){return nutritionLabel(...NUTRITION_MEAL_LABELS[key])}
function nutritionRender(){
  if(!document.getElementById('nutritionModal')?.classList.contains('active'))return;
  nutritionLocalize();
  nutritionRenderReuse();
  const date=nutritionDateKey(),total=nutritionAggregate(date),rows=nutritionRows(date),goal=nutritionStore().goals;
  if(typeof energyNutritionCompletion==='function')energyNutritionCompletion(date);
  const put=(id,s)=>{const el=document.getElementById(id);if(el)el.textContent=s};
  put('nutritionTitle',nutritionLabel('Питание','Nutrition'));
  put('nutritionSubtitle',nutritionLabel('Еда и нутриенты по дням','Food and nutrients by day'));
  const input=document.getElementById('nutritionDate');input.value=date;input.max=localDate();
  document.getElementById('nutritionNext').disabled=date>=localDate();
  put('nutritionBackLabel',nutritionLabel('Назад','Back'));
  put('nutritionTodayButton',nutritionLabel('Сегодня','Today'));
  document.getElementById('nutritionTodayButton').hidden=date===localDate();
  put('nutritionAddButton',nutritionLabel('+ Добавить еду','+ Add food'));
  put('nutritionImportButton',nutritionLabel('Импорт JSON','Import JSON'));
  put('nutritionCopyButton',nutritionLabel('Скопировать инструкцию для ChatGPT','Copy ChatGPT instructions'));
  put('nutritionMicrosLabel',nutritionLabel('Витамины и минералы','Vitamins & minerals'));
  put('nutritionHistoryLabel',nutritionLabel('История дней','Daily history'));
  put('nutritionIncomplete',rows.length?nutritionLabel('Указаны только известные значения. ≥ означает, что данные о части еды отсутствуют.','Only known amounts are shown. ≥ means some foods have missing data.'):nutritionLabel('На этот день пока нет записей.','No foods logged for this day.'));
  const summary=document.getElementById('nutritionSummary');summary.replaceChildren();
  const source=nutritionEffectiveProtein(date);
  for(const key of NUTRITION_MAIN){
    const stat=key==='protein'?{...total.protein,value:source.value,partial:source.partial}:total[key];
    const target=key==='protein'?data.proteinGoal:goal[key];
    summary.append(nutritionRingCard(key,stat,target,date));
  }
  put('nutritionProteinSource',source.source==='manual'?nutritionLabel('Белок: ручная запись сохранена отдельно.','Protein: separate manual entry is in use.'):source.source==='foods'?nutritionLabel('Белок: сумма продуктов'+(source.partial?' (частично)':''),'Protein: food total'+(source.partial?' (partial)':'')):nutritionLabel('Белок: нет данных','Protein: no data'));
  const diary=document.getElementById('nutritionDiary');diary.replaceChildren();
  for(const meal of NUTRITION_MEALS){
    const entries=rows.filter(e=>e.meal===meal);if(!entries.length)continue;
    const group=document.createElement('section');group.className='nutrition-meal';
    const head=document.createElement('h3');head.textContent=nutritionMealLabel(meal);group.append(head);
    for(const entry of entries){
      const card=document.createElement('button');card.type='button';card.className='nutrition-food card';
      const description=entry.portion?`${nutritionFormat(entry.portion.amount)} ${entry.portion.unit}`:'';
      const kc=entry.nutrients.calories;
      const calories=kc&&kc.value!==null?`${nutritionFormat(kc.value,0)} kcal`:nutritionLabel('ккал неизвестны','kcal unknown');
      card.textContent=`${entry.name} · ${description} · ${calories}`;
      const quality=Object.values(entry.nutrients).some(n=>n.quality==='estimated');
      const small=document.createElement('small');small.textContent=quality?nutritionLabel('Оценка · нажми для исправления','Estimate · tap to edit'):nutritionLabel('Нажми для исправления','Tap to edit');card.append(small);
      card.onclick=()=>nutritionOpenForm(entry.id);group.append(card);
    }
    diary.append(group);
  }
  const micro=document.getElementById('nutritionMicros');micro.replaceChildren();
  const list=[...NUTRITION_EXTRA,...Object.keys(NUTRIENTS).filter(k=>!NUTRITION_MAIN.includes(k)&&!NUTRITION_EXTRA.includes(k))];
  for(const key of list){const stat=total[key];if(!stat.known)continue;
    const item=document.createElement('div');item.className='nutrition-micro-row';
    const label=document.createElement('span');label.textContent=`${nutritionNutrientName(key)}: ${nutritionDisplay(stat)}${stat.qualities.includes('estimated')?' · '+nutritionLabel('оценка','estimate'):''}${stat.mixedBasis?' · '+nutritionLabel('нельзя суммировать','cannot sum'):''}`;item.append(label);
    const progress=key==='fiber'?null:nutritionMicronutrientProgress(stat,key,goal[key]);
    if(progress){const info=document.createElement('small');info.textContent=nutritionFormat(progress.percent,1)+'% · '+nutritionFormat(progress.consumed,1)+' / '+nutritionFormat(progress.goal,1)+' '+stat.unit;
      const track=document.createElement('div');track.className='nutrition-micro-track';const fill=document.createElement('span');fill.style.width=progress.arc+'%';track.append(fill);item.append(info,track)}
    micro.append(item)}
  if(!micro.childElementCount)micro.textContent=nutritionLabel('Пока нет данных о микронутриентах.','No micronutrient data yet.');
  const history=document.getElementById('nutritionHistory');history.replaceChildren();
  for(const day of [...new Set(nutritionStore().entries.map(e=>e.date))].sort().reverse().slice(0,45)){
    const button=document.createElement('button');button.type='button';button.className='secondary nutrition-history-day';
    const sum=nutritionAggregate(day).calories;button.textContent=`${day} · ${nutritionStore().entries.filter(e=>e.date===day).length} ${nutritionLabel('продуктов','foods')} · ${nutritionDisplay(sum)}`;
    button.onclick=()=>nutritionSetDate(day);history.append(button)
  }
  if(!history.childElementCount)history.textContent=nutritionLabel('История пуста.','No history yet.');
  for(const key of ['calories','fat','carbs'])document.getElementById('nutritionGoal_'+key).value=goal[key]??'';
  document.getElementById('nutritionGoal_protein').value=data.proteinGoal??'';
  document.getElementById('proteinGoalRuleSettings').innerHTML=goalRuleEditorHTML(['protein']);
  enhanceDateInputs();
}
function nutritionSaveGoals(){
 try{
  // Stage every value and rule before mutation. Retain hidden fibre and extension goals.
  const next={...nutritionStore().goals};
  for(const key of ['calories','fat','carbs']){
   const raw=document.getElementById('nutritionGoal_'+key).value.trim();
   if(raw===''){delete next[key];continue}
   const n=Number(raw);if(!Number.isFinite(n)||n<0||n>1e6)throw Error(nutritionLabel('Проверь цели: нужны числа от нуля.','Goals must be numbers of zero or more.'));next[key]=n;
  }
  const raw=document.getElementById('nutritionGoal_protein').value.trim(),protein=raw===''?(data.proteinGoal===undefined?undefined:null):Number(raw);
  if(protein!=null&&(!Number.isFinite(protein)||protein<0||protein>1e6))throw Error(nutritionLabel('Проверь цель белка.','Check the protein goal.'));
  const rule=editedGoalRule('protein',protein);
  nutritionStore().goals=next;data.proteinGoal=protein;
  const t=tracker('protein');if(t)t.goal=protein;
  data.goalRules.protein=rule;
  persistData({renderAfter:true,makeSnapshot:true});nutritionRender();nutritionMessage(nutritionLabel('Цели сохранены.','Goals saved.'));
 }catch(e){nutritionMessage(e.message)}
}
function nutritionInput(id,label,unit=''){return `<div class="field"><label for="${id}">${escapeHTML(label)}${unit?' ('+escapeHTML(unit)+')':''}</label><input id="${id}" type="number" min="0" step="any" inputmode="decimal"></div>`}
function nutritionAdvancedFields(){
  const advanced=document.getElementById('nutritionAdvancedFields');advanced.innerHTML='';
  for(const key of Object.keys(NUTRIENTS).filter(k=>!NUTRITION_MAIN.includes(k))){
    const name=nutritionNutrientName(key),id='nutritionNutrient_'+key;
    const wrap=document.createElement('div');wrap.className='field';
    const label=document.createElement('label');label.setAttribute('for',id);label.textContent=`${name} (${NUTRIENTS[key][0]})`;
    const input=document.createElement('input');input.type='number';input.min='0';input.step='any';input.inputMode='decimal';input.id=id;
    wrap.append(label,input);
    if(NUTRITION_BASIS[key]){
      const select=document.createElement('select');select.id='nutritionBasis_'+key;select.setAttribute('aria-label',name+' measurement basis');
      for(const basis of NUTRITION_BASIS[key]){const option=document.createElement('option');option.value=basis;option.textContent=basis;select.append(option)}wrap.append(select)
    }
    advanced.append(wrap);
  }
}
function nutritionOpenForm(id=''){
  nutritionEditId=id;nutritionFormQualities={};nutritionAdvancedFields();nutritionLocalize();
  const entry=id?nutritionStore().entries.find(e=>e.id===id):null;
  nutritionFormBase=entry?structuredClone(entry):null;
  if(id&&!entry){nutritionMessage('Food record not found.');return}
  document.getElementById('nutritionFormTitle').textContent=entry?nutritionLabel('Изменить запись','Edit food'):nutritionLabel('Добавить еду','Add food');
  document.getElementById('nutritionFoodDate').value=entry?.date||nutritionDateKey();document.getElementById('nutritionFoodDate').max=localDate();
  document.getElementById('nutritionFoodMeal').value=entry?.meal||'breakfast';
  document.getElementById('nutritionFoodName').value=entry?.name||'';
  document.getElementById('nutritionFoodAmount').value=entry?.portion?.amount??'';
  document.getElementById('nutritionFoodUnit').value=entry?.portion?.unit||'g';
  document.getElementById('nutritionFoodNotes').value=entry?.notes||'';
  document.getElementById('nutritionFoodSource').value=entry?.source||'manual';
  for(const key of Object.keys(NUTRIENTS)){
    const input=document.getElementById(NUTRITION_FIELD_IDS[key]||'nutritionNutrient_'+key);input.value=entry?.nutrients?.[key]?.value??'';
    if(NUTRITION_BASIS[key])document.getElementById('nutritionBasis_'+key).value=entry?.nutrients?.[key]?.basis||'unspecified';
  }
  document.getElementById('nutritionFoodQuality').value=entry?Object.values(entry.nutrients).find(n=>n.quality!=='unknown')?.quality||'estimated':'estimated';
  document.getElementById('nutritionFavorite').hidden=!entry;
  document.getElementById('nutritionDeleteFood').hidden=!entry;
  nutritionStartOverlay('nutritionForm');document.getElementById('nutritionFormError').textContent='';document.getElementById('nutritionFoodName').focus({preventScroll:true});
}
function nutritionCancelForm(){nutritionEndOverlay('nutritionForm');nutritionEditId=''}
function nutritionSaveFood(){
  try{
    const previous=nutritionEditId?nutritionStore().entries.find(e=>e.id===nutritionEditId):null;
    const reference=previous||nutritionFormBase;
    const now=new Date().toISOString(),amount=document.getElementById('nutritionFoodAmount').value.trim();
    const nutrients={};
    const selectedSource=document.getElementById('nutritionFoodSource').value;
    const newQuality=document.getElementById('nutritionFoodQuality').value||'estimated';
    for(const key of Object.keys(NUTRIENTS)){
      const raw=document.getElementById(NUTRITION_FIELD_IDS[key]||'nutritionNutrient_'+key).value.trim();
      if(raw==='')continue;
      const old=reference?.nutrients?.[key];
      nutrients[key]={value:Number(raw),unit:NUTRIENTS[key][0],quality:nutritionFormQualities[key]|| (old&&selectedSource===reference.source&&Number(raw)===old.value?old.quality:newQuality),basis:NUTRITION_BASIS[key]?document.getElementById('nutritionBasis_'+key).value:'standard'};
    }
    for(const [key,value] of Object.entries(reference?.nutrients||{}))if(value.value===null&&!nutrients[key])nutrients[key]=structuredClone(value);
    const entry=nutritionNormalizeRecord({id:previous?.id||nutritionId(),date:document.getElementById('nutritionFoodDate').value,meal:document.getElementById('nutritionFoodMeal').value,name:document.getElementById('nutritionFoodName').value,portion:amount===''?null:{amount:Number(amount),unit:document.getElementById('nutritionFoodUnit').value},nutrients,notes:document.getElementById('nutritionFoodNotes').value,source:selectedSource,createdAt:previous?.createdAt||now,updatedAt:now});
    const store=nutritionStore(),index=store.entries.findIndex(e=>e.id===entry.id);
    if(index<0)store.entries.push(entry);else store.entries[index]={...store.entries[index],...entry};
    nutritionDate=entry.date;nutritionCancelForm();persistData({renderAfter:true,makeSnapshot:true});nutritionRender();nutritionMessage(nutritionLabel('Еда сохранена.','Food saved.'));
  }catch(e){document.getElementById('nutritionFormError').textContent=e.message}
}
function nutritionDeleteFood(){
  const id=nutritionEditId;if(!id)return;
  if(!confirm(nutritionLabel('Удалить эту запись?','Delete this food entry?')))return;
  nutritionStore().entries=nutritionStore().entries.filter(e=>e.id!==id);nutritionCancelForm();persistData({renderAfter:true,makeSnapshot:true});nutritionRender();nutritionMessage(nutritionLabel('Запись удалена.','Food deleted.'));
}
const NUTRITION_CHATGPT_INSTRUCTIONS=`Create a JSON file for My Rhythm nutrition import. Use format "my-rhythm-nutrition-import-v1" and an entries array. Each food needs a stable unique id (reuse it in later corrected files), local date YYYY-MM-DD, meal (breakfast/lunch/dinner/snack/other), name, optional portion {amount,unit}, source (manual/label/chatgpt-estimate/other), and nutrients. Nutrients are objects such as protein:{value:12,unit:"g",quality:"estimated"}. Use numbers, not strings. Missing values stay omitted or {value:null,quality:"unknown"}; never invent zero. Allowed quality: measured, label, calculated, estimated, unknown. Units: kcal or kJ for calories; g, mg or µg for other nutrients. Supported names: ${Object.keys(NUTRIENTS).join(', ')}. For vitaminA, vitaminB3, vitaminB9 and vitaminE include basis (e.g. RAE, NE, DFE, alpha-tocopherol); do not convert between bases or from IU without reliable information. Separate foods when possible, preserve uncertainty in notes. Output only valid JSON, using fictional IDs until real entries are described.`;
async function nutritionCopyInstructions(){
  try{await navigator.clipboard.writeText(NUTRITION_CHATGPT_INSTRUCTIONS);nutritionMessage(nutritionLabel('Инструкция скопирована.','Instructions copied.'))}
  catch(e){const host=document.getElementById('nutritionInstructions');host.hidden=false;host.textContent=NUTRITION_CHATGPT_INSTRUCTIONS;nutritionMessage(nutritionLabel('Скопируй текст ниже вручную.','Copy the text below manually.'))}
}
function nutritionCancelImport(){nutritionPendingImport=null;nutritionEndOverlay('nutritionImportPreview');const file=document.getElementById('nutritionFile');if(file)file.value=''}
async function nutritionReadImport(event){
  const file=event.target.files?.[0];if(!file)return;
  try{
    nutritionAssert(file.size<=1024*1024,'JSON file is too large (1 MB limit).');
    const payload=JSON.parse(await file.text()),entries=nutritionValidateImport(payload),preview=nutritionPreview(entries);
    nutritionPendingImport=preview;nutritionImportFingerprint=JSON.stringify(nutritionStore().entries);
    nutritionRenderImportPreview();
  }catch(e){nutritionCancelImport();nutritionMessage(e.message)}
}
function nutritionRenderImportPreview(){
  const rows=nutritionPendingImport;if(!rows)return;nutritionLocalize();
  nutritionStartOverlay('nutritionImportPreview');document.querySelector('#nutritionImportPreview button')?.focus({preventScroll:true});
  const counts={add:0,conflict:0,duplicate:0,skip:0};rows.forEach(x=>counts[x.action]++);
  document.getElementById('nutritionPreviewCount').textContent=`${rows.length} ${nutritionLabel('продуктов','foods')} · ${new Set(rows.map(x=>x.entry.date)).size} ${nutritionLabel('дней','dates')} · ${counts.add} ${nutritionLabel('добавить','add')} · ${counts.conflict} ${nutritionLabel('конфликт','conflict')} · ${counts.duplicate+counts.skip} ${nutritionLabel('пропустить','skip')}`;
  document.getElementById('nutritionReplaceConflicts').checked=false;
  document.getElementById('nutritionReplaceWrap').hidden=!counts.conflict;
  const list=document.getElementById('nutritionPreviewList');list.replaceChildren();
  for(const row of rows){const div=document.createElement('div');div.className='nutrition-preview-row';div.textContent=`${row.entry.date} · ${nutritionMealLabel(row.entry.meal)} · ${row.entry.name} · ${nutritionLabel(...({add:['добавить','add'],conflict:['конфликт','conflict'],duplicate:['повтор','duplicate'],skip:['пропустить','skip']}[row.action]))}`;list.append(div)}
}
function nutritionConfirmImport(){
  if(!nutritionPendingImport)return;
  try{
    nutritionAssert(JSON.stringify(nutritionStore().entries)===nutritionImportFingerprint,'Nutrition changed while preview was open. Select the file again.');
    const result=nutritionApplyImport(nutritionPendingImport,{replaceConflicts:document.getElementById('nutritionReplaceConflicts').checked});
    nutritionCancelImport();nutritionRender();nutritionMessage(`${result.added} ${nutritionLabel('добавлено','added')}, ${result.updated} ${nutritionLabel('обновлено','updated')}, ${result.skipped} ${nutritionLabel('пропущено','skipped')}.`);
  }catch(e){nutritionCancelImport();nutritionMessage(e.message)}
}

function nutritionEditLegacyProtein(){const date=nutritionDateKey();openEntry('protein',date)}
const NUTRIENT_RU={calories:'Калории',protein:'Белок',fat:'Жиры',carbs:'Углеводы',fiber:'Клетчатка',sugars:'Сахара',saturatedFat:'Насыщенные жиры',transFat:'Трансжиры',omega3:'Омега-3',cholesterol:'Холестерин',calcium:'Кальций',iron:'Железо',magnesium:'Магний',potassium:'Калий',sodium:'Натрий',phosphorus:'Фосфор',zinc:'Цинк',selenium:'Селен',iodine:'Йод',copper:'Медь',manganese:'Марганец',...Object.fromEntries(['A','B1','B2','B3','B5','B6','B7','B9','B12','C','D','E','K'].map(v=>['vitamin'+v,'Витамин '+v]))};
function nutritionScaledEntry(entry,amount){
 nutritionAssert(entry.portion&&entry.portion.amount>0,'A known original portion is required.');
 nutritionAssert(typeof amount==='number'&&Number.isFinite(amount)&&amount>0&&amount<=1e5,'Invalid portion.');
 const copy=structuredClone(entry),ratio=amount/entry.portion.amount;copy.portion.amount=amount;
 for(const n of Object.values(copy.nutrients)){if(n.value!==null){n.value*=ratio;if(n.quality!=='estimated')n.quality='calculated'}}return copy;
}
function nutritionScaleForm(){try{
 nutritionAssert(nutritionFormBase?.portion,'Save a known portion first, or reuse an existing food.');
 nutritionAssert(document.getElementById('nutritionFoodUnit').value===nutritionFormBase.portion.unit,'Keep the same portion unit for recalculation.');
 const copy=nutritionScaledEntry(nutritionFormBase,Number(document.getElementById('nutritionFoodAmount').value));
 for(const [key,n] of Object.entries(copy.nutrients)){if(n.value!==null){document.getElementById(NUTRITION_FIELD_IDS[key]||'nutritionNutrient_'+key).value=Number(n.value.toFixed(6));nutritionFormQualities[key]=n.quality}}
 document.getElementById('nutritionFormError').textContent=nutritionLabel('Порция пересчитана. Проверь и сохрани.','Portion recalculated. Review and save.');
 }catch(e){document.getElementById('nutritionFormError').textContent=e.message}}
function nutritionReuseRecord(id){
 const entry=nutritionStore().entries.find(e=>e.id===id)||(nutritionStore().favorites||[]).find(e=>e.id===id);if(!entry)return;
 nutritionOpenForm();nutritionFormBase=structuredClone(entry);
 document.getElementById('nutritionFoodDate').value=nutritionDateKey();
 for(const [field,value] of Object.entries({nutritionFoodMeal:entry.meal,nutritionFoodName:entry.name,nutritionFoodAmount:entry.portion?.amount??'',nutritionFoodUnit:entry.portion?.unit||'g',nutritionFoodSource:entry.source,nutritionFoodNotes:entry.notes}))document.getElementById(field).value=value;
 for(const [key,n] of Object.entries(entry.nutrients)){document.getElementById(NUTRITION_FIELD_IDS[key]||'nutritionNutrient_'+key).value=n.value??'';nutritionFormQualities[key]=n.quality;if(NUTRITION_BASIS[key])document.getElementById('nutritionBasis_'+key).value=n.basis||'unspecified'}
}
function nutritionToggleFavorite(){
 const e=nutritionStore().entries.find(e=>e.id===nutritionEditId);if(!e)return;
 const favorites=nutritionStore().favorites||[];nutritionStore().favorites=favorites.some(f=>f.id===e.id)?favorites.filter(f=>f.id!==e.id):[...favorites,structuredClone(e)];persistData({renderAfter:false});nutritionRenderReuse();document.getElementById('nutritionFormError').textContent=nutritionLabel('Избранное обновлено.','Favourites updated.');
}
function nutritionRenderReuse(){
 const host=document.getElementById('nutritionReuse');if(!host)return;host.replaceChildren();
 const rows=nutritionStore().entries,counts=new Map();for(const e of rows)counts.set(e.name,(counts.get(e.name)||0)+1);
 const frequent=[...new Map(rows.slice().reverse().map(e=>[e.name,e])).values()].sort((a,b)=>counts.get(b.name)-counts.get(a.name)).slice(0,8);
 const favorites=nutritionStore().favorites||[];
 for(const e of [...favorites,...frequent.filter(e=>!favorites.some(f=>f.id===e.id))]){const b=document.createElement('button');b.className='secondary';b.textContent=(favorites.some(f=>f.id===e.id)?'★ ':'')+e.name;b.onclick=()=>nutritionReuseRecord(e.id);host.append(b)}
 if(!host.childElementCount)host.textContent=nutritionLabel('Сохранённые продукты появятся здесь.','Saved foods will appear here.');
}
function nutritionCopyDay(){
 try{const from=document.getElementById('nutritionCopyDate').value,to=nutritionDateKey();nutritionAssert(validDay(from)&&from<=localDate()&&from!==to,'Choose a different valid source day.');const rows=nutritionRows(from);nutritionAssert(rows.length>0,'No food records on that day.');nutritionAssert(confirm(nutritionLabel(`Добавить ${rows.length} записей за ${from} на ${to}?`,`Add ${rows.length} entries from ${from} to ${to}?`)),'');
 const entries=rows.map(e=>nutritionNormalizeRecord({...e,id:nutritionId(),date:to,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));nutritionStore().entries.push(...entries);persistData({renderAfter:true});nutritionRender();
 }catch(e){nutritionMessage(e.message)}}
function localizeExplicit(root=document){root.querySelectorAll('[data-i18n-ru]').forEach(el=>el.textContent=data.language==='en'?el.dataset.i18nEn:el.dataset.i18nRu)}
function nutritionLocalize(){
 localizeExplicit();
 const labels={nutritionFoodDate:['Дата','Date'],nutritionFoodMeal:['Приём пищи','Meal'],nutritionFoodName:['Продукт','Food'],nutritionFoodAmount:['Количество','Amount'],nutritionFoodUnit:['Единица','Unit'],nutritionFoodNotes:['Примечание','Notes'],nutritionFoodSource:['Источник','Source']};
 for(const [id,pair] of Object.entries(labels)){const label=document.querySelector(`label[for="${id}"]`);if(label)label.textContent=nutritionLabel(...pair)}
 for(const key of NUTRITION_MAIN){const label=document.querySelector(`label[for="${NUTRITION_FIELD_IDS[key]}"]`);if(label)label.textContent=nutritionNutrientName(key)+' ('+NUTRIENTS[key][0]+')'}
 const sourceNames={manual:['Вручную','Manual'],label:['Этикетка','Label'],'chatgpt-estimate':['Оценка ChatGPT','ChatGPT estimate'],other:['Другое','Other']};
 for(const option of document.getElementById('nutritionFoodSource').options||[])option.textContent=nutritionLabel(...sourceNames[option.value]);
 for(const option of document.getElementById('nutritionFoodMeal').options||[])option.textContent=nutritionMealLabel(option.value);
 const qualities={estimated:['Оценка','Estimated'],measured:['Измерено','Measured'],label:['Этикетка','Label'],calculated:['Расчёт','Calculated']};
 for(const option of document.getElementById('nutritionFoodQuality').options||[])option.textContent=nutritionLabel(...qualities[option.value]);
}
// Keep keyboard focus inside the active nested editor; the date picker has its own trap.
document.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||datePickerState)return;
 const host=document.querySelector('.nutrition-form.show');if(!host)return;
 const nodes=[...host.querySelectorAll('button,input,select,textarea,summary,[tabindex]')].filter(n=>!n.disabled&&n.tabIndex>=0&&n.getClientRects().length),first=nodes[0],last=nodes[nodes.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
});
