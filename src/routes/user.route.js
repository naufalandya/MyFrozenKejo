const { verifyToken } = require('../middlewares/auth.middleware')
const { getProfile } = require('../services/auth.service')


const profileRoute = require('express').Router()
    .get("/", verifyToken, getProfile)

module.exports = profileRoute