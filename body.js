// Body measurements and charts. Storage contracts remain in storage.js.
let bodySelectedMetric='weight';
let bodyRangeDays='all';
let bodySelectedPoint=null;
let bodyEditingDate='';

const BODY_METRICS=[
  {id:'weight',icon:'⚖️',ru:'Вес',en:'Weight',unitRu:'кг',unitEn:'kg'},
  {id:'chest',icon:'◯',ru:'Грудь',en:'Chest',unitRu:'см',unitEn:'cm'},
  {id:'waist',icon:'⌁',ru:'Талия',en:'Waist',unitRu:'см',unitEn:'cm'},
  {id:'abdomen',icon:'◌',ru:'Живот',en:'Abdomen',unitRu:'см',unitEn:'cm'},
  {id:'hips',icon:'◒',ru:'Бёдра',en:'Hips',unitRu:'см',unitEn:'cm'},
  {id:'thigh',icon:'◐',ru:'Бедро',en:'Thigh',unitRu:'см',unitEn:'cm'}
];

function bodyMetricDef(id){return BODY_METRICS.find(x=>x.id===id)||BODY_METRICS[0]}
function bodyMetricName(id){const m=bodyMetricDef(id);return (data.language||'ru')==='en'?m.en:m.ru}
function bodyMetricUnit(id){const m=bodyMetricDef(id);return (data.language||'ru')==='en'?m.unitEn:m.unitRu}

function bodyStore(){
  if(!data.bodyMeasurements||typeof data.bodyMeasurements!=='object')data.bodyMeasurements={};
  return data.bodyMeasurements;
}

function bodyEntries(metricId){
  const out=[];
  if(metricId==='weight'){
    for(const date of Object.keys(data.logs||{}).sort()){
      const v=Number(data.logs?.[date]?.weight);
      if(Number.isFinite(v)&&v>0)out.push({date,value:v});
    }
  }else{
    for(const date of Object.keys(bodyStore()).sort()){
      const v=Number(bodyStore()?.[date]?.[metricId]);
      if(Number.isFinite(v)&&v>0)out.push({date,value:v});
    }
  }
  return out;
}

function bodyLatest(metricId){
  const rows=bodyEntries(metricId);
  return rows.length?rows[rows.length-1]:null;
}
function bodyPrevious(metricId){
  const rows=bodyEntries(metricId);
  return rows.length>1?rows[rows.length-2]:null;
}
function bodyFirst(metricId){
  const rows=bodyEntries(metricId);
  return rows.length?rows[0]:null;
}
function bodyFormatNumber(v){
  if(v===null||v===undefined||v==='')return '—';
  const n=Number(v);
  if(!Number.isFinite(n))return '—';
  return Number.isInteger(n)?String(n):String(Math.round(n*10)/10);
}
function bodyFormatDelta(v,unit=''){
  if(v===null||v===undefined)return '—';
  if(v===0)return `0${unit?' '+unit:''}`;
  return `${v>0?'+':'−'}${bodyFormatNumber(Math.abs(v))}${unit?' '+unit:''}`;
}
function bodyFriendlyDate(dateKey,short=false){
  if(!dateKey)return '—';
  const d=new Date(dateKey+'T12:00:00');
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return d.toLocaleDateString(locale,short?{day:'numeric',month:'short'}:{day:'numeric',month:'short',year:'numeric'});
}
function bodyLatestCheckinDate(){
  const dates=Object.keys(bodyStore()).filter(d=>{
    const row=bodyStore()[d];
    return row&&typeof row==='object'&&Object.values(row).some(v=>Number(v)>0);
  }).sort();
  return dates.length?dates[dates.length-1]:'';
}
function bodyFieldCount(dateKey){
  const row=bodyStore()?.[dateKey]||{};
  return ['chest','waist','abdomen','hips','thigh'].filter(k=>Number(row[k])>0).length;
}

function openBody(){
  show('bodyModal');
  renderBody();
}

function closeBody(){
  show('progress');
}
function setBodyMetric(id){
  bodySelectedMetric=id;
  bodySelectedPoint=null;
  renderBody();
}
function setBodyRange(range){
  if(![7,30,90,365,'all'].includes(range))range='all';
  bodyRangeDays=range;
  bodySelectedPoint=null;
  renderBody();
}

