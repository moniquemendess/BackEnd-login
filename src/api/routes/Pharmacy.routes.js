const { upload } = require("../../middleware/files.middleware");
const { createPharmacy } = require("../controllers/Pharmacy.controllers");
const PharmacyRoutes = require("express").Router();

PharmacyRoutes.post("/createPharmacy", upload.single("image"), createPharmacy);

module.exports = PharmacyRoutes;
