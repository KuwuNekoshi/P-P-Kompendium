/* Offline result documents. ZIP store and PDF image streams need no dependencies. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PPResultExport=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const modes={none:'Ingen',compact:'Kort',simple:'Simpel',expanded:'Fuld'};
 const clean=v=>String(v??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,'').replace(/[\ud800-\udfff]/gu,'�');
 const xml=v=>clean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const filename=(title,ext)=>(clean(title).normalize('NFC').replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,80).replace(/[ .]+$/,'')||'Resultater').replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,'Opgave-$1')+'-resultater.'+ext;
 const enc=s=>new TextEncoder().encode(s);
 function concat(parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let i=0;for(const p of parts){out.set(p,i);i+=p.length;}return out;}
 function ints(...values){const out=new Uint8Array(values.length*4),v=new DataView(out.buffer);values.forEach((n,i)=>v.setUint32(i*4,n,true));return out;}
 function shorts(...values){const out=new Uint8Array(values.length*2),v=new DataView(out.buffer);values.forEach((n,i)=>v.setUint16(i*2,n,true));return out;}
 function crc32(data){let crc=0xffffffff;for(const b of data){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
 function zip(files){const local=[],central=[];let offset=0;for(const [name,text]of Object.entries(files)){const n=enc(name),d=enc(text),crc=crc32(d),header=concat([ints(0x04034b50),shorts(20,0x800,0,0,33),ints(crc,d.length,d.length),shorts(n.length,0),n]);local.push(header,d);central.push(concat([ints(0x02014b50),shorts(20,20,0x800,0,0,33),ints(crc,d.length,d.length),shorts(n.length,0,0,0,0),ints(0,offset),n]));offset+=header.length+d.length;}const directory=concat(central);return concat([...local,directory,ints(0x06054b50),shorts(0,0,central.length,central.length),ints(directory.length,offset),shorts(0)]);}
 function collect(E,model,mode,format){
  if(!Object.hasOwn(modes,mode))throw Error('Ugyldigt valg af mellemregninger.');
  const ctx=E.context(model),groups=[];
  for(const g of E.formulaSections(model)){
   const rows=[];for(const f of g.formulas.filter(f=>f.isResult)){
    const full=ctx.safe('formula:'+f.id,'expanded',true),r=full.ok?E.evaluate(full.ast):{status:'error',error:full.error},u=E.resultUnit(f);
    const row={name:clean(f.name),symbol:clean(f.symbol),symbolMath:E.mathSymbol(f.symbol),status:r.status,unit:u.format==='tms'?'timer:minutter:sekunder':u.label};
    row.value=r.status==='ready'?(u.format==='tms'?E.Units.formatTime(r.value):format(r.value)):r.status==='incomplete'?'Udfyld de manglende værdier: '+r.missing.map(v=>v.symbol).join(', '):'Beregningsfejl: '+r.error;
    if(mode!=='none'){
     const expression=ctx.safe('formula:'+f.id,mode,true);
     if(expression.ok){row.text=f.symbol+' = '+E.plain(expression.ast,null,mode==='compact'?'units':'both');row.math=E.mathBody(expression.ast,mode==='compact'?'units':'both');}
     else row.text='Formelfejl: '+expression.error;
    }
    rows.push(row);
   }if(rows.length)groups.push({name:clean(g.name),rows});
  }
  return {title:clean(model.title||'Opgave'),mode,groups};
 }
 // Convert the engine's native MathML to Office Math, preserving fractions,
 // powers, roots, subscripts, parentheses and numeric reference annotations.
 function omml(math,parse){
  const run=t=>'<m:r><m:t xml:space="preserve">'+xml(t)+'</m:t></m:r>';
  const walk=n=>{if(n.nodeType===3)return n.textContent.trim()?run(n.textContent):'';const c=Array.from(n.children||[]),parts=c.map(walk);switch(n.localName){
   case 'mfrac':return '<m:f><m:num>'+parts[0]+'</m:num><m:den>'+parts[1]+'</m:den></m:f>';
   case 'msup':return '<m:sSup><m:e>'+parts[0]+'</m:e><m:sup>'+parts[1]+'</m:sup></m:sSup>';
   case 'msub':return '<m:sSub><m:e>'+parts[0]+'</m:e><m:sub>'+parts[1]+'</m:sub></m:sSub>';
   case 'msqrt':return '<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>'+parts.join('')+'</m:e></m:rad>';
   case 'mspace':return run(' ');
   default:return c.length?parts.join(''):run(n.textContent);
  }};
  return walk(parse('<math xmlns="http://www.w3.org/1998/Math/MathML">'+math+'</math>'));
 }
 function docx(data,parse){
  const p=(text,style='Normal')=>'<w:p><w:pPr><w:pStyle w:val="'+style+'"/></w:pPr><w:r><w:t xml:space="preserve">'+xml(text)+'</w:t></w:r></w:p>';
  let body=p(data.title,'Title')+p('Resultater · Mellemregninger: '+modes[data.mode]);
  const mathRun=text=>'<m:r><m:t xml:space="preserve">'+xml(text)+'</m:t></m:r>';
  const equation=body=>'<w:p><m:oMathPara><m:oMath>'+body+'</m:oMath></m:oMathPara></w:p>';
  for(const g of data.groups){body+=p(g.name,'Heading1');for(const r of g.rows){
   const lhs=parse&&r.symbolMath?omml(r.symbolMath,parse):mathRun(r.symbol);
   body+=p(r.name,'Heading2');
   if(r.text)body+=r.math&&parse?equation(lhs+mathRun(' = ')+omml(r.math,parse)):p(r.text,'Equation');
   body+=r.status==='ready'?equation(lhs+mathRun(' = '+r.value+' '+r.unit)):p(r.value);
  }}
  body+='<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>';
  const head='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  return zip({
   '[Content_Types].xml':head+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
   '_rels/.rels':head+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
   'word/_rels/document.xml.rels':head+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
   'word/document.xml':head+'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><w:body>'+body+'</w:body></w:document>',
   'word/styles.xml':head+'<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:lang w:val="da-DK"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120"/></w:pPr></w:pPrDefault></w:docDefaults>'+[['Normal',22],['Title',36],['Heading1',28],['Heading2',24],['Equation',22]].map(([id,size])=>'<w:style w:type="paragraph" w:styleId="'+id+'"><w:name w:val="'+id+'"/><w:pPr>'+(id!=='Normal'?'<w:keepNext/>':'')+'<w:spacing w:before="120" w:after="120"/></w:pPr><w:rPr><w:sz w:val="'+size+'"/>'+(id.startsWith('Heading')?'<w:b/>':'')+'</w:rPr></w:style>').join('')+'</w:styles>'
  });
 }
 // Raster PDF preserves Danish and mathematical Unicode without external fonts.
 // Pages are A4 at 2x screen resolution. They contain images, not selectable text.
 async function pdf(data,createCanvas){
  const pages=[];let canvas,ctx,y;
  function page(){canvas=createCanvas();canvas.width=1240;canvas.height=1754;ctx=canvas.getContext('2d');if(!ctx)throw Error('Browseren understøtter ikke PDF-eksport.');ctx.fillStyle='#fff';ctx.fillRect(0,0,1240,1754);ctx.fillStyle='#161616';y=100;pages.push(canvas);}
  function line(text,size=23,bold=false){ctx.font=(bold?'bold ':'')+size+'px Arial, sans-serif';let current='';for(const char of clean(text)){if(char==='\n'||ctx.measureText(current+char).width>1040){draw(current);current=char==='\n'?'':char;}else current+=char;}draw(current);function draw(t){if(y+size*1.5>1654){page();ctx.font=(bold?'bold ':'')+size+'px Arial, sans-serif';}ctx.fillText(t,100,y);y+=size*1.5;}}
  page();line(data.title,36,true);line('Resultater · Mellemregninger: '+modes[data.mode]);y+=20;
  for(const g of data.groups){line(g.name,29,true);for(const r of g.rows){line(r.name,25,true);if(r.text)line(r.text);line(r.status==='ready'?r.symbol+' = '+r.value+' '+r.unit:r.value);y+=20;}}
  const objects=[null,null];const add=b=>{objects.push(b);return objects.length;};const kids=[];
  for(const c of pages){const raw=atob(c.toDataURL('image/jpeg',0.94).split(',')[1]),jpg=Uint8Array.from(raw,v=>v.charCodeAt(0));const image=add(concat([enc('<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n'),jpg,enc('\nendstream')]));const stream='q 595.28 0 0 841.89 0 0 cm /Img Do Q';const content=add(enc('<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream'));kids.push(add(enc('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Img '+image+' 0 R >> >> /Contents '+content+' 0 R >>')));}
  objects[0]=enc('<< /Type /Catalog /Pages 2 0 R >>');objects[1]=enc('<< /Type /Pages /Count '+kids.length+' /Kids ['+kids.map(i=>i+' 0 R').join(' ')+'] >>');
  const parts=[enc('%PDF-1.4\n')],offsets=[0];let offset=parts[0].length;
  objects.forEach((obj,i)=>{offsets.push(offset);const b=concat([enc((i+1)+' 0 obj\n'),obj,enc('\nendobj\n')]);parts.push(b);offset+=b.length;});
  parts.push(enc('xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+offset+'\n%%EOF\n'));return concat(parts);
 }
 return {modes,clean,xml,filename,collect,docx,pdf,omml,crc32};
});
