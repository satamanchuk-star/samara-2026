<?php
require __DIR__ . '/config.php';
$cache = __DIR__ . '/../uploads/_weather.json';

// свежий кэш (<30 мин) — отдаём сразу
if (is_file($cache) && (time() - filemtime($cache)) < 1800) {
  header('Content-Type: application/json; charset=utf-8');
  header('X-Cache: HIT');
  readfile($cache);
  exit;
}

$url = 'https://api.open-meteo.com/v1/forecast?latitude=53.195&longitude=50.101'
  . '&current=temperature_2m,weather_code'
  . '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max'
  . '&timezone=Europe%2FSamara&forecast_days=16';

$ch = curl_init($url);
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>12, CURLOPT_FOLLOWLOCATION=>true, CURLOPT_USERAGENT=>'smr26.ru']);
$data = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($data !== false && $code === 200) {
  file_put_contents($cache, $data);
  header('Content-Type: application/json; charset=utf-8');
  header('X-Cache: MISS');
  echo $data;
  exit;
}
// фолбэк на старый кэш
if (is_file($cache)) {
  header('Content-Type: application/json; charset=utf-8');
  header('X-Cache: STALE');
  readfile($cache);
  exit;
}
http_response_code(502);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['error'=>'weather unavailable','code'=>$code,'curl'=>$err]);
