exports.createProduct = (req, res) => {
  const { productName, productPriceRp, stock, image, description } = req.body;
  if (!productName || !productPriceRp || !stock || !image || !description) {
  }

  let conn, sql;
  try {
  } catch (error) {
    // conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
