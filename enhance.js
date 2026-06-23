/* SMR-26 — дополнения к артефакту: погода (Open-Meteo) + связка с Планом Б + кнопка галереи.
   Работает рядом с React-рантажом: всё добавляется в <body> как фиксированные элементы,
   которые рантайм не перерисовывает. */
(function () {
  'use strict';
  // a11y: артефакт не задаёт язык и заголовок страницы — добавляем
  if (!document.documentElement.getAttribute('lang')) document.documentElement.setAttribute('lang', 'ru');
  if (!document.title) document.title = 'SMR-26 · Volga Weekend · 3–5 июля 2026';
  var LAT = 53.195, LON = 50.101;
  var TRIP = ['2026-07-03', '2026-07-04', '2026-07-05'];

  var css = document.createElement('style');
  css.textContent = [
    // #dc-root задаёт height:100vh с overflow:visible — контент вываливается за бокс,
    // из-за чего секции, добавленные после него, накладываются. height:auto чинит поток.
    '#dc-root{height:auto!important}',
    // safe-area: в PWA (standalone) статус-бар/чёлка наезжали на меню — отодвигаем
    '#dc-root nav{padding-top:env(safe-area-inset-top)!important}',
    // подсказка горизонтального скролла меню — затухание у правого края
    '#dc-root nav::after{content:"";position:absolute;top:0;right:0;bottom:0;width:34px;pointer-events:none;background:linear-gradient(90deg,rgba(244,236,217,0),rgba(244,236,217,.92))}',
    // контраст: затемняем приглушённые курсивные подписи в секциях (кроме hero — там светлый текст)
    '#dc-root section:not([id="hero"]) p[style*="italic"]{color:#5a4b3a!important}',
    // летящий самолётик: медленно скользит вдоль пунктира в hero
    '@keyframes smrFly{0%{left:12%}100%{left:88%}}',
    '.smr-plane{animation:smrFly 5s ease-in-out infinite alternate;will-change:left}',
    '@media(prefers-reduced-motion:reduce){.smr-plane{animation:none}}',
    // футер: кораблик с качкой/паром/кильватером везёт пиво; ребята подпрыгивают и радуются
    '@keyframes crewSail{0%{transform:translate(402px,63px)}40%{transform:translate(172px,63px)}64%{transform:translate(172px,63px)}100%{transform:translate(402px,63px)}}',
    '.crew-ship{transform:translate(402px,63px);animation:crewSail 9s ease-in-out infinite}',
    '.crew-bob,.crew-cheer,.crew-steam,.crew-wake{transform-box:fill-box;transform-origin:center}',
    '@keyframes crewBob{0%{transform:translateY(0) rotate(-2.4deg)}50%{transform:translateY(-1.6px) rotate(2.4deg)}100%{transform:translateY(0) rotate(-2.4deg)}}',
    '.crew-bob{animation:crewBob 2.3s ease-in-out infinite}',
    '@keyframes crewSteam{0%{opacity:.7;transform:translateY(0) scale(.9)}100%{opacity:0;transform:translateY(-10px) scale(1.6)}}',
    '.crew-steam{animation:crewSteam 1.5s ease-out infinite}.crew-steam.s2{animation-delay:.5s}.crew-steam.s3{animation-delay:1s}',
    '@keyframes crewWake{0%,100%{opacity:.25;transform:scaleX(.8)}50%{opacity:.6;transform:scaleX(1.1)}}',
    '.crew-wake{animation:crewWake 1.2s ease-in-out infinite}',
    '@keyframes crewFoam{0%,100%{opacity:.4}50%{opacity:.7}}',
    '.crew-foam{animation:crewFoam 3s ease-in-out infinite}',
    '@keyframes crewCheer{0%,40%{opacity:0;transform:translateY(4px) scale(.5)}46%{opacity:1;transform:translateY(0) scale(1)}62%{opacity:1;transform:translateY(0) scale(1)}68%,100%{opacity:0;transform:translateY(4px) scale(.5)}}',
    '.crew-cheer{opacity:0;animation:crewCheer 9s ease-in-out infinite}',
    '@keyframes crewSmile{0%,41%{opacity:0}46%,62%{opacity:1}67%,100%{opacity:0}}',
    '.crew-smile{animation:crewSmile 9s ease-in-out infinite}',
    '@keyframes crewMouthN{0%,41%{opacity:1}46%,62%{opacity:0}67%,100%{opacity:1}}',
    '.crew-mouth{animation:crewMouthN 9s ease-in-out infinite}',
    '@keyframes crewHop{0%,42%{transform:translateY(0)}47%{transform:translateY(-5px)}52%{transform:translateY(0)}57%{transform:translateY(-3px)}62%,100%{transform:translateY(0)}}',
    '.crew-hop{animation:crewHop 9s ease-in-out infinite}.crew-hop2{animation-delay:.18s}',
    '@media(prefers-reduced-motion:reduce){.crew-ship,.crew-bob,.crew-steam,.crew-wake,.crew-foam,.crew-hop{animation:none}.crew-ship{transform:translate(172px,63px)}.crew-cheer{opacity:1;animation:none}.crew-smile{opacity:1;animation:none}.crew-mouth{opacity:0;animation:none}}',
    '.smr-fab{position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:90;display:flex;flex-direction:column;gap:10px;align-items:flex-end;font-family:Montserrat,sans-serif}',
    '.smr-links{display:none;flex-direction:column;gap:8px;align-items:flex-end}',
    '.smr-links.open{display:flex}',
    '.smr-lnk{display:flex;align-items:center;gap:8px;background:#fff;color:#235D5A;text-decoration:none;border:1px solid #D8C7A6;border-radius:999px;padding:10px 16px;box-shadow:0 6px 18px rgba(0,0,0,.18);font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.04em;font-size:13px}',
    '.smr-menu{display:flex;align-items:center;gap:8px;background:#A86511;color:#fff;border:none;cursor:pointer;border-radius:999px;padding:12px 18px;box-shadow:0 6px 18px rgba(0,0,0,.22);font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.04em;font-size:14px}',
    '.smr-wbtn{display:flex;align-items:center;gap:8px;background:#235D5A;color:#F4ECD9;border:none;cursor:pointer;border-radius:999px;padding:10px 15px;box-shadow:0 6px 18px rgba(0,0,0,.22);font-family:Oswald,sans-serif;letter-spacing:.03em;font-size:14px}',
    '.smr-wbtn .t{font-size:18px;font-weight:700}',
    '.smr-panel{position:fixed;right:14px;bottom:calc(74px + env(safe-area-inset-bottom));z-index:91;width:300px;max-width:calc(100vw - 28px);background:#fff;border:1px solid #D8C7A6;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.28);padding:15px 16px;display:none;font-family:Montserrat,sans-serif;color:#332A22}',
    '.smr-panel.on{display:block}',
    '.smr-panel h4{margin:0 0 2px;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.05em;font-size:13px;color:#235D5A}',
    '.smr-now{display:flex;align-items:center;gap:12px;margin:8px 0 4px}',
    '.smr-now .big{font-size:40px;line-height:1}',
    '.smr-now .deg{font-family:Oswald,sans-serif;font-size:34px;color:#235D5A;line-height:1}',
    '.smr-now .desc{font-size:12.5px;color:#675a44}',
    '.smr-days{display:flex;gap:6px;margin-top:10px}',
    '.smr-day{flex:1;background:#faf6ec;border:1px solid #eadfc6;border-radius:10px;padding:7px 4px;text-align:center}',
    '.smr-day .dn{font-family:Oswald,sans-serif;font-size:10px;letter-spacing:.04em;color:#6b5c44;text-transform:uppercase}',
    '.smr-day .di{font-size:20px;margin:2px 0}',
    '.smr-day .dt{font-size:12px;font-weight:600;color:#332A22}',
    '.smr-day .dp{font-size:10px;color:#3b7bbf}',
    '.smr-rec{margin-top:11px;border-radius:11px;padding:10px 12px;font-size:12.5px;line-height:1.45}',
    '.smr-rec b{font-family:Oswald,sans-serif;letter-spacing:.02em}',
    '.smr-close{position:absolute;top:9px;right:11px;border:none;background:none;font-size:17px;color:#8a7a5f;cursor:pointer}',
    '.smr-foot{margin-top:10px;font-size:10.5px;color:#8a7a5f;text-align:center}'
  ].join('');
  document.head.appendChild(css);

  // floating controls
  var fab = document.createElement('div');
  fab.className = 'smr-fab';
  fab.innerHTML =
    '<button class="smr-wbtn" id="smrW"><span>🌦️</span><span class="t" id="smrWt">…</span><span style="font-size:12px;opacity:.85">Самара</span></button>';
  document.body.appendChild(fab);

  // Перехват кнопок «Фото/Видео» в чекпойнтах → открыть загрузку в галерею с подписью.
  // Capture-фаза на document срабатывает раньше React-обработчика (React 18 слушает на #dc-root).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('button') : null;
    if (!btn) return;
    var sec = btn.closest('#checkpoints');
    if (!sec) return;
    var txt = (btn.textContent || '').trim();
    var isPhoto = /Фото/.test(txt), isVideo = /Видео/.test(txt);
    if (!isPhoto && !isVideo) return;
    // НЕ глушим событие: пусть React отметит момент «поймано» (счётчик) и сохранит,
    // затем уводим в галерею с подписью.
    var title = '';
    try {
      var card = btn.parentElement.parentElement;            // карточка чекпойнта
      var titleEl = card.firstElementChild && card.firstElementChild.firstElementChild;
      if (titleEl) title = titleEl.textContent.trim();
    } catch (_) {}
    var q = '?type=' + (isVideo ? 'video' : 'photo') + (title ? '&caption=' + encodeURIComponent(title) : '');
    setTimeout(function () { location.href = '/gallery.html' + q; }, 60);
  }, true);

  var panel = document.createElement('div');
  panel.className = 'smr-panel';
  panel.innerHTML = '<button class="smr-close" id="smrX">✕</button><div id="smrBody">Загружаю погоду…</div>';
  document.body.appendChild(panel);

  document.getElementById('smrW').onclick = function () { panel.classList.toggle('on'); };
  document.getElementById('smrX').onclick = function () { panel.classList.remove('on'); };

  // кнопка «наверх» (слева внизу, появляется при прокрутке)
  var topBtn = document.createElement('button');
  topBtn.textContent = '↑';
  topBtn.setAttribute('aria-label', 'Наверх');
  topBtn.style.cssText = 'position:fixed;left:14px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:89;width:46px;height:46px;border-radius:50%;border:none;background:#235D5A;color:#F4ECD9;font-size:22px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:opacity .2s';
  document.body.appendChild(topBtn);
  topBtn.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.addEventListener('scroll', function () {
    var on = window.scrollY > 600;
    topBtn.style.opacity = on ? '1' : '0';
    topBtn.style.pointerEvents = on ? 'auto' : 'none';
  }, { passive: true });

  // ===== Тайминги рейса + В календарь =====
  function tline(em, t, s) {
    return '<div style="display:flex;gap:10px;align-items:center;background:#fff;border:1px solid #D8C7A6;border-radius:12px;padding:11px 13px">' +
      '<span style="font-size:20px">' + em + '</span><div><div style="font-weight:600;font-size:14px">' + t +
      '</div><div style="font-size:12.5px;color:#675a44">' + s + '</div></div></div>';
  }
  function icsDownload() {
    function ev(uid, s, e, sum, loc, desc) {
      return ['BEGIN:VEVENT', 'UID:' + uid + '@smr26.ru', 'DTSTAMP:20260623T000000Z',
        'DTSTART:' + s, 'DTEND:' + e, 'SUMMARY:' + sum, 'LOCATION:' + loc, 'DESCRIPTION:' + desc,
        'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:' + sum, 'END:VALARM', 'END:VEVENT'].join('\r\n');
    }
    var cal = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SMR-26//RU', 'CALSCALE:GREGORIAN',
      ev('smr-out', '20260703T211500', '20260704T001000', 'SMR-26 — вылет в Самару', 'Аэропорт Домодедово (DME)', 'Москва (DME) → Самара. Посадка 00:10 в Курумоче.'),
      ev('smr-back', '20260705T180000', '20260705T193000', 'SMR-26 — обратный рейс', 'Аэропорт Курумоч (KUF)', 'Быть в аэропорту не позже 18:00.'),
      'END:VCALENDAR'].join('\r\n');
    var blob = new Blob([cal], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'SMR-26.ics';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  var timings = document.createElement('section');
  timings.id = 'smr-timings';
  timings.style.cssText = 'max-width:760px;margin:0 auto;padding:30px 20px 8px;font-family:Montserrat,sans-serif';
  timings.innerHTML =
    '<div style="font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.18em;font-size:12px;color:#235D5A">08 · В дорогу</div>' +
    '<h2 style="font-family:Oswald,sans-serif;font-weight:700;text-transform:uppercase;font-size:30px;margin:6px 0 5px;line-height:1;color:#332A22">Тайминги рейса ✈️</h2>' +
    '<p style="margin:0 0 14px;font-size:13.5px;color:#675a44;font-style:italic">Добавь ключевые времена в календарь телефона — за 3 часа придёт напоминание.</p>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">' +
      tline('✈️', 'Вылет из Москвы', '3 июля · 21:15 · Домодедово (DME)') +
      tline('🛬', 'Посадка в Самаре', '4 июля · 00:10 · Курумоч (KUF)') +
      tline('🏨', 'Отель HolidayHall', 'с ночи 3 июля') +
      tline('🛫', 'Обратный рейс', '5 июля · в Курумоче к 18:00') +
    '</div>' +
    '<button id="smrIcs" style="background:#A86511;color:#fff;border:none;border-radius:12px;padding:13px 20px;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.05em;font-size:15px;cursor:pointer;width:100%">📅 Добавить рейсы в календарь</button>';
  document.body.appendChild(timings);
  document.getElementById('smrIcs').onclick = icsDownload;

  // ===== Мерч и сувениры (секция внизу страницы) =====
  var merch = document.createElement('section');
  merch.id = 'smr-merch';
  merch.style.cssText = 'max-width:760px;margin:0 auto;padding:30px 20px 44px;font-family:Montserrat,sans-serif';
  merch.innerHTML =
    '<div style="font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.18em;font-size:12px;color:#235D5A">09 · Память о поездке</div>' +
    '<h2 style="font-family:Oswald,sans-serif;font-weight:700;text-transform:uppercase;font-size:30px;margin:6px 0 5px;line-height:1;color:#332A22">Мерч и сувениры 👕</h2>' +
    '<p style="margin:0 0 16px;font-size:13.5px;color:#675a44;font-style:italic">Фирменный «ЗОЖ ТУР» — футболка и худи экипажа. Чтобы было в чём вспоминать поездку.</p>' +
    '<div id="smrMerchGrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px"></div>';
  var mgrid = merch.querySelector('#smrMerchGrid');
  var merchItems = [
    { src: '/merch/merch-tshirt.jpg', t: 'Футболка «ЗОЖ ТУР»', s: 'оверсайз, молочный' },
    { src: '/merch/merch-hoodie.jpg', t: 'Худи «ЗОЖ ТУР»', s: 'графитовый' }
  ];
  merchItems.forEach(function (it) {
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border:1px solid #D8C7A6;border-radius:14px;overflow:hidden';
    var img = document.createElement('img');
    img.src = it.src; img.loading = 'lazy'; img.alt = it.t;
    img.style.cssText = 'display:block;width:100%;height:auto;background:#eadfc6';
    img.onerror = function () { if (!img.dataset.retried) { img.dataset.retried = '1'; img.src = it.src + '?r=' + Date.now(); } };
    var cap = document.createElement('div');
    cap.style.cssText = 'padding:11px 13px';
    cap.innerHTML = '<div style="font-weight:600;font-size:14.5px">' + it.t + '</div>' +
      '<div style="font-size:12.5px;color:#675a44;margin-top:2px">' + it.s + '</div>';
    card.appendChild(img); card.appendChild(cap); mgrid.appendChild(card);
  });
  function merchCheck() {
    var all = [].slice.call(mgrid.children);
    if (all.length && all.every(function (c) { return c.style.display === 'none'; })) merch.style.display = 'none';
  }
  document.body.appendChild(merch);

  var WMO = {
    0:['☀️','ясно'],1:['🌤️','малооблачно'],2:['⛅','облачно'],3:['☁️','пасмурно'],
    45:['🌫️','туман'],48:['🌫️','изморозь'],
    51:['🌦️','морось'],53:['🌦️','морось'],55:['🌦️','морось'],
    61:['🌧️','дождь'],63:['🌧️','дождь'],65:['🌧️','сильный дождь'],
    66:['🌧️','ледяной дождь'],67:['🌧️','ледяной дождь'],
    71:['🌨️','снег'],73:['🌨️','снег'],75:['❄️','сильный снег'],77:['🌨️','снежная крупа'],
    80:['🌦️','ливень'],81:['🌧️','ливень'],82:['⛈️','сильный ливень'],
    85:['🌨️','снегопад'],86:['❄️','снегопад'],
    95:['⛈️','гроза'],96:['⛈️','гроза с градом'],99:['⛈️','сильная гроза']
  };
  function wmo(c){return WMO[c]||['🌡️','—'];}
  function dayName(iso){var d=new Date(iso+'T12:00:00');return ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'][d.getDay()];}

  // Связка с Планом Б: по прогнозу на даты поездки выбираем сценарий
  function recommend(days){
    // days: [{code,precip,wind}] для дней поездки, что есть в прогнозе
    if(!days.length) return null;
    var maxPrecip=0,maxWind=0,storm=false;
    days.forEach(function(d){
      if(d.precip>maxPrecip)maxPrecip=d.precip;
      if(d.wind>maxWind)maxWind=d.wind;
      if(d.code>=95||d.code===82||d.code===65)storm=true;
    });
    if(storm || maxWind>=45 || maxPrecip>=70)
      return {bg:'#fbe9e7',bd:'#f0c3bc',cl:'#b23b2e',t:'<b>Сценарий B/C.</b> Шторм/сильный дождь — открытый катер не берём. Волгу на субботу или «сухопутно-пивной» день (фон Вакано, На Дне).'};
    if(maxPrecip>=35 || maxWind>=30)
      return {bg:'#fff6e6',bd:'#f0d9a8',cl:'#7a4f12',t:'<b>Сценарий A.</b> Возможен дождь/ветер — берём теплоход с закрытым салоном и ветровки, едем по плану.'};
    return {bg:'#e7f3ec',bd:'#bfe3cd',cl:'#1F8A5B',t:'<b>По плану ✓</b> Погода благоприятная — открытый катер/теплоход по Волге без ограничений.'};
  }

  // рендер погоды (вызывается и для кэша из localStorage, и для свежих данных)
  function renderWeather(j){
    if(!j||!j.current) return;
    var t=Math.round(j.current.temperature_2m);
    var cw=wmo(j.current.weather_code);
    document.getElementById('smrWt').textContent=(t>0?'+':'')+t+'°';
    var sp=document.querySelector('#smrW span'); if(sp) sp.textContent=cw[0];

    var html='<h4>Погода в Самаре</h4>'+
      '<div class="smr-now"><span class="big">'+cw[0]+'</span><span class="deg">'+(t>0?'+':'')+t+'°</span><span class="desc">'+cw[1]+'<br>сейчас</span></div>';

    var dd=j.daily||{time:[]}, tripDays=[];
    html+='<h4 style="margin-top:13px">Прогноз на поездку · 3–5 июля</h4>';
    var inRange=false, cells='';
    TRIP.forEach(function(iso){
      var i=dd.time.indexOf(iso);
      if(i<0){return;}
      inRange=true;
      var w=wmo(dd.weather_code[i]);
      var tmax=Math.round(dd.temperature_2m_max[i]);
      var pp=dd.precipitation_probability_max[i];
      tripDays.push({code:dd.weather_code[i],precip:pp||0,wind:dd.wind_speed_10m_max[i]||0});
      cells+='<div class="smr-day"><div class="dn">'+dayName(iso)+'</div><div class="di">'+w[0]+'</div><div class="dt">'+(tmax>0?'+':'')+tmax+'°</div><div class="dp">'+(pp!=null?'💧'+pp+'%':'')+'</div></div>';
    });
    if(inRange){
      html+='<div class="smr-days">'+cells+'</div>';
      var rec=recommend(tripDays);
      if(rec) html+='<div class="smr-rec" style="background:'+rec.bg+';border:1px solid '+rec.bd+';color:'+rec.cl+'">'+rec.t+'</div>';
    } else {
      html+='<div style="font-size:12.5px;color:#6b5c44;margin-top:6px">Точный прогноз появится ближе к дате (за ~16 дней).</div>';
    }
    html+='<div class="smr-foot">данные Open-Meteo · обновляется автоматически</div>';
    document.getElementById('smrBody').innerHTML=html;
  }

  // 1) мгновенно показываем последнюю сохранённую погоду (без ожидания сети)
  try{ var cached=JSON.parse(localStorage.getItem('smr_weather')||'null'); if(cached) renderWeather(cached); }catch(e){}

  // 2) обновляем с сервера (антикэш ?t=), сохраняем результат
  fetch('/api/weather.php?t='+Date.now()).then(function(r){return r.json();}).then(function(j){
    if(j&&j.current){ try{localStorage.setItem('smr_weather',JSON.stringify(j));}catch(e){} renderWeather(j); }
  }).catch(function(){
    if(!localStorage.getItem('smr_weather')){
      document.getElementById('smrWt').textContent='—';
      document.getElementById('smrBody').innerHTML='<h4>Погода в Самаре</h4><div style="font-size:13px;color:#6b5c44;margin-top:8px">Не удалось загрузить прогноз. Открой панель позже.</div>';
    }
  });
})();
