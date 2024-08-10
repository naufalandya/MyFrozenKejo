const { verifyToken } = require('../middlewares/auth.middleware')
const { createCart, webhookPayment } = require('../services/product.service')
const { getTransactionHistory  } = require('../services/history.service')



const transactionRoute = require('express').Router()
    .post("/add-to-cart", verifyToken, createCart)
    .get("/history", verifyToken, getTransactionHistory)
    .post("/pay", webhookPayment)

module.exports = transactionRoute