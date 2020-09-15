var db = require('./connection.js');
const ejs = require('ejs');
var sql = '';

exports.view = function(request, response) {
  var tbl = request.query.tbl;
  var sql = "";
  if(tbl == 'product') {
    sql = 'SELECT * FROM product';
      db.query(sql, function(error, result) {
        response.render('sub', {session : request.session, data : result, tbl : tbl});
        });
  } else {
    response.render('sub', {session : request.session, tbl : request.query.tbl});
  }
}

exports.publication = function(request, response) {
  var tbl = request.query.tbl;
  var year = request.query.year;
  sql = "SELECT * FROM publication WHERE tblname = '" + tbl + "' and year = " + year + " ORDER BY id";
  db.query(sql, function(error, result) {
    response.render('publication', {session : request.session, data : result, tbl : tbl});
    });
}