function openBodyCheckin(dateKey=''){
  bodyEditingDate=dateKey||'';
  const date=dateKey||localDate();
  document.getElementById('bodyDateInput').value=date;

  const row=bodyStore()?.[date]||{};
  const log=data.logs?.[date]||{};

  document.getElementById('bodyWeightInput').value=log.weight??'';
  document.getElementById('bodyChestInput').value=row.chest??'';
  document.getElementById('bodyWaistInput').value=row.waist??'';
  document.getElementById('bodyAbdomenInput').value=row.abdomen??'';
  document.getElementById('bodyHipsInput').value=row.hips??'';
  document.getElementById('bodyThighInput').value=row.thigh??'';

  const exists=!!dateKey && (
    Object.keys(row).length>0 ||
    (log.weight!==undefined&&log.weight!==null&&log.weight!=='')
  );

  const del=document.getElementById('bodyDeleteBtn');
  if(del)del.style.display=exists?'block':'none';

  translateBodyCheckin();
  document.getElementById('bodyCheckinModal')?.classList.add('show');
}
function closeBodyCheckin(){
  document.getElementById('bodyCheckinModal')?.classList.remove('show');
  bodyEditingDate='';
}

function numberOrNull(id){
  const raw=document.getElementById(id)?.value?.trim();
  if(raw===''||raw===undefined)return null;
  const n=Number(raw);
  return Number.isFinite(n)&&n>0?n:null;
}

function saveBodyCheckin(){
  const date=document.getElementById('bodyDateInput')?.value;
  if(!date)return alert(trText('Выбери дату.','Choose a date.'));
  if(date>localDate())return alert(trText('Нельзя записать будущую дату.','Future dates cannot be logged.'));

  const fields=['bodyWeightInput','bodyChestInput','bodyWaistInput','bodyAbdomenInput','bodyHipsInput','bodyThighInput'];
  if(fields.some(id=>{const raw=document.getElementById(id)?.value?.trim();return raw&&numberOrNull(id)===null})){
    return alert(trText('Замеры должны быть положительными числами.','Measurements must be positive numbers.'));
  }
  const vals={
    weight:numberOrNull('bodyWeightInput'),
    chest:numberOrNull('bodyChestInput'),
    waist:numberOrNull('bodyWaistInput'),
    abdomen:numberOrNull('bodyAbdomenInput'),
    hips:numberOrNull('bodyHipsInput'),
    thigh:numberOrNull('bodyThighInput')
  };

  if(!data.logs[date])data.logs[date]={};
  if(vals.weight!==null)data.logs[date].weight=vals.weight;
  else delete data.logs[date].weight;
  if(Object.keys(data.logs[date]).length===0)delete data.logs[date];

  const row={...(bodyStore()[date]||{})};
  for(const key of ['chest','waist','abdomen','hips','thigh']){
    if(vals[key]!==null)row[key]=vals[key];
    else delete row[key];
  }
  if(Object.keys(row).length)bodyStore()[date]=row;
  else delete bodyStore()[date];

  persistData({renderAfter:true,makeSnapshot:true});
  closeBodyCheckin();
  renderBody();
}

function deleteBodyCheckin(){
  const date=bodyEditingDate||document.getElementById('bodyDateInput')?.value;
  if(!date)return;
  const ok=confirm(trText(`Удалить Body Check-in за ${bodyFriendlyDate(date)}?`,`Delete Body Check-in for ${bodyFriendlyDate(date)}?`));
  if(!ok)return;

  if(data.bodyMeasurements)delete data.bodyMeasurements[date];
  if(data.logs?.[date]){
    delete data.logs[date].weight;
    if(Object.keys(data.logs[date]).length===0)delete data.logs[date];
  }

  persistData({renderAfter:true,makeSnapshot:true});
  closeBodyCheckin();
  renderBody();
}

function translateBodyCheckin(){
  const set=(id,ru,en)=>{const el=document.getElementById(id);if(el)el.textContent=trText(ru,en)};
  set('bodyCheckinTitle','Body Check-in','Body Check-in');
  set('bodyDateLabel','Дата','Date');
  set('bodyWeightInputLabel','⚖️ Вес, кг','⚖️ Weight, kg');
  set('bodyChestInputLabel','Грудь, см','Chest, cm');
  set('bodyWaistInputLabel','Талия, см','Waist, cm');
  set('bodyAbdomenInputLabel','Живот, см','Abdomen, cm');
  set('bodyHipsInputLabel','Бёдра, см','Hips, cm');
  set('bodyThighInputLabel','Бедро, см','Thigh, cm');
  set('bodyCheckinNote','Можно заполнить только те показатели, которые измерил сегодня.','Fill only the measurements you took today.');
  set('bodySaveBtn','Сохранить замер','Save check-in');
  set('bodyDeleteBtn','Удалить замер','Delete check-in');
}


