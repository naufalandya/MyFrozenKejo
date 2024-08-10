const Joi = require("joi");
const { prisma } = require("../configs/prisma.config");
const jwt = require('jsonwebtoken');

const getTransactionHistory = async function(req, res) {
    try {

        console.log(req.user.id)

        const result = await prisma.pembayaran.findMany({
            where : {
                user_id
                 : req.user.id
            },
            select: {
                status : true,
                total_harga : true,
                
                transaksi : {
                    select : {
                        produk : {
                            select : {
                                nama : true,
                                merk : true,
                                foto : true,
                            }
                        },
                        quantity : true
                    }   
                },

                payment_link : true,
            },
            orderBy : {
                created_at : 'desc'
            }
        })

        console.log(result)

        return res.status(200).json(result)

    } catch (err) {
        throw err
    }
}

module.exports = { getTransactionHistory }