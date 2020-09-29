var db = require('./connection.js');
const ejs = require('ejs');

var sql = '';

exports.home = function(request, response) {
  if (request.query.tbl == "1") {
	sql = 'SELECT count(*) as cnt FROM bbs_notice';
    } else if (request.query.tbl == "2") {
	sql = 'SELECT count(*) as cnt FROM bbs_gallery';
    } else if (request.query.tbl == "3") {
	sql = 'SELECT count(*) as cnt FROM bbs_free';
    }
  db.query(sql, function(error, result) {
    var totalCount = result[0].cnt;
    if (request.query.tbl == "1") {
      sql = 'SELECT id, author, title, content, hit, date_format(date,"%Y-%m-%d") as date FROM bbs_notice ORDER BY id DESC LIMIT ?, 10';

    } else if (request.query.tbl == "2") {
      sql = 'SELECT id, author, title, content, img, hit, date_format(date,"%Y-%m-%d") as date FROM bbs_gallery ORDER BY id DESC LIMIT ?, 10';

    } else if (request.query.tbl == "3") {
      sql = 'SELECT id, author, title, content, hit, date_format(date,"%Y-%m-%d") as date FROM bbs_free ORDER BY id DESC LIMIT ?, 10';
    }

    db.query(sql, [((request.query.pageNum-1) * 10)], function(error, results) {
      var totalPage = totalCount / 10;
      if (totalCount % 10 > 0) {
        totalPage++; // 10개로 나눠도 남으면 페이지 하나 더
      }
      var startPage = ((request.query.pageNum  -1) / 10) * 10 + 1;
      var endPage = startPage + 10 -1;
      if( endPage > totalPage) {
        endPage = totalPage;
      }
      endPage = parseInt(endPage);
      response.render('board', {session : request.session, totalCount : totalCount, pageNum : request.query.pageNum, start : startPage, end : endPage, data : results, tbl : request.query.tbl});
      });

    });
}

exports.write = function(request, response) {
  var author = request.body.author;
  var title = request.body.title;
  var content = request.body.content;
  if (request.body.tbl == "1") {
    sql = 'INSERT INTO bbs_notice(author, title, content) values (?, ?, ?)';
    } else if (request.body.tbl == "2") {
      sql = 'INSERT INTO bbs_gallery(author, title, content) values (?, ?, ?)';
    } else if (request.body.tbl == "3") {
      sql = 'INSERT INTO bbs_free(author, title, content) values (?, ?, ?)';
    }
  db.query(sql, [author, title, content], function(error, result) {
    if(error) {
      console.log(error);
    }
	if(request.body.tbl == "1") {
	  response.redirect('/board.ejs?tbl=1&pageNum=1');
	} else if(request.body.tbl == "2") {
	  response.redirect('/board.ejs?tbl=2&pageNum=1');
	} else if(request.body.tbl == "3") {
	  response.redirect('/board.ejs?tbl=3&pageNum=1');
	}
    });
}

exports.upload = function(request, response) {
  var author = request.body.author;
  var title = request.body.title;
  var content = request.body.content;
  sql = 'INSERT INTO bbs_gallery(author, title, content, img) values (?, ?, ?, ?)';
  db.query(sql, [author, title, content, request.file.path.substring(6)], function(error, result) {
    if(error) {
      console.log(error);
    }else {
      console.log("post")
      console.log(request.file)
      console.log(request.file.path.substring(6))
  	  response.redirect('/board.ejs?tbl=2&pageNum=1');
  	}
    });
}

exports.view = function(request, response) {
  var tbl = request.query.tbl;
  if (tbl == "1") {
      sql = 'SELECT author, title, content, hit, date_format(date,"%Y-%m-%d") as date FROM bbs_notice where id = ?';

    } else if (tbl == "2") {
      sql = 'SELECT author, title, content, img, hit, date_format(date,"%Y-%m-%d") as date FROM bbs_gallery where id = ?';

    } else if (tbl == "3") {
      sql = 'SELECT author, title, content, hit, date_format(date,"%Y-%m-%d") as date FROM bbs_free where id = ?';
    }

  db.query(sql, [request.query.id], function(error, result) {
      if (tbl == "1") {
      sql = 'SELECT id, title FROM bbs_notice WHERE id < ? ORDER BY id DESC LIMIT 1';
    } else if (tbl == "2") {
      sql = 'SELECT id, title FROM bbs_gallery WHERE id < ? ORDER BY id DESC LIMIT 1';
    } else if (tbl == "3") {
      sql = 'SELECT id, title FROM bbs_free WHERE id < ? ORDER BY id DESC LIMIT 1';
    }
    db.query(sql, [request.query.id], function(error, pre) {
      if (tbl == "1") {
      sql = 'SELECT id, title FROM bbs_notice WHERE id > ? ORDER BY id LIMIT 1';
    } else if (tbl == "2") {
      sql = 'SELECT id, title FROM bbs_gallery WHERE id > ? ORDER BY id LIMIT 1';
    } else if (tbl == "3") {
      sql = 'SELECT id, title FROM bbs_free WHERE id > ? ORDER BY id LIMIT 1';
    }
    db.query(sql, [request.query.id], function(error, next) {
      sql = "SELECT dir FROM image WHERE id = ? AND tbl = ?";
      db.query(sql, [request.query.id, tbl], function(error, images) {
      response.render('board_view', {session : request.session, data : result, tbl : tbl, pre : pre, next : next, id : request.query.id, images : images});
      });
    });
    });
    });
    if (tbl == "1") {
      sql = 'UPDATE bbs_notice SET hit = hit + 1 where id = ?';
    } else if (tbl == "2") {
      sql = 'UPDATE bbs_gallery SET hit = hit + 1 where id = ?';
    } else if (tbl == "3") {
      sql = 'UPDATE bbs_free SET hit = hit + 1 where id = ?';
    }

  db.query(sql, [request.query.id], function(error, result) {
    });
}

