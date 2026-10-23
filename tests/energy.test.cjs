const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../energy-core.js');
test('energy dates reject invalid days and cross leap/DST/year boundaries',()=>{
 assert.equal(E.dateNumber('2023-02-29'),null);assert.equal(E.dateNumber('2024-02-30'),null);
 assert.equal(E.addDays('2024-02-28',1),'2024-02-29');assert.equal(E.addDays('2024-12-31',1),'2025-01-01');
 assert.equal(E.dayDiff('2024-09-28','2024-09-30'),2);
 for(const tz of ['Pacific/Auckland','UTC','America/New_York']){const old=process.env.TZ;process.env.TZ=tz;assert.equal(E.addDays('2024-09-29',1),'2024-09-30');process.env.TZ=old}
});
test('unknown energy values are not zero and explicit zero survives',()=>{
 for(const x of [null,undefined,'',false,true,NaN,Infinity,{},'  '])assert.equal(E.number(x),null);
 assert.equal(E.number(0),0);assert.equal(E.number('0'),0);
});
test('weight uses only valid positive historical log values and identifies stale records',()=>{
 const logs={'2024-02-01':{weight:72},'2024-02-29':{weight:73},'2024-03-02':{weight:0},'2024-03-03':{weight:false},'2024-02-30':{weight:999},'2025-01-01':{weight:90}};
 assert.equal(E.weightAt(logs,'2024-01-01'),null);assert.equal(E.weightAt(logs,'2024-03-03').value,73);
 assert.equal(E.weightAt(logs,'2024-04-01').stale,true);assert.equal(E.weightAt(logs,'2024-03-01').stale,false);
 logs['2024-02-29'].weight=74;assert.equal(E.weightAt(logs,'2024-03-01').value,74);delete logs['2024-02-29'];assert.equal(E.weightAt(logs,'2024-03-01').value,72);
});
test('confirmation serialization is stable across object key order',()=>assert.equal(E.stable({b:2,a:1}),E.stable({a:1,b:2})));
const DAY='2024-03-01',profile={mode:'mifflin',heightCm:170,birthDate:'1990-03-01',variant:'plus5',routine:'seated',baselineIncludedSteps:800};
const logs=()=>({'2024-02-29':{weight:70},[DAY]:{steps:6800}});
test('RMR requires explicit formula parameters; manual RMR is an explicit alternative',()=>{
 const l=logs();assert.equal(E.resting(profile,l,DAY).value,1597.5);
 for(const key of ['mode','heightCm','birthDate','variant']){const p={...profile};delete p[key];assert.equal(E.resting(p,l,DAY).value,null,key)}
 assert.equal(E.resting({...profile,variant:'minus161'},l,DAY).value,1431.5);
 assert.equal(E.resting(profile,{},DAY).value,null);assert.equal(E.resting({mode:'manual',manualRmr:1600},{},DAY).value,1600);
 assert.equal(E.resting({mode:'manual',manualRmr:''},l,DAY).value,null);
 l['2024-02-29'].weight=71;assert.equal(E.resting(profile,l,DAY).value,1607.5);
});
test('age follows the selected historical date including leap birthdays',()=>{
 assert.equal(E.ageAt('1990-03-01','2024-02-29'),33);assert.equal(E.ageAt('1990-03-01',DAY),34);
 assert.equal(E.ageAt('2000-02-29','2023-02-28'),22);assert.equal(E.ageAt('2000-02-29','2023-03-01'),23);
 assert.equal(E.ageAt('2000-02-29','1999-01-01'),null);
});
test('only steps above 500/800/1000 habitual steps produce net walking energy',()=>{
 for(const baseline of [500,800,1000]){const p={...profile,baselineIncludedSteps:baseline},l=logs();l[DAY].steps=baseline+6000;
 const w=E.walking(p,l,DAY);assert.equal(w.steps,6000);assert.ok(Math.abs(w.value-148.155)<0.0001);assert.ok(w.range[0]<w.value&&w.range[1]>w.value);
 l[DAY].steps=baseline-100;assert.equal(E.walking(p,l,DAY).value,0);
 l[DAY].steps=0;assert.equal(E.walking(p,l,DAY).value,0);delete l[DAY].steps;assert.equal(E.walking(p,l,DAY).value,null);
 }
});
test('walking never silently replaces missing inputs and can explicitly confirm no extra walking',()=>{
 assert.equal(E.walking({...profile,heightCm:null},logs(),DAY).value,null);
 assert.equal(E.walking(profile,{[DAY]:{steps:6800}},DAY).value,null);
 assert.equal(E.walking(profile,{},DAY,{noExtraSteps:true}).value,0);
 assert.equal(E.walking(profile,logs(),DAY,{excludedSteps:6000}).value,0);
});
