<?php
header("Content-Type: application/json; charset=utf-8");

require_once 'db.php';
$pdo = getDatabaseConnection();

$stmt = $pdo->query("SELECT id, user_name, message, created_at FROM messages ORDER BY id ASC");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
