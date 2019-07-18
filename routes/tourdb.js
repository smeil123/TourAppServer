var express = require('express');
var router = express.Router();

var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;

var db = require('../lib/dbConnect.js');
var ObjectId = require('mongodb').ObjectID;

var api_key = "nGuprgZzZSa%2BDCr4Ts0sc8qiGJt%2Fkwd19E68LtgUqL6FUGiWRiKzR4s7thkznu%2B9HCQCo5RI%2BIG%2FALNC7fNOqQ%3D%3D"


function apiget(){

	var tour_url = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaBasedList?ServiceKey="+
		api_key +
		"&contentTypeId=&areaCode=&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=12"
	var pageno = 1

	tour_url = tour_url + "&pageNo=" + String(pageno)

	async.waterfall([
		function(callback){
			request({
				url : tour_url,
				method : 'GET',
				headers: {
			        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
			        'Content-Type': 'application/x-www-form-urlencoded'
			    }
			},
			function(error, response, body){
				console.log("check2");

				if(error){
					console.log(error);
					callback(null,null);
				}
				else{
					console.log("check3");
					parseString(body,function(err,result){
						// stringify는 json to string
						// console.log(JSON.stringify(result));

						// console.log(result.response["body"]);
						// console.log(JSON.stringify(result.response["body"][0].items[0].item));
						// console.log(result.response["body"][0].items[0].item[0].areacode);
						// console.log(JSON.stringify(result.response["body"][0].items[0].item[0].areacode));
						// console.log(result.response["body"][1].items);
						// console.log(result.response.body.items);
						// console.log(result.response.body.items.item[1]);
						// console.log(result.response.body.items.item[1].areacode);
						callback(null,result.response["body"][0].items[0].item);			
					})
				}
			});
		},
		function(tour,callback){
			console.log(tour.length);
				if(tour.length>0){
					// for (var i = 0; i < tour.length; i++) {
	                //     console.log(i);
	                //     //console.log(tour[i]);
					// }
					// console.log(tour);
					db.test.insertMany(tour);

				}
		}
	])
}

//var truck = Object.assign(car, truckSpecific);
function pageno_areacode(callback){
	var url = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode?ServiceKey="+
		api_key +
		"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide";
	var pageno = 0;

	request({
		url : url,
		method : 'GET',
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	},
	function(error, response, body){
		if(error){
			console.log(error);
		}
		else{
			parseString(body,function(err,result){
				if(err){
					console.log(err);

					callback(pageno);
				}
				else{
					console.log(JSON.parse(result.response["body"][0].totalCount));
					var totalCount = JSON.parse(result.response["body"][0].totalCount);
					pageno = Math.ceil(totalCount/10);

					callback(pageno);
				}			
			});
		}
	});

	

}

function areacodeget(pageno){
	var url = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode?ServiceKey="+
		api_key +
		"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&pageNo="+pageno;
	
	console.log(url);
	async.waterfall([
		function(callback){
			request({
				url : url,
				method : 'GET',
				headers: {
			        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
			        'Content-Type': 'application/x-www-form-urlencoded'
			    }
			},
			function(error, response, body){

				if(error){
					console.log(error);
					callback(null,null);
				}
				else{
					parseString(body,function(err,result){
						callback(null,result.response["body"][0].items[0].item);			
					})
				}
			});
		},
		function(areacode,callback){
			
			if(areacode.length>0){
				var itemArray = new Array();
				
				for(var i = 0; i<areacode.length; i++){
					var item = new Object();

					item.code = JSON.parse(areacode[i].code);
					item.name = JSON.stringify(areacode[i].name[0]);

					itemArray.push(item);
				}
				db.areacode.insertMany(itemArray);
			}
		}
	])
}


router.get('/', function(req, res, next) {
	// console.log(db);
	//모든 관광지 정보 
	apiget();
	db.test.insert(item,function(err){
		if(err) console.log(err);
	});
	  
});

router.get('/areacode',function(req,res,next){
	
	async.waterfall([
		function(callback){
			console.log("pageno_areacode");
			pageno_areacode(function(pagenum){
				console.log("pagenum=",pagenum);
				for (var i = 1; i <= pagenum; i++) {
					areacodeget(i);
				}				
			});
		},
		
	])
	
});

module.exports = router;
