<?php
require_once __DIR__ . '/config.php';
cors();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = 'SELECT * FROM tasks WHERE 1=1';
        $params = [];
        if (!empty($_GET['from'])) { $sql .= ' AND end_date >= ?';   $params[] = $_GET['from']; }
        if (!empty($_GET['to']))   { $sql .= ' AND start_date <= ?'; $params[] = $_GET['to']; }
        $stmt = $db->prepare($sql . ' ORDER BY row_id, start_date');
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $body = jsonBody();
        $required = ['row_id', 'title', 'start_date', 'end_date'];
        foreach ($required as $f) {
            if (empty($body[$f])) { http_response_code(400); echo json_encode(['error' => "$f required"]); exit; }
        }
        $color = $body['color'] ?? '#4A90D9';
        $type  = in_array($body['task_type'] ?? '', ['task','leave']) ? $body['task_type'] : 'task';
        $stmt  = $db->prepare(
            'INSERT INTO tasks (row_id, title, start_date, end_date, color, task_type) VALUES (?,?,?,?,?,?)'
        );
        $stmt->execute([(int)$body['row_id'], $body['title'], $body['start_date'], $body['end_date'], $color, $type]);
        echo json_encode(['id' => (int)$db->lastInsertId()]);
        break;

    case 'PUT':
        $body = jsonBody();
        $id = (int)($body['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit; }

        $map = ['row_id'=>'int','title'=>'str','start_date'=>'str','end_date'=>'str','color'=>'str','task_type'=>'str'];
        $fields = [];
        $params = [];
        foreach ($map as $col => $cast) {
            if (!array_key_exists($col, $body)) continue;
            if ($col === 'task_type' && !in_array($body[$col], ['task','leave'])) continue;
            $fields[] = "$col = ?";
            $params[] = $cast === 'int' ? (int)$body[$col] : $body[$col];
        }
        if (empty($fields)) { http_response_code(400); echo json_encode(['error' => 'nothing to update']); exit; }
        $params[] = $id;
        $db->prepare('UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        echo json_encode(['ok' => true]);
        break;

    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit; }
        $db->prepare('DELETE FROM tasks WHERE id = ?')->execute([$id]);
        echo json_encode(['ok' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
