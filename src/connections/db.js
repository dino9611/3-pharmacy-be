const mysql = require('mysql2');

const pool = mysql.createPool({
  //port: 3306,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
});

pool.getConnection((err, conn) => {
  if (err) {
    conn.release();
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + conn.threadId);
  conn.release();
});

// pool.on('acquire', function (connection) {
//   console.log('Connection %d acquired', connection.threadId);
// });
// pool.on('release', function (connection) {
//   console.log('Connection %d released', connection.threadId);
// });

module.exports = pool.promise();
