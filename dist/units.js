/* Exact unit factors for symbolic substitution. No user values are evaluated. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PPUnits=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // The first unit is the formula's base unit. base = value × numerator / denominator + offset.
  // Ratios such as kg/h retain their component factors instead of rounded decimals.
  const definitions={
    scalar:[['number','tal'],['percent','%',1,100]],
    length:[['m','m'],['mm','mm',1,1000],['cm','cm',1,100],['dm','dm',1,10],['um','µm',1,1000000],['km','km',1000]],
    area:[['m2','m²'],['mm2','mm²',1,1000000],['cm2','cm²',1,10000],['dm2','dm²',1,100],['ha','ha',10000],['km2','km²',1000000]],
    volume:[['m3','m³'],['L','L',1,1000],['mL','mL',1,1000000],['cL','cL',1,100000],['dL','dL',1,10000],['dm3','dm³',1,1000],['cm3','cm³',1,1000000],['mm3','mm³',1,1000000000]],
    time:[['s','s'],['ms','ms',1,1000],['min','min',60],['h','h',3600],['day','døgn',86400]],
    velocity:[['m_s','m/s'],['mm_s','mm/s',1,1000],['cm_s','cm/s',1,100],['m_min','m/min',1,60],['km_h','km/h',1000,3600]],
    acceleration:[['m_s2','m/s²'],['mm_s2','mm/s²',1,1000],['cm_s2','cm/s²',1,100]],
    flow:[['m3_s','m³/s'],['m3_min','m³/min',1,60],['m3_h','m³/h',1,3600],['L_s','L/s',1,1000],['L_min','L/min',1,60000],['L_h','L/h',1,3600000],['mL_s','mL/s',1,1000000],['mL_min','mL/min',1,60000000]],
    mass:[['kg','kg'],['g','g',1,1000],['mg','mg',1,1000000],['ton','ton',1000]],
    density:[['kg_m3','kg/m³'],['ton_m3','ton/m³',1000],['kg_L','kg/L',1000],['g_cm3','g/cm³',1000],['g_L','g/L']],
    massFlow:[['kg_s','kg/s'],['kg_min','kg/min',1,60],['kg_h','kg/h',1,3600],['g_s','g/s',1,1000],['g_min','g/min',1,60000],['ton_h','ton/h',1000,3600]],
    pressure:[['Pa','Pa'],['hPa','hPa',100],['kPa','kPa',1000],['MPa','MPa',1000000],['bar','bar',100000],['mbar','mbar',100]],
    force:[['N','N'],['mN','mN',1,1000],['kN','kN',1000]],
    power:[['W','W'],['kW','kW',1000],['MW','MW',1000000]],
    energy:[['J','J'],['kJ','kJ',1000],['MJ','MJ',1000000],['Wh','Wh',3600],['kWh','kWh',3600000],['MWh','MWh',3600000000]],
    torque:[['N_m','N·m'],['N_cm','N·cm',1,100],['N_mm','N·mm',1,1000],['kN_m','kN·m',1000]],
    massMoment:[['kg_m','kg·m'],['kg_cm','kg·cm',1,100],['kg_mm','kg·mm',1,1000],['g_cm','g·cm',1,100000],['ton_m','ton·m',1000]],
    rotationRate:[['rev_s','omdr./s'],['rpm','omdr./min',1,60]],
    countPerLength:[['per_m','1/m'],['per_cm','1/cm',100],['per_mm','1/mm',1000]],
    temperature:[['K','K'],['C','°C',1,1,'273.15']],
    // A temperature difference never receives the absolute-temperature offset.
    temperatureChange:[['K','K'],['C','°C']],
    heatCapacity:[['J_kgK','J/(kg·K)'],['kJ_kgK','kJ/(kg·K)',1000],['J_kgC','J/(kg·°C)'],['kJ_kgC','kJ/(kg·°C)',1000],['J_gK','J/(g·K)',1000]],
    specificEnergy:[['J_kg','J/kg'],['kJ_kg','kJ/kg',1000],['MJ_kg','MJ/kg',1000000]]
  };
  const units=Object.fromEntries(Object.entries(definitions).map(([dimension,rows])=>[dimension,rows.map(([id,label,numerator=1,denominator=1,offset='0'])=>Object.freeze({id,label,numerator,denominator,offset,dimension}))]));
  function choices(dimension){
    if(!Object.hasOwn(units,dimension))throw new Error('Ukendt størrelse til enhedsvalg.');
    return units[dimension];
  }
  const base=dimension=>choices(dimension)[0];
  function get(dimension,id){
    const unit=choices(dimension).find(u=>u.id===id);
    if(!unit)throw new Error('Enheden passer ikke til denne størrelse.');
    return unit;
  }
  const key=variable=>variable.symbol+':'+variable.dimension;
  const constant=value=>({type:'constant',value:String(value)});
  const group=ast=>ast.type==='group'?ast:{type:'group',children:[ast]};
  function convert(ast,unit,direction='toBase'){
    if(!['toBase','fromBase'].includes(direction))throw new Error('Ukendt omregningsretning.');
    const inverse=direction==='fromBase';
    const numerator=inverse?unit.denominator:unit.numerator,denominator=inverse?unit.numerator:unit.denominator;
    if(numerator===1&&denominator===1&&unit.offset==='0')return ast;
    let out=['symbol','constant','group'].includes(ast.type)?ast:group(ast);
    if(inverse&&unit.offset!=='0')out={type:'sub',children:[out,constant(unit.offset)]};
    if(numerator!==1)out={type:'mul',children:[out,constant(numerator)]};
    if(denominator!==1)out={type:'div',children:[out,constant(denominator)]};
    if(!inverse&&unit.offset!=='0')out={type:'add',children:[out,constant(unit.offset)]};
    return group(out);
  }
  function hint(unit,direction='toBase'){
    const inverse=direction==='fromBase',parts=[];
    const format=n=>Number(n).toLocaleString('da-DK',{maximumFractionDigits:8});
    if(inverse&&unit.offset!=='0')parts.push('− '+format(unit.offset));
    const n=inverse?unit.denominator:unit.numerator,d=inverse?unit.numerator:unit.denominator;
    if(n!==1)parts.push('× '+format(n));
    if(d!==1)parts.push('÷ '+format(d));
    if(!inverse&&unit.offset!=='0')parts.push('+ '+format(unit.offset));
    return parts.join(' · derefter ')||'Samme tal';
  }
  return {choices,base,get,key,convert,hint};
});
