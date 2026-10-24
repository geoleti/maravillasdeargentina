(() => {
"use strict";
const $=id=>document.getElementById(id),nf=new Intl.NumberFormat("es-AR"),cfg=window.MARAVILLAS_ANALYTICS;
let lastData=null,request=0;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>nf.format(Number(v)||0);
const date=v=>v?new Intl.DateTimeFormat("es-AR",{dateStyle:"short",timeZone:"America/Argentina/Buenos_Aires"}).format(new Date(v)):"Sin datos";
function bars(id,rows){const max=Math.max(1,...rows.map(r=>Number(r.visits)));
$(id).innerHTML=rows.length?rows.map(r=>'<div class="bar"><span class="bar-label">'+esc(({desktop:"Computadora",mobile:"Celular",tablet:"Tablet"})[r.label]||r.label||"Sin identificar")+'</span><div class="track"><div class="fill" style="width:'+Math.max(0,Number(r.visits)/max*100)+'%"></div></div><span class="number">'+fmt(r.visits)+'</span></div>').join(""):'<p class="empty">Sin visitas registradas.</p>'}
function series(rows,days){
if(!rows.length)return [];
const byDay=new Map(rows.map(r=>[r.day,r]));
const today=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Argentina/Buenos_Aires"}).format(new Date());
const end=new Date(today+"T12:00:00Z"),start=days?new Date(end.getTime()-(days-1)*86400000):new Date(rows[0].day+"T12:00:00Z");
const list=[];for(let d=new Date(start);d<=end;d.setUTCDate(d.getUTCDate()+1)){const day=d.toISOString().slice(0,10);list.push(byDay.get(day)||{day,visits:0,visitors:0,place_views:0})}return list;
}
function chart(rows){if(!rows.length){$("chart").innerHTML='<p class="empty">Todavía no hay eventos en este período.</p>';return}
const w=700,h=240,l=42,r=12,t=18,b=30,max=Math.max(1,...rows.flatMap(x=>[Number(x.visits),Number(x.place_views)]));
const x=i=>l+(rows.length===1?.5:i/(rows.length-1))*(w-l-r),y=v=>h-b-Number(v)/max*(h-t-b);
let svg='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Evolución diaria de visitas y lugares mostrados. Datos disponibles en la tabla inferior.">';
for(let i=0;i<=4;i++){const v=max*i/4;svg+='<line x1="'+l+'" x2="'+(w-r)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#e5eae4"/><text x="'+(l-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+fmt(Math.ceil(v))+'</text>'}
for(const [key,color] of [["visits","#24594d"],["place_views","#bb843a"]]){
svg+='<polyline fill="none" stroke="'+color+'" stroke-width="2.5" points="'+rows.map((v,i)=>x(i)+','+y(v[key])).join(' ')+'"/>';
if(rows.length<=90)svg+=rows.map((v,i)=>'<circle cx="'+x(i)+'" cy="'+y(v[key])+'" r="3" fill="'+color+'"><title>'+esc(v.day)+': '+fmt(v[key])+'</title></circle>').join("");
}
const indices=[...new Set([0,Math.floor((rows.length-1)/2),rows.length-1])];
for(const i of indices)svg+='<text x="'+x(i)+'" y="'+(h-7)+'" text-anchor="middle">'+esc(rows[i].day.slice(8)+'/'+rows[i].day.slice(5,7))+'</text>';
$("chart").innerHTML=svg+'</svg>';
}
function clear(){lastData=null;for(const id of ["visits","visitors","sessions","place_views","random_clicks"])$(id).textContent="—";$("chart").innerHTML='<p class="empty">Sin datos cargados.</p>';$("placesBody").innerHTML='<tr><td colspan="5" class="empty">Sin datos cargados.</td></tr>';$("dailyBody").replaceChildren();for(const id of ["devices","browsers","referrers"])$(id).replaceChildren();$("export").disabled=true}
function render(d){lastData=d;const s=d.summary||{};
for(const id of ["visits","visitors","sessions","place_views","random_clicks"])$(id).textContent=fmt(s[id]);
const rows=series((d.daily||[]).sort((a,b)=>a.day.localeCompare(b.day)),Number(d.period_days));
chart(rows);$("dailyBody").innerHTML=rows.map(r=>'<tr><td>'+esc(r.day)+'</td><td>'+fmt(r.visits)+'</td><td>'+fmt(r.visitors)+'</td><td>'+fmt(r.place_views)+'</td></tr>').join("");
$("placesBody").innerHTML=d.places?.length?d.places.map(p=>'<tr><td>'+esc(p.place_name||p.place_id)+'</td><td>'+esc(p.province||"—")+'</td><td>'+fmt(p.views)+'</td><td>'+fmt(p.visitors)+'</td><td>'+fmt(p.sessions)+'</td></tr>').join(""):'<tr><td colspan="5" class="empty">Todavía no hay lugares registrados en este período.</td></tr>';
for(const id of ["devices","browsers","referrers"])bars(id,d[id]||[]);
$("export").disabled=!d.places?.length;$("status").textContent="Actualizado · Último evento: "+(s.last_event?new Intl.DateTimeFormat("es-AR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Argentina/Buenos_Aires"}).format(new Date(s.last_event)):"sin eventos");
$("started").textContent=d.collection_started_at?"Inicio del registro: "+date(d.collection_started_at)+".":"La conexión está activa. Todavía no se recibieron eventos.";
}
async function load(){const version=++request;$("refresh").disabled=true;$("status").className="";$("status").textContent="Actualizando estadísticas…";$("setup").hidden=true;
try{const res=await fetch(cfg.url+"/rest/v1/rpc/get_maravillas_dashboard",{method:"POST",headers:{"Content-Type":"application/json",apikey:cfg.key,Authorization:"Bearer "+cfg.key},body:JSON.stringify({p_days:Number($("period").value)}),cache:"no-store",signal:AbortSignal.timeout(15000)});
if(!res.ok){let code="";try{code=(await res.json()).code}catch{};const err=new Error("No disponible");err.setup=code==="PGRST202"||code==="42883";throw err}
const d=await res.json();if(version!==request)return;$("status").className="";render(d);
}catch(e){if(version!==request)return;clear();$("status").className="error";$("setup").hidden=!e.setup;$("status").textContent=e.setup?"Pendiente de activar el registro en Supabase.":"No se pudieron cargar los datos. Probá actualizar en unos minutos."}
finally{if(version===request)$("refresh").disabled=false}}
$("period").onchange=load;$("refresh").onclick=load;
$("export").onclick=()=>{if(!lastData)return;const cell=v=>'"'+String(v??"").replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
const lines=[["Lugar","Provincia","Veces mostrado","Visitantes","Sesiones"],...lastData.places.map(p=>[p.place_name,p.province,p.views,p.visitors,p.sessions])];
const blob=new Blob(["\ufeff"+lines.map(r=>r.map(cell).join(";")).join("\r\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="maravillas-estadisticas.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
load();
})();