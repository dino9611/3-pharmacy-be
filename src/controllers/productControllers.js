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
    productPriceRp,
    stock,
    description,
    categories, // array of product_category_id
    compositions, // array of amountInUnit and raw_material_id
  } = data;
  if (
    !productName ||
    !productPriceRp ||
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
    };
    sql = `
    INSERT INTO product
    SET ?;`;
    const [result] = await conn.query(sql, insertData);

    // * create product compositions
    // insertData = {};

    conn.release();
    res.status(200).json({ result });
  } catch (error) {
    fs.unlinkSync('./public' + imagePath);
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
