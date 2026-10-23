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
 const api={dateNumber,addDays,dayDiff,number,stable,weightAt,ROUTINES,ageAt,resting,walking,WORKOUT_TYPES,validWorkout,exercise};
 root.MyRhythmEnergy=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
