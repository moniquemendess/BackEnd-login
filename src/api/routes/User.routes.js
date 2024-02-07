const express = require("express");
const { upload } = require("../../middleware/files.middleware");
const {
  registerWithRedirect,
  sendCode,
  checkNewUser,
  resendCode,
  login,
  autoLogin,
  sendPassword,
  changePassword,
  modifyPassword,
} = require("../controllers/User.controllers");
const { isAuth } = require("../../middleware/auth.middleware");

const UserRoutes = express.Router();

//! ---------------- endPoints sin auth ---------------------------------------
UserRoutes.post("/register", upload.single("image"), registerWithRedirect);
UserRoutes.get("/register/sendMail/:id", sendCode);
UserRoutes.post("/check", checkNewUser);
UserRoutes.post("/resend", resendCode);
UserRoutes.post("/login", login);
UserRoutes.post("/login/autologin", autoLogin);
UserRoutes.patch("/sendPassword/:id", sendPassword);
UserRoutes.patch("/forgotpassword", changePassword);

//! ---------------- endPoints con auth ---------------------------------------

UserRoutes.patch("/changepassword", [isAuth], modifyPassword); //para modificar quem tenga el token
//UserRoutes.patch("/update/update", [isAuth], upload.single("image"), update);

module.exports = UserRoutes;
