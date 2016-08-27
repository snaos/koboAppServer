var mysql = require('mysql');
var async = require('async');

var db = require('./db_setting');

var pool =  db.mysql_pool(mysql);

var page_size = 10;
var ip = 'http://54.65.222.144'
var serverPath = '/home/ubuntu/workshop/';

make_popular_ranking = function(datas, callback) {
	async.each(datas, function(item, callback) {
		item.popular = item.likeNum + item.buyer;
	});
	var temp = 0;
	for(var i = 0; i<datas.length; i++){
		for(var j = 0; j< datas.length-1; j++){
			if(datas[j].popular < datas[j+1].popular){
				temp = datas[j];
				datas[j] = datas[j+1];
				datas[j+1] = temp;
			}
		}
	}
	callback(datas);
}


//datas = [workshopNum, managerId];
exports.managerCheck = function (datas, callback) {
	var results = {};
	pool.getConnection ( function (connErr, conn) {
		if(connErr) {
			console.error('conErr = ', conErr );
			results.success = 1;
			results.message = "get Connection error";
			results.manager = -1;
			callback(results);
		} else {
			var mcSQL = 'SELECT * FROM WORKSHOP WHERE WORKSHOP_NO=? AND USER_USER_ID=?';
			conn.query(mcSQL, datas, function (mcErr, mcRow){
				if(mcErr){
					console.error('mcErr = ', mcErr);
					results.success = 1;
					results.message = 'manager check sql error';
					results.manager = -1;
					conn.release();
					callback(results);
				} else if(mcRow.length == 1) {
					results.manager = 1;
					conn.release();
					callback(results);
				} else if(mcRow.length == 0){
					results.manager = 0;
					conn.release();
					callback(results);
				} else {
					results.manager = 2;
					conn.release();
					callback(results);
				}
			});
		}
	})
}

//datas = categoryNum
exports.categoryWorkshop = function(datas,page, callback){
	var callbackDatas = {
		"success" : 1
	};
	pool.getConnection(function(conErr, conn){
		if(conErr) {
			console.error('conErr = ', conErr );
			callbackDatas.message = "get Connection error";
			callbackDatas.results = [];
			callback(callbackDatas);
		} else {
			var cwSQL = 'SELECT WORKSHOP_NO AS workshopNum, USER_USER_ID AS userID, WORKSHOP_NM AS workshopName, DESCRIPTION AS description, WORKSHOP_THUMBNAIL AS thumbnailPath, WORKSHOP_PRICE AS price, CATEGORY_NM AS category, LOCATION AS location, AREA_NM AS area1, AREA2_NM AS area2, AREA3_NM AS area3, (SELECT COUNT(*) FROM RECOMMEND WHERE WORKSHOP_WORKSHOP_NO = workshopNum AND USER_USER_ID = ?) AS likeStatus, CLASS.CLASS_NM AS className, CLASS.CLASS_IMAGE AS classImage FROM WORKSHOP, CATEGORY, CLASS, WORKSHOP_AREA1, WORKSHOP_AREA2, WORKSHOP_AREA3 WHERE WORKSHOP.CATEGORY_CATEGORY_NO = CATEGORY.CATEGORY_NO AND WORKSHOP.AREA_NO = WORKSHOP_AREA1.AREA_NO AND CATEGORY.CATEGORY_NO = ? AND WORKSHOP.AREA2_NO = WORKSHOP_AREA2.AREA2_NO AND WORKSHOP.AREA3_NO = WORKSHOP_AREA3.AREA3_NO AND CLASS.CLASS_NO=WORKSHOP.CLASS_NO';
			conn.query(cwSQL, datas, function (cwSQLErr, cwRow){
				if(cwSQLErr){
					console.error('cwSQLErr = ', cwSQLErr );
					callbackDatas.message = "category workshop sql error";
					callbackDatas.results = [];
					conn.release();
					callback(callbackDatas);
				} else {
					var cSQL = 'UPDATE CATEGORY SET HIT_NO=HIT_NO+1 WHERE CATEGORY_NO=?';
					conn.query(cSQL, datas, function (cErr, cRow) {
						if(cErr) {
							console.error('cErr = ', cErr );
							callbackDatas.message = "category workshop update error";
							callbackDatas.results = [];
							conn.release();
							callback(callbackDatas);
						} else {
							var total_cnt = cwRow.length;
							var total_page = Math.ceil(total_cnt / page_size);
							var start_num = (page-1)*page_size;
							var end_num = (page * page_size) -1;
							callbackDatas.results = [];
							if(page == 1 && total_page > 0){ //첫페이지
								var pageData = [];
								for(var i = 0; (i<page_size) && i< (total_cnt);i++){
									pageData[i] = cwRow[i];
								}
								callbackDatas.results = pageData;
								callbackDatas.message = "category workshop success";
								conn.release();
								callback(callbackDatas);
							} else if (page > total_page || total_page == 0){ //페이지가 없음
									conn.release();
									callbackDatas.message = "page over";
									callbackDatas.succss = 1;
									callbackDatas.results = [];
									callback(callbackDatas);
							} else {
								var pageData = [];
								if(end_num > total_cnt){
									end_num = total_cnt-1;
								}
								for(var i = 0; i<end_num -start_num+1; i++){
									pageData[i] = cwRow[i+start_num];
								}
								callbackDatas.results = pageData;
								callbackDatas.message = "category workshop success";
								conn.release();
								callback(callbackDatas);
							}
						}
					});
				}
			});
		}
	});
}

