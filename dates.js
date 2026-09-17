// Local calendar helpers. Elapsed days use calendar dates, not 24-hour periods.
function localDate(d=new Date()){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function daysSince(s){
 if(!s)return 0;const a=new Date(s+'T00:00:00'),b=new Date();
 return Math.max(0,Math.floor((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000))
}

function weeklyParseDate(dateKey){
  const [y,m,d]=String(dateKey).split('-').map(Number);
  return new Date(y,m-1,d,12);
}
function weeklyAddDays(dateKey,days){
  const d=weeklyParseDate(dateKey);
  d.setDate(d.getDate()+days);
  return localDate(d);
}
function weeklyDiffDays(a,b){
  const A=weeklyParseDate(a),B=weeklyParseDate(b);
  return (Date.UTC(B.getFullYear(),B.getMonth(),B.getDate())-Date.UTC(A.getFullYear(),A.getMonth(),A.getDate()))/86400000;
}
function weeklyMonday(dateKey=localDate()){
  const d=weeklyParseDate(dateKey);
  const offset=(d.getDay()+6)%7;
  d.setDate(d.getDate()-offset);
  return localDate(d);
}
function weeklyKeys(start,count){
  const out=[];
  for(let i=0;i<count;i++)out.push(weeklyAddDays(start,i));
  return out;
}
