<?php
require __DIR__ . '/config.php';

$items = read_meta();
// новые сверху
usort($items, fn($a, $b) => ($b['ts'] ?? 0) <=> ($a['ts'] ?? 0));

// отдаём только существующие файлы
$out = [];
foreach ($items as $it) {
  if (isset($it['file']) && is_file(UPLOAD_DIR . '/' . $it['file'])) {
    $out[] = $it;
  }
}

json_out(['ok' => true, 'count' => count($out), 'items' => $out]);
