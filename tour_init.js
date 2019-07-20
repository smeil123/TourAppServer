var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;
var db = require('./lib/dbConnect.js');
var key = require('./config/api.json');

exports.init = function(){
    async.waterfall([
        function(callback){
            db.tour.find().count(function(err,count){
                if(err){
                    console.log(err);
                }
                else{
                    if(count>0)
                        console.log('tour content content exist');
                    else{
                        console.log('tour content is created');
                        content_api();
                        db.tour.createIndex({title:"text"})
                    }
                }
                callback(null,null);
            })
        },
        function(pass, callback){
            db.area.find().count(function(err,count){
                if(err){
                    console.log(err);
                }
                else{
                    if(count>0)
                        console.log('areacode content exist');
                    else{
                        console.log('areacode is created');
                        var url = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode?ServiceKey="+
                            key.tourapi.key +
                            "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide";

                        tot_areacode(url,function(tot){
                            area_api(tot);
                        });
                    }
                }
                callback(null,null);
            })
        }
    ])
}

function content_api(){

	var tour_url = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaBasedList?ServiceKey="+
		key.tourapi.key+
		"&contentTypeId=&areaCode=&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=A"
	

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
				parseString(body,function(err,result){
					var totalCount = JSON.parse(result.response["body"][0].totalCount);
					
					callback(null, totalCount);
				});
			});
		},
		function(totalCount,callback){
			
			request({
				url : tour_url + "&numOfRows=" + String(totalCount),
				method : 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			},
			function(error, response, body){
				parseString(body,function(err,result){
					
					var tours = result.response["body"][0].items[0].item;
					for(var i=0; i<tours.length; i++){
						for(key in tours[i]){
							tours[i][key] = tours[i][key][0];
						}
					}
                    db.tour.insertMany(tours);
                    callback(null,null);
				})
					
			});	
		}],
		function(err, massage){
			console.log("db content init done");
		
		});
}

//var truck = Object.assign(car, truckSpecific);
function tot_areacode(url,callback){
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
					callback(0);
				}
				else{
					callback(JSON.parse(result.response["body"][0].totalCount));
				}			
			});
		}
	});

}


function area_api(totnum){
	var url = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode?ServiceKey="+
		key.tourapi.key+
		"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&numOfRows="+totnum;

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

					item._id = JSON.parse(areacode[i].code);                    
					item.name = areacode[i].name[0];

					itemArray.push(item);
				}
				db.area.find().count(function(err,count){
					if(count == 0){
						db.area.insertMany(itemArray);
					}
				});
				db.sigungu.find().count(function(err,count){
					if(count == 0){
						callback(null, itemArray); 
					}
					else{
						callback(null, null); 
					}
				});
				
			} 
		}, 
		function(itemArray, callback){
			if(itemArray == null) callback(null,null,null);
			else{
				var url_array = new Array();
				for(var i =0; i<itemArray.length; i++){ 
				
					url_array[i] = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode?ServiceKey=" 
						+key.tourapi.key
						+"&areaCode=" 
						+itemArray[i]._id 
						+"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide"; 
				}
				callback(null,itemArray, url_array); 
			}
		},
		function(itemArray,urls,callback){
			if(itemArray == null) callback(null,null,null);
			else{
				var sigungu_arr = [];
				var areacodes = [];
				var count = 0;

				urls.map(function(a_url,index){
					tot_areacode(a_url,function(tot){
						count = count+1;

						sigungu_arr.push(a_url+"&numOfRows="+tot);
						areacodes.push(itemArray[index]._id);

						if(urls.length == count){
							callback(null,sigungu_arr,areacodes);
						}
					});				
				});
			}
		}, 
		function(sigungu_arr,areacodes,callback){
			if(sigungu_arr == null) callback(null,null);
			else{			
				var i_count = 0;

				sigungu_arr.map(function(s_item,index){
					request({ 
						url : s_item, 
						method : 'GET', 
						headers: { 
							'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36', 
							'Content-Type': 'application/x-www-form-urlencoded' 
						} 
					},function(error, response, body){ 
						
						if(error){ 
							console.log(error); 
						} 
						else{ 
							parseString(body,function(err,result){ 
                                var items = result.response.body[0].items[0].item;
                                
								for(var j=0; j<items.length; j++){
									delete items[j].rnum;
									items[j].code = parseInt(items[j].code[0], 10);
									items[j].name = items[j].name[0];
									items[j].areacode = areacodes[index];
                                }			
								db.sigungu.find().count(function(err,count){
									i_count = i_count+1;
									if(count == 0){
										db.sigungu.insertMany(items);
									}
								});
								if(i_count == sigungu_arr.length){
									callback(null,null);
								}
							}) 
						} 
					}); 
				});
			}
		}],
	function(err, massage){
		console.log("db area init done");
	}); 
} 