// datas = workshop no
exports.detailWorkshop = function(datas, userId, callback) {
	var results = {};
	pool.getConnection(function(connErr, conn) {
		if(connErr){
			connsol.error('connErr = ', connErr);
			results.success = 1;
			results.message = "get Connection error";
			results.results = {};
			callback(results);
		} else {
			var detailWorkshopSQL = 'SELECT WORKSHOP_NO AS workshopNum, WORKSHOP_NM AS workshopName, WORKSHOP_TITLE AS workshopTitle, DESCRIPTION AS description, LOCATION AS location, EXECUTION_TIME AS executionTime, CATEGORY_NM AS category, WORKSHOP_PRICE AS price, WORKSHOP.HIT_NO AS hitNum, DIFFICULTY AS difficulty, WORKSHOP_CONTENT AS content, AREA_NM AS area1, AREA2_NM AS area2, AREA3_NM AS area3, (SELECT count(*) FROM RECOMMEND WHERE USER_USER_ID=? AND WORKSHOP_WORKSHOP_NO=?) AS likeStatus FROM WORKSHOP, WORKSHOP_AREA1, WORKSHOP_AREA2, WORKSHOP_AREA3, CATEGORY WHERE WORKSHOP_NO = ? AND CATEGORY_CATEGORY_NO=CATEGORY_NO AND WORKSHOP.AREA_NO = WORKSHOP_AREA1.AREA_NO AND WORKSHOP.AREA2_NO = WORKSHOP_AREA2.AREA2_NO AND WORKSHOP.AREA3_NO = WORKSHOP_AREA3.AREA3_NO';
			conn.query(detailWorkshopSQL, [userId, datas, datas], function(dwSQLErr, dwRow) {
				if(dwSQLErr) {
					console.error("dwSQLErr = ", dwSQLErr);
					results.success = 1;
					results.message = "detail workshop sql error";
					results.results = {};
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.results = dwRow[0];
					////////////////////////////////////
					//이미지 검색
					var imageSQL = 'SELECT IMAGE_PATH FROM WORKSHOP_IMAGE WHERE WORKSHOP_WORKSHOP_NO = ?';
					conn.query(imageSQL, datas, function(imageErr, imageRow) {
						if(imageErr) {
							console.error("imageErr = ", imageErr);
							results.success = 1;
							results.message = "detail workshop image sql error";
							results.results = {};
							conn.release();
							callback(results);
						} else {
							results.success = 1;
							results.message = "detail workshop sucess"
							results.image = imageRow;
							var scoreSQL = 'SELECT (SELECT COUNT(*) FROM REVIEW WHERE WORKSHOP_WORKSHOP_NO=?) AS reviewSum, (SELECT SUM(REVIEW_SCORE) FROM REVIEW WHERE WORKSHOP_WORKSHOP_NO=?) AS scoreSum  ';
							conn.query(scoreSQL, [datas,datas],  function (sErr, sRow) {
								if( sRow[0].scoreSum/ sRow[0].reviewSum) {
									var workshopScore = Math.round(sRow[0].scoreSum/ sRow[0].reviewSum);
									results.workshopScore = workshopScore;
								} else {
									results.workshopScore = 0;
								}
								conn.release();
								callback(results);
							});
						}
					});
				}
			})
		}
	})
}

