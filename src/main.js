import './style.css';
import {comparePayloads} from './compare.js';
const $=id=>document.getElementById(id);
const before=$('before'),after=$('after'),paths=$('paths'),status=$('status');
const exportButton=$('export'),schemaButton=$('export-schema');
let report=null;

function el(tag,className,content) {
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(content!==undefined)element.textContent=String(content);
  return element;
}
function updateRisk() {
  const banner=$('risk-summary');
  banner.replaceChildren();
  if(!report) {
    banner.append(el('strong','','Schema drift assessment'),el('p','','Compare two events to inspect removed fields and data-type changes.'));
    return;
  }
  const drift=report.drift,atRisk=drift.alertCount>0;
  banner.className='drift-banner'+(atRisk?' drift-warning':' drift-safe');
  banner.append(el('strong','',atRisk ? drift.alertCount+' potential contract-risk '+(drift.alertCount===1?'finding':'findings') : 'No removed fields or type changes detected'));
  banner.append(el('p','',atRisk
    ? 'Review removed paths and changed types before deploying webhook consumers. This is a single-sample heuristic, not a validated production schema.'
    : 'Structure looks compatible for these samples. Check optional fields, semantics, and actual consumer code before relying on it.'));
}
function render() {
  report=null;exportButton.disabled=true;schemaButton.disabled=true;
  paths.replaceChildren();$('drift-paths').replaceChildren();
  try {
    report=comparePayloads(before.value,after.value,{customKeys:$('redact-keys').value});
    const metrics=report.summary;
    $('additions').textContent=metrics.added;
    $('deletions').textContent=metrics.removed;
    $('changes').textContent=metrics.changed;
    $('delta').textContent=report.delta ? JSON.stringify(report.delta,null,2) : 'No differences found.';
    status.textContent=report.changes.length ? report.changes.length+' changed JSON paths (after masking). Review exports before sharing.' : 'These payloads match after sensitive fields are redacted.';
    for(const change of report.changes.slice(0,200)) {
      const li=el('li');
      li.append(el('code','jsonpath',change.path),el('span','badge '+change.type,change.type));paths.append(li);
    }
    if(!report.changes.length) paths.append(el('li','','No changes in redacted data.'));
    if(report.changes.length>200)paths.append(el('li','','First 200 changes shown. Export the fixture for details.'));
    for(const change of report.drift.changes.slice(0,140)) {
      const li=el('li','drift-row');
      const details=el('div');
      details.append(el('code','',change.path));
      details.append(el('small','',change.before+' → '+change.after));
      li.append(details,el('span','badge '+(change.kind==='removed'||change.kind==='type-changed'?'removed':'added'),change.kind.replaceAll('-',' ')));
      $('drift-paths').append(li);
    }
    if(!report.drift.changes.length)$('drift-paths').append(el('li','','No structural differences detected.'));
    if(report.drift.changes.length>140)$('drift-paths').append(el('li','','Only first 140 displayed; check exported redacted fixture.'));
    $('drift-count').textContent=report.drift.total+' structural findings';
    exportButton.disabled=false;schemaButton.disabled=false;
  } catch (error) {
    report=null;status.textContent=error.message||'Unable to compare payloads.';
    $('delta').textContent='No report generated.';
    paths.append(el('li','','Check your JSON syntax and try again.'));
    $('drift-paths').append(el('li','','No structural report available.'));
    $('drift-count').textContent='';
  }
  updateRisk();
}
function download(value,name) {
  const content=JSON.stringify(value,null,2);
  const url=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
$('compare').addEventListener('click',render);
$('sample').addEventListener('click',()=>{
  before.value=JSON.stringify({id:'evt_100',type:'order.created',authorization:'Bearer EXAMPLE_SECRET_12345',data:{order_id:'ord_24',status:'pending',total:1999,legacy_code:'old',items:['notebook']}},null,2);
  after.value=JSON.stringify({id:'evt_100',type:'order.updated',authorization:'Bearer EXAMPLE_SECRET_56789',data:{order_id:'ord_24',status:'paid',total:'1999',items:['notebook','pen'],currency:'USD'}},null,2);
  render();
});
$('export').addEventListener('click',()=>{if(report)download({tool:'PayloadLens',notice:'Best-effort redaction only; review all exported content before sharing.',generatedAt:new Date().toISOString(),baseline:report.before,revision:report.after,changes:report.changes,drift:report.drift,summary:report.summary},'payloadlens-redacted-fixture.json');});
schemaButton.addEventListener('click',()=>{if(report)download(report.schema,'payloadlens-example-schema.json');});
for(const input of [before,after,$('redact-keys')])input.addEventListener('input',()=>{
  report=null;exportButton.disabled=true;schemaButton.disabled=true;
  status.textContent='Input changed. Compare again to refresh redacted reports.';
  $('risk-summary').className='drift-banner';updateRisk();
});
