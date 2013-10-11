<?php

header('Content-type: text/plain');

// Соединение, выбор базы данных
$dbconn = pg_connect("host=localhost dbname=dblogic user=dblogic password=dblogic")
    or die('Could not connect: ' . pg_last_error());

// Выполнение SQL запроса
$query = 'SELECT * FROM find_all_topics()';
$time_start = microtime();
	$result = pg_query($query) or die('Ошибка запроса: ' . pg_last_error());
$time_end = microtime();
$time = $time_end - $time_start;
echo "pg_query took ".$time."ms\n";

$json = pg_fetch_result($result, 0, 0);
echo "JSON size: ".strlen($json)." bytes\n";

// Очистка результата
pg_free_result($result);

// Закрытие соединения
pg_close($dbconn);

