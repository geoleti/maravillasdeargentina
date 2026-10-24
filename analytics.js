(() => {
"use strict";
const cfg=window.MARAVILLAS_ANALYTICS;
if(!cfg||location.hostname!=="geoleti.github.io"||!/\/maravillasdeargentina\/(?:index\.html)?$/.test(location.pathname)||navigator.globalPrivacyControl||navigator.doNotTrack==="1")return;
const uid=()=>crypto.randomUUID();
let memoryVisitor=uid(),memorySession=uid(),memoryLast=0;
function get(key){try{return localStorage.getItem("maravillas_"+key)}catch{return null}}
function set(key,value){try{localStorage.setItem("maravillas_"+key,value)}catch{}}
const visitor=get("visitor")||memoryVisitor;set("visitor",visitor);
function session(){const now=Date.now();let last=Number(get("last")||memoryLast),id=get("session")||memorySession;
if(!last||now-last>1800000)id=uid();memorySession=id;memoryLast=now;set("session",id);set("last",String(now));return id}
const ua=navigator.userAgent;
const device=/iPad|Tablet/i.test(ua)?"tablet":/Mobi|Android|iPhone/i.test(ua)?"mobile":"desktop";
const browser=/Edg\//.test(ua)?"Edge":/OPR\//.test(ua)?"Opera":/Firefox\//.test(ua)?"Firefox":/Chrome\//.test(ua)?"Chrome":/Safari\//.test(ua)?"Safari":"Otro";
function referrer(){try{const h=new URL(document.referrer).hostname;
if(h===location.hostname)return "Mismo sitio";
if(/(^|\.)linkedin\.com$/.test(h))return "LinkedIn";
if(/(^|\.)google\./.test(h))return "Google";
if(/(^|\.)github\.com$/.test(h))return "GitHub";
return "Otros sitios"}catch{return "Directo / sin referencia"}}
const origin=referrer();
function track(event,p={}){
const payload={p_event_id:uid(),p_event_name:event,p_visitor_id:visitor,p_session_id:session(),p_place_id:p.id||null,p_place_name:p.name||null,p_province:p.province||null,p_source:p.source||null,p_device:device,p_browser:browser,p_referrer:origin};
fetch(cfg.url+"/rest/v1/rpc/log_maravillas_event",{method:"POST",headers:{"Content-Type":"application/json",apikey:cfg.key,Authorization:"Bearer "+cfg.key},body:JSON.stringify(payload),keepalive:true}).then(r=>{if(!r.ok)console.debug("Maravillas: registro de estadísticas no disponible",r.status)}).catch(()=>{});
}
window.maravillasAnalytics={track};
track("page_view");
document.addEventListener("maravillas:place",e=>track("place_view",e.detail));
document.getElementById("random")?.addEventListener("click",()=>track("random_click"));
})();