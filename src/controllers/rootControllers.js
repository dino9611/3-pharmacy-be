const pool = require('../connections/db');

exports.getRoot = async (req, res, next) => {
  let conn, sql;
  try {
    conn = await pool.getConnection();

    sql = 'SHOW PROCESSLIST;';
    const [result] = await conn.query(sql);

    conn.release();
    res.status(200).json({ result });
  } catch (error) {
    conn.release();
    next(error);
  }
};
