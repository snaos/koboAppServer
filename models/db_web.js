var mysql = require('mysql');
var crypto = require('crypto');
//imagemagick를 설치해야 easyimage 사용 가능
var easyimage = require('easyimage');
var forEach = require('async-foreach').forEach;
var fs = require('fs-extra');
var db = require('./db_setting');

var pool = db.mysql_pool(mysql);

var iterations = 1000;      //암호화 반복 횟수
var keylen = 24;    //암호화 후 생성되는 key 길이 설정

var ip = 'http://54.65.222.144'
var serverPath = '/home/ubuntu/workshop/';
var classPath = '/home/ubuntu/workshop/public/class/';
var thumbWidth = 250;
var thumbHeight = 250;


//datas = [userId, userPw];
exports.wLogin = function (datas, callback) {
    var results = {};
    var pw = datas[1];
    var userId = datas[0];
    results.success = -1;
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = {};
            callback(callbackDatas);
        } else {
            var loginSQL = 'SELECT PW, SALT, USER_ST, MANAGER_FL FROM USER WHERE ID=?';
            conn.query(loginSQL, userId, function (loginErr, loginRow) {
                if (loginErr) {
                    console.error('login sql error = ', loginErr);
                    results.message = "login sql error";
                    results.results = {};
                    conn.release();
                    callback(results);
                } else {
                    if (loginRow.length == 1) {
                        //아이디 존재
                        var salt = loginRow[0].SALT;
                        var key = crypto.pbkdf2Sync(pw, salt, iterations, keylen); //암호화
                        var pw_cryp = Buffer(key, 'binary').toString('hex');     //암호화된 값 생성.
                        var pwSQL = 'SELECT ID, GCM_PUSH FROM USER WHERE ID=? AND PW=?';
                        conn.query(pwSQL, [userId, pw_cryp], function (pwErr, pwRow) {
                            if (pwErr) {
                                console.error('login pw sql error = ', pwErr);
                                results.message = "login pw sql error";
                                results.results = {};
                                conn.release();
                                callback(results);
                            } else {
                                if (pwRow.length == 1) { //아이디 비번 맞음
                                    results.success = 1;
                                    results.message = "login success";
                                    results.results = loginRow[0];
                                    conn.release();
                                    callback(results);
                                } else {
                                    results.success = 3;
                                    results.message = "check password"
                                    results.results = loginRow[0];
                                    conn.release();
                                    callback(results);
                                }
                            }
                        });
                    } else {	//존재 x
                        results.success = 2;
                        results.message = 'check id';
                        results.results = loginRow[0];
                        conn.release();
                        callback(results);
                    }
                }
            });
        }
    });
}

//var wDatas = [workshopName, workshopTitle, workshopContent, workshopPrice, workshopPhone, difficulty, executionTime, workshopDescription, workshopLocation, workshopUser, area1, area2, area3, workshopImage];

