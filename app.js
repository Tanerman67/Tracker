let data=loadData();
resetStorageBaseline();
let activeTracker=null,trendRangeDays=7,trendMetricId='steps',calendarDate=new Date();

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
['Экспорт подготовлен. Проверь, что файл сохранён в Files/iCloud Drive.','Export prepared. Check that the file was saved in Files/iCloud Drive.'],

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
 if(id==='english')return;
 if(currentSection==='settings'&&id!=='settings'&&!settingsMayLeave())return;
 const section=document.getElementById(id);if(!section)return;
 if(currentSection==='nutritionModal'&&id!==currentSection){if(nutritionCancelForm()===false)return;nutritionCancelImport()}
 if(currentSection!==id){sectionScroll[currentSection]=window.scrollY||0;previousSection=currentSection;}
 document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));section.classList.add('active');
 const tabIds={today:'tabToday',nutritionModal:'tabNutrition',progress:'tabProgress',settings:'tabSettings',bodyModal:'tabProgress'};
 document.querySelectorAll('.tab').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current')});
 btn=btn||document.getElementById(tabIds[id]);if(btn){btn.classList.add('active');btn.setAttribute('aria-current','page')}
 const changed=currentSection!==id;currentSection=id;
 if(id==='nutritionModal')nutritionRender();
 if(changed)window.scrollTo?.(0,sectionScroll[id]||0);
 enhanceDateInputs();
}
function openEntry(id,dateKey=localDate()){if(id==='protein')return nutritionOpen(dateKey);activeTracker=tracker(id);if(!activeTracker){alert(trText('Трекер не найден.','Tracker not found.'));return}activeTracker={...activeTracker,entryDate:dateKey};const unit=trUnit(activeTracker);document.getElementById('entryTitle').textContent=trTrackerName(activeTracker);document.getElementById('entryLabel').textContent=trText('Значение','Value')+(unit?' ('+unit+')':'')+' · '+dateKey;document.getElementById('entryValue').value=(id==='protein'?data.logs?.[dateKey]?.protein:val(id,dateKey))??'';document.getElementById('entryModal').classList.add('show');uiRememberForm('entryModal');setTimeout(()=>document.getElementById('entryValue').focus(),80)}
function openEnglish(id){const type=englishTypes.find(x=>x[0]===id);if(!type)return;activeTracker={id,name:type[2],icon:type[1],type:'number',unit:'мин',category:'english'};document.getElementById('entryTitle').textContent=type[2];document.getElementById('entryLabel').textContent=trText('Всего минут сегодня','Total minutes today');document.getElementById('entryValue').value=val(id)??'';document.getElementById('entryModal').classList.add('show');uiRememberForm('entryModal');setTimeout(()=>document.getElementById('entryValue').focus(),80)}
async function saveEntry(){
 if(!activeTracker||activeTracker.id==='protein')return;
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
 if(await save()===false)return false;
 closeModal('entryModal',true)
}
function closeModal(id,force=false){if(!force&&!uiConfirmDiscard(id))return false;document.getElementById(id).classList.remove('show')}
async function deleteEntry(){
 if(!activeTracker||!confirm(trText('Удалить эту запись?','Delete this entry?')))return;
 const date=activeTracker.entryDate||localDate(),row=data.logs?.[date];
 if(row){delete row[activeTracker.id];if(!Object.keys(row).length)delete data.logs[date]}
 if(await save()===false)return false;closeModal('entryModal',true);
}
function saveSettings(){return saveUnifiedSettings()}
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

