const $=id=>document.getElementById(id);
let places=[],current=null;
function mapsUrl(p){const u=new URL('https://www.google.com/maps/@');u.search=new URLSearchParams({api:'1',map_action:'pano',viewpoint:p.lat+','+p.lng,...(p.panoId?{pano:p.panoId}:{})});return u.href}
function embedUrl(p){if(p.embedUrl){try{const u=new URL(p.embedUrl);if(u.protocol==='https:'&&u.hostname==='www.google.com'&&u.pathname.startsWith('/maps/embed'))return u.href}catch{}}const key=window.MARAVILLAS_CONFIG?.googleMapsEmbedKey;if(!key)return '';const u=new URL('https://www.google.com/maps/embed/v1/streetview');u.search=new URLSearchParams({key,location:p.lat+','+p.lng,...(p.panoId?{pano:p.panoId}:{})});return u.href}
function show(p){if(!p)return;current=p;
$('name').textContent=p.name;$('province').textContent=p.province;$('region').textContent=p.region;$('description').textContent=p.description;
$('counter').textContent=places.length+' lugares para descubrir';
for(const id of ['maps','heroMaps'])$(id).href=mapsUrl(p);
const embed=embedUrl(p);$('panorama').hidden=!embed;$('fallback').hidden=!!embed;
if(embed)$('panorama').src=embed;else $('panorama').removeAttribute('src');
$('panorama').title='Vista 360 de '+p.name;
const url=new URL(location.href);url.searchParams.set('lugar',p.id);window.history.replaceState(null,'',url);
}
function random(){const pool=places.filter(p=>p.id!==current?.id);show(pool.length?pool[Math.floor(Math.random()*pool.length)]:places[0])}
function status(message){$('status').textContent=message;$('status').hidden=false;clearTimeout(status.timer);status.timer=setTimeout(()=>$('status').hidden=true,4000)}
$('random').onclick=random;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.stage').requestFullscreen()}catch{status('Tu navegador no permite pantalla completa.')}};
fetch('places.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{places=data;const requested=new URL(location.href).searchParams.get('lugar');const selected=places.find(p=>p.id===requested);if(selected)show(selected);else random()}).catch(()=>{status('No se pudieron cargar los lugares. Recargá la página.');$('random').disabled=true});
