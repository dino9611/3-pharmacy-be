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
        SELECT SUM(totalPrice) cost, SUM(profitRp) profit
        FROM 3_pharmacy.order
        WHERE checkedOutAt BETWEEN (NOW() - INTERVAL 2*7 DAY) AND (NOW() - INTERVAL 1*7 DAY)
        ${potentialRevenueCondition}
        UNION ALL
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit
        FROM prescription
        WHERE expiredAt BETWEEN (NOW() - INTERVAL 2*7 DAY) AND (NOW() - INTERVAL 1*7 DAY)
        ${potentialRevenueCondition}
        ) unionResult;`;

        let curr = `
        SELECT CAST(SUM(cost + profit) AS SIGNED) revenue FROM
        (
        SELECT SUM(totalPrice) cost, SUM(profitRp) profit
        FROM 3_pharmacy.order
        WHERE checkedOutAt BETWEEN NOW() - INTERVAL 1*7 DAY AND NOW()
        ${potentialRevenueCondition}
        UNION ALL
        SELECT SUM(totalPriceRp) cost, SUM(profitRp) profit
        FROM 3_pharmacy.prescription
        WHERE expiredAt BETWEEN NOW() - INTERVAL 1*7 DAY AND NOW()
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
        SELECT SUM(totalPrice) cost, SUM(profitRp) profit, MONTH(checkedOutAt) month, YEAR(checkedOutAt) year
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
        SELECT CAST(SUM(totalPrice + profitRp) AS SIGNED) totalRevenueRp, YEAR(checkedOutAt) year
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

// ? read sales by product category
exports.readSalesByCategory = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;
  let sql;
  try {
    sql = `
    SELECT SUM(totalPrice) cost, SUM(profitRp) profit, categoryName
    FROM 3_pharmacy.order A
    JOIN cart_item B ON A.id = B.order_id
    JOIN product C ON B.product_id = C.id
    JOIN product_has_category D ON C.id = D.product_id
    JOIN product_category E ON D.product_category_id = E.id
    WHERE status IN('paymentAcc', 'processing', 'otw', 'delivered')
    AND checkedOutAt BETWEEN ? AND LAST_DAY(?)
    GROUP BY categoryName;`;
    const [result] = await pool.query(sql, [yearMonthStart, yearMonthEnd]);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

// ? new users increase
exports.readRecentNewUsers = async (req, res) => {
  let prev, curr;
  try {
    prev = `
    SELECT COUNT(id) count
    FROM 3_pharmacy.user
    WHERE createdAt BETWEEN (NOW() - INTERVAL 2*7 DAY) AND (NOW() - INTERVAL 1*7 DAY);`;
    curr = `
    SELECT COUNT(id) count
    FROM 3_pharmacy.user
    WHERE createdAt BETWEEN NOW() - INTERVAL 1*7 DAY AND NOW()`;
    const [prevResult] = await pool.query(prev);
    const [currResult] = await pool.query(curr);

    const result =
      (currResult[0].count - prevResult[0].count) / prevResult[0].count;

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

// ? recent carted items increase
exports.readRecentCartedItems = async (req, res) => {
  let prev, curr;
  try {
    prev = `
    SELECT COUNT(*) count
    FROM cart_item
    WHERE createdAt BETWEEN (NOW() - INTERVAL 2*7 DAY) AND (NOW() - INTERVAL 1*7 DAY);`;
    curr = `
    SELECT COUNT(*) count
    FROM cart_item
    WHERE createdAt BETWEEN NOW() - INTERVAL 1*7 DAY AND NOW()`;
    const [prevResult] = await pool.query(prev);
    const [currResult] = await pool.query(curr);

    const result =
      (currResult[0].count - prevResult[0].count) / prevResult[0].count;

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

exports.readSalesPieChart = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;
  let sql;
  try {
    sql = `
    SELECT (SELECT SUM(profitRp + totalPrice)
    FROM 3_pharmacy.order
    WHERE status IN('paymentAcc', 'processing', 'otw', 'delivered')
    AND checkedOutAt BETWEEN ? AND LAST_DAY(?)) orderSales,
    (SELECT SUM(profitRp + totalPriceRp)
    FROM 3_pharmacy.prescription
    WHERE status IN('paymentAcc', 'processing', 'otw', 'delivered')
    AND expiredAt BETWEEN ? AND LAST_DAY(?)) prescriptionSales;`;
    let [result] = await pool.query(sql, [
      yearMonthStart,
      yearMonthEnd,
      yearMonthStart,
      yearMonthEnd,
    ]);
    result = result[0];
    if (!result.orderSales) result.orderSales = 0;
    if (!result.prescriptionSales) result.prescriptionSales = 0;

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};

exports.readTransactionsPieChart = async (req, res) => {
  let { yearMonthStart, yearMonthEnd } = req.query;
  let sql;
  try {
    sql = `
    SELECT status, COUNT(id) count
    FROM prescription
    WHERE expiredAt BETWEEN ? AND LAST_DAY(?)
    GROUP BY status;`;
    let [prescriptions] = await pool.query(sql, [yearMonthStart, yearMonthEnd]);
    sql = `
    SELECT status, COUNT(id) count
    FROM 3_pharmacy.order
    WHERE checkedOutAt BETWEEN ? AND LAST_DAY(?)
    GROUP BY status;`;
    let [orders] = await pool.query(sql, [yearMonthStart, yearMonthEnd]);

    orders.forEach((el, i, arr) => {
      switch (el.status) {
        case 'otw':
          arr[i].status = 'on delivery';
          break;
        case 'paymentAcc':
          arr[i].status = 'payment accepted';
          break;
        default:
          break;
      }
    });
    prescriptions.forEach((el, i, arr) => {
      switch (el.status) {
        case 'otw':
          arr[i].status = 'on delivery';
          break;
        case 'paymentAcc':
          arr[i].status = 'payment accepted';
          break;
        default:
          break;
      }
    });

    res.status(200).send({ prescriptions, orders });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'server error' });
  }
};
