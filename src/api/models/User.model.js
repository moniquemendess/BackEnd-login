const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Email not valid"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isStrongPassword],
    },
    gender: {
      type: String,
      required: true,
      enum: ["hombre", "mujer", "otros"],
    },
    rol: {
      type: String,
      enum: ["admin", "user", "superadmin"],
      default: "user",
    },
    confirmationCode: {
      type: Number,
      required: true,
    },
    check: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    PharmacyFav: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" }],
    ProductFav: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    banned: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedByApp: { type: Boolean, default: false },
    commentsPublicByOther: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    ],
    postedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    /// cuando relacionamos un modelo de con otro lo hacemos con populate y el ref a otro modelo
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next("Error hashing password", error);
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
