const { verifyToken } = require('../middlewares/auth.middleware')
const { createCart, webhookPayment } = require('../services/product.service')
const { getTransactionHistoryUnpaid, getTransactionHistoryPaid  } = require('../services/history.service')



const transactionRoute = require('express').Router()
    .post("/add-to-cart", verifyToken, createCart)
    .get("/unpaid", verifyToken, getTransactionHistoryUnpaid)
    .get("/paid", verifyToken, getTransactionHistoryPaid)
    .post("/pay", webhookPayment)

module.exports = transactionRoute