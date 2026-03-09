/* ── Supabase config ── */
var SUPA_URL = 'https://upwwluofaanmfugxnywi.supabase.co';
var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwd3dsdW9mYWFubWZ1Z3hueXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjk1NzgsImV4cCI6MjA4ODYwNTU3OH0.-6L_KHLaJRRvpmh1gMy2VuUgEXSDsoMdBojFnVg7750';

var allProjects      = [];
var filteredProjects = [];
var currentTag       = 'all';
var lbIndex          = 0;

function tagColor(t){
  var map={tcm:'t1',ai:'t2',crm:'t3',site:'t4',finance:'t5',legal:'t5',mobile:'t2',saas:'t1',business:'t3',presentation:'t4'};
  return map[t]||'t4';
}

function renderCard(p,idx){
  var tags   = (p.tags||[]).map(function(t){return '<span class="ptag '+tagColor(t)+'">'+t+'</span>';}).join('');
  var stacks = (p.tech_stack||[]).map(function(t){return '<span class="stack-chip">'+t+'</span>';}).join('');
  var detailHTML = '';
  if(p.detail_blocks){
    var blocks = typeof p.detail_blocks==='string'?JSON.parse(p.detail_blocks):p.detail_blocks;
    detailHTML = (blocks||[]).map(function(b){
      return '<div class="detail-block"><div class="detail-label">'+b.label+'</div><div class="detail-text">'+b.text+'</div></div>';
    }).join('');
  }
  var ghLink = p.github_url?'<a href="'+p.github_url+'" target="_blank" class="plink gh" rel="noopener">GitHub</a>':'';
  var numStr = String(p.number||idx+1).padStart(2,'0');
  var eyeBtn = p.screenshot_url?'<div class="eye-wrap"><button class="eye-btn" onclick="openLightbox('+idx+')">&#128065; צילום</button></div>':'';
  return '<div class="pcard" id="pcard-'+p.id+'" data-tags="'+(p.tags||[]).join(' ')+'">'
    +'<div class="pcard-header" onclick="openLightbox('+idx+')">'
    +'<div class="pcard-num">'+numStr+'</div>'
    +'<div class="pcard-main">'
    +'<div class="pcard-title">'+p.name+'</div>'
    +'<div class="pcard-desc">'+(p.short_desc||'')+'</div>'
    +'<div class="pcard-tags">'+tags+'</div>'
    +'</div>'
    +'<div class="pcard-right" onclick="event.stopPropagation()">'
    +eyeBtn
    +'<button class="expand-btn" onclick="event.stopPropagation();toggleCard('+p.id+')">+ פרטים</button>'
    +'</div></div>'
    +'<div class="pcard-detail" id="detail-'+p.id+'">'
    +(detailHTML?'<div class="detail-blocks">'+detailHTML+'</div>':'')
    +(stacks?'<div class="pcard-stack">'+stacks+'</div>':'')
    +'<div class="pcard-links">'+ghLink+'</div>'
    +'</div></div>';
}

function renderAll(projects){
  var list=document.getElementById('projectsList');
  if(!projects||projects.length===0){
    list.innerHTML='<div class="error-banner">לא נמצאו פרויקטים</div>';
    return;
  }
  list.innerHTML=projects.map(function(p,i){return renderCard(p,i);}).join('');
  updateCount(projects.length);
  buildLbDots(projects.length);
}

function updateCount(n){
  var el=document.getElementById('visibleCount');
  if(el) el.textContent=n+' / '+allProjects.length+' פרויקטים';
}

var GROUP_LABELS={tcm:'רפואה סינית',ai:'בינה מלאכותית',crm:'ניהול / עסקים',site:'אתרים',legal:'משפטי / פיננס',finance:'פיננס',mobile:'מובייל',business:'כלים עסקיים',saas:'SaaS',presentation:'מצגות'};

function buildJumpMenu(projects){
  var menu=document.getElementById('jumpMenu');
  if(!menu) return;
  var seen={},html='';
  projects.forEach(function(p){
    var tag=(p.tags||['other'])[0];
    if(!seen[tag]){seen[tag]=true;html+='<div class="jump-group-label">'+(GROUP_LABELS[tag]||tag)+'</div>';}
    html+='<div class="jump-item" onclick="scrollToCard('+p.id+');closeJump()">'+String(p.number||'').padStart(2,'0')+' &mdash; '+p.name+'</div>';
  });
  menu.innerHTML=html;
}

