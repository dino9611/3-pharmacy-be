const pool = require('../connections/db');

// ! CREATE
exports.createRawMaterial = async (req, res) => {
  // * input inventory in bottles as the unit of measuerement
  const { materialName, bottles, unitPerBottle, priceRpPerUnit, unit } =
    req.body;
  // * null check
  if (!materialName || !bottles || !unitPerBottle || !priceRpPerUnit || !unit)
    return res.status(400).json({ message: 'no null inputs allowed' });

  // * convert bottles to the specified unit used for the raw material
  const inventory = unitPerBottle * bottles;

  let conn, sql, insertData;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // * insert new raw material
    sql = `INSERT INTO raw_material SET ?`;
    insertData = {
      materialName,
      inventory,
      unitPerBottle,
      priceRpPerUnit,
      unit,
    };
    const [insRawMaterial] = await conn.query(sql, insertData);

    // * inventory change will be recorded to raw_material_record
    const raw_material_id = insRawMaterial.insertId;
    const inventoryChange = inventory;
    const admin_id = req.user.id; // ! from req.user

    sql = 'INSERT INTO raw_material_record SET ?';
    insertData = { raw_material_id, inventoryChange, admin_id };
    await conn.query(sql, insertData);

    await conn.commit();
    conn.release();
    return res.status(200).json({
      message: 'create raw material success',
      insertId: insRawMaterial.insertId,
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// ! READ (read raw materials of a specific product or prescription is on productControllers as a user request)
// can be modified later to filter searches
exports.readRawMaterial = async (req, res) => {
  let { page, limit, search } = req.query;
  const { raw_material_id } = req.params;

  // * both page and limit queries or none at all
  if (page > 0 !== limit > 0)
    return res.status(400).json({ message: 'invalid query' });
  // * either query by id or by pagination not both
  if (raw_material_id > 0 === (page > 0 && limit > 0))
    return res.status(400).json({ message: 'invalid query' });

  let conn, sql, parameters;
  try {
    conn = await pool.getConnection();
    search = search && `materialName LIKE '%${search}%'`;

    if (raw_material_id) {
      // * get specific raw material
      sql = `
      SELECT *
      FROM raw_material
      WHERE id = ?;`;
      parameters = raw_material_id;
    } else {
      // * raw material pagination
      sql = `
      SELECT *
      FROM raw_material
      WHERE ${search || 'TRUE'}
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

exports.readRawMaterialRecord = async (req, res) => {
  let { page, limit, date, search } = req.query;
  if (!(page && limit))
    return res.status(400).json({ message: 'invalid query' });

  let conn, sql;
  try {
    conn = await pool.getConnection();

    search = search && `materialName LIKE '%${search}%'`;

    sql = `SELECT materialName, SUM(inventoryChange) inventoryChange, unitPerBottle, unit
    FROM raw_material A
    JOIN raw_material_record B ON A.id = B.raw_material_id
    WHERE DATE(datetime) = DATE(?)
    AND ${search || 'TRUE'}
    GROUP BY A.id
    HAVING inventoryChange != 0
    LIMIT ?, ?`;

    limit = parseInt(limit);
    let offset = (parseInt(page) - 1) * limit;
    const [result] = await conn.query(sql, [date, offset, limit]);

    conn.release();
    res.status(200).json({ result });
  } catch (error) {
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// ! UPDATE
exports.updateRawMaterial = async (req, res) => {
  const { raw_material_id } = req.params;
  const { materialName, bottleChange, unitPerBottle, priceRpPerUnit, unit } =
    req.body;

  // * no raw_material_id
  if (!(raw_material_id > 0))
    return res.status(400).json({ message: 'invalid request input' });
  // * atleast one updated field
  if (
    !(materialName || bottleChange || unitPerBottle || priceRpPerUnit || unit)
  )
    return res.status(400).json({ message: 'invalid request input' });

  let conn, sql;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // ! complex updates
    const admin_id = req.user.id; // ! from req.user
    // * update inventory
    let handleBottleChange;
    if (bottleChange) {
      sql = 'CALL handle_update_inventory(?, ?, ?);';
      handleBottleChange = (
        await conn.query(sql, [raw_material_id, bottleChange, admin_id])
      )[0];
    }
    // * update priceRpPerUnit
    let handlePriceChange;
    if (priceRpPerUnit) {
      sql = 'CALL handle_update_priceRpPerUnit(?, ?, ?);';
      handlePriceChange = (
        await conn.query(sql, [raw_material_id, priceRpPerUnit, admin_id])
      )[0];
    }

    // ! straight forward updates
    let result;
    if (materialName || unitPerBottle || unit) {
      sql = `
      UPDATE raw_material
      SET ?
      WHERE id = ?;`;
      updateData = {};
      if (materialName) updateData.materialName = materialName;
      if (unitPerBottle) updateData.unitPerBottle = unitPerBottle;
      if (unit) updateData.unit = unit;
      result = (await conn.query(sql, [updateData, raw_material_id]))[0];
    }

    await conn.commit();
    conn.release();
    res.status(200).json({ result, handleBottleChange, handlePriceChange });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
