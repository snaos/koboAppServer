var mysql = require('mysql');
var async = require('async');
var fs = require('fs-extra');
var forEach = require('async-foreach').forEach;

var db = require('./db_setting');

var pool = db.mysql_pool(mysql);

var page_size = 10;
var ip = 'http://54.65.222.144'
var mainPath = '/home/ubuntu';
var serverPath = '/workshop/public';

exports.likeList = function (datas, callback) {
    var results = {};
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = [];
            callback(results);
        } else {
            var listListSQL = 'SELECT WORKSHOP_NO AS workshopNum, WORKSHOP.USER_USER_ID AS userNum, WORKSHOP_NM AS workshopName, DESCRIPTION AS description, WORKSHOP_THUMBNAIL AS thumbnailPath, WORKSHOP_PRICE AS price, CATEGORY_NM AS category, LOCATION AS location, AREA_NM AS area1, AREA2_NM AS area2, AREA3_NM AS area3 FROM WORKSHOP, CATEGORY, WORKSHOP_AREA1, WORKSHOP_AREA2, WORKSHOP_AREA3, RECOMMEND WHERE WORKSHOP.CATEGORY_CATEGORY_NO = CATEGORY.CATEGORY_NO AND WORKSHOP.AREA_NO = WORKSHOP_AREA1.AREA_NO AND WORKSHOP.AREA2_NO = WORKSHOP_AREA2.AREA2_NO AND WORKSHOP.AREA3_NO = WORKSHOP_AREA3.AREA3_NO AND RECOMMEND.USER_USER_ID = ?';
            conn.query(listListSQL, datas, function (likeListErr, likeListRow) {
                if (likeListErr) {
                    console.error('like list sql error = ', likeListErr);
                    results.success = 1;
                    results.message = "like list sql error";
                    results.results = [];
                    conn.release();
                    callback(results);
                } else {
                    results.success = 1;
                    results.message = 'like list success';
                    results.results = likeListRow;
                    conn.release();
                    callback(results);
                }
            });
        }
    });
}


//var datas = [workshop_num, user_id];
exports.like = function (datas, callback) {
    var results = {};
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = {};
            callback(results);
        } else {
            var likeSQL = 'INSERT INTO RECOMMEND( WORKSHOP_WORKSHOP_NO, USER_USER_ID) VALUES(?,?)';
            conn.query(likeSQL, datas, function (likeErr, likeRow) {
                if (likeErr) {
                    console.error('like sql error = ', likeErr);
                    results.success = 1;
                    results.message = "like sql error";
                    results.results = {};
                    conn.release();
                    callback(results);
                } else {
                    results.success = 1;
                    results.message = 'like success';
                    results.results = {};
                    conn.release();
                    callback(results);
                }
            });
        }
    });
}


//var datas = [workshop_num, user_id];
exports.unlike = function (datas, callback) {
    var results = {};
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = {};
            callback(results);
        } else {
            var likeSQL = 'DELETE FROM RECOMMEND WHERE WORKSHOP_WORKSHOP_NO=? AND USER_USER_ID=?';
            conn.query(likeSQL, datas, function (unlikeErr, unlikeRow) {
                if (unlikeErr) {
                    console.error('unlike sql error = ', unlikeErr);
                    results.success = 1;
                    results.message = "unlike sql error";
                    results.results = {};
                    conn.release();
                    callback(results);
                } else {
                    results.success = 1;
                    results.message = 'unlike success';
                    results.results = {};
                    conn.release();
                    callback(results);
                }
            });
        }
    });
}

 exports.push = function(datas, callback) {
    var results = {};
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = {};
            callback(results);
        } else {
            if(datas[0] == 'on'){
                datas[0] = 1;
            } else {
                datas[0] = 0;
            }
            var pcSQL = 'UPDATE USER SET GCM_PUSH=? WHERE ID=?';
            conn.query(pcSQL, datas, function (pcErr, pcRow) {
                if(pcErr){
                    console.error(pcErr);
                    results.success = 1;
                    results.message = 'push sql error';
                    conn.release();
                    callback(results);
                } else {
                    reuslts.success = 1;
                    results.message = 'push change success';
                    conn.release();
                    callback(results);
                }
            });
        }
    });
 }

