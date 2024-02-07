const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Product = require("../models/Product.model");
const Pharmacy = require("../models/Pharmacy.model");

/** C R U D **/
// ---------------------------------------------------------------------
// POST create
// ---------------------------------------------------------------------
const createProduct = async (req, res, next) => {
  let catchImg = req.file?.path; // imagens cloudinary

  try {
    // Sincroniza os índices, se necessário
    await Product.syncIndexes();

    // Verifica se já existe um produto com o mesmo nome
    const existingProduct = await Product.findOne({ name: req.body.name });

    if (!existingProduct) {
      // Se não existir, cria um novo produto
      const newProduct = new Product({ ...req.body, image: catchImg });

      try {
        // Salvamos a nova instância no banco de dados
        const savedProduct = await newProduct.save();

        if (savedProduct) {
          return res.status(200).json({
            product: savedProduct,
          });
        } else {
          return res.status(404).json("Product not saved");
        }
      } catch (error) {
        deleteImgCloudinary(catchImg);
        return res.status(500).json({
          error: "Internal Server Error",
          message: error.message,
        });
      }
    } else {
      // Se já existir, retorna um status de conflito
      deleteImgCloudinary(catchImg);
      return res.status(409).json("This product already exists");
    }
  } catch (error) {
    deleteImgCloudinary(catchImg);
    return next(error);
  }
};

// Aqui estamos manipulando a associação entre produtos e farmácias
const togglePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pharmacy } = req.body; // -----> ids dos produtos enviaremos pelo req.body "12412242253,12535222232,12523266346"

    const productById = await Product.findById(id);

    if (productById) {
      const arrayIdPharmacies = pharmacy.split(",");

      Promise.all(
        arrayIdPharmacies.map(async (pharmacyId) => {
          if (productById.pharmacy.includes(pharmacyId)) {
            // Remove pharmacy from product's pharmacies
            try {
              await Product.findByIdAndUpdate(id, {
                $pull: { pharmacy: pharmacyId },
              });

              // Remove product from pharmacy's products
              try {
                await Pharmacy.findByIdAndUpdate(pharmacyId, {
                  $pull: { products: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "Error updating pharmacy",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "Error updating product",
                message: error.message,
              }) && next(error);
            }
          } else {
            // Add pharmacy to product's pharmacies
            try {
              await Product.findByIdAndUpdate(id, {
                $push: { pharmacy: pharmacyId },
              });

              // Add product to pharmacy's products
              try {
                await Pharmacy.findByIdAndUpdate(pharmacyId, {
                  $push: { products: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "Error updating pharmacy",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "Error updating product",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Product.findById(id).populate("pharmacy"),
          });
        });
    } else {
      return res.status(404).json("This product does not exist");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "Error catch",
        message: error.message,
      }) && next(error)
    );
  }
};

module.exports = { createProduct, togglePharmacy };
