const pool = require('../connections/db');
const schedule = require('node-schedule');

const job = schedule.scheduleJob('*/1 * * * *', async (fireDate) => {
  // const job = schedule.scheduleJob('*/10 * * * * *', async (fireDate) => {
  // console.log('scheduler:' + fireDate);
  let sql, conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // * loop through prescription
    sql = `
    SELECT id, expiredAt, status FROM prescription
    WHERE (status = 'paymentRej')
    OR (status = 'waitingPayment' AND expiredAt < NOW());`;
    const [result] = await conn.query(sql);
    // console.log('result', result);
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
      } else if (status === 'waitingPayment') {
        sql = `
        UPDATE prescription
        SET status = 'expired'
        WHERE id = ?;`;
      }
      // * update prescription status
      await conn.query(sql, _prescription_id);

      // * update inventory
      sql = 'CALL handle_prescription_payment_fail(?);';
      await conn.query(sql, _prescription_id);
    }

    await conn.commit();
    conn.release();
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.log(error);
  }
});
