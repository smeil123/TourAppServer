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

exports.area_search = (req,res) =>{
    const area =  req.params.name;
    const page =  parseInt(req.params.page, 10);
    if(page&&!page){
		return res.status(400).json({error:'Incorrect page num'});
	}

    async.waterfall([
        function(callback){
            db.area.findOne({name:area},function(err,areacode){
                if(err){
                    console.log(err);
                    return res.status(400).json({error:'database error'});
                }
                if(areacode==null){
                    res.status(200).send([]);
                    return callback(true,null)
                }
                callback(null,areacode);
            })  
        },
        function(areacode,callback){
            db.tour.find({$or:[{areacode : areacode._id},{addr1:{$regex:area}}]}).skip((page-1)*10).limit(10).toArray(function(err,result){
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
    
    const name =  qs.unescape(req.params.name);
    const page =  parseInt(req.params.page, 10);
    if(page&&!page){
		return res.status(400).json({error:'Incorrect page num'});
	}
    console.log((page-1)*10)
    db.tour.aggregate([{
        $lookup:{
            from:'area', 
            localField:'areacode', 
            foreignField: '_id',
            as:'areacode'
        }
    },
    {
        $match:{title:{$regex:name}
    }}]).skip((page-1)*10).limit(10).toArray(function(err,result){
        if(err){
            console.log(err);
			return res.status(400).json({error:'database error'});
        }
        res.status(200).send(result);
    })
}