function bodyMetricRawSeries(metricId){
  const today=localDate();
  let start;

  if(bodyRangeDays==='all'){
    const rows=bodyEntries(metricId);
    if(!rows.length)return [];
    start=rows[0].date;
  }else{
    start=trendAddDays(today,-(Number(bodyRangeDays)-1));
  }

  const out=[];
  let index=0;
  for(let d=start;;d=trendAddDays(d,1)){
    let value=null;
    if(metricId==='weight'){
      const n=Number(data.logs?.[d]?.weight);
      if(Number.isFinite(n)&&n>0)value=n;
    }else{
      const n=Number(bodyStore()?.[d]?.[metricId]);
      if(Number.isFinite(n)&&n>0)value=n;
    }
    out.push({date:d,startDate:d,endDate:d,index,bucket:'day',value,logged:value!==null?1:0});
    if(d>=today)break;
    index++;
  }
  return out;
}
function bodyAggregate(metricId,daily,mode){
  if(!daily.length)return [];

  let starts=[],bucket='day';
  if(mode==='week'){
    bucket='week';
    const first=trendMonday(daily[0].date),last=trendMonday(daily[daily.length-1].date);
    for(let s=first;;s=trendAddDays(s,7)){starts.push(s);if(s===last)break}
  }else if(mode==='month'){
    bucket='month';
    starts=trendLast12MonthStarts();
  }else if(mode==='quarter'){
    bucket='quarter';
    const first=trendQuarterStart(daily[0].date),last=trendQuarterStart(daily[daily.length-1].date);
    for(let s=first;;s=trendAddMonths(s,3)){starts.push(s);if(s===last)break}
  }else{
    return daily;
  }

  return starts.map((startDate,index)=>{
    const endDate=bucket==='week'
      ?trendAddDays(startDate,6)
      :(bucket==='month'?trendMonthEnd(startDate):trendQuarterEnd(startDate));

    const vals=daily
      .filter(r=>r.date>=startDate&&r.date<=endDate&&r.value!==null)
      .map(r=>Number(r.value));

    return {
      date:startDate,startDate,endDate,index,bucket,
      value:vals.length?vals.reduce((s,v)=>s+v,0)/vals.length:null,
      logged:vals.length
    };
  });
}
function bodyChartSeries(metricId,daily){
  if(bodyRangeDays===90)return bodyAggregate(metricId,daily,'week');
  if(bodyRangeDays===365)return bodyAggregate(metricId,daily,'month');
  if(bodyRangeDays==='all')return bodyAggregate(metricId,daily,'quarter');
  return daily;
}
function bodyScale(metricId,series){
  const vals=series.filter(r=>r.value!==null).map(r=>Number(r.value));
  if(!vals.length)return {min:0,max:1};

  let min=Math.min(...vals),max=Math.max(...vals);
  const span=Math.max(metricId==='weight'?4:5,max-min);
  const center=(min+max)/2;
  min=Math.max(0,Math.floor((center-span/2-.4)*2)/2);
  max=Math.ceil((center+span/2+.4)*2)/2;
  return {min,max};
}
function bodyPeriodLabel(row){
  if(row.bucket==='week')return `${bodyFriendlyDate(row.startDate,true)} – ${bodyFriendlyDate(row.endDate,true)}`;
  if(row.bucket==='month')return trendFormatMonth(row.startDate);
  if(row.bucket==='quarter')return trendQuarterLabel(row.startDate,true);
  return bodyFriendlyDate(row.date);
}
function bodyXLabel(row){
  if(row.bucket==='month')return trendFormatMonthShort(row.startDate);
  if(row.bucket==='quarter')return trendQuarterLabel(row.startDate,true);
  if(row.bucket==='week')return bodyFriendlyDate(row.startDate,true);
  return bodyFriendlyDate(row.date,true);
}
function bodyChartNoteText(){
  if(bodyRangeDays===7)return trText('7 дней: отдельные замеры. Нажми на точку.','7 days: individual measurements. Tap a point.');
  if(bodyRangeDays===30)return trText('30 дней: отдельные замеры. Нажми на точку.','30 days: individual measurements. Tap a point.');
  if(bodyRangeDays===90)return trText('3 месяца: одна точка = среднее за календарную неделю.','3 months: one point = calendar-week average.');
  if(bodyRangeDays===365)return trText('1 год: 12 точек = средние значения по месяцам.','1 year: 12 points = monthly averages.');
  return trText('Всё время: одна точка = среднее значение за квартал.','All time: one point = quarterly average.');
}
function bodyChartHTML(metricId,series){
  return sharedChartHTML({
    series,
    scale:bodyScale(metricId,series),
    goal:null,
    selectedIndex:bodySelectedPoint,
    onSelectName:'selectBodyPoint',
    connectAcrossMissing:true,
    bars:false,
    emptyText:trText(
      'Для графика нужно минимум два замера в выбранном периоде.',
      'At least two measurements are needed in the selected range.'
    ),
    formatY:(v)=>bodyFormatNumber(v),
    periodLabel:(row)=>bodyPeriodLabel(row),
    formatX:(row)=>bodyXLabel(row)
  });
}
function selectBodyPoint(index){
  const daily=bodyMetricRawSeries(bodySelectedMetric);
  const series=bodyChartSeries(bodySelectedMetric,daily);
  const row=series[Number(index)];
  if(!row||row.value===null)return;

  bodySelectedPoint=Number(index);
  const detail=document.getElementById('bodyPointDetail');
  const period=document.getElementById('bodyPointDetailPeriod');
  const value=document.getElementById('bodyPointDetailValue');
  const meta=document.getElementById('bodyPointDetailMeta');

  if(detail)detail.hidden=false;
  if(period)period.textContent=bodyPeriodLabel(row);
  if(value)value.textContent=`${bodyFormatNumber(row.value)} ${bodyMetricUnit(bodySelectedMetric)}`;
  if(meta){
    meta.textContent=row.bucket==='day'
      ?trText('Точный замер','Exact measurement')
      :`${trText('Среднее по','Average across')} ${row.logged||0} ${trText('замерам','measurements')}`;
  }

  document.querySelectorAll('#bodyChartHost .trend-hit').forEach(el=>{
    el.classList.toggle('selected',Number(el.dataset.index)===bodySelectedPoint);
  });
}

