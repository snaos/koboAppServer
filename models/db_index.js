var mysql = require('mysql');
var fs = require('fs-extra');
var async = require('async');

var db = require('./db_setting');

var pool =  db.mysql_pool(mysql);

var page_size = 10;
var ip = 'http://54.65.222.144'
var mainPath = '/home/ubuntu';
var workshopPath = mainPath + '/workshop/';
var serverPath = '/workshop/public';
var instaPath = workshopPath+'public/insta/';
var categoryPath = workshopPath + 'public/category/';

exports.categoryList = function(callback) {
	var callbackDatas = {
		"success" : 1
	};
	pool.getConnection(function(conErr, conn) {
			if(conErr) {
				console.error('conErr = ', conErr );
				callbackDatas.message = "get Connection error";
				callbackDatas.results = [];
				callback(callbackDatas);
			} else {
				var categoryListSQL = 'SELECT CATEGORY_NO AS categoryNum, CATEGORY_NM categoryName, IMAGE_PATH AS categoryPath FROM CATEGORY ORDER BY CATEGORY_NO';
				conn.query(categoryListSQL, function(categorySQLErr, categoryRow){
					if(categorySQLErr){
						console.error('categorySQLErr = ',categorySQLErr);
						callbackDatas.message = "category sql error";
						callbackDatas.results = [];
						conn.release();
						callback(callbackDatas);
					} else {
						categoryRow.pop();
						callbackDatas.message = "category list success";
						callbackDatas.results = categoryRow;
						conn.release();
						callback(callbackDatas);
					}
				})
			}
	})
}

//이전에 arealist 뿌려주던 곳. 현재는 사용 x
exports.areaList = function (callback) {
	var results = {};
	pool.getConnection( function (connErr, conn) {
		if (connErr) {
			console.error('connErr = ', connErr);
			results.success =1 ;
			results.message = 'get Connection error';
			results.results = {};
			callback(results);
		} else {
			var areaSQL = 'SELECT AREA_NO AS area1Num, AREA_NM AS area1Name FROM WORKSHOP_AREA1 order by AREA_NM';
			var area2SQL = 'SELECT AREA2_NO AS area2Num, AREA2_NM AS area2Name, WORKSHOP_AREA1_NO AS area1Num FROM WORKSHOP_AREA2 order by AREA2_NM ';
			var area3SQL = 'SELECT AREA3_NO AS area3Num, AREA3_NM AS area3Name, WORKSHOP_AREA2_NO AS area2Num FROM WORKSHOP_AREA3 order by AREA3_NM ';
			conn.query(areaSQL, function (a1Err, a1Row) {
				conn.query(area2SQL, function (a2Err, a2Row) {
					conn.query (area3SQL, function (a3Err, a3Row) {
						results.success = 1;
						results.message = "area list success";
						results.results = {};
						results.area1 = a1Row;
						results.area2 = a2Row;
						results.area3 = a3Row;
						conn.release();
						callback(results);
					});
				});
			});
		}
	});
}

//현재 area list 뿌려주는 함수.
exports.areaList2 = function (callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if (connErr) {
			console.error('connErr = ', connErr);
			results.success =1 ;
			results.message = 'get Connection error';
			results.results = {};
			callback(results);
		} else {
			var a1SQL = 'SELECT AREA_NO AS area1Num, AREA_NM AS area1Name FROM WORKSHOP_AREA1 order by AREA_NM';
			conn.query(a1SQL, function (a1Err, a1Row) {
				if(a1Err) {
					console.error('a1Err = ',a1Err);
					results.message = 'area1 sql error';
					results.results = {};
					results.success = 1;
					conn.release();
					callback(results);
				} else {
					async.each(a1Row, function (area1, callback){
						var a2SQL = 'SELECT AREA2_NO AS area2Num, AREA2_NM AS area2Name FROM WORKSHOP_AREA2 WHERE WORKSHOP_AREA1_NO=? order by AREA2_NM ';
						conn.query(a2SQL, area1.area1Num, function (a2Err, a2Row) {
							area1.area2 = a2Row;
							callback();
						});
					}, function (err){
						results.success = 1;
						results.results = a1Row;
						results.message = 'area list success';
						conn.release();
						callback(results);
					});
				}
			});
		}
	});
}

