
/**
 * Module dependencies.
 */

var express = require('express'),
 	redis 	= require('redis'),
 	mysql      		= require('mysql'),
    async           = require('async');

var db = redis.createClient();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
});

connection.connect();
connection.query('USE dblogic'); // Выполняем запрос на выбор БД   

var app = express();

var get_script = '\
	local ids = redis.call("ZRANGE", "topics", 0, 4000)\
	local loaded_user_ids = {}\
	local topics = {}\
	local users = {}\
    for pos, id in ipairs(ids) do\
        local topic = cmsgpack.unpack(redis.call("HGET", "topic_values", id))\
        table.insert(topics, topic)\
    	local user_id = topic.user_id\
    	if loaded_user_ids[user_id] == nil then\
			loaded_user_ids[id] = true\
			local user = cmsgpack.unpack(redis.call("HGET", "user_values", user_id))\
			table.insert(users, user)\
		end\
    end\
    return cjson.encode({["topics"] = topics, ["users"] = users})\
';

var import_script = '\
	local obj = cjson.decode(ARGV[1])\
	local entity = ARGV[2]\
	local id = ARGV[3]\
	redis.call("ZADD", entity.."s", 0, id)\
	redis.call("HSET", entity.."_values", id, cmsgpack.pack(obj))\
';

app.get('/', function(req, res) {
  	db.eval(get_script, 0, function(err, obj) {
		if(err) {
			res.send("REDIS ERROR: " + err);
		} else {
			res.set('Content-Type', 'text/plain');
			res.send("JSON length " + obj.length + " bytes");
		}		
	});
});

app.get('/import', function(req, res) {
	connection.query('SELECT * FROM topic', function(error, result, fields) {
        async.each(result, function(topic, done) {
        	db.eval(import_script, 0, JSON.stringify(topic), "topic", topic.topic_id, function(err, obj) {
				if(err) done(err); else done();	
			});
        }, function(err) {
            res.send("REDIS ERROR: " + err);
        });
        connection.query('SELECT * FROM user', function(error, result, fields) {
	        async.each(result, function(user, done) {
	        	db.eval(import_script, 0, JSON.stringify(user), "user", user.user_id, function(err, obj) {
					if(err) done(err); else done();	
				});
	        }, function(err) {
	            res.send("REDIS ERROR: " + err);
	        });
		});
	});
	
});
app.listen(3000);

