var express = require('express');
var router = express.Router();
var db = require('../models/db_workshop');
var db_gcm = require('../models/db_gcm');
var db_manager = require('../models/db_manager');
var gcm = require('node-gcm');

var apiKey = 'AIzaSyBUi5xASdP4fcowcVr-VWIYCj3aNkcncUE';

/*
	해야 하는 것
	매니저인지 확인하여 아니면 수정같은거 못하게
	managerCheck로 확인.
*/

router.get('/', function (req, res, next) {
	res.json({
		"a":12
	});
});


//카테고리 해당 공방 리스트
router.get('/category/:categoryNum/:page', function (req, res, next) {
	var categoryNum = req.params.categoryNum;
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var page = req.params.page;
	var datas = [user_id, categoryNum	];
	db.categoryWorkshop(datas,page, function(results) {
		db.workshopRating(results, function (rResults) {
			res.json(rResults);
		});
	});
});


//공방 상세 보기
router.get('/detail/:workshop_num', function (req, res, next) {
	var workshop_num = req.params.workshop_num;
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	db.detailWorkshop(workshop_num,user_id, function (results) {
		res.json(results);
	})
});

//인기 공방 보기. 인기 공방은 구매량과 좋아요 수
router.get('/popular/:page', function (req, res, next){
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var page = req.params.page;
	db.popular( user_id, page,function (results) {
		db.workshopRating(results, function (rResults) {
					res.json(rResults);
		});
	});
})

//질문 화면 보기
router.get('/question/:workshopNum', function (req, res, next) {
	var workshopNum = req.params.workshopNum;
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var datas = [user_id, workshopNum];
	db.questionList(datas, function(results) {
		res.json(results);
	})
});

//질문 하기
router.post('/question', function (req, res, next) {
	var workshopNum = req.body.workshopNum;
	var qContent = req.body.qContent;
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var datas = [workshopNum, qContent, user_id];
	db.question(datas, function(results) {
		var managerId = results.results.managerId;

		res.json(results);
	});
});


router.get('/review/:workshopNum/:page', function (req, res, next){
	var workshopNum = req.params.workshopNum;
	var page = req.params.page;
	var datas = [workshopNum, page];

	db.reviewList(datas, function(results) {
		res.json(results);
	})
});

router.post('/addDay', function (req, res, next) {
	var remainNum = req.body.remainNum;
	var days = req.body.days;
	var workshopNum = req.body.workshopNum;
	var user_id = req.session.user_id;
	var datas = [remainNum, days, workshopNum];
	var managerData = [workshopNum, user_id];
	db_manager.managerCheck(managerData, function (mcResults) {
		if(mcResults.manager > 0){
			db.addDay(datas, function(results) {
				res.json(results);
			})
		} else {
			res.json({
				'success' : 1,
				'message' : 'no manager'
			})
		}
	});
});

router.get('/days/:workshopNum', function (req,res,next) {
	var workshopNum = req.params.workshopNum;

	db.days(workshopNum, function(results) {
		res.json(results);
	});
});

router.post('/deleteDay', function (req, res, next) {
	var workshopNum = req.body.workshopNum;
	var day = req.body.day;
	var datas = [workshopNum, day];

	var user_id = req.session.user_id;
	var managerData = [workshopNum, user_id];
	db_manager.managerCheck(managerData, function (mcResults) {
		if(mcResults.manager > 0){
			db.deleteDay(datas, function (results) {
					res.json(results);
				});
		} else {
			res.json({
				'success' : 1,
				'message' : 'no manager'
			})
		}
	});
});

//해당 매니저의 간단 공방 리스트. 사진, 이름, 공방번호만 전송
router.get('/simpleList/:managerId', function (req, res, next ){
	var managerId = req.params.managerId;

	db.workshopList(managerId, function (results) {
		res.json(results);
	});
});

//세세한 리스트.
router.get('/detailList/:managerId/:page', function (req, res, next ){
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var managerId = req.params.managerId;
	var datas = [user_id, managerId];
	var page = req.params.page;
	db.workshopDetailList(datas, page,function (results) {
		db.workshopRating(results, function (rResults) {
					res.json(rResults);
		});
	});
});
//해당 공방의 사진 리스트
router.get('/imageList/:workshopNum', function (req, res, next) {
	var workshopNum = req.params.workshopNum;
	db.imageList(workshopNum, function (results){
		res.json(results);
	});
});


module.exports = router;
