// Traemos el mongoose
const mongoose = require("mongoose");

// Traemos el mongoose para la parte de los esquemas de datos
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Propietario del mensaje
    type: {
      // Valores limitados de enum
      type: String,
      enum: ["private", "public"], // Las opciones
      required: true,
    },
    content: {
      // Es el contenido del mensaje
      type: String,
      required: true,
    },
    recipientProduct: {
      // Destinatario del mensaje
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    recipientPharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
    }, // Destinatario del mensaje
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Destinatario del mensaje
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

//! -------- Con la definición de datos y su esquema vamos a crear el modelo de datos

const Message = mongoose.model("Message", MessageSchema);

//! -------- Exportar el modelo para que lo utilicen los controladores

module.exports = Message;
