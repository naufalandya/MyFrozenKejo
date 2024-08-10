const { registerService, loginService } = require('../services/auth.service')


const authRoute = require('express').Router()
    .post("/register", registerService)
    .post("/login", loginService)

module.exports = authRoute