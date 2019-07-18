var connect = require('./mysqlconnect');

module.exports = function(req, next) {
    var id = req.session.userid;
    var res;
    if (id) {
	connect.query('SELECT id, name FROM users WHERE ?', {id:id}, function(err, rows) {
	    if (err===null) {
		res = rows.length? rows[0]: false;
	    }
	    next(res);
	});
    }else{
	next(res);
    }
};
