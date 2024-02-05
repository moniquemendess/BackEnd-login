const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config(); // llamndo el dotenv
const mongoose = require("mongoose");
const UserRoutes = require("./src/api/routes/User.routes");
//
const PORT = process.env.PORT;

//
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => {
  console.log("banco conectado");
  app.listen(PORT, () => {
    console.log(`Server listening on port 👌🔍 http://localhost:${PORT}`);
  });
});

app.use(UserRoutes);
