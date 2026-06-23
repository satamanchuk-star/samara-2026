<?php
require __DIR__ . '/config.php';
$cache = __DIR__ . '/../uploads/_weather.json';
$TTL = 1800; // 30 мин

$url = 'https://api.open-meteo.com/v1/forecast?latitude=53.195&longitude=50.101'
  . '&current=temperature_2m,weather_code'
  . '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max'
  . '&timezone=Europe%2FSamara&forecast_days=16';

function fetch_weather($url, $cache) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>12, CURLOPT_FOLLOWLOCATION=>true, CURLOPT_USERAGENT=>'smr26.ru']);
  $data = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($data !== false && $code === 200 && strpos($data, '"current"') !== false) {
    file_put_contents($cache, $data, LOCK_EX);
    return $data;
  }
  return false;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// Есть кэш — отдаём МГНОВЕННО. Если устарел — обновляем в фоне после ответа.
if (is_file($cache)) {
  $fresh = (time() - filemtime($cache)) < $TTL;
  header('X-Cache: ' . ($fresh ? 'HIT' : 'STALE'));
  readfile($cache);
  if (!$fresh) {
    if (function_exists('fastcgi_finish_request')) {
      fastcgi_finish_request();     // ответ уже ушёл клиенту
      fetch_weather($url, $cache);  // обновляем «в фоне», пользователь не ждёт
    } else {
      @touch($cache);               // чтобы не долбить при каждом запросе
      fetch_weather($url, $cache);
    }
  }
  exit;
}

// Кэша ещё нет — придётся сходить синхронно (один раз).
$data = fetch_weather($url, $cache);
if ($data !== false) { header('X-Cache: MISS'); echo $data; exit; }
http_response_code(502);
echo json_encode(['error' => 'weather unavailable']);
