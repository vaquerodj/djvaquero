const EMAIL_ADMINISTRADOR = "ivanvaquerodj@gmail.com";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push, remove, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyB5TFM9ZN-X1dvLdIGJX9quK_2jhq_8gqI",
  authDomain: "djvaquero-851e8.firebaseapp.com",
  databaseURL: "https://djvaquero-851e8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "djvaquero-851e8",
  storageBucket: "djvaquero-851e8.firebasestorage.app",
  messagingSenderId: "943264468873",
  appId: "1:943264468873:web:30725455620a5f737bdb58"
});

const db = getDatabase(app), auth = getAuth(app), provider = new GoogleAuthProvider();
const $ = i => document.getElementById(i), $$ = q => document.querySelectorAll(q), on = (e, t, c, o) => e.addEventListener(t, c, o), tog = (e, c, b) => e ? e.classList.toggle(c, b) : null;

let cacheTour = {}, cacheSetup = {}, cacheMashups = {}, actTab = 'tour', selProvId = '', actCompId = '', compImgsAdmin = [];

window.switchView = function(t) {
  actTab = t;
  ['tour', 'setup', 'mashups'].forEach(o => {
    const view = $(`tab-${o}`), btn = $(`btn-nav-${o}`);
    if(view) {
      if(o === t) {
        view.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        view.classList.add('opacity-100', 'scale-100', 'z-20');
      } else {
        view.classList.remove('opacity-100', 'scale-100', 'z-20');
        view.classList.add('opacity-0', 'scale-95', 'pointer-events-none', 'z-10');
      }
    }
    if(btn) tog(btn, 'nav-active', o === t);
  });
};

['tour', 'setup', 'mashups'].forEach(t => {
  if($(`btn-nav-${t}`)) $(`btn-nav-${t}`).onclick = () => window.switchView(t);
});

onValue(ref(db, 'tour'), s => { cacheTour = s.val() || {}; renderMapAndEvents(); updateAdminTourSelect(); });
onValue(ref(db, 'setup'), s => { cacheSetup = s.val() || {}; renderSetupIllustrations(); updateAdminSetupSelect(); });
onValue(ref(db, 'mashups'), s => { cacheMashups = s.val() || {}; renderMashupsList(); updateAdminMashupsSelect(); });

const PROVINCIAS_ESP = {
  "ES-AV":"Ávila","ES-BU":"Burgos","ES-LE":"León","ES-P":"Palencia","ES-SA":"Salamanca",
  "ES-SG":"Segovia","ES-SO":"Soria","ES-VA":"Valladolid","ES-ZA":"Zamora","ES-M":"Madrid"
};

function renderMapAndEvents() {
  const svg = $('mapa-svg');
  if(!svg) return;
  
  let html = '';
  const paths = {
    "ES-LE": "M70,40 L160,30 L180,90 L140,140 L50,110 Z",
    "ES-P": "M160,30 L220,35 L230,110 L180,90 Z",
    "ES-BU": "M220,35 L310,50 L290,160 L220,120 Z",
    "ES-ZA": "M40,115 L140,140 L120,220 L30,190 Z",
    "ES-VA": "M140,140 L180,90 L230,110 L250,150 L210,210 L120,220 Z",
    "ES-SA": "M30,195 L120,220 L130,310 L50,300 Z",
    "ES-AV": "M120,220 L210,210 L230,270 L170,320 L130,310 Z",
    "ES-SG": "M210,210 L250,150 L290,170 L270,240 L230,270 Z",
    "ES-SO": "M290,160 L360,140 L370,220 L270,240 Z",
    "ES-M": "M230,270 L270,240 L280,290 L210,310 Z"
  };

  for(let id in paths) {
    const hasEvents = cacheTour[id] && Object.keys(cacheTour[id]).length > 0;
    const cls = hasEvents ? 'muni-unlocked' : 'muni-base';
    const sel = id === selProvId ? ' muni-selected' : '';
    html += `<path d="${paths[id]}" id="poly-${id}" class="${cls}${sel}" data-id="${id}"><title>${PROVINCIAS_ESP[id] || id}</title></path>`;
  }
  svg.innerHTML = html;

  $$('#mapa-svg path').forEach(p => {
    p.onclick = () => {
      selProvId = p.getAttribute('data-id');
      renderMapAndEvents();
      showEventsForProvince(selProvId);
    };
  });
}

