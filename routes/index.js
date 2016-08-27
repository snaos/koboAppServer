var express = require('express');
var router = express.Router();

var db = require('../models/db_index');
var db_workshop = require('../models/db_workshop');
/*
	추가해야 할 부분 gcm
	데이터 셋팅.
	각 페이지 세션 제대로 세팅.

*/

router.get('/version', function (req, res, next) {
	res.json({
		"version" : '1.0'
	});
});

router.get('/categoryList', function (req, res, next) {
	db.categoryList(function (results) {
		res.json(results);
	});
});

router.get('/area', function (req, res, next) {
	db.areaList2(function (results) {
		res.json(results);
	});
});

//지역 공방
router.get('/area/:area3Name', function (req, res, next) {
	var area3Name = req.params.area3Name;
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var datas = [user_id, area3Name];
	db.areaWorkshop( datas, function (results) {
		db_workshop.workshopRating(results, function (rResults) {
			res.json(rResults);
		});
	});
});

//인스타처럼 사진뿌려주는 곳
router.get('/insta/:page', function (req, res, next) {
	var page = req.params.page;
	db.insta(page, function (results) {
		res.json(results);
	})
});

//그 사진 업로드
router.post('/insta', function (req, res, next) {
	var insta = req.files.instaImage;
	db.instaUp(insta, function (results) {
		res.json(results);
	});
});

//자세히 보기
router.get('/instaDetail/:instaBoardNum', function (req, res, next) {
	var instaBoardNum = req.params.instaBoardNum;

	db.instaDetail(instaBoardNum, function (results) {
		res.json(results);
	});
});

router.post('/insta/delete', function (req, res, next) {
	var instaBoardNum = req.body.instaBoardNum;

	//	var user_id = req.session.user_id;
	//var managerFlag = req.session.managerFlag;
	var managerFlag = 3;
	if(managerFlag == 3){
		db.instaDelete(instaBoardNum, function (results) {
			res.json(results);
		});
	} else {
		res.json({
			'success' : 1,
			'message' : 'no supervisor'
		});
	}
});

router.post('/categoryRegister', function (req, res, next) {
	var image = req.files.categoryImage;
	var categoryName = req.body.categoryName;
	var datas = [categoryName, image];

	db.categoryRegister(datas, function (results){
		res.json(results);
	});
});

module.exports = router;