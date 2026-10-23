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
 const api={dateNumber,addDays,dayDiff,number,stable,weightAt};
 root.MyRhythmEnergy=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
