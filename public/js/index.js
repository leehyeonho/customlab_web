var db = require('./connection.js');
const ejs = require('ejs');
var sql = '';

exports.index = function(request, response) {
  var cnt = 0;
  sql = 'SELECT count(*) as cnt FROM bbs_notice';
  db.query(sql, function(err, result_notice_cnt) {
    cnt = result_notice_cnt[0].cnt;
  });
  if(cnt-4 < 0) {
    sql = 'SELECT id, title, content, date_format(date, "%Y") as YYYY, date_format(date, "%m-%d") as mmdd FROM bbs_notice ORDER BY id DESC';
  } else {
    sql = 'SELECT id, title, content, date_format(date, "%Y") as YYYY, date_format(date, "%m-%d") as mmdd FROM bbs_notice ORDER BY id DESC LIMIT 0, 4';
  }
  db.query(sql, function(err, result_notice) {
    sql = 'SELECT count(*) as cnt FROM bbs_gallery';
    db.query(sql, function(err, result_gallery_cnt) {
      cnt = result_gallery_cnt[0].cnt;
    });
    if(cnt-2 < 0) {
      sql = 'SELECT id, title, img, date_format(date, "%Y") as YYYY, date_format(date, "%m-%d") as mmdd FROM bbs_gallery ORDER BY id DESC';
    } else {
      sql = 'SELECT id, title, img, date_format(date, "%Y") as YYYY, date_format(date, "%m-%d") as mmdd FROM bbs_gallery ORDER BY id DESC LIMIT 0, 2';
    }
    db.query(sql, function(err, result_gallery) {
      response.render('index', {session : request.session, data_notice : result_notice, data_gallery : result_gallery});
    });
  });

}
