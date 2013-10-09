<?php

// Соединение, выбор базы данных
$dbconn = pg_connect("host=localhost dbname=dblogic user=root password=")
    or die('Could not connect: ' . pg_last_error());

// Выполнение SQL запроса
$query = 'SELECT * FROM find_all_topics()';
$result = pg_query($query) or die('Ошибка запроса: ' . pg_last_error());

header('Content-type: text/json');
echo pg_fetch_result($result, 0, 0);

// Очистка результата
pg_free_result($result);

// Закрытие соединения
pg_close($dbconn);

