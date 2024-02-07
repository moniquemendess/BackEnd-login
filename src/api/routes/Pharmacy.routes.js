const { upload } = require("../../middleware/files.middleware");
const {
  createPharmacy,
  toggleProduct,
} = require("../controllers/Pharmacy.controllers");
const PharmacyRoutes = require("express").Router();

PharmacyRoutes.post("/createPharmacy", upload.single("image"), createPharmacy);
PharmacyRoutes.patch("/add/:id", toggleProduct);
module.exports = PharmacyRoutes;
