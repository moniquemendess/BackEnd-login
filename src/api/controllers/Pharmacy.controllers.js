const Pharmacy = require("../models/Pharmacy.model");
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

module.exports = { createPharmacy };
