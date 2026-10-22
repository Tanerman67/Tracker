// Descriptive statistics over recorded days; missing values never become zero.
function analyticsPeriod(keys,id){
 const rows=keys.map(date=>{
  if(id==='calories'){const s=nutritionAggregate(date).calories;return {date,value:s.value,partial:s.partial}}
  if(id==='protein'){const s=nutritionEffectiveProtein(date);return {date,value:s.value,partial:s.partial}}
  return {date,value:trendValueForDay(id,date),partial:false};
 }).filter(r=>r.value!==null&&r.value!==undefined);
 const sum=rows.reduce((s,r)=>s+r.value,0);
 return {count:rows.length,average:rows.length?sum/rows.length:null,partial:rows.filter(r=>r.partial).length};
}
function renderDataCoverage(){
 const host=document.getElementById('dataCoverage');if(!host)return;
 const all=[...Object.keys(data.logs),...data.nutrition.entries.map(e=>e.date),...data.englishActivity.entries.map(e=>e.date)].filter(k=>validDay(k)&&k<=localDate()).sort();
 const count=trendRangeDays==='all'?(all.length?weeklyDiffDays(all[0],localDate())+1:1):Number(trendRangeDays)||7;
 const start=weeklyAddDays(localDate(),1-count),keys=weeklyKeys(start,count),previous=weeklyKeys(weeklyAddDays(start,-count),count);
 const headings=[trText('Показатель','Metric'),trText('Среднее','Average'),trText('Дни','Days'),trText('К прошлому периоду','Previous period')];
 const rows=[['calories',trText('Калории','Calories'),'kcal'],['protein',trText('Белок','Protein'),'g'],['steps',trText('Шаги','Steps'),''],['sleep',trText('Сон','Sleep'),trText('ч','h')]].map(([id,label,unit])=>{
 const now=analyticsPeriod(keys,id),prev=analyticsPeriod(previous,id);const change=now.average===null||prev.average===null?'—':(now.average-prev.average>0?'+':'')+todayNumber(now.average-prev.average)+' '+unit;
 return `<tr><th scope="row">${label}</th><td>${now.average===null?'—':(now.partial?'≥ ':'')+todayNumber(now.average)+' '+unit}</td><td>${now.count}/${count}</td><td>${now.partial||prev.partial?trText('неполные данные','partial data'):change}</td></tr>`;
 });
 host.innerHTML=`<h3>${trText('Записи за выбранный период','Recorded data for this period')}</h3><div class="coverage-scroll"><table><thead><tr>${headings.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div><p class="small">${trText('Средние рассчитаны только по дням с данными. ≥ - нижняя граница при неполных записях. Белок: полный дневник питания имеет приоритет; при неполном дневнике используется отдельная ручная запись, если она есть.','Averages use recorded days only. ≥ is a lower bound for incomplete entries. Protein uses the complete food diary; a separate manual entry takes priority when the diary is incomplete.')}</p>`;
}
