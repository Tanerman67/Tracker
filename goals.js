// Pure schema and goal helpers shared by storage, cards and history.
function validDay(key){
 if(typeof key!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(key))return false;
 const d=new Date(key+'T12:00:00');return Number.isFinite(d.getTime())&&localDate(d)===key;
}
function defaultDashboardBlocks(){return ['nutrition','energy','steps','sleep','weight','gym','outdoors','smoke','alcohol'].map(id=>({id,size:id==='nutrition'?'expanded':'compact'}))}
function legacyGoalRules(d){
 const out={weight:{type:'observe'},gym:{type:'weekly',target:d.gymGoal??3},english_general:{type:'weekly',target:d.englishGoal??240},calories:{type:'max',target:d.nutrition?.goals?.calories??null}};
 for(const [id,key] of Object.entries({protein:'proteinGoal',steps:'stepsGoal',outdoors:'outdoorsGoal',sleep:'sleepGoal'}))out[id]={type:'min',target:d[key]??defaults[key]};
 return out;
}
function goalRule(id){
 const rule=data.goalRules?.[id]||{type:tracker(id)?.type==='boolean'?'boolean':'min',target:goalFor(id)};
 const target=id==='calories'?data.nutrition?.goals?.calories:goalFor(id);
 return {...rule,target:id==='protein'?data.proteinGoal:rule.type==='range'?rule.target:target??rule.target};
}
function goalState(value,rule){
 const known=typeof value==='number'&&Number.isFinite(value)||typeof value==='boolean';
 if(!known)return {status:'missing',percent:null,remaining:null,over:null};
 const type=rule?.type||'observe',target=rule?.target;
 if(type==='observe')return {status:'logged',percent:null};
 if(type==='boolean')return {status:value===true?'met':'progress',percent:value===true?100:0};
 if(typeof target!=='number'||!Number.isFinite(target)||target<=0)return {status:'logged',percent:null};
 const n=Number(value),percent=n/target*100;
 if(type==='max')return {status:n>target?'over':'within',percent,remaining:Math.max(0,target-n),over:Math.max(0,n-target)};
 if(type==='range')return {status:n<target?'progress':n>rule.upper?'over':'met',percent:null,remaining:Math.max(0,target-n)};
 return {status:n>=target?'met':'progress',percent,remaining:Math.max(0,target-n)};
}
function validateV7Data(obj){
 if(Number(obj.schemaVersion)>CURRENT_SCHEMA_VERSION)throw Error('This backup needs a newer app version.');
 // Reject dangerous map keys before any dynamic assignment. Keep other unknown fields.
 function safe(value,depth=0){if(depth>40)throw Error('Data is too deeply nested.');if(!value||typeof value!=='object')return;for(const [k,v] of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k)||(k==='id'&&['__proto__','constructor','prototype'].includes(v)))throw Error('Unsafe data key or ID.');safe(v,depth+1)}}
 safe(obj);
 if(obj.dashboard!==undefined){if(!isDataObject(obj.dashboard)||!Array.isArray(obj.dashboard.blocks)||obj.dashboard.blocks.length>100||obj.dashboard.blocks.some(b=>!isDataObject(b)||typeof b.id!=='string'||!['compact','expanded'].includes(b.size))||new Set(obj.dashboard.blocks.map(b=>b.id)).size!==obj.dashboard.blocks.length)throw Error('Invalid dashboard.');}
 if(obj.cycle!==undefined){if(!isDataObject(obj.cycle)||typeof obj.cycle.enabled!=='boolean'||!Array.isArray(obj.cycle.periods))throw Error('Invalid cycle data.');const ids=new Set();for(const p of obj.cycle.periods){if(!isDataObject(p)||typeof p.id!=='string'||ids.has(p.id)||!validDay(p.start)||p.start>localDate()||p.end!==null&&p.end!==''&&(!validDay(p.end)||p.end<p.start||p.end>localDate())||typeof p.notes!=='string'||p.notes.length>2000||typeof p.symptoms!=='string'||p.symptoms.length>500)throw Error('Invalid period.');ids.add(p.id)}}
 if(obj.englishActivity!==undefined){if(!isDataObject(obj.englishActivity)||!Array.isArray(obj.englishActivity.entries))throw Error('Invalid English activity.');const ids=new Set();for(const e of obj.englishActivity.entries){if(!isDataObject(e)||typeof e.id!=='string'||ids.has(e.id)||!validDay(e.date)||e.date>localDate()||!Number.isFinite(e.minutes)||e.minutes<0||e.minutes>1440||typeof e.type!=='string'||e.type.length>80)throw Error('Invalid study entry.');ids.add(e.id)}}
 if(obj.goalRules!==undefined){if(!isDataObject(obj.goalRules))throw Error('Invalid goal rules.');for(const g of Object.values(obj.goalRules)){if(!isDataObject(g)||!['min','max','range','boolean','weekly','observe'].includes(g.type)||g.target!==undefined&&g.target!==null&&(!Number.isFinite(g.target)||g.target<0)||g.type==='range'&&(!Number.isFinite(g.upper)||g.upper<g.target))throw Error('Invalid goal rule.')}}
}
function goalRuleEditorHTML(ids){
 return ids.map(id=>{const rule=goalRule(id);return `<div class="field"><label for="goalMode_${id}">${escapeHTML(trTrackerName(tracker(id)))}</label><select id="goalMode_${id}">${(!['min','max','range','observe'].includes(rule.type)?`<option value="${escapeHTML(rule.type)}" selected>${escapeHTML(rule.type)}</option>`:'')+[['min','Минимум','Minimum'],['max','Лимит','Limit'],['range','Диапазон','Range'],['observe','Наблюдение','Observe']].map(([type,ru,en])=>`<option value="${type}" ${rule.type===type?'selected':''}>${trText(ru,en)}</option>`).join('')}</select><label for="goalUpper_${id}">${trText('Верх диапазона (для режима «Диапазон»)','Upper value (Range mode)')}</label><input id="goalUpper_${id}" type="number" min="0" step="any" value="${rule.upper??''}"></div>`}).join('');
}
function renderGoalRuleSettings(){const host=document.getElementById('goalRuleSettings');if(host)host.innerHTML=goalRuleEditorHTML(['steps','sleep','outdoors'])}
function editedGoalRule(id,target){
 const old=data.goalRules?.[id]||{type:'min'},mode=document.getElementById('goalMode_'+id);if(!mode)return {...old,target};
 const type=mode.value;if(type===old.type&&!['min','max','range','observe'].includes(type))return {...old,target};
 const raw=document.getElementById('goalUpper_'+id).value.trim(),upper=raw===''?null:Number(raw);
 if(!['min','max','range','observe'].includes(type)||type==='range'&&(upper===null||!Number.isFinite(upper)||upper<0||target!=null&&upper<target))throw Error(trText('Проверь границы диапазона.','Check the range limits.'));
 return {...old,type,target,...(type==='range'?{upper}:{})};
}

