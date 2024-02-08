const Pharmacy = require("../models/Pharmacy.model");
const Product = require("../models/Product.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

/** C R U D **/
// ---------------------------------------------------------------------
// POST create
// ---------------------------------------------------------------------
const createPharmacy = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await Pharmacy.syncIndexes();

    // Criamos uma instância do modelo Pharmacy com base nos dados da requisição
    /*const customBody = {
      name: req.body?.name,
      location: req.body?.location,
      image: req.file?.path, //  req.file.path para a imagem
    };*/

    // Verifica se já existe uma farmácia com o mesmo nome
    const existingPharmacy = await Pharmacy.findOne({ name: req.body.name });

    if (!existingPharmacy) {
      // Se não existir, cria uma nova farmácia
      const newPharmacy = new Pharmacy({ ...req.body, image: catchImg });

      try {
        // Salvamos a nova instância no banco de dados
        const pharmacySave = await newPharmacy.save();

        if (pharmacySave) {
          return res.status(200).json({
            pharmacy: pharmacySave,
          });
        } else {
          return res.status(404).json("Pharmacy not saved");
        }
      } catch (error) {
        deleteImgCloudinary(catchImg);
        return res
          .status(500)
          .json({ error: "Internal Server Error", message: error.message });
      }
    } else {
      // Se já existir, retorna um status de conflito
      deleteImgCloudinary(catchImg);
      return res.status(409).json("This pharmacy already exists");
    }
  } catch (error) {
    deleteImgCloudinary(catchImg);
    return next(error);
  }
};
//! ---------------------------------------------------------------------
//? ----------------------------add o delete un product  --------------
//! ---------------------------------------------------------------------
/// aqui metemos los productos en el array del modelo de pharmacy
const toggleProduct = async (req, res, next) => {
  try {
    /** estee id es el id de la pharmacy que queremos actualizar */
    const { id } = req.params;
    const { products } = req.body; // -----> idDeLosProduct enviaremos esto por el req.body "12412242253,12535222232,12523266346"
    /** Buscamos la product por id para saber si existe */
    const pharmacyById = await Pharmacy.findById(id);

    /** vamos a hacer un condicional para si existee hacer la update sino mandamos un 404 */
    if (pharmacyById) {
      /** cageemos el string que traemos del body y lo convertimos en un array
       * separando las posiciones donde en el string habia una coma
       * se hace mediante el metodo del split
       */
      const arrayIdProducts = products.split(",");

      /** recorremos este array que hemos creado y vemos si tenemos quee:
       * 1) ----> sacar eel character si ya lo tenemos en el back
       * 2) ----> meterlo en caso de que no lo tengamos metido en el back
       */
      Promise.all(
        arrayIdProducts.map(async (product, index) => {
          if (pharmacyById.products.includes(product)) {
            //*************************************************************************** */

            //________ BORRAR DEL ARRAY DE PERSONAJES EL PEERSONAJE DENTRO DE LA MOVIE___

            //*************************************************************************** */

            try {
              await Pharmacy.findByIdAndUpdate(id, {
                // dentro de la clavee characters me vas a sacar el id del elemento que estoy recorriendo
                $pull: { products: product },
              });

              try {
                // busca esse product y me hace un pull/ del array de pharmacy id
                await Product.findByIdAndUpdate(product, {
                  $pull: { pharmacies: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "Error updating product",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "Error updating pharmacy",
                message: error.message,
              }) && next(error);
            }
          } else {
            //*************************************************************************** */
            //________ METER EL PERSONAJE EN EL ARRAY DE PERSONAJES DE LA MOVIE_____________
            //*************************************************************************** */
            /** si no lo incluye lo tenemos que meter -------> $push */

            try {
              await Pharmacy.findByIdAndUpdate(id, {
                $push: { products: product },
              });
              try {
                await Product.findByIdAndUpdate(product, {
                  $push: { pharmacies: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "Error updating product",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "Error updating pharmacy",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Pharmacy.findById(id).populate("products"),
          });
        });
    } else {
      return res.status(404).json("This pharmacy does not exist");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch",
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
    const pharmacyById = await Pharmacy.findById(id);
    if (pharmacyById) {
      return res.status(200).json(pharmacyById);
    } else {
      return res.status(404).json("no se ha encontrado el pharmacy");
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
    const allPharmacy = await Pharmacy.find().populate("products");
    /** el find nos devuelve un array */
    if (allPharmacy.length > 0) {
      return res.status(200).json(allPharmacy);
    } else {
      return res.status(404).json("no se han encontrado pharmacy");
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
    const PharmacyByName = await Pharmacy.find({ name });
    if (PharmacyByName.length > 0) {
      return res.status(200).json(PharmacyByName);
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
  await Pharmacy.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const pharmacyById = await Pharmacy.findById(id);
    if (pharmacyById) {
      const oldImg = pharmacyById.image;

      const customBody = {
        _id: pharmacyById._id,
        image: req.file?.path ? catchImg : oldImg,
        name: req.body?.name ? req.body?.name : pharmacyById.name,
      };

      if (req.body?.gender) {
        const resultEnum = enumOk(req.body?.gender);
        customBody.gender = resultEnum.check
          ? req.body?.gender
          : pharmacyById.gender;
      }

      try {
        await Pharmacy.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //** ------------------------------------------------------------------- */
        //** VAMOS A TESTEAR EN TIEMPO REAL QUE ESTO SE HAYA HECHO CORRECTAMENTE */
        //** ------------------------------------------------------------------- */

        // ......> VAMOS A BUSCAR EL ELEMENTO ACTUALIZADO POR ID

        const pharmacyByIdUpdate = await Pharmacy.findById(id);

        // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
        const elementUpdate = Object.keys(req.body);

        /** vamos a hacer un objeto vacion donde meteremos los test */

        let test = {};

        /** vamos a recorrer las claves del body y vamos a crear un objeto con los test */

        elementUpdate.forEach((item) => {
          if (req.body[item] === pharmacyByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          pharmacyByIdUpdate.image === catchImg
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
      return res.status(404).json("esta pharmacy no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

module.exports = {
  createPharmacy,
  toggleProduct,
  getByName,
  update,
  getById,
  getAll,
};
