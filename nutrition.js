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
let nutritionDate=null,nutritionEditId='',nutritionPendingImport=null,nutritionImportFingerprint='',nutritionHistoryOpen=false;
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
  const content=new Set(existing.map(nutritionSameFood));
  return entries.map(entry=>{
    const old=byId.get(entry.id);
    if(old)return {entry,action:nutritionSignature(old)===nutritionSignature(entry)?'skip':'conflict'};
    if(content.has(nutritionSameFood(entry)))return {entry,action:'duplicate'};
    content.add(nutritionSameFood(entry));return {entry,action:'add'};
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
function nutritionNutrientName(key){return NUTRIENTS[key][1]}
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
function nutritionOpen(date=todayDateKey()){
  nutritionDate=nutritionCheckDate(date);document.getElementById('nutritionModal').classList.add('show');document.body.style.overflow='hidden';nutritionRender();
}
function nutritionClose(){document.getElementById('nutritionModal').classList.remove('show');document.body.style.overflow='';nutritionCancelForm();nutritionCancelImport()}
function nutritionSetDate(date){try{nutritionDate=nutritionCheckDate(date);nutritionRender()}catch(e){nutritionMessage(e.message)}}
function nutritionShiftDate(days){nutritionSetDate(weeklyAddDays(nutritionDateKey(),days))}
function nutritionMessage(message){const el=document.getElementById('nutritionStatus');if(el)el.textContent=message}
function nutritionMealLabel(key){return nutritionLabel(...NUTRITION_MEAL_LABELS[key])}
function nutritionRender(){
  if(!document.getElementById('nutritionModal')?.classList.contains('show'))return;
  const date=nutritionDateKey(),total=nutritionAggregate(date),rows=nutritionRows(date),goal=nutritionStore().goals;
  const put=(id,s)=>{const el=document.getElementById(id);if(el)el.textContent=s};
  put('nutritionTitle',nutritionLabel('Питание','Nutrition'));
  put('nutritionSubtitle',nutritionLabel('Еда и нутриенты по дням','Food and nutrients by day'));
  const input=document.getElementById('nutritionDate');input.value=date;input.max=localDate();
  document.getElementById('nutritionNext').disabled=date>=localDate();
  put('nutritionBackLabel',nutritionLabel('Назад','Back'));
  put('nutritionTodayButton',nutritionLabel('Сегодня','Today'));
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
    const progress=nutritionMicronutrientProgress(stat,key,goal[key]);
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
  for(const key of ['calories','fat','carbs','fiber'])document.getElementById('nutritionGoal_'+key).value=goal[key]??'';
}
function nutritionSaveGoals(){
  const next={...nutritionStore().goals};
  for(const key of ['calories','fat','carbs','fiber']){
    const raw=document.getElementById('nutritionGoal_'+key).value.trim();
    if(raw===''){delete next[key];continue}
    const n=Number(raw);if(!Number.isFinite(n)||n<=0||n>1e6){nutritionMessage(nutritionLabel('Проверь цели: нужны положительные числа.','Goals must be positive numbers.'));return}
    next[key]=n;
  }
  nutritionStore().goals=next;persistData({renderAfter:true,makeSnapshot:true});nutritionRender();nutritionMessage(nutritionLabel('Цели сохранены.','Goals saved.'));
}
function nutritionInput(id,label,unit=''){return `<div class="field"><label for="${id}">${escapeHTML(label)}${unit?' ('+escapeHTML(unit)+')':''}</label><input id="${id}" type="number" min="0" step="any" inputmode="decimal"></div>`}
function nutritionAdvancedFields(){
  const advanced=document.getElementById('nutritionAdvancedFields');advanced.innerHTML='';
  for(const key of Object.keys(NUTRIENTS).filter(k=>!NUTRITION_MAIN.includes(k))){
    const name=NUTRIENTS[key][1],id='nutritionNutrient_'+key;
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
  nutritionEditId=id;nutritionAdvancedFields();
  const entry=id?nutritionStore().entries.find(e=>e.id===id):null;
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
  document.getElementById('nutritionDeleteFood').hidden=!entry;
  document.getElementById('nutritionForm').classList.add('show');document.getElementById('nutritionFoodName').focus();
}
function nutritionCancelForm(){document.getElementById('nutritionForm')?.classList.remove('show');nutritionEditId=''}
function nutritionSaveFood(){
  try{
    const previous=nutritionEditId?nutritionStore().entries.find(e=>e.id===nutritionEditId):null;
    const now=new Date().toISOString(),amount=document.getElementById('nutritionFoodAmount').value.trim();
    const nutrients={};
    const selectedSource=document.getElementById('nutritionFoodSource').value;
    const newQuality=selectedSource==='label'?'label':selectedSource==='chatgpt-estimate'?'estimated':'measured';
    for(const key of Object.keys(NUTRIENTS)){
      const raw=document.getElementById(NUTRITION_FIELD_IDS[key]||'nutritionNutrient_'+key).value.trim();
      if(raw==='')continue;
      const old=previous?.nutrients?.[key];
      nutrients[key]={value:Number(raw),unit:NUTRIENTS[key][0],quality:old&&selectedSource===previous.source&&Number(raw)===old.value?old.quality:newQuality,basis:NUTRITION_BASIS[key]?document.getElementById('nutritionBasis_'+key).value:'standard'};
    }
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
function nutritionCancelImport(){nutritionPendingImport=null;document.getElementById('nutritionImportPreview')?.classList.remove('show');const file=document.getElementById('nutritionFile');if(file)file.value=''}
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
  const rows=nutritionPendingImport;if(!rows)return;
  const box=document.getElementById('nutritionImportPreview');box.classList.add('show');
  const counts={add:0,conflict:0,duplicate:0,skip:0};rows.forEach(x=>counts[x.action]++);
  document.getElementById('nutritionPreviewCount').textContent=`${rows.length} ${nutritionLabel('продуктов','foods')} · ${new Set(rows.map(x=>x.entry.date)).size} ${nutritionLabel('дней','dates')} · ${counts.add} ${nutritionLabel('добавить','add')} · ${counts.conflict} ${nutritionLabel('конфликт','conflict')} · ${counts.duplicate+counts.skip} ${nutritionLabel('пропустить','skip')}`;
  document.getElementById('nutritionReplaceConflicts').checked=false;
  document.getElementById('nutritionReplaceWrap').hidden=!counts.conflict;
  const list=document.getElementById('nutritionPreviewList');list.replaceChildren();
  for(const row of rows){const div=document.createElement('div');div.className='nutrition-preview-row';div.textContent=`${row.entry.date} · ${nutritionMealLabel(row.entry.meal)} · ${row.entry.name} · ${row.action}`;list.append(div)}
}
function nutritionConfirmImport(){
  if(!nutritionPendingImport)return;
  try{
    nutritionAssert(JSON.stringify(nutritionStore().entries)===nutritionImportFingerprint,'Nutrition changed while preview was open. Select the file again.');
    const result=nutritionApplyImport(nutritionPendingImport,{replaceConflicts:document.getElementById('nutritionReplaceConflicts').checked});
    nutritionCancelImport();nutritionRender();nutritionMessage(`${result.added} ${nutritionLabel('добавлено','added')}, ${result.updated} ${nutritionLabel('обновлено','updated')}, ${result.skipped} ${nutritionLabel('пропущено','skipped')}.`);
  }catch(e){nutritionCancelImport();nutritionMessage(e.message)}
}

function nutritionEditLegacyProtein(){const date=nutritionDateKey();nutritionClose();openEntry('protein',date)}
