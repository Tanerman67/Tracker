// Persistent schema and recovery. Keep keys compatible with existing installations.
const APP_VERSION='6.11.1-audit';
const DATA_KEY='my-life-tracker-data';
const MIRROR_KEY='my-life-tracker-data-mirror-v1';
const CURRENT_SCHEMA_VERSION=2;
const LEGACY_KEYS=['life-tracker-v3','life-tracker-v2','cleaner-stronger-v1'];

const VAULT_DB='my-rhythm-vault-v1';
const VAULT_DB_VERSION=1;
const VAULT_CACHE='my-rhythm-data-vault-v1';
const VAULT_CACHE_URL='./__my_rhythm_data_vault_v1__.json';
const MAX_VAULT_SNAPSHOTS=100;

const defaultTrackers=[
{id:'protein',name:'Белок',icon:'🥩',type:'number',unit:'г',goal:120,category:'health'},
{id:'steps',name:'Шаги',icon:'🚶',type:'number',unit:'',goal:7000,category:'health'},
{id:'outdoors',name:'Время на улице',icon:'☀️',type:'number',unit:'мин',goal:60,category:'health'},
{id:'sleep',name:'Сон',icon:'😴',type:'number',unit:'ч',goal:7.5,category:'health'},
{id:'weight',name:'Вес',icon:'⚖️',type:'number',unit:'кг',goal:null,category:'health'},
{id:'gym',name:'Тренировка',icon:'🏋️',type:'boolean',unit:'',goal:1,category:'health'},
{id:'english_general',name:'Английский',icon:'🇬🇧',type:'number',unit:'мин',goal:35,category:'development'}
];
const defaults={
 schemaVersion:CURRENT_SCHEMA_VERSION,
 smokeDate:'',alcoholDate:'',
 alcoholTrackingStart:localDate(),
 alcoholHistory:{},
 bodyMeasurements:{},
 proteinGoal:120,stepsGoal:7000,outdoorsGoal:60,sleepGoal:7.5,englishGoal:240,gymGoal:3,
 trackers:defaultTrackers,logs:{},theme:'dark',language:'ru',experiments:[],
 motivationSeen:{},
 englishLearning:{customItems:[],review:{},favorites:{},dailyQueue:{date:'',itemIds:[],newItemIds:[]},studyPlans:{}},
 lastExternalBackupAt:''
};

function storageGet(key){try{return window.localStorage.getItem(key)}catch(e){return null}}
function storageSet(key,value){try{window.localStorage.setItem(key,value);return true}catch(e){return false}}
function storageRemove(key){try{window.localStorage.removeItem(key);return true}catch(e){return false}}
function storageKeys(){try{return Array.from({length:window.localStorage.length},(_,i)=>window.localStorage.key(i)).filter(Boolean)}catch(e){return []}}

function dataStats(d){
  const logs=(d&&d.logs&&typeof d.logs==='object')?d.logs:{};
  const days=Object.keys(logs).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
  let entries=0;
  for(const day of days){
    const row=logs[day];
    if(row&&typeof row==='object'){
      entries+=Object.values(row).filter(v=>v!==undefined&&v!==null&&v!=='').length;
    }
  }
  const meta=d&&d._storageMeta&&typeof d._storageMeta==='object'?d._storageMeta:{};
  return {
    logDays:days.length,
    entries,
    latest:days.length?days[days.length-1]:'',
    revision:Number(meta.revision||0),
    savedAt:Date.parse(meta.savedAt||'')||0
  };
}

function candidateBetter(a,b){
  if(!a)return false;
  if(!b)return true;
  const A=dataStats(a.data),B=dataStats(b.data);
  // Saved chronology preserves intentional deletions and backup imports.
  // Legacy copies without metadata still fall back to record coverage.
  if(A.savedAt!==B.savedAt)return A.savedAt>B.savedAt;
  if(A.revision!==B.revision)return A.revision>B.revision;
  if(A.logDays!==B.logDays)return A.logDays>B.logDays;
  if(A.entries!==B.entries)return A.entries>B.entries;
  if(A.latest!==B.latest)return A.latest>B.latest;
  return !!a.primary && !b.primary;
}

function bestCandidate(items){
  let best=null;
  for(const item of items||[]){
    if(item&&item.data&&candidateBetter(item,best))best=item;
  }
  return best;
}