exports.popular = function(datas,page, callback) {
	var results = {};
	results.results = [];
	pool.getConnection(function (connErr, conn) {
		if(connErr){
			connsol.error('connErr = ', connErr);
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var workshopListSQL = 'SELECT WORKSHOP_NO AS workshopNum, WORKSHOP_NM AS workshopName, WORKSHOP_TITLE AS workshopTitle, DESCRIPTION AS description, LOCATION AS location, EXECUTION_TIME AS executionTime, CATEGORY_NM AS category, WORKSHOP_PRICE AS price, WORKSHOP.HIT_NO AS hitNum, DIFFICULTY AS difficulty, WORKSHOP_CONTENT AS content, AREA_NM AS area1, AREA2_NM AS area2, AREA3_NM AS area3,(SELECT count(*) FROM RECOMMEND WHERE WORKSHOP.WORKSHOP_NO = RECOMMEND.WORKSHOP_WORKSHOP_NO)  AS likeNum,(SELECT COUNT(*) FROM RECOMMEND WHERE WORKSHOP_WORKSHOP_NO = workshopNum AND USER_USER_ID = ?) AS likeStatus ,(SELECT count(*) FROM BUY WHERE WORKSHOP.WORKSHOP_NO = BUY.WORKSHOP_WORKSHOP_NO) AS buyer, CLASS.CLASS_IMAGE AS classImage, CLASS.CLASS_NM AS className FROM WORKSHOP, CATEGORY, WORKSHOP_AREA1, WORKSHOP_AREA2, WORKSHOP_AREA3, CLASS WHERE WORKSHOP.CATEGORY_CATEGORY_NO = CATEGORY.CATEGORY_NO AND WORKSHOP.AREA_NO = WORKSHOP_AREA1.AREA_NO AND WORKSHOP.AREA2_NO = WORKSHOP_AREA2.AREA2_NO AND WORKSHOP.AREA3_NO = WORKSHOP_AREA3.AREA3_NO AND CLASS.CLASS_NO = WORKSHOP.CLASS_NO';
			conn.query(workshopListSQL, datas, function(listErr, listRow) {
				if(listErr) {
					console.error("listErr = ", listErr);
					results.success = 1;
					results.message = "popular list sql error";
					results.results = [];
					conn.release();
					callback(results);
				} else {
					make_popular_ranking(listRow, function(rankingResults) {
						var total_cnt = rankingResults.length;
						var total_page = Math.ceil(total_cnt / page_size);
						var start_num = (page-1)*page_size;
						var end_num = (page * page_size) -1;
						results.results = [];
						if(page == 1 && total_page > 0){ //첫페이지
							var pageData = [];
							for(var i = 0; (i<page_size) && i< (total_cnt);i++){
								pageData[i] = rankingResults[i];
							}
							results.results = pageData;
							results.success =1;
							results.message = "popular list success";
							conn.release();
							callback(results);
						} else if (page > total_page || total_page == 0){ //페이지가 없음
								conn.release();
								results.message = "page over";
								results.succss = 1;
								callback(results);
						} else {
							var pageData = [];
							if(end_num > total_cnt){
								end_num = total_cnt-1;
							}
							for(var i = 0; i<end_num -start_num+1; i++){
								pageData[i] = rankingResults[i+start_num];
							}
							results.susccess = 1;
							results.results = pageData;
							results.message = "popular list success";
							conn.release();
							callback(results);
						}
					});
				}
			});
		}
	});
}

