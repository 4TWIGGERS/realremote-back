const express = require("express");
const router = express.Router();
const controller = require("../controllers/authControllers");

router.post("/client/register", controller.authRegister);
router.post("/client/login", controller.authLogin);

module.exports = router;
