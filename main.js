const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const passport = require('passport');
const request = require('request');

// kakao
const KakaoStrategy = require('passport-kakao').Strategy;

passport.use('kakao', new KakaoStrategy({
    clientID: '4aaf1a669526ce81793050bf7267a81c',
    callbackURL: 'http://customlab.site/oauth',     // 위에서 설정한 Redirect URI
  }, async (accessToken, refreshToken, profile, done) => {
    //console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
}))

// const favicon = require('serve-favicon');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
// Passport
app.use(passport.initialize());
app.use(passport.session());

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
var options = {
    host      : 'localhost',
    port:3306,
    user      : 'root',
    password  : 'customlab',
    database  : 'customlab'
};

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

// ejs
// const ejs = require('ejs');

// app.use(favicon('./public/images/favicon.ico'));
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

//kakao
app.get("/kakao", passport.authenticate("kakao"));
app.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successRedirect: "/",
    failureRedirect: "/sub.ejs?tbl=info"
  })
);

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

app.get('/favicon.ico', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
});

app.get('/signup', function(request, response){
  response.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
  fs.createReadStream("./html/signup.html").pipe(response);
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

app.use((req, res, next) => { // 404 처리 부분
  res.status(404).redirect('/404_error');
});

app.use((err, req, res, next) => {
  res.status(500).redirect('/500_error');
});

app.listen(port, () => console.log(`CUSTOM LAB WEB listening on port ${port}!`))
