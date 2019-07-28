var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;
var db = require('./lib/dbConnect.js');
var api_key = require('./config/api.json').tourapi.key_2;

var start_index = 2300
var end_index = 2600
var limit_flag = true

exports.init = function(){
    async.waterfall([
        function(callback){

            db.tour.find().count(function(err,count){
                if(err){
                    console.log(err);
                }
                else{
                    if(count>=25164)
						console.log('tour content content exist');
					else if(limit_flag)
						console.log("오늘은 더이상 api사용할 수 없음")
                    else{
						console.log('tour content is created');
						// content_detail(null);
                        content_api();
						//db.tour.createIndex({title:"text",addr1:"text"})
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
                            api_key +
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
		api_key+
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
							if(key=="areacode" || key == "contenttypeid" || key == "readcount" || key == "sigungucode" || key == "zipcode" || key == "contentid"){
								tours[i][key] = parseInt(tours[i][key][0]);
							}
							else if(key=="mapx" || key == "mapy"){
								tours[i][key] = parseFloat(tours[i][key][0]);
							}
							else{
								tours[i][key] = tours[i][key][0];								
							}
						}
					}
                    // db.tour.insertMany(tours);
                    callback(null,tours);
				})
					
			});	
		},function(tours,callback){
			var flag = false;
			for(var i=start_index; i<end_index; i++){
				content_detail(tours[i]);
			}
			callback(null,null);
		}	
		],
		function(err, massage){
			console.log("tour db content init done");
		
		});
}

function content_detail(origin_tour){	

	// var contentId = "1614793"
	// var contentType = "12"
	// var origin_tour = new Object();
	var contentId = origin_tour.contentid
	var contentType = origin_tour.contenttypeid
	var tour_url = ["http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailCommon?ServiceKey="
					+api_key
					+"&contentId="
					+contentId
					+"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y"
					,
					"http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailIntro?ServiceKey="
					+api_key
					+"&contentTypeId="
					+contentType
					+"&contentId="
					+contentId
					+"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide"
					,
					// "http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailInfo?ServiceKey="
					// +key.tourapi.key
					// +"&contentTypeId="
					// +contentType
					// +"&contentId="
					// +contentId
					// +"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&listYN=Y"
					// ,
					"http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailImage?ServiceKey="
					+api_key
					+"&contentTypeId="
					+contentType
					+"&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&contentId="
					+contentId
					+"&imageYN=Y"
	]

	var keys = [["homepage","telname","overview","directions"],
		["contentid","contenttypeid","accomcount"], // 2번은 제외할 항목
		["originimgurl","serialnum"]
	]
	async.waterfall([
		function(callback){
			db.tour.find({_id : contentId}).count(function(err,count){
				if(count == 0){
					request({
						url : tour_url[0],
						method : 'GET',
						headers: {
							'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					},
					function(error, response, body){
						var tours = [];
						parseString(body,function(err,result){

							try{
								var items = result.response["body"][0].items[0].item;
							}
							catch(error){
								// limit api key
								console.log(error);
								console.log(tour_url[0]);
								return callback(true,null); //note return here
							}
							for(key in items[0]){
								if(key == keys[0][0] ||key == keys[0][1] || key == keys[0][2] ||key == keys[0][3]){	
									if(items[key] != undefined){
										tours[key] = items[key][0];
									}
								}
							}
							callback(null,tours);
							
						});
					});
				}else{
					return callback(true,null); //note return here
				}
			});
		},
		function(tours,callback){
			request({
				url : tour_url[1],
				method : 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			},
			function(error, response, body){
				parseString(body,function(err,result){
					try{
						var item = result.response["body"][0].items[0].item;
					}
					catch(error){
						console.log(tour_url[1]);
						return callback(true,null);
					}
					for(key in item[0]){
						if(key != keys[1][0] && key != keys[1][1] && key != keys[1][2]){
							if(item[0][key][0] != undefined)
								tours[key] = item[0][key][0];
						}
					}
                    callback(null,tours);
				});
			});
		},
		function(tours,callback){
			request({
				url : tour_url[2],
				method : 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			},
			function(error, response, body){
				parseString(body,function(err,result){

					var images = result.response["body"][0].items[0].item;
					tours['image'] = new Array();

					for(image in images){
						var element =  new Object();
						for(key in images[image]){
							if(key == keys[2][0] ||key == keys[2][1]){
								if(images[image][key] != undefined){
									element[key] = images[image][key][0];
								}
							}
						}
						if(element){
							tours['image'].push(element);
						}
					}
					if(tours['image'].length == 0){
						delete tours['image']
					}
                    callback(null,tours);
				})
					
			});	
		},function(tours,callback){
			const result = Object.assign(origin_tour, tours);
			result["_id"] = result["contentid"];
			delete result["contentid"]
			db.tour.insert(result,function(err){
				if(err){
					console.log("이미 존재함");
				}
			});			
		}
	],
	function(err, massage){		

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
		api_key+
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
						+api_key
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