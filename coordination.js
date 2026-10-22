// Three-way local merge: independent edits combine; conflicting fields never overwrite.
let storageBaseline=null,saveCoordinationQueue=Promise.resolve(),unsavedConflict=null;
function resetStorageBaseline(){storageBaseline=structuredClone(data)}
function mergeLocalEdits(base,ours,theirs,path='',conflicts=[]){
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 if(equal(ours,base))return structuredClone(theirs);
 if(equal(theirs,base)||equal(ours,theirs))return structuredClone(ours);
 if((isDataObject(base)||base===undefined)&&isDataObject(ours)&&isDataObject(theirs)){
  base=base||{};
  const out={};for(const key of new Set([...Object.keys(base),...Object.keys(ours),...Object.keys(theirs)])){
   if(path===''&&key==='_storageMeta'){out[key]=structuredClone(theirs[key]);continue}
   const value=mergeLocalEdits(base[key],ours[key],theirs[key],path+'.'+key,conflicts);if(value!==undefined)out[key]=value;
  }return out;
 }
 // Record arrays merge by stable ID, including deletion versus edit conflicts.
 if(Array.isArray(base)&&Array.isArray(ours)&&Array.isArray(theirs)&&[...base,...ours,...theirs].every(x=>isDataObject(x)&&typeof x.id==='string')&&!path.endsWith('.blocks')){
  const map=xs=>Object.fromEntries(xs.map(x=>[x.id,x]));return Object.values(mergeLocalEdits(map(base),map(ours),map(theirs),path,conflicts));
 }
 conflicts.push(path);return structuredClone(theirs);
}
function coordinateSave({renderAfter=true,makeSnapshot=true}={}){
 const ours=structuredClone(data),base=structuredClone(storageBaseline||data);
 // Update baseline immediately so queued changes are deltas of the previous draft.
 storageBaseline=structuredClone(ours);
 const commit=async()=>{
  const latest=bestCandidate([parseCandidate(DATA_KEY,storageGet(DATA_KEY),true),parseCandidate(MIRROR_KEY,storageGet(MIRROR_KEY))].filter(Boolean))?.data||base;
  const conflicts=[],merged=mergeLocalEdits(base,ours,latest,'',conflicts);
  if(conflicts.length){
   unsavedConflict=ours;storageSet('my-rhythm-conflict-draft',JSON.stringify(ours));
   data=migrateData(latest);resetStorageBaseline();render();
   alert(trText('Другая вкладка изменила те же записи. Изменения не перезаписаны. Скачай свой черновик в Настройках и проверь записи.','Another tab changed the same records. Nothing was overwritten. Download your draft in Settings and review the entries.'));return false;
  }
  // Keep any edits made while an earlier save was waiting for its lock.
  const pending=structuredClone(data);
  data=migrateData(merged);stampCurrentData();const payload=structuredClone(data);
  const saved=writeLocalCopies(payload);
  if(!saved.primary&&!saved.mirror)alert(trText('Ошибка сохранения. Экспортируй JSON backup.','Save failed. Export a JSON backup.'));
  if(JSON.stringify(pending)!==JSON.stringify(ours)){
   data=mergeLocalEdits(ours,pending,data,'',[]);
  }
  resetStorageBaseline();if(renderAfter)render();
  await writeVaultCopies(payload,makeSnapshot);return true;
 };
 const task=()=>withStorageLock(commit);
 const result=saveCoordinationQueue.then(task);saveCoordinationQueue=result.catch(()=>{alert(trText('Не удалось сохранить. Экспортируй backup.','Could not save. Export a backup.'))});return result;
}
function withStorageLock(commit){
 if(navigator.locks)return navigator.locks.request('my-rhythm-data-write',commit);
 if(!('indexedDB' in window))return commit();
 // A readwrite transaction serializes the synchronous compare/merge/local write
 // section across tabs even when Web Locks is unavailable. Vault writes follow it.
 return openVaultDB().then(db=>new Promise((resolve,reject)=>{
  const tx=db.transaction('current','readwrite'),req=tx.objectStore('current').get('data');
  let result;req.onsuccess=()=>{try{result=commit()}catch(e){reject(e)}};
  tx.oncomplete=()=>Promise.resolve(result).then(resolve,reject);
  tx.onerror=()=>reject(tx.error||Error('Local write lock failed.'));
  tx.onabort=()=>reject(tx.error||Error('Local write lock aborted.'));
 }));
}
function downloadConflictDraft(){
 const raw=unsavedConflict||JSON.parse(storageGet('my-rhythm-conflict-draft')||'null');
 if(!raw){alert(trText('Нет сохранённого черновика.','No saved conflict draft.'));return}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({format:'my-life-tracker-backup',data:raw},null,2)],{type:'application/json'}));a.download='my-rhythm-conflict-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
addEventListener('storage',e=>{
 if(e.key!==DATA_KEY||!e.newValue)return;
 const notice=document.getElementById('tabUpdateNotice');
 if(notice){notice.hidden=false;notice.textContent=trText('Другая вкладка обновила записи. При сохранении независимые изменения будут объединены.','Another tab updated records. Independent edits will be merged when you save.');}
});
