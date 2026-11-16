'use strict';
/**
 * No invitation wording, theme colours, or image names need editing here.
 * See content-config.js, theme-config.js and image-config.js instead.
 */
let CONTENT = window.WEDDING_CONTENT || {};
let CURRENT_LANG = 'en';
let CURRENT_DETAIL_KEY = null;
const UI = () => CONTENT.ui || {};
const COLORS = window.WEDDING_COLORS || {};
const IMAGES = window.WEDDING_IMAGES || {};
let HOME = CONTENT.site || {};
let EVENTS = CONTENT.events || {};
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
    article.innerHTML=`<button type="button" class="card-main" data-card="${key}" aria-label="${escapeHTML(e.title)} ${escapeHTML(UI().cardAria||'theme and details')}">
       <div class="art-panel"><img src="${image}" alt="${escapeHTML(e.inspiration)} ${escapeHTML(UI().imageAlt||'wedding illustration')}" loading="${i<2?'eager':'lazy'}"><span class="art-corner">${['I','II','III','IV'][i]}</span></div>
       <div class="card-copy">
          <p class="card-kicker"><span>${escapeHTML(e.date)}</span><span>${['I','II','III','IV'][i]} / IV</span></p>
          <h3>${escapeHTML(e.title)}</h3>
          <p class="card-deity">${escapeHTML(e.inspiration)}</p>
          <p class="card-description">${escapeHTML(e.description)}</p>
          <div class="card-bottom"><span class="dress-line"><span class="swatch-mini" aria-hidden="true">${dots}</span><span>${escapeHTML(e.dress)}</span></span><span class="more-link">${escapeHTML(HOME.detailButton||'Details')} ↗</span></div>
       </div></button>
       ${e.showBollywoodLink?`<a class="bollywood-feature" href="bollywood.html" aria-label="${escapeHTML(HOME.bollywoodButton||'Bollywood Night lookbook')}">${escapeHTML(HOME.bollywoodButton||'🎬 BOLLYWOOD NIGHT · SEE THE LOOKBOOK ↗')}</a>`:''}`;
    grid.append(article);
  });
  grid.querySelectorAll('[data-card]').forEach(button=>button.addEventListener('click',()=>openEvent(button.dataset.card)));
}
function openEvent(key) {
  const e=EVENTS[key],dialog=byId('detailDialog');if(!e||!dialog)return;
  CURRENT_DETAIL_KEY=key;
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
  const ui=UI();
  const note=form.elements.guestNote.value.trim();
  return `${intro}\n${ui.rsvpName||'Name'}: ${name}\n${ui.rsvpGuests||'Guests'}: ${form.elements.guestCount.value}\n${ui.rsvpResponse||'Response'}: ${form.elements.attendance.value}${note?'\n'+(ui.rsvpMessage||'Message')+': '+note:''}\n${ui.rsvpClosing||'With love!'}`;
}
function setupRSVP(){
  const form=byId('rsvpForm');if(!form)return;
  form.addEventListener('submit',e=>{e.preventDefault();const msg=rsvpText();if(!msg)return;window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');toast(UI().whatsappToast||'WhatsApp draft opened. Choose a recipient and send.');});
  const btn=byId('copyRSVP');if(btn)btn.addEventListener('click',async()=>{
    const msg=rsvpText();if(!msg)return;
    try{await navigator.clipboard.writeText(msg);toast(UI().copiedToast||'RSVP text copied.');}catch{toast(UI().copyFailedToast||'Please use the WhatsApp option to share your RSVP.');}
  });
}
function setupCalendar(){
  const btn=byId('calendarBtn');if(!btn)return;
  btn.addEventListener('click',()=>{
    const eventLines=EVENTS_ORDER.map(key=>EVENTS[key]?.title).filter(Boolean).join(' · ');
    const content=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Wedding Invitation//EN\r\nBEGIN:VEVENT\r\nUID:akanksha-vikash-dec2026@example.invalid\r\nDTSTAMP:20261115T000000Z\r\nDTSTART;VALUE=DATE:20261210\r\nDTEND;VALUE=DATE:20261214\r\nSUMMARY:${escapeICS((HOME.bride||'')+' & '+(HOME.groom||'')+' — '+(UI().calendarSummary||'Wedding Celebrations'))}\r\nDESCRIPTION:${escapeICS(eventLines+'. '+(UI().calendarTimings||'Exact timings to be confirmed.'))}\r\nLOCATION:${escapeICS((CONTENT.venue?.name||'')+', '+(CONTENT.venue?.address||''))}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
    const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='Wedding-10-13-Dec-2026.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
    toast(UI().calendarToast||'Calendar file downloaded.');
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
    const label=intro.querySelector('.spotlight-overline'),heading=intro.querySelector('h2'),story=intro.querySelector(':scope > p:not(.spotlight-overline)'),dress=intro.querySelector('.dress-callout');
    if(label)label.textContent=c.storyLabel||'';if(heading)heading.textContent=c.heading||'';if(story)story.textContent=c.story||'';
    if(dress){const h=dress.querySelector('strong'),p=dress.querySelector('p');if(h)h.textContent=c.dressLabel||'';if(p)p.textContent=c.dressText||'';}
  }
  const costume=document.querySelector('.costumes');if(costume){const h=costume.querySelector('h2'),p=costume.querySelector(':scope > p');if(h)h.textContent=c.costumesHeading||'';if(p)p.textContent=c.costumesIntro||'';}
  const pinterest=document.querySelector('.pinterest-feature');if(pinterest){
    const h=pinterest.querySelector('h2'),p=pinterest.querySelector(':scope > p:not(.spotlight-overline)'),link=byId('pinterestBoardLink');
    if(h)h.textContent=c.pinterestHeading||'';if(p)p.textContent=c.pinterestIntro||'';if(link)link.textContent=c.pinterestLink||'';
  }
  const costumeCTA=intro?.querySelector('.spotlight-cta');
  if(costumeCTA)costumeCTA.textContent=UI().findCharacter||'Find your character ↘';
  const overline=pinterest?.querySelector('.spotlight-overline');
  if(overline)overline.textContent=UI().pinterestOverline||'THE BOLLYWOOD LOOKBOOK';
  const pinterestFallback=pinterest?.querySelector('.pinterest-fallback');
  if(pinterestFallback){pinterestFallback.firstChild.textContent=(UI().pinterestFallback||'Pinterest may block previews in some browsers.')+' ';
   const a=pinterestFallback.querySelector('a');if(a)a.textContent=UI().pinterestFallbackLink||'open the full board';}
  const gallery=byId('pinterestLocalGallery');if(gallery)gallery.setAttribute('aria-label',UI().pinterestGalleryLabel||'Outfit inspiration');
  const footer=document.querySelector('.spotlight-footer');if(footer){const span=footer.querySelector('span'),a=footer.querySelector('a');if(span)span.textContent=c.footerNote||'';if(a)a.textContent=UI().backToCelebrations||c.backLabel||'← Back to invitation';}
}
let CURRENT_COSTUME_KEY='retro';
function renderCostumes(){
  const tabs=[...document.querySelectorAll('[data-costume-tab]')];
  if(!tabs.length)return;
  const choices=CONTENT.bollywood?.costumeCategories||{};
  const info=choices[CURRENT_COSTUME_KEY]||choices.retro;
  if(!info)return;
  tabs.forEach(btn=>{
    const active=btn.dataset.costumeTab===CURRENT_COSTUME_KEY;
    btn.setAttribute('aria-selected', active?'true':'false');
    btn.tabIndex=active?0:-1;
    btn.textContent=choices[btn.dataset.costumeTab]?.tab||btn.dataset.costumeTab;
  });
  textAt('costumeName',info.name);textAt('costumeDesc',info.desc);
  const ideas=byId('costumeIdeas');
  if(ideas){ideas.replaceChildren();(info.ideas||[]).forEach(item=>{
    const li=document.createElement('li');li.textContent=item;ideas.append(li);
  });}
}
function setupCostumes(){
  const tabs=[...document.querySelectorAll('[data-costume-tab]')];
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>{CURRENT_COSTUME_KEY=tab.dataset.costumeTab;renderCostumes();});
    tab.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();
        const next=tabs[(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];
        next.focus();CURRENT_COSTUME_KEY=next.dataset.costumeTab;renderCostumes();
      }
    });
  });
  renderCostumes();
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
  filenames.slice(0,12).forEach(file=>{if(typeof file!=='string'||!/^[^\\/]+\.(?:png|jpe?g|webp|svg)$/i.test(file))return;const img=document.createElement('img');img.src='assets/'+encodeURIComponent(file);img.alt=UI().pinterestGalleryLabel||'Bollywood outfit inspiration';img.loading='lazy';gallery.append(img);});
  if(gallery.childElementCount)gallery.hidden=false;
  const script=document.createElement('script');script.src='https://assets.pinterest.com/js/pinit.js';script.defer=true;script.async=true;script.dataset.weddingPinterest='true';document.body.append(script);
}

