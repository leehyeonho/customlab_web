var mysql = require('mysql');

var connection;
var connidx = 1;
switch (connidx) {
  case 1:
    connection = mysql.createConnection({
      host      : 'localhost',
      port:3306,
      user      : 'root',
      password  : 'customlab',
      database  : 'customlab'
    });
    break;
  case 2:
  connection = mysql.createConnection({
    host      : 'localhost',
    port:3306,
    user      : 'root',
    password  : '@@',
    database  : 'customlab'
  });
    break;
  default:

}
// var connection = mysql.createConnection({
//   host      : 'localhost',
//   port:3306,
//   user      : 'root',
//   password  : 'customlab',
//   database  : 'customlab'
// });

// var connection = mysql.createConnection({
//   host      : 'localhost',
//   port:3306,
//   user      : 'root',
//   password  : 'genesys11',
//   database  : 'genesys'
// });


connection.connect();

// connection.query()

// connection.end();

module.exports = connection;
