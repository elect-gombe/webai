var express = require('express');
var router = express.Router();
var connection = require('../mysqlconnect');

router.get('/', function(req, res, next) {
    if (req.session.user_id) {
	res.redirect('/');
    } else {
	res.render('login', {
	    title: 'ログイン'
	});
    }
});

router.post('/', function(req, res, next) {
    var user = req.body.user;
    var password = req.body.password;
    connection.query('SELECT id FROM users WHERE name = ? AND password = ? LIMIT 1' ,[ user,password], function(err, rows) {
	if(err!==null){
	    throw new Error("db select err:"+err);
	}
	var id = rows.length? rows[0].id: false;
	if (id) {
	    req.session.userid = id;
	    res.redirect('/');
	} else {
	    res.render('login', {
		title: 'ログイン',
		nouser: 'メールアドレスとパスワードが一致するユーザーはいません'
	    });
	}
    });
});

module.exports = router;
