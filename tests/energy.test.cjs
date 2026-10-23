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
function workout(extra={}){return {id:'fictional-session',date:DAY,type:'cycling',source:'watch',scope:'workout',energyType:'active',counting:'watch',overlap:'none',kcal:300,minutes:60,steps:null,...extra}}
test('watch active calories are net; total calories remove rest and require duration',()=>{
 assert.equal(E.exercise([workout()],DAY,1440,6800).value,300);
 assert.equal(E.exercise([workout({energyType:'total'})],DAY,1440,6800).value,240);
 for(const w of [workout({energyType:'total',minutes:null}),workout({energyType:'unknown'}),workout({kcal:null})]){const x=E.exercise([w],DAY,1440,6800);assert.equal(x.value,0);assert.ok(x.issues.length)}
 assert.equal(E.exercise([workout({energyType:'total',kcal:10})],DAY,1440,6800).value,0);
});
test('walking/running watch sessions exclude their known steps; step mode never adds watch kcal',()=>{
 for(const type of ['walking','running']){const w=workout({type,overlap:'included',steps:4000}),x=E.exercise([w],DAY,1600,6800);
 assert.equal(x.value,300);assert.equal(x.excludedSteps,4000);assert.equal(E.walking(profile,logs(),DAY,{excludedSteps:x.excludedSteps}).steps,2000);
 const bySteps=E.exercise([{...w,counting:'steps'}],DAY,1600,6800);assert.equal(bySteps.value,0);assert.equal(bySteps.excludedSteps,0);
 }
});
test('unknown overlap suppresses all extra walking and never blindly adds both estimates',()=>{
 const x=E.exercise([workout({type:'running',overlap:'included',steps:null})],DAY,1600,6800);
 assert.equal(x.suppressWalking,true);assert.ok(x.issues.includes('unknownOverlap'));assert.equal(E.walking(profile,logs(),DAY,{suppress:x.suppressWalking}).value,0);
 assert.ok(E.exercise([workout({overlap:'included',steps:9000})],DAY,1600,6800).issues.includes('inconsistentSteps'));
});
test('cycling/strength/swimming are additional only with explicit no-step-overlap choice',()=>{
 for(const type of ['cycling','strength','swimming']){const x=E.exercise([workout({type})],DAY,1600,6800);assert.deepEqual(x.issues,[]);assert.equal(x.excludedSteps,0);assert.equal(x.value,300)}
});
test('workout IDs prevent duplicate counting; edits/removal recalculate; daily watch totals rejected',()=>{
 const a=workout(),b=workout({id:'fictional-second',kcal:150});assert.equal(E.exercise([a,b],DAY,1600,6800).value,450);
 assert.equal(E.exercise([a,{...a}],DAY,1600,6800).value,300);assert.ok(E.exercise([a,{...a}],DAY,1600,6800).issues.includes('invalidWorkout'));
 assert.equal(E.exercise([{...a,kcal:200}],DAY,1600,6800).value,200);assert.equal(E.exercise([],DAY,1600,6800).value,0);
 assert.equal(E.validWorkout(workout({scope:'daily'})),false);assert.equal(E.validWorkout(workout({type:'running',overlap:'none'})),false);
 for(const extra of [{kcal:-1},{minutes:0},{kcal:''},{steps:1.5}])assert.equal(E.validWorkout(workout(extra)),false);
});
