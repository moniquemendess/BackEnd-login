const { isAuth } = require("../../middleware/auth.middleware");
const createMessage = require("../controllers/Message.controllers");
const MessageRoutes = require("express").Router();

MessageRoutes.post("/:idRecipient", [isAuth], createMessage);
module.exports = MessageRoutes;
