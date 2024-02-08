// traemos el mogoose
const mongoose = require("mongoose");
//
//traemos el mongoose para la parte de los esquemas de datos
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    userOne: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // usuarios
    userTwo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
