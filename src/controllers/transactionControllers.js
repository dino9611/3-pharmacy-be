const mysql = require('../connections/db');
const fs = require('fs');

module.exports = {
  addToCart: async (req, res) => {
    const { user_id } = req.params;
    const { qty, product_id } = req.body;
    const pool = await mysql.getConnection();
    try {
      let sql = `select * from user where id = ?`;
      let [cekUser] = await pool.query(sql, user_id);
      if (!cekUser[0].isVerified) {
        throw { message: 'User is not verified' };
      }

      sql = `select productPriceRp as price, productProfitRp as profit, isDeleted  from product where id = ?`;
      let [get_product] = await pool.query(sql, product_id);
      const { price, profit, isDeleted } = get_product[0];

      if (isDeleted) {
        return res.statusCode(400);
      }

      // cari order_id berdasarkan user_id
      sql = `select * from 3_pharmacy.order where user_id = ? and status = ?`;
      let [order_null] = await pool.query(sql, [user_id, 'cart']);

      // jika tidak ditemukan, artinya order sudah mempunyai status. buat row order baru
      if (!order_null.length) {
        sql = `insert into 3_pharmacy.order set ?`;
        const dataInsert = {
          user_id,
        };
        await pool.query(sql, dataInsert);
      }

      // cari order_id berdasarkan user_id
      sql = `select * from 3_pharmacy.order where user_id = ? and status = ?`;
      let [order] = await pool.query(sql, [user_id, 'cart']);

      // cek apakah ada product_id yang sama dalam satu order_id
      sql = `select * from cart_item where order_id = ? and product_id = ?`;
      let [cart] = await pool.query(sql, [order[0].id, product_id]);

      // jika ada product_id yang sama, ketika insert hanya mengupdate kuantitas
      // jika tidak ada product_id yang sama, skip if
      if (cart.length) {
        // jika produk yg dimaksud sudah pernah dihapus, update isDeleted jadi 0 lagi
        if (cart[0].isDeleted) {
          sql = `update cart_item set ? where order_id = ? and product_id = ?`;
          const dataUpdate = {
            qty: 0,
            isDeleted: 0,
            price,
            profit,
          };
          await pool.query(sql, [dataUpdate, order[0].id, product_id]);
        }

        // dapatkan table cart_item lagi untuk mendapatkan kuantitas
        sql = `select * from cart_item where order_id = ? and product_id = ?`;
        let [cart2] = await pool.query(sql, [order[0].id, product_id]);

        // dapatkan informasi stok dari tabel product berdasarkan product_id / id
        sql = `select * from product where id = ?`;
        let [product] = await pool.query(sql, product_id);

        // jika kuantitas melebihi stock, throw error
        if (cart2[0].qty + qty > product[0].stock) {
          pool.release();
          throw { message: "quantity can't exceed stock" };
        }

        // jika kuantitas dibawah 1, throw error
        if (cart2[0].qty + qty < 1) {
          pool.release();
          throw { message: 'quantity must be above zero' };
        }

        // update kuantitas
        sql = `update cart_item set ? where order_id = ? and product_id = ?`;
        const updateKuantitas = {
          qty: cart2[0].qty + qty,
        };
        await pool.query(sql, [updateKuantitas, order[0].id, product_id]);

        // join tabel order dan item
        // utk mendapatkan harga setiap produk yg nantinya akan ditotal tiap produk
        sql = `SELECT * FROM 3_pharmacy.order
                join cart_item ci on 3_pharmacy.order.id = ci.order_id
                where 3_pharmacy.order.id = ? and ci.isDeleted = ?`;
        let [prices] = await pool.query(sql, [order[0].id, 0]);
        let totalCounter = 0;
        let profitCounter = 0;
        prices.forEach((val) => {
          totalCounter += val.price * val.qty;
          profitCounter += val.profit * val.qty;
        });

        // update totalPrice yg ada di tabel order dengan hasil dari hitung total
        sql = `update 3_pharmacy.order set ? where id = ?`;
        const updateTotal = {
          totalPrice: totalCounter,
          profitRp: profitCounter,
        };
        await pool.query(sql, [updateTotal, order[0].id]);

        // get tabel cart_item berdasarkan user_id
        sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id, p.productName, (p.productPriceRp + p.productProfitRp) productPriceRp, p.stock, p.imagePath, p.description FROM 3_pharmacy.order
                join cart_item ci on 3_pharmacy.order.id = ci.order_id
                join product p on ci.product_id = p.id
                where user_id = ? and ci.isDeleted = ? and status = ? order by ci.createdAt desc`;
        let [result] = await pool.query(sql, [user_id, 0, 'cart']);
        pool.release();
        return res.status(200).send(result);
      }

      // insert produk yang dipilih ke cart_item
      sql = `insert into cart_item set ?`;
      const dataInsert = {
        order_id: order[0].id,
        price,
        profit,
        qty,
        product_id,
      };
      await pool.query(sql, dataInsert);

      // join tabel order dan item
      // utk mendapatkan harga setiap produk yg nantinya akan ditotal tiap produk
      sql = `SELECT * FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            where 3_pharmacy.order.id = ? and ci.isDeleted = ?`;
      let [prices] = await pool.query(sql, [order[0].id, 0]);
      let totalCounter = 0;
      let profitCounter = 0;
      prices.forEach((val) => {
        totalCounter += val.price * val.qty;
        profitCounter += val.profit * val.qty;
      });

      // update totalPrice yg ada di tabel order dengan hasil dari hitung total
      sql = `update 3_pharmacy.order set ? where id = ?`;
      const updateTotal = { totalPrice: totalCounter, profitRp: profitCounter };
      await pool.query(sql, [updateTotal, order[0].id]);

      // get tabel cart_item berdasarkan user_id
      sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id, p.productName, (p.productPriceRp + p.productProfitRp) productPriceRp, p.stock, p.imagePath, p.description FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            join product p on ci.product_id = p.id
            where user_id = ? and ci.isDeleted = ? and status = ? order by ci.createdAt desc`;
      let [result] = await pool.query(sql, [user_id, 0, 'cart']);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  deleteFromCart: async (req, res) => {
    const { user_id, product_id } = req.params;
    const pool = await mysql.getConnection();
    try {
      // cari order_id berdasarkan user_id
      let sql = `select * from 3_pharmacy.order where user_id = ? and status = ?`;
      let [order] = await pool.query(sql, [user_id, 'cart']);

      // cek apakah product yang ingin dihapus ada
      sql = `select * from cart_item where order_id = ? and product_id = ?`;
      let [cekcart] = await pool.query(sql, [order[0].id, product_id]);

      // jika tidak ada, throw error
      // jika ada, skip if
      if (!cekcart.length) {
        pool.release();
        throw { message: 'product is not found' };
      }

      // perbarui isDeleted jadi 1 berdasarkan order_id dan product_id
      sql = `update cart_item set ? where order_id = ? and product_id = ?`;
      const dataUpdate = { isDeleted: 1 };
      await pool.query(sql, [dataUpdate, order[0].id, product_id]);

      // join tabel order dan item
      // utk mendapatkan harga setiap produk yg nantinya akan ditotal tiap produk
      sql = `SELECT * FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            where 3_pharmacy.order.id = ? and ci.isDeleted = ?`;
      let [prices] = await pool.query(sql, [order[0].id, 0]);
      let totalCounter = 0;
      let profitCounter = 0;
      prices.forEach((val) => {
        totalCounter += val.price * val.qty;
        profitCounter += val.profit * val.qty;
      });

      // update totalPrice yg ada di tabel order dengan hasil dari hitung total
      sql = `update 3_pharmacy.order set ? where id = ?`;
      const updateTotal = { totalPrice: totalCounter, profitRp: profitCounter };
      await pool.query(sql, [updateTotal, order[0].id]);

      // get tabel cart_item berdasarkan user_id
      sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id, p.productName, (p.productPriceRp + p.productProfitRp) productPriceRp, p.stock, p.imagePath, p.description FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            join product p on ci.product_id = p.id
            where user_id = ? and ci.isDeleted = ? and status = ? order by ci.createdAt desc`;
      let [result] = await pool.query(sql, [user_id, 0, 'cart']);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  getCart: async (req, res) => {
    const { user_id } = req.params;
    const pool = await mysql.getConnection();
    try {
      let sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id, p.productName, (p.productPriceRp + p.productProfitRp) productPriceRp, p.stock, p.imagePath, p.description FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            join product p on ci.product_id = p.id
            where user_id = ? and ci.isDeleted = ? and status = ? order by ci.createdAt desc`;
      let [result] = await pool.query(sql, [user_id, 0, 'cart']);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  editQuantity: async (req, res) => {
    const { user_id } = req.params;
    const { product_id, qty } = req.body;
    const pool = await mysql.getConnection();
    try {
      // cari order_id berdasarkan user_id
      let sql = `select * from 3_pharmacy.order where user_id = ? and status = ?`;
      let [order] = await pool.query(sql, [user_id, 'cart']);

      // cek apakah product yang ingin diedit ada
      sql = `select * from cart_item where order_id = ? and product_id = ?`;
      let [cekcart] = await pool.query(sql, [order[0].id, product_id]);

      // jika tidak ada, throw error
      // jika ada, skip if
      if (!cekcart.length) {
        pool.release();
        throw { message: 'product is not found' };
      }

      // dapatkan stok produk dari tabel produk berdasarkan product_id atau id
      sql = `select * from product where id = ?`;
      let [product] = await pool.query(sql, product_id);

      // cek stok
      if (cekcart[0].qty + qty > product.stock) {
        pool.release();
        throw { message: "quantity can't exceed stock" };
      }
      if (cekcart[0].qty + qty < 1) {
        pool.release();
        throw { message: 'quantity must be above zero' };
      }

      // edit produk berdasarkan order_id dan product_id
      sql = `update cart_item set ? where order_id = ? and product_id = ?`;
      const dataUpdate = { qty: cekcart[0].qty + qty };
      await pool.query(sql, [dataUpdate, order[0].id, product_id]);

      // join tabel order dan item
      // utk mendapatkan harga setiap produk yg nantinya akan ditotal tiap produk
      sql = `SELECT * FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            where 3_pharmacy.order.id = ? and ci.isDeleted = ?`;
      let [prices] = await pool.query(sql, [order[0].id, 0]);
      let totalCounter = 0;
      let profitCounter = 0;
      prices.forEach((val) => {
        totalCounter += val.price * val.qty;
        profitCounter += val.profit * val.qty;
      });

      // update totalPrice yg ada di tabel order dengan hasil dari hitung total
      sql = `update 3_pharmacy.order set ? where id = ?`;
      const updateTotal = { totalPrice: totalCounter, profitRp: profitCounter };
      await pool.query(sql, [updateTotal, order[0].id]);

      // get tabel cart_item berdasarkan user_id
      sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id, p.productName, (p.productPriceRp + p.productProfitRp) productPriceRp, p.stock, p.imagePath, p.description FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            join product p on ci.product_id = p.id
            where user_id = ? and ci.isDeleted = ? and status = ? order by ci.createdAt desc`;
      let [result] = await pool.query(sql, [user_id, 0, 'cart']);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  checkout: async (req, res) => {
    const { user_id } = req.params;
    const { address, bank_id } = req.body;
    const pool = await mysql.getConnection();
    try {
      // dapatkan informasi order berdasarkan user_id
      let sql = `select * from 3_pharmacy.order where user_id = ? and status = ?`;
      let [order_null] = await pool.query(sql, [user_id, 'cart']);

      // dapatkan informasi order berdasarkan user_id
      sql = `select * from 3_pharmacy.order where id = ? and status = ?`;
      let [order] = await pool.query(sql, [order_null[0].id, 'cart']);

      // jika tidak ada, throw error
      if (!order.length) {
        pool.release();
        throw { message: 'row is not found' };
      }

      // jika tidak ada total harga = tdk ada produk, throw error
      if (!order[0].totalPrice) {
        pool.release();
        throw { message: 'no product' };
      }

      // perbarui row
      sql = `update 3_pharmacy.order set ? where id = ?`;
      var tzoffset = new Date().getTimezoneOffset() * 60000;
      var localISOTime = new Date(Date.now() - tzoffset)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      const dataUpdate = {
        checkedOutAt: localISOTime,
        address,
        status: 'checkout',
        bank_id,
        shippingCost: 9000,
      };
      await pool.query(sql, [dataUpdate, order[0].id]);

      // get tabel cart_item berdasarkan user_id
      sql = `SELECT user_id, ci.order_id, ci.price, ci.qty, ci.createdAt, ci.isDeleted, ci.product_id, p.productName, (p.productPriceRp + p.productProfitRp) productPriceRp, p.stock, p.imagePath, p.description FROM 3_pharmacy.order
            join cart_item ci on 3_pharmacy.order.id = ci.order_id
            join product p on ci.product_id = p.id
            where user_id = ? and ci.isDeleted = ? and status = ? order by ci.createdAt desc`;
      let [result] = await pool.query(sql, [user_id, 0, 'cart']);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  getCheckout: async (req, res) => {
    const { order_id } = req.params;
    const pool = await mysql.getConnection();
    try {
      let sql = `SELECT 
            3_pharmacy.order.id, 3_pharmacy.order.totalPrice, 3_pharmacy.order.address,
            3_pharmacy.order.paymentProof, 3_pharmacy.order.status, 3_pharmacy.order.shippingCost,
            b.bank, b.accountNumber, 3_pharmacy.order.user_id
            FROM 3_pharmacy.order
            join bank b on 3_pharmacy.order.bank_id = b.id
            where 3_pharmacy.order.id = ?`;
      let [result] = await pool.query(sql, order_id);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  paymentProof: async (req, res) => {
    const { order_id, prescription_id } = req.params;
    const { product, prescription } = req.files;
    const pool = await mysql.getConnection();
    let path = '/payment';

    // jika fieldnamenya product
    if (product) {
      let imagePath = product ? `${path}/${product[0].filename}` : null;
      try {
        let sql = `select * from 3_pharmacy.order where id = ?`;
        let [order] = await pool.query(sql, order_id);

        if (!order.length) {
          pool.release();
          throw { message: 'row is not found' };
        }
        sql = `update 3_pharmacy.order set ? where id = ?`;
        let dataPayment = { status: 'checkout' };
        if (imagePath) {
          if (order[0].paymentProof) {
            fs.unlinkSync('./public' + order[0].paymentProof);
          }
          dataPayment.paymentProof = imagePath;
        }
        await pool.query(sql, [dataPayment, order_id]);
        pool.release();
        return res
          .status(200)
          .send({ message: 'upload product proof success' });
      } catch (error) {
        pool.release();
        if (imagePath) {
          fs.unlinkSync('./public' + imagePath);
        }
        return res.status(500).send({ message: error.message });
      }
    }

    // jika fieldnamenya prescription
    if (prescription) {
      let imagePath = prescription
        ? `${path}/${prescription[0].filename}`
        : null;
      try {
        let sql = `select * from prescription where id = ?`;
        let [resep] = await pool.query(sql, prescription_id);

        if (!resep.length) {
          pool.release();
          throw { message: 'row is not found' };
        }
        sql = `update prescription set ? where id = ?`;
        let dataPayment = {};
        if (imagePath) {
          if (resep[0].paymentProof) {
            fs.unlinkSync('./public' + resep[0].paymentProof);
          }
          dataPayment.paymentProof = imagePath;
        }
        await pool.query(sql, [dataPayment, resep[0].id]);
        pool.release();
        return res
          .status(200)
          .send({ message: 'upload prescription proof success' });
      } catch (error) {
        pool.release();
        if (imagePath) {
          fs.unlinkSync('./public' + imagePath);
        }
        return res.status(500).send({ message: error.message });
      }
    }
  },
  adminOrderLength: async (req, res) => {
    const { range, filter } = req.query;
    const pool = await mysql.getConnection();
    try {
      let sql = `select count(*) as order_length from 3_pharmacy.order
            join user u on order.user_id = u.id`;
      if (!filter) {
        sql += ` where status <> 'cart'`;
      }
      if (filter === 'waitingpayment') {
        sql += ` where status = 'checkout' and paymentProof is null`;
        if (range) {
          if (range === 'week') {
            sql +=
              ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
          }
          if (range === 'month') {
            sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
          }
        }
        sql += ` order by checkedOutAt desc`;
        let [result] = await pool.query(sql);
        pool.release();
        return res.status(200).send(result);
      }
      if (filter === 'checkout') {
        sql += ` where status = ? and paymentProof is not null`;
      }
      if (filter === 'processing') {
        sql += ` where status = ?`;
      }
      if (filter === 'otw') {
        sql += ` where status = ?`;
      }
      if (filter === 'delivered') {
        sql += ` where status = ?`;
      }
      if (filter === 'paymentAcc') {
        sql += ` where status = ?`;
      }
      if (filter === 'paymentRej') {
        sql += ` where status = ?`;
      }
      if (range) {
        if (range === 'week') {
          sql +=
            ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
        }
        if (range === 'month') {
          sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
        }
      }
      sql += ` order by checkedOutAt desc`;
      if (filter) {
        let [result] = await pool.query(sql, filter);
        pool.release();
        return res.status(200).send(result);
      }
      let [result] = await pool.query(sql);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  adminGetOrder: async (req, res) => {
    const { filter, limit, offset, range } = req.query;
    const pool = await mysql.getConnection();
    try {
      let sql = `select 
            order.id, order.totalPrice, order.checkedOutAt, order.address, order.paymentProof,
            order.status, order.shippingCost, order.bank_id, u.username
            from 3_pharmacy.order
            join user u on order.user_id = u.id`;
      if (!filter) {
        // sql += ` where status <> 'cart'`;
        sql += ` where status not in('cart', 'paymentRej', 'delivered')`;
      }
      if (filter === 'waitingpayment') {
        sql += ` where status = 'checkout' and paymentProof is null`;
        if (range) {
          if (range === 'week') {
            sql +=
              ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
          }
          if (range === 'month') {
            sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
          }
        }
        sql += ` order by checkedOutAt desc limit ? offset ?`;
        let [result] = await pool.query(sql, [
          parseInt(limit),
          parseInt(offset),
        ]);
        pool.release();
        return res.status(200).send(result);
      }
      if (filter === 'checkout') {
        sql += ` where status = ? and paymentProof is not null`;
      }
      if (filter === 'processing') {
        sql += ` where status = ?`;
      }
      if (filter === 'otw') {
        sql += ` where status = ?`;
      }
      if (filter === 'delivered') {
        sql += ` where status = ?`;
      }
      if (filter === 'paymentAcc') {
        sql += ` where status = ?`;
      }
      if (filter === 'paymentRej') {
        sql += ` where status = ?`;
      }
      if (range) {
        if (range === 'week') {
          sql +=
            ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
        }
        if (range === 'month') {
          sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
        }
      }
      sql += ` order by checkedOutAt desc limit ? offset ?`;
      if (filter) {
        let [result] = await pool.query(sql, [
          filter,
          parseInt(limit),
          parseInt(offset),
        ]);
        pool.release();
        return res.status(200).send(result);
      }
      let [result] = await pool.query(sql, [parseInt(limit), parseInt(offset)]);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  orderLength: async (req, res) => {
    const { user_id } = req.params;
    const { range, filter } = req.query;
    const pool = await mysql.getConnection();
    try {
      let sql = `select count(*) as order_length from 3_pharmacy.order where user_id = ?`;
      if (!filter) {
        sql += ` and status <> 'cart'`;
      }
      if (filter === 'waitingpayment') {
        sql += ` and status = 'checkout' and paymentProof is null`;
        if (range) {
          if (range === 'week') {
            sql +=
              ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
          }
          if (range === 'month') {
            sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
          }
        }
        sql += ` order by checkedOutAt desc`;
        let [result] = await pool.query(sql, user_id);
        pool.release();
        return res.status(200).send(result);
      }
      if (filter === 'checkout') {
        sql += ` and status = ? and paymentProof is not null`;
      }
      if (filter === 'processing') {
        sql += ` and status = ?`;
      }
      if (filter === 'otw') {
        sql += ` and status = ?`;
      }
      if (filter === 'delivered') {
        sql += ` and status = ?`;
      }
      if (filter === 'paymentAcc') {
        sql += ` and status = ?`;
      }
      if (filter === 'paymentRej') {
        sql += ` and status = ?`;
      }
      if (range) {
        if (range === 'week') {
          sql +=
            ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
        }
        if (range === 'month') {
          sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
        }
      }
      sql += ` order by checkedOutAt desc`;
      if (filter) {
        let [result] = await pool.query(sql, [user_id, filter]);
        pool.release();
        return res.status(200).send(result);
      }
      let [result] = await pool.query(sql, user_id);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  getOrder: async (req, res) => {
    const { user_id, offset } = req.params;
    const { range, filter } = req.query;
    const pool = await mysql.getConnection();
    try {
      let sql = `select 
            o.id, o.totalPrice, o.checkedOutAt,
            o.address, o.paymentProof, o.status, 
            o.shippingCost, o.bank_id, o.user_id
            from 3_pharmacy.order o
            where o.user_id = ?`;

      if (!filter) {
        sql += ` and status <> 'cart'`;
      }
      if (filter === 'waitingpayment') {
        sql += ` and status = 'checkout' and paymentProof is null`;
        if (range) {
          if (range === 'week') {
            sql +=
              ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
          }
          if (range === 'month') {
            sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
          }
        }
        sql += ` group by o.id order by checkedOutAt desc limit ? offset ?`;

        const [orders] = await pool.query(sql, [user_id, 5, parseInt(offset)]);
        for (let i = 0; i < orders.length; i++) {
          sql = `
        SELECT p.id, p.productName, p.imagePath, (p.productPriceRp + p.productProfitRp) productPriceRp, ci.qty
        FROM cart_item ci
        JOIN product p ON ci.product_id = p.id
        WHERE order_id = ? AND !ci.isDeleted AND !p.isDeleted;`;
          const [product_list] = await pool.query(sql, orders[i].id);
          orders[i] = { ...orders[i], product_list };
        }
        pool.release();
        return res.status(200).send(orders);
      }
      if (filter === 'checkout') {
        sql += ` and status = ? and paymentProof is not null`;
      }
      if (filter === 'processing') {
        sql += ` and status = ?`;
      }
      if (filter === 'otw') {
        sql += ` and status = ?`;
      }
      if (filter === 'delivered') {
        sql += ` and status = ?`;
      }
      if (filter === 'paymentAcc') {
        sql += ` and status = ?`;
      }
      if (filter === 'paymentRej') {
        sql += ` and status = ?`;
      }
      if (range) {
        if (range === 'week') {
          sql +=
            ' and checkedOutAt >= (select date_sub(now(), interval 1 week))';
        }

        if (range === 'month') {
          sql += ` and checkedOutAt >= (select date_sub(now(), interval 1 month))`;
        }
      }

      sql += ` group by o.id order by checkedOutAt desc limit ? offset ?`;

      if (filter) {
        const [orders] = await pool.query(sql, [
          user_id,
          filter,
          5,
          parseInt(offset),
        ]);
        for (let i = 0; i < orders.length; i++) {
          sql = `
        SELECT p.id, p.productName, p.imagePath, (p.productPriceRp + p.productProfitRp) productPriceRp, ci.qty
        FROM cart_item ci
        JOIN product p ON ci.product_id = p.id
        WHERE order_id = ? AND !ci.isDeleted AND !p.isDeleted;`;
          const [product_list] = await pool.query(sql, orders[i].id);
          orders[i] = { ...orders[i], product_list };
        }
        pool.release();
        return res.status(200).send(orders);
      }

      const [orders] = await pool.query(sql, [user_id, 5, parseInt(offset)]);
      for (let i = 0; i < orders.length; i++) {
        sql = `
        SELECT p.id, p.productName, p.imagePath, (p.productPriceRp + p.productProfitRp) productPriceRp, ci.qty
        FROM cart_item ci
        JOIN product p ON ci.product_id = p.id
        WHERE order_id = ? AND !ci.isDeleted AND !p.isDeleted;`;
        const [product_list] = await pool.query(sql, orders[i].id);
        orders[i] = { ...orders[i], product_list };
      }
      pool.release();
      return res.status(200).send(orders);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  transactionRequest: async (req, res) => {
    const { order_id } = req.params;
    const { type, limit, user_id } = req.body;
    const pool = await mysql.getConnection();
    try {
      // cari row di tabel order berdasarkan id
      sql = `select * from 3_pharmacy.order where id = ?`;
      let [order] = await pool.query(sql, order_id);

      // throw error jika tidak ada, skip jika ada
      if (!order.length) {
        pool.release();
        throw { message: 'row is not found' };
      }

      // throw error jika tidak ada bukti pembayaran, skip jika ada
      if (!order[0].paymentProof) {
        pool.release();
        throw { message: 'there is no payment proof' };
      }

      // kode jika type-nya accept
      if (type === 'accept') {
        // update status berdasarkan id
        sql = `update 3_pharmacy.order set ? where id = ?`;
        const dataUpdate = { status: 'paymentAcc' };
        await pool.query(sql, [dataUpdate, order_id]);

        // dapatkan cart_item berdasarkan order_id
        sql = `select * from cart_item where order_id = ? and isDeleted = ?`;
        let [cart] = await pool.query(sql, [order_id, 0]);

        // ambil product_id dan qty untuk proses mengurangi stok
        // saat transaksi diterima
        let hasil = cart.map((val) => {
          return { id: val.product_id, qty: val.qty };
        });

        // kurangin stok
        hasil.forEach(async (val) => {
          sql = `select * from product where id = ?`;
          let [product] = await pool.query(sql, val.id);
          sql = `update product set ? where id = ?`;
          const dataUpdate = { stock: product[0].stock - val.qty };
          await pool.query(sql, [dataUpdate, val.id]);
        });

        // get semua data order
        sql = `select 
                order.id, order.totalPrice, order.checkedOutAt, order.address, order.paymentProof,
                order.status, order.shippingCost, order.bank_id, u.username
                from 3_pharmacy.order
                join user u on order.user_id = u.id
                order by checkedOutAt desc
                limit ?`;
        let [result] = await pool.query(sql, limit);
        pool.release();
        return res.status(200).send(result);
      }

      // kode jika type-nya reject
      if (type === 'reject') {
        // update status berdasarkan order_id
        sql = `update 3_pharmacy.order set ? where id = ?`;
        const dataUpdate = { status: 'paymentRej' };
        await pool.query(sql, [dataUpdate, order_id]);

        // get semua data order
        sql = `select 
                order.id, order.totalPrice, order.checkedOutAt, order.address, order.paymentProof,
                order.status, order.shippingCost, order.bank_id, u.username
                from 3_pharmacy.order
                join user u on order.user_id = u.id
                order by checkedOutAt desc`;
        let [result] = await pool.query(sql);
        pool.release();
        return res.status(200).send(result);
      }

      // jika type-nya processing
      if (type === 'process') {
        // update status berdasarkan order_id
        sql = `update 3_pharmacy.order set ? where id = ?`;
        const dataUpdate = { status: 'processing' };
        await pool.query(sql, [dataUpdate, order_id]);

        // get semua data order
        sql = `select 
                order.id, order.totalPrice, order.checkedOutAt, order.address, order.paymentProof,
                order.status, order.shippingCost, order.bank_id, u.username
                from 3_pharmacy.order
                join user u on order.user_id = u.id
                order by checkedOutAt desc
                limit ?`;
        let [result] = await pool.query(sql, limit);
        pool.release();
        return res.status(200).send(result);
      }

      // jika type-nya otw
      if (type === 'deliver') {
        // update status berdasarkan order_id
        sql = `update 3_pharmacy.order set ? where id = ?`;
        const dataUpdate = { status: 'otw' };
        await pool.query(sql, [dataUpdate, order_id]);

        // get semua data order
        sql = `select 
                order.id, order.totalPrice, order.checkedOutAt, order.address, order.paymentProof,
                order.status, order.shippingCost, order.bank_id, u.username
                from 3_pharmacy.order
                join user u on order.user_id = u.id
                order by checkedOutAt desc
                limit ?`;
        let [result] = await pool.query(sql, limit);
        pool.release();
        return res.status(200).send(result);
      }

      // jika type-nya otw
      if (type === 'delivered') {
        // update status berdasarkan order_id
        sql = `update 3_pharmacy.order set ? where id = ?`;
        const dataUpdate = { status: 'delivered' };
        await pool.query(sql, [dataUpdate, order_id]);

        // get semua data order
        sql = `select 
                order.id, order.totalPrice, order.checkedOutAt, order.address, order.paymentProof,
                order.status, order.shippingCost, order.bank_id, u.id, u.username
                from 3_pharmacy.order
                join user u on order.user_id = u.id
                where u.id = ?
                order by checkedOutAt desc
                limit ?`;
        let [result] = await pool.query(sql, [user_id, 5]);
        pool.release();
        return res.status(200).send(result);
      }
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  historyDetails: async (req, res) => {
    const { order_id } = req.params;
    const pool = await mysql.getConnection();
    try {
      let sql = `select 
            o.id, (o.totalPrice + o.profitRp) totalPrice, o.checkedOutAt, o.address, o.paymentProof,
            o.status, o.shippingCost, b.bank, u.username
            from 3_pharmacy.order o
            join bank b on o.bank_id = b.id
            join user u on o.user_id = u.id
            where o.id = ?`;
      let [result] = await pool.query(sql, order_id);
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
  boughtProducts: async (req, res) => {
    const { order_id } = req.params;
    const pool = await mysql.getConnection();
    try {
      let sql = `SELECT * FROM cart_item ci
            join product p on ci.product_id = p.id
            where order_id = ? and ci.isDeleted = 0`;
      let [cek] = await pool.query(sql, order_id);
      let result = cek.map((val) => {
        return {
          ...val,
          productPriceRp: val.productPriceRp + val.productProfitRp,
        };
      });
      pool.release();
      return res.status(200).send(result);
    } catch (error) {
      pool.release();
      return res.status(500).send({ message: error.message });
    }
  },
};
