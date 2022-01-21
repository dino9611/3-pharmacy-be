const mysql = require('../connections/db');
const { createToken, transporter } = require('../helpers');
const { createTokenEmail, createAccessToken } = createToken;
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const { FRONTEND_URL } = process.env;

const bcrypt = require('bcrypt');
const saltRounds = 10;
//!STDTTL Pas selesai nanti jangan lupa diganti
const NodeCache = require('node-cache');
const verifyCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

module.exports = {
  register: async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    const conn = await mysql.getConnection();
    try {
      await conn.beginTransaction();
      let sql = 'select id from user where username = ? ';
      const [dataUser] = await conn.query(sql, [username]);
      if (dataUser.length) {
        throw { message: 'Username telah digunakan' };
      }

      //! below is how to set data in node cache that stored in RAM
      const data = { date: new Date().toISOString(), username: username };
      verifyCache.set(username, data, 10000);

      //! Below is how to hash password with bcrypt
      const hashPassword = bcrypt.hashSync(password, saltRounds);

      console.log(username, 'username belum terdaftar');
      sql = 'insert into user set ?';
      let dataInsert = {
        username,
        email,
        password: hashPassword,
        firstName,
        lastName,
      };
      const [result] = await conn.query(sql, [dataInsert]);
      console.log(result.insertId);

      //! below is how to get data from node cache
      const getData = verifyCache.get(username);
      // console.log(getData.date)
      // console.log(getData.username)

      sql =
        'select id, username, email, isVerified, role from user where id = ? ';
      const [userData] = await conn.query(sql, [result.insertId]);

      const dataToken = {
        id: userData[0].id,
        username: userData[0].username,
        role: userData[0].role,
        date: getData.date,
        // username: getData.username
      };
      conn.release();
      const emailToken = createTokenEmail(dataToken);
      console.log(emailToken);
      let filepath = path.resolve(__dirname, '../template/emailVerify.html');
      let htmlString = fs.readFileSync(filepath, 'utf-8');
      const template = handlebars.compile(htmlString);
      const htmlToEmail = template({
        username,
        FRONTEND_URL,
        token: emailToken,
      });
      transporter.sendMail({
        from: `Tokobat <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Account Verifications',
        html: htmlToEmail,
      });
      await conn.commit();
      // return res.status(200).send("berhasil register")
      return res.status(200).send({ ...userData[0] });
    } catch (error) {
      await conn.rollback();
      console.log(error);
      conn.release();
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  verifyAcc: async (req, res) => {
    const { id, date, username, role } = req.user;
    const getData = verifyCache.get(username);
    const conn = await mysql.getConnection();
    console.log(role);
    try {
      // disini tambahin dicek dulu udah verified atau belum
      let sql = 'select * from user where username = ? ';
      let [dataUser] = await conn.query(sql, [username]);
      if (dataUser[0].isVerified) {
        throw { message: 'User Already Verified' };
      }
      console.log(date, 'ini date dari token');
      console.log(getData.date, 'ini date dari cache');
      if (date != getData.date) {
        throw { message: 'Please use the latest Link' };
      }
      let updateData = {
        isVerified: 1,
      };
      sql = 'update user set ? where id = ? ';
      await conn.query(sql, [updateData, id]);
      sql = 'select * from user where id = ?';
      const [userData] = await conn.query(sql, [id]);
      conn.release();
      verifyCache.del(username);
      return res.status(200).send(userData[0]);
    } catch (error) {
      console.log(error);
      if (error.message == "Cannot read property 'date' of undefined") {
        error.message = 'Link Expired!';
      }
      conn.release();
      return res.status(500).send({ message: error.message });
    }
  },
  sendVerifiedEmail: async (req, res) => {
    const { username } = req.params;
    const conn = await mysql.getConnection();

    //! below is how to set data in node cache that stored in RAM
    const data = { date: new Date().toISOString(), username: username };
    verifyCache.set(username, data, 10000);

    try {
      let sql = `select * from user where username = ? `;
      let [dataUser] = await conn.query(sql, [username]);
      if (dataUser[0].isVerified) {
        throw 'User Already Verified';
      }
      //! below is how to get data from node cache
      const getData = verifyCache.get(username);
      let dataToken = {
        id: dataUser[0].id,
        username: username,
        date: getData.date,
      };
      let emailToken = createTokenEmail(dataToken);
      let filepath = path.resolve(__dirname, '../template/emailVerify.html');
      let htmlString = fs.readFileSync(filepath, 'utf-8');
      var template = handlebars.compile(htmlString);
      const htmlToEmail = template({
        name: username,
        FRONTEND_URL,
        token: emailToken,
      });
      await transporter.sendMail({
        from: `Tokobat <${process.env.EMAIL_USER}>`,
        to: dataUser[0].email,
        subject: 'Account Verification',
        html: htmlToEmail,
      });
      conn.release();
      return res.status(200).send({ message: 'berhasil kirim email verified' });
    } catch (error) {
      conn.release();
      console.log(error);
      return res.status(500).send({ message: error.message });
    }
  },
  passValidation: async (req, res) => {
    const { username } = req.query;
    const conn = await mysql.getConnection();
    try {
      let sql = 'select * from user where username = ? ';
      let [userData] = await conn.query(sql, [username]);
      if (!userData.length) {
        throw { message: 'username tidak ditemukan' };
      }
      //! below is how to set data in node cache that stored in RAM
      const dataPass = { date: new Date().toISOString(), username: username };
      verifyCache.set(userData[0].email, dataPass, 10000);
      //! below is how to get data from node cache
      const getDatapass = verifyCache.get(userData[0].email);

      let dataToken = {
        id: userData[0].id,
        role: userData[0].role,
        date: getDatapass.date,
        email: userData[0].email,
      };

      let tokenEmailPassword = createTokenEmail(dataToken);
      let filepath = path.resolve(__dirname, '../template/changePassword.html');
      let htmlString = fs.readFileSync(filepath, 'utf-8');
      var template = handlebars.compile(htmlString);
      const htmlToEmail = template({
        name: userData[0].username,
        FRONTEND_URL,
        token: tokenEmailPassword,
      });
      // console.log(htmlToEmail)
      transporter.sendMail({
        from: `Tokobat <${process.env.EMAIL_USER}>`,
        to: userData[0].email,
        subject: 'Password Change',
        html: htmlToEmail,
      });
      conn.release();
      console.log('sucess kirim email');
      return res.status(200).send({ message: 'Change Password Success' });
    } catch (error) {
      console.log(error);
      conn.release();
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  changePassword: async (req, res) => {
    const { id, date, email } = req.user;
    const { password } = req.body;
    const getData = verifyCache.get(email);
    const conn = await mysql.getConnection();
    console.log(password);
    try {
      if (date != getData.date) {
        throw { message: 'Please use the latest Link' };
      }
      //! Below is how to hash password with bcrypt
      const hashPassword = bcrypt.hashSync(password, saltRounds);
      let updateData = {
        password: hashPassword,
      };
      let sql = 'update user set ? where id = ? ';
      await conn.query(sql, [updateData, id]);
      sql = 'select * from user where id = ? ';
      let [userData] = await conn.query(sql, [id]);
      conn.release();
      verifyCache.del(email);
      return res.status(200).send(userData[0]);
    } catch (error) {
      console.log(error);
      conn.release();
      if (error.message == "Cannot read property 'date' of undefined") {
        error.message = 'Link Expired!';
      }
      res.status(500).send({ message: error.message || 'server error' });
    }
  },
  logIn: async (req, res) => {
    const { username, email, password } = req.body;
    const msc = await mysql.getConnection();
    try {
      let sql = `select * from user where username = ? or email = ?`;
      let [result] = await msc.query(sql, [username, email]);
      if (!result.length) {
        msc.release();
        return res.status(200).send([]);
      }
      const match = await bcrypt.compare(password, result[0].password);
      if (!match) {
        msc.release();
        return res.status(200).send([]);
      }
      const accessTokenData = {
        id: result[0].id,
        username: result[0].username,
        role: result[0].role,
      };
      const accessToken = createAccessToken(accessTokenData);
      res.set('access-token', accessToken);
      msc.release();
      return res.status(200).send(result);
    } catch (error) {
      msc.release();
      return res.status(500).send({ message: error.message });
    }
  },
  keepLoggedIn: async (req, res) => {
    const { id } = req.user;
    const msc = await mysql.getConnection();
    try {
      let sql = `select * from user where id = ?`;
      let [result] = await msc.query(sql, id);
      if (!result.length) {
        msc.release();
        return res.status(200).send([]);
      }
      msc.release();
      return res.status(200).send(result);
    } catch (error) {
      msc.release();
      return res.status(500).send({ message: error.message });
    }
  },
  userLength: async (req, res) => {
    const { username } = req.query;
    const pool = await mysql.getConnection();
    try {
      let sql = `select count(*) user_length from user where role = ? and username like '${username}%'`;
      let [result] = await pool.query(sql, 'user');
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  userList: async (req, res) => {
    const { username, limit, offset } = req.query;
    const pool = await mysql.getConnection();
    try {
      let sql = `select * from user where role = ? and username like '${username}%' limit ? offset ?`;
      let [result] = await pool.query(sql, [
        'user',
        parseInt(limit),
        parseInt(offset),
      ]);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  userDetail: async (req, res) => {
    const { id } = req.params;
    const pool = await mysql.getConnection();
    try {
      let sql = `select * from user where id = ? and role = ?`;
      let [result] = await pool.query(sql, [id, 'user']);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  changeProfilePass: async (req, res) => {
    const { currentPass, newPass, confirmNewPass } = req.body;
    const { id } = req.params;
    const pool = await mysql.getConnection();
    try {
      let sql = `select * from user where id = ?`;
      let [user] = await pool.query(sql, id);
      if (!user.length) {
        pool.release();
        throw { message: 'User is not found' };
      }
      const match = await bcrypt.compare(currentPass, user[0].password);
      if (!match) {
        pool.release();
        throw { message: 'input does not match current password' };
      }
      if (newPass != confirmNewPass) {
        pool.release();
        throw { message: 'password does not match' };
      }
      const hashPassword = bcrypt.hashSync(newPass, saltRounds);
      let updatePass = {
        password: hashPassword,
      };
      sql = `update user set ? where id = ?`;
      await pool.query(sql, [updatePass, id]);
      sql = `select * from user where id = ?`;
      let [result] = await pool.query(sql, id);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
};