exports.editView = function(request, response) {
  sql = 'SELECT id, author, title, content, hit, date_format(date,"%Y-%m-%d") as date FROM bbs_free WHERE id = ?';
  db.query(sql, [request.query.id], function(error, result) {
    response.render('board_editview', {data : result});
    });
}

exports.edit = function(request, response) {
  var title = request.body.title;
  var content = request.body.content;
  var id = request.body.id;
  sql = 'UPDATE bbs_free SET title = ?, content = ? where id = ?';
  db.query(sql, [title, content, id], function(error, result) {
    response.redirect('/board_view.ejs?id=' + id);

    });
}

exports.delete = function(request, response) {
  var tbl = request.body.tbl;
  var id = request.body.id;
  if(tbl == "1") {
    sql = 'DELETE FROM bbs_notice WHERE id = ?';
  } else if(tbl == "2") {
    sql = 'DELETE FROM bbs_gallery WHERE id = ?';
  } else if(tbl == "3") {
    sql = 'DELETE FROM bbs_free WHERE id = ?';
  }
  db.query(sql, [id], function(error, result) {
    response.redirect('/board.ejs?tbl=' + tbl + '&pageNum=1');
    });
}

exports.search = function(request, response) {
  var totalCount = 0;
  var search = "\"%" + request.body.search + "%\"";
  var type = request.body.findType;
  var tbl = request.body.tbl;
  var tblname = "";
  if(tbl == "1") {
    tblname = "bbs_notice";
  } else if(tbl == "2") {
      tblname = "bbs_gallery";
  } else if(tbl == "3") {
      tblname = "bbs_free";
  }
  switch (type) {
    case "total":
    sql = 'SELECT count(*) as cnt FROM ' + tblname + ' where title like ' + search + ' OR author like ' + search + ' OR content like ' + search;
    break;
    case "title":
    sql = 'SELECT count(*) as cnt FROM ' + tblname + ' where title like ' + search;
    break;
    case "name":
    sql = 'SELECT count(*) as cnt FROM ' + tblname + ' where author like ' + search;
    break;
    case "content":
    sql = 'SELECT count(*) as cnt FROM ' + tblname + ' where content like ' + search;
    break;
    default:
  }
  db.query(sql, function(error, result) {
      totalCount = result[0].cnt;
  });
  switch (type) {
    case "total":
    sql = 'SELECT id, author, title, content, hit, date_format(date, "%Y-%m-%d") as date FROM ' + tblname + ' where title like ' + search + ' OR author like ' + search + ' OR content like ' + search;
    break;
    case "title":
    sql = 'SELECT id, author, title, content, hit, date_format(date, "%Y-%m-%d") as date FROM ' + tblname + ' where title like ' + search;
    break;
    case "name":
    sql = 'SELECT id, author, title, content, hit, date_format(date, "%Y-%m-%d") as date FROM ' + tblname + ' where author like ' + search;
    break;
    case "content":
    sql = 'SELECT id, author, title, content, hit, date_format(date, "%Y-%m-%d") as date FROM ' + tblname + ' where content like ' + search;
    break;
    default:
  }
    db.query(sql,function(error, results) {
      var totalPage = totalCount / 10;
      if (totalCount % 10 > 0) {
        totalPage++; // 10개로 나눠도 남으면 페이지 하나 더
      }
      var startPage = 1;
      var endPage = startPage + 10 -1;
      if( endPage > totalPage) {
        endPage = totalPage;
      }
      endPage = parseInt(endPage);
      response.render('board_search', {session : request.session, totalCount : totalCount, pageNum : 1, start : startPage, end : endPage, data : results, tbl : tbl, spl : request.body.search, type : type});
	});
}





// else if(tbl == 'product') {
//  sql = "SELECT * FROM product ORDER BY id DESC";
//  db.query(sql, function(error, result) {
//    sql = "SELECT count(*) as cnt FROM product";
//    db.query(sql, function(error, result_cnt) {
//      response.render('sub/sub', {session : request.session, data : result, cnt : result_cnt[0].cnt, data_research : result_research, tbl : tbl});
//      });
//    });
// }
