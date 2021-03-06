<?php

$mysql_connection = 'mysql:host=127.0.0.1;dbname=dblogic;charset=utf8';
$mysql_user = 'root';
$mysql_pass = '';

$pdo = new PDO($mysql_connection, $mysql_user, $mysql_pass);

function get_user($pdo, $id) {
	$statement = $pdo->query("SELECT * FROM user WHERE user_id = ".$pdo->quote($id));
	$row = $statement->fetch(PDO::FETCH_ASSOC);
	return $row;
}

function get_json($pdo) {
	$statement = $pdo->query("SELECT * FROM topic");
	
	$users = array();
	$users_hash = array();
	$topics = array();
	$rows = $statement->fetchAll(PDO::FETCH_ASSOC);
	foreach($rows as $topic) {
		$user_id = $topic["user_id"];
		if(!isset($users_hash[$user_id])) {
			array_push($users, get_user($pdo, $user_id));
			$users_hash[$user_id] = true;
		}
		array_push($topics, $topic);
	}
	$time_start = microtime();
	$json = json_encode(array("topics" => $topics, "users" => $users)/*, JSON_UNESCAPED_UNICODE*/);
	$time_end = microtime();
	$time = $time_end - $time_start;
	echo "JSON encoding took ".$time."ms\n";
	return $json;
}

header('Content-type: text/plain');

echo "JSON size: ".strlen(get_json($pdo))." bytes\n";

