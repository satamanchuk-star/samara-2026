<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_out(['ok' => false, 'error' => 'POST only'], 405);
}

if (!rate_limit('up', 40, 600)) {
  json_out(['ok' => false, 'error' => 'Слишком много загрузок подряд. Подождите минуту.'], 429);
}

// --- проверка пароля ---
$pw = $_POST['pw'] ?? '';
if (!hash_equals(UPLOAD_PASSWORD, (string)$pw)) {
  json_out(['ok' => false, 'error' => 'Неверное кодовое слово'], 403);
}

if (empty($_FILES['files'])) {
  json_out(['ok' => false, 'error' => 'Файлы не пришли'], 400);
}

$author  = clean_str($_POST['author']  ?? '', 40);
$caption = clean_str($_POST['caption'] ?? '', 200);
if ($author === '') $author = 'Аноним';

if (!is_dir(UPLOAD_DIR)) {
  @mkdir(UPLOAD_DIR, 0755, true);
}

// нормализуем структуру $_FILES['files'] (массив)
$files = $_FILES['files'];
$added = [];
$errors = [];
$n = is_array($files['name']) ? count($files['name']) : 0;

for ($i = 0; $i < $n; $i++) {
  if ($files['error'][$i] !== UPLOAD_ERR_OK) {
    $errors[] = 'Ошибка загрузки файла';
    continue;
  }
  $size = (int)$files['size'][$i];
  if ($size <= 0 || $size > MAX_BYTES) {
    $errors[] = 'Файл слишком большой (макс 200 МБ)';
    continue;
  }
  $orig = $files['name'][$i];
  $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
  if (!isset(ALLOWED[$ext])) {
    $errors[] = "Тип .$ext не поддерживается";
    continue;
  }
  $kind = ALLOWED[$ext];

  // проверка реального MIME
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $files['tmp_name'][$i]);
  finfo_close($finfo);
  $mimeOk = ($kind === 'image' && str_starts_with($mime, 'image/'))
         || ($kind === 'video' && str_starts_with($mime, 'video/'))
         || ($ext === 'heic' || $ext === 'heif'); // heic иногда отдаётся как octet-stream
  if (!$mimeOk) {
    $errors[] = 'Файл не похож на фото/видео';
    continue;
  }

  // безопасное уникальное имя (никаких .php и путей)
  $name = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
  $dest = UPLOAD_DIR . '/' . $name;

  if (!move_uploaded_file($files['tmp_name'][$i], $dest)) {
    $errors[] = 'Не удалось сохранить файл';
    continue;
  }
  @chmod($dest, 0644);

  $added[] = [
    'file'    => $name,
    'type'    => $kind,
    'author'  => $author,
    'caption' => $caption,
    'ts'      => time(),
  ];
}

if (!$added) {
  json_out(['ok' => false, 'error' => $errors[0] ?? 'Ничего не загружено'], 400);
}

// --- атомарно дописываем метаданные ---
$fp = fopen(META_FILE, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
  $raw = stream_get_contents($fp);
  $meta = json_decode($raw, true);
  if (!is_array($meta)) $meta = [];
  foreach ($added as $a) $meta[] = $a;
  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($meta, JSON_UNESCAPED_UNICODE));
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
}

json_out(['ok' => true, 'added' => count($added), 'items' => $added, 'errors' => $errors]);
