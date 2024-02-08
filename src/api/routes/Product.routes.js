const { upload } = require("../../middleware/files.middleware");
const {
  createProduct,
  togglePharmacy,
  getById,
  getByName,
  getAll,
  update,
} = require("../controllers/Product.controllers");
const express = require("express");

const ProductRoutes = express.Router();

ProductRoutes.post("/createProduct", upload.single("image"), createProduct);
ProductRoutes.patch("/add/:id", togglePharmacy);
ProductRoutes.get("/:id", getById);
ProductRoutes.get("/", getAll);
ProductRoutes.get("/byName/:name", getByName);
ProductRoutes.patch("/:id", upload.single("image"), update);
module.exports = ProductRoutes;
