const { upload } = require("../../middleware/files.middleware");
const {
  createPharmacy,
  toggleProduct,
  getAll,
  getByName,
  update,
} = require("../controllers/Pharmacy.controllers");
const { getById } = require("../controllers/Product.controllers");
const PharmacyRoutes = require("express").Router();

PharmacyRoutes.post("/createPharmacy", upload.single("image"), createPharmacy);
PharmacyRoutes.patch("/add/:id", toggleProduct);
PharmacyRoutes.get("/:id", getById);
PharmacyRoutes.get("/", getAll);
PharmacyRoutes.get("/byName/:name", getByName);
PharmacyRoutes.patch("/:id", upload.single("image"), update);
module.exports = PharmacyRoutes;
