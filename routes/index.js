var express = require('express');
var router = express.Router();
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://125.209.195.202:27017/test';

var Error = {
  auth : "로그인 먼저 하세요.",
  yearEmpty : "추가할 지도의 연도를 입력하세요."
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express',  req: req });
});

router.get('/auth', function(req, res, next){
  var email = req.param('email');
  var password = req.param('password');
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').find({email: email, password: password}).toArray(function(err, user){
      if(err) res.sendStatus(500);
      if(user.length !== 0) req.session.auth = user[0];
      res.json({user:user[0]});
      db.close(); 
    });
  });
});

router.delete('/auth', function(req, res){
  req.session.destroy();
  res.sendStatus(200);
})
  
router.post('/user', function(req, res){
	var email = req.body.email;
	var password = req.body.password;
	MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').insert({email: email, password: password}, function(err, inserted){
      if(err) res.sendStatus(500);
      res.sendStatus(200);
      db.close();
    });
  });
});

router.get('/map', function(req, res){
  var auth = new AUTH(req);
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').find({email: auth.email, password: auth.password}).toArray(function(err, user){
      if(err) res.sendStatus(500);
      console.log(user[0].maps);
      res.json({maps:user[0].maps});
      db.close(); 
    });
  });
}); 

router.post('/map', function(req, res){
  var year = req.param('year');
  var auth = new AUTH(req);
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').update({email: auth.email}, {$push: {maps : {year : year}}}, function(err, updated){
      if(err) res.sendStatus(500);
      res.json({year:year});
      db.close(); 
    });
  }); 
});

router.post('/marker', function(req, res){
  var title = req.param('title');
  var description = req.param('description');
  var year = req.param('year');
  var xPos = req.param('xPos');
  var yPos = req.param('yPos');
  var auth = new AUTH(req);
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').update({email: auth.email, 'maps.year' : year}, 
      {$push: {'maps.$.markers' : {title : title, description: description, xPos:xPos, yPos:yPos}}}, function(err, updated){
      if(err) res.sendStatus(500);
      res.json({year:year, title:title, description:description, xPos:xPos, yPos:yPos});
      db.close(); 
    });
  }); 
})

router.get('/marker', function(req, res){
  var year = req.param('year');
  var auth = new AUTH(req);
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').find({email : auth.email}, { maps: {$elemMatch : {'year': year}}}).toArray(function(err, user){
      if(err) res.sendStatus(500);
      res.json({markers: user[0].maps[0].markers});
      db.close(); 
    });
  });  
})

var AUTH = function(req){
  var email;
  var password;
  if(UTIL.isEmpty(req.session.quth)){
    email = "SHADRED_USER";
    password = "SHADRED_PASSWORD";
  } else {
    email = req.session.auth.email;
    password = req.session.auth.password;
  }
  return {
    email : email,
    password : password
  }
}

var UTIL = UTIL || {}
UTIL.isEmpty = function(obj){
  if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

module.exports = router;