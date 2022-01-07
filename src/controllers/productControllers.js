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
    const admin_id = req.user.id;

    // * create product compositions
    for (let i = 0; i < compositions.length; i++) {
      let el = compositions[i];
      await conn.query('CALL handle_create_composition(?, ?, ?, ?);', [
        productId,
        parseFloat(el.id), // raw_material_id
        parseFloat(el.amountInUnit), // amountInUnit
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

  let conn, sql, parameters, result;
  try {
    conn = await pool.getConnection();

    if (product_id) {
      // * get specific product
      parameters = product_id;
      sql = `
      SELECT A.*, GROUP_CONCAT(CONCAT(B.raw_material_id, ';', B.amountInUnit)) compositions
      FROM product A
      JOIN product_composition B ON A.id = B.product_id
      WHERE A.id = ?;`;
      const [result1] = await conn.query(sql, parameters);
      sql = `
      SELECT GROUP_CONCAT(B.product_category_id) categories
      FROM product A
      JOIN product_has_category B ON A.id = B.product_id
      WHERE A.id = ?;`;
      const [result2] = await conn.query(sql, parameters);
      result = { ...result1[0], ...result2[0] };
    } else {
      // * product pagination
      sql = `
      SELECT *
      FROM product
      LIMIT ?, ?;`;
      limit = parseInt(limit);
      let offset = (parseInt(page) - 1) * limit;
      parameters = [offset, limit];
      [result] = await conn.query(sql, parameters);
    }

    conn.release();
    res.status(200).json({ result });
  } catch (error) {
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// get all categories
exports.getCategories = async (req, res) => {
  let sql;
  try {
    sql = 'select * from product_category;';
    let [result] = await pool.query(sql);
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

// get each product description
exports.getDescription = async (req, res) => {
  const { product_id } = req.params;
  const msc = await pool.getConnection();
  let sql;
  try {
    sql = `select table1.id, table1.productName, table1.stock, table1.imagePath, table1.description, table2.categoryName, table1.composition from (
      SELECT 
        p.id, p.productName, p.productPriceRp, p.stock,
        p.imagePath, p.description,
        group_concat(concat(rm.materialName,": ", pcom.amountInUnit, rm.unit) separator ', ') as composition
      FROM product p
      join product_composition pcom on p.id = pcom.product_id
      join raw_material rm on pcom.raw_material_id = rm.id
      group by p.productName
    ) table1 join (
      SELECT 
        p.id,
        group_concat(pcat.categoryName separator ", ") as categoryName
      FROM product p
      join product_has_category phc on p.id = phc.product_id
      join product_category pcat on phc.product_category_id = pcat.id
      group by p.productName
    ) table2 on table1.id = table2.id
    where table1.id = ?`;
    let [result] = await msc.query(sql, product_id);
    msc.release();
    return res.status(200).send(result);
  } catch (error) {
    msc.release();
    return res.status(500).send({ message: error.message });
  }
};

//! GetCategories perproduct untuk edit
exports.getEdit = async (req, res) => {
  const conn = await pool.getConnection();
  const { id } = req.params;
  try {
    let sql = `SELECT p.id, p.productName, pc.product_category_id, pc.product_id, c.categoryName
      FROM 3_pharmacy.product p
      JOIN 3_pharmacy.product_has_category pc
      ON p.id = pc.product_id
      JOIN 3_pharmacy.product_category c
      on pc.product_category_id = c.id
      where p.id = ?
      order by p.id ;`;
    let [results] = await conn.query(sql, id);
    sql = `select pc.product_id ,r.id, r.materialName, r.inventory, pc.amountInUnit 
      from product_composition pc
      JOIN raw_material r
      ON pc.raw_material_id = r.id
      where product_id = ? ; `;
    let [dataGet] = await conn.query(sql, id);
    console.log(id);
    console.log('masuk sini');
    conn.release();
    return res.status(200).send([results, dataGet]);
  } catch (error) {
    conn.release();
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

// get semua produk untuk admin
exports.AdminGetProducts = async (req, res) => {
  const { search } = req.query;
  const msc = await pool.getConnection();
  let sql;
  try {
    sql = `SELECT count(*) as product_length FROM product p`
    if (search) {
      sql += ` where p.productName like '${search}%'`;
    }
    let [result] = await msc.query(sql);
    msc.release();
    return res.status(200).send(result);
  } catch (error) {
    msc.release();
    return res.status(500).send({ message: error.message });
  }
};

// get paginated product list for admin
exports.AdminGetProductsPagination = async (req, res) => {
  const { rowsPerPage, page } = req.params;
  const { search } = req.query;
  const msc = await pool.getConnection();
  let sql;
  try {
    sql = `SELECT p.id, p.productName, group_concat(pc.categoryName separator ', ') as categoryName, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
    join product_has_category ph on p.id = ph.product_id
    join product_category pc on ph.product_category_id = pc.id`;
    if (search) {
      sql += ` where p.productName like '${search}%'`;
    }
    sql += ' group by p.productName order by p.updatedAt desc limit ? offset ?';
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

// get all products
exports.getProducts = async (req, res) => {
  const { search, kategori } = req.query;
  const msc = await pool.getConnection();
  let sql;
  try {
    sql = `SELECT count(*) as product_length from product`

    // jika ada query search maka :
    if (search) {
      sql = `select count(*) as product_length from product where productName like '${search}%'`;
      if (parseInt(kategori)) {
        sql = `SELECT count(*) as product_length FROM product p
        join product_has_category ph on p.id = ph.product_id
        join product_category pc on ph.product_category_id = pc.id
        where pc.id = ? and productName like '${search}%'`;
      }

      // jika ada query search dan kategori maka :
      if (parseInt(kategori)) {
        let [result] = await msc.query(sql, [parseInt(kategori)]);
        msc.release();
        return res.status(200).send(result);
      }
      let [result] = await msc.query(sql);
      msc.release();
      return res.status(200).send(result);
    }

    // jika hanya query kategory
    if (parseInt(kategori)) {
      sql = `SELECT count(*) as product_length FROM product p
      join product_has_category ph on p.id = ph.product_id
      join product_category pc on ph.product_category_id = pc.id where pc.id = ?`;
      let [result] = await msc.query(sql, parseInt(kategori));
      msc.release();
      return res.status(200).send(result);
    }
    let [result] = await msc.query(sql);
    msc.release();
    return res.status(200).send(result);
  } catch (error) {
    msc.release();
    return res.status(500).send({ message: error.message });
  }
};

// get paginated product list for everyone
exports.getProductsPagination = async (req, res) => {
  const { page } = req.params;
  const { search, filter, kategori } = req.query;
  const msc = await pool.getConnection();
  let sql;
  try {
    // jika tidak ada query
    sql = `SELECT p.id, p.productName, group_concat(pc.categoryName separator ', ') as categoryName, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
    join product_has_category ph on p.id = ph.product_id
    join product_category pc on ph.product_category_id = pc.id
    group by p.productName`;

    // jika ada query search
    if (search) {
      sql = `select * from (SELECT p.id, p.productName, group_concat(pc.categoryName separator ', ') as categoryName, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
      join product_has_category ph on p.id = ph.product_id
      join product_category pc on ph.product_category_id = pc.id group by p.productName`;

      // jika ada query search dan kategori
      if (parseInt(kategori)) {
        sql = ` select * from (SELECT p.id, p.productName, pc.categoryName, pc.id as cat_id, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
          join product_has_category ph on p.id = ph.product_id
          join product_category pc on ph.product_category_id = pc.id where pc.id = ?`;
      }

      // jika ada query search dan kategori dan filter
      if (filter === 'lowest') {
        sql += ' order by p.productPriceRp asc';
      }
      if (filter === 'highest') {
        sql += ' order by p.productPriceRp desc';
      }
      if (filter === 'default') {
        sql += ' order by p.id asc';
      }
      sql += `) as sn where sn.productName like '${search}%'`;
      if (parseInt(kategori)) {
        sql += ' limit ? offset ?';
        let [result] = await msc.query(sql, [
          parseInt(kategori),
          8,
          parseInt(page),
        ]);
        msc.release();
        return res.status(200).send(result);
      }
      sql += ' limit ? offset ?';
      let [result] = await msc.query(sql, [8, parseInt(page)]);
      msc.release();
      return res.status(200).send(result);
    }

    // jika ada query kategori
    if (parseInt(kategori)) {
      sql = `SELECT p.id, p.productName, pc.categoryName, pc.id as cat_id, p.productPriceRp, p.stock, p.imagePath, p.description, p.isDeleted, p.createdAt, p.updatedAt FROM product p
      join product_has_category ph on p.id = ph.product_id
      join product_category pc on ph.product_category_id = pc.id where pc.id = ?`;
    }

    // jika ada query filter
    if (filter === 'lowest') {
      sql += ' order by p.productPriceRp asc';
    }
    if (filter === 'highest') {
      sql += ' order by p.productPriceRp desc';
    }
    if (filter === 'default') {
      sql += ' order by p.createdAt desc';
    }
    if (parseInt(kategori)) {
      sql += ' limit ? offset ?';
      let [result] = await msc.query(sql, [
        parseInt(kategori),
        8,
        parseInt(page),
      ]);
      msc.release();
      return res.status(200).send(result);
    }
    // jika tidak ada query
    sql += ' limit ? offset ?';
    let [result] = await msc.query(sql, [8, parseInt(page)]);
    msc.release();
    return res.status(200).send(result);
  } catch (error) {
    msc.release();
    return res.status(500).send({ message: error.message });
  }
};

// ! UPDATE
exports.updateProduct = async (req, res) => {
  const { image } = req.files;
  const imagePath = image ? '/products' + `/${image[0].filename}` : null;
  const data = JSON.parse(req.body.data);
  // * req.body.data
  const {
    id,
    stock,
    productName,
    description,
    categories,
    compositions,
    oldCategories,
  } = data;
  //? untuk setidaknya salah satu dari parameter terisi

  // * no raw_material_id
  if (!(id > 0))
    return res.status(400).json({ message: 'invalid request input' });
  // * atleast one updated field
  if (!(stock >= 0))
    return res.status(400).json({ message: 'invalid request input' });

  let conn, sql, updateData;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    // if (!(stock || productName || description || categories || compositions)){
    //   fs.unlinkSync('./public' + imagePath);
    //   return res.status(400).send({message: "Data not Changed"})
    // }

    // const imagePath = image ? '/products' + `/${image[0].filename}` : null;
    // if (!imagePath) {
    //   return res.status(400).send({ message: 'No Image Uploaded' });
    // }
    const admin_id = req.user.id;

    // * agar image dibackend tidak nambah
    // sql = `select * from product where id = ?`;
    // let [doesExist] = await conn.query(sql, id);
    // if (imagePath) {
    //   if (doesExist[0].imagePath) {
    //     if (fs.existsSync('./public' + doesExist[0].imagePath)) {
    //       fs.unlinkSync('./public' + doesExist[0].imagePath);
    //     }
    //   }
    // }
    if (
      imagePath &&
      data.imagePath &&
      fs.existsSync('./public' + data.imagePath)
    ) {
      fs.unlinkSync('./public' + data.imagePath);
    }

    // ! straight forward updates
    updateData = {
      productName,
      description,
    };
    if (imagePath) updateData.imagePath = imagePath;
    sql = 'UPDATE product SET ? WHERE id = ? ';
    await conn.query(sql, [updateData, id]);

    // const productId = results.insertId
    sql = `
    SELECT raw_material_id id, amountInUnit
    FROM product A
    JOIN product_composition B ON A.id = B.product_id
    WHERE A.id = ?;`;
    const [currCompositions] = await conn.query(sql, [id]);
    let delCompositions = [];
    let addCompositions = [];
    currCompositions.forEach((el) => {
      if (!compositions.some((el2) => el2.id === el.id))
        delCompositions.push(el);
    });
    compositions.forEach((el, i) => {
      if (!currCompositions.some((el2) => el2.id === el.id)) {
        addCompositions.push(el);
        compositions.splice(i, 1);
      }
    });
    // console.log('compositions', compositions);
    // console.log('delCompositions', delCompositions);
    // console.log('addCompositions', addCompositions);

    //? for product compositions
    // for (let i = 0; i < delCompositions.length; i++) {
    //   let el = delCompositions[i];
    //   await conn.query('CALL handle_delete_composition(?,?,?,?)', [
    //     id,
    //     parseFloat(el.id),
    //     admin_id,
    //   ]);
    // }
    for (let i = 0; i < compositions.length; i++) {
      let el = compositions[i];
      await conn.query('CALL handle_update_composition(?,?,?,?)', [
        id,
        parseFloat(el.id),
        parseFloat(el.amountInUnit),
        admin_id,
      ]);
    }

    //? for product categories
    sql = `
    SELECT GROUP_CONCAT(product_category_id) category_id
    FROM product A
    JOIN product_has_category B ON A.id = B.product_id
    WHERE A.id = ?;`;
    let [currCategories] = await conn.query(sql, [id]);
    currCategories = currCategories[0].category_id.split(',');

    for (let i = 0; i < currCategories.length; i++) {
      if (!categories.includes(currCategories[i])) {
        sql = `DELETE FROM product_has_category WHERE product_id = ? AND product_category_id = ? `;
        await conn.query(sql, [id, parseInt(currCategories[i])]);
      }
    }
    for (let i = 0; i < categories.length; i++) {
      if (!currCategories.includes(categories[i])) {
        sql = `INSERT INTO product_has_category(product_id, product_category_id) VALUES(?,?)`;
        await conn.query(sql, [id, categories[i]]);
      }
    }

    //! complex Updates
    let handleStockChange;
    if (stock >= 0) {
      sql = 'CALL handle_update_stock(?, ?, ?);';
      handleStockChange = (await conn.query(sql, [id, stock, admin_id]))[0];
    }
    await conn.commit();
    conn.release();
    res.status(200).send({ message: 'berhasil' });
  } catch (error) {
    await conn.rollback();
    if (imagePath) {
      fs.unlinkSync('./public' + imagePath);
    }
    conn.release();
    res.status(500).send({ message: error.message });
    console.log(error);
  }
};

// ! DELETE PRODUCTS
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  const admin_id = req.user.id;
  try {
    await conn.beginTransaction();
    // update isDeleted
    let dataDelete = {
      isDeleted: 1,
    };
    let sql = 'update product SET ? where id = ? ; ';
    await conn.query(sql, [dataDelete, id]);

    // update Stock
    let handleStock;
    sql = 'CALL handle_update_stock(?, 0, ?);';
    handleStock = (await conn.query(sql, [id, admin_id]))[0];
    await conn.commit();
    conn.release();
    res.status(200).send({ message: 'berhasil' });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).send({ message: error.message });
    console.log(error);
  }
};