async function toggleAlcoholDay(dateKey){
  if(!alcoholIsTrackedPast(dateKey))return;
  const hist=alcoholHistory();
  if(hist[dateKey])delete hist[dateKey];else hist[dateKey]=true;
  syncAlcoholDerivedDate();
  if(await persistData({renderAfter:true,makeSnapshot:true})===false)return false;
  renderAlcoholCalendar();
}
function alcoholDayClass(dateKey){
  if(dateKey<alcoholTrackingStart())return 'untracked';
  if(dateKey>alcoholTodayKey())return 'future';
  return alcoholIsDrink(dateKey)?'drank':'sober';
}
function alcoholMonthHTML(year,monthIndex){
 return `<div class="alcohol-month-card"><div class="alcohol-month-title">${CALENDAR_MONTHS[calendarLanguage()][monthIndex]}</div>${calendarMonthHTML(year,monthIndex,{context:'alcohol',onDay:'toggleAlcoholDay',min:alcoholTrackingStart()||localDate(),marker:key=>{const cls=alcoholDayClass(key);return {className:cls,pressed:cls==='drank',disabled:cls==='untracked',label:cls==='drank'?trText('Пил алкоголь','Drank alcohol'):cls==='sober'?trText('Без алкоголя','Alcohol-free'):''}}})}</div>`;
}
function renderAlcoholCalendar(){
  if(!document.getElementById('alcoholModal'))return;
  const lang=data.language||'ru',months=lang==='en'?ALCOHOL_MONTHS_EN:ALCOHOL_MONTHS_RU,streak=alcoholCurrentStreakDays(),stats=alcoholYearStats(alcoholViewYear);
  const setText=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
  setText('alcoholTitle',trText('Алкоголь','Alcohol'));setText('alcoholSubtitle',trText('История и календарь','History & calendar'));
  setText('alcoholCurrentLabel',trText('Текущая серия','Current streak'));setText('alcoholSoberYearLabel',trText('Без алкоголя в году','Alcohol-free this year'));setText('alcoholDrinkDaysLabel',trText('Дней с алкоголем','Drinking days'));
  setText('alcoholDaysUnit1',trText('дней','days'));setText('alcoholLegendSober',trText('Не пил','Alcohol-free'));setText('alcoholLegendDrank',trText('Пил','Drank'));setText('alcoholLegendFuture',trText('Будущий день','Future'));
  setText('alcoholHelpTitle',trText('Как это работает','How it works'));setText('alcoholHelpText',trText('Нажми на прошедший день, чтобы отметить или снять факт употребления алкоголя. Если день не отмечен, он автоматически считается днём без алкоголя.','Tap a past day to mark or unmark alcohol use. If a day is not marked, it is automatically treated as alcohol-free.'));
  const mb=document.getElementById('alcoholMonthModeBtn'),yb=document.getElementById('alcoholYearModeBtn');
  if(mb){mb.textContent=trText('Месяц','Month');mb.classList.toggle('active',alcoholViewMode==='month')}
  if(yb){yb.textContent=trText('Год','Year');yb.classList.toggle('active',alcoholViewMode==='year')}
  setText('alcoholHeaderStreak',streak);setText('alcoholCurrentStreak',streak);setText('alcoholSoberYear',stats.pct);setText('alcoholDrinkDaysYear',stats.drink);setText('alcoholYearLabel',alcoholViewYear);
  const host=document.getElementById('alcoholCalendarHost');if(!host)return;
  if(alcoholViewMode==='year'){
    host.innerHTML=`<div class="alcohol-year-grid">${Array.from({length:12},(_,m)=>alcoholMonthHTML(alcoholViewYear,m)).join('')}</div>`;
  }else{
    host.innerHTML=`<div class="alcohol-month-view">${calendarControls('alcohol',alcoholViewYear,alcoholViewMonth)}${alcoholMonthHTML(alcoholViewYear,alcoholViewMonth)}</div>`;
  }
}


function renderToday(){renderTodayPage()}
function renderEnglish(){} // Kept as a harmless compatibility entry point.

