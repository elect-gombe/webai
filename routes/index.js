var moment = require('moment');
moment.locale('ja');
var connect = require('../mysqlconnect');
var getuser = require('../setuser');

var express = require('express');
var sharp = require('sharp');
var multer = require('multer');

var fs = require('fs')

var router = express.Router();
var upload = multer({ dest: './public/images/uploads/' }).single("imagefile");

/* GET home page. */
router.get('/', function(req, res, next) {
    getuser(req,function(res2){
	var res3;
	//Get board information including date, feature, and sort by date up to 20 images
	connect.query('SELECT link, date, feature,DATE_FORMAT(date, \'%Y/%m/%d %k:%i:%s +0900\') AS date FROM pictures WHERE ? ORDER BY date DESC LIMIT 20', {userid:req.session.userid}, function(err, rows) {
	    if (err===null) {
		res3 = rows;
	    }else{
		throw new Error("db select err:"+err);
	    }
	    res.render('index', {
		user:res2,
		title: "AI Clothes image Analyzer",
		pics:res3
	    });
	});
    });
});

router.post('/',function(req,res,next){
    upload(req,res,function(err){
	if(err){
	    throw new Error("faild to upload:"+err);
	}else{
	    var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
	    if(req.file){
		sharp(req.file.path).resize(400, 400).toBuffer(function (err, buf) {
		    if (err)	throw new Error("faild to resize:"+err);
		    fs.writeFileSync(req.file.path, buf);
		});
		//Store images
		connect.query('INSERT INTO pictures SET ?', {link:req.file.path.slice("public/".length),date:createdAt,feature:req.body.feature,userid:req.session.userid}, function(err, rows) {
		    if(err){
			if (err)	throw new Error("db insert error:"+err);
		    }
		    res.redirect('/');
		});
	    }else{
		res.redirect('/');
	    }	    
	}
    });
});

module.exports = router;
