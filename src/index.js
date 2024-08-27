const express = require('express');
const logger = require("morgan");
const path = require('path');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth.route');
const transactionRoute = require('./routes/transaction.route');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');

const prisma = new PrismaClient();

// Load environment variables from .env file
dotenv.config();

//data 

const { getListsProduct, getProductDetail } = require('./services/product.service')
const profileRoute = require('./routes/user.route');
const produkRoute = require('./routes/admin.route')

const timeout = require('connect-timeout');
const admin = require('./routes/admin.route');

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

const PORT = process.env.PORT || 3000;
const app = express()
    .use(logger("dev"))
    .use(express.json())
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, '../public')))
    .use("/api/v1/auth", authRoute)
    .use("/api/v1/transaction", transactionRoute)
    .use("/api/v1/profile", profileRoute)
    .use("/api/v1/dashboard", produkRoute)
    .use("/api/v1/dashboard", admin)

    .use(timeout('5s'))
    .use(haltOnTimedout)

    .set('view engine', 'ejs')
    .set('views', path.join(__dirname, 'views'))
    // .get("/", (req, res) => {
    //     return res.json({
    //         status: true,
    //         message: 'hello kelvin',
    //     });
    // })
    .get("/register", (req, res) => {
        res.render("register");
    })
    .get("/login", (req, res) => {
        res.render("login");
    })
    .get("/profile", (req, res) => {
        res.render("profile");
    })
    .get("/", async (req, res) => {
        try {
            const productData = await getListsProduct(req, res);
            res.render("home", {
                products: productData.data.result,
                totalProducts: productData.totalProduct,
                totalPages: productData.totalPages,
                currentPage: productData.currentPage,
                limit: req.query.limit || 15 
            });
        } catch (err) {
            console.log(err)
            res.status(500).render('500', { error: err });
        }
    })
    .get("/cart", async (req, res) => {
        try {
            res.render('cart');
    
        } catch(err) {
            console.log(err)
            res.status(500).render('500', { error: err });
        }
    })
    app.get("/product-detail", async (req, res) => {
        try {
            const result = await getProductDetail(req);
    
            if (result.error) {
                if (result.error === 'Product not found') {
                    return res.status(404).render('product-not-found'); 
                }
                return res.status(400).render('error', { message: result.error }); 
            }
    
            res.render("product-detail", { product: result.product });
        } catch (err) {
            console.log(err);
            res.status(500).render('500', { error: err });
        }
    })
    .get('/dashboard/admin', async (req, res) => {
        try {
            // Ambil semua data produk dari database
            const produk = await prisma.produk.findMany();
            
            // Render halaman admin.ejs dan kirim data produk
            res.render('admin', { data: produk });
        } catch (error) {
            res.status(500).render('500', { error: err });

        }
    })
    .get('/dashboard/admin/tambah-produk', async (req, res) => {
        try {
            res.render('admin_tambah_produk');
        } catch (error) {
            res.status(500).render('500', { error: err });

        }
    })    
    .get('/dashboard/admin/edit-produk/:id', async (req, res) => {
        try {
            const produk = await prisma.produk.findUnique({
                where: { id: parseInt(req.params.id) }
            });
    
            if (produk) {
                res.render('admin_edit_produk', { produk });
            } else {
                res.status(404).send('Produk tidak ditemukan');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Terjadi kesalahan pada server');
        }
    })
    .get("/error", (req, res)=> {
        res.render('500');
    })
    app.use((req, res, next) => {
        res.status(404);
        res.render('404');
    });
    app.use((err, req, res, next) => {
        console.log(err)
        res.status(500);
        res.render('500', { error: err });
    })
    .listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
