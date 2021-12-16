const mysql = require("../connections/db")

module.exports = {
    addToCart: async (req, res) => {
        const { user_id } = req.params
        const { price, qty, product_id } = req.body
        const pool = await mysql.getConnection()
        try {
            // cari order_id berdasarkan user_id
            let sql = `select * from 3_pharmacy.order where user_id = ?`
            let [order] = await pool.query(sql, user_id)

            // cek apakah ada product_id yang sama dalam satu order_id
            sql = `select * from cart_item where order_id = ? and product_id = ?`
            let [cekcart] = await pool.query(sql, [order[0].id, product_id])

            // jika ada product_id yang sama, ketika insert hanya mengupdate kuantitas
            // jika tidak ada product_id yang sama, skip if
            if (cekcart.length) {
                sql = `update cart_item set ? where order_id = ? and product_id = ?`
                const updateKuantitas = {
                    qty: cekcart[0].qty + qty
                }
                await pool.query(sql, [updateKuantitas, order[0].id, product_id])

                // join tabel order dan item
                // utk mendapatkan harga setiap produk yg nantinya akan ditotal tiap produk
                sql = `SELECT * FROM 3_pharmacy.order
                join cart_item ci on 3_pharmacy.order.id = ci.order_id
                where user_id = ?`
                let [prices] = await pool.query(sql, user_id)
                let totalCounter = 0
                prices.forEach(val => {
                    totalCounter += val.price * val.qty
                })

                // update totalPrice yg ada di tabel order dengan hasil dari hitung total
                sql = `update 3_pharmacy.order set ? where user_id = ?`
                const updateTotal = { totalPrice: totalCounter }
                await pool.query(sql, [updateTotal, user_id])

                // get tabel cart_item berdasarkan user_id
                sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id FROM 3_pharmacy.order
                join cart_item ci on 3_pharmacy.order.id = ci.order_id
                where user_id = ?`
                let [result] = await pool.query(sql, user_id)
                pool.release()
                return res.status(200).send(result)
            }

            // insert produk yang dipilih ke cart_item
            sql = `insert into cart_item set ?`
            const dataInsert = {
                order_id: order[0].id,
                price, qty, product_id
            }
            await pool.query(sql, dataInsert)

            // join tabel order dan item
            // utk mendapatkan harga setiap produk yg nantinya akan ditotal tiap produk
            sql = `SELECT * FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            where user_id = ?`
            let [prices] = await pool.query(sql, user_id)
            let totalCounter = 0
            prices.forEach(val => {
                totalCounter += val.price * val.qty
            })

            // update totalPrice yg ada di tabel order dengan hasil dari hitung total
            sql = `update 3_pharmacy.order set ? where user_id = ?`
            const updateTotal = { totalPrice: totalCounter }
            await pool.query(sql, [updateTotal, user_id])

            // get tabel cart_item berdasarkan user_id
            sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            where user_id = ?`
            let [result] = await pool.query(sql, user_id)
            pool.release()
            return res.status(200).send(result)
        } catch (error) {
            pool.release()
            return res.status(500).send({ message: error.message })
        }
    },
    deleteFromCart: async (req, res) => {
        const { user_id, product_id } = req.params
        const pool = await mysql.getConnection()
        try {
            // cari order_id berdasarkan user_id
            let sql = `select * from 3_pharmacy.order where user_id = ?`
            let [order] = await pool.query(sql, user_id)

            // cek apakah product yang ingin dihapus ada
            sql = `select * from cart_item where order_id = ? and product_id = ?`
            let [cekcart] = await pool.query(sql, [order[0].id, product_id])

            // jika tidak ada, throw error
            // jika ada, skip if
            if (!cekcart.length) {
                pool.release()
                throw { message: "product is not found" }
            }

            // hapus produk berdasarkan order_id dan product_id
            sql = `delete from cart_item where order_id = ? and product_id = ?`
            await pool.query(sql, [order[0].id, product_id])

            // join tabel order dan item
            // utk mendapatkan harga setiap produk yg nantinya akan ditotal tiap produk
            sql = `SELECT * FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            where user_id = ?`
            let [prices] = await pool.query(sql, user_id)
            let totalCounter = 0
            prices.forEach(val => {
                totalCounter += val.price * val.qty
            })

            // update totalPrice yg ada di tabel order dengan hasil dari hitung total
            sql = `update 3_pharmacy.order set ? where user_id = ?`
            const updateTotal = { totalPrice: totalCounter }
            await pool.query(sql, [updateTotal, user_id])

            // get tabel cart_item berdasarkan user_id
            sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            where user_id = ?`
            let [result] = await pool.query(sql, user_id)
            pool.release()
            return res.status(200).send(result)
        } catch (error) {
            pool.release()
            return res.status(500).send({ message: error.message })
        }
    }
};
