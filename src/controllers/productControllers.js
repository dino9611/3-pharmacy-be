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


// get all categories
exports.getCategories = async (req, res) => {
  const msc = await pool.getConnection()
  let sql
  try {
    sql = 'select * from product_category'
    let [result] = await msc.query(sql)
    msc.release()
    return res.status(200).send(result)
  } catch (error) {
    msc.release()
    return res.status(500).send({ message: error.message })
  }
}

// get semua produk untuk admin
exports.AdminGetProducts = async (req, res) => {
  const { search } = req.query
  const msc = await pool.getConnection()
  let sql
  try {
    sql = `SELECT p.id, p.productName, group_concat(pc.categoryName separator ', ') as categoryName, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
    join product_has_category ph on p.id = ph.product_id
    join product_category pc on ph.product_category_id = pc.id`
    if (search) {
      sql += ` where p.productName like '${search}%'`
    }
    sql += ' group by p.productName order by p.id'
    let [result] = await msc.query(sql)
    msc.release()
    return res.status(200).send(result)
  } catch (error) {
    msc.release()
    return res.status(500).send({ message: error.message })
  }
}

// get paginated product list for admin
exports.AdminGetProductsPagination = async (req, res) => {
  const { rowsPerPage, page } = req.params
  const { search } = req.query
  console.log(search);
  const msc = await pool.getConnection()
  let sql
  try {
    sql = `SELECT p.id, p.productName, group_concat(pc.categoryName separator ', ') as categoryName, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
    join product_has_category ph on p.id = ph.product_id
    join product_category pc on ph.product_category_id = pc.id`
    if (search) {
      sql += ` where p.productName like '${search}%'`
    }
    sql += ' group by p.productName order by p.id limit ? offset ?'
    let [result] = await msc.query(sql, [parseInt(rowsPerPage), parseInt(page)])
    msc.release()
    return res.status(200).send(result)
  } catch (error) {
    msc.release()
    return res.status(500).send({ message: error.message })
  }
}

// get all products
exports.getProducts = async (req, res) => {
  const { kategori } = req.query
  const msc = await pool.getConnection()
  let sql
  try {
    sql = `SELECT p.id, p.productName, group_concat(pc.categoryName separator ', ') as categoryName, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
    join product_has_category ph on p.id = ph.product_id
    join product_category pc on ph.product_category_id = pc.id`
    if (parseInt(kategori)) {
      sql = `SELECT p.id, p.productName, pc.categoryName, pc.id, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
      join product_has_category ph on p.id = ph.product_id
      join product_category pc on ph.product_category_id = pc.id where pc.id = ?`
    }
    if (parseInt(kategori)) {
      let [result] = await msc.query(sql, parseInt(kategori))
      msc.release()
      return res.status(200).send(result)
    }
    sql += ' group by p.productName order by p.id'
    let [result] = await msc.query(sql)
    msc.release()
    return res.status(200).send(result)
  } catch (error) {
    msc.release()
    return res.status(500).send({ message: error.message })
  }
}

// get paginated product list for everyone
exports.getProductsPagination = async (req, res) => {
  const { page } = req.params
  const { filter, kategori } = req.query
  const msc = await pool.getConnection()
  let sql
  try {
    sql = `SELECT p.id, p.productName, group_concat(pc.categoryName separator ', ') as categoryName, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
    join product_has_category ph on p.id = ph.product_id
    join product_category pc on ph.product_category_id = pc.id`
    sql += ' group by p.productName'
    if (parseInt(kategori)) {
      sql = `SELECT p.id, p.productName, pc.categoryName, pc.id, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
      join product_has_category ph on p.id = ph.product_id
      join product_category pc on ph.product_category_id = pc.id where pc.id = ?`
    }
    if (filter === 'lowest') {
      sql += ' order by p.productPriceRp asc'
    }
    if (filter === 'highest') {
      sql += ' order by p.productPriceRp desc'
    }
    if (filter === 'default') {
      sql += ' order by p.id asc'
    }
    if (parseInt(kategori)) {
      let [result] = await msc.query(sql, [parseInt(kategori), 8, parseInt(page)])
      msc.release()
      return res.status(200).send(result)
    }
    sql += ' limit ? offset ?'
    let [result] = await msc.query(sql, [8, parseInt(page)])
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