function migrateData(raw){
  let d = raw && typeof raw === 'object' ? structuredClone(raw) : {};
  let version = Number(d.schemaVersion || 0);

  if(version < 1){
    d = {
      ...defaults,
      ...d,
      schemaVersion:1,
      logs:(d.logs && typeof d.logs==='object') ? d.logs : {},
      trackers:Array.isArray(d.trackers) ? d.trackers : structuredClone(defaultTrackers)
    };
    version = 1;
  }

  if(version < 2){
    d.experiments=Array.isArray(d.experiments)?d.experiments:[];
    d.sleepGoal=d.sleepGoal??7.5;
    d.gymGoal=d.gymGoal??3;
    d.schemaVersion=2;
    version=2;
  }

  d = {
    ...defaults,
    ...d,
    schemaVersion:CURRENT_SCHEMA_VERSION,
    logs:(d.logs && typeof d.logs==='object') ? d.logs : {},
    trackers:Array.isArray(d.trackers) ? d.trackers : structuredClone(defaultTrackers),
    experiments:Array.isArray(d.experiments) ? d.experiments : [],
    alcoholTrackingStart:d.alcoholTrackingStart||defaults.alcoholTrackingStart,
    alcoholHistory:(d.alcoholHistory && typeof d.alcoholHistory==='object') ? d.alcoholHistory : structuredClone(defaults.alcoholHistory),
    bodyMeasurements:(d.bodyMeasurements && typeof d.bodyMeasurements==='object') ? d.bodyMeasurements : structuredClone(defaults.bodyMeasurements),
    motivationSeen:(d.motivationSeen && typeof d.motivationSeen==='object') ? d.motivationSeen : {},
    englishLearning:{
      ...d.englishLearning,
      customItems:Array.isArray(d.englishLearning?.customItems) ? d.englishLearning.customItems : [],
      review:(d.englishLearning?.review && typeof d.englishLearning.review==='object') ? d.englishLearning.review : {},
      favorites:(d.englishLearning?.favorites && typeof d.englishLearning.favorites==='object') ? d.englishLearning.favorites : {},
      dailyQueue:{
        ...d.englishLearning?.dailyQueue,
        date:typeof d.englishLearning?.dailyQueue?.date==='string' ? d.englishLearning.dailyQueue.date : '',
        itemIds:Array.isArray(d.englishLearning?.dailyQueue?.itemIds) ? d.englishLearning.dailyQueue.itemIds : [],
        newItemIds:Array.isArray(d.englishLearning?.dailyQueue?.newItemIds) ? d.englishLearning.dailyQueue.newItemIds : []
      },
      studyPlans:(d.englishLearning?.studyPlans && typeof d.englishLearning.studyPlans==='object') ? d.englishLearning.studyPlans : {}
    },
    lastExternalBackupAt:d.lastExternalBackupAt||''
  };

  for(const base of defaultTrackers){
    if(!d.trackers.some(t=>t.id===base.id))d.trackers.push(structuredClone(base));
  }
  return d;
}

function isDataObject(value){return !!value&&typeof value==='object'&&!Array.isArray(value)}
function validateStoredData(obj){
  if(!isDataObject(obj))throw new Error('Invalid app data.');
  const maps=['logs','alcoholHistory','bodyMeasurements','motivationSeen','englishLearning','_storageMeta'];
  if(![...maps,'trackers','smokeDate','alcoholDate','schemaVersion'].some(k=>Object.prototype.hasOwnProperty.call(obj,k)))throw new Error('No app data found.');
  for(const key of maps){
    if(obj[key]!==undefined&&!isDataObject(obj[key]))throw new Error('Invalid '+key+'.');
  }
  for(const key of ['trackers','experiments']){
    if(obj[key]!==undefined&&!Array.isArray(obj[key]))throw new Error('Invalid '+key+'.');
  }
  if(obj.trackers?.some(t=>!isDataObject(t)||typeof t.id!=='string'))throw new Error('Invalid tracker.');
  for(const key of ['logs','bodyMeasurements']){
    if(obj[key]&&Object.values(obj[key]).some(row=>!isDataObject(row)))throw new Error('Invalid '+key+' row.');
  }
  return obj;
}

function parseCandidate(key,raw,primary=false){
  if(!raw)return null;
  try{
    const obj=JSON.parse(raw);
    validateStoredData(obj);
    return {key,data:migrateData(obj),primary};
  }catch(e){
    return null;
  }
}

