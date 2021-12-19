const pool = require('../connections/db');

// ! READ
exports.readRevenue = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;

  let sql;
  try {
    sql = `
		SELECT CAST(SUM(totalPrice) AS SIGNED) totalRevenueRp, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
		FROM 3_pharmacy.order
		WHERE checkedOutAt BETWEEN ? AND LAST_DAY(?)
		AND !(status = 'checkout' OR status = 'paymentRej' OR status IS NULL)
		GROUP BY month, year
		ORDER BY checkedOutAt ASC;`;
    let [result] = await pool.query(sql, [yearMonthStart, yearMonthEnd]);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
exports.readPotentialRevenue = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;

  let sql;
  try {
    sql = `
		SELECT CAST(SUM(totalPrice) AS SIGNED) totalPotentialRevenueRp, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
		FROM 3_pharmacy.order
		WHERE checkedOutAt BETWEEN ? AND LAST_DAY(?)
		GROUP BY month, year
		ORDER BY checkedOutAt ASC;`;
    let [result] = await pool.query(sql, [yearMonthStart, yearMonthEnd]);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
