var mysql = require('mysql');
var db = require('./db_setting');

var pool = db.mysql_pool(mysql);
//gcm을 보내는 경우
/*
	1. 유저가 질문을 하면			유저 -> 매니저
	2. 매니저가 답변을 달면		매니저 -> 유저
	3. 유저가 구매를 하면			유저 -> 매니저

*/

//datas = userId, managerId, workshopNum, gcmFlag

/*
	results.err = 에러 유무
	results.push = push 유무
	results.message = 메시지
	results.gcmToken = 토큰
	results.success = 1;
	results.results = {};

*/
exports.gcmSend = function (datas, callback) {
	var results = {};
	results.push = 1;
	reuslts.err = 0;

	pool.getConnection(function (err, conn) {
		if (err) {
		   console.error('err', err);
		   results.success = 1;
		   results.message = "get Connection error";
		   results.err = 1;
		   results.results = {};
		   callback(results);
		} else {
			if (datas[3] == 1) {	//매니저가 유저에게	답변 - 매니저 아이디 알고 있음
				var gcmSQL = "SELECT GCM.GCM_TOKEN AS gcmToken, USER.GCM_PUSH AS gcmPush FROM GCM, USER WHERE USER.ID = GCM.USER_ID AND USER.ID = ?";
				conn.query(gcmSQL, datas[0], function (gsErr, gsRow) {
					if(gsErr) {
						console.error('gsErr = ', gsErr);
						results.success = 1;
						results.message = "gcm sql error";
						results.err = 1;
						results.results = {};
						callback(results);
					} else {
						if( gsRow[0].gcmPush == 0) {	//푸시 안받음.
							results.push = 0;
							results.success = 1;
							reuslts.message = 'no push';
							results.err = 0;
							results.results = {};
							conn.release();
							callback(results);
						} else {		//푸시 받음.
							results.success = 1;
							reuslts.message = "문의에 대한 답변이 도착했습니다.//"+datas[2];
							results.gcmToken = gsRow[0].gcmToken;
							results.results = {};
							conn.release();
							callback(results);
						}
					}
				});
			} else if (datas[3] == 0 || datas[3] == 2){	//유저가 매니저에게 push할 경우 매니저 아이디를 알아 냄.
				var wnSQL = 'SELECT WORKSHOP.USER_USER_ID AS managerId, WORKSHOP.WORKSHOP_TITLE FROM WORKSHOP WHERE WORKSHOP_NO=?';
				conn.query(wnSQL, datas[2], function (wnErr, wnRow) {
					if(wnErr) {
						console.error('wnErr = ', wnErr);
						results.success = 1;
						results.message = 'gcm workshop select sql error';
						results.results = {};
						results.err = 1;
						conn.release();
						callback(results);
					} else {
						datas[1] = wnRow[0].managerId;
						if(datas[3] == 0) {					//유저가 매니저에게 질문
							var gcmSQL = "SELECT GCM.GCM_TOKEN AS gcmToken, USER.GCM_PUSH AS gcmPush FROM GCM, USER WHERE USER.ID = GCM.USER_ID AND USER.ID = ?";
							conn.query(gcmSQL, datas[1], function (gsErr, gsRow) {
								if(gsErr) {
									console.error('gsErr = ', gsErr);
									results.success = 1;
									results.message = "gcm sql error";
									results.err = 1;
									results.results = {};
									callback(results);
								} else {
									if( gsRow[0].gcmPush == 0) {	//푸시 안받음.
										results.push = 0;
										results.success = 1;
										reuslts.message = 'no push';
										results.err = 0;
										results.results = {};
										conn.release();
										callback(results);
									} else {
										results.success = 1;
										reuslts.message = "공방에 대한 질문이 도착했습니다.//"+datas[2]+"//"+datas[0];
										results.gcmToken = gsRow[0].gcmToken;
										results.results = {};
										conn.release();
										callback(results);
									}
								}
							});
						} else if (datas[3] == 2) {	//유저가 구매한 경우
							var gcmSQL = "SELECT GCM.GCM_TOKEN AS gcmToken, USER.GCM_PUSH AS gcmPush FROM GCM, USER WHERE USER.ID = GCM.USER_ID AND USER.ID = ?";
							conn.query(gcmSQL, datas[1], function (gsErr, gsRow) {
								if(gsErr) {
									console.error('gsErr = ', gsErr);
									results.success = 1;
									results.message = "gcm sql error";
									results.err = 1;
									results.results = {};
									callback(results);
								} else {
									if( gsRow[0].gcmPush == 0) {	//푸시 안받음.
										results.push = 0;
										results.success = 1;
										reuslts.message = 'no push';
										results.err = 0;
										results.results = {};
										conn.release();
										callback(results);
									} else {
										results.success = 1;
										reuslts.message = "공방에 대한 구매가 도착했습니다.//"+datas[2]+"//"+datas[0];
										results.gcmToken = gsRow[0].gcmToken;
										results.results = {};
										conn.release();
										callback(results);
									}
								}
							});
						}
					}
				});
			} else {		//에러.
				conn.release();
				results.success = 1;
				results.message = 'gcmFlag error';
				results.err = 2;
				results.results = {}
				callback(results);
			}
		}
	});
}