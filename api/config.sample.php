<?php
// ШАБЛОН. Скопируй в config.php на сервере и впиши свой пароль.
// Файл config.php намеренно НЕ в git (репозиторий публичный).

const UPLOAD_PASSWORD = 'ВПИШИ_СВОЁ_КОДОВОЕ_СЛОВО';

const UPLOAD_DIR = __DIR__ . '/../uploads';
const META_FILE  = __DIR__ . '/../uploads/_meta.json';
const MAX_BYTES  = 200 * 1024 * 1024;

const ALLOWED = [
  'jpg'  => 'image', 'jpeg' => 'image', 'png' => 'image', 'gif' => 'image',
  'webp' => 'image', 'heic' => 'image', 'heif' => 'image',
  'mp4'  => 'video', 'mov'  => 'video', 'webm' => 'video', 'm4v' => 'video',
];

function read_meta(): array {
  if (!is_file(META_FILE)) return [];
  $data = json_decode(file_get_contents(META_FILE), true);
  return is_array($data) ? $data : [];
}
function clean_str(?string $s, int $max): string {
  $s = trim((string)$s);
  $s = preg_replace('/[\x00-\x1F\x7F]/u', '', $s);
  $s = strip_tags($s);
  if (mb_strlen($s) > $max) $s = mb_substr($s, 0, $max);
  return $s;
}
function json_out($data, int $code = 200): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}
