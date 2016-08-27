
exports.mysql_pool = function(mysql) {

	var pool = mysql.createPool({
	    connectionLimit: 150,
	    host: '127.0.0.1',
	    user: 'root',
	    password: 'raviewme5',
	    database: 'mydb'
	});

	return pool;

}