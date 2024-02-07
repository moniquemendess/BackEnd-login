const { upload } = require("../../middleware/files.middleware");
const {
  createProduct,
  togglePharmacy,
} = require("../controllers/Product.controllers");
const express = require("express");

const ProductRoutes = express.Router();

ProductRoutes.post("/createProduct", upload.single("image"), createProduct);
ProductRoutes.patch("/add/:id", togglePharmacy);

module.exports = ProductRoutes;
