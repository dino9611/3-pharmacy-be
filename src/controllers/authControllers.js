const mysql = require("../connections/db")
const {createToken, transporter} = require("../helpers")
const {createTokenEmail} = createToken
const handlebars = require('handlebars')
const path = require("path")
const fs = require("fs")

const NodeCache = require("node-cache")
const verifyCache = new NodeCache({stdTTL:100, checkperiod:0})


module.exports = {
    register : async(req, res) => {
        const {username, email, password, firstName} = req.body
        const conn = await mysql.getConnection()
        
        try {
            await conn.beginTransaction()
            let sql = 'select id from user where username = ? '
            const [dataUser] = await conn.query(sql, [username])
            if(dataUser.length){
                throw{message : "Username telah digunakan"}
            }

            //! below is how to set data in node cache that stored in RAM
            const data = {date: new Date(), username: username} 
            verifyCache.set(username, data, 10000)

            // console.log(username, 'username belum terdaftar')
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
            const [userData] = await conn.query(sql,[result.insertId])

            const dataToken = {
                id: userData[0].id,
                username: userData[0].username,
                role: userData[0].role,
                date: getData.date
            }
            conn.release()
            const emailToken = createTokenEmail(dataToken)
            console.log(emailToken)
            let filepath = path.resolve(__dirname,"../template/emailVerify.html")
            let htmlString = fs.readFileSync(filepath, 'utf-8')
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({name:username, token:emailToken})
            transporter.sendMail({
                from: "Tokobat <arianzas1997@gmail.com>",
                to: email,
                subject: "Account Verifications",
                html : htmlToEmail,
            })
            await conn.commit()
            return res.status(200).send({...userData[0]})
        } catch (error) {
            await conn.rollback()
            console.log(error)
            conn.release()
            res.status(500).send({message:error.message || "server error"})
        }
    }
}