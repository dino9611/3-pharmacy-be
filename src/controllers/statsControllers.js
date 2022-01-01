const pool = require('../connections/db');

// ! READ
// ? revenue
exports.readRevenue = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;

  let conn, result, sql, parameters, potentialRevenueCondition;
  try {
    if (req.query.type === 'potential') potentialRevenueCondition = '';
    else
      potentialRevenueCondition = `AND status IN('paymentAcc', 'processing', 'otw', 'delivered')`;

    conn = await pool.getConnection();
    switch (req.query.time) {
      case 'recent':
        let prev = `
        SELECT CAST(SUM(cost + profit) AS SIGNED) revenue FROM
        (
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit
        FROM 3_pharmacy.order
        WHERE checkedOutAt BETWEEN (NOW() - INTERVAL 2 DAY) AND (NOW() - INTERVAL 1 DAY)
        ${potentialRevenueCondition}
        UNION ALL
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit
        FROM prescription
        WHERE expiredAt BETWEEN (NOW() - INTERVAL 2 DAY) AND (NOW() - INTERVAL 1 DAY)
        ${potentialRevenueCondition}
        ) unionResult;`;

        let curr = `
        SELECT CAST(SUM(cost + profit) AS SIGNED) revenue FROM
        (
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit
        FROM 3_pharmacy.order
        WHERE checkedOutAt BETWEEN NOW() - INTERVAL 1 DAY AND NOW()
        ${potentialRevenueCondition}
        UNION ALL
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit
        FROM 3_pharmacy.prescription
        WHERE expiredAt BETWEEN NOW() - INTERVAL 1 DAY AND NOW()
        ${potentialRevenueCondition}
        ) unionResult;`;

        const [prevResult] = await conn.query(prev);
        const [currResult] = await conn.query(curr);
        result =
          (currResult[0].revenue - prevResult[0].revenue) /
          prevResult[0].revenue;

        conn.release();
        return res.status(200).json(result);
      case 'monthly':
        sql = `
        SELECT SUM(cost) cost, SUM(profit) profit, month, year FROM
        (
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
        FROM 3_pharmacy.order
        WHERE checkedOutAt BETWEEN ? AND LAST_DAY(?)
        ${potentialRevenueCondition}
        GROUP BY month, year
        UNION ALL
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit, MONTH(expiredAt) month, YEAR(expiredAt) year
        FROM 3_pharmacy.prescription
        WHERE expiredAt BETWEEN ? AND LAST_DAY(?)
        ${potentialRevenueCondition}
        GROUP BY month, year
        ) unionResult
        GROUP BY month, year
        ORDER BY year, month ASC;`;
        parameters = [
          yearMonthStart,
          yearMonthEnd,
          yearMonthStart,
          yearMonthEnd,
        ];
        [result] = await conn.query(sql, parameters);

        conn.release();
        return res.status(200).json(result);
      case 'yearly':
        sql = `
        SELECT CAST(SUM(totalPriceRp + profitRp) AS SIGNED) totalRevenueRp, YEAR(checkedOutAt) year
        FROM 3_pharmacy.order
        WHERE TRUE
        ${potentialRevenueCondition}
        GROUP BY year
        ORDER BY checkedOutAt ASC;`;

        [result] = await conn.query(sql, parameters);

        conn.release();
        return res.status(200).json(result);
      default:
        return res.status(400);
    }
  } catch (error) {
    conn.release();
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

// ? sales report
