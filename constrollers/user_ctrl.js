var async = require('async');
var db = require('../lib/dbConnect.js');
var ObjectId = require('mongodb').ObjectID;

var qs = require('querystring');

exports.basicAPI = (req,res) => {
    res.status(200).json({
        "success" : true
    });
}

exports.failAPI = (req,res,err) =>{
    res.status(400).json({
        success : false,
        error : err
    })
}

exports.index = (req,res) =>{
    db.users.find().toArray(function(err,result){
        if(err){
          console.log(err);
          return res.status(400).json({error:'database error'});
        }
       return res.status(200).send(result);
    });
}

exports.show = (req,res) =>{
    db.users.findOne ({_id:req.params.uid},function(err,result){
        if(err){
          res.status(400).json({error:'database error'}); 
        }
        if(!result){
          res.status(400).json({error:'Unknown user'}); 
        }
        res.status(200).send(result);
      });
}

exports.create = (req,res) =>{
const name = req.body.name || '';
  const uid = req.body.uid || '';
  
  if(!name.length){
    res.status(400).json({error: 'Incorrenct name'});
  }
  if(!uid.length){
    res.status(400).json({error: 'Incorrenct uid'});
  }

  const newUser = {
    _id: uid,
    name: name
  };
  
  db.users.insertOne(newUser);

  res.status(200).json(newUser);
}
