const express = require("express");
const UserRoutes = express.Router(); // router te deja crear  "rutas" fuera del index

UserRoutes.post("/users", (req, res, next) => {
  console.log("adicione um usuario");
  next();
});

//
module.exports = UserRoutes;
