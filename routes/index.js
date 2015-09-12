var express = require('express');
var router = express.Router();
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = require("./dbConfig.json").url;

var Error = {
  duplicateEmail : "이미 존재하는 이메일입니다."
}

router.get('/', function(req, res, next) {
  console.log(url);
  res.render('index', { title: 'Express',  req: req });
});

router.get('/auth', function(req, res, next){
  var params = new PARAMS(req, 'email', 'password');
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').find(params).toArray(function(err, user){
      if(err) res.sendStatus(500);
      if(!UTIL.isEmpty(user)) req.session.auth = user[0];
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
  var params = new PARAMS(req, 'email', 'password');
	MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').find({email:params.email}).toArray(function(err, user){
      if(UTIL.isEmpty(user)) {
        db.collection('user').insert(params, function(err, inserted){
          if(err) res.sendStatus(500);
          res.sendStatus(200);
          db.close();  
        });
      } else {
        res.json({error:Error.duplicateEmail});
        db.close();
      }
    });
  });
});

router.get('/map', function(req, res){
  var auth = new AUTH(req);
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').find(auth).toArray(function(err, user){
      if(err) res.sendStatus(500);
      res.json({maps:user[0].maps});
      db.close(); 
    });
  });
}); 

router.post('/map', function(req, res){
  var auth = new AUTH(req);
  var year = req.param('year');
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').update(auth, {$push: {maps : {year : year}}}, function(err, updated){
      if(err) res.sendStatus(500);
      res.json({year:year});
      db.close(); 
    });
  }); 
});

router.post('/marker', function(req, res){
  var auth = new AUTH(req);
  var params = new PARAMS(req, 'title', 'description', 'year', 'xPos', 'yPos');
  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').update({email: auth.email, 'maps.year' : params.year}, 
      {$push: {'maps.$.markers' : params}}, function(err, updated){
      if(err) res.sendStatus(500);
      res.json(params);
      db.close(); 
    });
  }); 
})

router.get('/marker', function(req, res){
  var auth = new AUTH(req);
  var year = req.param('year');

  MongoClient.connect(url, function(err, db){
    if(err) res.sendStatus(500);
    db.collection('user').find({email : auth.email}, { maps: {$elemMatch : {'year': year}}}).toArray(function(err, user){
      if(err) res.sendStatus(500);
      res.json({markers: user[0].maps[0].markers});
      db.close(); 
    });
  });  
})

var PARAMS = function(req){
  var params = {};
  for(var i=1;i<arguments.length;i++){
    params[arguments[i]] = req.param([arguments[i]]);
  }
  return params;
}

var AUTH = function(req){
  var email;
  var password;
  if(UTIL.isEmpty(req.session.quth)){
    email = "SHARED_USER";
    password = "SHARED_PASSWORD";
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