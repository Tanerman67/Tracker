let data=loadData();
resetStorageBaseline();
let activeTracker=null,trendRangeDays=7,trendMetricId='weight',calendarDate=new Date();

const englishTypes=[
['english_chatgpt','🤖','ChatGPT'],
['english_native','🗣️','Native teacher'],
['english_russian','📘','Russian teacher'],
['english_watching','🎬','Watching']
];

function englishMinutesForDate(dateKey){return activityMinutes(dateKey)}
function inlineArgument(value){return escapeHTML(JSON.stringify(String(value)))}
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function dates(n){let arr=[];for(let i=n-1;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);arr.push(localDate(d))}return arr}
function val(id,d=localDate()){return nutritionMetricValue(id,d)}
function sum(id,n=7){return dates(n).reduce((s,d)=>s+(Number(nutritionMetricValue(id,d))||0),0)}
function avg(id,n=7){let xs=dates(n).map(d=>Number(nutritionMetricValue(id,d))).filter(v=>v>0);return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0}

function boolCount(id,n=7){return dates(n).filter(d=>data.logs[d]?.[id]===true).length}
function pct(v,g){return !g?0:Math.min(100,Math.max(0,Math.round(v/g*100)))}
function save(){return persistData({renderAfter:true,makeSnapshot:true})}
function ensureDay(d=localDate()){data.logs[d]=data.logs[d]||{};return data.logs[d]}

function tracker(id){return data.trackers.find(t=>t.id===id)||defaultTrackers.find(t=>t.id===id)}
function goalFor(id){if(id==='protein')return data.proteinGoal;return ({protein:data.proteinGoal,steps:data.stepsGoal,outdoors:data.outdoorsGoal,sleep:data.sleepGoal,gym:data.gymGoal,english_general:data.englishGoal})[id] ?? tracker(id)?.goal}
function englishTotalN(n=7){return dates(n).reduce((total,date)=>total+englishMinutesForDate(date),0)}
function englishTodayN(){return englishMinutesForDate(localDate())}
function dailyComplete(id,d=localDate()){
 const t=tracker(id);if(!t)return false;const v=nutritionMetricValue(id,d);if(t.type==='boolean')return v===true;
 const rule=goalRule(id);if(rule.type==='weekly')return false;return ['met','within'].includes(goalState(typeof v==='number'?v:null,rule).status)
}
const TRACKER_I18N = {
  protein:{ru:'Белок',en:'Protein',unitRu:'г',unitEn:'g'},
  steps:{ru:'Шаги',en:'Steps',unitRu:'',unitEn:''},
  outdoors:{ru:'Время на улице',en:'Time outdoors',unitRu:'мин',unitEn:'min'},
  sleep:{ru:'Сон',en:'Sleep',unitRu:'ч',unitEn:'h'},
  weight:{ru:'Вес',en:'Weight',unitRu:'кг',unitEn:'kg'},
  gym:{ru:'Тренировка',en:'Workout',unitRu:'',unitEn:''},
  english_general:{ru:'Английский',en:'English',unitRu:'мин',unitEn:'min'}
};

function trTrackerName(t){
  const lang=data.language||'ru';
  const d=TRACKER_I18N[t?.id];
  if(d) return lang==='en'?d.en:d.ru;
  return t?.name||'';
}
function trUnit(tOrId){
  const lang=data.language||'ru';
  const id=typeof tOrId==='string'?tOrId:tOrId?.id;
  const d=TRACKER_I18N[id];
  if(d) return lang==='en'?d.unitEn:d.unitRu;
  const t=typeof tOrId==='string'?tracker(tOrId):tOrId;
  return t?.unit||'';
}
function trText(ru,en){ return (data.language||'ru')==='en'?en:ru; }

const UI_EN = new Map([
['Current path','Current path'],
['This week','This week'],
['Words & Phrases','Words & Phrases'],
['Grammar Rules','Grammar Rules'],
['My Mistakes','My Mistakes'],
['Review Queue','Review Queue'],
['Current focus','Current focus'],
['Study log','Study log'],
['Add a session','Add a session'],
['Today to review','Today to review'],
['Start review','Start review'],
['Today','Today'],
['1 год','1 year'],
['Всё время','All time'],
['Один показатель во времени — без дублирования Weekly Review.','One metric over time — without duplicating Weekly Review.'],
['Календарь','Calendar'],
['История заполнения по конкретным дням.','Logging history by individual day.'],
['3 месяца','3 months'],
['Weekly Review, детальная динамика и паттерны.','Weekly Review, detailed trends and patterns.'],
['Weekly Review','Weekly Review'],
['✨ Лучшее','✨ Strongest'],
['↗ Что изменилось','↗ What changed'],
['🎯 Фокус','🎯 Focus'],
['Настройки','Settings'],
['Цели, оформление, резервные копии и служебные функции.','Goals, appearance, backups and service tools.'],
['🎯 Настройки целей','🎯 Goal settings'],
['🎨 Оформление и язык','🎨 Appearance and language'],
['Паттерны','Patterns'],
['🧰 Диагностика данных','🧰 Data diagnostics'],
['Дней употребления алкоголя','Alcohol drinking days'],
['⚗️ Расширенные настройки','⚗️ Advanced settings'],
['Опасная зона','Danger zone'],
['Сброс удаляет локальные данные приложения. Перед этим создай внешний backup.','Reset deletes the app’s local data. Create an external backup first.'],
['Локальная защита','Local protection'],
['Последний внешний backup','Last external backup'],
['Проверяем…','Checking…'],
['Никогда','Never'],
['локальных копий','local copies'],
['Backup создан. Сохрани файл в Files/iCloud Drive.','Backup created. Keep the file in Files/iCloud Drive.'],

['Вчера','Yesterday'],
['Нет записей','No entries'],
['За 7 дней','Last 7 days'],
['Среднее за 7 дней','7-day average'],
['Нет данных за последние 7 дней','No data in the last 7 days'],
['Цель достигнута','Goal reached'],
['Записать сегодня','Log today'],
['шагов','steps'],

['Сегодня отмечено ✓','Checked today ✓'],
['Нажми, чтобы отметить сегодня','Tap to check today'],

['Лучше, чем вчера','Better than yesterday'],
['Добавить занятие ＋','Add a session ＋'],
['Без сигарет','Smoke-free'],
['Без алкоголя','Alcohol-free'],
['Дисциплина сегодня — свобода завтра.','Discipline today — freedom tomorrow.'],

['🥩 Белок','🥩 Protein'],
['🚶 Шаги','🚶 Steps'],
['☀️ Время на улице','☀️ Time outdoors'],
['☀️ Улица','☀️ Outdoors'],
['😴 Сон','😴 Sleep'],
['⚖️ Вес','⚖️ Weight'],
['🏋️ Тренировка','🏋️ Workout'],
['🇬🇧 Английский','🇬🇧 English'],

['Мой ритм','My Rhythm'],
['Consistency > streak. Смотри на тренд, а не на один день.','Consistency > streak. Focus on the trend, not one day.'],
['сегодня','today'],
['Today Dashboard','Today Dashboard'],
['Начни день','Start your day'],
['Заполни несколько ключевых показателей.','Log a few key metrics.'],
['🚭 Без сигарет','🚭 Smoke-free'],
['🍷 Без алкоголя','🍷 Alcohol-free'],
['дней','days'],
['Ключевые показатели','Key metrics'],
['Быстрый ввод','Quick entry'],
['🥩 Белок','🥩 Protein'],
['☀️ Улица','☀️ Outdoors'],
['🏋️ Тренировка','🏋️ Workout'],
['Здоровье','Health'],
['Дневные и недельные цели без наказания за один пропуск.','Daily and weekly goals without punishing one missed day.'],
['＋ Добавить свой трекер','＋ Add custom tracker'],
['Английский','English'],
['Отдельный мини-трекер внутри приложения.','A dedicated mini-tracker inside the app.'],
['Сегодня','Today'],
['Эта неделя','This week'],
['мин','min'],
['Дней с английским','Days with English'],
['Добавить занятие','Add a session'],
['🎬 Смотреть','🎬 Watching'],
['Неделя по типам занятий','Week by activity type'],
['Прогресс','Progress'],
['7 дней','7 days'],
['30 дней','30 days'],
['Проверяй одну гипотезу за раз.','Test one hypothesis at a time.'],
['＋ Новый эксперимент','＋ New experiment'],
['Настройки целей','Goal settings'],
['Дата отказа от сигарет','Smoke-free start date'],
['Дата текущего периода без алкоголя','Current alcohol-free period start'],
['Белок, г/день','Protein, g/day'],
['Шаги / день','Steps / day'],
['Время на улице, мин/день','Time outdoors, min/day'],
['Сон, ч/день','Sleep, h/day'],
['Английский, мин/неделю','English, min/week'],
['Тренировки, раз/неделю','Workouts / week'],
['Сохранить настройки','Save settings'],
['🎨 Оформление','🎨 Appearance'],
['Тема приложения','App theme'],
['По умолчанию — тёмная неоновая','Default — dark neon'],
['Язык интерфейса','Interface language'],
['Русский / English','Russian / English'],
['Русский','Russian'],
['💾 Данные и резервная копия','💾 Data and backup'],
['Данные приложения хранятся отдельно от версии интерфейса. Обновления V4, V5 и дальше используют ту же базу.','Your data is stored separately from the interface version. V4, V5 and later use the same database.'],
['Версия приложения','App version'],
['Версия структуры данных','Data schema version'],
['↓ Экспорт backup','↓ Export backup'],
['↑ Импорт backup','↑ Import backup'],
['Сбросить все данные','Reset all data'],
['Главная','Home'],
['Здоровье','Health'],
['Прогресс','Progress'],
['Запись','Entry'],
['Значение','Value'],
['Сохранить','Save'],
['Название','Name'],
['Иконка','Icon'],
['Тип','Type'],
['Число','Number'],
['Да / нет','Yes / no'],
['Единица','Unit'],
['мин, г, мл...','min, g, ml...'],
['Дневная цель','Daily goal'],
['Добавить','Add'],
['Длительность, дней','Duration, days'],
['Гипотеза','Hypothesis'],
['Начать эксперимент','Start experiment'],
['Белок','Protein'],
['Шаги','Steps'],
['Время на улице','Time outdoors'],
['Сон','Sleep'],
['Вес','Weight'],
['Вода','Water'],
['Тренировка','Workout'],
['Английский','English'],
['г','g'],
['ч','h'],
['кг','kg'],
['л','L'],
['Выполнено','Done'],
['Не отмечено','Not logged'],
['Записать','Log'],
['цель','goal'],
['Неделя','Week'],
['Очень хороший день','Great day'],
['Хороший темп','Good pace'],
['День в процессе','Day in progress'],
['Начни с малого','Start small'],
['Главное — устойчивость, а не идеальный день.','Consistency matters more than a perfect day.'],
['Заполни 2–3 важных показателя — уже достаточно.','Logging 2–3 important metrics is already enough.'],
['Пока мало данных.','Not enough data yet.'],
['Без гипотезы','No hypothesis'],
['Активен','Active'],
['Завершён','Completed'],
['Завершить','Finish'],
['Возобновить','Resume'],
['Удалить','Delete'],
['Цель','Goal'],
['Январь','January'],['Февраль','February'],['Март','March'],['Апрель','April'],
['Май','May'],['Июнь','June'],['Июль','July'],['Август','August'],
['Сентябрь','September'],['Октябрь','October'],['Ноябрь','November'],['Декабрь','December'],
['Пн','Mon'],['Вт','Tue'],['Ср','Wed'],['Чт','Thu'],['Пт','Fri'],['Сб','Sat'],['Вс','Sun']
]);

