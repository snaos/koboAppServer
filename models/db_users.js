var mysql = require('mysql');
var crypto = require('crypto');

var db = require('./db_setting');

var pool =  db.mysql_pool(mysql);

var iterations = 1000;      //암호화 반복 횟수
var keylen = 24;    //암호화 후 생성되는 key 길이 설정

//datas = [userId, userPw];
exports.login = function(datas, callback) {
	var userId = datas[0];
	var pw = datas[1];
	var regId = datas[2];
	var results = {};

	pool.getConnection(function(connErr, conn) {
		if(connErr) {
			console.error('conErr = ', conErr );
			results.message = "get Connection error";
			results.results = {};
			results.success = 1;
			callback(callbackDatas);
		} else {
			var loginSQL = 'SELECT PW, SALT, USER_ST, MANAGER_FL FROM USER WHERE ID=?';
			conn.query(loginSQL, userId, function (loginErr, loginRow) {
				if(loginErr) {
					console.error('login sql error = ', loginErr);
					results.message = "login sql error";
					results.results = {};
					conn.release();
					callback(results);
				} else {
					if(loginRow.length == 1) {
						//아이디 존재
						var salt = loginRow[0].SALT;
						var key = crypto.pbkdf2Sync(pw, salt, iterations, keylen); //암호화
						var pw_cryp = Buffer(key, 'binary').toString('hex');     //암호화된 값 생성.
						var pwSQL = 'SELECT ID, GCM_PUSH FROM USER WHERE ID=? AND PW=?';
						conn.query(pwSQL, [userId, pw_cryp], function(pwErr, pwRow) {
							if(pwErr) {
								console.error('login pw sql error = ', pwErr);
								results.message = "login pw sql error";
								results.results = {};
								conn.release();
								callback(results);
							} else {
								if(pwRow.length == 1) { //아이디 비번 맞음
									var gcmSQL = 'SELECT GCM_TOKEN, USER_ID FROM GCM WHERE GCM_TOKEN = ?';
									conn.query(gcmSQL, regId, function(gcmErr, gcmRow) {
										if(gcmErr) {
											console.error('login gcm sql error = ', gcmErr);
											results.message = "login gcm sql error";
											results.results = {};
											conn.release();
											callback(results);
										} else if(gcmRow.length == 1) {	//해당 기기 등록되어 있음.
											var gcmUSQL = 'UPDATE GCM SET USER_ID=? WHERE GCM_TOKEN=?';
											conn.query(gcmUSQL, [userId, regId], function(gcmUErr, gcmURow) {
												if(gcmUErr) {
													console.error('login gcm update sql error = ', gcmUErr);
													results.message = "login gcm update sql error";
													results.results = {};
													conn.release();
													callback(results);
												} else {
													results.success = 1;
													results.message = "login success";
													results.results = {
														"userId" : userId,
														"managerFlag" : loginRow[0].MANAGER_FL
													}
													conn.release();
													callback(results);
												}
											})
										} else { //해당 기기 없음
											var gcmISQL = 'INSERT INTO GCM(USER_ID, GCM_TOKEN) VALUES(?, ?)';
											conn.query(gcmISQL, [userId, regId], function(gcmIErr, gcmIRow) {
												if(gcmIErr) {
													console.error('login gcm insert sql error = ', gcmUErr);
													results.message = "login gcm insert sql error";
													results.results = {};
													conn.release();
													callback(results);
												} else {
													results.success = 1;
													results.message = "login success";
													results.results = {
														"userId" : userId,
														"managerFlag" : loginRow[0].MANAGER_FL
													}
													conn.release();
													callback(results);
												}
											})
										}
									})
								} else {	//비번 틀림
									results.message = "check password";
									results.success = 1;
									results.results = {};
									conn.release();
									callback(results);
								}
							}
						})
					} else {
						//아이디 존재 x
						results.message = "check id";
						results.success = 1;
						results.results = {};
						conn.release();
						callback(results);
					}
				}
			});
		}
	})
}

