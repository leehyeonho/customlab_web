var db = require('./connection.js');
const ejs = require('ejs');
const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;

var sql = '';

const getHtml = async () => {
  try {
    return await axios.get("https://smartstore.naver.com/customlaboratory");
  } catch (error) {
    console.error(error);
  }
};

exports.view = function(request, response) {
  var tbl = request.query.tbl;
  var sql = "";
  if(tbl == 'product') {
    sql = 'SELECT * FROM product';
      db.query(sql, function(error, result) {
        getHtml()
          .then(html => {
            let ulList = [];
            const $ = cheerio.load(html.data);
            const $bodyList = $("ul.wOWfwtMC_3._3cLKMqI7mI._7iBijuoyJl").children("li.-qHwcFXhj0");
            $bodyList.each(function(i, elem) {
              ulList[i] = {
                  title: $(this).find('a._3BkKgDHq3l').text(),
                  url: $(this).find('a._3BkKgDHq3l').attr('href'),
                  image_url: $(this).find('img._25CKxIKjAk').attr('src'),
                  image_alt: $(this).find('img._25CKxIKjAk').attr('alt'),
                  price: $(this).find('div._23DThs7PLJ span._45HSXeff1y span.nIAdxeTzhx').text(),
                  sale: $(this).find('div._23DThs7PLJ strong span.nIAdxeTzhx').text(),
                  percent: $(this).find('strong.pT4bw14aV2').text()
              };
            });
            const data = ulList.filter(n => n.title);
            console.log(data);
            return data;
          })
          .then(res => response.render('sub', {session : request.session, data : result, naver : res, tbl : tbl}));
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

exports.history = function(request, response) {
  var year = request.query.year;
  console.log(year);
  sql = 'SELECT * FROM history WHERE year = ?';
  db.query(sql, [year], function(error, result) {
      response.render('years', {session : request.session, data : result});
  });
}
