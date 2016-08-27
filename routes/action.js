var express = require('express');
var router = express.Router();
var db = require('../models/db_action');


//내가 좋아요 한 리스트
router.get('/like', function (req, res, next) {
	//var user_id = req.session.user_id;
 var user_id = 'snaos';
	db.likeList(user_id, function(results) {
		res.json(results);
	});
});

router.post('/like', function(req, res, next) {
	var workshop_num = req.body.workshopNum;
//	var user_id = req.session.user_id;
	var user_id = 'snaos';
	var datas = [workshop_num, user_id];

	db.like(datas, function(results){
		res.json(results);
	});
});

router.post('/unlike', function(req, res, next) {
	var workshop_num = req.body.workshopNum;
//	var user_id = req.session.user_id;
	var user_id = 'snaos';
	var datas = [workshop_num, user_id];

	db.unlike(datas, function(results){
		res.json(results);
	});
});

//url을 두개? 한개?
router.post('/push', function(req, res, next) {
	var push = req.body.push;
	//	var user_id = req.session.user_id;
	var user_id = 'snaos';
	var datas = [push, user_id];
	db.push(datas, function (results){
		res.json(results);
	});
});

//리뷰작성
router.post('/review', function (req, res, next) {
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var workshopNum = req.body.workshopNum;
	var reviewImage = req.files.reviewImage;
	var reviewTitle = 'review title';
	var reviewContent = req.body.reviewContent;
	var reviewScore = req.body.reviewScore;
	var datas = [user_id, workshopNum, reviewTitle, reviewContent, reviewScore,reviewImage];

	db.review(datas, function (results) {
		res.json(results);
	});
});

router.post('/review/delete', function (req, res, next){
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var reviewNum = req.body.reviewNum;
	var datas = [user_id, reviewNum ];

	db.reviewDelete(datas, function	(results) {
		res.json(results);
	});
});

router.post('review/modify', function (req, res , next) {
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var reviewNum = req.body.reviewNum;
	var reviewImage = req.files.reviewImage;
	var reviewTitle = req.body.reviewTitle;
	var reviewContent = req.body.reviewContent;
	var reviewScore = req.body.reviewScore;
	var datas = [user_id, reviewNum, reviewTitle, reviewcontent, reviewScore, reviewImage ];

	db.reviewModify(datas, function ( results ){
		res.json(results);
	});
});

router.get('/tag/:tag/:page', function (req, res, next) {
	var tag = req.params.tag;
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var page = req.params.page;
	var datas = [user_id, tag];
	db.tagSearch(datas,page, function (results) {
		res.json(results);
	});
});

module.exports = router;
