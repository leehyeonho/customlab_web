var mysql = require('mysql');

// var connection = mysql.createConnection({
//   host      : 'localhost',
//   port:3306,
//   user      : 'root',
//   password  : 'customlab11',
//   database  : 'customlab'
// });

var connection = mysql.createConnection({
  host      : 'localhost',
  port:3306,
  user      : 'root',
  password  : 'genesys11',
  database  : 'genesys'
});


connection.connect();

// connection.query()

// connection.end();

module.exports = connection;
