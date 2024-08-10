const { prisma } = require("../configs/prisma.config");
const Joi = require('joi');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const registerService = async function(req, res) {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required()
        });

        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password } = value;

        const isEmail = await prisma.user.findFirst({
            where : {
                email : email
            }
        })

        if (isEmail) {
            return res.status(400).json({
                error: 'Email is already used'
            });
        }

        const hashedPassword = await argon2.hash(password);

        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
}

const SECRET_KEY = process.env.SECRET_KEY;

const loginService = async function(req, res) {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required()
        });

        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = value;

        const user = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name : user.name, phone_number : user.phone_number
            
         }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getProfile = async function(req, res) {
    try {
        const id = req.user.id

        const result =  await prisma.user.findUnique({
            where : {
                id : id
            }
        })

        if(!result) {
            return res.render('404')
        }

        delete result.password

        return res.json(result)
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const registerAdminService = async function(req, res) {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required()
        });

        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password } = value;

        const isEmail = await prisma.user.findFirst({
            where : {
                email : email
            }
        })

        if (isEmail) {
            return res.status(400).json({
                error: 'Email is already used'
            });
        }

        const hashedPassword = await argon2.hash(password);

        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
}

const loginAdminService = async function(req, res) {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required()
        });

        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = value;

        const user = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        if (user.role !== 'ADMIN') {
            return res.status(400).json({ error: 'You are not an admin' });
        }

        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name : user.name, phone_number : user.phone_number
            
         }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { registerService, loginService, getProfile, loginAdminService, registerAdminService }
