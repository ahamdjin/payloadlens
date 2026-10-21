import { create } from 'jsondiffpatch';
import { analyzeShapeDrift, buildExampleSchema } from './contract.js';
const differ = create({arrays:{detectMove:true,includeValueOnMove:false},
  objectHash:obj=>obj && typeof obj==='object' ? String(obj.id ?? obj._id ?? '') || undefined : undefined});
const SECRET_KEY = /authorization|password|secret|api[_-]?key|(?:^|[_-])token(?:$|[_-])|access[_-]?key|cookie|signature|credential|private[_-]?key|email|phone|ssn|social[_-]?security|credit[_-]?card|card[_-]?number|(?:^|[_-])ip[_-]?address|customer[_-]?name/i;
const SECRET_TEXT = /\b(Bearer\s+)[A-Za-z0-9._~+/-]{8,}/gi;
const MAX_SIZE=150000;
const MAX_DEPTH=55;

export function parseRedactionKeys(raw='') {
  if(typeof raw !== 'string'||raw.length>1000)throw new Error('Custom redaction list is too long.');
  return new Set(raw.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
}
export function sanitize(value,depth=0,customKeys=new Set()) {
  if(depth>MAX_DEPTH)throw new Error('JSON nesting is too deep to inspect safely.');
  if(Array.isArray(value))return value.map(v=>sanitize(v,depth+1,customKeys));
  if(value !== null && typeof value==='object'){
    return Object.fromEntries(Object.entries(value).map(([key,child])=>
      [key,SECRET_KEY.test(key)||customKeys.has(key.toLowerCase())?'[REDACTED]':sanitize(child,depth+1,customKeys)]));
  }
  if(typeof value==='string')return value.replace(SECRET_TEXT,'$1[REDACTED]');
  return value;
}
export function parsePayload(text,customKeys=new Set()) {
  if(typeof text!=='string'||!text.trim())throw new Error('Paste JSON into both editors.');
  if(new TextEncoder().encode(text).length>MAX_SIZE)throw new Error('Each JSON document must be smaller than 150 KB.');
  const parsed=JSON.parse(text);
  if(parsed===null||typeof parsed!=='object')throw new Error('Payload must be a JSON object or array.');
  return sanitize(parsed,0,customKeys);
}
export function flattenChanges(delta,path='$',output=[]) {
  if(delta===undefined)return output;
  if(Array.isArray(delta)) {
    const last=delta[delta.length-1];
    const type=delta.length===1?'added':(delta.length===3&&last===0?'removed':(delta.length===3&&last===3?'moved':'changed'));
    output.push({path,type});
  } else if(delta && typeof delta==='object') {
    for(const [key,value]of Object.entries(delta)) {
      if(key==='_t')continue;
      const segment=delta._t==='a'?'['+key.replace(/^_/,'')+']':(/^[a-zA-Z_$][\w$]*$/.test(key)?'.'+key:'['+JSON.stringify(key)+']');
      flattenChanges(value,path+segment,output);
      if(output.length>2500)throw new Error('Too many changes; split the event into smaller payloads.');
    }
  }
  return output;
}
export function comparePayloads(beforeText,afterText,options={}) {
  const keys=parseRedactionKeys(options.customKeys||'');
  const before=parsePayload(beforeText,keys);
  const after=parsePayload(afterText,keys);
  const delta=differ.diff(before,after)||null;
  const changes=flattenChanges(delta);
  const summary={added:0,removed:0,changed:0};
  for(const item of changes) {
    if(item.type==='added')summary.added++;
    else if(item.type==='removed')summary.removed++;
    else summary.changed++;
  }
  const drift=analyzeShapeDrift(before,after);
  return {before,after,delta,changes,summary,drift,
    schema:buildExampleSchema(after)};
}
