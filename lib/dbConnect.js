var config = require("../config/db.json")

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongodb.host, { useNewUrlParser: true });

const db = {};

client.connect(err => {
    db.users = client.db("test").collection("users");
    db.tour = client.db("test").collection("tour_test");
    db.area = client.db("test").collection("area");
    db.sigungu = client.db("test").collection("sigungu");
    db.record = client.db("test").collection("record");

    console.log("mongodb connect");
});

module.exports = db;