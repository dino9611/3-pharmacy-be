const pool = require('../connections/db');
const fs = require('fs');

exports.createProduct = async (req, res) => {
  const { image } = req.files;
  // * req.files
  const imagePath = image ? '/products' + `/${image[0].filename}` : null;
  if (!imagePath)
    return res.status(400).send({ message: 'no null inputs allowed' });

  const data = JSON.parse(req.body.data);
  // * req.body.data
  const {
    productName,
    stock,
    description,
    categories, // array of [product_category_id]
    compositions, // array of [raw_material_id, amountInUnit]
  } = data;
  if (
    !productName ||
    !stock ||
    !description ||
    !categories.length ||
    !compositions.length
  ) {
    fs.unlinkSync('./public' + imagePath);
    return res.status(400).send({ message: 'no null inputs allowed' });
  }

  let conn, sql, insertData;
  try {
    conn = await pool.getConnection();

    // * create initial product instance
    insertData = {
      productName,
      imagePath,
      description,
      // stock,
    };
    sql = `
    INSERT INTO product
    SET ?;`;
    const [result] = await conn.query(sql, insertData);

    const productId = result.insertId;
    const admin_id = 1;

    // * create product compositions
    for (let i = 0; i < compositions.length; i++) {
      let el = compositions[i];
      await conn.query('CALL handle_create_composition(?, ?, ?, ?);', [
        productId,
        el[0], // raw_material_id
        el[1], // amountInUnit
        admin_id,
      ]);
    }

    // * create product categories
    for (let i = 0; i < categories.length; i++) {
      await conn.query(
        'INSERT INTO product_has_category(product_id, product_category_id) VALUES(?, ?);',
        [
          productId,
          categories[i], // product_category_id
        ]
      );
    }

    // * set stock
    sql = 'CALL handle_update_stock(?, ?, ?);';
    await conn.query(sql, [productId, stock, admin_id]);

    conn.release();
    res.status(200).json({ productId });
  } catch (error) {
    fs.unlinkSync('./public' + imagePath);
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

exports.getProducts = async (req, res) => {
  const msc = await pool.getConnection()
  let sql
  try {
    sql = `select * from product`
    let [result] = await msc.query(sql)
    msc.release()
    return res.status(200).send(result)
  } catch (error) {
    msc.release()
    return res.status(500).send({ message: error.message })
  }
}

exports.getProductsPagination = async (req, res) => {
  const { rowsPerPage, page } = req.params
  console.log(req.params);
  const msc = await pool.getConnection()
  let sql
  try {
    sql = `select * from product limit ? offset ?`
    let [result] = await msc.query(sql, [parseInt(rowsPerPage), parseInt(page)])
    msc.release()
    return res.status(200).send(result)
  } catch (error) {
    msc.release()
    return res.status(500).send({ message: error.message })
  }
}

// exports.readProduct = async (req, res) => {
//   const { product_id } = req.params;
//   let conn, sql;
//   try {
//     conn = await pool.getConnection();
//     sql = 'SELECT * FROM product WHERE id = ?;';
//     const [result] = await conn.query(sql, product_id);

//     conn.release();
//     res.status(200).json({ result });
//   } catch (error) {
//     conn.release();
//     res.status(500).json({ message: error.message });
//     console.log(error);
//   }
// };