/* Bilingual presentation. English text: content-config.js; Hindi: hindi-config.js. */
function setTextFor(selector, value){
  const el=document.querySelector(selector);
  if(el&&value!==undefined)el.textContent=value;
}
function labelFor(id,value){
  const el=document.querySelector(`label[for="${id}"]`);
  if(el&&value!==undefined)el.textContent=value;
}
function applySharedTranslations(){
  const ui=UI();
  const skip=document.querySelector('.skip-link');if(skip)skip.textContent=ui.skip||'Skip to functions';
  const nav=document.querySelector('nav.masthead-actions');if(nav)nav.setAttribute('aria-label',ui.quickNavigation||'Quick navigation');
  const grid=byId('chapterGrid');if(grid)grid.setAttribute('aria-label',ui.cardsLabel||'Four wedding functions');
  const detailLink=byId('detailLink');if(detailLink)detailLink.textContent=ui.detailLink||'Explore Bollywood costume ideas ↗';
  const detailClose=document.querySelector('[data-close-dialog]');if(detailClose)detailClose.setAttribute('aria-label',ui.closingDetail||'Close details');
  const rsvpClose=document.querySelector('[data-close-rsvp]');if(rsvpClose)rsvpClose.setAttribute('aria-label',ui.closingRSVP||'Close RSVP');
  const rsvpIntro=byId('rsvpIntro')||document.querySelector('.rsvp-top .overline');
  if(rsvpIntro)rsvpIntro.textContent=CONTENT.rsvp?.intro||'';
  textAt('rsvpTitle',CONTENT.rsvp?.title);
  const rsvpSubtitle=byId('rsvpSubtitle')||document.querySelector('.rsvp-top h2 + p');
  if(rsvpSubtitle)rsvpSubtitle.textContent=CONTENT.rsvp?.subtitle||'';
  const topRsvp=document.querySelector('.bollywood-page [data-open-rsvp]');
  if(topRsvp)topRsvp.textContent=(HOME.rsvpButton||'RSVP')+' ↗';
  labelFor('guestName',ui.nameLabel||'Your name');
  labelFor('guestCount',ui.guestCountLabel||'Guests');
  labelFor('attendance',ui.attendanceLabel||'Attending?');
  labelFor('guestNote',ui.noteLabel||'A message (optional)');
  const name=byId('guestName');if(name)name.placeholder=ui.namePlaceholder||'Full name';
  const note=byId('guestNote');if(note)note.placeholder=ui.notePlaceholder||'Your blessings and wishes...';
  const attendance=byId('attendance');if(attendance){
    const selected=attendance.selectedIndex;
    const opts=[['Yes, delighted to attend',ui.attendingYes],['Still confirming',ui.attendingMaybe],['Unable to attend',ui.attendingNo]];
    opts.forEach(([eng,localized],i)=>{if(attendance.options[i]){
      attendance.options[i].value=CURRENT_LANG==='hi'?(localized||eng):eng;
      attendance.options[i].textContent=localized||eng;
    }});
    attendance.selectedIndex=selected;
  }
  const send=document.querySelector('.send-rsvp');if(send)send.textContent=ui.rsvpSend||'Prepare WhatsApp message ↗';
  const copy=byId('copyRSVP');if(copy)copy.textContent=ui.rsvpCopy||'Copy RSVP message instead';
  setTextFor('.rsvp-disclaimer',ui.rsvpDisclaimer||'WhatsApp opens a draft; you choose the recipient and tap Send.');
  const dressLink=document.querySelector('.spotlight-copy .spotlight-cta');if(dressLink)dressLink.textContent=ui.dressCodeLink||'Find your character ↘';
  const tablist=document.querySelector('.costume-tabs');if(tablist)tablist.setAttribute('aria-label',ui.costumesAria||'Costume inspiration categories');
  const metadata=document.querySelector('meta[name="description"]');
  if(metadata)metadata.setAttribute('content',CURRENT_LANG==='hi' ? (document.body.classList.contains('home-page')?'आकांक्षा और विकाश का विवाह निमंत्रण · १०–१३ दिसंबर २०२६ · झाँसी।':'११ दिसंबर २०२६ को बॉलीवुड किरदारों से सजी संगीत की रात।') : (document.body.classList.contains('home-page')?'Four illustrated celebrations, one beautiful forever. Akanksha & Vikash · 10–13 December 2026 · Jhansi.':'Raas to Reel: Bollywood character night at Akanksha & Vikash’s wedding Sangeet, 11 December 2026.'));
  const sangeetStage=document.querySelector('.spotlight-stage');if(sangeetStage)sangeetStage.setAttribute('aria-label',ui.sangeetThemeAria||'Bollywood Sangeet theme');
  const filmPoster=document.querySelector('.spotlight-poster img');if(filmPoster)filmPoster.alt=ui.posterAlt||'Bollywood Night illustration';
  const back=document.querySelector('.bollywood-page .masthead-actions a');
  if(back)back.textContent=CONTENT.bollywood?.backLabel||'← Main invitation';
  document.querySelectorAll('.language-switch button[data-lang]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.lang===CURRENT_LANG));
  });
  const switcher=document.querySelector('.language-switch');
  if(switcher)switcher.setAttribute('aria-label',CURRENT_LANG==='hi'?'भाषा चुनें':'Choose language');
  // Keep language selected across navigation, even if storage is unavailable.
  document.querySelectorAll('a[href^="index.html"],a[href^="bollywood.html"]').forEach(link=>{
    const page=link.getAttribute('href').split('?')[0];
    link.href=page+'?lang='+CURRENT_LANG;
  });
  if(document.body.classList.contains('home-page')){
    document.title=(HOME.bride||'')+' & '+(HOME.groom||'')+' · '+(CURRENT_LANG==='hi'?'विवाह निमंत्रण':'Wedding Invitation');
  }else{
    document.title=(CURRENT_LANG==='hi'?'रास से रील तक · बॉलीवुड संगीत':'Raas to Reel · Bollywood Sangeet')+' · '+(HOME.bride||'')+' & '+(HOME.groom||'');
  }
}
function setLanguage(lang,remember=true){
  CURRENT_LANG=lang==='hi'?'hi':'en';
  CONTENT=CURRENT_LANG==='hi'?(window.WEDDING_HINDI||window.WEDDING_CONTENT||{}):(window.WEDDING_CONTENT||{});
  HOME=CONTENT.site||{};
  EVENTS=CONTENT.events||{};
  document.documentElement.lang=CURRENT_LANG;
  document.body.setAttribute('data-language',CURRENT_LANG);
  setTextFromConfig();
  renderCards();
  setBollywoodText();
  renderCostumes();
  applySharedTranslations();
  if(CURRENT_DETAIL_KEY&&byId('detailDialog')?.open)openEvent(CURRENT_DETAIL_KEY);
  if(remember){try{localStorage.setItem('wedding-language',CURRENT_LANG);}catch(err){}
    try{const url=new URL(window.location.href);url.searchParams.set('lang',CURRENT_LANG);
      window.history.replaceState(null,'',url.href);
    }catch(err){}
  }
}
function initialLanguage(){
  try{const value=new URL(window.location.href).searchParams.get('lang');if(value==='hi'||value==='en')return value;}catch(err){}
  try{const saved=localStorage.getItem('wedding-language');if(saved==='hi'||saved==='en')return saved;}catch(err){}
  return 'en';
}
function setupLanguageSwitch(){
  document.querySelectorAll('.language-switch button[data-lang]').forEach(button=>{
    button.addEventListener('click',()=>setLanguage(button.dataset.lang));
  });
}
// Images on the Bollywood page use the same image-config.js as the invitation.
document.querySelectorAll('img[data-image]').forEach(img=>{const url=weddingImageUrl(img.dataset.image);if(url)img.src=url;});
setupLanguageSwitch();setLanguage(initialLanguage(),false);setupDialogs();setupRSVP();setupCalendar();setupCostumes();setupPinterest();
