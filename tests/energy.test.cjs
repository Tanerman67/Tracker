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
const calories=(value=2000,partial=false)=>({value,partial,qualities:['estimated']});
function database(){return {logs:logs(),nutrition:{entries:[{id:'fictional-food',date:DAY,nutrients:{calories:{value:2000}}}]},energyBalance:{profile:{...profile},workouts:[],days:{}}}}
test('daily balance and history work immediately without any confirmation',()=>{
 const db=database(),d=E.daily(db,DAY,calories());assert.equal(d.status,'provisional');assert.equal(d.usable,true);assert.equal(d.balance,d.tdee-2000);
 assert.equal(E.daily(db,DAY,calories(3000)).balance,d.tdee-3000);assert.equal(E.daily(db,DAY,calories(0)).balance,d.tdee);
 assert.equal(d.base,d.resting.value*1.2);assert.equal(d.routineExtra,d.base-d.resting.value);
 assert.equal(E.period(db,DAY,DAY,()=>calories()).used,1);
});
test('food changes recalculate without re-confirming; no food never becomes zero',()=>{
 const db=database(),first=E.daily(db,DAY,calories());assert.equal(E.daily(db,DAY,calories(1900)).balance,first.balance+100);
 assert.equal(E.daily(db,DAY,calories(null)).balance,null);assert.equal(E.daily(db,DAY,calories(null)).status,'insufficient');
 const partial=E.daily(db,DAY,calories(1000,true));assert.equal(partial.balance,first.tdee-1000);assert.equal(partial.usable,false);assert.ok(partial.issues.includes('partialFood'));
});
test('missing steps and unknown workouts stay unknown while showing difference of known records',()=>{
 const db=database();delete db.logs[DAY].steps;let d=E.daily(db,DAY,calories());assert.equal(d.walking.value,null);assert.equal(d.tdee,d.base);assert.equal(d.balance,d.base-2000);assert.equal(d.usable,false);
 db.logs[DAY].steps=0;assert.equal(E.daily(db,DAY,calories()).usable,true);
 db.logs[DAY].gym=true;d=E.daily(db,DAY,calories());assert.ok(d.issues.includes('missingWorkout'));assert.equal(d.exercise.value,0);assert.equal(d.usable,false);assert.notEqual(d.balance,null);
});
test('step edits, session edits/deletions and legacy flags cannot freeze or gate automatic results',()=>{
 const db=database();db.energyBalance.days[DAY]={foodSignature:'0000000000000000',activitySignature:'1111111111111111'};
 const before=structuredClone(db),first=E.daily(db,DAY,calories());assert.equal(first.usable,true);assert.deepEqual(db,before);
 db.logs[DAY].steps=7800;assert.ok(E.daily(db,DAY,calories()).balance>first.balance);
 db.energyBalance.workouts=[workout()];const withWorkout=E.daily(db,DAY,calories()).balance;db.energyBalance.workouts[0].kcal=200;assert.equal(E.daily(db,DAY,calories()).balance,withWorkout-100);
 db.energyBalance.workouts=[];assert.equal(E.daily(db,DAY,calories()).exercise.value,0);
});
test('unknown watch type or overlap never enters sufficient-history totals or doubles walking',()=>{
 for(const w of [workout({energyType:'unknown'}),workout({energyType:'total',minutes:null}),workout({type:'running',overlap:'unknown'})]){
  const db=database();db.energyBalance.workouts=[w];const d=E.daily(db,DAY,calories());assert.equal(d.usable,false);assert.notEqual(d.balance,null);assert.equal(E.period(db,DAY,DAY,()=>calories()).sum,null);
  if(w.overlap==='unknown')assert.equal(d.walking.value,0);
 }
});
test('old energy backup flags, zero/null and extension fields survive validation and pure calculation',()=>{
 const db=database();db.energyBalance.profile.extension='keep';db.energyBalance.days[DAY]={noExtraSteps:true,foodSignature:null,activitySignature:'0000000000000000'};assert.equal(E.validateStore(db.energyBalance),db.energyBalance);
 const keep=structuredClone(db);E.daily(db,DAY,calories());assert.deepEqual(db,keep);
 for(const patch of [{workouts:[workout({scope:'daily'})]},{workouts:[workout(),workout()]},{profile:{heightCm:false}},{days:{bad:{}}},{days:{[DAY]:{foodSignature:'not-valid'}}}])assert.throws(()=>E.validateStore({...db.energyBalance,...patch}));
});
test('automatic period sums exclude incomplete dates and do not extrapolate gaps',()=>{
 const db=database(),p=E.period(db,'2024-02-28','2024-03-03',date=>date===DAY?calories():calories(null));
 assert.equal(p.used,1);assert.equal(p.excludedDays,4);assert.equal(p.sum,E.daily(db,DAY,calories()).balance);assert.equal(p.equivalent,-p.sum/7700);
 const empty=E.period(db,'2024-03-02','2024-03-03',()=>calories(null));assert.equal(empty.sum,null);assert.equal(empty.equivalent,null);
 assert.throws(()=>E.period(db,'2024-03-02','2024-03-01',()=>calories()));
});
test('sparse weights do not invent smooth values or a confident comparison',()=>{
 const db=database();db.logs={'2024-02-29':{weight:70},'2024-03-20':{weight:69},'2024-04-01':{weight:68}};
 const p=E.period(db,DAY,'2024-03-30',()=>calories(null));assert.equal(p.weights.length,1);assert.equal(p.weights[0].smooth,null);assert.equal(p.comparison,null);
});
test('automatic smoothed comparison matches dates and withholds discrepancy with missing inputs',()=>{
 const db=database();db.logs={};db.nutrition.entries=[];
 for(let i=0;i<20;i++){const date=E.addDays(DAY,i);db.logs[date]={weight:70-i*.02,steps:800};db.nutrition.entries.push({id:'fictional-food-'+i,date})}
 db.logs['2025-01-01']={weight:999};
 const p=E.period(db,DAY,E.addDays(DAY,19),()=>calories(1800));assert.equal(p.weights[0].smooth,null);assert.equal(p.weights[2].count,3);assert.equal(p.weights[2].smooth,(70+69.98+69.96)/3);assert.equal(p.comparison.total,17);assert.equal(p.comparison.used,17);assert.notEqual(p.comparison.discrepancy,null);
 assert.ok(p.weights.every(w=>w.value<100));delete db.logs[E.addDays(DAY,8)].steps;const gap=E.period(db,DAY,E.addDays(DAY,19),()=>calories(1800));assert.equal(gap.comparison.used,16);assert.equal(gap.comparison.discrepancy,null);
});
