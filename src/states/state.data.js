// siempre inicialmente tener como false
let testEmailSend = false;

// HACER DOS FUNCIONES: SET Y GET

// siempre la función set recibe parametro
const setTestEmailSend = (data) => {
  testEmailSend = data;
};

// función GET siempre retorna el estado actual
const getTestEmailSend = () => {
  return testEmailSend;
};

// Exportar, IMPORTANTE siempre se exporta la function y no el objeto(variavle) y sí get y set
module.exports = { setTestEmailSend, getTestEmailSend };
