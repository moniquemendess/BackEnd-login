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
//? ----------------------------add o delete un character  --------------
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

module.exports = { createPharmacy, toggleProduct };
