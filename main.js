const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const passport = require('passport');
const request = require('request');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// kakao
const KakaoStrategy = require('passport-kakao').Strategy;

passport.use('kakao', new KakaoStrategy({
    clientID: '4aaf1a669526ce81793050bf7267a81c',
    callbackURL: '/oauth',     // 위에서 설정한 Redirect URI
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // console.log(profile);
      // console.log(profile.id);
      done(null, profile);
    } catch (error) {
      console.error(error);
      done(error);
    }
}))

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

//cookie,session
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

//multer
const multer = require('multer');
var storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, './public/images/gallery/')
},
//파일이름 설정
filename: function (req, file, cb) {
cb(null, Date.now() + "-" + file.originalname)
}

})

var storage_gallery = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, './public/images/gallery/')
},
//파일이름 설정
filename: function (req, file, cb) {
cb(null, Date.now() + "-" + file.originalname)
}

})

//파일 업로드 모듈
var upload = multer({ storage: storage })
var upload_g = multer({ storage: storage_gallery })

// var options = {
//     host      : 'localhost',
//     port:3306,
//     user      : 'root',
//     password  : 'genesys11',
//     database  : 'genesys'
// };
// var options = {
//     host      : 'localhost',
//     port:3306,
//     user      : 'root',
//     password  : 'customlab',
//     database  : 'customlab'
// };

var options;
var connidx = 1;
switch (connidx) {
  case 1:
    options = {
      host      : 'localhost',
      port:3306,
      user      : 'root',
      password  : 'customlab',
      database  : 'customlab'
    };
    break;
  case 2:
  options = {
    host      : 'localhost',
    port:3306,
    user      : 'root',
    password  : '',
    database  : 'customlab'
  };
    break;
  default:

}

var sessionStore = new MySQLStore(options);
app.use(cookieParser());
app.use(session({
  secret: 'g1e2n3e4s5y6s7',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 24000 * 60 * 60
  }
}));
app.use(bodyParser.urlencoded({extended: false}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// ejs
// const ejs = require('ejs');


const fs = require('fs');
const ejs = require('ejs');
var board = require('./public/js/board.js');
var user = require('./public/js/user.js');
var index = require('./public/js/index.js');
var sub = require('./public/js/sub.js');
app.set('view engine', 'ejs');
app.set('views', './public/views');



const port = 80

//index.html
app.get('/', function(request, response) {
  index.index(request, response);
});

var client_id = 'YOUR_CLIENT_ID';
var client_secret = 'YOUR_CLIENT_SECRET';
var state = "RAMDOM_STATE";
var redirectURI = encodeURI("YOUR_CALLBACK_URL");
var api_url = "";
app.get('/naverlogin', function (req, res) {
  api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
   res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
   res.end("<a href='"+ api_url + "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>");
 });

 app.get('/callback', function (req, res) {
    code = req.query.code;
    state = req.query.state;
    api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
     + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
     };
    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
        res.end(body);
      } else {
        res.status(response.statusCode).end();
        console.log('error = ' + response.statusCode);
      }
    });
  });

app.get('/kakao', passport.authenticate('kakao'));

app.get(
  '/oauth',
  passport.authenticate('kakao', {
    failureRedirect: "/sub.ejs?tbl=info"
  }), (req, res) => {
    req.session.user_id = req.user.id;
 		req.session.user_name = req.user.username;
 		req.session.isLogined = true;
    req.session.iskakao = true;
    // if (req.isAuthenticated()) {
    //   console.log("로그인 상태");
    // } else {
    //   console.log("로그아웃 상태");
    // }
    res.redirect('/complete');
  });

app.get('/kakaoPay', function(req, res) {
  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    'Authorization': 'KakaoAK b980142b0d3b61c70c01646deb852459'
  };

  let params = {
    'cid' : 'TC0ONETIME',
    'partner_order_id' : 'partner_order_id',
    'partner_user_id' : 'partner_user_id',
    'item_name' : encodeURI('초코파이'),
    'quantity' : 1,
    'total_amount' : 2200,
    'tax_free_amount' : 200,
    'approval_url' : '/sub.ejs?tbl=info',
    'cancel_url' : '/sub.ejs?tbl=service',
    'fail_url' : '/sub.ejs?tbl=reference'
  };

  let options = {
    url: "https://kapi.kakao.com/v1/payment/ready",
    method: 'POST',
    headers: headers,
    form: params
  };

  request(options, function(error, response, body){
    if (!error && response.statusCode === 200) {
        console.log(JSON.parse(body));
        res.redirect(JSON.parse(body).next_redirect_pc_url);
    } else if(error) {
      console.log("error 발생 : " + error);
    }
  });
});

//sub
app.get('/sub.ejs', function(request, response) {
  sub.view(request, response);
  // response.render('sub', {session : request.session, tbl : request.query.tbl});
});

app.get('/board.ejs', function(request, response){
  board.home(request, response);
});

app.post('/write', function(request, response){
  board.write(request, response);
});

app.post('/delete', function(request, response){
  board.delete(request, response);
});

app.get('/board_write.ejs', function(request, response) {
  response.render('board_write', {session: request.session, tbl : request.query.tbl});
});

app.post('/search', function(request, response) {
  board.search(request, response);
});

app.get('/board_delete', function(request, response){
  board.delete(request, response);
});

app.get('/board_view.ejs', function(request, response){
  board.view(request, response);
});

app.get('/board_editview.ejs', function(request, response){
  board.editView(request, response);
});

app.post('/edit', upload_g.array('imgFile'), function(request, response){
  board.edit(request, response);
});

app.post('/login', function(request, response){
  user.login(request, response);
});

app.get('/logout', function(request, response){
  user.logout(request,response);
});

app.post('/signup', function(request, response){
  user.signup(request, response);
});

app.post('/upload', upload_g.array('imgFile'), function(request, response){
  if(request.files.length == 0) {
    if(request.body.tbl == 2) {
      response.redirect('/alert?key=nofile&tbl=2');
    } else {
      board.write(request, response);
    }
  } else
  board.upload(request, response);
});

app.get('/years', function(request, response) {
  sub.history(request, response);
});

app.get('/complete', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
  fs.createReadStream("./html/complete.html").pipe(response);
});

app.get('/signup', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
  fs.createReadStream("./html/signup.html").pipe(response);
});

app.get('/loginForm', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
  fs.createReadStream("./html/loginForm.html").pipe(response);
});

app.get('/loginfail', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
  fs.createReadStream("./html/loginfail.html").pipe(response);
});

app.get('/alert', function(request, response){
    response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
    fs.createReadStream("./html/alert.html").pipe(response);
});

app.get('/404_error', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
  fs.createReadStream("./html/404_error.html").pipe(response);
});

app.get('/500_error', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
  fs.createReadStream("./html/500_error.html").pipe(response);
});

// app.use((req, res, next) => { // 404 처리 부분
//   res.status(404).redirect('/404_error');
// });

// app.use((err, req, res, next) => {
//   console.log("ERROR : " + err);
//   res.status(500).redirect('/500_error');
// });

app.listen(port, () => console.log(`CUSTOM LAB WEB listening on port ${port}!`))