function showEventsForProvince(id) {
  const title = $('provincia-title'), list = $('lista-eventos');
  if(!title || !list) return;
  title.innerText = PROVINCIAS_ESP[id] || 'Detalles';
  
  const events = cacheTour[id];
  if(!events || Object.keys(events).length === 0) {
    list.innerHTML = `<div class="text-center py-8 text-gray-500 italic">No hay actuaciones programadas en esta provincia próximamente.</div>`;
    return;
  }

  let html = '';
  Object.keys(events).forEach(k => {
    const ev = events[k];
    html += `
      <div class="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
        <div>
          <h4 class="font-bold text-white text-xs md:text-sm">${ev.lugar}</h4>
          <span class="text-[10px] text-djCyan font-semibold"><i class="fa-regular fa-calendar mr-1"></i>${ev.fecha}</span>
        </div>
        ${ev.ticket ? `<a href="${ev.ticket}" target="_blank" class="bg-djCyan hover:scale-105 active:scale-95 text-black font-black text-[9px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all">Tickets</a>` : ''}
      </div>`;
  });
  list.innerHTML = html;
}

const COMPONENTES_SETUP = {
  "deck-l": "Reproductor Izquierdo",
  "mixer": "Mesa de Mezclas Central",
  "deck-r": "Reproductor Derecho",
  "headphones": "Auriculares DJ"
};

function renderSetupIllustrations() {
  const svg = $('setup-svg');
  if(!svg) return;

  svg.innerHTML = `
    <rect x="50" y="100" width="700" height="320" rx="15" fill="#090b11" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
    <polygon points="70,120 260,120 260,390 70,390" id="hot-deck-l" class="comp-polygon ${actCompId==='deck-l'?'hotspot-active':''}"/>
    <polygon points="280,120 520,120 520,390 280,390" id="hot-mixer" class="comp-polygon ${actCompId==='mixer'?'hotspot-active':''}"/>
    <polygon points="540,120 730,120 730,390 540,390" id="hot-deck-r" class="comp-polygon ${actCompId==='deck-r'?'hotspot-active':''}"/>
    <rect x="95" y="140" width="140" height="230" rx="8" fill="none" stroke="#fff" stroke-width="1" opacity="0.1" pointer-events="none"/>
    <circle cx="165" cy="290" r="45" fill="none" stroke="#ff00ea" stroke-width="2" opacity="0.4" pointer-events="none"/>
    <rect x="310" y="140" width="180" height="230" rx="8" fill="none" stroke="#fff" stroke-width="1" opacity="0.1" pointer-events="none"/>
    <line x1="340" y1="180" x2="340" y2="320" stroke="#00e5ff" stroke-width="3" opacity="0.3" pointer-events="none"/>
    <line x1="400" y1="180" x2="400" y2="320" stroke="#00e5ff" stroke-width="3" opacity="0.3" pointer-events="none"/>
    <line x1="460" y1="180" x2="460" y2="320" stroke="#00e5ff" stroke-width="3" opacity="0.3" pointer-events="none"/>
    <rect x="565" y="140" width="140" height="230" rx="8" fill="none" stroke="#fff" stroke-width="1" opacity="0.1" pointer-events="none"/>
    <circle cx="635" cy="290" r="45" fill="none" stroke="#ff00ea" stroke-width="2" opacity="0.4" pointer-events="none"/>
  `;

  const mapping = {"hot-deck-l":"deck-l","hot-mixer":"mixer","hot-deck-r":"deck-r"};
  for(let hId in mapping) {
    if($(hId)) $(hId).onclick = () => { actCompId = mapping[hId]; renderSetupIllustrations(); showSetupDetails(actCompId); };
  }
}

function showSetupDetails(id) {
  const box = $('setup-details');
  if(!box) return;
  const data = cacheSetup[id] || { nombre: COMPONENTES_SETUP[id], desc: "Sin especificaciones técnicas añadidas por el momento." };
  
  let imgsHtml = '';
  if(data.imagenes && data.imagenes.length > 0) {
    imgsHtml = `<div class="flex gap-2 overflow-x-auto custom-scrollbar py-1">`;
    data.imagenes.forEach(i => { imgsHtml += `<img src="${i}" class="w-24 h-16 object-cover rounded-lg border border-white/10 shrink-0">`; });
    imgsHtml += `</div>`;
  }

  box.innerHTML = `
    <div class="text-left space-y-2">
      <span class="text-[10px] uppercase font-bold text-djMagenta tracking-widest block"><i class="fa-solid fa-microchip mr-1"></i> Hardware Especificación</span>
      <h3 class="font-display font-black text-white text-base md:text-lg uppercase">${data.nombre}</h3>
      <p class="text-xs text-gray-300 leading-relaxed">${data.desc}</p>
      ${imgsHtml}
    </div>
  `;
}

