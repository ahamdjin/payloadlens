/** Structural inspection after redaction. These findings are heuristic, not authoritative contract validation. */
function valueType(value) {
  return value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
}
function propPath(base,key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? base+'.'+key : base+'['+JSON.stringify(key)+']';
}
export function analyzeShapeDrift(before,after) {
  const changes=[];
  function visit(a,b,path,depth=0) {
    if(depth>55)throw new Error('Payload nesting is too deep.');
    const aType=valueType(a),bType=valueType(b);
    if(aType!==bType){
      changes.push({path,kind:'type-changed',before:aType,after:bType});
      return;
    }
    if(aType==='object'){
      const keys=new Set([...Object.keys(a),...Object.keys(b)]);
      for(const key of keys) {
        const next=propPath(path,key);
        if(!(key in b))changes.push({path:next,kind:'removed',before:valueType(a[key]),after:'missing'});
        else if(!(key in a))changes.push({path:next,kind:'added',before:'missing',after:valueType(b[key])});
        else visit(a[key],b[key],next,depth+1);
        if(changes.length>2000)throw new Error('Too many structural changes; compare smaller payloads.');
      }
    }else if(aType==='array'){
      if(a.length!==b.length)changes.push({path,kind:'array-size',before:String(a.length),after:String(b.length)});
      // Arrays are variable-length. Compare sampled item types at shared indices,
      // but do not claim a schema violation from length alone.
      for(let i=0;i<Math.min(a.length,b.length,100);i++)visit(a[i],b[i],path+'['+i+']',depth+1);
    }
  }
  visit(before,after,'$');
  const alertCount=changes.filter(x=>x.kind==='type-changed'||x.kind==='removed').length;
  return {changes,alertCount,total:changes.length};
}

/** Draft JSON Schema from one sample. No inferred required fields or PII guarantees. */
export function inferExampleSchema(value,depth=0) {
  if(depth>48)throw new Error('Sample nesting is too deep to infer a schema.');
  const kind=valueType(value);
  if(kind==='object'){
    const properties={};
    for(const [k,v]of Object.entries(value))properties[k]=inferExampleSchema(v,depth+1);
    return {type:'object',properties,additionalProperties:true};
  }
  if(kind==='array'){
    const first=value[0];
    return {type:'array',...(first===undefined?{}:{items:inferExampleSchema(first,depth+1)})};
  }
  if(kind==='null')return {type:'null'};
  return {type:kind};
}
export function buildExampleSchema(redacted, title='PayloadLens webhook sample') {
  return {
    $schema:'https://json-schema.org/draft/2020-12/schema',
    title,description:'Inferred from one redacted JSON example. Review and manually add required fields and constraints.',
    ...inferExampleSchema(redacted),
  };
}
