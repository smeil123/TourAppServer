var MongoClient = require('mongodb').MongoClient;
var config = require("../config/db.json")

var db = {};

console.log('mongoDB 연결 시도');

MongoClient.connect(config.mongodb.host, function(err, client) {
    if(err) {
        console.log(err);
    }

    console.log('connected to MongoDB');

});

module.exports = db;