exports.register = function (datas, callback) {
    var results = {};
    var image = datas.pop();
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = {};
            callback(callbackDatas);
        } else {
            var wiSQL = "INSERT INTO WORKSHOP(WORKSHOP_NM, WORKSHOP_TITLE, WORKSHOP_CONTENT, WORKSHOP_PRICE, WORKSHOP_PHONE, DIFFICULTY, EXECUTION_TIME, DESCRIPTION, LOCATION, USER_USER_ID,DEL_FL,HIT_NO,CATEGORY_CATEGORY_NO,AREA_NO, AREA2_NO, AREA3_NO) VALUES(?,?,?,?,?,?,?,?,?,?,'N',0,999,?,?,?)";
            conn.query(wiSQL, datas, function (wiErr, wiRow) {
                if (wiErr) {
                    console.error('wiErr = ', wiErr);
                    results.success = 2;
                    results.message = "workshop insert error";
                    conn.release();
                    callback(results);
                } else {
                    conn.query('SELECT LAST_INSERT_ID() AS workshopNum', function (liErr, liRow) {
                        if (liErr) {
                            console.error('liErr = ', liErr);
                            results.success = 2;
                            results.message = "last insert error";
                            conn.release();
                            callback(results);
                        } else {
                            results.workshopNum = liRow[0].workshopNum;
                            {
                                if (image.path) {	//이미지 하나
                                    var wvnoSQL = 'SELECT WORKSHOP_NO FROM WORKSHOP WHERE WORKSHOP_NM=? AND WORKSHOP_TITLE=? AND WORKSHOP_CONTENT=? AND WORKSHOP_PRICE=? AND WORKSHOP_PHONE=?';
                                    conn.query(wvnoSQL, [datas[0], datas[1], datas[2], datas[3], datas[4]], function (wenoErr, wenoRow) {
                                        if (wenoErr) {
                                            console.error('wenoErr  = ', wenoErr);
                                            results.success = 2;
                                            results.message = "workshop select sql error ";
                                            results.results = {};
                                            conn.release();
                                            callback(results);
                                        } else {
                                            var workshopNum = wenoRow[(wenoRow.length - 1)].WORKSHOP_NO;
                                            var image_path = ip + image.path.substring(6);
                                            var imageSQL = 'INSERT INTO WORKSHOP_IMAGE(WORKSHOP_WORKSHOP_NO, IMAGE_PATH) VALUES(?,?)';
                                            conn.query(imageSQL, [workshopNum, image_path], function (imageErr, imageRow) {
                                                if (imageErr) {
                                                    console.error('imageErr = ', imageErr);
                                                    results.success = 2;
                                                    results.message = "image insert error";
                                                    results.results = {
                                                        "workshopNum": workshopNum
                                                    };
                                                    conn.release();
                                                    callback(results);
                                                } else if (imageRow.affectedRows == 1) {
                                                    results.message = "workshop success";
                                                    results.success = 1;
                                                    results.results = {
                                                        "workshopNum": workshopNum
                                                    };
                                                    results.image = 1;
                                                    results.imagePath = serverPath + image.path;
                                                    conn.release();
                                                    callback(results);
                                                } else {
                                                    results.success = 1;
                                                    results.message = "image insert fail";
                                                    results.results = {
                                                        "workshopNum": workshopNum
                                                    };
                                                    conn.release();
                                                    callback(results);
                                                }
                                            });
                                        }
                                    });
                                } else if (image) {	//이미지 여러개
                                    var wvnoSQL = 'SELECT WORKSHOP_NO FROM WORKSHOP WHERE WORKSHOP_NM=? AND WORKSHOP_TITLE=? AND WORKSHOP_CONTENT=? AND WORKSHOP_PRICE=? AND WORKSHOP_PHONE=?';
                                    conn.query(wvnoSQL, datas, function (wenoErr, wenoRow) {
                                        if (wenoErr) {
                                            console.error('wenoErr  = ', wenoErr);
                                            results.success = 2;
                                            results.message = "workshop select sql error ";
                                            results.results = {};
                                            conn.release();
                                            callback(results);
                                        } else {
                                            var workshopNum = wenoRow[(wenoRow.length - 1)].WORKSHOP_NO;
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
                                                results.success = 2;
                                                results.message = "image insert error";
                                                results.results = {
                                                    "workshopNum": workshopNum
                                                };
                                                conn.release();
                                                callback(results);
                                            } else if (fail) {
                                                results.success = 1;
                                                results.message = "image insert fail";
                                                results.results = {
                                                    "workshopNum": workshopNum
                                                };
                                                conn.release();
                                                callback(results);
                                            } else {
                                                results.message = "workshop success";
                                                results.success = 1;
                                                results.results = {
                                                    "workshopNum": workshopNum
                                                };
                                                results.image = 1;
                                                results.imagePath = serverPath + image[0].path;
                                                conn.release();
                                                callback(results);
                                            }
                                        }
                                    });
                                } else {	//이미지 없음
                                    var wvnoSQL = 'SELECT WORKSHOP_NO FROM WORKSHOP WHERE WORKSHOP_NM=? AND WORKSHOP_TITLE=? AND WORKSHOP_CONTENT=? AND WORKSHOP_PRICE=? AND WORKSHOP_PHONE=?';
                                    conn.query(wvnoSQL, datas, function (wenoErr, wenoRow) {
                                        if (wenoErr) {
                                            console.error('wenoErr  = ', wenoErr);
                                            results.success = 2;
                                            results.message = "workshop select sql error ";
                                            results.results = {};
                                            conn.release();
                                            callback(results);
                                        } else {
                                            var workshopNum = wenoRow[(wenoRow.length - 1)].WORKSHOP_NO;
                                            results.success = 1;
                                            results.message = "workshop success";
                                            results.results = {
                                                "workshopNum": workshopNum
                                            };
                                            results.image = 0;
                                            results.imagePath = {};
                                            conn.release();
                                            callback(results);
                                        }
                                    });
                                }
                            }
                        }
                    });

                }
            });
        }
    });
}

