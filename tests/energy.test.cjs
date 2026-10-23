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
