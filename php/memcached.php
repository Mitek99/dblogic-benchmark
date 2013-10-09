<?php

$mysql_connection = 'mysql:host=127.0.0.1;dbname=dblogic;charset=utf8';
$mysql_user = 'root';
$mysql_pass = '';

$pdo = new PDO($mysql_connection, $mysql_user, $mysql_pass);

$memcache = new Memcache;
$memcache->connect('localhost', 11211) or die ("Не могу подключиться");

function get_user($pdo, $memcache, $id) {
	$cache_key = 'dblogic_user'.$id;
	$cached = $memcache->get($cache_key);
	if(!$cached) {
		$statement = $pdo->query("SELECT * FROM user WHERE user_id = ".$pdo->quote($id));
		$row = $statement->fetch(PDO::FETCH_ASSOC);
		$memcache->set($cache_key, $row);
		return $row;
	} 
	return $cached; 
}

function get_json($pdo, $memcache) {
	$statement = $pdo->query("SELECT * FROM topic limit 100");
	
	$users = array();
	$users_hash = array();
	$topics = array();
	$rows = $statement->fetchAll(PDO::FETCH_ASSOC);
	foreach($rows as $topic) {
		$user_id = $topic["user_id"];
		if(!isset($users_hash[$user_id])) {
			array_push($users, get_user($pdo, $memcache, $user_id));
			$users_hash[$user_id] = true;
		}
		array_push($topics, $topic);
	}
	return json_encode(array("topics" => $topics, "users" => $users));
}

header('Content-type: text/json');

echo get_json($pdo, $memcache);