//var datas = [user_id, area3Name];
exports.areaWorkshop = function (datas, callback) {
	var results = {};
	pool.getConnection( function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr);
			results.success =1 ;
			results.message = 'get Connection error';
			results.results = [];
			callback(results);
		} else {
			var awSQL = 'SELECT WORKSHOP_NO AS workshopNum, USER_USER_ID AS userId, WORKSHOP_NM AS workshopName, DESCRIPTION AS description, WORKSOP_THUMBNAIL AS thumbnailPath, WORKSHOP_PRICE AS price, CATEGORY_NM AS category, LOCATION AS location, AREA_NM AS area1, AREA2_NM AS area2, AREA3_NM AS area3, (SELECT COUNT(*) FROM RECOMMEND WHERE WORKSHOP_WORKSHOP_NO = workshopNum AND USER_USER_ID = ?) AS likeStatus, CLASS.CLASS_NM AS className, CLASS.CLASS_IMAGE AS classImage FROM WORKSHOP, CLASS, CATEGORY, WORKSHOP_AREA1, WORKSHOP_AREA2, WORKSHOP_AREA3 WHERE WORKSHOP.CATEGORY_CATEGORY_NO = CATEGORY.CATEGORY_NO AND WORKSHOP.AREA_NO = WORKSHOP_AREA1.AREA_NO AND WORKSHOP.AREA2_NO = WORKSHOP_AREA2.AREA2_NO AND WORKSHOP.AREA3_NO = WORKSHOP_AREA3.AREA3_NO AND WORKSHOP_AREA3.AREA3_NM=? AND CLASS.CLASS_NO=WORKSHOP.CLASS_NO';
			conn.query(awSQL, datas, function (awErr, awRow) {
				if(awErr) {
					console.error('awErr = ', awErr);
					results.success = 1;
					results.message = "area workshop sql error";
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success= 1;
					results.message = 'area workshop list success';
					results.results = awRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}


exports.insta = function (page, callback) {
	var results = {};
	pool.getConnection( function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr);
			results.success =1 ;
			results.message = 'get Connection error';
			results.results = [];
			callback(results);
		} else {
			var iSQL = 'SELECT INSTA_BOARD_NO AS instaBoardNum, REPRESENT_PATH AS representPath FROM INSTA_BOARD';
			conn.query(iSQL, function (iErr, iRow) {
				if(iErr) {
					console.error('iErr = ', iErr);
					results.success = 1;
					results.message = "insta sql error";
					results.results = [];
					conn.release();
					callback(results);
				} else {
					var total_cnt = iRow.length;
					var total_page = Math.ceil(total_cnt / page_size);
					var start_num = (page-1)*page_size;
					var end_num = (page * page_size) -1;
					results.results = [];
					if(page == 1 && total_page > 0){ //첫페이지
						var pageData = [];
						for(var i = 0; (i<page_size) && i< (total_cnt);i++){
							pageData[i] = iRow[i];
						}
						results.results = pageData;
						results.message = "insta success";
						conn.release();
						callback(results);
					} else if (page > total_page || total_page == 0){ //페이지가 없음
							conn.release();
							results.message = "page over";
							results.success = 1;
							results.results = [];
							callback(results);
					} else {
						var pageData = [];
						if(end_num > total_cnt){
							end_num = total_cnt-1;
						}
						for(var i = 0; i<end_num -start_num+1; i++){
							pageData[i] = iRow[i+start_num];
						}
						results.results = pageData;
						results.message = "insta success";
						conn.release();
						callback(results);
					}
				}
			});
		}
	});
}

//image = files.
exports.instaUp = function (image, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if (connErr) {
		    console.error('conErr = ', conErr);
		    reuslts.success = 1;
		    results.message = "get Connection error";
		    results.results = {};
		    conn.release();
		    callback(results);
		} else {
			if (image.path) {   //이미지가 하나일 경우 바로 image가 객체로 들어오므로 객체의 path를 확인해 봄
				var rPath = workshopPath+image.path;
				fs.move(rPath,instaPath+image.name, function (moveErr) {
					if(moveErr) {
						console.error('moveErr = ', moveErr);
						results.message = 'file move error';
						results.success = 1;
						results.results = {};
						conn.release();
						callback(results);
					} else {
						var ibSQL = 'INSERT INTO INSTA_BOARD(REPRESENT_PATH) VALUES(?)';
						conn.query(ibSQL, ip+'/insta/'+image.name, function (ibErr, iRow) {
							if(ibErr) {
								console.error('ibErr = ', ibErr);
								results.success = 1;
								results.message = "insta board insert sql error";
								results.results = [];
								conn.release();
								callback(results);
							} else {
								var ibnSQL = 'SELECT INSTA_BOARD_NO FROM INSTA_BOARD WHERE REPRESENT_PATH=?';
								conn.query(ibnSQL, ip+'/insta/'+image.name, function (ibnErr, ibnRow) {
									if(ibnErr) {
										console.error('ibnErr = ', ibnErr);
										results.success = 1;
										results.message = "insta board select sql error";
										results.results = [];
										conn.release();
										callback(results);
									} else {
										var iiSQL = 'INSERT INTO INSTA(INSTA_PATH, INSTA_BOARD_NO) VALUES(?,?)';
										conn.query(iiSQL, [ip+'/insta/'+image.name, ibnRow[0].INSTA_BOARD_NO], function (iiErr, iiRow) {
											if(iiErr) {
												console.error('iiErr = ', iiErr);
												results.success = 1;
												results.message = "insta insert sql error";
												results.results = [];
												conn.release();
												callback(results);
											} else {
												results.success = 1;
												results.message = 'insta insert success';
												conn.release();
												callback(results);
											}
										});
									}
								});
							}
						});
					}
				});
			} else if (image) { //이미지가 여러개일 경우 배열 형태이므로, 앞에서 객체확인을 했을때는 if문에 진입하지 않음. 그렇지만 image가 undefined가 아니기 때문에 진입
				async.each(image, function (item, callback) {
					var rPath = workshopPath+item.path;
					fs.move(rPath,instaPath+item.name, function (moveErr) {
						if(moveErr) {
							console.error('moveErr = ', moveErr);
						}
					});
				});
				var ibSQL = 'INSERT INTO INSTA_BOARD(REPRESENT_PATH) VALUES(?)';
				conn.query(ibSQL, ip+'/insta/'+image[0].name, function (ibErr, iRow) {
					if(ibErr) {
						console.error('ibErr = ', ibErr);
						results.success = 1;
						results.message = "insta board insert sql error";
						results.results = [];
						conn.release();
						callback(results);
					} else {
						var ibnSQL = 'SELECT INSTA_BOARD_NO FROM INSTA_BOARD';
						conn.query(ibnSQL, function (ibnErr, ibnRow) {
							if(ibnErr) {
								console.error('ibnErr = ', ibnErr);
								results.success = 1;
								results.message = "insta board select sql error";
								results.results = [];
								conn.release();
								callback(results);
							} else {
								async.each(image, function (item, callback ){
									var iiSQL = 'INSERT INTO INSTA(INSTA_PATH, INSTA_BOARD_NO) VALUES(?,?)';
									conn.query(iiSQL, [ip+'/insta/'+item.name, ibnRow[ibnRow.length-1].INSTA_BOARD_NO], function (ibErr, ibRow) {
										if(ibErr) {
											console.error('ibErr = ', ibErr);
										}
									});
								});
								results.success = 1;
								results.message = 'insta insert success';
								conn.release();
								callback(results);
							}
						});
					}
				});
			}
		}
	});
}