//datas = [user_id, workshopNum]
exports.questionList = function (datas, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr){
			connsol.error('connErr = ', connErr);
			results.success = 1;
			results.message = "get Connection error";
			results.results = {};
			callback(results);
		} else {
			var qlSQL = 'SELECT QUESTION_NO AS questionNum, QUESTION_CONTENT AS content, DATE_FORMAT(QUESTION_YMD, "%Y-%c-%d %H:%i:%s") AS time, STATUS AS questionStatus FROM QUESTION WHERE USER_USER_ID=? AND WORKSHOP_WORKSHOP_NO=?';
			conn.query(qlSQL, datas, function (qlErr, qlRow) {
				if(qlErr) {
					console.error("qlErr = ", qlErr);
					results.success = 1;
					results.message = "question list sql error";
					results.results = {};
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.message = "question list success";
					results.results = {
						"workshopNum" : datas[1],
						"content" : qlRow
					}
					conn.release();
					callback(results);
				}
			})
		}
	});
}

//var datas = [workshopNum, qContent, user_id];
exports.question = function (datas, callback) {
	var results = {};
	pool.getConnection(function(connErr, conn) {
		if(connErr){
			connsol.error('connErr = ', connErr);
			results.success = 1;
			results.message = "get Connection error";
			results.results = {};
			callback(results);
		} else {
			var workshopSQL = 'SELECT USER_USER_ID FROM WORKSHOP WHERE WORKSHOP_NO = ?';
			conn.query(workshopSQL, datas[0], function(wnErr, wnRow) {
				if(wnErr) {
					console.error("wnErr = ", wnErr);
					results.success = 1;
					results.message = "workshop sql error";
					results.results = {};
					conn.release();
					callback(results);
				} else {
					var managerId = wnRow[0].USER_USER_ID;
					datas.push(managerId);
					var qSQL = 'INSERT INTO QUESTION(QUESTION_YMD,STATUS, WORKSHOP_WORKSHOP_NO ,QUESTION_CONTENT, USER_USER_ID, MANAGER_ID) VALUES(NOW(),0,?,?,?,?)';
					conn.query(qSQL, datas, function(qiErr, qiRow) {
						if(qiErr) {
							console.error("qiErr = ", qiErr);
							results.success = 1;
							results.message = "question insert sql error";
							results.results = {};
							conn.release();
							callback(results);
						} else if(qiRow.affectedRows == 1){
							results.success = 1;
							results.message = "question success";
							results.results = {
								"managerId" : managerId
							}
							conn.release();
							callback(results);
						} else {
							results.success = 1;
							results.message = "question insert sql fail";
							results.results = {};
							conn.release();
							callback(results);
						}
					});
				}
			});
		}
	});
}

//datas = workshopNum
exports.reviewList = function (datas, callback) {
	var results = {};
	var page = datas[1];
	pool.getConnection(function (conErr, conn){
			if(conErr) {
				console.error('conErr = ', conErr );
				results.message = "get Connection error";
				results.success = 1;
				results.results = [];
				callback(results);
			} else {
				var rlSQL = 'SELECT REVIEW_NO AS reviewNum, REVIEW_CONTENT AS reviewContent, DATE_FORMAT(REVIEW_YMD, "%Y-%c-%d %H:%i:%s") AS reviewTime, USER_USER_ID AS userId, REVIEW_TITLE AS reviewTitle FROM REVIEW WHERE WORKSHOP_WORKSHOP_NO=?';
				conn.query(rlSQL, datas[0], function (rlErr, rlRow) {
					if(rlErr) {
						console.error("rlErr = ", rlErr);
						results.success = 1;
						results.message = "review list sql error";
						results.results = [];
						conn.release();
						callback(results);
					} else {

						var total_cnt = rlRow.length;
						var total_page = Math.ceil(total_cnt / page_size);
						var start_num = (page-1)*page_size;
						var end_num = (page * page_size) -1;
						results.results = [];
						if(page == 1 && total_page > 0){ //첫페이지
							var pageData = [];
							for(var i = 0; (i<page_size) && i< (total_cnt);i++){
								pageData[i] = rlRow[i];
							}
							async.each(pageData, function (item, callback) {
								item.reviewImage = [];
								var rimageSQL = 'SELECT IMAGE_PATH AS imagePath FROM REVIEW_IMAGE WHERE REVIEW_REVIEW_NO=?';
								conn.query(rimageSQL, item.reviewNum, function (rimageErr, riRow) {
									for(var i = 0; i<riRow.length; i++){
										item.reviewImage.push(riRow[i].imagePath);
									}
									callback();
								});
							}, function (err) {
								results.success = 1;
								results.message = "review list success";
								results.results = pageData;
								conn.release();
								callback(results);
							});
						} else if(page > total_page || total_page == 0){ //페이지가 없음
							conn.release();
							results.message = "page over";
							results.results = [];
							results.succss = 1;
							callback(results);
						} else {	//그냥 페이지.
							var pageData = [];
							if(end_num > total_cnt){
								end_num = total_cnt-1;
							}
							for(var i = 0; i<end_num -start_num+1; i++){
								pageData[i] = rlRow[i+start_num];
							}
							async.each(pageData, function (item, callback) {
								item.reviewImage = [];
								var rimageSQL = 'SELECT IMAGE_PATH AS imagePath FROM REVIEW_IMAGE WHERE REVIEW_REVIEW_NO=?'
								conn.query(rimageSQL, item.reviewNum, function (rimageErr, riRow) {
									for(var i = 0; i<riRow.length; i++){
										item.reviewImage.push(riRow[i].imagePath);
									}
									callback();
								});
							}, function (err) {
								results.success = 1;
								results.message = "review list success";
								results.results = pageData;
								conn.release();
								callback(results);
							});
						}
					}
				});
			}
	});
}

