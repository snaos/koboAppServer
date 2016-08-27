
var mysql = require('mysql');

var db = require('./db_setting');

var forEach = require('async-foreach').forEach;
var async = require('async');
var pool =  db.mysql_pool(mysql);

var ip = 'http://54.65.222.144'
var mainPath = '/home/ubuntu';
var serverPath = '/workshop/public';

//datas = [workshopNum, managerId];
exports.managerCheck = function (datas, callback) {
	var results = {};
	pool.getConnection ( function (connErr, conn) {
		if(connErr) {
			console.error('conErr = ', conErr );
			results.message = "get Connection error";
			results.manager = -1;
			callback(results);
		} else {
			var mcSQL = 'SELECT * FROM WORKSHOP WHERE WORKSHOP_NO=? AND USER_USER_ID=?';
			conn.query(mcSQL, datas, function (mcErr, mcRow){
				if(mcErr){
					console.error('mcErr = ', mcErr);
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

//datas = managerId
exports.mQuestion = function (datas, callback) {
	var results = {};

	pool.getConnection(function (connErr, conn) {
		if(connErr){
			console.error('conErr = ', conErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var mqSQL = 'SELECT QUESTION.QUESTION_NO AS questionNum, QUESTION.QUESTION_CONTENT AS questionContent, DATE_FORMAT(QUESTION.QUESTION_YMD, "%Y-%c-%d %H:%i:%s") AS quetionTime, QUESTION.USER_USER_ID AS userId, QUESTION.WORKSHOP_WORKSHOP_NO AS workshopNum, QUESTION.MANAGER_ID AS managerId, QUESTION.STATUS AS questionStatus, WORKSHOP.WORKSHOP_NM AS workshopName  FROM QUESTION, WORKSHOP WHERE WORKSHOP.WORKSHOP_NO = QUESTION.WORKSHOP_WORKSHOP_NO AND QUESTION.MANAGER_ID=? GROUP BY userId, workshopNum';
			conn.query(mqSQL, datas, function (mqErr, mqRow) {
				if(mqErr) {
					console.error('mqErr = ', mqErr);
					results.success = 1;
					results.message = 'manager question sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success =1;
					results.message = 'question list success'
					results.results = mqRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//var datas = [managerId, userId, workshopNum];
exports.mQuestionDetail = function (datas, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr) {
			console.error('conErr = ', conErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = {};
			callback(results);
		} else {
			var mqdSQL = 'SELECT QUESTION.QUESTION_NO AS questionNum, QUESTION.QUESTION_CONTENT AS content, DATE_FORMAT(QUESTION.QUESTION_YMD, "%Y-%c-%d %H:%i:%s") AS time, QUESTION.STATUS AS questionStatus FROM QUESTION, WORKSHOP WHERE WORKSHOP.WORKSHOP_NO = QUESTION.WORKSHOP_WORKSHOP_NO AND QUESTION.MANAGER_ID=? AND QUESTION.USER_USER_ID=? AND QUESTION.WORKSHOP_WORKSHOP_NO=?';
			conn.query(mqdSQL, datas, function (mqdErr, mqdRow) {
				if(mqdErr) {
					console.error('mqdErr = ', mqdErr);
					results.success = 1;
					results.message = 'manager question detail sql error';
					results.results = {};
					conn.release();
					callback(results);
				} else {
					results.message = 'manager question detail list success';
					results.success =1 ;
					results.results = {
						"workshopNum" : Number(datas[2]),
						"content" : mqdRow
					};
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//var datas = [managerId, userId, workshopNum, questionCotent];
exports.mQuestionWrite = function (datas, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr) {
			console.error('conErr = ', conErr );
			results.success = 1;
			results.message = "get Connection error";
			callback(results);
		} else {
			var qiSQL = 'INSERT INTO QUESTION(QUESTION_YMD,STATUS, MANAGER_ID, USER_USER_ID,WORKSHOP_WORKSHOP_NO,QUESTION_CONTENT) VALUES(NOW(),1,?,?,?,?)';
			conn.query(qiSQL, datas, function (qiErr, qiRow) {
				if(qiErr) {
					results.success= 1;
					results.message = 'question answer error';
					conn.release();
					callback(results);
				} else {
					results.success =1 ;
					results.message = 'question answer success';
					conn.release();
					callback(results);
				}
			});
		}
	});
}




// datas = [workshopImage, workshopNum];
exports.imageModify = function (datas, callback) {
	var results = {};
	var image = datas[0];
	var workshopNum = datas[1];
	pool.getConnection( function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var idSQL = 'DELETE FROM WORKSHOP_IMAGE WHERE WORKSHOP_WORKSHOP_NO=?';
			conn.query(idSQL, workshopNum, function (idErr, idRow) {
				if(idErr) {
					console.error('idErr = ', idErr);
					results.success = 1;
					results.message = 'workshop image delete sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					if(image.path) {		//이미지 하나
						var image_path = ip + image.path.substring(6);
						var imageSQL = 'INSERT INTO WORKSHOP_IMAGE(WORKSHOP_WORKSHOP_NO, IMAGE_PATH) VALUES(?,?)';
						conn.query(imageSQL, [workshopNum, image_path], function( imageErr, imageRow) {
							if (imageErr) {
								console.error('imageErr = ', imageErr);
								results.success = 1;
								results.message = "image insert error";
								conn.release();
								callback(results);
							} else if (imageRow.affectedRows == 1) {
                results.message = "image insert success";
                results.success = 1;
                results.results =
                conn.release();
                callback(results);
	            } else {
	                results.success = 1;
	                results.message = "image insert fail";
	                conn.release();
	                callback(results);
	            }
						});
					}  else if(image){	//이미지 여러개
		        var error = false;
		        var fail = false;
		        var imageErr;
		        forEach(image, function (item, index, arr) {
		            var image_path = ip + item.path.substring(6);
		            var imageSQL = 'INSERT INTO WORKSHOP_IMAGE(WORKSHOP_WORKSHOP_NO, IMAGE_PATH) VALUES(?,?)';
		            conn.query(imageSQL, [workshopNum, image_path], function (imageErr, imageRow) {
		                if (imageErr) {
		                    error = true;
		                } else if (imageRow.affectedRows == 0) {
		                    fail = true;
		                }
		            });
		        });
		        if (error) {
		            console.error('imageErr = ', imageErr);
		            results.success = 1;
		            results.message = "image insert error";
		            conn.release();
		            callback(results);
		        } else if (fail) {
		            results.success = 1;
		            results.message = "image insert fail";
		            conn.release();
		            callback(results);
		        } else {
		            results.message = "image insert success";
		            results.success = 1;
		            conn.release();
		            callback(results);
		        }
					} else {	//이미지 없음.
						results.success = 1;
						results.message = 'image insert success';
						conn.release();
						callback(results);
					}
				}
			});
		}
	});
}


exports.contentModify = function (datas, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr) {
			console.error('connErr = ', connErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var cmSQL = 'UPDATE WORKSHOP SET WORKSHOP_CONTENT=? WHERE WORKSHOP_NO=?';
			conn.query(cmSQL, datas, function (cmErr, cmRow) {
				if (cmErr) {
					console.error('cmErr = ', cmErr);
					results.success = 1;
					results.message = 'content update sql error';
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.message = 'content modify success';
					conn.release();
					callback(results);
				}
			});
		}
	});
}