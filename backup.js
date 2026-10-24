// Full backup import and export; local recovery storage is preserved.
async function exportBackup(){
  await saveCoordinationQueue;
  const now=new Date();
  const stamp=now.toISOString().slice(0,10);

  // Preparing a download cannot prove the user saved it externally.
  data.lastExportPreparedAt=now.toISOString();
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
  if(el)el.textContent=trText('Экспорт подготовлен. Проверь, что файл сохранён в Files/iCloud Drive.','Export prepared. Check that the file was saved in Files/iCloud Drive.');
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

function backupHasCurrentData(value){
  const comparable=x=>JSON.stringify(x, (key,v)=>['_storageMeta','lastExportPreparedAt'].includes(key)?undefined:v);
  return comparable(value)!==comparable(migrateData(structuredClone(defaults)));
}

function importBackupFile(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=async()=>{
    let original=null,attempted=null;
    try{
      const parsed=JSON.parse(reader.result);
      const imported=validateBackupObject(parsed);
      const rawBackup=parsed.format==='my-life-tracker-backup'?parsed.data:parsed;
      const oldBackup=!Object.prototype.hasOwnProperty.call(rawBackup,'nutrition');
      const existingFood=data.nutrition?.entries?.length||0;
      if(oldBackup&&existingFood)imported.nutrition=structuredClone(data.nutrition);
      for(const key of ['dashboard','cycle','englishActivity','goalRules'])if(!Object.prototype.hasOwnProperty.call(rawBackup,key))imported[key]=structuredClone(data[key]);
      if(!Object.prototype.hasOwnProperty.call(rawBackup,'energyBalance')&&data.energyBalance)imported.energyBalance=structuredClone(data.energyBalance);
      const hasCurrent=backupHasCurrentData(data);
      const message=hasCurrent
        ? 'Импорт заменит текущие записи данными из backup.'+(oldBackup&&existingFood?' Этот старый backup не содержит раздел питания; текущие записи питания будут сохранены.':'')+' Продолжить?'
        : 'Импортировать данные из backup?';
      if(!confirm(message)) return;
      await saveCoordinationQueue;
      const before=structuredClone(data);original=before;attempted=structuredClone(imported);
      // A dedicated snapshot survives replacement even if no logs exist.
      if(!storageSet('my-rhythm-pre-import',JSON.stringify(before)))throw Error(trText('Не удалось сохранить копию до импорта. Импорт отменён.','Could not preserve a pre-import copy. Import cancelled.'));
      await writeVaultCopies(before,true);
      data=imported;
      if(await save()!==true)throw Error(trText('Импорт не сохранён. Исходная копия и черновик доступны локально.','Import was not saved. The original copy and draft remain available locally.'));
      const el=document.getElementById('backupStatus');
      if(el) el.textContent=trText('Backup успешно импортирован ✅','Backup imported successfully ✅');
      alert(trText('Данные восстановлены.','Data restored.'));
    }catch(err){
      if(original&&attempted){
        unsavedConflict=attempted;storageSet('my-rhythm-conflict-draft',JSON.stringify(attempted));
        const durable=bestCandidate([parseCandidate(DATA_KEY,storageGet(DATA_KEY),true),parseCandidate(MIRROR_KEY,storageGet(MIRROR_KEY))].filter(Boolean));
        data=migrateData(durable?.data||original);resetStorageBaseline();render();
      }
      const status=document.getElementById('backupStatus');if(status)status.textContent=trText('Импорт не завершён.','Import did not complete.');
      alert(trText('Не удалось импортировать backup: ','Could not import backup: ')+err.message);
    }finally{
      event.target.value='';
    }
  };
  reader.onerror=()=>alert('Не удалось прочитать файл.');
  reader.readAsText(file);
}


function downloadPreImportBackup(){const raw=storageGet('my-rhythm-pre-import');if(!raw)return;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));a.href=url;a.download='my-rhythm-before-import.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
