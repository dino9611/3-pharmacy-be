const mysql = require("../connections/db")
const path = require("path")
const fs = require("fs")


module.exports = {
    customUpload : async (req,res) => {
        const {id} = req.params
        const conn = await mysql.getConnection()
        const { custom } = req.files
        let path = "/prescription"
        let imagePath = custom ? `${path}/${custom[0].filename}` : null
        let sql
        try {
            sql = `insert into prescription set ? `
            let dataInsert = {
                user_id : id,
                image:  imagePath
            }
            await conn.query(sql, [dataInsert])
            conn.release()
            return res.status(200).send({message : "Berhasil"})
        } catch (error) {
            console.log(error)
            if (imagePath) {
                fs.unlinkSync("./public" + imagePath);
            }
            conn.release()
            res.status(500).send({ message: error.message || "server error" })
        }
    },
    getDataCustom : async (req,res) => {
        let sql 
        const conn = await mysql.getConnection()
        try {
            sql = `
            select p.user_id,u.username,p.id, p.prescritionName, p.image, p.paymentProof, p.status 
            from prescription p 
            join user u 
            on p.user_id = u.id `
            let [result] = await conn.query(sql)
            conn.release()
            return res.status(200).send(result)
        } catch (error) {
            conn.release()
            res.status(500).send({ message: error.message || "server error" })
        }
    }
}