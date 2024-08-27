const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const imagekit = require('../configs/imagekit.config');
const path = require('path');
const multer = require('multer');

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const produk = await prisma.produk.findMany();
        res.render('admin', { data: produk });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get Product By ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const produk = await prisma.produk.findUnique({ where: { id: parseInt(id) } });
        if (produk) {
            res.render('editProduct', { produk });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Internal Server Error');
    }
};


const storage = multer.memoryStorage(); 
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG files are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('foto'); 

exports.createProduk = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { nama, harga, deskripsi, merk, stok } = req.body;

            // Cek jika semua field ada
            if (!nama || !harga || !deskripsi || !merk || !stok) {
                return res.status(400).json({ message: 'Semua field wajib diisi' });
            }

            // Validasi tipe data
            if (typeof nama !== 'string' || typeof deskripsi !== 'string' || typeof merk !== 'string') {
                return res.status(400).json({ message: 'Nama, deskripsi, dan merk harus berupa string' });
            }

            if (isNaN(parseFloat(harga)) || parseFloat(harga) <= 0) {
                return res.status(400).json({ message: 'Harga harus berupa angka dan lebih besar dari 0' });
            }

            if (!Number.isInteger(parseInt(stok, 10)) || parseInt(stok, 10) < 0) {
                return res.status(400).json({ message: 'Stok harus berupa angka bulat dan tidak boleh negatif' });
            }

            // Cek apakah file gambar ada
            if (!req.file) {
                return res.status(400).json({ message: 'File gambar wajib diupload' });
            }

            const uploadImage = async (file) => {
                try {
                    const fileBase64 = file.buffer.toString('base64');
                    const response = await imagekit.upload({
                        fileName: Date.now() + file.originalname,
                        file: fileBase64,
                        folder: 'produk_images',
                    });
                    return response.url;
                } catch (error) {
                    console.error('Error uploading image:', error);
                    throw new Error('Image upload failed');
                }
            };

            const gambar_produk = await uploadImage(req.file);

            const newProduk = await prisma.produk.create({
                data: {
                    nama: nama,
                    harga: parseFloat(harga),
                    description: deskripsi,
                    merk: merk,
                    stok: parseInt(stok, 10),
                    foto: gambar_produk,
                },
            });

            return res.status(201).json({
                status: true,
                message: 'Produk berhasil dibuat',
                data: newProduk,
            });
        } catch (err) {
            console.error('Terjadi kesalahan saat membuat produk:', err);
            return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal server' });
        }
    });
};


// Update a Product
exports.updateProduk = (req, res, next) => {
    const { id } = req.params;

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { nama, harga, deskripsi, merk, stok } = req.body;

            console.log(req.body)

            // Cek jika semua field ada (opsional, bisa hanya cek jika ada input)
            if (!nama && !harga && !deskripsi && !merk && !stok && !req.file) {
                return res.status(400).json({ message: 'Tidak ada data yang diubah' });
            }

            const updateData = {};

            // Validasi dan tambahkan field ke updateData jika ada
            if (nama) {
                if (typeof nama !== 'string') {
                    return res.status(400).json({ message: 'Nama harus berupa string' });
                }
                updateData.nama = nama;
            }

            if (deskripsi) {
                if (typeof deskripsi !== 'string') {
                    return res.status(400).json({ message: 'Deskripsi harus berupa string' });
                }
                updateData.deskripsi = deskripsi;
            }

            if (merk) {
                if (typeof merk !== 'string') {
                    return res.status(400).json({ message: 'Merk harus berupa string' });
                }
                updateData.merk = merk;
            }

            if (harga) {
                if (isNaN(parseFloat(harga)) || parseFloat(harga) <= 0) {
                    return res.status(400).json({ message: 'Harga harus berupa angka dan lebih besar dari 0' });
                }
                updateData.harga = parseFloat(harga);
            }

            if (stok) {
                if (!Number.isInteger(parseInt(stok, 10)) || parseInt(stok, 10) < 0) {
                    return res.status(400).json({ message: 'Stok harus berupa angka bulat dan tidak boleh negatif' });
                }
                updateData.stok = parseInt(stok, 10);
            }

            // Cek apakah file gambar ada
            if (req.file) {
                const uploadImage = async (file) => {
                    try {
                        const fileBase64 = file.buffer.toString('base64');
                        const response = await imagekit.upload({
                            fileName: Date.now() + file.originalname,
                            file: fileBase64,
                            folder: 'produk_images',
                        });
                        return response.url;
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        throw new Error('Image upload failed');
                    }
                };

                const gambar_produk = await uploadImage(req.file);
                updateData.foto = gambar_produk;
            }

            const updatedProduk = await prisma.produk.update({
                where: { id: parseInt(id, 10) },
                data: updateData,
            });

            return res.status(200).json({
                status: true,
                message: 'Produk berhasil diupdate',
                data: updatedProduk,
            });
        } catch (err) {
            console.error('Terjadi kesalahan saat mengupdate produk:', err);
            return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal server' });
        }
    });
};


// Delete a Product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.produk.delete({ where: { id: parseInt(id) } });
        res.json({ status: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ status: false, message: 'Failed to delete product' });
    }
};

// Helper function to upload images
const uploadImage = async (file) => {
    if (file) {
        const fileBase64 = file.buffer.toString("base64");
        const response = await imagekit.upload({
            fileName: Date.now() + path.extname(file.originalname),
            file: fileBase64,
            folder: "produk_images",
        });
        return response.url;
    }
    return null;
};
