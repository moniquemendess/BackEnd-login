const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { configCloudinary } = require("./src/middleware/files.middleware");

const app = express();
dotenv.config();
configCloudinary();

const cors = require("cors");
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: false }));

const UserRoutes = require("./src/api/routes/User.routes");
app.use("/api/v1/users/", UserRoutes);

const PharmacyRoutes = require("./src/api/routes/Pharmacy.routes");
app.use("/api/pharmacy/", PharmacyRoutes);

const ProductRoutes = require("./src/api/routes/Product.routes");
app.use("/api/product/", ProductRoutes);

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use("/api/users/", UserRoutes);

mongoose.connect(MONGO_URI).then(() => {
  console.log("Banco conectado");
  app.listen(PORT, () =>
    console.log(`Server listening on port 👌🔍 http://localhost:${PORT}`)
  );
});
