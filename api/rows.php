<?php
require_once __DIR__ . '/config.php';
cors();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $db->query('SELECT * FROM `rows` ORDER BY position, id');
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $body = jsonBody();
        $name  = trim($body['name'] ?? '');
        $color = $body['color'] ?? '#4A90D9';
        if ($name === '') { http_response_code(400); echo json_encode(['error' => 'name required']); exit; }
        $pos = (int)$db->query('SELECT COALESCE(MAX(position),0)+1 FROM `rows`')->fetchColumn();
        $stmt = $db->prepare('INSERT INTO `rows` (name, color, position) VALUES (?, ?, ?)');
        $stmt->execute([$name, $color, $pos]);
        $id = (int)$db->lastInsertId();
        echo json_encode(['id' => $id, 'name' => $name, 'color' => $color, 'position' => $pos]);
        break;

    case 'PUT':
        $body = jsonBody();
        $id = (int)($body['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit; }

        $fields = [];
        $params = [];
        if (isset($body['name']))     { $fields[] = 'name = ?';     $params[] = trim($body['name']); }
        if (isset($body['color']))    { $fields[] = 'color = ?';    $params[] = $body['color']; }
        if (isset($body['position'])) { $fields[] = 'position = ?'; $params[] = (int)$body['position']; }

        if (empty($fields)) { http_response_code(400); echo json_encode(['error' => 'nothing to update']); exit; }

        // Batch reorder: if 'rows' key present, update all positions atomically
        if (isset($body['rows']) && is_array($body['rows'])) {
            $upd = $db->prepare('UPDATE `rows` SET position = ? WHERE id = ?');
            foreach ($body['rows'] as $r) {
                $upd->execute([(int)$r['position'], (int)$r['id']]);
            }
            echo json_encode(['ok' => true]);
            break;
        }

        $params[] = $id;
        $db->prepare('UPDATE `rows` SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        echo json_encode(['ok' => true]);
        break;

    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit; }
        $db->prepare('DELETE FROM `rows` WHERE id = ?')->execute([$id]);
        echo json_encode(['ok' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