function writeLocalCopies(payload){
  const raw=JSON.stringify(payload);
  const primary=storageSet(DATA_KEY,raw);
  const mirror=storageSet(MIRROR_KEY,raw);
  window.__vaultHealth=window.__vaultHealth||{};
  window.__vaultHealth.primary=primary;
  window.__vaultHealth.mirror=mirror;
  return {primary,mirror};
}

function loadData(){
  const found=[];
  const primary=parseCandidate(DATA_KEY,storageGet(DATA_KEY),true);
  if(primary)found.push(primary);

  const mirror=parseCandidate(MIRROR_KEY,storageGet(MIRROR_KEY),false);
  if(mirror)found.push(mirror);

  for(const key of LEGACY_KEYS){
    const c=parseCandidate(key,storageGet(key),false);
    if(c)found.push(c);
  }

  for(const key of storageKeys()){
    if(key===DATA_KEY||key===MIRROR_KEY||LEGACY_KEYS.includes(key)||found.some(x=>x.key===key))continue;
    if(!/life|tracker|cleaner|rhythm|ритм/i.test(key))continue;
    const c=parseCandidate(key,storageGet(key),false);
    if(c)found.push(c);
  }

  if(!found.length){
    window.__dataDiagnostic={source:'defaults',sources:[]};
    return migrateData(defaults);
  }

  const chosen=bestCandidate(found);
  const result=migrateData(chosen.data);
  writeLocalCopies(result);
  window.__dataDiagnostic={
    source:chosen.key,
    sources:found.map(x=>({key:x.key,...dataStats(x.data)}))
  };
  return result;
}

// ---------- IndexedDB vault ----------
let __vaultDbPromise=null;

function openVaultDB(){
  if(!('indexedDB' in window))return Promise.reject(new Error('IndexedDB unavailable'));
  if(__vaultDbPromise)return __vaultDbPromise;

  __vaultDbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(VAULT_DB,VAULT_DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains('current'))db.createObjectStore('current');
      if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('IndexedDB open error'));
  });

  return __vaultDbPromise;
}

function txDone(tx){
  return new Promise((resolve,reject)=>{
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error||new Error('IndexedDB transaction error'));
    tx.onabort=()=>reject(tx.error||new Error('IndexedDB transaction aborted'));
  });
}

