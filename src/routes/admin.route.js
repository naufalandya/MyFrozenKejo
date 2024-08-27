const express = require('express');
const admin = express.Router();
const produkController = require('../services/admin.service');

admin.get('/admin', produkController.getAllProducts);
admin.get('/admin/edit/:id', produkController.getProductById);

admin.post('/admin/tambah', produkController.createProduk);

admin.put('/admin/update/:id', produkController.updateProduk);
  
admin.delete('/admin/delete/:id', produkController.deleteProduct);
admin.delete('/admin/delete/:id', produkController.deleteProduct);

module.exports = admin;
