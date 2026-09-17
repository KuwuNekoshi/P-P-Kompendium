/* Advisory entry-length estimates and symbolic intermediate results; no evaluation. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'));
  else root.PPCalculatorGuide=factory(root.PP);
})(typeof globalThis!=='undefined'?globalThis:this,function(E){
  'use strict';
  const LIMIT=80,RECOMMEND_AT=72,TARGET=64,MAX_STEPS=48;
  const SOURCES={
    length:'https://education.ti.com/en/customer-support/knowledge-base/scientific-elem-calculators/general-information/15401',
    nesting:'https://education.ti.com/html/eguides/scientifics/TI-30XS-MultiView/EN/Content/EG_30XSMV/M_GetStart/GS_Home.HTML',
    memory:'https://education.ti.com/html/eguides/scientifics/TI-30XS-MultiView/EN/Content/EG_30XSMV/M_GetStart/GS_MemVar.HTML'
  };
  const unwrap=ast=>ast.type==='group'?unwrap(ast.children[0]):ast;
  function estimate(ast){
    // Use the same linear notation as copied text: only necessary parentheses
    // count, with one placeholder per numeric occurrence and no unit labels.
    const count=(node,digits)=>Array.from(E.plain(node,()=> '0'.repeat(digits)).replace(/\s/g,'')).length;
    function depth(node){
      if(!node.children)return 0;
      return Math.max(...node.children.map(depth))+(['div','pow','sqrt'].includes(node.type)?1:0);
    }
    const min=count(ast,4),max=count(ast,8),nesting=depth(ast);
    return {min,max,nesting,limit:LIMIT,recommend:max>=RECOMMEND_AT||nesting>4,tooLong:max>LIMIT,deep:nesting>4};
  }
  // Length-prefixed child keys avoid both ambiguous joins and exponential escaping.
  function keyFactory(){
    const cache=new WeakMap();
    return function key(ast){
      ast=unwrap(ast);
      if(cache.has(ast))return cache.get(ast);
      let value;
      if(ast.type==='symbol')value=JSON.stringify(['symbol',ast.symbol,ast.dimension||'',ast.reference||'',ast.unit||'']);
      else if(ast.type==='constant')value=JSON.stringify(['constant',ast.value]);
      else value=ast.type+'['+ast.children.map(c=>{const s=key(c);return s.length+':'+s;}).join('')+']';
      cache.set(ast,value);return value;
    };
  }
  function split(ast,candidates=[],resultSymbol='R'){
    const key=keyFactory(),known=new Map(),steps=[],stored=new Map();
    const used=new Set([...E.variables(ast).map(v=>v.symbol),resultSymbol]);
    for(const candidate of candidates)if(!known.has(key(candidate.ast)))known.set(key(candidate.ast),candidate);
    let serial=0;
    function alias(preferred){
      if(preferred&&!used.has(preferred)){used.add(preferred);return preferred;}
      let name;do{name='M_'+(++serial);}while(used.has(name));used.add(name);return name;
    }
    function replace(node,match,replacement){
      if(key(node)===match)return replacement;
      return node.children?{...node,children:node.children.map(c=>replace(c,match,replacement))}:node;
    }
    function toStep(node){
      const identity=key(node);
      if(stored.has(identity))return stored.get(identity);
      if(steps.length>=MAX_STEPS)return node;
      const description=known.get(identity),body=shorten(node);
      if(steps.length>=MAX_STEPS)return body;
      const symbol=alias(description?.symbol);
      const variable={type:'symbol',symbol,intermediate:true};
      if(description?.dimension)variable.dimension=description.dimension;
      steps.push({symbol,ast:body,name:description?.name||'Mellemresultat',unit:description?.unit||'',estimate:estimate(body)});
      stored.set(identity,variable);return variable;
    }
    function choose(node){
      const whole=key(node);let best=null;
      function visit(current){
        const simple=unwrap(current),identity=key(simple),size=estimate(simple);
        if(simple.children&&identity!==whole&&size.max>14){
          const fits=size.max<=TARGET&&!size.deep;
          const score=(known.has(identity)?1000:0)+(fits?500:0)+Math.min(size.max,TARGET);
          if(!best||score>best.score)best={node:current,identity,score};
        }
        if(simple.children)simple.children.forEach(visit);
      }
      visit(node);return best;
    }
    function shorten(node){
      node=E.Units.reduce(node);
      for(let attempt=0;attempt<MAX_STEPS&&steps.length<MAX_STEPS;attempt++){
        const size=estimate(node);
        if(size.max<=TARGET&&!size.deep)break;
        const candidate=choose(node);
        if(candidate){
          const replacement=toStep(candidate.node);
          if(key(replacement)===candidate.identity)break;
          node=replace(node,candidate.identity,replacement);
        }else{
          const simple=unwrap(node);
          // A wide sum/product can consist entirely of short individual terms.
          // Split a whole prefix; never cut across subtraction or division.
          if(!['add','mul'].includes(simple.type)||simple.children.length<3)break;
          const midpoint=Math.ceil(simple.children.length/2);
          const part={type:simple.type,children:simple.children.slice(0,midpoint)};
          const replacement=toStep(part);
          if(key(replacement)===key(part))break;
          node={...simple,children:[replacement,...simple.children.slice(midpoint)]};
        }
      }
      return node;
    }
    function separateShapes(node){
      if(node.assemblyParts){
        return {...node,children:node.children.map(c=>unwrap(c).children?toStep(c):c)};
      }
      return node.children?{...node,children:node.children.map(separateShapes)}:node;
    }
    const final=E.Units.reduce(shorten(separateShapes(ast)));
    return {steps,final,estimate:estimate(final),incomplete:steps.some(s=>s.estimate.tooLong||s.estimate.deep)||estimate(final).tooLong||estimate(final).deep};
  }
  function create(ctx,target,mode='expanded'){
    const result=ctx.safe(target,mode,true);
    if(!result.ok||(mode==='compact'&&!ctx.safe(target).ok))return null;
    const descriptor=ctx.map.get(target),size=estimate(result.ast);
    if(!size.recommend)return {estimate:size,plan:null,mode};
    const candidates=[];
    let dependencies;try{dependencies=ctx.steps(target);}catch(_){return null;}
    for(const d of dependencies){
      if(d.target===target)continue;
      const ast=ctx.target(d.target,mode,false);
      if(unwrap(ast).children)candidates.push({ast,symbol:d.symbol,name:d.name,dimension:d.dimension,unit:E.Units.base(d.dimension).label});
    }
    // Identify physical intermediate quantities before cancelling scales across
    // them. Each emitted step and the final expression are reduced separately.
    return {estimate:size,plan:split(ctx.result(target,mode,false),candidates,descriptor.symbol),mode};
  }
  return {estimate,split,create,LIMIT,SOURCES};
});
