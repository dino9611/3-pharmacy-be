const pool = require('../connections/db');
const schedule = require('node-schedule');

// const job = schedule.scheduleJob('*/1 * * * * *', function (fireDate) {
//   console.log('hello');
// });
const job = schedule.scheduleJob('*/2 * * * *', async (fireDate) => {
  // console.log('hello' + fireDate);
  let sql, conn;
  try {
    conn = await pool.getConnection();

    // * loop through prescription
    sql = `
    SELECT id, expiredAt, status FROM prescription
    WHERE (status = 'paymentRej')
    OR (status = 'imgAcc' AND expiredAt < NOW());`;
    const [result] = await conn.query(sql);
    // console.log(result);
    // console.log(
    //   result[0].expiredAt.toISOString().slice(0, 19).replace('T', ' ')
    // );
    for (let i = 0; i < result.length; i++) {
      const _prescription_id = result[i].id;
      const status = result[i].status;
      if (status === 'paymentRej') {
        sql = `
        UPDATE prescription
        SET status = 'rejected'
        WHERE id = ?;`;
      } else if (status === 'imgAcc') {
        sql = `
        UPDATE prescription
        SET status = 'expired'
        WHERE id = ?;`;
      }
      // * update prescription status
      await conn.query(sql, _prescription_id);

      // * update inventory
      sql = 'CALL handle_prescription_payment_fail(?)';
      await conn.query(sql, _prescription_id);
    }
    conn.release();
  } catch (error) {
    conn.release();
    console.log(error);
  }
});
