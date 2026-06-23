/* SMR-26 — дополнения к артефакту: погода (Open-Meteo) + связка с Планом Б + кнопка галереи.
   Работает рядом с React-рантажом: всё добавляется в <body> как фиксированные элементы,
   которые рантайм не перерисовывает. */
(function () {
  'use strict';
  var LAT = 53.195, LON = 50.101;
  var TRIP = ['2026-07-03', '2026-07-04', '2026-07-05'];

  var css = document.createElement('style');
  css.textContent = [
    '.smr-fab{position:fixed;right:14px;bottom:16px;z-index:90;display:flex;flex-direction:column;gap:10px;align-items:flex-end;font-family:Onest,sans-serif}',
    '.smr-links{display:none;flex-direction:column;gap:8px;align-items:flex-end}',
    '.smr-links.open{display:flex}',
    '.smr-lnk{display:flex;align-items:center;gap:8px;background:#fff;color:#235D5A;text-decoration:none;border:1px solid #D8C7A6;border-radius:999px;padding:10px 16px;box-shadow:0 6px 18px rgba(0,0,0,.18);font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.04em;font-size:13px}',
    '.smr-menu{display:flex;align-items:center;gap:8px;background:#C8841E;color:#fff;border:none;cursor:pointer;border-radius:999px;padding:12px 18px;box-shadow:0 6px 18px rgba(0,0,0,.22);font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.04em;font-size:14px}',
    '.smr-wbtn{display:flex;align-items:center;gap:8px;background:#235D5A;color:#F4ECD9;border:none;cursor:pointer;border-radius:999px;padding:10px 15px;box-shadow:0 6px 18px rgba(0,0,0,.22);font-family:Oswald,sans-serif;letter-spacing:.03em;font-size:14px}',
    '.smr-wbtn .t{font-size:18px;font-weight:700}',
    '.smr-panel{position:fixed;right:14px;bottom:74px;z-index:91;width:300px;max-width:calc(100vw - 28px);background:#fff;border:1px solid #D8C7A6;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.28);padding:15px 16px;display:none;font-family:Onest,sans-serif;color:#332A22}',
    '.smr-panel.on{display:block}',
    '.smr-panel h4{margin:0 0 2px;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.05em;font-size:13px;color:#235D5A}',
    '.smr-now{display:flex;align-items:center;gap:12px;margin:8px 0 4px}',
    '.smr-now .big{font-size:40px;line-height:1}',
    '.smr-now .deg{font-family:Oswald,sans-serif;font-size:34px;color:#235D5A;line-height:1}',
    '.smr-now .desc{font-size:12.5px;color:#7a6a52}',
    '.smr-days{display:flex;gap:6px;margin-top:10px}',
    '.smr-day{flex:1;background:#faf6ec;border:1px solid #eadfc6;border-radius:10px;padding:7px 4px;text-align:center}',
    '.smr-day .dn{font-family:Oswald,sans-serif;font-size:10px;letter-spacing:.04em;color:#9a8a6a;text-transform:uppercase}',
    '.smr-day .di{font-size:20px;margin:2px 0}',
    '.smr-day .dt{font-size:12px;font-weight:600;color:#332A22}',
    '.smr-day .dp{font-size:10px;color:#3b7bbf}',
    '.smr-rec{margin-top:11px;border-radius:11px;padding:10px 12px;font-size:12.5px;line-height:1.45}',
    '.smr-rec b{font-family:Oswald,sans-serif;letter-spacing:.02em}',
    '.smr-close{position:absolute;top:9px;right:11px;border:none;background:none;font-size:17px;color:#b3a386;cursor:pointer}',
    '.smr-foot{margin-top:10px;font-size:10.5px;color:#b3a386;text-align:center}'
  ].join('');
  document.head.appendChild(css);

  // floating controls
  var fab = document.createElement('div');
  fab.className = 'smr-fab';
  fab.innerHTML =
    '<div class="smr-links" id="smrLinks">' +
      '<a class="smr-lnk" href="/gallery.html">📸 Галерея</a>' +
      '<a class="smr-lnk" href="/map.html">🗺️ Карта</a>' +
      '<a class="smr-lnk" href="/crew.html">👥 Экипаж</a>' +
    '</div>' +
    '<button class="smr-menu" id="smrMenu">🧭 Разделы</button>' +
    '<button class="smr-wbtn" id="smrW"><span>🌦️</span><span class="t" id="smrWt">…</span><span style="font-size:12px;opacity:.85">Самара</span></button>';
  document.body.appendChild(fab);
  document.getElementById('smrMenu').onclick = function () {
    document.getElementById('smrLinks').classList.toggle('open');
  };

  var panel = document.createElement('div');
  panel.className = 'smr-panel';
  panel.innerHTML = '<button class="smr-close" id="smrX">✕</button><div id="smrBody">Загружаю погоду…</div>';
  document.body.appendChild(panel);

  document.getElementById('smrW').onclick = function () { panel.classList.toggle('on'); };
  document.getElementById('smrX').onclick = function () { panel.classList.remove('on'); };

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
      return {bg:'#fff6e6',bd:'#f0d9a8',cl:'#9a6a1e',t:'<b>Сценарий A.</b> Возможен дождь/ветер — берём теплоход с закрытым салоном и ветровки, едем по плану.'};
    return {bg:'#e7f3ec',bd:'#bfe3cd',cl:'#1F8A5B',t:'<b>По плану ✓</b> Погода благоприятная — открытый катер/теплоход по Волге без ограничений.'};
  }

  // грузим погоду через свой сервер (api.open-meteo.com напрямую из РФ часто недоступен)
  var url='/api/weather.php';

  fetch(url).then(function(r){return r.json();}).then(function(j){
    var t=Math.round(j.current.temperature_2m);
    var cw=wmo(j.current.weather_code);
    document.getElementById('smrWt').textContent=(t>0?'+':'')+t+'°';
    document.querySelector('#smrW span').textContent=cw[0];

    var html='<h4>Погода в Самаре</h4>'+
      '<div class="smr-now"><span class="big">'+cw[0]+'</span><span class="deg">'+(t>0?'+':'')+t+'°</span><span class="desc">'+cw[1]+'<br>сейчас</span></div>';

    // прогноз на даты поездки
    var dd=j.daily, tripDays=[];
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
      html+='<div style="font-size:12.5px;color:#9a8a6a;margin-top:6px">Точный прогноз появится ближе к дате (за ~16 дней). Сейчас следим за общей тенденцией.</div>';
    }
    html+='<div class="smr-foot">данные Open-Meteo · обновляется автоматически</div>';
    document.getElementById('smrBody').innerHTML=html;
  }).catch(function(){
    document.getElementById('smrWt').textContent='—';
    document.getElementById('smrBody').innerHTML='<h4>Погода в Самаре</h4><div style="font-size:13px;color:#9a8a6a;margin-top:8px">Не удалось загрузить прогноз. Проверь интернет и открой панель снова.</div>';
  });
})();
