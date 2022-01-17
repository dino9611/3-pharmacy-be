const mysql = require('../connections/db');
const path = require('path');
const fs = require('fs');

module.exports = {
  customUpload: async (req, res) => {
    const { id } = req.params;
    const conn = await mysql.getConnection();
    const { custom } = req.files;
    let path = '/prescription';
    let imagePath = custom ? `${path}/${custom[0].filename}` : null;
    let sql;
    try {
      sql = `insert into prescription set ? `;
      //? sekalian nambah edit prescription name yang unique, jadi admin gaperlu kasih prescription name, kasih kode yang hanya admin doang yang tau
      let dataInsert = {
        user_id: id,
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
    const { status } = req.query;
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
            on p.user_id = u.id where true ${querySql} `;

      let [result] = await conn.query(sql);
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
      // sql = 'select id from prescription where prescriptionName = ? '
      // const [dataPrescript] = await conn.query(sql, [prescriptionName])
      // if(!dataPrescript.length){

      // }
      //! ini untuk mengisi tabel prescription agar lengkap DIPINDAHIN NIH KE NEXT ENDPOINT
      // updateData = {
      //     prescriptionName,
      //     status
      // }
      // sql = `update prescription set ? where id = ? `
      // await conn.query(sql, [updateData, id])
      // sql = `select * from prescribed_medicine where prescription_id = ?`
      // let [existData] = await conn.query(sql, id)
      // if (existData[0].prescription_id){
      //     sql = `update prescribed_medicine set ? `
      //     updateData= {
      //         pres
      //     }
      // }

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

      //? get ulang
      // sql = `
      // select p.user_id,u.username,p.id, p.prescriptionName, p.image, p.paymentProof, p.status
      // from prescription p
      // join user u
      // on p.user_id = u.id `
      // let [results] = await conn.query(sql)

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
      let sql = `select * from prescribed_medicine where prescription_id = ? ;`;
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
  getUserCustom: async (req, res) => {
    const { id } = req.query;
    let sql;
    const conn = await mysql.getConnection();
    try {
      sql = `select p.user_id, u.username, p.id, p.prescriptionName, p.image, p.paymentProof, p.status, p.profitRp, p.totalPriceRp
            from prescription p
            join user u
            on p.user_id = u.id
            where u.id = ? ; `;

      let [result] = await conn.query(sql, id);
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
  updateCostprofit : async (req,res) => {
    const { cost, profit, id } = req.body;
    const conn = await mysql.getConnection()
    let sql, updateData
    try {
      updateData = {
        totalPriceRp : cost,
        profitRp : profit
      }
      sql = `update prescription set ? where id = ? `
      await conn.query(sql, [updateData, id])
      sql = `update prescription set expiredAt = NOW() + INTERVAL 2 HOUR where id = ? ; `
      await conn.query(sql, id)
      conn.release()
      res.status(200).send({message: 'berhasil'})
    } catch (error) {
      console.log(error)
      conn.release()
      res.status(500).send({message: error.message || 'server error'})
    }
  }
};