//var datas = [remainNum, days, workshopNum];
exports.addDay = function (datas, callback) {

	var results = {};
	pool.getConnection(function (connErr, conn ) {
		if(connErr) {
			results.success = 1;
			console.error('connErr = ', connErr );
			results.message = "get Connection error";
			results.results = {};
			callback(results);
		} else {
			var adSQL = 'INSERT INTO DAYS(WORKSHOP_REMAIN, DAY, WORKSHOP_WORKSHOP_NO) VALUES(?,?,?)';
			conn.query(adSQL, datas, function (adErr, adRow) {
				if(adErr) {
					console.error('adErr = ', adErr);
					results.success = 1;
					results.message = 'day insert sql error';
					results.results = {};
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.message = 'add day success';
					results.results = {};
					conn.release();
					callback(results);
				}
			});
		}
	});
}

exports.days = function(datas, callback){
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var sdSQL = 'SELECT WORKSHOP_REMAIN AS remainNum, DAY AS days, WORKSHOP_WORKSHOP_NO AS workshopNum FROM DAYS WHERE WORKSHOP_WORKSHOP_NO = ?';
			conn.query(sdSQL, datas, function (sdErr, sdRow) {
				if(sdErr) {
					console.error('sdErr = ', sdErr);
					results.success = 1;
					results.message = 'select days sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success=  1;
					results.message = 'workshop days list success';
					results.results = sdRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}

// datas = [workshopNum, days];
exports.deleteDay = function (datas, callback) {
	var results = {};
	pool.getConnection ( function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var ddSQL = 'DELETE FROM DAYS WHERE WORKSHOP_WORKSHOP_NO=? AND DAY=?';
			conn.query(ddSQL, datas, function (ddErr, ddRow) {
				if(ddErr) {
					console.error('ddErr = ', ddErr);
					results.success = 1;
					results.message = 'delete day sql error';
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.message = 'delete day success';
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//datas = managerId
exports.workshopList = function(datas, callback) {
	var results = {};
	pool.getConnection( function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var wlSQL = 'SELECT WORKSHOP_THUMBNAIL AS thumbnailPath, WORKSHOP_NO AS workshopNum, WORKSHOP_NM AS workshopName FROM WORKSHOP WHERE USER_USER_ID=?';
			conn.query(wlSQL, datas, function (wlErr, wlRow) {
				if(wlErr) {
					console.error('wlErr = ', wlErr);
					results.success = 1;
					results.message = 'workshop list sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.message = 'workshop list success';
					results.success = 1;
					if(wlRow.length == 0){
						results.results = [];
					} else {
						results.results = wlRow;
					}
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//datas =
exports.workshopDetailList = function (datas,page, callback ){
	var results = {};
	pool.getConnection ( function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success =1 ;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var wdlSQL = 'SELECT WORKSHOP_NO AS workshopNum, USER_USER_ID AS userId, WORKSHOP_NM AS workshopName, DESCRIPTION AS description, WORKSHOP_THUMBNAIL AS thumbnailPath, WORKSHOP_PRICE AS price, CATEGORY_NM AS category, LOCATION AS location, AREA_NM AS area1, AREA2_NM AS area2, AREA3_NM AS area3, (SELECT COUNT(*) FROM RECOMMEND WHERE WORKSHOP_WORKSHOP_NO = workshopNum AND USER_USER_ID = ?) AS likeStatus, CLASS.CLASS_NM AS className, CLASS.CLASS_IMAGE AS classImage FROM WORKSHOP,CLASS, CATEGORY, WORKSHOP_AREA1, WORKSHOP_AREA2, WORKSHOP_AREA3 WHERE WORKSHOP.AREA_NO = WORKSHOP_AREA1.AREA_NO AND WORKSHOP.USER_USER_ID = ? AND WORKSHOP.AREA2_NO = WORKSHOP_AREA2.AREA2_NO AND WORKSHOP.AREA3_NO = WORKSHOP_AREA3.AREA3_NO AND CATEGORY_CATEGORY_NO=CATEGORY_NO AND CLASS.CLASS_NO=WORKSHOP.CLASS_NO';
			conn.query(wdlSQL, datas, function (wdlErr, wdlRow) {
				if(wdlErr) {
					console.error('wdlErr = ', wdlErr);
					results.success = 1;
					results.message = 'workshop detail list sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					var total_cnt = wdlRow.length;
					var total_page = Math.ceil(total_cnt / page_size);
					var start_num = (page-1)*page_size;
					var end_num = (page * page_size) -1;
					results.results = [];
					if(page == 1 && total_page > 0){ //첫페이지
						var pageData = [];
						for(var i = 0; (i<page_size) && i< (total_cnt);i++){
							pageData[i] = wdlRow[i];
						}
						results.results = pageData;
						results.message = "workshop detail list success";
						conn.release();
						callback(results);
					} else if (page > total_page || total_page == 0){ //페이지가 없음
							conn.release();
							results.message = "page over";
							results.succss = 1;
							results.results = [];
							callback(results);
					} else {
						var pageData = [];
						if(end_num > total_cnt){
							end_num = total_cnt-1;
						}
						for(var i = 0; i<end_num -start_num+1; i++){
							pageData[i] = wdlRow[i+start_num];
						}
						results.results = pageData;
						results.message = "workshop detail list success";
						conn.release();
						callback(results);
					}
				}

			});
		}
	});
}
//datas = workshopNum
exports.imageList = function (datas, callback) {
	var results = {};

	pool.getConnection( function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var ilSQL = 'SELECT IMAGE_NO AS imageNum, IMAGE_PATH AS imagePath FROM WORKSHOP_IMAGE WHERE WORKSHOP_WORKSHOP_NO=?';
			conn.query(ilSQL, datas, function (ilErr, ilRow) {
				if(ilErr) {
					console.error('ilErr = ', ilErr);
					results.success = 1;
					results.message = 'workshop image list sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.message = 'workshop image list success';
					results.results = ilRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//datas = 배열. page의 사이즈 만큼 돌면서 평점을 계산
exports.workshopRating = function(datas, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success = -1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			async.each(datas.results, function (data, callback) {
				var workshopNum = data.workshopNum;
				var rSQL = 'SELECT (SELECT COUNT(*) FROM REVIEW WHERE WORKSHOP_WORKSHOP_NO=?) AS reviewSum, (SELECT SUM(REVIEW_SCORE) FROM REVIEW WHERE WORKSHOP_WORKSHOP_NO=?) AS scoreSum ';
				conn.query(rSQL, [workshopNum, workshopNum], function (rErr, rRow){
					if (rErr){
						console.error('ilErr = ', ilErr);
						results.success = -1;
						results.message = 'workshop rating sql error';
						results.results = [];
						conn.release();
						callback();
					} else {
						if( rRow[0].scoreSum/ rRow[0].reviewSum) {
							var workshopScore = Math.round(rRow[0].scoreSum/ rRow[0].reviewSum)
							data.workshopScore = workshopScore;
						} else {
							data.workshopScore = 0;
						}
						callback();
					}
				});
			}, function (err) {
					conn.release();
					callback(datas);
			});
		}
	});
}