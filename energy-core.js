// Local-only, deterministic calculations. No DOM, persistence, or network access.
(function(root){
 'use strict';
 const DAY=86400000;
 function dateNumber(key){
  if(typeof key!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(key))return null;
  const n=Date.parse(key+'T12:00:00Z');
  return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===key?n:null;
 }
 function addDays(key,n){const d=dateNumber(key);return d===null?null:new Date(d+n*DAY).toISOString().slice(0,10)}
 function dayDiff(a,b){const x=dateNumber(a),y=dateNumber(b);return x===null||y===null?null:(y-x)/DAY}
 function number(raw,min=0,max=Infinity){
  if(raw===null||raw===undefined||typeof raw==='boolean'||typeof raw==='object'||typeof raw==='string'&&!raw.trim())return null;
  const n=Number(raw);return Number.isFinite(n)&&n>=min&&n<=max?n:null;
 }
 function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value)??'null';
 }
 function weightAt(logs,date){
  if(dateNumber(date)===null)return null;
  const key=Object.keys(logs||{}).filter(k=>dateNumber(k)!==null&&k<=date&&number(logs[k]?.weight,Number.MIN_VALUE)!==null).sort().pop();
  return key?{date:key,value:number(logs[key].weight),ageDays:dayDiff(key,date),stale:dayDiff(key,date)>30}:null;
 }
 // Routine PAL includes habitual steps and average TEF; it is not a full-day
 // activity factor to which ALL steps can be added. These are starting assumptions.
 const ROUTINES={seated:{pal:1.2,steps:800,range:[1.15,1.35]},light:{pal:1.35,steps:2500,range:[1.25,1.5]},moving:{pal:1.55,steps:6000,range:[1.4,1.7]}};
 function ageAt(birthDate,date){
  if(dateNumber(birthDate)===null||dateNumber(date)===null||birthDate>date)return null;
  return Number(date.slice(0,4))-Number(birthDate.slice(0,4))-(date.slice(5)<birthDate.slice(5)?1:0);
 }
 function resting(profile,logs,date){
  const weight=weightAt(logs,date),age=ageAt(profile?.birthDate,date);
  if(profile?.mode==='manual')return {value:number(profile.manualRmr,100,10000),source:'manual',weight,age};
  const height=number(profile?.heightCm,100,250),variant=profile?.variant;
  const enough=profile?.mode==='mifflin'&&height!==null&&age!==null&&age>=18&&age<=120&&weight&&['plus5','minus161'].includes(variant);
  const value=enough?10*weight.value+6.25*height-5*age+(variant==='plus5'?5:-161):null;
  return {value:value>0?value:null,source:'mifflin',weight,age};
 }
 function walking(profile,logs,date,{excludedSteps=0,suppress=false,noExtraSteps=false}={}){
  const raw=number(logs?.[date]?.steps,0,200000),included=number(profile?.baselineIncludedSteps,0,100000);
  const weight=weightAt(logs,date),height=number(profile?.heightCm,100,250);
  const steps=raw!==null&&included!==null?Math.max(0,raw-included-excludedSteps):noExtraSteps&&raw===null?0:null;
  // ACSM horizontal net oxygen cost ~0.1 ml/kg/m * 5 kcal/l = 0.5 kcal/kg/km.
  // Step length 0.415 * height is a deliberately approximate engineering estimate.
  const km=steps!==null&&height!==null?steps*height*0.415/100000:null;
  const value=suppress?0:steps===0?0:km!==null&&weight?km*weight.value*0.5:null;
  const range=steps===0?[0,0]:steps!==null&&height!==null&&weight?[steps*height*0.35/100000*weight.value*0.35,steps*height*0.5/100000*weight.value*0.65]:null;
  return {value,steps,recorded:raw,included,excludedSteps,km,range,suppressed:suppress,belowBaseline:raw!==null&&included!==null&&raw<included};
 }
 const WORKOUT_TYPES=['walking','running','cycling','strength','swimming','other'];
 function validWorkout(w){
  return !!w&&typeof w==='object'&&!Array.isArray(w)&&typeof w.id==='string'&&w.id.length>0&&w.id.length<=150&&dateNumber(w.date)!==null
   &&WORKOUT_TYPES.includes(w.type)&&['watch','manual'].includes(w.source)&&w.scope==='workout'
   &&['active','total','unknown'].includes(w.energyType)&&['steps','watch'].includes(w.counting)&&['included','none','unknown'].includes(w.overlap)
   &&(w.kcal===null||typeof w.kcal==='number'&&number(w.kcal,0,20000)!==null)
   &&(w.minutes===null||typeof w.minutes==='number'&&number(w.minutes,Number.MIN_VALUE,1440)!==null)
   &&(w.steps===null||Number.isInteger(w.steps)&&number(w.steps,0,200000)!==null)
   &&(!['walking','running'].includes(w.type)||w.overlap!=='none')
   &&(w.counting!=='steps'||w.overlap==='included');
 }
 function exercise(workouts,date,rmr,recordedSteps){
  let value=0,excludedSteps=0,suppressWalking=false;
  const issues=[],rows=[],seen=new Set();
  for(const w of (workouts||[]).filter(w=>w.date===date)){
   if(!validWorkout(w)||seen.has(w.id)){issues.push('invalidWorkout');continue}seen.add(w.id);
   if(w.counting==='steps'){rows.push({id:w.id,value:0,source:'steps'});continue}
   let net=w.energyType==='active'?w.kcal:w.energyType==='total'&&w.minutes!==null&&rmr!==null&&w.kcal!==null?Math.max(0,w.kcal-rmr*w.minutes/1440):null;
   if(net===null){issues.push(w.energyType==='total'&&w.minutes===null?'totalNeedsDuration':'unknownWorkout');rows.push({id:w.id,value:null,source:w.energyType});continue}
   if(w.overlap==='unknown'||w.overlap==='included'&&(w.steps===null||recordedSteps===null)){
    suppressWalking=true;issues.push('unknownOverlap');
   }else if(w.overlap==='included')excludedSteps+=w.steps;
   value+=net;rows.push({id:w.id,value:net,source:w.energyType});
  }
  if(recordedSteps!==null&&excludedSteps>recordedSteps){suppressWalking=true;issues.push('inconsistentSteps')}
  return {value,excludedSteps,suppressWalking,issues:[...new Set(issues)],rows};
 }
 // Two independent 32-bit hashes are a compact change detector, not security.
 function fingerprint(value){let a=2166136261,b=2246822507;for(const ch of stable(value)){const n=ch.codePointAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,3266489909)}return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0')}
 function foodSignature(db,date){return fingerprint((db.nutrition?.entries||[]).filter(e=>e.date===date).slice().sort((a,b)=>a.id.localeCompare(b.id)))}
 function activitySignature(db,date){return fingerprint({steps:db.logs?.[date]?.steps??null,gym:db.logs?.[date]?.gym??null,noExtraSteps:db.energyBalance?.days?.[date]?.noExtraSteps===true,workouts:(db.energyBalance?.workouts||[]).filter(w=>w.date===date).slice().sort((a,b)=>a.id.localeCompare(b.id))})}
 function daily(db,date,calories){
  const module=db.energyBalance||{},p=module.profile||{},d=module.days?.[date]||{},r=resting(p,db.logs,date),routine=ROUTINES[p.routine];
  const base=r.value!==null&&routine&&number(p.baselineIncludedSteps,0,100000)!==null?r.value*routine.pal:null;
  const ex=exercise(module.workouts,date,r.value,number(db.logs?.[date]?.steps,0,200000));
  const walk=walking(p,db.logs,date,{excludedSteps:ex.excludedSteps,suppress:ex.suppressWalking,noExtraSteps:d.noExtraSteps===true});
  const issues=[...ex.issues];
  if(base===null)issues.push('missingProfile');
  if(walk.value===null)issues.push('missingWalking');
  if(r.weight?.stale&&(r.source==='mifflin'||walk.steps>0))issues.push('staleWeight');
  if(walk.belowBaseline)issues.push('belowBaseline');
  if(db.logs?.[date]?.gym===true&&!(module.workouts||[]).some(w=>w.date===date))issues.push('missingWorkout');
  const food=calories&&number(calories.value)!==null?{...calories,value:number(calories.value)}:{value:null,partial:false,qualities:[]};
  const foodConfirmed=!!d.foodSignature&&d.foodSignature===foodSignature(db,date);
  const activityConfirmed=!!d.activitySignature&&d.activitySignature===activitySignature(db,date);
  if(food.value===null)issues.push('missingFood');else if(food.partial)issues.push('partialFood');

  const insufficient=issues.some(i=>['missingProfile','missingWalking','missingFood','inconsistentSteps','invalidWorkout'].includes(i));
  const incompleteEnergy=issues.some(i=>['unknownWorkout','totalNeedsDuration','missingWorkout'].includes(i));
  const tdee=base!==null&&walk.value!==null?base+walk.value+ex.value:null;
  const balance=tdee!==null&&food.value!==null&&!food.partial&&!incompleteEnergy&&!insufficient?tdee-food.value:null;
  const blocking=issues.filter(i=>i!=='belowBaseline');
  const status=insufficient?'insufficient':'provisional';
  // Conditional model scenarios, NOT a statistical interval or device accuracy bound.
  const sensitivity=tdee!==null&&routine&&walk.range&&!ex.suppressWalking?[r.value*routine.range[0]+walk.range[0]+ex.value,r.value*routine.range[1]+walk.range[1]+ex.value]:null;
  return {date,resting:r,base,routineExtra:base===null?null:base-r.value,walking:walk,exercise:ex,tdee,sensitivity,food,balance,status,issues:[...new Set(issues)],foodConfirmed,activityConfirmed,incompleteEnergy};
 }
 function validateStore(store){
  if(!store||typeof store!=='object'||Array.isArray(store)||!store.profile||typeof store.profile!=='object'||Array.isArray(store.profile)||!Array.isArray(store.workouts)||!store.days||typeof store.days!=='object'||Array.isArray(store.days))throw Error('Invalid energy balance data.');
  const p=store.profile;
  for(const [key,min,max] of [['heightCm',100,250],['manualRmr',100,10000],['baselineIncludedSteps',0,100000]])if(p[key]!==undefined&&p[key]!==null&&(typeof p[key]!=='number'||number(p[key],min,max)===null))throw Error('Invalid energy profile.');
  if(p.mode!==undefined&&!['manual','mifflin'].includes(p.mode)||p.variant!==undefined&&p.variant!==null&&!['plus5','minus161'].includes(p.variant)||p.routine!==undefined&&p.routine!==null&&!Object.hasOwn(ROUTINES,p.routine)||p.birthDate!==undefined&&p.birthDate!==null&&dateNumber(p.birthDate)===null)throw Error('Invalid energy profile.');
  const ids=new Set();for(const w of store.workouts){if(!validWorkout(w)||ids.has(w.id))throw Error('Invalid energy workout.');ids.add(w.id)}
  for(const [date,d] of Object.entries(store.days)){
   if(dateNumber(date)===null||!d||typeof d!=='object'||Array.isArray(d))throw Error('Invalid energy day.');
   for(const key of ['foodSignature','activitySignature'])if(d[key]!==undefined&&d[key]!==null&&(typeof d[key]!=='string'||!/^[a-f0-9]{16}$/.test(d[key])))throw Error('Invalid energy confirmation.');
   if(d.noExtraSteps!==undefined&&typeof d.noExtraSteps!=='boolean')throw Error('Invalid energy walking confirmation.');
  }
  return store;
 }
 function period(db,start,end,getCalories){
  const length=dayDiff(start,end);
  if(length===null||length<0||length>3660)throw Error('Choose a range of 1 to 3661 days.');
  const days=Array.from({length:length+1},(_,i)=>daily(db,addDays(start,i),getCalories(addDays(start,i))));
  const used=days.filter(d=>d.balance!==null),sum=used.length?used.reduce((n,d)=>n+d.balance,0):null;
  const excluded={};for(const d of days.filter(d=>d.balance===null))for(const issue of d.issues)excluded[issue]=(excluded[issue]||0)+1;
  const measurements=Object.keys(db.logs||{}).filter(date=>dateNumber(date)!==null&&date>=addDays(start,-6)&&date<=end&&number(db.logs[date]?.weight,Number.MIN_VALUE)!==null).sort().map(date=>({date,value:number(db.logs[date].weight)}));
  const weights=measurements.filter(w=>w.date>=start).map(w=>{
   const window=measurements.filter(x=>x.date>=addDays(w.date,-6)&&x.date<=w.date);
   return {...w,smooth:window.length>=3?window.reduce((n,x)=>n+x.value,0)/window.length:null,count:window.length};
  });
  const smoothed=weights.filter(w=>w.smooth!==null),first=smoothed[0],last=smoothed.at(-1);
  let comparison=null;
  // Compare non-overlapping trailing windows; use the exact same dates for energy.
  // Weight measurement times are unknown: full days [first, last) are illustrative.
  if(first&&last&&dayDiff(first.date,last.date)>=7){
   const matched=days.filter(d=>d.date>=first.date&&d.date<last.date),qualified=matched.filter(d=>d.balance!==null);
   const energy=qualified.length?qualified.reduce((n,d)=>n+d.balance,0):null,actual=last.smooth-first.smooth;
   comparison={start:first.date,end:last.date,first,last,actual,used:qualified.length,total:matched.length,energy,equivalent:energy===null?null:-energy/7700,discrepancy:qualified.length===matched.length&&energy!==null?actual+energy/7700:null};
  }
  return {start,end,days,used:used.length,excludedDays:days.length-used.length,excluded,sum,equivalent:sum===null?null:-sum/7700,weights,comparison};
 }
 const api={dateNumber,addDays,dayDiff,number,stable,weightAt,ROUTINES,ageAt,resting,walking,WORKOUT_TYPES,validWorkout,exercise,fingerprint,foodSignature,activitySignature,daily,validateStore,period};
 root.MyRhythmEnergy=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
