var express = require('express');
var router = express.Router();
var moment = require('moment');
var connect = require('../mysqlconnect');


router.get('/', function(req, res, next) {
  res.render('register', {
    title: '新規会員登録'
  });
});

router.post('/',function(req,res,next){
    var usrname=req.body.user_name;
    var passwd = req.body.password;
    var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

    var usrexists;
    connect.query("SELECT * FROM users WHERE name = ?",[usrname],function(error,result,fields){
	if(result.length != 0){
	    res.render("register",{title:"新規会員登録",emailexists:"すでに登録されています"});
	}else{
	    connect.query("INSERT INTO users SET ?",
			  {name:usrname,password:passwd}
			  ,function(err,rows){
			      if(err!==null){
				  throw new Error("db insert err:"+err);
			      }
			      res.redirect('/login');
			  });
	}
    });
});

module.exports=router;
