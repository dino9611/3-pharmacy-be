const pool = require('../connections/db');

// ! READ
// ? revenue
exports.readRevenue = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;

  let sql, parameters;
  try {
    console.log(req.params.time);
    if (req.params.time === 'yearly') {
      sql = `
      SELECT CAST(SUM(totalPrice) AS SIGNED) totalRevenueRp, YEAR(checkedOutAt) year
      FROM 3_pharmacy.order
      WHERE !(status = 'checkout' OR status = 'paymentRej' OR status IS NULL)
      GROUP BY year
      ORDER BY checkedOutAt ASC;`;
    } else if (req.params.time === undefined) {
      sql = `
      SELECT CAST(SUM(totalPrice) AS SIGNED) totalRevenueRp, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
      FROM 3_pharmacy.order
      WHERE checkedOutAt BETWEEN ? AND LAST_DAY(?)
      AND !(status = 'checkout' OR status = 'paymentRej' OR status IS NULL)
      GROUP BY month, year
      ORDER BY checkedOutAt ASC;`;
      parameters = [yearMonthStart, yearMonthEnd];
    } else return res.status(404).json({ message: 'Not Found' });
    let [result] = await pool.query(sql, parameters);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};
exports.readPotentialRevenue = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;

  let sql;
  try {
    if (req.params.time === 'yearly') {
      sql = `
      SELECT CAST(SUM(totalPrice) AS SIGNED) totalPotentialRevenueRp, YEAR(checkedOutAt) year
      FROM 3_pharmacy.order
      GROUP BY year
      ORDER BY checkedOutAt ASC;`;
    } else if (req.params.time === undefined) {
      sql = `
      SELECT CAST(SUM(totalPrice) AS SIGNED) totalPotentialRevenueRp, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
      FROM 3_pharmacy.order
      WHERE checkedOutAt BETWEEN ? AND LAST_DAY(?)
      GROUP BY month, year
      ORDER BY checkedOutAt ASC;`;
    } else return res.status(404).json({ message: 'Not Found' });
    let [result] = await pool.query(sql, [yearMonthStart, yearMonthEnd]);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

// ? sales report
exports.readOrders = async (req, res) => {
  let { status } = req.body;

  let sql, parameters;
  try {
    sql = `
    SELECT *
    FROM 3_pharmacy.order
    WHERE status IN (?);`;
    const allStatus = [
      'checkout',
      'paymentAcc',
      'paymentRej',
      'processing',
      'otw',
      'delivered',
    ];
    status = status.filter((el) => allStatus.includes(el));
    parameters = status;
    const [result] = await pool.query(sql, parameters);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};
