
/**
 * Module dependencies.
 */

var express = require('express'),
 	redis 	= require('redis'),
 	mysql      		= require('mysql'),
    async           = require('async');

var db = redis.createClient();
var app = express();

var get_script = '\
	local ids = redis.call("ZRANGE", "topics", 0, 4000)\
	local res = {}\
    for pos, id in ipairs(ids) do\
        table.insert(res, cmsgpack.unpack(redis.call("HGET", "topic_values", id)))\
    end\
    return cjson.encode({["topics"] = res})\
';

var import_script = '\
	local topic = cjson.decode(ARGV[1])\
	local id = topic.topic_id\
	redis.log(redis.LOG_WARNING, "topic_id="..id)\
	redis.call("ZADD", "topics", 0, id)\
	redis.call("HSET", "topic_values", id, cmsgpack.pack(topic))\
';

app.get('/', function(req, res) {
  	db.eval(get_script, 0, function(err, obj) {
		if(err) {
			res.send("REDIS ERROR: " + err);
		} else {
			res.send(obj);
		}		
	});
});

app.get('/import', function(req, res) {

	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : '',
	});

	connection.connect();
	connection.query('USE dblogic'); // Выполняем запрос на выбор БД   

	connection.query('SELECT * FROM topic', function(error, result, fields) {
        async.each(result, function(topic, done) {
        	db.eval(import_script, 0, JSON.stringify(topic), function(err, obj) {
				if(err) done(err); else done();	
			});
        }, function(err) {
            res.send("REDIS ERROR: " + err);
            connection.end();
        });
	});
});
app.listen(3000);

