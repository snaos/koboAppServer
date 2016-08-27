var express = require('express');
var router = express.Router();
var db = require('../models/db_users');

var gcm = require('node-gcm');
var apiKey = 'AIzaSyBUi5xASdP4fcowcVr-VWIYCj3aNkcncUE';

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//로그인
router.post('/login', function (req, res, next) {
	var user_id = req.body.userId;
	var userPw = req.body.userPw;
	var regId = req.body.regId;

	var datas = [user_id, userPw, regId];
	db.login(datas, function (results){
		req.session.user_id = results.userId;
		req.session.managerFlag = results.managerFlag
		res.json(results);
	})
});

//로그아웃
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.error('err', err);
            res.json({
                "success": 1,
                "message": "logout fail"
            })
        } else {
            res.json({
                "success": 1,
                "message": "logout success"
            });
        }
    });
});

router.get('/buy', function (req, res, next) {
	//var user_id = req.session.user_id;
	var user_id = 'snaos';

	db.buyList(user_id, function (results) {
		res.json(results);
	});
});

router.get('/buy/:buyNum', function (req, res, next){
	//var user_id = req.session.user_id;
	var user_id = 'snaos';
	var buyNum = req.params.buyNum;
	var datas = [user_id, buyNum];

	db.buyDetail(datas, function (results) {
		res.json(results);
	});

});

router.post('/signUp', function (req, res, next) {
	//아이디 비밀번호, 생년월일, 이메일, 휴대번호, 주소ㅛ, 이름, 성별
	var userId = req.body.userId;
	var pw = req.body.userPw;
	var email = req.body.email;
	var address = req.body.address;
	var userName = req.body.userName;
	var gender = req.body.gender;
	var birth = req.body.birth;
	var regId = req.body.regId;
	var userPhone = req.body.phone;
	var salt = 1;

	var datas = [userId, email, address, userName, gender, birth, pw, salt, userPhone];

	db.signUp(datas, regId, function (results) {
		if(results.message == 'sign up success'){
			//req.session.user_id = userId;
			//req.session.managerFlag = 0;
		}
		res.json(results);
	});
})

router.get('/question', function (req, res, next) {
	//var user_id = req.session.user_id;
	var user_id = 'snaos';

	db.uQuestion(user_id, function (results) {
		res.json(results);
	});
});

//150813 추가
//유저가 해당 공방을 구매한 기록이 있는지 없는지 확인
router.get('/buyRecord/:userId/:workshopNum', function (req, res, next) {
	var userId = req.params.userId;
	var workshopNum = req.params.workshopNum;

	var datas = [userId, workshopNum];

	db.buyRecord(datas, function ( results ) {
		res.json(results);
	})

});

module.exports = router;
