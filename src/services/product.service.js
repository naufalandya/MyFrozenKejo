const snap = require("../configs/midtrans.config");
const { prisma } = require("../configs/prisma.config");
const Joi = require('joi');

const getListsProduct = async function(req, res) {
    try {
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 15;

        const result = await prisma.produk.findMany({
            orderBy: {
                nama: 'asc'
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalCount = await prisma.produk.count(); 

        const totalPages = Math.ceil(totalCount / limit); 

        return {
            status: 'true',
            message: 'success',
            totalProduct: totalCount,
            totalPages: totalPages,
            currentPage: page,
            length: result.length,
            data: {
                result
            }
        };
    } catch (err) {
        console.log(err)
        throw err;
    }
}

const getProductDetail = async function(req, res) {
    try {
        const productId = Number(req.query.id);
        
        if (isNaN(productId) || productId <= 0) {
            return { error: 'Invalid product ID' };
        }

        const product = await prisma.produk.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            return { error: 'Product not found' };
        }

        return { product };

    } catch (err) {
        console.log(err);
        return { error: 'Internal Server Error' };
    }
}

const createCart = async function(req, res) {
    try {

        const user = req.user

        const cartValidationSchema = Joi.object({
            productId: Joi.number().integer().positive().required(),
            quantity: Joi.number().integer().positive().min(1).required()
        });

        const { error } = cartValidationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { productId, quantity } = req.body;

        console.log(req.body)

        const product = await prisma.produk.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.stok < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        const transaksi = await prisma.transaksi.create({
            data: {
                user_id: user.id,
                produk_id: productId,
                quantity : Number(quantity),
            },
        });

        const sisa = product.stok - quantity

        const totalHarga = product.harga * quantity

        await prisma.produk.update({
            where : {
                id : productId
            },

            data : {
                stok : sisa
            }
        })

        const paymentResult = await prisma.pembayaran.create({
            data : {
                user_id : user.id,
                status : false,
                total_harga : totalHarga,
            }
        })

        await prisma.transaksi.update({
            where : {
                id : transaksi.id
            },
            data : {
                pembayaran_id : paymentResult.id
            }
        })

        const orderDetailsMidtrans = {
            transaction_details: {
              order_id: "order-id-node-" + Math.round(new Date().getTime() / 1000),
              gross_amount: Number(totalHarga),
            },
            credit_card: {
              secure: true,
            },
            customer_details: {
              first_name: user.name,
              email: user.email,
              phone: user.phone_number,
            },
          };

          const transactionMidtrans = await snap.createTransaction(
            orderDetailsMidtrans
          );

          console.log(transactionMidtrans)

          await prisma.pembayaran.update({
            where : {
                id : paymentResult.id
            },
            data : {
                midtrans_order_id : orderDetailsMidtrans.transaction_details.order_id,
                payment_link : transactionMidtrans.redirect_url
            }
          })


         return res.status(201).json( {status : true, message : 'successfully adding item to cart', data : {
            redirect_url : transactionMidtrans.redirect_url
         } })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error while adding to cart' });
    }
};

const webhookPayment = async function(req, res) {
    try {
        const { order_id, transaction_status, payment_type } = req.body;

        if (transaction_status === "pending"){
            return res.json( {status : true })
        }

        const transaction = await prisma.pembayaran.findUnique({
            where: {
                midtrans_order_id: order_id
            }
        });
 
        if (transaction.status == true) {
            // const transaction_token = transaction.transaction_token;
            // const io = req.app.get('io');

            console.log('if')

            return res.json({
                status: false,
                message: 'pembayaran sudah dilakukan !'
            });
        } else {
            const { status, user } = await updateTransactionStatus(order_id, transaction_status, payment_type);
            res.status(200).json({ message: 'Selamat pembayaran tiket Anda sukses.', status });
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error while processing payment' });
    }
}

const updateTransactionStatus = async(orderId, transactionStatus, paymentType) => {
    let status = false;
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
        status = true;
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
        status = false;
    }


    const pembayaran = await prisma.pembayaran.findUnique({
        where: { midtrans_order_id: orderId },
        include : {
            midtrans : true,
        }
    });

    if (!pembayaran) {
        throw new Error(`payment with orderId ${orderId} not found.`);
    }


    await prisma.pembayaran.update({
        where: { midtrans_order_id: orderId },
        data: { status: status }
    });


    if (!pembayaran.midtrans) {
        await prisma.midtrans.create({
            data: {
                pembayaran_id: pembayaran.id,
                payment_type: paymentType,
                payment_status: transactionStatus,
                created_at: new Date()
            }
        });
    } else {

        await prisma.midtrans.update({
            where: { id: pembayaran.midtrans.id },
            data: {
                payment_type: paymentType,
                payment_status: transactionStatus
            }
        });
    }

    return {status, user : pembayaran.user_id};
};


module.exports = { getListsProduct, getProductDetail, createCart, webhookPayment }