<?php
require __DIR__ . '/config.php';

$items = read_meta();
// новые сверху
usort($items, fn($a, $b) => ($b['ts'] ?? 0) <=> ($a['ts'] ?? 0));

// лайки
$likesFile = UPLOAD_DIR . '/_likes.json';
$likes = is_file($likesFile) ? json_decode(file_get_contents($likesFile), true) : [];
if (!is_array($likes)) $likes = [];

// отдаём только существующие файлы
$out = [];
foreach ($items as $it) {
  if (isset($it['file']) && is_file(UPLOAD_DIR . '/' . $it['file'])) {
    $it['likes'] = (int)($likes[$it['file']] ?? 0);
    $out[] = $it;
  }
}

json_out(['ok' => true, 'count' => count($out), 'items' => $out]);