async function vaultReadCurrent(){
  const db=await openVaultDB();
  return await new Promise((resolve,reject)=>{
    const tx=db.transaction('current','readonly');
    const req=tx.objectStore('current').get('data');
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
}

async function vaultReadSnapshots(){
  const db=await openVaultDB();
  return await new Promise((resolve,reject)=>{
    const tx=db.transaction('snapshots','readonly');
    const req=tx.objectStore('snapshots').getAll();
    req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);
    req.onerror=()=>reject(req.error);
  });
}

async function trimVaultSnapshots(){
  const db=await openVaultDB();
  const rows=await vaultReadSnapshots();
  if(rows.length<=MAX_VAULT_SNAPSHOTS)return;
  rows.sort((a,b)=>(a.savedAt||'').localeCompare(b.savedAt||''));
  const remove=rows.slice(0,rows.length-MAX_VAULT_SNAPSHOTS);
  if(!remove.length)return;
  const tx=db.transaction('snapshots','readwrite');
  const store=tx.objectStore('snapshots');
  remove.forEach(x=>store.delete(x.id));
  await txDone(tx);
}

async function vaultWriteIndexedDB(payload,makeSnapshot=true){
  const db=await openVaultDB();
  const now=new Date().toISOString();
  const tx=db.transaction(['current','snapshots'],'readwrite');
  tx.objectStore('current').put({savedAt:now,data:structuredClone(payload)},'data');
  if(makeSnapshot){
    tx.objectStore('snapshots').put({
      id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      savedAt:now,
      data:structuredClone(payload)
    });
  }
  await txDone(tx);
  if(makeSnapshot)await trimVaultSnapshots();
  return true;
}

// ---------- CacheStorage vault ----------
async function vaultWriteCache(payload){
  if(!('caches' in window))throw new Error('CacheStorage unavailable');
  const cache=await caches.open(VAULT_CACHE);
  const body=JSON.stringify({savedAt:new Date().toISOString(),data:payload});
  const req=new Request(new URL(VAULT_CACHE_URL,location.href).href);
  await cache.put(req,new Response(body,{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}));
  return true;
}

async function vaultReadCache(){
  if(!('caches' in window))return null;
  const cache=await caches.open(VAULT_CACHE);
  const req=new Request(new URL(VAULT_CACHE_URL,location.href).href);
  const res=await cache.match(req);
  if(!res)return null;
  try{return await res.json()}catch(e){return null}
}

async function vaultSnapshotCount(){
  try{return (await vaultReadSnapshots()).length}catch(e){return 0}
}

// Serialize vault writes: a slower old save must not replace a newer save.
let vaultWriteQueue=Promise.resolve();
function writeVaultCopies(payload,makeSnapshot=true){
  const snapshot=structuredClone(payload);
  const task=vaultWriteQueue.then(()=>writeVaultCopiesNow(snapshot,makeSnapshot));
  vaultWriteQueue=task.catch(()=>{});
  return task;
}
async function writeVaultCopiesNow(payload,makeSnapshot=true){
  const settled=await Promise.allSettled([
    vaultWriteIndexedDB(payload,makeSnapshot),
    vaultWriteCache(payload)
  ]);

  const idb=settled[0].status==='fulfilled';
  const cache=settled[1].status==='fulfilled';

  window.__vaultHealth={
    ...(window.__vaultHealth||{}),
    primary:!!storageGet(DATA_KEY),
    mirror:!!storageGet(MIRROR_KEY),
    idb,
    cache,
    snapshots:await vaultSnapshotCount()
  };
  updateStorageSafetyUI();
}

function stampCurrentData(){
  const previous=data&&data._storageMeta&&typeof data._storageMeta==='object'?data._storageMeta:{};
  data._storageMeta={
    ...previous,
    revision:Number(previous.revision||0)+1,
    savedAt:new Date(Math.max(Date.now(),(Date.parse(previous.savedAt)||0)+1)).toISOString(),
    appVersion:APP_VERSION
  };
}

function persistData({renderAfter=true,makeSnapshot=true}={}){
  data.schemaVersion=CURRENT_SCHEMA_VERSION;
  stampCurrentData();
  writeLocalCopies(data);
  if(renderAfter)render();
  writeVaultCopies(structuredClone(data),makeSnapshot).catch(err=>{
    console.warn('Vault write failed',err);
    updateStorageSafetyUI();
  });
}

async function recoverFromVaults(){
  const candidates=[{key:'memory/local',data:migrateData(data),primary:true}];

  try{
    const current=await vaultReadCurrent();
    if(current&&current.data)candidates.push({key:'IndexedDB current',data:migrateData(current.data),primary:false});
  }catch(e){
    console.warn('IndexedDB current read failed',e);
  }

  try{
    const snaps=await vaultReadSnapshots();
    for(const s of snaps){
      if(s&&s.data)candidates.push({key:`IndexedDB snapshot ${s.savedAt||s.id}`,data:migrateData(s.data),primary:false});
    }
  }catch(e){
    console.warn('IndexedDB snapshots read failed',e);
  }

  try{
    const cached=await vaultReadCache();
    if(cached&&cached.data)candidates.push({key:'CacheStorage vault',data:migrateData(cached.data),primary:false});
  }catch(e){
    console.warn('Cache vault read failed',e);
  }

  // A user may save while the asynchronous recovery reads are running.
  candidates[0]={key:'memory/local',data:migrateData(data),primary:true};
  const best=bestCandidate(candidates);
  const memory=candidates[0];

  if(best&&best.key!==memory.key&&candidateBetter(best,memory)){
    data=migrateData(best.data);
    writeLocalCopies(data);
    window.__dataDiagnostic={
      source:best.key,
      sources:candidates.map(x=>({key:x.key,...dataStats(x.data)}))
    };
    render();
  }

  await writeVaultCopies(structuredClone(data),false);
}

async function clearVaultCopies(){
  storageRemove(DATA_KEY);
  storageRemove(MIRROR_KEY);
  LEGACY_KEYS.forEach(k=>storageRemove(k));

  try{
    const db=await openVaultDB();
    const tx=db.transaction(['current','snapshots'],'readwrite');
    tx.objectStore('current').clear();
    tx.objectStore('snapshots').clear();
    await txDone(tx);
  }catch(e){}

  try{
    if('caches' in window)await caches.delete(VAULT_CACHE);
  }catch(e){}
}

