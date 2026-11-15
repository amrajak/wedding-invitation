'use strict';
/**
 * No invitation wording, theme colours, or image names need editing here.
 * See content-config.js, theme-config.js and image-config.js instead.
 */
const CONTENT = window.WEDDING_CONTENT || {};
const COLORS = window.WEDDING_COLORS || {};
const IMAGES = window.WEDDING_IMAGES || {};
const HOME = CONTENT.site || {};
const EVENTS = CONTENT.events || {};
const EVENTS_ORDER = ['mata', 'haldi', 'sangeet', 'wedding'];
const byId = id => document.getElementById(id);
const textAt = (id, value) => { const el = byId(id); if (el && value != null) el.textContent = value; };
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function weddingImageUrl(key) {
  const name = IMAGES[key];
  if (typeof name !== 'string' || !/^[^\\/]+\.(?:png|jpe?g|webp|svg|gif)$/i.test(name.trim())) return '';
  return 'assets/' + encodeURIComponent(name.trim());
}
function applyGlobalColours() {
  const c = COLORS.global || {};
  const css = {ink:'--ink', gold:'--gold',paper:'--cream',footer:'--footer-bg',footerText:'--footer-text'};
  for (const [key, prop] of Object.entries(css)) if (c[key] && /^#[0-9a-f]{3,8}$/i.test(c[key])) document.documentElement.style.setProperty(prop,c[key]);
}
function escapeICS(s) { return String(s || '').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g, m=>'\\'+m); }
function showDialog(el) { if (el) typeof el.showModal==='function' ? el.showModal() : el.setAttribute('open',''); }
function closeDialog(el) { if (el) typeof el.close==='function' ? el.close() : el.removeAttribute('open'); }
let toastTimer;
function toast(message) {const t = byId('toast');if(!t)return;t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),3100);}
function setTextFromConfig() {
  applyGlobalColours();
  textAt('headerBlessing', HOME.blessing);
  textAt('headingEyebrow', '✧ '+(HOME.eyebrow||'')+' ✧');
  textAt('brideName', HOME.bride);textAt('groomName',HOME.groom);
  textAt('introLead', HOME.introduction);textAt('introEm', HOME.introductionEmphasis);
  textAt('headingDates', HOME.dates);textAt('headingPlace', HOME.location);
  textAt('sectionEn',HOME.sectionTitle);textAt('sectionHi',HOME.sectionHindi);
  textAt('themeNote',HOME.themeNote);textAt('footerMessage',HOME.footerMessage);
  textAt('footerNames',(HOME.bride||'')+' ✦ '+(HOME.groom||''));
  textAt('brandInitials',(HOME.bride||'A')[0]+' & '+(HOME.groom||'V')[0]);
  textAt('topBollywood','🎬 '+(HOME.bollywoodTopLink||'Bollywood Night ↗'));
  textAt('topRsvp',(HOME.rsvpButton||'RSVP')+' ↗');
  textAt('footerRsvpText',HOME.rsvpButton);
  textAt('directionsText',HOME.directionsButton);textAt('calendarText',HOME.calendarButton);
  textAt('venueLabel',CONTENT.venue?.label);textAt('venueName',CONTENT.venue?.name);
  textAt('venueAddress',CONTENT.venue?.address);
  const map = byId('directionsLink');if(map && CONTENT.venue?.mapsUrl)map.href=CONTENT.venue.mapsUrl;
  textAt('rsvpIntro',CONTENT.rsvp?.intro);textAt('rsvpTitle',CONTENT.rsvp?.title);textAt('rsvpSubtitle',CONTENT.rsvp?.subtitle);
}
function colourStyles(theme) {
  const safe = value => typeof value==='string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : '#ffffff';
  return `--card-bg:${safe(theme.background)};--card-bg2:${safe(theme.background2)};--card-heading:${safe(theme.heading)};--card-ink:${safe(theme.text)};--card-accent:${safe(theme.accent)}`;
}
function renderCards() {
  const grid=byId('chapterGrid');if(!grid)return;
  grid.replaceChildren();
  EVENTS_ORDER.forEach((key,i)=>{
    const e=EVENTS[key],theme=COLORS[key]||{};if(!e)return;
    const image=weddingImageUrl(e.imageKey);
    const dots=(theme.palette||[]).map(color=>`<span style="background:${/^#[0-9a-f]{3,8}$/i.test(color)?color:'#ded1bd'}" title="${escapeHTML(color)}"></span>`).join('');
    const article=document.createElement('article');article.className=`event-card ${key}-card`;
    article.setAttribute('style',colourStyles(theme));
    article.innerHTML=`<button type="button" class="card-main" data-card="${key}" aria-label="Read ${escapeHTML(e.title)} theme and details">
       <div class="art-panel"><img src="${image}" alt="${escapeHTML(e.inspiration)} inspired wedding illustration" loading="${i<2?'eager':'lazy'}"><span class="art-corner">${['I','II','III','IV'][i]}</span></div>
       <div class="card-copy">
          <p class="card-kicker"><span>${escapeHTML(e.date)}</span><span>${['I','II','III','IV'][i]} / IV</span></p>
          <h3>${escapeHTML(e.title)}</h3>
          <p class="card-deity">${escapeHTML(e.inspiration)}</p>
          <p class="card-description">${escapeHTML(e.description)}</p>
          <div class="card-bottom"><span class="dress-line"><span class="swatch-mini" aria-hidden="true">${dots}</span><span>${escapeHTML(e.dress)}</span></span><span class="more-link">${escapeHTML(HOME.detailButton||'Details')} ↗</span></div>
       </div></button>
       ${e.showBollywoodLink?`<a class="bollywood-feature" href="bollywood.html" aria-label="Open the Bollywood Night dress code and outfit inspiration">${escapeHTML(HOME.bollywoodButton||'🎬 BOLLYWOOD NIGHT · SEE THE LOOKBOOK ↗')}</a>`:''}`;
    grid.append(article);
  });
  grid.querySelectorAll('[data-card]').forEach(button=>button.addEventListener('click',()=>openEvent(button.dataset.card)));
}
function openEvent(key) {
  const e=EVENTS[key],dialog=byId('detailDialog');if(!e||!dialog)return;
  textAt('detailTitle',e.title);textAt('detailWhen',e.when);
  textAt('detailInspiration',e.inspiration);textAt('detailDescription',e.details);textAt('detailDress',e.detailDress);
  const image=byId('detailImage'),second=byId('detailSecondaryImage'),art=byId('detailArt');
  image.src=weddingImageUrl(e.imageKey);image.alt=e.title+' illustration';
  if(e.secondaryImageKey && weddingImageUrl(e.secondaryImageKey)) {
    second.src=weddingImageUrl(e.secondaryImageKey);second.alt='Pheras and Vidai · Shiv–Parvati inspiration';second.hidden=false;art.classList.add('two-images');
  } else {second.hidden=true;second.removeAttribute('src');art.classList.remove('two-images');}
  const swatches=byId('detailSwatches');swatches.replaceChildren();
  (COLORS[key]?.palette||[]).forEach(c=>{const el=document.createElement('i');el.style.backgroundColor=c;el.title=c;swatches.append(el);});
  const link=byId('detailLink');if(link)link.hidden=!e.showBollywoodLink;
  showDialog(dialog);
}
function setupDialogs() {
  const detail=byId('detailDialog'),rsvp=byId('rsvpDialog');
  document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>closeDialog(detail)));
  document.querySelectorAll('[data-close-rsvp]').forEach(b=>b.addEventListener('click',()=>closeDialog(rsvp)));
  document.querySelectorAll('[data-open-rsvp]').forEach(b=>b.addEventListener('click',()=>showDialog(rsvp)));
  [detail,rsvp].filter(Boolean).forEach(el=>el.addEventListener('click',e=>{if(e.target===el)closeDialog(el);}));
}
function rsvpText(){
  const form=byId('rsvpForm');if(!form)return null;
  const name=form.elements.guestName.value.trim();if(!name){form.elements.guestName.reportValidity();return null;}
  const intro=CONTENT.rsvp?.messageGreeting||'Hello! My RSVP for the wedding:';
  const note=form.elements.guestNote.value.trim();
  return `${intro}\nName: ${name}\nGuests: ${form.elements.guestCount.value}\nResponse: ${form.elements.attendance.value}${note?'\nMessage: '+note:''}\nWith love!`;
}
function setupRSVP(){
  const form=byId('rsvpForm');if(!form)return;
  form.addEventListener('submit',e=>{e.preventDefault();const msg=rsvpText();if(!msg)return;window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');toast('WhatsApp draft opened. Choose a recipient and send.');});
  const btn=byId('copyRSVP');if(btn)btn.addEventListener('click',async()=>{
    const msg=rsvpText();if(!msg)return;
    try{await navigator.clipboard.writeText(msg);toast('RSVP text copied.');}catch{toast('Please use the WhatsApp option to share your RSVP.');}
  });
}
function setupCalendar(){
  const btn=byId('calendarBtn');if(!btn)return;
  btn.addEventListener('click',()=>{
    const eventLines=EVENTS_ORDER.map(key=>EVENTS[key]?.title).filter(Boolean).join(' · ');
    const content=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Wedding Invitation//EN\r\nBEGIN:VEVENT\r\nUID:akanksha-vikash-dec2026@example.invalid\r\nDTSTAMP:20261115T000000Z\r\nDTSTART;VALUE=DATE:20261210\r\nDTEND;VALUE=DATE:20261214\r\nSUMMARY:${escapeICS((HOME.bride||'')+' & '+(HOME.groom||'')+' — Wedding Celebrations')}\r\nDESCRIPTION:${escapeICS(eventLines+'. Exact timings to be confirmed.')}\r\nLOCATION:${escapeICS((CONTENT.venue?.name||'')+', '+(CONTENT.venue?.address||''))}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
    const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='Wedding-10-13-Dec-2026.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
    toast('Calendar file downloaded.');
  });
}
function setBollywoodText(){
  if(!document.body.classList.contains('bollywood-page'))return;
  const c=CONTENT.bollywood||{};
  const masthead=document.querySelector('.bollywood-page .masthead .blessing');if(masthead)masthead.textContent='रास से रील तक';
  const back=document.querySelector('.bollywood-page .masthead-actions a');if(back)back.textContent=c.backLabel||'← Back to invitation';
  const hero=document.querySelector('.spotlight-hero');if(hero){
    const over=hero.querySelector('.spotlight-overline'),title=hero.querySelector('h1'),sub=hero.querySelector('.spotlight-sub'),date=hero.querySelector('.spotlight-date');
    if(over)over.textContent=c.topLabel||'';
    if(title){title.replaceChildren(document.createTextNode((c.titleBefore||'Raas')+' '));const em=document.createElement('em');em.textContent=c.titleMiddle||'to';title.append(em,document.createTextNode(' '+(c.titleAfter||'Reel')));}
    if(sub)sub.textContent=c.subtitle||'';if(date)date.textContent=c.dateLine||'';
  }
  const intro=document.querySelector('.spotlight-copy');if(intro){
    const label=intro.querySelector('.spotlight-overline'),heading=intro.querySelector('h2'),story=intro.querySelector(':scope > p'),dress=intro.querySelector('.dress-callout');
    if(label)label.textContent=c.storyLabel||'';if(heading)heading.textContent=c.heading||'';if(story)story.textContent=c.story||'';
    if(dress){const h=dress.querySelector('strong'),p=dress.querySelector('p');if(h)h.textContent=c.dressLabel||'';if(p)p.textContent=c.dressText||'';}
  }
  const costume=document.querySelector('.costumes');if(costume){const h=costume.querySelector('h2'),p=costume.querySelector(':scope > p');if(h)h.textContent=c.costumesHeading||'';if(p)p.textContent=c.costumesIntro||'';}
  const pinterest=document.querySelector('.pinterest-feature');if(pinterest){
    const h=pinterest.querySelector('h2'),p=pinterest.querySelector(':scope > p:not(.spotlight-overline)'),link=byId('pinterestBoardLink');
    if(h)h.textContent=c.pinterestHeading||'';if(p)p.textContent=c.pinterestIntro||'';if(link)link.textContent=c.pinterestLink||'';
  }
  const footer=document.querySelector('.spotlight-footer');if(footer){const span=footer.querySelector('span'),a=footer.querySelector('a');if(span)span.textContent=c.footerNote||'';if(a)a.textContent=c.backLabel||'← Back to invitation';}
}
function setupCostumes(){
  const tabs=[...document.querySelectorAll('[data-costume-tab]')];if(!tabs.length)return;
  const choices=CONTENT.bollywood?.costumeCategories||{};
  function activate(key){const info=choices[key];if(!info)return;
    tabs.forEach(btn=>{const active=btn.dataset.costumeTab===key;btn.setAttribute('aria-selected',active?'true':'false');btn.tabIndex=active?0:-1;if(choices[btn.dataset.costumeTab]?.tab)btn.textContent=choices[btn.dataset.costumeTab].tab;});
    textAt('costumeName',info.name);textAt('costumeDesc',info.desc);
    const ideas=byId('costumeIdeas');if(ideas){ideas.replaceChildren();(info.ideas||[]).forEach(item=>{const li=document.createElement('li');li.textContent=item;ideas.append(li);});}
  }
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>activate(t.dataset.costumeTab));t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];next.focus();activate(next.dataset.costumeTab);}});});activate(tabs[0].dataset.costumeTab);
}
function setupPinterest(){
  const section=byId('pinterestStyleBoard');if(!section)return;
  const raw=window.WEDDING_PINTEREST_BOARD;
  if(typeof raw!=='string'||!raw.trim())return;
  let url;try{
    url=new URL(raw.trim());const parts=url.pathname.split('/').filter(Boolean);
    if(url.protocol!=='https:'||!/^(?:[a-z0-9-]+\.)?pinterest\.com$/i.test(url.hostname)||parts.length<2)return;
    url.hostname='www.pinterest.com';url.search='';url.hash='';
  }catch{return;}
  const href=url.href;section.hidden=false;
  ['pinterestBoardLink','pinterestBoardFallback','pinterestEmbedAnchor'].forEach(id=>{const a=byId(id);if(a)a.href=href;});
  const anchor=byId('pinterestEmbedAnchor');if(anchor){const width=section.getBoundingClientRect().width;anchor.setAttribute('data-pin-board-width',String(Math.min(850,Math.max(250,Math.round(width)-45))));}
  const gallery=byId('pinterestLocalGallery');const filenames=Array.isArray(window.WEDDING_BOLLYWOOD_LOOKBOOK)?window.WEDDING_BOLLYWOOD_LOOKBOOK:[];
  filenames.slice(0,12).forEach(file=>{if(typeof file!=='string'||!/^[^\\/]+\.(?:png|jpe?g|webp|svg)$/i.test(file))return;const img=document.createElement('img');img.src='assets/'+encodeURIComponent(file);img.alt='Bollywood outfit inspiration';img.loading='lazy';gallery.append(img);});
  if(gallery.childElementCount)gallery.hidden=false;
  const script=document.createElement('script');script.src='https://assets.pinterest.com/js/pinit.js';script.defer=true;script.async=true;script.dataset.weddingPinterest='true';document.body.append(script);
}
// Images on the Bollywood page use the same image-config.js as the invitation.
document.querySelectorAll('img[data-image]').forEach(img=>{const url=weddingImageUrl(img.dataset.image);if(url)img.src=url;});
setTextFromConfig();renderCards();setupDialogs();setupRSVP();setupCalendar();setBollywoodText();setupCostumes();setupPinterest();
