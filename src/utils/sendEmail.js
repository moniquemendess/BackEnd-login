//! FUNCIÓN DE ENVIAR CORREO ELETRONICOS DE CONFIRMACIÓN
//
//!BIBLIOTECA (PAQUETES DEL NODEJS)
// NODEMAILER: configurar el transporte de correo y enviar mensajes de correo electrónico.
//-------------------------------------------
// DOTENV: Las variables de entorno son utilizadas para almacenar configuraciones sensibles, como claves de API, contraseñas
// IMPORTACIONES DE LAS BIBLIOTECAS
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const { setTestEmailSend } = require("../state/state.data");

// inicio
const sendEmail = (userEmail, name, confirmationCode) => {
  /**^reseteo el estado a false ---> es el estado inicial */
  //! [PASO 01] ------- TRAEMOS EL EMAIL Y PASSWORD
  setTestEmailSend(false);
  const email = process.env.EMAIL; // VARIABLE DEL ENTORNO
  const password = process.env.PASSWORD; // VARIABLE DEL ENTORNO

  //! [PASO 02] ------- HACEMOS EL TRANSPORTE
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
  //! [PASO 03] ------- CREAMOS LAS OPCIONES DEL EMAIL
  const mailOptions = {
    from: email,
    to: userEmail,
    subject: "Confirmation code",
    text: `tu codigo es ${confirmationCode}, gracias por confiar en nosotros ${name}`,
  };

  //! [PASO 04] ------- HACIEMOS EL TRANSPORTE DEL sendMail
  transporter.sendMail(mailOptions, function (error, info) {
    //! VAMOS SETEAR EL ESTADO DEL TEST SI HAY UN ERROR, VAMOS DECIR QUE NO HEMOS ENVIADO EL EMAIL
    if (error) {
      console.log(error);
      setTestEmailSend(false);
      return; // Quitamos el else, y siempre poner un return, porque si no vas a executar el codigo abajo
    }
    //! SI NO HAY ERROR, HEMOS ENVIADO EL EMAIL
    console.log("Email sent: " + info.response);
    setTestEmailSend(true);
  });
};

//! [PASO 05] ------- EXPORTAR
module.exports = sendEmail;
