const $=id=>document.getElementById(id);
let places=[],current=null,history=[],cursor=-1,favorites=new Set();
try{favorites=new Set(JSON.parse(localStorage.getItem('maravillas-favorites')||'[]'))}catch{}
const normalized=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const available=()=>places.filter(p=>!$('regionFilter').value||p.region===$('regionFilter').value);
function mapsUrl(p){const u=new URL('https://www.google.com/maps/@');u.search=new URLSearchParams({api:'1',map_action:'pano',viewpoint:p.lat+','+p.lng,...(p.panoId?{pano:p.panoId}:{})});return u.href}
function embedUrl(p){if(p.embedUrl){try{const u=new URL(p.embedUrl);if(u.protocol==='https:'&&u.hostname==='www.google.com'&&u.pathname.startsWith('/maps/embed'))return u.href}catch{}}const key=window.MARAVILLAS_CONFIG?.googleMapsEmbedKey;if(!key)return '';const u=new URL('https://www.google.com/maps/embed/v1/streetview');u.search=new URLSearchParams({key,location:p.lat+','+p.lng,...(p.panoId?{pano:p.panoId}:{})});return u.href}
function show(p,record=true){if(!p)return;current=p;if(record){history=history.slice(0,cursor+1);history.push(p.id);cursor=history.length-1}
$('name').textContent=p.name;$('province').textContent=p.province;$('region').textContent=p.region;$('description').textContent=p.description;
$('counter').textContent=available().length+' lugares para descubrir';
$('favorite').textContent=favorites.has(p.id)?'♥':'♡';$('favorite').setAttribute('aria-pressed',favorites.has(p.id));
for(const id of ['maps','heroMaps'])$(id).href=mapsUrl(p);
const embed=embedUrl(p);$('panorama').hidden=!embed;$('fallback').hidden=!!embed;
if(embed)$('panorama').src=embed;else $('panorama').removeAttribute('src');
$('panorama').title='Vista 360 de '+p.name;
$('previous').disabled=cursor<=0;
const url=new URL(location.href);url.searchParams.set('lugar',p.id);window.history.replaceState(null,'',url);
renderCards()}
function random(){const pool=available().filter(p=>p.id!==current?.id);show(pool.length?pool[Math.floor(Math.random()*pool.length)]:available()[0])}
function renderCards(){const query=normalized($('search').value);const list=available().filter(p=>(!$('onlyFavorites').checked||favorites.has(p.id))&&normalized(p.name+' '+p.province).includes(query));$('cards').replaceChildren();for(const p of list){const button=document.createElement('button');button.className='destination';const region=document.createElement('span');region.className='eyebrow';region.textContent=p.region;const name=document.createElement('strong');name.textContent=p.name;const province=document.createElement('small');province.textContent=p.province+(favorites.has(p.id)?' · ♥':'');button.append(region,name,province);button.onclick=()=>{show(p);$('catalog').hidden=true;$('catalogToggle').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'smooth'})};$('cards').append(button)}$('empty').hidden=!!list.length}
function status(message){$('status').textContent=message;$('status').hidden=false;clearTimeout(status.timer);status.timer=setTimeout(()=>$('status').hidden=true,4000)}
$('random').onclick=random;
$('next').onclick=()=>cursor<history.length-1?show(places.find(p=>p.id===history[++cursor]),false):random();
$('previous').onclick=()=>{if(cursor>0)show(places.find(p=>p.id===history[--cursor]),false)};
$('regionFilter').onchange=()=>{history=[];cursor=-1;random()};
$('favorite').onclick=()=>{if(!current)return;favorites.has(current.id)?favorites.delete(current.id):favorites.add(current.id);try{localStorage.setItem('maravillas-favorites',JSON.stringify([...favorites]))}catch{status('No se pudo guardar en este navegador.')}show(current,false)};
$('catalogToggle').onclick=()=>{const open=$('catalog').hidden;$('catalog').hidden=!open;$('catalogToggle').setAttribute('aria-expanded',open);if(open){$('catalog').scrollIntoView({behavior:'smooth'});$('search').focus({preventScroll:true})}};
$('search').oninput=renderCards;$('onlyFavorites').onchange=renderCards;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.stage').requestFullscreen()}catch{status('Tu navegador no permite pantalla completa.')}};
$('share').onclick=async()=>{if(!current)return;try{if(navigator.share)await navigator.share({title:current.name+' · Maravillas de Argentina',url:location.href});else{await navigator.clipboard.writeText(location.href);status('Enlace copiado')}}catch(e){if(e.name!=='AbortError')status('Copiá el enlace de la barra de direcciones.')}};
fetch('places.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{places=data;for(const region of [...new Set(places.map(p=>p.region))].sort()){$('regionFilter').add(new Option(region,region))}const requested=new URL(location.href).searchParams.get('lugar');show(places.find(p=>p.id===requested)||places[0])}).catch(()=>{status('No se pudo cargar el catálogo. Recargá la página.');$('random').disabled=true;$('next').disabled=true;$('previous').disabled=true});
