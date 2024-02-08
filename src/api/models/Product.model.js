const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: { type: String, required: false, unique: true },
    category: {
      type: String,
      trim: true,
      enum: ["Medicamentos", "Higiene Personal", "Cuidados de Salud"],
      required: true,
    },
    marca: { type: String, required: true, trim: true }, // Adicionada a propriedade marca
    image: {
      type: String,
      required: true,
    },
    price: { type: Number },
    pharmacy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
