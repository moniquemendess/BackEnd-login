const mongoose = require("mongoose");

const PharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    image: { type: String, required: true },
  },
  {
    timestamps: true, // data y modificacion de los datos del usuario //createdAt y updatedAt
  }
);

const Pharmacy = mongoose.model("Pharmacy", PharmacySchema);
module.exports = Pharmacy;
