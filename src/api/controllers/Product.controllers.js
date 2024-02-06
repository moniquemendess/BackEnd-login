const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Product = require("../models/Product.model");

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

module.exports = { createProduct };
