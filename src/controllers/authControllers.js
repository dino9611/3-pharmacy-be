const mysql = require("../connections/db")
const { createToken, transporter } = require("../helpers")
const { createTokenEmail } = createToken
const handlebars = require('handlebars')
const path = require("path")
const fs = require("fs")
const bcrypt = require('bcrypt');

const NodeCache = require("node-cache")
const verifyCache = new NodeCache({ stdTTL: 10000, checkperiod: 0 })


module.exports = {
    register: async (req, res) => {
        const { username, email, password, firstName } = req.body
        const conn = await mysql.getConnection()

        try {
            await conn.beginTransaction()
            let sql = 'select id from user where username = ? '
            const [dataUser] = await conn.query(sql, [username])
            if (dataUser.length) {
                throw { message: "Username telah digunakan" }
            }

            //! below is how to set data in node cache that stored in RAM
            const data = { date: new Date().toISOString(), username: username }
            verifyCache.set(username, data, 10000)

            console.log(username, 'username belum terdaftar')
            sql = 'insert into user set ?'
            let dataInsert = {
                username,
                email,
                password,
                firstName
            }
            const [result] = await conn.query(sql, [dataInsert])
            console.log(result.insertId)

            //! below is how to get data from node cache
            const getData = verifyCache.get(username)
            // console.log(getData.date) 
            // console.log(getData.username)

            sql = 'select id, username, email, isVerified, role from user where id = ? '
            const [userData] = await conn.query(sql, [result.insertId])

            const dataToken = {
                id: userData[0].id,
                username: userData[0].username,
                role: userData[0].role,
                date: getData.date,
                // username: getData.username
            }
            conn.release()
            const emailToken = createTokenEmail(dataToken)
            console.log(emailToken)
            let filepath = path.resolve(__dirname, "../template/emailVerify.html")
            let htmlString = fs.readFileSync(filepath, 'utf-8')
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({ name: username, token: emailToken })
            transporter.sendMail({
                from: "Tokobat <arianzas1997@gmail.com>",
                to: email,
                subject: "Account Verifications",
                html: htmlToEmail,
            })
            await conn.commit()
            // return res.status(200).send("berhasil register")
            return res.status(200).send({ ...userData[0] })
        } catch (error) {
            await conn.rollback()
            console.log(error)
            conn.release()
            res.status(500).send({ message: error.message || "server error" })
        }
    },
    verifyAcc: async (req, res) => {
        const { id, date, username } = req.user
        const getData = verifyCache.get(username)
        const conn = await mysql.getConnection()

        try {
            console.log(date, "ini date dari token")
            console.log(getData.date, "ini date dari cache")
            if (date != getData.date) {
                throw { message: "Gunakan link yang baru dong" }
            }
            let updateData = {
                isVerified: 1
            }
            let sql = 'update user set ? where id = ? '
            await conn.query(sql, [updateData, id])
            sql = 'select * from user where id = ?'
            const [userData] = await conn.query(sql, [id])
            return res.status(200).send(userData[0])
            // return res.status(200).send("masuk keakhir verified")
        } catch (error) {
            console.log(error)
            return res.status(500).send({ message: error.message })
        }
    },
    sendVerifiedEmail: async (req, res) => {
        const { username } = req.params
        const conn = await mysql.getConnection()

        //! below is how to set data in node cache that stored in RAM
        const data = { date: new Date().toISOString(), username: username }
        verifyCache.set(username, data, 10000)


        try {
            let sql = `select * from user where username = ? `
            let [dataUser] = await conn.query(sql, [username])
            //! below is how to get data from node cache
            const getData = verifyCache.get(username)
            let dataToken = {
                id: dataUser[0].id,
                username: username,
                date: getData.date,
            }
            let emailToken = createTokenEmail(dataToken)
            let filepath = path.resolve(__dirname, "../template/emailVerify.html")
            let htmlString = fs.readFileSync(filepath, 'utf-8')
            var template = handlebars.compile(htmlString);
            const htmlToEmail = template({ name: username, token: emailToken })
            await transporter.sendMail({
                from: "Tokobat <arianzas1997@gmail.com>",
                to: dataUser[0].email,
                subject: "Account Verification",
                html: htmlToEmail,
            })
            return res.status(200).send({ message: 'berhasil kirim email verified' });
        } catch (error) {
            console.log(error)
            return res.status(500).send({ message: error.message })
        }
    },
    passValidation: async (req, res) => {
        const { username } = req.query
        const conn = await mysql.getConnection()
        try {
            let sql = 'select * from user where username = ? '
            let [userData] = await conn.query(sql, [username])
            if (!userData.length) {
                throw { message: "username tidak ditemukan" }
            }
            let dataToken = {
                id: userData[0].id,
                role: userData[0].role
            }
            conn.release()

            let tokenEmailPassword = createTokenEmail(dataToken)
            let filepath = path.resolve(__dirname, "../template/changePassword.html")
            let htmlString = fs.readFileSync(filepath, 'utf-8')
            var template = handlebars.compile(htmlString);
            const htmlToEmail = template({ name: userData[0].username, token: tokenEmailPassword })
            // console.log(htmlToEmail)
            await transporter.sendMail({
                from: "Tokobat <arianzas1997@gmail.com>",
                to: dataRes[0].email,
                subject: "Password Change",
                html: htmlToEmail,
            })
            return res.status(200).send({ message: "Change Password Success" })
        } catch (error) {
            console.log(error)
            conn.release()
            res.status(500).send({ message: error.message || "server error" })
        }
    },
    changePassword: async (req, res) => {
        const { id } = req.user
        const { password } = req.body
        const conn = await mysql.getConnection()
        try {
            let updateData = {
                password: password
            }
            let sql = 'update user set ? where id = ? '
            await conn.query(sql, [updateData, id])
            sql = 'select * from user where id = ? '
            let [userData] = await conn.query(sql, [id])
            conn.release()
            return res.status(200).send(userData[0])
        } catch (error) {
            console.log(error)
            conn.release()
            res.status(500).send({ message: error.message || "server error" })
        }
    },
    logIn: async (req, res) => {
        const { username, email, password } = req.body
        const msc = await mysql.getConnection()
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