function renderMashupsList() {
  const container = $('lista-mashups');
  if(!container) return;

  if(Object.keys(cacheMashups).length === 0) {
    container.innerHTML = `<p class="italic text-gray-500 text-center py-12 text-sm">Próximamente se subirán nuevos Mashups & Edits exclusivos.</p>`;
    return;
  }

  let html = '';
  Object.keys(cacheMashups).forEach(k => {
    const item = cacheMashups[k];
    let scEmbedHtml = '';
    
    if(item.soundcloud) {
      if(item.soundcloud.trim().startsWith('<iframe')) {
        let cleanIframe = item.soundcloud.replace(/height="[^"]*"/, 'height="166"').replace(/width="[^"]*"/, 'width="100%"');
        scEmbedHtml = `<div class="w-full mt-3 rounded-xl overflow-hidden h-[166px] bg-black/40 border border-white/5 shadow-inner">${cleanIframe}</div>`;
      } else {
        scEmbedHtml = `<div class="w-full mt-3 rounded-xl overflow-hidden h-[166px] bg-black/40 border border-white/5 shadow-inner"><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(item.soundcloud.trim())}&color=%23ffd600&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"></iframe></div>`;
      }
    }

    html += `
      <div class="glass-card bg-black/30 p-4 flex flex-col gap-1 hover:border-djYellow/30 transition-all duration-300 w-full">
        <div class="flex justify-between items-center gap-4 w-full">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-djYellow/10 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-music text-djYellow text-base"></i>
            </div>
            <div class="min-w-0">
              <h4 class="font-display font-bold text-white text-xs md:text-sm truncate pr-2">${item.titulo}</h4>
              <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">VAQUERO EDIT</p>
            </div>
          </div>
          <div class="shrink-0">
            ${item.descarga ? `<a href="${item.descarga}" target="_blank" class="bg-djYellow hover:scale-105 active:scale-95 text-black font-black text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(255,214,0,0.2)] inline-flex items-center gap-1"><i class="fa-solid fa-cloud-arrow-down"></i>Descargar</a>` : ''}
          </div>
        </div>
        ${scEmbedHtml}
      </div>`;
  });
  container.innerHTML = html;
}

let clickCount = 0, clickTimeout;
if($('site-title')) $('site-title').onclick = () => {
  clickCount++;
  clearTimeout(clickTimeout);
  clickTimeout = setTimeout(() => {
    if(clickCount >= 5) {
      onAuthStateChanged(auth, u => {
        if(u && u.email === EMAIL_ADMINISTRADOR) { tog($('admin-panel'), 'hidden', false); }
        else { signInWithPopup(auth, provider).then(r => { if(r.user.email !== EMAIL_ADMINISTRADOR) { alert("Acceso Denegado."); signOut(auth); } }).catch(e => console.error(e)); }
      });
    }
    clickCount = 0;
  }, 400);
};

if($('btn-close-admin')) $('btn-close-admin').onclick = () => { tog($('admin-panel'), 'hidden', true); };

function handleAdminTab(tab) {
  ['tour', 'setup', 'mashups'].forEach(t => {
    tog($(`sec-a-${t}`), 'hidden', t !== tab);
    tog($(`tab-adm-${t}`), 'bg-white/5', t === tab);
    tog($(`tab-adm-${t}`), 'text-white', t === tab);
  });
}
['tour', 'setup', 'mashups'].forEach(t => { if($(`tab-adm-${t}`)) $(`tab-adm-${t}`).onclick = () => handleAdminTab(t); });

function updateAdminTourSelect() {
  const sel = $('a-tour-prov'); if(!sel) return;
  let h = ''; for(let id in PROVINCIAS_ESP) { h += `<option value="${id}">${PROVINCIAS_ESP[id]}</option>`; }
  sel.innerHTML = h;
}
if($('btn-sv-tr')) $('btn-sv-tr').onclick = () => {
  const p = $('a-tour-prov').value, l = $('a-tour-l').value, f = $('a-tour-f').value, t = $('a-tour-t').value;
  if(!l || !f) return alert("Rellena los campos obligatorios.");
  push(ref(db, `tour/${p}`), { lugar: l, fecha: f, ticket: t }).then(() => { $('a-tour-l').value=''; $('a-tour-t').value=''; alert("Evento guardado!"); });
};