function translatePhraseRUtoEN(text){
  if(UI_EN.has(text)) return UI_EN.get(text);
  let s=text;

  const exact={
    'Белок':'Protein','Шаги':'Steps','Время на улице':'Time outdoors','Улица':'Outdoors',
    'Сон':'Sleep','Вес':'Weight','Тренировка':'Workout','Английский':'English',
    'Сегодня':'Today','Эта неделя':'This week','Неделя':'Week',
    'Дневная цель':'Daily goal','Недельная цель':'Weekly goal','Без дневной цели':'No daily goal',
    'Выполнено':'Done','Не отмечено':'Not logged','Без цели':'No goal',
    'Активен':'Active','Завершён':'Completed','Завершить':'Finish','Возобновить':'Resume',
    'Удалить':'Delete','Записать':'Log','Добавить':'Add'
  };
  if(exact[s]) return exact[s];

  s=s.replace(/^Сегодня · /,'Today · ');
  s=s.replace(/^Недельная цель · /,'Weekly goal · ');
  s=s.replace(/^Дневная цель · /,'Daily goal · ');
  s=s.replace(/^Цель: /,'Goal: ');
  s=s.replace(/^цель: /,'goal: ');
  s=s.replace(/^Неделя (\d+)%$/,'Week $1%');
  s=s.replace(/^Completion rate за (\d+) дней$/,'Completion rate for $1 days');
  s=s.replace(/^Данных: (\d+) дней · корреляция, не доказательство причины$/,
              'Data: $1 days · correlation, not proof of causation');

  s=s.replace(/(\d+(?:[.,]\d+)?)\s*дней\b/g,'$1 days');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*дня\b/g,'$1 days');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*день\b/g,'$1 day');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*мин\b/g,'$1 min');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*ч\b/g,'$1 h');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*г\b/g,'$1 g');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*кг\b/g,'$1 kg');

  s=s.replace('Главное — устойчивость, а не идеальный день.',
              'Consistency matters more than a perfect day.');
  s=s.replace('Заполни 2–3 важных показателя — уже достаточно.',
              'Logging 2–3 important metrics is already enough.');
  s=s.replace('Заполни несколько ключевых показателей.',
              'Log a few key metrics.');
  s=s.replace('Для первых сравнений желательно хотя бы 8–14 заполненных дней, для более устойчивых выводов — около месяца.',
              'For initial comparisons, aim for at least 8–14 logged days; around a month gives more stable insights.');
  s=s.replace('Будем показывать связи, а не утверждать причинность.',
              'The app shows relationships, not claims of causation.');
  s=s.replace('Пример: «30 дней проводить ≥60 минут на улице» и потом сравнить сон и английский.',
              'Example: “Spend ≥60 minutes outdoors for 30 days” and then compare sleep and English.');

  s=s.replace(/^В дни с ≥(.+) мин на улице английского в среднем (.+) мин против (.+) мин\.$/,
              'On days with ≥$1 min outdoors, English averaged $2 min vs $3 min.');
  s=s.replace(/^При сне ≥(.+) ч английского в среднем (.+) мин против (.+) мин\.$/,
              'With ≥$1 h of sleep, English averaged $2 min vs $3 min.');
  s=s.replace(/^В дни с ≥(.+) мин на улице сон в среднем (.+) ч против (.+) ч\.$/,
              'On days with ≥$1 min outdoors, sleep averaged $2 h vs $3 h.');

  s=s.replace(/Белок/g,'Protein')
     .replace(/Шаги/g,'Steps')
     .replace(/Время на улице/g,'Time outdoors')
     .replace(/Сон/g,'Sleep')
     .replace(/Вес/g,'Weight')
     .replace(/Тренировка/g,'Workout')
     .replace(/Английский/g,'English');

  return s;
}

function translateDOM(){
  localizeExplicit();
  const lang=data.language||'ru';
  document.documentElement.lang=lang;

  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(!node.parentElement) continue;
    const tag=node.parentElement.tagName;
    if(tag==='SCRIPT'||tag==='STYLE'||node.parentElement.closest('[data-localized]')) continue;
    nodes.push(node);
  }

  nodes.forEach(node=>{
    if(node._ruText===undefined) node._ruText=node.nodeValue;
    node.nodeValue=lang==='en'?translatePhraseRUtoEN(node._ruText):node._ruText;
  });

  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
    if(el._ruPlaceholder===undefined) el._ruPlaceholder=el.getAttribute('placeholder')||'';
    el.setAttribute('placeholder',lang==='en'?translatePhraseRUtoEN(el._ruPlaceholder):el._ruPlaceholder);
  });

  const lb=document.getElementById('languageToggleBtn');
  if(lb) lb.textContent=lang==='en'?'English':'Русский';

  // Browser title.
  document.title=lang==='en'?'My Rhythm':'Мой ритм';
}

function toggleLanguage(){
  data.language=(data.language||'ru')==='ru'?'en':'ru';
  save();
}

