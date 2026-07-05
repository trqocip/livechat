<?php

declare(strict_types=1);

function getDatabaseConnection(): PDO
{
   $host = '127.0.0.1';
   $port = 3306;
   $dbName = 'livechat';
   $user = 'root';
   $password = '';

    // $host = 'localhost';
    // $port = 3306;
    // $dbName ='trqocip_chat';
    // $user = 'trqocip_chat';
    // $password = 'jyoge1946';

    $charset = 'utf8mb4';
    
    $dsn = "mysql:host=$host;dbname=$dbName;port=$port;charset=$charset";
    $pdo = new PDO($dsn, $user, $password);

    return $pdo;
}
