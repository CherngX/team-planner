<?php
require_once __DIR__ . '/config.php';
cors();

$db    = getDB();
$since = isset($_GET['since']) ? (int)$_GET['since'] : 0;
$dt    = date('Y-m-d H:i:s', $since);

$tasks = $db->prepare('SELECT * FROM tasks WHERE updated_at > ?');
$tasks->execute([$dt]);

// rows don't have updated_at — always return full list for simplicity
$rows = $db->query('SELECT * FROM `rows` ORDER BY position, id');

echo json_encode([
    'tasks'     => $tasks->fetchAll(),
    'rows'      => $rows->fetchAll(),
    'server_ts' => time(),
]);
