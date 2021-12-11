const pool = require('../connections/db');
const fs = require('fs');

// ! CREATE
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
  console.log(compositions);
  console.log(categories);

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
        parseFloat(el[0]), // raw_material_id
        parseFloat(el[1]), // amountInUnit
        admin_id,
      ]);
    }

    // * create product categories
    for (let i = 0; i < categories.length; i++) {
      await conn.query(
        'INSERT INTO product_has_category(product_id, product_category_id) VALUES(?, ?);',
        [
          productId,
          parseInt(categories[i]), // product_category_id
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

// ! READ
exports.readProduct = async (req, res) => {
  let { page, limit } = req.query;
  const { product_id } = req.params;

  // * both page and limit queries or none at all
  if (page > 0 !== limit > 0)
    return res.status(400).json({ message: 'invalid query' });
  // * either query by id or by pagination not both
  if (product_id > 0 === (page > 0 && limit > 0))
    return res.status(400).json({ message: 'invalid query' });

  let conn, sql, parameters;
  try {
    conn = await pool.getConnection();

    if (product_id) {
      // * get specific product
      sql = `
      SELECT *
      FROM product
      WHERE id = ?;`;
      parameters = product_id;
    } else {
      // * product pagination
      sql = `
      SELECT *
      FROM product
      LIMIT ?, ?;`;
      limit = parseInt(limit);
      let offset = (parseInt(page) - 1) * limit;
      parameters = [offset, limit];
    }
    const [result] = await conn.query(sql, parameters);

    conn.release();
    res.status(200).json({ result });
  } catch (error) {
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
exports.readProductCategories = async (req, res) => {
  try {
    let sql = 'SELECT * FROM product_category;';
    const [result] = await pool.query(sql);

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

exports.getProducts = async (req, res) => {
  const msc = await pool.getConnection();
  let sql;
  try {
    sql = `select * from product`;
    let [result] = await msc.query(sql);
    msc.release();
    return res.status(200).send(result);
  } catch (error) {
    msc.release();
    return res.status(500).send({ message: error.message });
  }
};

exports.getProductsPagination = async (req, res) => {
  const { rowsPerPage, page } = req.params;
  console.log(req.params);
  const msc = await pool.getConnection();
  let sql;
  try {
    sql = `select * from product limit ? offset ?`;
    let [result] = await msc.query(sql, [
      parseInt(rowsPerPage),
      parseInt(page),
    ]);
    msc.release();
    return res.status(200).send(result);
  } catch (error) {
    msc.release();
    return res.status(500).send({ message: error.message });
  }
};

// ! UPDATE
exports.updateProduct = async (req, res) => {
  const data = JSON.parse(req.body.data);
  // * req.body.data
  const { id, stock } = data;

  // * no raw_material_id
  if (!(id > 0))
    return res.status(400).json({ message: 'invalid request input' });
  // * atleast one updated field
  if (!(stock >= 0))
    return res.status(400).json({ message: 'invalid request input' });

  let conn, sql;
  try {
    conn = await pool.getConnection();

    // ! complex updates
    const admin_id = 1;
    // * update stock
    let handleStockChange;
    if (stock >= 0) {
      sql = 'CALL handle_update_stock(?, ?, ?);';
      handleStockChange = (await conn.query(sql, [id, stock, admin_id]))[0];
    }

    // ! straight forward updates

    conn.release();
    res.status(200).json({ handleStockChange });
  } catch (error) {
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