function updateAdminSetupSelect() {
  const sel = $('a-set-comp'); if(!sel) return;
  let h = ''; for(let id in COMPONENTES_SETUP) { h += `<option value="${id}">${COMPONENTES_SETUP[id]}</option>`; }
  sel.innerHTML = h;
}
if($('a-set-comp')) $('a-set-comp').onchange = (e) => {
  const id = e.target.value; const comp = cacheSetup[id] || { nombre:'', desc:'', imagenes:[] };
  $('a-set-n').value = comp.nombre || COMPONENTES_SETUP[id];
  $('a-set-d').value = comp.desc || '';
  compImgsAdmin = comp.imagenes || [];
  renderAdminImgsList();
};
function renderAdminImgsList() {
  const c = $('a-set-imgs-list'); if(!c) return;
  let h = ''; compImgsAdmin.forEach((img, i) => { h += `<div class="flex justify-between text-[10px] bg-white/5 p-1 rounded"><span>Img ${i+1}</span><button class="text-red-500" onclick="window.delAdminImg(${i})">Eliminar</button></div>`; });
  c.innerHTML = h;
}
window.delAdminImg = (i) => { compImgsAdmin.splice(i,1); renderAdminImgsList(); };
if($('btn-add-img')) $('btn-add-img').onclick = () => { const u = $('a-set-newimg').value; if(u) { compImgsAdmin.push(u); $('a-set-newimg').value=''; renderAdminImgsList(); } };
if($('btn-sv-cp')) $('btn-sv-cp').onclick = () => {
  const id = $('a-set-comp').value;
  set(ref(db, `setup/${id}`), { nombre: $('a-set-n').value, desc: $('a-set-d').value, imagenes: compImgsAdmin }).then(() => alert("Componente de Equipo actualizado!"));
};

function updateAdminMashupsSelect() {
  const sel = $('a-mash-sel'); if(!sel) return;
  let h = '<option value="NEW">✨ NUEVO TRACK</option>';
  Object.keys(cacheMashups).forEach(k => { h += `<option value="${k}">${cacheMashups[k].titulo}</option>`; });
  sel.innerHTML = h;
}
if($('a-mash-sel')) $('a-mash-sel').onchange = (e) => {
  const k = e.target.value;
  if(k === 'NEW') { $('a-mash-t').value=''; $('a-mash-dl').value=''; $('a-mash-sc').value=''; tog($('btn-dl-ms'), 'hidden', true); }
  else { const m = cacheMashups[k]; $('a-mash-t').value = m.titulo||''; $('a-mash-dl').value = m.descarga||''; $('a-mash-sc').value = m.soundcloud||''; tog($('btn-dl-ms'), 'hidden', false); }
};
if($('btn-sv-ms')) $('btn-sv-ms').onclick = () => {
  const k = $('a-mash-sel').value, t = $('a-mash-t').value, dl = $('a-mash-dl').value, sc = $('a-mash-sc').value;
  if(!t) return alert("Escribe un título.");
  const data = { titulo: t, descarga: dl, soundcloud: sc };
  if(k === 'NEW') { push(ref(db, 'mashups'), data).then(() => { alert("¡Track subido!"); $('a-mash-t').value=''; $('a-mash-dl').value=''; $('a-mash-sc').value=''; }); }
  else { update(ref(db, `mashups/${k}`), data).then(() => alert("Track actualizado con éxito.")); }
};
if($('btn-dl-ms')) $('btn-dl-ms').onclick = () => {
  const k = $('a-mash-sel').value; if(k !== 'NEW' && confirm("¿Borrar este track permanentemente?")) { remove(ref(db, `mashups/${k}`)).then(() => { alert("Track eliminado."); $('a-mash-sel').value='NEW'; $('a-mash-t').value=''; $('a-mash-dl').value=''; $('a-mash-sc').value=''; tog($('btn-dl-ms'), 'hidden', true); }); }
};

let drA = false, dX, dY;
if($('admin-header')) on($('admin-header'), 'mousedown', e => {
  if(e.target.closest('button')) return; drA = true;
  const p = $('admin-panel'), r = p.getBoundingClientRect();
  p.style.transform = 'none'; p.style.left = r.left + 'px'; p.style.top = r.top + 'px';
  dX = e.clientX - r.left; dY = e.clientY - r.top;
});
on(window, 'mousemove', e => { if(drA && $('admin-panel')) { $('admin-panel').style.left = `${e.clientX - dX}px`; $('admin-panel').style.top = `${e.clientY - dY}px`; } });
on(window, 'mouseup', () => drA = false);

window.switchView('tour');