function weeklyWindow(todayKey=localDate()){
  const start=weeklyMonday(todayKey);
  const end=weeklyAddDays(start,6);
  const elapsed=Math.max(1,Math.min(7,weeklyDiffDays(start,todayKey)+1));
  const currentKeys=weeklyKeys(start,elapsed);
  const prevStart=weeklyAddDays(start,-7);
  const prevKeys=weeklyKeys(prevStart,elapsed);
  return {todayKey,start,end,elapsed,currentKeys,prevStart,prevKeys,complete:elapsed===7};
}
function weeklyHasOwn(row,key){
  return !!row && Object.prototype.hasOwnProperty.call(row,key) && row[key]!=='' && row[key]!==null && row[key]!==undefined;
}
function weeklyNumericStats(id,keys,{positiveOnly=false,goal=null}={}){
  const values=[];
  let goalDays=0;
  for(const key of keys){
    const row=data.logs?.[key];
    const raw=nutritionMetricValue(id,key);
    if(id==='protein'?(raw===null):( !weeklyHasOwn(row,id)||typeof row[id]==='boolean'))continue;
    const n=Number(raw);
    if(!Number.isFinite(n))continue;
    if(positiveOnly ? n<=0 : n<0)continue;
    values.push({date:key,value:n});
    if(goal!==null && Number(goal)>0 && ['met','within'].includes(goalState(n,goalRule(id)).status))goalDays++;
  }
  const avg=values.length?values.reduce((s,x)=>s+x.value,0)/values.length:null;
  const total=values.reduce((s,x)=>s+x.value,0);
  return {values,count:values.length,avg,total,goalDays};
}
function weeklyEnglishForDay(dateKey){return englishMinutesForDate(dateKey)}
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
  if(!document.getElementById('bodyModal')?.hidden)setBodyRange(n);
}
function setTrendMetric(id){
  if(id==='weight'||id==='body'){bodySelectedMetric='weight';openBody();return}
  closeBody();
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
    if(el){el.className=trendRangeDays===value?'secondary':'ghost';el.setAttribute('aria-pressed',String(trendRangeDays===value))}
  });

  const tabs=document.getElementById('trendMetricTabs');
  if(tabs){
    tabs.innerHTML=`<button class="trend-metric-tab" onclick="openBody()">${uiIcon('weight')} Body</button>`+TREND_METRICS.filter(m=>m.id!=='weight').map(m=>`
      <button class="trend-metric-tab ${trendMetricId===m.id?'active':''}" onclick="setTrendMetric('${m.id}')">
        ${typeof uiIcon==='function'?uiIcon(m.id):m.icon} ${(data.language||'ru')==='en'?m.en:m.ru}
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

  if(title)title.textContent=trendMetricName(trendMetricId);
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

function renderProgress(){renderSimpleProgress();renderTrends();renderCalendar();renderDataCoverage();if(typeof renderBodyProgressSummary==='function')renderBodyProgressSummary();if(!document.getElementById('bodyModal')?.hidden&&typeof renderBody==='function')renderBody()}
function moveMonth(n){calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+n,1);renderCalendar()}
function renderCalendar(){
 const y=calendarDate.getFullYear(),m=calendarDate.getMonth();
 document.getElementById('calendarTitle').textContent=CALENDAR_MONTHS[calendarLanguage()][m]+' '+y;
 document.getElementById('progressCalendarControls').innerHTML=calendarControls('progress',y,m);
 document.getElementById('calendarGrid').innerHTML=calendarMonthHTML(y,m,{context:'progress',onDay:'calendarOpenHistoryDay',marker:d=>{return progressDayMarker(d)}});
}
function progressDayMarker(date){
 const row=data.logs?.[date]||{};
 const recorded=Object.values(row).some(v=>v!==null&&v!==undefined&&v!=='')||nutritionRows(date).length>0||Object.values(data.bodyMeasurements?.[date]||{}).some(v=>v!==null&&v!==undefined&&v!=='')||data.cycle.periods.some(p=>p.start<=date&&(p.end||p.start)>=date)||!!data.alcoholHistory?.[date];
 // Only daily numeric goals are comparable here; weekly goals and unknown fields are excluded.
 const states=['steps','sleep','outdoors'].flatMap(id=>{
  const rule=goalRule(id);if(rule.type==='weekly'||rule.type==='observe')return [];
  const state=goalState(row[id],rule).status;return ['met','within','progress','over'].includes(state)?[state]:[];
 });
 const missed=states.some(s=>s==='progress'||s==='over'),met=states.length>0&&!missed;
 return {className:missed?'mid':met?'good':recorded?'recorded':'',dot:!!recorded,label:missed?trText('Есть записи; не все записанные дневные цели выполнены','Recorded; some logged daily goals not met'):met?trText('Записанные дневные цели выполнены; пропуски не оценены','Logged daily goals met; missing values not assessed'):recorded?trText('Есть записи; цели не оценены','Recorded; goals not assessed'):trText('Нет записей','No records')};
}
function calendarOpenHistoryDay(key){if(!validDay(key)||key>localDate())return;setTodayDate(key);show('today')}


function formatBackupDate(value){
  if(!value)return trText('Никогда','Never');
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return trText('Никогда','Never');
  return d.toLocaleDateString((data.language||'ru')==='en'?'en-NZ':'ru-RU',{
    day:'numeric',month:'short',year:'numeric'
  });
}

function updateStorageSafetyUI(){
 const preImport=document.getElementById('preImportBackupButton');if(preImport)preImport.hidden=!storageGet('my-rhythm-pre-import');
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
  if(last)last.textContent=formatBackupDate(data.lastExportPreparedAt||data.lastExternalBackupAt);

  if(reminder){
    const old=!(data.lastExportPreparedAt||data.lastExternalBackupAt);
    reminder.textContent=trText('Локальные копии не заменяют внешний файл. После экспорта проверь его сохранение.','Local recovery copies do not replace an external file. After exporting, check that it was saved.');
    reminder.className='backup-reminder '+(old?'warn':'ok');
  }
}

function renderSettings(){
 renderUnifiedSettings();
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

}
function render(){applyTheme();nutritionRender();for(const job of [renderToday,renderProgress,renderSettings]){try{job()}catch(e){console.error('Render error in '+job.name,e)}}if(typeof energyRefresh==='function')energyRefresh();try{translateDOM();enhanceDateInputs();if(typeof uiRefresh==='function')uiRefresh()}catch(e){console.error('Translation error',e)}}

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
 if(document.getElementById('entryModal')?.classList.contains('show'))return closeModal('entryModal');
 if(document.getElementById('smokeModal')?.classList.contains('show'))return closeSmoke();
 if(document.getElementById('nutritionForm')?.classList.contains('show'))return nutritionCancelForm();
 if(document.getElementById('nutritionImportPreview')?.classList.contains('show'))return nutritionCancelImport();
 if(document.getElementById('moduleModal')?.classList.contains('show'))return closeModule();
  if(document.getElementById('habitModal')?.classList.contains('show'))return closeHabitEditor();
  if(document.getElementById('bodyCheckinModal')?.classList.contains('show'))return closeBodyCheckin();
  if(currentSection==='progress'&&!document.getElementById('bodyModal')?.hidden)return closeBody();
  if(document.getElementById('alcoholModal')?.classList.contains('show'))return closeAlcohol();
})

