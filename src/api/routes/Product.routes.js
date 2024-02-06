const { upload } = require("../../middleware/files.middleware");
const { createProduct } = require("../controllers/Product.controllers");
const express = require("express");
const ProductRoutes = require("express").Router();
ProductRoutes.post("/createProduct", upload.single("image"), createProduct);
module.exports = ProductRoutes;
