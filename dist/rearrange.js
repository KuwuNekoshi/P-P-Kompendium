/* Symbolic rearrangements of the catalogue. No numeric user input or solver. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PPRearrange=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const add=(...terms)=>{const a=terms.flatMap(t=>Array.isArray(t)&&t[0]==='add'?t.slice(1):[t]).filter(t=>t!=='0');return a.length? a.length===1?a[0]:['add',...a]:'0';};
  const mul=(...factors)=>{if(factors.includes('0'))return '0';const a=factors.flatMap(t=>Array.isArray(t)&&t[0]==='mul'?t.slice(1):[t]).filter(t=>t!=='1');return a.length?a.length===1?a[0]:['mul',...a]:'1';};
  const sub=(a,b)=>b==='0'?a:same(a,b)?'0':a==='0'?mul('-1',b):['sub',a,b];
  const div=(a,b)=>a==='0'?'0':b==='1'?a:['div',a,b];
  const pow=(a,n='2')=>a==='0'?'0':a==='1'?'1':n==='1'?a:['pow',a,n];
  const sqrt=a=>a==='0'||a==='1'?a:['sqrt',a];
  const count=(node,key)=>typeof node==='string'?Number(node===key):node.slice(1).reduce((n,child)=>n+count(child,key),0);
  // Return coefficients in increasing powers; constants may be whole formulas.
  function polynomial(node,key){
    if(!count(node,key))return [node];
    if(node===key)return ['0','1'];
    const [op,...children]=node;
    if(op==='group')return polynomial(children[0],key);
    const merge=(a,b,subtract=false)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>(subtract?sub:add)(a[i]||'0',b[i]||'0'));
    const times=(a,b)=>{
      if(a.length+b.length>4)throw Error('Højeregradsligning');
      const out=Array(a.length+b.length-1).fill('0');
      a.forEach((x,i)=>b.forEach((y,j)=>{out[i+j]=add(out[i+j],mul(x,y));}));return out;
    };
    if(op==='add')return children.map(c=>polynomial(c,key)).reduce((a,b)=>merge(a,b));
    if(op==='sub')return merge(polynomial(children[0],key),polynomial(children[1],key),true);
    if(op==='mul')return children.map(c=>polynomial(c,key)).reduce(times);
    if(op==='div'&&!count(children[1],key))return polynomial(children[0],key).map(c=>div(c,children[1]));
    if(op==='pow'&&children[1]==='2'){const a=polynomial(children[0],key);return times(a,a);}
    throw Error('Den ukendte optræder flere steder i et rodudtryk.');
  }
  function isolate(node,key,y,state){
    if(node===key)return y;
    if(count(node,key)>1){
      const coefficients=polynomial(node,key);
      while(coefficients.at(-1)==='0')coefficients.pop();
      const [c='0',b='0',a='0']=coefficients;
      if(a==='0'&&b!=='0')return div(sub(y,c),b);
      if(a!=='0'){
        state.root=true;
        const radical=sqrt(sub(pow(b),mul('4',a,sub(c,y))));
        return div(state.negative?mul('-1',add(b,radical)):sub(radical,b),mul('2',a));
      }
      throw Error('Den ukendte bortfalder.');
    }
    const [op,...children]=node,index=children.findIndex(c=>count(c,key)),selected=children[index],other=children.filter((_,i)=>i!==index);
    if(index<0)throw Error('Størrelsen findes ikke i formlen.');
    if(op==='group')return isolate(selected,key,y,state);
    if(op==='add')return isolate(selected,key,sub(y,add(...other)),state);
    if(op==='sub')return isolate(selected,key,index===0?add(y,children[1]):sub(children[0],y),state);
    if(op==='mul')return isolate(selected,key,div(y,mul(...other)),state);
    if(op==='div')return isolate(selected,key,index===0?mul(y,children[1]):div(children[0],y),state);
    if(op==='sqrt'){state.constraints.push(y);return isolate(selected,key,pow(y),state);}
    if(op==='pow'&&index===0&&['2','3'].includes(children[1])){
      state.root=true;
      const root=children[1]==='2'?sqrt(y):pow(y,div('1','3'));
      return isolate(selected,key,state.negative&&children[1]==='2'?mul('-1',root):root,state);
    }
    throw Error('Omskrivningen kræver en anden metode.');
  }
  // Positive solution of y = c*x + k*sqrt(a*x²+b). The rationalized form
  // also works when c² = a*k² and avoids dividing by that difference.
  const linearRadical=(y,c,k,a,b)=>div(sub(pow(y),mul(pow(k),b)),add(mul(y,c),mul(k,sqrt(add(mul(a,pow(y)),mul(sub(pow(c),mul(a,pow(k))),b))))));
  function special(id,key){
    const y='given';
    if(id==='frustumMantle'&&['D','d'].includes(key))return {blocked:'Diameteren optræder i både omkreds og skrå højde. Omskrivningen giver en fjerdegradsligning og er ikke en enkel TI-30-formel. Brug den skrå højde som ekstra kendt mål og formlen Keglestubskappe med skrå højde, eller løs den oprindelige ligning.'};
    if(id==='frustumVolume'&&['D','d'].includes(key)){
      const other=key==='D'?'d':'D';return {template:div(sub(sqrt(sub(div(mul('48',y),mul('π','h')),mul('3',pow(other)))),other),'2'),root:true};
    }
    if(id==='coneMantle'&&key==='D')return {template:sqrt(mul('2',sub(sqrt(add(pow('h','4'),mul('4',pow(div(y,'π'))))),pow('h')))),root:true};
    if(id==='coneClosed'&&key==='D')return {template:div(mul('2',div(y,'π')),sqrt(add(mul('2',div(y,'π')),pow('h')))),root:true};
    if(id==='pyramidFrustumVolume'&&['G','g'].includes(key)){
      const other=key==='G'?'g':'G';return {template:pow(div(sub(sqrt(sub(div(mul('12',y),'h'),mul('3',other))),sqrt(other)),'2')),root:true,note:'Den indre forskel mellem kvadratrødder skal være ikke-negativ. Kontrollér også rækkefølgen af stor og lille endeflade.'};
    }
    if(['triangularPrismOpen','triangularPrismClosed'].includes(id)&&['B','h'].includes(key)){
      const closed=id.endsWith('Closed');
      return {template:key==='h'?linearRadical(closed?sub(y,mul('L','B')):y,'B',mul('2','L'),'1',pow(div('B','2'))):linearRadical(y,closed?add('h','L'):'h','L','1',mul('4',pow('h'))),root:true,note:'Det oplyste areal skal mindst svare til arealet ved det søgte mål lig 0.'};
    }
    if(['rectangularPyramidOpen','rectangularPyramidClosed'].includes(id)){
      const closed=id.endsWith('Closed');
      if(key==='h'){
        const area=closed?sub(y,mul('L','B')):y,lb=mul('L','B'),sum=add(pow('L'),pow('B')),difference=sub(pow('L'),pow('B'));
        return {template:sqrt(div(mul(area,sub(pow(area),pow(lb))),add(mul(area,sum),mul(lb,sqrt(add(mul('4',pow(area)),pow(difference))))))),root:true,note:'Kappearealet skal være mindst L · B. Formlen gælder også L = B.'};
      }
      const other=key==='L'?'B':'L',s=sqrt(add(pow('h'),pow(div(other,'2'))));
      return {template:linearRadical(y,closed?add(s,other):s,other,div('1','4'),pow('h')),root:true,note:'Det oplyste areal skal mindst svare til arealet ved det søgte mål lig 0.'};
    }
    if(id==='mixTemperature'&&['cp1','m1','cp2','m2'].includes(key)){
      const first=key.endsWith('1'),ownT=first?'T1':'T2',otherT=first?'T2':'T1',otherMass=first?'m2':'m1',otherCp=first?'cp2':'cp1',partner=key.startsWith('m')?(first?'cp1':'cp2'):(first?'m1':'m2');
      return {template:div(mul(otherCp,otherMass,sub(otherT,y)),mul(partner,sub(y,ownT))),note:'Blandingstemperaturen skal ligge mellem starttemperaturerne. Ved ens starttemperaturer kan masse eller varmekapacitet ikke bestemmes ud fra blandingstemperaturen alene.'};
    }
    if(id==='mixCapacity'&&['m1','m2'].includes(key)){
      const first=key==='m1';return {template:div(mul(first?'m2':'m1',sub(first?'cp2':'cp1',y)),sub(y,first?'cp1':'cp2')),note:'Blandingens varmekapacitet skal ligge mellem komponenternes. Ens varmekapaciteter bestemmer ikke de enkelte masser.'};
    }
    return null;
  }
  function build(base){
    const formulas={...base},options={};
    for(const [id,f]of Object.entries(base)){
      const choices=[{id,key:'given',symbol:f.symbol,label:f.name,available:true}];
      for(const [key,arg]of Object.entries(f.args)){
        const specialCase=special(id,key);
        if(specialCase?.blocked){choices.push({key,symbol:arg.symbol,label:arg.label,available:false,reason:specialCase.blocked});continue;}
        const branches=(id==='generalDistance'&&key==='t')||(['kineticEnergy','dynamicHead'].includes(id)&&key==='v')?[false,true]:[false];
        for(const negative of branches){
          const derivedId='inverse:'+id+':'+key+(negative?':negative':'');
          try{
            const state={negative,root:!!specialCase?.root,constraints:[]};
            const template=specialCase?.template||isolate(f.template,key,'given',state);
            const branch=branches.length>1?(negative?' · rod −':' · rod +'):'';
            const conditions=['Nævnere skal være forskellige fra 0.'];
            if(state.root)conditions.push('Udtryk under kvadratrødder skal være ikke-negative. '+(branches.length>1?'Kontrollér begge rødder og vælg den, der passer til opgaven.':'Der bruges den ikke-negative rod for fysiske mål.'));
            if(id==='generalDistance'&&key==='t')conditions.push('Denne omskrivning kræver a ≠ 0. Ved a = 0 bruges t = s / v_start. Kun tider t ≥ 0 passer til forløbet.');
            if(specialCase?.note)conditions.push(specialCase.note);
            const note=conditions.join(' ')+(f.note?' Grundformlens forudsætninger: '+f.note:'');
            formulas[derivedId]={name:(f.name+' → '+arg.label+branch).slice(0,120),group:f.group,symbol:arg.symbol,dimension:arg.dimension,args:{given:{symbol:f.symbol,label:f.name,dimension:f.dimension},...Object.fromEntries(Object.entries(f.args).filter(([k])=>k!==key))},template,note,source:f.source,aliases:f.aliases,constraints:state.constraints,rearranged:{base:id,key,negative}};
            choices.push({id:derivedId,key,symbol:arg.symbol,label:arg.label+branch,available:true});
          }catch(error){choices.push({key,symbol:arg.symbol,label:arg.label,available:false,reason:error.message});}
        }
      }
      options[id]=choices;
    }
    return {formulas,options};
  }
  return {build};
});
