var async = require('async');
var db = require('../lib/dbConnect.js');
var ObjectId = require('mongodb').ObjectID;

var qs = require('querystring');

exports.index = (req, res) => {
  db.users.find().toArray(function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'database error' });
    }
    return res.status(200).send(result);
  });
}

exports.show = (req, res) => {
  const email = req.params.email;

  if (!email.length) {
    res.status(400).json({ error: 'Incorrenct name' });
  }

  db.users.findOne({ _id: email }, function (err, result) {
    if (err) {
      res.status(400).json({ error: 'database error' });
    }
    if (!result) {
      res.status(400).json({ error: 'Unknown user' });
    }
    res.status(200).send(result);
  });
}

exports.create = (req, res) => {
  const email = req.body.email;
  const accessToken = req.body.accessToken || '';
  const nickname = req.body.nickname || '';


  if (!email.length) {
    res.status(400).json({ error: 'Incorrenct name' });
  }
  if (!accessToken.length) {
    res.status(400).json({ error: 'Incorrenct uid' });
  }
  if (!nickname.length) {
    nickname = "무서운바지"
  }

  // 이미 회원가입 되어있는지 확인
  db.users.find({ _id: email }).count(function (err, count) {
    if (err)
      console.log(err);
    else {
      if (count == 0) {
        const newUser = {
          _id: email,
          accessToken: accessToken,
          nickname: nickname
        };

        db.users.insertOne(newUser);

        newUser["message"] = 0
        res.status(200).json(newUser);
      }
      else {
        const message = {
          message: 1
        }
        res.status(200).json(message);
      }
    }
  })


}
