// Presentation helpers only. No storage keys or migrations.
const UI_PATHS={
 chest:'M8 3 6 7 3 9l3 6 2-1v7h8v-7l2 1 3-6-3-2-2-4M8 10h8',
 waist:'M7 3c0 5 3 6 3 9s-3 4-3 9m10-18c0 5-3 6-3 9s3 4 3 9M5 12h14m-12-2-2 2 2 2m10-4 2 2-2 2',
 abdomen:'M7 3c0 5 1 6 1 9s-2 6-2 9m11-18c0 5-1 6-1 9s2 6 2 9M9 14a3 4 0 1 0 6 0 3 4 0 1 0-6 0',
 hips:'M8 3c0 5-4 7-4 11s3 7 8 7 8-3 8-7-4-6-4-11M5 13h14M12 16v5',
 thigh:'M6 3h12l1 6-3 12h-4V10m0 11H8L5 9ZM6 8h6',
 today:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',nutrition:'M5 3v6m3-6v6M3 6h7v4a3 3 0 0 1-3 3v8m13 0V3c-5 2-5 10 0 10',progress:'M4 20V10m8 10V4m8 16v-7',settings:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6M9 15v6',
 energy:'m13 2-9 12h7l-1 8 10-13h-8Z',steps:'M7 3c4 0 4 8 1 8S3 3 7 3Zm9 10c4 0 5 8 1 8s-5-8-1-8Z',sleep:'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z',weight:'M4 5h16v16H4ZM8 5a4 4 0 0 1 8 0m-4 4 2-2',gym:'M3 8v8m4-11v14m0-7h10m0-7v14m4-11v8',outdoors:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',smoke:'M3 13h14v5H3Zm18 0v5m-1-9c-4-1 1-4-3-6M3 3l18 18',alcohol:'M6 3h12l-1 7a5 5 0 0 1-10 0ZM12 15v6m-4 0h8',cycle:'M19 7A8 8 0 1 0 20 16M19 2v5h-5',protein:'M5 19c-6-5 5-18 13-14s0 18-7 15M9 10l5 4',back:'m15 5-7 7 7 7',close:'m6 6 12 12M6 18 18 6',calendar:'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16'};
function uiIcon(name){return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${UI_PATHS[name]||UI_PATHS.progress}"/></svg>`}
function uiRefresh(){
 for(const [id,name] of Object.entries({tabToday:'today',tabNutrition:'nutrition',tabProgress:'progress',tabSettings:'settings'})){
  const host=document.querySelector('#'+id+' .ico');if(host)host.innerHTML=uiIcon(name);
 }
 for(const card of document.querySelectorAll('#todayGrid [data-metric]')){const host=card.querySelector('.today-metric-title>span:first-child');if(host&&UI_PATHS[card.dataset.metric])host.innerHTML=uiIcon(card.dataset.metric)}
 for(const b of document.querySelectorAll('.trend-metric-tab,.body-metric-tab')){const id=b.getAttribute('onclick')?.match(/(?:setTrendMetric|setBodyMetric)\('([^']+)'/)?.[1];if(id&&UI_PATHS[id]&&!b.querySelector('svg')){b.textContent=b.textContent.trim().replace(/^[^A-Za-zА-Яа-яЁё]+/u,'');b.insertAdjacentHTML('afterbegin',uiIcon(id)+' ')}}
 for(const el of document.querySelectorAll('.shared-date-trigger'))el.innerHTML=uiIcon('calendar');
 for(const el of document.querySelectorAll('.body-new-checkin>span:first-child'))el.innerHTML=uiIcon('weight');
 for(const el of document.querySelectorAll('.close,#habitClose')){el.setAttribute('aria-label',trText('Закрыть','Close'));if(!el.querySelector('svg'))el.innerHTML=uiIcon('close')}
}
const uiFormSnapshots=new Map();
function uiFormValue(id){const form=document.getElementById(id);return form?JSON.stringify([...form.querySelectorAll('input,textarea,select')].filter(x=>x.type!=='file'&&!x.closest?.('.shared-calendar-controls')).map(x=>[x.id,x.value,x.checked])):''}
function uiRememberForm(id){uiFormSnapshots.set(id,uiFormValue(id))}
function uiFormDirty(id){return document.getElementById(id)?.classList.contains('show')&&uiFormSnapshots.has(id)&&uiFormSnapshots.get(id)!==uiFormValue(id)}
function uiConfirmDiscard(id){if(uiSavingForms.has(id))return false;return !uiFormDirty(id)||confirm(trText('Закрыть без сохранения изменений?','Discard unsaved changes?'))}
addEventListener('beforeunload',e=>{if([...uiFormSnapshots.keys()].some(uiFormDirty)){e.preventDefault();e.returnValue=''}});
// VisualViewport follows the usable area above the iPhone software keyboard.
function uiViewport(){if(!globalThis.visualViewport)return;document.documentElement.style.setProperty('--viewport-height',visualViewport.height+'px');document.documentElement.style.setProperty('--viewport-top',visualViewport.offsetTop+'px')}
if(globalThis.visualViewport){visualViewport.addEventListener('resize',uiViewport);visualViewport.addEventListener('scroll',uiViewport);uiViewport()}
addEventListener('focusin',e=>{if(e.target.matches?.('input,textarea,select')&&e.target.closest('.nutrition-form,.body-checkin-modal'))setTimeout(()=>e.target.scrollIntoView({block:'nearest'}),250)});

// One pending action per editor. Inputs remain available on failed saves.
const uiSavingForms=new Set();
function uiGuardEditor(name,id){
 const action=window[name];
 window[name]=async function(...args){
  if(uiSavingForms.has(id))return false;
  uiSavingForms.add(id);
  const host=document.getElementById(id);
  host?.setAttribute('aria-busy','true');
  try{return await action(...args)}
  catch(error){alert(trText('Не удалось сохранить. Введённые значения остаются в форме. ','Could not save. Your entries remain in the form. ')+error.message);return false}
  finally{uiSavingForms.delete(id);host?.removeAttribute?.('aria-busy')}
 };
}
addEventListener('DOMContentLoaded',()=>{
 for(const [id,names] of Object.entries({entryModal:['saveEntry','deleteEntry'],habitModal:['saveHabitEditor','deleteHabitEntry'],bodyCheckinModal:['saveBodyCheckin','deleteBodyCheckin'],moduleModal:['saveCycle','deleteCycle','energySaveSimpleWorkout','energySaveWorkout','energyDeleteWorkout','energyToggleWorkoutDay'],alcoholModal:['toggleAlcoholDay'],smokeModal:['saveSmokeDate'],nutritionForm:['nutritionSaveFood','nutritionDeleteFood']}))for(const name of names)uiGuardEditor(name,id);
});
