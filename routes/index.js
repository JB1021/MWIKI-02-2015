var express = require('express');
var router = express.Router();
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://125.209.195.202:27017/test';

app.get('/user', function(req, res){
	res.send("1111");
})

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/user', function(req, res){
	var email = req.body.email;
	var password = req.body.password;
	MongoClient.connect(url, function(err, db){
      if(err) res.sendStatus(500);
      db.collection('user').insert({email: email, password: password}, function(err, inserted){
        if(err){
          res.sendStatus(500);
        }
        res.sendStatus(200);
        db.close();
      });
    });
});

module.exports = router;