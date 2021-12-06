const pool = require('../connections/db');
const bcrypt = require('bcrypt');

module.exports = {
    logIn: async (req, res) => {
        const { username, email, password } = req.body
        const msc = await pool.getConnection()
        try {
            let sql = `select * from user where username = ? or email = ?`
            let [result] = await msc.query(sql, [username, email])
            const match = await bcrypt.compare(password, result[0].password);
            if (!match) {
                msc.release()
                return res.status(200).send([])
            }
            msc.release()
            return res.status(200).send(result)
        } catch (error) {
            msc.release()
            return res.status(500).send({ message: error.message })
        }
    }
};
