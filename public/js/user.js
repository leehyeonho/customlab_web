var db = require('./connection.js');
const ejs = require('ejs');
const bcrypt = require('bcrypt-nodejs');
// var session = require('express-session');

//Logger
var winston = require('winston');
var winstonDaily = require('winston-daily-rotate-file');
var moment = require('moment');
function timeStampFormat() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ');
};
var logger = new (winston.createLogger)({
    transports: [
        new (winstonDaily)({
            name: 'info-file',
            filename: './log/server',
            datePattern: '_yyyy-MM-dd.log',
            colorize: false,
            maxsize: 50000000,
            maxFiles: 1000,
            level: 'info',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        }),
        new (winston.transports.Console)({
            name: 'debug-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ],
    exceptionHandlers: [
        new (winstonDaily)({
            name: 'exception-file',
            filename: './log/exception',
            datePattern: '_yyyy-MM-dd.log',
            colorize: false,
            maxsize: 50000000,
            maxFiles: 1000,
            level: 'error',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        }),
        new (winston.transports.Console)({
            name: 'exception-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ]
});

var sql = '';

exports.login = function (request, response) {
  var user_id = request.body.username;
  var password = request.body.password;
  db.query('select * from user_info where user_id = ?', [user_id], function (err, result) {
      if (err) {
        console.log('err :' + err);
      } else {
          if (result.length === 0) {
	    console.log("id 없음.");
            response.json({success: false, msg: '존재하지 않습니다.'})
          } else {
	      bcrypt.compare(password, result[0].password, function(err, res) {
		if (res) { // 비교 성공
		 request.session.user_id = result[0].user_id;
		 request.session.user_name = result[0].user_name;
		 request.session.user_tell = result[0].user_tell;
		 request.session.isLogined = true;
     request.session.save(function(){
       logger.info("로그인 성공 // user_id: " + request.session.user_id);
		   response.redirect('/');
		 });
		 //response.render('index', {session : request.session});
                } else { // 비교 실패
		    logger.info("로그인 실패(비밀번호 오류) // user_id: " + request.session.user_id);
		    response.redirect('/loginfail');
		  }
});
          }
        }
      });

}

exports.signup = function ( request, response ){
  var user = request.body;

  sql = 'select * from user_info where user_id = ?';
  db.query(sql, [user.user_id], function(err, isExist) {
    if(err) {
      logger.error("회원가입 에러(DB 접근 오류)");
    } else {
      if(isExist.length == 0){
          bcrypt.hash(user.password, null, null, function(err, hash) {
            sql = 'insert into user_info(user_id, password, user_name, user_tell, reg_date) values (?, ?, ?, ? , now())';
            db.query(sql, [user.user_id, hash, user.user_name, user.user_tell], function(err, result) {
            if(err) {
              logger.error("회원가입 에러(DB 삽입 오류)");
            } else {
              logger.info("회원가입 // user_id: " + user.user_id);
              response.redirect('/complete');
            }
            });
          });
      } else {
        logger.info("아이디 중복 // user_id: " + user.user_id);
      }
    }
  });
}

exports.logout = function ( request, response ){
  if(request.session.iskakao) {
    request.session.iskakao = false;
    request.logOut();
    // var headers = {
    //   'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    //
    // }
    //
    // var options = {
    //   url: "https://kapi.kakao.com/v1/user/logout",
    //   method: 'POST',
    //   'Authorization': 'Bearer ' + accessToken
    // }
    // request(options, function(error, response, body){
    //   if(error) {
    //     console.log("error 발생 : " + error);
    //   } else {
    //     var jsonObj = JSON.parse(body);
    //     console.log(jsonObj);
    //     // request.session.user_id = result[0].user_id;
    //  		// request.session.user_name = result[0].user_name;
    //  		// request.session.user_tell = result[0].user_tell;
    //  		// request.session.isLogined = true;
    //   }
    // });
  }
  if (request.isAuthenticated()) {
    console.log("로그인 상태");
  } else {
    console.log("로그아웃 상태");
  }

  request.session.destroy(function(){
    request.session;
  });

  response.redirect('/');
}