exports.thumnailSetting = function (datas,workshopNum, callback) {
    var results = {};
    var thumbPath = 'public/thumbnail/thumbnail-' + datas.name;
    console.log('thumb datas = ', datas);
    easyimage.rescrop({
        src: serverPath + datas.path, dst: serverPath + thumbPath,
        width: thumbWidth, height: thumbHeight,
        x: 0, y: 0
    }).then(
        function (thumImage) {
            console.log('thumImage = ', thumImage);
            pool.getConnection(function (connErr, conn) {
                if (connErr) {
                    console.error('conErr = ', conErr);
                    results.message = "get Connection error";
                    results.results = {};
                    callback(callbackDatas);
                } else {
                    thumPath = ip + '/thumbnail/thumbnail-' + datas.name;
                    var thumSQL = 'UPDATE WORKSHOP SET WORKSHOP_THUMBNAIL=? WHERE WORKSHOP_NO=?'
                    conn.query(thumSQL, [thumPath, workshopNum], function (thumErr, thumRow) {
                        if (thumErr) {
                            console.error('thumErr = ', thumErr);
                            results.success = 2;
                            results.message = 'thum sql err';
                            conn.release();
                            callback(results);
                        } else {
                            results.success = 1;
                            results.message = 'thum set success';
                            conn.release();
                            callback(results);
                        }
                    });
                }
            });
        },
        function (easyImageErr) {
            console.error('easyImageErr = ', easyImageErr);
            results.success = 2;
            results.message = 'easyimage recrop err';
            conn.release();
            callback(results);
        }
    );
}

exports.managerList = function (callback) {
    var results = {};
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = {};
            results.success = 0;
            callback(callbackDatas);
        } else {
            var mlSQL = 'SELECT ID FROM USER WHERE MANAGER_FL=? AND USER_ST =?';
            conn.query(mlSQL, [1, 1], function (mlErr, mlRow) {
                if (mlErr) {
                    results.success = 2;
                    results.message = 'manager list select sql error';
                    results.results = [];
                    conn.release();
                    callback(results);
                } else {
                    results.success = 1;
                    results.message = 'manager list success';
                    results.results = mlRow;
                    conn.release();
                    callback(results);
                }
            });
        }
    });
}

//datas = classNm, classImage
exports.classAdd = function (datas, callback) {
    var results = {};
    var image = datas[1];
    pool.getConnection(function (connErr, conn) {
       if (connErr) {
             console.error('conErr = ', conErr);
             results.message = "get Connection error";
             results.results = {};
             results.success = 0;
             callback(callbackDatas);
        } else {
            var rPath = serverPath+image.path;
            fs.move(rPath, classPath+image.name, function (moveErr) {
                if(moveErr) {
                    console.error('moveErr = ', moveErr);
                    results.message = 'file move error';
                    results.success = 1;
                    results.results = {};
                    conn.release();
                    callback(results);
                 } else {
                    datas[1] = classPath+image.name;
                    var caSQL = 'INSERT INTO CLASS(CLASS_NM, CLASS_IMAGE) VALUES(?,?)';
                    conn.query(caSQL, datas, function (caErr, caRow) {
                        if(caErr) {
                            results.success = 1;
                            results.message = 'class insert sql error';
                            conn.release();
                            callback(results);
                        } else {
                            results.success = 1;
                            results.message = 'class insert success';
                            conn.release();
                            callback(results);
                        }
                    });
                 }
            });
        }
    });
}

exports.allWorkshop = function (callback) {
    var results = {};
    results.workshop = [];
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
              console.error('conErr = ', conErr);
              results.message = "get Connection error";
              results.results = {};
              results.success = 0;
              callback(callbackDatas);
        } else {
            var awlSQL = 'SELECT * FROM WORKSHOP';
            conn.query(awlSQL, function (awlErr, awlRow) {
                if(awlErr) {
                    console.error('awlErr = ', awlErr);
                    results.success = 0;
                    conn.release();
                    callback(results);
                } else {
                    results.workshop = awlRow;
                    results.success = 1;
                    conn.release();
                    callback(results);
                }
            });
        }
    })

}
