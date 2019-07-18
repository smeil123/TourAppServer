// var MongoClient = require('mongodb').MongoClient;
// var config = require("../config/db.json")

// var db = {};

// console.log('mongoDB 연결 시도');

// MongoClient.connect(config.mongodb.host, function(err, client) {
//     if(err) {
//         console.log(err);
//     }
//     else{
//         console.log('connected to MongoDB');

//         db.test = client.db('local').collection('users');
    
//     }
// });

// module.exports = db;



const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://traveler:traveler!!@cluster-nx8u6.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

const db = {};
client.connect(err => {
    db.test = client.db("test").collection("users");
    db.tour = client.db("test").collection("tour");
    db.areacode = client.db("test").collection("areacode");
    db.sigungu = client.db("test").collection("sigungu");
//   const collection = client.db("test").collection("users");

//   var item ={
//         id : 1
//     };  
//   collection.insert(item,function(err){
//         if(err) console.log(err);
//         console.log("zzzz");
//     });
//   client.close();
});

module.exports = db;