//var datas = [user_id, workshopNum, reviewTitle, reviewContent, reviewScore, reviewImage];
exports.review = function (datas, callback) {
    if(datas[4] > 10 || datas[4] < 0) {
        var results = {};
        results.message = 'review score error';
        results.success = 1;
        results.results = {};
    } else {
        var  results = {};
        var image = datas.pop();
        pool.getConnection(function (connErr, conn) {
            if (connErr) {
                console.error('conErr = ', conErr);
                results.message = "get Connection error";
                results.results = {};
                callback(results);
            } else {
                var reviewSQL = 'INSERT INTO REVIEW(USER_USER_ID, WORKSHOP_WORKSHOP_NO, REVIEW_TITLE, REVIEW_CONTENT, REVIEW_SCORE, REVIEW_YMD) VALUES(?,?,?,?,?,NOW())';
                conn.query(reviewSQL, datas, function (reErr, reRow) {
                    if (reErr) {
                        console.error('reErr  = ', reErr);
                        results.success = 1;
                        results.message = "review insert sql error ";
                        results.results = {};
                        conn.release();
                        callback(results);
                    } else if (reRow.affectedRows == 1) {       //리뷰글이 insert 됨
                        var reviewScore = datas.pop();
                        if (image.path) {   //이미지가 하나일 경우 바로 image가 객체로 들어오므로 객체의 path를 확인해 봄
                            var rvnoSQL = 'SELECT REVIEW_NO FROM REVIEW WHERE USER_USER_ID=? AND WORKSHOP_WORKSHOP_NO=? AND REVIEW_TITLE=? AND REVIEW_CONTENT=?';
                            conn.query(rvnoSQL, datas, function (renoErr, renoRow) {
                                if (renoErr) {
                                    console.error('renoErr  = ', renoErr);
                                    results.success = 1;
                                    results.message = "review select sql error ";
                                    results.results = {};
                                    conn.release();
                                    callback(results);
                                } else {
                                    var reviewNum = renoRow[(renoRow.length - 1)].REVIEW_NO;
                                    var image_path = ip + image.path.substring(6);
                                    var imageSQL = 'INSERT INTO REVIEW_IMAGE(REVIEW_REVIEW_NO, IMAGE_PATH) VALUES(?,?)';
                                    conn.query(imageSQL, [reviewNum, image_path], function (imageErr, imageRow) {
                                        if (imageErr) {
                                            console.error('imageErr = ', imageErr);
                                            results.success = 1;
                                            results.message = "image insert error";
                                            results.results = {
                                                "reviewNum": reviewNum
                                            };
                                            conn.release();
                                            callback(results);
                                        } else if (imageRow.affectedRows == 1) {
                                            results.message = "review success";
                                            results.success = 1;
                                            results.results = {
                                                "reviewNum": reviewNum
                                            };
                                            conn.release();
                                            callback(results);
                                        } else {
                                            results.success = 1;
                                            results.message = "image insert fail";
                                            results.results = {
                                                "reviewNum": reviewNum
                                            };
                                            conn.release();
                                            callback(results);
                                        }
                                    });
                                }
                            });
                        } else if (image) { //이미지가 여러개일 경우 배열 형태이므로, 앞에서 객체확인을 했을때는 if문에 진입하지 않음. 그렇지만 image가 undefined가 아니기 때문에 진입
                            var rvnoSQL = 'SELECT REVIEW_NO FROM REVIEW WHERE USER_USER_ID=? AND WORKSHOP_WORKSHOP_NO=? AND REVIEW_TITLE=? AND REVIEW_CONTENT=?';
                            conn.query(rvnoSQL, datas, function (renoErr, renoRow) {
                                if (renoErr) {
                                    console.error('renoErr  = ', renoErr);
                                    results.success = 1;
                                    results.message = "review select sql error ";
                                    results.results = {};
                                    conn.release();
                                    callback(results);
                                } else {
                                    var reviewNum = renoRow[(renoRow.length - 1)].REVIEW_NO;
                                    var error = false;
                                    var fail = false;
                                    var imageErr;
                                    forEach(image, function (item, index, arr) {
                                        var image_path = ip + item.path.substring(6);
                                        var imageSQL = 'INSERT INTO REVIEW_IMAGE(REVIEW_REVIEW_NO, IMAGE_PATH) VALUES(?,?)';
                                        conn.query(imageSQL, [reviewNum, image_path], function (imageErr, imageRow) {
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
                                        results.results = {
                                            "reviewNum": reviewNum
                                        };
                                        conn.release();
                                        callback(results);
                                    } else if (fail) {
                                        results.success = 1;
                                        results.message = "image insert fail";
                                        results.results = {
                                            "reviewNum": reviewNum
                                        };
                                        conn.release();
                                        callback(results);
                                    } else {
                                        results.message = "review success";
                                        results.success = 1;
                                        results.results = {
                                            "reviewNum": reviewNum
                                        };
                                        conn.release();
                                        callback(results);
                                    }
                                }
                            });
                        } else {        //이미지가 없으면 undefined이므로 여기로 옴.
                            var rvnoSQL = 'SELECT REVIEW_NO FROM REVIEW WHERE USER_USER_ID=? AND WORKSHOP_WORKSHOP_NO=? AND REVIEW_TITLE=? AND REVIEW_CONTENT=?';
                            conn.query(rvnoSQL, datas, function (renoErr, renoRow) {
                                if (renoErr) {
                                    console.error('renoErr  = ', renoErr);
                                    results.success = 1;
                                    results.message = "review select sql error ";
                                    results.results = {};
                                    conn.release();
                                    callback(results);
                                } else {
                                    var reviewNum = renoRow[(renoRow.length - 1)].REVIEW_NO;
                                    results.success = 1;
                                    results.message = "review success";
                                    results.results = {
                                        "reviewNum": reviewNum
                                    };
                                    conn.release();
                                    callback(results);
                                }
                            });
                        }
                    } else {
                        results.success = 1;
                        results.message = "review insert sql fail ";
                        results.results = {};
                        conn.release();
                        callback(results);
                    }
                });
            }
        });
    }
}

// var datas = [user_id, reviewNum]
exports.reviewDelete = function (datas, callback) {
    var results = {};
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = {};
            callback(results);
        } else {
            var rSQL = 'SELECT USER_USER_ID FROM REVIEW WHERE REVIEW_NO=?';
            conn.query(rSQL, datas[1], function (rErr, rRow) {
                if (rErr) {
                    console.error('rErr = ', rErr);
                    results.success = 1;
                    results.message = "review select error";
                    results.results = {};
                    conn.release();
                    callback(results);
                } else {
                    var ripSQL = 'SELECT IMAGE_PATH FROM REVIEW_IMAGE WHERE REVIEW_REVIEW_NO=?';
                    conn.query(ripSQL, datas[1], function (ripErr, ripRow) {
                        if (ripErr) {
                            console.error('ripErr = ', ripErr)
                            results.success = 1;
                            results.message = "review image path query error";
                            results.results = {};
                            conn.release();
                            callback(results);
                        } else {
                            if (rRow[0].USER_USER_ID == datas[0]) {
                                var ridSQL = 'DELETE FROM REVIEW_IMAGE WHERE REVIEW_REVIEW_NO =?'
                                conn.query(ridSQL, datas[1], function (rdiErr, rdiRow) {
                                    if (rdiErr) {
                                        console.error('rdiErr = ', rdiErr)
                                        results.success = 1;
                                        results.message = "review image delete query error";
                                        results.results = {};
                                        conn.release();
                                        callback(results);
                                    } else {
                                        var rdSQL = 'DELETE FROM REVIEW WHERE REVIEW_NO=?';
                                        conn.query(rdSQL, datas[1], function (rdErr, rdRow) {
                                            if (rdErr) {
                                                console.error('rdErr = ', rdErr)
                                                results.success = 1;
                                                results.message = "review delete query error";
                                                results.results = {};
                                                conn.release();
                                                callback(results);
                                            } else {
                                                if (rdiRow.affectedRows != 0) {
                                                    async.each(ripRow, function (item, callback) {
                                                        var ipLength = ip.length;
                                                        var filePath = mainPath + serverPath + item.IMAGE_PATH.substring(ipLength);
                                                        fs.remove(filePath, function (removeErr) {
                                                            if (removeErr) {
                                                                console.error('file remove error!!!');
                                                            }
                                                        });
                                                    });
                                                }
                                                conn.release();
                                                results.success = 1;
                                                results.message = "review delete success";
                                                results.results = {};
                                                callback(results);
                                            }
                                        });
                                    }
                                });
                            } else {
                                results.success = 1;
                                results.message = "no reviewer user";
                                results.results = {};
                                conn.release();
                                callback(results);
                            }
                        }
                    });
                }
            });
        }
    });
}