exports.instaDetail = function (datas, callback) {
	var results = {};
	pool.getConnection( function (connErr, conn) {
		if (connErr) {
		    console.error('conErr = ', conErr);
		    reuslts.success = 1;
		    results.message = "get Connection error";
		    results.results = {};
		    conn.release();
		    callback(results);
		} else {
			var idSQL = 'SELECT INSTA_NO AS instaNum, INSTA_PATH AS instaPath FROM INSTA WHERE INSTA_BOARD_NO=?';
			conn.query(idSQL, datas, function (idErr, idRow) {
				if(idErr){
					console.error('idErr = ', idErr);
					results.success = 1;
					results.message = 'insta detail select sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success =1 ;
					results.message = 'insta detail success';
					results.results = idRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}

exports.instaDelete = function (data, callback ){
	var results = {};
	pool.getConnection ( function (connErr, conn) {
		if (connErr) {
		    console.error('conErr = ', conErr);
		    reuslts.success = 1;
		    results.message = "get Connection error";
		    results.results = {};
		    conn.release();
		    callback(results);
		} else {
			var idSQL = 'DELETE FROM INSTA WHERE INSTA_BOARD_NO=?';
			var ibdSQL = 'DELETE FROM INSTA_BOARD WHERE INSTA_BOARD_NO=?'
			conn.query(idSQL, data, function (idErr, idRow) {
				conn.query(idbSQL, datas, function (idbErr, idbRow) {
					if(idErr) {
						console.error('idErr = ', idErr);
						results.success = 1;
						results.message = 'insta delete sql error';
						conn.release();
						callback(results);
					} else if(idbErr) {
						console.error('idbErr = ', idbErr);
						results.success = 1;
						results.message = 'insta board delete sql error';
						conn.release();
						callback(results);
					} else {
						results.success = 1;
						results.message = 'insta delete success';
						conn.release();
						callback(results);
					}
				});
			});

		}
	});
}

//datas = [categoryName, image]
exports.categoryRegister = function (datas, callback) {
	var results = {};
	var image = datas[1];
	pool.getConnection( function (connErr, conn) {
		if (connErr) {
		    console.error('conErr = ', conErr);
		    reuslts.success = 1;
		    results.message = "get Connection error";
		    results.results = {};
		    conn.release();
		    callback(results);
		} else {
			var rPath = workshopPath+image.path;
			datas[2] = ip+'/category/'+image.name;
			fs.move(rPath,categoryPath+item.name, function (moveErr) {
				if(moveErr) {
					console.error('moveErr = ', moveErr);
					results.success = 1;
					results.message = 'file move error';
					conn.release();
					callback(results);
				} else {
					var ciSQL = 'INSERT INTO CATEGORY(CATEGORY_NM, IMAGE_PATH) VALUES(?,?)';
					conn.query(ciSQL,datas, function (ciErr, ciRow) {
						if(ciErr) {
							console.error('ciErr = ', ciErr);
							results.success = 1;
							results.message = 'category insert sql error';
							conn.release();
							callback(results);
						} else {
							results.success = 1;
							results.message = 'category register success';
							conn.release();
							callback(results);
						}
					});
				}
			});
		}
	});
}