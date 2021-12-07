const pool = require('../connections/db');
const bcrypt = require('bcrypt');
const fs = require('fs');

module.exports = {
    editProfile: async (req, res) => {
        const { id } = req.params
        const msc = await pool.getConnection()
        const { username, email, password, firstName, lastName, birthdate, gender, address } = req.body
        let sql
        try {
            // Cek akun yg dituju ada atau ngga
            sql = `select * from user where id = ?`
            let [doesExist] = await msc.query(sql, id)
            // Kalo ga ada, send array kosong
            if (!doesExist.length) {
                msc.release()
                return res.status(200).send([])
            }
            // update user sesuai req.body yang ada
            sql = `update user set ? where id = ?`
            let dataInput = {}
            if (username) {
                dataInput.username = username
            }
            if (email) {
                dataInput.email = email
            }
            if (password) {
                const hash = bcrypt.hashSync(password, 10)
                dataInput.password = hash
            }
            if (firstName) {
                dataInput.firstName = firstName
            }
            if (lastName) {
                dataInput.lastName = lastName
            }
            if (birthdate) {
                dataInput.birthdate = birthdate
            }
            if (gender) {
                dataInput.gender = gender
            }
            if (address) {
                dataInput.address = address
            }
            await msc.query(sql, [dataInput, id])
            // get data hasil update
            sql = `select * from user where id = ?`
            let [result] = await msc.query(sql, id)
            msc.release()
            return res.status(200).send(result);
        } catch (error) {
            msc.release()
            return res.status(500).send({ message: error.message });
        }
    },
    editAvatar: async (req, res) => {
        const { id } = req.params
        const msc = await pool.getConnection()
        const { avatar } = req.files
        let path = '/avatar'
        let imagePath = avatar ? `${path}/${avatar[0].filename}` : null
        let sql
        try {
            // cek apakah akun yang dituju ada
            sql = `select * from user where id = ?`
            let [doesExist] = await msc.query(sql, id)
            // kalo ga ada, send array kosong
            if (!doesExist.length) {
                msc.release()
                return res.status(200).send([])
            }
            // kalo ada, isi path gambar ke dalam objek yg nantinya utk query sql
            sql = `update user set ? where id = ?`
            let dataAvatar = {}
            if (imagePath) {
                if (doesExist[0].avatar) {
                    fs.unlinkSync("./public" + doesExist[0].avatar);
                }
                dataAvatar.avatar = imagePath
            }
            await msc.query(sql, [dataAvatar, id])
            // get updated data
            sql = `select * from user where id = ?`
            let [result] = await msc.query(sql, id)
            msc.release()
            return res.status(200).send(result);
        } catch (error) {
            msc.release()
            if (imagePath) {
                fs.unlinkSync("./public" + imagePath);
            }
            return res.status(500).send({ message: error.message });
        }
    }
};
