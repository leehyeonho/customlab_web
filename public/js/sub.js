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
  } else if (tbl == 'history') {
    sql = "SELECT * FROM history";
    db.query(sql, function(error, result) {
      sql = "SELECT year FROM history GROUP BY year ORDER BY year DESC";
      db.query(sql, function(error, result_year) {
        response.render('sub', {session : request.session, data : result, year : result_year, tbl : tbl});
        });
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
