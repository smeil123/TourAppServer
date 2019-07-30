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
    const id = req.params.id;

    if (!id.length) {
        res.status(400).json({ error: 'Incorrenct name' });
    }
    db.record.aggregate([
        // Initial document match (uses index, if a suitable one is available)
        { $match: {
            _id : ObjectId(id)
        }},
    
        // Expand the scores array into a stream of documents
        // { $unwind: '$photo' },
    
        // Sort in descending order
        { $sort: {
            'photo.timestamp': 1
        }}]).toArray(function (err, result) {
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
    const photo = req.body.photo || '';
    const review = req.body.review || '';
    
    if (!review.length) {
        res.status(400).json({ error: 'Incorrenct name' });
    }
    if (!photo.length) {
        res.status(400).json({ error: 'Incorrenct uid' });
    }
    const d_min = new Date(Date.parse(photo[0].timestamp))
    const d_max = new Date(Date.parse(photo[0].timestamp))

    for(i in photo){
        const p_d = new Date(Date.parse(photo[i].timestamp))
        if(d_min.getMonth() >= p_d.getMonth() && d_min.getDate() > p_d.getDate()){
            d_min.setFullYear(p_d.getFullYear(), p_d.getMonth(), p_d.getDate());
        }
        if(d_max.getMonth() <= p_d.getMonth() && d_max.getDate() < p_d.getDate()){
            d_max.setFullYear(p_d.getFullYear(), p_d.getMonth(), p_d.getDate());
        }
    }

    const newRecord = {
        user: email,
        photo: photo,
        review: review,
        start_date : d_min,
        end_date : d_max,
        period : d_max.getDate()-d_min.getDate() + 1
    };
    console.log(newRecord);

    db.record.insertOne(newRecord,function(err){
        if(err){
            newRecord["message"] = 1
            res.status(200).json(newRecord);
        }
        else{
            newRecord["message"] = 0
            res.status(200).json(newRecord);
        }
    });
}