function scrollToCard(id){var el=document.getElementById('pcard-'+id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}
function closeJump(){var m=document.getElementById('jumpMenu');if(m)m.style.display='none';}

document.addEventListener('click',function(e){
  var btn=document.getElementById('jumpBtn'),menu=document.getElementById('jumpMenu');
  if(!menu)return;
  if(btn&&btn.contains(e.target)){menu.style.display=menu.style.display==='block'?'none':'block';}
  else if(!menu.contains(e.target)){menu.style.display='none';}
});

document.addEventListener('click',function(e){
  if(!e.target.classList.contains('chip'))return;
  document.querySelectorAll('.chip').forEach(function(c){c.classList.remove('active');});
  e.target.classList.add('active');
  currentTag=e.target.dataset.tag||'all';
  filteredProjects=currentTag==='all'?allProjects.slice():allProjects.filter(function(p){return(p.tags||[]).indexOf(currentTag)>-1;});
  renderAll(filteredProjects);
});

function toggleCard(id){
  var det=document.getElementById('detail-'+id),btn=document.querySelector('#pcard-'+id+' .expand-btn');
  if(!det)return;
  if(det.style.display==='block'){det.style.display='none';if(btn)btn.textContent='+ פרטים';}
  else{det.style.display='block';if(btn)btn.textContent='- סגור';}
}

var lightbox=document.getElementById('lightbox');
var lbImg=document.getElementById('lbImg');
var lbTitle=document.getElementById('lbTitle');
var lbPrev=document.getElementById('lbPrev');
var lbNext=document.getElementById('lbNext');
var lbCounter=document.getElementById('lbCounter');
var lbDots=document.getElementById('lbDots');

function buildLbDots(n){
  if(!lbDots)return;
  var html='';
  for(var i=0;i<n;i++)html+='<span class="lb-dot" data-i="'+i+'"></span>';
  lbDots.innerHTML=html;
  lbDots.querySelectorAll('.lb-dot').forEach(function(d){
    d.addEventListener('click',function(){lbIndex=parseInt(d.dataset.i);showLbProject(filteredProjects.length?filteredProjects:allProjects);});
  });
}

function showLbProject(projects){
  var p=projects[lbIndex];
  if(!p)return;
  if(lbTitle)lbTitle.textContent=p.name||'';
  if(lbCounter)lbCounter.textContent=(lbIndex+1)+' / '+projects.length;
  if(lbPrev)lbPrev.disabled=lbIndex===0;
  if(lbNext)lbNext.disabled=lbIndex===projects.length-1;
  if(lbDots)lbDots.querySelectorAll('.lb-dot').forEach(function(d,i){d.classList.toggle('active',i===lbIndex);});
  if(lbImg&&p.screenshot_url){lbImg.style.opacity='0.3';lbImg.src=p.screenshot_url;lbImg.onload=function(){lbImg.style.opacity='1';};lbImg.onerror=function(){lbImg.style.opacity='0.3';};}
}

function openLightbox(idx){
  var projects=filteredProjects.length?filteredProjects:allProjects;
  lbIndex=idx||0;
  if(lightbox)lightbox.classList.add('open');
  showLbProject(projects);
}

function closeLightbox(){if(lightbox)lightbox.classList.remove('open');}

if(document.getElementById('lbClose'))document.getElementById('lbClose').addEventListener('click',closeLightbox);
if(lightbox)lightbox.addEventListener('click',function(e){if(e.target===lightbox)closeLightbox();});
if(lbPrev)lbPrev.addEventListener('click',function(){var p=filteredProjects.length?filteredProjects:allProjects;if(lbIndex>0){lbIndex--;showLbProject(p);}});
if(lbNext)lbNext.addEventListener('click',function(){var p=filteredProjects.length?filteredProjects:allProjects;if(lbIndex<p.length-1){lbIndex++;showLbProject(p);}});
document.addEventListener('keydown',function(e){
  if(!lightbox||!lightbox.classList.contains('open'))return;
  var p=filteredProjects.length?filteredProjects:allProjects;
  if(e.key==='Escape')closeLightbox();
  if(e.key==='ArrowLeft'&&lbIndex>0){lbIndex--;showLbProject(p);}
  if(e.key==='ArrowRight'&&lbIndex<p.length-1){lbIndex++;showLbProject(p);}
});

/* ══ INIT - Supabase only ══ */
(function(){
  var loader=document.getElementById('loader');
  function hide(){if(!loader)return;loader.style.opacity='0';setTimeout(function(){loader.style.display='none';},400);}
  function err(msg){hide();var list=document.getElementById('projectsList');if(list)list.innerHTML='<div class="error-banner">'+msg+'</div>';}

  fetch(SUPA_URL+'/rest/v1/projects?select=*&order=sort_order.asc&visible=eq.true',
    {headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY,'Content-Type':'application/json'}})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
  .then(function(data){
    if(!Array.isArray(data)||data.length===0){err('הטבלה projects ריקה — הכנס נתונים ב-Supabase');return;}
    allProjects=data;filteredProjects=data.slice();
    renderAll(filteredProjects);buildJumpMenu(filteredProjects);hide();
  })
  .catch(function(e){err('שגיאת Supabase: '+e.message);});
}());
