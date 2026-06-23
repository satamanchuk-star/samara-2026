<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_out(['ok' => false, 'error' => 'POST only'], 405);
}
if (!rate_limit('like', 200, 600)) {
  json_out(['ok' => false, 'error' => 'Слишком часто'], 429);
}

$file = basename((string)($_POST['file'] ?? ''));
$dir  = ($_POST['dir'] ?? 'up') === 'down' ? 'down' : 'up';
if ($file === '' || strpos($file, '..') !== false) {
  json_out(['ok' => false, 'error' => 'Файл не указан'], 400);
}
// лайкать можно только существующий файл
if (!is_file(UPLOAD_DIR . '/' . $file)) {
  json_out(['ok' => false, 'error' => 'Нет такого файла'], 404);
}

$LIKES = UPLOAD_DIR . '/_likes.json';
$count = 0;
$fp = fopen($LIKES, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
  $data = json_decode(stream_get_contents($fp), true);
  if (!is_array($data)) $data = [];
  $cur = (int)($data[$file] ?? 0) + ($dir === 'down' ? -1 : 1);
  if ($cur < 0) $cur = 0;
  $data[$file] = $cur;
  $count = $cur;
  ftruncate($fp, 0); rewind($fp); fwrite($fp, json_encode($data));
  fflush($fp); flock($fp, LOCK_UN); fclose($fp);
}

json_out(['ok' => true, 'file' => $file, 'likes' => $count]);
