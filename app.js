const $=id=>document.getElementById(id);
let places=[],current=null,bag=[],loadingTimer,shownCount=0;
function refill(){bag=places.filter(p=>p.id!==current?.id);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}}
function show(p){if(!p)return;current=p;$('name').textContent=p.name;$('province').textContent=p.province;$('panorama').title='Vista 360 de '+p.name;
$('loading').hidden=false;$('status').hidden=true;clearTimeout(loadingTimer);
$('panorama').src=p.embedUrl;
const url=new URL(location.href);url.searchParams.set('lugar',p.id);history.replaceState(null,'',url);
document.dispatchEvent(new CustomEvent('maravillas:place',{detail:{id:p.id,name:p.name,province:p.province,source:shownCount++===0?'initial':'random'}}));
loadingTimer=setTimeout(()=>{$('loading').hidden=true;$('status').textContent='Si esta panorámica no carga, probá otro lugar con Random.';$('status').hidden=false},18000)}
function random(){if(!bag.length)refill();show(bag.pop()||places[0])}
$('panorama').onload=()=>{clearTimeout(loadingTimer);$('loading').hidden=true};
$('random').onclick=random;
fetch('places.json?v=360-1',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Catálogo no disponible');return r.json()}).then(data=>{places=data.filter(p=>{try{const u=new URL(p.embedUrl);return u.protocol==='https:'&&u.hostname==='www.google.com'&&u.pathname==='/maps/embed'}catch{return false}});if(!places.length)throw Error('Sin panorámicas');$('random').disabled=false;const requested=new URL(location.href).searchParams.get('lugar');const selected=places.find(p=>p.id===requested);if(selected)show(selected);else random()}).catch(()=>{$('loading').textContent='No se pudieron cargar los lugares. Recargá la página.'});
