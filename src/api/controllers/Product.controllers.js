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
//! ---------------------------------------------------------------------
//? -------------------------------get by id --------------------------
//! ---------------------------------------------------------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productById = await Product.findById(id);
    if (productById) {
      return res.status(200).json(productById);
    } else {
      return res.status(404).json("no se ha encontrado el produto");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//! ---------------------------------------------------------------------
//? -------------------------------get all ------------------------------
//! ---------------------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allProduct = await Product.find().populate("pharmacy");
    /** el find nos devuelve un array */
    if (allProduct.length > 0) {
      return res.status(200).json(allProduct);
    } else {
      return res.status(404).json("no se han encontrado produtos");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//! ---------------------------------------------------------------------
//? -------------------------------get by name --------------------------
//! ---------------------------------------------------------------------
const getByName = async (req, res, next) => {
  try {
    const { name } = req.params;

    /// nos devuelve un array de elementos
    const ProductByName = await Product.find({ name });
    if (ProductByName.length > 0) {
      return res.status(200).json(ProductByName);
    } else {
      return res.status(404).json("no se ha encontrado");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar por nombre capturado en el catch",
      message: error.message,
    });
  }
};

//! ---------------------------------------------------------------------
//? -------------------------------UPDATE -------------------------------
//! ---------------------------------------------------------------------

const update = async (req, res, next) => {
  await Product.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const productById = await Product.findById(id);
    if (productById) {
      const oldImg = productById.image;

      const customBody = {
        _id: productById._id,
        image: req.file?.path ? catchImg : oldImg,
        name: req.body?.name ? req.body?.name : productById.name,
      };

      if (req.body?.gender) {
        const resultEnum = enumOk(req.body?.gender);
        customBody.gender = resultEnum.check
          ? req.body?.gender
          : productById.gender;
      }

      try {
        await Product.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //** ------------------------------------------------------------------- */
        //** VAMOS A TESTEAR EN TIEMPO REAL QUE ESTO SE HAYA HECHO CORRECTAMENTE */
        //** ------------------------------------------------------------------- */

        // ......> VAMOS A BUSCAR EL ELEMENTO ACTUALIZADO POR ID

        const productByIdUpdate = await Product.findById(id);

        // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
        const elementUpdate = Object.keys(req.body);

        /** vamos a hacer un objeto vacion donde meteremos los test */

        let test = {};

        /** vamos a recorrer las claves del body y vamos a crear un objeto con los test */

        elementUpdate.forEach((item) => {
          if (req.body[item] === productByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          productByIdUpdate.image === catchImg
            ? (test = { ...test, file: true })
            : (test = { ...test, file: false });
        }

        /** vamos a ver que no haya ningun false. Si hay un false lanzamos un 404,
         * si no hay ningun false entonces lanzamos un 200 porque todo esta correcte
         */

        let acc = 0;
        for (clave in test) {
          test[clave] == false && acc++;
        }

        if (acc > 0) {
          return res.status(404).json({
            dataTest: test,
            update: false,
          });
        } else {
          return res.status(200).json({
            dataTest: test,
            update: true,
          });
        }
      } catch (error) {}
    } else {
      return res.status(404).json("este produto no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

module.exports = {
  createProduct,
  togglePharmacy,
  getByName,
  getById,
  getAll,
  update,
};
