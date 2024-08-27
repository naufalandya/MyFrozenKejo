const Joi = require("joi");
const { prisma } = require("../configs/prisma.config");
const jwt = require('jsonwebtoken');

const getTransactionHistoryUnpaid = async function(req, res) {
    try {

        console.log(req.user.id)

        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

        const result = await prisma.pembayaran.findMany({
            where : {
                user_id : req.user.id,
                status : false,
                created_at : {
                    lte : twoDaysAgo
                }
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


const getTransactionHistoryPaid = async function(req, res) {
    try {

        console.log(req.user.id)

        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

        const result = await prisma.pembayaran.findMany({
            where : {
                user_id : req.user.id,
                status : true,
                created_at : {
                    lte : twoDaysAgo
                }
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


module.exports = { getTransactionHistoryPaid, getTransactionHistoryUnpaid }