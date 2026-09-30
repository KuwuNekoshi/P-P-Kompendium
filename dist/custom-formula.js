/* Offline arithmetic parser and dimensional checks for user-authored formulas. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PPCustomFormula=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // SI exponents: length, mass, time, temperature. Named quantities with the
  // same dimensions (e.g. energy and torque) keep their own unit selectors.
  const dimensions={scalar:[0,0,0,0],length:[1,0,0,0],area:[2,0,0,0],volume:[3,0,0,0],time:[0,0,1,0],velocity:[1,0,-1,0],acceleration:[1,0,-2,0],flow:[3,0,-1,0],mass:[0,1,0,0],density:[-3,1,0,0],massFlow:[0,1,-1,0],pressure:[-1,1,-2,0],force:[1,1,-2,0],power:[2,1,-3,0],energy:[2,1,-2,0],torque:[2,1,-2,0],massMoment:[1,1,0,0],rotationRate:[0,0,-1,0],countPerLength:[-1,0,0,0],temperature:[0,0,0,1],temperatureChange:[0,0,0,1],heatCapacity:[2,0,-2,-1],specificEnergy:[2,0,-2,0]};
  const validSymbol=name=>typeof name==='string'&&name.length<=24&&/^[\p{L}][\p{L}\p{N}]*(?:_[\p{L}\p{N}]+)?$/u.test(name)&&!['pi','π','sqrt'].includes(name);
  function parse(source){
    if(typeof source!=='string'||!source.trim()||source.length>500)throw new Error('Skriv en højreside med højst 500 tegn.');
    const text=source.replace(/[×·]/g,'*').replace(/[÷:]/g,'/').replace(/−/g,'-').replace(/,/g,'.');
    const tokens=[];let offset=0;
    while(offset<text.length){
      if(/\s/u.test(text[offset])){offset++;continue;}
      const rest=text.slice(offset),match=/^(?:\d+(?:\.\d*)?|\.\d+)|^[\p{L}][\p{L}\p{N}]*(?:_[\p{L}\p{N}]+)?|^[+\-*/^()]/u.exec(rest);
      if(!match)throw new Error('Ukendt tegn ved “'+rest.slice(0,12)+'”. Brug +, -, *, /, ^ og parenteser. Skriv kun højresiden.');
      tokens.push(match[0]);offset+=match[0].length;
      if(tokens.length>200)throw new Error('Udtrykket er for langt. Del det op med referencer til flere formler.');
    }
    let pos=0,nodes=0;const names=new Set();
    const node=(op,...args)=>{if(++nodes>180)throw new Error('Udtrykket er for stort.');return [op,...args];};
    function primary(depth){
      if(depth>24)throw new Error('Der er for mange niveauer af parenteser.');
      const token=tokens[pos++];
      if(token==='('){const value=sum(depth+1);if(tokens[pos++]!==')')throw new Error('Der mangler en afsluttende parentes.');return value;}
      if(token==='sqrt'){
        if(tokens[pos++]!=='(')throw new Error('Skriv kvadratroden som sqrt(udtryk).');
        const value=sum(depth+1);if(tokens[pos++]!==')')throw new Error('Der mangler en parentes efter sqrt.');return node('sqrt',value);
      }
      if(token==='pi'||token==='π')return 'π';
      if(token&&/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)){
        if(!Number.isFinite(Number(token)))throw new Error('Tallet er for stort.');
        return token.replace(/^\./,'0.').replace(/\.$/,'');
      }
      if(validSymbol(token)){names.add(token);if(names.size>24)throw new Error('Brug højst 24 forskellige symboler.');return token;}
      throw new Error('Her mangler et tal, et symbol eller en parentes.');
    }
    function unary(depth){
      if(depth>24)throw new Error('Udtrykket er for dybt.');
      if(tokens[pos]==='+'){pos++;return unary(depth+1);}
      if(tokens[pos]==='-'){pos++;return node('mul','-1',unary(depth+1));}
      let value=primary(depth+1);
      if(tokens[pos]==='^'){pos++;value=node('pow',value,unary(depth+1));}
      return value;
    }
    function product(depth){let value=unary(depth);while(['*','/'].includes(tokens[pos])){const op=tokens[pos++];value=node(op==='*'?'mul':'div',value,unary(depth));}return value;}
    function sum(depth){let value=product(depth);while(['+','-'].includes(tokens[pos])){const op=tokens[pos++];value=node(op==='+'?'add':'sub',value,product(depth));}return value;}
    const template=sum(0);
    if(pos!==tokens.length)throw new Error('Der mangler et regnetegn, eller der er en parentes for meget. Brug fx 2 * h.');
    return {template,names:[...names]};
  }
  function check(parsed,args,resultDimension){
    const equal=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-9);
    function number(t){
      if(typeof t==='string'){if(t==='π')return Math.PI;if(Object.hasOwn(args,t))throw new Error('Eksponenten skal være et fast tal, fx 2 eller (1/3).');return Number(t);}
      const [op,...children]=t,v=children.map(number);let n;
      if(op==='add')n=v[0]+v[1];else if(op==='sub')n=v[0]-v[1];else if(op==='mul')n=v[0]*v[1];else if(op==='div')n=v[0]/v[1];else if(op==='pow')n=v[0]**v[1];else n=Math.sqrt(v[0]);
      if(!Number.isFinite(n))throw new Error('Eksponenten er ugyldig.');return n;
    }
    function visit(t){
      if(typeof t==='string'){
        if(Object.hasOwn(args,t)){
          const d=dimensions[args[t].dimension];if(!d)throw new Error('Vælg en størrelse for '+t+'.');return d;
        }
        return dimensions.scalar;
      }
      const [op,a,b]=t,x=visit(a);
      if(op==='sqrt')return x.map(v=>v/2);
      if(op==='pow'){
        const exponent=number(b);if(!Number.isFinite(exponent)||Math.abs(exponent)>12)throw new Error('Brug en fast eksponent mellem -12 og 12.');
        return x.map(v=>v*exponent);
      }
      const y=visit(b);
      if(op==='add'||op==='sub'){
        if(!equal(x,y))throw new Error('Delene omkring '+(op==='add'?'+':'−')+' skal have samme enhed. Tjek størrelsen for hvert symbol.');return x;
      }
      return x.map((v,i)=>v+(op==='div'?-y[i]:y[i]));
    }
    const actual=visit(parsed.template),wanted=dimensions[resultDimension];
    if(!wanted||!equal(actual,wanted))throw new Error('Udtrykkets enhed passer ikke til resultatets størrelse. Tjek resultatet og størrelsen for hvert symbol.');
    return parsed;
  }
  return {parse,check,validSymbol};
});
