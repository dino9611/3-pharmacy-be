const pool = require('../connections/db');

// ! READ
// ? revenue
exports.readRevenue = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;

  let sql, parameters;
  try {
    if (req.params.time === 'yearly') {
      sql = `
      SELECT CAST(SUM(totalPriceRp + profitRp) AS SIGNED) totalRevenueRp, YEAR(checkedOutAt) year
      FROM 3_pharmacy.order
      WHERE status NOT IN ('checkout', 'paymentRej', 'cart')
      GROUP BY year
      ORDER BY checkedOutAt ASC;`;
    } else if (req.params.time === undefined) {
      sql = `
      SELECT CAST(SUM(totalPriceRp + profitRp) AS SIGNED) totalRevenueRp, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
      FROM 3_pharmacy.order
      WHERE checkedOutAt BETWEEN ? AND LAST_DAY(?)
      AND status NOT IN ('checkout', 'paymentRej', 'cart')
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
      SELECT CAST(SUM(totalPriceRp + profitRp) AS SIGNED) totalPotentialRevenueRp, YEAR(checkedOutAt) year
      FROM 3_pharmacy.order
      GROUP BY year
      ORDER BY checkedOutAt ASC;`;
    } else if (req.params.time === undefined) {
      sql = `
      SELECT CAST(SUM(totalPriceRp + profitRp) AS SIGNED) totalPotentialRevenueRp, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
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
  let { status } = req.query;
  console.log(req.query.status.split(','));

  let sql, parameters;
  try {
    // sql = `
    // SELECT *
    // FROM 3_pharmacy.order
    // WHERE status IN (?);`;
    // const allStatus = [
    //   'checkout',
    //   'paymentAcc',
    //   'paymentRej',
    //   'processing',
    //   'otw',
    //   'delivered',
    // ];
    // parameters = status.filter((el) => allStatus.includes(el));
    // const [result] = await pool.query(sql, parameters);

    // res.status(200).json(result);
    res.status(200).json(status);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

exports.readCartedItem = async (req, res) => {
  let sql;
  try {
    sql = `
    SELECT SUM(qty) qtySum, isDeleted 
    FROM 3_pharmacy.order
    JOIN cart_item ON id = order_id
    WHERE status = 'cart'
    GROUP BY isDeleted;`;
    const [result] = await pool.query(sql);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

exports.readSalesSuccessRate = async (req, res) => {
  let sql;
  try {
    // SELECT CAST(SUM(totalPriceRp + profitRp) AS SIGNED) successRate, status, DATE(checkedOutAt) date
    // FROM 3_pharmacy.order
    // WHERE status NOT IN ('cart', 'checkout')
    // GROUP BY status IN ('paymentRej'), DATE(checkedOutAt)
    // ORDER BY checkedOutAt ASC;
    sql = `
    SELECT COUNT(id) count, status, DATE(checkedOutAt) date
    FROM 3_pharmacy.order
    WHERE status NOT IN ('cart', 'checkout')
    GROUP BY status IN ('paymentRej'), DATE(checkedOutAt)
    ORDER BY checkedOutAt ASC;`;
    const [result] = await pool.query(sql);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};
