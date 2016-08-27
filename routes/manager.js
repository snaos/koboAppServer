var express = require('express');
var router = express.Router();
var db = require('../models/db_manager');
var db_gcm = require('../models/db_gcm');

var gcm = require('node-gcm');
var apiKey = 'AIzaSyBUi5xASdP4fcowcVr-VWIYCj3aNkcncUE';

/*
	해야 하는 것
	매니저인지 확인하여 아니면 수정같은거 못하게
	managerCheck로 확인.

	//datas = [workshopNum, managerId];
*/



//질문리스트 보기
router.get('/question', function (req, res, next) {
//	var user_id = req.session.user_id;
//	var managerFlag = req.session.managerFlag;
	var managerId = 'manager';
	/*if(managerFlag > 0){
// 만약 매니저이면
		db.mQuestion(managerId, function (results){
			res.json(results);
		});
	} else {
		res.json({
			'success' : 1,
			'message' : 'no manager',
			'results' : []
		});
	}*/
	db.mQuestion(managerId, function (results){
		res.json(results);
	});
});

//질문 상세 보기
router.get('/question/:workshopNum/:userId', function (req, res, next) {
	var workshopNum = req.params.workshopNum;
	var userId = req.params.userId;
//	var user_id = req.session.user_id;
//	var managerFlag = req.session.managerFlag;
	var managerId = 'manager';
	/*
	if(managerFlag > 0){
		var datas = [managerId, userId, workshopNum];
		db.mQuestionDetail(datas, function (results){
			res.json(results);
		});
	} else {
		res.json({
			'success' : 1,
			'message' : 'no manager',
			'results' : []
		});
	}*/
	var datas = [managerId, userId, workshopNum];
	db.mQuestionDetail(datas, function (results){
		res.json(results);
	});

});

//답변 달기.
router.post('/question', function (req, res, next) {
	var workshopNum = req.body.workshopNum;
	var userId = req.body.userId;
	var questionCotent = req.body.questionCotent;
	var managerId = 'manager';
//	var user_id = req.session.user_id;
	//var managerFlag = req.session.managerFlag;
	/*if(managerFlag > 0){
		var datas = [managerId, userId, workshopNum, questionCotent];
		db.mQuestionWrite(datas, function (results){
			res.json(results);
		});
	} else {
		res.json({
			'success' : 1,
			'message' : 'no manager',
		});
	}*/
	var datas = [managerId, userId, workshopNum, questionCotent];
	db.mQuestionWrite(datas, function (results){
		res.json(results);
	});

});

//공방 사진 수정 요청
router.post('/image', function (req, res, next) {
		var managerId = 'manager';
	//	var user_id = req.session.user_id;
		//var managerFlag = req.session.managerFlag;

	var workshopImage = req.files.workshopImage;
	var workshopNum = req.body.workshopNum;
	var datas = [workshopImage, workshopNum];

	var managerData = [workshopNum, managerId];

	db.managerCheck(managerData, function(mcResults) {
		if(mcResults.manager == 1) {
			db.imageModify(datas, function (results) {
				res.json(results);
			});
		} else {
			res.json({
				'message' : 'no manager',
				'success' : 1
			});
		}
	});
});

//공방 내용 수정
router.post('/content', function (req, res, next){
	var workshopContent = req.body.workshopContent;
	var workshopNum = req.body.workshopNum;
	var datas = [workshopContent, workshopNum];
	//	var user_id = req.session.user_id;
	//var managerFlag = req.session.managerFlag;
	var managerId = 'manager';
	var managerData = [workshopNum, managerId];

	db.managerCheck( managerData, function (mcResults) {
		if(mcResults == 1){
			db.contentModify(datas, function (results) {
				res.json(results);
			});
		} else {
			res.json({
				'message' : 'no manager',
				'success' : 1
			});
		}
	});
});


module.exports = router;
