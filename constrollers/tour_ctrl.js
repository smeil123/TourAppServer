var async = require('async');
var db = require('../lib/dbConnect.js');
var ObjectId = require('mongodb').ObjectID;
var qs = require('querystring');

exports.index = (req,res) =>{
    db.tour.find().limit(5).toArray(function(err, result){
		if(err){
			console.log(err);
			return res.status(400).json({error:'database error'});
		}
		res.status(200).send(result);
	})
}

exports.index_paging = (req,res) =>{
    const cnt = parseInt(req.params.cnt, 10);
	if(!cnt){
		return res.status(400).json({error:'Incorrect page num'});
	}

	db.tour.find().limit(cnt).toArray(function(err, result){
		if(err){
			return res.status(400).json({error:'database error'});
		}
		res.status(200).send(result);
	})
}

exports.area_show = (req,res) =>{
    //수정필요 area to areacode
    
    const area =  req.params.name;
    const cnt =  parseInt(req.params.cnt, 10);
    if(!cnt){
		return res.status(400).json({error:'Incorrect page num'});
	}

    async.waterfall([
        function(callback){
            db.area.findOne({name:area},function(err,areacode){
                if(err){
                    console.log(err);
                    return res.status(400).json({error:'database error'});
                }
                console.log(areacode._id);
                console.log(areacode);
                callback(null,areacode);
            })  
        },
        function(areacode,callback){
            db.tour.find({areacode : String(areacode._id)},{ projection : {readcount : 1, title: 1, areacode:1,mapx:1,mapy:1,title:1}}).limit(cnt).toArray(function(err,result){
                if(err){
                    return res.status(400).json({error:'database error'});
                }
                res.status(200).send(result);
                callback(null,null);
            })
        }
    ],
    function(err,result){
        if(err){
            console.log(err);
        }
    });
    
}

exports.content_show = (req,res) =>{

    const content =  req.params.id;

    db.tour.findOne({contentid : content},function(err,result){
        if(err){
			return res.status(400).json({error:'database error'});
        }
        res.status(200).send(result);
    })
}

exports.title_search = (req,res) =>{
    //수정필요 area to areacode
    const name =  qs.unescape(req.params.name);

    db.tour.find({$text : {$search : name}}).toArray(function(err,result){
        if(err){
            console.log(err);
			return res.status(400).json({error:'database error'});
        }
        res.status(200).send(result);
    })
}
