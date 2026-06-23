<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_out(['ok' => false, 'error' => 'POST only'], 405);
}
if (!rate_limit('del', 60, 600)) {
  json_out(['ok' => false, 'error' => 'Слишком часто. Подождите.'], 429);
}
if (!hash_equals(UPLOAD_PASSWORD, (string)($_POST['pw'] ?? ''))) {
  json_out(['ok' => false, 'error' => 'Неверное кодовое слово'], 403);
}

// только имя файла, без путей (защита от path traversal)
$file = basename((string)($_POST['file'] ?? ''));
if ($file === '' || strpos($file, '..') !== false) {
  json_out(['ok' => false, 'error' => 'Файл не указан'], 400);
}

// убираем запись из метаданных
$found = false;
$fp = fopen(META_FILE, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
  $meta = json_decode(stream_get_contents($fp), true);
  if (!is_array($meta)) $meta = [];
  $meta = array_values(array_filter($meta, function ($m) use ($file, &$found) {
    if (($m['file'] ?? '') === $file) { $found = true; return false; }
    return true;
  }));
  ftruncate($fp, 0); rewind($fp); fwrite($fp, json_encode($meta, JSON_UNESCAPED_UNICODE));
  fflush($fp); flock($fp, LOCK_UN); fclose($fp);
}

// удаляем сам файл
$path = UPLOAD_DIR . '/' . $file;
if (is_file($path)) @unlink($path);

json_out(['ok' => true, 'deleted' => $file, 'wasInMeta' => $found]);