function applyTheme(){
  const theme=data.theme||'dark';
  document.body.classList.toggle('light',theme==='light');
  const btn=document.getElementById('themeToggleBtn');
  if(btn) btn.textContent=theme==='dark'?'Dark':'Light';
}
function toggleTheme(){
  data.theme=(data.theme||'dark')==='dark'?'light':'dark';
  save();
}
let currentSection='today',previousSection='today';
const sectionScroll={};
function show(id,btn){
 if(id==='english')return openModule('activity');
 const section=document.getElementById(id);if(!section)return;
 if(currentSection!==id){sectionScroll[currentSection]=window.scrollY||0;previousSection=currentSection;}
 if(currentSection==='nutritionModal'&&id!==currentSection){nutritionCancelForm();nutritionCancelImport()}
 document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));section.classList.add('active');
 const tabIds={today:'tabToday',nutritionModal:'tabNutrition',progress:'tabProgress',settings:'tabSettings'};
 document.querySelectorAll('.tab').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current')});
 btn=btn||document.getElementById(tabIds[id]);if(btn){btn.classList.add('active');btn.setAttribute('aria-current','page')}
 const changed=currentSection!==id;currentSection=id;
 if(id==='nutritionModal')nutritionRender();
 if(changed)window.scrollTo?.(0,sectionScroll[id]||0);
 enhanceDateInputs();
}
function openEntry(id,dateKey=localDate()){activeTracker=tracker(id);if(!activeTracker){alert(trText('Трекер не найден.','Tracker not found.'));return}activeTracker={...activeTracker,entryDate:dateKey};const unit=trUnit(activeTracker);document.getElementById('entryTitle').textContent=activeTracker.icon+' '+trTrackerName(activeTracker);document.getElementById('entryLabel').textContent=trText('Значение','Value')+(unit?' ('+unit+')':'')+' · '+dateKey;document.getElementById('entryValue').value=(id==='protein'?data.logs?.[dateKey]?.protein:val(id,dateKey))??'';document.getElementById('entryModal').classList.add('show');setTimeout(()=>document.getElementById('entryValue').focus(),80)}
function openEnglish(id){const type=englishTypes.find(x=>x[0]===id);if(!type)return;activeTracker={id,name:type[2],icon:type[1],type:'number',unit:'мин',category:'english'};document.getElementById('entryTitle').textContent=type[1]+' '+type[2];document.getElementById('entryLabel').textContent=trText('Всего минут сегодня','Total minutes today');document.getElementById('entryValue').value=val(id)??'';document.getElementById('entryModal').classList.add('show');setTimeout(()=>document.getElementById('entryValue').focus(),80)}
function saveEntry(){
 if(!activeTracker)return;
 const input=document.getElementById('entryValue');
 const raw=input?.value?.trim()||'';
 const value=Number(raw);
 if(raw==='' || !Number.isFinite(value) || value<0){
   alert(trText('Введи число не меньше нуля. Пустое поле не сохраняется.','Enter a number of zero or more. An empty field is not saved.'));
   return;
 }
 ensureDay(activeTracker.entryDate||localDate())[activeTracker.id]=value;
 if(activeTracker.id.startsWith('english_') && activeTracker.id!=='english_general'){
   const total=englishTypes.reduce((s,[id])=>s+(Number(val(id))||0),0);
   ensureDay().english_general=total;
 }
 closeModal('entryModal');save()
}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function saveSettings(){
 const gv=id=>document.getElementById(id)?.value??'';
 const smoke=gv('smokeDate'),alcohol=gv('alcoholDate');
 if([smoke,alcohol].some(v=>v&&(!validDay(v)||v>localDate()))){alert(trText('Проверь даты. Будущая дата недоступна.','Check the dates. Future dates are unavailable.'));return}
 const next={};for(const key of ['stepsGoal','outdoorsGoal','sleepGoal','englishGoal','gymGoal']){
  const raw=gv(key);const value=raw===''?null:Number(raw);
  if(value!==null&&(!Number.isFinite(value)||value<0)){alert(trText('Проверь цели.','Check the goals.'));return}next[key]=value;
 }
 const before=structuredClone(data);
 data.smokeDate=smoke;data.alcoholTrackingStart=alcohol;
 // alcoholDate is a retained legacy field, no longer rewritten by derived streaks.
 Object.assign(data,next);
 for(const [id,key] of Object.entries({steps:'stepsGoal',outdoors:'outdoorsGoal',sleep:'sleepGoal',gym:'gymGoal',english_general:'englishGoal'})){
  const t=tracker(id);if(t)t.goal=next[key];
  if(data.goalRules[id]&&data.goalRules[id].type!=='range')data.goalRules[id].target=next[key];
 }
 if(!saveGoalRulesFromSettings()){data=before;return;}
 save();
}
async function exportBackup(){
  await saveCoordinationQueue;
  const now=new Date();
  const stamp=now.toISOString().slice(0,10);

  data.lastExternalBackupAt=now.toISOString();
  await persistData({renderAfter:false,makeSnapshot:true});

  const backup={
    format:'my-life-tracker-backup',
    formatVersion:1,
    exportedAt:now.toISOString(),
    appVersion:APP_VERSION,
    schemaVersion:CURRENT_SCHEMA_VERSION,
    data:migrateData(data)
  };

  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`my-life-tracker-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);

  const el=document.getElementById('backupStatus');
  if(el)el.textContent=trText('Backup создан. Сохрани файл в Files/iCloud Drive.','Backup created. Keep the file in Files/iCloud Drive.');
  updateStorageSafetyUI();
}

function validateBackupObject(obj){
  if(!obj || typeof obj!=='object') throw new Error('Некорректный JSON.');
  if(obj.format==='my-life-tracker-backup' && obj.data){
    return migrateData(validateStoredData(obj.data));
  }
  // Also accept a raw database export for resilience.
  if(obj.logs || obj.trackers || obj.schemaVersion!==undefined){
    return migrateData(validateStoredData(obj));
  }
  throw new Error('Файл не похож на backup приложения «Мой ритм».');
}

function importBackupFile(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=async()=>{
    try{
      const parsed=JSON.parse(reader.result);
      const imported=validateBackupObject(parsed);
      const rawBackup=parsed.format==='my-life-tracker-backup'?parsed.data:parsed;
      const oldBackup=!Object.prototype.hasOwnProperty.call(rawBackup,'nutrition');
      const existingFood=data.nutrition?.entries?.length||0;
      if(oldBackup&&existingFood)imported.nutrition=structuredClone(data.nutrition);
      for(const key of ['dashboard','cycle','englishActivity','goalRules'])if(!Object.prototype.hasOwnProperty.call(rawBackup,key))imported[key]=structuredClone(data[key]);
      if(!Object.prototype.hasOwnProperty.call(rawBackup,'energyBalance')&&data.energyBalance)imported.energyBalance=structuredClone(data.energyBalance);
      const hasCurrent=Object.keys(data.logs||{}).length>0||existingFood>0||data.cycle.periods.length>0||data.englishActivity.entries.length>0;
      const message=hasCurrent
        ? 'Импорт заменит текущие записи данными из backup.'+(oldBackup&&existingFood?' Этот старый backup не содержит раздел питания; текущие записи питания будут сохранены.':'')+' Продолжить?'
        : 'Импортировать данные из backup?';
      if(!confirm(message)) return;
      await saveCoordinationQueue;
      await writeVaultCopies(structuredClone(data),true);
      data=imported;
      await save();
      const el=document.getElementById('backupStatus');
      if(el) el.textContent='Backup успешно импортирован ✅';
      alert('Данные восстановлены.');
    }catch(err){
      alert('Не удалось импортировать backup: '+err.message);
    }finally{
      event.target.value='';
    }
  };
  reader.onerror=()=>alert('Не удалось прочитать файл.');
  reader.readAsText(file);
}

async function resetAll(){
  const first=confirm(
    (data.language||'ru')==='en'
      ? 'Delete all app data? This will also erase local recovery copies.'
      : 'Удалить все данные приложения? Будут удалены и локальные recovery-копии.'
  );
  if(!first)return;

  const second=confirm(
    (data.language||'ru')==='en'
      ? 'Final confirmation. Continue only if you already have an external backup.'
      : 'Последнее подтверждение. Продолжай только если у тебя уже есть внешний backup.'
  );
  if(!second)return;

  await clearVaultCopies();
  location.reload();
}




let bodySelectedMetric='waist';
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
  document.getElementById('bodyModal')?.classList.add('show');
  document.body.style.overflow='hidden';
  renderBody();
}
function closeBody(){
  document.getElementById('bodyModal')?.classList.remove('show');
  document.body.style.overflow='';
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

  set('bodyTitle','Body');
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

let alcoholViewMode='year';
let alcoholViewYear=new Date().getFullYear();
let alcoholViewMonth=new Date().getMonth();
const ALCOHOL_MONTHS_RU=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const ALCOHOL_MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const ALCOHOL_WEEK_RU=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const ALCOHOL_WEEK_EN=['Mo','Tu','We','Th','Fr','Sa','Su'];

function alcoholHistory(){
  if(!data.alcoholHistory||typeof data.alcoholHistory!=='object')data.alcoholHistory={};
  return data.alcoholHistory;
}
function alcoholIsDrink(dateKey){return !!alcoholHistory()[dateKey]}
function alcoholDateKey(year,monthIndex,day){return `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`}
function alcoholParseLocal(dateKey){return weeklyParseDate(dateKey)}
function alcoholTodayKey(){return localDate()}
function alcoholTrackingStart(){return data.alcoholTrackingStart??data.alcoholDate??''}
function alcoholIsTrackedPast(dateKey){return !!alcoholTrackingStart()&&validDay(dateKey)&&dateKey>=alcoholTrackingStart()&&dateKey<=alcoholTodayKey()}
function alcoholLatestDrink(onOrBefore=alcoholTodayKey()){return Object.keys(alcoholHistory()).filter(k=>alcoholHistory()[k]&&k>=alcoholTrackingStart()&&k<=onOrBefore).sort().pop()||''}

function alcoholCurrentStreakStart(){
  const today=alcoholTodayKey();
  if(alcoholIsDrink(today))return '';
  const lastDrink=alcoholLatestDrink(today);
  if(!lastDrink)return alcoholTrackingStart();
  const d=alcoholParseLocal(lastDrink);d.setDate(d.getDate()+1);return localDate(d);
}
function alcoholCurrentStreakDays(){
  const today=alcoholTodayKey();
  if(alcoholIsDrink(today))return 0;
  const startKey=alcoholCurrentStreakStart();
  if(!startKey||startKey>today)return 0;
  return Math.max(0,weeklyDiffDays(startKey,today));
}
function alcoholYearStats(year){
  const now=new Date(),currentYear=now.getFullYear(),trackStart=alcoholTrackingStart();
  if(!trackStart)return {tracked:0,drink:0,sober:0,pct:0};
  const effectiveStart=`${year}-01-01`<trackStart?trackStart:`${year}-01-01`;
  let end;
  if(year<currentYear)end=new Date(year,11,31,12);
  else if(year===currentYear)end=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  else return {tracked:0,drink:0,sober:0,pct:0};
  const start=alcoholParseLocal(effectiveStart);
  if(start>end)return {tracked:0,drink:0,sober:0,pct:0};
  const tracked=weeklyDiffDays(effectiveStart,localDate(end))+1;
  const endKey=localDate(end);
  const drink=Object.keys(alcoholHistory()).filter(k=>k.startsWith(year+'-')&&alcoholHistory()[k]&&k>=effectiveStart&&k<=endKey).length;
  const sober=Math.max(0,tracked-drink);
  return {tracked,drink,sober,pct:tracked?Math.round(sober/tracked*100):0};
}
function syncAlcoholDerivedDate(){return alcoholCurrentStreakStart()}

function openAlcohol(){
  alcoholViewYear=new Date().getFullYear();
  alcoholViewMonth=new Date().getMonth();
  alcoholViewMode='year';
  document.getElementById('alcoholModal')?.classList.add('show');
  document.body.style.overflow='hidden';
  renderAlcoholCalendar();
}
function closeAlcohol(){document.getElementById('alcoholModal')?.classList.remove('show');document.body.style.overflow=''}
function setAlcoholMode(mode){alcoholViewMode=mode==='month'?'month':'year';renderAlcoholCalendar()}
function changeAlcoholYear(delta){alcoholViewYear+=delta;renderAlcoholCalendar()}
function changeAlcoholMonth(delta){alcoholViewMonth+=delta;if(alcoholViewMonth<0){alcoholViewMonth=11;alcoholViewYear--}if(alcoholViewMonth>11){alcoholViewMonth=0;alcoholViewYear++}renderAlcoholCalendar()}

function toggleAlcoholDay(dateKey){
  if(!alcoholIsTrackedPast(dateKey))return;
  const hist=alcoholHistory();
  if(hist[dateKey])delete hist[dateKey];else hist[dateKey]=true;
  syncAlcoholDerivedDate();
  persistData({renderAfter:true,makeSnapshot:true});
  renderAlcoholCalenda…12228 tokens truncated…of preference){
    const v=Number(store[currentDate]?.[id]);
    if(Number.isFinite(v)&&v>0){metric=id;break}
  }
  if(!metric)return null;

  const value=Number(store[currentDate][metric]);
  const prevDate=Object.keys(store)
    .filter(k=>k<currentDate && Number(store[k]?.[metric])>0)
    .sort()
    .pop()||'';
  const prevValue=prevDate?Number(store[prevDate][metric]):null;
  const delta=prevDate?Math.round((value-prevValue)*10)/10:null;

  return {
    metric,
    label:(data.language||'ru')==='en'?labels[metric].en:labels[metric].ru,
    date:currentDate,
    value,
    prevDate,
    prevValue,
    delta
  };
}
function weeklyAlcoholStats(keys){
  const start=alcoholTrackingStart();
  const today=localDate();
  const tracked=keys.filter(k=>k>=start && k<=today);
  const drink=tracked.filter(k=>alcoholIsDrink(k)).length;
  return {tracked:tracked.length,drink,free:Math.max(0,tracked.length-drink)};
}
function weeklyBuildSummary(todayKey=localDate()){
  const window=weeklyWindow(todayKey);
  const sleep=weeklyNumericStats('sleep',window.currentKeys,{goal:data.sleepGoal});
  const prevSleep=weeklyNumericStats('sleep',window.prevKeys,{goal:data.sleepGoal});
  const steps=weeklyNumericStats('steps',window.currentKeys,{goal:data.stepsGoal});
  const prevSteps=weeklyNumericStats('steps',window.prevKeys,{goal:data.stepsGoal});
  const protein=weeklyNumericStats('protein',window.currentKeys,{goal:data.proteinGoal});
  const prevProtein=weeklyNumericStats('protein',window.prevKeys,{goal:data.proteinGoal});
  const outdoors=weeklyNumericStats('outdoors',window.currentKeys,{goal:data.outdoorsGoal});
  const prevOutdoors=weeklyNumericStats('outdoors',window.prevKeys,{goal:data.outdoorsGoal});
  const english=weeklyEnglishStats(window.currentKeys);
  const prevEnglish=weeklyEnglishStats(window.prevKeys);
  const gym=weeklyGymStats(window.currentKeys);
  const prevGym=weeklyGymStats(window.prevKeys);
  const weight=weeklyWeightStats(window.currentKeys);
  const alcohol=weeklyAlcoholStats(window.currentKeys);
  const body=weeklyBodyChange(window.currentKeys);

  return {
    window,
    sleep,prevSleep,
    steps,prevSteps,
    protein,prevProtein,
    outdoors,prevOutdoors,
    english,prevEnglish,
    gym,prevGym,
    weight,alcohol,body
  };
}
function weeklyRound(v,digits=1){
  if(v===null||v===undefined||!Number.isFinite(Number(v)))return null;
  const p=10**digits;
  return Math.round(Number(v)*p)/p;
}
function weeklySigned(v,suffix=''){
  if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';
  const n=weeklyRound(v,1);
  if(n===0)return `0${suffix}`;
  return `${n>0?'+':'−'}${Math.abs(n)}${suffix}`;
}
function weeklyPctChange(current,previous){
  if(current===null||current===undefined||previous===null||previous===undefined||!Number(previous))return null;
  return Math.round((Number(current)-Number(previous))/Math.abs(Number(previous))*100);
}
function weeklyFormatMinutes(mins){
  mins=Math.max(0,Math.round(Number(mins)||0));
  const h=Math.floor(mins/60),m=mins%60;
  if(h&&m)return `${h}${trText('ч','h')} ${m}${trText('м','m')}`;
  if(h)return `${h}${trText('ч','h')}`;
  return `${m}${trText('м','m')}`;
}
function weeklyFormatDate(dateKey){
  if(!dateKey)return '—';
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return weeklyParseDate(dateKey).toLocaleDateString(locale,{day:'numeric',month:'short'});
}
function weeklyPeriodLabel(start,end){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  const a=weeklyParseDate(start),b=weeklyParseDate(end);
  if(a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth()){
    return `${a.getDate()}–${b.toLocaleDateString(locale,{day:'numeric',month:'short'})}`;
  }
  return `${a.toLocaleDateString(locale,{day:'numeric',month:'short'})} – ${b.toLocaleDateString(locale,{day:'numeric',month:'short'})}`;
}
function weeklyCoverageScore(count,elapsed){
  if(!elapsed)return 0;
  return Math.max(0,Math.min(1,Number(count||0)/elapsed));
}
function weeklyStrongest(summary){
  const e=summary.window.elapsed;
  const candidates=[];

  if(summary.sleep.count){
    const closeness=Math.max(0,1-Math.abs(summary.sleep.avg-data.sleepGoal)/Math.max(1,data.sleepGoal));
    candidates.push({
      id:'sleep',
      score:closeness*weeklyCoverageScore(summary.sleep.count,e),
      title:trText('Сон ближе всего к твоей цели.','Sleep is closest to your target.'),
      meta:`${weeklyRound(summary.sleep.avg,1)} ${trText('ч в среднем','h avg')} · ${summary.sleep.count}/${e} ${trText('ночей записано','nights logged')}`
    });
  }
  for(const [id,stats,goal,label] of [
    ['steps',summary.steps,data.stepsGoal,trText('Шаги — самая сильная привычка недели.','Steps are your strongest habit this week.')],
    ['protein',summary.protein,data.proteinGoal,trText('Белок — самая сильная привычка недели.','Protein is your strongest habit this week.')],
    ['outdoors',summary.outdoors,data.outdoorsGoal,trText('Время на улице — самая сильная привычка недели.','Time outdoors is your strongest habit this week.')]
  ]){
    if(stats.count && Number(goal)>0){
      const avgScore=Math.min(1,stats.avg/goal);
      candidates.push({
        id,
        score:avgScore*weeklyCoverageScore(stats.count,e),
        title:label,
        meta:`${stats.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${stats.count}/${e} ${trText('записано','logged')}`
      });
    }
  }

  if(Number(data.englishGoal)>0){
    const expected=data.englishGoal*(e/7);
    if(summary.english.total>0){
      candidates.push({
        id:'english',
        score:Math.min(1,summary.english.total/Math.max(1,expected)),
        title:trText('English идёт сильнее всего относительно темпа недели.','English is strongest relative to this week’s pace.'),
        meta:`${weeklyFormatMinutes(summary.english.total)} · ${trText('цель','goal')} ${weeklyFormatMinutes(data.englishGoal)}`
      });
    }
  }

  if(Number(data.gymGoal)>0 && summary.gym.sessions>0){
    const expected=data.gymGoal*(e/7);
    candidates.push({
      id:'gym',
      score:Math.min(1,summary.gym.sessions/Math.max(.25,expected)),
      title:trText('Тренировки идут сильнее всего относительно темпа недели.','Workouts are strongest relative to this week’s pace.'),
      meta:`${summary.gym.sessions}/${data.gymGoal} ${trText('тренировок за неделю','workouts this week')}`
    });
  }

  if(!candidates.length){
    return {
      id:'none',
      title:trText('Пока мало данных для выбора сильной стороны.','Not enough data yet to identify a strongest area.'),
      meta:trText('Продолжай заполнять текущую неделю.','Keep logging the current week.')
    };
  }
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0];
}
function weeklyChanged(summary){
  const c=[];
  const add=(id,score,title,meta)=>{if(Number.isFinite(score))c.push({id,score:Math.abs(score),title,meta})};

  if(summary.sleep.count && summary.prevSleep.count){
    const d=weeklyRound(summary.sleep.avg-summary.prevSleep.avg,1);
    add(
      'sleep',
      d/Math.max(1,data.sleepGoal),
      `${trText('Сон','Sleep')} ${weeklySigned(d,trText(' ч',' h'))}`,
      `${weeklyRound(summary.sleep.avg,1)} ${trText('ч','h')} vs ${weeklyRound(summary.prevSleep.avg,1)} ${trText('ч за те же дни прошлой недели','h for the same days last week')}`
    );
  }

  for(const [id,stats,prev,label,unit] of [
    ['steps',summary.steps,summary.prevSteps,trText('Шаги','Steps'),''],
    ['protein',summary.protein,summary.prevProtein,trText('Белок','Protein'),trText(' г',' g')],
    ['outdoors',summary.outdoors,summary.prevOutdoors,trText('Улица','Outdoors'),trText(' мин',' min')]
  ]){
    if(stats.count && prev.count && Number(prev.avg)!==0){
      const pct=weeklyPctChange(stats.avg,prev.avg);
      add(
        id,
        pct/100,
        `${label} ${weeklySigned(pct,'%')}`,
        `${weeklyRound(stats.avg,1)}${unit} ${trText('в среднем vs','avg vs')} ${weeklyRound(prev.avg,1)}${unit}`
      );
    }
  }

  if(summary.english.total>0 && summary.prevEnglish.total>0){
    const pct=weeklyPctChange(summary.english.total,summary.prevEnglish.total);
    add(
      'english',
      pct/100,
      `English ${weeklySigned(pct,'%')}`,
      `${weeklyFormatMinutes(summary.english.total)} vs ${weeklyFormatMinutes(summary.prevEnglish.total)} ${trText('за те же дни прошлой недели','for the same days last week')}`
    );
  }

  if(summary.gym.sessions!==summary.prevGym.sessions){
    const diff=summary.gym.sessions-summary.prevGym.sessions;
    add(
      'gym',
      diff/Math.max(1,data.gymGoal),
      `${trText('Тренировки','Workouts')} ${weeklySigned(diff)}`,
      `${summary.gym.sessions} vs ${summary.prevGym.sessions} ${trText('за те же дни прошлой недели','for the same days last week')}`
    );
  }

  if(summary.weight.current && summary.weight.previous && summary.weight.delta!==null){
    add(
      'weight',
      summary.weight.delta/Math.max(1,summary.weight.previous.value),
      `${trText('Вес','Weight')} ${weeklySigned(summary.weight.delta,trText(' кг',' kg'))}`,
      trText('Изменение с предыдущего взвешивания. Без оценки «лучше/хуже».','Change since the previous weigh-in. No “better/worse” judgement.')
    );
  }

  if(summary.body && summary.body.delta!==null){
    add(
      'body',
      summary.body.delta/Math.max(1,summary.body.prevValue||1),
      `${summary.body.label} ${weeklySigned(summary.body.delta,trText(' см',' cm'))}`,
      trText('Изменение относительно предыдущего Body Check-in.','Change vs the previous Body Check-in.')
    );
  }

  if(!c.length){
    return {
      id:'none',
      title:trText('Пока недостаточно сравнимых данных.','Not enough comparable data yet.'),
      meta:trText('Сравнение появится, когда будут данные за те же дни прошлой недели.','Comparison appears when the same weekdays from last week have data.')
    };
  }
  c.sort((a,b)=>b.score-a.score);
  return c[0];
}
function weeklyFocus(summary){
  const e=summary.window.elapsed;

  if(e<=2){
    return {
      id:'early',
      title:trText('Неделя только началась — не меняй курс слишком рано.','The week has just started — don’t change course too early.'),
      meta:trText('Соберём ещё несколько дней данных и выберем один фокус.','Collect a few more days of data, then we’ll choose one focus.')
    };
  }

  const candidates=[];
  const add=(id,score,title,meta)=>candidates.push({id,score,title,meta});

  if(summary.steps.count){
    add(
      'steps',
      Math.min(1,summary.steps.avg/Math.max(1,data.stepsGoal)),
      trText('Подтянуть шаги.','Bring steps closer to target.'),
      `${trText('Среднее','Average')}: ${Math.round(summary.steps.avg)} · ${trText('цель','goal')}: ${Math.round(data.stepsGoal)}`
    );
  }
  if(summary.protein.count){
    add(
      'protein',
      Math.min(1,summary.protein.avg/Math.max(1,data.proteinGoal)),
      trText('Подтянуть белок.','Bring protein closer to target.'),
      `${trText('Среднее','Average')}: ${weeklyRound(summary.protein.avg,1)} ${trText('г','g')} · ${trText('цель','goal')}: ${data.proteinGoal} ${trText('г','g')}`
    );
  }
  if(summary.outdoors.count){
    add(
      'outdoors',
      Math.min(1,summary.outdoors.avg/Math.max(1,data.outdoorsGoal)),
      trText('Добавить времени на улице.','Add more time outdoors.'),
      `${trText('Среднее','Average')}: ${weeklyRound(summary.outdoors.avg,1)} ${trText('мин','min')} · ${trText('цель','goal')}: ${data.outdoorsGoal}`
    );
  }
  if(summary.sleep.count>=2 && summary.sleep.avg<data.sleepGoal){
    add(
      'sleep',
      Math.min(1,summary.sleep.avg/Math.max(1,data.sleepGoal)),
      trText('Сон ниже твоей цели.','Sleep is below your target.'),
      `${weeklyRound(summary.sleep.avg,1)} ${trText('ч в среднем','h avg')} · ${trText('цель','goal')}: ${data.sleepGoal} ${trText('ч','h')}`
    );
  }

  if(Number(data.englishGoal)>0){
    const expected=data.englishGoal*(e/7);
    add(
      'english',
      Math.min(1,summary.english.total/Math.max(1,expected)),
      trText('Подтянуть English до темпа недельной цели.','Bring English closer to the weekly-goal pace.'),
      `${weeklyFormatMinutes(summary.english.total)} · ${trText('ожидаемый темп к этому дню','expected pace by now')}: ${weeklyFormatMinutes(expected)}`
    );
  }

  if(Number(data.gymGoal)>0){
    const expected=data.gymGoal*(e/7);
    add(
      'gym',
      Math.min(1,summary.gym.sessions/Math.max(.25,expected)),
      trText('Вернуться к темпу тренировок.','Get back to your workout pace.'),
      `${summary.gym.sessions} ${trText('сессий','sessions')} · ${trText('недельная цель','weekly goal')}: ${data.gymGoal}`
    );
  }

  if(!candidates.length){
    return {
      id:'none',
      title:trText('Пока нет явного фокуса.','There is no clear focus yet.'),
      meta:trText('Продолжай обычный ритм и заполняй данные.','Keep your normal rhythm and continue logging.')
    };
  }

  candidates.sort((a,b)=>a.score-b.score);
  const worst=candidates[0];

  if(worst.score>=.90){
    return {
      id:'ontrack',
      title:trText('Явного слабого места нет — сохрани текущий ритм.','No clear weak spot — protect your current rhythm.'),
      meta:trText('Основные показатели близки к своим целям.','The main metrics are close to their targets.')
    };
  }
  return worst;
}
function weeklyMetricCards(summary){
  const e=summary.window.elapsed;
  const sameWeek=trText('vs те же дни прошлой недели','vs same days last week');

  const sleepDelta=summary.sleep.count&&summary.prevSleep.count
    ? weeklyRound(summary.sleep.avg-summary.prevSleep.avg,1):null;
  const stepsPct=summary.steps.count&&summary.prevSteps.count
    ? weeklyPctChange(summary.steps.avg,summary.prevSteps.avg):null;
  const proteinPct=summary.protein.count&&summary.prevProtein.count
    ? weeklyPctChange(summary.protein.avg,summary.prevProtein.avg):null;
  const outdoorsPct=summary.outdoors.count&&summary.prevOutdoors.count
    ? weeklyPctChange(summary.outdoors.avg,summary.prevOutdoors.avg):null;
  const englishPct=summary.english.total&&summary.prevEnglish.total
    ? weeklyPctChange(summary.english.total,summary.prevEnglish.total):null;
  const gymDiff=summary.gym.sessions-summary.prevGym.sessions;

  return [
    {
      id:'sleep',icon:'😴',name:trText('Сон','Sleep'),
      value:summary.sleep.count?`${weeklyRound(summary.sleep.avg,1)} ${trText('ч avg','h avg')}`:'—',
      meta:summary.sleep.count
        ?`${summary.sleep.count}/${e} ${trText('ночей записано','nights logged')} · ${trText('цель','goal')} ${data.sleepGoal}${trText('ч','h')}`
        :trText('Нет записей сна на этой неделе.','No sleep logged this week.'),
      delta:sleepDelta===null?'':`${weeklySigned(sleepDelta,trText(' ч',' h'))} ${sameWeek}`
    },
    {
      id:'steps',icon:'🚶',name:trText('Шаги','Steps'),
      value:summary.steps.count?`${Math.round(summary.steps.avg).toLocaleString((data.language||'ru')==='en'?'en-NZ':'ru-RU')} avg`:'—',
      meta:summary.steps.count
        ?`${summary.steps.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${summary.steps.count}/${e} ${trText('записано','logged')}`
        :trText('Нет записей шагов на этой неделе.','No steps logged this week.'),
      delta:stepsPct===null?'':`${weeklySigned(stepsPct,'%')} ${sameWeek}`
    },
    {
      id:'protein',icon:'🥩',name:trText('Белок','Protein'),
      value:summary.protein.count?`${weeklyRound(summary.protein.avg,1)} ${trText('г avg','g avg')}`:'—',
      meta:summary.protein.count
        ?`${summary.protein.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${summary.protein.count}/${e} ${trText('записано','logged')}`
        :trText('Нет записей белка на этой неделе.','No protein logged this week.'),
      delta:proteinPct===null?'':`${weeklySigned(proteinPct,'%')} ${sameWeek}`
    },
    {
      id:'outdoors',icon:'☀️',name:trText('Улица','Outdoors'),
      value:summary.outdoors.count?`${weeklyRound(summary.outdoors.avg,1)} ${trText('мин avg','min avg')}`:'—',
      meta:summary.outdoors.count
        ?`${summary.outdoors.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${summary.outdoors.count}/${e} ${trText('записано','logged')}`
        :trText('Нет записей улицы на этой неделе.','No outdoor time logged this week.'),
      delta:outdoorsPct===null?'':`${weeklySigned(outdoorsPct,'%')} ${sameWeek}`
    },
    {
      id:'gym',icon:'🏋️',name:trText('Тренировки','Workouts'),
      value:`${summary.gym.sessions} / ${data.gymGoal}`,
      meta:trText('сессий / недельная цель','sessions / weekly goal'),
      delta:gymDiff===0?'':`${weeklySigned(gymDiff)} ${trText('сессий','sessions')} ${sameWeek}`
    },
    {
      id:'english',icon:'🇬🇧',name:'English',
      value:weeklyFormatMinutes(summary.english.total),
      meta:`${Math.round(summary.english.total)} / ${Math.round(data.englishGoal)} ${trText('мин недельной цели','min weekly goal')}`,
      delta:englishPct===null?'':`${weeklySigned(englishPct,'%')} ${sameWeek}`
    },
    {
      id:'weight',icon:'⚖️',name:trText('Вес','Weight'),
      value:summary.weight.current?`${weeklyRound(summary.weight.current.value,1)} ${trText('кг','kg')}`:'—',
      meta:summary.weight.current
        ?`${weeklyFormatDate(summary.weight.current.date)} · ${trText('взвешивание этой недели','weigh-in this week')}`
        :(summary.weight.latestOverall
          ?`${trText('Последний','Latest')}: ${weeklyRound(summary.weight.latestOverall.value,1)} ${trText('кг','kg')} · ${weeklyFormatDate(summary.weight.latestOverall.date)}`
          :trText('Пока нет данных веса.','No weight data yet.')),
      delta:summary.weight.delta===null?'':`${weeklySigned(summary.weight.delta,trText(' кг',' kg'))} ${trText('с прошлого взвешивания','since previous weigh-in')}`,
      neutral:true
    },
    {
      id:'alcohol',icon:'🍷',name:trText('Без отметок об алкоголе','No alcohol marked'),
      value:summary.alcohol.tracked?`${summary.alcohol.free}/${summary.alcohol.tracked}`:'—',
      meta:summary.alcohol.tracked
        ?(summary.alcohol.drink
          ?`${summary.alcohol.drink} ${trText('дн. с алкоголем','drinking day(s)')}`
          :trText('по правилу календаря; не подтверждение трезвости','calendar assumption; not confirmed abstinence'))
        :trText('Эта неделя пока вне периода отслеживания.','This week is outside the tracking period.'),
      delta:''
    }
  ];
}
function renderWeeklyReview(){
  const grid=document.getElementById('weeklyMetricGrid');
  if(!grid)return;

  const summary=weeklyBuildSummary();
  const w=summary.window;
  const set=(id,value)=>{
    const el=document.getElementById(id);
    if(el)el.textContent=value;
  };

  set('weeklyReviewPeriod',weeklyPeriodLabel(w.start,w.end));
  set(
    'weeklyReviewScope',
    `${w.elapsed}/7 ${trText('дней недели прошло','days elapsed')} · ${trText('сравнение с теми же','compared with the same')} ${w.elapsed} ${trText('дн. прошлой недели','day(s) last week')}`
  );

  const status=document.getElementById('weeklyReviewStatus');
  if(status){
    status.textContent=w.complete?trText('Неделя завершена','Week complete'):trText('Неделя идёт','Week in progress');
    status.className='weekly-review-status'+(w.complete?' complete':'');
  }

  grid.innerHTML=weeklyMetricCards(summary).map(card=>`
    <div class="weekly-metric-card">
      <div class="weekly-metric-head"><span class="weekly-metric-icon">${card.icon}</span><span>${card.name}</span></div>
      <div class="weekly-metric-value">${card.value}</div>
      <div class="weekly-metric-meta">${card.meta}</div>
      ${card.delta?`<div class="weekly-metric-delta ${card.neutral?'neutral':''}">${card.delta}</div>`:''}
    </div>
  `).join('');

  const strongest=weeklyStrongest(summary);
  const changed=weeklyChanged(summary);
  const focus=weeklyFocus(summary);

  set('weeklyStrongestText',strongest.title);
  set('weeklyStrongestMeta',strongest.meta||'');
  set('weeklyChangedText',changed.title);
  set('weeklyChangedMeta',changed.meta||'');
  set('weeklyFocusText',focus.title);
  set('weeklyFocusMeta',focus.meta||'');
}
// V6.7_WEEKLY_REVIEW_END



// V6.7.4_SHARED_CHART_ENGINE_START
function sharedChartHTML(cfg){
  const {
    series,scale,formatY,formatX,periodLabel,
    selectedIndex=null,onSelectName,goal=null,
    connectAcrossMissing=false,bars=false,emptyText=''
  }=cfg;

  const recorded=series.filter(r=>r.value!==null&&r.value!==undefined);
  if(!bars&&recorded.length<2)return `<div class="trend-empty">${emptyText}</div>`;
  if(bars&&!series.length)return `<div class="trend-empty">${emptyText}</div>`;

  const W=1000,H=360,padT=15,padB=12;
  const n=Math.max(1,series.length-1);
  const x=index=>series.length<=1?W/2:W*(index/n);
  const min=scale.min,max=scale.max;
  const y=v=>padT+(H-padT-padB)*(1-(v-min)/(max-min));

  const grid=[0,.5,1].map(t=>{
    const yy=padT+(H-padT-padB)*t;
    return `<line class="trend-grid-line" x1="0" y1="${yy}" x2="${W}" y2="${yy}"></line>`;
  }).join('');

  const goalLine=(goal!==null&&goal!==undefined&&goal>=min&&goal<=max)
    ?`<line class="trend-goal-line" x1="0" y1="${y(goal)}" x2="${W}" y2="${y(goal)}"></line>`
    :'';

  let geometry='',hits='';

  if(bars){
    const base=y(Math.max(0,min));
    const barSpace=W/Math.max(1,series.length);
    const barW=Math.max(8,Math.min(60,barSpace*.56));

    geometry=series.map(r=>{
      if(r.value===null||r.value===undefined||r.value===0)return '';
      const xx=x(r.index)-barW/2,yy=y(r.value),hh=Math.max(3,base-yy);
      return `<rect class="trend-bar" x="${xx.toFixed(1)}" y="${yy.toFixed(1)}"
        width="${barW.toFixed(1)}" height="${hh.toFixed(1)}" rx="7"></rect>`;
    }).join('');

    hits=series.map(r=>{
      if(r.value===null||r.value===undefined||r.value===0)return '';
      const left=series.length<=1?50:(r.index/n)*100;
      const top=(y(r.value)/H)*100;
      const bottom=(1-y(Math.max(0,min))/H)*100;
      const height=Math.max(18,100-top-bottom);
      return `<button class="trend-bar-hit ${selectedIndex===r.index?'selected':''}"
        data-index="${r.index}" aria-label="${periodLabel(r)}"
        onclick="${onSelectName}(${r.index})"
        style="left:${left}%;top:${top}%;height:${height}%"></button>`;
    }).join('');
  }else{
    const segments=[];
    if(connectAcrossMissing){
      const all=series.filter(r=>r.value!==null&&r.value!==undefined)
        .map(r=>({...r,px:x(r.index),py:y(r.value)}));
      if(all.length)segments.push(all);
    }else{
      let current=[];
      for(const row of series){
        if(row.value===null||row.value===undefined){
          if(current.length){segments.push(current);current=[]}
          continue;
        }
        current.push({...row,px:x(row.index),py:y(row.value)});
      }
      if(current.length)segments.push(current);
    }

    const lines=[],areas=[];
    for(const segment of segments){
      if(segment.length<2)continue;
      const line=segment.map((p,i)=>(i?'L':'M')+p.px.toFixed(1)+','+p.py.toFixed(1)).join(' ');
      lines.push(`<path class="trend-line" d="${line}"></path>`);
      const area=`${line} L ${segment[segment.length-1].px.toFixed(1)},${y(min).toFixed(1)}
        L ${segment[0].px.toFixed(1)},${y(min).toFixed(1)} Z`;
      areas.push(`<path class="trend-area" d="${area}"></path>`);
    }
    geometry=areas.join('')+lines.join('');

    const pts=recorded.map((r,i)=>({
      ...r,
      px:series.length<=1?50:(r.index/n)*100,
      py:(y(r.value)/H)*100,
      latest:i===recorded.length-1
    }));
    hits=pts.map(p=>`<button
      class="trend-hit ${p.latest?'latest':''} ${selectedIndex===p.index?'selected':''}"
      data-index="${p.index}" aria-label="${periodLabel(p)} ${formatY(p.value)}"
      onclick="${onSelectName}(${p.index})"
      style="left:${p.px}%;top:${p.py}%"></button>`).join('');
  }

  const rawIndices=series.length>=7
    ?[0,Math.round((series.length-1)/3),Math.round((series.length-1)*2/3),series.length-1]
    :[0,Math.floor((series.length-1)/2),series.length-1];
  const idxs=rawIndices.filter((v,i,a)=>v>=0&&a.indexOf(v)===i);

  const xLabels=idxs.map((idx,pos)=>{
    const row=series[idx];
    return `<span class="trend-x-label ${pos===0?'first':(pos===idxs.length-1?'last':'')}"
      style="left:${series.length<=1?50:(idx/(series.length-1))*100}%">${formatX(row)}</span>`;
  }).join('');

  const yLabels=[max,(min+max)/2,min].map(v=>`<span>${formatY(v)}</span>`).join('');

  return `<div class="trend-chart-shell">
    <div class="trend-y-axis">${yLabels}</div>
    <div class="trend-plot">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="trendLineGradient" x1="0" x2="1">
            <stop offset="0" stop-color="#2cdfa7"/>
            <stop offset="1" stop-color="#7770ff"/>
          </linearGradient>
          <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2cdfa7" stop-opacity=".14"/>
            <stop offset="1" stop-color="#6b66ff" stop-opacity=".012"/>
          </linearGradient>
          <linearGradient id="trendBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#78ffda"/>
            <stop offset="1" stop-color="#6d68ff"/>
          </linearGradient>
        </defs>
        ${grid}${goalLine}${geometry}
      </svg>
      ${hits}
    </div>
    <div></div>
    <div class="trend-x-axis">${xLabels}</div>
  </div>`;
}
// V6.7.4_SHARED_CHART_ENGINE_END

// V6.7.3_TRENDS_START
const TREND_METRICS=[
  {id:'weight',icon:'⚖️',ru:'Вес',en:'Weight',unitRu:'кг',unitEn:'kg',kind:'line'},
  {id:'sleep',icon:'😴',ru:'Сон',en:'Sleep',unitRu:'ч',unitEn:'h',kind:'line'},
  {id:'steps',icon:'🚶',ru:'Шаги',en:'Steps',unitRu:'',unitEn:'',kind:'line'},
  {id:'protein',icon:'🥩',ru:'Белок',en:'Protein',unitRu:'г',unitEn:'g',kind:'line'},
  {id:'outdoors',icon:'☀️',ru:'Улица',en:'Outdoors',unitRu:'мин',unitEn:'min',kind:'line'},
  {id:'gym',icon:'🏋️',ru:'Тренировки',en:'Workouts',unitRu:'',unitEn:'',kind:'bars'},
  {id:'english',icon:'🇬🇧',ru:'English',en:'English',unitRu:'мин',unitEn:'min',kind:'line'},
  {id:'energy',icon:'◒',ru:'Энергетический баланс',en:'Energy Balance',unitRu:'ккал',unitEn:'kcal',kind:'line'}
];

let trendSelectedPoint=null;

function trendMetricDef(id){
  return TREND_METRICS.find(x=>x.id===id)||TREND_METRICS[0];
}
function trendMetricName(id){
  const m=trendMetricDef(id);
  return (data.language||'ru')==='en'?m.en:m.ru;
}
function trendMetricUnit(id){
  const m=trendMetricDef(id);
  return (data.language||'ru')==='en'?m.unitEn:m.unitRu;
}
function trendGoal(id){
  if(id==='sleep')return Number(data.sleepGoal)||null;
  if(id==='steps')return Number(data.stepsGoal)||null;
  if(id==='protein')return Number(data.proteinGoal)||null;
  if(id==='outdoors')return Number(data.outdoorsGoal)||null;
  return null;
}
function trendRangeKey(){
  if(trendRangeDays==='all')return 'all';
  if(Number(trendRangeDays)===365)return 'year';
  if(Number(trendRangeDays)===90)return 'quarter';
  if(Number(trendRangeDays)===30)return 'month';
  return 'week';
}
function trendGoalForChart(id){
  const range=trendRangeKey();
  if(range==='quarter'){
    if(id==='english')return Number(data.englishGoal)||null;
    if(id==='gym')return Number(data.gymGoal)||null;
  }
  if(range==='year'){
    if(id==='english')return Number(data.englishGoal)?Number(data.englishGoal)*52/12:null;
    if(id==='gym')return Number(data.gymGoal)?Number(data.gymGoal)*52/12:null;
  }
  if(range==='all'){
    if(id==='english')return Number(data.englishGoal)?Number(data.englishGoal)*13:null;
    if(id==='gym')return Number(data.gymGoal)?Number(data.gymGoal)*13:null;
  }
  return trendGoal(id);
}
function trendValueForDay(id,dateKey){
  const row=data.logs?.[dateKey]||{};

  if(id==='english'){
    const v=activityMinutes(dateKey);
    const hasLegacy=Object.keys(row).some(k=>k.startsWith('english_')&&weeklyHasOwn(row,k));
    return hasLegacy||data.englishActivity.entries.some(e=>e.date===dateKey)?v:null;
  }

  if(id==='gym'){
    return row.gym===true?1:row.gym===false?0:null;
  }

  const raw=nutritionMetricValue(id,dateKey);
  if(id==='protein'?raw===null:(!weeklyHasOwn(row,id)||typeof row[id]==='boolean'))return null;
  const n=Number(raw);
  if(!Number.isFinite(n))return null;
  if(id==='weight')return n>0?n:null;
  return n>=0?n:null;
}
function trendDateObj(dateKey){return weeklyParseDate(dateKey)}
function trendLocalDate(d){return localDate(d)}
function trendAddDays(dateKey,n){return weeklyAddDays(dateKey,n)}
function trendMonday(dateKey){return weeklyMonday(dateKey)}
function trendQuarterStart(dateKey){
  const d=trendDateObj(dateKey);
  const qMonth=Math.floor(d.getMonth()/3)*3;
  return trendLocalDate(new Date(d.getFullYear(),qMonth,1,12));
}
function trendMonthEnd(dateKey){
  const d=trendDateObj(dateKey);
  return trendLocalDate(new Date(d.getFullYear(),d.getMonth()+1,0,12));
}
function trendQuarterEnd(dateKey){
  const d=trendDateObj(dateKey);
  const qMonth=Math.floor(d.getMonth()/3)*3;
  return trendLocalDate(new Date(d.getFullYear(),qMonth+3,0,12));
}
function trendAddMonths(dateKey,n){
  const d=trendDateObj(dateKey);
  return trendLocalDate(new Date(d.getFullYear(),d.getMonth()+n,1,12));
}
function trendEarliestMetricDate(id){
  const keys=[...new Set([...Object.keys(data.logs||{}),...(id==='protein'?nutritionStore().entries.map(e=>e.date):[]),...(id==='english'?data.englishActivity.entries.map(e=>e.date):[])])].sort();
  return keys.find(k=>trendValueForDay(id,k)!==null)||localDate();
}
function trendDailyRange(start,end){
  const out=[];
  for(let d=start;;d=trendAddDays(d,1)){
    out.push(d);
    if(d>=end)break;
  }
  return out;
}
function trendRawSeries(id){
  const today=localDate();

  if(trendRangeDays==='all'){
    const start=trendEarliestMetricDate(id);
    return trendDailyRange(start,today).map((date,index)=>({
      date,index,value:trendValueForDay(id,date)
    }));
  }

  const n=Number(trendRangeDays)||7;
  const keys=dates(n);
  return keys.map((date,index)=>({date,index,value:trendValueForDay(id,date)}));
}
function trendRecorded(series,id){
  if(id==='gym')return series;
  return series.filter(x=>x.value!==null);
}
function trendSetRange(n){
  trendRangeDays=n;
  trendSelectedPoint=null;
  renderTrends();
}
function setTrendRange(n){
  const allowed=[7,30,90,365,'all'];
  if(!allowed.includes(n))n=7;
  trendSetRange(n);
}
function setTrendMetric(id){
  if(!TREND_METRICS.some(x=>x.id===id))return;
  trendMetricId=id;
  trendSelectedPoint=null;
  renderTrends();
}
function trendFormatNumber(v,id=trendMetricId){
  if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';
  const n=Number(v);
  if(id==='steps')return Math.round(n).toLocaleString((data.language||'ru')==='en'?'en-NZ':'ru-RU');
  if(id==='gym')return String(Math.round(n));
  const rounded=Math.round(n*10)/10;
  return String(rounded);
}
function trendFormatDate(dateKey){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return trendDateObj(dateKey).toLocaleDateString(locale,{day:'numeric',month:'short'});
}
function trendFormatMonth(dateKey){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return trendDateObj(dateKey).toLocaleDateString(locale,{month:'short',year:'numeric'});
}
function trendFormatMonthShort(dateKey){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return trendDateObj(dateKey).toLocaleDateString(locale,{month:'short'});
}
function trendQuarterLabel(dateKey,withYear=true){
  const d=trendDateObj(dateKey);
  const q=Math.floor(d.getMonth()/3)+1;
  return withYear?`Q${q} ${d.getFullYear()}`:`Q${q}`;
}
function trendPeriodLabel(row){
  if(!row)return '';
  if(row.bucket==='week'){
    return `${trendFormatDate(row.startDate)} – ${trendFormatDate(row.endDate)}`;
  }
  if(row.bucket==='month'){
    return trendFormatMonth(row.startDate);
  }
  if(row.bucket==='quarter'){
    return trendQuarterLabel(row.startDate,true);
  }
  return trendFormatDate(row.date);
}
function trendBucketValue(id,rows){
  if(id==='gym'){
    return {
      value:rows.filter(r=>r.value===1).length,
      logged:rows.filter(r=>r.value===1).length
    };
  }

  const vals=rows.filter(r=>r.value!==null).map(r=>Number(r.value));
  if(!vals.length)return {value:null,logged:0};

  if(id==='english'){
    return {value:vals.reduce((s,v)=>s+v,0),logged:vals.length};
  }

  return {
    value:vals.reduce((s,v)=>s+v,0)/vals.length,
    logged:vals.length
  };
}
function trendAggregateWeekly(id,daily){
  if(!daily.length)return [];
  const first=trendMonday(daily[0].date);
  const last=trendMonday(daily[daily.length-1].date);
  const starts=[];
  for(let s=first;;s=trendAddDays(s,7)){
    starts.push(s);
    if(s===last)break;
  }

  return starts.map((startDate,index)=>{
    const endDate=trendAddDays(startDate,6);
    const rows=daily.filter(r=>r.date>=startDate && r.date<=endDate);
    const agg=trendBucketValue(id,rows);
    return {date:startDate,startDate,endDate,index,bucket:'week',...agg};
  });
}
function trendLast12MonthStarts(){
  const today=trendDateObj(localDate());
  const current=new Date(today.getFullYear(),today.getMonth(),1,12);
  const out=[];
  for(let i=11;i>=0;i--){
    out.push(trendLocalDate(new Date(current.getFullYear(),current.getMonth()-i,1,12)));
  }
  return out;
}
function trendAggregateMonthly(id,daily){
  const starts=trendLast12MonthStarts();
  return starts.map((startDate,index)=>{
    const endDate=trendMonthEnd(startDate);
    const rows=daily.filter(r=>r.date>=startDate && r.date<=endDate);
    const agg=trendBucketValue(id,rows);
    return {date:startDate,startDate,endDate,index,bucket:'month',...agg};
  });
}
function trendQuarterStartsFromMetric(id){
  const first=trendQuarterStart(trendEarliestMetricDate(id));
  const last=trendQuarterStart(localDate());
  const out=[];
  for(let s=first;;s=trendAddMonths(s,3)){
    out.push(s);
    if(s===last)break;
  }
  return out;
}
function trendAggregateQuarterly(id,daily){
  const starts=trendQuarterStartsFromMetric(id);
  return starts.map((startDate,index)=>{
    const endDate=trendQuarterEnd(startDate);
    const rows=daily.filter(r=>r.date>=startDate && r.date<=endDate);
    const agg=trendBucketValue(id,rows);
    return {date:startDate,startDate,endDate,index,bucket:'quarter',...agg};
  });
}
function trendChartSeries(id,daily){
  const range=trendRangeKey();
  if(range==='quarter')return trendAggregateWeekly(id,daily);
  if(range==='year')return trendAggregateMonthly(id,daily);
  if(range==='all')return trendAggregateQuarterly(id,daily);
  return daily.map(r=>({...r,startDate:r.date,endDate:r.date,bucket:'day',logged:r.value!==null?1:0}));
}
function trendAggregationText(id){
  const range=trendRangeKey();

  if(range==='week'){
    return trText(
      '7 дней: каждое записанное дневное значение. Нажми на точку, чтобы увидеть цифру.',
      '7 days: every logged daily value. Tap a point to see the exact value.'
    );
  }
  if(range==='month'){
    return trText(
      '30 дней: дневные значения; пропуски не превращаются в нули. Нажми на точку.',
      '30 days: daily values; missing days are not converted to zero. Tap a point.'
    );
  }
  if(range==='quarter'){
    if(id==='english')return trText(
      '3 месяца: сумма English по каждой календарной неделе. Нажми на точку.',
      '3 months: total English time by calendar week. Tap a point.'
    );
    if(id==='gym')return trText(
      '3 месяца: количество тренировок за каждую календарную неделю. Нажми на столбец.',
      '3 months: workouts per calendar week. Tap a bar.'
    );
    return trText(
      '3 месяца: среднее по записанным дням каждой календарной недели. Нажми на точку.',
      '3 months: average across logged days in each calendar week. Tap a point.'
    );
  }
  if(range==='year'){
    if(id==='english')return trText(
      '1 год: 12 точек — сумма English за каждый месяц.',
      '1 year: 12 points — total English time for each month.'
    );
    if(id==='gym')return trText(
      '1 год: 12 столбцов — количество тренировок за каждый месяц.',
      '1 year: 12 bars — workout count for each month.'
    );
    return trText(
      '1 год: 12 точек — среднее значение за каждый календарный месяц.',
      '1 year: 12 points — average value for each calendar month.'
    );
  }

  if(id==='english')return trText(
    'Всё время: одна точка = сумма English за квартал.',
    'All time: one point = total English time for a quarter.'
  );
  if(id==='gym')return trText(
    'Всё время: один столбец = количество тренировок за квартал.',
    'All time: one bar = workout count for a quarter.'
  );
  return trText(
    'Всё время: одна точка = среднее значение за квартал.',
    'All time: one point = average value for a quarter.'
  );
}
function trendSummary(id,daily){
  const recorded=trendRecorded(daily,id);
  const unit=trendMetricUnit(id);
  const spacedUnit=unit?` ${unit}`:'';
  const rangeLabel=trendRangeDays==='all'
    ?trText('за всё время','all time')
    :`${trendRangeDays} ${trText('дней','days')}`;

  if(id==='gym'){
    const sessions=daily.filter(x=>x.value===1).length;
    return {
      primary:`${sessions} ${trText('сесс.','sessions')}`,
      secondary:`${rangeLabel} · ${trText('недельная цель','weekly goal')} ${data.gymGoal}`,
      change:'',
      neutral:false
    };
  }

  if(!recorded.length){
    return {
      primary:'—',
      secondary:trText('За выбранный период записей нет.','No entries in the selected period.'),
      change:'',
      neutral:true
    };
  }

  const first=recorded[0],last=recorded[recorded.length-1];
  const avg=recorded.reduce((s,x)=>s+x.value,0)/recorded.length;

  if(id==='weight'){
    const delta=recorded.length>1?Math.round((last.value-first.value)*10)/10:null;
    return {
      primary:`${trendFormatNumber(last.value,id)}${spacedUnit}`,
      secondary:`${trendFormatDate(last.date)} · ${recorded.length} ${trText('взвешиваний','weigh-ins')}`,
      change:delta===null?'':`${weeklySigned(delta,spacedUnit)} ${trText('за период','over range')}`,
      neutral:true
    };
  }

  if(id==='english'){
    const total=recorded.reduce((s,x)=>s+x.value,0);
    return {
      primary:weeklyFormatMinutes(total),
      secondary:`${recorded.length} ${trText('дней с практикой','days with practice')} · ${rangeLabel}`,
      change:`${trText('Среднее','Average')}: ${trendFormatNumber(avg,id)} ${trText('мин/день практики','min/practice day')}`,
      neutral:false
    };
  }

  const goal=trendGoal(id);
  const goalDays=goal?recorded.filter(x=>x.value>=goal).length:null;

  return {
    primary:`${trendFormatNumber(avg,id)}${spacedUnit} avg`,
    secondary:goal
      ?`${recorded.length} ${trText('дней записано','days logged')} · ${goalDays} ${trText('дн. на цели','days at goal')}`
      :`${recorded.length} ${trText('дней записано','days logged')}`,
    change:recorded.length>1
      ?`${trendFormatNumber(first.value,id)} → ${trendFormatNumber(last.value,id)}${spacedUnit}`
      :'',
    neutral:false
  };
}
function trendScale(id,series){
  const values=series.filter(r=>r.value!==null).map(r=>Number(r.value));
  const goal=trendGoalForChart(id);
  if(goal!==null && goal!==undefined && Number.isFinite(goal))values.push(goal);

  if(!values.length)return {min:0,max:1};

  let min=Math.min(...values),max=Math.max(...values);

  if(id==='weight'){
    const center=(min+max)/2;
    const span=Math.max(4,max-min);
    min=center-span/2-.4;
    max=center+span/2+.4;
    min=Math.floor(min*2)/2;
    max=Math.ceil(max*2)/2;
    return {min,max};
  }

  if(id==='sleep'){
    const center=(min+max)/2;
    const span=Math.max(3,max-min);
    min=Math.max(0,Math.floor((center-span/2-.35)*2)/2);
    max=Math.ceil((center+span/2+.35)*2)/2;
    return {min,max};
  }

  max=Math.max(max,1)*1.10;

  if(id==='steps')max=Math.ceil(max/1000)*1000;
  else if(id==='english')max=Math.ceil(max/60)*60;
  else if(id==='outdoors')max=Math.ceil(max/30)*30;
  else if(id==='protein')max=Math.ceil(max/20)*20;
  else if(id==='gym')max=Math.max(1,Math.ceil(max));
  else max=Math.ceil(max);

  return {min:0,max};
}
function trendPointDetailText(id,row){
  const unit=trendMetricUnit(id);
  const spacedUnit=unit?` ${unit}`:'';

  let value='';
  if(id==='english')value=weeklyFormatMinutes(row.value||0);
  else if(id==='gym')value=`${trendFormatNumber(row.value,id)} ${trText('тренировок','workouts')}`;
  else value=`${trendFormatNumber(row.value,id)}${spacedUnit}`;

  let meta='';
  if(row.bucket==='day'){
    meta=trText('Дневное значение','Daily value');
  }else if(id==='english'){
    meta=`${row.logged||0} ${trText('дней с практикой внутри периода','practice days in this period')}`;
  }else if(id==='gym'){
    meta=trText('Количество тренировок в периоде','Workout count in this period');
  }else{
    meta=`${trText('Среднее по','Average across')} ${row.logged||0} ${trText('записанным дням','logged days')}`;
  }

  return {period:trendPeriodLabel(row),value,meta};
}
function selectTrendPoint(index){
  if(trendMetricId==='energy'){energyRenderProgress();return}
  const daily=trendRawSeries(trendMetricId);
  const chartSeries=trendChartSeries(trendMetricId,daily);
  const row=chartSeries[Number(index)];
  if(!row || row.value===null)return;

  trendSelectedPoint=Number(index);

  const detail=document.getElementById('trendPointDetail');
  const p=document.getElementById('trendPointDetailPeriod');
  const v=document.getElementById('trendPointDetailValue');
  const m=document.getElementById('trendPointDetailMeta');

  const txt=trendPointDetailText(trendMetricId,row);
  if(detail)detail.hidden=false;
  if(p)p.textContent=txt.period;
  if(v)v.textContent=txt.value;
  if(m)m.textContent=txt.meta;

  document.querySelectorAll('.trend-hit,.trend-bar-hit').forEach(el=>{
    el.classList.toggle('selected',Number(el.dataset.index)===trendSelectedPoint);
  });
}
function trendChartHTML(id,series){
  return sharedChartHTML({
    series,
    scale:trendScale(id,series),
    goal:trendGoalForChart(id),
    selectedIndex:trendSelectedPoint,
    onSelectName:'selectTrendPoint',
    connectAcrossMissing:id==='weight',
    bars:id==='gym',
    emptyText:trText(
      'Для графика нужно минимум две записи за выбранный период.',
      'At least two entries are needed for a chart in this range.'
    ),
    formatY:(v)=>trendFormatNumber(v,id),
    periodLabel:(row)=>trendPeriodLabel(row),
    formatX:(row)=>{
      if(row.bucket==='month')return trendFormatMonthShort(row.startDate);
      if(row.bucket==='quarter')return trendQuarterLabel(row.startDate,true);
      if(row.bucket==='week')return trendFormatDate(row.startDate);
      return trendFormatDate(row.date);
    }
  });
}
function renderTrends(){
  const host=document.getElementById('trendChartHost');
  if(!host)return;

  const buttons=[
    ['trendRange7Btn',7],
    ['trendRange30Btn',30],
    ['trendRange90Btn',90],
    ['trendRange365Btn',365],
    ['trendRangeAllBtn','all']
  ];
  buttons.forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el)el.className=trendRangeDays===value?'secondary':'ghost';
  });

  const tabs=document.getElementById('trendMetricTabs');
  if(tabs){
    tabs.innerHTML=TREND_METRICS.map(m=>`
      <button class="trend-metric-tab ${trendMetricId===m.id?'active':''}" onclick="setTrendMetric('${m.id}')">
        ${m.icon} ${(data.language||'ru')==='en'?m.en:m.ru}
      </button>
    `).join('');
  }

  if(trendMetricId==='energy'){energyRenderProgress();return}
  const daily=trendRawSeries(trendMetricId);
  const chartSeries=trendChartSeries(trendMetricId,daily);
  const summary=trendSummary(trendMetricId,daily);
  const def=trendMetricDef(trendMetricId);

  const title=document.getElementById('trendTitle');
  const primary=document.getElementById('trendPrimary');
  const secondary=document.getElementById('trendSecondary');
  const change=document.getElementById('trendChange');
  const aggregation=document.getElementById('trendAggregationNote');
  const detail=document.getElementById('trendPointDetail');

  if(title)title.textContent=`${def.icon} ${trendMetricName(trendMetricId)}`;
  if(primary)primary.textContent=summary.primary;
  if(secondary)secondary.textContent=summary.secondary;
  if(change){
    change.textContent=summary.change||trText('Выбери показатель','Choose a metric');
    change.className='trend-change'+(summary.neutral?' neutral':'');
  }
  if(aggregation)aggregation.textContent=trendAggregationText(trendMetricId);
  if(detail && trendSelectedPoint===null)detail.hidden=true;

  host.innerHTML=trendChartHTML(trendMetricId,chartSeries);
  renderDataCoverage();

  if(trendSelectedPoint!==null){
    const selected=chartSeries[trendSelectedPoint];
    if(selected && selected.value!==null)selectTrendPoint(trendSelectedPoint);
    else{
      trendSelectedPoint=null;
      if(detail)detail.hidden=true;
    }
  }
}
// V6.7.3_TRENDS_END

function renderProgress(){renderSimpleProgress();renderTrends();renderCalendar();renderDataCoverage()}
function moveMonth(n){calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+n,1);renderCalendar()}
function renderCalendar(){
 const y=calendarDate.getFullYear(),m=calendarDate.getMonth();
 document.getElementById('calendarTitle').textContent=CALENDAR_MONTHS[calendarLanguage()][m]+' '+y;
 document.getElementById('progressCalendarControls').innerHTML=calendarControls('progress',y,m);
 document.getElementById('calendarGrid').innerHTML=calendarMonthHTML(y,m,{context:'progress',onDay:'calendarOpenHistoryDay',marker:d=>{const filled=Object.keys(data.logs[d]||{}).filter(k=>k!=='habitDetails'&&weeklyHasOwn(data.logs[d],k)).length+(nutritionRows(d).length?1:0);return {className:filled>=5?'good':filled>=2?'mid':'',dot:filled>0,label:filled?trText('Есть записи','Recorded day'):trText('Нет записей','No records')}}});
}
function calendarOpenHistoryDay(key){if(!validDay(key)||key>localDate())return;setTodayDate(key);show('today')}


function openExperiment(){document.getElementById('experimentModal')?.classList.add('show')}
function saveExperiment(){
 const nameEl=document.getElementById('expName'),metricEl=document.getElementById('expMetric'),targetEl=document.getElementById('expTarget'),daysEl=document.getElementById('expDays'),hypEl=document.getElementById('expHypothesis');
 const name=(nameEl?.value||'').trim();if(!name)return;
 data.experiments.push({id:'exp_'+Date.now(),name,metric:metricEl?.value||'outdoors',target:Number(targetEl?.value||0),days:Number(daysEl?.value||30),start:localDate(),hypothesis:(hypEl?.value||'').trim(),status:'active'});
 if(nameEl)nameEl.value='';if(targetEl)targetEl.value='';if(daysEl)daysEl.value='30';if(hypEl)hypEl.value='';
 closeModal('experimentModal');save()
}
function expProgress(e){const elapsed=Math.max(0,weeklyDiffDays(e.start,localDate())+1);return Number.isFinite(elapsed)?Math.min(100,pct(elapsed,e.days)):0}
function renderExperiments(){const host=document.getElementById('experimentsList');if(!host)return;host.innerHTML='';if(!data.experiments.length){host.innerHTML='<div class="insight-card">'+trText('Пример: 30 дней гулять по 60 минут и сравнить сон.','Example: walk for 60 minutes for 30 days and compare sleep.')+'</div>';return}data.experiments.forEach(e=>{const t=tracker(e.metric),p=expProgress(e),el=document.createElement('div');el.className='experiment';el.innerHTML=`<div class="exp-head"><div><div class="title">${escapeHTML(t?.icon||'🧪')} ${escapeHTML(e.name)}</div><div class="small">${escapeHTML(e.hypothesis||trText('Без гипотезы','No hypothesis'))}</div></div><span class="exp-status">${e.status==='active'?trText('Активен','Active'):trText('Завершён','Done')}</span></div><div class="progress"><span style="width:${p}%"></span></div><div class="small" style="margin-top:7px">${trText('Цель','Goal')}: ${escapeHTML(e.target||'—')} ${escapeHTML(t?.unit||'')} · ${escapeHTML(e.days)} ${trText('дней','days')} · ${p}%</div><div style="margin-top:9px"><button class="secondary" style="padding:8px 10px">${e.status==='active'?trText('Завершить','Finish'):trText('Возобновить','Resume')}</button> <button class="ghost" style="padding:8px 10px">${trText('Удалить','Delete')}</button></div>`;const bs=el.querySelectorAll('button');bs[0].onclick=()=>{e.status=e.status==='active'?'done':'active';save()};bs[1].onclick=()=>{if(confirm((data.language||'ru')==='en'?'Delete this experiment?':'Удалить эксперимент?')){data.experiments=data.experiments.filter(x=>x.id!==e.id);save()}};host.appendChild(el)})}

function formatBackupDate(value){
  if(!value)return trText('Никогда','Never');
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return trText('Никогда','Never');
  return d.toLocaleDateString((data.language||'ru')==='en'?'en-NZ':'ru-RU',{
    day:'numeric',month:'short',year:'numeric'
  });
}

function updateStorageSafetyUI(){
  const h=window.__vaultHealth||{};
  const flags=[h.primary,h.mirror,h.idb,h.cache];
  const copies=flags.filter(Boolean).length;

  const status=document.getElementById('vaultStatusText');
  const snaps=document.getElementById('vaultSnapshotText');
  const last=document.getElementById('lastBackupText');
  const reminder=document.getElementById('backupReminder');

  if(status){
    status.textContent=copies
      ? `${copies}/4 ${trText('локальных копий','local copies')}`
      : trText('Проверяем…','Checking…');
    status.className=copies>=3?'storage-ok':(copies?'storage-warn':'');
  }

  if(snaps)snaps.textContent=h.snapshots!==undefined?String(h.snapshots):'—';
  if(last)last.textContent=formatBackupDate(data.lastExternalBackupAt);

  if(reminder){
    let old=true;
    if(data.lastExternalBackupAt){
      const ms=Date.now()-Date.parse(data.lastExternalBackupAt);
      old=!Number.isFinite(ms)||ms>7*86400000;
    }
    reminder.textContent=old
      ? trText('⚠️ Внешнего backup нет или он старше 7 дней. Локальные копии не переживут удаление PWA/очистку Safari.','⚠️ No recent external backup. Local copies may not survive deleting the PWA or clearing Safari data.')
      : trText('✓ Внешний backup свежий.','✓ External backup is recent.');
    reminder.className='backup-reminder '+(old?'warn':'ok');
  }
}

function renderSettings(){
 energyRenderSettings();
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??''};
 set('smokeDate',data.smokeDate);set('alcoholDate',alcoholTrackingStart());set('stepsGoal',data.stepsGoal);set('outdoorsGoal',data.outdoorsGoal);set('sleepGoal',data.sleepGoal);set('englishGoal',data.englishGoal);set('gymGoal',data.gymGoal);
 for(const id of ['smokeDate','alcoholDate'])document.getElementById(id).max=localDate();
 document.getElementById('alcoholDerivedDate').textContent=trText('Текущая серия (расчёт): ','Current streak (calculated): ')+(alcoholCurrentStreakStart()||'—');
 renderGoalRuleSettings();
 const draft=document.getElementById('conflictDraftButton');if(draft)draft.hidden=!((typeof unsavedConflict!=='undefined'&&unsavedConflict)||storageGet('my-rhythm-conflict-draft'));
 const av=document.getElementById('appVersionText');if(av)av.textContent='V'+APP_VERSION;
 const sv=document.getElementById('schemaVersionText');if(sv)sv.textContent=String(data.schemaVersion||CURRENT_SCHEMA_VERSION);

 const d=window.__dataDiagnostic||{source:'—',sources:[]};
 const ds=document.getElementById('dataSourceText');
 const dl=document.getElementById('dataLogDaysText');
 const da=document.getElementById('dataAlcoholDatesText');
 const db=document.getElementById('dataBodyCheckinsText');
 const dd=document.getElementById('dataSourcesDetails');

 if(ds)ds.textContent=d.source||'—';
 if(dl)dl.textContent=String(Object.keys(data.logs||{}).length);
 if(da)da.textContent=String(Object.values(data.alcoholHistory||{}).filter(Boolean).length);
 if(db)db.textContent=String(Object.values(data.bodyMeasurements||{}).filter(row=>row&&typeof row==='object'&&Object.values(row).some(v=>Number(v)>0)).length);
 if(dd)dd.textContent=(d.sources||[]).map(x=>`${x.key}: ${x.logDays} ${trText('дней','days')}`).join(' · ');

 updateStorageSafetyUI();
 renderExperiments();
}
function render(){applyTheme();nutritionRender();for(const job of [renderToday,renderProgress,renderSettings]){try{job()}catch(e){console.error('Render error in '+job.name,e)}}if(typeof energyRefresh==='function')energyRefresh();try{translateDOM();enhanceDateInputs()}catch(e){console.error('Translation error',e)}}

let appActiveDate=localDate();
function checkAppDayRollover(){
  const today=localDate();
  if(today===appActiveDate)return false;
  appActiveDate=today;
  render();
  return true;
}

if('serviceWorker'in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
render();
recoverFromVaults()
  .then(()=>{
    resetStorageBaseline();
    document.body.classList.remove('loading-data');
    appActiveDate=localDate();
    render();
  })
  .catch(err=>{document.body.classList.remove('loading-data');console.warn('Vault recovery failed',err);updateStorageSafetyUI()});

addEventListener('focus',checkAppDayRollover);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)checkAppDayRollover();
});
setInterval(checkAppDayRollover,60000);

addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
 if(document.getElementById('nutritionForm')?.classList.contains('show'))return nutritionCancelForm();
 if(document.getElementById('nutritionImportPreview')?.classList.contains('show'))return nutritionCancelImport();
 if(document.getElementById('moduleModal')?.classList.contains('show'))return closeModule();
  if(document.getElementById('habitModal')?.classList.contains('show'))return closeHabitEditor();
  if(document.getElementById('motivationModal')?.classList.contains('show'))return closeMotivationDetail();
  if(document.getElementById('bodyCheckinModal')?.classList.contains('show'))return closeBodyCheckin();
  if(document.getElementById('bodyModal')?.classList.contains('show'))return closeBody();
  if(document.getElementById('alcoholModal')?.classList.contains('show'))return closeAlcohol();
})
