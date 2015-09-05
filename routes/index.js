var express = require('express');
var router = express.Router();
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://125.209.195.202:27017/test';

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
    if (!UTIL.isEmpty(req.session.auth)) {
    var password = req.session.auth.password;
    var email = req.session.auth.email;
    MongoClient.connect(url, function(err, db){
      if(err) res.sendStatus(500);
      db.collection('user').find({email: email, password: password}).toArray(function(err, user){
        if(err) res.sendStatus(500);
        res.json({user:user[0]});
        db.close(); 
      });
    });
  } else { 
    res.json({});
  }
}); 

router.post('/map', function(req, res){
  if (!UTIL.isEmpty(req.session.auth)) {
    var year = req.param('year');
    var email = req.session.auth.email;
    MongoClient.connect(url, function(err, db){
      if(err) res.sendStatus(500);
      db.collection('user').update({email: email}, {$push: {maps : {year : year}}}, function(err, updated){
        if(err) res.sendStatus(500);
        res.json({year:year});
        db.close(); 
      });
    }); 
  } else{
    res.json({});
  }
});

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