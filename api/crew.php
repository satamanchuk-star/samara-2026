<?php
require __DIR__ . '/config.php';
$CREW = __DIR__ . '/../uploads/_crew.json';

function crew_read($f){ if(!is_file($f)) return []; $d=json_decode(file_get_contents($f),true); return is_array($d)?$d:[]; }
function crew_write($f,$d){
  $fp=fopen($f,'c+');
  if($fp && flock($fp,LOCK_EX)){ ftruncate($fp,0); rewind($fp); fwrite($fp,json_encode($d,JSON_UNESCAPED_UNICODE)); fflush($fp); flock($fp,LOCK_UN); fclose($fp); }
}

$action = $_POST['action'] ?? $_GET['action'] ?? 'list';

if ($action === 'list') {
  json_out(['ok'=>true,'items'=>crew_read($CREW)]);
}

if ($action === 'add') {
  $name = clean_str($_POST['name'] ?? '', 40);
  if ($name === '') json_out(['ok'=>false,'error'=>'Введи имя'],400);
  $emoji = clean_str($_POST['emoji'] ?? '', 8);
  $note  = clean_str($_POST['note'] ?? '', 80);
  $crew = crew_read($CREW);
  // обновляем существующего по имени, не плодим дубли
  foreach ($crew as &$c) {
    if (mb_strtolower($c['name']) === mb_strtolower($name)) {
      if ($emoji) $c['emoji']=$emoji;
      if ($note)  $c['note']=$note;
      crew_write($CREW,$crew);
      json_out(['ok'=>true,'items'=>$crew,'updated'=>true]);
    }
  }
  unset($c);
  if (count($crew) >= 60) json_out(['ok'=>false,'error'=>'Список переполнен'],400);
  $crew[] = ['id'=>bin2hex(random_bytes(4)),'name'=>$name,'emoji'=>$emoji?:'🧑','note'=>$note,'ts'=>time()];
  crew_write($CREW,$crew);
  json_out(['ok'=>true,'items'=>$crew]);
}

if ($action === 'remove') {
  if (!hash_equals(UPLOAD_PASSWORD, (string)($_POST['pw'] ?? ''))) json_out(['ok'=>false,'error'=>'Нужно кодовое слово'],403);
  $id = $_POST['id'] ?? '';
  $crew = array_values(array_filter(crew_read($CREW), fn($c)=>($c['id']??'')!==$id));
  crew_write($CREW,$crew);
  json_out(['ok'=>true,'items'=>$crew]);
}

json_out(['ok'=>false,'error'=>'unknown action'],400);