function renderBody(){
  const modal=document.getElementById('bodyModal');
  if(!modal)return;

  const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};

  set('bodyTitle',trText('Замеры тела','Body measurements'));
  const back=document.querySelector('.body-back');if(back){back.textContent=trText('‹ Прогресс','‹ Progress');back.setAttribute('aria-label',trText('Вернуться в Прогресс','Back to Progress'))}
  set('bodySubtitle',trText('Замеры и динамика','Measurements & trends'));
  set('bodyWeightLabel',trText('Текущий вес','Current weight'));
  set('bodyLastCheckinLabel',trText('Последний замер','Last check-in'));
  set('bodyWaistLabel',trText('Талия','Waist'));
  set('bodyNewCheckinTitle',trText('Новый замер','New check-in'));
  set('bodyNewCheckinSub',trText('Вес + 5 измерений тела','Weight + 5 body measurements'));
  set('bodyDynamicsTitle',trText('Динамика','Trend'));
  set('bodyDynamicsSub',trText('Выбери показатель','Choose a metric'));
  set('bodyHistoryTitle',trText('История','History'));
  set('bodyHistorySub',trText('Нажми на запись, чтобы изменить её','Tap an entry to edit it'));
  set('bodyHelpTitle',trText('Для сравнимых замеров','For comparable measurements'));
  set('bodyHelpText',trText('Старайся измеряться примерно в одинаковых условиях и в одинаковых местах тела. Поля можно оставлять пустыми.','Try to measure under similar conditions and at the same body landmarks. Fields may be left blank.'));

  const weight=bodyLatest('weight'),weightPrev=bodyPrevious('weight');
  set('bodyLatestWeight',weight?`${bodyFormatNumber(weight.value)} ${bodyMetricUnit('weight')}`:'—');
  const wd=weight&&weightPrev?Math.round((weight.value-weightPrev.value)*10)/10:null;
  const wde=document.getElementById('bodyWeightDelta');
  if(wde){
    wde.textContent=wd===null?trText('Пока нет сравнения','No comparison yet'):`${bodyFormatDelta(wd,bodyMetricUnit('weight'))} ${trText('к предыдущему','vs previous')}`;
    wde.className='body-summary-delta '+(wd!==null&&wd<0?'good':'neutral');
  }

  const lastDate=bodyLatestCheckinDate();
  set('bodyLastCheckin',lastDate?bodyFriendlyDate(lastDate):'—');
  set('bodyLastCheckinFields',lastDate?`${bodyFieldCount(lastDate)} / 5 ${trText('замеров','measurements')}`:trText('Нет данных','No data'));

  const waist=bodyLatest('waist'),waistPrev=bodyPrevious('waist');
  set('bodyLatestWaist',waist?`${bodyFormatNumber(waist.value)} ${bodyMetricUnit('waist')}`:'—');
  const wad=waist&&waistPrev?Math.round((waist.value-waistPrev.value)*10)/10:null;
  const wae=document.getElementById('bodyWaistDelta');
  if(wae){
    wae.textContent=wad===null?trText('Пока нет сравнения','No comparison yet'):`${bodyFormatDelta(wad,bodyMetricUnit('waist'))} ${trText('к предыдущему','vs previous')}`;
    wae.className='body-summary-delta '+(wad!==null&&wad<0?'good':'neutral');
  }

  const tabs=document.getElementById('bodyMetricTabs');
  if(tabs){
    tabs.innerHTML=BODY_METRICS.map(m=>`<button class="body-metric-tab ${bodySelectedMetric===m.id?'active':''}" onclick="setBodyMetric('${m.id}')">${m.icon} ${(data.language||'ru')==='en'?m.en:m.ru}</button>`).join('');
  }

  const metric=bodyMetricDef(bodySelectedMetric);
  const rows=bodyEntries(bodySelectedMetric);
  const dailySeries=bodyMetricRawSeries(bodySelectedMetric);
  const chartSeries=bodyChartSeries(bodySelectedMetric,dailySeries);
  const visibleRows=dailySeries.filter(r=>r.value!==null);

  set('bodyChartTitle',`${metric.icon} ${bodyMetricName(bodySelectedMetric)}`);

  const first=visibleRows.length?visibleRows[0]:null;
  const last=visibleRows.length?visibleRows[visibleRows.length-1]:null;
  set(
    'bodyChartRange',
    visibleRows.length
      ?`${bodyFriendlyDate(first.date,true)} → ${bodyFriendlyDate(last.date,true)} · ${visibleRows.length} ${trText('замеров','measurements')}`
      :trText('Нет данных','No data')
  );

  const totalChange=first&&last&&visibleRows.length>1
    ?Math.round((last.value-first.value)*10)/10
    :null;
  const changeEl=document.getElementById('bodyChartChange');
  if(changeEl){
    changeEl.textContent=totalChange===null?'—':`${bodyFormatDelta(totalChange,bodyMetricUnit(bodySelectedMetric))} ${trText('за период','over range')}`;
    changeEl.className='body-chart-change';
  }

  [
    ['bodyRange7Btn',7],
    ['bodyRange30Btn',30],
    ['bodyRange90Btn',90],
    ['bodyRange365Btn',365],
    ['bodyRangeAllBtn','all']
  ].forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el)el.className=bodyRangeDays===value?'secondary':'ghost';
  });

  const chart=document.getElementById('bodyChartHost');
  if(chart)chart.innerHTML=bodyChartHTML(bodySelectedMetric,chartSeries);

  const note=document.getElementById('bodyChartNote');
  if(note)note.textContent=bodyChartNoteText();

  const detail=document.getElementById('bodyPointDetail');
  if(detail&&bodySelectedPoint===null)detail.hidden=true;
  if(bodySelectedPoint!==null){
    const selected=chartSeries[bodySelectedPoint];
    if(selected&&selected.value!==null)selectBodyPoint(bodySelectedPoint);
    else{
      bodySelectedPoint=null;
      if(detail)detail.hidden=true;
    }
  }

  const list=document.getElementById('bodyHistoryList');
  if(list){
    if(!rows.length){
      list.innerHTML=`<div class="body-history-empty">${trText('Для этого показателя ещё нет замеров.','No measurements for this metric yet.')}</div>`;
    }else{
      const desc=[...rows].reverse();
      list.innerHTML=desc.map((r,revIndex)=>{
        const originalIndex=rows.length-1-revIndex;
        const prev=originalIndex>0?rows[originalIndex-1]:null;
        const d=prev?Math.round((r.value-prev.value)*10)/10:null;
        return `<div class="body-history-row" onclick="openBodyCheckin(${inlineArgument(r.date)})">
          <div>
            <div class="body-history-date">${bodyFriendlyDate(r.date)}</div>
            <div class="body-history-meta">${bodySelectedMetric==='weight'?trText('Вес','Weight'):trText('Body Check-in','Body Check-in')}</div>
          </div>
          <div>
            <div class="body-history-value">${bodyFormatNumber(r.value)} ${bodyMetricUnit(bodySelectedMetric)}</div>
            <div class="body-history-delta">${d===null?trText('Первая запись','First entry'):bodyFormatDelta(d,bodyMetricUnit(bodySelectedMetric))}</div>
          </div>
        </div>`;
      }).join('');
    }
  }
}