//var datas =  [user_id, reviewNum, reviewTitle, reviewcontent, reviewScore, reviewImage ];
exports.reviewModify = function (datas, callback) {
    if(datas[4] > 10 || datas[4] < 0) {
        var results = {};
        results.message = 'review score error';
        results.success = 1;
        results.results = {};
    } else {
        var results = {};
        var image = datas.pop();
        pool.getConnection(function (connErr, conn) {
            if (connErr) {
                console.error('conErr = ', conErr);
                results.message = "get Connection error";
                results.results = {};
                callback(results);
            } else {
                var ruSQL = 'SELECT USER_USER_ID FROM REVIEW WHERE REVIEW_NO = ?';
                conn.query(ruSQL, datas[1], function (ruErr, ruRow) {
                    if (ruErr) {
                        console.error('ruErr = ', ruErr);
                        results.message = 'review select sql error ';
                        results.success = 1;
                        results.results = {};
                        conn.release();
                        callback(results);
                    } else {
                        if (ruRow[0].USER_USER_ID != datas[0]) {
                            var rmSQL = 'update REVIEW set REVIEW_CONTENT=?, REVIEW_TITLE=?, REVIEW_SCORE=? WHERE REVIEW_NO=?';
                            conn.query(rmSQL, [datas[3], datas[2], datas[4], datas[1]], function (rmErr, rmRow) {
                                if (rmErr) {
                                    console.error('rmErr = ', rmErr);
                                    results.message = 'review update sql error';
                                    results.success = 1;
                                    results.results = {};
                                    conn.release();
                                    callback(results);
                                } else {
                                    var ridSQL = 'DELETE FROM REVIEW_IMAGE WHERE REVIEW_REVIEW_NO =?'
                                    conn.query(ridSQL, datas[1], function (rdiErr, rdiRow) {
                                        if (rdiErr) {
                                            console.error('rdiErr = ', rdiErr)
                                            results.success = 1;
                                            results.message = "review image delete query error";
                                            results.results = {};
                                            conn.release();
                                            callback(results);
                                        } else {
                                            if (rdiRow.affectedRows != 0) {
                                                async.each(ripRow, function (item, callback) {
                                                    var ipLength = ip.length;
                                                    var filePath = mainPath + serverPath + item.IMAGE_PATH.substring(ipLength);
                                                    fs.remove(filePath, function (removeErr) {
                                                        if (removeErr) {
                                                            console.error('file remove error!!!');
                                                        }
                                                    });
                                                });
                                            }
                                            //리뷰 이미지 넣기.
                                            if (image.path) {   //이미지가 하나일 경우 바로 image가 객체로 들어오므로 객체의 path를 확인해 봄
                                                var rvnoSQL = 'SELECT REVIEW_NO FROM REVIEW WHERE USER_USER_ID=? AND WORKSHOP_WORKSHOP_NO=? AND REVIEW_TITLE=? AND REVIEW_CONTENT=?';
                                                var reviewNum = datas[1];
                                                var image_path = ip + image.path.substring(6);
                                                var imageSQL = 'INSERT INTO REVIEW_IMAGE(REVIEW_REVIEW_NO, IMAGE_PATH) VALUES(?,?)';
                                                conn.query(imageSQL, [reviewNum, image_path], function (imageErr, imageRow) {
                                                    if (imageErr) {
                                                        console.error('imageErr = ', imageErr);
                                                        results.success = 1;
                                                        results.message = "image insert error";
                                                        results.results = {
                                                            "reviewNum": reviewNum
                                                        };
                                                        conn.release();
                                                        callback(results);
                                                    } else if (imageRow.affectedRows == 1) {
                                                        results.message = "review modify success";
                                                        results.success = 1;
                                                        results.results = {
                                                            "reviewNum": reviewNum
                                                        };
                                                        conn.release();
                                                        callback(results);
                                                    } else {
                                                        results.success = 1;
                                                        results.message = "image insert fail";
                                                        results.results = {
                                                            "reviewNum": reviewNum
                                                        };
                                                        conn.release();
                                                        callback(results);
                                                    }
                                                });

                                            } else if (image) { //이미지가 여러개일 경우 배열 형태이므로, 앞에서 객체확인을 했을때는 if문에 진입하지 않음. 그렇지만 image가 undefined가 아니기 때문에 진입
                                                var reviewNum = datas[1];
                                                var error = false;
                                                var fail = false;
                                                var imageErr;
                                                forEach(image, function (item, index, arr) {
                                                    var image_path = ip + item.path.substring(6);
                                                    var imageSQL = 'INSERT INTO REVIEW_IMAGE(REVIEW_REVIEW_NO, IMAGE_PATH) VALUES(?,?)';
                                                    conn.query(imageSQL, [reviewNum, image_path], function (imageErr, imageRow) {
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
                                                    results.results = {
                                                        "reviewNum": reviewNum
                                                    };
                                                    conn.release();
                                                    callback(results);
                                                } else if (fail) {
                                                    results.success = 1;
                                                    results.message = "image insert fail";
                                                    results.results = {
                                                        "reviewNum": reviewNum
                                                    };
                                                    conn.release();
                                                    callback(results);
                                                } else {
                                                    results.message = "review modify success";
                                                    results.success = 1;
                                                    results.results = {
                                                        "reviewNum": reviewNum
                                                    };
                                                    conn.release();
                                                    callback(results);
                                                }
                                            } else {        //이미지가 없으면 undefined이므로 여기로 옴.
                                                var reviewNum = datas[1];
                                                results.message = "review modify success";
                                                results.success = 1;
                                                results.results = {
                                                    "reviewNum": reviewNum
                                                };
                                                conn.release();
                                                callback(results);
                                            }

                                            //이미지 넣기 끝
                                        }
                                    });
                                }
                            });
                        } else {
                            results.success = 1;
                            results.message = "no reviewer user";
                            results.results = {};
                            conn.release();
                            callback(results);
                        }
                    }
                });
            }
        });
    }
}

exports.tagSearch = function(datas,page, callback) {
    var results ={};

    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.error('conErr = ', conErr);
            results.message = "get Connection error";
            results.results = [];
            callback(results);
        } else {
            var tsSQL = 'SELECT WORKSHOP.WORKSHOP_NO AS workshopNum, USER_USER_ID AS userName, WORKSHOP_NM AS workshopName, DESCRIPTION AS description, WORKSHOP_THUMBNAIL AS thumbnailPath, WORKSHOP_PRICE AS price, CATEGORY_NM AS category, LOCATION AS location, AREA_NM AS area1, AREA2_NM AS area2, AREA3_NM AS area3, (SELECT COUNT(*) FROM RECOMMEND WHERE WORKSHOP_WORKSHOP_NO = workshopNum AND USER_USER_ID = ?) AS likeStatus, TAG_NM AS tagName, TAG_NO AS tagNum FROM WORKSHOP, CATEGORY, WORKSHOP_AREA1, WORKSHOP_AREA2, WORKSHOP_AREA3, TAG WHERE WORKSHOP.CATEGORY_CATEGORY_NO = CATEGORY.CATEGORY_NO AND WORKSHOP.AREA_NO = WORKSHOP_AREA1.AREA_NO AND WORKSHOP.AREA2_NO = WORKSHOP_AREA2.AREA2_NO AND WORKSHOP.AREA3_NO = WORKSHOP_AREA3.AREA3_NO AND TAG.WORKSHOP_NO = WORKSHOP.WORKSHOP_NO AND TAG_NM like ?'
            conn.query(tsSQL,[datas[0], '%'+datas[1]+'%'], function (tsErr, tsRow) {
                if(tsErr) {
                    console.error('tsErr = ', tsErr);
                    results.message = 'tag search sql error';
                    results.success = 1;
                    results.results = [];
                    conn.release();
                    callback(results);
                } else {
                    var total_cnt = tsRow.length;
                    var total_page = Math.ceil(total_cnt / page_size);
                    var start_num = (page-1)*page_size;
                    var end_num = (page * page_size) -1;
                    results.results = [];
                    if(page == 1 && total_page > 0){ //첫페이지
                        var pageData = [];
                        for(var i = 0; (i<page_size) && i< (total_cnt);i++){
                            pageData[i] = tsRow[i];
                        }
                        results.success = 1;
                        results.message = 'tag search success'
                        results.results = pageData;
                        conn.release();
                        callback(results);
                    } else if (page > total_page || total_page == 0){ //페이지가 없음
                        conn.release();
                        results.message = "page over";
                        results.succss = 1;
                        callback(results);
                    }else { //그냥 페이지.
                        var pageData = [];
                        if(end_num > total_cnt){
                            end_num = total_cnt-1;
                        }
                        for(var i = 0; i<end_num -start_num+1; i++){
                            pageData[i] = tsRow[i+start_num];
                        }
                        results.success = 1;
                        results.message = 'tag search success'
                        results.results = pageData;
                        conn.release();
                        callback(results);
                    }
                }
            });
        }
    });
}

//var datas = [push, user_id];
exports.pushSetting = function (datas, callback) {
    var results = {};
    pool.getConnection(function (connErr, conn) {
        if(connErr) {
            console.error('conErr = ', conErr);
                results.success = 1;
                 results.message = "get Connection error";
                 results.results = {};
                 callback(results);
            } else {
                var psSQL = 'UPDATE USER set GCM_PUSH=? WHERE ID=?';
                conn.query(psSQL, datas, function (psErr, psRow) {
                    if(psErr) {
                        console.error('psErr = ', psErr);
                        results.success = 1;
                        results.message = "gcm update sql error";
                        conn.release();
                        callback(results);
                    } else if(psRow.affectedRows == 1){
                        results.success = 1;
                        results.message = "push change success";
                        conn.release();
                        callback(results);
                    } else {
                        results.success = 1;
                        results.message = "gcm update sql error";
                        conn.release();
                        callback(results);
                    }
                })
            }
    });
}
