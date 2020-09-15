var db = require('./connection.js');
const ejs = require('ejs');
var sql = '';

exports.view = function(request, response) {
  var tbl = request.query.tbl;
  var sql = "";
  if(tbl == 'info') {
    sql = 'SELECT * FROM professor';
      db.query(sql, function(error, result) {
        response.render('sub', {session : request.session, data : result, data_research : result_research, tbl : tbl});
        });
  } else if (tbl == 'history') {

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