exports.buyList = function (datas, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr) {
			console.error(connErr);
			results.success = 1;
			results.message = 'get Connection error';
			results.results = [];
			callback(results);
		} else {
			var blSQL = 'SELECT BUY_NO AS buyNum,DATE_FORMAT(BUY_YMD, "%Y-%c-%d %H:%i:%s") AS buyTime , WORKSHOP_WORKSHOP_NO AS workshopNum, WORKSHOP_NM AS workshopName FROM BUY, WORKSHOP WHERE BUY.USER_USER_ID=? AND BUY.WORKSHOP_WORKSHOP_NO=WORKSHOP.WORKSHOP_NO';
			conn.query(blSQL, datas, function (blErr, blRow) {
				if(blErr) {
					console.error('blErr = ', blErr);
					results.success = 1;
					results.message = 'buy list sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success =1;
					results.message = 'buy list success'
					results.results = blRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//	var datas = [user_id, buyNum];
exports.buyDetail = function (datas, callback) {
	var results = {};
	pool.getConnection(function (connErr, conn) {
		if(connErr) {
			console.error(connErr);
			results.success = 1;
			results.message = 'get Connection error';
			results.results = [];
			callback(results);
		} else {
			var bdSQL = 'SELECT BUY_NO AS buyNum,DATE_FORMAT(BUY_YMD, "%Y-%c-%d %H:%i:%s") AS buyTime , WORKSHOP_WORKSHOP_NO AS workshopNum, WORKSHOP_NM AS workshopName, PROCESS AS buyProcess, PRICE AS price, WORK_START AS startTime, WORK_END AS endTime, COUPONE_STATUS AS coupone, PERSON AS person FROM BUY, WORKSHOP WHERE BUY.WORKSHOP_WORKSHOP_NO=WORKSHOP.WORKSHOP_NO AND BUY.USER_USER_ID=? AND BUY_NO=? '
			conn.query(bdSQL, datas, function (bdErr, bdRow) {
				if(bdErr) {
					console.error('dbErr = ', dbErr);
					results.success = 1;
					results.message = 'buy list sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.message = 'buy list sucess';
					results.results = dbRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//	var datas = [userId, email, address, userName, gender, birth, pw, salt, userPhone];
exports.signUp = function (datas, regId, callback) {
	var results = {};
	var pw = datas[6] + "";
	var salt = Math.round((new Date().valueOf() * Math.random())) + '';//salt값 생성
	var key = crypto.pbkdf2Sync(pw, salt, iterations, keylen);  //암호화
	var pw_cryp = Buffer(key, 'binary').toString('hex');     //암호화된 값 생성.
	datas[6] = pw_cryp;
	datas[7] = salt;

	pool.getConnection( function (connErr, conn) {
		if(connErr) {
			console.error(connErr);
			results.success = 1;
			results.message = 'get Connection error';
			results.results = {};
			callback(results);
		} else {
			var checkSQL = 'SELECT * FROM USER WHERE ID=?';
			conn.query(checkSQL, datas[0], function (checkErr, checkRow) {
				if(checkErr) {
					results.success = 1;
					results.message = 'select sql error';
					results.results = {};
					conn.release();
					callback(results);
				} else if(checkRow.length == 0) {	//아이디가 겹치지 않음
					var signSQL = 'INSERT INTO USER(ID, USER_EMAIL ,USER_ADD, USER_NM, USER_GENDER, USER_BIRTH, PW, SALT, SIGNUP_YMD, USER_PHONE) VALUES(?,?,?,?,?,?,?,?,NOW(), ?)';
					conn.query(signSQL, datas, function (signErr, signRow) {
						if(signErr) {
							console.error('signErr = ', signErr);
							results.success = 1;
							results.message = 'sign up insert sql error';
							results.results = {};
							conn.release();
							callback(results);
						} else {
							var gcmSQL = 'INSERT INTO GCM(USER_ID, GCM_TOKEN) VALUES(?,?)';
							conn.query(gcmSQL, [datas[0], regId], function ( gcmErr, gcmRow) {
								if(gcmErr) {
									console.error('gcmErr = ', gcmErr);
									results.success = 1;
									results.message = 'gcm insert sql error';
									results.results = {};
									conn.release();
									callback(results);
								} else {
									results.success = 1;
									results.message = 'sign up success';
									results.results = {};
									conn.release();
									callback(results);
								}
							});
						}
					});
				} else { //아이디가 존재
					results.success = 1;
					results.message = 'id exist';
					results.results = {};
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//datas = user_id
exports.uQuestion = function (datas, callback) {
	var results = {};

	pool.getConnection(function (connErr, conn) {
		if(connErr){
			console.error('conErr = ', conErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = [];
			callback(results);
		} else {
			var uqSQL = 'SELECT QUESTION.QUESTION_NO AS questionNum, QUESTION.QUESTION_CONTENT AS questionContent, DATE_FORMAT(QUESTION.QUESTION_YMD, "%Y-%c-%d %H:%i:%s") AS quetionTime, QUESTION.USER_USER_ID AS userId, QUESTION.WORKSHOP_WORKSHOP_NO AS workshopNum, QUESTION.MANAGER_ID AS managerId, QUESTION.STATUS AS questionStatus, WORKSHOP.WORKSHOP_NM AS workshopName  FROM QUESTION, WORKSHOP WHERE WORKSHOP.WORKSHOP_NO = QUESTION.WORKSHOP_WORKSHOP_NO AND QUESTION.USER_USER_ID=? GROUP BY workshopNum';
			conn.query(uqSQL, datas, function (uqErr, uqRow) {
				if(uqErr) {
					console.error('uqErr = ', uqErr);
					results.success = 1;
					results.message = 'user question sql error';
					results.results = [];
					conn.release();
					callback(results);
				} else {
					results.success =1;
					results.message = 'question list success'
					results.results = uqRow;
					conn.release();
					callback(results);
				}
			});
		}
	});
}

//datas = {userId, workshopNum}
exports.buyRecord = function (datas, callback) {
	var results = {};

	pool.getConnection(function (connErr, conn) {
		if(connErr){
			console.error('conErr = ', conErr );
			results.success = 1;
			results.message = "get Connection error";
			results.results = -1;
			callback(results);
		} else {
			var brSQL = 'SELECT BUY_NO AS buyNum FROM BUY WHERE USER_USER_ID=? AND WORKSHOP_WORKSHOP_NO=?';
			conn.query(brSQL, datas, function (brErr, brRow) {
				if(brErr) {
					console.error('brErr = ',brErr);
					results.success = 1;
					results.message = 'buy record sql error';
					results.reuslts = -1;
					conn.release();
					callback(results);
				} else {
					results.success = 1;
					results.message = 'buy record success';
					if(brRow.length == 0 ) {
						results.results = 0;
					} else {
						results.results = 1;
					}
					conn.release();
					callback(results);
				}
			});
		}
	});
}
