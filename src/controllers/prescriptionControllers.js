const mysql = require('../connections/db');
const path = require('path');
const fs = require('fs');

module.exports = {
  customUpload: async (req, res) => {
    const conn = await mysql.getConnection();
    const { custom } = req.files;
    let path = '/prescription';
    let imagePath = custom ? `${path}/${custom[0].filename}` : null;
    let sql;
    try {
      sql = `insert into prescription set ? `;
      //? sekalian nambah edit prescription name yang unique, jadi admin gaperlu kasih prescription name, kasih kode yang hanya admin doang yang tau
      let dataInsert = {
        user_id: req.user.id,
        image: imagePath,
        status: 'initial',
      };
      await conn.query(sql, [dataInsert]);
      conn.release();
      return res.status(200).send({ message: 'Berhasil' });
    } catch (error) {
      console.log(error);
      if (imagePath) {
        fs.unlinkSync('./public' + imagePath);
      }
      conn.release();
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  getDataCustom: async (req, res) => {
    const { status, rowsPerPage, offset } = req.query;
    let sql;
    let querySql = '';
    const conn = await mysql.getConnection();
    try {
      if (status) {
        querySql += `and status = ${mysql.escape(status)} `;
      }
      sql = `
            select p.user_id,u.username,p.id, p.prescriptionName, p.image, p.paymentProof, p.status 
            from prescription p 
            join user u 
            on p.user_id = u.id where true ${querySql} limit ?  offset ? ;`;
      let [result] = await conn.query(sql, [
        parseInt(rowsPerPage),
        parseInt(offset),
      ]);
      conn.release();
      return res.status(200).send(result);
    } catch (error) {
      conn.release();
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  createPrescription: async (req, res) => {
    const { id, medicineName, qty, compositions } = req.body;

    let conn, sql, insertData;
    conn = await mysql.getConnection();
    try {
      await conn.beginTransaction();
      console.log(id);
      //? ini initial input untuk tabel prescribed medicine
      sql = `insert into prescribed_medicine set ? `;
      insertData = {
        medicineName,
        prescription_id: id,
      };
      const [result] = await conn.query(sql, insertData);
      console.log(insertData.prescription_id);

      //? untuk create prescription compositions
      const productId = result.insertId;
      const admin_id = req.user.id;

      for (let i = 0; i < compositions.length; i++) {
        let val = compositions[i];
        await conn.query('CALL handle_create_medicine_comp(?, ?, ?, ?);', [
          productId,
          parseFloat(val[0]), //? raw material_ID
          parseFloat(val[1]), //? amount in Unit
          admin_id,
        ]);
      }

      //? set QTY
      sql = 'CALL handle_update_qty(?, ?, ?)';
      await conn.query(sql, [productId, qty, admin_id]);
      console.log('berhasil');
      await conn.commit();
      conn.release();
      res.status(200).send({ message: 'berhasil' });
    } catch (error) {
      await conn.rollback();
      console.log(error);
      conn.release();
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  updateStatus: async (req, res) => {
    const { id, nextStatus } = req.body;

    let conn, sql, updateData;
    try {
      conn = await mysql.getConnection();
      updateData = {
        status: nextStatus,
      };
      sql = `update prescription set ? where id = ? `;
      await conn.query(sql, [updateData, id]);
      res.status(200).send({ message: 'berhasil' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  updatePrescriptionName: async (req, res) => {
    const { id, prescriptionName } = req.body;

    let conn, sql, updateData;
    conn = await mysql.getConnection();
    try {
      updateData = {
        prescriptionName,
      };
      sql = `update prescription set ? where id = ? `;
      await conn.query(sql, [updateData, id]);
      res.status(200).send({ message: 'berhasil' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  getDetails: async (req, res) => {
    const { id } = req.params;
    const conn = await mysql.getConnection();
    try {
      // let sql = `SELECT user_id FROM prescription WHERE id = ?;`;
      // let [prescription] = await conn.query(sql, id);
      // if (prescription[0].user_id !== req.user.id) return res.sendStatus(403);

      let sql = `select * from prescribed_medicine where prescription_id = ?;`;
      let [result] = await conn.query(sql, id);
      conn.release();
      return res.status(200).send(result);
    } catch (error) {
      conn.release();
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  getMedicineName: async (req, res) => {
    const { id } = req.params;
    const conn = await mysql.getConnection();
    try {
      let sql = `select p.user_id, u.username, p.id, p.prescriptionName, p.image, p.paymentProof, p.status, pm.medicineName
            from prescription p
            join user u
            on p.user_id = u.id
            join prescribed_medicine pm
            on p.id = pm.prescription_id
            where p.id = ? ; `;
      let [dataMed] = await conn.query(sql, [id]);
      if (!dataMed.length) {
        throw { message: 'No medicine Name' };
      }
      conn.release();
      return res.status(200).send(dataMed);
    } catch (error) {
      conn.release();
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  userConfirmDelivery: async (req, res) => {
    const { id } = req.body;
    let sql, conn;
    try {
      conn = await mysql.getConnection();
      sql = `
      SELECT user_id
      FROM prescription
      WHERE id = ?
      AND status = 'otw';`;
      const [prescription] = await conn.query(sql, id);
      if (!prescription.length) {
        conn.release();
        return res.sendStatus(400);
      }
      if (prescription[0].user_id !== req.user.id) {
        conn.release();
        return res.sendStatus(403);
      }

      sql = `
      UPDATE prescription
      SET status = 'delivered'
      WHERE id = ?;`;
      await conn.query(sql, id);

      conn.release();
      return res.sendStatus(200);
    } catch (error) {
      conn.release();
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  getUserCustom: async (req, res) => {
    let { page, limit, filter, search } = req.query;
    const { id } = req.user;
    let sql;
    const conn = await mysql.getConnection();
    try {
      let parameters = [id];
      sql = `
      SELECT id, image, expiredAt, paymentProof, prescriptionName, (profitRp + totalPriceRp) price, paymentProof, status, createdAt
      FROM prescription
      WHERE user_id = ?`;
      if (filter && filter !== 'undefined') {
        if (filter === 'failed')
          sql += ` AND status IN ('imgRej', 'paymentRej', 'expired', 'paymentRej', 'rejected')`;
        else {
          sql += ' AND status = ?';
          parameters.push(filter);
        }
      }
      if (search) sql += ` AND prescriptionName LIKE '%${search}%'`;
      sql += ' ORDER BY expiredAt DESC LIMIT ?, ?';
      parameters.push(page === undefined ? 0 : parseInt(page - 1));
      parameters.push(limit === undefined ? 10 : parseInt(limit));
      sql += ';';

      let [result] = await conn.query(sql, parameters);
      conn.release();
      return res.status(200).send(result);
    } catch (error) {
      conn.release();
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  paymentProof: async (req, res) => {
    const { id } = req.params;
    const conn = await mysql.getConnection();
    const { proof } = req.files;
    let path = '/paymentproof';
    let imagePath = proof ? `${path}/${proof[0].filename}` : null;
    let sql;
    try {
      // cek apakah akun yang dituju ada
      sql = `select * from prescription where id = ? ;`;
      let [doesExist] = await conn.query(sql, id);
      // kalo ga ada, send array kosong
      if (imagePath) {
        if (doesExist[0].paymentProof) {
          fs.unlinkSync('./public' + doesExist[0].paymentProof);
        }
      }

      updateData = {
        paymentProof: imagePath,
      };
      sql = `update prescription set ? where id = ? `;
      await conn.query(sql, [updateData, id]);
      return res.status(200).send({ message: 'berhasil' });
    } catch (error) {
      conn.release();
      if (imagePath) {
        fs.unlinkSync('./public' + imagePath);
      }
      return res.status(500).send({ message: error.message });
    }
  },
  updateCostprofit: async (req, res) => {
    const { cost, profit, id } = req.body;
    const conn = await mysql.getConnection();
    let sql, updateData;
    try {
      updateData = {
        totalPriceRp: cost,
        profitRp: profit,
      };
      sql = `update prescription set ?, expiredAt = NOW() + INTERVAL 2 HOUR where id = ? `;
      await conn.query(sql, [updateData, id]);
      conn.release();
      res.status(200).send({ message: 'berhasil' });
    } catch (error) {
      console.log(error);
      conn.release();
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  prescriptionLength: async (req, res) => {
    const { status } = req.query;
    let querySql = '';
    let conn = await mysql.getConnection();
    try {
      if (status) {
        querySql += `and status = ${mysql.escape(status)}`;
      }
      let sql = `select count(*) prescription_length from prescription where true ${querySql} `;
      let [results] = await conn.query(sql);
      conn.release();
      return res.status(200).send(results);
    } catch (error) {
      conn.release();
      console.log(error);
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
};
