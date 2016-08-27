var express = require('express');
var router = express.Router();

var db_web = require('../models/db_web');
var db_index = require('../models/db_index');

router.get('/register', function (req, res, next) {
	db_index.areaList(function(results) {
		db_web.managerList(function(mResults){
			res.render('workshopRegister', {
				title: 'workshopRegister',
				area1 : results.area1,
				area2 : results.area2,
				area3 : results.area3,
				manager : mResults.results
			});
		});
	});
});

router.post('/register', function (req, res, next) {
	var userId = req.body.userId;		//관리자 아이디
	var pw = req.body.userPw;				//관리자 비밀번호
	var workshopImage = req.files.workshopImage;
	var workshopName = req.body.workshopName;
	var workshopTitle = req.body.workshopTitle;
	var workshopContent = req.body.workshopContent;
	var workshopPrice = req.body.workshopPrice;
	var workshopPhone = req.body.workshopPhone;
	var difficulty = req.body.difficulty;
	var executionTime = req.body.executionTime;
	var workshopDescription = req.body.workshopDescription;
	var workshopLocation = req.body.workshopLocation;
	var workshopUser = req.body.workshopUser;		//공방 주인
	var area1 = req.body.area1value;
	var area2 = req.body.area2value;
	var area3 = req.body.area3value;
	var thumbnail = req.files.thumbnail;
	var wDatas = [workshopName, workshopTitle, workshopContent, workshopPrice , workshopPhone, difficulty, executionTime, workshopDescription, workshopLocation, workshopUser, area1, area2, area3, workshopImage];
	var datas = [userId, pw];
	db_web.wLogin(datas, function (results) {
		if(results.success = 1){
			if(results.results.MANAGER_FL == 3){
				db_web.register(wDatas, function (rResults) {
					if(rResults.success == 2) {
						res.send('<script>alert("등록 실패!!");history.back();</script>')
					} else if(thumbnail.path){		//썸네일을 등록했으면 만듬.
						db_web.thumnailSetting( thumbnail,rResults.workshopNum, function (tResults){
							res.render('registerOk',{});
						});
					} else {//썸네일 없음
						res.render('registerOk', {})
					}
				});
			} else {
				res.send('<script>alert("관리자가 아닙니다!!");history.back();</script>')
			}
		} else {
			res.send('<script>alert("로그인 실패!!");history.back();</script>') //history.back() == 이전 페이지로
		}
	});
});

router.post('/classAdd', function (req, res, next) {
	var classImage = req.files.classImage;
	var className = req.body.classNm;
	var datas = [classNm, classImage];
	db_web.classAdd(datas, function (results) {
		res.json(results);
	});
});


router.get('/main', function (req, res, next) {
	res.render('main/workshopMain', {});
});

router.get('/AllworkshopList', function(req, res, next ) {
	db_web.allWorkshop(function (results ){
		res.json(results.workshop);
	});
});

module.exports = router;
